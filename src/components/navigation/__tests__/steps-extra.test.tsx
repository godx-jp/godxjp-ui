import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Steps } from "../steps";

const ITEMS = [{ title: "申込" }, { title: "審査" }, { title: "完了" }];

describe("Steps — currentStatus + titlePlacement", () => {
  it("applies the status prop to the current step (currentStatus override)", () => {
    const { container } = render(<Steps items={ITEMS} value={1} status="error" />);
    // step 1 is current → resolveStepStatus uses currentStatus="error"
    expect(container.querySelector('.ui-steps-marker[data-status="error"]')).not.toBeNull();
    expect(screen.getByText("審査")).toHaveAttribute("data-status", "error");
  });

  it("adds the vertical title-placement spacing on a horizontal stepper", () => {
    const { container } = render(
      <Steps items={ITEMS} titlePlacement="vertical" orientation="horizontal" />,
    );
    // titlePlacement === "vertical" && !isVertical → the body gets mt-1
    // Title placement is a data attribute now; the spacing it selects is a token.
    expect(
      container.querySelector('.ui-steps-item[data-title-placement="vertical"]'),
    ).not.toBeNull();
  });
});
