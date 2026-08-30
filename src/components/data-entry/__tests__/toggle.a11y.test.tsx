import { describe, expect, it } from "vitest";
import { Bold } from "lucide-react";

import { Toggle } from "../toggle";
import { ToggleGroup, ToggleGroupItem } from "../toggle-group";
import { expectNoA11yViolations } from "@/test/a11y";
import { renderWithUi, screen } from "@/test/render";

describe("Toggle a11y", () => {
  it("has no axe violations (icon toggle with aria-label)", async () => {
    await expectNoA11yViolations(
      <Toggle aria-label="太字" defaultPressed>
        <Bold className="size-4" aria-hidden="true" />
      </Toggle>,
    );
  });

  it("has no axe violations (text toggle, outline variant)", async () => {
    await expectNoA11yViolations(
      <Toggle variant="outline" size="lg">
        自動保存
      </Toggle>,
    );
  });

  it("has no axe violations (disabled / pressed states)", async () => {
    await expectNoA11yViolations(
      <>
        <Toggle aria-label="押下" pressed disabled>
          <Bold className="size-4" aria-hidden="true" />
        </Toggle>
        <Toggle aria-label="未押下" pressed={false} disabled>
          <Bold className="size-4" aria-hidden="true" />
        </Toggle>
      </>,
    );
  });

  // gh#312 — the counted, pressed chip.
  it("has no axe violations (counted filter chips, pressed and unpressed)", async () => {
    await expectNoA11yViolations(
      <>
        <Toggle count={42} countLabel="件" pressed>
          未読
        </Toggle>
        <Toggle count={118} countLabel="件">
          対応済み
        </Toggle>
        <Toggle count={0} showZero={false}>
          下書き
        </Toggle>
      </>,
    );
  });

  it("has no axe violations (counted emoji reaction chips in a ToggleGroup)", async () => {
    await expectNoA11yViolations(
      <ToggleGroup type="multiple" size="sm" aria-label="リアクション">
        <ToggleGroupItem value="up" aria-label="いいね" count={3} countLabel="件">
          👍
        </ToggleGroupItem>
        <ToggleGroupItem value="party" aria-label="おめでとう" count={1200} countLabel="件">
          🎉
        </ToggleGroupItem>
      </ToggleGroup>,
    );
  });

  it("has no axe violations (counted disabled-pressed chip)", async () => {
    await expectNoA11yViolations(
      <Toggle count={7} countLabel="件" pressed disabled>
        締め済み
      </Toggle>,
    );
  });

  it("announces label + count once, and carries pressed on aria-pressed only", () => {
    renderWithUi(
      <Toggle count={42} countLabel="件" pressed>
        未読
      </Toggle>,
    );
    const chip = screen.getByRole("button", { name: "未読, 42 件" });
    expect(chip).toHaveAttribute("aria-pressed", "true");
    // The visible digits are hidden from the a11y tree, so "42" cannot be announced twice…
    expect(chip.querySelector('[data-slot="toggle-count"]')).toHaveAttribute("aria-hidden", "true");
    // …and the pressed state is never appended to the NAME as text.
    expect(chip).not.toHaveAccessibleName(expect.stringContaining("押下"));
  });
});
