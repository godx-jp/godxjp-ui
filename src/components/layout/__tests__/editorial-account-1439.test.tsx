/**
 * gh#1439 — the editorial account family: the signed-in pages of an editorial site (a collection,
 * display settings, sign-in). Before: none of these shapes could be built without a className or
 * style. Every geometry value is an `--editorial-*` token so a theme re-declares it under its own
 * width queries.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import { describe, expect, it, vi } from "vitest";

import {
  EditorialAuth,
  EditorialAuthCard,
  EditorialEmptyPanel,
  EditorialFootnote,
  EditorialMetaBar,
  EditorialStats,
  EditorialTextButton,
  EditorialToggleGroup,
  EditorialToolbar,
  HoldingCard,
  HoldingCardAction,
  HoldingGrid,
  SettingsLayout,
  SettingsPanel,
  ThemePicker,
} from "../editorial-account";
import { EditorialPageHeader, EditorialSearch } from "../editorial";
import * as layout from "../index";

const read = (relativePath: string) =>
  readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8").replace(
    /\/\*[\s\S]*?\*\//g,
    "",
  );
const css = read("../../../styles/editorial-account-layout.css");
const tokens = read("../../../tokens/components/editorial-account.css");

const rule = (selector: string) => {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [...css.matchAll(new RegExp(`(?:^|[\\s}])${esc}\\s*\\{([^}]*)\\}`, "g"))]
    .map((m) => m[1])
    .join("\n");
};

describe("editorial account family wiring (gh#1439)", () => {
  it("is exported from the layout barrel, and its layer and tokens are imported by the stylesheets", () => {
    expect(layout.EditorialToggleGroup).toBe(EditorialToggleGroup);
    expect(read("../../../styles/index.css")).toContain(
      '@import "./editorial-account-layout.css";',
    );
    expect(read("../../../styles/core.css")).toContain('@import "./editorial-account-layout.css";');
    expect(read("../../../tokens/base.css")).toContain(
      '@import "./components/editorial-account.css";',
    );
  });

  it("names no breakpoint in its rules (a theme re-declares the tokens instead)", () => {
    expect(css).not.toMatch(/@media\s*\((min|max)?-?width/);
  });
});

describe("EditorialToggleGroup (gh#1439)", () => {
  const items = [
    { value: "all", label: "All items" },
    { value: "card", label: "Cards" },
    { value: "product", label: "Sealed" },
  ];

  it("is a named group of aria-pressed buttons; clicking one reports its value", () => {
    const onValueChange = vi.fn();
    render(
      <EditorialToggleGroup
        aria-label="Collection type"
        items={items}
        value="all"
        onValueChange={onValueChange}
      />,
    );
    const group = screen.getByRole("group", { name: "Collection type" });
    expect(group).toHaveAttribute("data-variant", "text");
    expect(screen.getByRole("button", { name: "All items" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Cards" })).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(screen.getByRole("button", { name: "Sealed" }));
    expect(onValueChange).toHaveBeenCalledWith("product");
  });

  it("icon variant: icon-only buttons are named by their label and the glyph is hidden", () => {
    render(
      <EditorialToggleGroup
        aria-label="View"
        variant="icon"
        value="list"
        onValueChange={() => {}}
        items={[
          { value: "grid", label: "Grid view", icon: <svg data-testid="g" /> },
          { value: "list", label: "List view", icon: <svg data-testid="l" /> },
        ]}
      />,
    );
    const list = screen.getByRole("button", { name: "List view" });
    expect(list).toHaveAttribute("aria-pressed", "true");
    expect(list.textContent).toBe("");
    expect(screen.getByTestId("l").parentElement).toHaveAttribute("aria-hidden");
  });

  it("reads every length from tokens: 44px targets, bordered pressed text, framed icon group", () => {
    expect(tokens).toContain(
      "--editorial-toggle-group-option-min-height: var(--touch-target-min, 2.75rem);",
    );
    expect(tokens).toContain("--editorial-toggle-group-option-padding-inline: 1rem;");
    expect(tokens).toContain("--editorial-toggle-group-frame-padding: 2px;");
    expect(rule(".ui-editorial-toggle-group-option")).toContain(
      "min-height: var(--editorial-toggle-group-option-min-height)",
    );
    expect(rule('.ui-editorial-toggle-group-option[aria-pressed="true"]')).toContain(
      "var(--editorial-toggle-group-pressed-background, hsl(var(--muted)))",
    );
    expect(rule('.ui-editorial-toggle-group[data-variant="icon"]')).toContain(
      "padding: var(--editorial-toggle-group-frame-padding)",
    );
    expect(rule(".ui-editorial-toggle-group")).toContain(
      "justify-content: var(--editorial-toggle-group-align-inline)",
    );
  });
});

describe("EditorialMetaBar / EditorialToolbar / EditorialTextButton (gh#1439)", () => {
  it("meta bar: hidden glyph, start line and end slot over hairline rules, direction from a token", () => {
    const { container } = render(
      <EditorialMetaBar icon={<svg data-testid="lock" />} start="Private" end={<b>Saved</b>} />,
    );
    expect(screen.getByTestId("lock").parentElement).toHaveAttribute("aria-hidden");
    expect(container.querySelector(".ui-editorial-meta-bar-end")?.textContent).toBe("Saved");
    expect(rule(".ui-editorial-meta-bar")).toContain(
      "flex-direction: var(--editorial-meta-bar-align-flow)",
    );
    expect(rule(".ui-editorial-meta-bar")).toContain("border-block: var(--stroke-hairline) solid");
  });

  it("toolbar: start and end clusters; a theme stacks it through --editorial-toolbar-display", () => {
    const { container } = render(<EditorialToolbar start="filters" end="actions" />);
    expect(container.querySelector(".ui-editorial-toolbar-start")?.textContent).toBe("filters");
    expect(container.querySelector(".ui-editorial-toolbar-end")?.textContent).toBe("actions");
    expect(rule(".ui-editorial-toolbar")).toContain("display: var(--editorial-toolbar-display)");
  });

  it("text button: a real button by default, the consumer's link with asChild, glyph trailing", () => {
    const onClick = vi.fn();
    render(
      <>
        <EditorialTextButton onClick={onClick}>Reset</EditorialTextButton>
        <EditorialTextButton asChild icon={<svg data-testid="arrow" />}>
          <a href="/collection/">Your collection</a>
        </EditorialTextButton>
      </>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(onClick).toHaveBeenCalled();
    const link = screen.getByRole("link", { name: "Your collection" });
    expect(link).toHaveClass("ui-editorial-text-button");
    expect(link.lastElementChild).toContainElement(screen.getByTestId("arrow"));
  });
});

describe("EditorialEmptyPanel (gh#1439)", () => {
  it("guest: decorative card stack, then kicker, h2, copy and actions", () => {
    const { container } = render(
      <EditorialEmptyPanel
        eyebrow={<p>KICKER</p>}
        title="Keep what you love"
        description="Record your cards."
        actions={<a href="/login/">Sign in</a>}
      />,
    );
    const art = container.querySelector(".ui-editorial-empty-panel-art");
    expect(art).toHaveAttribute("aria-hidden");
    expect(art?.children).toHaveLength(3);
    expect(screen.getByRole("heading", { level: 2, name: "Keep what you love" })).toBeTruthy();
    expect(container.querySelector(".ui-editorial-empty-panel-actions a")).toBeTruthy();
  });

  it("empty: dashed, a medallion instead of the stack", () => {
    const { container } = render(
      <EditorialEmptyPanel variant="empty" icon={<svg />} title="Nothing yet" level={3} />,
    );
    expect(container.firstElementChild).toHaveAttribute("data-variant", "empty");
    expect(container.querySelector(".ui-editorial-empty-panel-art")).toBeNull();
    expect(container.querySelector(".ui-editorial-empty-panel-icon")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 3 })).toBeTruthy();
    expect(rule('.ui-editorial-empty-panel[data-variant="empty"]')).toContain("dashed");
  });
});

describe("EditorialStats (gh#1439)", () => {
  it("a list of tiles with figure, unit and note; tracks and the lead tile come from tokens", () => {
    render(
      <EditorialStats
        aria-label="Totals"
        items={[
          { label: "All", value: "117", unit: "items", note: "Things you love." },
          { label: "Cards", value: "114" },
          { label: "Sealed", value: "3" },
        ]}
      />,
    );
    const list = screen.getByRole("list", { name: "Totals" });
    expect(list.querySelectorAll("li")).toHaveLength(3);
    expect(list.querySelector("strong")?.textContent).toBe("117items");
    expect(tokens).toContain("--editorial-stats-track-size: 1.4fr 1fr 1fr;");
    expect(rule(".ui-editorial-stats-item:first-child")).toContain(
      "grid-column: var(--editorial-stats-lead-span-offset)",
    );
  });
});

describe("HoldingGrid / HoldingCard (gh#1439)", () => {
  const card = (
    <HoldingCard
      media={
        <a href="/cards/1/">
          <img src="/c.png" alt="" />
        </a>
      }
      overline="Single card"
      title={<a href="/cards/1/">Pikachu</a>}
      meta="025/165"
      tags={["NM", "× 2"]}
      purchase={{ label: "Purchase / item", value: "¥1,200" }}
      date="Purchased: 2026-10-01"
      actions={
        <>
          <HoldingCardAction icon={<svg />} asChild>
            <a href="/collection/1/edit/">Edit</a>
          </HoldingCardAction>
          <HoldingCardAction aria-label="Remove Pikachu" onClick={() => {}}>
            Remove
          </HoldingCardAction>
        </>
      }
    />
  );

  it("renders a named list of cards; the media link becomes the picture ground", () => {
    const { container } = render(
      <HoldingGrid view="list" aria-label="Your collection">
        {card}
      </HoldingGrid>,
    );
    const list = screen.getByRole("list", { name: "Your collection" });
    expect(list).toHaveAttribute("data-view", "list");
    expect(container.querySelector("a.ui-holding-card-media img")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2, name: "Pikachu" })).toBeTruthy();
    expect(container.querySelectorAll(".ui-holding-card-tag")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Edit" })).toHaveClass("ui-holding-card-action");
    expect(screen.getByRole("button", { name: "Remove Pikachu" })).toBeTruthy();
  });

  it("list view is the same card on 140px 1fr tracks (not a table); grid tracks from a token", () => {
    expect(tokens).toContain("--editorial-holding-card-list-track-size: 140px 1fr;");
    expect(tokens).toContain("--editorial-holding-grid-track-size: repeat(4, minmax(0, 1fr));");
    expect(rule('.ui-holding-grid[data-view="list"] .ui-holding-card')).toContain(
      "grid-template-columns: var(--editorial-holding-card-list-track-size)",
    );
    expect(tokens).toContain("--editorial-holding-card-media-height: 14.75rem;");
  });
});

describe("SettingsLayout / SettingsPanel / ThemePicker (gh#1439)", () => {
  it("settings: a sticky rail beside panels named by their titles", () => {
    render(
      <SettingsLayout aside={<p>Saved in this browser.</p>}>
        <SettingsPanel number="01" title="Language" titleId="s-lang" description="Two choices.">
          <p>fields</p>
        </SettingsPanel>
      </SettingsLayout>,
    );
    expect(screen.getByRole("complementary").textContent).toBe("Saved in this browser.");
    expect(screen.getByRole("region", { name: "Language" })).toBeTruthy();
    expect(rule(".ui-settings-layout-aside")).toContain("position: sticky");
    expect(tokens).toContain("--editorial-settings-layout-track-size: 260px minmax(0, 1fr);");
  });

  it("theme picker: a named radio group; controlled value, arrow-free click reports the choice", () => {
    const onValueChange = vi.fn();
    const options = [
      { value: "light", label: "Light", preview: "light" as const },
      { value: "dark", label: "Dark", preview: "dark" as const },
      { value: "system", label: "System", preview: "system" as const },
    ];
    const { rerender } = render(
      <ThemePicker
        legend="Choose a theme"
        value="light"
        onValueChange={onValueChange}
        options={options}
      />,
    );
    expect(screen.getByRole("group", { name: "Choose a theme" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Light" })).toBeChecked();
    fireEvent.click(screen.getByRole("radio", { name: "Dark" }));
    expect(onValueChange).toHaveBeenCalledWith("dark");
    // Controlled: nothing moves until the parent says so.
    expect(screen.getByRole("radio", { name: "Light" })).toBeChecked();
    rerender(
      <ThemePicker
        legend="Choose a theme"
        value="dark"
        onValueChange={onValueChange}
        options={options}
      />,
    );
    expect(screen.getByRole("radio", { name: "Dark" })).toBeChecked();
    expect(document.querySelector('[data-preview="system"]')).toBeTruthy();
  });

  it("theme picker: uncontrolled from defaultValue", () => {
    render(
      <ThemePicker
        legend="Theme"
        defaultValue="system"
        options={[
          { value: "light", label: "Light", preview: "light" },
          { value: "system", label: "System", preview: "system" },
        ]}
      />,
    );
    expect(screen.getByRole("radio", { name: "System" })).toBeChecked();
    fireEvent.click(screen.getByRole("radio", { name: "Light" }));
    expect(screen.getByRole("radio", { name: "Light" })).toBeChecked();
    expect(tokens).toContain("--editorial-theme-picker-preview-height: 7.25rem;");
  });
});

describe("EditorialAuth (gh#1439)", () => {
  it("story column (h1, art, benefits) beside the card (h2, form, footer)", () => {
    const { container } = render(
      <EditorialAuth
        title={"Make room for\nwhat you love."}
        description="Compare the details."
        art={<img src="/mark.svg" alt="" />}
        benefits={["Prices", "A collection"]}
      >
        <EditorialAuthCard title="Welcome back." description="Sign in." footer="New here?">
          <form aria-label="Sign in" />
        </EditorialAuthCard>
      </EditorialAuth>,
    );
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Make room for\nwhat you love.",
    );
    expect(screen.getByRole("heading", { level: 2, name: "Welcome back." })).toBeTruthy();
    expect(container.querySelector(".ui-editorial-auth-art")).toHaveAttribute("aria-hidden");
    expect(container.querySelectorAll(".ui-editorial-auth-benefits li")).toHaveLength(2);
    expect(container.querySelector(".ui-editorial-auth-card-footer")?.textContent).toBe(
      "New here?",
    );
    expect(tokens).toContain("--editorial-auth-track-size: 1fr 460px;");
  });
});

describe("EditorialPageHeader eyebrowTone (gh#1439)", () => {
  it('"accent" marks the header so its kicker keeps the plain Eyebrow; the default emits nothing', () => {
    const { container, rerender } = render(<EditorialPageHeader title="Settings" />);
    expect(container.firstElementChild).not.toHaveAttribute("data-eyebrow-tone");
    rerender(<EditorialPageHeader title="Settings" eyebrowTone="accent" />);
    expect(container.firstElementChild).toHaveAttribute("data-eyebrow-tone", "accent");
    expect(css).toContain('.ui-editorial-page-header[data-eyebrow-tone="accent"]');
    expect(css).toContain("font-size: var(--editorial-eyebrow-font-size)");
  });
});

describe('EditorialSearch variant="inline" / EditorialFootnote (gh#1439)', () => {
  it("a named search region with a visible label; the query settles after typing, at once on Enter", () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    render(
      <EditorialSearch
        variant="inline"
        label="Search your collection"
        onSearch={onSearch}
        count="3 entries"
      />,
    );
    expect(screen.getByRole("search", { name: "Search your collection" })).toBeTruthy();
    const input = screen.getByRole("searchbox", { name: "Search your collection" });
    fireEvent.change(input, { target: { value: " pika " } });
    expect(onSearch).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onSearch).toHaveBeenCalledWith("pika");
    fireEvent.change(input, { target: { value: "mew" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSearch).toHaveBeenLastCalledWith("mew");
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onSearch).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("status").textContent).toBe("3 entries");
    vi.useRealTimers();
    expect(tokens).toContain("--editorial-search-inline-field-max-width: 25rem;");
  });

  it("footnote: a note and a trailing action, 13px from a token", () => {
    const { container } = render(
      <EditorialFootnote action={<button type="button">Reset</button>}>
        Saved automatically.
      </EditorialFootnote>,
    );
    expect(container.querySelector(".ui-editorial-footnote-body")?.textContent).toBe(
      "Saved automatically.",
    );
    expect(screen.getByRole("button", { name: "Reset" })).toBeTruthy();
    expect(tokens).toContain("--editorial-footnote-font-size: 0.8125rem;");
  });

  it("Button outline reads --button-outline-foreground (role mirror, default --foreground)", () => {
    const controlCss = read("../../../styles/control.css");
    expect(controlCss).toContain(
      "color: var(--button-outline-foreground, hsl(var(--foreground)));",
    );
    expect(read("../../../tokens/components/control.css")).toContain(
      "--button-outline-foreground: initial;",
    );
  });
});

describe("FormField helper knobs (gh#1439)", () => {
  it("the helper / error line reads --form-field-note-* and the stack gap --form-field-control-gap, defaults unchanged", () => {
    const formCss = read("../../../styles/form-layout.css");
    expect(formCss).toContain("font-size: var(--form-field-note-font-size, var(--text-xs));");
    expect(formCss).toContain("line-height: var(--form-field-note-line-height, calc(1 / 0.75));");
    expect(formCss).toContain("gap: var(--form-field-control-gap, var(--space-stack-xs));");
    const formTokens = read("../../../tokens/components/form.css");
    expect(formTokens).toContain("--form-field-note-line-height: initial;");
    expect(formTokens).toContain("--form-field-control-gap: initial;");
  });
});

describe("Badge knobs (gh#1439)", () => {
  it("outline / dashed ink reads --badge-outline-foreground; the chip floor --badge-min-height", () => {
    const badgeSrc = read("../../data-display/badge.tsx");
    expect(badgeSrc).toContain(
      'outline: "text-[color:var(--badge-outline-foreground,hsl(var(--foreground)))]"',
    );
    expect(read("../../../styles/badge-layout.css")).toContain(
      "min-block-size: var(--badge-min-height, auto);",
    );
    expect(read("../../../tokens/components/badge.css")).toContain(
      "--badge-outline-foreground: initial;",
    );
  });
});
