import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';

// Generic synthetic records only; no selected-app or personal content.
const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64');
const jsonFile = (value,name='test.json') => ({name,mimeType:'application/json',buffer:Buffer.from(JSON.stringify(value))});
const draft = () => ({schemaVersion:0,scene:null,anchors:Array.from({length:5},(_,i)=>({id:`a${i}`,label:`Place ${i+1}`,position:[i,0,0],memoryIds:i===0?['m0','m1','m2']:[]})),memories:Array.from({length:3},(_,i)=>({id:`m${i}`,title:`Synthetic memory ${i+1}`,body:'Synthetic portability check. No real capture or inferred relationship.',cue:'Find the synthetic record.',media:[{kind:'image',asset:'media/pixel.png',alt:'Synthetic pixel'}],source:{kind:'fixture',app:`Synthetic app ${i%2+1}`,locator:'Test-only record',capturedAt:'2026-09-08T18:00:00Z',evidenceAsset:'evidence/pixel.png'}}))});

test('freeze and reopen one portable file in a fresh browser; frozen guards and editable copy',async({page,browser},info)=>{
  const errors=[],failures=[];
  const observe=p=>{
    p.on('pageerror',e=>errors.push(e.message));
    p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    p.on('response',r=>{if(r.status()>=400)failures.push(`${r.status()} ${r.url()}`);});
    p.on('requestfailed',r=>failures.push(r.url()));
  };
  observe(page); await page.goto('/');
  const p=draft();
  await page.locator('#file-input').setInputFiles(jsonFile(p));
  await page.locator('#capsule-title').fill('A synthetic moment');
  await page.locator('#freeze').click();
  await expect(page.locator('#notice')).toContainText('Missing referenced asset');
  await expect(page.locator('#capsule-status')).toHaveText('Editable draft');
  await page.locator('#file-input').setInputFiles([{name:'pixel.png',mimeType:'image/png',buffer:image},{name:'unused.txt',mimeType:'text/plain',buffer:Buffer.from('must not be exported')}]);
  const pending=page.waitForEvent('download'); await page.locator('#freeze').click();
  const download=await pending, file=await download.path(), original=readFileSync(file,'utf8'), container=JSON.parse(original);
  expect(container.capsuleVersion).toBe(1); expect(container.palace.capsule.title).toBe('A synthetic moment');
  expect(container.assets.map(a=>a.path).sort()).toEqual(['evidence/pixel.png','media/pixel.png']);
  expect(container.assets.every(a=>Buffer.from(a.data,'base64').equals(image))).toBe(true);
  expect(container.palace.memories).toHaveLength(3);
  expect(new Set(container.palace.memories.map(m=>m.source.app)).size).toBe(2);
  const context=await browser.newContext({viewport:{width:1440,height:1000}}), reopened=await context.newPage(); observe(reopened);
  await reopened.goto('/'); await expect(reopened.locator('#card')).toContainText('A place waiting for a story');
  await reopened.locator('#file-input').setInputFiles(jsonFile(container,'capsule.json'));
  await expect(reopened.locator('#notice')).toContainText('Capsule reopened');
  await expect(reopened.locator('#capsule-title')).toHaveValue('A synthetic moment');
  await expect(reopened.locator('#capsule-status')).toContainText(container.palace.capsule.frozenAt);
  await expect(reopened.locator('#capsule-title')).toBeDisabled();
  await expect(reopened.getByLabel('Move memory to')).toBeDisabled();
  await expect(reopened.locator('#place-label')).toBeDisabled();
  await expect(reopened.locator('#card')).toContainText('Source captured: 2026-09-08T18:00:00Z');
  await expect(reopened.locator('#card')).toContainText('Fixture — synthetic content');
  await expect.poll(()=>reopened.locator('#card img').evaluateAll(imgs=>imgs.length===2&&imgs.every(i=>i.complete&&i.naturalWidth>0))).toBe(true);
  // Guard handlers even if browser DOM controls are enabled programmatically.
  await reopened.evaluate(()=>{
    document.getElementById('place-label').value='Unexpected mutation';
    document.getElementById('place-form').dispatchEvent(new Event('submit',{cancelable:true}));
    const select=document.querySelector('[aria-label="Move memory to"]'); select.value='a1'; select.dispatchEvent(new Event('change'));
  });
  await reopened.locator('#file-input').setInputFiles(jsonFile([{...p.memories[0],title:'Unexpected mutation'}]));
  await expect(reopened.locator('#notice')).toContainText('read-only');
  const bad=structuredClone(container); bad.assets.pop();
  await reopened.locator('#file-input').setInputFiles(jsonFile(bad));
  await expect(reopened.locator('#notice')).toContainText('Missing referenced asset');
  await reopened.getByRole('button',{name:'Begin recall'}).click();
  await expect(reopened.getByRole('button',{name:'Reveal memory & source'})).toBeDisabled();
  await reopened.locator('#places button').first().click();
  await reopened.getByRole('button',{name:'Reveal memory & source'}).click();
  await expect(reopened.locator('#card')).toContainText('Synthetic memory 1');
  await reopened.getByRole('button',{name:'End recall'}).click();
  await reopened.locator('#save').click(); await expect(reopened.locator('#notice')).toContainText('Saved on this device');
  await reopened.reload(); await expect(reopened.locator('#capsule-status')).toContainText('Read-only snapshot');
  await expect.poll(()=>reopened.locator('#card img').evaluateAll(imgs=>imgs.length===2&&imgs.every(i=>i.complete&&i.naturalWidth>0))).toBe(true);
  await reopened.screenshot({path:info.outputPath('frozen-capsule.png'),fullPage:true});
  const again=reopened.waitForEvent('download'); await reopened.locator('#export').click();
  expect(JSON.parse(readFileSync(await (await again).path(),'utf8'))).toEqual(container);
  await reopened.getByRole('button',{name:'Make editable copy'}).click();
  await expect(reopened.locator('#capsule-status')).toHaveText('Editable draft');
  await expect(reopened.getByLabel('Move memory to')).toBeEnabled();
  await reopened.getByLabel('Move memory to').selectOption('a1');
  await reopened.locator('#placement summary').click(); await reopened.locator('#place-label').fill('Edited place');
  await reopened.getByRole('button',{name:'Update place',exact:true}).click();
  const edited=reopened.waitForEvent('download'); await reopened.locator('#export').click();
  const copy=JSON.parse(readFileSync(await (await edited).path(),'utf8'));
  expect(copy.capsule.frozenAt).toBeUndefined(); expect(copy.capsule.id).not.toBe(container.palace.capsule.id);
  expect(copy.anchors[1].label).toBe('Edited place'); expect(readFileSync(file,'utf8')).toBe(original);
  await reopened.setViewportSize({width:390,height:844}); await reopened.screenshot({path:info.outputPath('capsule-mobile.png'),fullPage:true});
  expect(errors).toEqual([]); expect(failures).toEqual([]); await context.close();
});

test('portable scene bytes render after reopen; generated setting is labeled',async({page,browser},info)=>{
  const errors=[]; const watch=p=>{p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});}; watch(page);
  const p=draft(); p.memories=[]; p.anchors.forEach(a=>a.memoryIds=[]);
  // One synthetic Gaussian: tests the renderer seam, never a real-room claim.
  const splat=Buffer.alloc(32); for(const offset of [12,16,20])splat.writeFloatLE(0.2,offset);
  splat.set([220,160,80,255,255,128,128,128],24);
  p.scene={id:'synthetic-scene',asset:'scene/test.splat',format:'splat',provenance:{kind:'generated',attribution:'Synthetic test Gaussian, created for this test.'},transform:{position:[0,0,0],rotation:[0,0,0,1],scale:1},camera:{position:[0,0,3],target:[0,0,0]}};
  await page.goto('/'); await page.locator('#file-input').setInputFiles([jsonFile(p),{name:'test.splat',mimeType:'application/octet-stream',buffer:splat}]);
  await expect(page.locator('#render-status')).toContainText('Gaussian splats loaded');
  await expect(page.locator('#scene-kind')).toHaveText('Generated setting — not a captured place');
  const pending=page.waitForEvent('download'); await page.locator('#freeze').click();
  const c=JSON.parse(readFileSync(await(await pending).path(),'utf8'));
  expect(c.assets).toHaveLength(1); expect(Buffer.from(c.assets[0].data,'base64')).toEqual(splat);
  const context=await browser.newContext(), reopened=await context.newPage();watch(reopened);
  await reopened.goto('/'); await reopened.locator('#file-input').setInputFiles(jsonFile(c));
  await expect(reopened.locator('#render-status')).toContainText('Gaussian splats loaded');
  await expect(reopened.locator('#empty')).toBeHidden();
  await expect(reopened.locator('#scene-kind')).toHaveText('Generated setting — not a captured place');
  await reopened.screenshot({path:info.outputPath('portable-synthetic-scene.png')});
  expect(errors).toEqual([]);await context.close();
});
