import * as React from "react";
import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";

import { renderWithUi } from "@/test/render";
import { Button } from "../button";

/**
 * `Button.countLabel` (gh#734) — the counted button's ACCESSIBLE NAME.
 *
 * `Toggle` has carried `countLabel` since gh#312; `Button`, which owns the counter-pill vocabulary
 * in the first place, did not. So the digits were plain content that concatenated straight onto the
 * label: the reported measurement was `"Git3"`, not "Git, 3 pages".
 *
 * MEASURED in Chromium (dev preview :6194, /isolate/general-button-index) at 1440, from the
 * accessibility tree:
 *
 *   markup                                                      accessible name
 *   <Button count={18} countLabel="件">保留中</Button>             "保留中 , 18 件"
 *   <Button count={128} overflowCount={99} countLabel="件">…     "受信トレイ , 99+ 件"
 *   <Button count={0} showZero countLabel="件">完了</Button>       "完了 , 0 件"
 *   <Button count={0} showZero={false}>非表示のゼロ</Button>        "非表示のゼロ"   (no pill, no clause)
 *   <Button size="icon-sm" aria-label="通知" count={3}
 *           countLabel="件の未読"><Bell/></Button>                 "通知, 3 件の未読"
 *
 * The pill itself measured `aria-hidden="true"` in every case, and the trigger boxes were unchanged
 * (32.00 for the text buttons, 28.00 x 28.00 for the icon one — still over the WCAG 2.2 SC 2.5.8
 * 24px floor). The construction is byte-for-byte Toggle's, so a counted button and a counted chip
 * announce the same way.
 */
describe("Button countLabel (gh#734)", () => {
  it("names the button '<label>, <count> <unit>' instead of gluing the digits on", () => {
    renderWithUi(
      <Button count={3} countLabel="pages">
        Git
      </Button>,
    );
    // The defect this closes: the name used to be exactly "Git3".
    expect(screen.queryByRole("button", { name: "Git3" })).toBeNull();
    const btn = screen.getByRole("button", { name: /^Git\s*, 3 pages$/ });
    expect(btn.querySelector('[data-slot="button-count"]')).toHaveAttribute("aria-hidden", "true");
    expect(btn.querySelector(".sr-only")).toHaveTextContent(", 3 pages");
  });

  it("still separates the digits from the label when no countLabel is given", () => {
    renderWithUi(<Button count={3}>Git</Button>);
    expect(screen.queryByRole("button", { name: "Git3" })).toBeNull();
    expect(screen.getByRole("button", { name: /^Git\s*, 3$/ })).toBeInTheDocument();
  });

  it("speaks the CAPPED value, locale-formatted, not the raw count", () => {
    renderWithUi(
      <Button count={128} overflowCount={99} countLabel="件">
        受信トレイ
      </Button>,
    );
    const btn = screen.getByRole("button", { name: /^受信トレイ\s*, 99\+ 件$/ });
    expect(btn.querySelector('[data-slot="button-count"]')).toHaveTextContent("99+");
  });

  it("folds the clause into aria-label for an icon-only counted button", () => {
    renderWithUi(
      <Button size="icon-sm" aria-label="通知" count={3} countLabel="件の未読">
        <svg aria-hidden="true" />
      </Button>,
    );
    // With an aria-label the contents are outside the name, so the sr-only sibling alone would be
    // silent — the clause has to reach the label itself.
    expect(screen.getByRole("button", { name: "通知, 3 件の未読" })).toBeInTheDocument();
  });

  it("leaves a button with no count alone — no pill, no clause, no aria-label", () => {
    renderWithUi(
      <Button countLabel="件" aria-label="設定">
        設定
      </Button>,
    );
    const btn = screen.getByRole("button", { name: "設定" });
    expect(btn.querySelector('[data-slot="button-count"]')).toBeNull();
    expect(btn.querySelector(".sr-only")).toBeNull();
  });

  it("says nothing extra when showZero hides the pill", () => {
    renderWithUi(
      <Button count={0} showZero={false} countLabel="件">
        非表示のゼロ
      </Button>,
    );
    const btn = screen.getByRole("button", { name: "非表示のゼロ" });
    expect(btn.querySelector(".sr-only")).toBeNull();
  });

  it("uses the SAME contract as Toggle — a zero pill is still announced", () => {
    renderWithUi(
      <Button count={0} countLabel="件">
        完了
      </Button>,
    );
    expect(screen.getByRole("button", { name: /^完了\s*, 0 件$/ })).toBeInTheDocument();
  });
});
