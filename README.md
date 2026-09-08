# Haasome — Memory Palace

Turn a familiar room into a place to revisit memories and recall useful knowledge.
Seven-hour Codex Astra 6 hackathon build: one Gaussian-splat room, five spatial
anchors, selected photos/video, and one observed computer-use capture from an app.

**Status: collaboration scaffold and proposed contracts; no runnable app yet.**
Product direction is provisional while GPT Pro critiques the demo. The three lane
boundaries remain stable across nostalgia and learning variants.

## Start here

1. Read [the brief](PROJECT.md) and [three-lane plan](docs/LANES.md).
2. Claim one lane with teammates before writing. Each lane gets its own clone or worktree.
3. Read [the shared contract](packages/contracts/README.md).
4. Build the lane's first live handoff before adding features.

| Lane | Owns | First handoff |
| --- | --- | --- |
| A — Spatial experience | `apps/palace/` | Render a real splat and open one anchored card |
| B — Scene pipeline | `pipelines/scene/` | Loadable scene file, transform, preview camera |
| C — App intelligence | `services/memory/` | One sourced memory captured through an existing app UI |

Shared contracts, root configuration, and integration belong to the coordinator.
See [AGENTS.md](AGENTS.md) for write boundaries and Git rules.

```sh
git fetch origin
# Run ONE command matching your lane; use a unique suffix if a branch already exists.
git worktree add ../haasome-experience -b lane/experience origin/setup/memory-palace
git worktree add ../haasome-scene -b lane/scene origin/setup/memory-palace
git worktree add ../haasome-memory -b lane/memory origin/setup/memory-palace
```

The repository has no default-branch commit yet. Start from the published setup
branch. Each lane pushes its own branch; coordinator assembles an integration
branch after inspecting changes. Merge to default only when requested.

No raw personal media, screenshots, room scans, credentials, or model weights in
Git. Use ignored `data/` and `artifacts/`. Fixture files are synthetic and explicitly
labeled. [Delivery gates](docs/DEMO.md) distinguish live execution from replay.
