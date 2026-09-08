import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoA11yViolations } from "@/test/a11y";
import { Button } from "../button";
import { VisuallyHidden } from "../visually-hidden";

describe("VisuallyHidden", () => {
  it("supplies an icon button name without hiding it from assistive technology", async () => {
    const ref = createRef<HTMLSpanElement>();
    const { container } = render(
      <Button>
        <span aria-hidden="true">+</span>
        <VisuallyHidden ref={ref} id="add-project">
          Add project
        </VisuallyHidden>
      </Button>,
    );
    expect(screen.getByRole("button", { name: "Add project" })).toBeEnabled();
    expect(ref.current).toBe(container.querySelector("#add-project"));
    expect(ref.current).not.toHaveAttribute("hidden");
    expect(ref.current).not.toHaveAttribute("aria-hidden");
    await expectNoA11yViolations(
      <main>
        <Button>
          <VisuallyHidden>Add project</VisuallyHidden>
          <span aria-hidden="true">+</span>
        </Button>
      </main>,
    );
  });
});
