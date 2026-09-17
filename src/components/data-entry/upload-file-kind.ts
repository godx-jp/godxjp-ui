import { File as FileGlyph, FileArchive, FileCode, FileImage, FileText } from "lucide-react";

import type { IconGlyphProp } from "../../props/components/general.prop";

/**
 * What a listed file IS, at the coarseness a row can actually draw (gh#720).
 *
 * A picture list shows a thumbnail for an image and a glyph for everything else, so the buckets
 * are exactly the marks we have: five, not one per MIME type. The kind is also written onto the
 * row as `data-file-kind`, so a service can retint a bucket without forking the component.
 */
export type UploadFileKind = "image" | "pdf" | "archive" | "text" | "file";

/**
 * MIME first, extension second — a browser-picked `File` carries `type`, but an item restored from
 * a media service often carries only a name. Prefixes (`image/`, `text/`) cover the long tail.
 */
const MIME_KINDS: Record<string, UploadFileKind> = {
  "application/pdf": "pdf",
  "application/x-pdf": "pdf",
  "application/zip": "archive",
  "application/x-zip-compressed": "archive",
  "application/x-7z-compressed": "archive",
  "application/vnd.rar": "archive",
  "application/x-rar-compressed": "archive",
  "application/gzip": "archive",
  "application/x-tar": "archive",
  "application/x-bzip": "archive",
  "application/x-bzip2": "archive",
  "application/json": "text",
  "application/ld+json": "text",
  "application/xml": "text",
  "application/yaml": "text",
  "application/x-yaml": "text",
};

const EXTENSION_KINDS: Record<string, UploadFileKind> = {
  png: "image",
  jpg: "image",
  jpeg: "image",
  gif: "image",
  webp: "image",
  avif: "image",
  svg: "image",
  bmp: "image",
  ico: "image",
  heic: "image",
  heif: "image",
  tif: "image",
  tiff: "image",
  pdf: "pdf",
  zip: "archive",
  tar: "archive",
  gz: "archive",
  tgz: "archive",
  rar: "archive",
  "7z": "archive",
  bz2: "archive",
  xz: "archive",
  zst: "archive",
  txt: "text",
  md: "text",
  markdown: "text",
  json: "text",
  jsonl: "text",
  csv: "text",
  tsv: "text",
  log: "text",
  xml: "text",
  yml: "text",
  yaml: "text",
  html: "text",
  htm: "text",
  css: "text",
  js: "text",
  ts: "text",
};

/** The kind of one listed file, from its MIME type when it has one and its extension otherwise. */
export function uploadFileKind(item: { name?: string; mimeType?: string }): UploadFileKind {
  const mime = item.mimeType?.trim().toLowerCase();
  if (mime) {
    if (mime.startsWith("image/")) return "image";
    if (mime.startsWith("text/")) return "text";
    const known = MIME_KINDS[mime];
    if (known) return known;
  }
  const name = item.name ?? "";
  const dot = name.lastIndexOf(".");
  if (dot > 0) {
    const extension = name.slice(dot + 1).toLowerCase();
    const known = EXTENSION_KINDS[extension];
    if (known) return known;
  }
  return "file";
}

/**
 * The mark per kind. PDF takes the prose-lines document (`FileText`) because lucide ships no PDF
 * glyph, which is also why plain/structured text takes the `</>` mark rather than the same one: a
 * `.pdf` and a `.json` on adjacent rows must not draw identically.
 */
export const UPLOAD_FILE_KIND_GLYPHS = {
  image: FileImage,
  pdf: FileText,
  archive: FileArchive,
  text: FileCode,
  file: FileGlyph,
} as const satisfies Record<UploadFileKind, IconGlyphProp["as"]>;
