/* Audrey Closet v13.25 Phase 4 — Journal Context Enrichment v2
 * Preview-first, local-first context assistance.
 *
 * - Season is derived locally from the Journal date.
 * - Auto Context is controlled by state.settings.journalAutoContextEnabled.
 * - Settings > Journal exposes an Auto Context toggle.
 * - First Auto Context use prompts inside the app before requesting browser
 *   geolocation permission.
 * - When the preference is enabled and browser permission is already granted,
 *   today's Journal can fill missing weather/place context automatically.
 * - Existing/manual values are never overwritten unless Auto Context supplied
 *   them during the current edit session.
 * - Failures never block Journal editing/saving and no API secret is embedded.
 */
(function(){
  'use strict';

  const VERSION='2.0';
  const STYLE_ID='v1325ContextEnrichmentStyles';
  const CONTROL_ID='v1325ContextEnrichment';
  const SETTINGS_ID='v1325JournalContextSettings';
  const PROMPT_ID='v1325AutoContextPrompt';
  const WEATHER_URL='https://api.open-meteo.com/v1/forecast';
  const REVERSE_URL='https://nominatim.openstreetmap.org/reverse';

  let pending=null;
  let gathering=false;
  let saveWrapped=false;
  let openWrapped=false;

  function entry(){return window.AudreyContextualJournal?.entry?.()||null;}
  function preference(){return state?.settings?.journalAutoContextEnabled===true;}
  function ensureSettings(){if(!state.settings||typeof state.settings!=='object')state.settings={};return state.settings;}
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
  function dispatch(control){if(!control)return;control.dispatchEvent(new Event('input',{bubbles:true}));control.dispatchEvent(new Event('change',{bubbles:true}));}

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

      #${SETTINGS_ID}{margin:14px 0;padding:15px;border:1px solid rgba(108,81,66,.15);border-radius:16px;background:rgba(255,253,248,.88);box-shadow:0 4px 16px rgba(76,61,49,.05)}
      #${SETTINGS_ID} .v1325-setting-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}
      #${SETTINGS_ID} .v1325-setting-copy{min-width:0;flex:1 1 auto}
      #${SETTINGS_ID} .v1325-setting-kicker{display:block;margin:0 0 3px;color:var(--olive-dark);font-size:.66rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
      #${SETTINGS_ID} h3{margin:0 0 4px;font-family:var(--serif);font-size:1rem;color:var(--coffee)}
      #${SETTINGS_ID} p{margin:0;color:var(--muted);font-size:.76rem;line-height:1.4}
      #${SETTINGS_ID} .v1325-setting-status{display:block;margin-top:8px;color:var(--muted);font-size:.68rem;line-height:1.35}
      #${SETTINGS_ID} .v1325-setting-status.success{color:var(--olive-dark)}
      #${SETTINGS_ID} .v1325-setting-status.error{color:#8b3f37}
      #${SETTINGS_ID} .v1325-switch{position:relative;flex:0 0 auto;width:48px;height:28px;margin-top:4px}
      #${SETTINGS_ID} .v1325-switch input{position:absolute;opacity:0;pointer-events:none}
      #${SETTINGS_ID} .v1325-slider{position:absolute;inset:0;border-radius:999px;background:#c9c5bb;transition:.18s ease;box-shadow:inset 0 0 0 1px rgba(80,66,55,.10)}
      #${SETTINGS_ID} .v1325-slider:after{content:'';position:absolute;width:22px;height:22px;left:3px;top:3px;border-radius:50%;background:#fff;box-shadow:0 2px 5px rgba(45,35,28,.22);transition:.18s ease}
      #${SETTINGS_ID} .v1325-switch input:checked+.v1325-slider{background:var(--olive,#66715a)}
      #${SETTINGS_ID} .v1325-switch input:checked+.v1325-slider:after{transform:translateX(20px)}

      #${PROMPT_ID}{width:min(390px,calc(100vw - 30px));border:0;border-radius:18px;padding:0;background:#fffaf0;color:var(--coffee);box-shadow:0 18px 55px rgba(48,38,30,.25)}
      #${PROMPT_ID}::backdrop{background:rgba(37,31,27,.38);backdrop-filter:blur(2px)}
      #${PROMPT_ID} .v1325-prompt-body{padding:20px 19px 16px}
      #${PROMPT_ID} .v1325-prompt-icon{font-size:1.5rem;margin-bottom:7px}
      #${PROMPT_ID} h3{margin:0 0 7px;font-family:var(--serif);font-size:1.15rem}
      #${PROMPT_ID} p{margin:0;color:var(--muted);font-size:.82rem;line-height:1.45}
      #${PROMPT_ID} .v1325-prompt-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;padding:0 19px 18px}
      #${PROMPT_ID} button{min-height:40px}

      @media(max-width:520px){
        #journalDetailDialog .v1325-context-enrichment{gap:6px;padding:7px}
        #journalDetailDialog .v1325-context-season{font-size:.64rem}
        #journalDetailDialog .v1325-context-auto{font-size:.64rem!important;padding:5px 7px!important}
        #journalDetailDialog .v1325-context-status{flex-basis:100%;font-size:.60rem}
        #${SETTINGS_ID}{padding:13px}
      }
    `;document.head.appendChild(s);
  }

  function status(message,type=''){
    const host=document.querySelector(`#${CONTROL_ID} .v1325-context-status`);if(!host)return;
    host.classList.toggle('error',type==='error');host.classList.toggle('success',type==='success');host.innerHTML=message||'';
  }
  function settingStatus(message,type=''){
    const host=document.querySelector(`#${SETTINGS_ID} .v1325-setting-status`);if(!host)return;
    host.classList.toggle('error',type==='error');host.classList.toggle('success',type==='success');host.textContent=message||'';
  }

  function ensurePending(e){
    const id=String(e?.id||'');
    if(!pending||pending.id!==id){
      pending={id,meta:{version:2,season:seasonForDate(e?.date).id,seasonLabel:seasonForDate(e?.date).label,source:'local-date',capturedAt:null,weatherCode:null,provider:null,autoFields:{}}};
    }
    return pending;
  }

  function buildSettingsCard(){
    installStyles();
    const screen=document.querySelector('#app>.screen[data-screen="more"]');if(!screen)return;
    let card=screen.querySelector('#'+SETTINGS_ID);
    if(!card){
      card=document.createElement('section');card.id=SETTINGS_ID;
      card.innerHTML='<div class="v1325-setting-head"><div class="v1325-setting-copy"><span class="v1325-setting-kicker">Journal</span><h3>Auto Context</h3><p>Allow Journal to use your current location to add local weather, temperature and a city/town label to today’s entry.</p><span class="v1325-setting-status"></span></div><label class="v1325-switch" aria-label="Enable Journal Auto Context"><input type="checkbox" id="v1325AutoContextSetting"><span class="v1325-slider"></span></label></div>';
      const anchor=screen.querySelector('[id*="journalOrder"],.journal-order-editor');
      if(anchor)anchor.after(card);else screen.appendChild(card);
    }
    const toggle=card.querySelector('#v1325AutoContextSetting');toggle.checked=preference();
    settingStatus(preference()?'Enabled. Today’s Journal can gather context automatically when location permission is available.':'Off. Journal will only use manual context until you enable this setting.');
    if(toggle.dataset.bound!=='1'){
      toggle.dataset.bound='1';toggle.addEventListener('change',async()=>{
        if(toggle.checked){
          toggle.disabled=true;settingStatus('Requesting location permission…');
          const ok=await enablePreference({requestPermission:true});
          toggle.checked=ok;toggle.disabled=false;
          if(ok)settingStatus('Enabled. Auto Context is ready for today’s Journal.','success');
          else settingStatus('Auto Context stayed off because location permission was not granted.','error');
        }else{
          await setPreference(false);settingStatus('Off. Existing Journal context is kept; new context will be manual.');
        }
        buildControls();
      });
    }
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
    else if(!gathering&&!preference())status('Season is automatic. Auto Context is off — tap Auto Context to enable it, or turn it on in Settings.');
    else if(!gathering)status('Auto Context is enabled. Missing weather, temperature and place can be filled automatically.');
    if(btn.dataset.bound!=='1'){
      btn.dataset.bound='1';btn.addEventListener('click',handleAutoContextClick);
    }
  }

  function getPosition(){
    return new Promise((resolve,reject)=>{
      if(!navigator.geolocation){reject(new Error('Location is not available on this device.'));return;}
      navigator.geolocation.getCurrentPosition(resolve,err=>{
        const message=err?.code===1?'Location permission was not granted.':'Could not get the current location.';
        reject(new Error(message));
      },{enableHighAccuracy:false,timeout:9000,maximumAge:10*60*1000});
    });
  }

  async function setPreference(enabled){
    ensureSettings().journalAutoContextEnabled=!!enabled;
    try{await saveState();return true;}catch(err){console.error('[v13.25 context] preference save failed',err);return false;}
  }

  async function enablePreference({requestPermission=false}={}){
    if(requestPermission){
      try{await getPosition();}catch(err){console.warn('[v13.25 context] location permission unavailable',err);await setPreference(false);return false;}
    }
    return setPreference(true);
  }

  function ensurePrompt(){
    let d=document.getElementById(PROMPT_ID);if(d)return d;
    d=document.createElement('dialog');d.id=PROMPT_ID;
    d.innerHTML='<div class="v1325-prompt-body"><div class="v1325-prompt-icon">📍</div><h3>Turn on Auto Context?</h3><p>Auto Context uses your current location to add local weather, temperature and a city/town label to today’s Journal. You can turn it off anytime in Settings → Journal.</p></div><div class="v1325-prompt-actions"><button type="button" class="soft-btn" data-context-choice="no">Not now</button><button type="button" class="primary" data-context-choice="yes">Turn on</button></div>';
    document.body.appendChild(d);return d;
  }

  function askEnable(){
    return new Promise(resolve=>{
      const d=ensurePrompt();let settled=false;
      const finish=value=>{if(settled)return;settled=true;try{d.close();}catch{}resolve(value);};
      d.querySelector('[data-context-choice="no"]').onclick=()=>finish(false);
      d.querySelector('[data-context-choice="yes"]').onclick=()=>finish(true);
      d.oncancel=e=>{e.preventDefault();finish(false);};
      try{d.showModal();}catch{resolve(false);}
    });
  }

  async function handleAutoContextClick(){
    if(!preference()){
      const agreed=await askEnable();if(!agreed)return;
      status('Requesting location permission…');
      const enabled=await enablePreference({requestPermission:true});
      buildSettingsCard();buildControls();
      if(!enabled){status('Location permission was not granted. You can enable Auto Context later in Settings.','error');return;}
    }
    gather({explicit:true});
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
    if(value===''||value==null)return false;
    const values=currentValues(),existing=values[field];
    return !existing||p.meta.autoFields?.[field]===true;
  }

  async function gather({explicit=false}={}){
    const e=entry();if(!e||gathering||!isToday(e)||!preference())return;
    gathering=true;buildControls();status(explicit?'Getting current context…':'Updating context…');
    const p=ensurePending(e),priorMeta=JSON.parse(JSON.stringify(p.meta));
    try{
      const position=await getPosition(),lat=position.coords.latitude,lon=position.coords.longitude;
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
    }finally{gathering=false;const btn=document.querySelector(`#${CONTROL_ID} .v1325-context-auto`);if(btn){btn.disabled=!isToday(entry());btn.textContent='✨ Auto Context';}}
  }

  async function autoIfEnabled(){
    const e=entry();if(!preference()||!e||!isToday(e)||gathering)return;
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

  function sync(){installStyles();wrapSave();buildControls();buildSettingsCard();}
  function syncAfterEdit(){
    requestAnimationFrame(()=>{sync();const sheet=document.querySelector('#journalDetailDialog .v1325-journal-sheet');if(sheet?.classList.contains('editing'))autoIfEnabled();});
    setTimeout(sync,70);setTimeout(sync,180);
  }
  function wrapOpen(){
    if(openWrapped||typeof openJournalDetail!=='function')return;
    const open0=openJournalDetail;openJournalDetail=function(){const out=open0.apply(this,arguments);pending=null;syncAfterEdit();return out;};openJournalDetail.__contextEnrichmentWrapped=true;openWrapped=true;
  }

  document.addEventListener('click',event=>{
    if(event.target.closest?.('#v1325JournalEditToggle'))syncAfterEdit();
    if(event.target.closest?.('#settingsBtn'))requestAnimationFrame(buildSettingsCard);
  },true);

  installStyles();wrapSave();wrapOpen();requestAnimationFrame(sync);setTimeout(()=>{wrapSave();wrapOpen();sync();},180);
  window.AudreyJournalContextEnrichment={version:VERSION,refresh:sync,gather:()=>handleAutoContextClick(),seasonForDate,enabled:preference,setEnabled:async value=>value?enablePreference({requestPermission:true}):setPreference(false)};
})();
