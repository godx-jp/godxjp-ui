import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { Breadcrumb } from "../breadcrumb";

describe("Breadcrumb", () => {
  it("renders linked ancestors and a current last segment", () => {
    renderWithUi(
      <Breadcrumb
        items={[
          { label: "ホーム", to: "/" },
          { label: "設定", to: "/settings" },
          { label: "プロフィール" },
        ]}
      />,
    );
    expect(screen.getByRole("link", { name: "ホーム" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "設定" })).toHaveAttribute("href", "/settings");
    const current = screen.getByText("プロフィール");
    expect(current.tagName).toBe("SPAN");
    expect(current).toHaveAttribute("aria-current", "page");
  });

  it("renders a non-linked middle item as a plain span without aria-current", () => {
    renderWithUi(<Breadcrumb items={[{ label: "A", to: "/a" }, { label: "B" }, { label: "C" }]} />);
    const b = screen.getByText("B");
    expect(b.tagName).toBe("SPAN");
    expect(b).not.toHaveAttribute("aria-current"); // not the last segment
  });

  it("uses a custom link component when provided", () => {
    const Link = ({ to, children }: { to: string; children: React.ReactNode }) => (
      <a data-testid="custom-link" href={to}>
        {children}
      </a>
    );
    renderWithUi(
      <Breadcrumb items={[{ label: "X", to: "/x" }, { label: "Y" }]} linkComponent={Link} />,
    );
    expect(screen.getByTestId("custom-link")).toHaveAttribute("href", "/x");
  });
});
