// Small native SVG petals: no images, timers, canvas or frame-by-frame JS.
const shapes = [
  'M16 38C12 32 4 27 2.8 17C1.7 9 6.5 2.5 12 3.3C14.4 3.6 15.3 5.9 16 8C17.1 4.7 18.8 2.7 22 3.5C29 5.3 31.3 12.5 28.5 20C25.8 28 20.8 33 16 38Z',
  'M13 38C10 30 2 24 3 14C3.8 6.5 9 1.7 14 4C16 4.9 16.7 7.3 17 9C19 5.3 22 4 25 6C31 10.5 30 18 25 25C20.5 31 16.8 34 13 38Z',
  'M17 38C13 31 6 25 5 17C4 9 8.3 3.5 13.2 4.2C15 4.5 16 6.5 16.7 8.4C18.4 5 20.3 3.7 23 5.3C28 8.4 29 15 26 23C23.5 30 20 33.5 17 38Z',
];

export function petalScene({mini=false,elapsed=0}={}){
  const count=mini?5:22;
  return `<span class="workspace-petals ${mini?'petal-mini':''}" aria-hidden="true">${Array.from({length:count},(_,i)=>{
    // Fixed irregular seeds keep the layout consistent across workspace renders.
    const x=mini?10+(i*23)%81:3+(i*43.7)%94;
    const size=mini?7+(i%3)*2:10+(i*7)%12;
    const duration=29+(i*11)%22,sway=6.8+(i*3.1)%6.9,flutter=9.5+(i*2.3)%8;
    const fallDelay=-((elapsed+duration*((i*.618+.19)%1))%duration);
    const swayDelay=-((elapsed+i*1.7)%sway),flutterDelay=-((elapsed+i*2.3)%flutter);
    const style=`--petal-x:${x.toFixed(1)}%;--petal-size:${size}px;--petal-fall:${duration}s;--petal-delay:${fallDelay.toFixed(3)}s;--petal-sway:${sway.toFixed(1)}s;--sway-delay:${swayDelay.toFixed(3)}s;--petal-flutter:${flutter.toFixed(1)}s;--flutter-delay:${flutterDelay.toFixed(3)}s;--petal-opacity:${(.34+(i%5)*.075).toFixed(3)};--petal-rest:${12+(i*31)%75}%;--petal-angle:${-55+(i*37)%130}deg;--petal-breeze:${-20+(i*13)%49}px;--petal-swing:${10+(i*3)%15}px`;
    return `<span class="petal-track petal-tone-${i%5}" style="${style}"><span class="petal-drift"><svg class="petal-shape" viewBox="0 0 32 40" focusable="false"><path class="petal-body" d="${shapes[i%shapes.length]}"/><path class="petal-sheen" d="M16 34C11 25 6 16 10 8C6 15 10 25 16 34Z"/><path class="petal-fold" d="M16 9C13.5 19 14.5 26 16 33"/></svg></span></span>`;
  }).join('')}</span>`;
}
