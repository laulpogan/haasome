# Deliberate capture: one room, five loci

1. Select one room with the presenter and name five distinct, fixed objects as
   memory loci. Remove private papers/screens and exclude people. Use only media
   the presenter selects; do not inspect the camera roll. Record permission and
   chosen files outside Git.
2. Hold lighting and furniture fixed. Open curtains or add steady light to reduce
   motion blur. Avoid mirrors, moving screens and large blank surfaces where
   possible. Choose a starting doorway with a clear view of the room.
3. Record a slow, continuous 60–120-second phone video as a first attempt, not a
   promised reconstruction threshold. Walk a loop with overlapping views; translate
   the camera rather than pivoting from one spot. Keep exposure/focus stable when
   the phone allows. Avoid zoom changes and sudden turns.
4. Add a second slow pass at another height, then circle each selected locus where
   space permits. Keep adjacent views overlapping and include floor/wall context.
   Do not move objects between passes. End near the starting view to close the loop.
5. Review only those selected clips for blur, glare, missing sides and private
   content. Retake gaps now. Save originals under ignored `artifacts/scene/` or an
   approved private location. Preserve originals; extract frames into a new folder.
6. Hand off capture only until a compatible reconstruction stack is confirmed.
   No trainer installation or GPU execution belongs to this bounded slice. A later
   authorized run must inspect capacity (`nvidia-smi`, or `gpu-status` on GB10),
   architecture and existing tools without stopping jobs or changing drivers.
   Confirm camera registration, then benchmark the exact configuration for 5–10
   training steps before a longer run. Do not assume an Astra API exists.
7. Export a supported Gaussian scene, not a generic point cloud. Use a new filename
   for the presenter's room. Produce the same scene contract with `kind: captured`,
   honest permission/provenance and a first camera. Have A load the exact export,
   confirm upright orientation and visit all five loci before freezing the transform.

Report capture review, pose estimation, training, export, transfer and viewer-load
time separately. Package checks are not live viewer evidence. If registration or
the trainer is unavailable, keep the sample visibly labeled and report that gap.
