import * as THREE from 'three';
const vector = v => Array.isArray(v) && v.length === 3 && v.every(Number.isFinite);
const text = v => typeof v === 'string' && Boolean(v.trim());
export function validateObjectMemory(sidecar, palace) {
  if (sidecar === undefined) return;
  if (sidecar?.version !== 1 || !Array.isArray(sidecar.objects) || sidecar.objects.length > 100) throw new Error('Invalid object-memory sidecar.');
  const ids = new Set();
  for (const o of sidecar.objects) {
    if (!text(o.id) || ids.has(o.id) || !text(o.label)) throw new Error('Object IDs must be unique; labels must be nonempty.');
    ids.add(o.id);
    const b = o.binding;
    if (!text(b?.sceneId) || typeof b.assetHash !== 'string' || b.assetHash.length !== 64 || [...b.assetHash].some(c => !'0123456789abcdef'.includes(c))) throw new Error('Object requires an exact scene hash.');
    if (!Array.isArray(b.samples) || b.samples.length < 5 || b.samples.length > 256 || !b.samples.every(vector) || !Number.isFinite(b.tolerance) || b.tolerance <= 0) throw new Error('Object requires a supported geometry region.');
    if (!['proposed','confirmed','rejected'].includes(o.status) || !Array.isArray(o.observations) || !o.observations.length) throw new Error('Object status and observations required.');
    for (const obs of o.observations) if (obs.kind !== 'manual-surface' || !vector(obs.cameraPosition) || !vector(obs.cameraTarget) || !text(obs.at)) throw new Error('Invalid manual surface observation.');
    if (!Array.isArray(o.links) || o.links.some(l => !palace.memories.some(m => m.id === l.memoryId) || !text(l.reason) || l.kind !== 'user-association')) throw new Error('Invalid object memory link.');
    if (!Array.isArray(o.corrections) || o.corrections.some(c => !text(c.at) || !text(c.label))) throw new Error('Invalid object correction history.');
  }
}
export const bindingCurrent = (object, scene, hash) => Boolean(scene && hash && object.binding.sceneId === scene.id && object.binding.assetHash === hash);
export function findObjects(objects, memories, query) {
  const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return objects.filter(o => o.status !== 'rejected' && terms.every(t => [o.label,...o.links.flatMap(l => {
    const m = memories.find(m => m.id === l.memoryId); return m ? [m.title,m.body,m.cue,l.reason] : [l.reason];
  })].join(' ').toLocaleLowerCase().includes(t)));
}
// Only raycast hits are stored, in mesh-local coordinates. No Gaussian indices.
export function sampleRegion(mesh, camera, ndc, viewportHeight) {
  mesh.updateWorldMatrix(true,false); camera.updateMatrixWorld();
  const ray = new THREE.Raycaster();
  const hit = p => { ray.setFromCamera(p,camera); return ray.intersectObject(mesh,false)[0]; };
  const center = hit(ndc);
  if (!center) throw new Error('Background miss. Choose a visible solid surface.');
  const scale = mesh.getWorldScale(new THREE.Vector3()).x;
  const radius = 2 * center.distance * Math.tan(THREE.MathUtils.degToRad(camera.fov/2)) * 28 / viewportHeight;
  const samples = [];
  for (const y of [-1,0,1]) for (const x of [-1,0,1]) {
    const h = hit(new THREE.Vector2(ndc.x+x*24/viewportHeight/camera.aspect,ndc.y+y*24/viewportHeight));
    if (h && h.point.distanceTo(center.point) < radius) samples.push(mesh.worldToLocal(h.point.clone()).toArray());
  }
  if (samples.length < 5) throw new Error('Not enough nearby surface support. Choose a solid area away from edges or moving people.');
  return {samples,tolerance:radius/scale/2};
}
export function mountObjectMemory({getPalace,getMesh,getHash,camera,controls,canvas,notice,requireEditable,openMemory}) {
  const panel = document.createElement('section'); panel.id = 'object-memory';
  panel.innerHTML = '<h2>Objects in this room</h2><p class="object-boundary">Manual surface selection · automatic recognition pending</p><label>Find object or memory<input id="object-query" type="search" placeholder="Object, story or cue"></label><button id="pick-object">Select surface region</button><p id="object-instruction">Click a saved region to open its memories.</p><div id="object-list"></div><div id="object-detail"></div>';
  document.querySelector('aside').prepend(panel);
  const $ = id => panel.querySelector(`#${id}`);
  const el = (tag,content) => { const n=document.createElement(tag); n.textContent=content; return n; };
  const button = (label,action) => { const n=el('button',label); n.onclick=() => {try {action();} catch(e) {notice(e.message);}}; return n; };
  const overlay = document.createElementNS('http://www.w3.org/2000/svg','svg'); overlay.id='object-highlight'; overlay.setAttribute('aria-label','Selected geometry region'); canvas.parentElement.append(overlay);
  let chosen = null, picking = false, down = null, lastCamera = '', lastPaint = 0;
  const objects = () => getPalace().objectMemory?.objects || [];
  const current = o => bindingCurrent(o,getPalace().scene,getHash());
  const editable = () => !getPalace().capsule?.frozenAt;
  const select = o => { chosen=o.id; refresh(); if(o.links[0]) openMemory(o.links[0].memoryId); };
  const mutate = action => { requireEditable(); action(); refresh(); };
  function refresh() {
    const p=getPalace();
    $('pick-object').disabled = !editable() || !getMesh() || !getHash();
    if (!editable()) picking=false;
    $('pick-object').setAttribute('aria-pressed',String(picking));
    $('object-list').replaceChildren(); $('object-detail').replaceChildren(); overlay.replaceChildren(); lastCamera='';
    for (const o of findObjects(objects(),p.memories,$('object-query').value)) {
      const b=button(`${o.label} · ${current(o) ? o.status : 'stale — rebind required'}`,()=>select(o));
      b.setAttribute('aria-pressed',String(o.id===chosen)); $('object-list').append(b);
    }
    const o=objects().find(o=>o.id===chosen); if(!o) return;
    const detail=$('object-detail');
    detail.append(el('h3',o.label),el('p',current(o) ? `${o.binding.samples.length} geometry samples · ${o.status} · manual selection` : 'Scene changed. Binding is stale; hidden from geometry selection. Select a new surface to create a replacement.'));
    const name=el('input',''); name.value=o.label; name.setAttribute('aria-label','Object name'); name.disabled=!editable();
    const rename=button('Rename object',()=>mutate(()=>{if(!name.value.trim()) throw new Error('Enter an object name.'); o.corrections.push({at:new Date().toISOString(),label:name.value.trim()});o.label=name.value.trim();})); rename.disabled=!editable();
    const confirm=button('Confirm region',()=>mutate(()=>{if(!current(o)) throw new Error('Stale region requires rebinding.');o.status='confirmed';}));confirm.disabled=!editable()||!current(o);
    const reject=button('Reject region',()=>mutate(()=>{o.status='rejected';chosen=null;}));reject.disabled=!editable();
    detail.append(name,rename,confirm,reject);
    for(const link of o.links) {
      const m=p.memories.find(m=>m.id===link.memoryId);
      detail.append(button(m.title,()=>openMemory(m.id)),el('small',`Your association: ${link.reason}. This does not establish where the event happened.`));
    }
    const picker=el('select','');picker.setAttribute('aria-label','Memory to attach');
    for(const m of p.memories){const option=el('option',m.title);option.value=m.id;picker.append(option);}
    const reason=el('input','');reason.placeholder='Why this object cues this memory';reason.setAttribute('aria-label','Association reason');
    const link=button('Attach memory',()=>mutate(()=>{if(o.status!=='confirmed'||!current(o))throw new Error('Confirm a current region first.');if(!reason.value.trim()||!picker.value)throw new Error('Choose a memory and give a reason.');o.links=o.links.filter(l=>l.memoryId!==picker.value);o.links.push({memoryId:picker.value,kind:'user-association',reason:reason.value.trim()});}));
    picker.disabled=reason.disabled=link.disabled=!editable()||!current(o)||o.status!=='confirmed';detail.append(picker,reason,link);
  }
  $('object-query').oninput=refresh;
  $('pick-object').onclick=()=>{picking=!picking;refresh();$('object-instruction').textContent=picking?'Click a solid static object. Avoid people, reflections and unsupported edges.':'Click a saved region to open its memories.';};
  canvas.addEventListener('pointerdown',event=>{if(event.button===0)down=[event.clientX,event.clientY];});
  canvas.addEventListener('pointerup',event=>{
    if(event.button!==0||!down)return;
    const start=down;down=null;if(Math.hypot(event.clientX-start[0],event.clientY-start[1])>4)return;
    const mesh=getMesh();if(!mesh||!getHash())return;
    const rect=canvas.getBoundingClientRect(),ndc=new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2);
    try {
      if(picking) {
        requireEditable();const binding=sampleRegion(mesh,camera,ndc,rect.height),p=getPalace();
        const o={id:crypto.randomUUID(),label:`Surface region ${objects().length+1}`,status:'proposed',binding:{...binding,sceneId:p.scene.id,assetHash:getHash()},observations:[{kind:'manual-surface',at:new Date().toISOString(),cameraPosition:mesh.worldToLocal(camera.position.clone()).toArray(),cameraTarget:mesh.worldToLocal(controls.target.clone()).toArray()}],links:[],corrections:[]};
        p.objectMemory??={version:1,objects:[]};p.objectMemory.objects.push(o);picking=false;select(o);notice('Manual surface region sampled. Inspect another viewpoint before confirming; automatic recognition has not run.');
      } else {
        mesh.updateWorldMatrix(true,false); const ray=new THREE.Raycaster();ray.setFromCamera(ndc,camera);const hit=ray.intersectObject(mesh,false)[0];
        if(!hit){notice('Background miss. No object selected.');return;}
        const local=mesh.worldToLocal(hit.point.clone());
        const candidates=objects().filter(o=>o.status==='confirmed'&&current(o)).map(o=>({o,d:Math.min(...o.binding.samples.map(s=>local.distanceTo(new THREE.Vector3(...s))))})).filter(({o,d})=>d<=o.binding.tolerance).sort((a,b)=>a.d-b.d);
        if(candidates.length)select(candidates[0].o);else notice('No confirmed object at this surface.');
      }
    }catch(error){notice(error.message);}
  });
  function frame(now) {
    const mesh=getMesh(),o=objects().find(o=>o.id===chosen);
    if(!mesh||!o||!current(o)||o.status==='rejected'){if(overlay.childElementCount)overlay.replaceChildren();return;}
    mesh.updateWorldMatrix(true,false);camera.updateMatrixWorld();
    const signature=[...camera.matrixWorld.elements,...mesh.matrixWorld.elements,camera.aspect,canvas.clientWidth,canvas.clientHeight].join(',');
    if(signature===lastCamera)return;
    // Spark splats do not write standard mesh depth. Check visibility by ray;
    // never leave markers from a previous viewpoint painted over an occluder.
    overlay.replaceChildren();if(now-lastPaint<150)return;lastPaint=now;lastCamera=signature;
    overlay.setAttribute('viewBox',`0 0 ${canvas.clientWidth} ${canvas.clientHeight}`);
    for(const sample of o.binding.samples){
      const world=mesh.localToWorld(new THREE.Vector3(...sample)),p=world.clone().project(camera);
      if(p.z < -1||p.z>1||Math.abs(p.x)>1||Math.abs(p.y)>1)continue;
      const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(p.x,p.y),camera);const hit=ray.intersectObject(mesh,false)[0];
      const tolerance=o.binding.tolerance*mesh.getWorldScale(new THREE.Vector3()).x;
      if(!hit||hit.point.distanceTo(world)>tolerance)continue;
      const circle=document.createElementNS(overlay.namespaceURI,'circle');circle.setAttribute('cx',(p.x+1)*canvas.clientWidth/2);circle.setAttribute('cy',(1-p.y)*canvas.clientHeight/2);circle.setAttribute('r','7');overlay.append(circle);
    }
  }
  return {refresh,frame};
}
