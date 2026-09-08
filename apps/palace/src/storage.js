function database() {
  return new Promise((resolve,reject) => {
    const request = indexedDB.open('haasome-palace',1);
    request.onupgradeneeded = () => request.result.createObjectStore('palace');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function saveLocal(palace, assets) {
  const db = await database();
  try { await new Promise((resolve,reject) => {
    const tx = db.transaction('palace','readwrite');
    tx.objectStore('palace').put({palace,assets:[...assets]}, 'current');
    tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error || new Error('Save aborted.'));
  }); } finally { db.close(); }
}
export async function loadLocal() {
  const db = await database();
  try { return await new Promise((resolve,reject) => {
    const req = db.transaction('palace').objectStore('palace').get('current');
    req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error);
  }); } finally { db.close(); }
}
