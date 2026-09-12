/**
 * The measurement contract is read by somebody else's CI, so the things that make it usable —
 * the selectors, the floor, the doc anchors it points at — are asserted here rather than assumed.
 *
 * The browser half of the promise (the target really does reach 24px) belongs to
 * `scripts/check-measurement-contract.mjs`, which hit-tests it; a pseudo-element's target is not
 * observable in jsdom. What is observable here is that the contract's claims match the CSS it was
 * generated from and the docs it sends a reader to — the drift that let gh#503/#506/#507 be closed
 * four times on a fact nobody could look up.
 */
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import contract from "../measurement.json";

const controlCss = readFileSync("src/styles/control.css", "utf8");
const tableCss = readFileSync("src/styles/table-layout.css", "utf8");
const allCss = `${controlCss}\n${tableCss}`;

describe("measurement contract", () => {
  it("publishes the WCAG 2.2 SC 2.5.8 floor, and the token agrees with it", () => {
    expect(contract.targetSize.min).toBe(24);
    // 1.5rem at the 16px root the library assumes. If the token moves, the contract lies.
    expect(readFileSync("src/tokens/foundation.css", "utf8")).toMatch(
      /--touch-target-min:\s*1\.5rem/,
    );
  });

  it("says it measures the target, not the paint — the whole point of the file", () => {
    expect(contract.targetSize.measures).toBe("target");
    expect(contract.targetSize.note).toContain("getBoundingClientRect");
  });

  it("names every selector whose target is carried by a pseudo-element, and no others", () => {
    const declared = contract.targetSize.expanders.map((e) => e.selector).sort();

    // Re-derive from the CSS the way the generator does, so a new ::after that reaches the floor
    // cannot ship without appearing in the contract a consumer gate reads.
    const found = new Set<string>();
    for (const [, selector, body] of allCss
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      if (!body.includes("--touch-target-min")) continue;
      const m = /^(\S+)::(after|before)$/.exec(selector.trim().replace(/\s+/g, " "));
      if (m) found.add(m[1]);
    }

    expect(declared).toEqual([...found].sort());
    expect(declared.length).toBeGreaterThan(0);
  });

  it("gives each expander a floor and at least one component that renders it", () => {
    for (const entry of contract.targetSize.expanders) {
      expect(entry.targetMin).toBe(contract.targetSize.min);
      expect(entry.via).toMatch(/^::(after|before)$/);
      expect(entry.components.length).toBeGreaterThan(0);
    }
  });

  it("keeps the spacing half pointed at a heading that exists in SPACING.md", () => {
    const [file, anchor] = contract.spacing.reference.split("#");
    const headings = readFileSync(file, "utf8")
      .split("\n")
      .filter((line) => line.startsWith("#"))
      .map((line) =>
        line
          .replace(/^#+\s*/, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),
      );
    expect(headings).toContain(anchor);
  });

  it("keeps the measuring method pointed at a heading that exists", () => {
    const [file, anchor] = contract.targetSize.method.split("#");
    const doc = readFileSync(file, "utf8");
    expect(doc).toContain("elementFromPoint");
    const headings = doc
      .split("\n")
      .filter((line) => line.startsWith("#"))
      .map((line) =>
        line
          .replace(/^#+\s*/, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),
      );
    expect(headings).toContain(anchor);
  });

  it("ships at the package version, so a consumer can tell which release it describes", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8")) as { version: string };
    expect(contract.version).toBe(pkg.version);
  });

  it("is reachable from the package's exports map, not only from disk", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8")) as {
      exports: Record<string, unknown>;
    };
    expect(pkg.exports["./contracts/measurement.json"]).toBe("./dist/contracts/measurement.json");
  });
});
