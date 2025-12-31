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

---

## Next.js テンプレ（create-next-app）由来のメモ（必要事項を残しています）

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

### Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open `http://localhost:3000` with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


