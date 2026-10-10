import { recognitionAssets, verifyRecognitionEvidence } from './recognition.js';
import {assetPath, validatePalace, resolveAsset} from './contract.js';

export function referencedAssets(palace) {
  return [...new Set([
    ...recognitionAssets(palace.objectMemory),
    ...(palace.scene ? [palace.scene.asset] : []),
    ...palace.memories.flatMap(m => [...m.media.map(x => x.asset), ...(m.source.evidenceAsset ? [m.source.evidenceAsset] : [])]),
  ])];
}

function validBase64(data) {
  if (typeof data !== 'string' || data.length % 4 !== 0) return false;
  const end = data.length - (data.endsWith('==') ? 2 : data.endsWith('=') ? 1 : 0);
  // Scan once with constant stack space; grouped regex repetition can overflow
  // the browser's regex stack on ordinary scene and photo payloads.
  for (let i = 0; i < end; i++) {
    const c = data.charCodeAt(i);
    if (!((c >= 65 && c <= 90) || (c >= 97 && c <= 122) ||
      (c >= 48 && c <= 57) || c === 43 || c === 47)) return false;
  }
  return true;
}

export function validateCapsule(value) {
  if (value?.capsuleVersion !== 1) throw new Error('Expected capsuleVersion 1.');
  validatePalace(value.palace);
  if (!Array.isArray(value.assets)) throw new Error('Capsule assets must be an array.');
  const required = new Set(referencedAssets(value.palace)), seen = new Set();
  for (const asset of value.assets) {
    assetPath(asset?.path);
    if (seen.has(asset.path)) throw new Error(`Duplicate asset: ${asset.path}`);
    if (!required.has(asset.path)) throw new Error(`Unreferenced asset: ${asset.path}`);
    if (typeof asset.type !== 'string' || (asset.type && !/^[\w.+-]+\/[\w.+-]+$/.test(asset.type))) throw new Error('Invalid asset MIME type.');
    // Base64 is a wire encoding, not a content or provenance check.
    if (!validBase64(asset.data)) throw new Error('Invalid asset base64.');
    seen.add(asset.path);
  }
  for (const path of required) if (!seen.has(path)) throw new Error(`Missing referenced asset: ${path}`);
  return value;
}

export function unpackCapsule(value) {
  validateCapsule(value);
  return new Map(value.assets.map(a => {
    const parts = [];
    for (let offset=0; offset<a.data.length; offset+=65536) {
      const binary = atob(a.data.slice(offset,offset+65536));
      const bytes = new Uint8Array(binary.length);
      for (let i=0; i<binary.length; i++) bytes[i] = binary.charCodeAt(i);
      parts.push(bytes);
    }
    return [a.path,new Blob(parts,{type:a.type})];
  }));
}

// Base64 contains no JSON escapes. Build the download from bounded pieces rather
// than duplicating every encoded scene in one giant JSON.stringify allocation.
export function capsuleBlob(container) {
  const parts = ['{"capsuleVersion":1,"palace":',JSON.stringify(container.palace),',"assets":['];
  container.assets.forEach((asset,i) => {
    if (i) parts.push(',');
    parts.push('{"path":',JSON.stringify(asset.path),',"type":',JSON.stringify(asset.type),',"data":"',asset.data,'"}');
  });
  parts.push(']}');
  return new Blob(parts,{type:'application/json'});
}

export async function freezeCapsule(palace, assets, title) {
  const snapshot = structuredClone(validatePalace(palace));
  await verifyRecognitionEvidence(snapshot.objectMemory,assets,resolveAsset);
  if (!snapshot.capsule?.frozenAt) snapshot.capsule = {id:crypto.randomUUID(), title:title.trim(), frozenAt:new Date().toISOString()};
  validatePalace(snapshot);
  const packed = [];
  for (const path of referencedAssets(snapshot)) {
    const blob = resolveAsset(assets,path);
    if (!blob) throw new Error(`Missing referenced asset: ${path}`);
    const chunks = [];
    // Multiple of three preserves base64 boundaries when chunks are joined.
    for (let offset=0; offset<blob.size; offset+=49152) {
      const bytes = new Uint8Array(await blob.slice(offset,offset+49152).arrayBuffer());
      chunks.push(btoa(String.fromCharCode(...bytes)));
    }
    packed.push({path,type:blob.type || 'application/octet-stream',data:chunks.join('')});
  }
  return validateCapsule({capsuleVersion:1,palace:snapshot,assets:packed});
}
