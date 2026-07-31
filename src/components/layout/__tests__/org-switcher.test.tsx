import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";

import { expectNoA11yViolations } from "@/test/a11y";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";
import { Badge } from "../../data-display/badge";
import { OrgSwitcher } from "../org-switcher";

const organizations = [
  { id: "dxs", name: "DXS Holdings", meta: "Owner" },
  { id: "long", name: "非常に長い組織名株式会社プラットフォーム", meta: "Member" },
] as const;

const badgedOrganizations = [
  {
    id: "dxs",
    name: "DXS Holdings",
    meta: "Owner",
    badge: <Badge variant="secondary">Trial</Badge>,
    badgeLabel: "Trial plan",
  },
  { id: "long", name: "非常に長い組織名株式会社プラットフォーム", meta: "Member" },
] as const;

/**
 * The popover↔sheet switch now reads the shared `--sheet-responsive-breakpoint-width` token via
 * `useSheetResponsiveMode`, so the acceptance viewports are expressed through `matchMedia`.
 */
function setViewport(width: number) {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn((query: string) => {
      const max = /\(max-width:\s*(\d+(?:\.\d+)?)px\)/.exec(query);
      return {
        matches: max != null && width <= Number(max[1]),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as unknown as MediaQueryList;
    }),
  });
}

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

describe("OrgSwitcher badge slot (gh#213)", () => {
  it("renders the badge on the expanded trigger and announces it as a description", () => {
    renderWithUi(<OrgSwitcher organizations={badgedOrganizations} value="dxs" labels={labels} />);

    const trigger = screen.getByRole("button", { name: "Current organization: DXS Holdings" });
    const badge = trigger.querySelector('[data-slot="org-switcher-badge"]');
    expect(badge).toHaveTextContent("Trial");
    // The visual badge is presentational; the localized `badgeLabel` carries the meaning (WCAG 1.1.1).
    expect(badge).toHaveAttribute("aria-hidden", "true");
    expect(trigger).toHaveAccessibleDescription("Trial plan");
  });

  it("hides the badge in the collapsed rail, which only has room for the mark", () => {
    renderWithUi(
      <OrgSwitcher organizations={badgedOrganizations} value="dxs" labels={labels} collapsed />,
    );

    const trigger = screen.getByRole("button", { name: /Current organization/ });
    expect(trigger.querySelector('[data-slot="org-switcher-badge"]')).toBeNull();
    expect(trigger).not.toHaveAccessibleDescription();
  });

  it("renders the badge in the menu row, announces it once, and keeps it searchable", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <OrgSwitcher
        organizations={badgedOrganizations}
        value="dxs"
        labels={labels}
        responsive="popover"
        open
      />,
    );

    const option = await screen.findByRole("option", { name: /DXS Holdings/ });
    expect(option.querySelector('[data-slot="org-switcher-badge"]')).toHaveTextContent("Trial");
    expect(option).toHaveAccessibleName(expect.stringContaining("Trial plan") as unknown as string);

    await user.type(screen.getByLabelText("Search organizations"), "Trial plan");
    await waitFor(() => {
      expect(screen.getAllByRole("option")).toHaveLength(1);
    });
    expect(screen.getByRole("option", { name: /DXS Holdings/ })).toBeInTheDocument();

    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });

  it("has no axe violations with a badged trigger", async () => {
    await expectNoA11yViolations(
      <OrgSwitcher organizations={badgedOrganizations} value="dxs" labels={labels} />,
    );
  });
});

describe("OrgSwitcher responsive contract shares the Sheet breakpoint token (gh#215)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    [1440, false],
    [1024, false],
    [390, true],
  ])("resolves popover/sheet from the shared token at %ipx", async (width, expectSheet) => {
    setViewport(width);
    const user = userEvent.setup();
    renderWithUi(<OrgSwitcher organizations={organizations} value="dxs" labels={labels} />);

    await user.click(screen.getByRole("button", { name: /Current organization/ }));
    const dialog = await screen.findByRole("dialog", { name: "Choose organization" });

    await waitFor(() => {
      expect(dialog.getAttribute("data-slot") === "sheet-content").toBe(expectSheet);
    });
    // Whichever surface won, focus is trapped and Escape restores it — Radix, not a page handler.
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Choose organization" })).not.toBeInTheDocument();
    });
  });

  it("asks matchMedia for the tokenized query rather than a hard-coded 390px literal", () => {
    setViewport(1440);
    renderWithUi(<OrgSwitcher organizations={organizations} value="dxs" labels={labels} />);

    const queries = vi.mocked(window.matchMedia).mock.calls.map(([query]) => query);
    expect(queries).toContain("(max-width: 768px)");
    expect(queries).not.toContain("(max-width: 390px)");
  });
});
