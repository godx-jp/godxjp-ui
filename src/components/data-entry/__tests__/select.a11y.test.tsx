import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select";
import { Label } from "../label";
import { expectNoA11yViolations } from "@/test/a11y";

const OPTIONS = [
  { value: "osaka", label: "大阪" },
  { value: "tokyo", label: "東京" },
  { value: "kyoto", label: "京都", disabled: true },
];

describe("Select a11y", () => {
  it("has no axe violations (compound API with label)", async () => {
    await expectNoA11yViolations(
      <div>
        <Label htmlFor="branch">支店</Label>
        <Select defaultValue="osaka">
          <SelectTrigger id="branch">
            <SelectValue placeholder="支店を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="osaka">大阪</SelectItem>
            <SelectItem value="tokyo">東京</SelectItem>
            <SelectItem value="kyoto" disabled>
              京都
            </SelectItem>
          </SelectContent>
        </Select>
      </div>,
    );
  });

  it("has no axe violations (data-driven options, no search)", async () => {
    await expectNoA11yViolations(
      <Select aria-label="支店" options={OPTIONS} defaultValue="tokyo" placeholder="支店を選択" />,
    );
  });

  it("has no axe violations (disabled)", async () => {
    await expectNoA11yViolations(
      <Select aria-label="支店" options={OPTIONS} defaultValue="osaka" disabled />,
    );
  });

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
    expect(await axe(screen.getByRole("listbox"))).toHaveNoViolations();
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
    expect(await axe(screen.getByRole("listbox"))).toHaveNoViolations();
  });
});
