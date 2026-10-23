// Workspace preferences never contain source media, output blobs or job state.
export const PREFERENCES_KEY = 'remix-workspace-preferences-v1';
export const THEMES = [
  {id:'dark',name:'Dark',note:'The ReMix original',scheme:'dark',colors:['#0c0c11','#121218','#a787ff']},
  {id:'light',name:'Light',note:'Clear, bright, familiar',scheme:'light',colors:['#f2f2f6','#ffffff','#7041d3']},
  {id:'retro',name:'Retro',note:'Desktop, circa 1995',scheme:'light',colors:['#286b6b','#d8d6cd','#183f82']},
  {id:'ascii',name:'ASCII',note:'Only the essentials_',scheme:'dark',colors:['#08100b','#0d1810','#9de4a1']},
  {id:'sakura',name:'Sakura',note:'Petals in the morning',scheme:'light',colors:['#fff1f4','#fffafb','#a93568']},
  {id:'senbonzakura',name:'Senbonzakura',note:'A thousand blossoms at dusk',scheme:'dark',colors:['#17101f','#221728','#f3a6d5']},
  {id:'aquatic',name:'Aquatic',note:'Sunlight in the shallows',scheme:'light',colors:['#e9f7f9','#f7fdfe','#08677d']},
  {id:'abyss',name:'Abyss',note:'Below the surface',scheme:'dark',colors:['#071620','#0b202b','#6bdcd7']},
  {id:'synthwave',name:'Synthwave',note:'After hours, neon on',scheme:'dark',colors:['#150d27','#211535','#ff9cde']},
  {id:'forest',name:'Forest',note:'A little room to breathe',scheme:'dark',colors:['#101b17','#182820','#a9d6a2']},
  {id:'ember',name:'Ember',note:'Warm light, late nights',scheme:'dark',colors:['#201510','#2c1e17','#f7bb83']},
  {id:'paper',name:'Paper',note:'Ink, linen, quiet focus',scheme:'light',colors:['#eee9df','#fbf7ed','#72553b']},
];
export const FEATURES = [
  {id:'memory',group:'Workspace',name:'Live memory meter',description:'Show the memory readout and sample browser memory while enabled.'},
  {id:'pipeline',group:'Workspace',name:'Processing pipeline',description:'Show the step-by-step pipeline below the preview. Job controls stay available.'},
  {id:'hints',group:'Workspace',name:'Workspace hints',description:'Show zoom, batch and footer tips around the workspace.'},
  {id:'shortcuts',group:'Workspace',name:'Keyboard shortcuts',description:'Enable A for media, Q for queue, T for themes, and ? for help.'},
  {id:'compare',group:'Workspace',name:'Before / after comparison',description:'Enable the split-image divider. Original and Output views remain available.'},
  {id:'engineBadge',group:'Workspace',name:'Engine status badge',description:'Show the Engine beta badge in the desktop toolbar.'},
  {id:'aiUpscale',group:'Image tools',name:'AI upscaling',description:'Make local AI 2× and 4× scaling available in the Inspector and presets.'},
  {id:'restoration',group:'Image tools',name:'Image restoration',description:'Make noise cleanup and deblurring available for new exports.'},
  {id:'finishing',group:'Image tools',name:'Finishing touches',description:'Make sharpening and metadata preservation available for new exports.'},
  {id:'tutorialPrompt',group:'Guidance',name:'Welcome tour prompt',description:'Offer the tour to a new workspace. You can always start it from Help.'},
];
export function defaultPreferences(){return {version:1,theme:'dark',effects:true,reducedMotion:false,features:Object.fromEntries(FEATURES.map(f=>[f.id,f.id!=='engineBadge']))};}
export function validTheme(theme){return theme==='system'||THEMES.some(t=>t.id===theme);}
export function normalizePreferences(value,legacyTheme='dark'){
  const defaults=defaultPreferences(),source=value&&typeof value==='object'?value:{};
  return {...defaults,theme:validTheme(source.theme)?source.theme:validTheme(legacyTheme)?legacyTheme:'dark',
    effects:typeof source.effects==='boolean'?source.effects:defaults.effects,
    reducedMotion:typeof source.reducedMotion==='boolean'?source.reducedMotion:defaults.reducedMotion,
    features:Object.fromEntries(FEATURES.map(({id})=>[id,typeof source.features?.[id]==='boolean'?source.features[id]:defaults.features[id]]))};
}
export function loadPreferences(storage){
  let legacy='dark';try{legacy=storage.getItem('remix-shell-theme')||legacy;}catch{}
  try{return normalizePreferences(JSON.parse(storage.getItem(PREFERENCES_KEY)),legacy);}catch{return normalizePreferences(null,legacy);}
}
export function savePreferences(preferences,storage){
  try{storage.setItem(PREFERENCES_KEY,JSON.stringify(normalizePreferences(preferences)));}catch{return false;}
  // Keep old installations compatible; the versioned record is authoritative.
  try{storage.setItem('remix-shell-theme',preferences.theme);}catch{}
  return true;
}
export function resolveTheme(theme,darkSystem=false){return THEMES.find(t=>t.id===(theme==='system'?(darkSystem?'dark':'light'):theme))||THEMES[0];}
export function applyAppearance(preferences,{root=document.documentElement,meta=document.querySelector('meta[name="theme-color"]'),darkSystem=matchMedia('(prefers-color-scheme: dark)').matches}={}){
  const theme=resolveTheme(preferences.theme,darkSystem);
  root.dataset.theme=theme.id;root.dataset.colorScheme=theme.scheme;
  root.dataset.effects=String(preferences.effects);root.dataset.reducedMotion=String(preferences.reducedMotion);
  meta?.setAttribute('content',theme.colors[0]);
  return theme;
}
export function effectiveImageConfig(config,preferences){
  const result={...config};
  if(!preferences.features.aiUpscale)result.aiScale='off';
  if(!preferences.features.restoration)result.restore=false;
  if(!preferences.features.finishing){result.sharpen=false;result.metadata=false;}
  return result;
}
