# Smart Scan v13.24 — Phase 1 Baseline

Branch: `dev/smart-scan-color-pattern-v13.24`
Baseline production commit: `2791575a227ce4c6828def0bb287c8094ae53b6a`

## Phase 1 objective

Freeze and measure the existing Smart Scan color/pattern behavior before changing classification logic.

Phase 1 deliberately does **not** replace or modify `analyzeImage()`.

## Baseline harness

`smart-scan-baseline-v13.24-phase1.js` exposes:

- `AUDREY_SMART_SCAN_PHASE1.cases()` — list synthetic regression cases.
- `AUDREY_SMART_SCAN_PHASE1.runSyntheticSuite()` — run the current production `analyzeImage()` against the synthetic baseline set and print a comparison table.
- `AUDREY_SMART_SCAN_PHASE1.runDataURL(dataURL, meta)` — record current Smart Scan output for a supplied test image.
- `AUDREY_SMART_SCAN_PHASE1.runCurrentItem()` — record current Smart Scan output for the photo currently shown in the item editor.
- `AUDREY_SMART_SCAN_PHASE1.lastSynthetic()` — retrieve the most recent synthetic report from session storage.

The harness stores only diagnostic output in `sessionStorage`; it does not alter Audrey Closet saved data.

## Synthetic baseline cases

Color boundary cases:
- Solid White
- Solid Black
- Solid Navy
- Solid Orange
- Solid Red
- Solid Green

Pattern cases:
- Green / White Stripe
- Navy / White Stripe
- Red / Navy Plaid
- Blue / White Colorblock
- White Tee + Dark Graphic
- Green / Pink Distributed Print

These cases intentionally include examples the current algorithm is expected to classify incorrectly. They establish a measurable baseline for Phase 2+.

## Real-photo test set

During Preview testing, collect representative existing closet photos in pairs where possible:

1. original image before Photo Studio isolation
2. edited/cutout image after Photo Studio isolation

Target examples:
- solid white
- solid black
- navy / dark blue-gray
- orange
- red
- green/white stripe
- plaid/check
- graphic tee
- floral/print
- colorblock

Record expected human labels along with current Smart Scan output. No user photos are committed to the repository in Phase 1.

## Phase 1 exit criteria

- Branch is isolated from `main`.
- Existing Smart Scan behavior is unchanged.
- Synthetic test suite can run against current `analyzeImage()`.
- Current-item and arbitrary-image baseline capture are available.
- Preview deploys successfully from the Smart Scan branch.
- We have a repeatable baseline to compare with Phase 2 pixel-sampling changes.
