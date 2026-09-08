"""Synthetic packaging checks; these do not establish actual UI capture."""

import copy
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

from assemble_capsule import assemble


class CapsuleTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.scene = self.root / "scene" / "scene.json"
        self.scene.parent.mkdir()
        self.scene_record = {
            "id": "fixture-room", "asset": "same.ply", "format": "ply",
            "provenance": {"kind": "fixture", "attribution": "Synthetic packaging test"},
            "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0, 1], "scale": 1},
            "camera": {"position": [10, 3, 24], "target": [10, 2, 20]},
        }
        self.write(self.scene, self.scene_record)
        (self.scene.parent / "same.ply").write_bytes(b"fixture scene, not renderable")
        self.bundles, self.originals = [], []
        for index in range(3):
            bundle = self.root / f"bundle-{index}" / "memories.json"
            bundle.parent.mkdir()
            (bundle.parent / "same.png").write_bytes(f"synthetic evidence {index}".encode())
            (bundle.parent / "unreferenced.txt").write_text("must not copy")
            memory = {
                "id": f"fixture-{index}", "title": f"Fixture {index}", "body": "Synthetic check",
                "cue": "Fixture?", "media": [{"kind": "image", "asset": "same.png", "alt": "Fixture"}],
                "source": {"kind": "fixture", "app": "Test", "locator": "Fixture only",
                           "capturedAt": "2026-09-08T09:01:02.123-07:00", "evidenceAsset": "same.png",
                           "extra": {"verbatim": "Preserve this metadata"}},
            }
            self.write(bundle, [memory])
            self.bundles.append(bundle)
            self.originals.append(memory)
        self.output = self.root / "output"

    def write(self, path, value):
        path.write_text(json.dumps(value), encoding="utf-8")

    def run_assembler(self):
        return assemble(self.scene, self.bundles, "Selected capsule", self.output)

    def test_anchor_spacing_at_live_room_camera_distance(self):
        # Synthetic scene at the reported live-room scale, with a nonzero target.
        self.scene_record["camera"] = {"position": [1, 2, 3.312], "target": [1, 2, 3]}
        self.write(self.scene, self.scene_record)
        palace = json.loads(self.run_assembler().read_text())
        expected = [
            [0.8752, 2, 3.03744], [0.9376, 2, 3.01872], [1, 2, 3],
            [1.0624, 2, 3.01872], [1.1248, 2, 3.03744],
        ]
        for anchor, position in zip(palace["anchors"], expected):
            for actual, coordinate in zip(anchor["position"], position):
                self.assertAlmostEqual(actual, coordinate)
        self.assertAlmostEqual(palace["anchors"][1]["position"][0]
                               - palace["anchors"][0]["position"][0], 0.0624)

    def test_generated_scene_preserves_provenance(self):
        self.scene_record["provenance"] = {
            "kind": "generated", "attribution": "Synthetic generated-scene packaging test",
            "description": "Generated scene; not a captured room",
        }
        self.write(self.scene, self.scene_record)
        palace = json.loads(self.run_assembler().read_text())
        self.assertEqual(palace["scene"]["provenance"], self.scene_record["provenance"])
        self.assertEqual((self.output / palace["scene"]["asset"]).read_bytes(),
                         (self.scene.parent / "same.ply").read_bytes())

    def test_cli_colliding_basenames_preserves_sources_and_inventory(self):
        before = {p: p.read_bytes() for p in self.root.rglob("*") if p.is_file()}
        command = [sys.executable, str(Path(__file__).with_name("assemble_capsule.py")),
                   "--scene", str(self.scene), "--title", "Selected capsule", "--output", str(self.output)]
        for bundle in self.bundles:
            command.extend(["--memories", str(bundle)])
        result = subprocess.run(command, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        palace = json.loads((self.output / "palace.json").read_text())
        self.assertEqual(palace["schemaVersion"], 0)
        self.assertIsNone(palace["capsule"]["frozenAt"])
        self.assertEqual(palace["capsule"]["title"], "Selected capsule")
        self.assertEqual([a["memoryIds"] for a in palace["anchors"]],
                         [["fixture-0"], ["fixture-1"], ["fixture-2"], [], []])
        self.assertEqual(palace["anchors"][2]["position"], [10, 2, 20])
        scene = copy.deepcopy(palace["scene"])
        scene["asset"] = self.scene_record["asset"]
        self.assertEqual(scene, self.scene_record)
        for index, memory in enumerate(palace["memories"]):
            self.assertEqual((self.output / memory["source"]["evidenceAsset"]).read_bytes(),
                             f"synthetic evidence {index}".encode())
            restored = copy.deepcopy(memory)
            restored["source"]["evidenceAsset"] = "same.png"
            restored["media"][0]["asset"] = "same.png"
            self.assertEqual(restored, self.originals[index])
        manifest = json.loads((self.output / "manifest.json").read_text())
        self.assertNotIn("schemaVersion", manifest)
        inventory = manifest["assets"]
        self.assertEqual(len(inventory), 7)
        self.assertEqual(len({item["asset"] for item in inventory}), 7)
        for item in inventory:
            data = (self.output / item["asset"]).read_bytes()
            self.assertEqual(item["sha256"], hashlib.sha256(data).hexdigest())
            self.assertEqual(item["bytes"], len(data))
        self.assertEqual(len([p for p in self.output.rglob("*") if p.is_file()]), 9)
        self.assertTrue(all(p.read_bytes() == content for p, content in before.items()))

    def test_duplicate_ids_refused(self):
        record = copy.deepcopy(self.originals[1])
        record["id"] = self.originals[0]["id"]
        self.write(self.bundles[1], [record])
        with self.assertRaisesRegex(ValueError, "Duplicate memory ID"):
            self.run_assembler()
        self.assertFalse(self.output.exists())

    def test_missing_evidence_file_refused(self):
        record = copy.deepcopy(self.originals[0])
        record["source"]["evidenceAsset"] = "missing.png"
        self.write(self.bundles[0], [record])
        with self.assertRaises(FileNotFoundError):
            self.run_assembler()
        self.assertFalse(self.output.exists())

    def test_computer_use_requires_evidence(self):
        record = copy.deepcopy(self.originals[0])
        record["source"].update(kind="computer-use", evidenceAsset=None)
        self.write(self.bundles[0], [record])
        with self.assertRaisesRegex(ValueError, "requires evidence"):
            self.run_assembler()

    def test_traversal_and_urls_refused_in_all_references(self):
        for value in ("../outside.png", "/tmp/outside.png", "a/../../outside.png",
                      "a\\outside.png", "https://example.test/x", "%2e%2e/x", "a//x", "./same.png"):
            for field in ("scene", "media", "evidence"):
                with self.subTest(path=value, field=field):
                    scene, record = copy.deepcopy(self.scene_record), copy.deepcopy(self.originals[0])
                    if field == "scene":
                        scene["asset"] = value
                    elif field == "media":
                        record["media"][0]["asset"] = value
                    else:
                        record["source"]["evidenceAsset"] = value
                    self.write(self.scene, scene)
                    self.write(self.bundles[0], [record])
                    with self.assertRaisesRegex(ValueError, "Unsafe"):
                        self.run_assembler()
                    self.assertFalse(self.output.exists())

    def test_symlink_escape_refused(self):
        outside = self.root / "outside.png"
        outside.write_bytes(b"not selected")
        asset = self.bundles[0].parent / "same.png"
        asset.unlink()
        asset.symlink_to(outside)
        with self.assertRaisesRegex(ValueError, "escapes bundle"):
            self.run_assembler()

    def test_existing_output_refused_including_broken_symlink(self):
        self.output.mkdir()
        with self.assertRaisesRegex(ValueError, "already exists"):
            self.run_assembler()
        self.assertTrue(self.output.is_dir())
        self.output.rmdir()
        self.output.symlink_to(self.root / "absent")
        with self.assertRaisesRegex(ValueError, "already exists"):
            self.run_assembler()
        self.assertTrue(self.output.is_symlink())

    def test_one_bundle_five_records_and_no_fabrication_or_truncation(self):
        records = copy.deepcopy(self.originals)
        for index in (3, 4):
            record = copy.deepcopy(records[0])
            record["id"] = f"fixture-{index}"
            records.append(record)
        self.bundles = self.bundles[:1]
        self.write(self.bundles[0], records)
        palace = json.loads(self.run_assembler().read_text())
        self.assertEqual(len(palace["memories"]), 5)
        self.assertTrue(all(len(a["memoryIds"]) == 1 for a in palace["anchors"]))
        for count in (1, 2, 6):
            with self.subTest(count=count):
                self.output = self.root / f"invalid-{count}"
                self.write(self.bundles[0], (records + [records[0]])[:count])
                with self.assertRaisesRegex(ValueError, "3–5"):
                    self.run_assembler()
                self.assertFalse(self.output.exists())

    def test_copy_failure_cleans_new_output(self):
        original_open = Path.open
        with patch("assemble_capsule.Path.open", autospec=True) as opened:
            def fail_destination(path, *args, **kwargs):
                if args and args[0] == "xb":
                    raise OSError("Synthetic copy failure")
                return original_open(path, *args, **kwargs)
            opened.side_effect = fail_destination
            with self.assertRaisesRegex(OSError, "Synthetic copy failure"):
                self.run_assembler()
        self.assertFalse(self.output.exists())


if __name__ == "__main__":
    unittest.main()
