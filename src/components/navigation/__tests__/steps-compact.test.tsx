import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Steps } from "../steps";

describe("Steps — compact size", () => {
  it("uses text-xs for the title and description when size=sm", () => {
    render(<Steps items={[{ title: "申込", description: "書類提出" }]} size="sm" />);
    // compact → text-xs on both the title and the description (the `compact ?` branch)
    expect(screen.getByText("申込").className).toContain("text-xs");
    expect(screen.getByText("書類提出").className).toContain("text-xs");
  });
});
