import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const json=value=>({name:'test.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(value))});
const pixel=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64');
async function exported(page,button='#export') {
  const pending=page.waitForEvent('download');await page.locator(button).click();
  return JSON.parse(readFileSync(await(await pending).path(),'utf8'));
}
async function create(page,file,title) {
  await page.locator('#add-memory').evaluate(el=>el.open=true);
  await page.locator('#memory-media').setInputFiles(file);
  for(const [key,value] of Object.entries({title,body:'Presenter supplied text.',cue:'Selected moment?'}))await page.locator(`#memory-${key}`).fill(value);
  await page.locator('#create-memory').click();
}
async function edit(page,title) {
  await page.locator('#memory-editor summary').click();
  for(const [key,value] of Object.entries({title,body:'Corrected body.',cue:'Corrected cue?'}))await page.locator(`#memory-editor [name=${key}]`).fill(value);
  await page.getByRole('button',{name:'Update memory',exact:true}).click();
  await expect(page.locator('#notice')).toContainText('Memory text updated');
}
async function saved(page) {
  await page.locator('#save').click();await expect(page.locator('#notice')).toContainText('Saved on this device');await page.reload();
}
async function play(page) {
  await page.locator('#card video').evaluate(async el=>{el.muted=true;await el.play();});
  await expect.poll(()=>page.locator('#card video').evaluate(el=>el.currentTime)).toBeGreaterThan(0);
  await page.locator('#card video').evaluate(el=>el.pause());
}
test('local media and edits survive freeze, fresh reopen and local save with provenance intact',async({page,browser},info)=>{
  const errors=[],failures=[];
  const watch=p=>{
    p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    p.on('response',r=>{if(r.status()>=400)failures.push(r.url());});
    p.on('request',r=>{if(!['http://127.0.0.1:','blob:','data:'].some(prefix=>r.url().startsWith(prefix)))failures.push(r.url());});
  };
  watch(page);await page.goto('/');await expect(page.locator('#places button')).toHaveCount(5);
  if(process.env.PALACE_SCENE_BUNDLE){
    await page.locator('#folder-input').setInputFiles(process.env.PALACE_SCENE_BUNDLE);
    await expect(page.locator('#render-status')).toContainText('Gaussian splats loaded');
  }
  // Only an explicitly supplied environment path opts into private photo testing.
  const photo=process.env.PALACE_SELECTED_PHOTO||{name:'pixel.png',mimeType:'image/png',buffer:pixel};
  await create(page,photo,'Selected photo');await expect(page.locator('#notice')).toContainText('Manual selected media added');
  await expect.poll(()=>page.locator('#card img').evaluate(el=>el.naturalWidth)).toBeGreaterThan(0);
  const original=await exported(page);expect(original.memories[0].source.kind).toBe('manual');expect(original.memories[0].source.evidenceAsset).toBeNull();
  await edit(page,'Corrected photo');const corrected=await exported(page);
  expect(corrected.memories[0]).toEqual({...original.memories[0],title:'Corrected photo',body:'Corrected body.',cue:'Corrected cue?'});
  await saved(page);await expect(page.locator('#card h2')).toHaveText('Corrected photo');
  for(const [name,mimeType] of [['bad.txt','text/plain'],['broken.png','image/png'],['broken.webm','video/webm']]){
    await create(page,{name,mimeType,buffer:Buffer.from('not media')},'Rejected');await expect(page.locator('#notice')).toContainText('Memory rejected');expect(await exported(page)).toEqual(corrected);
  }
  // Generated canvas clip uses neither camera nor microphone.
  const video=Buffer.from(await page.evaluate(async()=>{
    const c=document.createElement('canvas');c.width=96;c.height=64;const ctx=c.getContext('2d'),stream=c.captureStream(12),chunks=[];
    const r=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8'});r.ondataavailable=e=>chunks.push(e.data);const done=new Promise(resolve=>r.onstop=resolve);r.start();
    for(let i=0;i<12;i++){ctx.fillStyle=i%2?'#c09040':'#203060';ctx.fillRect(0,0,96,64);await new Promise(resolve=>setTimeout(resolve,85));}
    r.stop();await done;stream.getTracks().forEach(t=>t.stop());return Array.from(new Uint8Array(await new Blob(chunks).arrayBuffer()));
  }));
  await page.locator('#places button').nth(1).click();await create(page,{name:'synthetic.webm',mimeType:'video/webm',buffer:video},'Synthetic video');await expect(page.locator('#notice')).toContainText('Manual selected media added');await play(page);
  // Synthetic imported capture checks provenance preservation, not real capture.
  const captured={id:'capture-test',title:'Original text',body:'Synthetic source assertion',cue:'Source cue',media:[],source:{kind:'computer-use',app:'Synthetic test app',locator:'Synthetic locator',capturedAt:'2026-09-08T18:00:00Z',evidenceAsset:'proof.png'}};
  await page.locator('#places button').nth(2).click();await page.locator('#file-input').setInputFiles([json([captured]),{name:'proof.png',mimeType:'image/png',buffer:pixel}]);
  await edit(page,'Corrected capture text');const edited=await exported(page);
  expect(edited.memories[2]).toEqual({...captured,title:'Corrected capture text',body:'Corrected body.',cue:'Corrected cue?'});
  const container=await exported(page,'#freeze');expect(container.assets).toHaveLength(edited.scene?4:3);
  const expected=[process.env.PALACE_SELECTED_PHOTO?readFileSync(process.env.PALACE_SELECTED_PHOTO):pixel,video];
  for(let i=0;i<2;i++)expect(Buffer.from(container.assets.find(a=>a.path===edited.memories[i].media[0].asset).data,'base64')).toEqual(expected[i]);
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),fresh=await context.newPage();watch(fresh);
  try{
    await fresh.goto('/');await fresh.locator('#file-input').setInputFiles(json(container));await expect(fresh.locator('#card h2')).toHaveText('Corrected photo');
    if(edited.scene)await expect(fresh.locator('#render-status')).toContainText('Gaussian splats loaded');
    await expect.poll(()=>fresh.locator('#card img').evaluate(el=>el.naturalWidth)).toBeGreaterThan(0);
    await expect(fresh.locator('#memory-media')).toBeDisabled();await expect(fresh.locator('#memory-editor [name=title]')).toBeDisabled();
    await fresh.locator('#memory-editor form').evaluate(el=>{el.elements.title.value='Guard bypass';el.dispatchEvent(new Event('submit',{cancelable:true}));});await expect(fresh.locator('#notice')).toContainText('Edit rejected: Frozen');
    await fresh.locator('#memory-form').evaluate(el=>el.dispatchEvent(new Event('submit',{cancelable:true})));await expect(fresh.locator('#notice')).toContainText('Memory rejected: Frozen');expect(await exported(fresh,'#freeze')).toEqual(container);
    await saved(fresh);await expect(fresh.locator('#card h2')).toHaveText('Corrected photo');await fresh.locator('#places button').nth(1).click();await play(fresh);
    await fresh.screenshot({path:info.outputPath('local-video-frozen.png'),fullPage:true});
    await fresh.locator('#editable').click();await edit(fresh,'Editable copy video');const copy=await exported(fresh);
    expect(copy.memories[1].source).toEqual(container.palace.memories[1].source);expect(copy.capsule.id).not.toBe(container.palace.capsule.id);expect(copy.capsule.frozenAt).toBeUndefined();
    await saved(fresh);await fresh.locator('#places button').nth(1).click();await expect(fresh.locator('#card h2')).toHaveText('Editable copy video');
    await fresh.locator('#memory-editor summary').click();await fresh.screenshot({path:info.outputPath('memory-editor.png'),fullPage:true});await fresh.setViewportSize({width:390,height:844});await fresh.screenshot({path:info.outputPath('memory-editor-mobile.png'),fullPage:true});
    await fresh.locator('#file-input').setInputFiles(json(container));await fresh.locator('#places button').nth(1).click();await expect(fresh.locator('#card h2')).toHaveText('Synthetic video');expect(await exported(fresh,'#freeze')).toEqual(container);
    expect(errors).toEqual([]);expect(failures).toEqual([]);
  }finally{await context.close();}
});
