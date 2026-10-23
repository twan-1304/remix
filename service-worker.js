// Image Crucible retirement worker. Keep this URL available for returning users.
// No fetch handler: every request goes to the network, never the legacy shell.
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 try{
  const keys=await caches.keys();
  await Promise.allSettled(keys.filter(key=>key.startsWith('image-crucible-')).map(key=>caches.delete(key)));
 }finally{
  await self.registration.unregister();
 }
})()));
