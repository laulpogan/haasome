import {test,expect} from '@playwright/test';
test('museum route, real surface recall, sources, save and reload',async({page})=>{
  test.setTimeout(240000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('#render-status')).toContainText('SHA-256 verified',{timeout:120000});
  await expect(page.locator('#loading')).toBeHidden();
  await expect(page.locator('#card h2')).toHaveText('A face built for power');
  await page.getByRole('button',{name:'Next place →'}).click();
  await expect(page.locator('#card h2')).toHaveText('The finger is a later addition');
  await page.getByRole('button',{name:'Next place →'}).click();
  await expect(page.locator('#journey')).toContainText('3 of 3');
  await page.getByRole('button',{name:'Test my memory →'}).click();
  for (const [i,id,title] of [[0,'hand','The finger is a later addition'],[1,'head','A face built for power'],[2,'foot','Barefoot, like a god']]) {
    await expect(page.locator('#journey')).toContainText(`${i+1} of 3`);
    const reveal=page.getByRole('button',{name:'Reveal memory & source'});
    await expect(reveal).toBeDisabled();
    await expect(page.locator('#card .takeaway')).toHaveCount(0);
    // Exercise a wrong place before the real surface; it must not reveal the answer.
    await page.locator('#places button').nth(id==='head'?2:0).click();
    await expect(reveal).toBeDisabled();
    await page.locator('#home').click();
    await page.waitForTimeout(600);
    const box=await page.locator(`[data-anchor="${id}"]`).boundingBox();
    await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
    await expect(page.locator('#notice')).toContainText('Object selected from the splat surface');
    await expect(reveal).toBeEnabled();await reveal.click();
    await expect(page.locator('#card h2')).toHaveText(title);
    await page.getByText('Source & reading note',{exact:true}).click();
    await expect(page.getByRole('link',{name:'Read the museum catalog ↗'})).toBeVisible();
    await page.getByRole('button',{name:i<2?'Next memory →':'Finish my recall'}).click();
  }
  await expect(page.locator('#card h2')).toHaveText('A place for every story.');
  await page.getByRole('button',{name:'Explore again'}).click();
  await page.locator('.file-menu>summary').click();
  await page.locator('#save').click();
  await expect(page.locator('#notice')).toContainText('Saved on this device',{timeout:30000});
  await page.reload();
  await expect(page.locator('#render-status')).toContainText('SHA-256 verified',{timeout:120000});
  await expect(page.locator('#notice')).toContainText('Restored the saved palace');
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
