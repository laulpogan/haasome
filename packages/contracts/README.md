# Palace contract v0 — file handoff

The [viewer](../../apps/palace/src/main.js) consumes B's `scene` and C's `memories`
through local file/folder import. A owns anchors and assembly into the palace file.
The live integration has consumed a licensed room and an exporter-generated fixture;
actual source-app capture remains unverified.
Coordinator owns changes here. `examples/palace.fixture.json` is synthetic shape
data with deliberately missing assets, not a usable scan or live capture.

The consumer's [validator](../../apps/palace/src/contract.js) is executable shape
validation. The viewer permits `scene: null` for a local empty draft, accepts one
to five anchors, and fills missing anchors to five. A complete scene bundle still
requires the fields below. Validation cannot establish source truth or capture.

## Wire format

Use UTF-8 JSON, `schemaVersion: 0`, stable string IDs, and ISO-8601 UTC timestamps.
Resolve asset paths relative to the imported bundle root; do not accept filesystem
traversal or execute supplied paths/content. The initial bundle lives on the demo
machine. No backend, queue, database, or worker protocol is required.

| Field | Required contents |
| --- | --- |
| `scene` | `id`, `asset`, `format`, `provenance`, `transform`, `camera` |
| `scene.provenance` | `kind`: `captured` / `licensed-sample` / `fixture`; `attribution` |
| `scene.transform` | `position: [x,y,z]`, `rotation: [x,y,z,w]` quaternion, positive uniform `scale` |
| `scene.camera` | `position: [x,y,z]`, `target: [x,y,z]` |
| `anchors[]` | unique `id`, `label`, `position`, `memoryIds[]` |
| `memories[]` | unique `id`, `title`, `body`, `cue`, `media[]`, `source` |
| `media[]` | `kind`: `image` / `video`; `asset`, `alt` |
| `source` | `kind`: `computer-use` / `manual` / `fixture`; `app`, `locator`, `capturedAt`, `evidenceAsset` |

World coordinates are right-handed, +Y up; camera looks toward `target`. Coordinates
use scene units, not claimed meters. Apply the scene transform to geometry only;
anchors and camera are already in world coordinates. Freeze the transform when A
places anchors. Every memory ID reference must resolve; vectors must be finite.

`source.evidenceAsset` may be null for manual/fixture entries. A computer-use entry
requires a real evidence asset and an observed capture. The source locator is text
for provenance; do not execute it. Render all text as text, not injected HTML.
Asset license and permission remain the producer's responsibility.

B handoff: a `scene.json` object plus its scene file. C handoff: a JSON array of
memory objects plus allowed evidence/media. A imports both, lets the presenter
place anchors, and exports a palace file. File import is the initial live seam;
do not invent separate HTTP contracts in each lane.
