/* Audrey Closet v13.24 — stable release entry shim
 * Preserves the historical index.html filename while handing off to the
 * source-authoritative v13.24 consolidated runtime.
 */
(function(){
  'use strict';
  const ENTRY='13.24-phase7a8d-entry1';
  if(!window.AUDREY_SMART_SCAN_SERVICE_CONFIG){
    window.AUDREY_SMART_SCAN_SERVICE_CONFIG={
      enabled:true,
      endpoint:'https://audrey-smartscan-api.thomaslee78.workers.dev',
      channel:'production',
      build:'13.24'
    };
  }
  window.AUDREY_RELEASE_ENTRY={version:ENTRY,target:'share-render-v13.24-release.js'};
  document.write('<script src="share-render-v13.24-release.js?v=13.24-phase7a8c-runtime1"><\/script>');
})();
