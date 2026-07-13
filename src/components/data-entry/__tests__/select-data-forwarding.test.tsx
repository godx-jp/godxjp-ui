import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";

import { Select } from "../select";
import { FormField } from "../form-field";

// #175 — `DataSelect` (the `<Select options|loadOptions>` data-driven engine) must forward the
// FormField a11y wiring AND the controlled/customization props to the underlying `SearchSelect`
// it delegates to in searchable mode, instead of silently dropping them. This suite proves the
// forwarding end-to-end through the PUBLIC `Select` API — the engine-level behavior itself is
// covered by search-select-controlled.test.tsx.

const OPTIONS = [
  { value: "1", label: "現金" },
  { value: "2", label: "普通預金" },
  { value: "3", label: "売上" },
];

const trigger = () => screen.getByRole("combobox");

describe("Select (searchable) — FormField a11y forwarding to SearchSelect (#175)", () => {
  it("forwards aria-labelledby/-describedby/-invalid/-errormessage/-required to the SearchSelect trigger", () => {
    const { getByRole, getByText } = renderWithUi(
      <FormField id="acct" label="勘定科目" helper="必須" error="必須項目です" required>
        <Select id="acct" options={OPTIONS} showSearch onValueChange={() => undefined} />
      </FormField>,
    );
    const control = getByRole("combobox");
    expect(control).toHaveAccessibleName("勘定科目");
    expect(control).toHaveAccessibleDescription("必須");
    expect(control).toHaveAttribute("aria-invalid", "true");
    expect(control).toHaveAttribute("aria-required", "true");
    expect(control.getAttribute("aria-errormessage")).toBe(getByText("必須項目です").id);
    // The id relationship: FormField's id lands on the SearchSelect trigger itself.
    expect(control).toHaveAttribute("id", "acct");
  });
});

describe("Select (searchable) — controlled open/search forwarding to SearchSelect (#175)", () => {
  it("forwards `open` — the popover renders open without any interaction", async () => {
    renderWithUi(
      <Select
        options={OPTIONS}
        showSearch
        onValueChange={() => undefined}
        open
        onOpenChange={() => undefined}
      />,
    );
    expect(await screen.findByRole("textbox")).toBeInTheDocument();
  });

  it("forwards `onOpenChange` — reports the attempt even while pinned closed", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithUi(
      <Select
        options={OPTIONS}
        showSearch
        onValueChange={() => undefined}
        open={false}
        onOpenChange={onOpenChange}
      />,
    );
    await user.click(trigger());
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("forwards `search`/`onSearchChange` — the input reflects controlled state and drives filtering", async () => {
    const user = userEvent.setup();
    function Harness() {
      const [search, setSearch] = React.useState("");
      return (
        <>
          <button type="button" onClick={() => setSearch("売上")}>
            set query externally
          </button>
          <Select
            options={OPTIONS}
            showSearch
            onValueChange={() => undefined}
            search={search}
            onSearchChange={setSearch}
          />
        </>
      );
    }
    renderWithUi(<Harness />);
    await user.click(screen.getByRole("button", { name: "set query externally" }));
    await user.click(trigger());
    expect(screen.getByRole("textbox")).toHaveValue("売上");
    await waitFor(() => {
      expect(screen.getByText("売上")).toBeInTheDocument();
      expect(screen.queryByText("現金")).not.toBeInTheDocument();
    });
  });
});

describe("Select (searchable) — readOnly/size forwarding to SearchSelect (#175)", () => {
  it("forwards `readOnly` — value shows, clear is hidden, popover never opens", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Select
        options={OPTIONS}
        showSearch
        value="1"
        onValueChange={() => undefined}
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

  it("forwards `size` to the SearchSelect trigger", () => {
    renderWithUi(
      <Select options={OPTIONS} showSearch onValueChange={() => undefined} size="sm" />,
    );
    expect(trigger()).toHaveAttribute("data-size", "sm");
  });
});

describe("Select (searchable) — filtering + custom error/retry/load-more forwarding (#175)", () => {
  it("forwards `filterOption` — overrides the default client-side filter", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Select
        options={OPTIONS}
        showSearch
        onValueChange={() => undefined}
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

  it("forwards `renderError`/`renderLoadMore` — custom slots reach the SearchSelect engine", async () => {
    const user = userEvent.setup();
    let attempt = 0;
    const loadOptions = vi.fn(async ({ page }: { page: number }) => {
      if (page === 1) {
        attempt += 1;
        if (attempt === 1) throw new Error("boom");
        return { options: [OPTIONS[0]], hasMore: true };
      }
      return { options: [OPTIONS[1]], hasMore: false };
    });
    renderWithUi(
      <Select
        showSearch
        loadOptions={loadOptions}
        onValueChange={() => undefined}
        errorMessage="読み込み失敗"
        renderError={({ message, retry }) => (
          <div>
            <span>custom:{message}</span>
            <button type="button" onClick={retry}>
              再試行
            </button>
          </div>
        )}
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
    expect(await screen.findByText("custom:読み込み失敗")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "再試行" }));
    expect(await screen.findByText("現金")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "もっと見る" }));
    await waitFor(() => expect(screen.getByText("普通預金")).toBeInTheDocument());
  });
});
