// gh#257 (DXS platform#311) — the three canonical RBAC composites are PUBLIC, importable
// exports with a shared lifecycle-state contract. This file pins:
//   1. the declaration/export contract (the gh#251 lesson: a docs page is not importable);
//   2. the DataTable #216 state vocabulary on each (loading → denied → error → empty → content);
//   3. read-only vs editable semantics, and the destructive-confirmation gate;
//   4. basic keyboard operation (Space toggles a grant, Enter selects a role, radios switch scope).
// Default test locale is vi (renderWithUi), so built-in strings assert the vi catalog.
import { describe, expect, it, vi } from "vitest";

import { renderWithUi, screen, userEvent, within } from "@/test/render";
import { PermissionMatrix } from "../data-display/permission-matrix";
import { BranchScopePicker } from "../data-entry/branch-scope-picker";
import { ServiceRolePanel } from "../layout/service-role-panel";
import { grantKey } from "../../lib/permission-grid";

const ROLES = [
  { id: "admin", name: "管理者", locked: true },
  { id: "editor", name: "編集者" },
  { id: "viewer", name: "閲覧者" },
];
const PERMISSIONS = [
  { id: "billing.view", name: "請求書の閲覧", group: "請求" },
  { id: "billing.edit", name: "請求書の編集", group: "請求" },
];
const GRANTS: ReadonlySet<string> = new Set([
  grantKey("admin", "billing.view"),
  grantKey("admin", "billing.edit"),
  grantKey("editor", "billing.view"),
]);

const BRANCHES = [
  { id: "b-1", name: "東京本社" },
  { id: "b-2", name: "大阪支店" },
  { id: "b-3", name: "Chi nhánh Hà Nội" },
];

const SERVICE_ROLES = [
  { id: "owner", name: "オーナー", locked: true, memberCount: 1 },
  { id: "operator", name: "オペレーター", memberCount: 12 },
];

describe("public export contract (gh#257)", () => {
  it("exports all three composites as named, renderable components", () => {
    expect(typeof PermissionMatrix).toBe("object"); // forwardRef exotic component
    expect(typeof BranchScopePicker).toBe("object");
    expect(typeof ServiceRolePanel).toBe("object");
    expect(PermissionMatrix.displayName).toBe("PermissionMatrix");
    expect(BranchScopePicker.displayName).toBe("BranchScopePicker");
    expect(ServiceRolePanel.displayName).toBe("ServiceRolePanel");
  });

  it("exposes them from the group barrels (the packed-consumer import path)", async () => {
    const dataDisplay = await import("../data-display");
    const dataEntry = await import("../data-entry");
    const layout = await import("../layout");
    expect(dataDisplay.PermissionMatrix).toBe(PermissionMatrix);
    expect(dataEntry.BranchScopePicker).toBe(BranchScopePicker);
    expect(layout.ServiceRolePanel).toBe(ServiceRolePanel);
  });
});

describe("PermissionMatrix", () => {
  it("renders the read-only ✓/— grid by default, with sr-only state text (never colour-only)", () => {
    renderWithUi(<PermissionMatrix roles={ROLES} permissions={PERMISSIONS} grants={GRANTS} />);

    const table = screen.getByRole("table", { name: "Ma trận vai trò và quyền" });
    // 3 grants → 3 "Được phép", (3 roles × 2 permissions − 3) → 3 "Không được phép".
    expect(within(table).getAllByText("Được phép")).toHaveLength(3);
    expect(within(table).getAllByText("Không được phép")).toHaveLength(3);
    // Read-only: no checkbox cells.
    expect(within(table).queryAllByRole("checkbox")).toHaveLength(0);
  });

  it("becomes editable with onGrantChange — Space toggles a grant — but locked roles stay read-only", async () => {
    const onGrantChange = vi.fn();
    renderWithUi(
      <PermissionMatrix
        roles={ROLES}
        permissions={PERMISSIONS}
        grants={GRANTS}
        onGrantChange={onGrantChange}
      />,
    );

    // Editable cells exist for editor+viewer (2 roles × 2 permissions); admin is locked.
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(4);

    // Keyboard: tab to the first checkbox and toggle with Space.
    const target = screen.getByRole("checkbox", { name: "Cấp 請求書の閲覧 cho 編集者" });
    target.focus();
    await userEvent.keyboard(" ");
    expect(onGrantChange).toHaveBeenCalledWith("editor", "billing.view", false);

    // The locked role renders no checkbox at all.
    expect(screen.queryByRole("checkbox", { name: /管理者/ })).toBeNull();
  });

  it("readOnly wins over onGrantChange", () => {
    renderWithUi(
      <PermissionMatrix
        roles={ROLES}
        permissions={PERMISSIONS}
        grants={GRANTS}
        onGrantChange={vi.fn()}
        readOnly
      />,
    );
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
  });

  it("honours the lifecycle precedence loading → denied → error → empty", () => {
    const { rerender } = renderWithUi(
      <PermissionMatrix roles={ROLES} permissions={[]} grants={GRANTS} loading denied error />,
    );
    expect(screen.getByRole("status")).toBeInTheDocument(); // loading wins

    rerender(<PermissionMatrix roles={ROLES} permissions={[]} grants={GRANTS} denied error />);
    expect(screen.getByText("Bạn không có quyền xem ma trận này")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).toBeNull(); // denied wins over error

    rerender(<PermissionMatrix roles={ROLES} permissions={[]} grants={GRANTS} error />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Không tải được ma trận quyền")).toBeInTheDocument();

    rerender(<PermissionMatrix roles={ROLES} permissions={[]} grants={GRANTS} />);
    expect(screen.getByText("Chưa có quyền nào để hiển thị")).toBeInTheDocument();
  });

  it("offers Retry only when onRetry is supplied, and calls it", async () => {
    const onRetry = vi.fn();
    renderWithUi(
      <PermissionMatrix roles={ROLES} permissions={[]} grants={GRANTS} error onRetry={onRetry} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("diffOnly keeps only the rows the compared roles disagree on", () => {
    renderWithUi(
      <PermissionMatrix
        roles={ROLES}
        permissions={PERMISSIONS}
        grants={GRANTS}
        compare={["editor", "viewer"]}
        diffOnly
      />,
    );
    // editor/viewer differ only on billing.view.
    expect(screen.getByText("請求書の閲覧")).toBeInTheDocument();
    expect(screen.queryByText("請求書の編集")).toBeNull();
    expect(screen.getAllByText("Khác biệt").length).toBeGreaterThan(0);
  });

  it("accepts the pair-array grants form via the same grantKey encoding", () => {
    renderWithUi(
      <PermissionMatrix
        roles={[{ id: "editor", name: "編集者" }]}
        permissions={[{ id: "billing.view", name: "請求書の閲覧" }]}
        grants={[{ roleId: "editor", permissionId: "billing.view" }]}
      />,
    );
    expect(screen.getByText("Được phép")).toBeInTheDocument();
  });
});

describe("BranchScopePicker", () => {
  it("switches scope by keyboard/radio and preserves branchIds across mode flips", async () => {
    const onValueChange = vi.fn();
    renderWithUi(
      <BranchScopePicker
        branches={BRANCHES}
        defaultValue={{ mode: "selected", branchIds: ["b-1"] }}
        onValueChange={onValueChange}
      />,
    );

    // The subset list is visible with its checkboxes; b-1 is checked.
    const checked = screen.getByRole("checkbox", { name: "東京本社" });
    expect(checked).toHaveAttribute("data-state", "checked");

    // Check another branch.
    await userEvent.click(screen.getByRole("checkbox", { name: "大阪支店" }));
    expect(onValueChange).toHaveBeenLastCalledWith({
      mode: "selected",
      branchIds: ["b-1", "b-2"],
    });

    // Flip to "all": branchIds survive in the emitted value.
    await userEvent.click(screen.getByRole("radio", { name: "Tất cả chi nhánh" }));
    const last = onValueChange.mock.calls.at(-1)?.[0];
    expect(last.mode).toBe("all");
    expect(last.branchIds).toEqual(["b-1", "b-2"]);
  });

  it("filters branches through the built-in search", async () => {
    renderWithUi(
      <BranchScopePicker branches={BRANCHES} defaultValue={{ mode: "selected", branchIds: [] }} />,
    );
    await userEvent.type(screen.getByRole("searchbox"), "Hà Nội");
    expect(screen.getByRole("checkbox", { name: "Chi nhánh Hà Nội" })).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: "東京本社" })).toBeNull();
  });

  it("renders the validation error wired via aria-errormessage/aria-invalid", () => {
    renderWithUi(
      <BranchScopePicker branches={BRANCHES} error="Vui lòng chọn ít nhất một chi nhánh" />,
    );
    const group = screen.getByRole("radiogroup");
    expect(group).toHaveAttribute("aria-invalid", "true");
    const message = screen.getByText("Vui lòng chọn ít nhất một chi nhánh");
    expect(group.getAttribute("aria-errormessage")).toBe(message.id);
  });

  it("readOnly renders a static summary with no editable control", () => {
    renderWithUi(
      <BranchScopePicker
        branches={BRANCHES}
        value={{ mode: "selected", branchIds: ["b-1", "b-3"] }}
        readOnly
      />,
    );
    expect(screen.queryByRole("radio")).toBeNull();
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.getByText("東京本社")).toBeInTheDocument();
    expect(screen.getByText("Chi nhánh Hà Nội")).toBeInTheDocument();
  });

  it("honours the collection lifecycle loading → denied → listError → empty", () => {
    const { rerender } = renderWithUi(<BranchScopePicker branches={[]} loading denied listError />);
    expect(screen.getByRole("status")).toBeInTheDocument();

    rerender(<BranchScopePicker branches={[]} denied listError />);
    expect(screen.getByText("Bạn không có quyền xem chi nhánh")).toBeInTheDocument();

    rerender(<BranchScopePicker branches={[]} listError />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Không tải được danh sách chi nhánh")).toBeInTheDocument();

    rerender(<BranchScopePicker branches={[]} />);
    expect(screen.getByText("Chưa có chi nhánh để chọn")).toBeInTheDocument();
  });
});

describe("ServiceRolePanel", () => {
  it("selects a role with the keyboard and renders the detail through the render function", async () => {
    const onValueChange = vi.fn();
    renderWithUi(
      <ServiceRolePanel roles={SERVICE_ROLES} onValueChange={onValueChange}>
        {(role) => <p>detail: {role?.name}</p>}
      </ServiceRolePanel>,
    );

    // Uncontrolled default = first role.
    expect(screen.getByText("detail: オーナー")).toBeInTheDocument();

    const operator = screen.getByRole("button", { name: /オペレーター/ });
    operator.focus();
    await userEvent.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("operator");
    expect(screen.getByText("detail: オペレーター")).toBeInTheDocument();
    expect(operator).toHaveAttribute("aria-current", "true");
  });

  it("gates deletion behind the destructive AlertDialog and never offers it on locked roles", async () => {
    const onDeleteRole = vi.fn();
    renderWithUi(<ServiceRolePanel roles={SERVICE_ROLES} onDeleteRole={onDeleteRole} />);

    // Locked owner: no delete affordance. Operator: one delete button.
    expect(screen.queryByRole("button", { name: "Xóa オーナー" })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Xóa オペレーター" }));

    // Nothing fires until the dialog is CONFIRMED.
    expect(onDeleteRole).not.toHaveBeenCalled();
    const dialog = await screen.findByRole("alertdialog");
    expect(within(dialog).getByText("Xóa vai trò này?")).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Xóa vai trò" }));
    expect(onDeleteRole).toHaveBeenCalledWith("operator");
  });

  it("readOnly hides the delete affordance even with onDeleteRole present", () => {
    renderWithUi(<ServiceRolePanel roles={SERVICE_ROLES} onDeleteRole={vi.fn()} readOnly />);
    expect(screen.queryByRole("button", { name: /Xóa/ })).toBeNull();
  });

  it("honours the lifecycle precedence loading → denied → error → empty", () => {
    const { rerender } = renderWithUi(<ServiceRolePanel roles={[]} loading denied error />);
    expect(screen.getByRole("status")).toBeInTheDocument();

    rerender(<ServiceRolePanel roles={[]} denied error />);
    expect(screen.getByText("Bạn không có quyền xem vai trò")).toBeInTheDocument();

    rerender(<ServiceRolePanel roles={[]} error />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Không tải được vai trò")).toBeInTheDocument();

    rerender(<ServiceRolePanel roles={[]} />);
    expect(screen.getByText("Chưa có vai trò")).toBeInTheDocument();
  });

  it("names both MasterDetail regions with localized defaults", () => {
    renderWithUi(<ServiceRolePanel roles={SERVICE_ROLES}>chi tiết</ServiceRolePanel>);
    expect(screen.getByRole("region", { name: "Danh sách vai trò" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Chi tiết vai trò" })).toBeInTheDocument();
  });
});
