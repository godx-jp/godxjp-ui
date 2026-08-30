import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import * as React from "react";
import { describe, expect, it } from "vitest";

import { Avatar, AvatarFallback, AvatarImage } from "../avatar";
import { renderWithUi } from "@/test/render";
import { ruleSelectors } from "@/test/css-selector";

/**
 * gh#309 — `<Avatar presence>` is the realtime reachability dot on the mark itself. Before it,
 * every consumer that shows people in a live product stacked a hand-rolled
 * `<span className="relative">` + `bg-green-500 ring-2 ring-background -end-0.5 -bottom-0.5` over
 * the avatar: a raw palette colour, four un-themeable constants, and a bare swatch with no
 * accessible text. The three defects are asserted here as three separate contracts — the API, the
 * accessible encoding (WCAG 1.4.1) and the token surface (cardinal rules #44/#45).
 */
const styles = readFileSync(resolve(process.cwd(), "src/styles/data-display-layout.css"), "utf8");
const flatStyles = styles.replace(/\s+/g, " ").trim();
const tokens = readFileSync(
  resolve(process.cwd(), "src/tokens/components/data-display.css"),
  "utf8",
);

/**
 * The presence half of the stylesheet, comments stripped — a raw-colour or motion sweep must read
 * the DECLARATIONS, not the prose explaining them (the block's own `gh#309` would answer a hex
 * scan, and the word "translate" appears in the comment that explains why there is no translate).
 */
const presenceCss = styles
  .slice(styles.indexOf(".ui-avatar[data-presence] {"), styles.indexOf(".ui-progress"))
  .replace(/\/\*[\s\S]*?\*\//g, " ");

const PRESENCE_VALUES = ["online", "away", "busy", "offline"] as const;

/** The `vi` strings `renderWithUi` resolves — the FIXTURE, not a re-derivation of the catalog. */
const VI_LABEL: Record<(typeof PRESENCE_VALUES)[number], string> = {
  online: "Trực tuyến",
  away: "Vắng mặt",
  busy: "Bận",
  offline: "Ngoại tuyến",
};

/** A consumer-supplied sizing utility, hoisted so the literal reads as a fixture. */
const CONSUMER_CLASS = "size-12";

function renderAvatar(ui: React.ReactElement) {
  const { container } = renderWithUi(ui);
  return {
    root: container.querySelector('[data-slot="avatar"]')!,
    dot: container.querySelector('[data-slot="avatar-presence"]'),
  };
}

describe("Avatar presence — API (gh#309)", () => {
  it("is inert when omitted: no node, no attribute, byte-identical to the pre-#309 avatar", () => {
    const { root, dot } = renderAvatar(
      <Avatar>
        <AvatarFallback>田</AvatarFallback>
      </Avatar>,
    );
    expect(dot).toBeNull();
    expect(root).not.toHaveAttribute("data-presence");
    expect(root.getAttribute("class")).toBe("ui-avatar");
  });

  it.each(PRESENCE_VALUES)("marks both the root and the dot for `%s`", (presence) => {
    const { root, dot } = renderAvatar(
      <Avatar presence={presence}>
        <AvatarFallback>田</AvatarFallback>
      </Avatar>,
    );
    // The ROOT attribute is what lifts `overflow: hidden` so the dot can straddle the mark's edge.
    expect(root).toHaveAttribute("data-presence", presence);
    // The prop itself never leaks to the DOM as an unknown HTML attribute.
    expect(root).not.toHaveAttribute("presence");
    expect(dot).toHaveAttribute("data-presence", presence);
  });

  it('`presence="offline"` is a different statement from an omitted prop', () => {
    const omitted = renderAvatar(
      <Avatar>
        <AvatarFallback>田</AvatarFallback>
      </Avatar>,
    );
    const offline = renderAvatar(
      <Avatar presence="offline">
        <AvatarFallback>田</AvatarFallback>
      </Avatar>,
    );
    // Omitted = "this entity has no presence concept" (an organization mark). Offline = "this
    // person is known to be unreachable" — the same distinction ListRow draws between an omitted
    // and a `false` `unread`, so one must not silently render as the other.
    expect(omitted.dot).toBeNull();
    expect(offline.dot).not.toBeNull();
    expect(offline.dot).toHaveTextContent(VI_LABEL.offline);
  });

  it("keeps ref, className and arbitrary props working alongside presence", () => {
    const ref = React.createRef<HTMLSpanElement>();
    const { root } = renderAvatar(
      <Avatar ref={ref} presence="online" className={CONSUMER_CLASS} data-testid="member">
        <AvatarImage src="/member.png" alt="田中" />
        <AvatarFallback>田</AvatarFallback>
      </Avatar>,
    );
    expect(ref.current).toBe(root);
    expect(root).toHaveClass(CONSUMER_CLASS);
    expect(root).toHaveAttribute("data-testid", "member");
  });

  it("composes with shape and appearance rather than competing with them", () => {
    const { root, dot } = renderAvatar(
      <Avatar shape="square" appearance="tinted" presence="busy">
        <AvatarFallback>山</AvatarFallback>
      </Avatar>,
    );
    expect(root).toHaveAttribute("data-shape", "square");
    expect(root).toHaveAttribute("data-appearance", "tinted");
    expect(dot).toHaveAttribute("data-presence", "busy");
  });
});

describe("Avatar presence — never colour-only (WCAG 1.4.1, gh#309)", () => {
  it.each(PRESENCE_VALUES)("announces `%s` as localized text, not a bare swatch", (presence) => {
    // renderWithUi defaults to `vi`: the string comes from t(), so it is translated, not hardcoded.
    const { dot } = renderAvatar(
      <Avatar presence={presence}>
        <AvatarFallback>田</AvatarFallback>
      </Avatar>,
    );
    expect(dot).toHaveTextContent(VI_LABEL[presence]);
    expect(dot!.querySelector(".sr-only")).not.toBeNull();
  });

  it("gives the four states four DIFFERENT strings — no two share an announcement", () => {
    const spoken = PRESENCE_VALUES.map(
      (presence) =>
        renderAvatar(
          <Avatar presence={presence}>
            <AvatarFallback>田</AvatarFallback>
          </Avatar>,
        ).dot!.textContent,
    );
    expect(new Set(spoken).size).toBe(PRESENCE_VALUES.length);
  });

  it("reads the person FIRST and their state second, exactly once", () => {
    const { root, dot } = renderAvatar(
      <Avatar presence="online">
        <AvatarFallback>田中</AvatarFallback>
      </Avatar>,
    );
    // The dot is the LAST child, so an SR walking the avatar says "田中, Trực tuyến" — the name
    // before the state, never the state before the name.
    expect(root.lastElementChild).toBe(dot);
    expect(root.textContent).toBe(`田中${VI_LABEL.online}`);
    // Announced once: the visual dot is painted entirely in CSS, so there is no second node and no
    // aria-hidden mirror to double it up.
    expect(root.textContent!.split(VI_LABEL.online)).toHaveLength(2);
  });

  it("lets a product phrase the state more precisely, still visually hidden", () => {
    const CUSTOM = "会議中 · 15:00まで";
    const { dot } = renderAvatar(
      <Avatar presence="busy" presenceLabel={CUSTOM}>
        <AvatarFallback>田</AvatarFallback>
      </Avatar>,
    );
    expect(dot).toHaveTextContent(CUSTOM);
    expect(dot).not.toHaveTextContent(VI_LABEL.busy);
    // A long ja/vi custom status must not become visible chrome — it stays in the sr-only span, so
    // the dot's box is unaffected by however long the copy runs.
    expect(dot!.querySelector(".sr-only")).toHaveTextContent(CUSTOM);
  });

  it("encodes each state as a distinct SHAPE as well, for greyscale and forced colors", () => {
    // online = filled disc · away = half-filled · busy = filled + bar · offline = hollow ring.
    // Colour alone would collapse all four for a deuteranope and under forced colors.
    expect(flatStyles).toContain(
      '[data-slot="avatar-presence"][data-presence="online"] { ' +
        "border-color: hsl(var(--avatar-presence-online-color, var(--success))); " +
        "background-color: hsl(var(--avatar-presence-online-color, var(--success))); }",
    );
    expect(flatStyles).toContain(
      "background-image: linear-gradient( to bottom, transparent 0 50%, " +
        "hsl(var(--avatar-presence-away-color, var(--warning))) 50% );",
    );
    expect(flatStyles).toContain(
      '[data-slot="avatar-presence"][data-presence="busy"]::before { content: "";',
    );
    expect(flatStyles).toContain(
      '[data-slot="avatar-presence"][data-presence="offline"] { ' +
        "border-color: hsl(var(--avatar-presence-offline-color, var(--muted-foreground))); " +
        "background-color: hsl(var(--avatar-presence-ring-color, var(--background))); }",
    );
  });

  it("keeps the ring and every silhouette alive under forced colors", () => {
    // box-shadow is DROPPED in forced-colors, so the separator ring has to be re-drawn as an
    // outline in a system colour or the dot melts into the mark.
    expect(presenceCss).toMatch(/@media \(forced-colors: active\)/);
    expect(flatStyles).toContain("outline: var(--avatar-presence-ring-width) solid Canvas;");
    expect(flatStyles).toContain(
      "background-image: linear-gradient(to bottom, Canvas 0 50%, CanvasText 50%);",
    );
  });

  it("carries no animation, so there is nothing for reduced motion to switch off", () => {
    // Presence is a STATE, not an event: a pulsing dot would be motion a user cannot opt out of.
    expect(presenceCss).not.toMatch(/animation|@keyframes|transition/);
  });

  it("stays a state, never a live region that would flood a socket-fed roster", () => {
    const { dot } = renderAvatar(
      <Avatar presence="online">
        <AvatarFallback>田</AvatarFallback>
      </Avatar>,
    );
    expect(dot).not.toHaveAttribute("aria-live");
    expect(dot).not.toHaveAttribute("role");
  });
});

describe("Avatar presence — every constant is a knob (rules #44/#45, gh#309)", () => {
  it("declares the geometry knobs so a service can retune the dot from its theme", () => {
    expect(tokens).toMatch(/--avatar-presence-inset:\s*0;/);
    // The three line weights read the stroke scale since gh#324 — --stroke-md IS 2px and
    // --stroke-sm IS 1.5px, pinned in src/tokens/__tests__/geometry-axis-scales.test.ts. A theme
    // that wants heavier presence rings now has both routes: the step, or these knobs.
    expect(tokens).toMatch(/--avatar-presence-ring-width:\s*var\(--stroke-md\);/);
    expect(tokens).toMatch(/--avatar-presence-stroke-width:\s*var\(--stroke-sm\);/);
    expect(tokens).toMatch(/--avatar-presence-bar-inline-size:\s*56%;/);
    expect(tokens).toMatch(/--avatar-presence-bar-block-size:\s*var\(--stroke-sm\);/);
    expect(tokens).toMatch(/--avatar-presence-min-size:\s*var\(--space-2\);/);
  });

  it("sizes the dot as a PROPORTION of the mark, so it scales with every avatar size", () => {
    // The dot must not sit at one frozen px: the system paints avatars at --control-height and its
    // xs/sm/lg steps, at --avatar-square-size, at --org-switcher-avatar-size (1.75rem), at
    // --upload-avatar-size (6rem) and at a call site's own `size-12`. A percentage tracks all of
    // them from one value; a px step would be a boulder on a 24px mark and a speck on a 96px one.
    expect(tokens).toMatch(/--avatar-presence-size:\s*\d+%;/);
    expect(flatStyles).toContain("inline-size: var(--avatar-presence-size);");
    expect(flatStyles).toContain("block-size: var(--avatar-presence-size);");
    // …with a legibility floor at the smallest marks.
    expect(flatStyles).toContain("min-inline-size: var(--avatar-presence-min-size);");
    expect(flatStyles).toContain("min-block-size: var(--avatar-presence-min-size);");
  });

  it("declares every ROLE-MIRROR knob `initial`, with the role default at the CALL SITE", () => {
    // `initial` (never `var(--success)`) at :root — a :root binding to a role var freezes at the
    // :root value, and a scoped [data-tenant]/.dark override of the ROLE would never reach it: the
    // ring would stay light-mode-white on a dark avatar. docs/TOKENS.md · "Role-mirror knobs".
    for (const knob of [
      "ring-color",
      "online-color",
      "away-color",
      "busy-color",
      "offline-color",
    ]) {
      expect(tokens).toMatch(new RegExp(`--avatar-presence-${knob}:\\s*initial;`));
      expect(tokens).not.toMatch(new RegExp(`--avatar-presence-${knob}:\\s*var\\(`));
    }
    expect(flatStyles).toContain("hsl(var(--avatar-presence-ring-color, var(--background)))");
    expect(flatStyles).toContain("hsl(var(--avatar-presence-busy-color, var(--destructive)))");
  });

  it("reads semantic roles only — the raw palette the workaround used is gone", () => {
    // `bg-green-500` was defect #1 in the report. Nothing in the presence CSS may name a colour
    // outside a role token or a forced-colors system keyword.
    expect(presenceCss).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(presenceCss).not.toMatch(/\b(?:green|red|amber|yellow|orange|gray|grey)\b/i);
    expect(presenceCss).not.toMatch(/\brgba?\(/);
  });

  it('positions the dot logically, so it mirrors under dir="rtl"', () => {
    expect(flatStyles).toContain("inset-block-end: var(--avatar-presence-inset);");
    expect(flatStyles).toContain("inset-inline-end: var(--avatar-presence-inset);");
    expect(presenceCss).not.toMatch(/^\s*(?:right|bottom|left|top):/m);
    // The dnd bar centres with `inset: 0; margin: auto` rather than a start-anchored translate,
    // which would slide off-centre when the inline axis flips.
    expect(flatStyles).toContain("margin: auto;");
    expect(presenceCss).not.toMatch(/translate/);
  });
});

describe("Avatar presence — the rules actually select the rendered dot (gh#309)", () => {
  it("matches the dot the component renders, for every state", () => {
    for (const presence of PRESENCE_VALUES) {
      const { root, dot } = renderAvatar(
        <Avatar presence={presence}>
          <AvatarFallback>田</AvatarFallback>
        </Avatar>,
      );
      // Extracted FROM the stylesheet, never retyped: a retyped copy stays green when the file
      // changes, and jsdom THROWS on an invalid selector, which is the signal we want.
      const dotSelectors = ruleSelectors(
        flatStyles,
        `[data-slot="avatar-presence"][data-presence="${presence}"] {`,
      );
      expect(dotSelectors.some((selector) => dot!.matches(selector))).toBe(true);

      const rootSelectors = ruleSelectors(flatStyles, ".ui-avatar[data-presence] { overflow");
      expect(rootSelectors.some((selector) => root.matches(selector))).toBe(true);
    }
  });

  it("moves the clip onto the image/fallback when the root stops clipping", () => {
    const { root } = renderAvatar(
      <Avatar presence="online">
        <AvatarFallback>田</AvatarFallback>
      </Avatar>,
    );
    const fallback = root.querySelector('[data-slot="avatar-fallback"]')!;
    const selectors = ruleSelectors(flatStyles, ".ui-avatar[data-presence] > .ui-avatar-image");
    // `border-radius: inherit` is what keeps the clip correct for BOTH shapes — --radius-pill for a
    // person, --avatar-square-radius for an entity mark.
    expect(selectors.some((selector) => fallback.matches(selector))).toBe(true);
  });
});
