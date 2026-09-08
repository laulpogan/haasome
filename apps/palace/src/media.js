// Decode only the file the presenter selected. No upload or source-app access.
export async function decodeSelectedMedia(file) {
  if (!file?.size) throw new Error('Choose a non-empty photo or video.');
  const extension = file.name.split('.').pop().toLowerCase();
  const fallback = {jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',gif:'image/gif',webp:'image/webp',avif:'image/avif',bmp:'image/bmp',svg:'image/svg+xml',mp4:'video/mp4',m4v:'video/mp4',webm:'video/webm',ogv:'video/ogg',mov:'video/quicktime'};
  const type = file.type || fallback[extension] || '';
  const kind = type.startsWith('image/') ? 'image' : type.startsWith('video/') ? 'video' : null;
  if (!kind) throw new Error('Choose an image or browser-supported video file.');
  const blob = file.type ? file : file.slice(0,file.size,type);
  const url = URL.createObjectURL(blob);
  const element = document.createElement(kind === 'image' ? 'img' : 'video');
  let timer;
  try {
    await Promise.race([
      new Promise((resolve,reject) => {
        const invalid = () => reject(new Error('This browser cannot decode that media. Try JPEG/PNG or a supported MP4/WebM video.'));
        element.onerror = invalid;
        if (kind === 'image') {
          element.src = url;
          element.decode().then(() => element.naturalWidth > 0 ? resolve() : invalid(), invalid);
        } else {
          element.preload = 'auto'; element.muted = true;
          element.onloadeddata = () => element.videoWidth > 0 && element.videoHeight > 0 ? resolve() : invalid();
          element.src = url; element.load();
        }
      }),
      new Promise((_,reject) => { timer = setTimeout(() => reject(new Error('Media decode timed out. Try a smaller photo or short supported video.')),15000); }),
    ]);
    return {kind,blob};
  } finally {
    clearTimeout(timer); element.onerror = null; element.onloadeddata = null;
    element.removeAttribute('src'); if (kind === 'video') element.load();
    URL.revokeObjectURL(url);
  }
}
