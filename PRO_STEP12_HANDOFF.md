# まとめて追加 Pro STEP1/STEP2 改修

Base: d5649696a94245a68782227eebdfb60ff82efc49 (coordinate-items + URL import preserved).
Only independent confirmation Site is deployed; original Ribbon Closet and both extractors/relays untouched.

Changes: STEP1 square durable thumbnail (item mode only), inline related registered-item suggestions with explicit IDs, partial selected-parts display in STEP2, readonly inherited STEP2 name, item/QR modes and automatic/manual unplaced-image classification. QR handling calls existing prepareProQR without changing media.js or pro-qr-input.js. Saved Pro draft snapshots retain thumbnail DataURLs, QR blobs and selected IDs; object URLs recreated on resume.

Changed application files: app-src.js, pro-step1-model.js, pro-step1-panel.js, dist/style.css, generated dist/app.js. Tests: scripts/pro-request.test.mjs, package.json test:pro-step12.

Validation: npm test; npm run test:pro-step12; npm run build. Browser UI checked thumbnail upload, mode lock, QR presence classification, QR assignment, image survival, suggestions/explicit selection, STEP2 readonly inherited name. IndexedDB close/reopen tested for thumbnail, QR pool, selected parts and unchanged existing records.

Limitations inherited from baseline: Pro final bulk registration remains unimplemented; later steps offer existing deferred-list saving. Physical iPhone Safari not available in development environment. Older tests that assume STEP2 name entry need migration before their old entry points are usable; they were not used to claim validation of the new STEP2 flow. No server migration resumed. Test records exist only on internal local preview, never in deployed source.
