# Ribbon Closet

Private, iPhone-oriented wardrobe and QR web app. Published Site identity remains in `.openai/hosting.json`.

## Build and verification

- `npm ci`
- `npm test`: IndexedDB v1 migration, independent styling state, dress exclusion, multiple filters, card uniqueness, atomic writes, wishlist acquisition, immutable best snapshots.
- `npm run build`: bundles source and locally installed jsQR / qrcode into `dist/app.js`.
- `scripts/catalog.py test`: verifies the first OA4 outfit using explicit official HTML `data-termN`, `data-idN`, `data-imgN` attributes. No URL guessing or cropping.
- `scripts/all-catalog.py`: imports the 16 configured editions using the same HTML mapping, caches assets outside the preview directory, emits JSON under `/tmp/ribbon-catalog`. Copy finalized files/assets into `dist/catalog` in one operation. Future editions can be added to `eds` and the generated `index.json` structure.

## Data

IndexedDB `ribbon-closet` schema 3 retains original `items` records and adds `best` and `state`. Old single color/genre values normalize into the new arrays at read time. The cardId index is unique. Batch writes are atomic. Best looks contain copies of selected records and their QR data. New catalog registrations localize the selected part images to data URLs, so exported backups include those images. The database remains browser/device-local; no cloud sync. Backups include all items, best looks, and composer state; legacy version 1 JSON remains readable.

## QR and image output

User-supplied QR photos are decoded with jsQR and encoded using the original supported numeric, alphanumeric or byte segments. Generated QR data is decoded again and compared as byte arrays. Unsupported segment/ECI/Kanji formats fail without saving a changed QR. Machine-specific compatibility still requires a test at the actual arcade machine.

Canvas outputs PNG of selected images and names, optionally with QR codes; pair mode composites both looks. Native iPhone share sheet can save the PNG to Photos; download and long-press are fallbacks. Browser tests checked a full-code QR applied to OA4-001/002/003; all three QR regions in the exported PNG decoded to the original test payload.

## Official catalog sources and use conditions

- https://aipri.jp/verse/item/oa4.html
- https://aipri.jp/verse/policy/
- https://www.takaratomy-arts.co.jp/sitepolicy.html

Images and characters remain the property of T-ARTS and their respective rights holders. The app remains owner-private and noncommercial. It does not hotlink official images; locally bundled copies support the requested personal catalog. No general redistribution license or endorsement is asserted. Do not change the Site audience or distribute the assets without reviewing the relevant rights and obtaining any required permission. Access controls were not bypassed. Sources are public HTML and the explicit image URLs used by the official detail modal.

## Test example

スマイルハートバズリウムピンク:
- ワンピース OA4-001 → `img/oa4/Item_ID33519.webp`
- シューズ OA4-002 → `img/oa4/Item_ID33520.webp`
- アクセ OA4-003 → `img/oa4/Item_ID33521.webp`

Total image `OA4-001.webp` is stored separately and never used as an individual part image.

## Catalog verification result

16 editions, 1,073 catalog entries, 3,681 part records, and 5,770 verified local image assets. All part records have separate images; no total-image fallback was used. `catalog-validation.json` records the checks.

## v3 interaction and layout improvements

- `layout.js` computes alpha bounds and conservative outer-white-margin bounds, category anchors and optional per-coordinate poses. Scene geometry is shared by DOM layers, PNG exports, and saved-look thumbnails/details. Automatic layout never mirrors images; manual transforms include translation, scaling, rotation, mirroring and stacking. Drawing is clipped consistently to the scene rectangle. Opaque images with an almost-white outer border use a tightly cropped display copy with a small safety margin; original colors, alpha and saved image bytes are unchanged.
- Manual `pose` belongs to each selected item copy in the composer and saved look, not the master wardrobe item. Existing IndexedDB schema 3, item images, QR fields and look records remain unchanged. Older looks without pose use standard anchors. Backup import/export already preserves these additional fields.
- Wardrobe uses square 3-column cards and a bounded, independently scrolling region with scroll chaining disabled. Categories retain their scroll offsets. Selecting an item updates the scene without replacing the grid. Long press (or context menu / Shift+F10) opens details, editing and confirmed deletion.
- Catalog supports cross-edition name and card-ID search, edition labels, history-aware back navigation, retained query/position, and multi-select wishlist registration. Deduplication happens before an atomic write and the database card-ID index remains unique. Adding to wishlist leaves the user on the same list.
- Node tests cover transparent bounds, small overlaps between category anchors, pose serialization, shared clipped export drawing, cross-edition search and bulk duplicate prevention in addition to the original migration/data tests.

iPhone-specific touch gesture and arcade-machine verification still require the actual device; browser QA does not establish those results.

## v4 persistence and inventory updates

Read START_HERE.txt for the user workflow and DEVELOPER_RESTORE.md for recovery. Footwear base width/height doubled; scene height increased to 1300 to keep standard poses in-frame. New inventory metadata retains source-coordinate candidates and independent full/individual QR. Individual QR remains the default when both exist. Wishes can be toggled per card, while whole-coordinate and multi-select wishlist actions remain available. Related registration only writes checked parts and preserves other existing records.

PWA manifest, icons, same-origin static service worker, previous-session continuation and registration draft auto-save are included. iOS Home Screen installation itself requires the user's action. Backups are explicitly prepared before the download/share button, inline images and preserve existing records by default. Development recovery uses a Git bundle ZIP plus the user's separate data JSON.


## v5: 登録と整理（2026-10-26）
- ほしい物: カテゴリー＋部分一致名検索＋追加日時/日本語名の昇降順。旧データの日時は既存の更新日時を代用。
- カスタムタグ: 4属性の追加・名称変更・確認付き削除。カラーは色選択可。標準タグは保持。名称変更・削除はitems/best/stateの同一トランザクションで更新。
- ベストフォルダ: state.organizationにID/名称を保持し、best.folderIdsで多対多分類。削除時は分類のみ解除。複数選択ORと「全て」。
- 名前予測: 既存の全弾カタログを使用。名称選択と、確認付き未設定画像補完を分離。QR/既存画像は置換しない。
- Undo/Redo: 最大60変更。アイテム選択解除・ワンピ切替・配置調整。ドラッグ/スライダー操作単位で記録。履歴は使用中のみ、現在コーデの自動保存は継続。
- organizationを既存JSONバックアップのstateに含め、復元時は現状優先のマージ。IndexedDBは既存schema3を維持。
- テスト: npm test、npm run build。ブラウザで候補補完→3パーツ登録、タグ追加/名称変更/メモと複合検索、ベスト2フォルダOR、ほしい物複合検索、選択/配置Undoを確認。実機iPhone未検証。


## v5.1: 名称候補・画像反映の修正（2026-10-26）
原因: v5では名前選択が名称のみを更新し、画像補完は同カテゴリの入力が既に存在するとカードIDを確認せずスキップした。そのため旧画像と新名称が混在し、編集元の内部IDまで引き継ぐ可能性があった。名称部分一致による重複判定は存在しなかった。
修正: catalog-import.jsで検索と識別を分離。候補はゲーム＋弾＋コーデIDで再解決、重複は正規化カードIDで判定。候補のタップは正確な全パーツから新しい登録下書きを生成し、旧内部ID・QR・カテゴリ画像を別コーデへ引き継がない。途中入力の切替は確認、名前だけの操作は別ボタン。既存のカードは元レコードをコピーして未選択表示し、詳細・編集ボタンを用意。画像読込失敗は明示、代用品なし。全て同じ処理をカタログ登録と名前候補から使用。IndexedDBのスキーマや既存記録は変更・削除しない。
回帰テストA–E: 実データのoa4-25（OA4-119/120/121）とoa4-32（OAF4-005-1/2/3）で再現、正しい画像、既存画像/QR/メモ/ベスト/ほしいの保存前後同一を検証。他の似た名称56組・本当の重複・画像なしもテスト。画面から旧アクセ編集→ときめき検索→切替確認→3画像表示→新規保存→既存アクセ画像/メモ保持まで確認。実機iPhoneは未検証。

## v7: 個別複数登録・独立保存先・並び順（2026-10-26）
- 同じ内部IDにinCloset/wanted/wishPriorityを持たせ、QR登録後も欲しい状態を維持。旧statusは非破壊の読み込み互換変換。
- 通常/欲しいの登録入口は共通画面。まとめて登録は共通属性初期オン（解除可能、既存データ更新は確認）。個別登録は最大6行、同カテゴリー複数可、各行別名/画像/タグ/メモ/保存先。カタログ候補は正確なIDから1パーツ選択。QRは行ごとまたは共有フルQRを区別して保存。下書きに全行を保存。
- ペア終了は選択中の側をslot0へ引継ぎ。反対側もslot1へ保持し、再びペアを開ける。pose/QRと履歴を維持。
- クローゼットと欲しい物の共通itemOrder、ベスト専用bestOrderをorganizationに保存。⠿専用モードで画像を直接ドラッグ。通常の長押し詳細を維持するためタッチスクロールと分離。端スクロール、浮遊画像、移動先表示。非表示アイテムのスロットを維持し、見えている項目だけ入替。新規は末尾、削除は整理。バックアップのstate.organizationに含めて復元。
- 詳細で即QR・関連パーツ・慎重な同カテゴリー色違いを表示。公式ID優先、手動は完全名または明示グループ。参照のみで自動保存しない。シューズ標準80%、旧手動poseは元サイズを維持。
- QA: 別名・別属性の同カテゴリー2点を欲しい入口から保存、保存先を片方のみ/両方で確認。欲しい物とクローゼットの実ドラッグ順序を共通化し、再読込確認。右選択のペア終了、ベスト2件の実ドラッグ/再読込確認。テストはnpm test。
- 実機iPhoneのマルチタッチ・小画面の最終操作感は未検証。ブラウザのポインター操作とタッチ用touch-action/CSSで確認。

## v8 — ドラッグの破棄処理・欲しい状態
- Reorder mode keeps ordinary long-press details in normal mode. Hold for 260ms, move 7px. A root-owned pointer capture survives moving a grid child. Floating image is never the saved card; pointer release removes it and normal CSS grid places the real card. Gap/outside-grid drops use nearest cell.
- A single session/disposer owns capture, body ghost, placeholder, RAF, timers, observers and global listeners. Cancel/lost capture/Escape/blur/background/pagehide/out-of-viewport revert to initial visible order. Detached grids dispose; explicit page/modal/category redraws cancel first. Async save never redirects a later screen.
- Wishlist drag button only exists for Original without automatic priority overlay. Other sorting preserves original rank. Closet and best continue using independent original rank arrays; filters leave hidden slots alone.
- `wishState` 0/1/2 drives the cyclic UI. Legacy wanted/wishPriority remain synchronized compatibility mirrors for old backups/filter code, never independent UI controls. Old data migrates on normalization; no record deletion. Closet removal asks confirmation and changes only membership.
- Non-accessory closet images use existing visible-bounds PNG rendering to remove blank image margins without touching source/alpha; accessory unchanged. Best-only thumbnails crop empty scene margins, PNG export and saved poses unchanged.
- Automated regression: `scripts/drag-sort.test.mjs` tests valid/outside snap, cancellation, lost capture, detached page, blur, visibility/pagehide, ghost/capture/listener/RAF cleanup. Existing migration/QR/backup/folder/exact-card tests and new wish cycle/removal tests pass.
- Browser QA uses a local isolated fixture (six items/two bests), not user's phone records. Native pointer drags passed in wishlist/closet/best; no ghost after release, auto-sort hides control, pair-right retained, 3-state wish and remove/re-add confirmed. Physical iPhone is not available in this environment.

## v9 — Best outfit detail and folders
- Best detail lays out one preview beside a 2×2 QR grid, or two previews above two independent QR grids for pairs. QR labels are outside the image and its quiet zone. Per-side selection chooses the correct QR even if the same item appears on both sides. On screens narrower than 351px, use a vertically scrolling layout to preserve QR/preview sizes.
- Folder creation/rename uses a separate, keyboard-friendly dialog with a 16px input, preserving the parent save form and existing selections. Creation selects the new folder immediately; renaming preserves IDs and memberships.
- Best saves always generate a new ID, including after editing an existing look; old snapshots are unchanged. Folder membership editing and deletion remain available independently.
- QA with isolated fixture: 4 QR and pair 8 QR, correct expanded QR; 393×852 and 375×667 viewports show every QR initially, with 160px previews, 85.5px single QR images at 393px and 76px pair QR images at 375px. At 320×568, previews are 160px and QRs 100px with scrolling. Existing 375px pair previews/QR were measured ~100px/75px. Create and rename folder, multi-membership and post-edit save-as-new tested through UI; automated existing regression suite passed. Physical iPhone keyboard/camera/reader not available for testing.
