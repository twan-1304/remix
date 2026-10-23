import {task,removeTemp,cleanOldTemps,subscribeEngineMemory,uniqueOutputNames} from './remix-engine.js';
import {createBatchDownloads} from './batch-downloads.js';
import {createMemoryMonitor,memorySize,memorySummary} from './memory-monitor.js';
import {createTutorial} from './tutorial.js';
import {bindImageViewer} from './image-viewer.js';
import {loadPreferences,savePreferences,normalizePreferences,defaultPreferences,applyAppearance,effectiveImageConfig} from './preferences.js';
import {createWorkspaceSettings} from './workspace-settings.js';
import {petalScene} from './petals.js';
'use strict';
const $=s=>document.querySelector(s);
const icons={
 media:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="1.5"/><path d="m3 16 5-5 5 5 3-3 5 5"/>',
 video:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3Z"/>',
 folder:'<path d="M3 7V5a1 1 0 0 1 1-1h5l2 3h9a1 1 0 0 1 1 1v11H3Z"/>',
 zip:'<path d="M14 3H5v18h14V8Z"/><path d="M14 3v5h5M9 3v2m0 2v2m0 2v2"/><rect x="7" y="15" width="4" height="3" rx="1"/>',
 sliders:'<path d="M4 7h8m4 0h4M4 17h3m4 0h9"/><circle cx="14" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
 layers:'<path d="m3 8 9-5 9 5-9 5Zm0 5 9 5 9-5m-18 5 9 5 9-5"/>',
 settings:'<path d="m9 3-1 3-3 1 1 3-2 2 2 2-1 3 3 1 1 3h6l1-3 3-1-1-3 2-2-2-2 1-3-3-1-1-3Z"/><circle cx="12" cy="12" r="3"/>',
 help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4m0 3h.01"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
 moon:'<path d="M21 12.9A9 9 0 0 1 11.1 3 9 9 0 1 0 21 12.9Z"/>',
 monitor:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
 chevron:'<path d="m9 5 7 7-7 7"/>',
 chevrons:'<path d="m9 8-4 4 4 4m6-8 4 4-4 4"/>',
 check:'<path d="m5 12 4 4L19 6"/>',
 close:'<path d="m6 6 12 12M6 18 18 6"/>',
 resize:'<path d="M8 3H3v5m18 8v5h-5M3 3l6 6m6 6 6 6"/><rect x="8" y="8" width="8" height="8" rx="1"/>',
 sparkle:'<path d="m12 3 2.6 6.4L21 12l-6.4 2.6L12 21l-2.6-6.4L3 12l6.4-2.6ZM20 2v4m-2-2h4"/>',
 file:'<path d="M14 3H5v18h14V8ZM14 3v5h5M8 13h8m-8 4h5"/>',
 compress:'<path d="M4 4h5v5M9 4 3 10m17 10h-5v-5m0 5 6-6M4 15v5h5M20 9V4h-5"/>',
 download:'<path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5"/>',
 upload:'<path d="M12 16V4m-4 4 4-4 4 4M4 16v5h16v-5"/>',
 link:'<path d="m10 13 4-4M8 16l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 1 1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" transform="translate(1 0)"/>',
 minus:'<path d="M5 12h14"/>',
 fit:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
 compare:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16"/>',
 panel:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/>',
 lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
 play:'<path d="m9 5 11 7-11 7Z"/>',
 pause:'<path d="M8 5v14M16 5v14" stroke-width="4"/>',
 bolt:'<path d="m13 2-9 12h7l-1 8 10-13h-8Z"/>',
 memory:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4M9 10h6m-6 4h4"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 trash:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
 audio:'<path d="m11 4-6 5H2v6h3l6 5Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
 reset:'<path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
 scissors:'<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="m8 8 13 13M8 16 21 3m-8 9 8-9"/>',
 grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'
};
const icon=(name,extra='')=>`<svg viewBox="0 0 24 24" aria-hidden="true" ${extra}>${icons[name]||icons.file}</svg>`;
const logo='<span class="remix-mark" aria-hidden="true"></span>';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let preferences;try{preferences=loadPreferences(localStorage)}catch{preferences=defaultPreferences()}
const feature=id=>preferences.features[id];
applyAppearance(preferences);
const tutorial=createTutorial({icon,app:{
 snapshot(){const m=current(),out=m?previewResult(m.id):null;return {media:state.media.length,ids:state.media.map(x=>x.id),active:m?.id??null,kind:m?.kind||null,selected:state.selected.size,queue:state.queue.length,hasOutput:!!out,zoom:state.zoom,panX:state.panX,panY:state.panY,view:state.view,comparePos:state.comparePos,tab:state.tab,settingsKey:m?JSON.stringify(state.settings[m.id]||null):''};},
 setMobile(panel){if(state.mobile!==panel){state.mobile=panel;render();}},
 importFiles:files=>importFiles(files),
 removeMedia(ids){if(activeTask||importBusy||singleTask){toast('Finish or cancel the current operation first.');return false;}for(const id of ids)removeMedia(state.media.find(x=>x.id===id),false);render();return true;},
 toast:message=>toast(message)
}});
const defaults={width:2000,height:1500,lock:true,noUpscale:true,format:'WebP',quality:82,compressionMode:'quality',targetSize:500,targetUnit:'KB',resize:true,aiScale:'off',restore:false,restoreMode:'photo',restoreCleanup:20,restoreDetail:55,restoreRadius:1,sharpen:false,metadata:false,preset:'web',resolution:'1920 × 1080',codec:'H.264',fps:'Original',audio:true,audioBitrate:'160 kbps',trimStart:0,trimEnd:42};
const savedTheme=preferences.theme;
const state={media:[],active:null,selected:new Set(),filter:'all',search:'',tab:'inspector',theme:savedTheme,compare:true,comparePos:50,view:'original',zoom:100,zoomFit:true,panX:0,panY:0,mobile:'edit',queue:[],settings:{},nextId:7,presetFilter:'all',customPresets:loadCustomPresets(),videoEdits:{}};
let imageViewer=null;
let toastTimer,dialogReturnFocus,presetDraft=null,queueMode='ready',activeTask=null,activeJobId=null,importTask=null,importBusy=false,singleTask=null,singleJob=null;
const results=new Map();
const batchDownloads=createBatchDownloads({task,removeTemp,uniqueOutputNames,getItems:readyBatchOutputs,queueCount:()=>state.queue.length,isProcessing:()=>!!(activeTask||singleTask||importBusy),memoryBudget:()=>outputMemoryBudget(),openDialog,icon,bytesText:value=>bytesText(value)});
let memoryMonitor=null;
function syncMemoryMonitor(){
 if(feature('memory')&&!memoryMonitor)memoryMonitor=createMemoryMonitor({subscribeWorkers:subscribeEngineMemory,onChange:updateMemoryReadout});
 else if(!feature('memory')&&memoryMonitor){memoryMonitor.destroy();memoryMonitor=null;}
}
function memoryButton(){if(!feature('memory'))return '';return `<button class="memory-meter" data-action="memory" aria-label="Live memory usage" aria-haspopup="dialog">${icon('memory')}<span><small data-memory-label>Memory</small><strong data-memory-value>Measuring…</strong></span></button>`;}
function updateMemoryReadout(reading){
 if(!reading)return;
 const summary=memorySummary(reading),w=reading.worker;
 const put=(selector,text)=>document.querySelectorAll(selector).forEach(el=>{if(el.textContent!==text)el.textContent=text;});
 put('[data-memory-label]',summary.label);put('[data-memory-value]',summary.value);
 document.querySelectorAll('.memory-meter').forEach(el=>{el.title=summary.label+': '+summary.value+'. Open memory details for coverage and peak usage.';});
 const age=w.sampledAt?Math.max(0,Math.floor((reading.now-w.sampledAt)/1000)):0;
 const fields={browser:reading.browser?'≈ '+memorySize(reading.browser.bytes):reading.pending?'Waiting for browser…':'Unavailable',heap:reading.heap?'≈ '+memorySize(reading.heap.used):'Unavailable',
  wasm:w.aiWorkers?(w.wasm===null?'Loading model…':memorySize(w.wasm)):'Inactive',tensors:w.tensors===null?'Inactive':memorySize(w.tensors),
  peakHeap:reading.peakHeap===null?'No reading yet':'≈ '+memorySize(reading.peakHeap),peakWasm:reading.peakWasm===null?'No AI job yet':memorySize(reading.peakWasm),
  workers:String(w.workers),sample:document.hidden?'Updates paused while this tab is hidden':w.aiWorkers?(w.sampledAt?'AI sampled '+age+'s ago · updates between tiles':'Waiting for AI allocation'):reading.heap?'Browser heap checked every second':reading.browser?'App estimate sampled '+Math.floor((reading.now-reading.browser.sampledAt)/1000)+'s ago':'This browser does not expose a general memory reading.'};
 for(const [key,value] of Object.entries(fields))put('[data-memory-detail="'+key+'"]',value);
}
const previewResult=id=>results.get('single-'+id)||results.get(id);
const outputMemoryBudget=()=>Math.max(0,128*1024**2-[...results.values()].filter(r=>r.storage!=='disk').reduce((n,r)=>n+r.size,0)-batchDownloads.memoryBytes());
const current=()=>state.media.find(x=>x.id===state.active)||state.media[0];
function settings(item=current()){if(!item)return{...defaults};if(!state.settings[item.id])state.settings[item.id]={...defaults,width:Math.round(item.width/2),height:Math.round(item.height/2),format:item.kind==='video'?'MP4':'WebP',trimEnd:item.duration||42};return state.settings[item.id]}
const effectiveSettings=m=>m?.kind==='image'?effectiveImageConfig(settings(m),preferences):{...settings(m)};
const time=n=>`${Math.floor(n/60).toString().padStart(2,'0')}:${Math.floor(n%60).toString().padStart(2,'0')}`;
const switcher=(name,label,value)=>`<button class="switch" role="switch" aria-label="${esc(label)}" aria-checked="${!!value}" data-switch="${name}"></button>`;
const select=(name,values,value,label)=>`<select class="input" data-setting="${name}" aria-label="${esc(label)}">${values.map(v=>`<option ${v===value?'selected':''}>${esc(v)}</option>`).join('')}</select>`;
const section=(name,title,content)=>`<section class="settings-section" id="section-${name}"><h3 class="section-title">${icon(name)}${title}</h3>${content}</section>`;
function workspaceFocusKey(el){
 if(!el||!$('#app')?.contains(el))return null;
 if(el.id)return '#'+CSS.escape(el.id);
 const key=['data-setting','data-switch','data-action','data-media','data-check','data-filter','data-tab','data-mobile','data-view','data-preset-filter','data-preset'].find(key=>el.hasAttribute(key));
 return key?`[${key}="${CSS.escape(el.getAttribute(key))}"]`:null;
}
function render(){
 imageViewer?.destroy();imageViewer=null;
 const focusKey=workspaceFocusKey(document.activeElement),inspectorScroll=$('#inspector-content')?.scrollTop||0,libraryScroll=$('#media-grid')?.scrollTop||0;
 const sameFile=$('.app-shell')?.dataset.activeFile===String(current()?.id);
 const item=current(),s=effectiveSettings(item);
 $('#app').innerHTML=`<div data-active-file="${item?.id||''}" class="app-shell ${state.queue.length?'has-render-queue':''}">
 <header class="topbar"><div class="brand">${logo}<span>ReMix</span></div><span class="top-divider"></span><span class="workspace-title">Media workspace</span><div class="top-spacer"></div>${memoryButton()}<button class="preview-badge" data-action="about">${icon('info')}Engine beta</button><button class="icon-btn topbar-help" data-action="about" aria-label="Help and tutorial" title="Help and tutorial">${icon('help')}</button><button class="icon-btn theme-button" data-action="theme" aria-label="Choose theme" title="Choose theme">${icon('sun')}</button><button class="icon-btn workspace-settings-button" data-action="settings" aria-label="Workspace settings" title="Workspace settings">${icon('settings')}</button><button class="btn primary" data-action="import" aria-label="Add media">${icon('plus')}<span>Add media</span></button></header>
 <nav class="mobile-tabs" aria-label="Workspace panels">${[['media','Media'],['edit','Preview'],['settings','Inspector']].map(([id,label])=>`<button class="${state.mobile===id?'active':''}" data-mobile="${id}">${label}</button>`).join('')}</nav>
 <main class="main" data-mobile="${state.mobile}">
 <nav class="rail" aria-label="Main navigation"><button class="rail-item active" data-action="media" aria-label="Media workspace">${icon('media')}<span>Media</span></button><button class="rail-item" data-action="presets">${icon('sliders')}<span>Presets</span></button><button class="rail-item" data-action="queue">${icon('layers')}<span>Queue</span></button><div class="rail-spacer"></div><button class="rail-item" data-action="settings">${icon('settings')}<span>Settings</span></button><button class="rail-item" data-action="about">${icon('help')}<span>Help</span></button></nav>
 <aside class="library" aria-label="Media library"><div class="library-heading"><h1>Media library</h1><span class="number">${state.media.length}</span><button class="icon-btn" data-action="import" aria-label="Add media">${icon('plus')}</button></div><label class="search">${icon('search')}<input type="search" placeholder="Find your media…" value="${esc(state.search)}" aria-label="Search media" id="media-search"></label><div class="filter-bar" role="group" aria-label="Filter media">${[['all','All files'],['image','Images'],['video','Videos']].map(([v,t])=>`<button class="filter ${state.filter===v?'active':''}" data-filter="${v}" aria-pressed="${state.filter===v}">${t}</button>`).join('')}</div><div class="library-subheading"><span id="selection-count">${state.selected.size} selected</span><button class="text-btn" data-action="select-all">Select all</button></div><div class="media-grid" id="media-grid"></div><div class="batch-actions"><button class="btn primary" data-action="enqueue" ${!state.selected.size||activeTask||singleTask||importBusy?'disabled':''}>${icon('layers')}Create batch (${state.selected.size})</button><button class="btn quiet" data-action="queue">View batch · ${state.queue.length}</button><small>Select files above. Each keeps its own output settings.</small></div><button class="library-foot" data-action="import">${icon('zip')}<span><strong>A whole ZIP? Drop it in.</strong>Images and videos, together.</span></button></aside>
 <section class="workspace" aria-label="Media preview">${workspace(item,s)}</section>
 <aside class="inspector" aria-label="Media settings"><div class="inspector-tabs" role="tablist" aria-label="Inspector sections">${[['inspector','Inspector'],['presets','Presets'],['details','Details']].map(([id,title])=>`<button id="inspector-tab-${id}" role="tab" aria-controls="inspector-content" tabindex="${state.tab===id?0:-1}" aria-selected="${state.tab===id}" class="${state.tab===id?'active':''}" data-tab="${id}">${title}</button>`).join('')}</div><div class="inspector-content" id="inspector-content" role="tabpanel" aria-labelledby="inspector-tab-${state.tab}">${inspector(item,s)}</div><div class="inspector-footer"><div class="output-summary"><span>Output</span><strong id="output-summary">${outputText(item,s)}</strong></div><button class="btn primary" data-action="${item?.kind==='image'?'convert-one':'enqueue-current'}" ${!item||activeTask||singleTask||importBusy?'disabled':''}>${icon(item?.kind==='image'?'compress':'plus')}${item?.kind==='image'?(aiFactor(s)?'Upscale this image':s.restore?'Restore this image':'Convert this image'):'Add this video to batch'}</button><p class="footer-hint">For a batch, select files in Media</p></div></aside>
 </main><footer class="statusbar"><span class="status-local">${icon('lock')}Local workspace</span><span class="separator"></span><span class="sample-status">Local processing · no uploads</span><span class="spacer"></span><button data-action="queue">${icon('layers')}<span id="queue-count">Queue · ${state.queue.length}</span></button><span class="separator"></span><button data-action="about">${icon('help')}<span>Shortcuts</span><span class="key">?</span></button></footer></div>`;
 if(state.queue.length) $('.statusbar').outerHTML=renderDock();
 document.body.classList.toggle('has-render-queue',state.queue.length>0);
 syncPetals();renderLibrary();bind();updateRenderDock();updateSingleStatus();updateMemoryReadout(memoryMonitor?.current());batchDownloads.refresh();
 if(item?.kind==='image')imageViewer=bindImageViewer($('#preview-stage'),item,state);
 if(sameFile&&$('#inspector-content'))$('#inspector-content').scrollTop=inspectorScroll;
 if($('#media-grid'))$('#media-grid').scrollTop=libraryScroll;
 const nextFocus=focusKey?$(focusKey):null;if(nextFocus&&!nextFocus.disabled&&nextFocus.getClientRects().length)nextFocus.focus({preventScroll:true});
}
function renderLibrary(){
 const files=state.media.filter(m=>(state.filter==='all'||m.kind===state.filter)&&m.name.toLowerCase().includes(state.search.toLowerCase()));
 $('#media-grid').innerHTML=files.length?files.map(m=>`<article class="media-card ${state.active===m.id?'selected':''}"><input type="checkbox" class="media-check" data-check="${m.id}" ${state.selected.has(m.id)?'checked':''} aria-label="Select ${esc(m.name)}"><button class="media-open" data-media="${m.id}" aria-label="Preview ${esc(m.name)}" aria-current="${state.active===m.id}"><div class="thumb"><img src="${thumbnail(m)}" alt="" loading="lazy">${m.kind==='video'?`<span class="duration">▶ ${time(m.duration)}</span>`:''}${m.origin?`<span class="archive-origin" title="${esc(m.origin)}">${icon('zip')}</span>`:''}</div><span class="media-name">${esc(m.name)}</span><span class="media-meta">${m.kind==='video'?'Video':esc(m.format)} · ${m.size}</span></button></article>`).join(''):`<div class="empty">${icon('search')}<p>No matching media</p><p>Add media to begin, or change your filter.</p></div>`;
}
const aiFactor=s=>[2,4].includes(Number(s.aiScale))?Number(s.aiScale):0;
const imageDimensions=(m,s)=>aiFactor(s)?{width:m.width*aiFactor(s),height:m.height*aiFactor(s)}:{width:s.width,height:s.height};
function upscaleControl(value,attr){return `<select class="input" ${attr}>${[['off','Standard resize'],...(feature('aiUpscale')? [['2','AI upscale · 2×'],['4','AI upscale · 4×']]:[])].map(([v,t])=>`<option value="${v}" ${String(value||'off')===v?'selected':''}>${t}</option>`).join('')}</select>`;}
function outputText(item,s){if(!item)return '—';const d=imageDimensions(item,s);return item?.kind==='video'?`${s.format} · ${s.codec}`:`${d.width} × ${d.height}${aiFactor(s)?' · AI '+aiFactor(s)+'×':''} · ${s.format}${s.compressionMode==='target'?' · ≤ '+s.targetSize+' '+s.targetUnit:''}`}
const placeholder='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100"><rect width="160" height="100" fill="#1a1a23"/><path d="m67 32 30 18-30 18Z" fill="#a787ff"/></svg>');
const thumbnail=m=>m?.thumbnail||placeholder;
const bytesText=n=>n>=1024**3?(n/1024**3).toFixed(2)+' GB':n>=1024**2?(n/1024**2).toFixed(1)+' MB':(n/1024).toFixed(1)+' KB';
function syncPetals(){
 const workspace=$('.workspace');if(!workspace)return;
 const existing=workspace.querySelector('.workspace-petals');
 const enabled=preferences.effects&&['sakura','senbonzakura'].includes(document.documentElement.dataset.theme);
 if(enabled&&!existing)workspace.insertAdjacentHTML('afterbegin',petalScene({elapsed:performance.now()/1000}));
 else if(!enabled&&existing)existing.remove();
}
function workspace(m,s){
 if(!m)return `<div class="workspace-empty">${logo}<h2>Your media. Remixed.</h2><p>Drop photos, videos, or a ZIP to begin.</p><button class="btn primary" data-action="import">${icon('plus')}Add media</button><small>Processing stays on this device.</small></div>`;
 const video=m.kind==='video',out=previewResult(m.id),showOutput=state.view==='output'&&!!out,src=showOutput?out?.url:m.url;
 return `<div class="workspace-head"><div class="workspace-file"><strong>${esc(m.name)}</strong><span>${showOutput&&out?out.width:m.width} × ${showOutput&&out?out.height:m.height} · ${showOutput&&out?bytesText(out.size):m.size}${video&&m.fps?' · '+m.fps.toFixed(2)+' fps'+(m.vfr?' VFR':''):''}</span></div><div class="segmented" role="group" aria-label="Preview source"><button data-view="original" class="${!showOutput?'active':''}" aria-pressed="${!showOutput}">Original</button><button data-view="output" class="${showOutput?'active':''}" aria-pressed="${showOutput}" ${out?'':'disabled'}>Output</button></div></div>
 <div class="preview-wrap ${video?'':'image-viewer'}" id="preview-stage" ${video?'':'tabindex="0" role="group" aria-label="Image viewer. Drag to pan, scroll to zoom. Arrow keys move the image; plus and minus zoom; zero fits."'}><div class="preview-media">${video?`<video id="media-player" controls playsinline preload="metadata" src="${src}" style="transform:scale(${state.zoom/100})"></video>`:`<img class="preview-image" src="${src}" alt="${esc(m.name)}" style="transform:scale(${state.zoom/100})">`}</div>
 ${!video&&feature('compare')&&state.compare&&out&&!showOutput?`<div class="compare-overlay" style="clip-path:inset(0 ${100-state.comparePos}% 0 0)"><img src="${out.url}" alt="Compressed output" style="transform:scale(${state.zoom/100})"></div><div class="compare-line" style="left:${state.comparePos}%"></div><button type="button" class="compare-drag-handle" style="left:${state.comparePos}%" role="slider" aria-label="Comparison divider: output on the left, original on the right" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(state.comparePos)}"><span>${icon('chevrons')}</span></button><div class="compare-captions"><span>Output</span><span>Original</span></div>`:''}</div>
 <div class="preview-toolbar"><button class="icon-btn" data-action="fit" aria-label="Fit media to preview">${icon('fit')}</button><button class="icon-btn" data-action="zoom-out" aria-label="Zoom out">${icon('minus')}</button><span class="zoom-label">${video?state.zoom:`<input id="preview-zoom" type="number" min="1" max="1200" step="any" value="${state.zoom}" aria-label="Image zoom percent">`}%</span><button class="icon-btn" data-action="zoom-in" aria-label="Zoom in">${icon('plus')}</button><span class="spacer"></span>${out?`<button class="btn primary output-download" data-preview-download="${m.id}">${icon('download')}Download output</button>`:''}${!video&&out&&feature('compare')?`<button class="btn quiet" data-action="compare" aria-label="Compare original and output" aria-pressed="${state.compare}">${icon('compare')}</button>`:''}<button class="icon-btn" data-action="fullscreen" aria-label="Expand preview">${icon('fit')}</button></div>
 ${!video?'<p class="viewer-hint">Drag to pan · Scroll or pinch to zoom'+(feature('compare')?' · Drag the divider to compare':'')+'</p>'+singleControls(m,s):''}
 ${out?`<p class="output-note">${bytesText(m.file.size)} → ${bytesText(out.size)} · ${out.size<m.file.size?Math.round((1-out.size/m.file.size)*100)+'% smaller':'Output is larger'+(out.upscaled?' after AI upscaling.':out.restored?(out.config.format==='PNG'?' after restoration; PNG preserves the restored pixels losslessly.':' after restoration.'):'; try lower quality or resolution.')}${JSON.stringify(out.config)!==JSON.stringify(s)||(video&&JSON.stringify(out.edit?.segments)!==JSON.stringify(keptRanges(m)))?' · Settings or cuts changed since this export.':''}</p>`:''}
 ${out?.metadata?`<p class="finishing-result">${esc(finishingResult(out))}</p>`:''}
 ${out&&out.targetBytes?`<p class="target-result ${out.targetMet?'target-met':'target-missed'}" role="status">${targetResultText(out)}</p>`:''}
 ${video?videoTimeline(m):''}${renderPipeline(m,s)}`;
}
function bindPlayback(){
 const player=$('#media-player'),m=current();if(!player||!m)return;
 if(state.view==='original'){
  player.onloadedmetadata=()=>{player.currentTime=videoEdit(m).cursor;};
  player.ontimeupdate=()=>{const e=videoEdit(m);e.cursor=player.currentTime;const strip=$('.filmstrip');if(strip){strip.querySelector('.playhead').style.left=e.cursor/m.duration*100+'%';strip.setAttribute('aria-valuenow',e.cursor);$('#playhead-time').textContent=cutTime(e.cursor);}};
 }
 player.onerror=()=>toast('This browser cannot preview this codec. The export capability check will explain whether it can be processed.');
}
const roundTime=n=>Math.round(n*10)/10;
const cutTime=n=>{const ticks=Math.round(n*10);return `${Math.floor(ticks/600).toString().padStart(2,'0')}:${(Math.floor(ticks/10)%60).toString().padStart(2,'0')}.${ticks%10}`};
function mergeCuts(cuts,duration){
 const sorted=cuts.map(r=>({start:roundTime(Math.max(0,Math.min(duration,r.start))),end:roundTime(Math.max(0,Math.min(duration,r.end)))})).filter(r=>Number.isFinite(r.start)&&Number.isFinite(r.end)&&r.end>r.start).sort((a,b)=>a.start-b.start);
 const result=[];for(const range of sorted){const last=result.at(-1);if(last&&range.start<=last.end)last.end=Math.max(last.end,range.end);else result.push({...range})}return result;
}
function videoEdit(m){
 if(!state.videoEdits[m.id]){const s=settings(m);state.videoEdits[m.id]={cursor:0,start:0,end:Math.min(5,m.duration),cuts:mergeCuts([{start:0,end:s.trimStart},{start:s.trimEnd,end:m.duration}],m.duration),history:[]}}
 return state.videoEdits[m.id];
}
function keptRanges(m,cuts=videoEdit(m).cuts){
 const result=[];let at=0;for(const cut of mergeCuts(cuts,m.duration)){if(cut.start>at)result.push({start:at,end:cut.start});at=cut.end}if(at<m.duration)result.push({start:at,end:m.duration});return result;
}
function editedDuration(m,cuts=videoEdit(m).cuts){return roundTime(keptRanges(m,cuts).reduce((sum,r)=>sum+r.end-r.start,0))}
function videoEditSnapshot(m){if(m.kind!=='video')return null;return {cuts:videoEdit(m).cuts.map(r=>({...r})),segments:keptRanges(m),duration:editedDuration(m)}}
function cutOverlays(m){return videoEdit(m).cuts.map(r=>`<span class="cut-excluded" style="left:${r.start/m.duration*100}%;width:${(r.end-r.start)/m.duration*100}%" aria-hidden="true"></span>`).join('')}
function videoTimeline(m){
 const e=videoEdit(m),segments=keptRanges(m);
 return `<div class="timeline video-timeline"><div class="timeline-label"><span id="playhead-time">${cutTime(e.cursor)}</span><span>Original ${cutTime(m.duration)}</span></div><div class="filmstrip" role="slider" aria-label="Source video playhead, source video" aria-valuemin="0" aria-valuemax="${m.duration}" aria-valuenow="${e.cursor}" tabindex="0" style="background-image:url('${thumbnail(m)}')">${cutOverlays(m)}<div class="playhead" style="left:${e.cursor/m.duration*100}%"></div></div><div class="video-edit-summary"><span><strong>${cutTime(editedDuration(m))}</strong> output<small>${e.cuts.length?`${e.cuts.length} ${e.cuts.length===1?'cut':'cuts'} · ${segments.length} kept ${segments.length===1?'section':'sections'}`:'Trim the ends or remove sections'}</small></span><button class="btn primary" data-action="edit-video">${icon('scissors')}Edit video</button></div></div>`;
}
function commitVideoCuts(m,cuts){
 const e=videoEdit(m),next=mergeCuts(cuts,m.duration);
 if(editedDuration(m,next)<.1)return 'Keep at least 0.1 seconds of the video.';
 if(JSON.stringify(next)===JSON.stringify(e.cuts))return 'This selection is already removed.';
 e.history.push(e.cuts.map(r=>({...r})));e.cuts=next;return '';
}
function performVideoEdit(action,index){
 const m=current(),e=videoEdit(m);let error='';
 if(action==='cut'||action==='keep'){const start=Number($('#cut-start').value),end=Number($('#cut-end').value);if(!Number.isFinite(start)||!Number.isFinite(end)||start<0||end>m.duration||end-start<.1){$('#cut-error').textContent='Enter an In and Out time inside the video, at least 0.1 seconds apart.';return;}e.start=roundTime(start);e.end=roundTime(end);}
 if(action==='cut')error=commitVideoCuts(m,[...e.cuts,{start:e.start,end:e.end}]);
 else if(action==='keep')error=commitVideoCuts(m,[...e.cuts,{start:0,end:e.start},{start:e.end,end:m.duration}]);
 else if(action==='restore')error=commitVideoCuts(m,e.cuts.filter((_,i)=>i!==index));
 else if(action==='reset'){if(e.cuts.length)error=commitVideoCuts(m,[])}
 else if(action==='undo'){const previous=e.history.pop();if(previous)e.cuts=previous}
 if(error){$('#cut-error').textContent=error;return}
 render();openVideoEditor();
 const button=$(`[data-edit-action="${action}"]`);if(button&&!button.disabled)button.focus();else $('#cut-start').focus();
}
function openVideoEditor(){
 const m=current();if(m?.kind!=='video')return;const backgroundPlayer=$('#media-player');if(backgroundPlayer){backgroundPlayer.pause();backgroundPlayer.ontimeupdate=null;}
 const e=videoEdit(m),segments=keptRanges(m),output=editedDuration(m),percent=n=>n/m.duration*100;
 openDialog('Edit video',`<div id="video-cut-editor"><video id="cut-preview" controls playsinline preload="metadata" src="${m.url}"></video><div class="cut-file"><img src="${thumbnail(m)}" alt=""><div><strong>${esc(m.name)}</strong><small>Original ${cutTime(m.duration)} <span>→</span> Output ${cutTime(output)}</small></div></div><p class="cut-help">Drag the purple handles or enter times, then remove that section. The remaining sections will join in order.</p><div class="cut-timeline-label"><span>00:00.0</span><span>Source timeline</span><span>${cutTime(m.duration)}</span></div><div class="cut-track" id="cut-track" style="background-image:url('${thumbnail(m)}')">${cutOverlays(m)}<div class="cut-selection" id="cut-selection" style="left:${percent(e.start)}%;width:${percent(e.end-e.start)}%"></div><div class="cut-cursor" id="cut-cursor" style="left:${percent(e.cursor)}%"></div>${['start','end'].map(key=>`<button class="cut-handle ${key}" type="button" role="slider" data-cut-handle="${key}" aria-label="Selection ${key==='start'?'In':'Out'}" aria-valuemin="${key==='start'?0:roundTime(e.start+.1)}" aria-valuemax="${key==='start'?roundTime(e.end-.1):m.duration}" aria-valuenow="${e[key]}" aria-valuetext="${cutTime(e[key])}" style="left:${percent(e[key])}%"><span></span></button>`).join('')}</div><label class="cut-scrub-label" for="cut-scrubber">Playhead <output id="cut-cursor-time">${cutTime(e.cursor)}</output></label><input class="cut-scrubber" id="cut-scrubber" aria-label="Source playhead" type="range" min="0" max="${m.duration}" step="0.1" value="${e.cursor}"><div class="cut-fields">${[['start','In'],['end','Out']].map(([key,label])=>`<div><label for="cut-${key}">${label} <small>seconds</small></label><input class="input" type="number" step="0.1" min="${key==='start'?0:roundTime(e.start+.1)}" max="${key==='start'?roundTime(e.end-.1):m.duration}" value="${e[key]}" id="cut-${key}" data-cut-field="${key}"><button class="text-btn" data-edit-mark="${key}">Set at playhead</button></div>`).join('')}</div><div class="cut-selection-summary"><span>Selection <strong id="cut-selection-time">${cutTime(e.end-e.start)}</strong></span><span class="cut-legend"><i></i> Removed</span></div><div class="cut-actions"><button class="btn primary" data-edit-action="cut">${icon('scissors')}Remove section</button><button class="btn quiet" data-edit-action="keep">Keep only selection</button></div><p id="cut-error" class="preset-error" role="alert"></p><div class="cut-result"><div class="cut-result-head"><strong>After cuts <span>${cutTime(output)}</span></strong><div><button class="text-btn" data-edit-action="undo" ${e.history.length?'':'disabled'}>${icon('reset')}Undo</button><button class="text-btn" data-edit-action="reset" ${e.cuts.length?'':'disabled'}>Reset</button></div></div><div class="cut-assembly" aria-label="Remaining sections, joined in order">${segments.map((r,i)=>`<span style="flex:${r.end-r.start}" title="Section ${i+1}: ${cutTime(r.start)} to ${cutTime(r.end)}">${i+1}</span>`).join('')}</div><p class="cut-kept-summary">${segments.map(r=>`${cutTime(r.start)}–${cutTime(r.end)}`).join(' + ')}</p>${e.cuts.length?`<div class="cut-list">${e.cuts.map((r,i)=>`<div><span>${icon('scissors')}${cutTime(r.start)}–${cutTime(r.end)}</span><button class="text-btn" data-restore-cut="${i}" aria-label="Restore removed section ${cutTime(r.start)} to ${cutTime(r.end)}">Restore</button></div>`).join('')}</div>`:''}</div><p class="cut-demo-note">Cuts apply to video and audio on export. Your original file is unchanged. Edits stay in this session.</p>${state.queue.some(q=>q.id===m.id)?'<p class="cut-queue-note">Your queued copy keeps its earlier edits. Add this file again to update it after any current processing finishes.</p>':''}</div>`,`<button class="btn primary" data-dialog="close">Done</button>`);
 $('#dialog').classList.add('video-editor-dialog');
 bindVideoEditor(m);const player=$('#cut-preview');player.onloadedmetadata=()=>{player.currentTime=e.cursor;};player.ontimeupdate=()=>{e.cursor=player.currentTime;$('#cut-cursor').style.left=e.cursor/m.duration*100+'%';$('#cut-cursor-time').textContent=cutTime(e.cursor);$('#cut-scrubber').value=e.cursor;};
}
function updateVideoSelection(m,key,value,pushOther=false){
 if(!Number.isFinite(value))return;
 const e=videoEdit(m);
 if(pushOther){const length=e.end-e.start;if(key==='start'&&value>=e.end){e.start=roundTime(Math.max(0,Math.min(m.duration-.1,value)));e.end=roundTime(Math.min(m.duration,e.start+length))}else if(key==='end'&&value<=e.start){e.end=roundTime(Math.max(.1,Math.min(m.duration,value)));e.start=roundTime(Math.max(0,e.end-length))}}
 if(key==='start')e.start=roundTime(Math.max(0,Math.min(e.end-.1,value)));
 else if(key==='end')e.end=roundTime(Math.max(e.start+.1,Math.min(m.duration,value)));
 else e.cursor=roundTime(Math.max(0,Math.min(m.duration,value)));
 syncVideoSelection(m);const player=$('#cut-preview');if(player&&Math.abs(player.currentTime-videoEdit(m).cursor)>.05)player.currentTime=videoEdit(m).cursor;
}
function syncVideoSelection(m){
 const e=videoEdit(m);$('#cut-selection').style.left=e.start/m.duration*100+'%';$('#cut-selection').style.width=(e.end-e.start)/m.duration*100+'%';$('#cut-cursor').style.left=e.cursor/m.duration*100+'%';$('#cut-cursor-time').textContent=cutTime(e.cursor);$('#cut-selection-time').textContent=cutTime(roundTime(e.end-e.start));$('#cut-scrubber').value=e.cursor;$('#cut-error').textContent='';
 for(const key of ['start','end']){const input=$('#cut-'+key),handle=$(`[data-cut-handle="${key}"]`),min=key==='start'?0:roundTime(e.start+.1),max=key==='start'?roundTime(e.end-.1):m.duration;input.value=e[key];input.min=min;input.max=max;handle.style.left=e[key]/m.duration*100+'%';handle.setAttribute('aria-valuenow',e[key]);handle.setAttribute('aria-valuetext',cutTime(e[key]));handle.setAttribute('aria-valuemin',min);handle.setAttribute('aria-valuemax',max)}
}
function bindVideoEditor(m){
 const root=$('#video-cut-editor'),track=$('#cut-track');let drag=null;
 root.onclick=event=>{const b=event.target.closest('button');if(!b)return;if(b.dataset.editAction)performVideoEdit(b.dataset.editAction);else if(b.dataset.restoreCut!==undefined)performVideoEdit('restore',Number(b.dataset.restoreCut));else if(b.dataset.editMark)updateVideoSelection(m,b.dataset.editMark,videoEdit(m).cursor,true)};
 root.oninput=event=>{if(!event.target.dataset.cutField)return;const start=Number($('#cut-start').value),end=Number($('#cut-end').value);if(Number.isFinite(start)&&Number.isFinite(end)&&start>=0&&end<=m.duration&&end-start>=.1){const e=videoEdit(m);e.start=roundTime(start);e.end=roundTime(end);$('#cut-selection').style.left=e.start/m.duration*100+'%';$('#cut-selection').style.width=(e.end-e.start)/m.duration*100+'%';$('#cut-selection-time').textContent=cutTime(e.end-e.start);}};
 root.onchange=event=>{if(event.target.dataset.cutField)updateVideoSelection(m,event.target.dataset.cutField,Number(event.target.value),true)};
 $('#cut-scrubber').oninput=event=>updateVideoSelection(m,'cursor',Number(event.target.value));
 const move=event=>{const rect=track.getBoundingClientRect();updateVideoSelection(m,drag,(event.clientX-rect.left)/rect.width*m.duration)};
 track.onpointerdown=event=>{if(event.button!==0)return;drag=event.target.closest('[data-cut-handle]')?.dataset.cutHandle||'cursor';track.setPointerCapture(event.pointerId);event.preventDefault();move(event)};
 track.onpointermove=event=>{if(drag)move(event)};
 track.onpointerup=track.onpointercancel=event=>{drag=null;if(track.hasPointerCapture(event.pointerId))track.releasePointerCapture(event.pointerId)};
 track.onkeydown=event=>{const handle=event.target.closest('[data-cut-handle]');if(!handle||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const key=handle.dataset.cutHandle,e=videoEdit(m);updateVideoSelection(m,key,event.key==='Home'?0:event.key==='End'?m.duration:e[key]+(event.key==='ArrowRight'?1:-1)*(event.shiftKey ? .1 : 1))};
}
function renderPipeline(m,s){
 if(!feature('pipeline'))return '';
 if(singleJob?.id===m.id)return `<div class="pipeline pipeline-live" id="processing-pipeline" data-job-id="${singleJob.id}">${renderLivePipeline(singleJob)}</div>`;
 if(state.queue.length)return `<div class="pipeline pipeline-live" id="processing-pipeline" data-job-id="${activeJob().id}">${renderLivePipeline(activeJob())}</div>`;
 const stages=m.kind==='video'?[['resize','Resize',s.resolution,s.resize],['video','Encode',s.codec,true],['audio','Audio',s.audio?'Keep audio':'Muted',s.audio],['download','Export',s.format,true]]:[...(s.restore?[['restore','Restore',s.restoreMode==='graphics'?'Logos & text':'Photos',true]]:[]),['resize',aiFactor(s)?'AI upscale':'Resize',aiFactor(s)?aiFactor(s)+'× · '+(m.width*aiFactor(s))+' × '+(m.height*aiFactor(s)):`${s.width} × ${s.height}`,!!aiFactor(s)||s.resize],['sparkle','Sharpen',s.sharpen?'Enabled':'Off',s.sharpen],['file','Convert',s.format,true],['compress','Compress',s.compressionMode==='target'?`${s.targetSize} ${s.targetUnit} target`:`Quality ${s.quality}`,true]];
 return `<div class="pipeline"><div class="section-overline"><strong>Processing pipeline</strong><button class="text-btn" data-action="reset-settings">Reset</button></div><div class="pipeline-stages">${stages.map(([ic,t,sub,on],i)=>`${i?'<span class="stage-arrow">›</span>':''}<button class="pipeline-stage ${on?'':'off'}" data-stage="${ic}" title="${t} settings"><span class="pipeline-orb is-waiting" aria-hidden="true"><span class="pipeline-dots"></span></span><span class="pipeline-copy">${t}<small>${sub}</small></span></button>`).join('')}</div></div>`;
}
function jobSteps(q){return [
 {label:'Inspect',detail:'Check source and codecs',key:'inspect'},
 ...(q.kind==='image'&&q.config.restore?[{label:'Restore',detail:q.config.restoreMode==='graphics'?'Logos & text':'Photos',key:'restore'}]:[]),
 {label:q.kind==='image'&&aiFactor(q.config)?'AI '+aiFactor(q.config)+'×':'Prepare',detail:q.kind==='video'?q.config.resolution:aiFactor(q.config)?'Upscale original':'Resize image',key:q.kind==='image'&&aiFactor(q.config)?'upscale':'prepare'},
 {label:q.kind==='video'?'Encode':'Compress',detail:q.kind==='video'?q.config.codec:q.config.format,key:'encode'},
 {label:'Finalize',detail:q.kind==='video'&&q.config.audio?'Write audio + video':'Write output',key:'finalize'},
 {label:'Verify',detail:'Validate output',key:'verify'}];}
function renderLivePipeline(q){
 return `<div class="section-overline"><strong>Processing pipeline</strong><span class="pipeline-job">${esc(q.name)}</span></div><div class="pipeline-stages" role="list" aria-label="Processing stages">${jobSteps(q).map((step,i)=>`${i?'<span class="stage-arrow">›</span>':''}<div class="pipeline-stage pipeline-step" data-step-index="${i}" data-state="waiting" role="listitem"><span class="pipeline-orb"><svg class="pipeline-ring" viewBox="0 0 36 36"><circle class="ring-track" cx="18" cy="18" r="14"/><circle class="ring-progress" cx="18" cy="18" r="14" pathLength="100"/></svg><span class="pipeline-check">${icon('check')}</span><span class="pipeline-dots"></span><span class="pipeline-pause">${icon('pause')}</span></span><span class="pipeline-copy">${step.label}<small>${esc(step.detail)}</small></span></div>`).join('')}</div>`;
}
function updatePipeline(q){
 const pipeline=$('#processing-pipeline');if(!pipeline)return;
 if(pipeline.dataset.jobId!==String(q.id)){pipeline.innerHTML=renderLivePipeline(q);pipeline.dataset.jobId=String(q.id)}
 const at=jobSteps(q).findIndex(x=>x.key===q.stage);
 pipeline.querySelectorAll('[data-step-index]').forEach((el,i)=>{
  const status=q.status==='complete'||i<at?'complete':i===at&&q.status==='running'?(queueMode==='paused'?'paused':'active'):'waiting';el.dataset.state=status;
  el.querySelector('.ring-progress').style.strokeDashoffset=String(status==='complete'?0:status==='active'||status==='paused'?100-(q.stage==='restore'?(q.restoreProgress||0)*100:q.stage==='upscale'?(q.aiProgress||0)*100:q.stage==='encode'?q.progress*100:25):100);
  el.setAttribute('aria-label',jobSteps(q)[i].label+': '+(q.status==='error'&&i===at?'Failed':status));
 });
}

function inspector(m,s){
 if(!m)return '<div class=empty><p>Add a photo or video to adjust its output settings.</p></div>';
 if(state.tab==='presets')return presets(m,s);
 if(state.tab==='details')return `<div class="settings-section"><h3 class="section-title">${icon('info')}File details</h3><dl class="detail-list"><dt>Type</dt><dd>${esc(m.format)} ${m.kind}</dd><dt>Dimensions</dt><dd>${m.width} × ${m.height}</dd><dt>File size</dt><dd>${m.size}</dd>${m.kind==='video'?`<dt>Duration</dt><dd>${time(m.duration)}</dd><dt>Frame rate</dt><dd>${m.fps?m.fps.toFixed(2)+' fps'+(m.vfr?' · variable':''):'Unknown'}</dd>`:'<dt>Color space</dt><dd>sRGB</dd>'}<dt>Source</dt><dd>${esc(m.origin||'Local file')}</dd></dl></div><div class="notice">${icon('info')}<span>Properties read from your file. Videos export the primary video track and, when enabled, the primary audio track.</span></div><button class="btn quiet" data-action="remove">${icon('trash')}Remove from library</button>`;
 const head=`<div class="inspector-file"><img src="${thumbnail(m)}" alt=""><div><strong>${esc(m.name)}</strong><small>${m.kind==='video'?'Video':'Image'} settings${state.selected.size>1?` · ${state.selected.size} files selected`:''}</small></div></div>`;
 if(m.kind==='video')return head+section('resize','Video settings',`<label class="setting-label">Resolution</label>${select('resolution',['Original','3840 × 2160','1920 × 1080','1280 × 720'],s.resolution,'Video resolution')}<label class="setting-label">Video codec</label>${select('codec',['H.264','VP9','VP8'],s.codec,'Video codec')}<label class="setting-label">Quality</label>${quality(s)}<label class="setting-label">Frame rate</label>${select('fps',['Original','60 fps','30 fps','24 fps'],s.fps,'Video frame rate')}`)+section('audio','Audio',`<div class="switch-row"><span>Keep source audio</span>${switcher('audio','Keep source audio',s.audio)}</div><label class="setting-label">Audio bitrate</label>${select('audioBitrate',['256 kbps','192 kbps','160 kbps','128 kbps'],s.audioBitrate,'Audio bitrate')}`)+section('file','Output',`<label class="setting-label">Container</label>${select('format',['MP4','WebM','MOV'],s.format,'Video output container')}`)+`<div class="notice">${icon('info')}<span>Codec support is checked before export. Resolution keeps the source proportions, including portrait videos. HDR conversion is not supported yet.</span></div>`;
 return head+restorationControls(m,s)+section('resize','Resize & upscale',`<label class="setting-label" for="image-scaling">Scaling method</label>${upscaleControl(s.aiScale,'id="image-scaling" data-setting="aiScale"')}${aiFactor(s)?`<div class="upscale-summary"><strong>${m.width*aiFactor(s)} × ${m.height*aiFactor(s)} px</strong><span>${aiFactor(s)}× the original width and height</span></div><p class="subtle">Runs locally with an enhanced model that loads on first use. Large images can take several minutes. AI may improve edges but can alter fine patterns and text; compare before downloading.</p>${m.width*m.height*aiFactor(s)**2>20e6?'<p class="upscale-limit" role="alert">This exceeds the 20 megapixel output limit. Choose 2× or import a smaller source.</p>':''}`:`<div class="dimensions"><label class="input-wrap"><span>W</span><input class="input" type="number" min="1" max="30000" value="${s.width}" data-setting="width" aria-label="Output width"></label><button class="icon-btn ${s.lock?'active':''}" data-switch="lock" aria-pressed="${s.lock}" aria-label="Lock aspect ratio" title="Lock aspect ratio">${icon('link')}</button><label class="input-wrap"><span>H</span><input class="input" type="number" min="1" max="30000" value="${s.height}" data-setting="height" aria-label="Output height"></label></div><div class="switch-row"><span>Don't enlarge smaller images</span>${switcher('noUpscale','Do not enlarge smaller images',s.noUpscale)}</div>`}`)+section('file','Format',`${select('format',['WebP','JPEG','PNG'],s.format,'Image output format')}`)+section('compress','Compression',compressionControls(s))+(feature('finishing')?section('sparkle','Finishing touches',`<div class="switch-row"><span>Sharpen after resize</span>${switcher('sharpen','Sharpen after resize',s.sharpen)}</div><div class="switch-row"><span>Keep image metadata</span>${switcher('metadata','Keep image metadata',s.metadata)}</div>`)+`<div class="notice">${icon('info')}<span>Sharpening adds gentle detail after resizing. Metadata keeps supported EXIF and XMP tags, including GPS when present. PNG text is kept in PNG exports. Outputs use sRGB; old thumbnails and camera MakerNotes are omitted.</span></div>`:'')+`${state.selected.size>1?'<button class="btn quiet" data-action="apply-selection">Apply settings to selected images</button>':''}`;
}
function restorationControls(m,s){
 if(!feature('restoration'))return '';
 const slider=(key,label)=>`<label class="restoration-label" for="restore-${key}">${label}<output data-restore-value="${key}">${s[key]}%</output></label><input class="restoration-range" id="restore-${key}" type="range" min="0" max="100" value="${s[key]}" data-setting="${key}" aria-label="${label}">`;
 return `<section class="settings-section restoration-section" id="section-restore"><h3 class="section-title">${icon('sparkle')}Restore image</h3><div class="switch-row"><span>Clean up & deblur</span>${switcher('restore','Enable image restoration',s.restore)}</div>${s.restore?`<label class="setting-label" for="restoration-mode">Image type</label><select class="input" id="restoration-mode" data-setting="restoreMode"><option value="photo" ${s.restoreMode==='photo'?'selected':''}>Photos</option><option value="graphics" ${s.restoreMode==='graphics'?'selected':''}>Logos & text</option></select>${slider('restoreCleanup','Noise cleanup')}${slider('restoreDetail','Deblur strength')}<label class="setting-label" for="restoration-radius">Blur size</label><select class="input" id="restoration-radius" data-setting="restoreRadius">${[[.6,'Fine · 0.6 px'],[1,'Moderate · 1 px'],[1.4,'Soft · 1.4 px']].map(([v,label])=>`<option value="${v}" ${Number(s.restoreRadius)===v?'selected':''}>${label}</option>`).join('')}</select><p class="subtle">Restores existing pixels before resizing. Try a lower strength if fine detail looks harsh. Severe blur and missing lettering may not recover. Large images take longer.</p><button class="btn quiet restore-original" data-action="restore-original">${icon('fit')}Use original size + PNG</button><p class="subtle">Preserves dimensions and exports losslessly.${aiFactor(s)?' AI upscaling can still alter fine detail and text.':''}</p>${m.width*m.height>20e6?'<p class="upscale-limit" role="alert">Restoration supports originals up to 20 megapixels. Resize first, then restore the output.</p>':''}`:'<p class="subtle">Reduce noise and blur without AI-generated detail.</p>'}</section>`;
}
function compressionControls(s){
 return `<label class="setting-label" for="compression-mode">Compression mode</label><select class="input" id="compression-mode" data-setting="compressionMode"><option value="quality" ${s.compressionMode!=='target'?'selected':''}>Quality %</option><option value="target" ${s.compressionMode==='target'?'selected':''}>Target file size</option></select>${s.compressionMode==='target'?`<label class="setting-label" for="target-size">Maximum file size</label><div class="target-size-fields"><input class="input" id="target-size" type="number" min="0.01" step="any" value="${s.targetSize}" data-setting="targetSize" inputmode="decimal"><select class="input" data-setting="targetUnit" aria-label="Target size unit"><option ${s.targetUnit==='KB'?'selected':''}>KB</option><option ${s.targetUnit==='MB'?'selected':''}>MB</option></select></div><p class="subtle">${s.format==='PNG'?'PNG is lossless. The size is checked after export; use WebP or JPEG to adjust quality automatically.':'Finds a quality that fits without changing your chosen dimensions. If it cannot fit, the result tells you.'}</p>`:s.format==='PNG'?'<p class="subtle">PNG uses lossless compression. A quality slider does not apply.</p>':`<div class="section-overline compression-quality-heading"><span>Quality</span><span id="quality-description">${qualityName(s.quality)}</span></div>${quality(s)}<p class="subtle">Quality controls detail, not a guaranteed percentage reduction in file size.</p>`}`;
}
function finishingResult(out){const m=out.metadata;return [out.restored?(out.restored.mode==='graphics'?'Logo':'Photo')+' restoration · cleanup '+out.restored.cleanup+'% · deblur '+out.restored.detail+'%':null,out.upscaled?'AI '+out.upscaled.scale+'× applied':null,out.sharpened?'Sharpening applied':null,m.status==='removed'?'Metadata removed':m.status==='preserved'?'Kept '+m.kept.join(' + '):m.status==='none'?'No supported metadata found':'Metadata not preserved',...m.notes].filter(Boolean).join(' · ');}
function targetResultText(out){return out.targetMet?`Target met · ${bytesText(out.size)} / ${bytesText(out.targetBytes)}${out.actualQuality!==null?' · quality '+out.actualQuality+'%':''}`:`Target not reached · ${bytesText(out.size)} / ${bytesText(out.targetBytes)}. Reduce dimensions, increase the limit, or try another format.`;}
function qualityName(n){return n>=92?'Maximum':n>=78?'High':n>=55?'Balanced':'Small'}
function quality(s){return `<div class="range-row"><input type="range" min="20" max="100" value="${s.quality}" data-setting="quality" aria-label="Compression quality"><span class="range-value">${s.quality}<span style="color:var(--faint)"> %</span></span></div><div class="range-captions"><span>Smaller file</span><span>Higher quality</span></div>`}
const imagePresets=[['restorelogo','Restore logo / text','Original size · PNG · controlled deblur',0,100,'PNG'],['restorephoto','Restore photo','Original size · JPEG · gentle restoration',0,92,'JPEG'],['web','Web balanced','WebP · 2000 px · quality 82',2000,82,'WebP'],['wordpress','WordPress upload','JPEG · 2400 px · quality 85',2400,85,'JPEG'],['product','Product image','WebP · 1600 px · quality 88',1600,88,'WebP'],['quality','Maximum quality','Original dimensions · quality 96',0,96,'JPEG'],['small','Small web image','WebP · 1200 px · quality 65',1200,65,'WebP']];
const videoPresets=[['webvideo','Web video','MP4 · 1080p · quality 82','1920 × 1080',82,'MP4','H.264'],['smallvideo','Smaller video','MP4 · 720p · quality 65','1280 × 720',65,'MP4','H.264'],['webm','WebM','WebM · 1080p · quality 80','1920 × 1080',80,'WebM','VP9']];
function presetConfig(kind,source={}){
 const choice=(key,values,fallback)=>values.includes(source[key])?source[key]:fallback;
 const number=(key,fallback,min,max)=>Number.isFinite(Number(source[key]))?Math.max(min,Math.min(max,Math.round(Number(source[key])))):fallback;
 const boolean=(key,fallback)=>typeof source[key]==='boolean'?source[key]:fallback;
 const shared={quality:number('quality',82,20,100),resize:boolean('resize',true)};
 if(kind==='video'){
  const codec=choice('codec',['H.264','VP9','VP8'],'H.264');
  return {...shared,resolution:choice('resolution',['Original','3840 × 2160','1920 × 1080','1280 × 720'],'1920 × 1080'),codec,format:codec==='H.264'?choice('format',['MP4','MOV'],'MP4'):'WebM',fps:choice('fps',['Original','60 fps','30 fps','24 fps'],'Original'),audio:boolean('audio',true),audioBitrate:choice('audioBitrate',['256 kbps','192 kbps','160 kbps','128 kbps'],'160 kbps')};
 }
 return {...shared,restore:boolean('restore',false),restoreMode:choice('restoreMode',['photo','graphics'],'photo'),restoreCleanup:number('restoreCleanup',20,0,100),restoreDetail:number('restoreDetail',55,0,100),restoreRadius:[.6,1,1.4].includes(Number(source.restoreRadius))?Number(source.restoreRadius):1,aiScale:choice('aiScale',['off','2','4'],'off'),width:number('width',2000,1,30000),height:number('height',1500,1,30000),lock:boolean('lock',true),noUpscale:boolean('noUpscale',true),format:choice('format',['WebP','JPEG','PNG'],'WebP'),compressionMode:choice('compressionMode',['quality','target'],'quality'),targetSize:Number.isFinite(Number(source.targetSize))&&Number(source.targetSize)>0?Number(source.targetSize):500,targetUnit:choice('targetUnit',['KB','MB'],'KB'),sharpen:boolean('sharpen',false),metadata:boolean('metadata',false)};
}
function loadCustomPresets(){
 try{
  const rows=JSON.parse(localStorage.getItem('remix-custom-presets-v1')||'[]');if(!Array.isArray(rows))return [];
  const ids=new Set();
  return rows.filter(p=>{if(!p||!/^user-[a-zA-Z0-9-]+$/.test(p.id)||ids.has(p.id)||!['image','video'].includes(p.kind)||typeof p.name!=='string'||!p.name.trim()||!p.config||typeof p.config!=='object')return false;ids.add(p.id);return true}).map(p=>({id:p.id,name:p.name.trim().slice(0,60),kind:p.kind,config:presetConfig(p.kind,p.config)}));
 }catch{return []}
}
function presetSummary(p){
 const c=p.config;
 if(p.kind==='video')return `${c.format} · ${c.resize?c.resolution:'Original'} · ${c.codec} · Q${c.quality}`;
 return `${c.restore?(c.restoreMode==='graphics'?'Logo restoration':'Photo restoration')+' · ':''}${c.format} · ${aiFactor(c)?'AI '+aiFactor(c)+'×':c.resize?(c.lock?'Fit ':'')+c.width+' × '+c.height:'Original dimensions'} · ${c.compressionMode==='target'?c.targetSize+' '+c.targetUnit+' target':c.format==='PNG'?'Lossless':'Q'+c.quality}`;
}
function presetCatalog(){return [...state.customPresets.map(p=>({...p,custom:true,summary:presetSummary(p)})),...imagePresets.filter(p=>feature('restoration')||!p[0].startsWith('restore')).map(p=>({id:p[0],name:p[1],summary:p[2],kind:'image'})),...videoPresets.map(p=>({id:p[0],name:p[1],summary:p[2],kind:'video'}))]}
function presets(m,s){
 const all=presetCatalog(),items=all.filter(p=>state.presetFilter==='all'||p.kind===state.presetFilter);
 const mismatch=state.presetFilter!=='all'&&state.presetFilter!==m.kind;
 return `<div class="settings-section preset-section"><div class="preset-heading"><h3 class="section-title">${icon('sliders')}Presets</h3><button class="btn quiet new-preset" data-action="new-preset">${icon('plus')}New preset</button></div><div class="preset-filters" role="tablist" aria-label="Preset media type">${[['all','All'],['image','Photos'],['video','Videos']].map(([id,label])=>`<button id="preset-filter-${id}" role="tab" aria-selected="${state.presetFilter===id}" aria-controls="preset-list" tabindex="${state.presetFilter===id?'0':'-1'}" data-preset-filter="${id}">${label}<span>${all.filter(p=>id==='all'||p.kind===id).length}</span></button>`).join('')}</div><p class="preset-context">${mismatch?'Select a '+(state.presetFilter==='video'?'video':'photo')+' in Media to apply these presets.':'Apply to '+esc(m.name)}</p><div id="preset-list" role="tabpanel" aria-labelledby="preset-filter-${state.presetFilter}">${items.map(p=>`<button class="preset-card ${p.kind===m.kind&&s.preset===p.id?'active':''}" data-preset="${esc(p.id)}" ${p.kind!==m.kind?'disabled':''} title="${p.kind===m.kind?'Apply '+esc(p.name):'Select a '+(p.kind==='video'?'video':'photo')+' to apply'}"><span class="preset-icon">${icon(p.kind===m.kind&&s.preset===p.id?'check':p.kind==='video'?'video':'media')}</span><span class="preset-kind">${p.kind==='video'?'Video':'Photo'}${p.custom?' · Custom':''}</span><strong>${esc(p.name)}</strong><small>${esc(p.summary)}</small></button>`).join('')}</div></div><p class="subtle preset-storage-note">Custom presets are saved in this browser. Disabled image tools are skipped for new exports.</p>`;
}
function setPresetFilter(filter,focus=false){if(!['all','image','video'].includes(filter))return;state.presetFilter=filter;render();if(focus)$('#preset-filter-'+filter)?.focus()}
function newPreset(){
 const kind=state.presetFilter==='all'?(current()?.kind||'image'):state.presetFilter;
 presetDraft={name:'',kind,config:presetConfig(kind,current()?.kind===kind?settings():{}),fromCurrent:current()?.kind===kind};
 showPresetEditor();$('#preset-name').focus();
}
function showPresetEditor(){
 const d=presetDraft,video=d.kind==='video',c=video?d.config:effectiveImageConfig(d.config,preferences);
 const options=(key,values)=>`<select class="input" id="preset-${key}" data-preset-field="${key}">${values.map(value=>`<option ${c[key]===value?'selected':''}>${value}</option>`).join('')}</select>`;
 const field=(label,key,values)=>`<label class="preset-field" for="preset-${key}"><span>${label}</span>${options(key,values)}</label>`;
 const check=(key,label)=>`<label class="preset-check"><input type="checkbox" data-preset-field="${key}" ${c[key]?'checked':''}>${label}</label>`;
 openDialog('New preset',`<form id="preset-form"><label class="preset-field" for="preset-name"><span>Preset name</span><input class="input" id="preset-name" name="preset-name" maxlength="60" required autocomplete="off" placeholder="e.g. ${video?'Client web video':'Portfolio photos'}" value="${esc(d.name)}"></label><label class="preset-field" for="preset-kind"><span>Media type</span><select class="input" id="preset-kind"><option value="image" ${!video?'selected':''}>Photos</option><option value="video" ${video?'selected':''}>Videos</option></select></label><p class="preset-source">${d.fromCurrent?'Starts with the current file’s settings.':'Starts with the default settings.'} Adjust before saving.</p><div class="preset-editor-grid">${video?field('Resolution','resolution',['Original','3840 × 2160','1920 × 1080','1280 × 720'])+field('Codec','codec',['H.264','VP9','VP8'])+field('Container','format',c.codec==='H.264'?['MP4','MOV']:['WebM'])+field('Frame rate','fps',['Original','60 fps','30 fps','24 fps']):field('Format','format',['WebP','JPEG','PNG'])+`<label class="preset-field" for="preset-aiScale"><span>Scaling method</span>${upscaleControl(c.aiScale,'id="preset-aiScale" data-preset-field="aiScale"')}</label>${aiFactor(c)?'<p class="subtle">Scales each original by '+aiFactor(c)+'×. Maximum output: 20 megapixels.</p>':`<label class="preset-field" for="preset-width"><span>Max width (px)</span><input class="input" id="preset-width" type="number" min="1" max="30000" required value="${c.width}" data-preset-field="width"></label><label class="preset-field" for="preset-height"><span>Max height (px)</span><input class="input" id="preset-height" type="number" min="1" max="30000" required value="${c.height}" data-preset-field="height"></label>`}`}${!video?`<label class="preset-field" for="preset-compressionMode"><span>Compression mode</span><select class="input" id="preset-compressionMode" data-preset-field="compressionMode"><option value="quality" ${c.compressionMode!=='target'?'selected':''}>Quality %</option><option value="target" ${c.compressionMode==='target'?'selected':''}>Target file size</option></select></label>`:''}${!video&&c.compressionMode==='target'?`<label class="preset-field" for="preset-targetSize"><span>Maximum file size</span><input class="input" id="preset-targetSize" type="number" min="0.01" step="any" required value="${c.targetSize}" data-preset-field="targetSize"></label>${field('Size unit','targetUnit',['KB','MB'])}`:c.format==='PNG'?'<p class="subtle">PNG uses lossless compression.</p>':`<label class="preset-field" for="preset-quality"><span>Quality (%)</span><input class="input" id="preset-quality" type="number" min="20" max="100" required value="${c.quality}" data-preset-field="quality"></label>`}${video?field('Audio bitrate','audioBitrate',['256 kbps','192 kbps','160 kbps','128 kbps']):''}</div>${!video&&feature('restoration')?`<fieldset class="preset-restoration"><legend>Image restoration</legend>${check('restore','Enable restoration')}<label class="preset-field" for="preset-restoreMode"><span>Image type</span><select class="input" id="preset-restoreMode" data-preset-field="restoreMode"><option value="photo" ${c.restoreMode==='photo'?'selected':''}>Photos</option><option value="graphics" ${c.restoreMode==='graphics'?'selected':''}>Logos & text</option></select></label>${[['restoreCleanup','Noise cleanup (%)'],['restoreDetail','Deblur strength (%)']].map(([key,label])=>`<label class="preset-field" for="preset-${key}"><span>${label}</span><input class="input" id="preset-${key}" type="number" min="0" max="100" required value="${c[key]}" data-preset-field="${key}"></label>`).join('')}<label class="preset-field" for="preset-restoreRadius"><span>Blur size (px)</span><select class="input" id="preset-restoreRadius" data-preset-field="restoreRadius">${[.6,1,1.4].map(v=>`<option ${Number(c.restoreRadius)===v?'selected':''}>${v}</option>`).join('')}</select></label></fieldset>`:''}<div class="preset-editor-checks">${video||!aiFactor(c)?check('resize','Resize media'):''}${video?check('audio','Keep source audio'):(aiFactor(c)?'':check('lock','Keep source proportions within these dimensions')+check('noUpscale','Do not enlarge smaller photos'))+(feature('finishing')?check('sharpen','Sharpen after resize')+check('metadata','Keep image metadata (including GPS)'):'')}</div><p id="preset-error" class="preset-error" role="alert"></p><p class="preset-save-note">Saved in this browser for your next visit.</p></form>`,`<button class="btn quiet" data-dialog="close">Cancel</button><button class="btn primary" type="submit" form="preset-form">${icon('plus')}Save preset</button>`);
 const form=$('#preset-form');
 form.oninput=e=>{if(e.target.id==='preset-name')presetDraft.name=e.target.value;else if(e.target.dataset.presetField){const key=e.target.dataset.presetField;presetDraft.config[key]=e.target.type==='checkbox'?e.target.checked:e.target.type==='number'?Number(e.target.value):e.target.value}$('#preset-error').textContent=''};
 form.onchange=e=>{
  const target=e.target,key=target.dataset.presetField;
  if(target.id==='preset-kind'){presetDraft.kind=target.value;presetDraft.fromCurrent=current()?.kind===target.value;presetDraft.config=presetConfig(target.value,presetDraft.fromCurrent?settings():{});showPresetEditor();$('#preset-kind').focus()}
  else if(key==='codec'||key==='format'||key==='compressionMode'||key==='aiScale'){presetDraft.config[key]=target.value;presetDraft.config=presetConfig(presetDraft.kind,presetDraft.config);showPresetEditor();$('#preset-'+key).focus()}
 };
 form.onsubmit=e=>{e.preventDefault();savePreset()};
}
function savePreset(){
 const name=presetDraft.name.trim(),kind=presetDraft.kind;
 if(!name){$('#preset-error').textContent='Give your preset a name.';$('#preset-name').focus();return false}
 if(presetCatalog().some(p=>p.kind===kind&&p.name.toLowerCase()===name.toLowerCase())){$('#preset-error').textContent='That name is already used for this media type. Choose another.';return false}
 const preset={id:'user-'+(typeof crypto.randomUUID==='function'?crypto.randomUUID():Array.from(crypto.getRandomValues(new Uint8Array(16)),byte=>byte.toString(16).padStart(2,'0')).join('')),name:name.slice(0,60),kind,config:presetConfig(kind,presetDraft.config)};
 const next=[preset,...state.customPresets];
 try{localStorage.setItem('remix-custom-presets-v1',JSON.stringify(next))}catch{$('#preset-error').textContent='This browser could not save the preset. Your draft is still here; try again after allowing site storage.';return false}
 state.customPresets=next;state.presetFilter=kind;state.tab='presets';presetDraft=null;render();$('#dialog').close();$('.new-preset')?.focus();toast(name+' saved.');return true;
}
function bind(){
 bindPlayback();
 $('#app').onclick=e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.download){downloadJob(Number(b.dataset.download));return;}
 if(b.dataset.previewDownload){const id=Number(b.dataset.previewDownload);downloadJob(results.has('single-'+id)?'single-'+id:id);return;}
 if(b.dataset.action)action(b.dataset.action);
 else if(b.dataset.media){state.active=Number(b.dataset.media);if(!e.ctrlKey&&!e.metaKey&&!e.shiftKey)state.selected=new Set([state.active]);else state.selected.add(state.active);state.zoom=100;state.zoomFit=true;state.panX=state.panY=0;state.view='original';state.mobile='edit';render()}
 else if(b.dataset.presetFilter){setPresetFilter(b.dataset.presetFilter,true)}
 else if(b.dataset.filter){state.filter=b.dataset.filter;render()}
 else if(b.dataset.tab){state.tab=b.dataset.tab;render()}
 else if(b.dataset.mobile){state.mobile=b.dataset.mobile;render()}
 else if(b.dataset.view){state.view=b.dataset.view;state.compare=false;render()}
 else if(b.dataset.switch){const key=b.dataset.switch;settings()[key]=!settings()[key];settings().preset='custom';render()}
 else if(b.dataset.preset)applyPreset(b.dataset.preset);
 else if(b.dataset.stage){state.tab='inspector';state.mobile='settings';render();const el=$('#section-'+b.dataset.stage)||$('#section-file');el?.scrollIntoView({block:'nearest',behavior:preferences.reducedMotion||matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});if(!preferences.reducedMotion&&!matchMedia('(prefers-reduced-motion: reduce)').matches)el?.animate([{background:'var(--tint)'},{background:'transparent'}],{duration:700})}
 };
 $('#app').onkeydown=e=>{const tab=e.target.closest('[data-preset-filter],[data-tab]');if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const isPreset=!!tab.dataset.presetFilter,filters=isPreset?['all','image','video']:['inspector','presets','details'],i=filters.indexOf(isPreset?tab.dataset.presetFilter:tab.dataset.tab),next=e.key==='Home'?filters[0]:e.key==='End'?filters.at(-1):filters[(i+(e.key==='ArrowRight'?1:2))%3];if(isPreset)setPresetFilter(next,true);else{state.tab=next;render();$('#inspector-tab-'+next).focus()}};
 $('#app').onchange=e=>{if(e.target.dataset.check){const id=Number(e.target.dataset.check);e.target.checked?state.selected.add(id):state.selected.delete(id);render()}else if(e.target.dataset.setting)changeSetting(e.target)};
 $('#app').oninput=e=>{const t=e.target;if(t.id==='media-search'){state.search=t.value;renderLibrary()}else if(t.dataset.setting==='targetSize'){settings().targetSize=Number(t.value);settings().preset='custom';}else if(['restoreCleanup','restoreDetail'].includes(t.dataset.setting)){settings()[t.dataset.setting]=Number(t.value);settings().preset='custom';const value=$('[data-restore-value="'+t.dataset.setting+'"]');if(value)value.textContent=t.value+'%';}else if(t.dataset.setting==='quality'){settings().quality=Number(t.value);t.parentElement.querySelector('.range-value').innerHTML=t.value+'<span style="color:var(--faint)"> %</span>';if($('#quality-description'))$('#quality-description').textContent=qualityName(Number(t.value))}};
 const film=$('.filmstrip');if(film){
  const m=current(),edit=videoEdit(m);
  const setAt=value=>{edit.cursor=roundTime(Math.max(0,Math.min(m.duration,value)));film.querySelector('.playhead').style.left=edit.cursor/m.duration*100+'%';film.setAttribute('aria-valuenow',edit.cursor);$('#playhead-time').textContent=cutTime(edit.cursor);if($('#media-player')&&state.view==='original')$('#media-player').currentTime=edit.cursor};
  film.onclick=e=>setAt((e.clientX-film.getBoundingClientRect().left)/film.clientWidth*m.duration);
  film.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();setAt(e.key==='Home'?0:e.key==='End'?m.duration:edit.cursor+(e.key==='ArrowRight'?1:-1)*(e.shiftKey ? .1 : 1))}};
 }

}
function changeSetting(t){const s=settings(),key=t.dataset.setting;let val=t.type==='number'||t.type==='range'||key==='restoreRadius'?Number(t.value):t.value;if(typeof val==='number'&&!Number.isFinite(val))return;s[key]=val;s.preset='custom';const m=current();if(key==='width'||key==='height'){s[key]=Math.max(1,Math.min(30000,Math.round(val)));if(s.lock){if(key==='width')s.height=Math.max(1,Math.round(s.width*m.height/m.width));else s.width=Math.max(1,Math.round(s.height*m.width/m.height))}}if(key==='trimStart')s.trimStart=Math.max(0,Math.min(s.trimEnd-1,val));if(key==='trimEnd')s.trimEnd=Math.min(m.duration,Math.max(s.trimStart+1,val));if(m.kind==='video'){if(key==='format')s.codec=val==='WebM'?'VP9':'H.264';if(key==='codec')s.format=val==='H.264'?'MP4':'WebM'}requestAnimationFrame(render)}
function applyPreset(id){
 const m=current(),s=settings(),custom=state.customPresets.find(p=>p.id===id);
 if(custom){
  if(custom.kind!==m.kind){toast('Select a '+(custom.kind==='video'?'video':'photo')+' to use this preset.');return}
  const c={...custom.config};
  if(m.kind==='image'&&c.resize&&!aiFactor(c)){
   if(c.lock){const scale=Math.min(c.width/m.width,c.height/m.height,c.noUpscale?1:Infinity);c.width=Math.max(1,Math.round(m.width*scale));c.height=Math.max(1,Math.round(m.height*scale))}
   else if(c.noUpscale){c.width=Math.min(c.width,m.width);c.height=Math.min(c.height,m.height)}
  }
  if(m.kind==='image'&&!c.resize){c.width=m.width;c.height=m.height}
  Object.assign(s,c,{preset:id});render();toast(custom.name+' applied to '+m.name);return;
 }
 const p=(m.kind==='video'?videoPresets:imagePresets).find(p=>p[0]===id);if(!p)return;
 if(m.kind==='video'){Object.assign(s,{resolution:p[3],quality:p[4],format:p[5],codec:p[6],resize:true,preset:id})}
 else{const w=p[3]?Math.min(m.width,p[3]):m.width;Object.assign(s,{restore:id.startsWith('restore'),restoreMode:id==='restorelogo'?'graphics':'photo',restoreCleanup:id==='restorelogo'?20:30,restoreDetail:id==='restorelogo'?65:40,restoreRadius:id==='restorelogo'?1:.6,sharpen:id.startsWith('restore')?false:s.sharpen,width:w,height:Math.round(m.height*w/m.width),quality:p[4],format:p[5],resize:true,lock:true,noUpscale:true,aiScale:'off',compressionMode:'quality',preset:id})}
 render();toast(p[1]+' applied to '+m.name);
}
function action(name){const m=current();switch(name){
 case'import':openImport();break;
 case'restore-original':if(m?.kind==='image'){Object.assign(settings(m),{width:m.width,height:m.height,resize:true,lock:true,noUpscale:true,aiScale:'off',format:'PNG',compressionMode:'quality',sharpen:false,preset:'custom'});render();toast('Original dimensions and lossless PNG selected.');}break;
 case'about':openAbout();break;
 case'settings':openSettings();break;
 case'theme':openSettings('appearance');break;
 case'media':state.mobile='media';render();break;
 case'new-preset':newPreset();break;
 case'presets':state.tab='presets';state.mobile='settings';render();break;
 case'queue':openQueue();break;
 case'download-all':batchDownloads.open();break;
 case'memory':openMemory();break;
 case'enqueue':enqueue();break;
 case'enqueue-current':enqueue([m]);break;
 case'convert-one':convertOne();break;
 case'cancel-single':singleTask?.cancel();break;
 case'edit-settings':state.mobile='settings';state.tab='inspector';render();break;
 case'process-demo':toggleProcessing();break;
 case'cancel-process':cancelProcessing();break;
 case'select-all':{const visible=state.media.filter(x=>(state.filter==='all'||x.kind===state.filter)&&x.name.toLowerCase().includes(state.search.toLowerCase()));const all=visible.every(x=>state.selected.has(x.id));for(const x of visible)all?state.selected.delete(x.id):state.selected.add(x.id);render();break}
 case'fit':if(imageViewer)imageViewer.reset();else{state.zoom=100;render();}break;
 case'zoom-in':if(imageViewer)imageViewer.step(1);else{state.zoom=Math.min(300,state.zoom+25);render();}break;
 case'zoom-out':if(imageViewer)imageViewer.step(-1);else{state.zoom=Math.max(25,state.zoom-25);render();}break;
 case'compare':state.compare=!state.compare;state.view='original';render();break;
 case'fullscreen':if(document.fullscreenElement)document.exitFullscreen?.();else $('#preview-stage')?.requestFullscreen?.().catch(()=>toast('Full-screen preview is unavailable here.'));break;
 case'edit-video':openVideoEditor();break;
 case'video-info':$('#media-player')?.play().catch(()=>toast('This browser cannot preview this video.'));break;
 case'reset-settings':if(!m)return;delete state.settings[m.id];render();toast('Settings reset for '+m.name);break;
 case'apply-selection':{const s={...settings()};let n=0;for(const x of state.media)if(state.selected.has(x.id)&&x.kind===m.kind){state.settings[x.id]={...s};n++}toast(`Settings applied to ${n} ${m.kind}${n===1?'':'s'}.`);break}
 case'remove':removeMedia(m);break;
 }}
function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3800)}
function openDialog(title,body,footer=''){batchDownloads.cancel();const d=$('#dialog');d.classList.remove('video-editor-dialog','workspace-settings-dialog');if(!d.open)dialogReturnFocus=document.activeElement;d.innerHTML=`<div class="dialog-head"><h2 id="dialog-title">${title}</h2><button class="icon-btn" data-dialog="close" aria-label="Close dialog">${icon('close')}</button></div><div class="dialog-body">${body}</div>${footer?`<div class="dialog-footer">${footer}</div>`:''}`;d.onclick=e=>{const b=e.target.closest('button');if(b?.hasAttribute('data-batch-download')){batchDownloads.open();return;}if(b?.dataset.tutorial){const returnTo=dialogReturnFocus;dialogReturnFocus=null;d.close();tutorial.open({resume:b.dataset.tutorial!=='restart',returnTo});return;}if(b?.dataset.dialog==='close')d.close();else if(b?.dataset.theme){setTheme(b.dataset.theme);openSettings()}else if(b?.dataset.download){downloadJob(Number(b.dataset.download));}else if(b?.dataset.dialog==='reset'){resetWorkspace();return;}else if(b?.dataset.dialog==='queue-clear'){clearRenderQueue();openQueue()}else if(b?.dataset.removeQueue){removeQueuedFile(Number(b.dataset.removeQueue));openQueue()}else if(b?.dataset.dialog==='process-demo'){d.close();toggleProcessing()}else if(b?.dataset.dialog==='cancel-process'){cancelProcessing();openQueue()}if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}};if(!d.open)d.showModal()}
$('#dialog').addEventListener('close',()=>{batchDownloads.cancel();if($('#dialog').classList.contains('video-editor-dialog')){$('#dialog').classList.remove('video-editor-dialog');render();$('[data-action="edit-video"]')?.focus()}if(dialogReturnFocus?.isConnected)dialogReturnFocus.focus();else if($('#dialog').classList.contains('workspace-settings-dialog'))$('.workspace-settings-button')?.focus()});
function openImport(){
 if(importBusy){toast('An import is already running.');return;}
 openDialog('Add your media',`<div class="drop-zone">${icon('upload')}<strong>Images, videos, or the whole ZIP.</strong><p>Choose files or drop them into the workspace.</p><label class="btn primary file-picker">Choose files<input id="media-files" type="file" multiple accept="image/*,video/*,.zip,.mkv,.heic,.heif"></label></div><p class="subtle">Files stay on your device. ZIP media is extracted one file at a time. Download your results before closing this session. Clear workspace removes its temporary media; after an unclean close, local temporary files may remain until a later cleanup.</p><p class="subtle">Video compression requires HTTPS and a supported browser codec. Animated images export as a still frame.</p>`);
 $('#media-files').onchange=e=>{const files=[...e.target.files];$('#dialog').close();importFiles(files);};
}
async function importFiles(files){
 if(importBusy||activeTask||singleTask){toast('Finish or cancel the current job before importing more files.');return [];}
 importBusy=true;const added=[],errors=[];let canceled=false;
 openDialog('Importing media',`<p id="import-status" role="status">Reading your files…</p><p class="subtle">Nothing is uploaded.</p>`,`<button class="btn quiet" id="cancel-import">Cancel import</button>`);
 $('#cancel-import').onclick=()=>{canceled=true;importTask?.cancel();$('#dialog').close();};
 const update=text=>{if($('#import-status'))$('#import-status').textContent=text;};
 async function add(file,info,origin,path){
  const item={...info,id:state.nextId++,file,url:URL.createObjectURL(file),name:file.name,size:bytesText(file.size),format:file.name.split('.').at(-1).toUpperCase(),origin,path,
   thumbnail:info.thumbnail?URL.createObjectURL(info.thumbnail):null};
  delete info.thumbnail;state.media.push(item);added.push(item.id);
 }
 try{
  for(const file of files){
   if(canceled)break;update('Reading '+file.name+'…');
   try{
    if(/\.zip$/i.test(file.name)){
     importTask=task('unzip',{file,memoryBudget:Math.max(0,128*1024**2-state.media.filter(m=>m.origin&&!m.path).reduce((n,m)=>n+m.file.size,0))},event=>{if(event.type==='imported')add(event.file,event.info,event.origin,event.path);else if(event.type==='import-error')errors.push(event.name+': '+event.message);else if(event.type==='extract-progress')update('Extracting '+event.name+' · '+bytesText(event.bytes));});
     const summary=await importTask.promise;if(!summary.accepted&&!errors.length)errors.push(file.name+': No supported media found.');
    }else{importTask=task('inspect',{file});const info=await importTask.promise;await add(file,info);}
   }catch(error){if(!canceled)errors.push(file.name+': '+error.message);}
   finally{importTask=null;}
  }
 }finally{importBusy=false;importTask=null;}
 if(added.length){state.active=added[0];state.zoomFit=true;state.panX=state.panY=0;state.selected=new Set(added);state.filter='all';state.search='';state.mobile='edit';state.view='original';}
 render();$('#dialog').close();
 if(errors.length)openDialog('Import results',`<p>${added.length} files added.</p><ul class="import-errors">${errors.slice(0,30).map(e=>`<li>${esc(e)}</li>`).join('')}</ul>`);
 else toast(canceled?`Import canceled. ${added.length} files added.`:`${added.length} files ready.`);
 return added;
}
const activeJob=()=>state.queue.find(q=>q.id===activeJobId)||state.queue.find(q=>q.status==='queued')||state.queue.at(-1);
const jobProgress=q=>{
 if(q.status==='complete')return 100;if(q.status==='queued')return 0;
 const restored=!!q.config.restore,ai=!!aiFactor(q.config),encodeStart=ai?85:restored?35:5;
 const value=q.stage==='restore'?2+(q.restoreProgress||0)*30:q.stage==='upscale'?(restored?34:5)+(q.aiProgress||0)*(restored?50:79):q.stage==='encode'?encodeStart+q.progress*(95-encodeStart):({inspect:1,prepare:restored?33:4,finalize:96,verify:98}[q.stage]||0);
 return Math.min(99,Math.floor(value));
};
function jobLabel(q){return q.status==='error'?q.error:q.status==='canceled'?'Canceled':q.status==='complete'?(results.get(q.id)?.targetMet===false?'Complete · target not reached':'Complete'):q.status==='queued'?'Ready to process':queueMode==='paused'?'Paused':({inspect:'Checking media and codecs…',prepare:'Preparing frames…',restore:'Restoring image · '+Math.round((q.restoreProgress||0)*100)+'%',upscale:q.aiLabel||'Loading AI model…',encode:q.targetAttempt?'Finding a fit · attempt '+q.targetAttempt:'Encoding…',finalize:'Finalizing file…',verify:'Checking output…'}[q.stage]||'Starting…');}
function processButton(){return activeTask?(queueMode==='paused'?['play','Resume']:['pause','Pause']):state.queue.some(q=>q.status==='queued')?['play','Process batch']:['reset','Run batch again'];}
function renderDock(){
 const q=activeJob();if(!q)return'';
 return `<section class="render-dock" id="render-dock" aria-label="Render queue"><button class="render-queue-toggle" data-action="queue" aria-haspopup="dialog"><span class="render-stack">${icon('layers')}</span><span><strong>Processing queue (${state.queue.length})</strong><small id="render-queue-state">Ready when you are</small></span>${icon('chevron')}</button><div class="render-file"><img id="render-thumb" src="${thumbnail(q)}" alt=""><div><strong id="render-name">${esc(q.name)}</strong><span id="render-stage" role="status"></span></div></div><div class="render-progress"><div class="render-track" id="render-progress" role="progressbar" aria-label="File progress" aria-valuemin="0" aria-valuemax="100"><span id="render-fill"></span></div><strong id="render-percent">0%</strong></div><div class="render-stat render-speed">${icon('bolt')}<div><span id="render-speed">—</span><small id="render-eta">ETA —</small></div></div><div class="render-stat render-memory">${icon('file')}<div><span>Written</span><small id="render-written">—</small></div></div><div class="render-actions"><button class="btn primary render-download" id="render-download" hidden>${icon('download')}<span>Download output</span></button><button class="icon-btn" id="render-cancel" data-action="cancel-process" aria-label="Cancel current job">${icon('close')}</button><button class="btn primary render-control" id="render-control" data-action="process-demo"></button></div></section>`;
}
function updateRenderDock(){
 const dock=$('#render-dock'),q=activeJob();if(!dock||!q)return;
 if(singleJob?.id!==current()?.id)updatePipeline(q);const put=(id,value)=>{const el=$('#'+id);if(el&&el.textContent!==String(value))el.textContent=value;};
 put('render-name',q.name);$('#render-thumb').src=thumbnail(q);put('render-stage',jobLabel(q));
 const completed=state.queue.filter(x=>x.status==='complete').length,failed=state.queue.filter(x=>['error','canceled'].includes(x.status)).length;
 put('render-queue-state',activeTask?(queueMode==='paused'?'Paused':'Processing locally'):`${completed} complete${failed?' · '+failed+' need attention':''}`);
 const progress=jobProgress(q);put('render-percent',progress+'%');$('#render-fill').style.width=progress+'%';$('#render-progress').setAttribute('aria-valuenow',progress);dock.dataset.status=['error','complete'].includes(q.status)?q.status:queueMode;
 const elapsed=(performance.now()-(q.startedAt||performance.now())-(q.pausedMs||0)-(q.pauseAt?performance.now()-q.pauseAt:0))/1000;
 const speed=elapsed>1&&q.seconds?q.seconds/elapsed:0;
 put('render-speed',speed&&q.status==='running'?speed.toFixed(2)+'× speed':q.status==='complete'?'Finished':'—');
 put('render-eta',q.status==='running'&&speed&&q.total>q.seconds?'ETA ~'+time(Math.ceil((q.total-q.seconds)/speed)):q.status==='complete'?'Output ready':'ETA —');
 put('render-written',q.bytes?bytesText(q.bytes):'—');batchDownloads.refresh();
 const ready=state.queue.filter(job=>job.status==='complete'&&results.has(job.id)),download=$('#render-download');
 download.hidden=!ready.length;delete download.dataset.download;delete download.dataset.action;
 if(ready.length===1){download.dataset.download=ready[0].id;download.querySelector('span').textContent='Download output';download.title='Download '+results.get(ready[0].id).name;}
 else if(ready.length>1){download.dataset.action='download-all';download.querySelector('span').textContent='Download all ('+ready.length+')';download.title='Download as ZIP or separate files';}
 const [ic,actionLabel]=processButton(),label=!activeTask&&ready.length&&!state.queue.some(job=>job.status==='queued')?'Run again':actionLabel,control=$('#render-control');
 if(control.dataset.label!==label){control.innerHTML=icon(ic)+`<span>${label}</span>`;control.dataset.label=label;}control.disabled=importBusy||!!singleTask;
 control.classList.toggle('primary',!ready.length||!!activeTask);control.classList.toggle('quiet',!!ready.length&&!activeTask);
 $('#render-cancel').hidden=!activeTask;
 document.querySelectorAll('[data-queue-status]').forEach(el=>{const job=state.queue.find(x=>x.id===Number(el.dataset.queueStatus));if(job)el.textContent=jobLabel(job);});
}
function singleControls(m,s){
 const busy=!!singleTask,own=singleJob?.id===m.id;
 return `<div class="single-convert"><div class="single-convert-actions"><button class="btn primary" data-action="convert-one" ${activeTask||singleTask||importBusy?'disabled':''}>${icon('compress')}${own&&busy?(aiFactor(singleJob.config)?'Upscaling…':'Converting…'):aiFactor(s)?'Upscale image':s.restore?'Restore image':'Convert image'}</button><button class="btn quiet" data-action="edit-settings">${icon('sliders')}Settings</button>${busy?`<button class="btn quiet" data-action="cancel-single">Cancel</button>`:''}</div><p class="single-status" id="single-status" role="status">${own?esc(singleStatusText()):esc(`${aiFactor(s)?'AI '+aiFactor(s)+'× · ':''}${s.format} · ${s.compressionMode==='target'?s.targetSize+' '+s.targetUnit+' target':s.format==='PNG'?'Lossless':'quality '+s.quality+'%'} · This image only`)}</p></div>`;
}
function singleStatusText(){if(!singleJob)return '';if(singleJob.status==='complete')return 'Ready to compare and download.';return jobLabel(singleJob)+(singleJob.stage==='upscale'&&singleJob.status==='running'?' · '+jobProgress(singleJob)+'%':'');}
function applyUpscaleProgress(q,event){if(event.type==='restore-progress'){q.restoreProgress=event.fraction;return;}if(event.type!=='upscale-progress')return;q.aiProgress=event.phase==='tiles'?event.completed/event.total:0;q.aiLabel=event.phase==='tiles'?'AI '+aiFactor(q.config)+'× · tile '+event.completed+' / '+event.total:'Loading AI model · '+Math.round(event.fraction*100)+'%';}
function updateSingleStatus(){
 const el=$('#single-status');if(!el||singleJob?.id!==current()?.id)return;
 el.textContent=singleStatusText();el.classList.toggle('target-missed',singleJob.status==='error');updatePipeline(singleJob);
}
async function convertOne(){
 const m=current();if(!m||m.kind!=='image')return;
 if(activeTask||singleTask||importBusy){toast('Finish or cancel the current operation first.');return;}
 const q={...m,config:effectiveSettings(m),status:'running',stage:'inspect',progress:0,bytes:0};
 if(aiFactor(q.config)&&m.width*m.height*aiFactor(q.config)**2>20e6){toast('AI output exceeds 20 megapixels. Choose a lower factor or a smaller source.');state.mobile='settings';render();return;}
 if(q.config.compressionMode==='target'&&(!Number.isFinite(q.config.targetSize)||q.config.targetSize<=0)){toast('Enter a positive target file size.');state.mobile='settings';render();return;}
 releaseResult('single-'+q.id);state.view='original';state.mobile='edit';singleJob=q;
 singleTask=task('encode',{file:q.file,kind:'image',config:q.config,memoryLimit:outputMemoryBudget()},event=>{
  if(event.type==='stage')q.stage=event.stage;
  if(event.type==='written')q.bytes=event.bytes;
  if(event.type==='target-progress'&&event.targetBytes){q.targetAttempt=event.attempt;q.progress=event.attempt/9;}
  applyUpscaleProgress(q,event);updateSingleStatus();
 });render();
 try{
  const out=await singleTask.promise,extension={WebP:'webp',JPEG:'jpg',PNG:'png'}[q.config.format];
  results.set('single-'+q.id,{...out,url:URL.createObjectURL(out.blob),name:uniqueOutputNames([{name:q.name.replace(/\.[^.]+$/,'')+'-remix.'+extension}])[0].name,config:{...q.config}});
  q.status='complete';q.progress=1;
  if(state.active===q.id){state.view='original';state.compare=true;}
 }catch(error){q.status=error.message==='Canceled.'?'canceled':'error';q.error=error.message;}
 finally{singleTask=null;render();}
}
async function runQueue(){
 if(activeTask||importBusy||singleTask)return;
 queueMode='running';
 for(const q of state.queue){
  if(q.status!=='queued')continue;
  releaseResult(q.id);releaseResult('single-'+q.id);if(singleJob?.id===q.id)singleJob=null;if(state.active===q.id)state.view='original';activeJobId=q.id;q.status='running';q.stage='inspect';q.progress=0;q.targetAttempt=0;q.seconds=0;q.bytes=0;q.pausedMs=0;q.startedAt=performance.now();
  activeTask=task('encode',{file:q.file,kind:q.kind,config:q.config,edit:q.edit,memoryLimit:outputMemoryBudget()},event=>{
   if(event.type==='stage'){q.stage=event.stage;if(event.total)q.total=event.total;}
   if(event.type==='progress'){q.progress=event.seconds/event.total;q.seconds=event.seconds;q.total=event.total;q.frames=event.frames;}
   if(event.type==='written'){q.bytes=event.bytes;q.storage=event.storage;}
   if(event.type==='target-progress'&&event.targetBytes){q.targetAttempt=event.attempt;q.progress=event.attempt/9;}
   applyUpscaleProgress(q,event);updateRenderDock();
  });render();
  try{
   const out=await activeTask.promise;releaseResult(q.id);
   const extension={MP4:'mp4',MOV:'mov',WebM:'webm',WebP:'webp',JPEG:'jpg',PNG:'png'}[q.config.format];
   results.set(q.id,{...out,url:URL.createObjectURL(out.blob),name:uniqueOutputNames([{name:q.name.replace(/\.[^.]+$/,'')+'-remix.'+extension}])[0].name,config:{...q.config},edit:q.edit});q.status='complete';q.progress=1;q.bytes=out.size;
  }catch(error){q.status=q.cancelRequested?'canceled':'error';q.error=error.message;}
  finally{activeTask=null;activeJobId=null;q.pauseAt=null;}
  if(queueMode==='stopped')break;
 }
 queueMode='ready';render();toast(state.queue.some(q=>q.status==='queued')?'Processing stopped. Remaining files are ready when you are.':'Queue finished. Download ready outputs from the bottom bar, or open the batch to choose a file and review errors.');
}
function toggleProcessing(){
 if(!state.queue.length||importBusy||singleTask)return;
 if(activeTask){const q=activeJob();if(queueMode==='paused'){q.pausedMs+=performance.now()-q.pauseAt;q.pauseAt=null;queueMode='running';activeTask.resume();}else{queueMode='paused';q.pauseAt=performance.now();activeTask.pause();}updateRenderDock();return;}
 if(!state.queue.some(q=>q.status==='queued'))for(const q of state.queue){q.status='queued';q.error=null;q.cancelRequested=false;}
 runQueue();
}
function cancelProcessing(){if(!activeTask)return;const q=activeJob();q.cancelRequested=true;queueMode='stopped';activeTask.cancel();}
function releaseResult(id){batchDownloads.invalidate(id);const out=results.get(id);if(out){URL.revokeObjectURL(out.url);removeTemp(out.path);results.delete(id);}}
function clearRenderQueue(shouldRender=true){
 if(activeTask){toast('Cancel the current job before clearing the queue.');return;}
 for(const q of state.queue)releaseResult(q.id);state.queue=[];queueMode='ready';if(shouldRender)render();
}
function removeQueuedFile(id){if(activeTask){toast('Finish or cancel processing before changing the queue.');return;}releaseResult(id);state.queue=state.queue.filter(q=>q.id!==id);render();}
function enqueue(selected=state.media.filter(m=>state.selected.has(m.id))){
 if(activeTask||singleTask||importBusy){toast('Finish or cancel the current operation first.');return;}
 if(!selected.length)return;
 let count=0;
 for(const m of selected){const existing=state.queue.find(q=>q.id===m.id);if(existing?.status==='running')continue;
  const q={...m,config:effectiveSettings(m),edit:videoEditSnapshot(m),status:'queued',progress:0,bytes:0,error:null,cancelRequested:false};
  if(existing)Object.assign(existing,q);else state.queue.push(q);count++;
 }
 render();openQueue();toast(`${count} files added or updated in the batch.`);
}
function downloadJob(id){const out=results.get(id);if(!out)return;const a=document.createElement('a');a.href=out.url;a.download=out.name;document.body.append(a);a.click();a.remove();}
function readyBatchOutputs(){return state.queue.filter(q=>q.status==='complete'&&results.has(q.id)).map(q=>({...results.get(q.id),id:q.id}));}
function openQueue(){
 const [ic,label]=processButton();
 openDialog('Batch queue',state.queue.length?state.queue.map(q=>`<div class="queue-row"><img src="${thumbnail(q)}" alt=""><div class="queue-info"><strong>${esc(q.name)}</strong><small>${esc(outputText(q,q.config))}${q.edit?' · '+cutTime(q.edit.duration):''}</small><p class="queue-message ${q.status==='error'?'error':''}" data-queue-status="${q.id}">${esc(jobLabel(q))}</p>${results.get(q.id)?.metadata?`<small class="queue-finishing">${esc(finishingResult(results.get(q.id)))}</small>`:''}${results.get(q.id)?.targetBytes?`<small class="${results.get(q.id).targetMet?'target-met':'target-missed'}">${esc(targetResultText(results.get(q.id)))}</small>`:''}</div>${results.has(q.id)?`<button class="btn quiet queue-download" data-download="${q.id}" aria-label="Download ${esc(results.get(q.id).name)}">${icon('download')}Download output</button>`:''}<button class="icon-btn" data-remove-queue="${q.id}" aria-label="Remove ${esc(q.name)} from queue" ${activeTask?'disabled':''}>${icon('close')}</button></div>`).join('')+'<p class="subtle">Download outputs before clearing the queue or closing the page.</p>':'<div class="empty"><p>Select media and add it to the queue.</p></div>',`<button class="btn primary" data-batch-download ${readyBatchOutputs().length?'':'disabled'}>Download all (${readyBatchOutputs().length})</button><button class="btn quiet" data-dialog="queue-clear" ${activeTask?'disabled':''}>Clear queue</button>${activeTask?'<button class="btn quiet" data-dialog="cancel-process">Cancel job</button>':''}<button class="btn primary" data-dialog="process-demo" ${!state.queue.length||importBusy||singleTask?'disabled':''}>${icon(ic)}${label}</button>`);
}
function removeMedia(m,shouldRender=true){if(!m)return;if(activeTask||importBusy||singleTask){toast('Finish or cancel the current operation first.');return;}releaseResult(m.id);releaseResult('single-'+m.id);if(singleJob?.id===m.id)singleJob=null;URL.revokeObjectURL(m.url);if(m.thumbnail)URL.revokeObjectURL(m.thumbnail);removeTemp(m.path);state.media=state.media.filter(x=>x.id!==m.id);state.queue=state.queue.filter(q=>q.id!==m.id);delete state.settings[m.id];delete state.videoEdits[m.id];state.selected.delete(m.id);state.active=state.media[0]?.id||null;if(shouldRender)render();}
function resetWorkspace(){if(activeTask||importBusy||singleTask){toast('Finish or cancel the current operation first.');return;}for(const m of [...state.media])removeMedia(m);state.settings={};state.videoEdits={};state.queue=[];state.selected.clear();state.active=null;render();$('#dialog').close();}
function updatePreferences(next){
 const previous=preferences;
 preferences=normalizePreferences(next);state.theme=preferences.theme;
 applyAppearance(preferences);syncPetals();
 document.documentElement.dataset.hints=String(feature('hints'));
 document.documentElement.dataset.engineBadge=String(feature('engineBadge'));
 syncMemoryMonitor();
 let saved=false;try{saved=savePreferences(preferences,localStorage)}catch{}
 // Changing appearance must not restart video playback or replace the viewer.
 if(JSON.stringify(previous.features)!==JSON.stringify(preferences.features))render();
 return saved;
}
function setTheme(theme){return updatePreferences({...preferences,theme});}
matchMedia('(prefers-color-scheme:dark)').addEventListener('change',()=>{if(preferences.theme==='system')applyAppearance(preferences)});
function openMemory(){
 const row=(label,key)=>`<div><dt>${label}</dt><dd data-memory-detail="${key}">—</dd></div>`;
 openDialog('Live memory usage',`<p>Live readings from the browser and the AI engine. Coverage is partial; this is not total device or tab RAM.</p><dl class="memory-details">${row('App estimate · when supported','browser')}${row('JavaScript heap · approximate','heap')}${row('AI memory · allocated','wasm')}${row('AI tensor data · inside allocation','tensors')}${row('Peak JS heap · this session','peakHeap')}${row('Peak AI allocation · this session','peakWasm')}${row('Active media workers','workers')}</dl><p class="memory-sample" data-memory-detail="sample"></p><div class="notice">${icon('info')}<span>AI allocation is the actual size of the engine’s WebAssembly memory buffer, including unused capacity. Tensor data is part of that allocation. The JavaScript reading may be rounded, cached or shared by the browser. These readings overlap and are not added together. Video buffers, decoded images, graphics memory and browser overhead are not fully exposed.</span></div><p>For a complete browser-process view, use your browser’s Task Manager. Unsupported readings stay unavailable.</p>`,`<button class="btn quiet" data-dialog="close">Close</button>`);
 updateMemoryReadout(memoryMonitor?.current());
}
const workspaceSettings=createWorkspaceSettings({getPreferences:()=>preferences,updatePreferences,openDialog,icon,
 capabilities:()=>`${isSecureContext?'Secure connection':'Video processing requires HTTPS'} · ${typeof VideoEncoder==='undefined'?'Video encoder unavailable':'Video encoder available'} · ${navigator.storage?.getDirectory?'Temporary disk storage available':'Limited memory storage'}`});
function openSettings(tab='appearance'){workspaceSettings.open(typeof tab==='string'?tab:'appearance');}
function openAbout(){openDialog('Help · ReMix',`<section class="help-tutorial"><div><h3>Get to know ReMix</h3><p>${tutorial.summary}</p></div><div class="help-tutorial-actions"><button class="btn primary" data-tutorial="resume">${icon('play')}${tutorial.label}</button>${tutorial.canResume?'<button class="btn quiet" data-tutorial="restart">Start again</button>':''}</div></section><p>Drop in photos, videos, or a ZIP. In Preview, Convert image creates one output immediately. In Media, select files and choose Create batch to prepare a batch queue. Choose Quality % or Target file size for photos; a missed size target is shown on the result.</p><p>Video editing removes sections from both picture and sound. Exports use the primary video and audio tracks. Available codecs depend on your browser. Animated images export as a still frame. Photos support local cleanup and deblurring in Restore image, sharpening, and compatible EXIF/XMP metadata preservation. PNG text is kept in PNG exports. AI 2× and 4× upscale the original image locally, up to 20 megapixels. Models load on first use; AI can change fine detail and text. HDR conversion is not available yet.</p><p>Keep ReMix open during processing. Pause keeps the current job in this tab; it does not survive a reload. Download your outputs before clearing the queue or closing the page. Temporary media may be stored in this browser’s private storage. Clear workspace deletes this session’s copies; leftover copies older than seven days are removed the next time ReMix opens. Browser site-data controls can clear all local copies.</p><ul class="help-list"><li><strong>A</strong> · add media</li><li><strong>Q</strong> · open the queue</li><li><strong>T</strong> · choose a theme</li><li><strong>?</strong> · help</li></ul>`)}
document.addEventListener('keydown',e=>{if(!feature('shortcuts')||e.defaultPrevented||e.target.isContentEditable||e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,select,textarea')||$('#dialog').open)return;const key=e.key.toLowerCase();if(['a','q','t','?'].includes(key)){e.preventDefault();action({a:'import',q:'queue',t:'theme','?':'about'}[key])}});
let dragDepth=0;document.addEventListener('dragenter',e=>{if(e.dataTransfer?.types.includes('Files')){e.preventDefault();dragDepth++;document.body.classList.add('drop-active')}});document.addEventListener('dragleave',()=>{if(--dragDepth<=0){dragDepth=0;document.body.classList.remove('drop-active')}});document.addEventListener('dragover',e=>{if(e.dataTransfer?.types.includes('Files'))e.preventDefault()});document.addEventListener('drop',e=>{e.preventDefault();dragDepth=0;document.body.classList.remove('drop-active');if(e.dataTransfer?.files.length)importFiles([...e.dataTransfer.files]);});
window.addEventListener('beforeunload',e=>{if(activeTask||singleTask||importBusy||batchDownloads.isBusy()||results.size){e.preventDefault();e.returnValue='';}});
document.addEventListener('visibilitychange',()=>{document.documentElement.dataset.pageHidden=String(document.hidden);if(!document.hidden&&activeTask)toast('ReMix is active again. Keep this tab open until processing finishes.');});
document.documentElement.dataset.hints=String(feature('hints'));
document.documentElement.dataset.engineBadge=String(feature('engineBadge'));
document.documentElement.dataset.pageHidden=String(document.hidden);
cleanOldTemps();syncMemoryMonitor();render();if(feature('tutorialPrompt'))tutorial.offer();
