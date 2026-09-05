import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { CodeBlock } from "../code-block";
import { expectNoA11yViolations } from "@/test/a11y";

const body = '{"report-to":"' + "x".repeat(240) + '"}';

describe("CodeBlock (gh#339)", () => {
  it("renders pre > code with the text and defaults (wrap on, no height cap, sm)", () => {
    const { container } = render(<CodeBlock>{body}</CodeBlock>);
    const pre = container.querySelector("pre")!;
    expect(pre.className).toContain("ui-code-block");
    expect(pre.querySelector("code")?.textContent).toBe(body);
    expect(pre).not.toHaveAttribute("data-wrap");
    expect(pre).not.toHaveAttribute("data-max-height");
    expect(pre).not.toHaveAttribute("data-size");
    expect(pre).not.toHaveAttribute("tabindex");
  });

  it("wrap=false, maxHeight and size land as data attributes and make the block focusable", () => {
    const { container } = render(
      <CodeBlock wrap={false} maxHeight="md" size="xs" language="json">
        {body}
      </CodeBlock>,
    );
    const pre = container.querySelector("pre")!;
    expect(pre).toHaveAttribute("data-wrap", "false");
    expect(pre).toHaveAttribute("data-max-height", "md");
    expect(pre).toHaveAttribute("data-size", "xs");
    expect(pre).toHaveAttribute("data-language", "json");
    expect(pre).toHaveAttribute("tabindex", "0");
  });

  it("has no a11y violations", async () => {
    await expectNoA11yViolations(
      <CodeBlock maxHeight="sm" aria-label="Response body">
        {body}
      </CodeBlock>,
    );
  });
});
