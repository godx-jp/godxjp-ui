import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";
import { Stack } from "../stack";
import { Inline } from "../inline";

describe("Stack", () => {
  it.each([
    ["xs", "ui-flex-gap-xs"],
    ["sm", "ui-flex-gap-sm"],
    ["md", "ui-flex-gap-md"],
    ["lg", "ui-flex-gap-lg"],
    ["xl", "ui-flex-gap-xl"],
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
    ["xs", "ui-flex-gap-xs"],
    ["sm", "ui-flex-gap-sm"],
    ["md", "ui-flex-gap-md"],
    ["lg", "ui-flex-gap-lg"],
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
