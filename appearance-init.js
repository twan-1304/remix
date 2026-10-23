// Apply the saved appearance before painting; no inline scripts are required.
try {
      let p={};try{p=JSON.parse(localStorage.getItem('remix-workspace-preferences-v1'))||{}}catch{}
      const ids=['dark','light','retro','ascii','sakura','senbonzakura','aquatic','abyss','synthwave','forest','ember','paper','system'];
      let t=ids.includes(p.theme)?p.theme:localStorage.getItem('remix-shell-theme')||'dark';
      if(!ids.includes(t))t='dark';if(t==='system')t=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';
      const root=document.documentElement;root.dataset.theme=t;root.dataset.colorScheme=['light','retro','sakura','aquatic','paper'].includes(t)?'light':'dark';
      root.dataset.effects=String(p.effects!==false);root.dataset.reducedMotion=String(p.reducedMotion===true);
    }catch{}
