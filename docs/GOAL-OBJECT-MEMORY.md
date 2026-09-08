# Goal 2 — recognize objects and attach intelligence to their geometry

Make the room itself the interface. A person points at the table, wall print or
mirror, sees the recognized object highlighted, and opens memories attached to
that object. Moving the camera must leave the attachment on the same physical
region. A floating coordinate or hand-written label alone does not meet this goal.

Read AGENTS.md, packages/contracts/README.md, apps/palace/src/main.js and the capsule
modules. Start from `fd88405` or a verified descendant of
`origin/integration/one-chapter`, in a separate `work/object-memory-<name>` worktree.
Own `apps/palace/`. The coordinator owns shared contract documentation; propose the
smallest compatible extension, and coordinate its integration. Do not edit the
quality pipeline or the source collector's files. Push verified units throughout.

Use the current captured room and its registered source frames to begin; do not
wait for the quality lane. Coordinate any GPU use on the second RTX. Prefer an
existing healthy local vision/segmentation capability. Check actual availability,
primary documentation, licensing and compatibility before adopting anything.
No recursive Codex CLI or silent paid API use. A Spark is useful only if its ready
environment shortens the task. A missing model must not be hidden behind fake labels.

Implement two connected capabilities:

1. **Geometry attachment.** Use the installed Spark SplatMesh raycasting support
   to hit actual rendered geometry. Its current hit result supplies a point,
   distance and object; do not assume it supplies a stable Gaussian index. Verify
   transforms, opacity thresholds, background misses and transient splats. Store
   attachment in scene-local geometry coordinates, with a stable application object
   ID and the exact scene asset hash. Use a confirmed region or supported geometry
   neighborhood, not a camera-facing plane at an arbitrary depth. Highlight the
   selected region and make the object clickable. Do not highlight the whole room.

2. **Recognition and memory association.** From source frames with known poses,
   propose at least three static objects using an actual recognition/segmentation
   method. Lift the visible regions onto the splat and check them from at least two
   views. Keep provenance for model proposal, source frame and user correction.
   Handle mirror/reflection ambiguity and reject unsupported regions. Let the user
   confirm, rename, split or reject a proposal. Manual surface selection can be a
   first milestone and correction tool; label it manual and keep automatic
   recognition unfinished until it has actually run.

Represent each confirmed object with its label, geometry binding, scene identity,
supporting observations and linked memory IDs. Store meaning in a portable semantic
sidecar inside the capsule; it need not alter the PLY bytes. If experimenting with
learned per-splat features, first prove that features survive export, browser
consumption and reopen. Do not claim learned features from a metadata-only result.

Connect intelligence to the live user flow: selecting the table exposes its linked
video and source; an object/content query can locate a relevant confirmed object;
suggested memory-to-object links give a reason the user can accept or correct.
A mnemonic attachment does not establish that the depicted event happened at that
object. Distinguish source facts, recognized object labels and user-chosen links.
Do not infer people's identity, attendance or private attributes from appearance.

Preserve old capsule imports. Freeze object bindings and source evidence together.
An edited scene transform must move its attachments correctly. A replacement or
retrained splat with a different hash must require verified rebinding or visibly
mark bindings stale; never reuse unstable indices silently. Frozen originals stay
unchanged when making editable copies.

Finish with three recognized objects in the actual scene, each highlighted and
selected from multiple viewpoints, at least one useful source-backed memory link,
one corrected proposal, a meaningful object/content query, and a fresh frozen
capsule reopen retaining the same associations. Test background misses, occlusion,
camera orbit, scene-transform changes and scene replacement. Check real browser
console/network behavior and navigation latency. Save a short demonstration and
the capsule outside Git. Report manual versus automatic steps without ambiguity.

Aim for a surface-bound first slice in 20 minutes and a complete recognition loop
within an hour, subject to remaining hackathon time. These are work budgets, not
claims of model speed. Do not stop after building an unused detector or schema.
