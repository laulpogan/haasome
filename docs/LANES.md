# Three lanes / seven hours

The coordinator owns integration and shared files. Teammates claim A, B, or C.
Codex workers now occupy A, B, and C in isolated worktrees. Human teammates should
coordinate before taking the same write scope. Two read-only scouts support asset
licensing and GPU readiness; they do not create additional product lanes.

Prefer ChatGPT Web High for bounded Codex tasks to conserve Astra credits. The
initial read-only scouts completed, but writer tool calls failed with expired
tokens / bridge 502s. Two bounded Astra workers at medium reasoning now handle A
and B; coordinator handles the small C exporter. No worker may recursively spawn
more workers or start paid API jobs. Recheck healthy low-cost routing before
expanding the pool; failed worker launches do not count as implementation progress.

## A — Spatial experience

Own `apps/palace/`. Build the browser viewer, navigation, cards, import, persistence,
and recall interaction. Choose and pin the renderer after opening its current
source, license, release, and example. Spark / Three.js is a candidate, not installed.

First 30 minutes: render a genuine splat and show one clickable anchor from fixture
data. Use an explicit placeholder state if B's scene is missing; do not fake a scan.
By hour 2: five navigable anchors and JSON import/export. By hour 3: import B and C
outputs through the same UI. Persist only the selected local demo content; provide
clear missing-asset behavior after reload.

Done: a fresh viewer load displays B's scene; C's memory opens with source evidence;
moving between anchors and the recall/reveal loop work on the presentation laptop.
Record actual load time and frame behavior there, not GPU-host training metrics.

## B — Scene pipeline

Own `pipelines/scene/`. Produce room capture instructions, reconstruction/export,
scene metadata, asset provenance, and the first camera pose. Keep output under
ignored `artifacts/scene/`; share via an approved private asset channel.

First 30 minutes: identify one allowed capture, verify one host with `nvidia-smi`
(Spark: `gpu-status`), inspect architecture/environment, and load a representative
export in A's viewer. Do not install drivers or stop existing work. If no compatible
trainer is ready, use an existing licensed room splat and continue capture separately.

Before a long train, benchmark the exact configuration for 5–10 steps. Report cold
setup, pose estimation, train, export, transfer, and viewer-load time separately.
Training throughput does not predict whether camera registration succeeds.

By hour 2: one recognizable room export with transform and preview pose. Freeze that
asset; use a second output file for improvements so A's anchors do not drift.
Done: A loads the exact file and visits five agreed loci. PLY must contain Gaussian
attributes accepted by the renderer; an arbitrary point cloud is not a splat.

## C — App intelligence

Own `services/memory/`. Start with the presenter's already accessible source app
and one selected task. Use the actual available computer-use interface. Export a
memory record after inspecting visible source content and retaining allowed evidence.

First 30 minutes: capture one source detail through the UI, retain screenshot/source
locator and timestamp outside Git, and hand A a memory record. A manual import is
an integration aid; never label it live agent capture. Stop source-app writes.

By hour 2: repeat the same capture task on another selected item, with a bounded
failure path when content cannot be read. By hour 3: A imports one fresh captured
record, attaches it to a locus, and can reveal the original evidence.

Done: show the source UI being read, the resulting record, and the same record in
the palace. An automated suggestion may select among named loci; the presenter can
correct placement. No learned 3D scene understanding is needed for this slice.

## Integration clock

| Elapsed | Required result | Cut if missing |
| --- | --- | --- |
| 0:00–0:30 | A renders real splat; B has viable scene route; C captures source | Existing licensed scene; simpler already-open source app |
| 0:30–2:00 | Three first handoffs | Freeze renderer; avoid fresh GPU environments |
| 2:00–3:00 | One scene + one captured memory integrated | Fix seams before more memories |
| 3:00–4:30 | Five anchors, save/reload, source reveal, recall loop | Cut auto-placement and search |
| 4:30–5:30 | Full rehearsal on presentation machine | Freeze assets and dependencies |
| 5:30–6:30 | Fix demo-breaking defects; make labeled backup recording | No new features |
| 6:30–7:00 | Final rehearsal and handoff | Report live/replay boundaries |

Create an integration branch from the setup commit. Inspect each lane diff, then
cherry-pick only agreed, verified commits; do not merge/default-push on teammates'
behalf. Re-run the live demo after each integration. Keep lane histories intact.

## Starter prompt for each teammate

"Read AGENTS.md, PROJECT.md, docs/LANES.md, and packages/contracts/README.md. Own
lane [A/B/C] only in your own branch/worktree. Deliver its first 30-minute handoff
before expanding. Pin dependencies inside your directory after current source and
license checks. Push verified commits. Report commit, run command, exact artifact
path, live evidence, and blockers. Propose shared-contract changes to coordinator."
