import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nProvider } from "react-aria-components";

import { AppProvider } from "../app/app-provider";
import { Segmented } from "../components/data-entry/segmented";
import { ToggleGroup, ToggleGroupItem } from "../components/data-entry/toggle-group";
import { Steps } from "../components/navigation/steps";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/navigation/tabs";

/**
 * ARROW KEYS UNDER RTL — the axis nothing in this repo measured.
 *
 * `check:rtl` is a SOURCE lint and says so in its own success line ("23 CSS + 185 JSX files use
 * logical inline-axis only"): it reads files for `margin-left` and `pl-*`, and it never renders
 * anything. That is the right job for it and it does that job — but "the stylesheet is logical" and
 * "the keyboard follows the reader" are two different claims, and only the first one had a guard.
 *
 * The second one could not even be exercised: this package bundles `en`/`ja`/`vi`, all LTR, so no
 * test had an RTL locale to render under. React Aria navigates by the ambient locale from
 * `useLocale()`, Radix by its own `dir`, and NEITHER reads `<html dir>` — which is the only thing
 * `AppProvider` used to set. Measured in jsdom before the fix, on `<html dir="rtl">` with no
 * provider: ArrowLeft on the first Tab went to the LAST tab (Tabs), and to the LAST option
 * (Segmented). Straight LTR traversal under a mirrored layout: the arrow that points at the next
 * item on screen selects the previous one.
 *
 * So the harness here is an RTL LOCALE, not an attribute — that is the thing the components
 * actually read. `ar-AE` is a real RTL tag; nothing in the package needs translations for it,
 * because direction is all that is being asserted.
 */
const RTL_LOCALE = "ar-AE";

function Rtl({ children }: { children: React.ReactNode }) {
  return <I18nProvider locale={RTL_LOCALE}>{children}</I18nProvider>;
}

/** The name of whatever holds DOM focus — assertions bind to the accessible label, never a class. */
function focusedName(): string | null {
  const active = document.activeElement as HTMLElement | null;

  if (active === null) {
    return null;
  }

  // The focused control is the real `<input type="radio">`, and react-aria wraps
  // it in the `<label>` that names it — so `textContent` on the input itself is
  // empty. Reading through the label is what this helper always MEANT (see the
  // line above); with Radix's `<button role="radio">` holding its own text it
  // was only accidentally right.
  return (active.closest("label") ?? active).textContent?.trim() ?? "";
}

afterEach(() => {
  document.documentElement.dir = "";
});

const TABS = (
  <Tabs defaultValue="first">
    <TabsList aria-label="Sections">
      <TabsTrigger value="first">First</TabsTrigger>
      <TabsTrigger value="second">Second</TabsTrigger>
      <TabsTrigger value="third">Third</TabsTrigger>
    </TabsList>
    <TabsContent value="first">First panel</TabsContent>
    <TabsContent value="second">Second panel</TabsContent>
    <TabsContent value="third">Third panel</TabsContent>
  </Tabs>
);

const TOGGLES = (
  <ToggleGroup type="single" aria-label="Alignment">
    <ToggleGroupItem value="first">First</ToggleGroupItem>
    <ToggleGroupItem value="second">Second</ToggleGroupItem>
    <ToggleGroupItem value="third">Third</ToggleGroupItem>
  </ToggleGroup>
);

const OPTIONS = [
  { value: "first", label: "First" },
  { value: "second", label: "Second" },
  { value: "third", label: "Third" },
] as const;

const SEGMENTED = <Segmented aria-label="Density" options={[...OPTIONS]} defaultValue="first" />;

/**
 * Every roving-focus control in the library that traverses on the INLINE axis. Each one is asserted
 * twice — LTR then RTL — because "ArrowLeft moves to Second" only means something if ArrowRight
 * moved to Second under LTR. A control that ignored direction entirely would pass one half and fail
 * the other, which is exactly the failure this file exists to catch.
 */
const INLINE_ROVING: Array<[string, React.ReactElement]> = [
  ["Tabs", TABS],
  ["ToggleGroup", TOGGLES],
  ["Segmented", SEGMENTED],
];

describe("inline-axis arrow keys follow the reading direction", () => {
  for (const [name, ui] of INLINE_ROVING) {
    it(`${name}: LTR — ArrowRight advances, ArrowLeft retreats`, async () => {
      const user = userEvent.setup();
      render(ui);

      await user.tab();
      expect(focusedName()).toBe("First");

      await user.keyboard("{ArrowRight}");
      expect(focusedName()).toBe("Second");

      await user.keyboard("{ArrowLeft}");
      expect(focusedName()).toBe("First");
    });

    it(`${name}: RTL — ArrowLeft advances, ArrowRight retreats`, async () => {
      const user = userEvent.setup();
      render(<Rtl>{ui}</Rtl>);

      await user.tab();
      expect(focusedName()).toBe("First");

      await user.keyboard("{ArrowLeft}");
      expect(focusedName()).toBe("Second");

      await user.keyboard("{ArrowRight}");
      expect(focusedName()).toBe("First");
    });
  }
});

/**
 * `<html dir="rtl">` ON ITS OWN IS NOT RTL SUPPORT — pinned so nobody "fixes" a direction bug by
 * writing the attribute and stopping there. This is what the library did until `AppProvider` began
 * rendering an `I18nProvider`, and the symptom is silent: the layout mirrors, the keyboard does
 * not, and every static gate stays green because no file gained a `margin-left`.
 */
describe("the html attribute alone does not reach the keyboard", () => {
  it("Tabs still traverse LTR when only document.documentElement.dir is rtl", async () => {
    document.documentElement.dir = "rtl";
    const user = userEvent.setup();
    render(TABS);

    await user.tab();
    await user.keyboard("{ArrowRight}");

    expect(focusedName()).toBe("Second");
  });
});

/**
 * AppProvider is the thing that closes the gap for a real app: it already wrote `dir` on `<html>`
 * from the locale, and now hands the same locale to React Aria. The shipped locales are all LTR, so
 * what is asserted here is the WIRING — that a control inside an AppProvider takes its direction
 * from the provider's locale rather than from the browser's.
 */
describe("AppProvider feeds the direction to the controls inside it", () => {
  it("keeps ArrowRight advancing for the LTR locales the package ships", async () => {
    const user = userEvent.setup();
    render(<AppProvider defaultLocale="ja">{TABS}</AppProvider>);

    await user.tab();
    await user.keyboard("{ArrowRight}");

    expect(focusedName()).toBe("Second");
    expect(document.documentElement.dir).toBe("ltr");
  });

  /**
   * The APP's locale wins over whatever is around it — a browser language, a host page's provider.
   * Asserted from the outside in: an RTL provider wrapping an `AppProvider` on a shipped LTR
   * locale must leave the arrows LTR, because the control belongs to the app, not to the browser.
   * This is the half that was silently wrong before: with no provider of its own, every React Aria
   * primitive here read `navigator.language`.
   */
  it("overrides an ambient locale rather than inheriting it", async () => {
    const user = userEvent.setup();
    render(
      <Rtl>
        <AppProvider defaultLocale="ja">{SEGMENTED}</AppProvider>
      </Rtl>,
    );

    await user.tab();
    expect(focusedName()).toBe("First");

    await user.keyboard("{ArrowRight}");
    expect(focusedName()).toBe("Second");
  });
});

/**
 * STEPS IS NOT A ROVING-FOCUS CONTROL, and that is the correct answer rather than a gap.
 *
 * A step is either informational (no `onValueChange` → not a button at all) or an ordinary
 * `<button>` in the tab order. There is no roving tabindex and no arrow handler, so the arrows do
 * nothing in EITHER direction and there is no direction bug to have. Asserted rather than assumed,
 * so that adding arrow traversal later has to come back through this file and say which way the
 * keys point.
 */
describe("Steps navigates by Tab, not by arrows", () => {
  it("leaves focus alone when an arrow is pressed, in either direction", async () => {
    const user = userEvent.setup();
    render(
      <Rtl>
        <Steps
          value={0}
          onValueChange={() => {}}
          items={[{ title: "First" }, { title: "Second" }, { title: "Third" }]}
        />
      </Rtl>,
    );

    await user.tab();
    const first = document.activeElement;
    expect(first).toBe(screen.getByRole("button", { name: /First/ }));

    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(first);
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(first);

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: /Second/ }));
  });
});
