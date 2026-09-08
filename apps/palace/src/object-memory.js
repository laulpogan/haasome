import { validateRecognition, objectRegionContains, matrix } from './recognition.js';
import * as THREE from 'three';
const vector = v => Array.isArray(v) && v.length === 3 && v.every(Number.isFinite);
const text = v => typeof v === 'string' && Boolean(v.trim());
export function validateObjectMemory(sidecar, palace) {
  if (sidecar === undefined) return;
  if (sidecar?.version !== 1 || !Array.isArray(sidecar.objects) || sidecar.objects.length > 100) throw new Error('Invalid object-memory sidecar.');
  for(const run of sidecar.recognitions||[])validateRecognition(run);
  if(sidecar.recognitions && new Set(sidecar.recognitions.map(r=>r.model.responseId)).size!==sidecar.recognitions.length)throw new Error('Duplicate recognition run.');
  for(const rejection of sidecar.rejections||[])if(!text(rejection.label)||!text(rejection.reason)||!sidecar.recognitions?.some(r=>r.model.responseId===rejection.runId&&r.objects.some(p=>p.id===rejection.proposalId)))throw new Error('Invalid rejected proposal.');
  const ids = new Set();
  for (const o of sidecar.objects) {
    if (!text(o.id) || ids.has(o.id) || !text(o.label)) throw new Error('Object IDs must be unique; labels must be nonempty.');
    ids.add(o.id);
    const b = o.binding;
    if (!text(b?.sceneId) || typeof b.assetHash !== 'string' || b.assetHash.length !== 64 || [...b.assetHash].some(c => !'0123456789abcdef'.includes(c))) throw new Error('Object requires an exact scene hash.');
    if (!Array.isArray(b.samples) || b.samples.length < 5 || b.samples.length > 256 || !b.samples.every(vector) || !Number.isFinite(b.tolerance) || b.tolerance <= 0) throw new Error('Object requires a supported geometry region.');
    if (!['proposed','confirmed','rejected'].includes(o.status) || !Array.isArray(o.observations) || !o.observations.length) throw new Error('Object status and observations required.');
    const run=o.origin&&sidecar.recognitions?.find(r=>r.model.responseId===o.origin.runId),proposal=run?.objects.find(p=>p.id===o.origin.proposalId);
    if(o.origin&&(!proposal||o.origin.kind!=='recognition'||run.assetHash!==b.assetHash||run.sceneId!==b.sceneId||proposal.ambiguity.toLocaleLowerCase()!=='none'))throw new Error('Object lacks supported recognition provenance.');
    for (const obs of o.observations) {
      if(obs.kind==='manual-surface') {if(!vector(obs.cameraPosition)||!vector(obs.cameraTarget)||!text(obs.at))throw new Error('Invalid manual surface observation.');}
      else if(obs.kind==='model-region') {if(!run?.views.some(v=>v.id===obs.viewId)||!Number.isInteger(obs.agreedSamples)||obs.agreedSamples<5)throw new Error('Invalid recognition observation.');}
      else throw new Error('Unknown object observation.');
    }
    if(o.origin&&new Set(o.observations.filter(x=>x.kind==='model-region').map(x=>x.viewId)).size<2)throw new Error('Recognized objects require two-view support.');
    if(b.visibilityTolerance!==undefined&&(!Number.isFinite(b.visibilityTolerance)||b.visibilityTolerance<=0))throw new Error('Invalid visibility tolerance.');
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
export function mountObjectMemory({getPalace,getAssets,getMesh,getHash,camera,controls,canvas,notice,requireEditable,openMemory}) {
  const panel = document.createElement('section'); panel.id = 'object-memory';
  panel.innerHTML = '<h2>Objects in this room</h2><p class="object-boundary">Manual surface selection · automatic recognition pending</p><label>Find object or memory<input id="object-query" type="search" placeholder="Object, story or cue"></label><button id="pick-object">Select surface region</button><p id="object-instruction">Click a saved region to open its memories.</p><div id="object-list"></div><div id="object-detail"></div>';
  document.querySelector('aside').prepend(panel);
  const $ = id => panel.querySelector(`#${id}`);
  const el = (tag,content) => { const n=document.createElement(tag); n.textContent=content; return n; };
  const button = (label,action) => { const n=el('button',label); n.onclick=() => {try {action();} catch(e) {notice(e.message);}}; return n; };
  const overlay = document.createElementNS('http://www.w3.org/2000/svg','svg'); overlay.id='object-highlight'; overlay.setAttribute('aria-label','Selected geometry region'); canvas.parentElement.append(overlay);
  let chosen = null, picking = false, splitting = false, down = null, lastCamera = '', sampleCursor = 0, visibilityChecks = [];
  const evidenceUrls=new WeakMap();
  const inspected=new Map();
  const objects = () => getPalace().objectMemory?.objects || [];
  const current = o => bindingCurrent(o,getPalace().scene,getHash());
  const editable = () => !getPalace().capsule?.frozenAt;
  const select = o => { chosen=o.id; refresh(); if(o.links[0]) openMemory(o.links[0].memoryId); };
  const mutate = action => { requireEditable(); action(); refresh(); };
  function refresh() {
    const p=getPalace();
    canvas.closest('#room').querySelector('#pins').hidden=objects().some(o=>o.status!=='rejected');

    panel.querySelector('.object-boundary').textContent=p.objectMemory?.recognitions?.length?'Model proposals · two-view surface checks · user-confirmed links':'Manual surface selection · automatic recognition pending';
    $('pick-object').disabled = !editable() || !getMesh() || !getHash();
    if (!editable()) picking=splitting=false;
    canvas.closest('#room').classList.toggle('surface-picking',picking||splitting);
    $('pick-object').setAttribute('aria-pressed',String(picking));
    $('object-list').replaceChildren(); $('object-detail').replaceChildren(); overlay.replaceChildren(); lastCamera='';
    for (const o of findObjects(objects(),p.memories,$('object-query').value)) {
      const b=button(`${o.label} · ${current(o) ? o.status : 'stale — rebind required'}`,()=>select(o));
      b.setAttribute('aria-pressed',String(o.id===chosen)); $('object-list').append(b);
    }
    const rejectedItems=[...(p.objectMemory?.rejections||[]),...objects().filter(o=>o.status==='rejected').map(o=>({label:o.label,reason:o.corrections.at(-1)?.reason||'User rejected region'}))];
    if(rejectedItems.length){const rejected=el('details','');rejected.append(el('summary',`${rejectedItems.length} rejected proposals`));for(const r of rejectedItems)rejected.append(el('p',`${r.label}: ${r.reason}`));$('object-list').append(rejected);}
    const o=objects().find(o=>o.id===chosen); if(!o) return;
    const detail=$('object-detail');
    detail.append(el('h3',o.label),el('p',current(o) ? `${o.binding.samples.length} geometry samples · ${o.status} · ${o.origin ? 'model proposal, two-view geometry' : 'manual selection'}` : 'Scene changed. Binding is stale; hidden from geometry selection. Select a new surface to create a replacement.'));
    const name=el('input',''); name.value=o.label; name.setAttribute('aria-label','Object name'); name.disabled=!editable();
    const rename=button('Rename object',()=>mutate(()=>{if(!name.value.trim()) throw new Error('Enter an object name.'); o.corrections.push({at:new Date().toISOString(),label:name.value.trim()});o.label=name.value.trim();})); rename.disabled=!editable();
    const confirm=button('Confirm region',()=>mutate(()=>{if(!current(o)) throw new Error('Stale region requires rebinding.');if(o.origin&&(inspected.get(o.id)?.size||0)<2)throw new Error('Inspect both source viewpoints before confirming.');o.status='confirmed';}));confirm.disabled=!editable()||!current(o);
    const correction=el('input','');correction.setAttribute('aria-label','Correction reason');correction.placeholder='Reason for correction or rejection';correction.disabled=!editable();
    const reject=button('Reject region',()=>mutate(()=>{o.corrections.push({at:new Date().toISOString(),label:o.label,reason:correction.value.trim()||'User rejected region'});o.status='rejected';chosen=null;}));reject.disabled=!editable();
    detail.append(name,rename,confirm,correction,reject);
    if(o.origin){
      const run=p.objectMemory.recognitions.find(r=>r.model.responseId===o.origin.runId),proposal=run.objects.find(x=>x.id===o.origin.proposalId);
      detail.append(el('small',`Proposed by ${run.model.name} · ${run.model.at}. Object labels are model proposals; memory text remains source content.`));
      run.views.forEach((view,index)=>{
        const visit=button(`Inspect source view ${index+1}`,()=>{
          const mesh=getMesh();if(!current(o)||!mesh)throw new Error('Source pose belongs to a different scene.');mesh.updateWorldMatrix(true,false);
          const pose=mesh.matrixWorld.clone().multiply(matrix(view.cameraToScene));camera.position.setFromMatrixPosition(pose);camera.up.setFromMatrixColumn(pose,1).normalize();
          controls.target.copy(camera.position).add(new THREE.Vector3(0,0,-1).transformDirection(pose));camera.fov=2*Math.atan(view.intrinsics.h/(2*view.intrinsics.fl_y))*180/Math.PI;camera.updateProjectionMatrix();controls.update();
          if(!inspected.has(o.id))inspected.set(o.id,new Set());inspected.get(o.id).add(view.id);overlay.replaceChildren();lastCamera='';
          notice(`Viewing registered source pose ${index+1}. Compare the marked surface with the saved frame before confirming.`);
        });visit.disabled=!current(o);detail.append(visit);
        const source=el('details','');source.append(el('summary',`Source frame ${index+1}: ${view.id}`));
        const blob=getAssets().get(view.asset);if(blob){
          if(!evidenceUrls.has(blob))evidenceUrls.set(blob,URL.createObjectURL(blob));
          const svg=document.createElementNS(overlay.namespaceURI,'svg');svg.setAttribute('viewBox','0 0 1000 1000');svg.classList.add('recognition-frame');svg.setAttribute('role','img');svg.setAttribute('aria-label',`Recognition source ${view.id} with model region`);
          const image=document.createElementNS(overlay.namespaceURI,'image');image.setAttribute('href',evidenceUrls.get(blob));image.setAttribute('width','1000');image.setAttribute('height','1000');image.setAttribute('preserveAspectRatio','none');svg.append(image);
          const outline=document.createElementNS(overlay.namespaceURI,'polygon');outline.setAttribute('points',proposal.observations.find(o=>o.viewIndex===index).polygon.map(p=>p.join(',')).join(' '));outline.setAttribute('fill','#ffd36a22');outline.setAttribute('stroke','#ffd36a');outline.setAttribute('stroke-width','4');svg.append(outline);svg.style.aspectRatio=`${view.intrinsics.w}/${view.intrinsics.h}`;svg.setAttribute('preserveAspectRatio','none');source.append(svg,el('small','Model region in original source frame.'));
        }else source.append(el('p','Missing recognition source frame.'));detail.append(source);
      });
      for(const suggestion of proposal.suggestions){if(!p.memories.some(m=>m.id===suggestion.memoryId))continue;
        const box=el('section','');box.append(el('small',`Suggested association: ${suggestion.reason}`));
        const accept=button('Accept suggested link',()=>mutate(()=>{if(o.status!=='confirmed'||!current(o))throw new Error('Confirm a current object first.');o.links=o.links.filter(l=>l.memoryId!==suggestion.memoryId);o.links.push({...suggestion,kind:'user-association'});}));accept.disabled=!editable()||o.status!=='confirmed'||!current(o);box.append(accept);detail.append(box);
      }
    }
    const split=button('Split region at surface',()=>{requireEditable();splitting=true;picking=false;canvas.closest('#room').classList.add('surface-picking');$('pick-object').setAttribute('aria-pressed','false');notice('Click inside the selected region to split its supported samples around that surface.');});split.disabled=!editable()||!current(o)||o.binding.samples.length<10;detail.append(split);
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
      if(splitting){
        requireEditable();const o=objects().find(o=>o.id===chosen);if(!o||!current(o))throw new Error('Choose a current region.');
        mesh.updateWorldMatrix(true,false);const ray=new THREE.Raycaster();ray.setFromCamera(ndc,camera);const hit=ray.intersectObject(mesh,false)[0];if(!hit)throw new Error('Background miss.');
        const point=mesh.worldToLocal(hit.point.clone());if(!objectRegionContains(o,point,getPalace().objectMemory))throw new Error('Click within the selected surface region.');
        const sorted=[...o.binding.samples].sort((a,b)=>point.distanceTo(new THREE.Vector3(...a))-point.distanceTo(new THREE.Vector3(...b))),cut=Math.floor(sorted.length/2);
        if(cut<5)throw new Error('Need at least ten supported samples to split.');
        const child=structuredClone(o);child.id=crypto.randomUUID();child.label=`${o.label} — split`;child.status='proposed';child.binding.samples=sorted.slice(0,cut);child.links=[];
        child.corrections.push({at:new Date().toISOString(),label:child.label,splitFrom:o.id});o.binding.samples=sorted.slice(cut);o.status='proposed';o.corrections.push({at:new Date().toISOString(),label:o.label,splitInto:child.id});
        for(const part of [o,child]){if(part.binding.check)part.binding.check.agreed=part.binding.samples.length;for(const obs of part.observations)if(obs.kind==='model-region')obs.agreedSamples=part.binding.samples.length;}
        objects().push(child);splitting=false;inspected.delete(o.id);select(child);notice('Region split into two supported subsets. Inspect and confirm each; original links stay with the parent.');
      } else if(picking) {
        requireEditable();const binding=sampleRegion(mesh,camera,ndc,rect.height),p=getPalace();
        const o={id:crypto.randomUUID(),label:`Surface region ${objects().length+1}`,status:'proposed',binding:{...binding,sceneId:p.scene.id,assetHash:getHash()},observations:[{kind:'manual-surface',at:new Date().toISOString(),cameraPosition:mesh.worldToLocal(camera.position.clone()).toArray(),cameraTarget:mesh.worldToLocal(controls.target.clone()).toArray()}],links:[],corrections:[]};
        p.objectMemory??={version:1,objects:[]};p.objectMemory.objects.push(o);picking=false;select(o);notice('Manual surface region sampled. Inspect another viewpoint before confirming; automatic recognition has not run.');
      } else {
        mesh.updateWorldMatrix(true,false); const ray=new THREE.Raycaster();ray.setFromCamera(ndc,camera);const hit=ray.intersectObject(mesh,false)[0];
        if(!hit){notice('Background miss. No object selected.');return;}
        const local=mesh.worldToLocal(hit.point.clone());
        const candidates=objects().filter(o=>o.status==='confirmed'&&current(o)&&objectRegionContains(o,local,getPalace().objectMemory)).map(o=>({o,d:Math.min(...o.binding.samples.map(s=>local.distanceTo(new THREE.Vector3(...s))))})).sort((a,b)=>a.d-b.d);
        if(candidates.length){select(candidates[0].o);notice(`Selected object: ${candidates[0].o.label}`);}else notice('No confirmed object at this surface.');
      }
    }catch(error){notice(error.message);}
  });
  function frame(now) {
    const mesh=getMesh(),o=objects().find(o=>o.id===chosen);
    if(!mesh||!o||!current(o)||o.status==='rejected'){if(overlay.childElementCount)overlay.replaceChildren();return;}
    mesh.updateWorldMatrix(true,false);camera.updateMatrixWorld();
    const signature=[...camera.matrixWorld.elements,...mesh.matrixWorld.elements,camera.aspect,canvas.clientWidth,canvas.clientHeight].map(n=>Number(n.toFixed(6))).join(',');
    // Spread expensive Spark raycasts across frames. Reproject every marker from
    // its local sample; refresh one visibility result per frame while orbiting.
    if(!lastCamera){
      visibilityChecks=o.binding.samples.filter((_,i)=>i%Math.max(1,Math.ceil(o.binding.samples.length/18))===0).map(sample=>({sample,visible:false,signature:''}));
      sampleCursor=0;
    }
    lastCamera=signature;
    if(visibilityChecks.every(check=>check.signature===signature))return;
    const check=visibilityChecks[sampleCursor++%visibilityChecks.length];
    const world=mesh.localToWorld(new THREE.Vector3(...check.sample)),projected=world.clone().project(camera);
    check.visible=false;check.signature=signature;
    if(projected.z>=-1&&projected.z<=1&&Math.abs(projected.x)<=1&&Math.abs(projected.y)<=1){
      const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(projected.x,projected.y),camera);const hit=ray.intersectObject(mesh,false)[0];
      const tolerance=(o.binding.visibilityTolerance||o.binding.tolerance)*mesh.getWorldScale(new THREE.Vector3()).x;
      check.visible=Boolean(hit&&hit.point.distanceTo(world)<=tolerance);
    }
    overlay.setAttribute('viewBox',`0 0 ${canvas.clientWidth} ${canvas.clientHeight}`);
    for(const check of visibilityChecks){
      const p=mesh.localToWorld(new THREE.Vector3(...check.sample)).project(camera);
      if(!check.visible||p.z < -1||p.z>1||Math.abs(p.x)>1||Math.abs(p.y)>1){check.circle?.remove();continue;}
      const circle=check.circle??=document.createElementNS(overlay.namespaceURI,'circle');circle.setAttribute('cx',(p.x+1)*canvas.clientWidth/2);circle.setAttribute('cy',(1-p.y)*canvas.clientHeight/2);circle.setAttribute('r','7');overlay.append(circle);
    }
  }
  return {refresh,frame};
}
