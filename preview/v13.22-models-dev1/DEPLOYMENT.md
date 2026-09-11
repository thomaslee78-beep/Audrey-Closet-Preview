# GitHub Pages deployment

This is a static web app. It does not require Node.js, npm, or a build step.

Recommended GitHub Pages setup:
1. Upload the CONTENTS of this folder to the repository root (index.html must be at the root).
2. In Settings > Pages, choose Deploy from a branch.
3. Select main and /(root), then Save.
4. Commit any small change to main to trigger a fresh deployment if needed.

The `.nojekyll` file is included so GitHub Pages serves the static files directly without Jekyll processing.

A Node.js deprecation warning shown by the GitHub-generated Pages workflow is about GitHub Actions runtime dependencies, not this app; this app contains no Node package and no npm dependencies.

### v12.3
This is a bug-fix/refinement release. It uses the same IndexedDB database as v12 and does not intentionally migrate or erase closet data. After GitHub Pages deploys, refresh the Pages URL in Safari once, then close/reopen the Home Screen app.

### v12.4
Closet preference ordering and iPhone form-zoom stabilization. Uses the existing IndexedDB database and settings object; no destructive migration is required.

### v12.7
Closet drag-and-drop reliability update for iPhone. No database migration is required; the existing `settings.closetOrder` preference data is reused. The service-worker cache is bumped to v12.7.


### v12.7
Closet reorder interaction polish. No database migration required. Service-worker cache is v12.7.


### v12.11
Closet reorder now previews a target without moving neighboring cards until drop. Outfit Board adds undo for removed objects, clearer front/back layering controls, and gentler movement sensitivity for iPhone editing. No database migration required.


### v12.11 polish
Closet reorder now uses a solid outline on the item being moved and a dotted outline on the destination. Board edit controls remain visible below the board and gray out until an object is selected; Undo remains independently available. Photo Tools opens automatically for brand-new closet items but stays collapsed when reviewing existing pieces.


## v13.0
Closet drag tracking fix for iPhone. No database migration required. Service-worker cache is v13.0.

## v13.8-dev1
Upload the complete package together so `index.html`, `app.js`, `styles.css`, and `sw.js` stay in sync. The service-worker cache name is `audrey-closet-v13.8-dev1.2`.

## v13.8-dev1.1
Upload the complete package together. This build keeps the v13.8 editing-engine scope and fixes framing plus touch-mode separation. Service-worker cache: `audrey-closet-v13.8-dev1.2`.


## v13.8-dev1.2
Upload the complete package together. This build preserves the current edited Studio image on re-entry, resets viewport zoom when entering Move mode so placement matches the saved canvas, and allows the Studio to scroll when More options is expanded. Service-worker cache: `audrey-closet-v13.8-dev1.2`.


## v13.8-dev1.4
Photo Studio editing-engine bugfix: full non-shrinking square canvas, collapsible compact Cutout controls below the main editing toolbar, one-finger neutral-mode board panning, and board/guidelines that pan and zoom together with the viewport. Service-worker cache: `audrey-closet-v13.8-dev1.4`.


## v13.8-dev1.5
Small Photo Studio polish: renames the camera action to `Take photo` and reorders the primary Studio toolbar to Move, Undo, Redo, Restore, Erase. Service-worker cache: `audrey-closet-v13.8-dev1.5`.


## v13.9-dev1
Improves automatic cutout quality with a more conservative background-removal pass. Quick and Clean now remove only background-connected regions, better protect similarly colored garment interiors, fill enclosed holes, and produce cleaner edges; Clean additionally removes small leftover fragments and keeps the main foreground component. Service-worker cache: `audrey-closet-v13.9-dev1`.


## v13.9-dev1.1
Calibration update for the first cutout-quality pass. Quick and Clean are tuned to remove more obvious outer background at default sensitivity while better protecting large light-colored foreground objects such as shoes. Added stronger likely-foreground protection, broader fragment cleanup, and a light mask close on both modes. Service-worker cache: `audrey-closet-v13.9-dev1.1`.


## v13.9-dev2
Second incremental cutout-quality pass. Keeps the v13.9-dev1.1 background-detection calibration while improving edge/detail handling: fine foreground details adjacent to the main mask can be rescued, only genuinely tiny isolated mask fragments are removed (instead of broad component pruning), enclosed garment regions are preserved again after cleanup, and boundary alpha is tightened to reduce fuzzy halos without changing cutout sensitivity behavior. Service-worker cache: `audrey-closet-v13.9-dev2`.


## v13.9-dev2.1
Calibration update for cutout behavior and restore. Automatic cutout now adapts to overall subject/background contrast: low-contrast items are treated more conservatively, while medium/high-contrast items remove obvious outer background more aggressively. Restore now paints back pixels from the captured original photo, so clothing details can be recovered even when the cutout removed them completely. Service-worker cache: `audrey-closet-v13.9-dev2.1`.


## v13.10-dev1
Adds non-destructive Photo Studio adjustments for Exposure, Contrast, and Highlights. Adjustments are previewed live, persist when reopening the photo, export with the saved image, and can be reset without affecting cutout or masking work. Service-worker cache: `audrey-closet-v13.10-dev1`.


## v13.10-dev1.1
Refines Photo Studio layout for iPhone editing. The photo canvas remains fixed in the upper portion of the sheet while the editing menus scroll independently below, so slider and cutout changes stay visible without repeatedly scrolling back to the image. Service-worker cache: `audrey-closet-v13.10-dev1.1`.


## v13.10-dev1.2
Photo Studio layout refinement: the primary Adjust / Undo / Redo / Restore / Erase toolbar now stays fixed directly below the photo canvas. Tool guidance, brush controls, Cutout, Adjustments, More options, and status messaging remain in the independently scrollable controls area. Service-worker cache: `audrey-closet-v13.10-dev1.2`.


## v13.10-dev1.3
Minor layout fixes: active Photo Studio tool instructions now appear directly beneath the active tool controls; Today's Look journal rows are contained within their card; and the bottom navigation is explicitly centered on tablet-width screens. Service-worker cache: `audrey-closet-v13.10-dev1.3`.


## v13.11-dev1
Portfolio foundation and detail refresh. Adds stable per-folder portfolio ordering groundwork, a redesigned saved-look detail view with an upper-right favorite star, full notes area, collapsible unique item listing with copy counts, and a fixed bottom action bar. Existing saved looks are normalized without changing the database schema. Service-worker cache: `audrey-closet-v13.11-dev1`.


## v13.11-dev2
Adds Portfolio Duplicate Look and safe Design Board switching. New Look, Edit on Board, and Duplicate now detect an existing Board draft and offer Save current & continue, Replace current board, or Cancel. Duplicate loads a new unsaved copy with a fresh board-item identity and a “— Copy” title so the original saved look is preserved. Service-worker cache: `audrey-closet-v13.11-dev2`.


## v13.11-dev3
Portfolio interaction and sharing refinements. Portfolio preview images are protected from native image actions, item rows open a read-only garment detail view, saved-look share rendering now uses uniform board geometry for more faithful text/graphic sizing, and Share offers Look only, Look + item details, or Look + items + notes. Service-worker cache: `audrey-closet-v13.11-dev3`.


## v13.11-dev4
Adds long-press drag-and-drop reordering for saved Portfolio looks within a selected folder, using the same stable ghost/drop-cue interaction style as Closet reordering. All/Favorites remain read-only aggregate views for order. Also improves Portfolio share rendering for emoji/stickers by prioritizing native color-emoji fonts and explicit emoji presentation, preventing dark emoji from incorrectly exporting as white where supported. Service-worker cache: `audrey-closet-v13.11-dev4`.


## v13.11-dev4.1
Reorder interaction calibration. Portfolio drag now supports continuous edge auto-scroll and more reliable vertical movement across rows, including iPhone touch tracking outside the original card. All/Favorites show a toast after a reorder long-press reminding the user to choose a specific portfolio category. Closet reorder receives matching lift/target/drop animations for consistent feedback. Service-worker cache: `audrey-closet-v13.11-dev4.1`.


## v13.11-dev4.2
Polishes Portfolio and Closet reorder gestures. Portfolio cards now lift from their actual position without jumping from the top of the screen; long-press attempts in All/Favorites are suppressed from opening look details after release. Closet reorder visuals now match Portfolio: a clean lifted ghost with no source outline and a two-layer turquoise + burgundy dashed destination cue. Service-worker cache: `audrey-closet-v13.11-dev4.2`.


## v13.11-dev4.3
Polishes Closet reordering with continuous finger-follow/edge auto-scroll behavior and saves newly created Portfolio looks at the front of their selected category. Existing saved looks keep their manually chosen order when edited in place. Service-worker cache: `audrey-closet-v13.11-dev4.3`.


## v13.11-dev4.4
Closet reorder calibration: the floating drag card now uses visual-viewport-aware touch coordinates so it stays under the finger on iPhone/PWA while scrolling and auto-scrolling. Consolidated older Closet drag CSS into one canonical rule set to remove conflicting legacy source/ghost/drop-target styles. Service-worker cache: `audrey-closet-v13.11-dev4.4`.


## v13.11-dev4.5
Closet reorder drag mapping fix. The floating card now uses raw client coordinates inside a dedicated fixed viewport overlay, matching `getBoundingClientRect()` and avoiding page/visual-viewport offset mixing on iPhone. The ghost uses explicit left/top positioning and remains independent of document scrolling. Service-worker cache: `audrey-closet-v13.11-dev4.5`.


## v13.11-dev5
Portfolio folder/order refinement: All and Favorites are now protected but movable system tabs in Preferences, and saved-look detail stays locked at the top until Items in this look is expanded. Service-worker cache: `audrey-closet-v13.11-dev5`.


## v13.11-dev5.1
Locks the page behind Portfolio look detail and read-only item preview dialogs so edge swipes cannot scroll the underlying app. Adds the same caret-style expandable indicator used elsewhere to the Items in this look section. Service-worker cache: `audrey-closet-v13.11-dev5.1`.


## v13.11-dev6
Adds Portfolio discovery: keyword search across looks and closet-item metadata, a thumbnail-based closet item filter with multi-select AND matching, selected-item filter chips, and clear-filter controls. Reordering is temporarily disabled while discovery filters are active to protect manual folder order. Service-worker cache: `audrey-closet-v13.11-dev6`.


## v13.12-dev1
Closet review UI refinement. Existing saved pieces now use compact upper-right Camera and Smart Scan controls; new pieces retain the full Photo Tools disclosure. Smart Scan is separated from photo tools and presents detected attributes for confirmation before applying them. Service-worker cache: `audrey-closet-v13.12-dev1`.


## v13.12-dev1.1
Closet review UI polish: camera and Smart Scan controls now sit on the upper-right of the closet card rather than beside the close button; photo-picker cancellation/return is hardened so the item editor stays open; Photo Studio is hidden for a new item until a photo exists; restoring the original photo now requires confirmation before discarding current photo edits. Service-worker cache: `audrey-closet-v13.12-dev1.1`.


## v13.12-dev1.2
Moves the saved-piece Camera and Smart Scan controls directly onto the upper-right of the photo. Hardens iPhone camera/library picker return behavior so canceling or returning from the native picker preserves and restores the current Add/Review Piece dialog instead of dropping back to Closet. Service-worker cache: `audrey-closet-v13.12-dev1.2`.


## v13.12-dev1.3
Closet review swipe polish: saved-piece review styling is more borderless/floating, the swipe hint text is removed, horizontal gestures direction-lock to avoid vertical jitter, and a lightweight outgoing/incoming transform animation gives clearer movement between closet pieces. Service-worker cache: `audrey-closet-v13.12-dev1.3`.


## v13.12-dev1.4
Keeps the borderless Closet review, hidden swipe hint, and horizontal gesture locking from dev1.3, but removes the two-stage outgoing/incoming transition that could look like a flash. Restores the earlier simple single-step swipe transition after the gesture completes. Service-worker cache: `audrey-closet-v13.12-dev1.4`.


## v13.12-dev1.5
Closet review polish: photo background now matches the review card surface and subtle previous/next arrows appear at the lower corners only when another item exists in that direction. Existing horizontal swipe locking and simple swipe transition are preserved. Service-worker cache: `audrey-closet-v13.12-dev1.5`.


## v13.12-dev1.6
Closet review polish: the existing-piece photo area now uses a transparent, shadow-free surface so it blends directly into the review card instead of reading like a separate panel. Camera, Smart Scan, and previous/next review controls are approximately 25% larger for easier touch interaction. Service-worker cache: `audrey-closet-v13.12-dev1.6`.


## v13.12-dev1.7
Moves the Camera and Smart Scan controls from the photo overlay to the upper-right of the Closet card summary when reviewing an existing piece, and reduces those two icons by about 10% for a more balanced header treatment. Swipe arrows remain on the photo. Service-worker cache: `audrey-closet-v13.12-dev1.7`.


## v13.12-dev1.8
Portfolio reconciliation build. Restores the known-good Portfolio discovery and folder-tab improvements onto the v13.12 Closet review baseline: direct tab reordering, removal of the redundant Manage folders link, iPhone-safe search input, Filter panel with internal Clear action, preserved filter scroll position, locked filter thumbnails, and simple clothing-term plural normalization. No manila-folder styling is included. Service-worker cache: `audrey-closet-v13.12-dev1.8`.


## v13.12-dev2
Journal workflow refinement: Review actions are Cancel / Delete / Edit; editing existing past or today's wear log locks the date while still allowing additional closet pieces; future planned looks can be moved to another date with an explicit choice to carry the current item selection or navigate to the selected day's existing/blank log. Service-worker cache: `audrey-closet-v13.12-dev2`.


## v13.12-dev2.1
Closet UI polish: new pieces now show Take photo and Upload photo directly beneath the photo placeholder only until a photo exists; after a photo is available, Smart Scan and the camera/Photo Studio menu become the primary photo controls. Portfolio look-card favorite stars now use a circular treatment consistent with saved-look detail. Service-worker cache: `audrey-closet-v13.12-dev2.1`.


## v13.12-dev2.2
Minor Closet UI polish: rounds the item review bottom action tray and makes Closet reorder targeting respond once the dragged card overlaps roughly one-third of a destination card instead of waiting for the midpoint. Service-worker cache: `audrey-closet-v13.12-dev2.2`.


## v13.12-dev2.3
Closet polish: the review action tray now floats slightly above the bottom of the item card so its rounded corners are visible, and Closet reorder targeting activates at roughly 10% card overlap for a quicker drop cue. Service-worker cache: `audrey-closet-v13.12-dev2.3`.


## v13.12-dev3
Adds local Brand suggestions for faster Closet entry. Previously saved brands are learned from the existing catalog and future saves, matched from the first typed letters, deduplicated case-insensitively, and ranked by frequency/recency. No IndexedDB schema change. Service-worker cache: `audrey-closet-v13.12-dev3`.


## v13.12-dev3.1
Reconciles Brand Suggestions with the v13.12-dev2.4 Closet detail layout. The item editor is a single rounded card: detail content scrolls independently while Cancel / Remove / Save remain fixed at the bottom of the panel. Brand autocomplete remains enabled without changing the IndexedDB schema. Service-worker cache: `audrey-closet-v13.12-dev3.1`.


## v13.12-dev4
Journal logging behavior update: renames the Journal action to **Log outfit**; new outfit logs default to today while allowing the date to be changed; existing past/today entries keep their date locked; selecting a past date for a new log locks that historical date; future/planned entries retain the existing move/override confirmation workflow. Service-worker cache: `audrey-closet-v13.12-dev4`.


## v13.12-dev4.0.1
Adds safer Journal date-collision handling for new outfit logs. Selecting a date that already has a Wear Log now offers Open existing day, Replace with current selection, or Cancel instead of navigating or overwriting implicitly. Service-worker cache: `audrey-closet-v13.12-dev4.0.1`.


## v13.12-dev4.0.2
- Journal Log outfit now always opens as a new, date-flexible entry, even when today already has a saved outfit.
- Changing an unused past or future date preserves the current clothing selections and keeps the date editable until Save.
- Existing journal entries still use separate edit behavior; occupied dates continue to use the Open existing / Replace / Cancel safeguard.

## v13.12-dev4.0.3
Fixes planned-look date editing: when changing the date of an existing planned look, **Cancel** now cancels the move, restores the previously selected date, and keeps the current planned-look selections/context unchanged. Only **OK** proceeds with moving the planned look to the new date. Service-worker cache: `audrey-closet-v13.12-dev4.1`.


## v13.12-dev4.1
- Today’s Look and Wear Insights are collapsible.
- Journal section open/closed choices persist locally, including Planned looks and Wear log.
- Stable `data-journal-section` identifiers are in place for future section reordering.


## v13.12-dev4.2 — Journal history controls
- Wear Log filters now include Last 7 days, Last 30 days, Last 90 days, This season, This year, Favorites, All dates, and a Custom range.
- Custom range provides From/To date fields and filters saved wear-log entries inclusively.
- Wear Log remains full-height through 10 entries; above 10 entries, the list becomes internally scrollable.
- Planned looks use the same 10-entry threshold and become internally scrollable above 10 entries.
- Existing Journal logging/edit behavior from v13.12-dev4.1 is unchanged.
- Service-worker cache: `audrey-closet-v13.12-dev4.2`.
## v13.12-dev4.2.1 — Journal filter polish
- Wear Log and Planned Looks switch to an internally scrollable list after 7 entries instead of 10.
- Scroll-limited Journal lists are locked to vertical movement only.
- Wear Log filters now include a Clear control that returns the view to All dates.
- Custom range uses a single in-app range calendar: tap a start date and then an end date, with the selected range highlighted.
- An active custom range is shown compactly to the left of Filter; current-year ranges omit the year, past same-year ranges show one year, and cross-year ranges show both years.
- Service-worker cache: `audrey-closet-v13.12-dev4.2.2`.


v13.12-dev4.2.2: Wear Log filter controls are directly visible; Clear is conditional; scrollable Journal lists reserve right-side space for the scrollbar.


## v13.12-dev4.2.3 — Custom range interaction fixes
- Applying a custom Wear Log range now closes the calendar cleanly and leaves the filter displaying Custom range rather than reopening the native filter menu.
- An active Custom range can be selected again directly to reopen the calendar and revise the dates without first clearing the filter.
- The range calendar suppresses double-tap zoom behavior on its interactive calendar area.
- Calendar actions are no longer sticky/overlaid on small screens; Clear, Cancel, and Apply sit below the selected-date summary with tighter bottom spacing so calendar dates remain visible.
- Service-worker cache: `audrey-closet-v13.12-dev4.2.3`.

## v13.12-dev4.2.4 — Custom range duplicate fix
- Removed the duplicate hidden `Custom range` option from the Wear Log filter.
- Preserved the ability to reselect an already-active Custom range by priming the native select in JavaScript before its picker opens.
- Service-worker cache: `audrey-closet-v13.12-dev4.2.4`.


## v13.12-dev4.3.1
Journal section drag handles were removed in favor of a Preferences > Journal layout editor. The four Journal sections can be reordered with up/down controls and the order is saved in app settings. Expand/collapse controls remain on the right, Journal section spacing is normalized, and header text selection/callouts are suppressed on iPhone.


## v13.14-dev1 — Add Piece photo UI polish
- Reordered new-piece photo actions so Upload photo is on the left and the primary Take photo action is on the right.
- Refined the new-piece photo action palette: warm parchment/olive secondary styling for Upload photo and deep wine/burgundy primary styling for Take photo.
- No catalog data model or IndexedDB schema changes.


## v13.14-dev2.2.1 — Dresses + catalog taxonomy foundation
- Adds Dresses as a first-class Closet category.
- Dress types: Mini, Midi, Maxi, Shirt, Sweater, Slip, Wrap, Casual, Formal / Event, and Other.
- Introduces stable internal category IDs plus a catalog taxonomy version without changing IndexedDB schema/version.
- One-time migration moves legacy `Misc > Dress` pieces to `Dresses > Other`, preserving the item and all non-category attributes.
- New and imported closet items are normalized to the current taxonomy.


## v13.14-dev2.2.2 — Catalog review polish
- Catalog Clear now resets both search text and filter selections.
- Added an inline × control to clear only the Catalog search.
- Compact saved-piece Review mode by hiding the redundant Closet Piece / Piece Details heading while preserving the close ×.
- Reduced photo/detail spacing and review row padding so more attributes are visible without scrolling.


## v13.14-dev2.2.3 — Review Card Stability
- Keeps saved Closet review cards at a consistent viewport height while swiping between pieces.
- Keeps the photo region stable and lets longer item details scroll inside the review card.
- Does not change Add Piece or Edit mode behavior.


## v13.14-dev2.2.4 — Edit Return Flow
- Saving changes to an existing Closet piece now returns to that same piece in read-only Review mode instead of closing back to the Closet overview.
- The current review/swipe sequence is preserved so the user can continue to the next or previous piece and make multiple edits while browsing.
- Add Piece keeps its prior behavior and closes after the new item is saved.

## v13.14-dev3
Service worker cache: `audrey-closet-v13.14-dev3`.


## v13.15-dev1
Service worker cache: `audrey-closet-v13.15-dev1`.
Wishlist model version: `1` (state-level migration only; IndexedDB remains version 1).


## v13.15-dev2 — Wishlist list redesign
- Replaces the two-column Wishlist card grid with a compact vertical shopping list.
- Rows show photo, item/type, brand/color, optional store, price, desire (when present), saved-link indicator, and a detail chevron.
- Tapping a row continues to open the existing Wishlist editor; no reorder or lifecycle behavior is added yet.
- Built on the v13.15-dev1 Wishlist data-model migration with no IndexedDB schema change.


## v13.15-dev2.1 — Wishlist list polish
- Formats Wishlist prices using the saved currency (USD defaults to a dollar sign).
- Tightens Wishlist rows into one continuous list with subtle dividers instead of separate cards.
- Shows a compact heart + 1–5 desire indicator when a desire value exists.
- Keeps existing Wishlist tap/edit behavior unchanged.

### v13.15-dev3
Wishlist Review/Edit detail refinement. Service-worker cache: `audrey-closet-v13.15-dev3`.


## v13.15-dev3.3 — Wishlist review header polish
Wishlist Review mode now uses a Closet-style header with a small Wish List kicker, the saved item name, and Smart Scan/photo tools grouped beside the close control. The item name remains editable only after entering Edit mode. Service-worker cache: `audrey-closet-v13.15-dev3.3`.


## v13.15-dev5.1 — Wishlist desire feedback polish
The selected Wishlist desire heart now receives a gold outline around the heart glyph itself instead of a rectangular button border. The same heart markup is used in Review and Edit modes so the current selection stays visible in both contexts. Rating feedback is now rendered inside the Wishlist modal at the top of the card, avoiding the iOS top-layer issue that could hide the normal page toast behind an open dialog. The confirmation remains visible for about 3.2 seconds. Service-worker cache: `audrey-closet-v13.15-dev5.1`.


## v13.15-dev5.1
- Fixes Wishlist reorder ordering so a dragged item ID can never be recorded twice.
- Automatically normalizes previously saved Wishlist order preferences to unique valid IDs.
- Adds an explicit Reorder / Done mode; drag handles are hidden during normal browsing.
- Simplifies rows during reordering by hiding price, chevron, link, and full heart meter while keeping a small desire cue.


## v13.15-dev5.2 — Wishlist row hierarchy polish
Wishlist list rows now place the 1–4 heart desire meter on the left above the item title, while price is larger and anchored with navigation on the right. Reorder mode preserves the same heart placement and keeps the garment title beside the thumbnail, hiding price/link/chevron so the right edge contains only the subtle three-line drag grip. Service-worker cache: `audrey-closet-v13.15-dev5.2`.


## v13.15-dev5.2.1 — Wishlist rating placement + reorder alignment
Moves the desire hearts directly below the Wishlist item title. In Reorder mode, the grid column now shrinks with the smaller thumbnail so the title and rating remain tucked directly beside the photo instead of leaving an empty horizontal gap. Service-worker cache: `audrey-closet-v13.15-dev5.2.1`.


## v13.15-dev5.3 — Wishlist reorder visual polish
Refines Wishlist ranking mode: the floating row is slightly transparent and inset to avoid edge/image clipping; the destination row remains visible with a light transparent treatment plus top and bottom turquoise guides; the Reorder/Done control is text-only; and Wishlist prices use regular rather than bold weight. Service-worker cache: `audrey-closet-v13.15-dev5.3`.


## v13.15-dev5.4.2 — Wishlist review actions + reorder geometry
Streamlines Wishlist detail actions to **Edit** and **Save**, makes **Remove** available directly from saved-item Review mode, and refines the floating reorder row so its thumbnail is smaller, vertically centered, and fully contained within the ranking rectangle. Service-worker cache: `audrey-closet-v13.15-dev5.4.2`.


## v13.15-dev5.4.2 — Wishlist reorder queue stability
Keeps the original Wishlist row visible in its queue position while dragging. A thin insertion cue appears only when another row is actively targeted; dropping outside all rows or back into the same slot restores the original order without saving. The source row is lightly transparent during drag so nothing looks temporarily deleted. Service-worker cache: `audrey-closet-v13.15-dev5.4.2`.

## v13.15-dev6.1 — Wishlist lifecycle
Adds a safer Wishlist lifecycle: **Remove** now moves wishes to a recoverable Removed view instead of deleting the record, and **Purchased** moves a wish into the Closet while preserving its garment/photo details. The purchase handoff collects purchase date, acquisition method, purchase price, and currency. Purchased and removed wishes no longer appear in the active Wishlist or Wishlist Board picker. Existing IndexedDB schema remains unchanged. Service-worker cache: `audrey-closet-v13.15-dev6.1`.



## v13.15-dev6.1 — Wishlist acquisition cleanup
Restores removed wishes to their prior ranking position, renames the Wishlist lifecycle action to **Acquired**, stacks the acquisition handoff fields for mobile readability, prevents iPhone input zoom, and only shows optional price/currency fields when appropriate for the acquisition method. Original Wishlist price/history remains preserved. Service-worker cache: `audrey-closet-v13.15-dev6.1`.

## v13.15-dev6.1.2 — Acquisition handoff visual polish
Constrains the Acquired date field to the same width as the other handoff controls, uses regular-weight field text, and matches Cancel / Move to Closet button sizing. Service-worker cache: `audrey-closet-v13.15-dev6.1.3`.


### v13.15-dev6.1.3
Restores the full rounded border on the Acquired date field while keeping its corrected width, and vertically aligns the native iOS date value with the other acquisition controls. Service-worker cache: `audrey-closet-v13.15-dev6.1.3`.


### v13.15-dev6.1.4
Matches the Acquired date field width exactly to the other Wishlist-to-Closet handoff controls and centers the native date value for a cleaner, more consistent appearance. Service-worker cache: `audrey-closet-v13.15-dev6.1.4`.


### v13.15-dev6.1.5
Uses a fixed-width visual shell around the native Acquired date control so it matches the other Wishlist-to-Closet fields on iPhone, keeps the date centered, and moves the close X nearer the top-right edge of the handoff panel. Service-worker cache: `audrey-closet-v13.15-dev6.1.5`.


### v13.15-dev6.1.6
Vertically centers the native iOS Acquired date value inside the existing fixed-width rounded date field without changing the acquisition workflow. Service-worker cache: `audrey-closet-v13.15-dev6.1.6`.


### v13.15-dev6.2
Adds a lightweight Wishlist-to-Closet acquisition moment after a successful handoff: Wish granted / Made it to the Closet, item photo, desire hearts, wishlisted/acquired dates, time-wanted context, and View in Closet / Back to Wishlist actions. Preserves the v13.15-dev6.1.6 acquisition form fixes. Service-worker cache: `audrey-closet-v13.15-dev6.2`.

### v13.15-dev6.3
Refines Wishlist entry: Wishlist Brand now shares the Closet brand suggestion pool, Store learns and suggests prior entries, and Product Link is a full-width edit field with a compact clickable domain link in Review mode. Service-worker cache: `audrey-closet-v13.15-dev6.3`.

### v13.15-dev6.4
Lifecycle visual polish: Wishlist row product-link badges are now directly clickable without opening item details, archived Closet pieces use a grayscale/subdued treatment, and Removed Wishlist rows use the same grayscale lifecycle language. Service-worker cache: `audrey-closet-v13.15-dev6.4`.


## v13.15-dev7 — Shopping sessions
- Adds optional Shopping Sessions for grouping Wishlist items from the same trip.
- Sessions store name, date, store, and optional location.
- A session can be marked current; new wishes default to the current session.
- Wishlist items can be assigned or reassigned to a session in Edit mode.
- Existing Wishlist items remain compatible; no IndexedDB schema change.


## v13.15-dev7.0.1
- Fixed service-worker registration/cache version mismatch so Shopping Sessions UI and JavaScript deploy together reliably.

v13.15-dev7.1 cache: `audrey-closet-v13.15-dev7.1`.


### v13.15-dev7.1.1 — Shopping Session entry polish
- Normalized Shopping Session date input width/alignment on iPhone.
- Shopping Session Store now suggests stores previously used in Wishlist items and Shopping Sessions.
- Added a shopping-cart cue to the active Current shopping session banner.


## v13.15-dev8
Wishlist Quick Capture groundwork: item/label/price-tag photo bundle, review-before-apply suggestions, session-aware capture metadata, and future-ready scan/source fields.


## v13.15-dev8.1
Quick Capture polish: locks the background, validates missing item photos, adds currency to scan review, preserves raw/custom size text for future international sizing, improves recognition fallback messaging, and adds optional shopping-session tripId groundwork.

## v13.15-dev8.4
Deploy all files together. Quick Capture camera cancel now restores the active capture session when iOS returns control to the PWA.


## v13.15-dev8.5
- Stabilized the Wish granted / Made it to the Closet layout so photos cannot overlap the message or rating.
- Refined Wishlist title positioning and hierarchy.
- Lowered the Reorder control slightly to separate it from Wishlist creation actions.


## v13.15 — Wishlist & Shopping Improvements

Stable release promoted from v13.15-dev8.5. Includes Wishlist data-model alignment, list redesign, review/edit flow, 1–4 heart desire rating, Top 10 and manual reorder mode, Remove/Restore and Acquired→Closet lifecycle, Shopping Sessions, Quick Capture groundwork, shared brand/store suggestions, product-link improvements, lifecycle visual states, and associated mobile/layout polish. No IndexedDB schema/version change.
