import {test,expect,chromium} from '@playwright/test';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';

test('gallery to real museum, recall, freeze, fresh reopen and saved return',async({page})=>{
  test.skip(process.env.PALACE_CURATED !== '1','Install the licensed public asset with scripts/prepare-fallback.py.');
  test.setTimeout(600000);
  const out=resolve('../../artifacts/gallery/proof');mkdirSync(out,{recursive:true});
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
    await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    const box=await p.locator(`[data-anchor="${id}"]`).boundingBox();
    expect(box).not.toBeNull();
    await p.mouse.click(box.x+box.width/2,box.y+box.height/2);
    await expect(p.locator('#notice')).toContainText('Object selected from the splat surface');
    await expect(p.locator('#card h2')).toHaveText(title);
    await expect(p.locator(`[data-anchor="${id}"]`)).toHaveAttribute('data-selected','true');
  };
  watch(page);
  const galleryRequests=[];
  page.on('request',r=>galleryRequests.push(r.url()));
  await page.goto('/?gallery');
  await expect(page.getByRole('heading',{name:'Give knowledge a place.'})).toBeVisible();
  await expect(page.getByRole('link',{name:'Explore →',exact:true})).toHaveCount(1);
  await expect(page.locator('canvas')).toHaveCount(0);
  for (const proposal of await page.locator('.proposal summary').all()) await proposal.click();
  await expect(page.locator('.proposal a[href*="tour="]')).toHaveCount(0);
  await page.screenshot({path:resolve(out,'00-gallery.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:resolve(out,'00-gallery-mobile.png'),fullPage:true});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(galleryRequests.filter(url=>url.includes('curated-court') || /main-.*\.js/.test(url))).toEqual([]);
  await page.setViewportSize({width:1440,height:1000});
  await page.getByRole('link',{name:'Explore →',exact:true}).click();
  await expect(page).toHaveURL(/\?tour=capitoline$/);await ready(page);
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
  // Bare wall misses must not open a nearby object.
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
    await expect(reopened.locator('#file-input')).toBeEnabled({timeout:30000});
    await reopened.locator('#file-input').setInputFiles(capsulePath);await ready(reopened);
    await expect(reopened.locator('#capsule-status')).toContainText('Read-only snapshot');
    await expect(reopened.locator('#capsule-title')).toBeDisabled();
    for(const [id,title] of stops) await selectSurface(reopened,id,title);
    await reopened.locator('#home').click();
    await reopened.screenshot({path:resolve(out,'04-fresh-browser-reopen.png')});
    const again=reopened.waitForEvent('download',{timeout:120000});await reopened.locator('#freeze').click();
    // Hash the raw portable files: exact-byte equality without another 96 MB JSON parse.
    expect(hash(readFileSync(await(await again).path()))).toBe(hash(readFileSync(capsulePath)));
    await reopened.locator('#save').click();await expect(reopened.locator('#notice')).toContainText('Saved on this device',{timeout:30000});

    await reopened.setViewportSize({width:390,height:844});
    await reopened.screenshot({path:resolve(out,'05-mobile.png'),fullPage:true});
    expect(await reopened.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await reopened.getByRole('link',{name:'← Gallery',exact:true}).click();
    await expect(reopened.getByRole('heading',{name:'Give knowledge a place.'})).toBeVisible();
    await expect(reopened.locator('canvas')).toHaveCount(0);
    await reopened.getByRole('link',{name:'Open a saved palace / import',exact:true}).first().click();
    await ready(reopened);
    await expect(reopened.locator('#capsule-status')).toContainText('Read-only snapshot');
    await expect(reopened.locator('#notice')).toContainText('Restored the saved palace');
    await reopened.screenshot({path:resolve(out,'06-saved-return.png'),fullPage:true});
    expect(bundleRequests).toEqual([]);expect(errors).toEqual([]);expect(failures).toEqual([]);
    writeFileSync(resolve(out,'verification.json'),JSON.stringify({
      verifiedAt:new Date().toISOString(),sceneBytes:72114959,sceneSha256:frozen.palace.curatedTour.sceneSha256,
      capsuleSha256:hash(readFileSync(capsulePath)),surfaceTargets:stops.map(s=>s[0]),
      recall:'hidden → real hand surface → reveal',freshBrowser:true,originalBundleRequests:bundleRequests,
      refrozenContainerEqual:true,deviceSave:true,deviceReload:true,galleryLazyLoad:true,galleryReturn:true,consoleErrors:errors,networkFailures:failures,
    },null,2));
  } finally {await fresh.close();}
});
