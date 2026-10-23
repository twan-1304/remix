import {THEMES,FEATURES,defaultPreferences,resolveTheme} from './preferences.js';
import {petalScene} from './petals.js';

export function createWorkspaceSettings({getPreferences,updatePreferences,openDialog,icon,capabilities}){
  let tab='appearance',saveMessage='Changes save automatically in this browser.';
  const tabs=[['appearance','sun','Appearance'],['features','sliders','Features'],['workspace','folder','Workspace']];
  const toggle=(id,title,description,checked,attribute='data-feature')=>`<div class="preference-row"><div><label id="pref-label-${id}">${title}</label><p id="pref-description-${id}">${description}</p></div><button type="button" class="switch preference-switch" role="switch" aria-labelledby="pref-label-${id}" aria-describedby="pref-description-${id}" aria-checked="${checked}" ${attribute}="${id}"></button></div>`;
  function card(theme,selected){
    return `<button class="theme-card ${selected?'is-selected':''}" data-pick-theme="${theme.id}" aria-pressed="${selected}" aria-label="${theme.name}: ${theme.note}"><span class="theme-swatch swatch-${theme.id}" style="--sw-bg:${theme.colors[0]};--sw-panel:${theme.colors[1]};--sw-accent:${theme.colors[2]}" aria-hidden="true">${['sakura','senbonzakura'].includes(theme.id)?petalScene({mini:true}):''}<span class="sw-top"><i></i><i></i><i></i></span><span class="sw-rail"></span><span class="sw-list"><i></i><i></i><i></i></span><span class="sw-canvas">${theme.id==='ascii'?'[ ReMix_ ]':theme.id==='retro'?'ReMix.exe':'R'}</span><span class="sw-controls"><i></i><i></i><i></i></span><span class="theme-selected">${icon('check')}</span></span><span class="theme-card-title">${theme.name}<span>${theme.scheme==='light'?'Light':'Dark'}</span></span><small>${theme.note}</small></button>`;
  }
  function appearance(p){
    const active=resolveTheme('system',matchMedia('(prefers-color-scheme: dark)').matches);
    return `<div class="preferences-heading"><span class="settings-eyebrow">MAKE YOURSELF AT HOME</span><h3>A workspace with your name on it.</h3><p>Choose a look. Your media keeps its original colours.</p></div><div class="theme-section-heading"><h4>The essentials</h4><span>Always available</span></div><div class="theme-essentials">${THEMES.slice(0,2).map(t=>card(t,p.theme===t.id)).join('')}<button class="system-theme ${p.theme==='system'?'is-selected':''}" data-pick-theme="system" aria-pressed="${p.theme==='system'}">${icon('monitor')}<strong>System</strong><small>Follow your device</small><span>Currently ${active.scheme}</span>${p.theme==='system'?icon('check'):''}</button></div><div class="theme-section-heading"><h4>The collection</h4><span>${THEMES.length-2} optional themes</span></div><div class="theme-collection">${THEMES.slice(2).map(t=>card(t,p.theme===t.id)).join('')}</div><div class="preference-group appearance-options">${toggle('effects','Theme details','Decorative petals, grids and textures around the workspace.',p.effects,'data-appearance')}${toggle('reducedMotion','Reduce motion','Keep transitions and theme decoration still. Your device preference is also respected.',p.reducedMotion,'data-appearance')}</div>`;
  }
  function features(p){
    return `<div class="preferences-heading"><span class="settings-eyebrow">YOUR WORKSPACE, YOUR RULES</span><h3>Keep what you use.</h3><p>Turn individual features on or off. Core imports, conversions and downloads stay available.</p></div>${['Workspace','Image tools','Guidance'].map(group=>`<section class="preference-group"><div class="theme-section-heading"><h4>${group}</h4><span>${FEATURES.filter(f=>f.group===group&&p.features[f.id]).length} enabled</span></div>${group==='Image tools'?'<p class="feature-scope">Applies to new exports and newly queued files, including presets. Existing batch items keep their saved settings. Re-enable a tool to restore its controls and your previous choices.</p>':''}${FEATURES.filter(f=>f.group===group).map(f=>toggle(f.id,f.name,f.description,p.features[f.id])).join('')}</section>`).join('')}`;
  }
  function workspace(){return `<div class="preferences-heading"><span class="settings-eyebrow">LOCAL BY DESIGN</span><h3>Your files stay with you.</h3><p>Themes, feature choices and custom presets are saved in this browser.</p></div><div class="workspace-settings-note">${icon('lock')}<div><strong>Media is processed on this device</strong><p>Files, edits and outputs belong to the current session. Download your results before reloading or clearing the workspace.</p></div></div><p id="engine-capabilities">${capabilities()}</p><section class="preference-group"><div class="preference-row"><div><label>Reset preferences</label><p>Restore Dark and the default features. Keep media, edits and saved presets.</p></div><button class="btn quiet" data-reset-preferences>Reset</button></div><div class="preference-row"><div><label>Clear workspace</label><p>Remove session files, queued jobs and outputs. Keep preferences and presets.</p></div><button class="btn quiet" data-dialog="reset">Clear</button></div></section>`;}
  function body(){const p=getPreferences();return `<div class="preferences-layout"><nav class="preferences-nav" aria-label="Settings sections">${tabs.map(([id,ic,label])=>`<button data-settings-tab="${id}" aria-current="${tab===id?'page':'false'}">${icon(ic)}${label}</button>`).join('')}<div class="preferences-nav-note">ReMix<br><span>Made for your workflow.</span></div></nav><div class="preferences-content" id="preferences-content">${tab==='appearance'?appearance(p):tab==='features'?features(p):workspace()}</div></div>`;}
  function change(next){saveMessage=updatePreferences(next)?'Saved in this browser.':'Applied for this session. Browser storage is unavailable.';}
  function redraw(focus){
    const content=document.getElementById('preferences-content'),scroll=content?.scrollTop||0;
    document.querySelector('#dialog .dialog-body').innerHTML=body();
    document.getElementById('preferences-content').scrollTop=scroll;
    document.getElementById('preferences-save-status').textContent=saveMessage;
    if(focus)document.querySelector(focus)?.focus({preventScroll:true});
  }
  function open(requestedTab='appearance'){
    tab=tabs.some(t=>t[0]===requestedTab)?requestedTab:'appearance';
    openDialog('Workspace settings',body(),`<span id="preferences-save-status" role="status">${saveMessage}</span><button class="btn primary" data-dialog="close">Done</button>`);
    const dialog=document.getElementById('dialog');dialog.classList.add('workspace-settings-dialog');
    const baseClick=dialog.onclick;
    dialog.onclick=e=>{
      const button=e.target.closest('button');if(!button)return baseClick(e);
      const p=getPreferences(),d=button.dataset;
      if(d.settingsTab){tab=d.settingsTab;redraw(`[data-settings-tab="${tab}"]`);document.getElementById('preferences-content').scrollTop=0;}
      else if(d.pickTheme){change({...p,theme:d.pickTheme});redraw(`[data-pick-theme="${d.pickTheme}"]`);}
      else if(d.feature){change({...p,features:{...p.features,[d.feature]:!p.features[d.feature]}});redraw(`[data-feature="${d.feature}"]`);}
      else if(d.appearance){change({...p,[d.appearance]:!p[d.appearance]});redraw(`[data-appearance="${d.appearance}"]`);}
      else if(button.hasAttribute('data-reset-preferences')){change(defaultPreferences());redraw('[data-reset-preferences]');}
      else baseClick(e);
    };
  }
  return {open};
}
