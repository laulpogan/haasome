import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const capsule=process.env.OBJECT_MEMORY_CAPSULE;
test('manual geometry region links, searches and survives frozen reopen',async({page,browser},info)=>{
  test.skip(!capsule,'Requires presenter-selected captured capsule');
  const errors=[],failed=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
  await page.goto('/');await page.locator('#file-input').setInputFiles(capsule);
  await expect(page.locator('#render-status')).toContainText('Gaussian splats loaded');
  await page.getByRole('button',{name:'Make editable copy'}).click();
  await page.screenshot({path:info.outputPath('before.png')});
  const box=await page.locator('#canvas canvas').boundingBox();
  await page.getByRole('button',{name:'Select surface region',exact:true}).click();
  await page.mouse.click(box.x+box.width*.35,box.y+box.height*.69);
  await expect(page.getByLabel('Object name',{exact:true})).toBeVisible();
  await page.getByLabel('Object name',{exact:true}).fill('Manual table candidate');await page.getByRole('button',{name:'Rename object',exact:true}).click();
  await page.getByRole('button',{name:'Confirm region',exact:true}).click();
  await expect.poll(()=>page.locator('#object-highlight circle').count()).toBeGreaterThan(4);
  await page.getByLabel('Association reason').fill('This surface cues the selected trip story; location is not inferred.');await page.getByRole('button',{name:'Attach memory',exact:true}).click();
  await page.getByLabel('Find object or memory').fill('trip');await expect(page.locator('#object-list button')).toHaveCount(1);
  await page.screenshot({path:info.outputPath('linked.png')});
  await page.getByRole('button',{name:'Save on this device',exact:true}).click();await expect(page.locator('#notice')).toContainText('Saved on this device');
  await page.reload();await expect(page.locator('#render-status')).toContainText('Gaussian splats loaded');await page.locator('#object-list button').click();
  await expect(page.locator('#object-detail')).toContainText('This surface cues');
  const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Freeze capsule',exact:true}).click();const download=await pending;
  await download.saveAs(info.outputPath('manual-object-capsule.json'));
  const frozen=JSON.parse(readFileSync(await download.path(),'utf8'));
  expect(frozen.palace.objectMemory.objects[0].binding.samples.length).toBeGreaterThan(4);
  expect(frozen.palace.objectMemory.objects[0].corrections).toHaveLength(1);
  const context=await browser.newContext(),fresh=await context.newPage();await fresh.goto('/');await fresh.locator('#file-input').setInputFiles(info.outputPath('manual-object-capsule.json'));await expect(fresh.locator('#render-status')).toContainText('Gaussian splats loaded');await fresh.locator('#object-list button').click();
  await expect(fresh.getByRole('button',{name:'Confirm region',exact:true})).toBeDisabled();await expect(fresh.locator('#object-detail')).toContainText('This surface cues');await fresh.screenshot({path:info.outputPath('reopened.png')});await context.close();
  expect(errors).toEqual([]);expect(failed).toEqual([]);
});

test('Spark opacity threshold excludes transient low-opacity geometry and background',async({page},info)=>{
  const make=(alpha)=>{
    const splat=Buffer.alloc(32);for(const offset of [12,16,20])splat.writeFloatLE(.4,offset);splat.set([220,160,80,alpha,255,128,128,128],24);return splat;
  };
  const p={schemaVersion:0,scene:{id:'opacity-test',asset:'test.splat',format:'splat',provenance:{kind:'fixture',attribution:'Synthetic opacity boundary test'},transform:{position:[0,0,0],rotation:[0,0,0,1],scale:1},camera:{position:[0,0,3],target:[0,0,0]}},anchors:[{id:'a',label:'Fixture anchor',position:[9,9,9],memoryIds:[]}],memories:[]};
  await page.goto('/');
  const files=alpha=>[{name:'palace.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(p))},{name:'test.splat',mimeType:'application/octet-stream',buffer:make(alpha)}];
  await page.locator('#file-input').setInputFiles(files(50));await expect(page.locator('#render-status')).toContainText('Gaussian splats loaded');await page.getByRole('button',{name:'Select surface region',exact:true}).click();
  const box=await page.locator('#canvas canvas').boundingBox();await page.mouse.click(box.x+box.width/2,box.y+box.height/2);await expect(page.locator('#notice')).toContainText('Background miss');await expect(page.locator('#object-list > button')).toHaveCount(0);
  await page.locator('#file-input').setInputFiles(files(255));await expect(page.locator('#notice')).toContainText('Imported 2 files');await expect(page.locator('#render-status')).toContainText('Gaussian splats loaded');
  // Selection mode remains armed after a miss.
  await page.mouse.click(box.x+box.width/2,box.y+box.height/2);await expect(page.locator('#object-list > button')).toHaveCount(1);
  await page.getByRole('button',{name:'Select surface region',exact:true}).click();await page.mouse.click(box.x+box.width*.92,box.y+box.height*.45);await expect(page.locator('#notice')).toContainText('Background miss');
});

test('occluding splats hide supported markers and prevent selecting the hidden object',async({page},info)=>{
  const errors=[],failed=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
  const gaussian=(position,scale,color)=>{
    const bytes=Buffer.alloc(32);position.forEach((n,i)=>bytes.writeFloatLE(n,i*4));
    for(const offset of [12,16,20])bytes.writeFloatLE(scale,offset);
    bytes.set([...color,255,255,128,128,128],24);return bytes;
  };
  // The red splat lies off the front ray and on the diagonal camera's ray to
  // the green target. Both remain in the same byte-identical scene throughout.
  const bytes=Buffer.concat([gaussian([0,0,0],.3,[40,210,100]),gaussian([1.5,0,1.5],.5,[235,65,50])]);
  const scene={id:'occlusion-test',asset:'occlusion.splat',format:'splat',provenance:{kind:'fixture',attribution:'Two synthetic Gaussians for visibility and hit-selection checks'},transform:{position:[0,0,0],rotation:[0,0,0,1],scale:1},camera:{position:[0,0,4],target:[0,0,0]}};
  const palace={schemaVersion:0,scene,anchors:[{id:'a',label:'Fixture anchor',position:[9,9,9],memoryIds:[]}],memories:[]};
  const json=(name,value)=>({name,mimeType:'application/json',buffer:Buffer.from(JSON.stringify(value))});
  await page.goto('/');await page.locator('#file-input').setInputFiles([json('palace.json',palace),{name:'occlusion.splat',mimeType:'application/octet-stream',buffer:bytes}]);
  await expect(page.locator('#notice')).toContainText('Imported 2 files');await expect(page.locator('#render-status')).toContainText('Gaussian splats loaded');
  await page.getByRole('button',{name:'Select surface region',exact:true}).click();
  const box=await page.locator('#canvas canvas').boundingBox(),center={x:box.x+box.width/2,y:box.y+box.height/2};
  await page.mouse.click(center.x,center.y);await page.getByRole('button',{name:'Confirm region',exact:true}).click();
  await expect.poll(()=>page.locator('#object-highlight circle').count()).toBeGreaterThan(4);await expect(page.locator('#pins')).toBeHidden();
  await page.mouse.click(center.x,center.y);await expect(page.locator('#notice')).toContainText('Selected object: Surface region 1');await page.screenshot({path:info.outputPath('visible.png')});
  await page.locator('#file-input').setInputFiles(json('scene.json',{...scene,camera:{position:[4,0,4],target:[0,0,0]}}));
  await expect(page.locator('#notice')).toContainText('Imported 1 files');await expect(page.locator('#render-status')).toContainText('Gaussian splats loaded');
  // Re-selecting the same object must not draw its markers through the occluder.
  await page.locator('#object-list > button').click();
  const observedCounts=await page.evaluate(()=>new Promise(resolve=>{const counts=[];function observe(){counts.push(document.querySelectorAll('#object-highlight circle').length);if(counts.length===30)resolve(counts);else requestAnimationFrame(observe);}requestAnimationFrame(observe);}));
  expect(Math.max(...observedCounts)).toBe(0);
  await page.mouse.click(center.x,center.y);await expect(page.locator('#notice')).toContainText('No confirmed object at this surface');
  await page.screenshot({path:info.outputPath('occluded.png')});
  await page.locator('#file-input').setInputFiles(json('scene.json',scene));await expect(page.locator('#notice')).toContainText('Imported 1 files');await expect(page.locator('#render-status')).toContainText('Gaussian splats loaded');
  await page.locator('#object-list > button').click();await expect.poll(()=>page.locator('#object-highlight circle').count()).toBeGreaterThan(4);
  const marker=await page.locator('#object-highlight circle').first().boundingBox();await page.mouse.click(marker.x+marker.width/2,marker.y+marker.height/2);await expect(page.locator('#notice')).toContainText('Selected object: Surface region 1');
  await page.screenshot({path:info.outputPath('visible-again.png')});expect(errors).toEqual([]);expect(failed).toEqual([]);
});
