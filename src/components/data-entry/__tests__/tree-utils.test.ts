import { describe, expect, it } from "vitest";

import {
  collectAllExpandableKeys,
  collectAllPaths,
  collectLeafPaths,
  filterTreeOptions,
  filterVisibleTree,
  findNodeByValue,
  flattenVisibleTree,
  formatPathLabels,
  getDescendantValues,
  getNodeByPath,
  getOptionsAtPath,
  normalizeTreeOptions,
  pathKey,
  pathsEqual,
  reactNodeText,
} from "../tree-utils";

const RAW = [
  {
    value: "asia",
    label: "Asia",
    children: [
      { value: "jp", label: "Japan" },
      { value: "vn", label: "Vietnam", isLeaf: true },
    ],
  },
  { value: "eu", label: "Europe", disabled: true, children: [{ value: "fr", label: "France" }] },
];
const tree = normalizeTreeOptions(RAW);

describe("reactNodeText", () => {
  it("stringifies primitives and joins arrays, blank for null/boolean/objects", () => {
    expect(reactNodeText("hi")).toBe("hi");
    expect(reactNodeText(42)).toBe("42");
    expect(reactNodeText(10n)).toBe("10");
    expect(reactNodeText(["a", 1, "b"])).toBe("a1b");
    expect(reactNodeText(null)).toBe("");
    expect(reactNodeText(true)).toBe("");
    expect(reactNodeText({ not: "a node" } as never)).toBe("");
  });
});

describe("normalizeTreeOptions", () => {
  it("returns [] for empty/undefined input", () => {
    expect(normalizeTreeOptions(undefined)).toEqual([]);
    expect(normalizeTreeOptions([])).toEqual([]);
  });

  it("normalises flags, label fallback and non-array children", () => {
    const t = normalizeTreeOptions([
      { value: "x", disabled: true, disableCheckbox: true, children: "nope" },
    ]);
    expect(t[0]).toMatchObject({ value: "x", label: "x", disabled: true, disableCheckbox: true });
    expect(t[0].children).toBeUndefined(); // non-array children dropped
  });

  it("honours custom fieldNames", () => {
    const t = normalizeTreeOptions(
      [{ id: "a", name: "Alpha", kids: [{ id: "b", name: "Beta" }] }],
      {
        value: "id",
        label: "name",
        children: "kids",
      },
    );
    expect(t[0].value).toBe("a");
    expect(t[0].label).toBe("Alpha");
    expect(t[0].children?.[0].value).toBe("b");
  });
});

describe("path helpers", () => {
  it("getNodeByPath walks the chain and stops at a missing segment", () => {
    expect(getNodeByPath(tree, ["asia", "jp"]).map((n) => n.value)).toEqual(["asia", "jp"]);
    expect(getNodeByPath(tree, ["asia", "zz"]).map((n) => n.value)).toEqual(["asia"]);
  });

  it("getOptionsAtPath returns roots for empty path, children otherwise", () => {
    expect(getOptionsAtPath(tree, []).map((n) => n.value)).toEqual(["asia", "eu"]);
    expect(getOptionsAtPath(tree, ["asia"]).map((n) => n.value)).toEqual(["jp", "vn"]);
    expect(getOptionsAtPath(tree, ["asia", "jp"])).toEqual([]); // leaf → no children
  });

  it("formatPathLabels joins labels", () => {
    expect(formatPathLabels(getNodeByPath(tree, ["asia", "jp"]))).toBe("Asia / Japan");
  });

  it("pathKey + pathsEqual", () => {
    expect(pathKey(["a", "b"])).toBe("a\0b");
    expect(pathsEqual(["a", "b"], ["a", "b"])).toBe(true);
    expect(pathsEqual(["a"], ["a", "b"])).toBe(false);
    expect(pathsEqual(["a", "x"], ["a", "b"])).toBe(false);
  });
});

describe("path collection + filtering", () => {
  it("collectLeafPaths returns leaves (isLeaf override counts as a leaf)", () => {
    const leaves = collectLeafPaths(tree).map((p) => p.path.join("/"));
    expect(leaves).toContain("asia/jp");
    expect(leaves).toContain("asia/vn");
    expect(leaves).toContain("eu/fr");
    expect(leaves).not.toContain("asia"); // parents excluded
  });

  it("collectAllPaths includes parents and children", () => {
    const all = collectAllPaths(tree).map((p) => p.path.join("/"));
    expect(all).toContain("asia");
    expect(all).toContain("asia/jp");
  });

  it("filterTreeOptions: empty query → [], label match, custom filter", () => {
    expect(filterTreeOptions(tree, "  ")).toEqual([]);
    expect(filterTreeOptions(tree, "japan").map((p) => p.path.join("/"))).toEqual(["asia/jp"]);
    const custom = filterTreeOptions(tree, "x", (_q, chain) => chain.some((n) => n.value === "fr"));
    expect(custom.map((p) => p.path.join("/"))).toEqual(["eu/fr"]);
  });
});

describe("tree navigation helpers", () => {
  it("getDescendantValues collects self + all descendants", () => {
    expect(getDescendantValues(tree[0])).toEqual(["asia", "jp", "vn"]);
  });

  it("flattenVisibleTree hides collapsed children and treats isLeaf as no-children", () => {
    const collapsed = flattenVisibleTree(tree, new Set());
    expect(collapsed.map((r) => r.node.value)).toEqual(["asia", "eu"]);

    const expanded = flattenVisibleTree(tree, new Set(["asia"]));
    expect(expanded.map((r) => r.node.value)).toEqual(["asia", "jp", "vn", "eu"]);
    // vn has isLeaf=true → no expand affordance even though we gave it none
    expect(expanded.find((r) => r.node.value === "vn")!.hasChildren).toBe(false);
  });

  it("filterVisibleTree expands matching branches; empty query expands everything", () => {
    const all = filterVisibleTree(tree, "");
    expect(all.map((r) => r.node.value)).toContain("fr"); // every expandable open

    const matched = filterVisibleTree(tree, "france").map((r) => r.node.value);
    expect(matched).toContain("eu"); // ancestor auto-expanded
    expect(matched).toContain("fr");
  });

  it("collectAllExpandableKeys lists only branch nodes", () => {
    expect(collectAllExpandableKeys(tree)).toEqual(["asia", "eu"]);
  });

  it("findNodeByValue finds root, nested, and returns undefined for misses", () => {
    expect(findNodeByValue(tree, "asia")?.label).toBe("Asia");
    expect(findNodeByValue(tree, "fr")?.label).toBe("France");
    expect(findNodeByValue(tree, "nope")).toBeUndefined();
  });
});
