// Workspace tour: spotlights the live ReMix layout and lets people use the real controls.
// It never blocks the workspace. Sample photos are only added when the person asks for them.
const KEY='remix-tour-v3',LEGACY=['remix-tutorial-v2','remix-tutorial-v1'];
const SAMPLES=[['alpine-dolomites.jpg','./assets/alpine-dolomites.jpg','image/jpeg'],['studio-headphones.jpg','./assets/studio-headphones.jpg','image/jpeg']];
const narrow=()=>matchMedia('(max-width:790px)').matches;
const pick=v=>typeof v==='function'?v:()=>v;

const steps=[
 {id:'add',label:'Add media',target:['.topbar'],anchor:['.topbar > [data-action="import"]'],pulse:true,
  title:'Start with Add media',
  text:'Photos, videos, or a whole ZIP. ZIPs unpack on this device. You can also drop files anywhere on the window. The memory meter, Help, and theme switch sit alongside.',
  task:'Add a file of your own, or load the sample photos.',done:'Media added. It’s waiting in your library.',
  check:(s,b)=>s.media>b.media,samples:true},
 {id:'library',label:'Media library',mobile:'media',target:['.library'],anchor:['.media-card','.library'],pulse:s=>s.media>0,
  title:'Your media library',
  text:'Everything you add lands here. Search by name, filter images or videos, and click a card to open it. Tick a card’s checkbox to select it for a batch.',
  task:s=>s.media?'Click a card to open it in Preview.':'Add media first, then click a card.',done:'Opened. Preview and Inspector now follow that file.',
  clicks:'[data-media],.media-check',samples:true},
 {id:'preview',label:'Preview',mobile:'edit',target:['.workspace'],anchor:['#preview-stage','.workspace'],inside:true,
  title:'Preview in the middle',
  text:s=>!s.media?'Once a file is open, it appears here with zoom, pan, and a before/after divider.':s.kind==='video'?'Play the clip here. Edit video, just below, removes sections from picture and sound together. Your original stays intact.':'Scroll or pinch to zoom up to 1200%, drag to pan, and use Fit to reset. After a conversion, switch between Original and Output at the top.',
  task:s=>!s.media?'Add media to try the viewer.':s.kind==='video'?'Play the video or open Edit video.':'Zoom or drag the image.',done:'That’s the viewer. Both sides of a comparison move together.',
  check:(s,b)=>s.media>0&&(s.zoom!==b.zoom||s.panX!==b.panX||s.panY!==b.panY||s.view!==b.view),
  clicks:'[data-action="fit"],[data-action="zoom-in"],[data-action="zoom-out"],[data-view],[data-action="edit-video"]',samples:true},
 {id:'inspector',label:'Inspector',mobile:'settings',target:['.inspector'],anchor:['.inspector-tabs','.inspector'],
  title:'Settings live in the Inspector',
  text:s=>s.kind==='video'?'For videos: resolution, codec, quality, frame rate, audio, and container. Presets saves setups you reuse; Details shows file info.':'Settings apply to the file you’re previewing: restore, resize or AI upscale, format, and Quality % or a target file size. Presets applies ready-made setups and saves your own; Details shows file info.',
  task:s=>s.media?'Change a setting, or open Presets or Details.':'Add media to unlock its settings.',done:'Noted. Each file keeps its own settings.',
  check:(s,b)=>s.media>0&&(s.settingsKey!==b.settingsKey||s.tab!==b.tab),clicks:'[data-tab],[data-preset]',samples:true},
 {id:'convert',label:'Convert',mobile:'settings',target:['.inspector-footer'],anchor:['.inspector-footer .btn.primary','.inspector-footer'],pulse:s=>s.media>0,
  title:s=>s.kind==='video'?'Videos go through a batch':'Convert just this one',
  text:s=>s.kind==='video'?'The Output line shows the format and codec. Add this video to batch copies its settings and cuts into a job for the queue.':'The Output line shows what you’ll get. Convert this image makes one file right away, no queue needed. It all runs locally; AI and restore jobs can take a while.',
  task:s=>!s.media?'Add media to convert something.':s.kind==='video'?'Click Add this video to batch.':'Click Convert this image.',
  done:s=>s.kind==='video'?'Queued. You’ll find it in the bottom bar.':'Converted. Your output is ready to compare.',
  check:(s,b)=>s.kind==='video'?s.queue>b.queue:s.hasOutput,samples:true},
 {id:'compare',label:'Compare',mobile:'edit',target:['#preview-stage','.workspace'],anchor:['#preview-stage','.workspace'],inside:true,
  title:'Compare, then download',
  text:s=>s.kind==='video'?'Once a video is processed, switch to Output here to play the result next to the original. Download output sits in the toolbar.':s.hasOutput?'Drag the divider: output on the left, original on the right. Both layers zoom and pan together. Download output sits in the toolbar just below.':'After a conversion, a divider appears here: output on the left, original on the right. Both layers zoom and pan together, and Download output shows up in the toolbar.',
  task:s=>s.kind==='video'?'':s.hasOutput?'Drag the divider, or focus it and use the arrow keys.':'Convert this image first, then come back here.',done:'Nice. Download output saves this single file.',
  check:(s,b)=>s.hasOutput&&(s.comparePos!==b.comparePos||s.view!==b.view),clicks:'[data-preview-download],[data-action="compare"]'},
 {id:'batch',label:'Batch',mobile:'media',target:['.batch-actions'],anchor:['.batch-actions [data-action="enqueue"]','.batch-actions'],pulse:s=>s.selected>0,
  title:'Many files? Make a batch',
  text:'Select files with their checkboxes, or use Select all, then Create batch. Every file keeps its own settings and cuts. View batch opens the queue.',
  task:s=>s.selected?'Click Create batch ('+s.selected+').':'Tick one or more files, then Create batch.',done:'Batch ready. Processing starts when you say so.',
  check:(s,b)=>s.queue>b.queue,samples:true},
 {id:'queue',label:'Queue',target:['#render-dock','.statusbar'],anchor:['#render-control','.statusbar [data-action="queue"]'],pulse:true,
  title:'Process and download at the bottom',
  text:s=>s.queue?'This is your processing queue. Process batch runs jobs one at a time, with pause and cancel. When jobs finish, Download all gives you one ZIP or separate files.':'After you create a batch, this bar becomes the processing queue: progress, pause, cancel, and Download all as one ZIP or separate files.',
  task:s=>s.queue?'Open the queue, or start processing.':'Open the queue.',done:'That’s where finished outputs wait for download.',
  clicks:'[data-action="queue"],#render-control,#render-download,[data-action="process-demo"]'},
 {id:'finish',label:'Help',target:()=>narrow()?['.topbar-help','.statusbar [data-action="about"]','.mobile-tabs']:['.rail'],anchor:()=>narrow()?['.topbar-help','.statusbar [data-action="about"]','.mobile-tabs']:['.rail [data-action="about"]'],pulse:true,
  title:'That’s the tour',
  text:s=>narrow()?'Switch between Media, Preview, and Inspector with the tabs at the top. '+(s.queue?'Replay this tour from Help anytime.':'Replay this tour from Shortcuts in the bottom bar.')+' Nothing is kept between sessions, so download outputs before you close ReMix.':'Presets, Queue, Settings, and Help stay on the left rail. Replay this tour from Help anytime. Nothing is kept between sessions, so download outputs before you close ReMix.'}
];

export function createTutorial({icon,app}){
 let progress={status:'new',step:steps[0].id};
 try{
  const saved=JSON.parse(localStorage.getItem(KEY));
  if(saved&&['skipped','paused','complete'].includes(saved.status))progress={status:saved.status,step:steps.some(s=>s.id===saved.step)?saved.step:steps[0].id};
  else if(LEGACY.some(k=>{try{return JSON.parse(localStorage.getItem(k))?.status==='skipped'}catch{return false}}))progress.status='skipped';
 }catch{}
 const layer=document.createElement('div');layer.className='tour-layer';layer.hidden=true;
 layer.innerHTML='<div class="tour-spot"></div><div class="tour-pulse" hidden></div><section class="tour-card" role="dialog" aria-modal="false" aria-labelledby="tour-title" aria-describedby="tour-text"></section>';
 document.body.append(layer);
 const spot=layer.querySelector('.tour-spot'),pulse=layer.querySelector('.tour-pulse'),card=layer.querySelector('.tour-card'),$=s=>card.querySelector(s);
 let active=false,welcome=false,current=null,base=null,raf=0,lastCheck=0,returnFocus=null,busy=false,sampleIds=[],sampleLoad=null,session=0;
 const done=new Set(),cache={};
 const save=(status=progress.status)=>{progress.status=status;try{localStorage.setItem(KEY,JSON.stringify(progress))}catch{}};
 const snap=()=>app.snapshot();
 const visible=()=>{const s=snap();return steps.filter(step=>!step.when||step.when(s)||step===current);};
 const liveSamples=()=>{const ids=new Set(snap().ids);return sampleIds.filter(id=>ids.has(id));};
 function find(list){for(const sel of pick(list)()){for(const el of document.querySelectorAll(sel)){const r=el.getBoundingClientRect();if(r.width>1&&r.height>1)return el;}}return null;}
 const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;

 function cancelSampleLoad(){
  sampleLoad?.controller.abort();sampleLoad=null;busy=false;
 }

 function open({resume=true,offer=false,returnTo=null}={}){
  session++;cancelSampleLoad();
  if(!active){returnFocus=returnTo||document.activeElement;done.clear();}
  active=true;layer.hidden=false;document.body.classList.add('tour-active');
  if(!offer&&resume&&progress.status==='paused')go(progress.step);
  else{welcome=true;current=null;drawWelcome();}
  cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);
 }
 function close(status){
  session++;cancelSampleLoad();
  save(status);active=false;welcome=false;current=null;cancelAnimationFrame(raf);
  layer.hidden=true;document.body.classList.remove('tour-active');card.innerHTML='';
  for(const k in cache)delete cache[k];
  if(returnFocus?.isConnected&&returnFocus.getClientRects().length)returnFocus.focus({preventScroll:true});
 }
 const exit=()=>close(welcome?(progress.status==='new'?'skipped':progress.status):'paused');

 function drawWelcome(){
  const empty=snap().media===0;
  card.className='tour-card tour-card-welcome';delete card.dataset.dock;
  card.innerHTML=`<header class="tour-card-head"><span class="tour-kicker">${icon('sparkle')}Workspace tour · about a minute</span><button class="icon-btn" data-tour="exit" aria-label="Skip the tour for now">${icon('close')}</button></header>
  <h2 id="tour-title" tabindex="-1">Meet the ReMix workspace</h2>
  <p id="tour-text">A quick walk around the real layout: where files go, where settings live, and how results come out. Everything stays clickable while the tour runs.</p>
  <div class="tour-map" aria-hidden="true"><span class="tm-top"><i></i>Add media</span><span class="tm-rail"></span><span class="tm-lib">Media</span><span class="tm-prev">Preview</span><span class="tm-insp">Inspector</span><span class="tm-bar">Queue &amp; downloads</span></div>
  ${empty?`<label class="tour-samples"><input type="checkbox" id="tour-add-samples" checked><span><strong>Add two sample photos</strong><small>They go into your library like any other file, so every panel has something to show. You can remove them at the end.</small></span></label>`:''}
  <footer class="tour-card-foot"><button class="btn quiet" data-tour="exit">Skip for now</button><button class="btn primary" data-tour="start">Start tour${icon('chevron')}</button></footer>`;
  focusTitle();
 }

 function go(id){
  welcome=false;
  current=steps.find(s=>s.id===id)||steps[0];
  if(current.when&&!current.when(snap()))current=steps[steps.indexOf(current)+1]||steps[0];
  progress.step=current.id;save('paused');
  if(narrow()&&current.mobile)app.setMobile(current.mobile);
  base=snap();for(const k in cache)delete cache[k];
  drawStep();
  if(narrow())requestAnimationFrame(()=>{const el=find(current.target);if(el)el.scrollIntoView({block:dockTop(el)?'end':'start',behavior:reduced()?'auto':'smooth'});});
 }
 function drawStep(){
  const s=snap(),list=visible(),i=Math.max(0,list.indexOf(current)),last=i===list.length-1,isDone=done.has(current.id);
  const task=current.task?pick(current.task)(s):'',samplesAvailable=current.samples&&s.media===0;
  card.className='tour-card';
  card.innerHTML=`<header class="tour-card-head"><span class="tour-kicker">Step ${i+1} of ${list.length} · ${current.label}</span><button class="icon-btn" data-tour="exit" aria-label="Exit tour">${icon('close')}</button></header>
  <div class="tour-progress" aria-hidden="true">${list.map((step,n)=>`<span class="${n<i||done.has(step.id)?'seen':''} ${n===i?'now':''}"></span>`).join('')}</div>
  <h2 id="tour-title" tabindex="-1">${pick(current.title)(s)}</h2>
  <p id="tour-text">${pick(current.text)(s)}</p>
  ${task?`<div class="tour-task ${isDone?'done':''}" role="status">${icon(isDone?'check':'play')}<span>${isDone?pick(current.done)(s):task}</span></div>`:''}
  ${samplesAvailable?`<button class="btn quiet tour-cta" data-tour="samples" ${busy?'disabled':''}>${icon('plus')}Add sample photos</button>`:''}
  ${last&&liveSamples().length?`<button class="btn quiet tour-cta" data-tour="remove-samples">${icon('trash')}Remove the sample photos</button>`:''}
  <button class="btn quiet tour-cta" data-tour="show" hidden>${icon('panel')}Show ${current.label}</button>
  <footer class="tour-card-foot"><button class="btn quiet" data-tour="back" ${i?'':'disabled'}>Back</button><button class="btn primary" data-tour="next">${last?'Finish':'Next'}${icon(last?'check':'chevron')}</button></footer>`;
  focusTitle();
 }
 function focusTitle(){requestAnimationFrame(()=>{if(!document.getElementById('dialog')?.open)$('#tour-title')?.focus({preventScroll:true});});}
 function markDone(){
  if(!current||done.has(current.id))return;done.add(current.id);
  const s=snap(),task=$('.tour-task');
  if(task){task.classList.add('done');task.innerHTML=icon('check')+'<span></span>';task.querySelector('span').textContent=pick(current.done)(s);}
  const i=visible().indexOf(current);layer.querySelectorAll('.tour-progress span')[i]?.classList.add('seen');
 }
 function step(delta){
  const list=steps.filter(x=>!x.when||x.when(snap())||x===current),i=list.indexOf(current);
  if(delta>0&&i>=list.length-1){close('complete');return;}
  const next=list[Math.max(0,Math.min(list.length-1,i+delta))];if(next&&next!==current)go(next.id);
 }

 async function addSamples(){
  if(busy||!active)return false;
  const request={controller:new AbortController(),session};sampleLoad=request;busy=true;
  const isCurrent=()=>active&&session===request.session&&!request.controller.signal.aborted;
  try{
   const files=await Promise.all(SAMPLES.map(async([name,url,type])=>{const r=await fetch(url,{signal:request.controller.signal});if(!r.ok)throw new Error('Sample unavailable');return new File([await r.blob()],name,{type});}));
   if(!isCurrent())return false;
   const ids=await app.importFiles(files);
   // An import already handed to the workspace owns its own cancel controls.
   // Retain its sample IDs even if the tour closes while that import finishes.
   if(Array.isArray(ids))sampleIds.push(...ids);
   return isCurrent()&&!!ids?.length;
  }catch{
   const report=isCurrent();request.controller.abort();
   if(report)app.toast('The sample photos could not load. Add your own media instead.');return false;
  }finally{if(sampleLoad===request){sampleLoad=null;busy=false;}}
 }
 const dockTop=el=>{const r=el.getBoundingClientRect();return r.top+r.height/2>innerHeight*.55&&r.height<innerHeight*.5;};

 function set(el,key,value){if(cache[key]!==value){cache[key]=value;el.style.cssText=value;}}
 function frame(t){
  if(!active)return;raf=requestAnimationFrame(frame);
  const blocked=!!document.getElementById('dialog')?.open||!!document.fullscreenElement;
  layer.classList.toggle('tour-suspended',blocked);if(blocked)return;
  const target=current?find(current.target):null,anchorEl=current?.anchor?find(current.anchor)||target:target,vw=innerWidth,vh=innerHeight;
  let r=null;
  if(target){const b=target.getBoundingClientRect(),p=6;r={left:Math.max(4,b.left-p),top:Math.max(4,b.top-p),right:Math.min(vw-4,b.right+p),bottom:Math.min(vh-4,b.bottom+p)};if(r.right-r.left<8||r.bottom-r.top<8)r=null;}
  set(spot,'spot',r?`left:${r.left}px;top:${r.top}px;width:${r.right-r.left}px;height:${r.bottom-r.top}px`:`left:${vw/2}px;top:${vh/2}px;width:0;height:0`);
  spot.classList.toggle('is-empty',!r);
  const a=anchorEl?.getBoundingClientRect(),pulseOn=!!(current&&current.pulse&&anchorEl&&anchorEl!==target&&pick(current.pulse)(snap())&&a.bottom>0&&a.top<vh);
  pulse.hidden=!pulseOn;if(pulseOn)set(pulse,'pulse',`left:${a.left-4}px;top:${a.top-4}px;width:${a.width+8}px;height:${a.height+8}px`);
  const show=card.querySelector('[data-tour="show"]');if(show)show.hidden=!(current?.mobile&&narrow()&&!target);
  let pos='';
  if(narrow()&&!welcome){card.dataset.dock=target&&dockTop(target)?'top':'bottom';}
  else{
   delete card.dataset.dock;
   const w=card.offsetWidth,h=card.offsetHeight,m=12,g=14,cx=x=>Math.round(Math.max(m,Math.min(vw-w-m,x))),cy=y=>Math.round(Math.max(m,Math.min(vh-h-m,y)));
   const ar=a&&r?a:r;let left,top;
   if(!r){left=cx((vw-w)/2);top=cy((vh-h)/2);}
   else if(current.inside){
    // Keep the live preview clear: beside it if possible, else over the neighbouring column.
    if(ar.right+g+w<=vw-m){left=ar.right+g;top=cy(ar.top);}
    else if(ar.left-g-w>=m){left=ar.left-g-w;top=cy(ar.top);}
    else if(vw-w-m-ar.left>=(ar.right-ar.left)*.6){left=vw-w-m;top=cy(ar.top);}
    else{left=cx(ar.right-w-16);top=cy(ar.bottom-h-16);}
   }
   else if(r.right+g+w<=vw-m){left=r.right+g;top=cy(ar.top);}
   else if(r.left-g-w>=m){left=r.left-g-w;top=cy(ar.top);}
   else if(r.bottom+g+h<=vh-m){left=cx(ar.right-w);top=r.bottom+g;}
   else if(r.top-g-h>=m){left=cx(ar.right-w);top=r.top-g-h;}
   else{left=cx(ar.right-w-16);top=cy(ar.bottom-h-16);}
   pos=`left:${left}px;top:${top}px`;
  }
  set(card,'card',pos);
  if(current&&t-lastCheck>200){lastCheck=t;const s=snap();
   if(current.check&&!done.has(current.id)&&current.check(s,base)){markDone();}
   else if(!done.has(current.id)){const key=pick(current.text)(s)+'|'+(current.task?pick(current.task)(s):'')+'|'+s.media;if(cache.textKey===undefined)cache.textKey=key;else if(cache.textKey!==key){cache.textKey=key;const text=$('#tour-text'),task=$('.tour-task span');if(text)text.textContent=pick(current.text)(s);if(task&&current.task)task.textContent=pick(current.task)(s);const samples=$('[data-tour="samples"]');if(samples&&s.media)samples.remove();}}
  }
 }

 card.addEventListener('click',async e=>{
  const b=e.target.closest('[data-tour]');if(!b||b.disabled)return;
  switch(b.dataset.tour){
   case 'exit':exit();break;
   case 'start':{
    const before=snap(),startedSession=session;
    if($('#tour-add-samples')?.checked){b.disabled=true;b.textContent='Adding samples…';const ok=await addSamples();if(!active||session!==startedSession)return;go(steps[0].id);if(ok){base=before;markDone();}}
    else go(steps[0].id);
    break;}
   case 'back':step(-1);break;
   case 'next':step(1);break;
   case 'show':if(current?.mobile)app.setMobile(current.mobile);break;
   case 'samples':{const startedSession=session;b.disabled=true;const ok=await addSamples();if(!active||!current||session!==startedSession)return;if(ok&&current.id==='add')markDone();drawStep();break;}
   case 'remove-samples':{const ids=liveSamples();if(ids.length&&app.removeMedia(ids)){sampleIds=liveSamples();app.toast('Sample photos removed.');}drawStep();break;}
  }
 });
 // Real interactions with the workspace complete the current step.
 document.addEventListener('click',e=>{if(!active||!current?.clicks||done.has(current.id)||card.contains(e.target))return;if(e.target.closest?.(current.clicks))markDone();},true);
 document.addEventListener('play',e=>{if(active&&current?.id==='preview'&&e.target.id==='media-player')markDone();},true);
 document.addEventListener('keydown',e=>{if(active&&e.key==='Escape'&&!document.getElementById('dialog')?.open){e.preventDefault();exit();}});
 addEventListener('resize',()=>{for(const k in cache)delete cache[k];});

 return {
  open,
  offer(){if(progress.status==='new')open({offer:true});},
  get isOpen(){return active;},
  get canResume(){return progress.status==='paused';},
  get label(){return progress.status==='paused'?'Resume tour':progress.status==='complete'?'Replay tour':'Start tour';},
  get summary(){const s=steps.find(x=>x.id===progress.step);return progress.status==='paused'?`Continue at “${s?.label||'the start'}”, or start again.`:'A guided walk through the real workspace: library, preview, inspector, batch queue, and downloads. Try each control as you go.';}
 };
}
