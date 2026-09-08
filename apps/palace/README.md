# Haasome palace viewer

Lane A: local Gaussian-splat viewer with five spatial anchors, text/image/video
cards, source evidence, bundle import, editable placement, device save/reload,
and cue → visit → reveal. Browser files stay local; no API or source-app access.

## Run

Requires Node 20.19+ or 22.12+ (verified with Node 26.7.0).

```sh
cd /Users/laul_pogan/Source/haasome-experience/apps/palace
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

## Verification

```sh
npm run check
npm run build
# Run while preview is serving port 4173:
PALACE_SCENE_BUNDLE=/Users/laul_pogan/Source/haasome-scene/artifacts/scene/table-tennis-room \
PALACE_MEMORY_BUNDLE=/Users/laul_pogan/Source/haasome-memory/artifacts/memories/fixture-first \
npm run test:browser
```

Playwright launches its own headless Chromium with Metal on macOS, never native
Chrome or a user profile. Install Playwright's Chromium if absent. On other systems,
remove the Metal launch argument in playwright.config.js. Without bundle variables,
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
