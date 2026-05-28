/**
 * Example catalog index — examples/*.preview.tsx.
 * Prefer docs .tsx for primitive documentation demos.
 */

import * as React from "react";

import { resolveStorySource } from "./source";

export type StoryEntry = {
  id: string;
  filePath: string;
  exportName: string;
  groupPath: string[];
  storyName: string;
  fullTitle: string;
  layout?: string;
  sourceCode: string;
  loadRender: () => Promise<React.ComponentType>;
};

export type StoryGroup = {
  name: string;
  path: string[];
  entries: StoryEntry[];
  children: StoryGroup[];
};

type PreviewModule = {
  default?: {
    title?: string;
    component?: React.ComponentType;
    parameters?: { layout?: string };
  };
  [key: string]: unknown;
};

type PreviewCaseExport = {
  name?: string;
  args?: Record<string, unknown>;
  render?: () => React.ReactNode;
  parameters?: { layout?: string; docs?: { source?: { code?: string } } };
};

const rawModules = import.meta.glob<string>("../../examples/**/*.preview.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
});

const moduleLoaders = import.meta.glob<PreviewModule>("../../examples/**/*.preview.tsx");

const renderCache = new Map<string, React.ComponentType>();
const sourceCache = new Map<string, string>();

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseTitle(raw: string): string | undefined {
  const match = raw.match(/title:\s*["']([^"']+)["']/);
  return match?.[1];
}

function parseDefaultLayout(raw: string): string | undefined {
  const match = raw.match(/layout:\s*["'](\w+)["']/);
  return match?.[1];
}

function parseExports(raw: string): Array<{ exportName: string; storyName: string }> {
  const results: Array<{ exportName: string; storyName: string }> = [];
  const re = /export const (\w+)(?:\s*:\s*(?:PreviewCase|Story)(?:<[^>]*>)?)?\s*=\s*\{/g;

  for (const match of raw.matchAll(re)) {
    const exportName = match[1]!;
    const blockStart = match.index! + match[0].length - 1;
    const blockEnd = findMatchingBrace(raw, blockStart);
    const block = blockEnd >= 0 ? raw.slice(blockStart, blockEnd + 1) : "";
    const nameMatch = block.match(/name:\s*["']([^"']+)["']/);
    results.push({ exportName, storyName: nameMatch?.[1] ?? exportName });
  }

  return results;
}

function findMatchingBrace(source: string, openIndex: number): number {
  let depth = 0;
  let quote: '"' | "'" | "`" | null = null;
  let escaped = false;

  for (let i = openIndex; i < source.length; i += 1) {
    const char = source[i]!;

    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = null;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }

  return -1;
}

function isPreviewCaseExport(value: unknown): value is PreviewCaseExport {
  return typeof value === "object" && value !== null;
}

function componentNameFromModule(mod: PreviewModule): string | undefined {
  const component = mod.default?.component;
  if (!component) return undefined;
  return component.displayName || component.name || undefined;
}

function buildRender(
  mod: PreviewModule,
  exportName: string,
  entry: Pick<StoryEntry, "filePath" | "exportName">,
): React.ComponentType | null {
  const exported = mod[exportName];
  if (!isPreviewCaseExport(exported)) return null;

  const FallbackComponent = mod.default?.component;

  if (typeof exported.render === "function") {
    const renderFn = exported.render;
    return function PreviewRender() {
      return renderFn() as React.ReactElement;
    };
  }

  if (FallbackComponent && exported.args) {
    const args = exported.args;
    return function PreviewRender() {
      return React.createElement(FallbackComponent, args);
    };
  }

  if (FallbackComponent) {
    return function PreviewRender() {
      return React.createElement(FallbackComponent);
    };
  }

  return null;
}

function createLoadRender(
  entry: Pick<StoryEntry, "id" | "filePath" | "exportName">,
): () => Promise<React.ComponentType> {
  return async () => {
    const cached = renderCache.get(entry.id);
    if (cached) return cached;

    const loader = moduleLoaders[entry.filePath];
    if (!loader) throw new Error(`Preview module not found: ${entry.filePath}`);

    const mod = await loader();
    const Render = buildRender(mod, entry.exportName, entry);
    if (!Render)
      throw new Error(`Preview export "${entry.exportName}" has no render() or component fallback`);

    const raw = rawModules[entry.filePath] ?? "";
    const exported = mod[entry.exportName];
    const source = resolveStorySource(
      raw,
      entry.exportName,
      isPreviewCaseExport(exported) ? exported : undefined,
      componentNameFromModule(mod),
    );
    sourceCache.set(entry.id, source);

    renderCache.set(entry.id, Render);
    return Render;
  };
}

function buildEntries(): StoryEntry[] {
  const entries: StoryEntry[] = [];

  for (const [filePath, raw] of Object.entries(rawModules)) {
    if (filePath.includes("/primitives/")) continue;
    const title = parseTitle(raw);
    if (!title) continue;

    const groupPath = title
      .split("/")
      .map((segment) => segment.trim())
      .filter(Boolean);
    if (groupPath.length === 0) continue;

    const defaultLayout = parseDefaultLayout(raw);

    for (const { exportName, storyName } of parseExports(raw)) {
      const id = `${slugify(title)}--${slugify(storyName)}`;
      const entryBase = {
        id,
        filePath,
        exportName,
        groupPath,
        storyName,
        fullTitle: title,
        layout: defaultLayout,
      };

      entries.push({
        ...entryBase,
        sourceCode: resolveStorySource(raw, exportName),
        loadRender: createLoadRender(entryBase),
      });
    }
  }

  entries.sort(
    (a, b) => a.fullTitle.localeCompare(b.fullTitle) || a.storyName.localeCompare(b.storyName),
  );
  return entries;
}

/** Top-level preview groups pinned to the front of the sidebar (rest stays A-Z). */
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

function buildTree(entries: StoryEntry[]): StoryGroup[] {
  const root: StoryGroup = { name: "", path: [], entries: [], children: [] };

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

  const sortGroup = (group: StoryGroup, topLevel = false) => {
    group.children.sort((a, b) => compareGroupName(a.name, b.name, topLevel));
    group.children.forEach((child) => sortGroup(child));
  };
  sortGroup(root, true);

  return root.children;
}

export const EXAMPLE_ENTRIES: StoryEntry[] = buildEntries();
export const EXAMPLE_TREE: StoryGroup[] = buildTree(EXAMPLE_ENTRIES);
export const EXAMPLE_MAP: Map<string, StoryEntry> = new Map(EXAMPLE_ENTRIES.map((e) => [e.id, e]));

export function getStorySource(entry: StoryEntry): string {
  return sourceCache.get(entry.id) ?? entry.sourceCode;
}

export async function preloadStory(entry: StoryEntry): Promise<React.ComponentType> {
  return entry.loadRender();
}
