# Continuing Ribbon Closet

This is the same owner-private Site, not a new project.

- Project ID: `appgprj_6adde0d5ab5c8191ad34d828508e6f20`
- Production URL: https://nana-ribbon-closet.divinebud10.chatgpt.site
- Canonical hosting config: `.openai/hosting.json` inside the repository.
- The ZIP's `repository.bundle` contains all Git references and history, application source, prepared static output, catalog metadata and images. It does not contain credentials or the user's iPhone IndexedDB database.

## Preferred continuation

Use the Sites skill. Call get_site with the existing ID, create a current source repository write credential, and open the canonical repository through the supported source helper. Preserve owner-private access and publish edits to that same project.

## Recovering from this ZIP

1. Extract the ZIP in scratch.
2. `git bundle verify repository.bundle`
3. `git clone repository.bundle ribbon-closet`
4. Inspect `.openai/hosting.json` and obtain fresh repository access for that same Site. Do not reuse the local bundle path as the publishing remote or invent a new project.
5. `npm ci`, `npm test`, `npm run build`.
6. Continue via the supported Sites workflow, matching the exact pushed source and archive.

No command execution is required from the user.

## User data

User records live in origin-local IndexedDB `ribbon-closet`, schema 3. Stores are `items`, `best`, and `state`. Never delete or recreate this database for an upgrade. Original `qr` / `qrBytes` are retained, with legacy QR promoted only in-memory to `individualQR` when necessary. `fullQR` links have separate IDs and card lists; full assignment preserves individual QR. `catalogRef` retains the original coordinate even when just one part is wished for. Existing records resolve their source via card ID/name when opened.

`state` contains composer, session, registrationDraft and backupMeta. Manual poses live on item copies within a coordinate or saved best look, not the master item. JSON backup v3 inlines all relative catalog image fields recursively, including source candidates and draft/saved-look images. Restore defaults to keeping current records and never deletes items; explicit overwrite and pose/draft restoration require user-selected options and a confirmation.

The user's JSON export should be retained separately. The development ZIP does not substitute for it.

## PWA

Manifest ID `/` and the production origin must remain stable. The install guide explicitly exports data before adding to Home Screen because WebKit browser and installed-app stores may be separate. The service worker caches only local application assets, catalog assets/metadata, and app-marked HTML. It excludes login/API requests and does not modify IndexedDB during activation. Do not promise offline authentication or device tests that were not performed.

## Validation

`npm test` covers legacy migration and QR preservation, memo filters, separate full/individual QR, partial related registration, backup inclusion/restore planning, layout bounds, doubled footwear, manual gesture math, cross-edition search and atomic duplicate prevention. Browser QA additionally checks single-part wishes, related candidates, selective saving, QR coexistence, memo search, export and continuation. Physical iPhone install, pinch/rotation and arcade scanning still need the actual device.
