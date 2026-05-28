/**
 * Unified preview catalog: docs .tsx files (preferred) + preview examples.
 */

import type * as React from "react";

import { DOC_ENTRIES, DOC_MAP, getDocSource, preloadDoc, type DocEntry } from "./catalog";
import {
  EXAMPLE_ENTRIES,
  EXAMPLE_MAP,
  getStorySource as getExampleSource,
  preloadStory as preloadExample,
  type StoryEntry as ExampleEntry,
} from "./example-catalog";

export type StoryEntry = {
  id: string;
  kind: "doc" | "preview";
  filePath: string;
  exportName?: string;
  groupPath: string[];
  storyName: string;
  fullTitle: string;
  layout: "fullscreen" | "padded";
  viewportWidth?: number;
  viewportHeight?: number;
  groupReadme?: string;
  storyDoc?: string;
  sourceCode: string;
  loadRender: () => Promise<React.ComponentType>;
};

export type StoryGroup = {
  name: string;
  path: string[];
  examples: StoryEntry[];
  children: StoryGroup[];
};

const PINNED_TOP_LEVEL = ["Primitives"];
const PINNED_CHILDREN_BY_PATH: Record<string, string[]> = {
  Primitives: ["Foundation"],
};

function fromDoc(entry: DocEntry): StoryEntry {
  return {
    id: entry.id,
    kind: "doc",
    filePath: entry.filePath,
    groupPath: entry.groupPath,
    storyName: entry.name,
    fullTitle: entry.groupPath.join(" / "),
    layout: entry.layout,
    viewportWidth: entry.viewportWidth,
    viewportHeight: entry.viewportHeight,
    groupReadme: entry.groupReadme,
    storyDoc: entry.storyDoc,
    sourceCode: entry.sourceCode,
    loadRender: () => preloadDoc(entry),
  };
}

function fromExample(entry: ExampleEntry): StoryEntry {
  return {
    id: entry.id,
    kind: "preview",
    filePath: entry.filePath,
    exportName: entry.exportName,
    groupPath: entry.groupPath,
    storyName: entry.storyName,
    fullTitle: entry.fullTitle,
    layout: entry.layout === "fullscreen" ? "fullscreen" : "padded",
    groupReadme: undefined,
    sourceCode: entry.sourceCode,
    loadRender: () => preloadExample(entry),
  };
}

function compareGroupName(a: string, b: string, topLevel: boolean, parentPath: string[]): number {
  if (topLevel) {
    const ai = PINNED_TOP_LEVEL.indexOf(a);
    const bi = PINNED_TOP_LEVEL.indexOf(b);
    if (ai >= 0 || bi >= 0) {
      if (ai < 0) return 1;
      if (bi < 0) return -1;
      return ai - bi;
    }
  }

  const pinned = PINNED_CHILDREN_BY_PATH[parentPath.join("/")];
  if (pinned) {
    const ai = pinned.indexOf(a);
    const bi = pinned.indexOf(b);
    if (ai >= 0 || bi >= 0) {
      if (ai < 0) return 1;
      if (bi < 0) return -1;
      return ai - bi;
    }
  }

  return a.localeCompare(b);
}

function buildTree(entries: StoryEntry[]): StoryGroup[] {
  const root: StoryGroup = { name: "", path: [], examples: [], children: [] };

  for (const entry of entries) {
    let cursor = root;
    entry.groupPath.forEach((segment, index) => {
      const path = entry.groupPath.slice(0, index + 1);
      let next = cursor.children.find((g) => g.name === segment);
      if (!next) {
        next = { name: segment, path, examples: [], children: [] };
        cursor.children.push(next);
      }
      cursor = next;
    });
    cursor.examples.push(entry);
  }

  const sortGroup = (group: StoryGroup, topLevel = false) => {
    group.children.sort((a, b) => compareGroupName(a.name, b.name, topLevel, group.path));
    group.examples.sort((a, b) => a.storyName.localeCompare(b.storyName));
    group.children.forEach((child) => sortGroup(child));
  };
  sortGroup(root, true);

  return root.children;
}

export const STORY_ENTRIES: StoryEntry[] = [
  ...DOC_ENTRIES.map(fromDoc),
  ...EXAMPLE_ENTRIES.map(fromExample),
];

export const STORY_MAP = new Map<string, StoryEntry>(
  STORY_ENTRIES.map((entry) => [entry.id, entry]),
);

export const STORY_TREE: StoryGroup[] = buildTree(STORY_ENTRIES);

export function getStorySource(entry: StoryEntry): string {
  if (entry.kind === "doc") {
    const doc = DOC_MAP.get(entry.id);
    return doc ? getDocSource(doc) : entry.sourceCode.trim();
  }
  const preview = EXAMPLE_MAP.get(entry.id);
  return preview ? getExampleSource(preview) : entry.sourceCode.trim();
}

export async function preloadStory(entry: StoryEntry): Promise<React.ComponentType> {
  return entry.loadRender();
}
