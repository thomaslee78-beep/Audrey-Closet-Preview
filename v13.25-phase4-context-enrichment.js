/* Audrey Closet v13.25 Phase 4 — Journal Context Enrichment v1
 * Preview-first, local-first context assistance.
 *
 * Goals:
 * - Season is derived locally from the Journal date (no network required).
 * - For today's entry, optional Auto Context uses browser geolocation to fill
 *   current weather, temperature and a coarse city/town label.
 * - If location permission was already granted, empty context can enrich
 *   quietly when Edit Journal opens. We never trigger a permission prompt
 *   without an explicit user tap.
 * - Existing/manual values are never overwritten unless they were previously
 *   supplied by Auto Context during the same edit session.
 * - Network/geolocation failures never block Journal editing or saving.
 * - No API key or secret is embedded in the PWA.
 */
(function(){
  'use strict';

  const VERSION='1.0';
  const STYLE_ID='v1325ContextEnrichmentStyles';
  const CONTROL_ID='v1325ContextEnrichment';
  const WEATHER_URL='https://api.open-meteo.com/v1/forecast';
  const REVERSE_URL='https://nominatim.openstreetmap.org/reverse';

  let pending=null;
  let gathering=false;
  let saveWrapped=false;
  let openWrapped=false;

  function entry(){return window.AudreyContextualJournal?.entry?.()||null;}
  function localDateString(d=new Date()){
    const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }
  function isToday(e){return String(e?.date||'')===localDateString();}
  function seasonForDate(value){
    const month=Number(String(value||'').slice(5,7));
    if([12,1,2].includes(month))return {id:'winter',label:'Winter',icon:'❄️'};
    if([3,4,5].includes(month))return {id:'spring',label:'Spring',icon:'🌷'};
    if([6,7,8].includes(month))return {id:'summer',label:'Summer',icon:'☀️'};
    if([9,10,11].includes(month))return {id:'fall',label:'Fall',icon:'🍂'};
    return {id:'',label:'Season',icon:'🍃'};
  }
  function weatherFromCode(code,windMph){
    const c=Number(code),wind=Number(windMph||0);
    if([71,73,75,77,85,86].includes(c))return 'snowy';
    if([51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99].includes(c))return 'rainy';
    if([45,48].includes(c))return 'foggy';
    if(wind>=22)return 'windy';
    if(c===3)return 'cloudy';
    if([1,2].includes(c))return 'partly-cloudy';
    if(c===0)return 'sunny';
    return '';
  }
  function controls(){
    return {
      location:document.querySelector('#v1325JournalLocation'),
      weather:document.querySelector('#v1325JournalWeather'),
      temperature:document.querySelector('#v1325JournalTemperature'),
      unit:document.querySelector('#v1325JournalTemperatureUnit')
    };
  }
  function currentValues(){
    const c=controls();return {location:c.location?.value?.trim()||'',weather:c.weather?.value||'',temperature:c.temperature?.value?.trim()||'',unit:c.unit?.value||'F'};
  }
  function dispatch(control){
    if(!control)return;control.dispatchEvent(new Event('input',{bubbles:true}));control.dispatchEvent(new Event('change',{bubbles:true}));
  }

  function installStyles(){
    document.getElementById(STYLE_ID)?.remove();
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      #journalDetailDialog .v1325-context-enrichment{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin:0 0 8px;padding:7px 8px;border:1px solid rgba(102,113,90,.15);border-radius:10px;background:rgba(255,255,255,.52);box-sizing:border-box}
      #journalDetailDialog .v1325-context-season{display:inline-flex;align-items:center;gap:4px;flex:0 0 auto;padding:5px 7px;border-radius:999px;background:rgba(102,113,90,.10);color:var(--coffee);font-size:.68rem;font-weight:700;white-space:nowrap}
      #journalDetailDialog .v1325-context-auto{flex:0 0 auto;min-height:29px!important;padding:5px 8px!important;border:1px solid rgba(108,81,66,.16)!important;border-radius:9px!important;background:#fffdf8!important;color:var(--coffee)!important;font:inherit!important;font-size:.68rem!important;font-weight:700!important}
      #journalDetailDialog .v1325-context-auto:disabled{opacity:.55!important}
      #journalDetailDialog .v1325-context-status{flex:1 1 130px;min-width:0;color:var(--muted);font-size:.62rem;line-height:1.25}
      #journalDetailDialog .v1325-context-status.error{color:#8b3f37}
      #journalDetailDialog .v1325-context-status.success{color:var(--olive-dark)}
      #journalDetailDialog .v1325-context-source{display:block;margin-top:3px;font-size:.56rem;opacity:.8}
      @media(max-width:520px){
        #journalDetailDialog .v1325-context-enrichment{gap:6px;padding:7px}
        #journalDetailDialog .v1325-context-season{font-size:.64rem}
        #journalDetailDialog .v1325-context-auto{font-size:.64rem!important;padding:5px 7px!important}
        #journalDetailDialog .v1325-context-status{flex-basis:100%;font-size:.60rem}
      }
    `;document.head.appendChild(s);
  }

  function status(message,type=''){
    const host=document.querySelector(`#${CONTROL_ID} .v1325-context-status`);if(!host)return;
    host.classList.toggle('error',type==='error');host.classList.toggle('success',type==='success');host.innerHTML=message||'';
  }

  function ensurePending(e){
    const id=String(e?.id||'');
    if(!pending||pending.id!==id){
      pending={id,meta:{version:1,season:seasonForDate(e?.date).id,seasonLabel:seasonForDate(e?.date).label,source:'local-date',capturedAt:null,weatherCode:null,provider:null,autoFields:{}}};
    }
    return pending;
  }

  function buildControls(){
    installStyles();
    const e=entry(),body=document.querySelector('#journalDetailDialog .v1325-about-day-body'),grid=body?.querySelector('.v1325-journal-context-grid');
    if(!e||!body||!grid)return;
    const season=seasonForDate(e.date);ensurePending(e).meta.season=season.id;ensurePending(e).meta.seasonLabel=season.label;
    let host=body.querySelector('#'+CONTROL_ID);
    if(!host){
      host=document.createElement('div');host.id=CONTROL_ID;host.className='v1325-context-enrichment';
      host.innerHTML='<span class="v1325-context-season"></span><button type="button" class="v1325-context-auto">✨ Auto Context</button><span class="v1325-context-status"></span>';
      grid.before(host);
    }
    host.querySelector('.v1325-context-season').textContent=`${season.icon} ${season.label}`;
    const btn=host.querySelector('.v1325-context-auto');
    btn.disabled=gathering||!isToday(e);btn.textContent=gathering?'Gathering…':'✨ Auto Context';
    if(!isToday(e))status('Season is automatic. Weather/place auto-fill is available for today’s Journal entry.');
    else if(!gathering)status('Season is automatic. Auto Context can fill current weather, temperature and place.');
    if(btn.dataset.bound!=='1'){
      btn.dataset.bound='1';btn.addEventListener('click',()=>gather({explicit:true}));
    }
  }

  function getPosition(explicit){
    return new Promise((resolve,reject)=>{
      if(!navigator.geolocation){reject(new Error('Location is not available on this device.'));return;}
      navigator.geolocation.getCurrentPosition(resolve,err=>{
        const message=err?.code===1?'Location permission was not granted.':'Could not get the current location.';
        reject(new Error(message));
      },{enableHighAccuracy:false,timeout:9000,maximumAge:10*60*1000});
    });
  }

  async function fetchWeather(lat,lon){
    const url=new URL(WEATHER_URL);url.searchParams.set('latitude',String(lat));url.searchParams.set('longitude',String(lon));url.searchParams.set('current','temperature_2m,weather_code,wind_speed_10m');url.searchParams.set('temperature_unit','fahrenheit');url.searchParams.set('wind_speed_unit','mph');url.searchParams.set('timezone','auto');
    const response=await fetch(url.toString(),{headers:{Accept:'application/json'}});if(!response.ok)throw new Error('Weather service is temporarily unavailable.');
    const data=await response.json(),cur=data?.current||{};
    return {temperature:Number(cur.temperature_2m),weatherCode:Number(cur.weather_code),windMph:Number(cur.wind_speed_10m),timezone:data?.timezone||''};
  }

  async function reversePlace(lat,lon){
    try{
      const url=new URL(REVERSE_URL);url.searchParams.set('format','jsonv2');url.searchParams.set('lat',String(lat));url.searchParams.set('lon',String(lon));url.searchParams.set('zoom','10');url.searchParams.set('addressdetails','1');url.searchParams.set('accept-language','en');
      const response=await fetch(url.toString(),{headers:{Accept:'application/json'}});if(!response.ok)return '';
      const data=await response.json(),a=data?.address||{};
      const place=a.city||a.town||a.village||a.municipality||a.county||'';
      const region=a.state||'';
      return [place,region].filter(Boolean).filter((v,i,arr)=>arr.indexOf(v)===i).join(', ');
    }catch{return '';}
  }

  function mayReplace(field,value,p){
    if(!value)return false;
    const values=currentValues(),existing=values[field];
    return !existing||p.meta.autoFields?.[field]===true;
  }

  async function gather({explicit=false}={}){
    const e=entry();if(!e||gathering||!isToday(e))return;
    gathering=true;buildControls();status(explicit?'Requesting current location…':'Updating context…');
    const p=ensurePending(e),priorMeta=JSON.parse(JSON.stringify(p.meta));
    try{
      const position=await getPosition(explicit),lat=position.coords.latitude,lon=position.coords.longitude;
      status('Getting current weather and place…');
      const [weather,place]=await Promise.all([fetchWeather(lat,lon),reversePlace(lat,lon)]);
      const c=controls(),weatherValue=weatherFromCode(weather.weatherCode,weather.windMph),temp=Number.isFinite(weather.temperature)?String(Math.round(weather.temperature)):'';
      if(mayReplace('weather',weatherValue,p)&&c.weather){c.weather.value=weatherValue;p.meta.autoFields.weather=true;dispatch(c.weather);}
      if(mayReplace('temperature',temp,p)&&c.temperature){c.temperature.value=temp;p.meta.autoFields.temperature=true;dispatch(c.temperature);}
      if(c.unit&&p.meta.autoFields.temperature===true){c.unit.value='F';dispatch(c.unit);}
      if(mayReplace('location',place,p)&&c.location&&place){c.location.value=place;p.meta.autoFields.location=true;dispatch(c.location);}
      p.meta={...p.meta,source:'auto-current',capturedAt:new Date().toISOString(),weatherCode:weather.weatherCode,provider:'Open-Meteo',placeProvider:place?'OpenStreetMap/Nominatim':null,timezone:weather.timezone||null,season:seasonForDate(e.date).id,seasonLabel:seasonForDate(e.date).label};
      const bits=[];if(place&&p.meta.autoFields.location)bits.push(place);if(weatherValue&&p.meta.autoFields.weather)bits.push(c.weather?.selectedOptions?.[0]?.textContent||weatherValue);if(temp&&p.meta.autoFields.temperature)bits.push(`${temp}°F`);
      status(`✓ ${bits.join(' · ')||'Context updated'}<span class="v1325-context-source">You can change any value before saving.</span>`,'success');
    }catch(err){
      p.meta=priorMeta;status(`${err?.message||'Could not gather context.'} You can enter context manually.`,'error');
    }finally{gathering=false;const btn=document.querySelector(`#${CONTROL_ID} .v1325-context-auto`);if(btn){btn.disabled=false;btn.textContent='✨ Auto Context';}}
  }

  async function autoIfAlreadyAllowed(){
    const e=entry();if(!e||!isToday(e)||gathering)return;
    const values=currentValues();if(values.location&&values.weather&&values.temperature!=='')return;
    if(!navigator.permissions?.query)return;
    try{const permission=await navigator.permissions.query({name:'geolocation'});if(permission.state==='granted')gather({explicit:false});}catch{}
  }

  function wrapSave(){
    if(saveWrapped)return;const api=window.AudreyContextualJournal;if(!api?.save)return;
    const save0=api.save.bind(api);
    api.save=async function(){
      const e=entry(),p=e?ensurePending(e):null,prior=e?.contextEnrichment;
      if(e&&p){e.contextEnrichment={...p.meta,season:seasonForDate(e.date).id,seasonLabel:seasonForDate(e.date).label};}
      try{return await save0.apply(this,arguments);}catch(err){if(e)e.contextEnrichment=prior;throw err;}
    };
    saveWrapped=true;
  }

  function sync(){
    installStyles();wrapSave();buildControls();
  }

  function syncAfterEdit(){
    requestAnimationFrame(()=>{sync();const sheet=document.querySelector('#journalDetailDialog .v1325-journal-sheet');if(sheet?.classList.contains('editing'))autoIfAlreadyAllowed();});
    setTimeout(sync,70);setTimeout(sync,180);
  }

  function wrapOpen(){
    if(openWrapped||typeof openJournalDetail!=='function')return;
    const open0=openJournalDetail;openJournalDetail=function(){const out=open0.apply(this,arguments);pending=null;syncAfterEdit();return out;};openJournalDetail.__contextEnrichmentWrapped=true;openWrapped=true;
  }

  document.addEventListener('click',event=>{
    if(event.target.closest?.('#v1325JournalEditToggle'))syncAfterEdit();
  },true);

  installStyles();wrapSave();wrapOpen();requestAnimationFrame(sync);setTimeout(()=>{wrapSave();wrapOpen();sync();},180);
  window.AudreyJournalContextEnrichment={version:VERSION,refresh:sync,gather:()=>gather({explicit:true}),seasonForDate};
})();
