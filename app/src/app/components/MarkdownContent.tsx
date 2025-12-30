"use client";

import Image from "next/image";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkCodeMeta from "remark-code-meta";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const components: Components = {
    code({ node, className, children, ...props }) {
      const inline =
        "inline" in props ? (props as { inline: boolean }).inline : false;
      // メタデータから言語とファイルパスを取得
      const meta = (node?.data as { meta?: string })?.meta || "";
      const classNameMatch = /language-(\w+)/.exec(className || "");
      const language = classNameMatch ? classNameMatch[1] : "";

      // メタデータからファイルパスを抽出（例: "typescript:src/app/page.tsx" または "src/app/page.tsx"）
      let filePath: string | null = null;
      if (meta) {
        // メタデータが "filepath" または "language:filepath" の形式の場合
        const metaParts = meta.split(":");
        if (metaParts.length > 1) {
          // "language:filepath" の形式
          filePath = metaParts.slice(1).join(":");
        } else if (!meta.match(/^\w+$/)) {
          // 言語名ではない場合（ファイルパスの可能性）
          filePath = meta;
        }
      }

      // classNameからもファイルパスを取得を試みる（フォールバック）
      if (!filePath) {
        const classNameMatchWithPath = /language-\w+:(.+)/.exec(
          className || "",
        );
        if (classNameMatchWithPath) {
          filePath = classNameMatchWithPath[1];
        }
      }

      if (!inline && language) {
        return (
          <div className="my-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* ヘッダー部分（言語名とファイルパス） */}
            <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {language}
                </span>
                {filePath && (
                  <>
                    <span className="text-gray-400 dark:text-gray-500">/</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {filePath}
                    </span>
                  </>
                )}
              </div>
            </div>
            {/* コード部分 */}
            <pre className="m-0 p-4 overflow-x-auto bg-gray-50 dark:bg-gray-900">
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
          </div>
        );
      }

      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    pre({ children }) {
      return <>{children}</>;
    },
    h1: ({ children }) => (
      <h1 className="text-4xl font-bold mt-8 mb-4 text-gray-900 dark:text-gray-100">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-3xl font-bold mt-6 mb-3 text-gray-900 dark:text-gray-100">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl font-bold mt-5 mb-2 text-gray-900 dark:text-gray-100">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-xl font-bold mt-4 mb-2 text-gray-900 dark:text-gray-100">
        {children}
      </h4>
    ),
    p: ({ children }) => (
      <p className="mb-4 leading-7 text-gray-700 dark:text-gray-300">
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-4 ml-6 list-decimal space-y-2 text-gray-700 dark:text-gray-300">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="leading-7">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-4 italic text-gray-600 dark:text-gray-400">
        {children}
      </blockquote>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-blue-600 dark:text-blue-400 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-gray-100 dark:bg-gray-800">{children}</thead>
    ),
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => (
      <tr className="border-b border-gray-300 dark:border-gray-600">
        {children}
      </tr>
    ),
    th: ({ children }) => (
      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-100">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">
        {children}
      </td>
    ),
    hr: () => <hr className="my-8 border-gray-300 dark:border-gray-600" />,
    img: ({ src, alt }) => {
      if (!src || typeof src !== "string") return null;
      return (
        <div className="relative w-full min-h-[200px] my-4 rounded-lg overflow-hidden">
          <Image
            src={src}
            alt={alt || ""}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 800px, 800px"
            className="object-contain rounded-lg"
            unoptimized
          />
        </div>
      );
    },
  };

  return (
    <div className="prose prose-lg max-w-none dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkCodeMeta]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
