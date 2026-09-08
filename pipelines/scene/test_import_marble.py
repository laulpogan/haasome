"""CLI packaging checks using synthetic bytes; not Marble or rendering evidence."""

import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


SCRIPT = Path(__file__).with_name("import_marble.py")


class ImportTests(unittest.TestCase):
    def test_cli_handoff_and_refusals(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            # Deliberate packaging fixture, not a decodable Gaussian scene.
            source = root / "fixture.spz"
            payload = b"synthetic packaging test; no scene content"
            source.write_bytes(payload)
            credit = root / "credit.txt"
            credit.write_text("Synthetic packaging fixture; no Marble generation.")
            permission = root / "permission.txt"
            permission.write_text("Test-authored bytes; local test use.")
            output = root / "bundle"
            command = [sys.executable, str(SCRIPT), str(source), "--output", str(output),
                       "--attribution-file", str(credit), "--permission-file", str(permission),
                       "--camera-position", "1", "2", "3", "--camera-target", "4", "5", "6"]
            result = subprocess.run(command, capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
            scene_bytes = (output / "scene.json").read_bytes()
            scene = json.loads(scene_bytes)
            self.assertEqual(scene["asset"], "scene.spz")
            self.assertEqual((output / scene["asset"]).read_bytes(), payload)
            self.assertEqual(scene["provenance"]["kind"], "generated")
            self.assertIn("not a captured room", scene["provenance"]["attribution"])
            self.assertEqual(scene["transform"], {"position": [0, 0, 0],
                                                  "rotation": [1, 0, 0, 0], "scale": 1})
            self.assertEqual(scene["camera"], {"position": [1, -2, -3], "target": [4, -5, -6]})
            receipt = json.loads((output / "provenance.json").read_text())
            self.assertEqual(receipt["assetSha256"], hashlib.sha256(payload).hexdigest())
            self.assertEqual((output / "PERMISSION.txt").read_text().strip(), permission.read_text())
            self.assertNotEqual(subprocess.run(command, capture_output=True).returncode, 0)
            self.assertEqual((output / "scene.json").read_bytes(), scene_bytes)

            # The same contract for PLY; no second flip for preconverted coordinates.
            ply = root / "fixture.ply"
            ply.write_bytes(b"ply\ncomment synthetic packaging fixture\nend_header\n")
            command[2] = str(ply)
            command[4] = str(root / "identity")
            result = subprocess.run(command + ["--coordinates", "y-up"], capture_output=True)
            self.assertEqual(result.returncode, 0, result.stderr)
            identity = json.loads((root / "identity/scene.json").read_text())
            self.assertEqual(identity["format"], "ply")
            self.assertEqual(identity["transform"]["rotation"], [0, 0, 0, 1])
            self.assertEqual(identity["camera"]["position"], [1, 2, 3])

            command[4] = str(root / "rejected")
            bad_camera = command.copy()
            bad_camera[bad_camera.index("--camera-position") + 1] = "nan"
            self.assertNotEqual(subprocess.run(bad_camera, capture_output=True).returncode, 0)
            permission.write_text(" ")
            self.assertNotEqual(subprocess.run(command, capture_output=True).returncode, 0)
            self.assertFalse((root / "rejected").exists())


if __name__ == "__main__":
    unittest.main()
