import type * as React from "react";

/** Normalized tree node — Ant Design `treeData` / Cascader `options`. */
export type TreeOption = {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
  disableCheckbox?: boolean;
  /** When false with `loadData`, shows expand affordance */
  isLeaf?: boolean;
  children?: TreeOption[];
};

export type TreeFieldNames = {
  label?: string;
  value?: string;
  children?: string;
};

export type NormalizedTreeOption = TreeOption & { children?: NormalizedTreeOption[] };

type RawTreeNode = Record<string, unknown>;

export function reactNodeText(value: React.ReactNode): string {
  if (value == null || typeof value === "boolean") return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "bigint") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return (value as React.ReactNode[]).map((item) => reactNodeText(item)).join("");
  }
  return "";
}

function unknownText(value: unknown): string {
  if (typeof value === "string" || typeof value === "number" || typeof value === "bigint") {
    return String(value);
  }
  return "";
}

export function normalizeTreeOptions(
  nodes: RawTreeNode[] | undefined,
  fieldNames?: TreeFieldNames,
): NormalizedTreeOption[] {
  if (!nodes?.length) return [];
  const labelKey = fieldNames?.label ?? "label";
  const valueKey = fieldNames?.value ?? "value";
  const childrenKey = fieldNames?.children ?? "children";

  return nodes.map((node) => {
    const children = node[childrenKey];
    const value = unknownText(node[valueKey]);
    const label = node[labelKey] as React.ReactNode;
    return {
      value,
      label: label ?? value,
      disabled: Boolean(node.disabled),
      disableCheckbox: Boolean(node.disableCheckbox),
      isLeaf: node.isLeaf as boolean | undefined,
      children: Array.isArray(children)
        ? normalizeTreeOptions(children as RawTreeNode[], fieldNames)
        : undefined,
    };
  });
}

export function getNodeByPath(
  options: NormalizedTreeOption[],
  path: string[],
): NormalizedTreeOption[] {
  const chain: NormalizedTreeOption[] = [];
  let level = options;
  for (const segment of path) {
    const found = level.find((n) => n.value === segment);
    if (!found) break;
    chain.push(found);
    level = found.children ?? [];
  }
  return chain;
}

export function getOptionsAtPath(
  options: NormalizedTreeOption[],
  path: string[],
): NormalizedTreeOption[] {
  if (!path.length) return options;
  const chain = getNodeByPath(options, path);
  return chain.at(-1)?.children ?? [];
}

export function formatPathLabels(chain: NormalizedTreeOption[], separator = " / "): string {
  return chain.map((n) => reactNodeText(n.label)).join(separator);
}

export type TreePath = { path: string[]; labels: string[] };

export function collectLeafPaths(
  options: NormalizedTreeOption[],
  prefix: string[] = [],
  root: NormalizedTreeOption[] = options,
): TreePath[] {
  const out: TreePath[] = [];
  for (const node of options) {
    const path = [...prefix, node.value];
    const hasChildren = (node.children?.length ?? 0) > 0;
    if (!hasChildren || node.isLeaf === true) {
      out.push({ path, labels: getNodeByPath(root, path).map((n) => reactNodeText(n.label)) });
    }
    if (hasChildren) out.push(...collectLeafPaths(node.children!, path, root));
  }
  return out;
}

export function collectAllPaths(
  options: NormalizedTreeOption[],
  prefix: string[] = [],
  root: NormalizedTreeOption[] = options,
): TreePath[] {
  const out: TreePath[] = [];
  for (const node of options) {
    const path = [...prefix, node.value];
    out.push({ path, labels: getNodeByPath(root, path).map((n) => reactNodeText(n.label)) });
    if (node.children?.length) out.push(...collectAllPaths(node.children, path, root));
  }
  return out;
}

export function pathKey(path: string[]): string {
  return path.join("\0");
}

export function pathsEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

export function filterTreeOptions(
  options: NormalizedTreeOption[],
  query: string,
  filter?: (query: string, path: NormalizedTreeOption[]) => boolean,
): TreePath[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const paths = collectLeafPaths(options);
  return paths.filter(({ path }) => {
    const chain = getNodeByPath(options, path);
    if (filter) return filter(query, chain);
    return chain.some((n) => reactNodeText(n.label).toLowerCase().includes(q));
  });
}

export function getDescendantValues(node: NormalizedTreeOption): string[] {
  const values: string[] = [node.value];
  for (const child of node.children ?? []) values.push(...getDescendantValues(child));
  return values;
}

export function flattenVisibleTree(
  options: NormalizedTreeOption[],
  expandedKeys: Set<string>,
  depth = 0,
): { node: NormalizedTreeOption; depth: number; hasChildren: boolean }[] {
  const out: { node: NormalizedTreeOption; depth: number; hasChildren: boolean }[] = [];
  for (const node of options) {
    const hasChildren = (node.children?.length ?? 0) > 0 && node.isLeaf !== true;
    out.push({ node, depth, hasChildren });
    if (hasChildren && expandedKeys.has(node.value)) {
      out.push(...flattenVisibleTree(node.children!, expandedKeys, depth + 1));
    }
  }
  return out;
}

export function filterVisibleTree(
  options: NormalizedTreeOption[],
  query: string,
): { node: NormalizedTreeOption; depth: number; hasChildren: boolean }[] {
  const q = query.trim().toLowerCase();
  if (!q) return flattenVisibleTree(options, new Set(collectAllExpandableKeys(options)));

  const expanded = new Set<string>();

  function walk(nodes: NormalizedTreeOption[], depth: number): boolean {
    let branchMatch = false;
    for (const node of nodes) {
      const selfMatch = reactNodeText(node.label).toLowerCase().includes(q);
      const childMatch = node.children?.length ? walk(node.children, depth + 1) : false;
      if (selfMatch || childMatch) {
        branchMatch = true;
        if (childMatch) expanded.add(node.value);
      }
    }
    return branchMatch;
  }

  walk(options, 0);
  return flattenVisibleTree(options, expanded);
}

export function collectAllExpandableKeys(options: NormalizedTreeOption[]): string[] {
  const keys: string[] = [];
  for (const node of options) {
    if ((node.children?.length ?? 0) > 0 && node.isLeaf !== true) {
      keys.push(node.value);
      keys.push(...collectAllExpandableKeys(node.children!));
    }
  }
  return keys;
}

export function findNodeByValue(
  options: NormalizedTreeOption[],
  value: string,
): NormalizedTreeOption | undefined {
  for (const node of options) {
    if (node.value === value) return node;
    const nested = node.children ? findNodeByValue(node.children, value) : undefined;
    if (nested) return nested;
  }
  return undefined;
}
