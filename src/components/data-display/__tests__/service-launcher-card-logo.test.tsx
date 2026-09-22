import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { Clock } from "lucide-react";

import { Button } from "../../general/button";
import { ServiceLauncherCard } from "../service-launcher-card";

/**
 * gh#850 — a service with a REAL uploaded logo had no way onto the tile, because `icon` was a
 * required `LucideIcon` and nothing else was accepted.
 *
 * EVERY TEST HERE DRIVES THE FAILURE PATH, not the happy one. The happy path (a logo that loads) is
 * one assertion; the states that actually reach production are the other five — a `logo_path` row
 * whose file was deleted, a URL still in flight, an empty projection value. A launcher that shows an
 * empty medallion or a torn-page glyph for any of them is worse than one that never took the logo.
 *
 * jsdom loads no resources, so the probe is driven by hand: `useImageLoadingStatus` builds a
 * DETACHED `new window.Image()` and decides on its `load`/`error` event, which is exactly the seam
 * this fake sits in. `complete` + `naturalWidth` are modelled because `getImageLoadingStatus` reads
 * both — `complete` alone cannot tell "finished" from "failed".
 */
class FakeImage {
  static instances: FakeImage[] = [];

  complete = false;
  naturalWidth = 0;
  src = "";
  crossOrigin: string | null = null;
  referrerPolicy = "";

  private readonly listeners = new Map<string, Set<(event: unknown) => void>>();

  constructor() {
    FakeImage.instances.push(this);
  }

  addEventListener(type: string, listener: (event: unknown) => void) {
    const set = this.listeners.get(type) ?? new Set();
    set.add(listener);
    this.listeners.set(type, set);
  }

  removeEventListener(type: string, listener: (event: unknown) => void) {
    this.listeners.get(type)?.delete(listener);
  }

  private emit(type: string) {
    for (const listener of this.listeners.get(type) ?? []) {
      listener({ currentTarget: this });
    }
  }

  /** The bytes arrived and decoded to a picture. */
  succeed(naturalWidth = 128) {
    this.complete = true;
    this.naturalWidth = naturalWidth;
    this.emit("load");
  }

  /** 404, CORS, or bytes that are not an image — `complete` true, `naturalWidth` 0. */
  fail() {
    this.complete = true;
    this.naturalWidth = 0;
    this.emit("error");
  }
}

const LOGO_URL = "https://cdn.corp.example.jp/uploads/services/attend-logo.webp";

function renderTile(props: { logo?: string } = {}) {
  return render(
    <ServiceLauncherCard
      icon={Clock}
      title="勤怠管理"
      statusLabel="利用可能"
      statusTone="success"
      metadata="attend.corp.example.jp"
      action={<Button>サービスを開く</Button>}
      {...props}
    />,
  );
}

const medallion = (container: HTMLElement) =>
  container.querySelector('[data-slot="service-launcher-icon"]')!;

describe("ServiceLauncherCard · logo (gh#850)", () => {
  beforeEach(() => {
    FakeImage.instances = [];
    vi.stubGlobal("Image", FakeImage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("puts the uploaded logo in the medallion once it loads, in place of the glyph", () => {
    const { container } = renderTile({ logo: LOGO_URL });

    expect(FakeImage.instances).toHaveLength(1);
    expect(FakeImage.instances[0].src).toBe(LOGO_URL);

    act(() => FakeImage.instances[0].succeed());

    const logo = container.querySelector<HTMLImageElement>('[data-slot="service-launcher-logo"]');
    expect(logo).toBeTruthy();
    expect(logo).toHaveAttribute("src", LOGO_URL);
    // The medallion holds ONE mark. A logo that stacked on top of the glyph would read as two.
    expect(medallion(container).querySelector("svg")).toBeNull();
  });

  it("FAILURE PATH · a logo URL that 404s leaves a usable tile on the glyph, not an empty box", () => {
    const { container } = renderTile({ logo: LOGO_URL });

    act(() => FakeImage.instances[0].fail());

    // No <img> at all — not a hidden one, not a broken one. The browser is never handed a source it
    // would paint its torn-page icon for.
    expect(container.querySelector('[data-slot="service-launcher-logo"]')).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    // And the tile is still a tile: mark, name, status, action.
    expect(medallion(container).querySelector("svg")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2, name: "勤怠管理" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "サービスを開く" })).toBeInTheDocument();
    expect(screen.getByText("利用可能")).toBeInTheDocument();
  });

  it("shows the glyph while the logo is still in flight — the medallion is never empty", () => {
    const { container } = renderTile({ logo: LOGO_URL });

    // The URL IS being fetched — this is what says the prop is wired at all, and it is what makes
    // this test fail on the pre-gh#850 component rather than pass vacuously.
    expect(FakeImage.instances).toHaveLength(1);
    expect(FakeImage.instances[0].src).toBe(LOGO_URL);
    // …but nothing has resolved, so the glyph is still what a person sees.
    expect(container.querySelector('[data-slot="service-launcher-logo"]')).toBeNull();
    expect(medallion(container).querySelector("svg")).toBeTruthy();
  });

  it("falls back to the glyph when the logo is absent or an empty projection value", () => {
    const withoutLogo = renderTile();
    expect(medallion(withoutLogo.container).querySelector("svg")).toBeTruthy();
    expect(withoutLogo.container.querySelector("img")).toBeNull();
    // An empty string must not become a request for the page's own URL.
    expect(FakeImage.instances).toHaveLength(0);

    withoutLogo.unmount();

    const emptyLogo = renderTile({ logo: "" });
    expect(medallion(emptyLogo.container).querySelector("svg")).toBeTruthy();
    expect(emptyLogo.container.querySelector("img")).toBeNull();
    expect(FakeImage.instances).toHaveLength(0);
  });

  it("recovers to the glyph when a working logo is replaced by a broken one", () => {
    const { container, rerender } = render(
      <ServiceLauncherCard
        icon={Clock}
        logo={LOGO_URL}
        title="勤怠管理"
        action={<Button>開く</Button>}
      />,
    );
    act(() => FakeImage.instances[0].succeed());
    expect(container.querySelector('[data-slot="service-launcher-logo"]')).toBeTruthy();

    rerender(
      <ServiceLauncherCard
        icon={Clock}
        logo="https://cdn.corp.example.jp/uploads/services/deleted.webp"
        title="勤怠管理"
        action={<Button>開く</Button>}
      />,
    );
    act(() => FakeImage.instances[1].fail());

    expect(container.querySelector('[data-slot="service-launcher-logo"]')).toBeNull();
    expect(medallion(container).querySelector("svg")).toBeTruthy();
  });

  it("keeps the logo DECORATIVE — empty alt inside the aria-hidden medallion, announced once", () => {
    const { container } = renderTile({ logo: LOGO_URL });
    act(() => FakeImage.instances[0].succeed());

    expect(medallion(container)).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector('[data-slot="service-launcher-logo"]')).toHaveAttribute(
      "alt",
      "",
    );
    // The service NAME is the accessible text; a logo alt would say "勤怠管理" a second time.
    expect(screen.getAllByText("勤怠管理")).toHaveLength(1);
    // `decoding` is the hint that still means something once the probe has already fetched;
    // `loading="lazy"` would describe a request that is over.
    expect(container.querySelector('[data-slot="service-launcher-logo"]')).toHaveAttribute(
      "decoding",
      "async",
    );
    expect(container.querySelector('[data-slot="service-launcher-logo"]')).not.toHaveAttribute(
      "loading",
    );
  });

  it("sizes the logo from the GLYPH's token, so a mixed grid keeps one optical weight", () => {
    // jsdom applies no stylesheet, so the contract is asserted against the sheet itself — the same
    // way every other style test in this repo does it.
    const css = readFileSync("src/styles/card-layout.css", "utf8");
    const logoRule = css.match(/\[data-slot="service-launcher-logo"\]\s*\{([^}]*)\}/)?.[1] ?? "";
    const glyphRule =
      css.match(/\[data-slot="service-launcher-icon"\]\s*>\s*svg\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(glyphRule).toContain("var(--card-service-launcher-icon-glyph-size)");
    // The SAME token, not a second one that happens to resolve to the same number today.
    expect(logoRule).toContain("width: var(--card-service-launcher-icon-glyph-size)");
    expect(logoRule).toContain("height: var(--card-service-launcher-icon-glyph-size)");
    // `contain`: an administrator's upload is any ratio and a cropped wordmark is not the brand.
    expect(logoRule).toContain("object-fit: contain");
    expect(logoRule).not.toContain("cover");
  });
});
