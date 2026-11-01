# Pro STEP 1 blocks (development only)

Base: published v51, b346bea37a2028c6285c807b19dae3f3406aa042.
Branch: feature/pro-step1-blocks-v51. Do not deploy without explicit user approval.

## Scope
- STEP 1: ten coordinate blocks, each with editable name/pencil and five square category cells.
- Uses existing icon(cat), cells[row:column], image IDs and row.name. Name changes invalidate stale existing-set selections using the existing whitespace comparison rule.
- One horizontal unassigned strip, transparent image rendering, scoped white gradient behind images, safe-area padding.
- Pointer/touch long-hold drag delegates to the same production cell onclick handler as tap placement. Fast movement before hold cancels drag so native scrolling can proceed. Cancel/outside drop never removes images. Global gesture listeners are cleaned on redraw and navigation.
- No background pixel removal: alpha is preserved; opaque original photos remain intact to protect white garments/lace/ribbons.
- No database/schema/draft format changes. No final registration enabled. No published version, service worker or index marker change.

## Files / merge guidance
Production changes are app-src.js (STEP 1 rendering/binding, name invalidation, gesture cleanup on render), pro-drag.js (new), and a final scoped block in dist/style.css. dist/app.js is generated: rebuild after merging rather than copying a whole bundle over another developer's changes. package.json adds test:pro-blocks; scripts add block/drag event tests and import the production drag module into existing VM harnesses. Do not replace the whole app-src.js/style.css when merging the separate closet/background/codebook work; cherry-pick/review hunks against v51 and rebuild.

## Verification
Executed against current code: npm test; test:pro-recovery; test:review; test:compact; test:colors; test:pro-blocks; build.
New tests: production name input handlers, 10 blocks/50 cells, placeholder not persisted, bidirectional name sync, stale-link clearing, drag-to-cell callback using real cell handler, original Blob/selected colors/note retention, actual deferred save/DB reopen; production pointer/touch controller hold/drop/outside/cancel/scroll/cleanup/synthetic-click suppression.
Existing tests retain tap/swap/double-tap/removal, dress exclusion, 24/25 limit, QR sharing, persisted draft resume and colors.
Cloud browser preview: observed ten blocks, existing category icons, five square cells (about 80.8px on the available ~480px-wide preview), and STEP 1 name reflected in STEP 2. Not an iPhone emulation or real device test.
Unverified: real iPhone touch/scroll/long-press conflicts, software keyboard and rotation behavior, 320–430px visual fit. CSS uses repeat(5,minmax(0,1fr)), aspect-ratio:1 and visualViewport resize handling; these are implementation provisions, not real-device guarantees.

## Backups
Original v51 and earlier recovery backups are retained. Development bundles are cumulative relative to b346bea and must be applied to that base; they are not standalone full clones. Save each checkpoint separately, retrieve the final bundle, verify it, then fetch it into a new shallow v51 checkout and run git fsck. Published site remains unchanged.
