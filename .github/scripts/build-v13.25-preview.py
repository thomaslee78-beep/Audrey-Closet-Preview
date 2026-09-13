from pathlib import Path
import re

path = Path('preview/index.html')
text = path.read_text(encoding='utf-8')

footer = re.compile(r'<div class="sheet-actions journal-detail-actions">.*?</div>', re.S)
replacement = '<div class="sheet-actions journal-detail-actions"><button type="button" class="soft-btn" id="editJournalDetailBtn">Edit</button><button type="button" class="primary journal-open-board-btn" id="journalOpenBoardBtn">Add to Outfit Board</button><button type="button" class="soft-btn" id="cancelJournalDetailBtn">Cancel</button><button type="button" class="danger-text" id="deleteJournalDetailBtn">Delete</button></div>'
text, count = footer.subn(replacement, text, count=1)
if count != 1:
    raise SystemExit('Journal detail footer not found')

style = '''  <style id="v1325PreviewJournalFooterStyles">\n    #journalDetailDialog .journal-detail-actions{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.25fr);grid-template-areas:"edit board" "cancel delete";gap:10px 12px;align-items:center}\n    #journalDetailDialog #editJournalDetailBtn{grid-area:edit;width:100%;min-width:0}\n    #journalDetailDialog .journal-open-board-btn{grid-area:board;width:100%;min-width:0;white-space:nowrap}\n    #journalDetailDialog #cancelJournalDetailBtn{grid-area:cancel;width:100%;min-width:0}\n    #journalDetailDialog #deleteJournalDetailBtn{grid-area:delete;width:100%;min-width:0;justify-self:stretch;text-align:center}\n  </style>\n'''
text = text.replace('</head>', style + '  <meta name="audrey-preview-build" content="v13.25-phase3-dev3-layout5">\n</head>', 1)

swpat = re.compile(r'\n\s*<script>\s*if\s*\(\s*[\'\"]serviceWorker[\'\"]\s+in\s+navigator\s*\)\s*\{.*?navigator\.serviceWorker\.register\(.*?</script>\s*', re.S)
text, n = swpat.subn('\n', text, count=1)
if n != 1:
    raise SystemExit('Production service worker registration block missing')

cleanup = '''  <script id="previewServiceWorkerCleanup">\n    if ('serviceWorker' in navigator) {\n      navigator.serviceWorker.getRegistrations().then(function(regs){\n        var ours=regs.filter(function(r){return r.scope.indexOf('/Audrey-Closet-Preview/')!==-1;});\n        if(!ours.length)return;\n        return Promise.all(ours.map(function(r){return r.unregister();})).then(function(){\n          if(!sessionStorage.getItem('audreyV1325PreviewSWCleared')){\n            sessionStorage.setItem('audreyV1325PreviewSWCleared','1');\n            location.reload();\n          }\n        });\n      }).catch(function(){});\n    }\n  </script>\n'''

for name in [
    'v13.25-phase1-journal-board.js',
    'v13.25-phase2-closet-log.js',
    'v13.25-phase3-contextual-journal.js',
    'v13.25-phase3-era-foundation.js',
    'v13.25-phase3-dev3-journal-experience.js',
    'v13.25-phase3-dev3-functional-fixes.js',
    'v13.25-phase3-dev3-journal-layout.js',
    'v13.25-item-studio-context-fix.js',
    'photo-studio-reopen-snapshot-hotfix-v13.24.js',
    'photo-studio-state-integrity-hotfix-v13.24.js',
]:
    text = re.sub(r'\s*<script src="\./' + re.escape(name) + r'(?:\?[^\"]*)?"></script>\s*', '\n', text)

markers = (
    '<script src="./v13.25-phase1-journal-board.js?v=phase3-dev3-layout5"></script>\n'
    '  <script src="./v13.25-phase2-closet-log.js?v=phase3-dev3-layout5"></script>\n'
    '  <script src="./v13.25-phase3-contextual-journal.js?v=phase3-dev3-layout5"></script>\n'
    '  <script src="./v13.25-phase3-era-foundation.js?v=phase3-dev3-layout5"></script>\n'
    '  <script src="./v13.25-phase3-dev3-journal-experience.js?v=phase3-dev3-layout5"></script>\n'
    '  <script src="./v13.25-phase3-dev3-functional-fixes.js?v=phase3-dev3-layout5"></script>\n'
    '  <script src="./v13.25-phase3-dev3-journal-layout.js?v=phase3-dev3-layout5"></script>\n'
    '  <script src="./photo-studio-reopen-snapshot-hotfix-v13.24.js?v=phase3-dev3-layout5"></script>\n'
    '  <script src="./photo-studio-state-integrity-hotfix-v13.24.js?v=phase3-dev3-layout5"></script>\n'
    '  <script src="./v13.25-item-studio-context-fix.js?v=phase3-dev3-layout5"></script>'
)
text = text.replace('</body>', cleanup + '  ' + markers + '\n</body>', 1)
path.write_text(text, encoding='utf-8')

checks = [
    'Add to Outfit Board',
    'audrey-preview-build" content="v13.25-phase3-dev3-layout5',
    'v13.25-phase1-journal-board.js?v=phase3-dev3-layout5',
    'v13.25-phase2-closet-log.js?v=phase3-dev3-layout5',
    'v13.25-phase3-contextual-journal.js?v=phase3-dev3-layout5',
    'v13.25-phase3-era-foundation.js?v=phase3-dev3-layout5',
    'v13.25-phase3-dev3-journal-experience.js?v=phase3-dev3-layout5',
    'v13.25-phase3-dev3-functional-fixes.js?v=phase3-dev3-layout5',
    'v13.25-phase3-dev3-journal-layout.js?v=phase3-dev3-layout5',
    'photo-studio-reopen-snapshot-hotfix-v13.24.js?v=phase3-dev3-layout5',
    'photo-studio-state-integrity-hotfix-v13.24.js?v=phase3-dev3-layout5',
    'v13.25-item-studio-context-fix.js?v=phase3-dev3-layout5',
]
for token in checks:
    if token not in text:
        raise SystemExit(f'Missing expected preview token: {token}')
if "navigator.serviceWorker.register('./sw.js" in text:
    raise SystemExit('Production service worker registration still present')
