import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

import { Separator } from "../separator";
import { expectNoA11yViolations } from "@/test/a11y";

describe("Separator", () => {
  it("is decorative (role=none) by default and horizontal", () => {
    const { container } = render(<Separator />);
    const sep = container.querySelector('[data-slot="separator"]')!;
    expect(sep).toHaveAttribute("data-orientation", "horizontal");
    // decorative separators expose role="none" (no semantic separator role)
    expect(sep.getAttribute("role")).toBe("none");
  });

  it("vertical orientation sets the data attribute", () => {
    const { container } = render(<Separator orientation="vertical" />);
    expect(container.querySelector('[data-slot="separator"]')).toHaveAttribute(
      "data-orientation",
      "vertical",
    );
  });

  it("non-decorative exposes the semantic separator role", () => {
    const { getByRole } = render(<Separator decorative={false} />);
    expect(getByRole("separator")).toBeInTheDocument();
  });

  it("emits no label structure and stays inert without a label (gh#308)", () => {
    const { container } = render(<Separator />);
    const sep = container.querySelector('[data-slot="separator"]')!;
    expect(sep).not.toHaveAttribute("data-labelled");
    expect(sep).not.toHaveAttribute("data-label-align");
    expect(sep.querySelector(".ui-separator-rule")).toBeNull();
    expect(sep.querySelector(".ui-separator-label")).toBeNull();
    expect(sep).toHaveAttribute("data-tone", "default");
  });

  describe("labelled rule (gh#308)", () => {
    it("renders the three-cell grid and flips decorative off, naming the separator once", () => {
      const { container, getByRole } = render(<Separator label="新しいメッセージ" />);
      const sep = getByRole("separator", { name: "新しいメッセージ" });
      expect(sep).toHaveAttribute("data-labelled", "");
      expect(sep).toHaveAttribute("data-label-align", "center");
      expect(container.querySelectorAll(".ui-separator-rule")).toHaveLength(2);
      const label = container.querySelector(".ui-separator-label")!;
      expect(label).toHaveTextContent("新しいメッセージ");
      // The visible node is hidden so the string is announced ONCE — as the accessible name.
      expect(label).toHaveAttribute("aria-hidden", "true");
      expect(sep).toHaveAttribute("aria-label", "新しいメッセージ");
    });

    it("carries labelAlign as a controlled vocabulary value, not a boolean", () => {
      for (const align of ["start", "center", "end"] as const) {
        const { container, unmount } = render(<Separator label="22 Aug" labelAlign={align} />);
        expect(container.querySelector('[data-slot="separator"]')).toHaveAttribute(
          "data-label-align",
          align,
        );
        unmount();
      }
    });

    it("maps every tone onto the root so the rule and the label move together", () => {
      for (const tone of [
        "default",
        "muted",
        "primary",
        "success",
        "warning",
        "destructive",
        "info",
      ] as const) {
        const { container, unmount } = render(<Separator label="Tin nhắn mới" tone={tone} />);
        expect(container.querySelector('[data-slot="separator"]')).toHaveAttribute(
          "data-tone",
          tone,
        );
        unmount();
      }
    });

    it("keeps an explicit decorative={true} inert — no name, and the text left in the tree once", () => {
      const { container, queryByRole } = render(<Separator label="or" decorative />);
      const sep = container.querySelector('[data-slot="separator"]')!;
      expect(queryByRole("separator")).toBeNull();
      expect(sep.getAttribute("role")).toBe("none");
      // A role="none" element may not carry an accessible name, so the visible text stays exposed.
      expect(sep).not.toHaveAttribute("aria-label");
      expect(container.querySelector(".ui-separator-label")).not.toHaveAttribute("aria-hidden");
    });

    it("ignores a label on a vertical rule and warns in dev builds", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const { container } = render(<Separator orientation="vertical" label="or" />);
      const sep = container.querySelector('[data-slot="separator"]')!;
      expect(sep).not.toHaveAttribute("data-labelled");
      expect(sep.querySelector(".ui-separator-label")).toBeNull();
      expect(sep.getAttribute("role")).toBe("none");
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("Separator"));
      warn.mockRestore();
    });

    it("treats a blank label as no label at all", () => {
      const { container } = render(<Separator label="   " />);
      expect(container.querySelector('[data-slot="separator"]')).not.toHaveAttribute(
        "data-labelled",
      );
    });

    it("merges className and forwards the ref onto the public root", () => {
      const ref = { current: null as HTMLDivElement | null };
      const { container } = render(<Separator ref={ref} label="or" className="stream-divider" />);
      const sep = container.querySelector('[data-slot="separator"]')!;
      expect(sep).toHaveClass("ui-separator", "stream-divider");
      expect(ref.current).toBe(sep);
    });
  });

  it("has no axe violations", async () => {
    await expectNoA11yViolations(
      <div>
        上<Separator />下
      </div>,
    );
  });
});
