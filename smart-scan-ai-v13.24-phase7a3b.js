/* Audrey Closet v13.24 — Smart Scan Phase 7A3B Editable Review
 * Lets users accept, modify, reset, or skip Smart Scan suggestions directly in the review dialog.
 * Uses existing Audrey taxonomy and apply pipeline; no saved-item schema changes or repeat AI calls.
 */
(function(){
  'use strict';
  const VERSION='13.24-phase7a3b-editable-review5-reset-smartscan';
  const CORE=window.AUDREY_SMART_SCAN;
  const TELEMETRY=window.AUDREY_SMART_SCAN_TELEMETRY;
  if(!CORE?.taxonomy){console.warn('Smart Scan Phase 7A3B skipped: Smart Scan contract unavailable.');return}

  const clone=x=>x==null?x:JSON.parse(JSON.stringify(x));
  const escHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const KNOWN=['category','type','color','pattern','brand','size'];
  let proposal={};

  function installStyles(){
    if(document.getElementById('smartScanEditableReviewStyles'))return;
    const style=document.createElement('style');style.id='smartScanEditableReviewStyles';
    style.textContent=`
      #smartScanReviewDialog{max-height:min(84dvh,720px);overflow:hidden}
      #smartScanReviewDialog .smart-scan-review-shell{display:flex;flex-direction:column;max-height:min(80dvh,680px);min-height:0}
      #smartScanReviewDialog .sheet-head,#smartScanReviewDialog .smart-scan-review-intro,#smartScanReviewDialog .smart-scan-review-actions{flex:0 0 auto}
      #smartScanReviewFields.smart-scan-editable-fields{display:grid;gap:6px;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:1px 2px 6px;overscroll-behavior:contain}
      .smart-scan-edit-row{display:grid;grid-template-columns:22px 72px minmax(0,1fr);gap:7px;align-items:center;padding:7px 8px;border:1px solid rgba(108,81,66,.12);border-radius:11px;background:rgba(255,250,240,.72)}
      .smart-scan-edit-row>input[type="checkbox"]{margin:0;width:16px;height:16px}
      .smart-scan-edit-label-wrap{min-width:0;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:1px;line-height:1.05}
      .smart-scan-edit-label{min-width:0;max-width:100%;font-size:11px;font-weight:800;color:var(--ink,#443d36);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .smart-scan-edit-status{display:none;font-size:8.5px;line-height:1;text-transform:uppercase;letter-spacing:.045em;color:#8b6a2b;font-weight:800;white-space:nowrap}
      .smart-scan-edit-control{width:100%;min-width:0;min-height:32px;border:1px solid rgba(108,81,66,.18);border-radius:8px;background:#fff;padding:5px 7px;font:inherit;font-size:12px;color:inherit}
      .smart-scan-edit-control:disabled{opacity:.5;background:rgba(120,110,100,.06)}
      .smart-scan-edit-row.modified{border-color:rgba(178,138,61,.30);background:rgba(255,248,230,.78)}
      .smart-scan-edit-row.modified .smart-scan-edit-status{display:block}
      #resetSmartScanReviewBtn{font-size:11px;padding-left:8px;padding-right:8px;white-space:nowrap}
      #resetSmartScanReviewBtn[hidden]{display:none!important}
      @media(max-width:430px){
        #smartScanReviewDialog{width:calc(100vw - 20px);max-width:none}
        #smartScanReviewDialog .smart-scan-review-shell{max-height:82dvh}
        #smartScanReviewDialog .smart-scan-review-intro{margin-top:4px;margin-bottom:8px;font-size:11px;line-height:1.35}
        .smart-scan-edit-row{grid-template-columns:20px 62px minmax(0,1fr);gap:5px;padding:6px 7px}
        .smart-scan-edit-label{font-size:10.5px}
        .smart-scan-edit-status{font-size:8px}
        .smart-scan-edit-control{min-height:30px;font-size:11.5px;padding:4px 6px}
        #resetSmartScanReviewBtn{font-size:10px;padding:6px 7px}
      }
    `;
    document.head.appendChild(style);
  }

  function options(values,selected,{includeBlank=false}={}){
    const list=Array.isArray(values)?values:[];
    return `${includeBlank?'<option value="">Not set</option>':''}${list.map(v=>`<option value="${escHtml(v)}"${String(v)===String(selected)?' selected':''}>${escHtml(v)}</option>`).join('')}`;
  }
  function controlFor(key,value){
    if(key==='category')return `<select class="smart-scan-edit-control" data-scan-edit="category">${options(CORE.taxonomy.categories,value)}</select>`;
    if(key==='type'){const category=proposal.category||'';return `<select class="smart-scan-edit-control" data-scan-edit="type">${options(CORE.taxonomy.types?.[category]||[],value,{includeBlank:true})}</select>`}
    if(key==='color')return `<select class="smart-scan-edit-control" data-scan-edit="color">${options(CORE.taxonomy.colors,value)}</select>`;
    if(key==='pattern')return `<select class="smart-scan-edit-control" data-scan-edit="pattern">${options(CORE.taxonomy.patterns,value)}</select>`;
    return `<input class="smart-scan-edit-control" data-scan-edit="${escHtml(key)}" type="text" value="${escHtml(value)}" autocomplete="off" spellcheck="false">`;
  }
  function labelFor(key){return typeof window.smartScanFieldLabel==='function'?window.smartScanFieldLabel(key):key}
  function hasReviewEdits(){
    return KNOWN.some(key=>{
      const control=document.querySelector(`#smartScanReviewFields [data-scan-edit="${key}"]`);
      return control&&String(control.value??'')!==String(proposal[key]??'');
    });
  }
  function updateResetButton(){const btn=document.getElementById('resetSmartScanReviewBtn');if(btn)btn.hidden=!hasReviewEdits()}
  function setRowState(row){
    const key=row?.dataset?.field;if(!key)return;
    const checkbox=row.querySelector('input[data-scan-field]'),control=row.querySelector('[data-scan-edit]');
    if(control)control.disabled=!checkbox?.checked;
    row.classList.toggle('modified',Boolean(checkbox?.checked)&&String(control?.value??'')!==String(proposal[key]??''));
    updateResetButton();
  }
  function refreshTypeOptions({fromCategoryChange=false}={}){
    const cat=document.querySelector('[data-scan-edit="category"]')?.value||proposal.category||'',type=document.querySelector('[data-scan-edit="type"]');if(!type)return;
    const allowed=CORE.taxonomy.types?.[cat]||[],current=type.value;
    type.innerHTML=options(allowed,allowed.includes(current)?current:'',{includeBlank:true});
    if(fromCategoryChange&&!allowed.includes(current))type.value='';
    setRowState(type.closest('.smart-scan-edit-row'));
  }
  function bindEditableReview(){
    const fields=document.getElementById('smartScanReviewFields');if(!fields)return;
    fields.querySelectorAll('.smart-scan-edit-row').forEach(row=>{
      const check=row.querySelector('input[data-scan-field]'),control=row.querySelector('[data-scan-edit]');
      check?.addEventListener('change',()=>setRowState(row));
      control?.addEventListener('input',()=>setRowState(row));
      control?.addEventListener('change',()=>{if(control.dataset.scanEdit==='category')refreshTypeOptions({fromCategoryChange:true});setRowState(row)});
      setRowState(row);
    });
  }
  function installResetButton(){
    const actions=document.querySelector('#smartScanReviewDialog .smart-scan-review-actions');
    if(!actions)return false;
    let btn=document.getElementById('resetSmartScanReviewBtn');
    if(!btn){
      btn=document.createElement('button');btn.type='button';btn.id='resetSmartScanReviewBtn';btn.className='soft-btn';btn.textContent='↶ Reset to Smart Scan';btn.hidden=true;
      const cancel=document.getElementById('cancelSmartScanReviewBtn');actions.insertBefore(btn,cancel||actions.firstChild);
      btn.addEventListener('click',resetReviewToProposal);
    }
    updateResetButton();return true;
  }
  function resetReviewToProposal(){
    const category=document.querySelector('[data-scan-edit="category"]');
    if(category&&proposal.category!=null)category.value=String(proposal.category);
    refreshTypeOptions();
    KNOWN.forEach(key=>{
      const control=document.querySelector(`#smartScanReviewFields [data-scan-edit="${key}"]`);if(!control)return;
      control.value=String(proposal[key]??'');
    });
    // Category determines valid Type options, so refresh once more after restoring all proposal values.
    refreshTypeOptions();
    const type=document.querySelector('[data-scan-edit="type"]');if(type)type.value=String(proposal.type??'');
    document.querySelectorAll('#smartScanReviewFields .smart-scan-edit-row').forEach(setRowState);
    updateResetButton();
  }

  const previousOpen=window.openSmartScanReview;
  window.openSmartScanReview=function(result){
    installStyles();proposal=clone(result||{});
    const fields=document.getElementById('smartScanReviewFields');if(!fields)return typeof previousOpen==='function'?previousOpen(result):undefined;
    const entries=KNOWN.filter(key=>String(proposal[key]??'').trim());
    fields.classList.add('smart-scan-editable-fields');
    fields.innerHTML=entries.length?entries.map(key=>`<div class="smart-scan-edit-row" data-field="${escHtml(key)}"><input type="checkbox" data-scan-field="${escHtml(key)}" checked aria-label="Apply ${escHtml(labelFor(key))}"><div class="smart-scan-edit-label-wrap"><div class="smart-scan-edit-label">${escHtml(labelFor(key))}</div><div class="smart-scan-edit-status" aria-hidden="true">Edited</div></div>${controlFor(key,proposal[key])}</div>`).join(''):'<p class="empty-note">No reliable attributes were detected. You can still enter the details manually.</p>';
    const apply=document.getElementById('applySmartScanReviewBtn');if(apply)apply.disabled=!entries.length;
    installResetButton();bindEditableReview();refreshTypeOptions();fields.scrollTop=0;updateResetButton();
    const dialog=document.getElementById('smartScanReviewDialog');if(dialog&&!dialog.open)dialog.showModal();
  };

  function setSelectValue(sel,value){
    if(!sel)return false;
    const match=[...sel.options].find(o=>o.value===value||o.textContent===value);if(!match)return false;
    sel.value=match.value;sel.dispatchEvent(new Event('change',{bubbles:true}));return true;
  }
  function enforceEditedValues(edited,selected,wish){
    if(selected.has('category')&&edited.category){const cat=document.querySelector(wish?'#wishCategory':'#itemCategory');if(cat)setSelectValue(cat,edited.category)}
    if(selected.has('type')&&edited.type)setSelectValue(document.querySelector(wish?'#wishType':'#itemType'),edited.type);
    if(selected.has('color')&&edited.color)setSelectValue(document.querySelector(wish?'#wishColor':'#itemColor'),edited.color);
    if(selected.has('pattern')&&edited.pattern)setSelectValue(document.querySelector(wish?'#wishPattern':'#itemPattern'),edited.pattern);
    if(selected.has('brand')){const el=document.querySelector(wish?'#wishBrand':'#itemBrand');if(el){el.value=edited.brand||'';el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))}}
    if(selected.has('size')&&edited.size)setSelectValue(document.querySelector(wish?'#wishSize':'#itemSize'),edited.size);
    if(!wish&&typeof window.updateItemReviewSummary==='function')window.updateItemReviewSummary();
  }

  const previousApply=window.applyPendingSmartScan;
  window.applyPendingSmartScan=function(){
    if(!pendingSmartScanResult)return typeof previousApply==='function'?previousApply.apply(this,arguments):undefined;
    const selected=[],edited=clone(pendingSmartScanResult||{}),decisions={};
    KNOWN.forEach(key=>{
      const check=document.querySelector(`#smartScanReviewFields input[data-scan-field="${key}"]`),control=document.querySelector(`#smartScanReviewFields [data-scan-edit="${key}"]`),original=String(proposal[key]??'');
      if(!check)return;
      if(!check.checked){decisions[key]='not_applied';return}
      selected.push(key);const value=String(control?.value??original).trim();edited[key]=value;decisions[key]=value===original?'accepted':'modified';
    });
    const selectedSet=new Set(selected),wish=typeof smartScanTarget==='string'&&smartScanTarget==='wish';
    TELEMETRY?.setReviewContext?.({proposal:clone(proposal),appliedValues:clone(edited),selectedFields:[...selected],decisions:clone(decisions)});
    pendingSmartScanResult={...pendingSmartScanResult,...edited};
    const result=typeof previousApply==='function'?previousApply.apply(this,arguments):undefined;
    enforceEditedValues(edited,selectedSet,wish);
    return result;
  };

  function bindApplyButton(){
    const btn=document.getElementById('applySmartScanReviewBtn');
    if(!btn)return false;
    btn.onclick=function(){return window.applyPendingSmartScan()};
    return true;
  }
  if(!bindApplyButton()){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindApplyButton,{once:true});
    else setTimeout(bindApplyButton,0);
  }

  const API={version:VERSION,getProposal:()=>clone(proposal),refreshTypeOptions,enforceEditedValues,bindApplyButton,resetReviewToProposal,hasReviewEdits};
  window.AUDREY_SMART_SCAN_EDITABLE_REVIEW=API;
  console.info(`Audrey Smart Scan ${VERSION} loaded: editable review reset to original Smart Scan proposal enabled.`);
})();
