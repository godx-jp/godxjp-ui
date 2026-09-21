import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

import { AppSettingPicker } from "../app-setting-picker";
import { cleanup, renderWithUi, screen, userEvent } from "@/test/render";
import { ruleSelector } from "@/test/css-selector";

const navigationCss = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../../../styles/navigation-layout.css"),
  "utf8",
);

/**
 * The shipped rule that gives a locale picker its OWNED per-kind width — selector extracted from
 * the stylesheet, never retyped. "Hugs its value" means precisely that this rule stops selecting
 * the trigger, which is a thing `.matches()` can settle and a class name cannot.
 *
 * The rule resolves `--app-setting-picker-trigger-width`; it does NOT declare `inline-size`. It
 * used to, and the declaration was inert — see the gh#819 block at the bottom of this file.
 */
const perKindWidthSelector = ruleSelector(
  navigationCss,
  /\.ui-app-setting-picker-trigger\[data-kind="locale"\] \{\s*\n\s*--app-setting-picker-trigger-width:/,
);

describe("AppSettingPicker", () => {
  it("renders the inline appearance without field-like trigger chrome", () => {
    renderWithUi(
      <AppSettingPicker kind="locale" appearance="inline" value="en" onValueChange={() => {}} />,
    );
    // The chrome-less box lives in `.ui-app-setting-picker-inline`'s own rule now, so the
    // component no longer repeats border-0/bg-transparent/shadow-none as utilities.
    expect(screen.getByRole("combobox")).toHaveClass("ui-app-setting-picker-inline");
  });

  it.each([
    ["timezone", "Asia/Tokyo"],
    ["dateFormat", "iso"],
    ["timeFormat", "24h"],
  ] as const)("renders the %s kind as a labelled Select trigger", (kind, value) => {
    renderWithUi(<AppSettingPicker kind={kind} value={value} onValueChange={vi.fn()} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-label");
  });

  it('kind="locale" defaults to the compact icon-only trigger (product contract, gh#175)', () => {
    // No `appearance` prop: locale's canonical form is the icon-only language switcher, so it
    // must default to icon (no visible value text) while still exposing its localized aria-label —
    // NOT the labeled full-width Select the other kinds default to.
    renderWithUi(<AppSettingPicker kind="locale" value="ja" onValueChange={vi.fn()} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAccessibleName();
    expect(trigger).toHaveTextContent("");
  });

  it('kind="locale" honours an explicit appearance="labeled" override (settings-form row)', () => {
    renderWithUi(
      <AppSettingPicker kind="locale" appearance="labeled" value="ja" onValueChange={vi.fn()} />,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAccessibleName();
    expect(trigger.textContent ?? "").not.toBe("");
  });

  it("controlled: picking an option fires onValueChange (locale)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<AppSettingPicker kind="locale" value="ja" onValueChange={onValueChange} />);
    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: /English|英語|Tiếng Anh/ }));
    expect(onValueChange).toHaveBeenCalledWith("en");
  });

  it("is disabled when unbound (no AppProvider + no value)", () => {
    // plain render → useOptionalAppContext() is undefined → unbound → disabled
    const { getByRole } = render(<AppSettingPicker kind="locale" />);
    expect(getByRole("combobox")).toBeDisabled();
  });

  it("respects an explicit disabled prop", () => {
    renderWithUi(
      <AppSettingPicker kind="timezone" value="Asia/Tokyo" onValueChange={vi.fn()} disabled />,
    );
    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it.each([
    ["theme", "light"],
    ["density", "default"],
    ["fontSize", "md"],
  ] as const)("builds the option list for the %s theme axis", (kind, value) => {
    renderWithUi(<AppSettingPicker kind={kind} value={value} onValueChange={vi.fn()} />);
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-label");
  });

  it("brand: includes the opt-out option and maps it back to null on select", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    // value="moss" (a concrete brand) so the trigger is bound/enabled.
    renderWithUi(<AppSettingPicker kind="brand" value="moss" onValueChange={onValueChange} />);
    await user.click(screen.getByRole("combobox"));
    // the first option is the brand opt-out (none)
    const none = await screen.findByRole("option", { name: /none|không|なし|mặc định|default/i });
    await user.click(none);
    // onValueChange receives the raw wire value (__app__); the ctx-bound setter is what
    // maps __app__ → null, but here we passed onValueChange directly.
    expect(onValueChange).toHaveBeenCalledWith("__app__");
  });

  it("brand: a null/undefined current resolves to the opt-out option, not undefined", () => {
    // No value, but provide onValueChange so it stays bound (current === BRAND_NONE).
    renderWithUi(<AppSettingPicker kind="brand" onValueChange={vi.fn()} />);
    // bound because brand maps null → BRAND_NONE (a defined current), so not disabled.
    expect(screen.getByRole("combobox")).not.toBeDisabled();
  });

  it("context-bound: reads from AppProvider and writes via its setter (locale)", async () => {
    const user = userEvent.setup();
    // No value / no onValueChange → it binds to the AppProvider ctx (vi default locale).
    renderWithUi(<AppSettingPicker kind="locale" />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).not.toBeDisabled();
    await user.click(trigger);
    await user.click(await screen.findByRole("option", { name: /English|英語|Tiếng Anh/ }));
    // the ctx setter ran without throwing; the trigger reflects the new selection
    expect(trigger).toBeInTheDocument();
  });

  it("context-bound brand: selecting a concrete brand routes through the ctx setter wrapper", async () => {
    const user = userEvent.setup();
    renderWithUi(<AppSettingPicker kind="brand" />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).not.toBeDisabled(); // brand null → BRAND_NONE → bound via ctx.setBrand
    await user.click(trigger);
    const options = await screen.findAllByRole("option");
    // pick a concrete (non-opt-out) brand → wrapper maps value !== __app__ to that brand
    await user.click(options[1]);
    expect(trigger).toBeInTheDocument();
  });

  it('appearance="icon": keeps its localized accessible name but drops the visible value text', () => {
    renderWithUi(
      <AppSettingPicker kind="locale" appearance="icon" value="ja" onValueChange={vi.fn()} />,
    );
    const trigger = screen.getByRole("combobox");
    // The icon-only trigger MUST still expose an accessible name (its aria-label is the only one).
    expect(trigger).toHaveAccessibleName();
    // No SelectValue is rendered, so the closed trigger carries no textual value (icon only).
    expect(trigger).toHaveTextContent("");
  });

  it('appearance="icon": has no resting border/bg, matching the ghost icon buttons beside it in a topbar', () => {
    renderWithUi(
      <AppSettingPicker kind="locale" appearance="icon" value="ja" onValueChange={vi.fn()} />,
    );
    expect(screen.getByRole("combobox")).toHaveClass("ui-app-setting-picker-icon");
  });

  it('appearance="icon": still opens and fires onValueChange with localized options', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <AppSettingPicker kind="locale" appearance="icon" value="ja" onValueChange={onValueChange} />,
    );
    await user.click(screen.getByRole("combobox"));
    // Menu options retain their localized language names even though the trigger is icon-only.
    await user.click(await screen.findByRole("option", { name: /English|英語|Tiếng Anh/ }));
    expect(onValueChange).toHaveBeenCalledWith("en");
  });

  it('appearance="labeled" (default) renders the value text', () => {
    renderWithUi(<AppSettingPicker kind="timeFormat" value="24h" onValueChange={vi.fn()} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAccessibleName();
    expect(trigger.textContent ?? "").not.toBe("");
  });

  it('compact + appearance="labeled": keeps icon + value, drops the owned per-kind width (gh#217)', () => {
    // The canonical auth-footer locale switch: readable value text (not the square icon-only
    // default), a small tokenized box, and a trigger that HUGS its value instead of stretching to
    // the picker's `sm:w-40`.
    renderWithUi(
      <AppSettingPicker
        kind="locale"
        appearance="labeled"
        compact
        value="ja"
        onValueChange={vi.fn()}
      />,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveClass("ui-app-setting-picker-compact");
    // The owned width is GONE: the shipped per-kind rule no longer selects this trigger, so it
    // hugs its value instead of stretching.
    expect(trigger.matches(perKindWidthSelector)).toBe(false);
    // Accessible name (localized aria-label) and the visible value are both preserved.
    expect(trigger).toHaveAccessibleName();
    expect(trigger.textContent ?? "").not.toBe("");

    // Positive control — without `compact` the SAME rule does select the trigger, so the `false`
    // above is the compact opt-out and not a selector that matches nothing anywhere.
    cleanup();
    renderWithUi(
      <AppSettingPicker kind="locale" appearance="labeled" value="ja" onValueChange={vi.fn()} />,
    );
    expect(screen.getByRole("combobox").matches(perKindWidthSelector)).toBe(true);
  });

  it("compact: still opens and fires onValueChange with localized options", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <AppSettingPicker
        kind="locale"
        appearance="labeled"
        compact
        value="ja"
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: /English|英語|Tiếng Anh/ }));
    expect(onValueChange).toHaveBeenCalledWith("en");
  });

  it("compact is a no-op on the already chrome-less inline appearance", () => {
    renderWithUi(
      <AppSettingPicker
        kind="locale"
        appearance="inline"
        compact
        value="en"
        onValueChange={vi.fn()}
      />,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveClass("ui-app-setting-picker-inline");
    expect(trigger).not.toHaveClass("ui-app-setting-picker-compact");
  });

  it("compact defaults to off, so existing labelled pickers keep their per-kind width", () => {
    renderWithUi(<AppSettingPicker kind="dateFormat" value="iso" onValueChange={vi.fn()} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).not.toHaveClass("ui-app-setting-picker-compact");
    // Per-kind width moved from a `sm:w-*` lookup table to a token selected by `data-kind`,
    // so a service can widen just the picker whose locale overflows.
    expect(trigger).toHaveClass("ui-app-setting-picker-trigger");
    expect(trigger).toHaveAttribute("data-kind", "dateFormat");
  });

  it("renders an id and name through to the Select", () => {
    renderWithUi(
      <AppSettingPicker
        kind="locale"
        value="ja"
        onValueChange={vi.fn()}
        id="locale-picker"
        name="locale"
      />,
    );
    expect(screen.getByRole("combobox")).toHaveAttribute("id", "locale-picker");
  });
});

describe('appearance="bar": một CELL của thanh bar, không phải control thả vào bar', () => {
  /*
   * Lỗi được báo bằng ảnh: mọi trigger trong topbar cao 32px và bo 6px trong một thanh cao 48px,
   * nên hover vẽ ra một viên thuốc lơ lửng giữa dải — trong khi `TopbarItem`, thứ thư viện đã có,
   * vẽ nền phủ hết chiều cao. Số đo trên https://ql.test/gino/dashboard trước khi sửa: bar 48px;
   * toggle 28px @ top 10; theme picker 32px @ top 8; avatar 32px @ top 8.
   *
   * Lời hứa của `bar` là HÌNH HỌC — một cell cao bằng bar — và jsdom không tính bố cục nên không
   * phép kiểm nào ở đây với tới được nó. Vì vậy chúng canh HỢP ĐỒNG (`data-appearance`) chứ không
   * canh utility đang vẽ ra nó hôm nay; hình học thật được đo trên trình duyệt.
   */
  it("nói ra hình dạng nó đã giải, vì mặc định phụ thuộc kind nên prop không đủ để biết", () => {
    renderWithUi(
      <AppSettingPicker kind="theme" appearance="bar" value="light" onValueChange={vi.fn()} />,
    );
    expect(screen.getByRole("combobox")).toHaveAttribute("data-appearance", "bar");
  });

  it("mặc định phụ thuộc kind KHÔNG bị nhánh mới cướp mất", () => {
    // `bar` phải là thứ chỉ có khi được gọi tên. Một mặc định trôi sang `bar` sẽ làm mọi picker
    // trong một form thiết lập cao bằng... không có bar nào, tức là cao bằng dòng chứa nó.
    const { rerender } = renderWithUi(
      <AppSettingPicker kind="theme" value="light" onValueChange={vi.fn()} />,
    );
    expect(screen.getByRole("combobox")).toHaveAttribute("data-appearance", "labeled");

    rerender(<AppSettingPicker kind="locale" value="ja" onValueChange={vi.fn()} />);
    expect(screen.getByRole("combobox")).toHaveAttribute("data-appearance", "icon");
  });

  it('giữ nguyên mọi thứ "icon" đã bỏ: không chữ giá trị, vẫn có tên đọc được', () => {
    // `bar` đi chung nhánh với `icon`; nếu nó rơi nhầm sang nhánh có nhãn thì chữ giá trị hiện ra
    // và cái hộp lại có bề ngang riêng của nó.
    renderWithUi(
      <AppSettingPicker kind="theme" appearance="bar" value="dark" onValueChange={vi.fn()} />,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAccessibleName();
    expect(trigger).not.toHaveTextContent(/Dark|Tối|ダーク/);
  });
});

describe('appearance="icon" giữ được ô vuông (gh#366)', () => {
  it("mang utility bề ngang, vì luật class không thắng nổi w-full của SelectTrigger", () => {
    const { container } = renderWithUi(
      <AppSettingPicker kind="theme" appearance="icon" value="light" onValueChange={vi.fn()} />,
    );
    const trigger = container.querySelector<HTMLElement>(".ui-app-setting-picker-icon")!;
    // w-full nằm ở layer utilities, sau components, nên `inline-size` trong .ui-app-setting-picker-icon
    // luôn thua. Chỉ một utility mới trung hoà được nó, và giá trị phải đọc token.
    expect(trigger.className).toContain("w-[length:var(--control-height)]");
    expect(trigger.className).toContain("ui-app-setting-picker-icon");
  });

  it("mang cả shrink-0: `w-*` chỉ khai bề ngang MONG MUỐN, flex vẫn ép nhỏ hơn", () => {
    // Đo thật trong Chromium ở frame `navigation-app-setting-picker`: `.ui-topbar-end` rộng 82px,
    // gap 8px, hai trigger đều `flex-shrink: 1` → ô vuông ra 21,28 × 32px. `inline-size` vẫn giải
    // đúng --control-height (không phải gh#366 quay lại); cái hỏng là co giãn. Nhánh CÓ NHÃN cố ý
    // KHÔNG có shrink-0 — nó rộng theo nội dung và mang `max-w-full` để được phép thu lại.
    const { container } = renderWithUi(
      <AppSettingPicker kind="theme" appearance="icon" value="light" onValueChange={vi.fn()} />,
    );
    const trigger = container.querySelector<HTMLElement>(".ui-app-setting-picker-icon")!;
    expect(trigger.className).toContain("shrink-0");
  });

  it("nhánh có nhãn KHÔNG khoá co giãn, vì bề ngang của nó do nội dung quyết", () => {
    const { container } = renderWithUi(
      <AppSettingPicker kind="theme" appearance="labeled" value="light" onValueChange={vi.fn()} />,
    );
    const trigger = container.querySelector<HTMLElement>(".ui-control-trigger")!;
    expect(trigger.className).not.toContain("shrink-0");
  });

  it("forwards className to the trigger, next to its own classes", () => {
    // The only proof this prop had was an a11y test, deleted with axe. The claim is in
    // component-case-evidence.json, so it needs a live test or the claim is a lie.
    const { container } = renderWithUi(
      <AppSettingPicker
        kind="theme"
        appearance="bar"
        className="consumer-class"
        value="light"
        onValueChange={vi.fn()}
      />,
    );
    const owner = container.querySelector<HTMLElement>(".consumer-class")!;

    expect(owner).not.toBeNull();
    expect(owner.className).toContain("consumer-class");
  });

  it("bề ngang đọc token, và đọc ở NƠI THẮNG — utility, không phải luật class", () => {
    // Bản trước của phép kiểm này canh `.ui-app-setting-picker-icon { … var(--control-height) }`
    // trong CSS, tức canh đúng cái khai báo đã thua từ gh#366 — nó xanh trong khi ô vuông do
    // utility vẽ. Hợp đồng thật: luật class KHÔNG khai bề ngang, utility đọc token thì có.
    const css = readFileSync(resolve(process.cwd(), "src/styles/navigation-layout.css"), "utf8");
    const rule = css.match(/\.ui-app-setting-picker-icon\s*\{[^}]*\}/)?.[0] ?? "";
    expect(rule).not.toMatch(/(?:^|[;{\s])(?:inline-size|width)\s*:/);

    const { container } = renderWithUi(
      <AppSettingPicker kind="theme" appearance="icon" value="light" onValueChange={vi.fn()} />,
    );
    expect(
      container.querySelector<HTMLElement>(".ui-app-setting-picker-icon")!.className,
    ).toContain("w-[length:var(--control-height)]");
  });
});

/*
 * gh#819 — mỗi token bề ngang theo `kind` đều VÔ TÁC DỤNG.
 *
 * Nhánh CÓ NHÃN phát `w-auto`, còn bề ngang khai ở `.ui-app-setting-picker-trigger[data-kind]`
 * trong @layer components. Utility nằm sau components trong thứ tự layer nên utility thắng: đo
 * trên /isolate/navigation-app-setting-picker ở 1440px TRƯỚC khi sửa, trigger `density` ra 177px
 * với token 10rem (160px), `theme` ra 177px với token 9rem (144px) — tức là bề ngang của cột chứa
 * nó, không phải của token. SAU khi sửa: 160px và 144px, và khi đổi
 * --app-setting-picker-density-width sang 6rem thì hộp đi theo, 160px → 96px.
 *
 * jsdom không tính bố cục, nên ở đây canh HAI đầu của sợi dây mà con số đó đi qua — utility đọc
 * biến nào, và luật nào phân giải biến đó — chứ không canh pixel.
 */
describe("gh#819: token bề ngang phải THẮNG, không chỉ resolve", () => {
  it("trigger có nhãn phát bề ngang bằng utility đọc token, không phải `w-auto`", () => {
    const { container } = renderWithUi(
      <AppSettingPicker
        kind="density"
        appearance="labeled"
        value="comfortable"
        onValueChange={vi.fn()}
      />,
    );
    const trigger = container.querySelector<HTMLElement>(".ui-app-setting-picker-trigger")!;
    // Đúng MỘT utility trên trục ngang, và nó đọc token. `w-auto` — chính cái đã giết token —
    // phải biến mất, không được quay lại; `toEqual` nói cả hai điều trong một câu.
    const widthUtilities = trigger.className.split(/\s+/).filter((cls) => /^w-/.test(cls));
    expect(widthUtilities).toEqual(["w-[length:var(--app-setting-picker-trigger-width)]"]);
  });

  it("luật theo data-kind phân giải biến đó, và KHÔNG còn khai inline-size", () => {
    // Một luật ở @layer components không thể sở hữu `inline-size` trên phần tử này — nó thua.
    // Nhưng nó vẫn sở hữu được VIỆC CHỌN token, vì không utility nào khai custom property.
    const perKind =
      navigationCss.match(
        /\.ui-app-setting-picker-trigger\[data-kind="density"\]\s*\{[^}]*\}/,
      )?.[0] ?? "";
    expect(perKind).toContain(
      "--app-setting-picker-trigger-width: var(--app-setting-picker-density-width)",
    );
    expect(perKind).not.toMatch(/(?:^|[;{\s])(?:inline-size|width)\s*:/);
  });

  it("mỗi kind nối vào đúng token của nó — tám sợi dây, không sợi nào đứt", () => {
    const wiring: [string, string][] = [
      ["locale", "locale"],
      ["timezone", "timezone"],
      ["dateFormat", "date-format"],
      ["timeFormat", "time-format"],
      ["theme", "theme"],
      ["brand", "brand"],
      ["density", "density"],
      ["fontSize", "font-size"],
    ];
    for (const [kind, token] of wiring) {
      const rule =
        navigationCss.match(
          new RegExp(`\\.ui-app-setting-picker-trigger\\[data-kind="${kind}"\\]\\s*\\{[^}]*\\}`),
        )?.[0] ?? "";
      expect(rule, `no rule for data-kind="${kind}"`).not.toBe("");
      expect(rule).toContain(
        `--app-setting-picker-trigger-width: var(--app-setting-picker-${token}-width)`,
      );
    }
  });

  it("consumer truyền `w-full` vẫn thắng — tailwind-merge, nên chỉ được MỘT `w-*` không biến thể", () => {
    // Đây là lý do không dùng `sm:w-[…]` theo từng kind: biến thể `sm:` sống sót qua tailwind-merge
    // nên `className="w-full"` của một form field sẽ bị lờ đi từ 40rem trở lên.
    const { container } = renderWithUi(
      <AppSettingPicker
        kind="density"
        appearance="labeled"
        className="w-full"
        value="comfortable"
        onValueChange={vi.fn()}
      />,
    );
    const trigger = container.querySelector<HTMLElement>(".ui-app-setting-picker-trigger")!;
    const classes = trigger.className.split(/\s+/);
    expect(classes).toContain("w-full");
    expect(classes.filter((c) => /^(?:[\w@[\]-]+:)*w-/.test(c) && !c.startsWith("max-w-"))).toEqual(
      ["w-full"],
    );
  });
});
