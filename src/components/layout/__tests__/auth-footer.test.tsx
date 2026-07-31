import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "@/test/a11y";
import { AuthFooter } from "../auth-footer";

/**
 * AuthFooter — the canonical hosted-identity legal line (gh#214).
 *
 * The consumer contract is: the LIBRARY owns the geometry (mono ramp, wrap, `·` separators between
 * the slots that are present) and the CONSUMER owns every piece of content. These tests pin the
 * separator arithmetic (which is what a consumer would otherwise hand-roll), the `className`
 * escape hatch, and the fact that keys are stable SLOT names rather than array indices — with an
 * index key, toggling the optional `locale` slot re-keys every following item and React remounts
 * the consumer's real link/locale control.
 */
describe("AuthFooter", () => {
  const links = {
    terms: <a href="/terms">Terms</a>,
    privacy: <a href="/privacy">Privacy</a>,
  };

  it("renders every slot in canonical order with a separator between them", () => {
    const { container } = render(<AuthFooter product="GoDX ID" {...links} locale="日本語" />);
    const items = [...container.querySelectorAll(".ui-auth-legal-footer-item")];
    expect(items).toHaveLength(4);
    expect(items.map((item) => item.getAttribute("data-slot"))).toEqual([
      "auth-legal-footer-product",
      "auth-legal-footer-terms",
      "auth-legal-footer-privacy",
      "auth-legal-footer-locale",
    ]);
    // One separator FEWER than items, and never before the first one.
    expect(container.querySelectorAll(".ui-auth-legal-footer-separator")).toHaveLength(3);
    expect(items[0]!.querySelector(".ui-auth-legal-footer-separator")).toBeNull();
  });

  it("omits the optional locale slot and its separator when it is not supplied", () => {
    const { container } = render(<AuthFooter product="GoDX ID" {...links} />);
    expect(container.querySelectorAll(".ui-auth-legal-footer-item")).toHaveLength(3);
    expect(container.querySelectorAll(".ui-auth-legal-footer-separator")).toHaveLength(2);
    expect(container.querySelector('[data-slot="auth-legal-footer-locale"]')).toBeNull();
  });

  it("keys items by SLOT, so toggling `locale` never remounts the other slots", () => {
    const { container, rerender } = render(
      <AuthFooter product="GoDX ID" {...links} locale="日本語" />,
    );
    const termsLink = screen.getByRole("link", { name: "Terms" });
    expect(container.querySelectorAll(".ui-auth-legal-footer-item")).toHaveLength(4);

    rerender(<AuthFooter product="GoDX ID" {...links} />);
    // Same DOM node → React reused it (an index key would have re-keyed and remounted it).
    expect(screen.getByRole("link", { name: "Terms" })).toBe(termsLink);
  });

  it("hides the decorative separator from assistive tech", () => {
    const { container } = render(<AuthFooter product="GoDX ID" {...links} />);
    for (const sep of container.querySelectorAll(".ui-auth-legal-footer-separator")) {
      expect(sep).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("merges className onto the root without dropping the canonical class", () => {
    const { container } = render(<AuthFooter product="GoDX ID" {...links} className="mt-auto" />);
    const root = container.querySelector('[data-slot="auth-legal-footer"]')!;
    expect(root).toHaveClass("ui-auth-legal-footer", "mt-auto");
  });

  it("needs no page CSS — every knob is a component token (rule #45)", () => {
    const css = readFileSync(resolve(process.cwd(), "src/styles/shell-layout.css"), "utf8");
    const rule = css.match(/\.ui-auth-legal-footer \{[^}]*\}/)![0];
    expect(rule).toContain("gap: var(--auth-footer-content-gap)");
    expect(rule).toContain("font-size: var(--auth-footer-text-font-size)");
  });

  it("has no axe violations with real links and a locale control", async () => {
    await expectNoA11yViolations(
      <AuthFooter product="GoDX ID" {...links} locale={<a href="/locale">日本語</a>} />,
    );
  });
});
