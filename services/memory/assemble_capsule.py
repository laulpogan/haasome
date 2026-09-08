#!/usr/bin/env python3
"""Assemble existing local scene and memory bundles; never capture or fetch content."""

import argparse
from datetime import datetime
import hashlib
import json
import math
from pathlib import Path
import shutil
import uuid


def require(condition, message):
    if not condition:
        raise ValueError(message)


def text(value):
    return isinstance(value, str) and bool(value.strip())


def vector(value, size):
    return (isinstance(value, list) and len(value) == size
            and all(type(n) in (int, float) and math.isfinite(n) for n in value))


def local_asset(root, value):
    require(text(value), "Asset path must be text")
    require(not any(c in value for c in "\\:?#%\x00")
            and all(part not in ("", ".", "..") for part in value.split("/")),
            f"Unsafe bundle-relative asset path: {value!r}")
    path = (root / value).resolve(strict=True)
    require(path.is_relative_to(root), f"Asset escapes bundle root: {value!r}")
    require(path.is_file() and path.stat().st_size > 0, f"Missing or empty asset: {value!r}")
    return path


def validate_scene(scene):
    require(isinstance(scene, dict) and text(scene.get("id")), "Scene ID required")
    require(scene.get("format") in ("ply", "spz", "splat", "ksplat", "sog", "rad"),
            "Unsupported scene format")
    provenance = scene.get("provenance", {})
    require(isinstance(provenance, dict) and provenance.get("kind") in
            ("captured", "licensed-sample", "fixture", "generated") and text(provenance.get("attribution")),
            "Scene provenance required")
    transform, camera = scene.get("transform", {}), scene.get("camera", {})
    require(isinstance(transform, dict) and isinstance(camera, dict), "Scene transform/camera required")
    require(vector(transform.get("position"), 3) and vector(transform.get("rotation"), 4),
            "Scene transform vectors required")
    require(abs(math.hypot(*transform["rotation"]) - 1) <= 0.01, "Quaternion must be normalized")
    scale = transform.get("scale")
    require(type(scale) in (int, float) and math.isfinite(scale) and scale > 0, "Positive scene scale required")
    require(vector(camera.get("position"), 3) and vector(camera.get("target"), 3)
            and camera["position"] != camera["target"], "Distinct finite camera position/target required")


def validate_memory(memory):
    require(isinstance(memory, dict), "Memory must be an object")
    for key in ("id", "title", "body", "cue"):
        require(text(memory.get(key)), f"Memory {key} required")
    require(isinstance(memory.get("media"), list), "Memory media array required")
    for media in memory["media"]:
        require(isinstance(media, dict) and media.get("kind") in ("image", "video")
                and isinstance(media.get("alt"), str), "Media kind and alt required")
    source = memory.get("source")
    require(isinstance(source, dict) and source.get("kind") in ("computer-use", "manual", "fixture"),
            "Memory source required")
    for key in ("app", "locator", "capturedAt"):
        require(text(source.get(key)), f"Source {key} required")
    captured = datetime.fromisoformat(source["capturedAt"].replace("Z", "+00:00"))
    require(captured.tzinfo is not None, "Source capturedAt requires a timezone")
    require(source["kind"] != "computer-use" or text(source.get("evidenceAsset")),
            "Computer-use memory requires evidence")


def assemble(scene_path, memory_paths, title, output):
    require(text(title), "Capsule title required")
    require(memory_paths, "At least one memories.json bundle required")
    target = Path(output).expanduser().absolute()
    require(not target.exists() and not target.is_symlink(), f"Output already exists: {target}")
    copies = []

    def reference(root, record, key):
        original = record.get(key)
        path = local_asset(root, original)
        # Neither source IDs, titles nor basenames become destination directories.
        relative = f"assets/{uuid.uuid4().hex}/asset{Path(original).suffix}"
        copies.append((path, relative))
        record[key] = relative

    scene_path = Path(scene_path).expanduser().resolve(strict=True)
    scene = json.loads(scene_path.read_text(encoding="utf-8"))
    validate_scene(scene)
    reference(scene_path.parent, scene, "asset")
    memories = []
    for bundle in memory_paths:
        bundle = Path(bundle).expanduser().resolve(strict=True)
        records = json.loads(bundle.read_text(encoding="utf-8"))
        require(isinstance(records, list), "Exported memories.json must be an array")
        for memory in records:
            validate_memory(memory)
            for media in memory["media"]:
                reference(bundle.parent, media, "asset")
            if memory["source"].get("evidenceAsset") is not None:
                reference(bundle.parent, memory["source"], "evidenceAsset")
            memories.append(memory)
    require(3 <= len(memories) <= 5, "Supply 3–5 existing memories; no records are invented or dropped")
    require(len({m["id"] for m in memories}) == len(memories), "Duplicate memory ID; originals must have unique IDs")
    center = scene["camera"]["target"]
    spacing = math.dist(scene["camera"]["position"], center) * 0.2
    anchors = []
    for index in range(5):
        position = [center[0] + (index - 2) * spacing, center[1],
                    center[2] + abs(index - 2) * spacing * 0.3]
        require(vector(position, 3), "Anchor position exceeds finite coordinates")
        anchors.append({
            "id": f"place-{index + 1}",
            "label": memories[index]["title"] if index < len(memories) else f"Place {index + 1}",
            "position": position,
            "memoryIds": [memories[index]["id"]] if index < len(memories) else [],
        })
    palace = {"schemaVersion": 0, "capsule": {"id": "capsule-" + uuid.uuid4().hex,
              "title": title, "frozenAt": None}, "scene": scene, "anchors": anchors, "memories": memories}

    # Exclusive creation refuses even an empty output that appeared during validation.
    # On failure remove only this invocation's new directory, never a source bundle.
    target.mkdir(parents=True, exist_ok=False)
    try:
        inventory = []
        for source, relative in copies:
            destination = target / relative
            destination.parent.mkdir(parents=True)
            digest, size = hashlib.sha256(), 0
            with source.open("rb") as reader, destination.open("xb") as writer:
                for chunk in iter(lambda: reader.read(1024 * 1024), b""):
                    writer.write(chunk)
                    digest.update(chunk)
                    size += len(chunk)
            require(size > 0, f"Asset became empty: {relative}")
            inventory.append({"asset": relative, "bytes": size, "sha256": digest.hexdigest()})
        (target / "manifest.json").write_text(json.dumps({"assets": inventory}, indent=2) + "\n", encoding="utf-8")
        (target / "palace.json").write_text(json.dumps(palace, indent=2, ensure_ascii=False,
                                                     allow_nan=False) + "\n", encoding="utf-8")
    except Exception:
        shutil.rmtree(target)
        raise
    return target / "palace.json"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--scene", required=True, help="Existing scene.json; assets resolve beside it")
    parser.add_argument("--memories", required=True, action="append", help="Existing memories.json; repeat per bundle")
    parser.add_argument("--title", required=True)
    parser.add_argument("--output", required=True, help="New folder; existing paths are refused")
    args = parser.parse_args()
    try:
        print(assemble(args.scene, args.memories, args.title, args.output))
    except (ValueError, OSError) as error:
        parser.exit(2, f"Assembly failed: {error}\n")


if __name__ == "__main__":
    main()
