/* Audrey Closet v13.23 Photo Studio Adjust sliders dev7a
 * Presentation-only: convert existing Adjust ranges to compact 0-100 proxy sliders
 * while preserving each native control's min/max, handlers, state, reset, and persistence.
 * dev7a explicitly resyncs visible proxies after Reset Adjustments changes native values.
 */
(function(){
'use strict';
const STYLE_ID='photoStudioAdjustSlidersDev7Styles';
const CLASS='adjust-slider-dev7';

function installStyles(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
#studioPanelAdjustDev5 .${CLASS}{
  display:grid!important;
  grid-template-columns:auto minmax(0,1fr) auto!important;
  grid-template-areas:'label slider value'!important;
  align-items:center!important;
  gap:8px!important;
  margin:0 0 7px!important;
  padding:5px 9px!important;
  border:1px solid rgba(108,81,66,.14)!important;
  border-radius:11px!important;
  background:rgba(255,253,249,.96)!important;
}
#studioPanelAdjustDev5 .adjust-slider-label-dev7{
  grid-area:label!important;
  white-space:nowrap!important;
  font:800 9.5px/1 system-ui!important;
  color:#675d51!important;
}
#studioPanelAdjustDev5 .adjust-slider-value-dev7{
  grid-area:value!important;
  min-width:24px!important;
  text-align:right!important;
  justify-self:end!important;
  font:850 9.5px/1 system-ui!important;
  font-variant-numeric:tabular-nums!important;
  color:#7d3547!important;
}
#studioPanelAdjustDev5 .adjust-slider-proxy-dev7{
  grid-area:slider!important;
  -webkit-appearance:none!important;
  appearance:none!important;
  width:100%!important;
  min-width:0!important;
  height:28px!important;
  margin:0!important;
  padding:0!important;
  background:transparent!important;
  cursor:pointer!important;
}
#studioPanelAdjustDev5 .adjust-slider-proxy-dev7::-webkit-slider-runnable-track{
  height:6px!important;
  border-radius:999px!important;
  background:rgba(108,81,66,.22)!important;
  border:1px solid rgba(108,81,66,.16)!important;
}
#studioPanelAdjustDev5 .adjust-slider-proxy-dev7::-webkit-slider-thumb{
  -webkit-appearance:none!important;
  appearance:none!important;
  width:18px!important;
  height:18px!important;
  border-radius:50%!important;
  margin-top:-7px!important;
  background:#f8f3e9!important;
  border:2px solid #76685a!important;
  box-shadow:0 1px 3px rgba(60,48,36,.18)!important;
}
#studioPanelAdjustDev5 .adjust-slider-proxy-dev7::-moz-range-track{
  height:6px!important;
  border-radius:999px!important;
  background:rgba(108,81,66,.22)!important;
  border:1px solid rgba(108,81,66,.16)!important;
}
#studioPanelAdjustDev5 .adjust-slider-proxy-dev7::-moz-range-thumb{
  width:18px!important;
  height:18px!important;
  border-radius:50%!important;
  background:#f8f3e9!important;
  border:2px solid #76685a!important;
  box-shadow:0 1px 3px rgba(60,48,36,.18)!important;
}
#studioPanelAdjustDev5 .adjust-native-range-dev7{
  position:absolute!important;
  width:1px!important;
  height:1px!important;
  opacity:0!important;
  pointer-events:none!important;
  clip-path:inset(50%)!important;
}
`;
document.head.appendChild(s);
}

function num(v,fallback){const n=Number(v);return Number.isFinite(n)?n:fallback;}
function toUi(native){
  const min=num(native.min,0),max=num(native.max,100),value=num(native.value,min);
  if(max===min)return 0;
  return Math.round(Math.max(0,Math.min(100,(value-min)*100/(max-min))));
}
function toNative(native,ui){
  const min=num(native.min,0),max=num(native.max,100),step=num(native.step,1)||1;
  const raw=min+(Math.max(0,Math.min(100,num(ui,0)))/100)*(max-min);
  const snapped=Math.round((raw-min)/step)*step+min;
  const precision=(String(step).split('.')[1]||'').length;
  return String(Math.max(min,Math.min(max,Number(snapped.toFixed(precision)))));
}
function labelText(label,native,index){
  const candidate=label.querySelector('[data-i18n],span,strong');
  let text=(candidate?.textContent||'').trim();
  text=text.replace(/[-+]?\d+(?:\.\d+)?\s*$/,'').trim();
  if(text)return text;
  const aria=(native.getAttribute('aria-label')||'').trim();
  return aria||`Adjustment ${index+1}`;
}
function syncOne(native){
  const label=native.closest('label')||native.parentElement;
  const proxy=label?.querySelector('.adjust-slider-proxy-dev7');
  const value=label?.querySelector('.adjust-slider-value-dev7');
  if(!proxy||!value)return;
  const ui=String(toUi(native));
  if(document.activeElement!==proxy&&proxy.value!==ui)proxy.value=ui;
  if(value.textContent!==ui)value.textContent=ui;
}
function syncAll(){
  const panel=document.getElementById('studioPanelAdjustDev5');
  panel?.querySelectorAll('input.adjust-native-range-dev7').forEach(syncOne);
}
function enhance(label,native,index){
  if(label.dataset.adjustSliderDev7==='1'){syncOne(native);return;}
  label.dataset.adjustSliderDev7='1';label.classList.add(CLASS);
  const title=document.createElement('span');title.className='adjust-slider-label-dev7';title.textContent=labelText(label,native,index);
  const value=document.createElement('span');value.className='adjust-slider-value-dev7';
  const proxy=document.createElement('input');proxy.type='range';proxy.min='0';proxy.max='100';proxy.step='1';proxy.className='adjust-slider-proxy-dev7';proxy.setAttribute('aria-label',title.textContent);
  native.classList.add('adjust-native-range-dev7');
  Array.from(label.children).forEach(child=>{if(child!==native)child.style.display='none'});
  label.insertBefore(title,native);label.insertBefore(proxy,native);label.insertBefore(value,native);
  const sync=()=>syncOne(native);
  proxy.addEventListener('input',()=>{native.value=toNative(native,proxy.value);value.textContent=proxy.value;native.dispatchEvent(new Event('input',{bubbles:true}));});
  proxy.addEventListener('change',()=>{native.value=toNative(native,proxy.value);native.dispatchEvent(new Event('change',{bubbles:true}));sync();});
  native.addEventListener('input',sync);native.addEventListener('change',sync);
  sync();
}
function bindReset(reset){
  if(!reset||reset.dataset.adjustProxyResetDev7a==='1')return;
  reset.dataset.adjustProxyResetDev7a='1';
  reset.addEventListener('click',()=>{
    /* Core reset handler runs on the same click and writes native values directly.
       Read those canonical values after the handler/render cycle, then update proxies. */
    requestAnimationFrame(()=>{syncAll();requestAnimationFrame(syncAll);});
  });
}
function install(){
  installStyles();
  const panel=document.getElementById('studioPanelAdjustDev5');
  const details=panel?.querySelector('.studio-adjust-tools');
  if(!panel||!details)return false;
  const ranges=Array.from(details.querySelectorAll('input[type="range"]')).filter(r=>!r.classList.contains('adjust-slider-proxy-dev7'));
  ranges.forEach((native,index)=>{
    const label=native.closest('label')||native.parentElement;
    if(label)enhance(label,native,index);
  });
  const reset=details.querySelector('button[id*="Reset"],button[data-i18n*="reset" i]');
  if(reset&&reset.parentElement)reset.parentElement.appendChild(reset);
  bindReset(reset);
  syncAll();
  return ranges.length>0;
}
function start(){
  install();
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-studio-nav="adjust"],#studioPanelAdjustDev5'))requestAnimationFrame(install);},true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
