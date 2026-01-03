## Markdown Image Uploader

Markdown編集中に **画像ファイルのパス** を貼り付けたときだけ、Firebase Storageへアップロードして **公開URLを `![]()` 形式で挿入**するローカル拡張です（マーケット配布不要）。

### できること

- クリップボードが「画像ファイルパス（例: `/home/me/a.png` や `file:///.../a.png`）」のとき
  - `（編集中のmdファイル名）/(short uuid).拡張子` へアップロード
  - `![alt](https://...downloadURL...)` を貼り付け
- 画像パスでない場合は通常のペーストにフォールバック

### 対応OS / ショートカット

- **macOS**: `Cmd+V`
- **Windows / Linux**: `Ctrl+V`

> 注意: この拡張が扱えるのは「クリップボードが **画像ファイルのパス文字列**」のケースです。
> Macの場合は `Cmd+C` でファイルパスを取得できますが、Windows / Linuxの場合、ファイルの絶対パスを手動でコピーする必要があります。

### OSごとの「画像ファイルパス」をコピーする方法（例）

- **macOS (Finder)**:
  - 画像ファイルをFinderで `Cmd+C`
  - またはFinderで画像を選択 → メニュー `編集` で `Option` を押すと `パス名をコピー`（= `Option+Cmd+C`）が出るので、それを使う
- **Windows (Explorer)**:
  - 画像を `Shift+右クリック` → **Copy as path**（引用符付き `"C:\...\a.png"` になることが多いですが、この拡張は対応しています）

### Firebase Storageの保存パス仕様

`ファイル名.md` を編集中に画像を貼り付けると、Storage上のパスは:

- `blog-images/ファイル名/<shortuuid>.png`
- `blog-images/ファイル名/<shortuuid>.jpg`

のようになります。

### 設定（settings.json）

Cursorの `settings.json` に以下を追加してください。

```jsonc
{
  "markdownImageUploader.overridePasteInMarkdown": true,

  "markdownImageUploader.firebaseApiKey": "xxxx",
  "markdownImageUploader.firebaseAuthDomain": "your-project.firebaseapp.com",
  "markdownImageUploader.firebaseProjectId": "your-project",
  "markdownImageUploader.firebaseStorageBucket": "your-project.appspot.com",
  "markdownImageUploader.firebaseAppId": "1:xxx:web:yyy",

  // どちらか（おすすめは email/password）
  "markdownImageUploader.authEmail": "you@example.com",
  "markdownImageUploader.authPassword": "your-password",

  // email/password 未設定のとき匿名ログインを試す
  "markdownImageUploader.useAnonymousAuth": true,
  "markdownImageUploader.uploadRootFolder": "blog-images"
}
```

> 注意: APIキーだけではStorageへアップロードできないケースがあります（StorageルールとAuth設定次第）。
> 自分用なら「メール/パスワードでサインイン」運用が安定です。

### ビルド & VSIX作成（ローカル配布）

この拡張フォルダで実行:

```bash
cd cursor-extensions/markdown-image-uploader
npm i
npm run compile
npm run package
```

`markdown-image-uploader-0.1.0.vsix` が生成されるので、Cursor側で **Install from VSIX** して使えます。

### トラブルシュート（動かない / ログが出ない）

- **まずコマンドを直接実行**:
  - コマンドパレットで `Markdown: Paste Image (Upload to Firebase Storage)` を実行して動作するか確認してください（キーバインド問題の切り分けになります）。
- **ログを見る**:
  - コマンドパレットで `Markdown Image Uploader: Open Logs` → Output/Log の `Markdown Image Uploader` を開けます。
  - `settings.json` で `"markdownImageUploader.debug": true` にすると、フォールバック理由（クリップボードが画像パス文字列でない等）が出ます。
- **重要**:
  - この拡張は **画像データ（スクショ等）そのもの** の貼り付けは扱えません。対象は **画像ファイルのパス文字列** をコピーして貼り付けた場合のみです。


