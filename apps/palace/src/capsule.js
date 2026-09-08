import {assetPath, validatePalace, resolveAsset} from './contract.js';

export function referencedAssets(palace) {
  return [...new Set([
    ...(palace.scene ? [palace.scene.asset] : []),
    ...palace.memories.flatMap(m => [...m.media.map(x => x.asset), ...(m.source.evidenceAsset ? [m.source.evidenceAsset] : [])]),
  ])];
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
    if (typeof asset.data !== 'string' || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(asset.data)) throw new Error('Invalid asset base64.');
    seen.add(asset.path);
  }
  for (const path of required) if (!seen.has(path)) throw new Error(`Missing referenced asset: ${path}`);
  return value;
}

export function unpackCapsule(value) {
  validateCapsule(value);
  return new Map(value.assets.map(a => [a.path, new Blob([Uint8Array.from(atob(a.data), c => c.charCodeAt(0))], {type:a.type})]));
}

export async function freezeCapsule(palace, assets, title) {
  const snapshot = structuredClone(validatePalace(palace));
  if (!snapshot.capsule?.frozenAt) snapshot.capsule = {id:crypto.randomUUID(), title:title.trim(), frozenAt:new Date().toISOString()};
  validatePalace(snapshot);
  const packed = [];
  for (const path of referencedAssets(snapshot)) {
    const blob = resolveAsset(assets,path);
    if (!blob) throw new Error(`Missing referenced asset: ${path}`);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = '';
    for (let i=0; i<bytes.length; i+=32768) binary += String.fromCharCode(...bytes.subarray(i,i+32768));
    packed.push({path,type:blob.type || 'application/octet-stream',data:btoa(binary)});
  }
  return validateCapsule({capsuleVersion:1,palace:snapshot,assets:packed});
}
