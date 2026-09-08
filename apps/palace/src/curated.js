import * as THREE from 'three';

// Optional exhibit metadata. Older palace consumers can still read the ordinary
// scene, anchors and memories; only this viewer uses the curated regions.
export function readTour(palace) {
  const tour = palace.curatedTour;
  if (!tour) return null;
  const vector = v => Array.isArray(v) && v.length === 3 && v.every(Number.isFinite);
  if (tour.version !== 1 || typeof tour.title !== 'string' || !tour.title.trim() ||
      typeof tour.subtitle !== 'string' || !/^[a-f0-9]{64}$/.test(tour.sceneSha256) ||
      !Array.isArray(tour.regions) || tour.regions.length < 3 || tour.regions.length > 5 ||
      new Set(tour.regions.map(r => r.anchorId)).size !== tour.regions.length) {
    throw new Error('Invalid curated exhibit metadata.');
  }
  for (const r of tour.regions) {
    const anchor = palace.anchors.find(a => a.id === r.anchorId);
    if (!anchor?.memoryIds.length || !vector(r.center) || !vector(r.halfSize) ||
        r.halfSize.some(v => v <= 0) || !vector(r.camera?.position) || !vector(r.camera?.target) ||
        r.camera.position.every((v,i) => v === r.camera.target[i])) {
      throw new Error('Invalid curated object region.');
    }
  }
  return tour;
}

export async function verifyTourScene(tour, bytes) {
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const hash = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2,'0')).join('');
  if (hash !== tour.sceneSha256) throw new Error('Curated scene hash mismatch. Object regions are disabled.');
}

const boxFor = region => new THREE.Box3(
  new THREE.Vector3(...region.center).sub(new THREE.Vector3(...region.halfSize)),
  new THREE.Vector3(...region.center).add(new THREE.Vector3(...region.halfSize)),
);

export function regionAtPoint(tour, localPoint) {
  // First visible splat hit only: no selection through foreground geometry.
  return tour.regions.find(r => boxFor(r).containsPoint(localPoint));
}

export function projectRegion(region, mesh, camera, width, height) {
  const points = [];
  for (const x of [-1,1]) for (const y of [-1,1]) for (const z of [-1,1]) {
    const p = new THREE.Vector3(...region.center).add(new THREE.Vector3(
      x*region.halfSize[0], y*region.halfSize[1], z*region.halfSize[2],
    )).applyMatrix4(mesh.matrixWorld).project(camera);
    if (p.z < -1 || p.z > 1) return null;
    points.push([(p.x+1)*width/2,(1-p.y)*height/2]);
  }
  return {left:Math.min(...points.map(p=>p[0])),top:Math.min(...points.map(p=>p[1])),
    width:Math.max(...points.map(p=>p[0]))-Math.min(...points.map(p=>p[0])),
    height:Math.max(...points.map(p=>p[1]))-Math.min(...points.map(p=>p[1]))};
}
