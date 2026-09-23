import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { OverlayPortalProvider, ThemeScope } from "@/app";
import { Select } from "@/components/data-entry/select";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/feedback/dialog";
import { Toaster } from "@/components/feedback/sonner";
import { toast } from "@/components/feedback/use-toast";
import { Button } from "@/components/general/button";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";

/**
 * gh#877 — A SCOPED THEME DID NOT REACH ANY OVERLAY.
 *
 * Measured on `/isolate/feedback-dialog` before this existed, with every trigger moved inside a
 * wrapper carrying a scoped theme:
 *
 *     | | inside the scope | the opened Dialog |
 *     | --primary | 204 100% 37% | 268.7 100% 50%  (package default) |
 *     | --radius  | 20px         | calc(0.375rem * 1) |
 *     | --card    | 0 0% 20%     | 60 33% 99% |
 *     scope.contains(overlay) === false
 *
 * Every overlay portals to `document.body`, so custom-property inheritance stops at the portal
 * boundary: a themed region themes its own subtree and nothing it opens. These tests are that
 * measurement INVERTED — the three tokens, read off the opened overlay, must be the scope's.
 *
 * The theme here is written the PLAIN-CSS way for every case: a stylesheet keyed on
 * `[data-tenant]`, with no provider computing anything. That is the documented way to theme a
 * region in this repo (`docs/CUSTOMER-THEMING.md`), it is the case that decided the design, and it
 * is the one a "stamp the provider's own declarations" fix would have missed entirely.
 */

// The package default `--radius` is `calc(0.375rem * 1)`; a literal is used here because jsdom
// re-serialises `calc()` without the spaces and the whitespace is not what is under test.
const ROOT = { primary: "268.7 100% 50%", radius: "6px", card: "60 33% 99%" };
const ACME = { primary: "204 100% 37%", radius: "20px", card: "0 0% 20%" };
const INNER = { primary: "12 100% 45%", radius: "4px", card: "0 0% 10%" };

let themeSheet: HTMLStyleElement;

beforeEach(() => {
  themeSheet = document.createElement("style");
  themeSheet.textContent = `
    :root { --primary: ${ROOT.primary}; --radius: ${ROOT.radius}; --card: ${ROOT.card}; }
    [data-tenant="acme"] { --primary: ${ACME.primary}; --radius: ${ACME.radius}; --card: ${ACME.card}; }
    [data-tenant="inner"] { --primary: ${INNER.primary}; --radius: ${INNER.radius}; --card: ${INNER.card}; }
  `;
  document.head.appendChild(themeSheet);
});

afterEach(() => {
  themeSheet.remove();
});

/** The three tokens the issue measured, read the way the issue read them. */
function tokensOf(element: Element) {
  const computed = getComputedStyle(element);

  return {
    primary: computed.getPropertyValue("--primary").trim(),
    radius: computed.getPropertyValue("--radius").trim(),
    card: computed.getPropertyValue("--card").trim(),
  };
}

describe("ThemeScope — the measurement inverted", () => {
  it("a Dialog opened from inside the scope reports the SCOPE's --primary, --radius and --card", async () => {
    const user = userEvent.setup();

    renderWithUi(
      <div data-tenant="acme">
        <ThemeScope>
          <Dialog>
            <DialogTrigger asChild>
              <Button>開く</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>題名</DialogTitle>
            </DialogContent>
          </Dialog>
        </ThemeScope>
      </div>,
    );

    await user.click(screen.getByRole("button", { name: "開く" }));

    const dialog = await screen.findByText("題名");

    expect(tokensOf(dialog)).toEqual(ACME);
    // The portal boundary is still crossed — this is not "moved the overlay into the scope".
    expect(document.querySelector('[data-tenant="acme"]')?.contains(dialog)).toBe(false);
  });

  it("a Select listbox opened from inside the scope reports the scope's tokens", async () => {
    const user = userEvent.setup();

    renderWithUi(
      <div data-tenant="acme">
        <ThemeScope>
          <Select
            aria-label="国"
            placeholder="選択"
            options={[
              { value: "jp", label: "日本" },
              { value: "vn", label: "ベトナム" },
            ]}
          />
        </ThemeScope>
      </div>,
    );

    await user.click(screen.getByRole("combobox"));

    expect(tokensOf(await screen.findByRole("listbox"))).toEqual(ACME);
  });

  /*
   * THE TOAST IS THE ONE THE ISSUE GOT BACKWARDS, and the measurement says so: sonner does NOT
   * portal — it renders where it is mounted — so a `<Toaster />` declared inside the region
   * always inherited the region's tokens. This assertion passes on the old code too.
   *
   * What was broken is the other half of the same rule: the Toaster was the only overlay in this
   * library that could not LEAVE the region, so declaring it there put a `position: fixed` stack
   * inside whatever `transform` / `contain` ancestor the region happened to have. It now lands on
   * the same body-level host as every other overlay, which is the assertion that fails on the old
   * code.
   */
  it("a Toast raised from inside the scope reports the scope's tokens, from the body-level host", async () => {
    renderWithUi(
      <div data-tenant="acme" data-testid="region">
        <ThemeScope>
          <Toaster />
        </ThemeScope>
      </div>,
    );

    toast("保存しました");

    const message = await screen.findByText("保存しました");

    expect(tokensOf(message)).toEqual(ACME);
    expect(screen.getByTestId("region").contains(message)).toBe(false);
    expect(document.querySelector("[data-overlay-theme-host]")?.contains(message)).toBe(true);
  });
});

describe("ThemeScope — composability", () => {
  it("an overlay opened from an INNER scope gets the inner values, not the outer's", async () => {
    const user = userEvent.setup();

    renderWithUi(
      <div data-tenant="acme">
        <ThemeScope>
          <Dialog>
            <DialogTrigger asChild>
              <Button>外</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>外側</DialogTitle>
            </DialogContent>
          </Dialog>
          <div data-tenant="inner">
            <ThemeScope>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>内</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>内側</DialogTitle>
                </DialogContent>
              </Dialog>
            </ThemeScope>
          </div>
        </ThemeScope>
      </div>,
    );

    await user.click(screen.getByRole("button", { name: "内" }));
    expect(tokensOf(await screen.findByText("内側"))).toEqual(INNER);
  });

  it("nests its host inside an OverlayPortalProvider container instead of replacing it", async () => {
    const user = userEvent.setup();
    const container = document.createElement("div");

    container.id = "elsewhere";
    document.body.appendChild(container);

    renderWithUi(
      <OverlayPortalProvider container={container}>
        <div data-tenant="acme">
          <ThemeScope>
            <Dialog>
              <DialogTrigger asChild>
                <Button>開く</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>題名</DialogTitle>
              </DialogContent>
            </Dialog>
          </ThemeScope>
        </div>
      </OverlayPortalProvider>,
    );

    await user.click(screen.getByRole("button", { name: "開く" }));

    const dialog = await screen.findByText("題名");

    expect(container.contains(dialog)).toBe(true);
    expect(tokensOf(dialog)).toEqual(ACME);

    container.remove();
  });
});

describe("ThemeScope — the snapshot is kept fresh", () => {
  it("follows a theme change made WHILE the overlay is open", async () => {
    const user = userEvent.setup();

    renderWithUi(
      <div data-tenant="acme" data-testid="region">
        <ThemeScope>
          <Dialog>
            <DialogTrigger asChild>
              <Button>開く</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>題名</DialogTitle>
            </DialogContent>
          </Dialog>
        </ThemeScope>
      </div>,
    );

    await user.click(screen.getByRole("button", { name: "開く" }));

    const dialog = await screen.findByText("題名");

    expect(tokensOf(dialog)).toEqual(ACME);

    // The tenant switches under an OPEN dialog. Nothing remounts, so nothing would re-read the
    // scope on its own; the MutationObserver on the chain up to <html> is what does.
    screen.getByTestId("region").dataset.tenant = "inner";

    await waitFor(() => {
      expect(tokensOf(dialog)).toEqual(INNER);
    });
  });

  it("drops a token that stops differing from the root", async () => {
    const user = userEvent.setup();

    renderWithUi(
      <div data-tenant="acme" data-testid="region">
        <ThemeScope>
          <Dialog>
            <DialogTrigger asChild>
              <Button>開く</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>題名</DialogTitle>
            </DialogContent>
          </Dialog>
        </ThemeScope>
      </div>,
    );

    await user.click(screen.getByRole("button", { name: "開く" }));

    const dialog = await screen.findByText("題名");

    expect(tokensOf(dialog)).toEqual(ACME);

    // Theme removed entirely — the host must let go of what it was carrying, not keep the last
    // value it saw.
    delete screen.getByTestId("region").dataset.tenant;

    await waitFor(() => {
      expect(tokensOf(dialog)).toEqual(ROOT);
    });
  });
});

describe("ThemeScope — the default is untouched", () => {
  it("with no ThemeScope, an overlay still reports the ROOT tokens and no host is created", async () => {
    const user = userEvent.setup();

    renderWithUi(
      <div data-tenant="acme">
        <Dialog>
          <DialogTrigger asChild>
            <Button>開く</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>題名</DialogTitle>
          </DialogContent>
        </Dialog>
      </div>,
    );

    await user.click(screen.getByRole("button", { name: "開く" }));

    const dialog = await screen.findByText("題名");

    expect(tokensOf(dialog)).toEqual(ROOT);
    expect(document.querySelectorAll("[data-overlay-theme-host]")).toHaveLength(0);
  });

  it("removes its host again when it unmounts", () => {
    const { unmount } = renderWithUi(
      <div data-tenant="acme">
        <ThemeScope>
          <Button>何か</Button>
        </ThemeScope>
      </div>,
    );

    expect(document.querySelectorAll("[data-overlay-theme-host]")).toHaveLength(1);
    unmount();
    expect(document.querySelectorAll("[data-overlay-theme-host]")).toHaveLength(0);
  });

  it("is layout-neutral — the element it renders generates no box", () => {
    renderWithUi(
      <ThemeScope data-testid="scope">
        <Button>何か</Button>
      </ThemeScope>,
    );

    expect(getComputedStyle(screen.getByTestId("scope")).display).toBe("contents");
  });
});
