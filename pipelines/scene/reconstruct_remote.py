"""Run inside the existing project trainer; stdout is newline-delimited job events."""
import argparse
import fcntl
import hashlib
import json
import math
import os
from pathlib import Path
import signal
import shutil
import subprocess
import time
import uuid

ROOT = Path('/workspace/haasome')
BIN = ROOT / 'venv/bin'


def run_job(job_id, lock_fd, video_fps=1, iterations=10000):
    job_id = str(uuid.UUID(job_id))
    job = ROOT / 'jobs' / job_id
    source = job / 'input'
    started = time.monotonic()
    timings = {}
    os.environ.update(PYTHONUNBUFFERED='1', TORCH_CUDA_ARCH_LIST='12.0', MAX_JOBS='8',
                      OMP_NUM_THREADS='8', QT_QPA_PLATFORM='offscreen')

    def event(stage, **fields):
        print(json.dumps(dict(stage=stage, elapsedSeconds=round(time.monotonic()-started, 2), **fields)), flush=True)

    def command(stage, args, timeout=600, extra_env=None):
        event(stage)
        tick = time.monotonic()
        # A separate process group lets the time budget stop only this job's descendants.
        with (job / (stage + '.log')).open('wb') as log:
            proc = subprocess.Popen([str(a) for a in args], stdout=log, stderr=subprocess.STDOUT,
                                    start_new_session=True, pass_fds=(lock_fd,), env=dict(os.environ, **(extra_env or {})))
            try:
                code = proc.wait(timeout=min(timeout, max(1, 1500-(time.monotonic()-started))))
            except subprocess.TimeoutExpired:
                os.killpg(proc.pid, signal.SIGTERM)
                try:
                    proc.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    os.killpg(proc.pid, signal.SIGKILL)
                    proc.wait()
                raise RuntimeError(f'{stage} exceeded its time budget')
        timings[stage] = round(time.monotonic()-tick, 2)
        if code:
            raise RuntimeError(f'{stage} failed (exit {code}); inspect {stage}.log')
        event(stage + '-complete', seconds=timings[stage])

    try:
        metadata = json.loads((job / 'request.json').read_text())
        if metadata['kind'] not in ('captured', 'licensed-sample'):
            raise ValueError('Unsupported provenance')
        files = sorted(source.iterdir())
        if not files or any(not p.is_file() or p.is_symlink() for p in files):
            raise ValueError('Input must contain regular selected media files')
        images = job / 'frames'
        images.mkdir()
        videos = [p for p in files if p.suffix.lower() in ('.mp4', '.mov', '.webm')]
        if videos:
            if len(files) != 1:
                raise ValueError('Choose one video or a batch of photos')
            command('extract-frames', ['ffmpeg', '-nostdin', '-v', 'error', '-i', videos[0],
                    # The feature matcher registered this low-resolution capture
                    # only at this scale. Training pixels are restored below.
                    '-t', '120', '-vf', f'fps={video_fps},scale=1600:1600:force_original_aspect_ratio=decrease',
                    '-frames:v', '80', images / 'frame-%04d.jpg'], 120)
        else:
            from PIL import Image, ImageOps
            if not 8 <= len(files) <= 80:
                raise ValueError('Select 8–80 overlapping room photographs')
            for i, path in enumerate(files):
                with Image.open(path) as image:
                    image = ImageOps.exif_transpose(image).convert('RGB')
                    image.thumbnail((1600, 1600))
                    image.save(images / f'frame-{i:04d}.jpg', quality=92)
        count = len(list(images.glob('*.jpg')))
        if count < 8:
            raise ValueError('Capture needs at least eight usable views')
        event('validated', images=count)
        processed = job / 'processed'
        command('registration', [BIN / 'ns-process-data', 'images', '--data', images,
                '--output-dir', processed, '--matching-method', 'sequential' if videos else 'exhaustive',
                '--num-downscales', '0', '--no-gpu', '--no-use-sfm-depth', '--verbose'], 900)
        transforms = json.loads((processed / 'transforms.json').read_text())
        registered = len(transforms['frames'])
        if registered < max(8, math.ceil(count * .6)):
            raise ValueError(f'Only {registered}/{count} views registered; capture more overlap and textured surfaces')
        event('registered', registered=registered, images=count)
        registration_size = [transforms.get('w'), transforms.get('h')]
        if videos:
            from PIL import Image
            native = job / 'native-frames'
            native.mkdir()
            command('native-training-frames', ['ffmpeg', '-nostdin', '-v', 'error', '-i', videos[0],
                    '-t', '120', '-vf', f"fps={video_fps},scale=w='min(1600,iw)':h='min(1600,ih)':force_original_aspect_ratio=decrease",
                    '-frames:v', '80', native / 'frame_%05d.jpg'], 120)
            native_files = sorted(native.glob('*.jpg'))
            expected = {p.name for p in (processed / 'images').glob('*.jpg')}
            if {p.name for p in native_files} != expected:
                raise RuntimeError('Native frames do not match registered image sequence')
            with Image.open(native_files[0]) as image:
                width, height = image.size
            sx, sy = width / transforms['w'], height / transforms['h']
            for key in ('fl_x', 'cx'):
                transforms[key] *= sx
            for key in ('fl_y', 'cy'):
                transforms[key] *= sy
            transforms.update(w=width, h=height)
            for path in native_files:
                shutil.copyfile(path, processed / 'images' / path.name)
            (processed / 'transforms.json').write_text(json.dumps(transforms, indent=2))
        output = job / 'outputs'
        common = [BIN / 'ns-train', 'splatfacto', '--vis', 'tensorboard', '--output-dir', output]
        parser = ['nerfstudio-data', '--data', processed, '--downscale-factor', '1']
        command('probe', common + ['--experiment-name', 'probe', '--max-num-iterations', '10'] + parser, 180)
        command('training', common + ['--experiment-name', 'room', '--max-num-iterations', str(iterations)] + parser, 600)
        configs = list((output / 'room/splatfacto').glob('*/config.yml'))
        if len(configs) != 1:
            raise RuntimeError('Expected one training result')
        bundle = job / 'bundle'
        command('export', [BIN / 'ns-export', 'gaussian-splat', '--load-config', configs[0],
                '--output-dir', bundle], 120, {'TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD': '1'})
        # dataparser transforms include the input's applied_transform. Convert the
        # first original camera back before applying that combined transform.
        import numpy as np
        parsed = json.loads((configs[0].parent / 'dataparser_transforms.json').read_text())
        matrix = np.eye(4); matrix[:3] = parsed['transform']
        applied = np.eye(4); applied[:3] = transforms.get('applied_transform', np.eye(4)[:3])
        camera = matrix @ np.linalg.inv(applied) @ np.array(transforms['frames'][0]['transform_matrix'])
        eye = camera[:3, 3] * parsed['scale']
        target = eye - camera[:3, 2] * .5
        to_y_up = lambda v: [float(v[0]), float(v[2]), float(-v[1])]
        scene = dict(schemaVersion=0, id='capture-' + job_id, asset='splat.ply', format='ply',
                     provenance=dict(kind=metadata['kind'], attribution=metadata['attribution']),
                     transform=dict(position=[0, 0, 0], rotation=[-math.sqrt(.5), 0, 0, math.sqrt(.5)], scale=1),
                     camera=dict(position=to_y_up(eye), target=to_y_up(target)))
        (bundle / 'scene.json').write_text(json.dumps(scene, indent=2))
        report = dict(images=count, registered=registered, timings=timings,
                      iterations=iterations, videoFps=video_fps if videos else None,
                      registrationSize=registration_size,
                      trainingSize=[transforms.get('w'), transforms.get('h')],
                      sourceInputs=[dict(file=p.name, sha256=hashlib.sha256(p.read_bytes()).hexdigest())
                                    for p in files],
                      frameSampling='ffmpeg fps filter; numbered in output order; not original video frame indices' if videos else None,
                      sourceFrames=[dict(file=frame['file_path'],
                          sha256=hashlib.sha256((processed / frame['file_path']).read_bytes()).hexdigest(),
                          transform=frame['transform_matrix']) for frame in transforms['frames']],
                      dataparserTransform=parsed,
                      bytes=(bundle / 'splat.ply').stat().st_size,
                      orientation='Nerfstudio estimated up; requires viewer inspection')
        (bundle / 'reconstruction.json').write_text(json.dumps(report, indent=2))
        event('complete', **report)
    except Exception as error:
        event('failed', error=str(error))
        return 1
    return 0


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('job_id')
    parser.add_argument('--video-fps', type=int, choices=(1, 2, 3, 4), default=1,
                        help='Bounded video sampling comparison; still at most 80 frames')
    parser.add_argument('--iterations', type=int, choices=(3000, 10000), default=10000)
    args = parser.parse_args()
    # Container-wide admission survives local server restarts and disconnected SSH.
    # Child commands inherit the descriptor so an interrupted coordinator cannot
    # release admission while its immediate trainer process still runs.
    with (ROOT / 'capture.lock').open('a') as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            print(json.dumps({'stage':'failed', 'error':'Another capture job is active on this trainer'}), flush=True)
            raise SystemExit(1)
        raise SystemExit(run_job(args.job_id, lock.fileno(), args.video_fps, args.iterations))
