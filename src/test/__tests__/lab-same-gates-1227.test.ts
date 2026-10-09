import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * `@godxjp/ui/lab` SHIPS WITH THE SAME GATES AS CORE (gh#1227, decision B3 on #1205).
 *
 * 32.0.0 moved 15 components to `src/lab/`, and three gates kept looking only under
 * `src/components/`:
 *
 * - the frame-coverage discovery scanned `src/components/<group>/index.ts`, so all 20 lab exports
 *   left the coverage ledger (FloatButton's covered `shapes` cell with them, Carousel's known gaps
 *   deleted to keep the gate green);
 * - the API manifest counted a prop as "owned" only when declared under `src/components/` or
 *   `src/props/components/`, so Carousel (3 props) and RangeTimeline (19), which declare theirs in
 *   their own file, read as taking none;
 * - the screen-reader cohorts lost Carousel and LegalDocumentShell.
 *
 * Like gh#957's test, this asserts the COMMITTED artefacts: `check:component-api-manifest` and
 * `check:frame-coverage-ledger` already fail when they disagree with their generators.
 */
const read = (file: string) => JSON.parse(readFileSync(resolve(file), "utf8"));
const manifest = read("component-api-manifest.json") as {
  components: Record<string, { props: { name: string }[] }>;
};
const ledger = read("preview/frame-coverage.ledger.json") as {
  components: Record<string, { owner: string }>;
  policy: { knownGaps: { id: string; targets: string[] }[] };
};
const evidence = read("screen-reader-evidence.json") as {
  policy: { cohorts: { id: string; owners: string[] }[]; complexOwners: string[] };
};

/** The PascalCase value exports of the lab barrel (type exports are `export type { … }`). */
const labExports = [
  ...readFileSync(resolve("src/lab/index.ts"), "utf8").matchAll(/export\s*\{([^}]*)\}\s*from/g),
].flatMap((match) =>
  match[1]!
    .split(",")
    .map((name) => name.trim())
    .filter((name) => /^[A-Z][A-Za-z0-9]*$/.test(name)),
);

describe("lab exports are under the same gates as core (gh#1227)", () => {
  it("reads the lab barrel — an empty list would make the next assertion vacuous", () => {
    expect(labExports.length).toBeGreaterThanOrEqual(15);
    expect(labExports).toContain("Carousel");
  });

  it("every lab export has a frame-coverage ledger row under a lab/ owner", () => {
    const missing = labExports.filter((name) => !ledger.components[name]?.owner.startsWith("lab/"));
    expect(missing).toEqual([]);
  });

  it("keeps Carousel's known contract gaps open", () => {
    const gap = ledger.policy.knownGaps.find((entry) => entry.id === "carousel-contract-gaps");
    expect(gap?.targets).toEqual(["Carousel"]);
  });

  it.each([
    ["Carousel", ["opts", "plugins", "setApi"]],
    ["RangeTimeline", ["rows", "columns", "onRangeChange"]],
  ])("the API manifest lists %s's props declared in its lab file", (name, expected) => {
    const props = manifest.components[name]!.props.map((prop) => prop.name);
    expect(props).toEqual(expect.arrayContaining(expected));
  });

  it("maps Carousel and LegalDocumentShell to their screen-reader cohorts again", () => {
    const cohortOf = (owner: string) =>
      evidence.policy.cohorts.find((cohort) => cohort.owners.includes(owner))?.id;
    expect(cohortOf("lab/carousel")).toBe("data-structures");
    expect(cohortOf("lab/legal-document-shell")).toBe("landmarks-page-structure");
    expect(evidence.policy.complexOwners).toContain("lab/carousel");
  });
});
