import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Menu } from "../../components/navigation/Menu";

/**
 * Navigation/Menu — persistent navigation list with
 * selection state.
 *
 * Distinct from DropdownMenu (Radix overlay action menu): Menu is
 * the always-visible sidebar / topbar navigation surface.
 *
 * Vocabulary (§23.B):
 *   - `orientation` — vertical (default) | horizontal
 *   - `value` / `defaultValue` / `onValueChange` — selection state
 *   - `disabled` per item — interaction state
 *   - `icon` / `extra` slots
 */

const meta: Meta<typeof Menu> = {
  title: "Navigation/Menu",
  component: Menu,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof Menu>;

const HomeIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const UsersIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx={9} cy={7} r={4} />
  </svg>
);
const ChartIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <line x1={18} y1={20} x2={18} y2={10} />
    <line x1={12} y1={20} x2={12} y2={4} />
    <line x1={6} y1={20} x2={6} y2={14} />
  </svg>
);
const SettingsIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <circle cx={12} cy={12} r={3} />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

// ════════════════════════════════════════════════════════════════
// Vertical sidebar (default)
// ════════════════════════════════════════════════════════════════

export const VerticalSidebar: Story = {
  name: "Vertical · sidebar nav",
  render: () => (
    <div style={{ width: 240, border: "1px solid var(--border)", borderRadius: 6 }}>
      <Menu
        defaultValue="dashboard"
        items={[
          { value: "dashboard", label: "ダッシュボード", icon: <HomeIcon /> },
          { value: "employees", label: "従業員", icon: <UsersIcon />, extra: "38" },
          { value: "reports", label: "レポート", icon: <ChartIcon /> },
          { type: "divider" },
          {
            type: "group",
            label: "管理",
            items: [
              { value: "stores", label: "店舗管理" },
              { value: "permissions", label: "権限" },
              { value: "settings", label: "設定", icon: <SettingsIcon /> },
              { value: "legacy", label: "旧バージョン（廃止予定）", disabled: true },
            ],
          },
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("dashboard item is the initial selection", async () => {
      const dashboard = canvas.getByRole("menuitem", { name: /ダッシュボード/ });
      await expect(dashboard).toHaveAttribute("data-state", "selected");
    });

    await step("clicking employees switches the selection", async () => {
      const employees = canvas.getByRole("menuitem", { name: /従業員/ });
      await userEvent.click(employees);
      await waitFor(() => {
        expect(employees).toHaveAttribute("data-state", "selected");
      });
    });
  },
};

// ════════════════════════════════════════════════════════════════
// Horizontal top-nav
// ════════════════════════════════════════════════════════════════

export const HorizontalTopNav: Story = {
  name: "Horizontal · top nav",
  render: () => (
    <Menu
      orientation="horizontal"
      defaultValue="kintai"
      items={[
        { value: "kintai", label: "勤怠" },
        { value: "shifts", label: "シフト" },
        { value: "payroll", label: "給与" },
        { value: "reports", label: "レポート" },
        { value: "legacy", label: "旧画面", disabled: true },
      ]}
    />
  ),
};
