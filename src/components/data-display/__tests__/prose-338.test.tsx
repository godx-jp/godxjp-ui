import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Prose } from "../prose";
import { expectNoA11yViolations } from "@/test/a11y";

describe("Prose (gh#338)", () => {
  it("wraps rendered content and emits only the non-default axes", () => {
    const { container, rerender } = render(
      <Prose>
        <h2>Release notes</h2>
        <p>Body</p>
      </Prose>,
    );
    const root = container.querySelector('[data-slot="prose"]')!;
    expect(root.className).toContain("ui-prose");
    expect(root).not.toHaveAttribute("data-size");
    expect(root).not.toHaveAttribute("data-image-size");
    expect(root.querySelector("h2")?.textContent).toBe("Release notes");
    rerender(<Prose size="sm" imageSize="original" />);
    expect(container.querySelector('[data-slot="prose"]')).toHaveAttribute("data-size", "sm");
    expect(container.querySelector('[data-slot="prose"]')).toHaveAttribute(
      "data-image-size",
      "original",
    );
  });

  it("accepts a sanitised HTML string through dangerouslySetInnerHTML", () => {
    const { container } = render(
      <Prose dangerouslySetInnerHTML={{ __html: "<p>From the <code>CMS</code></p>" }} />,
    );
    expect(container.querySelector("code")?.textContent).toBe("CMS");
  });

  it("has no a11y violations", async () => {
    await expectNoA11yViolations(
      <Prose>
        <h1>Title</h1>
        <p>
          A <a href="#top">link</a>.
        </p>
        <ul>
          <li>one</li>
        </ul>
        <table>
          <thead>
            <tr>
              <th>Key</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>v</td>
            </tr>
          </tbody>
        </table>
      </Prose>,
    );
  });
});
