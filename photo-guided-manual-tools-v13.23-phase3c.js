/* Audrey Closet v13.23 Cutout Phase 3C — Guided/manual-tool handoff.
 * Selecting Erase or Restore while the Shirt Guide is visible hides only the
 * transient guide overlay so the manual brush can own canvas input immediately.
 * Canonical Guided state, guide geometry, protected-shape data and saved base are untouched.
 */
(function(){
'use strict';

const workflowApi=()=>window.__audreyCutoutWorkflow3B;
const cutoutState=()=>window.__audreyCutoutState?.getState?.();

function manualToolName(button){
  if(!button)return '';
  const ds=button.dataset||{};
  return [button.id,button.className,button.textContent,ds.tool,ds.mode,ds.action,ds.brush]
    .filter(Boolean).join(' ').toLowerCase();
}
function isManualMaskButton(button){
  if(!button?.matches?.('button'))return false;
  const name=manualToolName(button);
  return /(^|[^a-z])(erase|restore)([^a-z]|$)/i.test(name);
}
function hideGuideForManualTool(){
  const state=cutoutState(),wf=workflowApi();
  if(state?.workflow!=='guided'||!wf?.visible)return false;
  const toggle=document.getElementById('cutoutGuideShow3B');
  if(!toggle)return false;
  // Use the existing 3B UI path intentionally. It changes only transient
  // visible/editing state; it does not mutate the canonical saved guide.
  toggle.click();
  return true;
}
function onToolSelection(e){
  const button=e.target?.closest?.('button');
  if(!isManualMaskButton(button))return;
  hideGuideForManualTool();
}

// Capture phase ensures the overlay is released before the existing Photo Studio
// Erase/Restore click handler enables its brush mode.
document.addEventListener('click',onToolSelection,true);

window.__audreyGuidedManualTools={phase:'3C-manual1',hideGuideForManualTool,isManualMaskButton};
})();
