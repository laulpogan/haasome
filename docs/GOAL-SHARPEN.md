# Goal 1 — reconstruct a room worth revisiting

Improve the actual presenter-room reconstruction until the table, wall prints,
mirror and doorway remain recognizable from several useful viewpoints. The current
87-second result proves transport and training, but its fragmented people and
stretched surfaces fail the visual goal. Do not declare victory from a successful
export, additional training steps, a sharper screenshot alone, or a different room.

Read AGENTS.md and pipelines/scene/RECONSTRUCTION.md. Start from `fd88405` or a
verified descendant of `origin/integration/one-chapter` in your own worktree and
`work/room-quality-<name>` branch. Own `pipelines/scene/` and ignored reconstruction
artifacts. Other writers own the viewer, object recognition, and source collection.
Keep the current scene and frozen capsule intact. Push verified units throughout.

Baseline inputs and evidence, relative to the coordinator's checkout:

- `artifacts/partner/austin-trip-4c3b145/`: approved original media and hashes.
- Room video: `assets/memory-55213a15894b4d2fbc778267e92b46df/media-0.mp4`
  inside that folder; 16.95 seconds, 464 × 832 pixels.
- `artifacts/capture-jobs/d5534332-1615-4035-abdc-9fc0b61307f5/`: current scene,
  exported splat and timing/status records. Remote job has processed frames, poses,
  checkpoints and logs in the existing project container.
- `artifacts/capture-verification/austin-room-capsule.json` and its screenshot.

Inspect current files and processes before assuming these paths remain current.
Do not duplicate private artifacts into Git. Use the existing private SSH runner.
Coordinate GPU ownership: this lane starts with Dell's RTX; the recognition lane
may use the second RTX. Preserve drivers, other jobs and the baseline scene.

First establish why quality is poor. Inspect original video, extracted frames,
intrinsics, registered poses, reconstruction coordinate transforms and the same
view in Nerfstudio and Spark. Separate rendering/camera defects from bad geometry.
The current pipeline samples one frame per second and can upscale a small video
to 1600 pixels. Upscaling adds no observed detail. Check native resolution, overlap,
blur, moving people, mirrors and missing viewpoints before changing training.

Run a small, controlled comparison. Fix unintended upscaling; select a denser but
bounded set of sharp, overlapping frames where it adds coverage. Compare the
existing configuration against a longer train. If moving subjects dominate, check
the installed trainer's actual mask behavior and test a bounded masking approach
before relying on it. Preserve masks and their source mapping. Do not install a
new reconstruction stack merely to escape a diagnosis.

Use a 5–10-step probe for changed configurations. Record extraction, registration,
probe, training, export, transfer, load, output size and peak GPU memory separately.
Compare baseline and candidate from at least three matched camera poses, including
a modest side movement. Inspect table edges, wall geometry, recognizable details,
holes and moving-subject artifacts. Training-view fit alone is insufficient.

Within 20 minutes, send the collection lane a specific missing-data request if
needed: which wall/object/view, desired original resolution, and why the current
views cannot support it. More frames from the same blurry view are not more coverage.
Accept only the presenter's selected or already authorized same-room material;
do not combine changed room layouts without checking compatibility.

Deliver the best verified scene through the existing importer. Provide its asset
hash, scene ID, transform, camera, source-frame/pose mapping and a bounded set of
comparison views to the object lane. Retraining can invalidate splat indices and
geometry coordinates: never silently carry old object bindings onto a new asset.

Finish when the improvement is visible in the real viewer, from the agreed views,
and the exported scene survives capsule freeze/reopen. If capture information is
insufficient, report the exact missing views and show the strongest honest result;
do not invent detail with image generation or claim sharpened pixels are geometry.
Keep the goal incomplete when the visual target remains unmet. First comparison
budget: 30 minutes; converge within the remaining hackathon time rather than run
an open-ended parameter search. No paid API or model spend without explicit choice.
