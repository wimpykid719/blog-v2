export interface ArticleFrontMatter {
  title: string;
  emoji: string;
  type: "tech" | "idea";
  topics: string[];
  published: boolean;
  date: string;
  qiitaId?: string;
}

export interface Article {
  slug: string;
  frontMatter: ArticleFrontMatter;
  content: string;
}
