// Installation is requested only by a user click; the browser owns the prompt.
export function createAppInstaller({onChange=()=>{},onUnavailable=()=>{},onInstalled=()=>{},win=window,nav=navigator}={}){
  const display=win.matchMedia('(display-mode: standalone), (display-mode: minimal-ui), (display-mode: fullscreen), (display-mode: window-controls-overlay)');
  let deferredPrompt=null,busy=false,installed=false;
  const state=()=>({visible:!installed&&!display.matches&&nav.standalone!==true,busy});
  const notify=()=>onChange(state());
  function beforeInstall(event){
    if(!state().visible)return;
    event.preventDefault();
    deferredPrompt=event;
    notify();
  }
  function didInstall(){
    installed=true;deferredPrompt=null;
    notify();onInstalled();
  }
  win.addEventListener('beforeinstallprompt',beforeInstall);
  win.addEventListener('appinstalled',didInstall);
  display.addEventListener?.('change',notify);
  return {
    state,
    async install(){
      if(!state().visible||busy)return;
      if(!deferredPrompt){onUnavailable();return;}
      const event=deferredPrompt;
      deferredPrompt=null;busy=true;notify();
      try{
        await event.prompt();
        const choice=await event.userChoice;
        if(choice?.outcome==='accepted')installed=true;
      }catch{
        if(state().visible)onUnavailable();
      }finally{
        busy=false;notify();
      }
    },
    destroy(){
      win.removeEventListener('beforeinstallprompt',beforeInstall);
      win.removeEventListener('appinstalled',didInstall);
      display.removeEventListener?.('change',notify);
    }
  };
}

export function installInstructions(nav=navigator){
  const ua=nav.userAgent||'';
  if(/iPad|iPhone|iPod/.test(ua)||(nav.platform==='MacIntel'&&nav.maxTouchPoints>1)){
    return 'In Safari, open Share and choose Add to Home Screen. Turn on Open as Web App if shown, then tap Add.';
  }
  if(/Android/.test(ua))return 'Open your browser’s menu and choose Add to Home screen or Install app, then follow the confirmation.';
  if(/Mac/.test(nav.platform||'')&&/Safari/.test(ua)&&!/Chrome|Chromium|Edg|OPR/.test(ua)){
    return 'In Safari, choose File → Add to Dock, then confirm Add.';
  }
  return 'Use the Install icon in your address bar or your browser’s install menu. In Chrome: ⋮ → Cast, save and share → Install page as app.';
}
