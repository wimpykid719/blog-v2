import * as path from "node:path";
import { fileURLToPath } from "node:url";

export function parseClipboardPathToLocalFile(text: string): string | null {
  let t = (text ?? "").trim();
  if (!t) return null;

  // Remove wrapping quotes: "C:\a\b.png" or '/home/me/a.png'
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    t = t.slice(1, -1).trim();
  }

  // file:// URI
  if (t.startsWith("file://")) {
    try {
      // Cross-platform conversion:
      // - mac/linux: file:///home/me/a.png -> /home/me/a.png
      // - windows:  file:///C:/Users/me/a.png -> C:\Users\me\a.png
      return fileURLToPath(t);
    } catch {
      return null;
    }
  }

  // Raw absolute/relative path (we accept as-is)
  return t;
}

const IMAGE_EXTS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
  // Common on Windows/macOS
  ".bmp",
  ".tif",
  ".tiff",
  ".heic",
  ".heif",
  ".avif",
  ".ico",
  ".jfif",
]);

export function isLikelyImageFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return IMAGE_EXTS.has(ext);
}

export function extToContentType(extLower: string): string | undefined {
  switch (extLower) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
    case ".jfif":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    case ".bmp":
      return "image/bmp";
    case ".tif":
    case ".tiff":
      return "image/tiff";
    case ".heic":
      return "image/heic";
    case ".heif":
      return "image/heif";
    case ".avif":
      return "image/avif";
    case ".ico":
      return "image/x-icon";
    default:
      return undefined;
  }
}
