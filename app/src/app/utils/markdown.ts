import fs from "fs";
import matter from "gray-matter";
import path from "path";
import type { Article, ArticleFrontMatter } from "../types/article";

export function parseMarkdown(content: string) {
  return matter(content);
}

type GithubRepoRef = {
  owner: string;
  repo: string;
};

type GithubBlogConfig = {
  repos: GithubRepoRef[];
  articlesPath: string;
  token?: string;
};

function encodeGithubPath(p: string): string {
  return p
    .split("/")
    .filter(Boolean)
    .map((seg) => encodeURIComponent(seg))
    .join("/");
}

type GithubReposEnvEntry = string | { owner?: unknown; repo?: unknown };

function normalizeRepoEntry(
  entry: GithubReposEnvEntry,
  defaultOwner?: string,
): GithubRepoRef | null {
  if (typeof entry === "string") {
    const s = entry.trim();
    if (!s) return null;
    if (s.includes("/")) {
      const [owner, repo] = s.split("/").map((v) => v?.trim());
      if (!owner || !repo) return null;
      return { owner, repo };
    }
    // repoのみ指定: defaultOwner があれば補完
    if (!defaultOwner) return null;
    return { owner: defaultOwner, repo: s };
  }

  if (entry && typeof entry === "object") {
    const owner = typeof entry.owner === "string" ? entry.owner.trim() : "";
    const repo = typeof entry.repo === "string" ? entry.repo.trim() : "";
    if (!owner || !repo) return null;
    return { owner, repo };
  }

  return null;
}

function parseGithubReposEnv(
  raw: string,
  defaultOwner?: string,
): GithubRepoRef[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  // 1) JSON配列: ["repo-a","owner/repo"] or [{owner,repo}, ...]
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((e) => normalizeRepoEntry(e as GithubReposEnvEntry, defaultOwner))
        .filter((v): v is GithubRepoRef => Boolean(v));
    } catch {
      // JSONとして壊れていても、下のカンマ区切りパースにフォールバック
    }
  }

  // 2) カンマ/改行区切り: owner/repo, owner/repo
  return trimmed
    .split(/[,\n]/g)
    .map((s) => normalizeRepoEntry(s, defaultOwner))
    .filter((v): v is GithubRepoRef => Boolean(v));
}

function getGithubBlogConfig(): GithubBlogConfig | null {
  const articlesPath = process.env.GITHUB_BLOG_PATH?.trim() || "articles";
  const token = process.env.GITHUB_TOKEN?.trim() || undefined;

  const reposRaw = process.env.GITHUB_REPOS?.trim();
  if (!reposRaw) return null;

  // repo名だけを許容する場合の補完用（任意）
  const defaultOwner = process.env.GITHUB_OWNER?.trim() || undefined;
  const repos = parseGithubReposEnv(reposRaw, defaultOwner);
  if (repos.length === 0) return null;
  return { repos, articlesPath, token };
}

async function githubFetchJson<T>(
  url: string,
  token?: string,
): Promise<
  { ok: true; data: T } | { ok: false; status: number; message: string }
> {
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    // 適度にキャッシュ。記事更新はリポジトリ側の更新で反映される想定
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, status: res.status, message: text || res.statusText };
  }

  const data = (await res.json()) as T;
  return { ok: true, data };
}

type GithubContentsFileResponse = {
  type: "file";
  name: string;
  path: string;
  sha: string;
  size: number;
  download_url: string | null;
  content?: string; // base64
  encoding?: "base64" | string;
};

type GithubContentsDirEntry = {
  type: "file" | "dir" | "symlink" | "submodule";
  name: string;
  path: string;
  sha: string;
  size: number;
  download_url: string | null;
};

async function getGithubMarkdownFileContent(
  cfg: GithubBlogConfig,
  repo: GithubRepoRef,
  filePath: string,
): Promise<string | null> {
  const url = new URL(
    `https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/${encodeGithubPath(filePath)}`,
  );

  const res = await githubFetchJson<GithubContentsFileResponse>(
    url.toString(),
    cfg.token,
  );
  if (!res.ok) {
    if (res.status === 404) return null;
    // それ以外はエラーとして扱う（呼び出し側でフォールバック可能）
    throw new Error(
      `GitHub contents fetch failed (${res.status}): ${res.message}`,
    );
  }

  const body = res.data;
  if (body.type !== "file") return null;
  if (body.encoding === "base64" && typeof body.content === "string") {
    return Buffer.from(body.content, "base64").toString("utf8");
  }

  // contentが返らないケース（稀）用にdownload_urlでフォールバック
  if (body.download_url) {
    const rawRes = await fetch(body.download_url, {
      headers: cfg.token ? { Authorization: `Bearer ${cfg.token}` } : undefined,
      next: { revalidate: 60 },
    });
    if (!rawRes.ok) return null;
    return await rawRes.text();
  }

  return null;
}

export async function getAllArticles(): Promise<Article[]> {
  const github = getGithubBlogConfig();
  if (github) {
    try {
      const perRepo = await Promise.all(
        github.repos.map(async (repo) => {
          const url = new URL(
            `https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/${encodeGithubPath(github.articlesPath)}`,
          );
          const res = await githubFetchJson<
            GithubContentsDirEntry[] | GithubContentsFileResponse
          >(url.toString(), github.token);
          if (!res.ok) {
            // リポジトリ単位で失敗しても全体は壊さない
            return [] as Article[];
          }

          const entries = Array.isArray(res.data) ? res.data : [];
          const markdownFiles = entries.filter(
            (e) => e.type === "file" && e.name.toLowerCase().endsWith(".md"),
          );

          const articles = await Promise.all(
            markdownFiles.map(async (f) => {
              const slug = f.name.replace(/\.md$/i, "");
              const content = await getGithubMarkdownFileContent(
                github,
                repo,
                f.path,
              );
              if (!content) return null;
              const { data, content: body } = parseMarkdown(content);
              return {
                slug,
                frontMatter: data as ArticleFrontMatter,
                content: body,
              } satisfies Article;
            }),
          );

          return articles.filter((a): a is Article => Boolean(a));
        }),
      );

      // slug衝突は、GITHUB_REPOS の指定順で先勝ち（routeが一意である必要があるため）
      const deduped = new Map<string, Article>();
      for (const a of perRepo.flat()) {
        if (!deduped.has(a.slug)) deduped.set(a.slug, a);
      }

      return Array.from(deduped.values())
        .filter((a) => a.frontMatter.published)
        .sort((a, b) => {
          return (
            new Date(b.frontMatter.date).getTime() -
            new Date(a.frontMatter.date).getTime()
          );
        });
    } catch {
      // GitHub取得で例外が出た場合も、環境を壊さないため空で返す
      return [];
    }
  }

  // --- ローカルフォールバック（従来挙動） ---
  const articlesDirectory = path.join(process.cwd(), "content/articles");

  // ディレクトリが存在しない場合は空配列を返す
  if (!fs.existsSync(articlesDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(articlesDirectory);
  const articles = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(articlesDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = parseMarkdown(fileContents);

      return {
        slug,
        frontMatter: data as ArticleFrontMatter,
        content,
      };
    })
    .filter((article) => article.frontMatter.published) // publishedがtrueのもののみ
    .sort((a, b) => {
      // 日付でソート（新しい順）
      return (
        new Date(b.frontMatter.date).getTime() -
        new Date(a.frontMatter.date).getTime()
      );
    });

  return articles;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const github = getGithubBlogConfig();
  if (github) {
    try {
      const filePath = `${github.articlesPath}/${slug}.md`;
      for (const repo of github.repos) {
        const raw = await getGithubMarkdownFileContent(github, repo, filePath);
        if (!raw) continue;

        const { data, content } = parseMarkdown(raw);
        return {
          slug,
          frontMatter: data as ArticleFrontMatter,
          content,
        };
      }

      return null;
    } catch {
      return null;
    }
  }

  // --- ローカルフォールバック（従来挙動） ---
  const articlesDirectory = path.join(process.cwd(), "content/articles");
  const filePath = path.join(articlesDirectory, `${slug}.md`);

  // ファイルが存在しない場合はnullを返す
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = parseMarkdown(fileContents);

  return {
    slug,
    frontMatter: data as ArticleFrontMatter,
    content,
  };
}
