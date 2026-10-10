import {test,expect} from '@playwright/test';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
const source=process.env.RECOGNIZED_CAPSULE;
const jsonFile=(name,value)=>({name,mimeType:'application/json',buffer:Buffer.from(JSON.stringify(value))});
test('scene transforms, split corrections and stale hashes preserve frozen originals',async({page},info)=>{
  test.skip(!source,'Requires the observed recognized-room capsule');
  const errors=[],failed=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
  const original=readFileSync(source),container=JSON.parse(original),originalObjects=structuredClone(container.palace.objectMemory.objects);
  await page.goto('/');await page.locator('#file-input').setInputFiles(source);await expect(page.locator('#render-status')).toContainText('Gaussian splats loaded');await page.getByRole('button',{name:'Make editable copy'}).click();
  const scene=structuredClone(container.palace.scene);scene.transform.position=[.3,.2,-.1];scene.transform.scale=1.4;
  // Rotate the original scene transform around world Y; source poses should follow.
  const q=scene.transform.rotation,s=Math.sin(.15),c=Math.cos(.15);scene.transform.rotation=[c*q[0]+s*q[2],c*q[1]+s*q[3],c*q[2]-s*q[0],c*q[3]-s*q[1]];
  await page.locator('#file-input').setInputFiles(jsonFile('scene.json',scene));await expect(page.locator('#notice')).toContainText('Imported 1 files');await expect(page.locator('#render-status')).toContainText('Gaussian splats loaded');
  await page.locator('#object-list > button').filter({hasText:'Table-tennis tabletop'}).click();await page.getByRole('button',{name:'Inspect source view 1',exact:true}).click();await expect.poll(()=>page.locator('#object-highlight circle').count()).toBeGreaterThan(3);
  const sample=await page.locator('#object-highlight circle').first().boundingBox();await page.mouse.click(sample.x+sample.width/2,sample.y+sample.height/2);await expect(page.locator('#notice')).toContainText('Selected object: Table-tennis tabletop');
  await page.screenshot({path:info.outputPath('transformed-table.png')});
  const pending=page.waitForEvent('download');await page.locator('#export').click();const after=JSON.parse(readFileSync(await(await pending).path(),'utf8'));expect(after.objectMemory.objects).toEqual(originalObjects);
  // Record animation cadence while the real camera is orbiting with highlights.
  await page.evaluate(()=>{window.orbitFrames=[];let previous=performance.now();function frame(now){window.orbitFrames.push(now-previous);previous=now;if(window.orbitFrames.length<60)requestAnimationFrame(frame);}requestAnimationFrame(frame);});
  const box=await page.locator('#canvas canvas').boundingBox();await page.mouse.move(box.x+box.width*.55,box.y+box.height*.55);await page.mouse.down();await page.mouse.move(box.x+box.width*.62,box.y+box.height*.58,{steps:12});await page.mouse.up();await expect.poll(()=>page.evaluate(()=>window.orbitFrames.length)).toBe(60);
  const frames=await page.evaluate(()=>window.orbitFrames),sorted=[...frames].sort((a,b)=>a-b);const timing={sampleFrames:frames.length,p95FrameMs:sorted[Math.floor(sorted.length*.95)],maxFrameMs:Math.max(...frames)};writeFileSync(info.outputPath('navigation-timing.json'),JSON.stringify(timing,null,2));console.log('ORBIT TIMING',timing);
  await page.getByRole('button',{name:'Inspect source view 1',exact:true}).click();await expect.poll(()=>page.locator('#object-highlight circle').count()).toBeGreaterThan(0);
  await page.getByRole('button',{name:'Split region at surface',exact:true}).click();const splitAt=await page.locator('#object-highlight circle').first().boundingBox();await page.mouse.click(splitAt.x+splitAt.width/2,splitAt.y+splitAt.height/2);await expect(page.locator('#notice')).toContainText('Region split into two');await expect(page.locator('#object-list > button')).toHaveCount(4);
  await expect(page.locator('#object-detail')).toContainText('model proposal');for(const v of [1,2])await page.getByRole('button',{name:`Inspect source view ${v}`,exact:true}).click();await page.getByRole('button',{name:'Confirm region',exact:true}).click();
  const exportSplit=page.waitForEvent('download');await page.locator('#export').click();const split=JSON.parse(readFileSync(await(await exportSplit).path(),'utf8'));const parts=split.objectMemory.objects.filter(o=>o.label.startsWith('Table-tennis tabletop'));
  expect(parts).toHaveLength(2);expect(parts.reduce((n,o)=>n+o.binding.samples.length,0)).toBe(originalObjects.find(o=>o.label==='Table-tennis tabletop').binding.samples.length);
  expect(parts.every(o=>o.observations.filter(x=>x.kind==='model-region').every(x=>x.agreedSamples===o.binding.samples.length))).toBe(true);
  // A different byte hash must invalidate binding even if a parser ignores an added trailing byte.
  const asset=container.assets.find(a=>a.path===scene.asset);const changed=Buffer.concat([Buffer.from(asset.data,'base64'),Buffer.from([10])]);
  await page.locator('#file-input').setInputFiles([jsonFile('scene.json',{...scene,asset:'replacement.ply'}),{name:'replacement.ply',mimeType:'application/octet-stream',buffer:changed}]);await expect(page.locator('#render-status')).toContainText('Gaussian splats loaded');await expect(page.locator('#object-list')).toContainText('stale — rebind required');await expect(page.locator('#object-highlight circle')).toHaveCount(0);await expect(page.getByRole('button',{name:'Confirm region',exact:true})).toBeDisabled();await page.screenshot({path:info.outputPath('stale-binding.png')});
  const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
  expect(digest(readFileSync(source))).toBe(digest(original));
  // Tampered frame bytes cannot replace a currently open capsule.
  const tampered=structuredClone(container);tampered.assets.find(a=>a.path.startsWith('recognition/')&&a.path.endsWith('.jpg')).data=Buffer.from('changed evidence').toString('base64');
  const tamperedPath=info.outputPath('tampered.json');writeFileSync(tamperedPath,JSON.stringify(tampered));
  await page.locator('#file-input').setInputFiles(tamperedPath);await expect(page.locator('#notice')).toContainText('changed recognition evidence');
  expect(errors).toEqual([]);expect(failed).toEqual([]);
});
