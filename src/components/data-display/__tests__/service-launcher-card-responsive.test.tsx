import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ShieldCheck } from "lucide-react";

import { renderWithUi, screen, userEvent } from "@/test/render";
import { Button } from "../../general/button";
import { ResponsiveGrid } from "../../layout/responsive-grid";
import {
  ServiceCatalogCta,
  ServiceLauncherCard,
  ServiceLauncherCardSkeleton,
} from "../service-launcher-card";

/**
 * gh#219 — responsive + overflow + keyboard contract for the Console services launcher.
 *
 * jsdom performs NO layout, so a real column count / scrollWidth can never be measured here (same
 * reasoning as list-row-responsive.test.tsx). The guarantee is therefore split in three:
 *   1. the LAYOUT CONTRACT — the 3 → 2 → 1 grid is owned by ResponsiveGrid, asserted through the
 *      custom properties it emits plus the container-query breakpoints in the stylesheet, so a
 *      consumer never has to hand-write grid tracks (the thing the issue forbids);
 *   2. the CSS CONTRACT that produces overflow-safe tiles, asserted against the stylesheet so it
 *      cannot be silently removed (shrinkable title, `overflow-wrap: anywhere`, logical props);
 *   3. the RENDERED CONTRACT — long JA/EN/VI content and keyboard/focus order at the acceptance
 *      widths. Real pixel behaviour is re-verified in a browser at ship time.
 */
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
const cardCss = read("../../../styles/card-layout.css");
const layoutCss = read("../../../styles/layout.css");
const tokenCss = read("../../../tokens/components/card.css");

const rule = (css: string, selector: string) => {
  const at = css.indexOf(selector + " {");
  expect(at, `missing CSS rule for ${selector}`).toBeGreaterThan(-1);
  return css.slice(at, css.indexOf("}", at) + 1);
};

/** Long real-world service names — JA, EN and VI (issue #219 "long JA/EN/VI overflow"). */
const LONG_TITLE = {
  ja: "グローバル人事情報基盤・従業員セルフサービスポータル（アジア太平洋地域）",
  en: "Acme Global Workforce Identity & Entitlement Administration Console (Asia Pacific)",
  vi: "Cổng quản trị định danh và phân quyền nhân sự toàn cầu của doanh nghiệp khu vực châu Á",
} as const;

/** A hostname + plan metadata line with no spaces — the worst case for an unbreakable run. */
const LONG_METADATA =
  "workforce-identity-administration.ap-northeast-1.console.example.co.jp · Enterprise";

describe("ServiceLauncherCard grid contract (gh#219) — 3 → 2 → 1 is owned by the package", () => {
  it("ResponsiveGrid emits the canonical 3 → 2 → 1 column ladder, so no consumer writes tracks", () => {
    const { container } = renderWithUi(
      <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 3 }}>
        <ServiceLauncherCard icon={ShieldCheck} title="A" action={<Button>go</Button>} />
      </ResponsiveGrid>,
    );

    const grid = container.querySelector(".ui-responsive-grid") as HTMLElement;
    expect(grid.style.getPropertyValue("--responsive-grid-sm")).toBe("1");
    expect(grid.style.getPropertyValue("--responsive-grid-md")).toBe("2");
    expect(grid.style.getPropertyValue("--responsive-grid-lg")).toBe("3");
  });

  it("the shorthand columns={3} also degrades 3 → 2 → 1 (never below one column)", () => {
    const { container } = renderWithUi(
      <ResponsiveGrid columns={3}>
        <ServiceLauncherCard icon={ShieldCheck} title="A" action={<Button>go</Button>} />
      </ResponsiveGrid>,
    );

    const grid = container.querySelector(".ui-responsive-grid") as HTMLElement;
    expect(grid.style.getPropertyValue("--responsive-grid-md")).toBe("3");
    expect(grid.style.getPropertyValue("--responsive-grid-lg")).toBe("3");
    // sm is clamped to 2 by ResponsiveGrid, and the base track below the first breakpoint is 1.
    expect(grid.style.getPropertyValue("--responsive-grid-sm")).toBe("2");
  });

  it("the grid resolves against its OWN container at the canonical breakpoints", () => {
    // Base track = a single column; the ladder only ever adds columns as the container widens.
    expect(rule(layoutCss, ".ui-responsive-grid")).toMatch(
      /grid-template-columns:\s*minmax\(0,\s*1fr\)/,
    );
    expect(layoutCss).toMatch(/\.ui-responsive-grid-scope\s*\{[^}]*container:\s*responsive-grid/);
    for (const [width, step] of [
      ["40rem", "sm"],
      ["48rem", "md"],
      ["64rem", "lg"],
    ] as const) {
      const at = layoutCss.indexOf(`@container responsive-grid (min-width: ${width})`);
      expect(at, `missing canonical breakpoint ${width}`).toBeGreaterThan(-1);
      expect(layoutCss.slice(at, at + 240)).toContain(`--responsive-grid-${step}`);
    }
  });

  it("launcher tiles may shrink inside a grid column instead of widening it", () => {
    expect(rule(layoutCss, ".ui-responsive-grid > *")).toMatch(/min-width:\s*0/);
  });
});

describe("ServiceLauncherCard overflow CSS contract (gh#219)", () => {
  it("lets the title shrink and break an unbreakable JA/VI run", () => {
    const title = rule(cardCss, '[data-slot="service-launcher-title"]');
    expect(title).toMatch(/min-width:\s*0/);
    expect(title).toMatch(/overflow-wrap:\s*anywhere/);
  });

  it("breaks a long hostname·plan metadata run and keeps it mono", () => {
    const metadata = rule(cardCss, '[data-slot="service-launcher-metadata"]');
    expect(metadata).toMatch(/overflow-wrap:\s*anywhere/);
    expect(metadata).toMatch(/font-family:\s*var\(--font-mono\)/);
  });

  it("renders the disabled reason as PROSE, never in the mono metadata treatment", () => {
    const reason = rule(cardCss, '[data-slot="service-launcher-disabled-reason"]');
    expect(reason).toMatch(/overflow-wrap:\s*anywhere/);
    expect(reason).not.toMatch(/font-mono/);
    expect(reason).toMatch(/--card-service-launcher-description-font-size/);
  });

  it("keeps the heading row shrinkable and the status badge unsqueezed", () => {
    // The heading row shares a grouped selector with the skeleton heading.
    expect(rule(cardCss, '[data-slot="service-launcher-skeleton-heading"]')).toMatch(
      /min-width:\s*0/,
    );
    expect(cardCss).toMatch(
      /\[data-slot="service-launcher-heading"\],\s*\n?\s*\[data-slot="service-launcher-skeleton-heading"\]/,
    );
    expect(rule(cardCss, '[data-slot="service-launcher-status"]')).toMatch(/flex:\s*none/);
  });

  it("uses logical properties only, so a launcher tile flips under dir=rtl", () => {
    const block = cardCss.slice(
      cardCss.indexOf("/* ── Service launcher"),
      cardCss.lastIndexOf('[data-slot="service-launcher-skeleton-action"]'),
    );
    expect(block).not.toMatch(/(?:^|[^-])(?:margin|padding|border)-(?:left|right)\s*:/);
    expect(block).toMatch(/margin-inline-start/);
  });

  it("stretches the launch action to the full tile width from the package, not the consumer", () => {
    expect(rule(cardCss, '[data-slot="service-launcher-action"] > [data-slot="button"]')).toMatch(
      /width:\s*100%/,
    );
  });

  it("sizes the 36px semantic icon surface from the control tier, never a literal", () => {
    expect(tokenCss).toMatch(/--card-service-launcher-icon-size:\s*var\(--control-height-lg\)/);
    const icon = rule(cardCss, '[data-slot="service-launcher-icon"]');
    expect(icon).toMatch(/width:\s*var\(--card-service-launcher-icon-size\)/);
    expect(icon).toMatch(/height:\s*var\(--card-service-launcher-icon-size\)/);
  });

  it("keeps the dashed catalog CTA token-owned and level with a populated tile", () => {
    const cta = rule(cardCss, '[data-slot="card"][data-service-catalog-cta]');
    expect(cta).toMatch(/border-style:\s*dashed/);
    expect(cta).toMatch(/min-height:\s*var\(--card-service-launcher-cta-min-height\)/);
    expect(tokenCss).toMatch(/--card-service-launcher-cta-min-height:\s*\S+/);
  });

  it("declares every role-mirror medallion knob `initial` so a scoped theme reaches it", () => {
    for (const knob of [
      "--card-service-launcher-icon-background",
      "--card-service-launcher-icon-foreground",
      "--card-service-launcher-unavailable-icon-background",
      "--card-service-launcher-unavailable-icon-foreground",
    ]) {
      expect(tokenCss, knob).toMatch(new RegExp(`${knob}:\\s*initial;`));
      expect(cardCss, knob).toMatch(new RegExp(`var\\(${knob},\\s*var\\(--[a-z-]+\\)\\)`));
    }
  });
});

describe.each([
  ["sm — 1 column", 375],
  ["md — 2 columns", 768],
  ["lg — 3 columns", 1280],
])("ServiceLauncherCard rendered contract at %s", (_label, width) => {
  function setViewport(px: number) {
    Object.defineProperty(window, "innerWidth", { value: px, configurable: true, writable: true });
  }

  it("renders long JA/EN/VI titles without dropping content or the status badge", () => {
    setViewport(width);
    renderWithUi(
      <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 3 }}>
        {(["ja", "en", "vi"] as const).map((lang) => (
          <ServiceLauncherCard
            key={lang}
            icon={ShieldCheck}
            title={LONG_TITLE[lang]}
            statusLabel="LIVE"
            statusTone="success"
            description={LONG_TITLE[lang]}
            metadata={LONG_METADATA}
            action={<Button>Launch</Button>}
          />
        ))}
      </ResponsiveGrid>,
    );

    for (const lang of ["ja", "en", "vi"] as const) {
      expect(screen.getByRole("heading", { level: 2, name: LONG_TITLE[lang] })).toBeInTheDocument();
    }
    expect(screen.getAllByText("LIVE")).toHaveLength(3);
    expect(screen.getAllByText(LONG_METADATA)).toHaveLength(3);
    expect(screen.getAllByRole("button", { name: "Launch" })).toHaveLength(3);
  });

  it("keeps tab order in visual order and never focuses a disabled launch action", async () => {
    setViewport(width);
    const user = userEvent.setup();
    renderWithUi(
      <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 3 }}>
        <ServiceLauncherCard
          icon={ShieldCheck}
          title={LONG_TITLE.ja}
          action={<Button>起動</Button>}
        />
        <ServiceLauncherCard
          icon={ShieldCheck}
          title={LONG_TITLE.vi}
          disabledReason="Tổ chức của bạn chưa đăng ký dịch vụ này."
          action={<Button disabled>Mở dịch vụ</Button>}
        />
        <ServiceLauncherCardSkeleton label="Đang tải dịch vụ" />
        <ServiceCatalogCta title="Thêm từ danh mục" action={<Button>Xem danh mục</Button>} />
      </ResponsiveGrid>,
    );

    await user.tab();
    expect(screen.getByRole("button", { name: "起動" })).toHaveFocus();
    await user.tab();
    // The disabled tile is skipped entirely — focus lands on the catalog CTA's real action.
    expect(screen.getByRole("button", { name: "Xem danh mục" })).toHaveFocus();
    expect(screen.getByRole("button", { name: "Mở dịch vụ" })).not.toHaveFocus();
  });

  it("marks an unavailable tile for the token layer and reads the reason before the action", () => {
    setViewport(width);
    const { container } = renderWithUi(
      <ServiceLauncherCard
        icon={ShieldCheck}
        title={LONG_TITLE.en}
        disabledReason="Your organization has no active subscription for this service."
        action={<Button disabled>Open</Button>}
      />,
    );

    const tile = container.querySelector("[data-service-launcher]") as HTMLElement;
    expect(tile).toHaveAttribute("data-unavailable", "");

    const slots = [...tile.querySelectorAll("[data-slot]")].map((n) => n.getAttribute("data-slot"));
    expect(slots.indexOf("service-launcher-disabled-reason")).toBeGreaterThan(-1);
    expect(slots.indexOf("service-launcher-disabled-reason")).toBeLessThan(
      slots.indexOf("service-launcher-action"),
    );
  });
});
