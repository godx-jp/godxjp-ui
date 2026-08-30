import { describe, expect, it } from "vitest";
import { render, within } from "@testing-library/react";

import { Separator } from "../separator";
import { AuthDivider } from "../auth-divider";
import { Text } from "../../general/typography";
import { expectNoA11yViolations } from "@/test/a11y";

/**
 * Separator a11y — gh#308.
 *
 * The defect the issue reports is not visual: a labelled rule that renders "new messages" but is
 * not announced leaves a screen-reader user with a blank rule where a sighted user sees a
 * milestone. So the contract under test is the ARIA one, and it has two halves that must BOTH
 * hold, because getting either wrong is a real bug:
 *
 *   1. the labelled rule is a REAL `role="separator"` whose computed accessible name IS the label;
 *   2. the string is announced EXACTLY ONCE — carried by `aria-label` while the visible node is
 *      `aria-hidden`. The naive fix (render the text and also name the separator) double-announces.
 *
 * An axe pass alone proves neither, so every case below asserts the computed name explicitly and
 * then runs axe at 0 violations.
 */
describe("Separator a11y (gh#308)", () => {
  it("names the labelled separator with the label, and announces it exactly once", () => {
    const { getByRole, container } = render(<Separator label="Tin nhắn mới" />);

    const separator = getByRole("separator", { name: "Tin nhắn mới" });
    expect(separator).toHaveAccessibleName("Tin nhắn mới");

    // Announced ONCE: the only node carrying the text is aria-hidden, so it contributes no
    // second utterance beside the accessible name.
    const visible = within(separator).getByText("Tin nhắn mới");
    expect(visible).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelectorAll('[aria-label="Tin nhắn mới"]')).toHaveLength(1);
  });

  it("keeps aria-orientation truthful — omitted when horizontal, explicit when vertical", () => {
    // ARIA's implicit orientation for `separator` is horizontal, so Radix emits the attribute
    // only for the vertical case; asserting the horizontal one is absent stops a future "fix"
    // from contradicting the role's own default.
    const horizontal = render(<Separator label="今日" />);
    expect(within(horizontal.container).getByRole("separator")).not.toHaveAttribute(
      "aria-orientation",
    );
    horizontal.unmount();

    const vertical = render(<Separator orientation="vertical" decorative={false} />);
    expect(within(vertical.container).getByRole("separator")).toHaveAttribute(
      "aria-orientation",
      "vertical",
    );
  });

  it("leaves an unlabelled rule out of the accessibility tree by default", () => {
    const { queryByRole, container } = render(<Separator />);
    expect(queryByRole("separator")).toBeNull();
    expect(container.querySelector('[data-slot="separator"]')).not.toHaveAttribute("aria-label");
  });

  it("never puts a name on a role=none rule (aria-prohibited-attr)", async () => {
    const { container } = render(<Separator label="or" decorative />);
    expect(container.querySelector('[data-slot="separator"]')).not.toHaveAttribute("aria-label");
    await expectNoA11yViolations(<Separator label="or" decorative />);
  });

  it("has no axe violations across the labelled matrix, both directions", async () => {
    for (const align of ["start", "center", "end"] as const) {
      for (const tone of ["default", "muted", "primary", "warning", "destructive"] as const) {
        await expectNoA11yViolations(
          <Separator label="新しいメッセージはここから" labelAlign={align} tone={tone} />,
        );
      }
    }
    await expectNoA11yViolations(
      <div dir="rtl">
        <Separator label="رسائل جديدة" labelAlign="start" tone="primary" />
      </div>,
    );
  });

  it("has no axe violations in a real stream composition", async () => {
    await expectNoA11yViolations(
      <div>
        <Text>おはようございます。</Text>
        <Separator label="2026年8月22日" labelAlign="start" />
        <Text>本日の障害報告を共有します。</Text>
        <Separator label="新しいメッセージ" tone="primary" />
        <Text>了解しました。</Text>
      </div>,
    );
  });

  it("keeps the AuthDivider preset's named separator contract after the fold", async () => {
    const { getByRole } = render(<AuthDivider label="または" />);
    expect(getByRole("separator", { name: "または" })).toHaveAccessibleName("または");
    await expectNoA11yViolations(<AuthDivider label="または" />);
  });
});
