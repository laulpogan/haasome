# Local Marble export → capsule scene

The importer packages an existing, authorized Gaussian SPZ or PLY into the viewer's
`scene.json` handoff. Python standard library only. No generation, login, upload,
conversion service, trainer, dependency installation, or browser automation.
The existing [CC BY room workflow](README.md) remains the trial fallback.

## Rights and official example decision — checked 2026-09-08

[World Labs export specs](https://docs.worldlabs.ai/marble/export/specs) list SPZ and
PLY at about 2M or 500k splats. The page offers examples for testing, including
[this 500k rustic kitchen SPZ](https://wlt-ai-cdn.art/example_exports/rustic_kitchen_with_natural_light/rustic_kitchen_with_natural_light_500k.spz).
No explicit reuse/redistribution license was found on that page. It was not
downloaded or adopted for this trial. Public availability is not reuse permission.
Actual Marble example usable for this demo: **not established**.

[Export instructions](https://docs.worldlabs.ai/marble/export/gaussian-splat) say
exports require a paid plan and associate commercial rights with Pro.
[Terms sections 3.3, 3.7 and 3.8](https://www.worldlabs.ai/terms-of-service) distinguish
account-based output rights, require truthful origin and preservation of notices,
and reserve rights not granted. The plan wording and general terms do not establish
rights to someone else's example. Retain the applicable export-time terms and
permission for the selected file and intended trial; do not infer rights from a
file extension, download button, or Spark's software license.

Fallback: [Table Tennis Room by Ethan](https://superspl.at/scene/0d9e613b) explicitly
lists CC BY 4.0. Keep the existing attribution, license link, and change notice.
These are primary-source observations; permission for an unprovided Marble file
remains [TBD: verify].

## Package the presenter's selected export

Prepare two local UTF-8 text files outside Git: attribution (creator, world/source
locator, required notices) and permission evidence (license/authorization, source,
date, scope covering the trial). The script records those statements; it cannot
verify ownership or grant permission. Do not include credentials in either file.
Use a Gaussian export: arbitrary point-cloud PLY is not supported by the viewer.

From this checkout, substitute the selected local paths and camera values:

```sh
python3 pipelines/scene/import_marble.py /absolute/path/selected-export.spz \
  --output artifacts/scene/marble-trial \
  --attribution-file /absolute/path/attribution.txt \
  --permission-file /absolute/path/permission.txt \
  --camera-position 0 0 0 --camera-target 0 0 1
```

The example camera is a provisional origin looking forward, not an observed room
view. Supply the selected export's camera when available. PLY uses the same command
with a `.ply` input. Only the chosen local files are read. Output must not exist;
choose a new directory to avoid moving a scene beneath frozen anchors.

Outputs: `scene.spz` (or `scene.ply`), `scene.json`, `ATTRIBUTION.txt`,
`PERMISSION.txt`, and `provenance.json` with asset SHA-256 and verification limits.
Asset bytes are unchanged. Packaging does not decode or validate Gaussian data.
Keep the bundle under ignored `artifacts/scene/`; private exports and permission
records stay out of Git. Share only within the supplied permission's scope.

## Coordinates and the existing caller

World Labs specifies the OpenCV-to-OpenGL conversion `(x,y,z) → (x,-y,-z)`.
The importer emits a 180-degree X rotation, quaternion `[1,0,0,0]` in `[x,y,z,w]`
order, unit scale and zero translation. This rotates both Y and Z; it is not a
reflection. Camera position and target receive the same conversion once because
the contract stores them in world coordinates. No centering or meter claim.
If BOTH asset and supplied camera have already been converted to the viewer's
right-handed +Y-up coordinates, pass `--coordinates y-up` for identity. Never apply
the flip twice. No guessed rotations from the SOG fallback carry into Marble.

Caller: `apps/palace/src/main.js` → `importFiles` → `validateScene` → `loadScene` →
Spark `SplatMesh`. It accepts the existing scene object and applies the geometry
quaternion directly. Use **Import files** to select `scene.json` and `scene.spz`
(or `scene.ply`) together, or open the whole bundle folder. Attribution is embedded
in the scene and retained in the sidecar. The producer creates no memories/anchors.

**Coordinator gate:** this checkout's validator rejects `generated`, and its UI
has no generated label. Coordinator must integrate the planned shared contract and
viewer support for `kind: generated`, displaying “Generated scene — not a captured
room.” Do not relabel it `captured` or `licensed-sample` to bypass that gate.

After integration, A must observe the exact asset load in Spark, check upright
orientation and the initial view, place five loci, and save/reload. This lane
claims packaging only until that happens. Start the existing viewer with
`cd apps/palace && npm run dev -- --host 127.0.0.1` in its prepared environment.
No viewer files are changed by this lane.

## Observed checks in this lane

`python3 -m unittest discover -s pipelines/scene -p 'test_*.py'` passes CLI checks
for copying SPZ/PLY test bytes, hash/credit retention, both coordinate modes,
nonfinite-camera rejection, missing permission text, and overwrite refusal.
These are synthetic packaging fixtures, not valid Marble exports or render proof.

`python3 pipelines/scene/fetch_sample.py` fetched the actual licensed fallback,
verified all six pinned payload hashes and ZIP integrity, and produced:

`/Users/laul_pogan/Source/haasome-capsule-scene/artifacts/scene/table-tennis-room/table-tennis-room.sog`

The archive is 14,955,740 bytes. Its sibling `scene.json` passed the existing
viewer's `validateScene`; `resolveAsset` resolved that exact archive, with its size
matching the generated receipt. A generated-kind scene is rejected by this checkout's validator,
confirming the coordinator gate. No browser rendering was attempted. No actual
Marble file was packaged because no selected export with established trial rights
was available. The fallback is a licensed reconstruction, not Marble output.
