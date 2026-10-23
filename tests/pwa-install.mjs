import assert from 'node:assert/strict';
import {createAppInstaller,installInstructions} from '../pwa-install.js';

function setup({standalone=false,nav={}}={}){
  const win=new EventTarget(),display=new EventTarget();
  display.matches=standalone;win.matchMedia=()=>display;
  const changes=[];let instructions=0,installed=0;
  const controller=createAppInstaller({win,nav,onChange:s=>changes.push(s),onUnavailable:()=>instructions++,onInstalled:()=>installed++});
  return {win,display,controller,changes,get instructions(){return instructions},get installed(){return installed}};
}
function offer(env,outcome='dismissed'){
  const event=new Event('beforeinstallprompt',{cancelable:true});
  let prompts=0;
  event.prompt=async()=>{prompts++};event.userChoice=Promise.resolve({outcome});
  env.win.dispatchEvent(event);
  return {event,get prompts(){return prompts}};
}

const browser=setup();
assert.equal(browser.controller.state().visible,true);
await browser.controller.install();
assert.equal(browser.instructions,1,'browsers without a ready prompt get manual instructions');
const first=offer(browser);
assert.equal(first.event.defaultPrevented,true);
assert.equal(first.prompts,0,'receiving an event must never open a prompt automatically');
await browser.controller.install();
assert.equal(first.prompts,1);
assert.equal(browser.controller.state().visible,true,'dismissal keeps installation discoverable');
await browser.controller.install();
assert.equal(first.prompts,1,'a consumed event is never prompted twice');
assert.equal(browser.instructions,2);
const retry=offer(browser,'accepted');
await browser.controller.install();
assert.equal(retry.prompts,1);
assert.equal(browser.controller.state().visible,false);
assert.equal(browser.installed,0,'acceptance alone must not announce completed installation');
browser.win.dispatchEvent(new Event('appinstalled'));
assert.equal(browser.installed,1);

const concurrent=setup();let finishChoice;
const waiting=offer(concurrent);
waiting.event.userChoice=new Promise(resolve=>{finishChoice=resolve});
const request=concurrent.controller.install();
await concurrent.controller.install();
assert.equal(waiting.prompts,1,'repeated clicks cannot open overlapping prompts');
assert.equal(concurrent.controller.state().busy,true);
finishChoice({outcome:'dismissed'});await request;
assert.equal(concurrent.controller.state().busy,false);

const broken=setup(),failed=offer(broken);
failed.event.prompt=()=>Promise.reject(new Error('Prompt unavailable'));
await broken.controller.install();
assert.equal(broken.instructions,1);
assert.equal(broken.controller.state().busy,false);
assert.equal(broken.controller.state().visible,true);
const fresh=offer(broken,'accepted');await broken.controller.install();assert.equal(fresh.prompts,1);

const external=setup();external.win.dispatchEvent(new Event('appinstalled'));
assert.equal(external.controller.state().visible,false,'browser-menu installation hides the button too');
await external.controller.install();assert.equal(external.instructions,0);
for(const config of [{standalone:true},{nav:{standalone:true}}]){
  const app=setup(config);assert.equal(app.controller.state().visible,false);
  const ignored=offer(app);assert.equal(ignored.event.defaultPrevented,false);
  await app.controller.install();assert.equal(ignored.prompts,0);assert.equal(app.instructions,0);
}
const mode=setup();mode.display.matches=true;mode.display.dispatchEvent(new Event('change'));
assert.equal(mode.changes.at(-1).visible,false);
mode.controller.destroy();mode.win.dispatchEvent(new Event('appinstalled'));assert.equal(mode.installed,0);
assert.match(installInstructions({userAgent:'iPhone'}),/Add to Home Screen/);
assert.match(installInstructions({userAgent:'Safari',platform:'MacIntel',maxTouchPoints:5}),/Home Screen/);
assert.match(installInstructions({userAgent:'Safari',platform:'MacIntel'}),/Add to Dock/);
assert.match(installInstructions({userAgent:'Android'}),/Home screen/);
assert.match(installInstructions({userAgent:'Chrome'}),/Install page as app/);
console.log('PASS PWA installation: gesture, dismissal, retry, concurrency, failure, completion, standalone and platform guidance.');
