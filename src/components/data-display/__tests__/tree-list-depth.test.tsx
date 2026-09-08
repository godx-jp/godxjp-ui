import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TreeList } from "../tree-list";
import { expectNoA11yViolations } from "@/test/a11y";

describe("TreeList hierarchy", () => {
  it("preserves deep hierarchy, the empty count, and the active link", async () => {
    const items = [
      {
        id: "deep",
        title: <a href="/documents/deep">深い階層</a>,
        depth: 5,
        badge: 0,
        active: true,
      },
    ];
    render(<TreeList items={items} />);
    const row = screen.getByRole("listitem");
    expect(row.style.getPropertyValue("--tree-item-depth")).toBe("5");
    expect(row).toHaveAttribute("aria-current", "true");
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "深い階層" })).toHaveAttribute(
      "href",
      "/documents/deep",
    );
    await expectNoA11yViolations(
      <main>
        <TreeList items={items} />
      </main>,
    );
  });
  it("keeps invalid negative depths at the root", () => {
    render(<TreeList items={[{ id: "root", title: "Root", depth: -3 }]} />);
    expect(screen.getByRole("listitem").style.getPropertyValue("--tree-item-depth")).toBe("0");
  });
});
