"use client";

import Image from "next/image";
import React from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkBreaks from "remark-breaks";
import remarkCodeMeta from "remark-code-meta";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

interface MarkdownContentProps {
  content: string;
}

function parseYouTubeVideoId(
  inputHref: string,
): { videoId: string; start?: number } | null {
  if (!inputHref) return null;

  // "www.youtube.com/..." のようなプロトコル省略にも対応
  const normalizedHref =
    inputHref.startsWith("http://") || inputHref.startsWith("https://")
      ? inputHref
      : `https://${inputHref}`;

  let url: URL;
  try {
    url = new URL(normalizedHref);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase();
  const isYouTubeHost =
    host === "youtu.be" ||
    host.endsWith(".youtu.be") ||
    host === "youtube.com" ||
    host.endsWith(".youtube.com");

  if (!isYouTubeHost) return null;

  // videoId 抽出
  let videoId = "";
  const pathname = url.pathname || "";

  if (host === "youtu.be" || host.endsWith(".youtu.be")) {
    // https://youtu.be/{id}
    videoId = pathname.replace(/^\/+/, "").split("/")[0] || "";
  } else if (pathname.startsWith("/watch")) {
    // https://www.youtube.com/watch?v={id}
    videoId = url.searchParams.get("v") || "";
  } else if (pathname.startsWith("/shorts/")) {
    // https://www.youtube.com/shorts/{id}
    videoId = pathname.split("/")[2] || "";
  } else if (pathname.startsWith("/embed/")) {
    // https://www.youtube.com/embed/{id}
    videoId = pathname.split("/")[2] || "";
  } else {
    // 念のため v パラメータも拾う
    videoId = url.searchParams.get("v") || "";
  }

  videoId = videoId.trim();
  if (!videoId) return null;

  // start 秒（t=1m30s / t=90 / start=90 を軽く対応）
  const t = (
    url.searchParams.get("t") ||
    url.searchParams.get("start") ||
    ""
  ).trim();
  let start: number | undefined;
  if (t) {
    const asNumber = Number(t);
    if (!Number.isNaN(asNumber) && Number.isFinite(asNumber) && asNumber > 0) {
      start = Math.floor(asNumber);
    } else {
      // 1h2m3s / 2m10s / 30s
      const match = /^((\d+)h)?((\d+)m)?((\d+)s)?$/i.exec(t);
      if (match) {
        const h = match[2] ? Number(match[2]) : 0;
        const m = match[4] ? Number(match[4]) : 0;
        const s = match[6] ? Number(match[6]) : 0;
        const total = h * 3600 + m * 60 + s;
        if (total > 0) start = total;
      }
    }
  }

  return { videoId, start };
}

type HastLikeNode = {
  type?: unknown;
  tagName?: unknown;
  value?: unknown;
  children?: unknown;
  properties?: unknown;
};

function isWhitespaceTextNode(node: HastLikeNode): boolean {
  return (
    node.type === "text" &&
    typeof node.value === "string" &&
    node.value.trim() === ""
  );
}

function getYouTubeFromParagraphNode(
  node: unknown,
): { href: string; videoId: string; start?: number } | null {
  const n = (node ?? {}) as HastLikeNode;
  if (n.type !== "element" || n.tagName !== "p") return null;

  const rawChildren = Array.isArray(n.children)
    ? (n.children as HastLikeNode[])
    : [];
  const meaningfulChildren = rawChildren.filter(
    (c) => !isWhitespaceTextNode(c),
  );

  // 段落の中身がリンク単体（空白以外は <a> 1つ）のときだけ embed にする
  if (meaningfulChildren.length !== 1) return null;
  const only = meaningfulChildren[0];
  if (!only) return null;
  if (only.type !== "element" || only.tagName !== "a") return null;

  const props = (only.properties ?? {}) as { href?: unknown };
  const href = typeof props.href === "string" ? props.href : "";
  if (!href) return null;

  const yt = parseYouTubeVideoId(href);
  if (!yt) return null;

  // 参考: リンクテキストも取得できる（必要なら条件に使える）
  // const text = extractTextFromHast(only).trim();

  return { href, videoId: yt.videoId, start: yt.start };
}

function YouTubeEmbedCard({
  href,
  videoId,
  start,
}: {
  href: string;
  videoId: string;
  start?: number;
}) {
  const src = React.useMemo(() => {
    const u = new URL(`https://www.youtube.com/embed/${videoId}`);
    // 余計なトラッキングを避けたい場合は youtube-nocookie.com も検討できるが、
    // まずは互換性重視で通常ドメインに寄せる
    u.searchParams.set("rel", "0");
    u.searchParams.set("modestbranding", "1");
    if (typeof start === "number" && start > 0) {
      u.searchParams.set("start", String(start));
    }
    return u.toString();
  }, [videoId, start]);

  return (
    <div className="my-6 not-prose">
      <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
        <div
          className="relative w-full bg-black"
          style={{ aspectRatio: "16 / 9" }}
        >
          <iframe
            className="absolute inset-0 w-full h-full"
            src={src}
            title="YouTube embed"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
        <div className="px-4 py-3">
          <a
            href={href}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline wrap-break-word"
            target="_blank"
            rel="noopener noreferrer"
          >
            YouTubeで開く
          </a>
        </div>
      </div>
    </div>
  );
}

function MarkdownImage({ src, alt }: { src: string; alt?: string }) {
  // 初期表示は 16:9 を仮に使い、読み込み後に実画像の縦横比へ更新して
  // デスクトップでも「本文と同じ横幅」で自然に表示されるようにする。
  const [aspectRatio, setAspectRatio] = React.useState<string>("16 / 9");

  const computedAlt = React.useMemo(() => {
    const a = typeof alt === "string" ? alt.trim() : "";
    if (a) return a;
    // alt未指定をゼロにしないため、URL末尾のファイル名を人間向けに推測して使う
    try {
      const last = src.split("?")[0]?.split("#")[0]?.split("/").pop() || "";
      const decoded = decodeURIComponent(last);
      const noExt = decoded.replace(/\.[a-z0-9]+$/i, "");
      const normalized = noExt.replace(/[-_]+/g, " ").trim();
      return normalized || "画像";
    } catch {
      return "画像";
    }
  }, [alt, src]);

  return (
    <span
      className="relative block w-full my-4 rounded-lg overflow-hidden markdown-image-wrapper bg-gray-100 dark:bg-gray-800"
      style={{ aspectRatio }}
    >
      <Image
        src={src}
        alt={computedAlt}
        fill
        sizes="(max-width: 768px) 100vw, 896px"
        className="object-contain rounded-lg"
        unoptimized
        onLoad={(event) => {
          const img = event.currentTarget;
          if (img?.naturalWidth && img?.naturalHeight) {
            setAspectRatio(`${img.naturalWidth} / ${img.naturalHeight}`);
          }
        }}
      />
    </span>
  );
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const components: Components = {
    code({ node, className, children, ...props }) {
      // react-markdownのバージョンや型の差異で inline が渡ってこないケースがあるため、
      // 改行有無でブロック/インラインをフォールバック判定する。
      const rawText = String(children ?? "");
      const inlineProp =
        "inline" in props
          ? (props as unknown as { inline?: boolean }).inline
          : undefined;
      const isInline =
        typeof inlineProp === "boolean" ? inlineProp : !rawText.includes("\n");
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

      // fenced code block (``` ... ```). 言語指定がなくても <pre> で包んで改行/インデントを保持する。
      if (!isInline) {
        const showHeader = Boolean(language || filePath);
        return (
          <div className="not-prose my-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            {showHeader && (
              <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 min-w-0">
                  {language && (
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {language}
                    </span>
                  )}
                  {filePath && (
                    <>
                      {language && (
                        <span className="text-gray-400 dark:text-gray-500">
                          /
                        </span>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
                        {filePath}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
            <pre className="m-0 overflow-x-auto bg-gray-50 dark:bg-gray-900 whitespace-pre text-sm leading-relaxed">
              <code className={className ? className : "font-mono"} {...props}>
                {children}
              </code>
            </pre>
          </div>
        );
      }

      // インラインコードの場合、classNameが存在しない場合はデフォルトスタイルを適用
      const codeClassName = className
        ? className
        : "bg-gray-300 text-gray-900 dark:text-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono";

      return (
        <code className={codeClassName} {...props}>
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
    p: ({ node, children }) => {
      const yt = getYouTubeFromParagraphNode(node);
      if (yt) {
        return (
          <YouTubeEmbedCard
            href={yt.href}
            videoId={yt.videoId}
            start={yt.start}
          />
        );
      }

      // 子要素にdiv要素やmarkdown-image-wrapperクラスが含まれている場合は、<p>の代わりに<div>を使用
      // (imgコンポーネントが<div>を返すため、<p>の中に<div>を配置できない)
      const checkForBlockElement = (child: React.ReactNode): boolean => {
        if (!React.isValidElement(child)) return false;

        // 文字列の"div"型をチェック
        if (child.type === "div") return true;

        // propsからclassNameをチェック
        const props = child.props;
        if (props && typeof props === "object") {
          // classNameがmarkdown-image-wrapperを含むかチェック
          if (
            "className" in props &&
            typeof props.className === "string" &&
            props.className.includes("markdown-image-wrapper")
          ) {
            return true;
          }

          // childrenを再帰的にチェック
          if (
            "children" in props &&
            props.children &&
            (typeof props.children === "object" ||
              typeof props.children === "string" ||
              typeof props.children === "number")
          ) {
            const childrenArray = React.Children.toArray(
              props.children as React.ReactNode,
            );
            if (childrenArray.some(checkForBlockElement)) {
              return true;
            }
          }
        }

        return false;
      };

      const hasBlockElement =
        React.Children.toArray(children).some(checkForBlockElement);

      if (hasBlockElement) {
        return (
          <div className="mb-4 leading-7 text-gray-700 dark:text-gray-300">
            {children}
          </div>
        );
      }

      return (
        <p className="mb-4 leading-7 text-gray-700 dark:text-gray-300">
          {children}
        </p>
      );
    },
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
    li: ({ children }) => (
      <li className="leading-7 wrap-break-word">{children}</li>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-4 italic text-gray-600 dark:text-gray-400">
        {children}
      </blockquote>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-blue-600 dark:text-blue-400 hover:underline wrap-break-word"
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
      return <MarkdownImage src={src} alt={alt} />;
    },
  };

  return (
    <div className="prose prose-lg max-w-none dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkCodeMeta, remarkBreaks]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
