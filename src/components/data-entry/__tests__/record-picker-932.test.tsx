import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RecordPicker } from "../record-picker";

/**
 * RecordPicker — the SHAPE follows the size of the set (gh#932).
 *
 * From a `/human-tester` session on a consumer: "dưới 10 thì dropdown, trên 10 thì mở modal
 * search". The same concept ("pick a person") had shipped three different ways in one app,
 * including a bare text field where a mistyped key failed with a 422 AFTER save.
 *
 * What these cases hold is the part a screenshot cannot: which control appears at which size,
 * that a value keeps the shape it was given, that a chip survives a page its row is not on, and
 * that "where I am" never gets painted as "what I chose".
 */
const PEOPLE = Array.from({ length: 6 }, (_, i) => ({
  value: `u${i}`,
  label: `Person ${i}`,
}));
const MANY = Array.from({ length: 40 }, (_, i) => ({ value: `u${i}`, label: `Person ${i}` }));

describe("RecordPicker · the threshold decides the control (gh#932)", () => {
  it("is a dropdown at or under the threshold — a Select, not a lookalike", () => {
    render(<RecordPicker options={PEOPLE} placeholder="pick" />);
    // NOT `aria-haspopup` — Select's own trigger is a Popover trigger and carries
    // `aria-haspopup="dialog"` too, so the attribute distinguishes nothing. The honest signals
    // are the roles each branch really has: Select IS a combobox, the dialog branch is not.
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(document.querySelector(".ui-record-picker-trigger")).toBeNull();
  });

  it("switches to the dialog branch once the set is bigger than the threshold", () => {
    render(<RecordPicker options={MANY} placeholder="pick" />);
    expect(document.querySelector(".ui-record-picker-trigger")).not.toBeNull();
    expect(screen.queryByRole("combobox")).toBeNull();
  });

  it("counts the WHOLE set, not the page — `count` beats the rows in hand", () => {
    // Six rows loaded, eight hundred behind them. Only the server knows, so `count` decides.
    render(<RecordPicker options={PEOPLE} count={800} placeholder="pick" />);
    expect(document.querySelector(".ui-record-picker-trigger")).not.toBeNull();
    expect(screen.queryByRole("combobox")).toBeNull();
  });

  it("honours a service's own threshold", () => {
    render(<RecordPicker options={PEOPLE} threshold={3} placeholder="pick" />);
    expect(document.querySelector(".ui-record-picker-trigger")).not.toBeNull();
  });
});

describe("RecordPicker · value shape and labels", () => {
  it("returns a single value for `single`, not a one-element array", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <RecordPicker options={MANY} placeholder="pick" onValueChange={onValueChange} />,
    );
    await user.click(screen.getByRole("button", { name: /pick/i }));
    await user.click(await screen.findByRole("option", { name: "Person 2" }));
    // A picker that returns ["u2"] where the field holds a string is a bug the consumer has to
    // unwrap at every call site.
    expect(onValueChange).toHaveBeenCalledWith("u2");
  });

  it("commits `multiple` only on confirm, so a mis-click is undone by Cancel", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <RecordPicker
        mode="multiple"
        options={MANY}
        placeholder="pick"
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("button", { name: /pick/i }));
    await user.click(await screen.findByRole("option", { name: "Person 1" }));
    expect(onValueChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: /confirm|決定|xác nhận/i }));
    expect(onValueChange).toHaveBeenCalledWith(["u1"]);
  });

  it("renders a chip for a value whose row is not loaded — the first-render case", () => {
    // On first render there IS no result page, so without `selectedOptions` the chip would be a
    // raw id. This is the whole reason the prop exists.
    render(
      <RecordPicker
        loadOptions={async () => ({ options: [] })}
        value="u99"
        selectedOptions={[{ value: "u99", label: "Sato Hanako" }]}
        placeholder="pick"
      />,
    );
    expect(screen.getByText("Sato Hanako")).toBeInTheDocument();
  });

  it("pins a real `none` row — an unassigned owner is a value, not a cleared field", async () => {
    const user = userEvent.setup();
    render(
      <RecordPicker
        options={MANY}
        emptyOption={{ value: "", label: "担当者なし" }}
        placeholder="pick"
      />,
    );
    await user.click(screen.getByRole("button", { name: /pick/i }));
    const options = await screen.findAllByRole("option");
    expect(options[0]).toHaveTextContent("担当者なし");
  });
});

describe("RecordPicker · chosen is not the same thing as highlighted", () => {
  it("marks the chosen row with aria-selected AND a data hook the CSS paints separately", async () => {
    const user = userEvent.setup();
    render(<RecordPicker mode="multiple" options={MANY} placeholder="pick" />);
    await user.click(screen.getByRole("button", { name: /pick/i }));
    const row = await screen.findByRole("option", { name: "Person 3" });
    expect(row).toHaveAttribute("aria-selected", "false");
    await user.click(row);
    await waitFor(() => expect(row).toHaveAttribute("aria-selected", "true"));
    // The tick is a second channel beside the tinted label, so the chosen state never rests on
    // colour alone (WCAG 1.4.1) and never reads as merely "the row I am pointing at".
    expect(row).toHaveAttribute("data-picked", "");
  });
});

describe("RecordPicker · server-backed search", () => {
  it("passes the query AND the consumer's own filter vocabulary to loadOptions", async () => {
    // TYPED by the signature it stands in for. `vi.fn(async () => …)` infers a ZERO-ARG mock, so
    // `calls[0][0]` indexes an empty tuple — the assertion below would not compile, and casting it
    // would have hidden that the mock was never recording the argument this test is about.
    const loadOptions = vi.fn<
      (params: { query: string; filters: Record<string, string>; cursor?: string }) => Promise<{
        options: typeof MANY;
        count?: number;
      }>
    >(async () => ({ options: MANY.slice(0, 3), count: 900 }));
    const user = userEvent.setup();
    render(
      <RecordPicker
        loadOptions={loadOptions}
        count={900}
        placeholder="pick"
        filters={[
          { name: "role", label: "Role", options: [{ value: "admin", label: "Admin" }] },
        ]}
      />,
    );
    await user.click(screen.getByRole("button", { name: /pick/i }));
    await waitFor(() => expect(loadOptions).toHaveBeenCalled());
    expect(loadOptions.mock.calls[0][0]).toMatchObject({ query: "", filters: {} });
  });

  it("shows a failure as an ERROR, never as `no matching items`", async () => {
    const user = userEvent.setup();
    render(
      <RecordPicker
        loadOptions={async () => {
          throw new Error("network");
        }}
        count={900}
        placeholder="pick"
      />,
    );
    await user.click(screen.getByRole("button", { name: /pick/i }));
    // Telling a user "nothing matched" when the request failed teaches them their query was wrong.
    await waitFor(() =>
      expect(screen.getByText(/could not load|読み込めませんでした|không tải được/i)).toBeInTheDocument(),
    );
  });
});
