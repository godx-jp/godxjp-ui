/**
 * Doc catalog: folder tree from docs .tsx files.
 * One preview entry = one .tsx (+ optional same-name .md).
 * README.md in folders = group intro.
 * Code preview = raw .tsx file.
 */

import * as React from "react";

import { parseFrontmatter, type Frontmatter } from "./markdown";

export type DocEntry = {
  id: string;
  filePath: string;
  groupPath: string[];
  name: string;
  layout: "fullscreen" | "padded";
  viewportWidth?: number;
  viewportHeight?: number;
  groupReadme?: string;
  storyDoc?: string;
  sourceCode: string;
  loadDemo: () => Promise<React.ComponentType>;
};

export type DocGroup = {
  name: string;
  path: string[];
  entries: DocEntry[];
  children: DocGroup[];
};

type DemoModule = { default?: React.ComponentType };

const demoLoaders = import.meta.glob<DemoModule>("../../docs/**/*.tsx");
const rawDemos = import.meta.glob<string>("../../docs/**/*.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
});
const rawMarkdown = import.meta.glob<string>("../../docs/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const renderCache = new Map<string, React.ComponentType>();

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const TITLE_SMALL_WORDS = new Set([
  "a",
  "an",
  "and",
  "at",
  "for",
  "in",
  "of",
  "on",
  "or",
  "the",
  "to",
]);

function titleCaseSegment(segment: string): string {
  return segment
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part, index) => {
      const lower = part.toLowerCase();
      if (index > 0 && TITLE_SMALL_WORDS.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

function relFromDocs(filePath: string): string {
  return filePath.replace(/^\.\.\/\.\.\/docs\//, "").replace(/\.tsx$/, "");
}

function isStoryTsx(rel: string): boolean {
  const base = rel.split("/").pop() ?? "";
  return !base.startsWith("_");
}

function groupPathFromRel(rel: string): string[] {
  const parts = rel.split("/");
  parts.pop();
  return parts.map(titleCaseSegment);
}

function readmeKeyFromRel(relDir: string): string {
  return `../../docs/${relDir}/README.md`;
}

/** README of the preview entry's direct folder only — not ancestor folders. */
function directGroupReadme(rel: string): string | undefined {
  const parts = rel.split("/");
  parts.pop();
  if (parts.length === 0) return undefined;
  const key = readmeKeyFromRel(parts.join("/"));
  return rawMarkdown[key];
}

function storyNameFromFile(rel: string, frontmatter: Frontmatter): string {
  if (frontmatter.title) return frontmatter.title;
  const base = rel.split("/").pop() ?? rel;
  return titleCaseSegment(base);
}

function createLoadDemo(
  entry: Pick<DocEntry, "id" | "filePath">,
): () => Promise<React.ComponentType> {
  return async () => {
    const cached = renderCache.get(entry.id);
    if (cached) return cached;

    const loader = demoLoaders[entry.filePath];
    if (!loader) throw new Error(`Demo not found: ${entry.filePath}`);

    const mod = await loader();
    const Demo = mod.default;
    if (!Demo) throw new Error(`Demo "${entry.filePath}" must default-export a component`);

    renderCache.set(entry.id, Demo);
    return Demo;
  };
}

function buildDocEntries(): DocEntry[] {
  const entries: DocEntry[] = [];

  for (const [filePath, sourceCode] of Object.entries(rawDemos)) {
    const rel = relFromDocs(filePath);
    if (!isStoryTsx(rel)) continue;

    const groupPath = groupPathFromRel(rel);
    const mdKey = `../../docs/${rel}.md`;
    const mdRaw = rawMarkdown[mdKey];
    const { frontmatter, body } = mdRaw ? parseFrontmatter(mdRaw) : { frontmatter: {}, body: "" };
    const name = storyNameFromFile(rel, frontmatter);
    const id = frontmatter.slug ?? slugify(rel.replace(/\//g, "-"));

    entries.push({
      id,
      filePath,
      groupPath,
      name,
      layout: frontmatter.layout ?? "fullscreen",
      viewportWidth: frontmatter.width,
      viewportHeight: frontmatter.height,
      groupReadme: directGroupReadme(rel),
      storyDoc: body.trim() ? mdRaw : undefined,
      sourceCode,
      loadDemo: createLoadDemo({ id, filePath }),
    });
  }

  entries.sort(
    (a, b) =>
      a.groupPath.join("/").localeCompare(b.groupPath.join("/")) || a.name.localeCompare(b.name),
  );
  return entries;
}

/** Top-level groups pinned first in sidebar. */
const PINNED_TOP_LEVEL = ["Primitives"];

function compareGroupName(a: string, b: string, topLevel: boolean): number {
  if (topLevel) {
    const ai = PINNED_TOP_LEVEL.indexOf(a);
    const bi = PINNED_TOP_LEVEL.indexOf(b);
    if (ai >= 0 || bi >= 0) {
      if (ai < 0) return 1;
      if (bi < 0) return -1;
      return ai - bi;
    }
  }
  return a.localeCompare(b);
}

function buildTree(entries: DocEntry[]): DocGroup[] {
  const root: DocGroup = { name: "", path: [], entries: [], children: [] };

  for (const entry of entries) {
    let cursor = root;
    entry.groupPath.forEach((segment, index) => {
      const path = entry.groupPath.slice(0, index + 1);
      let next = cursor.children.find((g) => g.name === segment);
      if (!next) {
        next = { name: segment, path, entries: [], children: [] };
        cursor.children.push(next);
      }
      cursor = next;
    });
    cursor.entries.push(entry);
  }

  const sortGroup = (group: DocGroup, topLevel = false) => {
    group.children.sort((a, b) => compareGroupName(a.name, b.name, topLevel));
    group.entries.sort((a, b) => a.name.localeCompare(b.name));
    group.children.forEach((child) => sortGroup(child));
  };
  sortGroup(root, true);

  return root.children;
}

export const DOC_ENTRIES: DocEntry[] = buildDocEntries();
export const DOC_TREE: DocGroup[] = buildTree(DOC_ENTRIES);
export const DOC_MAP: Map<string, DocEntry> = new Map(DOC_ENTRIES.map((e) => [e.id, e]));

export function getDocSource(entry: DocEntry): string {
  return entry.sourceCode.trim();
}

export async function preloadDoc(entry: DocEntry): Promise<React.ComponentType> {
  return entry.loadDemo();
}
