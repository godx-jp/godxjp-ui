import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Inbox } from "lucide-react";

import { EmptyState } from "../empty-state";
import { expectNoA11yViolations } from "@/test/a11y";

describe("EmptyState", () => {
  it("renders title only (no icon / description / action)", () => {
    const { getByRole, container } = render(<EmptyState title="データなし" />);
    const root = getByRole("status");
    expect(root).toHaveTextContent("データなし");
    expect(container.querySelector(".ui-empty-state-icon")).toBeNull();
    expect(container.querySelector(".ui-empty-state-description")).toBeNull();
  });

  it("renders the icon, description and action when provided", () => {
    const { container, getByText, getByRole } = render(
      <EmptyState
        icon={Inbox}
        title="受信箱は空です"
        description="新しい仕訳はありません。"
        action={<button>更新</button>}
      />,
    );
    expect(container.querySelector(".ui-empty-state-icon")).toBeInTheDocument();
    expect(getByText("新しい仕訳はありません。")).toBeInTheDocument();
    expect(getByRole("button", { name: "更新" })).toBeInTheDocument();
  });

  it("forwards className to the status root", () => {
    const { getByRole } = render(<EmptyState title="x" className="my-8" />);
    expect(getByRole("status")).toHaveClass("my-8");
  });

  it("exposes restrained section and compact variants", () => {
    const { getByRole, rerender, container } = render(
      <EmptyState icon={Inbox} title="None" variant="section" />,
    );
    expect(getByRole("status")).toHaveAttribute("data-variant", "section");
    rerender(<EmptyState icon={Inbox} title="None" variant="compact" />);
    expect(getByRole("status")).toHaveAttribute("data-variant", "compact");
    expect(container.querySelector(".ui-empty-state-icon")).toBeNull();
  });

  it("defaults to the muted tone and reflects a semantic tone via data-tone", () => {
    const { getByRole, rerender } = render(<EmptyState icon={Inbox} title="なし" />);
    expect(getByRole("status")).toHaveAttribute("data-tone", "muted");
    rerender(<EmptyState icon={Inbox} title="承認済み" tone="success" />);
    expect(getByRole("status")).toHaveAttribute("data-tone", "success");
  });

  it("has no axe violations", async () => {
    await expectNoA11yViolations(
      <EmptyState icon={Inbox} title="データなし" description="まだありません。" />,
    );
  });

  it("has no axe violations for a success tone", async () => {
    await expectNoA11yViolations(
      <EmptyState
        icon={Inbox}
        title="承認しました"
        tone="success"
        description="端末が承認されました。"
      />,
    );
  });
});
