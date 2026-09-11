import { readFileSync, globSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// @ts-expect-error — a plain .mjs rule module, the same shape as token-scale-bypass-rules.
import { parseComponentTokens } from "../../../scripts/component-token-rules.mjs";

type Token = { name: string; value: string; description: string };
const parse = parseComponentTokens as (text: string) => Token[];

/**
 * THE DEFECT: "the nearest comment above" had no end, so a comment written about ONE token became
 * the published description of every token after it. Three groups shipped that way —
 * `--mobile-shell-safe-inset-*` wearing the 430px note that belongs to
 * `--mobile-shell-max-inline-size`, `--tabs-overflow-radius`/`-icon-size` wearing a note about the
 * trigger's size, and `--control-height-*` / `--textarea-padding-*` wearing prose about amber
 * warning boundaries from two rule blocks above.
 *
 * These fixtures are the shapes that produced it, written out so the rule is pinned by BEHAVIOUR
 * rather than by the 1364-entry file it happens to emit today.
 */
describe("a comment describes the token immediately below it", () => {
  it("does not follow the comment past the token it was written above", () => {
    const tokens = parse(`/* Shell component tokens. */
:root {
  /* 430px — the widest logical width a handheld reports. It is a CAP. */
  --mobile-shell-max-inline-size: 26.875rem;
  --mobile-shell-safe-inset-block-start: env(safe-area-inset-top);
  --mobile-shell-safe-inset-inline: env(safe-area-inset-left);
}`);
    expect(tokens.map((t) => t.name)).toEqual([
      "--mobile-shell-max-inline-size",
      "--mobile-shell-safe-inset-block-start",
      "--mobile-shell-safe-inset-inline",
    ]);
    expect(tokens[0].description).toContain("430px");
    // The exact leak that shipped: these two are not about a cap on inline size.
    expect(tokens[1].description).not.toContain("430px");
    expect(tokens[2].description).not.toContain("430px");
  });

  it("does not carry a comment across a blank line or out of its rule block", () => {
    const tokens = parse(`/* Control primitive tokens. */
:root {
  /* VALIDATION STATUS — the warning edge has to clear 3:1. */
  --control-status-warning-border-color: hsl(var(--text-warning));
}

@media (pointer: coarse) {
  :root {
    --control-height-compact: var(--band-height-xl);
  }
}`);
    expect(tokens[1].name).toBe("--control-height-compact");
    expect(tokens[1].description).not.toContain("VALIDATION STATUS");
  });

  it("falls back to the file header rather than to nothing", () => {
    const tokens = parse(`/* Badge component tokens. */
:root {
  --badge-space-gap: var(--space-inline-xs);
  --badge-space-x: var(--space-2);
}`);
    expect(tokens.map((t) => t.description)).toEqual([
      "Badge component tokens.",
      "Badge component tokens.",
    ]);
  });

  it("finds the file header even when the header itself contains a brace", () => {
    // activity.css and chat-bubble.css both write a `{` inside their own prose. Cutting the
    // preamble at the first raw `{` split the header in half and left every token in those two
    // files with an empty description.
    const tokens = parse(`/* ACTIVITY tokens — the call site reads \`var(--x, {fallback})\`. */
:root {
  --activity-bar-width: 30%;
}`);
    expect(tokens[0].description).toContain("ACTIVITY tokens");
  });

  it("keeps a trailing comment on its own line instead of moving it one token down", () => {
    // legal-document.css writes five of these in a row. Handing each to the NEXT declaration moves
    // every one of them a line down — and the result still LOOKS plausible, because the notes are
    // similar, which is why this needs a fixture rather than a count.
    const tokens = parse(`/* Legal document tokens. */
:root {
  /* ── Role-mirror knobs — \`initial\` here, role default at the call site ── */
  --legal-document-meta-foreground: initial; /* default = hsl(var(--muted-foreground)) */
  --legal-document-toc-active-foreground: initial; /* default = hsl(var(--foreground)) */
}`);
    expect(tokens[0].description).toContain("Role-mirror knobs");
    expect(tokens[0].description).toContain("muted-foreground");
    expect(tokens[1].description).toBe("default = hsl(var(--foreground))");
    expect(tokens[1].description).not.toContain("muted-foreground");
  });

  it("gives the comment to the token below it, not the one above it", () => {
    const tokens = parse(`/* Tabs tokens. */
:root {
  --tabs-add-size: var(--control-height);
  /* OVERFLOW MENU TRIGGER — sized off the same control band as the add button. */
  --tabs-overflow-size: var(--control-height);
  --tabs-overflow-radius: var(--radius-md);
}`);
    expect(tokens[0].description).toBe("Tabs tokens.");
    expect(tokens[1].description).toContain("OVERFLOW MENU TRIGGER");
    expect(tokens[2].description).toBe("Tabs tokens.");
  });
});

describe("the rule holds on the real token tier", () => {
  const files = globSync("src/tokens/components/*.css", { cwd: process.cwd() }).sort();

  it("reads every file and describes every token", () => {
    expect(files.length).toBeGreaterThan(10);
    const tokens = files.flatMap((f) => parse(readFileSync(join(process.cwd(), f), "utf8")));
    expect(tokens.length).toBeGreaterThan(1000);
    expect(tokens.filter((t) => !t.description.trim()).map((t) => t.name)).toEqual([]);
  });

  it("no description is reused by more tokens than the source wrote it for", () => {
    // THE SHAPE OF THE DEFECT, expressed as an invariant: one comment, many tokens. A repeat is
    // only legitimate when the source really does say it that many times — the file header (said
    // once, used as the fallback everywhere) and legal-document.css's five identical trailing
    // notes, each written on its own line. Anything else is a comment that reached past the
    // declaration under it.
    const offenders: string[] = [];
    for (const file of files) {
      const text = readFileSync(join(process.cwd(), file), "utf8");
      const flat = text.replace(/\s+/g, " ");
      const tokens = parse(text);
      const header = tokens.length ? mostCommon(tokens.map((t) => t.description)) : "";
      const byDescription = new Map<string, string[]>();
      for (const t of tokens) {
        if (t.description === header) continue;
        byDescription.set(t.description, [...(byDescription.get(t.description) ?? []), t.name]);
      }
      for (const [description, names] of byDescription) {
        if (names.length < 2) continue;
        const written = flat.split(description).length - 1;
        if (written >= names.length) continue;
        offenders.push(
          `${file}: ${names.length} tokens (${names.join(", ")}) share a comment the source ` +
            `writes ${written} time(s) — "${description.slice(0, 70)}"`,
        );
      }
    }
    expect(offenders, offenders.join("\n")).toEqual([]);
  });
});

function mostCommon(values: string[]): string {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}
