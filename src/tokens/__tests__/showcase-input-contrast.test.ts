import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { contrast, hslToRgb, NON_TEXT } from "./wcag-contrast";

/**
 * gh#315, second half — the showcase tenant themes must clear SC 1.4.11 too.
 *
 * Fixing the library's own `--input` role is only half the job. `docs/showcase/*.tsx` are the pages
 * a service copies from when it writes its own `theme.css`, and all three light themes re-declared
 * `--input` at a neutral-300-ish value: 1.65:1 (acme-portal), 1.46:1 (acme-website) and 1.52:1
 * (futurelastic). They were demonstrating the exact defect the issue was filed about — a fixed
 * library shipping beside a worked example of the bug teaches the bug.
 *
 * Every ratio below is computed from the value CURRENTLY IN THE FILE, never from a literal repeated
 * in this test. A first draft pinned the expected string and computed contrast from that pin, which
 * meant editing the showcase failed the pin with a diff about a string and left the contrast
 * assertions passing on a value no longer being shipped — a guard reporting on itself.
 *
 * Each theme is checked against the surfaces IT declares, not the library defaults: the point of a
 * tenant theme is that it moves the ground, and a boundary that clears 3:1 on white can fail on
 * that theme's own tinted card.
 *
 * The navy region of acme-website is included as a passing case on purpose. It was already fine
 * (4.80:1), and covering it stops a later "quieten the navy inputs" edit from dropping under the bar.
 */

const read = (file: string) => readFileSync(join(process.cwd(), "docs/showcase", file), "utf8");

/** Every `--input: H S% L%` in a file, in source order. */
function inputDeclarations(source: string): [number, number, number][] {
  return [...source.matchAll(/--input:\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/g)].map((m) => [
    Number(m[1]),
    Number(m[2]),
    Number(m[3]),
  ]);
}

/**
 * Each entry is one `--input` declaration, matched to its file POSITIONALLY, and the surfaces that
 * theme paints a control on. `nth` is what ties an audited surface list to the declaration it
 * actually describes — acme-website declares `--input` twice (page, then the scoped navy region).
 */
const THEMES = [
  {
    name: "acme-portal",
    file: "acme-portal.tsx",
    nth: 0,
    surfaces: { card: [0, 0, 100], muted: [216, 33, 97] },
  },
  {
    name: "acme-website (light)",
    file: "acme-website.tsx",
    nth: 0,
    surfaces: { page: [210, 33, 97], card: [0, 0, 100], muted: [214, 27, 95] },
  },
  {
    name: "acme-website (navy region)",
    file: "acme-website.tsx",
    nth: 1,
    surfaces: { page: [217, 61, 12], card: [217, 45, 18] },
  },
  {
    name: "futurelastic-web",
    file: "futurelastic-web.tsx",
    nth: 0,
    surfaces: { page: [40, 47, 4], card: [36, 47, 6], muted: [40, 30, 10] },
  },
] as const;

describe.each(THEMES)("$name — --input clears SC 1.4.11", ({ file, nth, surfaces }) => {
  const declared = inputDeclarations(read(file))[nth];

  for (const [surface, value] of Object.entries(surfaces)) {
    it(`is at least ${NON_TEXT}:1 on --${surface}`, () => {
      expect(declared).toBeDefined();
      const ratio = contrast(hslToRgb(declared), hslToRgb(value as [number, number, number]));
      expect(ratio).toBeGreaterThanOrEqual(NON_TEXT);
    });
  }
});

describe("the audit covers every showcase theme", () => {
  // The list above is hand-maintained, so it goes stale the moment someone adds a fifth theme or a
  // second scoped region. Counting the declarations in the files themselves is the only assertion
  // that can see a theme this audit stopped covering.
  it("audits every --input declaration in docs/showcase", () => {
    const files = ["acme-portal.tsx", "acme-website.tsx", "futurelastic-web.tsx"];
    const declared = files.flatMap((f) => inputDeclarations(read(f)));
    expect(declared).toHaveLength(THEMES.length);
  });

  it("parses every declaration it audits", () => {
    for (const { file, nth } of THEMES) expect(inputDeclarations(read(file))[nth]).toHaveLength(3);
  });
});
