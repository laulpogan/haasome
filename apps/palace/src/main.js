import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SparkRenderer, SplatMesh, SplatFileType } from '@sparkjsdev/spark';
import { assetPath, validateScene, validateMemories, validatePalace, defaultAnchors, completeAnchors, resolveAsset } from './contract.js';
import { freezeCapsule, unpackCapsule } from './capsule.js';
import { saveLocal, loadLocal } from './storage.js';
import './style.css';

const $ = (id) => document.getElementById(id);
const node = (tag, content, className) => { const el = document.createElement(tag); if (content != null) el.textContent = content; if (className) el.className = className; return el; };
const button = (label, action) => { const b = node('button',label); b.onclick = action; return b; };
const notice = (message) => { $('notice').textContent = message; };
let palace = {schemaVersion:0,scene:null,anchors:defaultAnchors(),memories:[]};
let assets = new Map(), selected = palace.anchors[0].id, activeMemory = null, recall = null;
let renderer, controls, mesh, loadGeneration = 0;
let mediaUrls = [], pins = [], sceneReady = false;
const world = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60,1,0.01,10000);
const room = $('room');
try {
  renderer = new THREE.WebGLRenderer({antialias:false});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.setClearColor('#211b16');
  $('canvas').append(renderer.domElement);
  world.add(new SparkRenderer({renderer}));
  controls = new OrbitControls(camera,renderer.domElement);
  controls.enableDamping = false;
  controls.minDistance = 0.05;
  const resize = () => { camera.aspect = room.clientWidth / room.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(room.clientWidth,room.clientHeight); };
  new ResizeObserver(resize).observe(room); resize();
  renderer.setAnimationLoop(() => {
    controls.update(); renderer.render(world,camera);
    for (const {anchor,el} of pins) {
      const p = new THREE.Vector3(...anchor.position).project(camera);
      el.hidden = !sceneReady || p.z < -1 || p.z > 1 || Math.abs(p.x)>1 || Math.abs(p.y)>1;
      el.style.left = `${(p.x+1)*room.clientWidth/2}px`; el.style.top = `${(1-p.y)*room.clientHeight/2}px`;
    }
  });
} catch (error) { notice(`WebGL renderer unavailable: ${error.message}. Try a browser with WebGL2 enabled.`); }
function home() {
  const pose = palace.scene?.camera || {position:[0,1.6,4],target:[0,1,0]};
  camera.position.fromArray(pose.position); controls?.target.fromArray(pose.target); controls?.update();
}
function selectAnchor(id) {
  selected = id; activeMemory = null;
  const anchor = palace.anchors.find(a => a.id === id);
  if (sceneReady && controls) {
    const offset = camera.position.clone().sub(controls.target);
    controls.target.fromArray(anchor.position); camera.position.copy(controls.target).add(offset); controls.update();
  }
  if (recall && anchor.memoryIds.includes(recall.memoryId)) recall.visited = true;
  renderUI();
}
function missing(message) { return node('p',message,'missing'); }
function showAsset(parent,path,kind,alt) {
  const blob = resolveAsset(assets,path);
  if (!blob) { parent.append(missing(`Missing asset: ${path}. Reimport its bundle folder.`)); return; }
  const url = URL.createObjectURL(blob); mediaUrls.push(url);
  const el = node(kind === 'video' ? 'video' : 'img'); el.src = url;
  if (kind === 'video') { el.controls = true; el.preload = 'metadata'; el.setAttribute('aria-label',alt); } else el.alt = alt;
  el.onerror = () => { el.replaceWith(missing(`Cannot display ${path}. Check the media format.`)); };
  parent.append(el);
}
const frozen = () => Boolean(palace.capsule?.frozenAt);
function requireEditable() {
  if (frozen()) throw new Error('Frozen capsule is read-only. Make editable copy first.');
}
function renderUI() {
  $('capsule-title').value = palace.capsule?.title || 'A moment to keep';
  $('capsule-title').disabled = frozen();
  $('capsule-status').textContent = frozen() ? `Frozen ${palace.capsule.frozenAt} · Read-only snapshot` : 'Editable draft';
  $('editable').hidden = !frozen();
  $('empty-import').disabled = frozen();
  $('placement').querySelector('summary').textContent = frozen() ? 'Place coordinates (read-only)' : 'Edit this place';
  $('empty').querySelector('small').textContent = frozen() ? 'No scene is loaded. This snapshot is read-only.' : 'No scene is loaded. Anchor positions are editable starting points.';
  $('freeze').textContent = frozen() ? 'Download frozen capsule' : 'Freeze capsule';
  for (const el of $('place-form').elements) el.disabled = frozen();
  for (const url of mediaUrls) URL.revokeObjectURL(url); mediaUrls = [];
  $('places').replaceChildren(); $('pins').replaceChildren(); pins = [];
  palace.anchors.forEach((a,i) => {
    const b = button(a.label,() => selectAnchor(a.id)); b.setAttribute('aria-pressed',String(a.id === selected));
    b.append(node('span',`${a.memoryIds.length} ${a.memoryIds.length === 1 ? 'memory' : 'memories'}`)); $('places').append(b);
    const pin = button('✦',() => selectAnchor(a.id)); pin.className = 'pin'; pin.setAttribute('aria-label',`Visit ${a.label}`); pin.setAttribute('aria-pressed',String(a.id === selected)); pin.hidden = true;
    $('pins').append(pin); pins.push({anchor:a,el:pin});
  });
  const a = palace.anchors.find(x => x.id === selected) || palace.anchors[0]; selected = a.id;
  $('place-label').value = a.label; ['x','y','z'].forEach((key,i) => { $(key).value = a.position[i]; });
  const card = $('card'); card.replaceChildren();
  $('recall').disabled = !palace.memories.some(m => palace.anchors.some(x => x.memoryIds.includes(m.id)));
  $('cue').replaceChildren(); $('cue').hidden = !recall;
  if (recall) {
    const m = palace.memories.find(x => x.id === recall.memoryId);
    $('cue').append(node('small','Recall cue'),node('p',m.cue),node('small',recall.visited ? 'Place visited. Reveal when you are ready.' : 'Visit the place that holds this memory.'),button('End recall',() => { recall = null; renderUI(); }));
    if (!recall.revealed) {
      card.append(node('h2',a.label),node('p','Keep the detail in mind. Find its place, then reveal the source.'));
      const reveal = button('Reveal memory & source',() => { recall.revealed = true; activeMemory = recall.memoryId; renderUI(); }); reveal.disabled = !recall.visited || !a.memoryIds.includes(recall.memoryId); card.append(reveal); return;
    }
  }
  const memories = a.memoryIds.map(id => palace.memories.find(m => m.id === id));
  if (!memories.length) { card.append(node('h2',a.label),node('p', frozen() ? 'No memory was saved at this place. Visit another place to recall its story.' : 'A place waiting for a story. Select this place, then import memories.json and its evidence files.'),node('small', frozen() ? 'Make an editable copy to add memories or change places.' : 'Five places are starting points. Rename and position them on objects in your room.')); return; }
  const m = memories.find(x => x.id === activeMemory) || memories[0]; activeMemory = m.id;
  if (memories.length > 1) {
    const picker = node('select'); picker.className = 'memory-picker'; picker.setAttribute('aria-label','Memory at this place');
    memories.forEach(x => { const option = node('option',x.title); option.value = x.id; picker.append(option); }); picker.value = m.id; picker.onchange = () => { activeMemory = picker.value; renderUI(); }; card.append(picker);
  }
  card.append(node('small',a.label),node('h2',m.title),node('p',m.body,'body'));
  for (const media of m.media) showAsset(card,media.asset,media.kind,media.alt);
  const source = node('section',null,'source');
  const kind = {fixture:'Fixture — synthetic content',manual:'Manual import', 'computer-use':'Computer-use record — capture claimed by producer'}[m.source.kind];
  source.append(node('strong',kind),node('p',m.source.app),node('p',m.source.locator),node('p',`Source captured: ${m.source.capturedAt}`));
  if (m.source.evidenceAsset) {
    source.append(node('p', resolveAsset(assets,m.source.evidenceAsset) ? 'Saved evidence supplied — source truth not independently verified.' : 'Evidence referenced but missing.'));
    const blob = resolveAsset(assets,m.source.evidenceAsset);
    if (!blob || blob.type.startsWith('image/') || /\.(png|jpe?g|webp|gif)$/i.test(m.source.evidenceAsset)) showAsset(source,m.source.evidenceAsset,'image','Source evidence');
    else {
      const link = node('a','Download saved evidence');
      const url = URL.createObjectURL(blob); mediaUrls.push(url); link.href = url; link.download = m.source.evidenceAsset.split('/').pop(); source.append(link);
    }
  }
  else source.append(node('p','No source evidence supplied.'));
  card.append(source);
  const label = node('label','Move memory to'); const picker = node('select'); picker.setAttribute('aria-label','Move memory to');
  palace.anchors.forEach(x => { const option = node('option',x.label); option.value = x.id; picker.append(option); }); picker.value = a.id;
  picker.disabled = frozen();
  picker.onchange = () => {
    if (frozen()) return;
    for (const anchor of palace.anchors) anchor.memoryIds = anchor.memoryIds.filter(id => id !== m.id);
    palace.anchors.find(x => x.id === picker.value).memoryIds.push(m.id); selectAnchor(picker.value); notice('Placement updated. Save on this device to keep it.');
  }; label.append(picker); card.append(label);
}
async function loadScene() {
  const generation = ++loadGeneration; sceneReady = false;
  if (mesh) { world.remove(mesh); mesh.dispose(); mesh = null; }
  $('empty').hidden = false; $('render-status').textContent = 'Waiting for a scene';
  home();
  const s = palace.scene;
  $('scene-kind').textContent = s ? {generated:'Generated setting — not a captured place',captured:'Captured room', 'licensed-sample':'Licensed sample — not your room', fixture:'Fixture — not a captured room'}[s.provenance.kind] : 'No room imported';
  $('scene-title').textContent = s ? 'Memory palace' : 'Give a memory a place.';
  $('scene-id').textContent = s ? `Scene ID: ${s.id}` : '';
  $('attribution').textContent = s?.provenance.attribution || 'Choose a room bundle to begin.';
  if (!s) return;
  const file = resolveAsset(assets,s.asset);
  if (!file) { $('render-status').textContent = `Missing scene asset: ${s.asset}`; notice(`Missing scene asset: ${s.asset}. Open the bundle folder to reconnect it.`); return; }
  if (!renderer) { $('render-status').textContent = 'WebGL2 unavailable'; return; }
  $('empty').hidden = true; $('render-status').textContent = 'Loading Gaussian splats…';
  const start = performance.now();
  let candidate;
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (generation !== loadGeneration) return;
    candidate = new SplatMesh({fileBytes:bytes,fileName:s.asset,fileType:s.format === 'sog' ? SplatFileType.PCSOGSZIP : s.format});
    await candidate.initialized;
    if (generation !== loadGeneration) { candidate.dispose(); return; }
    candidate.position.fromArray(s.transform.position); candidate.quaternion.fromArray(s.transform.rotation); candidate.scale.setScalar(s.transform.scale);
    mesh = candidate; world.add(mesh); sceneReady = true; $('empty').hidden = true;
    $('render-status').textContent = `Gaussian splats loaded · ${((performance.now()-start)/1000).toFixed(2)}s`;
  } catch (error) {
    candidate?.dispose(); if (generation !== loadGeneration) return;
    $('empty').hidden = false; $('render-status').textContent = 'Scene could not load'; notice(`Scene could not load: ${error.message}. SOG must be a ZIP-packaged .sog, not meta.json alone.`);
  }
}
async function importFiles(files) {
  if (!files.length) return;
  const nextAssets = new Map(assets), documents = [];
  for (const file of files) {
    // A directory picker includes its selected root name. Paths below it are the bundle contract.
    const path = file.webkitRelativePath ? file.webkitRelativePath.split('/').slice(1).join('/') : file.name;
    assetPath(path);
    nextAssets.set(path,file);
    if (file.name.endsWith('.json')) {
      const value = JSON.parse(await file.text());
      if (Array.isArray(value) || value?.capsuleVersion !== undefined || value?.schemaVersion !== undefined || (value?.asset && value?.camera)) documents.push(value);
    }
  }
  const capsules = documents.filter(x => x?.capsuleVersion !== undefined);
  if (capsules.length) {
    if (files.length !== 1 || capsules.length !== 1) throw new Error('Import one capsule container by itself.');
    const container = capsules[0];
    const importedAssets = unpackCapsule(container);
    palace = structuredClone(container.palace); assets = importedAssets;
    selected = palace.anchors[0].id; activeMemory = null; recall = null;
    renderUI(); await loadScene(); notice('Capsule reopened with its saved assets.'); return;
  }
  requireEditable();
  let next = structuredClone(palace);
  // Full palace establishes assembly; scene and memory handoffs can then augment it.
  const full = documents.filter(x => !Array.isArray(x) && x.schemaVersion !== undefined && 'scene' in x);
  if (full.length > 1) throw new Error('Select only one full palace JSON at a time.');
  if (full.length) {
    next = validatePalace(full[0]);
    if (next.capsule?.frozenAt) throw new Error('Reopen frozen snapshots using their portable capsule container.');
    next = completeAnchors(next);
  }
  const scenes = documents.filter(x => !Array.isArray(x) && x.asset && x.camera);
  if (scenes.length > 1) throw new Error('Select only one scene.json at a time.');
  if (scenes.length) {
    const firstScene = !next.scene; next.scene = validateScene(scenes[0]);
    if (firstScene) { const distance = Math.hypot(...next.scene.camera.position.map((v,i) => v-next.scene.camera.target[i])); const placed = defaultAnchors(next.scene.camera.target, distance * 0.2); next.anchors.forEach((a,i) => { a.position = placed[i].position; }); }
  }
  const anchor = (full.length ? next.anchors[0] : next.anchors.find(a => a.id === selected)) || next.anchors[0];
  for (const list of documents.filter(Array.isArray)) {
    validateMemories(list);
    for (const m of list) {
      const index = next.memories.findIndex(x => x.id === m.id);
      if (index >= 0) next.memories[index] = m; else next.memories.push(m);
      if (!next.anchors.some(a => a.memoryIds.includes(m.id))) anchor.memoryIds.push(m.id);
    }
  }
  validatePalace(next);
  const sceneChanged = JSON.stringify(palace.scene) !== JSON.stringify(next.scene) || (next.scene && resolveAsset(assets,next.scene.asset) !== resolveAsset(nextAssets,next.scene.asset));
  palace = next; assets = nextAssets; selected = anchor.id; activeMemory = null; recall = null;
  renderUI(); notice(`Imported ${files.length} files. ${palace.memories.length} memories. Save on this device to keep this bundle.`);
  if (sceneChanged) await loadScene();
}
for (const [trigger,input] of [['folder','folder-input'],['empty-import','folder-input'],['files','file-input']]) $(trigger).onclick = () => $(input).click();
for (const id of ['folder-input','file-input']) $(id).onchange = async (event) => {
  try { await importFiles([...event.target.files]); } catch (error) { notice(`Import rejected: ${error.message}`); } finally { event.target.value = ''; }
};
$('home').onclick = home;
$('place-form').onsubmit = (event) => {
  event.preventDefault(); if (frozen()) return; const position = ['x','y','z'].map(key => Number($(key).value));
  const label = $('place-label').value.trim(); if (!label || !position.every(Number.isFinite)) return;
  const a = palace.anchors.find(x => x.id === selected); a.label = label; a.position = position; renderUI(); notice('Place updated. Save on this device to keep it.');
};
$('recall').onclick = () => {
  const m = palace.memories.find(x => palace.anchors.find(a => a.id === selected)?.memoryIds.includes(x.id)) || palace.memories.find(x => palace.anchors.some(a => a.memoryIds.includes(x.id)));
  if (!m) return;
  recall = {memoryId:m.id,visited:false,revealed:false};
  selected = palace.anchors.find(a => !a.memoryIds.includes(m.id))?.id || selected;
  home(); renderUI();
};
$('save').onclick = async () => {
  $('save').disabled = true;
  try { validatePalace(palace); await saveLocal(palace,assets); notice('Saved on this device, including selected assets. Reload to revisit. Browser data clearing removes this copy.'); }
  catch (error) { notice(`Save failed: ${error.message}. Export JSON and retain the original bundle files.`); }
  finally { $('save').disabled = false; }
};
$('export').onclick = () => {
  if (frozen()) { $('freeze').onclick(); return; }
  const url = URL.createObjectURL(new Blob([JSON.stringify(palace,null,2)],{type:'application/json'}));
  const link = node('a'); link.href = url; link.download = 'palace.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url),1000);
  notice('Exported palace.json. Keep it beside the original assets; JSON does not contain media.');
};
function downloadJSON(value, name) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value)],{type:'application/json'}));
  const link = node('a'); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url),1000);
}
$('capsule-title').onchange = () => {
  if (frozen()) return;
  palace.capsule = {id:palace.capsule?.id || crypto.randomUUID(), title:$('capsule-title').value.trim() || 'A moment to keep'};
  renderUI();
};
$('freeze').onclick = async () => {
  $('freeze').disabled = true;
  try {
    const current = palace, currentAssets = assets, before = JSON.stringify(palace);
    const container = await freezeCapsule(current,currentAssets,$('capsule-title').value);
    if (palace !== current || assets !== currentAssets || JSON.stringify(palace) !== before) throw new Error('Palace changed during freeze. Try again.');
    downloadJSON(container,`capsule-${container.palace.capsule.id}-${crypto.randomUUID()}.json`);
    palace = container.palace; renderUI(); notice('Frozen capsule downloaded with referenced assets. Keep this snapshot file; edits require a new copy.');
  } catch (error) { notice(`Freeze failed: ${error.message}`); }
  finally { $('freeze').disabled = false; }
};
$('editable').onclick = () => {
  if (!frozen()) return;
  palace = structuredClone(palace);
  palace.capsule = {id:crypto.randomUUID(),title:palace.capsule.title};
  renderUI(); notice('Editable copy created. The downloaded snapshot remains unchanged. Save or freeze this copy separately.');
};
try {
  const stored = await loadLocal();
  if (stored) { palace = validatePalace(stored.palace); if (!frozen()) completeAnchors(palace); assets = new Map(stored.assets); selected = palace.anchors[0].id; notice('Restored the saved palace and its local assets.'); }
} catch (error) { notice(`Saved palace unavailable: ${error.message}. Reimport your bundle.`); }
renderUI(); await loadScene();
