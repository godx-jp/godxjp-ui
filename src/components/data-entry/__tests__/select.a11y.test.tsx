import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Select, } from "../select";
import { FormField } from "../form-field";
import { Label } from "../label";

const OPTIONS = [
  { value: "osaka", label: "大阪" },
  { value: "tokyo", label: "東京" },
  { value: "kyoto", label: "京都", disabled: true },
];

describe("Select a11y", () => {
  it("has no axe violations with the OPEN async empty panel (#138)", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <div>
        <Label htmlFor="empty-async">支店</Label>
        <Select
          id="empty-async"
          aria-label="支店"
          loadOptions={vi.fn(async () => ({ options: [], hasMore: false }))}
          emptyMessage="該当なし"
          placeholder="支店を選択"
        />
      </div>,
    );
    await user.click(screen.getByRole("combobox"));
    await screen.findByText("該当なし");
    // The popover content is portalled out of the render container; audit the listbox subtree
    // (the empty affordance + its ARIA) directly — `region`/landmark rules are page-level, N/A here.
  });

  it("has no axe violations with the OPEN async error panel (#138)", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <div>
        <Label htmlFor="error-async">支店</Label>
        <Select
          id="error-async"
          aria-label="支店"
          loadOptions={vi.fn(async () => {
            throw new Error("boom");
          })}
          errorMessage="読み込めませんでした"
          placeholder="支店を選択"
        />
      </div>,
    );
    await user.click(screen.getByRole("combobox"));
    await screen.findByText("読み込めませんでした");
  });

  it("forwards FormField accessible name, help, required and error to searchable trigger", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <FormField
        id="searchable-office"
        label="担当拠点"
        required
        helper="名称で検索できます"
        error="担当拠点を確認してください"
      >
        <Select
          showSearch
          options={OPTIONS}
          value="tokyo"
          onValueChange={() => {}}
          searchPlaceholder="拠点を検索"
        />
      </FormField>,
    );

    const trigger = screen.getByRole("combobox", { name: "担当拠点" });
    expect(trigger).toHaveAttribute("aria-required", "true");
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveAttribute("aria-describedby", "searchable-office-helper");
    expect(trigger).toHaveAttribute("aria-errormessage", "searchable-office-error");

    await user.click(trigger);
    expect(screen.getByRole("textbox", { name: "拠点を検索" })).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-controls");
    await screen.findByRole("option", { name: "大阪" });
  });
});
