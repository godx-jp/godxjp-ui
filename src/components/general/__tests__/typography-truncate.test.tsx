import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Heading, Text } from "../typography";

describe("Heading / Text — truncate", () => {
  it("Heading sets data-truncate when truncate is on, omits it otherwise", () => {
    const { rerender, container } = render(
      <Heading level={2} truncate>
        長いタイトル
      </Heading>,
    );
    expect(container.querySelector('[data-slot="heading"]')).toHaveAttribute("data-truncate", "");
    rerender(<Heading level={2}>普通</Heading>);
    expect(container.querySelector('[data-slot="heading"]')).not.toHaveAttribute("data-truncate");
  });

  it("Text sets data-truncate when truncate is on", () => {
    render(<Text truncate>長い本文</Text>);
    const text = screen.getByText("長い本文");
    expect(text).toHaveAttribute("data-slot", "text");
    expect(text).toHaveAttribute("data-truncate", "");
  });
});

describe("Heading — weight", () => {
  it("defaults to medium (preserving the existing heading weight)", () => {
    const { container } = render(<Heading level={1}>タイトル</Heading>);
    expect(container.querySelector('[data-slot="heading"]')).toHaveAttribute("data-weight", "medium");
  });

  it("renders a bold heading while staying a semantic <h1> (issue #121)", () => {
    const { container } = render(
      <Heading level={1} weight="bold">
        ブランド
      </Heading>,
    );
    const heading = container.querySelector('[data-slot="heading"]')!;
    expect(heading.tagName).toBe("H1");
    expect(heading).toHaveAttribute("data-weight", "bold");
  });
});
