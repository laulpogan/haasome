import { recognitionAssets } from './recognition.js';
import { validateObjectMemory } from './object-memory.js';
const fail = (message) => { throw new Error(message); };
const text = (v, name) => typeof v === 'string' && v.trim() ? v : fail(`${name} must be text.`);
const vector = (v, n, name) => Array.isArray(v) && v.length === n && v.every(Number.isFinite) ? v : fail(`${name} must contain ${n} finite numbers.`);
const unique = (items, name) => { const ids = items.map(x => text(x.id, `${name} ID`)); if (new Set(ids).size !== ids.length) fail(`Duplicate ${name} ID.`); };
export function assetPath(value) {
  text(value, 'Asset path');
  if (value.includes('\\') || value.includes(':') || value.includes('?') || value.includes('#') || value.includes('%') || value.split('/').some(p => !p || p === '.' || p === '..')) fail('Asset paths must be relative to the bundle, without traversal or URLs.');
  return value;
}
export function validateScene(s) {
  if (!s || typeof s !== 'object') fail('Scene object required.');
  text(s.id, 'Scene ID'); assetPath(s.asset);
  if (!['ply','spz','splat','ksplat','sog','rad'].includes(s.format)) fail('Unsupported splat format. Use ZIP-packaged .sog, PLY, SPZ, SPLAT, KSPLAT, or RAD.');
  if (!['captured','licensed-sample','fixture','generated'].includes(s.provenance?.kind)) fail('Scene provenance required.');
  text(s.provenance.attribution, 'Scene attribution');
  vector(s.transform?.position, 3, 'Scene position'); vector(s.transform?.rotation, 4, 'Quaternion');
  if (Math.abs(Math.hypot(...s.transform.rotation) - 1) > 0.01) fail('Scene quaternion must be normalized.');
  if (!Number.isFinite(s.transform.scale) || s.transform.scale <= 0) fail('Scene scale must be positive.');
  vector(s.camera?.position, 3, 'Camera position'); vector(s.camera?.target, 3, 'Camera target');
  if (s.camera.position.every((v,i) => v === s.camera.target[i])) fail('Camera position and target must differ.');
  return s;
}
export function validateMemories(memories) {
  if (!Array.isArray(memories)) fail('Memories must be an array.');
  unique(memories, 'memory');
  for (const m of memories) {
    text(m.title, 'Memory title'); text(m.body, 'Memory body'); text(m.cue, 'Memory cue');
    if (!Array.isArray(m.media)) fail('Memory media must be an array.');
    for (const media of m.media) {
      if (!['image','video'].includes(media.kind)) fail('Media must be image or video.');
      assetPath(media.asset); if (typeof media.alt !== 'string') fail('Media alt text required.');
    }
    const s = m.source;
    if (!['computer-use','manual','fixture'].includes(s?.kind)) fail('Memory source required.');
    text(s.app, 'Source app'); text(s.locator, 'Source locator');
    if (typeof s.capturedAt !== 'string' || !Number.isFinite(Date.parse(s.capturedAt))) fail('Capture timestamp required.');
    if (s.evidenceAsset != null) assetPath(s.evidenceAsset);
    if (s.kind === 'computer-use' && !s.evidenceAsset) fail('Computer-use records require evidence.');
  }
  return memories;
}
export function defaultAnchors(target = [0,1,0], spacing = 0.7) {
  return ['First place','Second place','Third place','Fourth place','Fifth place'].map((label,i) => ({id:`place-${i+1}`,label,position:[target[0]+(i-2)*spacing,target[1],target[2]+Math.abs(i-2)*spacing*0.3],memoryIds:[]}));
}
export function validatePalace(p) {
  if (p?.schemaVersion !== 0) fail('Expected palace schemaVersion 0.');
  if (p.capsule !== undefined) {
    text(p.capsule?.id, 'Capsule ID'); text(p.capsule?.title, 'Capsule title');
    if (p.capsule.frozenAt != null && (typeof p.capsule.frozenAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(p.capsule.frozenAt) || !Number.isFinite(Date.parse(p.capsule.frozenAt)))) fail('Frozen timestamp must be ISO-8601 UTC.');
  }
  if (p.scene !== null) validateScene(p.scene);
  validateMemories(p.memories);
  if (!Array.isArray(p.anchors) || !p.anchors.length || p.anchors.length > 5) fail('This slice supports one to five anchors.');
  unique(p.anchors, 'anchor');
  for (const a of p.anchors) {
    text(a.label, 'Anchor label'); vector(a.position, 3, 'Anchor position');
    if (!Array.isArray(a.memoryIds) || a.memoryIds.some(id => !p.memories.some(m => m.id === id))) fail('Anchor references an unknown memory.');
  }
  validateObjectMemory(p.objectMemory, p);
  for (const path of recognitionAssets(p.objectMemory)) assetPath(path);
  return p;
}
export function completeAnchors(p) {
  const extras = defaultAnchors(p.scene?.camera.target);
  for (const a of extras) if (p.anchors.length < 5 && !p.anchors.some(x => x.id === a.id)) p.anchors.push(a);
  return p;
}
export function resolveAsset(assets, path) {
  assetPath(path);
  if (assets.has(path)) return assets.get(path);
  const matches = [...assets].filter(([key]) => key.endsWith(`/${path}`) || path.endsWith(`/${key}`));
  return matches.length === 1 ? matches[0][1] : undefined;
}
