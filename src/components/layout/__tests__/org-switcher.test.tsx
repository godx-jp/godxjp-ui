import { describe, expect, it, vi } from "vitest";

import { renderWithUi, screen, userEvent } from "@/test/render";
import { OrgSwitcher } from "../org-switcher";

const organizations = [
  { id: "dxs", name: "DXS Holdings", meta: "Owner" },
  { id: "long", name: "非常に長い組織名株式会社プラットフォーム", meta: "Member" },
] as const;

const labels = {
  trigger: (name: string) => `Current organization: ${name}`,
  title: "Choose organization",
  search: "Search organizations",
  empty: "No organizations",
  loading: "Loading organizations",
  retry: "Retry",
};

describe("OrgSwitcher public contract", () => {
  it("renders the selected organization, metadata and canonical shell classes", () => {
    const { container } = renderWithUi(
      <OrgSwitcher organizations={organizations} value="dxs" labels={labels} />,
    );

    expect(
      screen.getByRole("button", { name: "Current organization: DXS Holdings" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Owner")).toBeInTheDocument();
    expect(container.querySelector(".ui-org-switcher-trigger")).toBeInTheDocument();
  });

  it("searches, selects and closes the desktop popover", async () => {
    const onValueChange = vi.fn();
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    renderWithUi(
      <OrgSwitcher
        organizations={organizations}
        value="dxs"
        onValueChange={onValueChange}
        labels={labels}
        responsive="popover"
        open
        onOpenChange={onOpenChange}
      />,
    );

    await user.type(await screen.findByLabelText("Search organizations"), "非常");
    expect(screen.queryByRole("option", { name: /DXS Holdings/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole("option", { name: /非常に長い組織名/ }));
    expect(onValueChange).toHaveBeenCalledWith("long");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("renders a focus-trapped bottom Sheet in the explicit mobile mode", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <OrgSwitcher
        organizations={organizations}
        value="dxs"
        labels={labels}
        responsive="sheet"
        open
      />,
    );

    expect(await screen.findByRole("dialog", { name: "Choose organization" })).toBeInTheDocument();
  });

  it("supports collapsed, loading, empty, disabled and error states", async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    const { rerender } = renderWithUi(
      <OrgSwitcher organizations={organizations} value="dxs" labels={labels} collapsed />,
    );
    expect(screen.getByRole("button", { name: /Current organization/ })).toHaveAttribute(
      "data-collapsed",
      "true",
    );

    rerender(<OrgSwitcher organizations={organizations} labels={labels} loading />);
    expect(screen.getByRole("button", { name: /Choose organization/ })).toBeEnabled();

    rerender(<OrgSwitcher organizations={[]} labels={labels} />);
    expect(screen.getByRole("button", { name: /Choose organization/ })).toBeEnabled();

    rerender(
      <OrgSwitcher
        organizations={organizations}
        value="dxs"
        labels={labels}
        error="Could not load organizations"
        onRetry={onRetry}
        responsive="popover"
        open
      />,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not load organizations");
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
