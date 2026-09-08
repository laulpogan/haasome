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
compilation and complete training are separate gates.

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

These controls are source-verified, not yet live-verified. Viewport crop changes
the displayed region; it does not change the training dataset or delete splats.
Save UI evidence outside Git. Transfer the resulting Gaussian PLY with scene.json
and attribution, then load that exact bundle through the palace's existing import.
