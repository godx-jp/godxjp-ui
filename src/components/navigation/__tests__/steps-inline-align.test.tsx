import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Steps } from "../steps";

const css = readFileSync(resolve(process.cwd(), "src/styles/navigation-layout.css"), "utf8");
const items = [{ title: "メール" }, { title: "パスワード" }];

describe('Steps type="inline" align', () => {
  it('align="start" puts the run at the inline-start edge; default and non-inline emit nothing', () => {
    const { container, rerender } = render(<Steps type="inline" items={items} />);
    expect(container.querySelector("ol")).not.toHaveAttribute("data-align");
    rerender(<Steps type="inline" align="start" items={items} />);
    expect(container.querySelector("ol")).toHaveAttribute("data-align", "start");
    rerender(<Steps align="start" items={items} />);
    expect(container.querySelector("ol")).not.toHaveAttribute("data-align");
    expect(css).toMatch(
      /\.ui-steps-inline\[data-align="start"\]\s*\{\s*justify-content:\s*flex-start;/,
    );
  });
});
