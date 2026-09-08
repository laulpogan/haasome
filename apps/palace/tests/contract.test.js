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

import {freezeCapsule, unpackCapsule, validateCapsule} from '../src/capsule.js';
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
  assert.deepEqual(Buffer.from(await unpackCapsule(c).get(p.scene.asset).arrayBuffer()),bytes);
  for (const data of ['', 'AA==', 'AAA=', 'AAAA', '+/8=']) {
    c.assets[0].data=data; assert.doesNotThrow(()=>validateCapsule(c));
  }
  for (const data of ['A','AAA','====','A===','AA=A','AA==AAAA','AAAA\n','AAAé','AAA_',null,`${bytes.toString('base64').slice(0,-4)}=AAA`]) {
    c.assets[0].data=data; assert.throws(()=>validateCapsule(c),/Invalid asset base64/);
  }
});
