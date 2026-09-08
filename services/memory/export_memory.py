#!/usr/bin/env python3
"""Package one explicitly supplied memory for the palace viewer; no app scraping."""

import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import shutil
import tempfile
import uuid


IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
VIDEO_EXTENSIONS = {".mp4", ".webm", ".mov"}


def source_file(value, extensions):
    path = Path(value).expanduser().resolve(strict=True)
    if not path.is_file() or path.suffix.lower() not in extensions:
        raise ValueError(f"Expected a file with extension in {sorted(extensions)}: {path}")
    if path.stat().st_size == 0:
        raise ValueError(f"Empty asset: {path}")
    return path


def export(args):
    for name in ("title", "body", "cue", "app", "locator"):
        if not getattr(args, name).strip():
            raise ValueError(f"{name} must not be empty")
    captured = datetime.fromisoformat(args.captured_at.replace("Z", "+00:00"))
    if captured.tzinfo is None:
        raise ValueError("captured-at requires a timezone")
    if args.kind == "computer-use" and not (args.evidence and args.observed_capture):
        raise ValueError("computer-use requires --evidence and --observed-capture; otherwise use manual")

    evidence = source_file(args.evidence, IMAGE_EXTENSIONS) if args.evidence else None
    media = [source_file(value, IMAGE_EXTENSIONS | VIDEO_EXTENSIONS) for value in args.media]
    target = Path(args.output).expanduser().absolute()
    if target.exists():
        raise ValueError(f"Output already exists; choose a new directory: {target}")
    target.parent.mkdir(parents=True, exist_ok=True)
    memory_id = "memory-" + uuid.uuid4().hex
    # Generated destinations never use titles, locators, or input filenames.
    # Build next to the destination so final rename stays on the same filesystem.
    temporary = Path(tempfile.mkdtemp(prefix=".memory-export-", dir=target.parent))
    try:
        assets = temporary / "assets" / memory_id
        assets.mkdir(parents=True)

        def copy_asset(path, stem):
            destination = assets / (stem + path.suffix.lower())
            shutil.copyfile(path, destination)
            return destination.relative_to(temporary).as_posix()

        record = {
            "id": memory_id,
            "title": args.title,
            "body": args.body,
            "cue": args.cue,
            "media": [
                {
                    "kind": "image" if path.suffix.lower() in IMAGE_EXTENSIONS else "video",
                    "asset": copy_asset(path, f"media-{index}"),
                    "alt": args.title,
                }
                for index, path in enumerate(media)
            ],
            "source": {
                "kind": args.kind,
                "app": args.app,
                "locator": args.locator,
                "capturedAt": captured.astimezone(timezone.utc).isoformat().replace("+00:00", "Z"),
                "evidenceAsset": copy_asset(evidence, "evidence") if evidence else None,
            },
        }
        (temporary / "memories.json").write_text(
            json.dumps([record], indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
        )
        if target.exists():
            raise ValueError(f"Output appeared during export: {target}")
        temporary.rename(target)
    finally:
        if temporary.exists():
            shutil.rmtree(temporary)
    return target / "memories.json"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ("title", "body", "cue", "app", "locator", "captured-at", "output"):
        parser.add_argument("--" + name, required=True)
    parser.add_argument("--kind", choices=("manual", "fixture", "computer-use"), default="manual")
    parser.add_argument("--evidence", help="Operator-selected screenshot; PNG, JPEG, or WebP")
    parser.add_argument("--media", action="append", default=[], help="Selected image/video; repeatable")
    parser.add_argument("--observed-capture", action="store_true", help="Operator attests actual UI capture")
    args = parser.parse_args()
    try:
        print(export(args))
    except (ValueError, OSError) as error:
        parser.exit(2, f"Export failed: {error}\n")


if __name__ == "__main__":
    main()
