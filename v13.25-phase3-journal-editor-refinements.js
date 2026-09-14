/* Audrey Closet v13.25 Phase 3 — Journal editor refinements
 * Layout21 targeted presentation overlay.
 * - hides context chips/details in Wear Log read mode
 * - stacks View Journal directly beneath Edit Journal
 * - capitalizes Journal Title
 * - prevents iPhone form-field auto zoom in About the Day
 */
(function(){
  'use strict';

  const VERSION='1.0';
  const STYLE_ID='v1325JournalEditorRefinementStyles';
  let syncing=false;

  function installStyles(){
    document.getElementById(STYLE_ID)?.remove();
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      /* Read mode should be simple: heading/title, Journal View action, then entry. */
      #journalDetailDialog .v1325-journal-sheet:not(.editing) .v1325-about-day-panel,
      #journalDetailDialog .v1325-journal-sheet:not(.editing) .v1325-journal-context-chips,
      #journalDetailDialog .v1325-journal-sheet:not(.editing) .v1325-journal-context-grid{
        display:none!important;
      }

      /* Edit + View form one compact action stack at the upper-right of the Journal section. */
      #journalDetailDialog .v1325-journal-heading-actions{
        flex:0 0 auto;
        display:flex;
        flex-direction:column;
        align-items:stretch;
        gap:5px;
        margin-left:auto;
      }
      #journalDetailDialog .v1325-journal-heading-actions .v1325-journal-edit-toggle{
        margin:0!important;
        min-width:96px!important;
      }
      #journalDetailDialog .v1325-journal-heading-actions #v1325JournalViewBtn{
        width:100%!important;
        min-width:96px!important;
        min-height:31px!important;
        padding:5px 9px!important;
        border-radius:9px!important;
        font-size:.68rem!important;
        box-shadow:0 2px 8px rgba(68,53,40,.11)!important;
      }
      #journalDetailDialog .v1325-journal-feature-row{display:none!important}
      #journalDetailDialog .v1325-journal-sheet.editing .v1325-journal-heading-actions #v1325JournalViewBtn{
        display:none!important;
      }

      /* About the Day stays compact while editing. */
      #journalDetailDialog .v1325-journal-sheet.editing .v1325-about-day-body input,
      #journalDetailDialog .v1325-journal-sheet.editing .v1325-about-day-body select{
        font-size:16px!important;
      }

      @media(max-width:520px){
        #journalDetailDialog .v1325-journal-context-title{
          align-items:flex-start!important;
        }
        #journalDetailDialog .v1325-journal-heading-actions{
          gap:4px;
        }
        #journalDetailDialog .v1325-journal-heading-actions .v1325-journal-edit-toggle,
        #journalDetailDialog .v1325-journal-heading-actions #v1325JournalViewBtn{
          min-width:104px!important;
          font-size:.66rem!important;
        }
        /* 16px prevents Safari from zooming the page when these controls receive focus. */
        #journalDetailDialog .v1325-journal-sheet.editing .v1325-about-day-body input,
        #journalDetailDialog .v1325-journal-sheet.editing .v1325-about-day-body select{
          font-size:16px!important;
          line-height:1.2!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function capitalizeTitleLabel(sheet){
    const label=sheet?.querySelector('.v1325-journal-title-field label');
    if(label)label.textContent='Journal Title';
  }

  function stackJournalActions(dialog,sheet){
    const title=sheet?.querySelector('.v1325-journal-context-title');
    const edit=dialog?.querySelector('#v1325JournalEditToggle');
    const view=dialog?.querySelector('#v1325JournalViewBtn');
    if(!title||!edit)return;

    let actions=title.querySelector('.v1325-journal-heading-actions');
    if(!actions){
      actions=document.createElement('div');
      actions.className='v1325-journal-heading-actions';
      title.appendChild(actions);
    }
    if(edit.parentNode!==actions)actions.appendChild(edit);
    if(view&&view.parentNode!==actions)actions.appendChild(view);

    dialog.querySelectorAll('.v1325-journal-feature-row').forEach(row=>{
      if(!row.children.length)row.remove();
    });
  }

  function sync(){
    if(syncing)return;syncing=true;
    try{
      installStyles();
      const dialog=document.querySelector('#journalDetailDialog');
      const sheet=dialog?.querySelector('.v1325-journal-sheet');
      if(!dialog||!sheet)return;
      capitalizeTitleLabel(sheet);
      stackJournalActions(dialog,sheet);
    }finally{syncing=false;}
  }

  document.addEventListener('click',event=>{
    if(event.target.closest?.('#v1325JournalEditToggle,#v1325SaveJournalBtn')){
      requestAnimationFrame(sync);setTimeout(sync,40);setTimeout(sync,130);
    }
  },true);

  if(typeof openJournalDetail==='function'&&!openJournalDetail.__journalEditorRefinementsWrapped){
    const open0=openJournalDetail;
    openJournalDetail=function(){
      const out=open0.apply(this,arguments);
      requestAnimationFrame(sync);setTimeout(sync,80);setTimeout(sync,200);setTimeout(sync,340);
      return out;
    };
    openJournalDetail.__journalEditorRefinementsWrapped=true;
  }

  installStyles();requestAnimationFrame(sync);setTimeout(sync,120);
  window.AudreyJournalEditorRefinements={version:VERSION,refresh:sync};
})();
