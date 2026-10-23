// Only update Image Crucible's registration at this app's exact scope.
// Fresh visitors get no service worker; existing tabs are never reloaded.
async function retireLegacyWorker(){
 if(!('serviceWorker' in navigator))return;
 const scope=new URL('./',import.meta.url).href;
 const workerURL=new URL('./service-worker.js',import.meta.url);
 const registration=await navigator.serviceWorker.getRegistration(scope);
 if(!registration||registration.scope!==scope)return;
 const workers=[registration.active,registration.waiting,registration.installing].filter(Boolean);
 if(!workers.length||!workers.every(worker=>{
  const url=new URL(worker.scriptURL);
  return url.origin===workerURL.origin&&url.pathname===workerURL.pathname;
 }))return;
 await registration.update();
}
retireLegacyWorker().catch(()=>{}); // Offline/storage restrictions must not block editing.
