# Haasome palace viewer

Lane A: local Gaussian-splat viewer with five spatial anchors, text/image/video
cards, source evidence, bundle import, editable placement, device save/reload,
and cue → visit → reveal. Browser files stay local; no API or source-app access.

## Run

Requires Node 20.19+ or 22.12+ (verified with Node 26.7.0).

```sh
cd apps/palace # from repository root
npm ci
npm run build
npm run preview
```

Open http://127.0.0.1:4173. The preview server binds loopback and refuses a busy
port. For development, use `npm run dev` on the same port instead of preview.

## Import and revisit

1. Open bundle: select B's `table-tennis-room` directory containing `scene.json`
   and `table-tennis-room.sog`. The viewer applies B's geometry transform and
   world-space camera. It labels the room as a licensed sample and shows attribution.
2. Select one of the five places using a spatial pin or the bottom navigation.
3. Open bundle: select C's exported folder containing the `memories.json` array
   and `assets/…`. New records attach to the selected place. Existing IDs update.
4. Read the card and source evidence. Use “Move memory to” to change placement.
   “Edit this place” changes label and world coordinates; anchors start near the
   supplied camera target and need placement on the chosen objects.
5. Save on this device stores the assembly and imported file bytes in IndexedDB.
   Reload restores both. Browser data clearing removes this copy; quota failures
   show an error. Save is explicit; unsaved edits disappear on reload.
6. Begin recall hides the answer, returns to the room view, and asks for the cue.
   Visit the matching place, then reveal the memory and source.

For the current “Remember the fix” story, rename five places to prerequisite,
symptom, cause, correction, and verification, and import the producer's records.
The viewer does not invent source facts or claim to verify capture provenance.

`Import files` accepts scene.json, a memory array, full palace JSON, and selected
assets together or separately. Folder import preserves paths below the selected
root. Multi-file import can resolve a unique filename/suffix; use folder import
when nested files share names. Missing or ambiguous assets show a repair message.
Only ZIP-packaged SOG is accepted; raw SOG meta.json plus WebP is not a scene file.
Never select a broad private directory: select only the prepared demo bundle.

Export JSON downloads `palace.json` with scene, anchors, and memories. It does not
embed media. Keep original assets beside it at their bundle-relative paths. A full
palace import replaces assembly; scene and memory handoffs augment it. Fewer than
five anchors are padded; more than five are rejected for this bounded slice.
An empty local draft can have scene=null; import a scene before sharing a complete
palace. Asset paths cannot traverse directories or fetch remote URLs. Text and
source locators render as text, never HTML or executable links.

## Portable time capsule

Enter a capsule title, then choose **Freeze capsule**. The viewer downloads one
JSON file with `{capsuleVersion:1, palace, assets}`. The palace retains schema v0
and adds `capsule: {id, title, frozenAt}`. Each asset entry contains its referenced
bundle path, MIME `type`, and base64 `data`. Freeze rejects missing or ambiguous
referenced scene, media, or evidence assets; unrelated imported files stay out.
The scene may be null. Three memories from two apps need no schema change.

Import the container alone through **Import files**, including in a fresh browser.
The viewer validates the palace, metadata, paths, duplicate entries, base64, and
reference completeness before replacing the current view and asset map. Container
paths resolve exactly; a prior browser asset cannot fill a missing container entry.
Scene provenance also accepts `generated`, shown as “Generated setting — not a
captured place”. Source capture dates and evidence labels remain visible. A
producer's computer-use claim does not establish source truth. The viewer infers
no date/place correlation or relationship between records.

Frozen capsules disable title, anchor, and memory placement changes and reject
imports that would augment them. Recall, device save/reload, and opening another
capsule remain available. **Make editable copy** creates a new ID and removes
`frozenAt`. Downloaded snapshots are never opened for writing; every capsule
download uses a new filename. A raw JSON file can still be edited outside the
viewer: this is a read-only application snapshot, not a signed authenticity proof.
**Export JSON** retains the existing asset-free palace export for editable drafts;
for frozen capsules it downloads the portable container with the same snapshot.

Validation is wired through the file picker in `src/main.js`; packing and decoding
live in `src/capsule.js`, with schema validation in `src/contract.js`. Coordinator
owns the shared contract documentation. The browser assembles the whole container
in memory; base64 adds size. Large scene/video limits have not been measured.

The capsule Playwright tests use only generic synthetic records (three memories,
two synthetic source apps), a generated test pixel, and one synthetic Gaussian.
They cover missing-asset rejection, byte-preserving portable import in a fresh
browser context, source labels, rendering, frozen edit guards, recall, persistence,
and editable copies without modifying the downloaded snapshot. They establish no
Photos/WhatsApp capture, real memory, Marble scene, or inferred correlation.

## Verification

```sh
npm run check
npm run build
# Run while preview is serving port 4173:
PALACE_SCENE_BUNDLE="$(pwd)/../../artifacts/scene/table-tennis-room" \
PALACE_MEMORY_BUNDLE="$(pwd)/../../artifacts/memories/fixture-first" \
npm run test:browser
```

Playwright launches its own headless Chromium with Metal on macOS, never native
Chrome or a user profile. Install Playwright's Chromium if absent. Other systems
use Chromium's default rendering backend. Set `PALACE_BASE_URL` to test a preview
on a different local port. Without bundle variables,
the test checks the missing-scene fixture flow; it does not establish real rendering.

Observed: B's exact 1,244,410-splat SOG rendered the table, walls, signage, and windows;
C's fixture export imported through folder selection. UI checks cover five anchors,
spatial pin selection, nested media/evidence, movement between places, coordinate
form, recall/reveal, persistence, JSON export/reimport, and unsafe-path rejection.
Screenshots stay in ignored `test-results/`. A fixture is not live source-app capture.
The anchors remain editable starting points, not five established semantic objects.
Metal headless measurements are a short local observation, not presentation rehearsal
or a sustained frame-rate guarantee. Software SwiftShader stalled on this room.

## Dependencies and licenses

Pinned Spark 2.1.0 and Three.js 0.185.1 (MIT); Vite 8.2.2 (MIT) and Playwright
1.63.0 (Apache-2.0) are development tools. npm audit reported zero vulnerabilities
at install. Spark's source, package, license, and hello-world/SOG examples were read
before choosing its SplatMesh / SparkRenderer integration:

- https://github.com/sparkjsdev/spark/tree/v2.1.0
- https://github.com/sparkjsdev/spark/blob/v2.1.0/LICENSE
- https://github.com/sparkjsdev/spark/blob/v2.1.0/examples/sogs/index.html

Runtime license notices ship at `/THIRD_PARTY_NOTICES.txt`. B owns scene acquisition
and CC BY 4.0 attribution. No room, memory export, or private media is committed here.
The production JS includes Spark's worker/WASM payload (~5.47 MB, ~1.91 MB gzip).

## Recognized objects and geometry-bound memories

The object panel uses Spark surface raycasts, scene-local support samples, stable
application IDs and the SHA-256 of the exact scene bytes. It does not store Gaussian
indices or learned splat features. Select a surface for a labeled manual proposal,
or import a prepared recognition folder into an editable copy of its matching room.
Legacy pins stop intercepting clicks while surface selection or splitting is armed.

The recognition producer is `scripts/propose-objects.py`. It calls an existing,
operator-selected vision model through a loopback OpenAI-compatible endpoint. It
starts no model service and installs no dependencies. Supply exactly two registered
frames from the selected capture, its Nerfstudio camera metadata and dataparser
transform, and the matching capsule:

```sh
python3 scripts/propose-objects.py --help
python3 scripts/propose-objects.py \
  --endpoint http://127.0.0.1:18491/v1 --model MODEL_NAME \
  --processed /path/to/processed \
  --dataparser /path/to/dataparser_transforms.json \
  --capsule /path/to/room-capsule.json \
  --frames frame_00013.jpg frame_00009.jpg --output /path/to/recognition-bundle
```

Import that output folder. The browser verifies frame/model evidence hashes, casts
rays through the proposed polygons, and retains samples supported by both source
views. Explicit ambiguity and insufficient support reject proposals. Geometry
agreement alone cannot distinguish a static object from a reconstructed person:
inspect both registered views and original frame overlays before confirming. Rename,
split or reject proposals with the correction controls. Splitting partitions existing
support samples; it does not run a new segmentation model.

Confirm an object before accepting a suggested memory link, or attach a memory with
your own reason. A query searches object labels and linked memory content.
Click its supported surface to open the linked card, video and source. Associations
are mnemonic choices, not evidence that the event happened at the object. Source
records retain their original manual/computer-use labels.

The compatible contract extension proposed to the coordinator is optional
`palace.objectMemory: {version:1, objects, recognitions?, rejections?}`. Each object
contains its ID, label, status, binding, observations, corrections and memory links.
Recognition runs retain model provenance, two camera poses, image hashes/polygons
and raw response evidence. `src/object-memory.js` and `src/recognition.js` validate
this extension; old capsules need no changes. Freeze includes referenced recognition
assets. Transform edits move attachments with the scene; changed scene bytes mark
bindings stale and disable geometry selection until replaced with verified bindings.

The actual-room recognition run used the existing `qwen3.8-flash-next` service and
proposed four objects. The recorded browser flow confirmed the table, heart artwork
and right artwork after two-view inspection, renamed the table, rejected the center
artwork because of an occluding reconstructed person, and accepted a video-memory
suggestion. Those confirmation/correction actions were performed by browser automation,
not evidence that the presenter approved them. The linked WhatsApp video record is
labeled manual. Source images, model output, capsule and recording stay outside Git.

Additional browser verification uses explicit private artifact paths:

```sh
OBJECT_MEMORY_CAPSULE=/path/to/original-room-capsule.json \
RECOGNITION_BUNDLE=/path/to/recognition-bundle \
RECOGNIZED_CAPSULE=/path/to/recognized-room-capsule.json npm run test:browser
```

Highlight visibility uses bounded periodic CPU raycasts. Camera navigation latency
must be measured on the actual room; these support markers are not a dense object mask.

After spreading highlight visibility checks across frames, two 60-frame captured-room
orbit runs measured p95 frame times of 33.4 ms and 50 ms (Metal headless Chromium).
The preceding batched-check run measured 350 ms. Visibility refreshes over one sample
cycle during movement; markers can briefly lag an occlusion change. These are short
local measurements, not a sustained frame-rate guarantee.
