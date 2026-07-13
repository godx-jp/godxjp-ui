import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";

import { SearchSelect } from "../search-select";

// #175 — the SearchSelect engine gains controlled open/search, readOnly, size, filterOption, and
// custom error/retry + load-more slots. These tests exercise the ENGINE directly; a sibling suite
// (select-data-forwarding.test.tsx) proves `Select`/`DataSelect` forward the same props through.

const OPTIONS = [
  { value: "1", label: "現金" },
  { value: "2", label: "普通預金" },
  { value: "3", label: "売上" },
];

const trigger = () => screen.getByRole("combobox");

describe("SearchSelect — controlled open", () => {
  it("renders open when the `open` prop is true, without any interaction", async () => {
    renderWithUi(
      <SearchSelect
        value=""
        onValueChange={() => undefined}
        options={OPTIONS}
        open
        onOpenChange={() => undefined}
      />,
    );
    expect(await screen.findByRole("textbox")).toBeInTheDocument();
  });

  it("stays closed on click while `open` is externally pinned to false — onOpenChange still reports the attempt", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithUi(
      <SearchSelect
        value=""
        onValueChange={() => undefined}
        options={OPTIONS}
        open={false}
        onOpenChange={onOpenChange}
      />,
    );
    await user.click(trigger());
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("a real controlled harness opens on external state and reports close on pick", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    function Harness() {
      const [open, setOpen] = React.useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            open externally
          </button>
          <SearchSelect
            value=""
            onValueChange={() => undefined}
            options={OPTIONS}
            open={open}
            onOpenChange={(next) => {
              onOpenChange(next);
              setOpen(next);
            }}
          />
        </>
      );
    }
    renderWithUi(<Harness />);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "open externally" }));
    await user.click(await screen.findByRole("option", { name: "売上" }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});

describe("SearchSelect — controlled search", () => {
  it("uncontrolled: typing reports each value via onSearchChange", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    renderWithUi(
      <SearchSelect
        value=""
        onValueChange={() => undefined}
        options={OPTIONS}
        onSearchChange={onSearchChange}
      />,
    );
    await user.click(trigger());
    await user.type(screen.getByRole("textbox"), "a");
    expect(onSearchChange).toHaveBeenCalledWith("a");
  });

  it("controlled: the input reflects `search`, and typing round-trips through onSearchChange to drive filtering", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    function Harness() {
      const [search, setSearch] = React.useState("");
      return (
        <>
          <button type="button" onClick={() => setSearch("売上")}>
            set query externally
          </button>
          <SearchSelect
            value=""
            onValueChange={() => undefined}
            options={OPTIONS}
            search={search}
            onSearchChange={(next) => {
              onSearchChange(next);
              setSearch(next);
            }}
          />
        </>
      );
    }
    renderWithUi(<Harness />);
    // Set the query BEFORE opening — clicking a button outside the popover while it's open would
    // trigger Radix's own click-outside dismissal, which isn't what this test is exercising.
    await user.click(screen.getByRole("button", { name: "set query externally" }));
    await user.click(trigger());
    expect(screen.getByRole("textbox")).toHaveValue("売上");
    await waitFor(() => {
      expect(screen.getByText("売上")).toBeInTheDocument();
      expect(screen.queryByText("現金")).not.toBeInTheDocument();
    });

    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "現");
    expect(onSearchChange).toHaveBeenCalledWith("現");
    await waitFor(() => expect(screen.getByText("現金")).toBeInTheDocument());
  });
});

describe("SearchSelect — readOnly", () => {
  it("shows the current value but never opens, and hides the clear affordance", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <SearchSelect
        value="1"
        onValueChange={() => undefined}
        options={OPTIONS}
        readOnly
        clearable
        data-testid="acct"
      />,
    );
    const control = trigger();
    expect(control).toHaveTextContent("現金");
    expect(control).toHaveAttribute("aria-readonly", "true");
    expect(screen.queryByTestId("acct-option-clear")).not.toBeInTheDocument();

    await user.click(control);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});

describe("SearchSelect — size", () => {
  it("forwards the size tier to the underlying trigger Button", () => {
    renderWithUi(
      <SearchSelect value="" onValueChange={() => undefined} options={OPTIONS} size="sm" />,
    );
    expect(trigger()).toHaveAttribute("data-size", "sm");
  });
});

describe("SearchSelect — filterOption", () => {
  it("overrides the default client-side filter for a static options list", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <SearchSelect
        value=""
        onValueChange={() => undefined}
        options={OPTIONS}
        filterOption={(option, query) => option.value === query}
      />,
    );
    await user.click(trigger());
    await screen.findByText("現金");
    await user.type(screen.getByRole("textbox"), "2");
    await waitFor(() => {
      expect(screen.getByText("普通預金")).toBeInTheDocument();
      expect(screen.queryByText("現金")).not.toBeInTheDocument();
    });
  });
});

describe("SearchSelect — custom error/retry + load-more slots", () => {
  it("renderError receives the resolved message and a retry that reloads from page 1", async () => {
    const user = userEvent.setup();
    let attempt = 0;
    const loadOptions = vi.fn(async () => {
      attempt += 1;
      if (attempt === 1) throw new Error("boom");
      return { options: [OPTIONS[0]], hasMore: false };
    });
    renderWithUi(
      <SearchSelect
        value=""
        onValueChange={() => undefined}
        loadOptions={loadOptions}
        errorMessage="読み込み失敗"
        renderError={({ message, retry }) => (
          <div>
            <span>custom:{message}</span>
            <button type="button" onClick={retry}>
              再試行
            </button>
          </div>
        )}
      />,
    );
    await user.click(trigger());
    expect(await screen.findByText("custom:読み込み失敗")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "再試行" }));
    expect(await screen.findByText("現金")).toBeInTheDocument();
  });

  it("renderLoadMore renders while hasMore and its loadMore callback fetches the next page", async () => {
    const user = userEvent.setup();
    const loadOptions = vi.fn(async ({ page }: { page: number }) =>
      page === 1
        ? { options: [OPTIONS[0]], hasMore: true }
        : { options: [OPTIONS[1]], hasMore: false },
    );
    renderWithUi(
      <SearchSelect
        value=""
        onValueChange={() => undefined}
        loadOptions={loadOptions}
        renderLoadMore={({ hasMore, loadMore }) =>
          hasMore ? (
            <button type="button" onClick={loadMore}>
              もっと見る
            </button>
          ) : null
        }
      />,
    );
    await user.click(trigger());
    await screen.findByText("現金");
    expect(screen.queryByText("普通預金")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "もっと見る" }));
    await waitFor(() => expect(screen.getByText("普通預金")).toBeInTheDocument());
    // hasMore is now false — the slot disappears on its own (consumer-driven condition).
    expect(screen.queryByRole("button", { name: "もっと見る" })).not.toBeInTheDocument();
  });
});
