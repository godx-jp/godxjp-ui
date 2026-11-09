import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";
import { Radio } from "../radio";

/**
 * GDX-1303 — a disabled RadioGroup option faded only its circle: the label kept full ink
 * (rgb(36,35,30), opacity 1). The fade rule is CSS, which jsdom does not cascade, so this pins the
 * two halves that make it work: the rule exists and takes the label tier's disabled alpha, and its
 * selector matches the disabled option's row, and only that row, in the DOM Radio.Group renders.
 */
const css = readFileSync(resolve(process.cwd(), "src/styles/control.css"), "utf8");
const rule =
  /(\.ui-choice-field:has\([^{}()]*\[data-disabled\]\)\s*>\s*\.ui-choice-content)\s*\{([^}]*)\}/.exec(
    css,
  );

describe("Radio.Group — a disabled option's words read as disabled", () => {
  it("fades the label and description with the label tier's disabled alpha", () => {
    expect(rule, "no rule fades a disabled choice's content").not.toBeNull();
    expect(rule![2]).toMatch(/opacity:\s*var\(--control-label-disabled-alpha\)/);
  });

  it("matches the disabled option's row only", () => {
    const { container } = renderWithUi(
      <Radio.Group
        aria-label="Ship method"
        defaultValue="air"
        options={[
          { label: "Air", value: "air", description: "3–5 days" },
          {
            label: "Express Osaka",
            value: "express",
            description: "Not this month",
            disabled: true,
          },
        ]}
      />,
    );
    const faded = [...container.querySelectorAll(rule![1].trim())];
    expect(faded).toHaveLength(1);
    expect(faded[0]).toContainElement(screen.getByText("Express Osaka"));
    expect(faded[0]).toContainElement(screen.getByText("Not this month"));
  });

  it("fades every row when the whole group is disabled", () => {
    const { container } = renderWithUi(
      <Radio.Group
        aria-label="Ship method"
        disabled
        options={[
          { label: "Air", value: "air" },
          { label: "Sea", value: "sea" },
        ]}
      />,
    );
    expect(container.querySelectorAll(rule![1].trim())).toHaveLength(2);
  });
});
