/* Audrey Closet v13.22 Draw Studio dev14
 * Runs after dev13.
 * Refines arrow geometry so thick shafts stop beneath the arrowhead base
 * instead of visually extending past the arrow tip.
 */
(function(){
  'use strict';

  let rendererInstalled=false;

  function esc(v){return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch]);}

  function parseTwoPoints(points){
    const pts=String(points||'').trim().split(/\s+/).map(pair=>pair.split(',').map(Number)).filter(p=>p.length===2&&p.every(Number.isFinite));
    return pts.length>=2?pts.slice(0,2):null;
  }

  function geom(x1,y1,x2,y2,width,startHead,endHead){
    const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy)||1;
    const ux=dx/len,uy=dy/len;
    const headSize=Math.max(9,width*3.2);
    const inset=Math.min(headSize*.72,Math.max(0,len*.34));
    return {
      sx:x1+(startHead?ux*inset:0),
      sy:y1+(startHead?uy*inset:0),
      ex:x2-(endHead?ux*inset:0),
      ey:y2-(endHead?uy*inset:0),
      headSize
    };
  }

  function arrowHeadPoints(x1,y1,x2,y2,size){
    const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy)||1;
    const ux=dx/len,uy=dy/len,px=-uy,py=ux;
    const backX=x2-ux*size,backY=y2-uy*size,half=size*.48;
    return `${x2.toFixed(1)},${y2.toFixed(1)} ${(backX+px*half).toFixed(1)},${(backY+py*half).toFixed(1)} ${(backX-px*half).toFixed(1)},${(backY-py*half).toFixed(1)}`;
  }

  function installRenderer(){
    if(rendererInstalled)return true;
    if(typeof boardItemContent!=='function')return false;
    const original=boardItemContent;
    boardItemContent=function(b){
      if(b&&b.kind==='drawing'&&b.tool==='arrow'){
        const pts=parseTwoPoints(b.points);
        if(pts){
          const [[x1,y1],[x2,y2]]=pts;
          const width=Math.max(1,Number(b.strokeWidth)||3);
          const color=esc(b.strokeColor||'#30343b');
          const w=Math.max(1,Number(b.w)||1),h=Math.max(1,Number(b.h)||1);
          const dash=b.strokeStyle==='dotted'?`${Math.max(1,width*.6)} ${Math.max(2,width*2.2)}`:'';
          const g=geom(x1,y1,x2,y2,width,!!b.arrowStart,b.arrowEnd!==false);
          const endHead=arrowHeadPoints(x1,y1,x2,y2,g.headSize);
          const startHead=b.arrowStart?arrowHeadPoints(x2,y2,x1,y1,g.headSize):'';
          return `<svg class="drawing-arrow-svg-dev13" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><line x1="${g.sx.toFixed(1)}" y1="${g.sy.toFixed(1)}" x2="${g.ex.toFixed(1)}" y2="${g.ey.toFixed(1)}" stroke="${color}" stroke-width="${width}" stroke-linecap="butt"${dash?` stroke-dasharray="${dash}"`:''} vector-effect="non-scaling-stroke"/><polygon points="${endHead}" fill="${color}"/>${startHead?`<polygon points="${startHead}" fill="${color}"/>`:''}</svg>`;
        }
      }
      return original(b);
    };
    rendererInstalled=true;
    return true;
  }

  function refineLiveOverlay(){
    const svg=document.querySelector('#outfitBoard .draw-arrow-overlay-dev13');
    if(!svg)return;
    const shaft=svg.querySelector('line'),heads=svg.querySelectorAll('polygon');
    if(!shaft||!heads.length)return;
    const x1=Number(shaft.getAttribute('x1'))||0,y1=Number(shaft.getAttribute('y1'))||0,x2=Number(shaft.getAttribute('x2'))||0,y2=Number(shaft.getAttribute('y2'))||0,width=Math.max(1,Number(shaft.getAttribute('stroke-width'))||3);
    const double=heads.length>1&&!!heads[1].getAttribute('points');
    const g=geom(x1,y1,x2,y2,width,double,true);
    shaft.setAttribute('x1',g.sx);shaft.setAttribute('y1',g.sy);shaft.setAttribute('x2',g.ex);shaft.setAttribute('y2',g.ey);shaft.setAttribute('stroke-linecap','butt');
  }

  function start(){
    installRenderer();
    document.addEventListener('pointermove',e=>{
      if(e.target instanceof Element&&e.target.closest('#outfitBoard'))requestAnimationFrame(refineLiveOverlay);
    },true);
    document.addEventListener('pointerdown',e=>{
      if(e.target instanceof Element&&e.target.closest('#outfitBoard'))requestAnimationFrame(refineLiveOverlay);
    },true);
    document.addEventListener('click',()=>setTimeout(()=>{installRenderer();refineLiveOverlay();},0),true);
    window.addEventListener('pageshow',()=>setTimeout(()=>{installRenderer();},0));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
