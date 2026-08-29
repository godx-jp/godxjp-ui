import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { expectNoA11yViolations } from "@/test/a11y";
import { Button } from "../button";

/**
 * The size the CHILD glyph asks for on its own — a FIXTURE standing in for whatever a consumer
 * hands the button, not a statement about how the button paints anything. The test is that the
 * button's own utility still out-ranks it.
 */
const CHILD_ICON_CLASS = "size-4";

describe("Button", () => {
  it("defaults to type=button so it does not submit an ancestor form", () => {
    renderWithUi(<Button>Safe action</Button>);
    expect(screen.getByRole("button", { name: "Safe action" })).toHaveAttribute("type", "button");
  });

  it("preserves an explicit submit type", () => {
    renderWithUi(<Button type="submit">Submit</Button>);
    expect(screen.getByRole("button", { name: "Submit" })).toHaveAttribute("type", "submit");
  });

  it("renders children and default type=submit implicit button", () => {
    renderWithUi(<Button>Click me</Button>);
    const btn = screen.getByRole("button", { name: "Click me" });
    expect(btn).toBeInTheDocument();
    expect(btn.tagName).toBe("BUTTON");
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithUi(<Button onClick={onClick}>Go</Button>);
    await user.click(screen.getByRole("button", { name: "Go" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not fire onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithUi(
      <Button disabled onClick={onClick}>
        Blocked
      </Button>,
    );
    await user.click(screen.getByRole("button", { name: "Blocked" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it.each(["destructive", "outline", "secondary", "ghost", "link"] as const)(
    "renders variant=%s",
    (variant) => {
      renderWithUi(<Button variant={variant}>V</Button>);
      expect(screen.getByRole("button", { name: "V" })).toBeInTheDocument();
    },
  );

  it.each(["xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"] as const)(
    "renders size=%s",
    (size) => {
      renderWithUi(<Button size={size}>S</Button>);
      expect(screen.getByRole("button", { name: "S" })).toBeInTheDocument();
    },
  );

  it("exposes shadcn data-slot and state attributes", () => {
    renderWithUi(
      <Button variant="outline" size="sm" aria-invalid>
        State
      </Button>,
    );
    const btn = screen.getByRole("button", { name: "State" });
    expect(btn).toHaveAttribute("data-slot", "button");
    expect(btn).toHaveAttribute("data-variant", "outline");
    expect(btn).toHaveAttribute("data-size", "sm");
    expect(btn).toHaveClass("aria-invalid:border-destructive");
  });

  it("publishes fullWidth as data-full-width, and emits nothing by default", () => {
    // The stretched state is a CONTRACT a theme (and a consumer's own selector) can key on,
    // whichever width utility currently performs the stretch.
    const { rerender } = renderWithUi(<Button fullWidth>Wide</Button>);
    expect(screen.getByRole("button", { name: "Wide" })).toHaveAttribute("data-full-width", "");
    rerender(<Button>Auto</Button>);
    expect(screen.getByRole("button", { name: "Auto" })).not.toHaveAttribute("data-full-width");
  });

  it("default size applies ui-button size token binding", () => {
    renderWithUi(<Button>Density</Button>);
    expect(screen.getByRole("button", { name: "Density" })).toHaveClass("ui-button--default-size");
  });

  it("default variant uses semantic button token class", () => {
    renderWithUi(<Button>Primary</Button>);
    expect(screen.getByRole("button", { name: "Primary" })).toHaveClass("ui-button--default");
  });

  // Regression, issue #133: icon-sm/icon-lg must bind the same density tokens as their labelled
  // counterparts so a chevron trigger sits flush beside an sm action (split button). They used to
  // hand-derive an offset off the BASE --control-height, which ignored the .ui-button--sm rebinding
  // and rendered icon-sm 4px short — exactly the xs height.
  it.each([
    ["icon-xs", "ui-button--icon-xs"],
    ["icon-sm", "ui-button--icon-sm"],
    ["icon-lg", "ui-button--icon-lg"],
  ] as const)("size=%s binds the density token class %s", (size, tokenClass) => {
    renderWithUi(<Button size={size}>I</Button>);
    const btn = screen.getByRole("button", { name: "I" });
    expect(btn).toHaveClass(tokenClass);
    expect(btn.className).not.toMatch(/size-\[calc\(var\(--control-height\)/);
  });

  it("icon-xs owns a 12px glyph even when the child requests size-4", () => {
    renderWithUi(
      <Button size="icon-xs" aria-label="Edit explicit icon">
        <svg data-testid="explicit-icon" className={CHILD_ICON_CLASS} />
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Edit explicit icon" });
    expect(button).toHaveClass("ui-button--icon-xs");
    expect(screen.getByTestId("explicit-icon")).toHaveClass(CHILD_ICON_CLASS);
    // The glyph rule must stay a UTILITY (Tailwind v4 orders utilities after components, so a
    // components-layer rule could never out-rank the child's own `size-4`). It now reads the
    // token instead of a literal step, so the 12px is themeable without losing that precedence.
    expect(button.className).toContain("[&_svg]:size-[var(--button-xs-icon-size)]");
    expect(button.className).toContain("[&_svg]:shrink-0");
  });

  describe("loading", () => {
    it("sets aria-busy, data-loading, and disables the button while loading", () => {
      renderWithUi(<Button loading>Save</Button>);
      const btn = screen.getByRole("button", { name: "Save" });
      expect(btn).toHaveAttribute("aria-busy", "true");
      expect(btn).toHaveAttribute("data-loading", "");
      expect(btn).toBeDisabled();
    });

    it("does not fire onClick while loading", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      renderWithUi(
        <Button loading onClick={onClick}>
          Save
        </Button>,
      );
      await user.click(screen.getByRole("button", { name: "Save" }));
      expect(onClick).not.toHaveBeenCalled();
    });

    it("renders a leading spinner alongside the label (no width-jumping label removal)", () => {
      renderWithUi(<Button loading>Save</Button>);
      const btn = screen.getByRole("button", { name: "Save" });
      // Label kept; spinner is a leading svg sibling.
      expect(btn).toHaveTextContent("Save");
      expect(btn.querySelector("svg.animate-spin")).not.toBeNull();
    });

    it("swaps the label for loadingText while loading", () => {
      renderWithUi(
        <Button loading loadingText="Saving…">
          Save
        </Button>,
      );
      const btn = screen.getByRole("button", { name: "Saving…" });
      expect(btn).toHaveTextContent("Saving…");
      expect(btn).not.toHaveTextContent("Save");
    });

    it("is not aria-busy and is interactive when not loading", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      renderWithUi(
        <Button onClick={onClick} loadingText="Saving…">
          Save
        </Button>,
      );
      const btn = screen.getByRole("button", { name: "Save" });
      expect(btn).not.toHaveAttribute("aria-busy");
      expect(btn).not.toHaveAttribute("data-loading");
      await user.click(btn);
      expect(onClick).toHaveBeenCalledOnce();
    });

    it("ignores loading when asChild (Slot requires a single child)", () => {
      renderWithUi(
        <Button asChild loading>
          <a href="#">Link</a>
        </Button>,
      );
      const link = screen.getByRole("link", { name: "Link" });
      expect(link).not.toHaveAttribute("aria-busy");
      expect(link.querySelector("svg.animate-spin")).toBeNull();
    });
  });

  describe("count", () => {
    it("renders a trailing borderless counter after the label", () => {
      renderWithUi(<Button count={18}>Chờ bay</Button>);
      const btn = screen.getByRole("button", { name: /Chờ bay/ });
      const counter = btn.querySelector('[data-slot="button-count"]');
      expect(counter).not.toBeNull();
      expect(counter).toHaveTextContent("18");
      // The counter carries no border of its own (must not double-border an outline button).
      expect(counter?.className).not.toMatch(/\bborder\b/);
    });

    it("renders a zero count", () => {
      renderWithUi(
        <Button variant="outline" count={0}>
          Đã đến
        </Button>,
      );
      expect(
        screen.getByRole("button", { name: /Đã đến/ }).querySelector('[data-slot="button-count"]'),
      ).toHaveTextContent("0");
    });

    it("caps at overflowCount and shows N+ (Ant Badge parity)", () => {
      renderWithUi(<Button count={128}>Inbox</Button>);
      expect(
        screen.getByRole("button", { name: /Inbox/ }).querySelector('[data-slot="button-count"]'),
      ).toHaveTextContent("99+");
    });

    it("respects a custom overflowCount", () => {
      renderWithUi(
        <Button count={15} overflowCount={9}>
          Inbox
        </Button>,
      );
      expect(
        screen.getByRole("button", { name: /Inbox/ }).querySelector('[data-slot="button-count"]'),
      ).toHaveTextContent("9+");
    });

    it("hides the pill at zero when showZero is false", () => {
      renderWithUi(
        <Button count={0} showZero={false}>
          Done
        </Button>,
      );
      expect(
        screen.getByRole("button", { name: /Done/ }).querySelector('[data-slot="button-count"]'),
      ).toBeNull();
    });

    it("does not render a counter when count is omitted", () => {
      renderWithUi(<Button>No count</Button>);
      expect(
        screen
          .getByRole("button", { name: "No count" })
          .querySelector('[data-slot="button-count"]'),
      ).toBeNull();
    });

    it("ignores count when asChild (Slot requires a single child)", () => {
      renderWithUi(
        <Button asChild count={5}>
          <a href="#">Link</a>
        </Button>,
      );
      const link = screen.getByRole("link", { name: "Link" });
      expect(link.querySelector('[data-slot="button-count"]')).toBeNull();
    });

    it("has no a11y violations with a count", async () => {
      await expectNoA11yViolations(
        <Button variant="outline" count={3}>
          Items
        </Button>,
      );
    });
  });
});
