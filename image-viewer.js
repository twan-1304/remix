// Both comparison layers share the same source-sized coordinate system.
export function bindImageViewer(stage,media,state){
 const images=[...stage.querySelectorAll('img')],zoomField=document.querySelector('#preview-zoom');
 const divider=stage.querySelector('.compare-drag-handle'),pointers=new Map();let gesture;
 const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
 const size=()=>({w:stage.clientWidth,h:stage.clientHeight});
 const fit=()=>{const {w,h}=size();return Math.max(1,Math.min(100,w/media.width*100,h/media.height*100));};
 function paint(){
  const {w,h}=size(),scale=state.zoom/100,limitX=Math.max(0,(media.width*scale-w)/2),limitY=Math.max(0,(media.height*scale-h)/2);
  state.panX=clamp(state.panX||0,-limitX,limitX);state.panY=clamp(state.panY||0,-limitY,limitY);
  for(const image of images){image.style.width=media.width*scale+'px';image.style.height=media.height*scale+'px';image.style.transform=`translate(-50%,-50%) translate(${state.panX}px,${state.panY}px)`;}
  stage.classList.toggle('can-pan',limitX>0||limitY>0);
  if(zoomField)zoomField.value=String(Math.round(state.zoom*10)/10);
  document.querySelector('[data-action="zoom-in"]').disabled=state.zoom>=1200;
  document.querySelector('[data-action="zoom-out"]').disabled=state.zoom<=1;
 }
 function setZoom(value,anchor){
  const next=clamp(Number(value)||100,1,1200),old=state.zoom;
  if(anchor){const r=stage.getBoundingClientRect(),x=anchor.x-r.left-stage.clientWidth/2,y=anchor.y-r.top-stage.clientHeight/2;
   state.panX=x-(x-(state.panX||0))*next/old;state.panY=y-(y-(state.panY||0))*next/old;
  }
  state.zoomFit=false;state.zoom=next;paint();
 }
 function reset(){state.zoomFit=true;state.zoom=fit();state.panX=state.panY=0;paint();}
 function setCompare(value){
  state.comparePos=clamp(value,0,100);const overlay=stage.querySelector('.compare-overlay');
  if(overlay)overlay.style.clipPath=`inset(0 ${100-state.comparePos}% 0 0)`;
  if(divider){divider.style.left=state.comparePos+'%';divider.setAttribute('aria-valuenow',Math.round(state.comparePos));}
  const line=stage.querySelector('.compare-line');if(line)line.style.left=state.comparePos+'%';
 }
 function rebase(){
  const points=[...pointers.values()];
  gesture=points.length>1?{kind:'pinch',distance:Math.max(1,Math.hypot(points[1].x-points[0].x,points[1].y-points[0].y)),zoom:state.zoom,mid:{x:(points[0].x+points[1].x)/2,y:(points[0].y+points[1].y)/2}}:points.length?{kind:'pan',point:points[0],x:state.panX||0,y:state.panY||0}:null;
 }
 stage.onpointerdown=e=>{
  if(e.button!==0)return;
  if(e.target.closest('.compare-drag-handle')){gesture={kind:'compare',id:e.pointerId};divider.focus({preventScroll:true});}
  else{pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});rebase();stage.focus({preventScroll:true});}
  stage.setPointerCapture(e.pointerId);stage.classList.add('dragging');e.preventDefault();
 };
 stage.onpointermove=e=>{
  if(!gesture)return;
  if(gesture.kind==='compare'){if(e.pointerId===gesture.id){const r=stage.getBoundingClientRect();setCompare((e.clientX-r.left)/stage.clientWidth*100);}return;}
  if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(gesture.kind==='pinch'){
   const p=[...pointers.values()],mid={x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2};
   const distance=Math.hypot(p[1].x-p[0].x,p[1].y-p[0].y);
   setZoom(gesture.zoom*distance/gesture.distance,gesture.mid);state.panX+=mid.x-gesture.mid.x;state.panY+=mid.y-gesture.mid.y;paint();
   gesture={...gesture,distance:Math.max(1,distance),zoom:state.zoom,mid};
  }else{state.panX=gesture.x+e.clientX-gesture.point.x;state.panY=gesture.y+e.clientY-gesture.point.y;paint();}
 };
 function release(e){pointers.delete(e.pointerId);if(stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);rebase();if(!pointers.size)stage.classList.remove('dragging');}
 stage.onpointerup=stage.onpointercancel=release;
 const wheel=e=>{e.preventDefault();setZoom(state.zoom*Math.exp(-clamp(e.deltaY,-200,200)*.003),{x:e.clientX,y:e.clientY});};
 stage.addEventListener('wheel',wheel,{passive:false});
 stage.onkeydown=e=>{
  if(e.target===divider&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();setCompare(e.key==='Home'?0:e.key==='End'?100:state.comparePos+(e.key==='ArrowRight'?1:-1)*(e.shiftKey?10:1));return;}
  if(['+','=','-','0','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();
   if(e.key==='0')reset();else if(['+','=','-'].includes(e.key))setZoom(state.zoom*(e.key==='-'?.8:1.25));
   else{const n=e.shiftKey?100:30;state.panX+=(e.key==='ArrowLeft'?n:e.key==='ArrowRight'?-n:0);state.panY+=(e.key==='ArrowUp'?n:e.key==='ArrowDown'?-n:0);paint();}
  }
 };
 if(zoomField){zoomField.onchange=()=>setZoom(zoomField.value);zoomField.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();setZoom(zoomField.value);zoomField.blur();}};}
 const observer=new ResizeObserver(()=>{if(state.zoomFit)state.zoom=fit();paint();});observer.observe(stage);
 if(state.zoomFit!==false)reset();else paint();
 return {setZoom,reset,step(direction){const values=[1,10,25,50,75,100,150,200,300,400,600,800,1000,1200];setZoom(direction>0?(values.find(n=>n>state.zoom)||1200):([...values].reverse().find(n=>n<state.zoom)||1));},destroy(){observer.disconnect();stage.removeEventListener('wheel',wheel);}};
}
