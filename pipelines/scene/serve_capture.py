"""Serve the palace locally and send selected capture media to its existing SSH trainer."""
import argparse
import base64
from concurrent.futures import ThreadPoolExecutor
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import io
import json
import os
from pathlib import Path
import secrets
import subprocess
import tarfile
import threading
import time
from urllib.parse import urlsplit
import uuid

REPO = Path(__file__).resolve().parents[2]
MAX_BYTES = 256 * 1024 * 1024
SUFFIXES = {'.jpg', '.jpeg', '.png', '.webp', '.mp4', '.mov', '.webm'}
CONTAINER = 'haasome-splat-trainer'
REMOTE = '/workspace/haasome'


class CaptureJobs:
    def __init__(self, host, root):
        self.host, self.root = host, root
        self.jobs = {}
        self.lock = threading.Lock()
        self.pool = ThreadPoolExecutor(max_workers=1)
        self.active = None

    def ssh(self, command, **kwargs):
        # Only operator-configured host and generated UUID paths enter SSH commands.
        return subprocess.run(['ssh', '-o', 'BatchMode=yes', '-o', 'ConnectTimeout=10',
                               self.host, command], check=True, **kwargs)

    def start(self, payload):
        files = payload.get('files')
        if not isinstance(files, list) or not 1 <= len(files) <= 80:
            raise ValueError('Choose 8–80 photos or one room video')
        decoded, total, video_count = [], 0, 0
        for item in files:
            suffix = Path(item['name']).suffix.lower()
            if suffix not in SUFFIXES:
                raise ValueError('Capture accepts JPEG, PNG, WebP, MP4, MOV or WebM')
            data = base64.b64decode(item['data'], validate=True)
            total += len(data)
            if not data or total > MAX_BYTES:
                raise ValueError('Capture must contain nonempty media totaling at most 256 MiB')
            video_count += suffix in ('.mp4', '.mov', '.webm')
            decoded.append((suffix, data))
        if (video_count and len(files) != 1) or (not video_count and len(files) < 8):
            raise ValueError('Choose one video or at least eight overlapping photos')
        with self.lock:
            if self.active:
                raise ValueError('A reconstruction is already running; wait for its result')
            job_id = str(uuid.uuid4())
            job = self.root / job_id
            job.mkdir(parents=True, mode=0o700)
            request = {'kind': 'captured', 'attribution': 'Presenter-selected room capture. Reconstructed with Nerfstudio; inspect orientation before freezing.'}
            with tarfile.open(job / 'input.tar', 'w') as archive:
                entries = [('request.json', json.dumps(request).encode())]
                entries += [(f'input/{i:04d}{ext}', data) for i, (ext, data) in enumerate(decoded)]
                for name, data in entries:
                    entry = tarfile.TarInfo(name); entry.size = len(data); entry.mode = 0o600
                    archive.addfile(entry, io.BytesIO(data))
            self.jobs[job_id] = {'id': job_id, 'stage': 'upload', 'events': [], 'createdAt': time.time()}
            self.active = job_id
            self.pool.submit(self.run, job_id)
            return job_id

    def update(self, job_id, event):
        with self.lock:
            state = self.jobs[job_id]
            state.update(event)
            state['events'].append(event)
            (self.root / job_id / 'status.json').write_text(json.dumps(state, indent=2))

    def run(self, job_id):
        job, remote = self.root / job_id, f'{REMOTE}/jobs/{job_id}'
        try:
            tick = time.monotonic()
            self.ssh(f'docker exec {CONTAINER} mkdir -m 700 -p {remote}')
            # Per-job helper prevents another checkout from replacing a running job's code.
            with Path(__file__).with_name('reconstruct_remote.py').open('rb') as source:
                self.ssh(f'docker exec -i {CONTAINER} tee {remote}/worker.py', stdin=source, stdout=subprocess.DEVNULL)
            with (job / 'input.tar').open('rb') as source:
                self.ssh(f'docker exec -i {CONTAINER} tar -xf - -C {remote}', stdin=source)
            self.update(job_id, {'stage':'uploaded', 'uploadSeconds':round(time.monotonic()-tick, 2)})
            args = ['ssh', '-o', 'BatchMode=yes', self.host,
                    f'docker exec {CONTAINER} {REMOTE}/venv/bin/python {remote}/worker.py {job_id}']
            with (job / 'transport.log').open('wb') as log:
                proc = subprocess.Popen(args, stdout=subprocess.PIPE, stderr=log, text=True)
                for line in proc.stdout:
                    try:
                        event = json.loads(line)
                        if isinstance(event, dict) and isinstance(event.get('stage'), str):
                            # Remote completion still needs the exported bytes transferred.
                            if event['stage'] == 'complete': event['stage'] = 'transfer'
                            self.update(job_id, event)
                    except json.JSONDecodeError:
                        pass
                code = proc.wait()
            if code:
                raise RuntimeError(self.jobs[job_id].get('error', f'Trainer connection exited {code}; inspect local transport log'))
            if self.jobs[job_id]['stage'] != 'transfer':
                raise RuntimeError('Trainer ended without an export result; inspect remote job before retrying')
            tick = time.monotonic()
            for filename in ('scene.json', 'splat.ply', 'reconstruction.json'):
                with (job / filename).open('wb') as destination:
                    self.ssh(f'docker exec {CONTAINER} cat {remote}/bundle/{filename}', stdout=destination)
            self.update(job_id, {'stage':'complete', 'transferSeconds':round(time.monotonic()-tick, 2)})
        except Exception as error:
            self.update(job_id, {'stage':'failed', 'error':str(error)})
        finally:
            with self.lock: self.active = None


class Handler(SimpleHTTPRequestHandler):
    def allowed(self):
        return self.headers.get('Host') == self.server.address

    def reply(self, status, body):
        data = json.dumps(body).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers(); self.wfile.write(data)

    def do_GET(self):
        if not self.allowed(): return self.reply(403, {'error':'Use the displayed loopback URL'})
        path = urlsplit(self.path).path
        if path == '/api/capture/session':
            return self.reply(200, {'token':self.server.token})
        if path.startswith('/api/capture/jobs/'):
            if not secrets.compare_digest(self.headers.get('X-Capture-Token', ''), self.server.token):
                return self.reply(403, {'error':'Invalid local session'})
            pieces = path.split('/')
            job_id = pieces[4]
            with self.server.jobs.lock:
                state = self.server.jobs.jobs.get(job_id)
                if not state: return self.reply(404, {'error':'Unknown job'})
                state = json.loads(json.dumps(state))
            if len(pieces) == 5: return self.reply(200, state)
            if len(pieces) == 6 and pieces[5] in ('scene.json', 'splat.ply') and state['stage'] == 'complete':
                file = self.server.jobs.root / job_id / pieces[5]
                self.send_response(200); self.send_header('Content-Type', 'application/octet-stream')
                self.send_header('Content-Length', str(file.stat().st_size)); self.end_headers()
                with file.open('rb') as source:
                    while chunk := source.read(1024*1024): self.wfile.write(chunk)
                return
            return self.reply(404, {'error':'Result not available'})
        if path.startswith('/api/'): return self.reply(404, {'error':'Unknown route'})
        super().do_GET()

    def do_POST(self):
        if (not self.allowed() or self.headers.get('Origin') != 'http://' + self.server.address or
            not secrets.compare_digest(self.headers.get('X-Capture-Token', ''), self.server.token)):
            return self.reply(403, {'error':'Invalid local session or origin'})
        if self.path != '/api/capture/jobs': return self.reply(404, {'error':'Unknown route'})
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= MAX_BYTES * 4 // 3 + 1024*1024:
                return self.reply(413, {'error':'Capture exceeds 256 MiB'})
            if self.headers.get('Content-Type') != 'application/json':
                return self.reply(415, {'error':'Expected JSON media envelope'})
            self.connection.settimeout(60)
            payload = json.loads(self.rfile.read(length))
            job_id = self.server.jobs.start(payload)
            self.reply(202, {'id':job_id})
        except (ValueError, TypeError, KeyError) as error:
            self.reply(400, {'error':str(error)})


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--host', required=True, help='Existing SSH alias for the operator-owned trainer')
    parser.add_argument('--port', type=int, default=4187)
    args = parser.parse_args()
    if not args.host or args.host.startswith('-') or any(c.isspace() for c in args.host): parser.error('Invalid SSH alias')
    os.umask(0o077)
    root = REPO / 'artifacts/capture-jobs'
    root.mkdir(parents=True, exist_ok=True)
    server = ThreadingHTTPServer(('127.0.0.1', args.port), partial(Handler, directory=str(REPO / 'apps/palace/dist')))
    server.address = f'127.0.0.1:{args.port}'
    server.token = secrets.token_urlsafe(32)
    server.jobs = CaptureJobs(args.host, root)
    print(f'Palace and private capture runner: http://{server.address}/?capture=1', flush=True)
    server.serve_forever()
