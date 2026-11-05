import {uniqueOutputNames} from './remix-engine.js';

export const defaultNaming = () => ({mode:'simple',prefix:'',suffix:'-remix',template:'{name}-remix.{ext}',numbering:false,start:1,padding:3});
export function normalizeNaming(value){
 const d=defaultNaming(),v=value&&typeof value==='object'?value:{};
 const text=(key,max)=>typeof v[key]==='string'?v[key].slice(0,max):d[key];
 const integer=(key,min,max)=>Number.isInteger(v[key])?Math.max(min,Math.min(max,v[key])):d[key];
 return {mode:v.mode==='template'?'template':'simple',prefix:text('prefix',100),suffix:text('suffix',100),template:text('template',300),numbering:typeof v.numbering==='boolean'?v.numbering:d.numbering,start:integer('start',1,999999),padding:integer('padding',1,6)};
}
const formats={MP4:'mp4',MOV:'mov',WebM:'webm',WebP:'webp',JPEG:'jpg',PNG:'png'};
const mimeExtensions={'video/mp4':'mp4','video/quicktime':'mov','video/webm':'webm','image/webp':'webp','image/jpeg':'jpg','image/png':'png'};
export function outputExtension({blob,format,extension}){
 // Completed output bytes (the worker's Blob type) take precedence over UI settings.
 if(blob){const typed=mimeExtensions[blob.type.split(';')[0].trim().toLowerCase()];if(typed)return typed;if(Object.values(formats).includes(extension))return extension;throw new Error('Unknown output file type.');}
 if(formats[format])return formats[format];
 throw new Error('Unknown output format.');
}
// OPFS File objects have an empty MIME type. Read only the output header once,
// at completion, rather than falling back to a mutable UI format or a typed name.
export async function exportedExtension(blob){
 const typed=mimeExtensions[blob.type.split(';')[0].trim().toLowerCase()];if(typed)return typed;
 const b=new Uint8Array(await blob.slice(0,64).arrayBuffer());
 const ascii=(start,end)=>String.fromCharCode(...b.slice(start,end));
 if(b.length>=8&&[137,80,78,71,13,10,26,10].every((v,i)=>b[i]===v))return 'png';
 if(b[0]===255&&b[1]===216&&b[2]===255)return 'jpg';
 if(ascii(0,4)==='RIFF'&&ascii(8,12)==='WEBP')return 'webp';
 if(b[0]===26&&b[1]===69&&b[2]===223&&b[3]===163)return 'webm';
 if(ascii(4,8)==='ftyp')return ascii(8,12)==='qt  '?'mov':'mp4';
 throw new Error('Unknown output file type.');
}
const leaf=name=>String(name||'').split(/[\\/]/).at(-1);
const sourceStem=name=>leaf(name).replace(/\.[^.]+$/,'')||'output';
const stripMediaExtension=name=>name.replace(/\.(?:mp4|mov|webm|webp|jpe?g|png|gif|avif|heic|heif|tiff?|bmp|svg|mkv|avi|m4v)$/i,'');
function shortStem(value,reserve=0){
 // Leave room for collision suffixes and the extension, including on UTF-8 filesystems.
 // This also keeps the engine/ZIP sanitizer idempotent (its stem limit is 150).
 let result='',bytes=0;const encoder=new TextEncoder();
 for(const char of value){const size=encoder.encode(char).length;if(bytes+size>180-reserve||result.length+char.length>120-reserve)break;result+=char;bytes+=size;}
 return result;
}
export function planOutputNames(items,preference){
 const p=normalizeNaming(preference);
 const candidates=items.map((item,index)=>{
  const ext=outputExtension(item),number=String(p.start+index).padStart(p.padding,'0');
  const tokens={name:sourceStem(item.name),ext,index:number};
  const hasCustom=typeof item.customName==='string'&&!!item.customName.trim();
  let stem;
  if(hasCustom)stem=stripMediaExtension(leaf(item.customName).trim());
  else if(p.mode==='template'){
   const template=p.template.trim()||defaultNaming().template;
   // A terminal extension placeholder or typed media extension never controls the format.
   stem=stripMediaExtension(template.replace(/\.?\{ext\}$/,'')).replace(/\{(name|ext|index)\}/g,(_,key)=>tokens[key]);
  }else stem=p.prefix+tokens.name+p.suffix;
  const numbering=p.numbering&&!(p.mode==='template'&&p.template.includes('{index}')&&!hasCustom)?'-'+number:'';
  // Reuse the engine sanitizer for path, Unicode, control character and device-name safety.
  let safe=uniqueOutputNames([{name:(stem.trim()||'output')+'.'+ext}])[0].name;
  safe=shortStem(safe.slice(0,-ext.length-1),numbering.length).replace(/[. ]+$/g,'');
  return {...item,name:(safe||'output')+numbering+'.'+ext};
 });
 return uniqueOutputNames(candidates);
}
