import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";
import { Callout, type CalloutProp, type CalloutProps } from "../callout";

/**
 * Callout — the aside INSIDE a document body (gh#765).
 *
 * It is the Alert primitive with `variant` fixed to "callout", exactly as Banner fixes "banner":
 * one implementation owns the tone system, the slots and the glyph. The one thing it does NOT
 * share is live-region politeness, and that is the whole reason it exists — a wiki page with three
 * callouts must not announce three times on load.
 */
describe("Callout", () => {
  it("renders as the alert primitive with the callout structural variant fixed", () => {
    renderWithUi(
      <Callout>
        <Callout.Title>補足</Callout.Title>
        <Callout.Description>この設定は次回のログインから有効になります。</Callout.Description>
      </Callout>,
    );
    const callout = screen.getByRole("note");
    expect(callout).toHaveAttribute("data-slot", "alert");
    expect(callout).toHaveAttribute("data-variant", "callout");
  });

  /*
   * THE DEFECT THIS COMPONENT EXISTS FOR. Consumers reached for `Alert` and then passed
   * `role="note"` to switch the announcement back off. That worked only because `{...props}` is
   * spread after the computed `role` in alert.tsx — an ordering the package never promised, and
   * one refactor away from silently restoring the live region. The role now comes from what the
   * component IS.
   */
  it.each(["note", "tip", "important", "warning", "caution"] as const)(
    "kind=%s is never a live region — no consumer role override required",
    (kind) => {
      renderWithUi(
        <Callout kind={kind}>
          <Callout.Title>Static aside</Callout.Title>
        </Callout>,
      );
      expect(screen.getByRole("note")).toHaveAttribute("data-variant", "callout");
      expect(screen.queryByRole("alert")).toBeNull();
      expect(screen.queryByRole("status")).toBeNull();
    },
  );

  it("stays non-live even when the tone is one that makes an Alert assertive", () => {
    // tone drives colour here and NOTHING else. On an Alert, `destructive` means role="alert".
    renderWithUi(
      <Callout tone="destructive">
        <Callout.Title>Danger</Callout.Title>
      </Callout>,
    );
    expect(screen.getByRole("note")).toHaveAttribute("data-tone", "destructive");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it.each([
    ["note", "info"],
    ["tip", "success"],
    ["important", "neutral"],
    ["warning", "warning"],
    ["caution", "destructive"],
  ] as const)("kind=%s resolves tone=%s", (kind, tone) => {
    renderWithUi(
      <Callout kind={kind}>
        <Callout.Title>{kind}</Callout.Title>
      </Callout>,
    );
    expect(screen.getByRole("note")).toHaveAttribute("data-tone", tone);
  });

  it("gives each kind its OWN glyph, so the five are told apart without colour (WCAG 1.4.1)", () => {
    const glyphs = (["note", "tip", "important", "warning", "caution"] as const).map((kind) => {
      const { unmount } = renderWithUi(
        <Callout kind={kind}>
          <Callout.Title>{kind}</Callout.Title>
        </Callout>,
      );
      const icon = screen.getByRole("note").querySelector('[data-slot="alert-icon"]');
      const shape = icon?.innerHTML ?? "";
      unmount();
      return shape;
    });
    expect(glyphs.every(Boolean)).toBe(true);
    expect(new Set(glyphs).size, "two kinds share a glyph, so colour is the only cue").toBe(5);
  });

  it("the leading glyph is decorative — the copy carries the meaning", () => {
    renderWithUi(
      <Callout kind="caution">
        <Callout.Title>Destructive</Callout.Title>
      </Callout>,
    );
    const icon = screen.getByRole("note").querySelector('[data-slot="alert-icon"]');
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  it("tone and icon override the kind preset per instance", () => {
    renderWithUi(
      <Callout kind="tip" tone="muted" icon={false}>
        <Callout.Title>Quiet</Callout.Title>
      </Callout>,
    );
    const callout = screen.getByRole("note");
    expect(callout).toHaveAttribute("data-tone", "muted");
    expect(callout.querySelector('[data-slot="alert-icon"]')).toBeNull();
  });

  it("forwards ref and className, and spreads the rest onto the surface", () => {
    const ref = createRef<HTMLDivElement>();
    renderWithUi(
      <Callout ref={ref} className="my-aside" id="release-note" data-testid="callout">
        <Callout.Title>Note</Callout.Title>
      </Callout>,
    );
    const callout = screen.getByTestId("callout");
    expect(ref.current).toBe(callout);
    expect(callout).toHaveClass("my-aside");
    expect(callout).toHaveAttribute("id", "release-note");
  });

  it("exports the prop type under both spellings", () => {
    const asProp: CalloutProp = { kind: "tip" };
    const asProps: CalloutProps = { kind: "tip" };
    expect(asProp.kind).toBe(asProps.kind);
  });
});
