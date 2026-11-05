import {defaultNaming,normalizeNaming} from './output-names.js';

export function createOutputNaming({getPreferences,updatePreferences,getPreview,getCustomName,setCustomName,openDialog,esc}){
 function open(id=null){
  const p=getPreferences().naming;
  const input=(key,label,max)=>`<label class="naming-field" for="naming-${key}"><span>${label}</span><input class="input" id="naming-${key}" data-naming="${key}" maxlength="${max}" value="${esc(p[key])}" autocomplete="off"></label>`;
  openDialog('Output filenames',`<div id="output-naming-controls">${id!==null?`<label class="naming-field" for="naming-custom"><span>Name for this file</span><input class="input" id="naming-custom" maxlength="300" value="${esc(getCustomName(id))}" placeholder="Use naming default" autocomplete="off"></label><p class="subtle">Leave blank to use the default below. A custom name replaces the prefix, suffix and template for this file only.</p>`:''}<label class="naming-field" for="naming-mode"><span>Workspace naming default</span><select class="input" id="naming-mode" data-naming="mode"><option value="simple" ${p.mode==='simple'?'selected':''}>Original name + prefix / suffix</option><option value="template" ${p.mode==='template'?'selected':''}>Naming template</option></select></label><div id="naming-simple" class="naming-grid" ${p.mode==='simple'?'':'hidden'}>${input('prefix','Prefix',100)}${input('suffix','Suffix (blank removes -remix)',100)}</div><div id="naming-template-fields" ${p.mode==='template'?'':'hidden'}>${input('template','Naming template',300)}<p class="subtle">{name} = original name · {ext} = output extension · {index} = batch number.<br>Example: {name}-final.{ext}</p></div><label class="naming-check"><input type="checkbox" id="naming-numbering" data-naming="numbering" ${p.numbering?'checked':''}> Append batch number</label><div class="naming-grid">${[['start','Start at',1,999999],['padding','Number digits',1,6]].map(([key,label,min,max])=>`<label class="naming-field" for="naming-${key}"><span>${label}</span><input class="input" type="number" id="naming-${key}" data-naming="${key}" min="${min}" max="${max}" value="${p[key]}"></label>`).join('')}</div><p class="subtle">Numbers follow queue order, including unfinished files. {index} uses these number settings. Extensions always follow the exported format. Unsafe characters are cleaned and duplicate names are numbered.</p><h3 class="section-title">Filename preview</h3><div id="naming-preview" aria-live="polite"></div><p id="naming-save-status" role="status">Defaults save automatically in this browser. File-specific names last for this session.</p></div>`,`<button class="btn quiet" id="naming-reset">Restore -remix default</button><button class="btn primary" data-dialog="close">Done</button>`);
  document.getElementById('dialog').classList.add('output-naming-dialog');
  const controls=document.getElementById('output-naming-controls');
  const refresh=()=>{document.getElementById('naming-preview').innerHTML=getPreview(id).map(row=>`<div class="naming-preview-row"><span>${esc(row.source)}</span><strong>${esc(row.name)}</strong></div>`).join('');};
  const save=next=>{const saved=updatePreferences({...getPreferences(),naming:normalizeNaming(next)});document.getElementById('naming-save-status').textContent=saved?'Naming default saved in this browser.':'Applied for this session. Browser storage is unavailable.';refresh();};
  controls.oninput=e=>{
   const t=e.target,key=t.dataset.naming;
   if(t.id==='naming-custom'){setCustomName(id,t.value);refresh();return;}
   if(!key)return;
   if(t.type==='number'&&!t.validity.valid)return;
   save({...getPreferences().naming,[key]:t.type==='checkbox'?t.checked:t.type==='number'?Number(t.value):t.value});
   if(key==='mode'){document.getElementById('naming-simple').hidden=t.value!=='simple';document.getElementById('naming-template-fields').hidden=t.value!=='template';}
  };
  document.getElementById('naming-reset').onclick=()=>{save(defaultNaming());open(id);};
  refresh();
 }
 return {open};
}
