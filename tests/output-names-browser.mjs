// Run with Node and Playwright installed; uses the unchanged production image/ZIP workers.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=fileURLToPath(new URL('../',import.meta.url));
const server=createServer(async(req,res)=>{
 try{const path=resolve(root,'.'+new URL(req.url,'http://localhost').pathname+(req.url==='/'?'index.html':''));if(!path.startsWith(root))throw Error();const body=await readFile(path);res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'})[extname(path)]||'application/octet-stream');res.end(body);}catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:1440,height:1000},acceptDownloads:true});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
page.setDefaultTimeout(15000);
await page.addInitScript(()=>{const NativeWorker=window.Worker;window.Worker=class extends NativeWorker{postMessage(message,...rest){if(message.type==='encode'&&window.delayEncode)setTimeout(()=>super.postMessage(message,...rest),5000);else super.postMessage(message,...rest);}};if(!localStorage.getItem('remix-workspace-preferences-v1'))localStorage.setItem('remix-workspace-preferences-v1',JSON.stringify({features:{tutorialPrompt:false,memory:false}}));});
const url=`http://127.0.0.1:${server.address().port}`;
const close=()=>page.locator('#dialog [data-dialog="close"]').last().click();
const done=()=>page.waitForFunction(()=>document.querySelector('[data-preview-download]'));
const getNames=()=>page.locator('[data-queue-name]').allTextContents();
async function downloadClick(selector){const pending=page.waitForEvent('download');await page.locator(selector).click();return pending;}
async function zipNames(download){
 const b=await readFile(await download.path()),names=[];
 // Read central directory names without an extra ZIP dependency.
 for(let i=0;i<b.length-46;i++)if(b.readUInt32LE(i)===0x02014b50){const len=b.readUInt16LE(i+28),extra=b.readUInt16LE(i+30),comment=b.readUInt16LE(i+32);names.push(b.subarray(i+46,i+46+len).toString('utf8'));i+=45+len+extra+comment;}
 return names;
}
try{
 await page.goto(url);await page.locator('.app-shell').waitFor();
 const png=Buffer.from(await page.evaluate(()=>{const c=document.createElement('canvas');c.width=80;c.height=60;const ctx=c.getContext('2d');ctx.fillStyle='#7a45bc';ctx.fillRect(0,0,80,60);return c.toDataURL().split(',')[1];}),'base64');
 await page.locator('.topbar [data-action="import"]').click();
 await page.locator('#media-files').setInputFiles(['same.png','SAME.png','same.png','café.png','CON.png'].map(name=>({name,mimeType:'image/png',buffer:png})));
 await page.waitForFunction(()=>document.querySelectorAll('[data-media]').length===5);
 const ids=await page.locator('[data-media]').evaluateAll(nodes=>nodes.map(n=>n.dataset.media));
 const select=async i=>{await page.locator(`[data-media="${ids[i]}"]`).click();};
 await select(0);
 assert.equal(await page.locator('[data-next-filename]').textContent(),'same-remix.webp');
 await page.locator('#output-custom-name').fill('my-banner.mp4');
 assert.equal(await page.locator('[data-next-filename]').textContent(),'my-banner.webp');
 await page.locator('.inspector-footer [data-action="convert-one"]').click();await done();
 let download=await downloadClick('[data-preview-download]');
 assert.equal(download.suggestedFilename(),'my-banner.webp');
 const webp=await readFile(await download.path());assert.equal(webp.toString('ascii',8,12),'WEBP');
 await page.locator('[data-setting="format"]').selectOption('PNG');
 await page.waitForFunction(()=>document.querySelector('[data-next-filename]')?.textContent==='my-banner.png');
 assert.equal(await page.locator('[data-ready-filename]').textContent(),'my-banner.webp','old bytes keep their true extension');
 download=await downloadClick('[data-preview-download]');assert.equal(download.suggestedFilename(),'my-banner.webp');
 await page.locator('#output-custom-name').fill('');
 await page.locator('[data-action="output-naming"]').click();
 await page.locator('#naming-suffix').fill('');
 assert.equal(await page.locator('#naming-preview strong').first().textContent(),'same.webp');
 await close();
 // Three same names test case-insensitive collisions; two more cover mixed formats and device names.
 for(let i=0;i<5;i++){await select(i);await page.locator('[data-setting="format"]').selectOption(i===3?'JPEG':'PNG');await page.waitForFunction(format=>document.querySelector('[data-setting="format"]').value===format,i===3?'JPEG':'PNG');}
 await page.locator('[data-action="select-all"]').click();
 await page.locator('[data-action="enqueue"]').click();
 const expected=['same.png','SAME (2).png','same (3).png','café.jpg','_CON.png'];
 assert.deepEqual(await getNames(),expected);
 await page.locator('[data-dialog="process-demo"]').click();
 await page.waitForFunction(()=>document.querySelector('[data-action="download-all"]')?.textContent.includes('(5)'));
 await page.locator('.batch-actions [data-action="queue"]').click();
 assert.deepEqual(await getNames(),expected);
 for(let i=0;i<ids.length;i++){
  download=await downloadClick(`[data-download="${ids[i]}"]`);assert.equal(download.suggestedFilename(),expected[i]);
  const bytes=await readFile(await download.path());assert.equal(bytes[0],i===3?0xff:0x89);
 }
 await page.locator('[data-batch-download]').click();
 download=await downloadClick('#batch-zip');assert.deepEqual(await zipNames(download),expected);
 await page.locator('#batch-stop').click();
 // A renamed completed output invalidates the retained archive without re-encoding it.
 await select(0);await page.locator('#output-custom-name').fill('../../NUL.mp4');
 await page.locator('.batch-actions [data-action="queue"]').click();
 const renamed=['_NUL.png',...expected.slice(1,2),'same.png',...expected.slice(3)];
 // Remaining duplicate names are recomputed deterministically after explicit renames.
 renamed[1]='SAME.png';renamed[2]='same (2).png';
 assert.deepEqual(await getNames(),renamed);
 await page.locator('[data-batch-download]').click();download=await downloadClick('#batch-zip');assert.deepEqual(await zipNames(download),renamed);
 await page.locator('#batch-stop').click();
 await page.locator('[data-action="output-naming"]').click();
 await page.locator('#naming-custom').fill('');
 await page.locator('#naming-mode').selectOption('template');
 await page.locator('#naming-template').fill('export-{index}-{name}.{ext}');
 await page.locator('#naming-start').fill('7');await page.locator('#naming-padding').fill('2');
 const numbered=['export-07-same.png','export-08-SAME.png','export-09-same.png','export-10-café.jpg','export-11-CON.png'];
 assert.deepEqual(await page.locator('#naming-preview strong').allTextContents(),numbered);
 await page.screenshot({path:process.env.REMIX_SCREENSHOT||'/tmp/remix-output-naming.png'});
 await close();await page.locator('.batch-actions [data-action="queue"]').click();assert.deepEqual(await getNames(),numbered);
 await page.locator('[data-batch-download]').click();
 const separate=[];const receive=d=>separate.push(d.suggestedFilename());page.on('download',receive);
 await page.locator('#batch-separate').click();await page.waitForFunction(()=>document.querySelector('#batch-download-status')?.textContent==='Requested 5 of 5 downloads');page.off('download',receive);
 assert.deepEqual(separate,numbered);await page.locator('#batch-stop').click();
 // Retry a complete queue; names must not acquire another suffix or sequence offset.
 await page.locator('.batch-actions [data-action="queue"]').click();await page.locator('[data-dialog="process-demo"]').click();
 await page.waitForFunction(()=>document.querySelector('[data-action="download-all"]')?.textContent.includes('(5)'));
 await page.locator('.batch-actions [data-action="queue"]').click();assert.deepEqual(await getNames(),numbered);await close();
 // Cancellation leaves a gap in the numbering; retries restore the same full plan.
 await page.evaluate(()=>window.delayEncode=true);
 await page.locator('.batch-actions [data-action="queue"]').click();await page.locator('[data-dialog="process-demo"]').click();
 await page.locator('#render-cancel').click();await page.waitForFunction(()=>document.querySelector('#render-queue-state')?.textContent==='0 complete · 1 need attention');
 await page.evaluate(()=>window.delayEncode=false);
 await page.locator('.batch-actions [data-action="queue"]').click();assert.deepEqual(await getNames(),numbered);
 await page.locator('[data-dialog="process-demo"]').click();
 await page.waitForFunction(()=>document.querySelector('#render-queue-state')?.textContent==='4 complete · 1 need attention');
 await page.locator('.batch-actions [data-action="queue"]').click();await page.locator('[data-batch-download]').click();
 download=await downloadClick('#batch-zip');assert.deepEqual(await zipNames(download),numbered.slice(1));await page.locator('#batch-stop').click();
 await page.locator('.batch-actions [data-action="queue"]').click();await page.locator('[data-dialog="process-demo"]').click();
 await page.waitForFunction(()=>document.querySelector('#render-queue-state')?.textContent==='5 complete');
 // A real video is imported and exported alongside the existing images.
 const video=Buffer.from(await page.evaluate(async()=>{
  const c=document.createElement('canvas');c.width=64;c.height=64;const ctx=c.getContext('2d'),stream=c.captureStream(10),chunks=[];
  const recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8'});
  const finished=new Promise(resolve=>{recorder.ondataavailable=e=>chunks.push(e.data);recorder.onstop=resolve;});
  recorder.start();let n=0;const timer=setInterval(()=>{ctx.fillStyle=n++%2?'#9155bb':'#117755';ctx.fillRect(0,0,64,64);},80);
  await new Promise(r=>setTimeout(r,800));recorder.stop();await finished;clearInterval(timer);stream.getTracks().forEach(t=>t.stop());
  return Array.from(new Uint8Array(await new Blob(chunks).arrayBuffer()));
 }));
 await page.locator('.topbar [data-action="import"]').click();await page.locator('#media-files').setInputFiles({name:'clip.webm',mimeType:'video/webm',buffer:video});
 await page.waitForFunction(()=>document.querySelectorAll('[data-media]').length===6);
 await page.locator('[data-setting="format"]').selectOption('WebM');
 await page.locator('#output-custom-name').fill('holiday-cut.mp4');
 await page.locator('[data-action="enqueue-current"]').click();await page.locator('[data-dialog="process-demo"]').click();
 await page.waitForFunction(()=>document.querySelector('#render-queue-state')?.textContent==='6 complete');
 await page.locator('.batch-actions [data-action="queue"]').click();
 assert.deepEqual(await getNames(),[...numbered,'holiday-cut.webm']);
 download=await downloadClick('[data-download="12"]');assert.equal(download.suggestedFilename(),'holiday-cut.webm');
 assert.equal((await readFile(await download.path())).subarray(0,4).toString('hex'),'1a45dfa3');
 await page.locator('[data-batch-download]').click();download=await downloadClick('#batch-zip');assert.deepEqual(await zipNames(download),[...numbered,'holiday-cut.webm']);await page.locator('#batch-stop').click();
 // Persisted naming does not contain session custom names or touch media presets.
 await page.reload();await page.locator('.app-shell').waitFor();
 await page.locator('.workspace-settings-button').click();await page.locator('[data-settings-tab="workspace"]').click();await page.locator('[data-naming-settings]').click();
 assert.equal(await page.locator('#naming-template').inputValue(),'export-{index}-{name}.{ext}');assert.equal(await page.locator('#naming-start').inputValue(),'7');
 await page.setViewportSize({width:390,height:844});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:'/tmp/remix-output-naming-mobile.png'});
 await page.locator('#naming-reset').click();assert.equal(await page.locator('#naming-suffix').inputValue(),'-remix');
 assert.deepEqual(errors,[]);
 console.log('PASS browser: real single image bytes, live rename/extension safety, 5-file mixed-format batch, case duplicates, Unicode/reserved names, individual/separate/ZIP parity, archive invalidation, cancellation/partial ZIP/retries, actual WebM video, persistence/reset, desktop/mobile layout.');
}catch(error){console.error('Browser errors:',errors);console.error('Status:',await page.locator('#single-status,#toast,#render-queue-state,#render-stage').allTextContents());await page.screenshot({path:'/tmp/remix-test-failure.png'});throw error;}finally{await browser.close();await new Promise(r=>server.close(r));}
