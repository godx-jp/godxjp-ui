import { describe, expect, it } from "vitest";

import { CenteredShell } from "../centered-shell";
import { renderWithUi } from "@/test/render";
import { expectNoA11yViolations } from "@/test/a11y";

describe("CenteredShell", () => {
  it("renders the centred main landmark with its children", () => {
    const { getByRole, getByText } = renderWithUi(
      <CenteredShell>
        <div>マイページ</div>
      </CenteredShell>,
    );
    expect(getByRole("main")).toBeInTheDocument();
    expect(getByText("マイページ")).toBeInTheDocument();
  });

  it("renders the topbar banner and footer contentinfo when provided", () => {
    const { getByRole, getByText } = renderWithUi(
      <CenteredShell topbar={<span>バー</span>} footer={<span>フッタ</span>}>
        x
      </CenteredShell>,
    );
    expect(getByRole("banner")).toBeInTheDocument();
    expect(getByRole("contentinfo")).toBeInTheDocument();
    expect(getByText("バー")).toBeInTheDocument();
    expect(getByText("フッタ")).toBeInTheDocument();
  });

  it("omits the topbar + footer landmarks when their slots are absent", () => {
    const { queryByRole } = renderWithUi(
      <CenteredShell>
        <div>x</div>
      </CenteredShell>,
    );
    expect(queryByRole("banner")).toBeNull();
    expect(queryByRole("contentinfo")).toBeNull();
  });

  it("defaults the centred column to the md width tier", () => {
    const { container } = renderWithUi(
      <CenteredShell>
        <div>x</div>
      </CenteredShell>,
    );
    // No data-width attribute → CSS default (.ui-centered-shell-column = --centered-shell-width-md).
    const column = container.querySelector(".ui-centered-shell-column");
    expect(column).not.toBeNull();
    expect(column).toHaveAttribute("data-width", "md");
  });

  it("reflects the width prop onto the column as data-width (sm|md|lg)", () => {
    const { container } = renderWithUi(
      <CenteredShell width="lg">
        <div>x</div>
      </CenteredShell>,
    );
    expect(container.querySelector(".ui-centered-shell-column")).toHaveAttribute(
      "data-width",
      "lg",
    );
  });

  it("forwards className to the shell root", () => {
    const { container } = renderWithUi(
      <CenteredShell className="tenant-scope">
        <div>x</div>
      </CenteredShell>,
    );
    expect(container.querySelector('[data-slot="centered-shell"]')).toHaveClass(
      "ui-centered-shell",
      "tenant-scope",
    );
  });

  it("has no axe violations", async () => {
    await expectNoA11yViolations(
      <CenteredShell topbar={<span>Brand</span>} footer={<span>© 2026</span>}>
        <div>My Page</div>
      </CenteredShell>,
    );
  });
});
