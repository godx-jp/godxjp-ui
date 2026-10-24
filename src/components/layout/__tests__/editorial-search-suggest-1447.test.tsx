/**
 * gh#1447 — EditorialSearch suggestions: the inset search box as an ARIA combobox over a grouped
 * listbox of links (WAI-ARIA APG "combobox with listbox popup").
 *
 * Before: EditorialSearch was a plain form and input. A site that wanted live, grouped matches
 * under its search box (cards, products, sets) had to hand-roll the combobox roles, the keyboard
 * model and the IME guard outside the kit.
 */
import * as React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EditorialSearch } from "../editorial";
import type { EditorialSearchSuggestionGroupProp } from "../../../props/components/layout.prop";

const groups: EditorialSearchSuggestionGroupProp[] = [
  {
    id: "cards",
    label: "カード",
    items: [
      { id: "1", href: "/cards/1", label: "ピカチュウ", description: "SV1S · 025", meta: "¥120", media: "SV1S" },
      { id: "2", href: "/cards/2", label: "ピカチュウex", description: "SV8 · 132" },
    ],
  },
  { id: "products", label: "BOX・パック", items: [] },
  { id: "sets", label: "収録弾", items: [{ id: "9", href: "/sets/9", label: "超電ブレイカー" }] },
];
const footer = { href: "/search?q=ピカ", label: "「ピカ」をすべて見る" };

/** A router link: navigates on click without a page load, and forwards the kit's props. */
function routerLink(navigate: (href: string) => void) {
  return function RouterLink({ href, onClick, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
    return (
      <a
        {...rest}
        href={href}
        onClick={(event) => {
          event.preventDefault();
          navigate(String(href));
          onClick?.(event);
        }}
      />
    );
  };
}

function renderSearch(props: Partial<React.ComponentProps<typeof EditorialSearch>> = {}) {
  const onSearch = vi.fn();
  const onQueryChange = vi.fn();
  const navigate = vi.fn();
  render(
    <EditorialSearch
      label="カードを検索"
      submitLabel="検索"
      onSearch={onSearch}
      onQueryChange={onQueryChange}
      suggestions={groups}
      suggestionsFooter={footer}
      suggestionsLabel="候補"
      linkComponent={routerLink(navigate)}
      {...props}
    />,
  );
  const input = screen.getByRole("combobox", { name: "カードを検索" });
  return { input, onSearch, onQueryChange, navigate };
}

function type(input: HTMLElement, value: string) {
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value } });
}

describe("EditorialSearch suggestions (gh#1447)", () => {
  it("is a plain search field without suggestion props", () => {
    render(<EditorialSearch label="検索" submitLabel="検索" />);
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.getByRole("searchbox", { name: "検索" })).toBeTruthy();
  });

  it("opens a grouped listbox of links once the focused field holds a query", () => {
    const { input, onQueryChange } = renderSearch();
    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(input.getAttribute("aria-autocomplete")).toBe("list");

    type(input, "ピカ");

    expect(onQueryChange).toHaveBeenLastCalledWith("ピカ");
    expect(input.getAttribute("aria-expanded")).toBe("true");
    const listbox = screen.getByRole("listbox", { name: "候補" });
    expect(input.getAttribute("aria-controls")).toBe(listbox.id);
    // Empty groups are left out; each group is named by its heading.
    expect(within(listbox).getAllByRole("group").map((g) => g.getAttribute("aria-labelledby"))).toHaveLength(2);
    expect(within(listbox).getByRole("group", { name: "カード" })).toBeTruthy();
    const options = within(listbox).getAllByRole("option");
    expect(options.map((o) => o.getAttribute("href"))).toEqual(["/cards/1", "/cards/2", "/sets/9", footer.href]);
    expect(options[0].getAttribute("tabindex")).toBe("-1");
  });

  it("portals the popup out of the box, so a section clipping its overflow cannot cut it off", () => {
    const { input } = renderSearch();
    type(input, "ピカ");
    const listbox = screen.getByRole("listbox", { name: "候補" });
    const popup = listbox.closest<HTMLElement>(".ui-editorial-search-popup")!;
    expect(input.closest("form")!.contains(listbox)).toBe(false);
    expect(popup.parentElement).toBe(document.body);
    // Placed from the box's rect, with the room left below it.
    expect(popup.style.top).not.toBe("");
    expect(popup.style.getPropertyValue("--editorial-search-popup-room")).toMatch(/px$/);
  });

  it("stays closed for an empty query and closes when the field loses focus", () => {
    const { input } = renderSearch();
    type(input, "   ");
    expect(input.getAttribute("aria-expanded")).toBe("false");

    type(input, "ピカ");
    fireEvent.blur(input);
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });

  it("moves the active row with the arrows, wrapping, and follows its link on Enter", () => {
    const { input, navigate, onSearch } = renderSearch();
    type(input, "ピカ");
    const options = screen.getAllByRole("option");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input.getAttribute("aria-activedescendant")).toBe(options[0].id);
    expect(options[0].getAttribute("aria-selected")).toBe("true");

    fireEvent.keyDown(input, { key: "ArrowUp" });
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input.getAttribute("aria-activedescendant")).toBe(options[2].id);

    fireEvent.keyDown(input, { key: "Enter" });
    expect(navigate).toHaveBeenCalledWith("/sets/9");
    expect(onSearch).not.toHaveBeenCalled();
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });

  it("submits the query on Enter when no row is active", () => {
    const { input, onSearch } = renderSearch();
    type(input, "ピカ");
    fireEvent.submit(input.closest("form")!);
    expect(onSearch).toHaveBeenCalledWith("ピカ");
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });

  it("closes on Escape and reopens on ArrowDown", () => {
    const { input } = renderSearch();
    type(input, "ピカ");
    fireEvent.keyDown(input, { key: "ArrowDown" });

    const escape = fireEvent.keyDown(input, { key: "Escape" });
    expect(escape).toBe(false);
    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(input.hasAttribute("aria-activedescendant")).toBe(false);

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input.getAttribute("aria-expanded")).toBe("true");
  });

  it("never reports an IME candidate, and leaves Enter to the IME while composing", () => {
    const { input, onQueryChange, navigate, onSearch } = renderSearch();
    fireEvent.focus(input);
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: "ぴか" } });
    expect(onQueryChange).not.toHaveBeenCalled();

    fireEvent.keyDown(input, { key: "ArrowDown", isComposing: true });
    fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    expect(navigate).not.toHaveBeenCalled();
    expect(onSearch).not.toHaveBeenCalled();

    fireEvent.compositionEnd(input, { data: "ピカ" });
    expect(onQueryChange).toHaveBeenCalledTimes(1);
    expect(onQueryChange).toHaveBeenCalledWith("ぴか");
    expect(input.getAttribute("aria-expanded")).toBe("true");
    expect(input.hasAttribute("aria-activedescendant")).toBe(false);
  });

  it("keeps focus in the field when a row is pressed, and a click follows the link", () => {
    const { input, navigate } = renderSearch();
    type(input, "ピカ");
    const option = screen.getAllByRole("option")[1];

    expect(fireEvent.mouseDown(option)).toBe(false);
    fireEvent.click(option);
    expect(navigate).toHaveBeenCalledWith("/cards/2");
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });

  it("renders media, description and meta inside the row; media is decorative", () => {
    const { input } = renderSearch();
    type(input, "ピカ");
    const first = screen.getAllByRole("option")[0];
    expect(first.textContent).toContain("ピカチュウ");
    expect(first.textContent).toContain("SV1S · 025");
    expect(first.textContent).toContain("¥120");
    expect(first.querySelector(".ui-editorial-search-suggestion-media")?.getAttribute("aria-hidden")).toBe("true");
  });
});
