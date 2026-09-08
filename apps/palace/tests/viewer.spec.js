import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const sceneDir = process.env.PALACE_SCENE_BUNDLE;
const memoryDir = process.env.PALACE_MEMORY_BUNDLE;
test('local imports, genuine renderer, memories and recall survive reload', async ({page},testInfo) => {
  const errors=[], failed=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error') errors.push(m.text());});
  page.on('response',r=>{if(r.status()>=400) failed.push(`${r.status()} ${r.url()}`);});
  await page.goto('/');
  await expect(page.locator('#places button')).toHaveCount(5);
  await expect(page.locator('#empty')).toBeVisible();
  await page.locator('#file-input').setInputFiles('../../packages/contracts/examples/palace.fixture.json');
  await expect(page.locator('#render-status')).toContainText('Missing scene asset');
  await expect(page.locator('#card')).toContainText('Synthetic content');
  if (sceneDir) {
    await page.reload();
    // Directory selection preserves the producer's bundle-relative paths.
    await page.locator('#folder-input').setInputFiles(sceneDir);
    await expect(page.locator('#render-status')).toContainText('Gaussian splats loaded',{timeout:90000});
    await expect(page.locator('#empty')).toBeHidden();
    await expect(page.locator('#scene-kind')).toContainText('Licensed sample');
    await expect(page.locator('#scene-title')).toHaveText('Memory palace');
    await page.locator('.scene-source summary').click();
    await expect(page.locator('#attribution')).toBeVisible();
    await expect(page.locator('#attribution')).toContainText('CC BY 4.0');
    await page.locator('.scene-source summary').click();
    console.log('RENDER:',await page.locator('#render-status').textContent());
    await page.evaluate(() => new Promise(resolve => { let n=0; const start=performance.now(); function frame(){ if(++n===30) resolve(performance.now()-start); else requestAnimationFrame(frame); } requestAnimationFrame(frame); })).then(ms=>console.log('30 FRAME WINDOW MS:',ms));
    await page.screenshot({path:testInfo.outputPath('real-room.png')});
    await page.getByRole('button',{name:'Visit Third place',exact:true}).click();
    await expect(page.locator('#card h2')).toHaveText('Third place');
  }
  if (memoryDir) {
    await page.locator('#places button').nth(1).click();
    await page.locator('#folder-input').setInputFiles(memoryDir);
    await expect(page.locator('#card')).toContainText('Fixture memory');
    await expect(page.locator('#card')).toContainText('Fixture — synthetic content');
    await page.screenshot({path:testInfo.outputPath('c-fixture-import.png')});
  }
  // Selected media/evidence use nested paths and are persisted with their bytes.
  const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64');
  const memory = {id:'selected-media',title:'Selected test image',body:'Local media verification',cue:'Which picture did you place here?',media:[{kind:'image',asset:'assets/test/evidence.png',alt:'Selected test image'}],source:{kind:'fixture',app:'Test fixture',locator:'Local test',capturedAt:'2026-09-08T18:00:00Z',evidenceAsset:'assets/test/evidence.png'}};
  await page.locator('#file-input').setInputFiles([{name:'memories.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify([memory]))},{name:'evidence.png',mimeType:'image/png',buffer:image}]);
  const memoryPicker = page.getByLabel('Memory at this place');
  if(await memoryPicker.count()) await memoryPicker.selectOption('selected-media');
  await expect(page.locator('#card h2')).toHaveText('Selected test image');
  await expect(page.locator('#card img')).toHaveCount(2);
  await expect.poll(()=>page.locator('#card img').evaluateAll(imgs=>imgs.every(i=>i.complete && i.naturalWidth>0))).toBe(true);
  await page.getByLabel('Move memory to').selectOption({index:2});
  await page.locator('#placement summary').click();
  await page.locator('#place-label').fill('Picture place');
  await page.getByRole('button',{name:'Update place',exact:true}).click();
  await page.getByRole('button',{name:'Begin recall'}).click();
  await expect(page.locator('#card')).not.toContainText('Local media verification');
  await expect(page.getByRole('button',{name:'Reveal memory & source'})).toBeDisabled();
  await page.locator('#places button').filter({hasText:'Picture place'}).click();
  await page.getByRole('button',{name:'Reveal memory & source'}).click();
  await expect(page.locator('#card')).toContainText('Local media verification');
  await page.getByRole('button',{name:'End recall'}).click();
  await page.getByRole('button',{name:'Save on this device'}).click();
  await expect(page.locator('#notice')).toContainText('Saved on this device');
  await page.reload();
  if(sceneDir) await expect(page.locator('#render-status')).toContainText('Gaussian splats loaded',{timeout:90000});
  await page.locator('#places button').filter({hasText:'Picture place'}).click();
  await expect(page.locator('#card h2')).toHaveText('Selected test image');
  await expect.poll(()=>page.locator('#card img').evaluateAll(imgs=>imgs.every(i=>i.complete && i.naturalWidth>0))).toBe(true);
  await page.screenshot({path:testInfo.outputPath('saved-palace.png')});
  const downloadPromise=page.waitForEvent('download'); await page.getByRole('button',{name:'Export JSON'}).click();
  const download=await downloadPromise; const exported=JSON.parse(readFileSync(await download.path(),'utf8'));
  expect(exported.anchors).toHaveLength(5); expect(exported.memories.some(m=>m.id==='selected-media')).toBe(true);
  await page.locator('#file-input').setInputFiles({name:'palace.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});
  await expect(page.locator('#places button')).toHaveCount(5);
  // Malformed import must leave the working palace intact and never fetch the URL.
  const bad=structuredClone(exported); bad.scene.asset='https://example.com/private';
  await page.locator('#file-input').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(bad))});
  await expect(page.locator('#notice')).toContainText('Import rejected');
  if(sceneDir) await expect(page.locator('#render-status')).toContainText('Gaussian splats loaded',{timeout:90000});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:testInfo.outputPath('mobile.png'),fullPage:true});
  expect(errors).toEqual([]); expect(failed).toEqual([]);
});
