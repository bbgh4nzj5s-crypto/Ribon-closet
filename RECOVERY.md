# Recovery checkpoint
Base: v46 / 6ed53b531d1b8c0295b7dbc66c28e0bc7673d68f
Branch: recovery/pro-unpublished. No publishing authorized.
Checked: local branches/tags, reflog, stash, unreachable objects, worktrees; /workspace and /tmp matching backup/archive/pro files. No post-v46 source recovered. Provider snapshots not accessible/checked.
Stage 1 protected base. Stage 2 rebuild common existing-parts logic. Stage 3 STEP 1 present in v46; rerun existing tests.
Remaining: STEP 2 explicit set picker, category merged display, draft-only settings; STEP 3 QR/tag UI; QR deferred resume events; all three outstanding event integration tests.
Requirements: preserve name whitespace comparison, exact different-name distinction, explicit unlinked selection, separate set identities. Image IDs own settings. Row owns shared QR, individual QR retained. No final Pro registration.

Dependency recovery: npm ci --ignore-scripts succeeded using the unchanged lockfile. v46 Pro events, 24/25 limit events, STEP 1 events, 24-image persistence, existing-parts tests, build and full npm test all passed on 2026-10-28.
QR state recovery checkpoint da66dd2 adds tested individual-vs-row shared QR state only. STEP 3 UI and deferred QR event integration are still not reconstructed.

## Pro STEP 2 restoration checkpoint (2026-10-28)
- Restored variant action, explicit grouped part picker (including unlinked IDs and new-set choice).
- Merged selected registered parts with new images in category order; registered overlay/opacity and category/dress conflict warnings.
- Existing settings are detached per-row copies; no item writes. Set switch, name change and variant selection discard obsolete staged links.
- Actual production handlers tested in scripts/pro-existing-events.test.mjs, including back to STEP 1, cell move and forward to STEP 2.
- Existing pro-events persistence/list/resume tests retained and adapted to the added production dependencies; all Pro tests, common helper tests, npm test and build pass.
- Browser/iPhone geometry and taps remain unverified. STEP 3 UI and final registration deliberately remain out of scope. No deployment.
- Checkpoint bundles are incremental against the preserved full checkpoint2 bundle; retain the full base and all deltas.

## Pro STEP 2 database and STEP 3 recovery (2026-10-28)
- STEP 2 real selection/settings/save handlers -> IndexedDB close/reopen -> name filter/list open -> restored staged registered ID/set/settings -> same-ID update: PASS.
- The first checkpoint test exposed order-sensitive assertions (IndexedDB returns keys in order). Corrected the assertion to compare by ID; verified checkpoint is 528d537, not the earlier in-progress fe43db1.
- STEP 3 screen restored using existing attrUI/bindAttrs and QR helper. Individual blobs stay on image IDs, shared QR blob exists once per row, active state is row-local. Registered parts are read-only and never enter new-image inputs.
- STEP 3 real input/full toggle/defer handlers -> IndexedDB reopen -> QR filter/list open -> STEP 3 restored -> same-ID update: PASS. Original image and QR Blob text verified, along with tags, memo, selected registered ID and staged settings.
- Real 3 -> 2 -> 1 -> cell move -> 2 -> 3 handlers: PASS. QR/tags/settings remain with the image. Registered deselection removes it from STEP 3; source database remains unchanged.
- npm test (all 22 existing test scripts), all existing Pro tests, existing-parts/pro-qr-state tests, and npm run build: PASS.
- Automated coverage uses actual production event handlers with a DOM test harness and fake-indexeddb. No iPhone/browser visual or capacity validation is claimed.
- No deployment or final registration. v46 main/tag unchanged. Existing user data never opened or modified; tests use isolated synthetic IndexedDB.

## Screen-preview publication readiness
- Release branch: release/pro-preview-47; recovery branch retained at 6593749.
- Compared with v46: core.js, IndexedDB version/store/index definitions, deferred-drafts.js and package-lock.json unchanged. No data migration or automatic item write added.
- Pro STEP 1-3 only changes its in-memory state and explicit deferred state records. Pro has no final-registration button or handler. Normal registration/catalog routes retained.
- All three Pro screens display the preview-only notice. Static asset/service-worker identifiers updated for PWA refresh; no IndexedDB/localStorage clearing.
- Immediately before packaging: npm run build, npm test, npm run test:pro-recovery passed.
- Actual iPhone data, capacity and UI are not accessed by the automated test environment.

## Pro mobile preview update
- STEP 2: registered candidates are displayed alongside new images, without visible internal identifiers. Safe single identified set defaults ON; multiple sets and unlinked candidates remain unconfirmed. OFF keeps the image visible and removes its ID (and an empty set reference) from staged links. Switching sets discards the previous selection.
- Registered-part closet/favorite controls were intentionally replaced by the same-coordinate checkbox. New-image controls remain. Long press calls existing itemDetail using the actual item ID; movement cancels the hold.
- STEP 3: square QR selector, compact defer/tag actions, collapsible existing attribute UI, per-image wishState/wanted/manual flag. Verified QR additions turn off only automatic wishes; manual choices take precedence. Shared QR/photo/bytes are stored once per row; individual QR/photo/bytes once per image.
- Digitalization delegates to unchanged media.readQR, then stores its byte-validated generated PNG and original photograph. No fallback to an unverified QR. Numeric/alphanumeric/byte segments supported by the existing pipeline; Kanji/ECI/other chunks are rejected, as are unreadable images or byte mismatches.
- Tests use actual production handlers with a DOM adapter and isolated fake-indexeddb. Digitalization tests use real jsQR/qrcode plus a pixel canvas adapter, text and binary QR fixtures, Kanji rejection, unreadable rejection, event failure retention and persistent originals. Not an actual iPhone/camera test.
- npm test, npm run test:pro-recovery and build passed. STEP 3 full/individual separation, saved QR search/resume, step navigation and existing data non-mutation remain covered.
- core.js, media.js, membership.js, deferred-drafts.js and package-lock.json remain unchanged. No IndexedDB migration, catalog-route change or Pro final registration.
- Checkpoints: 25226f5 (image matching UI), c39e09c (QR/wish/tag UI and real digitalization tests). Incremental backups retained; final cumulative backup is based on published a439c35, whose full bundle is retained.

## Shared detail editing and final missing-information review
- Existing itemDetail view and classes are retained. Its edit action opens the editor in the same modal, with clone/cancel, direct image/verified QR inputs, existing attributes/favorites, save failure retention and origin refresh. Registered item IDs are updated in place. Catalog reference registration remains a separate unchanged route.
- Pro references pass a staged save context (including related detail navigation); new Pro items pass a temporary save context. Neither writes items. Blank placeholders carry stable IDs/cells/categories; only actual photo blobs count toward 24. Placeholder labels never populate row.name.
- Per-item defer buttons in STEP 2/3 are removed. Pro STEP 3 leads to preview-only final review; missing name/image/effective QR fields default to opted-in flags, and opt-out never removes an item. Shared popup editing recomputes missing fields. Final Pro registration remains disabled.
- Normal individual/bulk forms allow incomplete information to reach review. Bulk has an explicit image-less add control. Final normal registration atomically writes items, a retry marker and opted-in missing-field draft state. Resuming completed-item drafts retains IDs and starts a new save session. Legacy optional deferred flags are retained; existing stores/schema are unchanged.
- Read-only reconciliation updates completed-item draft search/view from the current saved IDs without rewriting or deleting old draft records. Catalog dedicated registration skips the new normal review path.
- test:review covers shared popup entry from closet/wanted/items, cancel, failure/retry, same-ID saving, media inputs, real QR regeneration, Pro staging, missing review opt-out, image-less persistence/search/reopen, 24-photo popup guard, atomic normal save/retry/rollback and current-item reconciliation.
- Existing test suite and test:pro-recovery pass. DOM adapters and fake-indexeddb are used; actual QR decoding/encoding uses jsQR/qrcode with a pixel-canvas adapter. Native iPhone appearance/scroll/keyboard remains unverified.
- No automatic database migration, item deletion, site-data clearing, reinstall, or Pro final-registration implementation. Prior full bundles and all recovery checkpoints retained.
- Checkpoints: e82c64f (shared dialog), e1d007c (Pro and media/state), 790122f (review/atomic normal saves), 6a8aeed (events), 9a5f9fd (draft compatibility). Release commit additionally includes final normal full-QR wish defaults and static cache identifiers.

## Set-level / compact QR preview
- Registered candidates are grouped by existing identity and displayed to the right of new images. Yes/no applies to all IDs in that group; choosing a different identified group clears the prior group. Unlinked/ambiguous candidates require confirmation. Legacy partial selection is not silently expanded to an entire set. No internal identifiers are shown.
- STEP 3 names appear once per Pro row; new parts remain in category order. Photo/QR previews are 52px (previously up to 104px). Existing selected parts preview shared QR as an uncommitted plan, using the row Blob reference, without updating saved records.
- Enabling full QR can promote an existing individual QR by reference. Replacing a retained shared QR asks for confirmation. Disabling shared QR restores individual QR display and recalculates only automatic wishes. Manual wish choices take precedence.
- QR X disables the row-wide shared application after confirmation, or clears only an individual QR. Popup removals stay local until Done; saved shared QR removal uses the explicit shared QR ID and one item transaction. An unidentifiable legacy shared scope is blocked rather than inferred from a name. My Closet QR X now opens QR-only editing instead of removing the outfit part/image.
- Background Left/Right X edits the existing background draft independently; failed saves/cancel retain original backgrounds. The common qr-unpick style is reused for media X controls.
- Tag settings use a clone in the existing modal with Done/cancel and scroll restoration. Existing attrUI/bindAttrs and QR decode/regenerate pipeline are reused.
- Final missing review uses a five-column compact row: category/photo, QR/icon, missing text, Edit, right-aligned defer checkbox. Item-level choice and optional per-field choices are persisted in both Pro and normal drafts.
- npm test, test:pro-recovery, test:review and test:compact passed against production event handlers, isolated IndexedDB and pixel-canvas QR adapters. Native iPhone sizing/taps remain unverified.
- core.js, media.js, inventory.js, deferred-drafts.js and package-lock.json unchanged; no destructive migration or Pro final registration. Catalog-specific registration remains unchanged. Prior full backups and recovery refs retained.
- Development checkpoints: 4590454 (set groups), 9e96191 (QR/media/tag/compact UI), 97956a4 (field-level review and event verification).
