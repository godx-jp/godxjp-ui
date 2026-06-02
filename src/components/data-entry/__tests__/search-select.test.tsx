import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { SearchSelect } from "../search-select";

const loader = () =>
  vi.fn(async () => ({
    options: [
      { value: "1", label: "現金", sublabel: "ASSET", group: "資産" },
      { value: "2", label: "普通預金", sublabel: "ASSET", group: "資産" },
      { value: "3", label: "売上", sublabel: "INCOME", group: "収益" },
    ],
    hasMore: false,
  }));

describe("SearchSelect", () => {
  it("loads options remotely on open and groups them under headings", async () => {
    const user = userEvent.setup();
    const loadOptions = loader();
    renderWithUi(<SearchSelect value="" onChange={() => undefined} loadOptions={loadOptions} />);

    await user.click(screen.getByRole("combobox"));

    // Options arrive from the async loader…
    expect(await screen.findByText("現金")).toBeInTheDocument();
    expect(screen.getByText("売上")).toBeInTheDocument();
    // …grouped under optgroup-style headings.
    expect(screen.getByText("資産")).toBeInTheDocument();
    expect(screen.getByText("収益")).toBeInTheDocument();
    expect(loadOptions).toHaveBeenCalledWith({ query: "", page: 1 });
  });

  it("calls onChange with the picked option's value, and submits via a hidden field", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = renderWithUi(
      <SearchSelect value="" onChange={onChange} loadOptions={loader()} name="account_id" />,
    );

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByText("普通預金"));

    expect(onChange).toHaveBeenCalledWith("2", expect.objectContaining({ value: "2" }));
    expect(container.querySelector('input[type="hidden"][name="account_id"]')).toBeInTheDocument();
  });

  it("refetches with the debounced query when the user types", async () => {
    const user = userEvent.setup();
    const loadOptions = loader();
    renderWithUi(<SearchSelect value="" onChange={() => undefined} loadOptions={loadOptions} />);

    await user.click(screen.getByRole("combobox"));
    await screen.findByText("現金");
    await user.type(screen.getByRole("textbox"), "預金");

    // The debounced search term reaches the loader (page resets to 1).
    await vi.waitFor(() => expect(loadOptions).toHaveBeenCalledWith({ query: "預金", page: 1 }));
  });

  it("works as a static combobox (no loadOptions) — supersedes Autocomplete", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithUi(
      <SearchSelect
        value=""
        onChange={onChange}
        options={[
          { value: "osaka", label: "Osaka Hub" },
          { value: "tokyo", label: "Tokyo Hub" },
        ]}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await screen.findByText("Osaka Hub");
    // Client-side filter narrows the static list (after the debounce).
    await user.type(screen.getByRole("textbox"), "tok");
    await vi.waitFor(() => {
      expect(screen.getByText("Tokyo Hub")).toBeInTheDocument();
      expect(screen.queryByText("Osaka Hub")).not.toBeInTheDocument();
    });
    await user.click(screen.getByText("Tokyo Hub"));
    expect(onChange).toHaveBeenCalledWith("tokyo", expect.objectContaining({ value: "tokyo" }));
  });

  it("renders a custom option via renderOption", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <SearchSelect
        value=""
        onChange={() => undefined}
        options={[{ value: "1", label: "Cash" }]}
        renderOption={(option) => <span>custom:{option.label}</span>}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    expect(await screen.findByText("custom:Cash")).toBeInTheDocument();
  });
});
