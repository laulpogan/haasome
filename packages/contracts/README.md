# Palace contract v0 — proposed handoff

No runtime consumes this contract yet. A implements the consumer; B produces `scene`;
C produces entries in `memories`; A owns anchors and assembly into the palace file.
Coordinator owns changes here. `examples/palace.fixture.json` is synthetic shape
data with deliberately missing assets, not a usable scan or live capture.

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
