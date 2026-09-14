/* Audrey Closet v13.25 Phase 3 — Journal editor refinements
 * Layout22 targeted presentation overlay.
 * - hides context chips/details in Wear Log read mode
 * - promotes View Journal to a full-width primary action above Remember this day
 * - capitalizes Journal Title
 * - prevents iPhone form-field auto zoom in About the Day
 * - adds edit-mode bottom scroll room so Save Journal can clear the footer menu
 */
(function(){
  'use strict';

  const VERSION='1.1';
  const STYLE_ID='v1325JournalEditorRefinementStyles';
  let syncing=false;

  function installStyles(){
    document.getElementById(STYLE_ID)?.remove();
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      /* Read mode should be simple: View Journal, heading/title, then entry. */
      #journalDetailDialog .v1325-journal-sheet:not(.editing) .v1325-about-day-panel,
      #journalDetailDialog .v1325-journal-sheet:not(.editing) .v1325-journal-context-chips,
      #journalDetailDialog .v1325-journal-sheet:not(.editing) .v1325-journal-context-grid{
        display:none!important;
      }

      /* View Journal is the primary read-mode action and spans the Journal width. */
      #journalDetailDialog .v1325-journal-primary-view{
        width:100%!important;
        margin:0 0 9px!important;
      }
      #journalDetailDialog .v1325-journal-primary-view #v1325JournalViewBtn{
        width:100%!important;
        min-width:0!important;
        min-height:42px!important;
        padding:9px 14px!important;
        border-radius:11px!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        gap:7px!important;
        font-size:.76rem!important;
        font-weight:800!important;
        box-shadow:0 4px 12px rgba(68,53,40,.14)!important;
      }

      /* Remember this day keeps only its contextual edit control. */
      #journalDetailDialog .v1325-journal-context-title .v1325-journal-edit-toggle{
        margin-left:auto!important;
      }
      #journalDetailDialog .v1325-journal-feature-row,
      #journalDetailDialog .v1325-journal-heading-actions{
        display:none!important;
      }
      #journalDetailDialog .v1325-journal-sheet.editing .v1325-journal-primary-view{
        display:none!important;
      }

      /* About the Day stays compact while editing. */
      #journalDetailDialog .v1325-journal-sheet.editing .v1325-about-day-body input,
      #journalDetailDialog .v1325-journal-sheet.editing .v1325-about-day-body select{
        font-size:16px!important;
      }

      /* Give edit mode enough trailing space to scroll Save Journal above the fixed/footer actions. */
      #journalDetailDialog .v1325-journal-sheet.editing .v1325-journal-write{
        padding-bottom:92px!important;
      }
      #journalDetailDialog .v1325-journal-sheet.editing .v1325-journal-save-row{
        margin-bottom:8px!important;
        scroll-margin-bottom:96px!important;
      }
      #journalDetailDialog .journal-detail-scroll{
        scroll-padding-bottom:110px!important;
      }

      @media(max-width:520px){
        #journalDetailDialog .v1325-journal-context-title{
          align-items:center!important;
        }
        #journalDetailDialog .v1325-journal-primary-view #v1325JournalViewBtn{
          min-height:44px!important;
          font-size:.74rem!important;
        }
        /* 16px prevents Safari from zooming the page when these controls receive focus. */
        #journalDetailDialog .v1325-journal-sheet.editing .v1325-about-day-body input,
        #journalDetailDialog .v1325-journal-sheet.editing .v1325-about-day-body select{
          font-size:16px!important;
          line-height:1.2!important;
        }
        #journalDetailDialog .v1325-journal-sheet.editing .v1325-journal-write{
          padding-bottom:118px!important;
        }
        #journalDetailDialog .journal-detail-scroll{
          scroll-padding-bottom:132px!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function capitalizeTitleLabel(sheet){
    const label=sheet?.querySelector('.v1325-journal-title-field label');
    if(label)label.textContent='Journal Title';
  }

  function placePrimaryView(dialog,sheet){
    const head=sheet?.querySelector('.v1325-journal-context-head');
    const contextTitle=head?.querySelector('.v1325-journal-context-title');
    const edit=dialog?.querySelector('#v1325JournalEditToggle');
    const view=dialog?.querySelector('#v1325JournalViewBtn');
    if(!head||!contextTitle)return;

    if(edit&&edit.parentNode!==contextTitle)contextTitle.appendChild(edit);

    let primary=head.querySelector('.v1325-journal-primary-view');
    if(!primary){
      primary=document.createElement('div');
      primary.className='v1325-journal-primary-view';
      head.insertBefore(primary,contextTitle);
    }else if(primary.nextElementSibling!==contextTitle){
      head.insertBefore(primary,contextTitle);
    }
    if(view&&view.parentNode!==primary)primary.appendChild(view);

    dialog.querySelectorAll('.v1325-journal-heading-actions').forEach(node=>{
      while(node.firstChild){
        const child=node.firstChild;
        if(child===edit)contextTitle.appendChild(child);
        else if(child===view)primary.appendChild(child);
        else node.removeChild(child);
      }
      node.remove();
    });
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
      placePrimaryView(dialog,sheet);
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
