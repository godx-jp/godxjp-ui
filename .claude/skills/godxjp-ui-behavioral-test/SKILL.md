---
name: godxjp-ui-behavioral-test
description: BẮT BUỘC khi kiểm chứng BẤT KỲ component UI tương tác nào của @godxjp/ui (input, select, combobox, cascader, calendar, date picker, switch, command...). Cấm suy diễn hành vi từ code. PHẢI mở browser MCP thật (chrome-devtools / playwright / browsermcp) để MÔ PHỎNG và TEST từng hành vi (focus, gõ phím dính giá trị, Enter/Escape/Arrow/Tab, nút clear, disabled, readOnly, điều hướng bàn phím), rồi CODIFY phát hiện thành test @testing-library/user-event (vitest + jsdom) trong src/components/<group>/__tests__/ để lần sau chạy `pnpm test` KHÔNG cần MCP. Bắt lỗi kinh điển: controlled input có `value` nhưng thiếu `onValueChange` đồng bộ → input ĐÓNG BĂNG. Đọc TRƯỚC khi nói "đã verify".
---

# godxjp-ui Behavioral Test

> 🛠️ **AUDIENCE: CORE** — verifying interactive components of **@godxjp/ui** and codifying the
> findings as repo tests. App-devs verify their own screens via `compose-a-screen/verify` in the MCP.
> CORE↔CONSUMER map: `.claude/skills/README.md`.

**Follow-map:** this is the **codify** stage of the core chain. Reach it after [[godxjp-ui-component]]
(contract) flags a stateful control and [[godxjp-ui-interaction-feel]] (which owns the *expected
behaviours*) tells you what to drive. This skill turns each browser-confirmed behaviour into a
permanent `@testing-library/user-event` test so `pnpm test` is the regression guard with **no MCP**.

**DO / DON'T:**

| ✅ DO | ⛔ DON'T |
|---|---|
| SIMULATE in a real browser MCP, observe what actually happens, THEN codify | Conclude "typing works / Enter submits" by reading the JSX |
| Run the freeze probe / multi-char type on every controlled input | Trust a single keystroke; assume value sticks |
| Reproduce a controlled-input `value`/`aria-*` bug in jsdom before reporting it | Report a browser-MCP-only reading as a bug (harness false-positive) |
| Wire an immediate `onValueChange` on any controlled `value` + debounced wrapper | Source a controlled `value` only from a debounced result → frozen input |
| End every confirmed behaviour as an assertion in `src/components/<group>/__tests__/` | Say "verified" with no codified test (a finding not codified didn't happen) |

## Principle — test real, never assume

A control "looks correct" in source and is still **broken at runtime**. The
only acceptable proof that an interaction works is having *driven it in a real
browser* and *captured the result in a test that re-runs without a browser*.

Two mandatory phases, in order:

1. **SIMULATE (browser MCP).** Open the component in a real browser via a browser
   MCP (`chrome-devtools__*`, `playwright__*`, or browsermcp). Click it, focus it,
   type into it, press keys, read the DOM back. Observe what *actually* happens.
   **Never** conclude "typing works / Enter submits / arrows navigate" by reading
   the JSX. The bug you are hunting (below) is invisible in source.
2. **CODIFY (user-event test).** Convert every behavior you confirmed in the
   browser into a `@testing-library/user-event` test under
   `src/components/<group>/__tests__/<name>.test.tsx`. After this, the browser is
   no longer needed — `pnpm test` is the permanent regression guard. A finding
   that is not codified did not happen.

> If you cannot reach a browser MCP this turn, say so explicitly and stop — do
> NOT substitute "I read the code and it should work."

## What to test — behavior checklist (every input / control)

For EACH interactive control, simulate and then codify:

- **Focus**: `Tab`/click focuses it; focus ring + focused state appear; `:focus`
  is on the right element.
- **Typing sticks**: type a string → the rendered value equals what you typed
  (NOT frozen, NOT lagging one char, NOT reverting). This is the #1 trap.
- **keydown / keyup**:
  - `Enter` → submits / confirms (or selects highlighted option).
  - `Escape` → closes popover / clears, as designed.
  - `ArrowUp` / `ArrowDown` → moves highlight through options.
  - `Tab` / `Shift+Tab` → moves focus out, in correct order.
- **Clear button**: appears when there is a value; click empties the value and
  returns focus appropriately.
- **disabled**: typing and clicking are blocked; value cannot change; not focusable.
- **readOnly**: value is shown but cannot be edited; still focusable/selectable.
- **Component-specific keyboard nav**:
  - **Select / Command / Combobox**: open (click or `Enter`/`Space`/`ArrowDown`)
    → `ArrowUp/Down` highlights → `Enter` selects → value updates → popover closes.
  - **Cascader / TreeSelect**: expand a level, arrow within level, `Enter` drills/selects.
  - **Calendar / DatePicker**: `ArrowLeft/Right/Up/Down` move by day/week,
    `PageUp/Down` by month, `Enter` selects the focused day.

Every behavior above must end as an assertion in a test file.

## The probe pattern (React-compatible value probe)

React owns the `value` of a controlled `<input>`. Setting `input.value = "x"`
directly is silently reverted by React on the next render and does **not** fire
React's `onChange`. To simulate a real keystroke you must use the **native value
setter** and dispatch a bubbling `input` event so React's synthetic system sees
it. Then read the value back **after a tick** — if it reverted to empty/old, the
input is **FROZEN**.

Run this inside the browser MCP's script-evaluation tool
(`chrome-devtools__evaluate_script` / `playwright__browser_evaluate`):

```js
// Returns { typed, after } — if after !== typed the control is FROZEN.
(async () => {
  const el = document.querySelector('[role="searchbox"], input'); // target the control
  el.focus();

  // Native setter bypasses React's value-tracking shim...
  const proto = Object.getPrototypeOf(el);
  const setNativeValue = Object.getOwnPropertyDescriptor(proto, "value").set;
  const typed = "hello";
  setNativeValue.call(el, typed);

  // ...then a bubbling 'input' event drives React's onChange.
  el.dispatchEvent(new Event("input", { bubbles: true }));

  // Let React flush its render.
  await new Promise((r) => setTimeout(r, 0));

  const after = el.value;
  return { typed, after, frozen: after !== typed }; // frozen:true => bug
})();
```

For keys, prefer the MCP's high-level helpers (`type_text`, `press_key`,
`fill`) which dispatch real key events — they exercise the *whole* path
(keydown → input → keyup) the way a user does, and surface the freeze bug
naturally because a frozen input ends up empty after a multi-char type.

### ⚠️ Harness FALSE POSITIVE on controlled inputs — confirm in jsdom before reporting

The MCP path is not 100% faithful for a **controlled** input. `fill` (and a raw
native-setter + `input` event) can land a string in the DOM **without React's
`onChange` running**, so the component's STATE — and everything derived from it
(`aria-invalid`, `aria-valuetext`, the masked/snapped value) — stays at the old
value while only the raw DOM `value` shows your text. Reading those attributes
then makes a perfectly-working field look broken.

Real example (this session): typing an out-of-range `25:70` into a controlled
`TimeInput` read back `aria-invalid=null` in chrome-devtools — looked like a
missing-validation bug. A deterministic `@testing-library/user-event` test typed
the same and got `value="25:70"` **and** `aria-invalid="true"` — the component
was fine; the harness reading was the artifact.

**Rule:** before you REPORT a bug about a controlled input's `value`/`aria-*`
that you observed only via browser MCP, reproduce it with a `user-event` test in
jsdom. If the jsdom test disagrees, trust jsdom — and the test you just wrote is
the codified proof either way. (This cuts both ways: it stops phantom bugs and
catches real ones.)

## The controlled-freeze bug class (canonical — found & fixed today)

**Symptom**: you type into a controlled input in the browser and nothing appears
(or only the last char flickers and vanishes). In a unit test, after
`userEvent.type(el, "hello")` the value is `""`.

**Cause**: the input is **controlled** (`value={value}`) but the only change
handler is a **debounced** `onSearch` / `onChange`. Because `value` is sourced
from the *debounced* result (or from a parent that only updates after the
debounce), the `value` prop never updates **synchronously** on the keystroke.
React re-renders with the old `value`, overwriting what you typed → the input is
swallowed every keystroke → frozen.

**Fix — the controlled-vocabulary `onValueChange`**: a controlled input MUST
expose an immediate, per-keystroke `onValueChange` that updates the controlled
`value` *synchronously*, separately from any debounced side-effect.

Real example, fixed today — `src/components/data-entry/search-input.tsx`:

```tsx
// onValueChange fires on EVERY keystroke (immediate) → keeps controlled value live.
// onSearch stays debounced for the expensive side-effect.
const setValue = (v: string) => {
  if (!isControlled) setInternal(v);
  onValueChange?.(v);          // <-- synchronous, every keystroke
};
// <Input value={value} onChange={(e) => setValue(e.target.value)} ... />
// useEffect(() => onSearchRef.current(debounced), [debounced]);  // debounced only
```

**Rule**: any controlled input wrapper that owns a `value` prop and a debounced
callback MUST also accept/wire an immediate `onValueChange`. Always add a
**freeze-regression test** (below) for it.

## MCP-finding → user-event test conversion

Tests run on **vitest + jsdom** with `@testing-library/react` +
`@testing-library/user-event` (the repo has **no Playwright**). Use the repo
helper `@/test/render` which re-exports `renderWithUi`, `screen`, `userEvent`,
`waitFor`. File location: `src/components/<group>/__tests__/<name>.test.tsx`.

### Typing sticks + freeze regression (controlled)

```tsx
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import * as React from "react";
import { SearchInput } from "../search-input";

describe("SearchInput — value is responsive", () => {
  // Codifies the browser finding: typing must STICK on a controlled input.
  it("controlled value updates on every keystroke (freeze regression)", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [v, setV] = React.useState("");
      // onValueChange is the synchronous, per-keystroke handler.
      return <SearchInput value={v} onValueChange={setV} onSearch={() => {}} label="Search" />;
    }
    renderWithUi(<Controlled />);
    const box = screen.getByRole("searchbox");

    await user.type(box, "hello");
    // If the input were frozen, this would be "" or "o".
    expect(box).toHaveValue("hello");
  });

  it("uncontrolled typing sticks", async () => {
    const user = userEvent.setup();
    renderWithUi(<SearchInput onSearch={() => {}} label="Search" />);
    const box = screen.getByRole("searchbox");
    await user.type(box, "abc");
    expect(box).toHaveValue("abc");
  });
});
```

### Clear button

```tsx
it("clear button empties the value", async () => {
  const user = userEvent.setup();
  renderWithUi(<SearchInput onSearch={() => {}} defaultValue="x" label="Search" />);
  await user.click(screen.getByRole("button", { name: /xóa|clear/i }));
  expect(screen.getByRole("searchbox")).toHaveValue("");
});
```

### Keyboard: Enter / Escape / Arrows / Tab

```tsx
it("Enter submits, Escape clears", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  renderWithUi(<MyField onSubmit={onSubmit} />);
  const box = screen.getByRole("textbox");

  await user.type(box, "query{Enter}");      // keyboard syntax inside type
  expect(onSubmit).toHaveBeenCalledWith("query");

  await user.keyboard("{Escape}");
  expect(box).toHaveValue("");
});

it("Tab moves focus in order", async () => {
  const user = userEvent.setup();
  renderWithUi(<Form />);
  await user.tab();
  expect(screen.getByRole("textbox", { name: /first/i })).toHaveFocus();
  await user.tab();
  expect(screen.getByRole("textbox", { name: /last/i })).toHaveFocus();
});
```

### Select / Combobox / Command — open, arrow, enter to select

```tsx
it("opens, arrows to an option, Enter selects it", async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  renderWithUi(<MySelect options={OPTS} onValueChange={onValueChange} />);

  await user.click(screen.getByRole("combobox"));        // or {ArrowDown} to open
  await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");  // highlight + select
  expect(onValueChange).toHaveBeenCalledWith(OPTS[1].value);
  // popover closed:
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
});
```

### disabled / readOnly

```tsx
it("disabled blocks input", async () => {
  const user = userEvent.setup();
  renderWithUi(<SearchInput onSearch={() => {}} disabled label="Search" />);
  const box = screen.getByRole("searchbox");
  await user.type(box, "nope");
  expect(box).toHaveValue("");
  expect(box).toBeDisabled();
});

it("readOnly shows value but rejects edits", async () => {
  const user = userEvent.setup();
  renderWithUi(<MyInput value="locked" readOnly onChange={() => {}} />);
  const box = screen.getByRole("textbox");
  await user.type(box, "x");
  expect(box).toHaveValue("locked");
});
```

### Calendar / DatePicker — arrow nav

```tsx
it("arrow keys move the focused day and Enter selects", async () => {
  const user = userEvent.setup();
  const onSelect = vi.fn();
  renderWithUi(<Calendar onSelect={onSelect} defaultMonth={new Date(2026, 5, 1)} />);
  await user.click(screen.getByRole("gridcell", { name: "1" }));
  await user.keyboard("{ArrowRight}{ArrowDown}{Enter}"); // +1 day, +1 week
  expect(onSelect).toHaveBeenCalled(); // assert the resolved date
});
```

> Notes for jsdom: layout/visual focus-ring CSS can't be asserted — assert
> `toHaveFocus()` + `data-state`/`aria-*` instead. For debounced callbacks use
> `vi.useFakeTimers({ shouldAdvanceTime: true })` + `userEvent.setup({
> advanceTimers: vi.advanceTimersByTime })` (see existing `search-input.test.tsx`).

## Pre-done checklist (do not claim "verified" until all true)

- [ ] Opened the component in a **real browser MCP** and drove the interactions.
- [ ] Ran the **freeze probe** (or multi-char type) on every controlled input —
      value sticks, not frozen.
- [ ] Exercised focus, typing, Enter, Escape, Arrows, Tab, clear, disabled,
      readOnly, and the component-specific keyboard nav that applies.
- [ ] Every confirmed behavior is **codified** as a `user-event` test in
      `src/components/<group>/__tests__/`, including a **freeze-regression test**
      for any controlled input.
- [ ] `pnpm test` passes (the suite now guards this with **no MCP** needed).
- [ ] Any controlled `value` + debounced callback wrapper exposes an immediate
      `onValueChange` (controlled-freeze fix).
