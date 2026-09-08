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
60% registered views; run a ten-step probe; train 3000 steps; export Gaussians.
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
