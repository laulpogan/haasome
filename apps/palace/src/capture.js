// The optional local runner serves this same app and forwards selected files over SSH.
export function mountCapture({importFiles, requireEditable, sceneReady}) {
  if (new URLSearchParams(location.search).get('capture') !== '1') return;
  const panel = document.createElement('details'); panel.id = 'capture-room';
  panel.innerHTML = `<summary>Reconstruct a room capture</summary><form>
    <p>Choose 8–80 overlapping room photos or one slow room video. Selected files go to your private trainer. Maximum 256 MiB; up to 80 video frames. Unrelated memories belong in “Add photo or video memory.”</p>
    <input id="capture-files" aria-label="Room capture files" type="file" multiple accept=".jpg,.jpeg,.png,.webp,.mp4,.mov,.webm" required>
    <button id="capture-start">Send capture and reconstruct</button></form>
    <output id="capture-status" role="status">Ready for a deliberate room capture. Registration can fail.</output>
    <button id="capture-import" hidden>Use reconstructed room</button>`;
  document.querySelector('aside').prepend(panel);
  document.querySelector('#notice').textContent = 'Memory files stay local. Reconstruction sends only selected room captures to your private trainer.';
  const form = panel.querySelector('form'), status = panel.querySelector('output');
  const use = panel.querySelector('#capture-import');
  let token, jobId;
  const request = async (path, options = {}) => {
    const result = await fetch('/api/capture/' + path, {...options, headers:{'X-Capture-Token':token, ...options.headers}});
    if (!result.ok) throw new Error((await result.json()).error || `Request failed (${result.status})`);
    return result;
  };
  form.onsubmit = async event => {
    event.preventDefault();
    try {
      requireEditable();
      const files = [...panel.querySelector('input').files];
      if (files.reduce((total, file) => total + file.size, 0) > 256*1024*1024) throw new Error('Choose at most 256 MiB of capture media.');
      for (const control of form.elements) control.disabled = true;
      use.hidden = true; status.textContent = 'Preparing selected files…';
      const envelope = [];
      for (const file of files) {
        const data = await new Promise((resolve,reject) => {
          const reader = new FileReader(); reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = () => reject(new Error('Could not read selected file')); reader.readAsDataURL(file);
        });
        envelope.push({name:file.name, data});
      }
      token = (await (await fetch('/api/capture/session')).json()).token;
      status.textContent = 'Uploading selected capture…';
      jobId = (await (await request('jobs', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({files:envelope})})).json()).id;
      localStorage.setItem('haasome-capture-job', jobId);
      await follow();
    } catch (error) { status.textContent = `Capture stopped: ${error.message}`; }
    finally { for (const control of form.elements) control.disabled = false; }
  };
  async function follow() {
    for (;;) {
      const state = await (await request('jobs/' + jobId)).json();
      status.textContent = `${state.stage}${state.registered ? ` · ${state.registered}/${state.images} views registered` : ''}${state.elapsedSeconds !== undefined ? ` · ${state.elapsedSeconds}s remote elapsed` : ''}`;
      if (state.stage === 'failed') throw new Error(state.error);
      if (state.stage === 'complete') {
        status.textContent += ' · Ready to inspect. Check orientation and reposition memories after changing rooms.';
        use.hidden = false; return;
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  use.onclick = async () => {
    try {
      requireEditable(); use.disabled = true; status.textContent = 'Loading reconstructed room…';
      const files = [];
      for (const name of ['scene.json', 'splat.ply']) files.push(new File([await (await request(`jobs/${jobId}/${name}`)).blob()],name));
      requireEditable(); await importFiles(files);
      if (!sceneReady()) throw new Error('The exported scene could not render. See the viewer error; this room is not ready.');
      status.textContent = 'Room imported. Inspect the view and place memories on recognizable objects before freezing.';
    } catch (error) { status.textContent = `Import stopped: ${error.message}`; }
    finally { use.disabled = false; }
  };
  // Refresh resumes observation of this server's known job; it never starts another.
  const saved = localStorage.getItem('haasome-capture-job');
  if (saved) (async () => {
    try {
      token = (await (await fetch('/api/capture/session')).json()).token; jobId = saved;
      for (const control of form.elements) control.disabled = true;
      await follow();
    } catch (error) { status.textContent = `Previous job: ${error.message}. Inspect the trainer before starting another.`; }
    finally { for (const control of form.elements) control.disabled = false; }
  })();
}
