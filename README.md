# Haasome — Memory Palace

Turn a familiar room into a place to revisit memories and recall useful knowledge.
Seven-hour Codex Astra 6 hackathon build: one Gaussian-splat room, five spatial
anchors, selected photos/video, and one observed computer-use capture from an app.

**Status: first runnable slice on `integration/first-palace`.** The browser renders
a licensed real room and imports local memory/media bundles, with placement,
recall/reveal, and save/reload. App capture remains fixture-only; no personal room
has been reconstructed. Two [Pro rounds](docs/PRO-IDEAS.md) selected **Remember the
fix**, a public technical lesson, as the first demo story.

## Run the first slice

From repository root on `integration/first-palace`:

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

## Start here

1. Read [the brief](PROJECT.md) and [three-lane plan](docs/LANES.md).
2. Claim one lane with teammates before writing. Each lane gets its own clone or worktree.
3. Read [the shared contract](packages/contracts/README.md).
4. Continue from the integrated slice; finish the remaining live handoff before adding features.

| Lane | Owns | Next handoff |
| --- | --- | --- |
| A — Spatial experience | `apps/palace/` | Place five loci on recognizable objects and rehearse |
| B — Scene pipeline | `pipelines/scene/` | Presenter-selected room capture when available |
| C — App intelligence | `services/memory/` | One actual public-source UI capture imported in viewer |

Shared contracts, root configuration, and integration belong to the coordinator.
See [AGENTS.md](AGENTS.md) for write boundaries and Git rules.

```sh
git fetch origin
# Choose your lane and replace yourname with a unique teammate name.
git worktree add ../haasome-next-experience -b work/experience-yourname origin/integration/first-palace
git worktree add ../haasome-next-scene -b work/scene-yourname origin/integration/first-palace
git worktree add ../haasome-next-memory -b work/memory-yourname origin/integration/first-palace
```

GitHub selected `setup/memory-palace` as the initial default branch when this empty
repository received its first push. The latest assembled code is on
`integration/first-palace`; the initial `lane/*` branches preserve each producer's
commit. Continue from integration in a fresh owned branch. Merge to default only
when requested; nothing has been merged there.

No raw personal media, screenshots, room scans, credentials, or model weights in
Git. Use ignored `data/` and `artifacts/`. Fixture files are synthetic and explicitly
labeled. [Delivery gates](docs/DEMO.md) distinguish live execution from replay.
