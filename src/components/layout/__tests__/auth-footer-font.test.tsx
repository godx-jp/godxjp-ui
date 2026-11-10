import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AuthFooter } from "../auth-footer";

const css = readFileSync(resolve(process.cwd(), "src/styles/shell-layout.css"), "utf8");

describe("AuthFooter mono", () => {
  it("keeps the monospace default; mono={false} switches to the body face through a knob", () => {
    const { container, rerender } = render(
      <AuthFooter product="GoDX ID" terms="利用規約" privacy="プライバシー" />,
    );
    expect(container.firstElementChild).not.toHaveAttribute("data-font");
    rerender(<AuthFooter product="GoDX ID" terms="利用規約" privacy="プライバシー" mono={false} />);
    expect(container.firstElementChild).toHaveAttribute("data-font", "body");
    expect(css).toMatch(
      /\.ui-auth-legal-footer\[data-font="body"\]\s*\{\s*font-family:\s*var\(--auth-footer-font-family, var\(--font-family-body, inherit\)\);/,
    );
  });
});
