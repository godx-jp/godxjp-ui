import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { expectNoA11yViolations } from "@/test/a11y";
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

function ControlledOrgSwitcher({
  responsive,
  onOpenChange,
  onValueChange,
}: {
  responsive: "popover" | "sheet";
  onOpenChange: (open: boolean) => void;
  onValueChange: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("dxs");

  return (
    <OrgSwitcher
      organizations={organizations}
      value={value}
      onValueChange={(nextValue) => {
        setValue(nextValue);
        onValueChange(nextValue);
      }}
      labels={labels}
      responsive={responsive}
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        onOpenChange(nextOpen);
      }}
    />
  );
}

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

  it("keeps callback-only popover state uncontrolled across touch, focus, tab and close", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    renderWithUi(
      <OrgSwitcher
        organizations={organizations}
        value="dxs"
        labels={labels}
        responsive="popover"
        onOpenChange={onOpenChange}
      />,
    );

    const trigger = screen.getByRole("button", {
      name: "Current organization: DXS Holdings",
    });
    trigger.focus();
    await user.pointer({ keys: "[TouchA]", target: trigger });
    const dialog = await screen.findByRole("dialog", { name: "Choose organization" });
    const search = await screen.findByLabelText("Search organizations");
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(search).toHaveFocus();
    await user.tab();
    expect(dialog).toBeInTheDocument();
    expect(document.activeElement).not.toBe(document.body);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Choose organization" })).not.toBeInTheDocument();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(trigger).toHaveFocus();
  });

  it("keeps the controlled sheet stateful across touch, focus, tab, selection and close", async () => {
    const onOpenChange = vi.fn();
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    renderWithUi(
      <ControlledOrgSwitcher
        responsive="sheet"
        onOpenChange={onOpenChange}
        onValueChange={onValueChange}
      />,
    );

    const trigger = screen.getByRole("button", {
      name: "Current organization: DXS Holdings",
    });
    trigger.focus();
    await user.pointer({ keys: "[TouchA]", target: trigger });
    const dialog = await screen.findByRole("dialog", { name: "Choose organization" });
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    await user.tab();
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    await user.pointer({
      keys: "[TouchA]",
      target: screen.getByRole("option", { name: /非常に長い組織名/ }),
    });
    expect(screen.queryByRole("dialog", { name: "Choose organization" })).not.toBeInTheDocument();
    expect(onValueChange).toHaveBeenCalledWith("long");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(trigger).toHaveFocus();
  });

  it("has no axe violations in the named open popover", async () => {
    await expectNoA11yViolations(
      <OrgSwitcher
        organizations={organizations}
        value="dxs"
        labels={labels}
        responsive="popover"
        open
      />,
    );
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
