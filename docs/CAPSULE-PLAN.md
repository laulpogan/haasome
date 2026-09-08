# Spatial time capsule — live trial

Freeze a small chapter recovered through Photos and WhatsApp into a local spatial
capsule. User authorized exploring both apps for date and location connections.
Use a bounded cluster, not a whole-library index. Langfuse is a later candidate.

## Finish line

1. Inspect actual Photos and WhatsApp UI; retain three selected records and local
   evidence. Separate observed dates/locations from inferred connections. A photo
   timestamp is not proof of attendance or a message's subject.
2. Assemble the records into the existing splat viewer at named anchors. Keep the
   existing licensed room unless a permitted Marble export is ready. Generated
   scenery is an imagined setting, not a reconstruction or factual memory.
3. Freeze a named capsule with timestamp and referenced media/evidence embedded.
   Reopen that single file in fresh browser state, visit anchors and reveal sources.
4. Verify the live flow, build and focused tests; push source branches. Private
   photos, messages, location data and capture artifacts stay local and out of Git.

## Ownership

- Coordinator: this plan, shared contract, live UI capture, synthesis and integration
  in `haasome-capsule`, branch `capsule/integration`.
- A: `apps/palace/**`, freeze/import/read-only snapshot UX in `haasome-capsule-viewer`.
- B: `pipelines/scene/**`, Marble export compatibility in `haasome-capsule-scene`.
- C: `services/memory/**`, local multi-source bundle assembly in
  `haasome-capsule-evidence`.

Each worker has a separate worktree. Native computer-use remains coordinator-only.
No source-app writes, sends, paid generation or personal-data uploads. Existing
integration and teammate branches remain untouched. No merge to default.

## Portable capsule contract

Container: `capsuleVersion: 1`, `palace` (existing schema v0), and `assets`, an array
of `{path, type, data}` where `data` is base64 and paths are bundle-relative.
Optional palace metadata: `capsule: {id, title, frozenAt}`. `frozenAt` is null for a
draft or an ISO UTC timestamp for a snapshot. Source `capturedAt` remains distinct.
Freeze includes every referenced scene/media/evidence asset and fails if any is
missing. Reopened snapshots require an explicit editable copy before mutation.
This is a preserved local copy, not a cryptographically authenticated historical
record. Browser storage alone is not the portable archive.

Scene provenance additionally permits `generated` with visible attribution and
the label "Generated setting — not a captured place".

## Evidence boundary

Computer-use records require observed UI reads and actual local evidence. The
exporter attestation alone is not proof. Connections are qualified in memory text;
do not infer identities from faces, sensitive traits, or attendance from proximity.
The trial demonstrates this session's computer use; it does not imply a separate
autonomous capture daemon or an installed Astra API integration.

## Delivered trial

Branch: `capsule/integration`. Start from `apps/palace`:

```sh
npm ci
npm run build
npm run preview -- --port 4185
```

Local inputs: `artifacts/capture/` (selected Photos exports and WhatsApp screenshots).
Assembler output: `artifacts/capsules/july17-final/`.
Portable output: `artifacts/capsules/july17-frozen.json` (about 41 MB).
Open http://127.0.0.1:4185 and import that one file. Source assets remain on this
Mac; neither the capsule nor the captures are committed or uploaded.

Observed: real room splats, three real-source cards and decodable evidence;
freeze/download; fresh-browser reopen; matching hashes for all five embedded
assets; cue/visit/reveal; save and reload. Room load reported 0.71 seconds in one
local Chromium run; this is not a performance benchmark. Build, six validator
checks, eleven packaging checks and four browser tests pass. The private live
verification and rendered evidence are under `artifacts/capsules/`.

The exported photo had no GPS metadata. The trial preserves a temporal candidate
and contrary message evidence instead of asserting a location or attendance.
The selected photo export itself is its source evidence; WhatsApp records retain
UI screenshots. Langfuse was not inspected. Marble packaging supports supplied
exports, but no Marble export was used in this live trial.

The user-visible Chrome viewer opened. Automated file selection was blocked by
the extension's file-URL permission; the file was tested through the same importer
in isolated Chromium. The presenter can use Import files to open it by hand.

The other session owns the remote reconstruction container. A read-only check
found its training and export processes running; no jobs or drivers were changed.
Fresh reconstruction is not a prerequisite for this capsule.
