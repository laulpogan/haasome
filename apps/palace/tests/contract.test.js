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
