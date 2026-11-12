import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

/**
 * CenteredShell `barAppearance="frosted"` in Chromium against the real stylesheet: the bar stays
 * pinned while the page scrolls under it, is a translucent pane with a backdrop blur, and turns
 * SOLID under `prefers-reduced-transparency: reduce` (emulated over CDP — Playwright has no
 * option for it). A default bar keeps its static, opaque box.
 */
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { CenteredShell } from "./src/components/layout/centered-shell";
const mode = new URLSearchParams(location.search).get("mode");
const tall = <div style={{ height: 2400 }}>content</div>;
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}><div id="ready">
    {mode === "page" ? (
      <CenteredShell barAppearance="frosted" topbar={<span>brand</span>}>{tall}</CenteredShell>
    ) : mode === "default" ? (
      <CenteredShell variant="auth" brand={<span>brand</span>}>{tall}</CenteredShell>
    ) : (
      <CenteredShell variant="auth" barAppearance="frosted" brand={<span>brand</span>} actions={<span>lang</span>}>{tall}</CenteredShell>
    )}
  </div></AppProvider>,
);
`;

let fixture: ChromiumFixture;

beforeAll(async () => {
  fixture = await bootChromium(ENTRY);
}, 180_000);

afterAll(async () => {
  await fixture?.close();
});

const probe = () => {
  const bar = document.querySelector<HTMLElement>(".ui-auth-shell-bar, .ui-centered-shell-bar")!;
  window.scrollTo(0, 600);
  const cs = getComputedStyle(bar);
  return {
    top: bar.getBoundingClientRect().top,
    position: cs.position,
    background: cs.backgroundColor,
    filter: cs.backdropFilter,
  };
};

describe('CenteredShell barAppearance="frosted"', { timeout: 60_000 }, () => {
  it("auth shape: sticky translucent pane with a blur, pinned while the page scrolls", async () => {
    const page = await fixture.open("", { width: 1280, height: 800 });
    const m = await page.evaluate(probe);
    await page.close();
    expect(m.position).toBe("sticky");
    expect(m.top).toBe(0);
    expect(m.background).toMatch(/\/ 0\.72\)|, 0\.72\)/);
    expect(m.filter).toMatch(/blur\(20px\)/);
  });

  it("page shape: the same material", async () => {
    const page = await fixture.open("?mode=page", { width: 1280, height: 800 });
    const m = await page.evaluate(probe);
    await page.close();
    expect(m.position).toBe("sticky");
    expect(m.top).toBe(0);
    expect(m.filter).toMatch(/blur\(20px\)/);
  });

  it("goes solid under prefers-reduced-transparency", async () => {
    const page = await fixture.open("", { width: 1280, height: 800 });
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-transparency", value: "reduce" }],
    });
    const matches = await page.evaluate(
      () => matchMedia("(prefers-reduced-transparency: reduce)").matches,
    );
    const m = await page.evaluate(probe);
    await page.close();
    expect(matches).toBe(true);
    expect(m.filter).toBe("none");
    expect(m.background).not.toMatch(/0\.72/);
    expect(m.position).toBe("sticky");
  });

  it("leaves the default bar static and opaque", async () => {
    const page = await fixture.open("?mode=default", { width: 1280, height: 800 });
    const m = await page.evaluate(probe);
    await page.close();
    expect(m.position).toBe("static");
    expect(m.filter).toBe("none");
    expect(m.top).toBeLessThan(0);
  });
});
