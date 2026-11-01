# コーデごとに登録（おためし）— 未公開試作品

基点: integration/background-books-pro-v51 / 53cc90edf4ac8a992a181602e7a8f4ea0a55ddd0。開始時 clean を確認。試作ブランチ prototype/coordinate-registration。本番v51と既存iPhone確認用サイトは更新しない。

## 段階と到達範囲
A: 既存DB ribbon-closet v3（items/best/state）を確認。変更・移行なし。開始前のコードを coordinate-trial-before.bundle に保存。実ユーザーのiPhone内データにはアクセスしておらず、その実データのバックアップ取得はしていない。
B: 登録メニューに独立入口。既存登録フォームは変更せず、戻る操作あり。専用DBの保存済みコーデだけから名前候補を生成。空白正規化・部分一致・重複排除。候補選択後に既存を開く／同名の別コーデを選ぶ。ドラフトと削除済みコーデは名前履歴に含めない。
C: フル画像・個別画像・個別QR・共通QRは任意。名前のみ、フル画像のみ、個別画像のみ、両方、画像なしパーツ、QRのみを保存可能。正式保存ではユーザー入力の名前を必要とする。下書きは未入力も許可。代表画像はフル→個別画像の並び→名前。元Blob/アルファは加工しない。不確実な背景除去なし。
D: 既存itemsのうち出所を保守的に絞った登録だけを検索。catalogRef/referenceOnly/cardIdのあるレコードは今回の候補から除外（手動登録でもcardId付きの場合は候補に出ない制約あり）。公式カタログ配列や初期名前辞書は参照しない。既存IDを参照し、画像・QR・タグ・所持・既存セットを変更しない。追加確認／別コーデ／保留あり。試作コーデ間で参照を移動する場合は確認し、解除はアイテム削除ではない。正式な既存セットの移動・再編は実装しない。複数試作コーデで同じアイテムを参照することを許可し、正式なcoordinateGroupIdとは別管理。試作の個別アイテムも保存後に検索して再利用可能。重複名・カテゴリー競合は警告し、自動削除・自動統合なし。QR内容による候補照合は未実装。
E: コーデ全体と個別新規パーツの所持（未確認/所持/未所持）・お気に入り1〜3・ほしい/特にほしいを独立保持。試作側の保存だけでは正式データを更新しない。新規パーツのみ、専用の確認付きMyクローゼット追加ボタンで正式itemsにaddできる。安定IDとadd-onlyトランザクションで再試行・再操作の重複と既存レコード上書きを防止。参照既存アイテムの状態は読み取りのみ。参照既存アイテムの設定を試作から正式更新する処理は未実装。コーデ全体のフラグを個別パーツへコピーしない。
F: 既存prepareProQR/readQRを再利用。通常QRの復号→再生成→バイト一致確認。失敗した写真は別フィールドに保持し、既存QRを残す。共通QRはコーデに1件だけ保存して参照、個別QRは保持。正式追加時にも個別・共通を分離。ブラウザー内処理のみ。ゲーム機の互換性は未検証。

## 保存と安全性
新DB ribbon-coordinate-trial v1、coordinates と parts。新規アイテム本体とコーデ参照を分離。coordinates.links は source=trial/existing とID、既存セットの参考情報。新規IDは初回に確定し再保存で維持。Blob・QR原写真・デジタルQR・タグ・状態をIndexedDBに保持。保存／参照移動は専用DB内の1トランザクション。シリアライズはトランザクション開始前に検証し、不完全レコードが残らない。削除は試作コーデのみ。既存アイテム削除なし。
通常のRibbon Closetバックアップはこの別DBを含まない。試作DB専用JSONの書き出し・検証付き復元を追加した（詳細はCOORDINATE_TRIAL_BACKUP.md）。この段階では実データでの本運用を想定しない。採用を見送る場合は独立入口・ルート・インポートを外すだけで既存登録に戻せる。DBを消す処理は追加していない。

## 検証
実行成功: npm test / test:pro-recovery / test:review / test:compact / test:colors / test:pro-blocks / test:integration-v51 / test:coordinate-trial / build。
専用テストはfake-indexeddbと実際の新ページイベントを使用。空一覧、候補確認、ユーザー入力だけの履歴、任意画像、原Blob/QR復元、同じIDの更新、既存参照追加・解除、別試作への移動、元データ保護、明示追加と再試行、保存失敗時の入力保持と成功通知の抑止を確認。テスト内容は架空のみ。
開発ブラウザーで入口・空一覧・新規フォーム・名前だけの保存完了を確認。HTTPプレビューでのUUID生成と固定ナビに保存ボタンが重なる問題を修正した。
iPhone操作・大きな写真の容量/メモリ・ゲーム機QR互換性・実ユーザーデータとの手動操作は未検証。広範囲な実機テストはまだ行っていない。

## 復元
段階コミット: 452eb28（独立ストレージ）、98351ab（画面・参照・任意画像）、999bb0e（イベント/復元テスト）、200261f（非同期画面保護・共通QR・特にほしい）、548a7bb（ID生成/フッター対策）。最終コミットはGit履歴を参照。
coordinate-trial-final.bundle は HEAD と試作用タグを含む累積差分で、基点53cc90eが必要。基点を含む以前の統合バックアップは保持する。
1. 統合バックアップまたは既存リポジトリから53cc90eを復元。
2. git bundle verify coordinate-trial-final.bundle
3. git fetch coordinate-trial-final.bundle HEAD:refs/heads/prototype/coordinate-registration
4. git checkout prototype/coordinate-registration
5. git fsck --full
6. npm ci と上記テスト・ビルド。
coordinate-trial-final.patch は53cc90eからの差分。app-src.js全体や既存DBを上書きせず差分で統合する。公開操作はこの手順に含めない。
