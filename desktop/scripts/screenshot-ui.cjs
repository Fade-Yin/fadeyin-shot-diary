// Usage: node scripts/screenshot-ui.cjs <outDir> [video]
const {_electron}=require('playwright-core'),path=require('node:path'),fs=require('node:fs');
(async()=>{
 const out=process.argv[2]||'shots',video=process.argv[3];fs.mkdirSync(out,{recursive:true});
 const app=await _electron.launch({args:[path.join(__dirname,'..'),'--no-sandbox','--user-data-dir='+fs.mkdtempSync(path.join(require('node:os').tmpdir(),'pianlala-shot-'))]});
 const page=await app.firstWindow();await page.setViewportSize({width:1440,height:900}).catch(()=>{});
 page.on('pageerror',e=>console.error('pageerror',e.message));
 await page.waitForTimeout(1500);
 const snap=async name=>{await page.screenshot({path:path.join(out,name+'.png')});console.log('saved',name)};
 const theme=async t=>{await page.evaluate(t=>document.querySelector(`[data-theme-mode="${t}"]`)?.click(),t);await page.waitForTimeout(400)};
 await theme('light');await snap('empty-light');await theme('dark');await snap('empty-dark');
 if(video){
  await page.setInputFiles('#file',video);await page.waitForTimeout(2500);
  await page.evaluate(()=>document.querySelector('#analyzeBtn')?.click());await page.waitForTimeout(9000);
  await snap('analysis-dark');await theme('light');await snap('analysis-light');
  await page.evaluate(()=>document.querySelector('[data-app-mode="lap"]')?.click());await page.waitForTimeout(800);await snap('lap-light');
  await page.evaluate(()=>document.querySelector('[data-app-mode="timeline"]')?.click());await page.waitForTimeout(800);await snap('timeline-light');
  await page.keyboard.press('Control+K');await page.waitForTimeout(500);await snap('palette-light');await page.keyboard.press('Escape');
  await page.evaluate(()=>document.querySelector('[data-app-mode="analysis"]')?.click());await page.waitForTimeout(600);
  const card=await page.$('#rows .shotRow');if(card){const b=await card.boundingBox();await page.mouse.click(b.x+b.width/2,b.y+b.height/3,{button:'right'});await page.waitForTimeout(400);await snap('context-light');await page.keyboard.press('Escape')}
  await theme('dark');await page.keyboard.press('Control+K');await page.keyboard.type('切');await page.waitForTimeout(400);await snap('palette-dark');await page.keyboard.press('Escape');
 }
 await app.close();
})().catch(e=>{console.error(e);process.exit(1)});
