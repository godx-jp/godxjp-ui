import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * A TINT WITHOUT A BAND IS A HIGHLIGHTER PEN.
 *
 * `DialogHeader tone` paints `bg-<tone>/10` unconditionally from the component, but the band's
 * GEOMETRY — full-bleed, padding, the rule under it — was gated on the dialog containing a
 * `[data-slot="dialog-body"]`. A preset that renders header → field → footer, which is exactly what
 * the `AlertDialog` preset does, matched the tint and not the geometry.
 *
 * Measured on `/isolate/feedback-danger-confirm` before the fix:
 *
 *     padding 0px · border-bottom 0px · margin-inline 0px
 *     band top    349.3 == title top          349.3
 *     band bottom 422.9 == description bottom 422.9
 *
 * i.e. the tint hugged the glyphs with no breathing room on either edge. Inserting a single
 * `[data-slot=dialog-body]` element into the same live DOM flipped the header to
 * `padding 16px 24px · border-bottom 1px · margin-inline -24px`, which is how the cause was pinned
 * to the `:has()` guard rather than to the tone class. After the fix, a toned header measures
 * `padding 16px 24px · border-bottom 1px · margin-inline -24px` with no body present.
 *
 * A CSS-TEXT TEST: jsdom applies no author cascade and does no layout, so it can neither resolve
 * `:has()` nor measure the band.
 */
describe("Dialog header — a toned header is a band wherever it appears", () => {
  const css = readFileSync(resolve(process.cwd(), "src/styles/dialog-layout.css"), "utf8");

  /** The one rule that gives a header its full-bleed inset + divider. */
  const bandRule =
    /([^{}]*?)\{\s*margin-inline:\s*calc\(-1 \* var\(--dialog-space-x\)\);\s*margin-block-start:[^}]*border-bottom:[^}]*\}/.exec(
      css,
    );

  it("still gives an UNTONED header its band only when a dialog-body is present", () => {
    expect(bandRule?.[1]).toContain(
      '[data-slot="dialog-content"]:has([data-slot="dialog-body"]) [data-slot="dialog-header"]',
    );
  });

  it("gives a TONED header its band regardless of a dialog-body", () => {
    expect(bandRule?.[1]).toContain('[data-slot="dialog-header"]:not([data-tone="default"])');
  });

  it("carries real padding, so the tint never hugs the glyphs", () => {
    expect(bandRule?.[0]).toMatch(
      /padding:\s*var\(--dialog-space-y\)\s+var\(--dialog-space-x\)/,
    );
  });
});

/**
 * ANT DESIGN PARITY: the danger signal is a GLYPH, not a tinted surface.
 *
 * antd's `Modal.confirm` paints a status icon beside the title and leaves the surface at
 * `colorBgElevated`; it never tints a modal header. (Its soft `colorErrorBg` belongs to
 * `Alert`/`Tag`/`message`, and always arrives with padding and a border.) Measured after the
 * change on `/isolate/feedback-danger-confirm`: header background `rgba(0, 0, 0, 0)`,
 * `data-tone="default"`, glyph 24×24 in the --text-error tier with `aria-hidden="true"`, icon and
 * title tops both 349.3, and a 12px gap between them — antd's margin on the glyph.
 */
describe("Dialog confirm body — antd Modal.confirm shape", () => {
  const css = readFileSync(resolve(process.cwd(), "src/styles/dialog-layout.css"), "utf8");
  const rule = (selector: string) =>
    new RegExp(`\\${selector}\\s*\\{([^}]*)\\}`).exec(css)?.[1] ?? "";

  it("lays the glyph beside the title, aligned to the first line", () => {
    const body = rule(".ui-dialog-confirm-body");
    expect(body).toMatch(/display:\s*flex/);
    expect(body).toMatch(/align-items:\s*flex-start/);
    expect(body).toMatch(/gap:\s*var\(--dialog-confirm-space-gap\)/);
  });

  it("sizes and inks the glyph from tokens, never a literal", () => {
    const icon = rule(".ui-dialog-confirm-icon");
    expect(icon).toMatch(/inline-size:\s*var\(--dialog-confirm-icon-size\)/);
    expect(icon).toMatch(/block-size:\s*var\(--dialog-confirm-icon-size\)/);
    // The TEXT tier, not the FILL tier — a glyph on the surface is ink (gh#610/gh#612).
    expect(icon).toMatch(/color:\s*hsl\(var\(--text-error\)\)/);
    // A glyph that shrinks is a glyph that stops being a 24px status mark.
    expect(icon).toMatch(/flex:\s*none/);
  });

  it("lets the text column shrink so a long CJK title wraps instead of pushing the glyph out", () => {
    expect(rule(".ui-dialog-confirm-text")).toMatch(/min-inline-size:\s*0/);
  });

  it("rides a named step of the icon scale rather than minting a value", () => {
    const tokens = readFileSync(resolve(process.cwd(), "src/tokens/components/feedback.css"), "utf8");
    expect(tokens).toMatch(/--dialog-confirm-icon-size:\s*var\(--icon-size-xl\)/);
    expect(tokens).toMatch(/--dialog-confirm-space-gap:\s*var\(--space-3\)/);
  });
});
