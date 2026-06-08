import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Steps } from "../steps";

describe("Steps — dot type error status", () => {
  it("renders a destructive dot for an error step in dot mode", () => {
    const { container } = render(
      <Steps items={[{ title: "申込" }, { title: "失敗", status: "error" }]} type="dot" />,
    );
    // the dot marker for the error step takes the bg-destructive branch
    expect(container.querySelector('[class*="bg-destructive"]')).not.toBeNull();
  });
});
