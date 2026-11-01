# Background / coordinate-book integration — unpublished

Verified source chain: v51 b346bea37a2028c6285c807b19dae3f3406aa042 is an ancestor of the starting Pro STEP 1 head 6910eec3f8d2e2b3a1720a68d1e6587dcc307a9e. Working tree was clean. No v50 replacement source was used.

Input: ribbon-coordinate-book-handoff.zip, whose Git bundle includes background commit de8e953b4f9291afb6df8b4f124db58fe806e645 and coordinate-book commit fc3d333ee1952ab656a57c7cdedd16a33e6ab6b1. Imported original history into refs/remotes/handoff/background-books.

Dedicated branch: integration/background-books-pro-v51.
- e459e4f: apply background commit source diff using three-way merge. app-src.js merged cleanly. CSS append conflict resolved by retaining BOTH v51 color/Pro blocks styles and incoming best-background switch styles.
- d61f519: apply coordinate-book source diff using three-way merge; clean app merge. Internal folderIds / organization.folders / data-folder identifiers preserved.
- dist/app.js was excluded from incoming patches and rebuilt from the integrated source.

Before integration, saved pre-background-book-integration.bundle (cumulative relative to v50 6a9ac3f; includes v51 + Pro blocks). Earlier backups remain unchanged. Final cumulative backup also preserves the two original source commits as a separate handoff ref. Restore requires the unchanged v50 base commit (available in the retained source history / prior backups); this is not a standalone full repository bundle.

Validation: npm test; test:pro-recovery; test:review; test:compact; test:colors; test:pro-blocks; test:integration-v51; npm run build. All succeeded. Dedicated background model: 10 assertions; coordinate-book labels and storage compatibility: 10 checks. Preservation test compares entire Pro STEP 1/3, color picker/controller, QR/draft/core/editor implementation with the pre-merge head, and checks that publication markers/service worker are unchanged.

No DB/schema migration, user data initialization, publish, remote main update or Pro final-registration activation. Real iPhone background rendering / interactions remain unverified in this integration run.
