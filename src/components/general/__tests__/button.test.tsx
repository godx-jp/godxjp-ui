import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { Button } from "../button";

describe("Button", () => {
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

  it("default size applies ui-button size token binding", () => {
    renderWithUi(<Button>Density</Button>);
    expect(screen.getByRole("button", { name: "Density" })).toHaveClass("ui-button--default-size");
  });

  it("default variant uses semantic button token class", () => {
    renderWithUi(<Button>Primary</Button>);
    expect(screen.getByRole("button", { name: "Primary" })).toHaveClass("ui-button--default");
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
});
