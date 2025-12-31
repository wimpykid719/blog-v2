# DevSpot Blog (Next.js)

[English](./README.en.md) | [日本語](./README.md)

# DevSpot Blog（Next.js）

[English](./README.en.md) | **日本語**

> 💡 **個人クリエイターにおすすめ！**
> このブログは**誰でも簡単にデプロイできて、無料で運用できる**個人クリエイター向けのブログテンプレートです。Vercelへのデプロイが簡単で、コストゼロで始められます。

## 概要

Next.js（App Router）で作ったブログです。記事はMarkdownから生成され、**記事一覧**・**記事詳細**・**RSS**・**サイトマップ**・**OG画像**などを備えています。

## 主な機能

- **Markdown記事配信**: `content/articles/*.md`（ローカル）から記事を生成
- **GitHub記事ソース（任意）**: 環境変数 `GITHUB_REPOS` を設定すると、GitHubリポジトリ上の `articles/` 配下Markdownも読み込み可能
- **記事一覧 + ページネーション**: `/articles?page=2` のようにページング
- **SEO対応**: canonical/OG/Twitter Card、`robots.txt`、`sitemap.xml`
- **RSSフィード**: `/rss.xml`（最大50件、カテゴリ出力）
- **コードハイライト/数式**: highlight.js / KaTeX 対応
- **Google Analytics（任意）**: GA4測定IDを設定するとPV計測

## ページ / ルーティング

- **ホーム**: `/`
- **記事一覧**: `/articles`（`?page=` 対応）
- **記事詳細**: `/articles/[slug]`
- **RSS**: `/rss.xml`
- **サイトマップ**: `/sitemap.xml`
- **robots**: `/robots.txt`
- **OG画像**: `/opengraph-image`（OG/Twitter用）

## 記事の追加・更新（ローカルMarkdown）

1. `content/articles/` に `my-article.md` を追加
2. front matter を設定（必須項目あり）

例:

```md
---
title: "記事タイトル"
emoji: "📝"
type: "tech" # "tech" | "idea"
topics: ["Next.js", "TypeScript"]
published: true
date: "2025.12.31" # 例: YYYY.MM.DD / YYYY-MM-DD / YYYY/MM/DD
# qiitaId: "xxxxxxxxxxxxxxxxxxxx" # 任意
---

# 見出し

本文...
```

### `slug` と `qiitaId` について（重要）

- **通常**: `content/articles/my-article.md` → slug は `my-article`
- **`qiitaId` を指定**: slug は `qiitaId` に置き換わります（URLが `/articles/<qiitaId>` になります）
- canonical URL は、設定に応じて **Qiita/Zenn（原本）を優先**します（後述）

## 記事の追加・更新（GitHubリポジトリから読み込む：任意）

`GITHUB_REPOS` を設定すると、ローカルではなく **GitHubのContents API** から記事一覧/本文を取得します。

- `GITHUB_REPOS`: 例 `["owner/repo-a","owner/repo-b"]` または `owner/repo-a,owner/repo-b`
- `GITHUB_BLOG_PATH`: 記事ディレクトリ（デフォルト `articles`）
- `GITHUB_TOKEN`: 任意（private repoやレート制限対策）
- `GITHUB_OWNER`: 任意（`GITHUB_REPOS` に repo名だけ書く場合の補完）

注意:

- slug が衝突する場合は **`GITHUB_REPOS` の指定順で先勝ち**します
- `published: true` の記事のみ表示されます

### GitHubリポジトリの階層構造

GitHubリポジトリから記事を読み込む場合、以下の階層構造でMarkdownファイルを配置してください。

```
リポジトリルート/
├── articles/          # 記事ディレクトリ（GITHUB_BLOG_PATH で変更可能、デフォルト: articles）
│   ├── article-1.md
│   ├── article-2.md
│   └── ...
└── .gitignore         # その他のファイル（任意）
```

**例: Zenn記事用リポジトリ**

```
zenn-content/
└── articles/
    ├── nextjs-tutorial.md
    ├── react-server-components.md
    └── ...
```

**例: Qiita記事用リポジトリ**

```
qiita-content/
└── articles/
    ├── fastapi-guide.md
    ├── docker-basics.md
    └── ...
```

**複数リポジトリを指定する場合:**

```bash
GITHUB_REPOS='["zenn-content","qiita-content"]'
```

この場合、両方のリポジトリの `articles/` 配下のMarkdownファイルが読み込まれます。

**ファイル名とslugの関係:**

- ファイル名: `my-article.md` → slug は `my-article`
- front matter に `qiitaId` がある場合: slug は `qiitaId` に置き換わります

## 環境変数

### 必須（推奨）

- **`NEXT_PUBLIC_SITE_URL`**: 本番URL（末尾スラッシュ無し推奨）
  - `sitemap.xml` / `robots.txt` / `rss.xml` / canonical URL の生成に使われます
  - 未設定時は `site.json` → それも空なら `http://localhost:3000` にフォールバック

### 任意

- **`NEXT_PUBLIC_GA4_MEASUREMENT_ID`**: GA4測定ID（設定時のみ計測スクリプトを挿入）
- **`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`**: Google Search Console 用 verification
- **`ZENN_USER_NAME`**, **`QIITA_USER_NAME`**: 原本canonical（Zenn/Qiita）生成に使用（`site.json` でも設定可）
- **GitHub記事ソース**: `GITHUB_REPOS`, `GITHUB_BLOG_PATH`, `GITHUB_TOKEN`, `GITHUB_OWNER`

## ローカルでの環境構築 / 起動

このプロジェクトは `packageManager: pnpm` です。

### 方法1: DevContainerを使用（推奨）

このプロジェクトには **DevContainer設定** が含まれており、Docker環境で一貫した開発環境を提供します。

#### 特徴

- 🐳 **マルチステージDockerビルド**: Zsh開発環境 + 軽量な本番イメージ
- 📦 **pnpm** via Corepack
- 🖥️ **Zsh with autosuggestions & persistent history** でスムーズなCLIワークフロー
- 🛠 **Biome** をフォーマッター & リンターとして使用（Git統合で一貫したコミット）
- 🎨 **Tailwind CSS** サポート（VS Code拡張機能もプリインストール済み）
- 🔧 **Devcontainer設定** で再現可能でポータブルなワークスペース
- 🛡️ **サプライチェーン攻撃対策**: バージョンピン、リリース年齢チェック、npm/npx使用制限

#### セットアップ手順

1. **リポジトリをクローン**
   ```zsh
   git clone https://github.com/wimpykid719/blog-v2
   cd blog-v2
   ```

2. **環境ファイルを作成**
   コンテナを起動する前に、サンプル環境ファイルをコピーします：
   ```zsh
   cp .devcontainer/.env.sample .devcontainer/.env
   ```

3. **GitHub記事ソースの設定（任意）**
   このプロジェクトは、GitHubリポジトリに保存されたMarkdownファイルから `/articles` ページを生成できます。
   
   `.devcontainer/.env` に以下の変数を設定してください（`.devcontainer/.env.sample` からコピー後）：
   - `GITHUB_REPOS`（必須；推奨フォーマット: `owner/repo-a,owner/repo-b`）
   - `GITHUB_OWNER`（必須；リポジトリパス用）
   - `GITHUB_BLOG_PATH`（任意、デフォルト: `articles`）
   - `GITHUB_TOKEN`（任意だが推奨；privateリポジトリやレート制限対策に必要）

4. **Dev Containerで開く**
   VS Codeでプロジェクトを開き、「Reopen in Container」を実行して開発環境を初期化します。
   必要なツール（pnpm、Biome、Tailwindなど）はすべてプリインストール済みです。

5. **Next.jsアプリを起動**
   コンテナ内で：
   ```zsh
   cd app && pnpm dev
   ```
   
   アプリは 👉 http://localhost:3000 でアクセスできます。

6. **Biome設定**
   初回起動時、Biomeがnode_modulesにインストールされたBiomeを参照できないためエラーが発生する場合があります。
   解決するには、Ctrl+Shift+P でコマンドパレットを開き、以下のコマンドを実行してください：
   ```
   >Biome: Restart
   ```

### 方法2: 通常のローカル環境

DevContainerを使用しない場合：

```bash
cd app
pnpm install
pnpm dev
```

ブラウザで `http://localhost:3000` を開いて確認してください。

### Lint / Format

```bash
pnpm lint
pnpm format
```

## デプロイ（Vercel）

Vercelへのデプロイが最も簡単です。

- **Project Settings → Environment Variables** に `NEXT_PUBLIC_SITE_URL`（必要に応じて他の変数も）を設定
- `pnpm build` が通ることを確認してデプロイ

補足:

- `/rss.xml` や `sitemap.xml` は記事取得に `fs`（ローカル）またはGitHub APIを使うため、**Node.js runtime**で動作します（実装で固定済み）

## 🛡️ サプライチェーン攻撃対策

このボイラープレートには、npmサプライチェーン攻撃から保護するためのセキュリティ対策が含まれています：

### 1. pnpm使用の強制

- npm/npxコマンドは実行前に確認が必要です（`USE_NPM_ANYWAY=1` でバイパス可能）
- Corepack経由でpnpmが主要パッケージマネージャーとして強制されます

### 2. バージョンピン

- `save-exact=true` を設定した `.npmrc` により、正確なバージョンが保存されます
- `npm-package-json-lint` がすべての依存関係が正確なバージョン（`^` や `~` なし）を使用していることをチェックします
- `pnpm lint:package-json` を実行してバージョンピンを確認できます

### 3. リリース年齢保護

- `pnpm-workspace.yaml` に `minimumReleaseAge: 4320`（3日）を設定し、新しくリリースされたパッケージのインストールを防止します
- `renovate.json` でRenovateが新しいバージョンに更新する前に3日待つように設定されています

### 設定ファイル

初期化時に以下のセキュリティ設定ファイルが `app/` に自動的にコピーされます：
- `.npmrc` - バージョンピン設定
- `.npmpackagejsonlintrc.json` - package.jsonのリンティングルール
- `pnpm-workspace.yaml` - リリース年齢保護付きのpnpmワークスペース設定

ルートレベルの設定：
- `renovate.json` - 依存関係更新用のRenovate bot設定

## 📂 プロジェクト構造

```
.
├── .devcontainer/      # Devcontainer設定、Dockerfile & 環境設定
│   ├── .env.sample
│   ├── .zshrc
│   ├── app/            # Next.jsアプリ初期化用のテンプレートファイル
│   │   ├── .npmrc
│   │   ├── .npmpackagejsonlintrc.json
│   │   └── pnpm-workspace.yaml
│   ├── compose.yml
│   ├── devcontainer.json
│   ├── Dockerfile
│   └── entrypoint.sh
├── .gitignore          # Git ignoreファイル
├── app/                # Next.jsアプリケーションソースコード
│   ├── public/         # 静的アセット
│   ├── src/            # アプリケーションソース
│   ├── content/        # Markdown記事（ローカル）
│   ├── next.config.ts
│   └── package.json
├── LICENSE.md          # プロジェクトライセンス
├── README.md
└── renovate.json       # Renovate bot設定
```

## ✅ 主な特徴

- Docker & Dev Containersによる一貫した開発環境
- Biome + TailwindCSSが標準装備されたオピニオン付きセットアップ
- 生産性向上のための履歴永続化付きZshシェル
- デプロイに最適化された本番対応ビルド
- 無料で運用可能（Vercelなど）
- 簡単なデプロイプロセス

## 📜 ライセンス

MIT
