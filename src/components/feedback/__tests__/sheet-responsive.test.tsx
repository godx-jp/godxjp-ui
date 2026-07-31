import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";

import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";
import { Button } from "../../general/button";
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTrigger } from "../sheet";

/**
 * Responsive drawer / detail-panel contract (gh#215).
 *
 * The acceptance viewports are 1440 (desktop), 1024 (laptop) and 390 (mobile). jsdom has no layout,
 * so the viewport is expressed the same way the component reads it — through `matchMedia` — and the
 * assertions are on the resolved PRESENTATION (`data-side`) rather than on computed pixels.
 */
const BREAKPOINT_TOKEN = "--sheet-responsive-breakpoint-width";

function matchMediaFor(width: number) {
  return (query: string): MediaQueryList => {
    const max = /\(max-width:\s*(\d+(?:\.\d+)?)px\)/.exec(query);
    const min = /\(min-width:\s*(\d+(?:\.\d+)?)px\)/.exec(query);
    const matches =
      (max != null || min != null) &&
      (max == null || width <= Number(max[1])) &&
      (min == null || width >= Number(min[1]));

    return {
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList;
  };
}

function setViewport(width: number) {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn(matchMediaFor(width)),
  });
}

/** Pretend the document root declares a themed breakpoint, without disturbing any other element. */
function stubBreakpointToken(value: string) {
  const real = window.getComputedStyle.bind(window);
  vi.spyOn(window, "getComputedStyle").mockImplementation(
    (element: Element, pseudo?: string | null) => {
      const style = real(element, pseudo);
      if (element !== document.documentElement) return style;
      return new Proxy(style, {
        get(target, property, receiver) {
          if (property === "getPropertyValue") {
            return (name: string) =>
              name === BREAKPOINT_TOKEN ? value : target.getPropertyValue(name);
          }
          const resolved: unknown = Reflect.get(target, property, receiver);
          return typeof resolved === "function" ? resolved.bind(target) : resolved;
        },
      });
    },
  );
}

function DetailPanel({ responsive }: { responsive?: "auto" | "side" | "bottom" }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" variant="outline">
          Open detail
        </Button>
      </SheetTrigger>
      <SheetContent responsive={responsive} width={420}>
        <SheetHeader title="Invoice INV-1024" subtitle="Issued 2026-07-30" />
        <SheetBody>
          <p>Detail body</p>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}

async function openPanel(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Open detail" }));
  return screen.findByRole("dialog", { name: "Invoice INV-1024" });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SheetContent responsive contract (gh#215)", () => {
  it.each([
    [1440, "right"],
    [1024, "right"],
    [390, "bottom"],
  ])(
    'responsive="auto" renders a desktop side panel / mobile bottom sheet at %ipx',
    async (width, expectedSide) => {
      setViewport(width);
      const user = userEvent.setup();
      renderWithUi(<DetailPanel responsive="auto" />);

      const panel = await openPanel(user);
      await waitFor(() => {
        expect(panel).toHaveAttribute("data-side", expectedSide);
      });
      expect(panel).toHaveAttribute("data-responsive", "auto");
    },
  );

  it("caps only the responsive bottom presentation with the geometry token", async () => {
    setViewport(390);
    const user = userEvent.setup();
    const { unmount } = renderWithUi(<DetailPanel responsive="auto" />);

    const bottom = await openPanel(user);
    await waitFor(() => {
      expect(bottom).toHaveAttribute("data-side", "bottom");
    });
    expect(bottom.className).toContain("max-h-[var(--sheet-bottom-max-height)]");
    // The bottom sheet is full-bleed: the side-panel `width` cap must not leak into it.
    expect(bottom.className).not.toContain("min(var(--sheet-width),100%)");
    unmount();

    // A plain `side="bottom"` sheet keeps its content-sized height — untouched by the new contract.
    renderWithUi(
      <Sheet defaultOpen>
        <SheetContent side="bottom">
          <SheetHeader title="Legacy bottom sheet" />
        </SheetContent>
      </Sheet>,
    );
    const legacy = await screen.findByRole("dialog", { name: "Legacy bottom sheet" });
    expect(legacy).toHaveAttribute("data-side", "bottom");
    expect(legacy.className).not.toContain("max-h-[var(--sheet-bottom-max-height)]");
  });

  it('keeps the default responsive="side" backward compatible at 390px', async () => {
    setViewport(390);
    const user = userEvent.setup();
    renderWithUi(<DetailPanel />);

    const panel = await openPanel(user);
    expect(panel).toHaveAttribute("data-side", "right");
    expect(panel).toHaveAttribute("data-responsive", "side");
    expect(panel.className).toContain("min(var(--sheet-width),100%)");
  });

  it('pins the bottom presentation for responsive="bottom" on a desktop viewport', async () => {
    setViewport(1440);
    const user = userEvent.setup();
    renderWithUi(<DetailPanel responsive="bottom" />);

    const panel = await openPanel(user);
    expect(panel).toHaveAttribute("data-side", "bottom");
  });

  it("takes the breakpoint from the theme token, not a hard-coded literal", async () => {
    // 24.375rem = 390px: a service that moves the knob keeps the SIDE panel at 640px.
    stubBreakpointToken("24.375rem");
    setViewport(640);
    const user = userEvent.setup();
    renderWithUi(<DetailPanel responsive="auto" />);

    const panel = await openPanel(user);
    await waitFor(() => {
      expect(window.matchMedia).toHaveBeenCalledWith("(max-width: 390px)");
    });
    expect(panel).toHaveAttribute("data-side", "right");
  });

  it("preserves focus trap, Escape and focus restoration in the mobile bottom sheet", async () => {
    setViewport(390);
    const user = userEvent.setup();
    renderWithUi(<DetailPanel responsive="auto" />);

    const trigger = screen.getByRole("button", { name: "Open detail" });
    trigger.focus();
    const panel = await openPanel(user);
    await waitFor(() => {
      expect(panel).toHaveAttribute("data-side", "bottom");
    });

    expect(panel).toContainElement(document.activeElement as HTMLElement);
    await user.tab();
    expect(panel).toContainElement(document.activeElement as HTMLElement);

    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Invoice INV-1024" })).not.toBeInTheDocument();
    });
    expect(trigger).toHaveFocus();
  });

  it.each([
    [1440, "ltr"],
    [390, "ltr"],
    [390, "rtl"],
  ])("has no axe violations at %ipx (dir=%s)", async (width, dir) => {
    setViewport(width);
    document.documentElement.setAttribute("dir", dir);
    const user = userEvent.setup();
    renderWithUi(<DetailPanel responsive="auto" />);

    await openPanel(user);
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
    document.documentElement.removeAttribute("dir");
  });
});
