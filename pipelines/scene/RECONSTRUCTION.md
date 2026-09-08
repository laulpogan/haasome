# Selected room capture runner

Build the app, then serve it with the local capture runner:

```sh
npm --prefix apps/palace run build
python3 pipelines/scene/serve_capture.py --host YOUR_EXISTING_SSH_ALIAS
```

Open `http://127.0.0.1:4187/?capture=1`. Select 8–80 overlapping photographs
or one short room video in **Reconstruct a room capture**. This sends only those
files to the operator-configured SSH host. Personal memory media uses the separate
local picker. Choose **Use reconstructed room** only when the job completes;
inspect orientation and reposition memory anchors before freezing.

The host must already have the isolated `haasome-splat-trainer` container,
`/workspace/haasome/venv`, Nerfstudio, COLMAP, FFmpeg, and working CUDA. This runner
does not install software, change drivers, or stop other workloads. The tested
environment uses Nerfstudio 1.1.5 and CPU COLMAP 3.9.1; Gaussian training uses CUDA.

Browser → loopback server → authenticated SSH → project container → scene.json
and splat.ply → existing browser importer is the live path. The browser sends a
bounded JSON media envelope (256 MiB decoded limit). The server generates archive
paths and job IDs; filenames never become shell commands. Requests require the
loopback Host, same Origin, and a session token. Do not proxy this service publicly.

Remote stages: decode/resize selected images, or extract up to 80 video frames
from the first 120 seconds; estimate camera poses; require at least eight and
60% registered views; run a ten-step probe; train 10000 steps; export Gaussians.
Each command has a timeout within a 25-minute processing budget. A container-wide
file lock prevents simultaneous capture workers, including after local restarts.
Setup, transfer and browser load are outside that processing budget.

Private input, status and output remain under ignored `artifacts/capture-jobs/`
locally and `/workspace/haasome/jobs/` remotely. Remote stage logs live in the
job directory. The application displays actual stage changes, elapsed time and
errors; it does not invent percentage progress. A browser refresh can observe the
same running server's job. After a server restart or lost transport, inspect the
remote job before submitting another. A local status error does not establish that
a disconnected remote process stopped. Files are retained for inspection; there is
no automatic deletion or remote cancellation endpoint.

## First failed inputs, September 8

- Browser-selected licensed images reached the real trainer and returned its
  registration failure. The import button stayed hidden; no scene was fabricated.
- A 24-image subset produced no initial pair. A broader 80-image subset registered
  only two views and was rejected before training. These tests removed supplied
  poses. They do not prove presenter-room reconstruction.
- Missing token, foreign Origin, and rebinding Host requests were rejected. A real
  held container lock rejected a second worker. A synthetic broken-export browser
  test reported import failure rather than success.
- Earlier training with supplied poses succeeded on both RTX hosts. The second
  10000-step result exported a 159,790,969-byte PLY and rendered upright in 0.89s.
  That is a licensed room, not a successful raw-upload reconstruction.

## Presenter video: complete live path

The partner's approved bundle at `codex/tito-whatsapp-handoff` commit `4c3b145`
provided a 16.95-second H.264 room video (464 × 832). On September 8 at 19:58:57 UTC,
the browser selected that exact clip and submitted it through the local runner.
All 17 extracted frames registered without supplied camera poses. The ten-step
probe, 3000-step training, Gaussian export, private return and browser import passed.

| Stage | Measured seconds |
| --- | ---: |
| Upload to prepared trainer | 1.75 |
| Frame extraction | 0.26 |
| Camera registration | 7.03 |
| Ten-step probe including startup | 8.53 |
| 3000-step training including startup | 31.45 |
| Gaussian export including startup | 9.49 |
| Return transfer | 24.97 |
| Browser-selected upload to observed returned result | 86.77 |
| Returned result import through rendered scene | 0.38 |

The end-to-end measurement includes browser preparation and status polling, so it
is longer than the component sum. Environment installation and earlier kernel
compilation were already complete; no cold-start estimate is implied.
The PLY is 48,829,321 bytes. The room renders upright with a recognizable table,
wall prints, mirror and door. Moving people and limited camera coverage create
visible fragments and gaps; this is a rough MVP scene, not a clean room survey.

Five records from the same selected bundle occupy those five loci. Both original
videos play after fresh capsule reopen. The 75,141,088-byte capsule froze in 2.707s
and reopened through rendering in 0.956s; recall, save/reload and evidence-preserving
editable copies passed with zero browser errors. All embedded bytes match the
assembler's hashes. Local evidence lives in `artifacts/capture-verification/`:
`austin-video-timing.json`, `austin-first-render.json`, `austin-capsule-result.json`,
`austin-room-capsule.json`, and `austin-room-capsule.png`.

The earlier Nerfstudio computer-use demonstration inspected the licensed training
view and generated a Gaussian export command through its UI. Setup, training and
actual export execution used the shell; no pause/resume behavior is claimed.
The presenter-video path above uses the app's capture interface and shell worker.

For a cleaner result, use deliberate overlapping room footage with fewer moving
subjects. See [capture guidance](CAPTURE.md).
Nerfstudio's [custom-data instructions](https://docs.nerf.studio/quickstart/custom_dataset.html)
and COLMAP's [capture guidance](https://colmap.github.io/tutorial.html) explain the
need for overlapping, sharp views. Random camera-roll memories remain content.


## Room-quality comparison, September 8

Native-resolution training plus 10000 steps improves table lines, print borders,
and doorway edges in the controlled comparison. People remain fragmented and
unseen surfaces remain unsupported. The visual goal is incomplete; keep the
original capsule and object bindings intact.

The source is 464 × 832. The original worker enlarged it to 892 × 1600 for both
registration and training. Native-only registration recovered 3/17 views at one
frame per second and 4/68 at four frames per second. Neither passed admission.
The revised worker retains the demonstrated feature-matching enlargement, then
extracts native training pixels from the original video and rescales focal lengths
and principal points to those dimensions. It checks the processed filename set
before replacement. No new image detail is claimed from enlargement.

The controlled comparison retained the baseline poses and sparse initialization,
changing training resolution and iteration count. The native 3000-step result
looked worse than baseline. Native 10000 steps reduced jagged table and wall
artifacts; enlarged 10000 steps produced a similar improvement. All four exports
were rendered in Nerfstudio from three identical camera poses, including left and
right offsets of 0.08 scene units. These are small offsets, not an orbit or evidence
of unseen geometry. Camera/dataparser transforms matched across those four runs.

| Configuration | Training seconds | Export seconds |
| --- | ---: | ---: |
| Native, 3000 steps | 24.781 | 9.186 |
| Native, 10000 steps | 68.126 | 8.389 |
| Enlarged, 10000 steps | 99.310 | 8.481 |

Native extraction took 0.164s and its ten-step probe took 8.136s. Baseline timing
remains in the earlier section. These are warm runs on the prepared trainer.
Peak GPU memory was not sampled; do not infer it from output size or throughput.

The existing `CaptureJobs.run` caller also exercised the revised worker from raw
video through return transfer: 17/17 views registered; extraction 0.21s,
registration 7.13s, native replacement 0.16s, probe 8.14s, training 67.68s, export
8.04s, upload 8.83s, return 19.84s. Its output was 25,274,777 bytes. Independent
registration changed its coordinate transform; it is a separate scene, not the
fixed-pose comparison candidate. It has not been selected for viewer handoff.

Operator comparisons may pass `--video-fps 1|2|3|4` and
`--iterations 3000|10000` to the per-job remote worker. The browser caller uses
one frame per second and 10000 steps. Keep the existing 80-frame cap and trainer
lock. `reconstruction.json` now retains input/frame hashes, registered frame poses,
training/registration dimensions and dataparser transforms for the next lane.

### Private candidate handoff

In the room-quality worktree, open `artifacts/quality/native-10000/scene.json` and
`splat.ply` through the existing importer. Start the app with the build and
`serve_capture.py` commands at the top of this document. Scene ID:
`capture-quality-native-10000-20260908`; asset SHA-256:
`55371fe5790d4b1992012d469ea2d809359c5ad10ba72f25340514678f28b881`.
The PLY is 31,183,129 bytes; transfer took 19.974s. Transform and camera are in
`scene.json`; comparison poses are in `artifacts/quality/views.json`. Source
frames and baseline poses are retained in the original capture job; the native
comparison preserves that pose mapping. Private comparison scripts, rendered views
and timings remain under `artifacts/quality/`, outside Git.

Observed in the real Chrome/Spark viewer: candidate imported with a reported
0.34s render load and recognizable room objects. Jagged people and the right-edge
smear remain. The app froze a separate candidate capsule, whose embedded PLY hash
matches the candidate. `artifacts/quality/native-10000/capsule.json` holds that
snapshot with empty memory bindings. Fresh-tab reopen and three matched Spark
views remain unverified: headless browser checks timed out and native file-picker
control stalled. Do not describe the Nerfstudio comparisons as Spark comparisons
or the candidate as the completed memory capsule.

The installed Splatfacto loss multiplies both target and prediction by each mask;
its dataparser requires mask paths for all frames or none. No masked result is
claimed. Masking has not been tested and cannot reveal surfaces hidden in every
source frame. A requested read-only review stopped at workspace trust; it supplied
no verdict.

### Missing capture request

Request the presenter's selected original-resolution same-room material, ideally
1080p or higher: slow side-step arcs around both near table corners; frontal and
oblique views of the heart print, neighboring prints, round mirror frame and white
doorway. Pause at each view. Keep the table and room layout fixed, and clear moving
players so table edges, legs and the wall behind them become visible. Capture the
mirror frame from both sides; reflections are not independent room geometry.
More blurry frames from the existing position cannot supply those hidden surfaces.
The collection-lane message was rejected because project agent messaging was off;
this request has not been confirmed delivered to that lane.
