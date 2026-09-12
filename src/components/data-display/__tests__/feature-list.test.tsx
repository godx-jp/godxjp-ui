import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { renderWithUi, screen } from "@/test/render";
import { FeatureList } from "../feature-list";
import type { FeatureItemProp } from "../feature-list";

const ITEMS: FeatureItemProp[] = [
  { state: "included", label: "SSO", description: "SAML と OIDC" },
  { state: "limited", label: "API 呼び出し" },
  { state: "excluded", label: "監査ログのエクスポート" },
];

const css = () => readFileSync(join(process.cwd(), "src/styles/data-display-layout.css"), "utf8");
const tokens = () =>
  readFileSync(join(process.cwd(), "src/tokens/components/data-display.css"), "utf8");
const rule = (selector: string) =>
  css().match(
    new RegExp(`${selector.replace(/[.[\]"^$*+?()|{}\\]/g, "\\$&")}\\s*\\{[^}]*\\}`),
  )?.[0] ?? "";

describe("FeatureList", () => {
  it("is a list of statements — labels and descriptions, in order", () => {
    renderWithUi(<FeatureList items={ITEMS} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText("SSO")).toBeInTheDocument();
    expect(screen.getByText("SAML と OIDC")).toBeInTheDocument();
  });

  /**
   * The glyph is the carrier of the state on screen, so something has to carry it for everyone
   * else. `renderWithUi` defaults to the `vi` locale — the words come from t(), not from a
   * literal in the component.
   */
  it("says the state in words for assistive tech, and hides the glyph", () => {
    const { container } = renderWithUi(<FeatureList items={ITEMS} />);
    const items = screen.getAllByRole("listitem");

    expect(items[0]).toHaveTextContent("Có");
    expect(items[1]).toHaveTextContent("Giới hạn");
    expect(items[2]).toHaveTextContent("Không có");
    for (const item of items) {
      expect(item.querySelector(".sr-only")).not.toBeNull();
    }
    for (const mark of container.querySelectorAll(".ui-feature-list-mark")) {
      expect(mark).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("exposes the state on the item so the stylesheet can tone it", () => {
    const { container } = renderWithUi(<FeatureList items={ITEMS} />);

    expect(
      [...container.querySelectorAll(".ui-feature-list-item")].map((el) =>
        el.getAttribute("data-state"),
      ),
    ).toEqual(["included", "limited", "excluded"]);
  });

  it("draws a different GLYPH per state, so colour is never the only carrier (WCAG 1.4.1)", () => {
    const { container } = renderWithUi(<FeatureList items={ITEMS} />);
    const paths = [...container.querySelectorAll(".ui-feature-list-mark > svg")].map(
      (svg) => svg.innerHTML,
    );

    expect(new Set(paths).size).toBe(3);
  });

  it("omits the description node entirely when there is no description", () => {
    const { container } = renderWithUi(<FeatureList items={[ITEMS[1]!]} />);

    expect(container.querySelector(".ui-feature-list-description")).toBeNull();
  });

  /**
   * THE REASON THIS COMPONENT EXISTS (gh#529).
   *
   * The glyph column is one LINE BOX tall and the glyph is centred in it, so it lands on the
   * first line of a label that wraps. Measured in Chromium: −1.20px against the cap-height
   * centre, versus −3.10px for the `mt-0.5` the consumer hand-rolled and −3.60px for
   * `align-items: baseline`. A margin token here would be that magic number wearing a DS name.
   */
  it("aligns the glyph by giving it a one-line-box tall cell, not a margin nudge", () => {
    const mark = rule(".ui-feature-list-mark");

    expect(mark).toMatch(/block-size:\s*1lh/);
    expect(mark).toMatch(/place-items:\s*center/);
    expect(mark).not.toMatch(/margin/);
    expect(rule(".ui-feature-list-item")).toMatch(/align-items:\s*start/);
    // No nudge token was minted for this, in either tier.
    expect(tokens()).not.toMatch(/--feature-list-[a-z-]*(?:margin|offset|translate)/);
  });

  it("reads the MARK tier for the glyph — a shape that carries meaning is held to 3:1", () => {
    expect(rule('.ui-feature-list-item[data-state="included"] .ui-feature-list-mark')).toMatch(
      /color:\s*hsl\(var\(--mark-success\)\)/,
    );
    expect(rule('.ui-feature-list-item[data-state="limited"] .ui-feature-list-mark')).toMatch(
      /color:\s*hsl\(var\(--mark-warning\)\)/,
    );
  });

  /** A plan that lacks a feature is a fact, not an error: no destructive paint anywhere. */
  it("never paints an excluded line destructive", () => {
    // Comments blanked first — the prose below explains WHY there is no destructive paint, and a
    // scan that reads it would pass on a stylesheet that had one.
    const declarations = css().replace(/\/\*[\s\S]*?\*\//g, "");
    const scoped = declarations.slice(
      declarations.indexOf(".ui-feature-list {"),
      declarations.indexOf(".ui-thumbnail {"),
    );

    expect(scoped).not.toMatch(/destructive/);
    expect(rule('.ui-feature-list-item[data-state="excluded"] .ui-feature-list-label')).toMatch(
      /color:\s*hsl\(var\(--muted-foreground\)\)/,
    );
  });

  /** The other half of why ListRow could not do this job: ListRow truncates, a statement wraps. */
  it("wraps the body instead of truncating it", () => {
    const body = rule(".ui-feature-list-body");

    expect(body).toMatch(/overflow-wrap:\s*anywhere/);
    expect(body).not.toMatch(/text-overflow|white-space:\s*nowrap/);
  });

  it("takes its geometry from tokens, so a theme can retune it", () => {
    expect(rule(".ui-feature-list")).toMatch(/gap:\s*var\(--feature-list-space-gap\)/);
    expect(rule(".ui-feature-list-item")).toMatch(
      /column-gap:\s*var\(--feature-list-space-inline\)/,
    );
    expect(rule(".ui-feature-list-mark > svg")).toMatch(
      /inline-size:\s*var\(--feature-list-mark-icon-size\)/,
    );
    expect(tokens()).toMatch(/--feature-list-mark-icon-size:\s*var\(--icon-size-md\)/);
  });
});
