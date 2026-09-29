import type * as React from "react";

/** Normalized tree node — the conventional `treeData` / Cascader `options` shape. */
export type TreeOption = {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
  disableCheckbox?: boolean;
  /** When false with `loadData`, shows expand affordance */
  isLeaf?: boolean;
  /**
   * Per-node glyph, drawn by `Tree` when `showIcon` is on. Carried through the normalizer so the
   * page tree and the dropdown tree keep ONE node shape; `TreeSelect` simply never reads it.
   */
  icon?: React.ReactNode;
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
      icon: node.icon as React.ReactNode,
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

  function matches(
    nodes: NormalizedTreeOption[],
    depth: number,
  ): ReturnType<typeof flattenVisibleTree> {
    return nodes.flatMap((node) => {
      const children = node.isLeaf ? [] : matches(node.children ?? [], depth + 1);
      if (!reactNodeText(node.label).toLowerCase().includes(q) && children.length === 0) return [];
      return [{ node, depth, hasChildren: children.length > 0 }, ...children];
    });
  }

  return matches(options, 0);
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

/**
 * rc-tree gives up on a node after this many rejected `loadData` calls and treats it as loaded
 * (rc-tree `MAX_RETRY_TIMES`), so a permanently broken endpoint cannot be hammered forever.
 */
export const MAX_LAZY_LOAD_RETRIES = 10;

/**
 * The lazy-children ledger shared by `Tree`, `TreeSelect` and `Cascader` — rc-tree's
 * `loadedKeys` / `loadingKeys` / `loadingRetryTimes`, in one place (gh#1041).
 *
 * A key is asked for at most once while in flight and never again once it RESOLVED. A REJECTED
 * load is not "loaded": the key leaves the in-flight set and the next expand asks again, until
 * `MAX_LAZY_LOAD_RETRIES` failures. The old per-component ledgers recorded the key before the
 * promise settled and never cleared it, so one network blip left a branch unloadable for the life
 * of the component.
 */
export type LazyLoadLedger = {
  /**
   * Call `load` for `key` unless it is in flight or already loaded. A synchronous throw counts
   * as a rejection. `onSettle(ok)` runs once the load settles. Returns whether `load` was called.
   */
  run: (key: string, load: () => void | Promise<void>, onSettle?: (ok: boolean) => void) => boolean;
};

export function createLazyLoadLedger(): LazyLoadLedger {
  const loaded = new Set<string>();
  const inFlight = new Set<string>();
  const failures = new Map<string, number>();
  return {
    run(key, load, onSettle) {
      if (loaded.has(key) || inFlight.has(key)) return false;
      inFlight.add(key);
      new Promise<void>((resolve) => resolve(load())).then(
        () => {
          inFlight.delete(key);
          loaded.add(key);
          onSettle?.(true);
        },
        () => {
          inFlight.delete(key);
          const count = (failures.get(key) ?? 0) + 1;
          failures.set(key, count);
          if (count >= MAX_LAZY_LOAD_RETRIES) loaded.add(key);
          onSettle?.(false);
        },
      );
      return true;
    },
  };
}
