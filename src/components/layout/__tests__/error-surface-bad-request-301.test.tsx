/**
 * ErrorSurface — 400 Bad Request joins the closed status set (gh#301).
 *
 * The union shipped as `403 | 404 | 500 | 503`, so a consumer porting a legacy
 * `BadRequestException` page (起動パラメータ不正 — a route reached with parameters the server
 * refuses to interpret) could only render it by defeating the type and re-supplying what
 * `STATUS_META` owns:
 *
 *   status={400 as ErrorSurfaceStatusProp["status"]} icon={TriangleAlert} tone="warning"
 *
 * That is the library gap the cardinal rules name (fix the library, never patch the consumer): the
 * surface already renders `status` verbatim, so 400 LOOKED supported while the type and the
 * icon/tone table said otherwise — three consumers would have picked three different glyphs.
 *
 * These tests pin both halves of the fix, and each half fails on its own if reverted:
 *  - the TYPE assertions are checked by `pnpm typecheck` (tsconfig includes `src`), so narrowing
 *    the union back re-breaks them at compile time;
 *  - the RUNTIME assertions read the status-derived icon + tone, which come from `STATUS_META[400]`
 *    — without that entry the component dereferences `undefined` and the render throws.
 */
import { describe, expect, expectTypeOf, it } from "vitest";
import { Home, ShieldAlert, TriangleAlert } from "lucide-react";

import { AppShell } from "../app-shell";
import { ErrorSurface } from "../error-surface";
import { PageContainer } from "../page-container";
import { Sidebar } from "../sidebar";
import { Button } from "../../general/button";
import { renderWithUi } from "@/test/render";
import { expectNoA11yViolations } from "@/test/a11y";
import type { ErrorSurfaceStatusProp } from "../../../props/vocabulary";

function BadRequestSurface(props: { icon?: typeof TriangleAlert }) {
  return (
    <ErrorSurface
      mode="application"
      status={400}
      title="リクエストが不正です"
      description="起動パラメータが不足しているか、値が不正です。メニューから開き直してください。"
      action={<Button>メニューへ戻る</Button>}
      {...props}
    />
  );
}

/** The rendered glyph markup, so icon identity is asserted without depending on a CSS class name. */
function iconMarkup(container: HTMLElement): string {
  const icon = container.querySelector(".ui-empty-state-icon");
  expect(icon, "the surface renders a status-derived icon").not.toBeNull();
  return icon?.innerHTML ?? "";
}

describe("ErrorSurface status=400 (gh#301)", () => {
  it("admits 400 into the closed status vocabulary — no consumer cast", () => {
    // Erased at runtime; enforced by `pnpm typecheck`. A consumer writing `status={400}` compiles
    // only while 400 is a member, which is the entire point of the issue.
    expectTypeOf<ErrorSurfaceStatusProp>().toEqualTypeOf<400 | 403 | 404 | 500 | 503>();
    expectTypeOf<400>().toMatchTypeOf<ErrorSurfaceStatusProp>();
  });

  it("derives TriangleAlert + warning from the status, so no consumer picks the glyph", () => {
    const { container } = renderWithUi(<BadRequestSurface />);

    expect(container.querySelector('[data-slot="empty-state"]')).toHaveAttribute(
      "data-tone",
      "warning",
    );
    // Same markup as passing the glyph explicitly, and NOT the 403 glyph — the default is a real
    // decision (this system's warning mark), not "whatever the first status happened to be".
    const { container: explicit } = renderWithUi(<BadRequestSurface icon={TriangleAlert} />);
    const { container: forbidden } = renderWithUi(<BadRequestSurface icon={ShieldAlert} />);
    expect(iconMarkup(container)).toBe(iconMarkup(explicit));
    expect(iconMarkup(container)).not.toBe(iconMarkup(forbidden));
  });

  it("announces the code as a phrase and exposes it as data-status, like every other status", () => {
    const { container } = renderWithUi(<BadRequestSurface />);

    const code = container.querySelector(".ui-error-surface-status");
    expect(code?.querySelector('[aria-hidden="true"]')).toHaveTextContent("400");
    expect(code?.querySelector(".sr-only")).toHaveTextContent("400");
    expect(container.querySelector('[data-slot="error-surface"]')).toHaveAttribute(
      "data-status",
      "400",
    );
  });

  it("is an APPLICATION failure — it returns only its own block, preserving the route's shell", () => {
    // A malformed request means the app is healthy: the shell must survive so the viewer can
    // navigate away, exactly as for 403/404 (never `mode="system"`, which owns the page).
    const { container } = renderWithUi(
      <AppShell
        sidebar={
          <Sidebar
            activeId="orders"
            sections={[{ items: [{ id: "orders", label: "受注書", icon: Home }] }]}
          />
        }
      >
        <PageContainer title="受注書">
          <BadRequestSurface />
        </PageContainer>
      </AppShell>,
    );
    expect(container.querySelector(".ui-centered-shell")).toBeNull();
    expect(container.querySelector('[data-slot="error-surface"]')).not.toBeNull();
  });

  it("has no a11y violations as the body of the shell it ships in", async () => {
    await expectNoA11yViolations(
      <AppShell
        sidebar={
          <Sidebar
            activeId="orders"
            sections={[{ items: [{ id: "orders", label: "受注書", icon: Home }] }]}
          />
        }
      >
        <PageContainer title="受注書">
          <BadRequestSurface />
        </PageContainer>
      </AppShell>,
    );
  });
});
