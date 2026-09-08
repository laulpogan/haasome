# Memory bundle exporter

Package one selected memory and its local evidence/media for lane A's file import.
Python standard library only; run from repository root. No source app automation
or model API is installed. This CLI packages operator-supplied content.

```sh
python3 services/memory/export_memory.py \
  --title 'The story behind the desk' \
  --body 'A selected detail, checked against its source.' \
  --cue 'What happened at the desk?' \
  --app 'Selected source app' \
  --locator 'Visible source title or URL' \
  --captured-at '2026-09-08T18:00:00Z' \
  --kind manual \
  --output artifacts/memories/desk
```

Import `artifacts/memories/desk/memories.json` and its `assets/` files in the viewer.
Repeat `--media /absolute/path/to/selected-image.jpg` to include selected media.
`--evidence /absolute/path/to/screenshot.png` adds source evidence. Output paths use
generated identifiers, and existing bundles are refused. Originals are copied,
never moved. Keep generated bundles out of Git.

## Actual computer-use handoff

1. The operator/agent reads an allowed source app through its visible UI.
2. Capture its relevant visible state to an allowed local screenshot.
3. Check the proposed memory against that evidence; retain source title/locator.
4. Run the exporter with the actual capture time, `--kind computer-use`,
   `--evidence <screenshot>`, and `--observed-capture`.
5. Import that bundle into A's viewer and attach it to a locus.

The flag is an operator attestation, not independent verification. A screenshot's
existence cannot prove an autonomous action or the truth of the supplied caption.
Use `fixture` for synthetic checks; use `manual` for manually supplied memories.
The exporter checks local file existence/type extension, not media decoding; the
viewer must reject undecodable media and render supplied text as text.

## Assemble a capsule from existing exports

`assemble_capsule.py` uses Python 3.9+ and the standard library. The coordinator
runs it on selected UI captures from this run, after exporting the records.
It takes one existing scene object and one or more exported memory arrays,
containing 3–5 records in total. Supply bundles in the intended anchor order.

```sh
python3 services/memory/assemble_capsule.py \
  --scene artifacts/scene/scene.json \
  --memories artifacts/memories/prerequisite/memories.json \
  --memories artifacts/memories/correction/memories.json \
  --memories artifacts/memories/verification/memories.json \
  --title 'Remember the fix' \
  --output artifacts/capsules/remember-the-fix
```

Input assets resolve relative to each JSON file's directory. The scene asset
must exist at the scene's `asset` path. The assembler reads these inputs and
copies only the referenced scene, media, and evidence into generated unique
subdirectories. It rewrites those asset paths; all other scene and memory fields,
including source IDs, locators, capture timestamps, and extra metadata, retain
their values. Same-named assets cannot overwrite each other. Duplicate memory IDs,
missing or empty assets, traversal, URLs, symlink escapes, and existing output
paths are refused. Fewer than three or more than five records fail; no memories
are invented, duplicated, or discarded to fill the capsule.

Output contains:

- `palace.json`: schema v0, plus `capsule: {id, title, frozenAt: null}`. Five
  anchors follow the viewer's layout around `scene.camera.target`, spaced at
  20% of the camera-to-target distance, with
  one memory per populated anchor and any remaining anchors empty.
- `assets/`: byte copies under unique relative paths.
- `manifest.json`: an `assets` inventory with `asset`, `bytes`, and `sha256` per
  copied file. This sidecar is outside the source contract and has no
  `schemaVersion`. Hashes describe the copied bytes, not source authenticity.

Import the output folder into the viewer. Freeze there; assembly never changes
`capturedAt` or assigns a freeze timestamp. Assembly does not fetch sources,
automate apps, or establish actual computer use. Anchor placement is a starting
layout for the presenter to inspect in the real scene.

Run the synthetic packaging checks from repository root:

```sh
python3 -m unittest discover -s services/memory -p 'test_*.py' -v
```

These tests exercise the CLI and failure paths with temporary synthetic files.
The coordinator must still assemble the actual UI exports from this run and
observe their scene, evidence reveal, and freeze behavior in the viewer. Keep
those captures and generated capsules outside Git.
