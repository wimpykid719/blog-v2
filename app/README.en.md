# DevSpot Blog (Next.js)

**English** | [日本語](./README.ja.md)

> 💡 **Perfect for individual creators!**
> This blog template is **easy to deploy and free to run**, making it ideal for individual creators. Simple deployment to Vercel with zero cost to get started.

## Overview

A blog built with Next.js (App Router). Articles are generated from Markdown, and the app includes an **article list**, **article detail pages**, **RSS**, **sitemap**, and **Open Graph images**.

## Key Features

- **Markdown-powered articles**: Generate posts from `content/articles/*.md` (local)
- **GitHub as an article source (optional)**: When `GITHUB_REPOS` is set, the app can read Markdown from one or more GitHub repositories under `articles/`
- **Article list + pagination**: e.g. `/articles?page=2`
- **SEO**: canonical/OG/Twitter metadata, `robots.txt`, `sitemap.xml`
- **RSS feed**: `/rss.xml` (up to 50 latest items, categories included)
- **Code highlight / Math**: highlight.js / KaTeX support
- **Google Analytics (optional)**: Enable GA4 page view tracking via env var

## Pages / Routes

- **Home**: `/`
- **Articles**: `/articles` (supports `?page=`)
- **Article detail**: `/articles/[slug]`
- **RSS**: `/rss.xml`
- **Sitemap**: `/sitemap.xml`
- **Robots**: `/robots.txt`
- **OG image**: `/opengraph-image` (used by OG/Twitter cards)

## Adding / Updating Articles (Local Markdown)

1. Add a file like `content/articles/my-article.md`
2. Fill in front matter (some fields are required)

Example:

```md
---
title: "Post title"
emoji: "📝"
type: "tech" # "tech" | "idea"
topics: ["Next.js", "TypeScript"]
published: true
date: "2025.12.31" # e.g. YYYY.MM.DD / YYYY-MM-DD / YYYY/MM/DD
# qiitaId: "xxxxxxxxxxxxxxxxxxxx" # optional
---

# Heading

Body...
```

### About `slug` and `qiitaId` (important)

- **Default**: `content/articles/my-article.md` → slug is `my-article`
- **With `qiitaId`**: slug becomes `qiitaId` (URL becomes `/articles/<qiitaId>`)
- canonical URLs prefer the original source (Qiita/Zenn) when configured (see below)

## Using GitHub Repositories as the Article Source (Optional)

If `GITHUB_REPOS` is set, the app fetches articles from GitHub **Contents API** instead of local files.

- `GITHUB_REPOS`: e.g. `["owner/repo-a","owner/repo-b"]` or `owner/repo-a,owner/repo-b`
- `GITHUB_BLOG_PATH`: articles directory (default: `articles`)
- `GITHUB_TOKEN`: optional (private repos / rate limiting)
- `GITHUB_OWNER`: optional (used when `GITHUB_REPOS` contains repo names without owner)

Notes:

- When slugs collide, the first match wins (based on the order in `GITHUB_REPOS`)
- Only articles with `published: true` are shown

### GitHub Repository Structure

When using GitHub repositories as the article source, organize your Markdown files in the following structure:

```
repository-root/
├── articles/          # Articles directory (configurable via GITHUB_BLOG_PATH, default: articles)
│   ├── article-1.md
│   ├── article-2.md
│   └── ...
└── .gitignore         # Other files (optional)
```

**Example: Zenn articles repository**

```
zenn-content/
└── articles/
    ├── nextjs-tutorial.md
    ├── react-server-components.md
    └── ...
```

**Example: Qiita articles repository**

```
qiita-content/
└── articles/
    ├── fastapi-guide.md
    ├── docker-basics.md
    └── ...
```

**Using multiple repositories:**

```bash
GITHUB_REPOS='["zenn-content","qiita-content"]'
```

In this case, Markdown files from both repositories' `articles/` directories will be loaded.

**Filename to slug mapping:**

- Filename: `my-article.md` → slug is `my-article`
- If `qiitaId` is present in front matter: slug becomes `qiitaId`

## Environment Variables

### Required (recommended)

- **`NEXT_PUBLIC_SITE_URL`**: Production site URL (prefer without trailing slash)
  - Used to generate `sitemap.xml`, `robots.txt`, `rss.xml`, and canonical URLs
  - Fallback order: `NEXT_PUBLIC_SITE_URL` → `site.json` → `http://localhost:3000`

### Optional

- **`NEXT_PUBLIC_GA4_MEASUREMENT_ID`**: Enables GA4 tracking
- **`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`**: Google Search Console verification
- **`ZENN_USER_NAME`**, **`QIITA_USER_NAME`**: Used to generate canonical source URLs (can also be set in `site.json`)
- **GitHub article source**: `GITHUB_REPOS`, `GITHUB_BLOG_PATH`, `GITHUB_TOKEN`, `GITHUB_OWNER`

## Local Setup / Development

This project declares `packageManager: pnpm`.

```bash
cd app
pnpm install
pnpm dev
```

Open `http://localhost:3000` in your browser.

### Lint / Format

```bash
pnpm lint
pnpm format
```

## Deployment (Vercel)

Deploying on Vercel is the easiest path.

- Set `NEXT_PUBLIC_SITE_URL` (and other env vars if needed) in **Project Settings → Environment Variables**
- Deploy after confirming `pnpm build` succeeds

Note:

- `/rss.xml` and `sitemap.xml` rely on `fs` (local) or GitHub API, so they run on **Node.js runtime** (already enforced in the implementation)

---

## Notes from the Next.js template (kept from create-next-app)

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


