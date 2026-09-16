/* Audrey Closet v13.25 Phase 3 — Journal Done exit fix
 * Layout54 targeted interaction fix:
 * - after the contextual Journal save completes successfully, force the detail
 *   sheet back to read mode in the same tap
 * - avoids relying on a second programmatic Edit/Done click after renderJournal()
 *   refreshes parts of the DOM
 */
(function(){
  'use strict';
  const VERSION='1.0';
  let installed=false;

  function dialog(){return document.querySelector('#journalDetailDialog');}
  function isEditing(d=dialog()){return !!d?.querySelector('.v1325-journal-sheet')?.classList.contains('editing');}

  function exitEditMode(){
    const d=dialog();if(!d||!isEditing(d))return;
    const sheet=d.querySelector('.v1325-journal-sheet');
    const editor=d.querySelector('#v1325JournalEditor');
    const edit=d.querySelector('#v1325JournalEditToggle');
    sheet?.classList.remove('editing');
    editor?.setAttribute('contenteditable','false');
    d.classList.remove('v1325-journal-editing');
    if(edit){edit.disabled=false;edit.classList.remove('v1325-done-saving');edit.textContent='Edit Journal';}
    const view=d.querySelector('#v1325JournalViewBtn');if(view){view.disabled=false;view.setAttribute('aria-disabled','false');}
    ['#editJournalDetailBtn','#journalOpenBoardBtn','#cancelJournalDetailBtn','#deleteJournalDetailBtn'].forEach(sel=>{const b=d.querySelector(sel);if(b)b.disabled=false;});
    try{window.AudreyWearLogInteractionFixes?.refresh?.();}catch{}
    try{window.AudreyJournalEditorLayout?.refresh?.();}catch{}
    try{window.AudreyJournalEditorRefinements?.refresh?.();}catch{}
    try{window.AudreyJournalLayoutHardening?.refresh?.();}catch{}
  }

  function install(){
    if(installed)return;
    const api=window.AudreyContextualJournal;if(!api?.save)return;
    const save0=api.save.bind(api);
    api.save=async function(){
      const wasEditing=isEditing();
      const result=await save0.apply(this,arguments);
      if(wasEditing)requestAnimationFrame(exitEditMode);
      return result;
    };
    installed=true;
  }

  install();setTimeout(install,80);setTimeout(install,220);
  window.AudreyJournalDoneExitFix={version:VERSION,refresh:install,exit:exitEditMode};
})();
