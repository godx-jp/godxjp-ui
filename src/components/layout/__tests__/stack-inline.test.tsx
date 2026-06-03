import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";
import { Flex } from "../flex";

describe("Stack", () => {
  it.each([
    ["xs", "ui-flex-gap-xs"],
    ["sm", "ui-flex-gap-sm"],
    ["md", "ui-flex-gap-md"],
    ["lg", "ui-flex-gap-lg"],
    ["xl", "ui-flex-gap-xl"],
  ] as const)("applies gap=%s → %s", (gap, cls) => {
    const { container } = renderWithUi(
      <Flex direction="col" gap={gap}>
        <span>a</span>
        <span>b</span>
      </Flex>,
    );
    expect(container.firstChild).toHaveClass(cls);
  });
});

describe("Inline", () => {
  it.each([
    ["xs", "ui-flex-gap-xs"],
    ["sm", "ui-flex-gap-sm"],
    ["md", "ui-flex-gap-md"],
    ["lg", "ui-flex-gap-lg"],
  ] as const)("applies gap=%s → %s", (gap, cls) => {
    const { container } = renderWithUi(
      <Flex direction="row" wrap align="center" gap={gap}>
        <span>a</span>
        <span>b</span>
      </Flex>,
    );
    expect(container.firstChild).toHaveClass(cls);
  });
});
