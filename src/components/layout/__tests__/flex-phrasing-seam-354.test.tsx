import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Flex } from "../flex";
import { Tabs, TabsList, TabsTrigger } from "../../navigation/tabs";

// FlexProp extended React.HTMLAttributes<HTMLDivElement> with no seam to change the tag,
// so a Flex inside a TabsTrigger/PopoverTrigger/Button (each renders a <button>, whose content
// model is phrasing content only) produced a <div> inside a <button>: invalid HTML. The consumer
// rules forbid the old escape hatch (`<span className="flex …">`), so before `as` there was no
// shape that was both legal and valid.
describe("Flex — `as` tag seam", () => {
  it("renders a <div> by default", () => {
    const { container } = render(<Flex>x</Flex>);
    expect((container.querySelector(".ui-flex") as HTMLElement).tagName).toBe("DIV");
  });

  it('as="span" swaps the tag and nothing else', () => {
    const { container } = render(
      <Flex as="span" direction="col" gap="sm" align="center" justify="between" wrap>
        x
      </Flex>,
    );
    const el = container.querySelector(".ui-flex") as HTMLElement;
    expect(el.tagName).toBe("SPAN");
    expect(el).toHaveClass("ui-flex", "ui-flex-gap-sm");
    expect(el.dataset.direction).toBe("col");
    expect(el.dataset.align).toBe("center");
    expect(el.dataset.justify).toBe("between");
    expect(el.dataset.wrap).toBe("true");
  });

  it("keeps a TabsTrigger's <button> free of flow content (the gh#354 regression)", () => {
    const { container } = render(
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            <Flex as="span" align="center" gap="sm">
              <span>未承認</span>
            </Flex>
          </TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    const trigger = container.querySelector("button") as HTMLElement;
    expect(trigger.querySelector(".ui-flex")).not.toBeNull();
    expect(trigger.querySelector("div")).toBeNull();
  });
});

// GapProp had no zero step, so stacks that are deliberately flush (a name over its role,
// a weekday over its date) had to carry `gap="xs"`: a visual change forced by a missing token.
describe("Flex — gap='none'", () => {
  it.each([
    ["none", "ui-flex-gap-none"],
    ["xs", "ui-flex-gap-xs"],
    ["sm", "ui-flex-gap-sm"],
    ["md", "ui-flex-gap-md"],
    ["lg", "ui-flex-gap-lg"],
    ["xl", "ui-flex-gap-xl"],
  ] as const)("gap=%s emits %s", (gap, className) => {
    const { container } = render(<Flex gap={gap}>x</Flex>);
    expect(container.querySelector(".ui-flex")).toHaveClass(className);
  });

  it("still defaults to the md step when gap is omitted", () => {
    const { container } = render(<Flex>x</Flex>);
    expect(container.querySelector(".ui-flex")).toHaveClass("ui-flex-gap-md");
  });
});
