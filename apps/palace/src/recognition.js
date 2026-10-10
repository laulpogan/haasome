import * as THREE from 'three';
const fail = message => { throw new Error(message); };
const text = v => typeof v === 'string' && Boolean(v.trim());
const hash = v => typeof v === 'string' && v.length === 64 && [...v].every(c=>'0123456789abcdef'.includes(c));
const polygon = p => Array.isArray(p) && p.length >= 3 && p.length <= 12 && p.every(v=>Array.isArray(v)&&v.length===2&&v.every(x=>Number.isFinite(x)&&x>=0&&x<=1000));
export const matrix = rows => new THREE.Matrix4().set(...rows.flat());
export async function sha256(blob) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()))].map(b=>b.toString(16).padStart(2,'0')).join('');
}
export function validateRecognition(bundle) {
  if(bundle?.recognitionVersion!==1||!text(bundle.sceneId)||!hash(bundle.assetHash))fail('Recognition requires an exact scene identity.');
  const m=bundle.model;
  if(!text(m?.name)||!text(m.responseId)||!text(m.prompt)||!text(m.evidenceAsset)||!hash(m.evidenceHash)||!Number.isFinite(Date.parse(m.at)))fail('Recognition model evidence required.');
  if(!Array.isArray(bundle.views)||bundle.views.length!==2||new Set(bundle.views.map(v=>v.id)).size!==2)fail('Recognition requires two distinct source views.');
  for(const v of bundle.views){
    if(!text(v.id)||!text(v.asset)||!hash(v.assetHash))fail('Source frame evidence required.');
    if(!Array.isArray(v.cameraToScene)||v.cameraToScene.length!==4||v.cameraToScene.some(r=>!Array.isArray(r)||r.length!==4||!r.every(Number.isFinite)))fail('Invalid registered camera matrix.');
    const t=matrix(v.cameraToScene),rotation=new THREE.Matrix3().setFromMatrix4(t),columns=[0,1,2].map(i=>new THREE.Vector3().setFromMatrixColumn(t,i));
    if(Math.abs(rotation.determinant()-1)>.01||columns.some(c=>Math.abs(c.length()-1)>.01)||Math.abs(columns[0].dot(columns[1]))>.01||v.cameraToScene[3].some((n,i)=>Math.abs(n-(i===3?1:0))>1e-6))fail('Camera pose must be rigid, without scale or perspective.');
    const k=v.intrinsics;
    if(!k||['w','h','fl_x','fl_y'].some(n=>!Number.isFinite(k[n])||k[n]<=0)||['cx','cy','k1','k2','k3','k4','p1','p2'].some(n=>!Number.isFinite(k[n]))||k.k4!==0)fail('Unsupported camera intrinsics.');
  }
  if(new THREE.Vector3().setFromMatrixPosition(matrix(bundle.views[0].cameraToScene)).distanceTo(new THREE.Vector3().setFromMatrixPosition(matrix(bundle.views[1].cameraToScene)))<.001)fail('Two source cameras must have a spatial baseline.');
  if(!Array.isArray(bundle.objects)||!bundle.objects.length||bundle.objects.length>10||new Set(bundle.objects.map(o=>o.id)).size!==bundle.objects.length)fail('Invalid recognition proposals.');
  for(const o of bundle.objects){
    if(!text(o.id)||!text(o.label)||!text(o.ambiguity)||!Array.isArray(o.observations)||o.observations.length!==2||new Set(o.observations.map(v=>v.viewIndex)).size!==2||o.observations.some(v=>![0,1].includes(v.viewIndex)||!polygon(v.polygon)))fail('Each proposal requires regions in both source views.');
    if(!Array.isArray(o.suggestions)||o.suggestions.length>3||o.suggestions.some(s=>!text(s.memoryId)||!text(s.reason)))fail('Invalid association suggestions.');
  }
  return bundle;
}
export function recognitionAssets(sidecar) {
  return (sidecar?.recognitions||[]).flatMap(r=>[r.model.evidenceAsset,...r.views.map(v=>v.asset)]);
}
export function inside([x,y], polygon) {
  let result=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
    const a=polygon[i],b=polygon[j];
    if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])result=!result;
  }
  return result;
}
function distort(x,y,k) {
  const r=x*x+y*y,radial=1+k.k1*r+k.k2*r*r+k.k3*r*r*r;
  return [x*radial+2*k.p1*x*y+k.p2*(r+2*x*x),y*radial+k.p1*(r+2*y*y)+2*k.p2*x*y];
}
export function sourceRay(mesh,view,pixel) {
  const k=view.intrinsics,xd=(pixel[0]*k.w/1000-k.cx)/k.fl_x,yd=(pixel[1]*k.h/1000-k.cy)/k.fl_y;
  let x=xd,y=yd;
  for(let i=0;i<8;i++){const d=distort(x,y,k);x+=xd-d[0];y+=yd-d[1];}
  const pose=matrix(view.cameraToScene),origin=mesh.localToWorld(new THREE.Vector3().setFromMatrixPosition(pose));
  const direction=new THREE.Vector3(x,-y,-1).transformDirection(pose).transformDirection(mesh.matrixWorld);
  return new THREE.Raycaster(origin,direction,.001,Infinity);
}
export function projectSource(point,view) {
  const p=point.clone().applyMatrix4(matrix(view.cameraToScene).invert());
  if(p.z>=0)return null;
  const k=view.intrinsics,[x,y]=distort(p.x/-p.z,-p.y/-p.z,k);
  return [(x*k.fl_x+k.cx)/k.w*1000,(y*k.fl_y+k.cy)/k.h*1000];
}
export function supportInView(mesh,point,view,region,tolerance) {
  const pixel=projectSource(point,view);
  if(!pixel||!inside(pixel,region))return false;
  const hit=sourceRay(mesh,view,pixel).intersectObject(mesh,false)[0];
  return Boolean(hit&&mesh.worldToLocal(hit.point.clone()).distanceTo(point)<=tolerance);
}
export function liftProposal(mesh,bundle,proposal) {
  if(proposal.ambiguity.toLocaleLowerCase()!=='none')throw new Error(`Ambiguous proposal: ${proposal.ambiguity}`);
  mesh.updateWorldMatrix(true,false);
  const observations=[0,1].map(i=>proposal.observations.find(o=>o.viewIndex===i));
  const region=observations[0].polygon,xs=region.map(p=>p[0]),ys=region.map(p=>p[1]);
  const bounds=[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];
  const samples=[];let attempted=0,hits=0;
  // Sample the interior, then demand the same surface in the independent view.
  // A box or model polygon by itself is never accepted as 3D support.
  const origin=new THREE.Vector3().setFromMatrixPosition(matrix(bundle.views[0].cameraToScene));
  let visibilityTolerance=0;
  for(let y=0;y<7;y++)for(let x=0;x<7;x++){
    const pixel=[bounds[0]+(x+.5)/7*(bounds[2]-bounds[0]),bounds[1]+(y+.5)/7*(bounds[3]-bounds[1])];
    if(!inside(pixel,region))continue;attempted++;
    const hit=sourceRay(mesh,bundle.views[0],pixel).intersectObject(mesh,false)[0];if(!hit)continue;hits++;
    const point=mesh.worldToLocal(hit.point.clone()),tolerance=point.distanceTo(origin)*.015;
    if(supportInView(mesh,point,bundle.views[1],observations[1].polygon,tolerance)){
      samples.push(point.toArray());visibilityTolerance=Math.max(visibilityTolerance,tolerance);
    }
  }
  if(samples.length<5)throw new Error(`Only ${samples.length} surface samples agree in both views (of ${attempted} rays, ${hits} first-view hits).`);
  // Region click radius follows spacing between supported samples, not an
  // arbitrary depth plane. Ray visibility uses a separate, tighter tolerance.
  const points=samples.map(s=>new THREE.Vector3(...s));
  const spacing=points.map((p,i)=>Math.min(...points.filter((_,j)=>j!==i).map(q=>p.distanceTo(q)))).sort((a,b)=>a-b);
  const tolerance=Math.max(visibilityTolerance,spacing[Math.floor(spacing.length*.75)]*1.3);
  return {samples,tolerance,visibilityTolerance,check:{attempted,firstViewHits:hits,agreed:samples.length}};
}
export function objectRegionContains(object,point,sidecar) {
  if(!object.binding.samples.some(s=>point.distanceTo(new THREE.Vector3(...s))<=object.binding.tolerance))return false;
  if(!object.origin)return true;
  const run=sidecar.recognitions.find(r=>r.model.responseId===object.origin.runId),proposal=run.objects.find(p=>p.id===object.origin.proposalId);
  return proposal.observations.every(o=>{const pixel=projectSource(point,run.views[o.viewIndex]);return pixel&&inside(pixel,o.polygon);});
}
export async function verifyRecognitionEvidence(sidecar,assets,resolveAsset) {
  for(const bundle of sidecar?.recognitions||[]){
    for(const [path,hash] of [[bundle.model.evidenceAsset,bundle.model.evidenceHash],...bundle.views.map(v=>[v.asset,v.assetHash])]){
      const blob=resolveAsset(assets,path);if(!blob||await sha256(blob)!==hash)throw new Error(`Missing or changed recognition evidence: ${path}`);
    }
  }
}
export async function importRecognition(bundle,assets,palace,mesh,sceneHash,resolveAsset) {
  validateRecognition(bundle);
  if(bundle.sceneId!==palace.scene?.id||bundle.assetHash!==sceneHash)throw new Error('Recognition belongs to a different scene asset. Rebind with matching source views.');
  if(palace.objectMemory?.recognitions?.some(r=>r.model.responseId===bundle.model.responseId))throw new Error('This recognition run is already imported.');
  await verifyRecognitionEvidence({recognitions:[bundle]},assets,resolveAsset);
  const objects=[],rejections=[];
  for(const p of bundle.objects){
    try{
      const binding=liftProposal(mesh,bundle,p);
      objects.push({id:crypto.randomUUID(),label:p.label,status:'proposed',origin:{kind:'recognition',runId:bundle.model.responseId,proposalId:p.id},binding:{...binding,sceneId:bundle.sceneId,assetHash:bundle.assetHash},observations:p.observations.map(o=>({kind:'model-region',viewId:bundle.views[o.viewIndex].id,agreedSamples:binding.samples.length})),links:[],corrections:[]});
    }catch(error){rejections.push({runId:bundle.model.responseId,proposalId:p.id,label:p.label,reason:error.message});}
    await new Promise(resolve=>setTimeout(resolve,0));
  }
  const sidecar=structuredClone(palace.objectMemory||{version:1,objects:[]});
  sidecar.recognitions??=[];sidecar.rejections??=[];
  sidecar.recognitions.push(bundle);sidecar.rejections.push(...rejections);sidecar.objects.push(...objects);
  return sidecar;
}
