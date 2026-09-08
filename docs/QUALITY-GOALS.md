# Next goals: fidelity, object memory, targeted collection

The first capsule proved an end-to-end pipeline. The current screenshot still
shows fragmented geometry and coordinate-only attachments. These goals raise
the finish line to a useful spatial memory experience.

Run [quality](GOAL-SHARPEN.md) and [object memory](GOAL-OBJECT-MEMORY.md) in parallel.
Run [collection](GOAL-COLLECT-CONTEXT.md) as a bounded input lane: inspect the
existing bundle immediately, then follow the quality lane's specific coverage
request. One writer per worktree. Quality owns pipelines/scene; object memory owns
apps/palace; collection owns services/memory. Coordinator integrates shared
contracts and chooses the scene. Reserve Dell's RTX for quality and the second RTX
for recognition when needed; recheck utilization first. No need to occupy Sparks
or launch extra agents merely because hardware is available.

Freeze a scene version for object work. Quality delivers scene identity, asset
hash, camera transforms and source-view mapping. Collection delivers original media
and source facts. Object memory delivers confirmed regions, stable application
object IDs and source-backed memory associations. Changing the scene invalidates
bindings until their mapping is checked. Keep frozen originals and the working
baseline available throughout.

Current evidence: the input clip is 464 × 832, the pipeline used 17 frames and
3000 training steps, and people move through much of the view. Current anchor
storage contains standalone XYZ positions. The causes of each visual defect still
need isolation; more training cannot be assumed to fix missing coverage.

Primary technical starting points:

- [COLMAP capture guidance](https://colmap.github.io/tutorial.html): overlapping
  views of the same scene are the reconstruction input.
- [Spark SplatMesh](https://sparkjs.dev/docs/splat-mesh/): actual geometry raycasting
  is available; the installed version returns hit point, distance and mesh object.
  Raycasting supplies geometry, not a semantic object label.
- [Nerfstudio Feature Splatting](https://docs.nerf.studio/nerfology/methods/feature_splatting.html):
  a research direction for learned scene features, not an installed capability
  or a required dependency for the first object-grounded implementation.

These are goal prompts, not evidence that the new capabilities have been built.
