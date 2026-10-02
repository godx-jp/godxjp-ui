import { registerMessages } from "@godxjp/ui/i18n";

/**
 * The editor's strings, under its own namespace (`markdownEditor`), registered with the kit's
 * catalogue the first time an editor renders. Registered from the component, not from a top-level
 * side-effect import: with `sideEffects: false` a bundler is allowed to drop an import that binds
 * nothing, and the editor would then render raw `markdownEditor.*` keys.
 */
export const EDITOR_MESSAGES = {
  ja: {
    toolbar: "書式",
    mode: "表示",
    write: "編集",
    preview: "プレビュー",
    split: "並べて表示",
    bold: "太字",
    italic: "斜体",
    strike: "取り消し線",
    heading: "見出し",
    link: "リンク",
    code: "コード",
    codeBlock: "コードブロック",
    bulletList: "箇条書き",
    numberedList: "番号付きリスト",
    taskList: "チェックリスト",
    quote: "引用",
    attach: "ファイルを添付",
    placeholderText: "テキスト",
    placeholderLink: "リンクの文字",
    emptyPreview: "プレビューする内容はまだありません。",
    uploading: "アップロード中",
    uploadingStatus: "アップロード中…",
    uploadFailed: "{name} をアップロードできませんでした。",
  },
  en: {
    toolbar: "Formatting",
    mode: "View",
    write: "Write",
    preview: "Preview",
    split: "Side by side",
    bold: "Bold",
    italic: "Italic",
    strike: "Strikethrough",
    heading: "Heading",
    link: "Link",
    code: "Code",
    codeBlock: "Code block",
    bulletList: "Bulleted list",
    numberedList: "Numbered list",
    taskList: "Checklist",
    quote: "Quote",
    attach: "Attach a file",
    placeholderText: "text",
    placeholderLink: "link text",
    emptyPreview: "Nothing to preview yet.",
    uploading: "Uploading",
    uploadingStatus: "Uploading…",
    uploadFailed: "Could not upload {name}.",
  },
  vi: {
    toolbar: "Định dạng",
    mode: "Chế độ xem",
    write: "Soạn",
    preview: "Xem trước",
    split: "Song song",
    bold: "In đậm",
    italic: "In nghiêng",
    strike: "Gạch ngang",
    heading: "Tiêu đề",
    link: "Liên kết",
    code: "Mã",
    codeBlock: "Khối mã",
    bulletList: "Danh sách gạch đầu dòng",
    numberedList: "Danh sách đánh số",
    taskList: "Danh sách việc",
    quote: "Trích dẫn",
    attach: "Đính kèm tệp",
    placeholderText: "văn bản",
    placeholderLink: "chữ của liên kết",
    emptyPreview: "Chưa có nội dung để xem trước.",
    uploading: "Đang tải lên",
    uploadingStatus: "Đang tải lên…",
    uploadFailed: "Không tải lên được {name}.",
  },
} as const;

export type MarkdownEditorLabels = { [K in keyof (typeof EDITOR_MESSAGES)["en"]]: string };

let registered = false;

/** Idempotent: the first editor to render registers the three catalogues. */
export function ensureEditorMessages(): void {
  if (registered) return;
  registered = true;
  for (const locale of ["ja", "en", "vi"] as const) {
    registerMessages(locale, { markdownEditor: EDITOR_MESSAGES[locale] });
  }
}
