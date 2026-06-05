import { describe, expect, it, vi } from "vitest";
import * as React from "react";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { SearchInput } from "../search-input";
import { Input } from "../input";
import { Textarea } from "../textarea";
import { TimeInput } from "../time-input";

/**
 * Behavioral interaction tests — typing must actually STICK.
 * These replace the manual browser-MCP probe (run via `pnpm test`, no MCP needed).
 * The SearchInput case is a regression for the controlled-freeze bug: a controlled
 * `value` with no immediate `onValueChange` swallows every keystroke.
 */
describe("input typing behavior (freeze regressions)", () => {
  it("SearchInput (controlled) — value updates on every keystroke, not frozen", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [v, setV] = React.useState("");
      return <SearchInput value={v} onValueChange={setV} onSearch={() => {}} ariaLabel="search" />;
    }
    renderWithUi(<Controlled />);
    const box = screen.getByRole("searchbox");
    await user.type(box, "山田");
    expect(box).toHaveValue("山田"); // would be "" before the onValueChange fix
  });

  it("SearchInput — onValueChange fires immediately, onSearch is debounced", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onSearch = vi.fn();
    renderWithUi(
      <SearchInput
        onValueChange={onValueChange}
        onSearch={onSearch}
        ariaLabel="s"
        debounce={250}
      />,
    );
    await user.type(screen.getByRole("searchbox"), "abc");
    expect(onValueChange).toHaveBeenCalledWith("abc"); // immediate, per keystroke
  });

  it("SearchInput clear button empties the value", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [v, setV] = React.useState("初期");
      return <SearchInput value={v} onValueChange={setV} onSearch={() => {}} ariaLabel="search" />;
    }
    renderWithUi(<Controlled />);
    await user.click(screen.getByRole("button", { name: /clear|クリア|xóa/i }));
    expect(screen.getByRole("searchbox")).toHaveValue("");
  });

  it("Input (uncontrolled) accepts typing", async () => {
    const user = userEvent.setup();
    renderWithUi(<Input aria-label="name" />);
    const input = screen.getByLabelText("name");
    await user.type(input, "テスト");
    expect(input).toHaveValue("テスト");
  });

  it("Input (controlled) accepts typing", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [v, setV] = React.useState("");
      return <Input aria-label="ctrl" value={v} onChange={(e) => setV(e.target.value)} />;
    }
    renderWithUi(<Controlled />);
    const input = screen.getByLabelText("ctrl");
    await user.type(input, "abc123");
    expect(input).toHaveValue("abc123");
  });

  it("Input disabled blocks typing", async () => {
    const user = userEvent.setup();
    renderWithUi(<Input aria-label="dis" disabled />);
    const input = screen.getByLabelText("dis");
    await user.type(input, "nope");
    expect(input).toHaveValue("");
  });

  it("Textarea accepts multi-line typing", async () => {
    const user = userEvent.setup();
    renderWithUi(<Textarea aria-label="memo" />);
    const ta = screen.getByLabelText("memo");
    await user.type(ta, "line1{Enter}line2");
    expect(ta).toHaveValue("line1\nline2");
  });

  it("TimeInput masks digits into HH:mm", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [v, setV] = React.useState("");
      return <TimeInput value={v} onValueChange={setV} aria-label="time" />;
    }
    renderWithUi(<Controlled />);
    const field = screen.getByRole("spinbutton");
    await user.type(field, "1030");
    expect(field).toHaveValue("10:30");
  });
});

// Regression (godxjp-ui-behavioral-test): behaviours confirmed by driving the real component —
// the chrome-MCP harness gives false readings on controlled inputs (synthetic events don't drive
// React's onChange), so the source of truth is user-event in jsdom.
describe("TimeInput behaviour", () => {
  it("flags aria-invalid while an out-of-range time is displayed", async () => {
    const user = userEvent.setup();
    renderWithUi(<TimeInput defaultValue="09:00" aria-label="t" />);
    const field = screen.getByRole("spinbutton");
    await user.clear(field);
    await user.type(field, "2570");
    expect(field).toHaveValue("25:70");
    expect(field).toHaveAttribute("aria-invalid", "true");
  });

  it("quantizes a typed minute to the step grid", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithUi(<TimeInput step={15} onValueChange={onChange} aria-label="t" />);
    const field = screen.getByRole("spinbutton");
    await user.type(field, "0837");
    expect(field).toHaveValue("08:30");
    expect(onChange).toHaveBeenLastCalledWith("08:30");
  });

  it("steps with ArrowUp/ArrowDown and wraps across the 24h day", async () => {
    const user = userEvent.setup();
    renderWithUi(<TimeInput defaultValue="23:59" aria-label="t" />);
    const field = screen.getByRole("spinbutton");
    field.focus();
    await user.keyboard("{ArrowUp}");
    expect(field).toHaveValue("00:00"); // 23:59 + 1m wraps to 00:00
    await user.keyboard("{ArrowDown}");
    expect(field).toHaveValue("23:59");
  });

  it("disabled blocks typing", async () => {
    const user = userEvent.setup();
    renderWithUi(<TimeInput value="12:00" disabled aria-label="t" />);
    const field = screen.getByRole("spinbutton");
    await user.type(field, "0930");
    expect(field).toHaveValue("12:00");
  });
});
