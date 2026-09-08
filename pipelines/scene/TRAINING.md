# Remote reconstruction demo

Use one RTX GPU and Nerfstudio Splatfacto. Keep the existing licensed room as the
fallback until the fresh export loads in the palace. Do not change host drivers or
stop other jobs. Coordinator owns this continuation of lane B.

## Current input

Eyeful Tower `seating_area`, 168 photographs from camera 0 and matching COLMAP
poses. The local preparation retained 175235 sparse points, scaled calibration to
827 × 1160, and pruned tracks to the selected images. Training payload is about
102 MB. This is a licensed public room, not a presenter capture or proof that our
pipeline can register arbitrary phone footage.

Source: [Eyeful Tower](https://github.com/facebookresearch/EyefulTower). Its March
11, 2026 changelog relicenses all content under MIT. Preserve the bundled LICENSE.
Primary source; no numerical trust score assigned.

Local handoff and preparation evidence:
`artifacts/training-input/eyefultower-seating-area/HANDOFF.md` and
`artifacts/training-input/evidence/prepare_subset.py`. These assets stay out of Git.

## Environment

The project container is `haasome-splat-trainer` on the authorized RTX host.
`/workspace/haasome/venv` isolates installed packages from the cached CUDA image.
Python 3.12, PyTorch 2.13.0+cu130, CUDA compiler 13.0, and a real GPU tensor operation
passed. Nerfstudio installation and `ns-train splatfacto --help` passed. Kernel
compilation and complete training subsequently passed: the 10-step probe exited
zero, then the 3000-step run completed and exported 726707 Gaussians. Late training
steps reported roughly 7–8 ms; this excludes cold compilation, input transfer,
pose estimation, export, and viewer interaction. Do not extrapolate capture latency.

The upstream Nerfstudio Dockerfile uses CUDA 11.8; do not assume that image works
on Blackwell. This run uses the host's cached `sglang-flashnext:sm120` image, so the
environment is host-specific until its full package/image manifest is preserved.

## Commands inside the project container

```sh
cd /workspace/haasome
export PYTHONUNBUFFERED=1 TORCH_CUDA_ARCH_LIST=12.0 MAX_JOBS=8
venv/bin/ns-train splatfacto --max-num-iterations 10 --vis tensorboard \
  --output-dir /workspace/haasome/outputs --experiment-name seating-probe \
  colmap --data /workspace/haasome/data/seating-area \
  --colmap-path sparse/0 --downscale-factor 1
```

The explicit sparse path and factor matter: the photographs and intrinsics are
already downscaled. A longer run follows only after this probe completes. Keep
probe and demonstration output directories separate.

## Computer-use sequence

Publish port 7007 on host loopback only; SSH-forward that port to the presentation
machine. Training launch and export commands are shell operations.

In the real Nerfstudio training viewer, verify the available controls, then:

1. Pause training and observe the step counter settle.
2. Select a training-camera view and inspect scene coverage.
3. Enable viewport crop, adjust its bounds, then restore the full view.
4. Add two camera keyframes and preview the path.
5. Resume training and observe progress.
6. Use Export → Splat to generate the export command, then execute that command
   through the shell. The UI does not itself export a Gaussian PLY.

The real browser UI was used to hide training cameras, open Export → Splat, set the
output directory, and generate the command. Screenshot evidence is at
`artifacts/training-ui/export-command.png`. Pause/crop/path controls remain
source-verified only. The viewer displayed Step 0 after a completed 3000-step run;
the checkpoint and training log establish completion, not that stale UI counter.
Viewport crop changes
the displayed region; it does not change the training dataset or delete splats.
Save UI evidence outside Git. Transfer the resulting Gaussian PLY with scene.json
and attribution, then load that exact bundle through the palace's existing import.

## Verified export and handoff

Export initially hit PyTorch's newer weights-only checkpoint default. The retry
scoped `TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD=1` to this export process for the checkpoint
we had just trained. Never apply that override to an untrusted downloaded checkpoint.
No global Python setting was changed. Missing optional mesh OpenGL plugins emitted
warnings; Gaussian export succeeded without those plugins.

The complete PLY is 180224929 bytes. Local bundle:
`artifacts/scene/seating-trained/`. It contains the PLY, scene.json, and MIT license.
The camera-0 capture positions form a near-planar track; its smallest principal
component supplied a vertical axis, with sign selected from the camera orientation.
The palace view was visually checked upright after applying that rotation. This is
a dataset-specific orientation correction, not automatic gravity estimation.

Actual UI-derived memory bundle: `artifacts/memories/nerfstudio-export/`.
The palace loaded both bundles, displayed the captured evidence, and restored them
after save/reload without page errors. Starting objects and remaining four memory
cards are teammate work. Full freeze and training logs are retained outside Git at
`artifacts/training-ui/`.

The second RTX host is now reachable after the user fixed its SSH access rule.
A CUDA tensor computation and isolated trainer installation passed there too.
Its 10-step probe is running; a conditional command starts an independent
10000-step quality candidate only if the probe exits zero. The original Dell
export remains frozen. Both containers and viewers bind their ports to host loopback.
