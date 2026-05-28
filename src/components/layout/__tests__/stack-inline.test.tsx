import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";
import { Stack } from "../stack";
import { Inline } from "../inline";

describe("Stack", () => {
  it.each([
    ["xs", "ui-stack-xs"],
    ["sm", "ui-stack-sm"],
    ["md", "ui-stack-md"],
    ["lg", "ui-stack-lg"],
    ["xl", "ui-stack-xl"],
  ] as const)("applies gap=%s → %s", (gap, cls) => {
    const { container } = renderWithUi(
      <Stack gap={gap}>
        <span>a</span>
        <span>b</span>
      </Stack>,
    );
    expect(container.firstChild).toHaveClass(cls);
  });
});

describe("Inline", () => {
  it.each([
    ["xs", "ui-inline-xs"],
    ["sm", "ui-inline-sm"],
    ["md", "ui-inline-md"],
    ["lg", "ui-inline-lg"],
  ] as const)("applies gap=%s → %s", (gap, cls) => {
    const { container } = renderWithUi(
      <Inline gap={gap}>
        <span>a</span>
        <span>b</span>
      </Inline>,
    );
    expect(container.firstChild).toHaveClass(cls);
  });
});
