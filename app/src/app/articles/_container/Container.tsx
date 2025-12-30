import { ArticlesPage } from "@/features/articles/page";

interface ArticlesContainerProps {
  index: Array<{
    slug: string;
    frontMatter: {
      title: string;
      emoji: string;
      type: "tech" | "idea";
      topics: string[];
      published: boolean;
      date: string;
      qiitaId?: string;
    };
  }>;
}

export function ArticlesContainer({ index }: ArticlesContainerProps) {
  return <ArticlesPage index={index} />;
}
