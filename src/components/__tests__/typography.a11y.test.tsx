import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Heading, Text } from "../general/typography";

describe("Text / Heading a11y", () => {
  it("renders the level as the semantic heading element + token size", () => {
    const { getByRole } = render(<Heading level={3}>見出し</Heading>);
    const h = getByRole("heading", { level: 3 });
    expect(h.tagName).toBe("H3");
    expect(h).toHaveAttribute("data-slot", "heading");
    expect(h).toHaveAttribute("data-level", "3");
  });

  it("Text forwards `as` + flags without an arbitrary px class", () => {
    const { getByText } = render(
      <Text as="label" size="sm" mono truncate>
        RC-204881
      </Text>,
    );
    const el = getByText("RC-204881");
    expect(el.tagName).toBe("LABEL");
    expect(el).toHaveAttribute("data-mono", "");
    expect(el).toHaveAttribute("data-truncate", "");
    expect(el.className).not.toMatch(/text-\[/);
  });
});
