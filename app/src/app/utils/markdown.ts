import fs from "fs";
import matter from "gray-matter";
import path from "path";
import type { Article, ArticleFrontMatter } from "../types/article";

export function parseMarkdown(content: string) {
  return matter(content);
}

export function getAllArticles(): Article[] {
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
