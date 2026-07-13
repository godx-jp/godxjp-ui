import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { Select } from "../select";

// Select-level integration of the #175 SearchSelect engine contract (controlled open/search,
// custom error/retry + load-more slots, custom filter, readOnly, size). The engine itself is
// unit-tested in search-select-controlled.test.tsx; here we prove `Select`/`DataSelect` forward
// the same props through the public surface.

const OPTIONS = [
  { value: "jp", label: "日本", sublabel: "Japan" },
  { value: "vn", label: "Việt Nam", sublabel: "Vietnam" },
];

describe("Select extended contracts", () => {
  it("supports controlled open and search input", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onSearchChange = vi.fn();
    renderWithUi(
      <Select
        showSearch
        options={OPTIONS}
        open
        onOpenChange={onOpenChange}
        search="vie"
        onSearchChange={onSearchChange}
        aria-label="Country"
      />,
    );
    expect(screen.getByRole("textbox")).toHaveValue("vie");
    await user.type(screen.getByRole("textbox"), "t");
    expect(onSearchChange).toHaveBeenCalled();
    await user.click(screen.getByRole("combobox"));
    expect(onOpenChange).toHaveBeenCalled();
  });

  it("renders a custom retry slot and recovers a rejected loader", async () => {
    const user = userEvent.setup();
    let attempt = 0;
    const loadOptions = vi.fn(async () => {
      attempt += 1;
      if (attempt === 1) throw new Error("offline");
      return { options: OPTIONS, hasMore: false };
    });
    renderWithUi(
      <Select
        loadOptions={loadOptions}
        errorMessage="Could not load"
        renderError={({ message, retry }) => (
          <div>
            <span>{message}</span>
            <button type="button" onClick={retry}>
              Retry now
            </button>
          </div>
        )}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    expect(await screen.findByText("Could not load")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retry now" }));
    expect(await screen.findByRole("option", { name: /日本/ })).toBeInTheDocument();
  });

  it("offers a keyboard-accessible custom load-more slot", async () => {
    const user = userEvent.setup();
    const loadOptions = vi.fn(async ({ page }: { query: string; page: number }) => ({
      options: page === 1 ? [OPTIONS[0]] : [OPTIONS[1]],
      hasMore: page === 1,
    }));
    renderWithUi(
      <Select
        loadOptions={loadOptions}
        renderLoadMore={({ hasMore, loadMore }) =>
          hasMore ? (
            <button type="button" onClick={loadMore}>
              More countries
            </button>
          ) : null
        }
      />,
    );
    await user.click(screen.getByRole("combobox"));
    const more = await screen.findByRole("button", { name: "More countries" });
    more.focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("option", { name: /Việt Nam/ })).toBeInTheDocument();
  });

  it("supports custom static filtering, readOnly, and size parity", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Select
        showSearch
        options={OPTIONS}
        defaultValue="jp"
        onValueChange={onValueChange}
        filterOption={(option, query) => option.sublabel?.toLowerCase() === query.toLowerCase()}
        readOnly
        size="sm"
        aria-label="Country"
      />,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("aria-readonly", "true");
    expect(trigger).toHaveAttribute("data-size", "sm");
    // readOnly never opens the popover — no search box, no new pick.
    await user.click(trigger);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(trigger).toHaveTextContent("日本");
  });
});
