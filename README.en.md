# DevSpot Blog (Next.js)

**English** | [日本語](./README.md)

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

### Method 1: Using DevContainer (Recommended)

This project includes **DevContainer configuration** that provides a consistent development environment in Docker.

#### Features

- 🐳 **Multi-stage Docker build**: Zsh-powered dev environment + lightweight production image
- 📦 **pnpm** via Corepack
- 🖥️ **Zsh with autosuggestions & persistent history** for smooth CLI workflows
- 🛠 **Biome** as formatter & linter with Git integration for consistent commits
- 🎨 **Tailwind CSS** support with preinstalled VS Code extension
- 🔧 **Devcontainer configuration** for a reproducible and portable workspace
- 🛡️ **Supply chain attack protection**: Version pinning, release age checks, and npm/npx usage restrictions

#### Setup Steps

1. **Clone this repository**
   ```zsh
   git clone https://github.com/wimpykid719/blog-v2
   cd blog-v2
   ```

2. **Create environment file**
   Before starting the container, copy the sample environment file:
   ```zsh
   cp .devcontainer/.env.sample .devcontainer/.env
   ```

3. **Blog content (Markdown) from GitHub**
   This project can generate `/articles` pages from Markdown files stored in GitHub repositories.
   
   Set the following variables in `.devcontainer/.env` (copy from `.devcontainer/.env.sample` first):
   - `GITHUB_REPOS` (required; recommended format is like `owner/repo-a,owner/repo-b`)
   - `GITHUB_OWNER` (required; use for repo path)
   - `GITHUB_BLOG_PATH` (optional, default: `articles`)
   - `GITHUB_TOKEN` (optional but recommended; required for private repos)

4. **Open in Dev Container**
   Open the project in VS Code and run "Reopen in Container" to initialize the development environment.
   All necessary tools (pnpm, Biome, Tailwind, etc.) are already preinstalled.

5. **Run the Next.js app**
   Inside the container:
   ```zsh
   cd app && pnpm dev
   ```
   
   Now you can access the app at 👉 http://localhost:3000.

6. **Biome Settings**
   On first launch, Biome cannot reference the Biome installed in node_modules, causing an error. To resolve this, press Ctrl+Shift+P to open the command palette and execute the following command:
   ```
   >Biome: Restart
   ```

### Method 2: Regular Local Environment

If not using DevContainer:

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

## 🛡️ Supply Chain Attack Protection

This boilerplate includes several security measures to protect against npm supply chain attacks:

### 1. pnpm Usage Enforcement

- npm/npx commands require confirmation before execution (use `USE_NPM_ANYWAY=1` to bypass)
- pnpm is enforced as the primary package manager via Corepack

### 2. Version Pinning

- `.npmrc` with `save-exact=true` ensures exact versions are saved
- `npm-package-json-lint` checks that all dependencies use exact versions (no `^` or `~`)
- Run `pnpm lint:package-json` to verify version pinning

### 3. Release Age Protection

- `pnpm-workspace.yaml` sets `minimumReleaseAge: 4320` (3 days) to prevent installing newly released packages
- `renovate.json` configures Renovate to wait 3 days before updating to new versions

### Configuration Files

The following security configuration files are automatically copied to `app/` during initialization:
- `.npmrc` - Version pinning configuration
- `.npmpackagejsonlintrc.json` - Linting rules for package.json
- `pnpm-workspace.yaml` - pnpm workspace settings with release age protection

Root-level configuration:
- `renovate.json` - Renovate bot configuration for dependency updates

## 📂 Project Structure

```
.
├── .devcontainer/      # Devcontainer configs, Dockerfile & environment settings
│   ├── .env.sample
│   ├── .zshrc
│   ├── app/            # Template files for Next.js app initialization
│   │   ├── .npmrc
│   │   ├── .npmpackagejsonlintrc.json
│   │   └── pnpm-workspace.yaml
│   ├── compose.yml
│   ├── devcontainer.json
│   ├── Dockerfile
│   └── entrypoint.sh
├── .gitignore          # Git ignore file
├── app/                # Next.js application source code
│   ├── public/         # Static assets
│   ├── src/            # Application source
│   ├── content/        # Markdown articles (local)
│   ├── next.config.ts
│   └── package.json
├── LICENSE.md          # Project License
├── README.md
└── renovate.json       # Renovate bot configuration
```

## ✅ Key Features

- Consistent development environment with Docker & Dev Containers
- Opinionated setup with Biome + TailwindCSS out-of-the-box
- Zsh shell with history persistence for productivity
- Production-ready build optimized for deployment
- Free to run (Vercel, etc.)
- Simple deployment process

## 📜 License

MIT