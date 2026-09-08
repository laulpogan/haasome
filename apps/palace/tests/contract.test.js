import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {assetPath,validatePalace,resolveAsset,completeAnchors} from '../src/contract.js';
const fixture = () => JSON.parse(readFileSync(new URL('../../../packages/contracts/examples/palace.fixture.json', import.meta.url)));
test('contract fixture imports and completes five anchors', () => assert.equal(completeAnchors(validatePalace(fixture())).anchors.length,5));
test('unsafe paths rejected', () => { for(const p of ['../secret','/file','https://host/file','a/../b','a\\b','%2e%2e/a']) assert.throws(() => assetPath(p)); });
test('invalid references, transforms and unbacked computer-use claims rejected', () => {
  let p = fixture(); p.anchors[0].memoryIds.push('absent'); assert.throws(() => validatePalace(p));
  p = fixture(); p.scene.transform.scale = 0; assert.throws(() => validatePalace(p));
  p = fixture(); p.memories[0].source.kind = 'computer-use'; assert.throws(() => validatePalace(p));
});
test('nested bundle assets resolve; ambiguous file names do not', () => {
  assert.equal(resolveAsset(new Map([['evidence.png','ok']]),'assets/memory-a/evidence.png'),'ok');
  assert.equal(resolveAsset(new Map([['a/evidence.png','a'],['b/evidence.png','b']]),'evidence.png'),undefined);
});

import {freezeCapsule, unpackCapsule, validateCapsule, capsuleBlob} from '../src/capsule.js';
test('portable capsule includes only references, preserves bytes, rejects missing assets', async () => {
  const p = fixture(); p.scene.provenance.kind = 'generated';
  const paths = new Map([[p.scene.asset,new Blob([new Uint8Array([0,1,254,255])])],['unused.txt',new Blob(['excluded'])]]);
  const c = await freezeCapsule(p,paths,'Test capsule');
  assert.equal(c.assets.length,1);
  assert.deepEqual([...new Uint8Array(await unpackCapsule(c).get(p.scene.asset).arrayBuffer())],[0,1,254,255]);
  assert.equal(p.capsule,undefined);
  assert.equal(c.palace.capsule.title,'Test capsule');
  await assert.rejects(freezeCapsule(p,new Map(),'Test'),/Missing referenced asset/);
  for (const change of [c=>c.assets.push(c.assets[0]), c=>c.assets[0].path='../escape', c=>c.assets[0].data='broken', c=>c.assets.pop(), c=>c.palace.capsule.frozenAt='yesterday', c=>c.capsuleVersion=2, c=>c.assets[0].path='unreferenced']) {
    const bad=structuredClone(c); change(bad); assert.throws(()=>validateCapsule(bad));
  }
});

test('base64 validation uses bounded stack for multi-megabyte assets and rejects malformed padding', async () => {
  const p=fixture(), bytes=Buffer.alloc(4*1024*1024,173);
  const c=await freezeCapsule(p,new Map([[p.scene.asset,new Blob([bytes])]]),'Large test');
  assert.deepEqual(JSON.parse(await capsuleBlob(c).text()), c);
  assert.deepEqual(Buffer.from(await unpackCapsule(c).get(p.scene.asset).arrayBuffer()),bytes);
  for (const data of ['', 'AA==', 'AAA=', 'AAAA', '+/8=']) {
    c.assets[0].data=data; assert.doesNotThrow(()=>validateCapsule(c));
  }
  for (const data of ['A','AAA','====','A===','AA=A','AA==AAAA','AAAA\n','AAAé','AAA_',null,`${bytes.toString('base64').slice(0,-4)}=AAA`]) {
    c.assets[0].data=data; assert.throws(()=>validateCapsule(c),/Invalid asset base64/);
  }
});

import * as THREE from 'three';
import {validateObjectMemory,bindingCurrent,findObjects,sampleRegion} from '../src/object-memory.js';
test('surface samples follow mesh transform and reject background geometry misses',()=>{
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(10,10),new THREE.MeshBasicMaterial());
  mesh.position.set(4,2,-3);mesh.scale.setScalar(2);mesh.rotation.y=.3;
  const camera=new THREE.PerspectiveCamera(60,1,.01,100);camera.position.set(4,2,8);camera.lookAt(mesh.position);camera.updateMatrixWorld();
  const region=sampleRegion(mesh,camera,new THREE.Vector2(0,0),700);
  assert.equal(region.samples.length,9);for(const p of region.samples)assert.ok(Math.abs(p[2])<1e-6);
  camera.lookAt(40,2,8);camera.updateMatrixWorld();assert.throws(()=>sampleRegion(mesh,camera,new THREE.Vector2(0,0),700),/Background miss/);
});
test('object identity, memory search, frozen copying and stale scenes preserve boundaries',async()=>{
  const p=fixture(),hash='a'.repeat(64),o={id:'object-1',label:'Table',status:'confirmed',binding:{sceneId:p.scene.id,assetHash:hash,samples:Array.from({length:5},(_,i)=>[i*.01,0,0]),tolerance:.02},observations:[{kind:'manual-surface',at:'2026-09-08T22:00:00Z',cameraPosition:[0,1,3],cameraTarget:[0,0,0]}],links:[{memoryId:p.memories[0].id,kind:'user-association',reason:'A reminder of a trip'}],corrections:[]};
  p.objectMemory={version:1,objects:[o]};validatePalace(p);
  assert.ok(bindingCurrent(o,p.scene,hash));assert.equal(bindingCurrent(o,p.scene,'b'.repeat(64)),false);assert.equal(bindingCurrent(o,{...p.scene,id:'new'},hash),false);
  assert.equal(findObjects([o],p.memories,'trip')[0],o);assert.equal(findObjects([o],p.memories,'unrelated').length,0);
  const frozen=await freezeCapsule(p,new Map([[p.scene.asset,new Blob(['scene'])]]),'Objects');p.objectMemory.objects[0].label='Changed';assert.equal(frozen.palace.objectMemory.objects[0].label,'Table');
  for(const change of [o=>o.binding.samples=[[0,0,0]],o=>o.binding.assetHash='unknown',o=>o.links[0].memoryId='missing',o=>o.observations[0].kind='pretend-detector',o=>o.binding.samples[0][0]=Infinity]) {
    const bad=structuredClone(frozen.palace);change(bad.objectMemory.objects[0]);assert.throws(()=>validateObjectMemory(bad.objectMemory,bad));
  }
});
