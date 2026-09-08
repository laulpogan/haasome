#!/usr/bin/env python3
"""Package a selected, authorized Marble export for the existing scene.json importer."""

import argparse
import hashlib
import json
import math
from pathlib import Path
import shutil
import tempfile


def write_json(path, value):
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False, allow_nan=False) + "\n",
                    encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("asset", type=Path, help="Existing local Marble Gaussian .spz or .ply")
    parser.add_argument("--output", type=Path, required=True, help="New bundle directory")
    parser.add_argument("--attribution-file", type=Path, required=True,
                        help="UTF-8 creator credit, source locator, and applicable notices")
    parser.add_argument("--permission-file", type=Path, required=True,
                        help="UTF-8 permission/license evidence covering this trial")
    parser.add_argument("--camera-position", type=float, nargs=3, required=True)
    parser.add_argument("--camera-target", type=float, nargs=3, required=True)
    parser.add_argument("--coordinates", choices=("opencv", "y-up"), default="opencv",
                        help="Coordinate system of BOTH asset and supplied camera (default: opencv)")
    args = parser.parse_args()
    source = args.asset.resolve(strict=True)
    fmt = source.suffix.lower().lstrip(".")
    if fmt not in ("spz", "ply") or not source.is_file() or source.stat().st_size == 0:
        parser.error("Select a nonempty local Gaussian SPZ or PLY export.")
    attribution = args.attribution_file.read_text(encoding="utf-8").strip()
    permission = args.permission_file.read_text(encoding="utf-8").strip()
    if not attribution or not permission:
        parser.error("Attribution and permission evidence must be nonempty; neither grants rights.")
    values = args.camera_position + args.camera_target
    if not all(math.isfinite(v) for v in values) or args.camera_position == args.camera_target:
        parser.error("Camera needs finite, distinct position and target.")
    # Coordinate conversion is metadata only. Spark applies this quaternion to
    # geometry; the contract requires camera coordinates already in world space.
    flip = args.coordinates == "opencv"
    def world(vector):
        x, y, z = vector
        return [x, -y, -z] if flip else [x, y, z]

    output = args.output.resolve()
    if output.exists():
        parser.error("Output already exists; choose a new bundle to preserve frozen anchors.")
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix=".marble-", dir=output.parent) as scratch:
        stage = Path(scratch) / "bundle"
        stage.mkdir()
        asset = stage / f"scene.{fmt}"
        shutil.copyfile(source, asset)
        digest = hashlib.sha256()
        with asset.open("rb") as stream:
            for chunk in iter(lambda: stream.read(1024 * 1024), b""):
                digest.update(chunk)
        credit = ("Generated scene using World Labs Marble; not a captured room.\n" + attribution
                  + "\nAsset bytes copied unchanged; display transform and camera metadata added.")
        scene = {
            "schemaVersion": 0, "id": "marble-" + digest.hexdigest()[:16],
            "asset": asset.name, "format": fmt,
            "provenance": {"kind": "generated", "attribution": credit},
            "transform": {"position": [0, 0, 0],
                          "rotation": [1, 0, 0, 0] if flip else [0, 0, 0, 1], "scale": 1},
            "camera": {"position": world(args.camera_position), "target": world(args.camera_target)},
        }
        write_json(stage / "scene.json", scene)
        (stage / "ATTRIBUTION.txt").write_text(credit + "\n", encoding="utf-8")
        (stage / "PERMISSION.txt").write_text(permission + "\n", encoding="utf-8")
        write_json(stage / "provenance.json", {
            "producer": "import_marble.py", "assetSha256": digest.hexdigest(),
            "assetBytes": asset.stat().st_size, "inputCoordinates": args.coordinates,
            "conversion": "(x,y,z) -> (x,-y,-z)" if flip else "identity",
            "permissionEvidence": "PERMISSION.txt (user supplied; not independently verified)",
            "verification": "Copied and hashed only; format decoding, rendering, camera and loci unverified",
        })
        # Create exclusively; a competing invocation cannot replace a bundle.
        output.mkdir()
        for member in stage.iterdir():
            member.replace(output / member.name)
    print(f"Handoff: {output / 'scene.json'}\nAsset: {output / asset.name}")
    print("Packaged only. Requires viewer support for provenance kind generated; rendering unverified.")


if __name__ == "__main__":
    main()
