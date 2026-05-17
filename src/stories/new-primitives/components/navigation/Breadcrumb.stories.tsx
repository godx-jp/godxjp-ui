import type { Meta, StoryObj } from "@storybook/react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbSep,
} from "../../../../components/primitives/Breadcrumb";

/**
 * Components/Navigation/Breadcrumb — hierarchy path indicator.
 *
 * Compositional API:
 *   <Breadcrumb>
 *     <BreadcrumbItem href="/">famgia</BreadcrumbItem>
 *     <BreadcrumbSep />
 *     <BreadcrumbItem href="/shibuya">渋谷本店</BreadcrumbItem>
 *     <BreadcrumbSep />
 *     <BreadcrumbItem current>田中 美咲</BreadcrumbItem>
 *   </Breadcrumb>
 *
 * Vocabulary (per cardinal rule 23 §B):
 *   - `current: boolean` per item — sets `aria-current="page"`.
 *   - `href` — anchor element; omit for non-link items.
 *   - Compositional separators via `<BreadcrumbSep />` — caller picks
 *     `/`, `›`, `→` etc. (no `separator` prop conflated into the root).
 */

const meta: Meta<typeof Breadcrumb> = {
  title: "new-primitives/Components/Navigation/Breadcrumb",
  component: Breadcrumb,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
  name: "Default · 3 levels",
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem href="/">famgia</BreadcrumbItem>
      <BreadcrumbSep />
      <BreadcrumbItem href="/shibuya">渋谷本店</BreadcrumbItem>
      <BreadcrumbSep />
      <BreadcrumbItem current>田中 美咲</BreadcrumbItem>
    </Breadcrumb>
  ),
};

export const WithSubsections: Story = {
  name: "Deep path · 5 levels",
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem href="/">famgia</BreadcrumbItem>
      <BreadcrumbSep />
      <BreadcrumbItem href="/orgs">組織</BreadcrumbItem>
      <BreadcrumbSep />
      <BreadcrumbItem href="/orgs/betoya">Betoya</BreadcrumbItem>
      <BreadcrumbSep />
      <BreadcrumbItem href="/orgs/betoya/stores">店舗</BreadcrumbItem>
      <BreadcrumbSep />
      <BreadcrumbItem current>渋谷本店</BreadcrumbItem>
    </Breadcrumb>
  ),
};

export const TwoLevels: Story = {
  name: "Shallow · 2 levels",
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem href="/dashboard">ダッシュボード</BreadcrumbItem>
      <BreadcrumbSep />
      <BreadcrumbItem current>勤怠サマリー</BreadcrumbItem>
    </Breadcrumb>
  ),
};
