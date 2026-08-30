import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Steps } from "../steps";

describe("Steps — dot type error status", () => {
  it("renders a destructive dot for an error step in dot mode", () => {
    const { container } = render(
      <Steps items={[{ title: "申込" }, { title: "失敗", status: "error" }]} type="dot" />,
    );
    // the dot marker for the error step takes the bg-destructive branch
    // The dot's error fill is driven by `data-status`, not a colour utility (#319).
    expect(container.querySelector('.ui-steps-dot[data-status="error"]')).not.toBeNull();
  });
});
