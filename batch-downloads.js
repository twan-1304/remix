// One retained ZIP at a time; ordinary per-file downloads remain independent.
export function createBatchDownloads({task,removeTemp,uniqueOutputNames,getItems,queueCount,isProcessing,memoryBudget,openDialog,icon,bytesText}){
 let running=null,archive=null;
 const $=s=>document.querySelector(s);
 function request(url,name){const a=document.createElement('a');a.href=url;a.download=name;(document.querySelector('dialog[open]')||document.body).append(a);a.click();a.remove();}
 function disposeArchive(){if(archive){URL.revokeObjectURL(archive.url);removeTemp(archive.path);archive=null;}}
 function cancel(){if(running){running.canceled=true;running.job?.cancel();running=null;}}
 function refresh(){
  const items=getItems(),count=items.length;
  document.querySelectorAll('[data-batch-download]').forEach(el=>{el.disabled=!count;el.textContent='Download all ('+count+')';});
  if(!$('#batch-download-options'))return;
  $('#batch-ready').textContent=count+' of '+queueCount()+' files ready · '+bytesText(items.reduce((n,i)=>n+i.blob.size,0));
  $('#batch-scope').textContent=count<queueCount()?'Only completed outputs are included. Unfinished, failed and cancelled files are skipped.':'All completed batch outputs are included.';
  $('#batch-zip').disabled=!count||isProcessing();$('#batch-separate').disabled=!count;
  $('#batch-zip-note').textContent=isProcessing()?'Finish or cancel processing to create a ZIP.':'One archive containing your finished files.';
 }
 function open(){
  openDialog('Download all',`<div id="batch-download-options"><p class="batch-ready" id="batch-ready"></p><p id="batch-scope"></p><div class="batch-download-options"><button class="batch-download-choice" id="batch-zip">${icon('zip')}<span><strong>ZIP archive <small>Recommended</small></strong><span id="batch-zip-note"></span></span></button><button class="batch-download-choice" id="batch-separate">${icon('download')}<span><strong>Separate files</strong><span>One download per output. Your browser may ask you to allow multiple downloads.</span></span></button></div><p class="subtle">Duplicate filenames are numbered. Individual downloads are also available in the batch queue.</p></div>`,`<button class="btn quiet" data-dialog="close">Close</button>`);
  $('#batch-zip').onclick=()=>makeZip(getItems());$('#batch-separate').onclick=()=>separate(getItems());refresh();
 }
 function progressView(title,description){
  openDialog(title,`<p>${description}</p><progress id="batch-download-progress" max="100" value="0"></progress><p id="batch-download-status" role="status">Starting…</p><div id="batch-download-result"></div>`,`<button class="btn quiet" id="batch-stop">Cancel</button>`);
  $('#batch-stop').onclick=()=>{cancel();$('#dialog').close();};
 }
 function finishedButtons(){const b=$('#batch-stop');if(b){b.textContent='Close';b.onclick=()=>$('#dialog').close();}}
 function readyZip(){
  $('#batch-download-progress').value=100;
  $('#batch-download-status').textContent='ZIP ready · '+archive.count+' files · '+bytesText(archive.size);
  $('#batch-download-result').innerHTML=`<a class="btn primary" id="save-batch-zip">${icon('download')}Download ZIP</a><p class="subtle">If the download did not start, use the button above.</p>`;
  $('#save-batch-zip').href=archive.url;$('#save-batch-zip').download=archive.name;finishedButtons();
  request(archive.url,archive.name);
 }
 async function makeZip(items){
  if(!items.length||isProcessing())return;
  progressView('Download ZIP','Preparing '+items.length+' completed outputs. Your files are not re-encoded.');
  if(archive&&items.length===archive.items.length&&items.every((item,i)=>item.blob===archive.items[i].blob&&item.name===archive.items[i].name)){readyZip();return;}
  disposeArchive();const run={canceled:false,items};running=run;
  try{
   run.job=task('zip',{entries:items.map(({name,blob})=>({name,blob})),kind:'archive',memoryLimit:memoryBudget()},e=>{
    if(run.canceled||e.type!=='archive-progress')return;
    $('#batch-download-progress').value=e.totalBytes?Math.min(99,e.bytes/e.totalBytes*100):0;
    $('#batch-download-status').textContent=e.completed===e.total?'Finalizing ZIP…':'Adding '+Math.min(e.completed+1,e.total)+' of '+e.total+' · '+e.name;
   });
   const result=await run.job.promise;
   if(run.canceled){removeTemp(result.path);return;}
   archive={...result,items,url:URL.createObjectURL(result.blob),name:'remix-batch-'+new Date().toISOString().slice(0,10)+'.zip'};running=null;readyZip();
  }catch(error){if(!run.canceled){running=null;$('#batch-download-status').textContent='ZIP could not be created: '+error.message;$('#batch-download-result').innerHTML='<button class="btn quiet" id="batch-try-separate">Download separate files</button>';$('#batch-try-separate').onclick=()=>separate(items);finishedButtons();}}
 }
 async function separate(items){
  if(!items.length)return;
  const files=uniqueOutputNames(items);
  progressView('Download separate files','Allow multiple downloads if your browser asks. ReMix cannot confirm whether the browser saved each file.');
  const run={canceled:false,items};running=run;
  try{
   for(let i=0;i<files.length;i++){
    if(run.canceled)return;request(files[i].url,files[i].name);
    $('#batch-download-progress').value=(i+1)/files.length*100;$('#batch-download-status').textContent='Requested '+(i+1)+' of '+files.length+' downloads';
    if(i+1<files.length)await new Promise(resolve=>setTimeout(resolve,200));
   }
   running=null;$('#batch-download-result').innerHTML='<p>Check your browser’s downloads. If files are missing, allow multiple downloads or choose ZIP archive.</p>';finishedButtons();
  }catch(error){if(!run.canceled){running=null;$('#batch-download-status').textContent='Download request failed: '+error.message;finishedButtons();}}
 }
 return {open,refresh,cancel,invalidate(id){if(running?.items.some(i=>i.id===id))cancel();if(archive?.items.some(i=>i.id===id))disposeArchive();},memoryBytes:()=>archive?.storage==='memory'?archive.size:0,isBusy:()=>!!running};
}
