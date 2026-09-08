import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
test.use({video:{mode:'on',size:{width:1440,height:1000}}});
const capsule=process.env.OBJECT_MEMORY_CAPSULE,bundle=process.env.RECOGNITION_BUNDLE;
test('recognized source regions lift through the real viewer and retain source evidence',async({page,browser},info)=>{
  test.skip(!capsule||!bundle,'Requires captured capsule and actual two-view model bundle');
  const errors=[],failed=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
  await page.goto('/');await page.locator('#file-input').setInputFiles(capsule);await expect(page.locator('#render-status')).toContainText('Gaussian splats loaded');await page.getByRole('button',{name:'Make editable copy'}).click();
  const started=Date.now();await page.locator('#folder-input').setInputFiles(bundle);await expect(page.locator('#notice')).toContainText('supported object regions',{timeout:90000});console.log('LIFT',Date.now()-started,await page.locator('#notice').textContent());
  await page.screenshot({path:info.outputPath('proposals.png')});
  const names=await page.locator('#object-list > button').allTextContents();console.log('OBJECTS',names);expect(names.length).toBeGreaterThanOrEqual(3);
  for(let i=0;i<names.length;i++){
    await page.locator('#object-list > button').filter({hasText:names[i]}).click();
    if(names[i].includes('landscape')){await page.getByLabel('Correction reason').fill('Occluding person and transient reconstruction overlap the artwork; static surface meaning is unsupported.');await page.getByRole('button',{name:'Reject region',exact:true}).click();continue;}
    for(const view of [1,2]){await page.getByRole('button',{name:`Inspect source view ${view}`,exact:true}).click();await expect.poll(()=>page.locator('#object-highlight circle').count()).toBeGreaterThanOrEqual(3);await page.screenshot({path:info.outputPath(`object-${i}-view-${view}.png`)});}
    await page.getByRole('button',{name:'Confirm region',exact:true}).click();
    for(const view of [1,2]){
      await page.getByRole('button',{name:`Inspect source view ${view}`,exact:true}).click();
      await expect.poll(()=>page.locator('#object-highlight circle').count()).toBeGreaterThan(0);
      const c=await page.locator('#object-highlight circle').first().boundingBox();await page.mouse.click(c.x+c.width/2,c.y+c.height/2);
      await expect(page.locator('#notice')).toContainText('Selected object:');
    }
  }
  await page.locator('#object-list > button').filter({hasText:'Blue table tennis table'}).click();
  await page.getByLabel('Object name',{exact:true}).fill('Table-tennis tabletop');await page.getByRole('button',{name:'Rename object',exact:true}).click();
  await page.getByRole('button',{name:'Accept suggested link',exact:true}).click();
  // Clicking a visible geometry sample exercises surface selection and opens video.
  await page.getByRole('button',{name:'Inspect source view 1',exact:true}).click();await expect.poll(()=>page.locator('#object-highlight circle').count()).toBeGreaterThan(0);
  const c=await page.locator('#object-highlight circle').first().boundingBox();await page.mouse.click(c.x+c.width/2,c.y+c.height/2);await expect(page.locator('#card video')).toHaveCount(1);
  await page.locator('#card video').evaluate(v=>{v.muted=true;return v.play();});await expect.poll(()=>page.locator('#card video').evaluate(v=>v.currentTime)).toBeGreaterThan(0);
  await page.getByLabel('Find object or memory').fill('table');await expect(page.locator('#object-list > button')).toHaveCount(1);await page.getByLabel('Find object or memory').fill('');
  await page.locator('#card video').scrollIntoViewIfNeeded();await page.screenshot({path:info.outputPath('table-memory.png')});
  const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Freeze capsule',exact:true}).click();const download=await pending;const path=info.outputPath('recognized-room-capsule.json');await download.saveAs(path);
  const saved=JSON.parse(readFileSync(path,'utf8'));expect(saved.palace.objectMemory.objects.filter(o=>o.status==='confirmed').length).toBeGreaterThanOrEqual(3);expect(saved.assets.filter(a=>a.path.startsWith('recognition/'))).toHaveLength(3);
  const freshContext=await browser.newContext(),fresh=await freshContext.newPage();fresh.on('pageerror',e=>errors.push(e.message));await fresh.goto('/');await fresh.locator('#file-input').setInputFiles(path);await expect(fresh.locator('#render-status')).toContainText('Gaussian splats loaded');await fresh.locator('#object-list > button').filter({hasText:'Table-tennis tabletop'}).click();await expect(fresh.locator('#card video')).toHaveCount(1);await expect(fresh.getByRole('button',{name:'Confirm region',exact:true})).toBeDisabled();await fresh.screenshot({path:info.outputPath('reopened.png')});await freshContext.close();
  expect(errors).toEqual([]);expect(failed).toEqual([]);
});
