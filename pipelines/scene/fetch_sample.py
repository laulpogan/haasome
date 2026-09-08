#!/usr/bin/env python3
"""Fetch the pinned licensed room and emit a local v0 scene handoff. Stdlib only."""

import hashlib
import json
import math
from pathlib import Path
import tempfile
import urllib.request
import zipfile


HERE = Path(__file__).resolve().parent
OUTPUT = HERE.parents[1] / "artifacts/scene/table-tennis-room"


def write_json(path, value):
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False, allow_nan=False) + "\n")


def main():
    manifest = json.loads((HERE / "sample-manifest.json").read_text())
    resources = manifest["resources"]
    OUTPUT.mkdir(parents=True, exist_ok=True)
    # Refuse replacement so a rerun cannot move a scene under existing anchors.
    if (OUTPUT / "scene.json").exists() or (OUTPUT / "table-tennis-room.sog").exists():
        raise SystemExit(f"Existing handoff at {OUTPUT}; keep it frozen or move it before rerunning.")
    with tempfile.TemporaryDirectory(prefix="fetch-", dir=OUTPUT) as scratch:
        staging = Path(scratch)
        for resource in resources:
            name = resource["path"]
            if Path(name).name != name:
                raise ValueError(f"Not a flat archive member: {name}")
            request = urllib.request.Request(resource["url"], headers={"User-Agent": "Haasome-scene/0"})
            with urllib.request.urlopen(request, timeout=30) as response:
                data = response.read(resource["size"] + 1)
            if len(data) != resource["size"] or hashlib.sha256(data).hexdigest() != resource["sha256"]:
                raise ValueError(f"Size/SHA-256 mismatch: {name}; no handoff published")
            if name.endswith(".webp") and (data[:4] != b"RIFF" or data[8:12] != b"WEBP"):
                raise ValueError(f"Invalid WebP header: {name}")
            (staging / name).write_bytes(data)
            print(f"Verified {name}: {len(data)} bytes", flush=True)

        meta = json.loads((staging / "meta.json").read_text())
        if meta["version"] != 2 or meta["count"] != 1244410:
            raise ValueError("Unexpected SOG version/count")
        members = ["meta.json"]
        for value in meta.values():
            if isinstance(value, dict):
                members.extend(value.get("files", []))
        if sorted(members) != sorted(r["path"] for r in resources):
            raise ValueError("Pinned resources do not match the complete SOG manifest")

        # SOG v2 means bounds use sign(x)*log(1+abs(x)), not scene units.
        def decode(value):
            return math.copysign(math.expm1(abs(value)), value)

        low = [decode(v) for v in meta["means"]["mins"]]
        high = [decode(v) for v in meta["means"]["maxs"]]
        extent = [hi - lo for lo, hi in zip(low, high)]
        if not all(math.isfinite(v) and v > 0 for v in extent):
            raise ValueError("Invalid scene bounds")
        center = [(lo + hi) / 2 for lo, hi in zip(low, high)]
        scale = 10 / max(extent)
        scene = json.loads((HERE / "scene.template.json").read_text())
        # Provisional 180-degree Z rotation from the secondary sample viewpoint.
        # Center after rotation and normalize largest full-bound extent to 10.
        scene["transform"]["position"] = [scale * center[0], scale * center[1], -scale * center[2]]
        scene["transform"]["scale"] = scale
        # Catalog camera is already in the Z-rotated world: normalize it, without
        # rotating twice. Full-bound sphere fitting would frame distant outliers.
        viewpoint = manifest["provisionalViewpoint"]
        if viewpoint["scene_transform"] != {
            "translation": {"x": 0.0, "y": 0.0, "z": 0.0},
            "orientation": {"x": 0.0, "y": 0.0, "z": 1.0, "w": 0.0},
            "scale": 1.0,
        }:
            raise ValueError("Catalog viewpoint no longer matches the chosen rotation")
        scene["camera"] = {
            field: [scale * viewpoint[source][axis] + scene["transform"]["position"][i]
                    for i, axis in enumerate("xyz")]
            for field, source in (("position", "position"), ("target", "orbit_target"))
        }

        archive = staging / "table-tennis-room.sog"
        with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_STORED) as bundle:
            for name in members:
                info = zipfile.ZipInfo(name, date_time=(2026, 9, 8, 0, 0, 0))
                bundle.writestr(info, (staging / name).read_bytes())
        with zipfile.ZipFile(archive) as bundle:
            if bundle.namelist() != members or bundle.testzip() is not None:
                raise ValueError("Archive verification failed")
            for resource in resources:
                if hashlib.sha256(bundle.read(resource["path"])).hexdigest() != resource["sha256"]:
                    raise ValueError("Archive payload changed")

        receipt = dict(manifest, splatCount=meta["count"], bounds={"min": low, "max": high},
                       archiveBytes=archive.stat().st_size,
                       archiveSha256=hashlib.sha256(archive.read_bytes()).hexdigest(),
                       orientation="unverified until A renders this exact archive",
                       camera="secondary catalog pose normalized with decoded bounds; unverified in viewer")
        (OUTPUT / "ATTRIBUTION.txt").write_text(scene["provenance"]["attribution"] + "\n")
        write_json(OUTPUT / "provenance.json", receipt)
        archive.replace(OUTPUT / archive.name)
        write_json(OUTPUT / "scene.json", scene)
    print(f"Handoff: {OUTPUT / 'scene.json'}\nAsset: {OUTPUT / 'table-tennis-room.sog'}")
    print("Archive verified. Viewer load, orientation, camera and five loci remain unverified.")


if __name__ == "__main__":
    main()
