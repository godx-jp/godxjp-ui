import { describe, expect, it } from "vitest";

import { FormField } from "../form-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select";
import { expectNoA11yViolations } from "@/test/a11y";
import { renderWithUi, screen } from "@/test/render";

// FormField hands its label/helper/error wiring to a SINGLE child via cloneElement. With the
// compound API that child is Radix's Select root, which renders no DOM and drops them — the
// trigger used to end up with no accessible name at all. `role="combobox"` takes no name from
// content, so the visible value is NOT a fallback: the control was simply anonymous (WCAG 4.1.2).
describe("Select — the FormField contract reaches the compound trigger", () => {
  it("names the compound trigger from the FormField label", () => {
    renderWithUi(
      <FormField id="region" label="担当拠点">
        <Select defaultValue="tokyo">
          <SelectTrigger id="region">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tokyo">東京</SelectItem>
          </SelectContent>
        </Select>
      </FormField>,
    );

    expect(screen.getByRole("combobox", { name: "担当拠点" })).toBeInTheDocument();
  });

  it("names the trigger even when only the Select carries an id", () => {
    // The consumer never repeats the id on the trigger — the contract still has to land there.
    renderWithUi(
      <FormField id="office" label="オフィス">
        <Select defaultValue="hcm">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hcm">Thành phố Hồ Chí Minh</SelectItem>
          </SelectContent>
        </Select>
      </FormField>,
    );

    const trigger = screen.getByRole("combobox", { name: "オフィス" });
    // Label click-to-focus resolves the control by id, so the trigger must adopt the field id.
    expect(trigger).toHaveAttribute("id", "office");
  });

  it("carries helper, error and required onto the trigger", () => {
    renderWithUi(
      <FormField
        id="branch"
        label="支店"
        required
        helper="名称で検索できます"
        error="支店を確認してください"
      >
        <Select defaultValue="tokyo">
          <SelectTrigger id="branch">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tokyo">東京</SelectItem>
          </SelectContent>
        </Select>
      </FormField>,
    );

    const trigger = screen.getByRole("combobox", { name: "支店" });
    expect(trigger).toHaveAttribute("aria-describedby", "branch-helper");
    expect(trigger).toHaveAttribute("aria-errormessage", "branch-error");
    expect(trigger).toHaveAttribute("aria-required", "true");
    expect(trigger).toHaveAttribute("aria-invalid", "true");
  });

  it("lets an explicit name on the trigger win over the field label", () => {
    renderWithUi(
      <FormField id="explicit" label="ラベル">
        <Select defaultValue="tokyo">
          <SelectTrigger id="explicit" aria-label="トリガー独自の名前">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tokyo">東京</SelectItem>
          </SelectContent>
        </Select>
      </FormField>,
    );

    expect(screen.getByRole("combobox", { name: "トリガー独自の名前" })).toBeInTheDocument();
  });

  it("names a compound trigger from aria-label on Select, with no FormField at all", () => {
    renderWithUi(
      <Select defaultValue="tokyo" aria-label="拠点">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="tokyo">東京</SelectItem>
        </SelectContent>
      </Select>,
    );

    expect(screen.getByRole("combobox", { name: "拠点" })).toBeInTheDocument();
  });

  it("still names the data-driven trigger (the path that already worked)", () => {
    renderWithUi(
      <FormField id="data-region" label="データ駆動">
        <Select
          id="data-region"
          defaultValue="tokyo"
          options={[{ value: "tokyo", label: "東京" }]}
        />
      </FormField>,
    );

    expect(screen.getByRole("combobox", { name: "データ駆動" })).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    await expectNoA11yViolations(
      <FormField id="axe-region" label="担当拠点" helper="名称で検索できます">
        <Select defaultValue="tokyo">
          <SelectTrigger id="axe-region">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tokyo">東京</SelectItem>
          </SelectContent>
        </Select>
      </FormField>,
    );
  });
});
