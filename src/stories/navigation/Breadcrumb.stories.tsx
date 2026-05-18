import type { Meta, StoryObj } from "@storybook/react";
import { Breadcrumb } from "../../components/navigation/Breadcrumb";

/**
 * Navigation/Breadcrumb — hierarchy path indicator.
 *
 * Vocabulary (per cardinal rule 23 §B):
 *   - `current: boolean` per item — sets `aria-current="page"`.
 *   - `href` — anchor element; omit for non-link items.
 *   - `separator` — root-level visual separator.
 */

const meta: Meta<typeof Breadcrumb> = {
  title: "Navigation/Breadcrumb",
  component: Breadcrumb,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
  name: "Default · 3 levels",
  render: () => (
    <Breadcrumb
      items={[
        { href: "/", label: "famgia" },
        { href: "/shibuya", label: "渋谷本店" },
        { current: true, label: "田中 美咲" },
      ]}
    />
  ),
};

export const WithSubsections: Story = {
  name: "Deep path · 5 levels",
  render: () => (
    <Breadcrumb
      items={[
        { href: "/", label: "famgia" },
        { href: "/orgs", label: "組織" },
        { href: "/orgs/betoya", label: "Betoya" },
        { href: "/orgs/betoya/stores", label: "店舗" },
        { current: true, label: "渋谷本店" },
      ]}
    />
  ),
};

export const TwoLevels: Story = {
  name: "Shallow · 2 levels",
  render: () => (
    <Breadcrumb
      items={[
        { href: "/dashboard", label: "ダッシュボード" },
        { current: true, label: "勤怠サマリー" },
      ]}
    />
  ),
};
