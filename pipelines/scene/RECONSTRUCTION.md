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

## Observed boundary, September 8

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

Remaining gate: a selected deliberate room capture must register, train, export,
return through this runner, and pass visual inspection. See [capture guidance](CAPTURE.md).
Nerfstudio's [custom-data instructions](https://docs.nerf.studio/quickstart/custom_dataset.html)
and COLMAP's [capture guidance](https://colmap.github.io/tutorial.html) explain the
need for overlapping, sharp views. Random camera-roll memories remain content.
