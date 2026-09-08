# Haasome — Memory Palace

Turn a familiar room into a place to revisit memories and recall useful knowledge.
Seven-hour Codex Astra 6 hackathon build: one Gaussian-splat room, five spatial
anchors, selected photos/video, and one observed computer-use capture from an app.

**MVP verified on `integration/one-chapter`.** A presenter-selected 17-second video
became a real room splat in 87 seconds on the prepared trainer, including upload
and return. Five source-backed cards, three photos and two playable videos form
a portable capsule. Freeze, fresh reopen, recall, edits and save/reload passed.
The room is recognizable but rough around moving people and poorly covered areas.
See [measured reconstruction results](pipelines/scene/RECONSTRUCTION.md) and
[capsule evidence](docs/CAPSULE-PLAN.md). The original licensed room remains available.

## Run the first slice

From repository root on `integration/one-chapter`:

```sh
python3 pipelines/scene/fetch_sample.py
cd apps/palace
npm ci
npm run build
npm run preview
```

Open `http://127.0.0.1:4173`. Choose **Open bundle** and select
`artifacts/scene/table-tennis-room` from the repository root. The fetch command
refuses to overwrite an existing bundle; reuse it if already present. Select a
place, then import an [exported memory bundle](services/memory/README.md).
See [viewer instructions](apps/palace/README.md) for checks and persistence limits.
To reconstruct selected room media, use the [private capture runner](pipelines/scene/RECONSTRUCTION.md).
To reopen the completed demo, use **Import files** with its frozen capsule JSON.
Selected personal artifacts stay outside this integration branch's tracked files.

## Start here

1. Read [the brief](PROJECT.md) and [three-lane plan](docs/LANES.md).
2. Claim one lane with teammates before writing. Each lane gets its own clone or worktree.
3. Read [the shared contract](packages/contracts/README.md).
4. Continue from the integrated slice; finish the remaining live handoff before adding features.

| Lane | Owns | Next handoff |
| --- | --- | --- |
| A — Spatial experience | `apps/palace/` | Rehearse the verified capsule; fix observed interaction issues |
| B — Scene pipeline | `pipelines/scene/` | Assess capture quality; preserve the working scene |
| C — App intelligence | `services/memory/` | Curate selected cards using the existing assembler |

Shared contracts, root configuration, and integration belong to the coordinator.
See [AGENTS.md](AGENTS.md) for write boundaries and Git rules.
The [teammate prompts](docs/TEAMMATE-START.md) include a low-touch content lane.

```sh
git fetch origin
# Choose your lane and replace yourname with a unique teammate name.
git worktree add ../haasome-next-experience -b work/experience-yourname origin/integration/one-chapter
git worktree add ../haasome-next-scene -b work/scene-yourname origin/integration/one-chapter
git worktree add ../haasome-next-memory -b work/memory-yourname origin/integration/one-chapter
```

GitHub selected `setup/memory-palace` as the initial default branch when this empty
repository received its first push. The latest assembled code is on
`integration/one-chapter`; the initial `lane/*` branches preserve each producer's
commit. Continue from integration in a fresh owned branch. Merge to default only
when requested; nothing has been merged there.

No raw personal media, screenshots, room scans, credentials, or model weights in
Git. Use ignored `data/` and `artifacts/`. Fixture files are synthetic and explicitly
labeled. [Delivery gates](docs/DEMO.md) distinguish live execution from replay.
