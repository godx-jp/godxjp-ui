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

  it("has no axe violations", async () => {
    await expectNoA11yViolations(
      <EmptyState icon={Inbox} title="データなし" description="まだありません。" />,
    );
  });
});
