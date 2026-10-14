/**
 * Exemplar screens — one reference showcase per admin archetype (gh#1294 F).
 *
 * Hand-written map only. The showcase SOURCE is embedded by scripts/gen-agent-catalog.mjs into
 * `exemplars.generated.ts` (it reads `showcase` below), and the anatomy notes come from the
 * "Admin Screen Anatomy" section of DESIGN.md — so neither is duplicated here. This file must not
 * import either generated file: the generator bundles it to learn which showcases to embed.
 */

export type ExemplarArchetype =
  "list" | "detail" | "editor" | "reader" | "settings" | "dashboard" | "approval-queue";

export interface Exemplar {
  archetype: ExemplarArchetype;
  /** Other words an agent may use for the same archetype. */
  aliases: string[];
  /** `docs/showcase/<showcase>.tsx`, served at `/showcase/<showcase>`. */
  showcase: string;
  /** `### <heading>` subsections of DESIGN.md "Admin Screen Anatomy" that describe this screen. */
  anatomy: string[];
  /** What to copy from it, in one line. */
  focus: string;
}

/** GitHub Pages project site that preview-pages.yml deploys (PREVIEW_BASE=/godxjp-ui/). */
export const PREVIEW_BASE_URL = "https://godx-jp.github.io/godxjp-ui/";

export const EXEMPLARS: Exemplar[] = [
  {
    archetype: "list",
    aliases: ["index", "table", "crud", "collection", "一覧"],
    showcase: "table-crud-list",
    anatomy: ["List"],
    focus:
      "Header actions in `extra`, Toolbar filters above the table, one Card with DataTable + Pagination.",
  },
  {
    archetype: "detail",
    aliases: ["record", "show", "master-detail", "詳細"],
    showcase: "table-master-detail",
    anatomy: ["Detail"],
    focus:
      "Record header with status Badge and actions, Descriptions metadata, history as a headed section.",
  },
  {
    archetype: "editor",
    aliases: ["form", "edit", "create", "document-editor", "record-editor", "編集"],
    showcase: "page-editor",
    anatomy: ["Editor", "Form"],
    focus:
      "One primary Save in `extra` submitting the Form by id; title field + large body editor in the main column, metadata + change note in a SplitPane aside. The body uses @godxjp/block-editor (a second package); `Textarea autoSize` fits the same FormField.",
  },
  {
    archetype: "reader",
    aliases: ["document", "article", "wiki", "view", "read", "閲覧"],
    showcase: "page-reader",
    anatomy: ["Reader"],
    focus:
      "PageContainer with breadcrumb + `extra` and NO `title`; LegalDocumentShell (@godxjp/ui/lab) owns the h1, metadata line, contents rail and prose at reading width.",
  },
  {
    archetype: "settings",
    aliases: ["preferences", "account", "設定"],
    showcase: "settings-account-sections",
    anatomy: ["Settings"],
    focus: "Heading + ListRow sections without Cards; one destructive Card at the end.",
  },
  {
    archetype: "dashboard",
    aliases: ["overview", "home", "kpi", "ダッシュボード"],
    showcase: "case1-warehouse-dashboard",
    anatomy: ["Dashboard"],
    focus: "Four StatCards with comparison deltas, then titled panels in a ResponsiveGrid.",
  },
  {
    archetype: "approval-queue",
    aliases: ["approval", "queue", "inbox", "review", "承認"],
    showcase: "table-approval-queue",
    anatomy: ["Approval queue"],
    focus: 'Decision rows in `Table preset="action-collection"`, row actions in one kebab.',
  },
];

const norm = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");

export function findExemplar(query: string): Exemplar | undefined {
  const q = norm(query);
  if (!q) return undefined;
  return EXEMPLARS.find(
    (e) => e.archetype === q || e.showcase === q || e.aliases.some((a) => norm(a) === q),
  );
}

export function exemplarPreviewUrl(showcase: string): string {
  return `${PREVIEW_BASE_URL}showcase/${showcase}`;
}
