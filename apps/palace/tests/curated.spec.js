import {test,expect,chromium} from '@playwright/test';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';

test('real museum surface clicks, recall, freeze and fresh-browser reopen',async({page},info)=>{
  test.skip(process.env.PALACE_CURATED !== '1','Install the licensed public asset with scripts/prepare-fallback.py.');
  test.setTimeout(300000);
  const out=resolve('../../artifacts/fallback/proof');mkdirSync(out,{recursive:true});
  const errors=[],failures=[],bundleRequests=[];
  const watch=p=>{
    p.on('pageerror',e=>errors.push(e.message));
    p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    p.on('response',r=>{if(r.status()>=400)failures.push(`${r.status()} ${r.url()}`);});
    p.on('requestfailed',r=>failures.push(r.url()));
  };
  const ready=async p=>{
    await expect(p.locator('#render-status')).toContainText('SHA-256 verified',{timeout:120000});
    // Spark's decode promise precedes its first sorted GPU frame.
    await p.waitForTimeout(2000);
  };
  const selectSurface=async(p,id,title)=>{
    await p.locator('#home').click();
    const box=await p.locator(`[data-anchor="${id}"]`).boundingBox();
    expect(box).not.toBeNull();
    await p.mouse.click(box.x+box.width/2,box.y+box.height/2);
    await expect(p.locator('#notice')).toContainText('Object selected from the splat surface');
    await expect(p.locator('#card h2')).toHaveText(title);
    await expect(p.locator(`[data-anchor="${id}"]`)).toHaveAttribute('data-selected','true');
  };
  watch(page);await page.goto('/?tour=capitoline');await ready(page);
  await expect(page.locator('#places button')).toHaveCount(3);
  await expect(page.locator('.pin')).toHaveCount(0);
  await expect(page.locator('#scene-kind')).toHaveText('Modern museum scan · CC BY 4.0');
  await page.screenshot({path:resolve(out,'01-courtyard.png')});
  const stops=[['head','A face built for power'],['hand','The finger is a later addition'],['foot','Barefoot, like a god']];
  for(const [id,title] of stops) {
    await selectSurface(page,id,title);
    await expect(page.locator('#card .source a').first()).toHaveAttribute('href',/museicapitolini\.org/);
    // Keyboard-capable tour navigation also supplies a close view of the object.
    await page.locator('#places button').nth(stops.findIndex(s=>s[0]===id)).click();
    await page.waitForTimeout(500);
    await page.screenshot({path:resolve(out,`02-${id}.png`)});
  }
  // Bare wall misses must not open a nearby object; dragging must not select.
  await page.locator('#home').click();
  const canvas=await page.locator('canvas').boundingBox();
  await page.mouse.click(canvas.x+canvas.width*.6,canvas.y+canvas.height*.18);
  await expect(page.locator('#notice')).toContainText('No curated object');
  await expect(page.locator('#card h2')).toHaveText('Barefoot, like a god');
  await page.locator('#places button').nth(1).click();await page.locator('#recall').click();
  const reveal=page.getByRole('button',{name:'Reveal memory & source'});
  await expect(reveal).toBeDisabled();
  await expect(page.locator('#card')).not.toContainText('modern addition');
  const hand=await page.locator('[data-anchor="hand"]').boundingBox();
  await page.mouse.click(hand.x+hand.width/2,hand.y+hand.height/2);
  await expect(reveal).toBeEnabled();await reveal.click();
  await expect(page.locator('#card')).toContainText('modern addition');
  await page.screenshot({path:resolve(out,'03-recall-revealed.png')});
  await page.getByRole('button',{name:'End recall'}).click();
  const pending=page.waitForEvent('download',{timeout:120000});await page.locator('#freeze').click();
  const capsulePath=resolve(out,'capitoline.capsule.json');await(await pending).saveAs(capsulePath);
  const frozen=JSON.parse(readFileSync(capsulePath,'utf8'));
  const hash=b=>createHash('sha256').update(b).digest('hex');
  const scene=frozen.assets.find(a=>a.path==='capitoline.sog');
  expect(Buffer.from(scene.data,'base64').length).toBe(72114959);
  expect(hash(Buffer.from(scene.data,'base64'))).toBe(frozen.palace.curatedTour.sceneSha256);
  expect(frozen.assets).toHaveLength(4);expect(frozen.palace.anchors).toHaveLength(3);
  await page.close();

  const fresh=await chromium.launch({headless:true,args:process.platform==='darwin'?['--use-angle=metal']:[]});
  try {
    const context=await fresh.newContext({viewport:{width:1600,height:1000}});
    const reopened=await context.newPage();watch(reopened);
    // Fresh process, no device storage and no original scene fetch allowed.
    await context.route('**/curated-court/**',route=>{bundleRequests.push(route.request().url());route.abort();});
    await reopened.goto(process.env.PALACE_BASE_URL || 'http://127.0.0.1:4189');
    await expect(reopened.locator('#scene-kind')).toHaveText('No room imported');
    await reopened.locator('#file-input').setInputFiles(capsulePath);await ready(reopened);
    await expect(reopened.locator('#capsule-status')).toContainText('Read-only snapshot');
    await expect(reopened.locator('#capsule-title')).toBeDisabled();
    for(const [id,title] of stops) await selectSurface(reopened,id,title);
    await reopened.locator('#home').click();
    await reopened.screenshot({path:resolve(out,'04-fresh-browser-reopen.png')});
    const again=reopened.waitForEvent('download',{timeout:120000});await reopened.locator('#freeze').click();
    const roundtrip=JSON.parse(readFileSync(await(await again).path(),'utf8'));
    expect(roundtrip).toEqual(frozen);
    await reopened.locator('#save').click();await expect(reopened.locator('#notice')).toContainText('Saved on this device',{timeout:30000});
    await reopened.reload();await ready(reopened);
    await expect(reopened.locator('#capsule-status')).toContainText('Read-only snapshot');
    await reopened.setViewportSize({width:390,height:844});
    await reopened.screenshot({path:resolve(out,'05-mobile.png'),fullPage:true});
    expect(await reopened.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    expect(bundleRequests).toEqual([]);expect(errors).toEqual([]);expect(failures).toEqual([]);
    writeFileSync(resolve(out,'verification.json'),JSON.stringify({
      verifiedAt:new Date().toISOString(),sceneBytes:72114959,sceneSha256:frozen.palace.curatedTour.sceneSha256,
      capsuleSha256:hash(readFileSync(capsulePath)),surfaceTargets:stops.map(s=>s[0]),
      recall:'hidden → real hand surface → reveal',freshBrowser:true,originalBundleRequests:bundleRequests,
      refrozenContainerEqual:true,deviceSaveReload:true,consoleErrors:errors,networkFailures:failures,
    },null,2));
  } finally {await fresh.close();}
});
