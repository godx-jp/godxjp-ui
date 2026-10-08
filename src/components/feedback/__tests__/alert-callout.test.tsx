import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";
import { Alert } from "../alert";

/**
 * Callout — the aside INSIDE a document body (gh#765).
 *
 * It is the Alert primitive with `variant` fixed to "callout", exactly as Banner fixes "banner":
 * one implementation owns the tone system, the slots and the glyph. The one thing it does NOT
 * share is live-region politeness, and that is the whole reason it exists — a wiki page with three
 * callouts must not announce three times on load.
 */
describe("Alert variant=callout (formerly Callout, v32 #1223)", () => {
  it("renders as the alert primitive with the callout structural variant fixed", () => {
    renderWithUi(
      <Alert variant="callout">
        <Alert.Title>補足</Alert.Title>
        <Alert.Description>この設定は次回のログインから有効になります。</Alert.Description>
      </Alert>,
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
        <Alert variant="callout" kind={kind}>
          <Alert.Title>Static aside</Alert.Title>
        </Alert>,
      );
      expect(screen.getByRole("note")).toHaveAttribute("data-variant", "callout");
      expect(screen.queryByRole("alert")).toBeNull();
      expect(screen.queryByRole("status")).toBeNull();
    },
  );

  it("stays non-live even when the tone is one that makes an Alert assertive", () => {
    // tone drives colour here and NOTHING else. On an Alert, `destructive` means role="alert".
    renderWithUi(
      <Alert variant="callout" tone="destructive">
        <Alert.Title>Danger</Alert.Title>
      </Alert>,
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
      <Alert variant="callout" kind={kind}>
        <Alert.Title>{kind}</Alert.Title>
      </Alert>,
    );
    expect(screen.getByRole("note")).toHaveAttribute("data-tone", tone);
  });

  it("gives each kind its OWN glyph, so the five are told apart without colour (WCAG 1.4.1)", () => {
    const glyphs = (["note", "tip", "important", "warning", "caution"] as const).map((kind) => {
      const { unmount } = renderWithUi(
        <Alert variant="callout" kind={kind}>
          <Alert.Title>{kind}</Alert.Title>
        </Alert>,
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
      <Alert variant="callout" kind="caution">
        <Alert.Title>Destructive</Alert.Title>
      </Alert>,
    );
    const icon = screen.getByRole("note").querySelector('[data-slot="alert-icon"]');
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  it("tone and icon override the kind preset per instance", () => {
    renderWithUi(
      <Alert variant="callout" kind="tip" tone="muted" icon={false}>
        <Alert.Title>Quiet</Alert.Title>
      </Alert>,
    );
    const callout = screen.getByRole("note");
    expect(callout).toHaveAttribute("data-tone", "muted");
    expect(callout.querySelector('[data-slot="alert-icon"]')).toBeNull();
  });

  it("forwards ref and className, and spreads the rest onto the surface", () => {
    const ref = createRef<HTMLDivElement>();
    renderWithUi(
      <Alert
        variant="callout"
        ref={ref}
        className="consumer-aside"
        id="release-note"
        data-testid="callout"
      >
        <Alert.Title>Note</Alert.Title>
      </Alert>,
    );
    const callout = screen.getByTestId("callout");
    expect(ref.current).toBe(callout);
    expect(callout).toHaveClass("consumer-aside");
    expect(callout).toHaveAttribute("id", "release-note");
  });
});
