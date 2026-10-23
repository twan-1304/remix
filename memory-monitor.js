// Browser measurements only. File sizes and pixel counts are never used as RAM.
const valid=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0;
export function readHeap(perf){
 try{const m=perf?.memory;return valid(m?.usedJSHeapSize)?{used:m.usedJSHeapSize,allocated:valid(m.totalJSHeapSize)?m.totalJSHeapSize:null}:null;}catch{return null;}
}
export function summarizeWorkers(jobs){
 const ai=jobs.filter(j=>j.ai),measured=ai.filter(j=>valid(j.memory?.wasmBytes));
 return {workers:jobs.length,aiWorkers:ai.length,wasm:ai.length&&measured.length===ai.length?measured.reduce((n,j)=>n+j.memory.wasmBytes,0):null,
  tensors:measured.length?measured.reduce((n,j)=>n+(valid(j.memory.tensorBytes)?j.memory.tensorBytes:0),0):null,
  sampledAt:measured.length?Math.min(...measured.map(j=>j.memory.sampledAt)):null};
}
export function createMemoryMonitor({subscribeWorkers,onChange,perf=performance,doc=document,isolated=self.crossOriginIsolated,clock=()=>Date.now(),schedule=setTimeout,unschedule=clearTimeout}){
 let jobs=[],timer,disposed=false,pending=false,browserReading=null,nextDetailed=0,detailedFailed=false,peakWasm=null,peakHeap=null,last;
 function snapshot(){
  const heap=readHeap(perf),worker=summarizeWorkers(jobs),now=clock();
  if(heap)peakHeap=Math.max(peakHeap||0,heap.used);
  if(worker.wasm!==null)peakWasm=Math.max(peakWasm||0,worker.wasm);
  return {heap,worker,peakHeap,peakWasm,browser:browserReading&&now-browserReading.sampledAt<120000?browserReading:null,pending,
   detailedSupported:!!isolated&&typeof perf?.measureUserAgentSpecificMemory==='function'&&!detailedFailed,now};
 }
 function emit(){if(!disposed){last=snapshot();onChange(last);}return last;}
 async function sampleDetailed(){
  if(pending||disposed)return;pending=true;
  try{const result=await perf.measureUserAgentSpecificMemory();if(!disposed&&valid(result?.bytes))browserReading={bytes:result.bytes,sampledAt:clock()};}
  catch{detailedFailed=true;browserReading=null;}
  finally{pending=false;if(!disposed){nextDetailed=clock()+30000+Math.random()*5000;emit();}}
 }
 function tick(){
  unschedule(timer);if(disposed)return;
  if(!doc.hidden){const s=emit();if(s.detailedSupported&&!pending&&clock()>=nextDetailed)void sampleDetailed();}
  timer=schedule(tick,1000);
 }
 const unsubscribe=subscribeWorkers(value=>{jobs=value;emit();});
 doc.addEventListener('visibilitychange',tick);tick();
 return {current:()=>last,refresh:emit,destroy(){disposed=true;unschedule(timer);unsubscribe();doc.removeEventListener('visibilitychange',tick);}};
}
export const memorySize=bytes=>valid(bytes)?(bytes>=1e9?(bytes/1e9).toFixed(2)+' GB':(bytes/1e6).toFixed(1)+' MB'):'Unavailable';
export function memorySummary(s){
 if(s.worker.aiWorkers)return s.worker.wasm===null?{label:'AI memory',value:'Measuring…'}:{label:'AI allocated · partial',value:memorySize(s.worker.wasm)};
 if(s.browser)return {label:'App memory · estimate',value:'≈ '+memorySize(s.browser.bytes)};
 if(s.heap)return {label:'JS heap · partial',value:'≈ '+memorySize(s.heap.used)};
 return {label:'Memory',value:s.pending?'Measuring…':'Unavailable'};
}
