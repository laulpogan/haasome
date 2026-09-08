// Gallery navigation never initializes WebGL, opens device storage or fetches scenes.
if (new URLSearchParams(location.search).has('gallery')) {
  document.body.replaceChildren();
  await import('./gallery.js');
} else {
  document.body.hidden = false;
  await import('./main.js');
  for (const id of ['file-input','folder-input']) document.getElementById(id).disabled = false;
}

document.body.inert = false;
