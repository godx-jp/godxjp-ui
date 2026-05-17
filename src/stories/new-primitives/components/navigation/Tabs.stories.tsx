import type { Meta, StoryObj } from "@storybook/react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../../../components/navigation/Tabs";
import { Typography } from "../../../../components/general/Typography";

const { Paragraph } = Typography;

/**
 * Components/Navigation/Tabs — Radix-backed segmented view switcher.
 *
 * Vocabulary (§23.B):
 *   - `variant` — "line" (default) | "pills"
 *   - `placement` — "top" (default) | "right" | "bottom" | "left"
 *     (drives flex direction of root; vertical tabs auto-set Radix
 *     orientation)
 *   - `value` / `defaultValue` / `onValueChange` — Radix selection
 */

const meta: Meta<typeof Tabs> = {
  title: "new-primitives/Components/Navigation/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof Tabs>;

const Body = ({ label }: { label: string }) => (
  <div style={{ padding: "var(--spacing-3) 0" }}>
    <Paragraph>
      <strong>{label}</strong> パネルのコンテンツ。タブの選択状態に応じて差し替えられます。
    </Paragraph>
    <Paragraph color="secondary">
      Radix がキーボードナビゲーション + ARIA を提供します。
    </Paragraph>
  </div>
);

// ════════════════════════════════════════════════════════════════
// Variant · line (default)
// ════════════════════════════════════════════════════════════════

export const Line: Story = {
  name: "Variant · line",
  render: () => (
    <Tabs defaultValue="open">
      <TabsList>
        <TabsTrigger value="open">未対応 (12)</TabsTrigger>
        <TabsTrigger value="processing">進行中 (5)</TabsTrigger>
        <TabsTrigger value="closed">完了 (108)</TabsTrigger>
      </TabsList>
      <TabsContent value="open"><Body label="未対応" /></TabsContent>
      <TabsContent value="processing"><Body label="進行中" /></TabsContent>
      <TabsContent value="closed"><Body label="完了" /></TabsContent>
    </Tabs>
  ),
};

// ════════════════════════════════════════════════════════════════
// Variant · pills (segmented control style)
// ════════════════════════════════════════════════════════════════

export const Pills: Story = {
  name: "Variant · pills",
  render: () => (
    <Tabs defaultValue="day" variant="pills">
      <TabsList>
        <TabsTrigger value="day">日</TabsTrigger>
        <TabsTrigger value="week">週</TabsTrigger>
        <TabsTrigger value="month">月</TabsTrigger>
        <TabsTrigger value="year">年</TabsTrigger>
      </TabsList>
      <TabsContent value="day"><Body label="日次" /></TabsContent>
      <TabsContent value="week"><Body label="週次" /></TabsContent>
      <TabsContent value="month"><Body label="月次" /></TabsContent>
      <TabsContent value="year"><Body label="年次" /></TabsContent>
    </Tabs>
  ),
};

// ════════════════════════════════════════════════════════════════
// Placement · left (vertical tabs)
// ════════════════════════════════════════════════════════════════

export const PlacementLeft: Story = {
  name: "Placement · left",
  render: () => (
    <div style={{ minHeight: 300 }}>
      <Tabs defaultValue="profile" placement="left">
        <TabsList>
          <TabsTrigger value="profile">プロフィール</TabsTrigger>
          <TabsTrigger value="security">セキュリティ</TabsTrigger>
          <TabsTrigger value="notifications">通知</TabsTrigger>
          <TabsTrigger value="billing">支払い</TabsTrigger>
        </TabsList>
        <TabsContent value="profile"><Body label="プロフィール" /></TabsContent>
        <TabsContent value="security"><Body label="セキュリティ" /></TabsContent>
        <TabsContent value="notifications"><Body label="通知" /></TabsContent>
        <TabsContent value="billing"><Body label="支払い" /></TabsContent>
      </Tabs>
    </div>
  ),
};

// ════════════════════════════════════════════════════════════════
// Placement · right (vertical tabs, right-aligned)
// ════════════════════════════════════════════════════════════════

export const PlacementRight: Story = {
  name: "Placement · right",
  render: () => (
    <div style={{ minHeight: 300 }}>
      <Tabs defaultValue="overview" placement="right">
        <TabsList>
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="activity">アクティビティ</TabsTrigger>
          <TabsTrigger value="settings">設定</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><Body label="概要" /></TabsContent>
        <TabsContent value="activity"><Body label="アクティビティ" /></TabsContent>
        <TabsContent value="settings"><Body label="設定" /></TabsContent>
      </Tabs>
    </div>
  ),
};

// ════════════════════════════════════════════════════════════════
// Placement · bottom
// ════════════════════════════════════════════════════════════════

export const PlacementBottom: Story = {
  name: "Placement · bottom",
  render: () => (
    <Tabs defaultValue="kintai" placement="bottom">
      <TabsList>
        <TabsTrigger value="kintai">勤怠</TabsTrigger>
        <TabsTrigger value="shifts">シフト</TabsTrigger>
        <TabsTrigger value="payroll">給与</TabsTrigger>
      </TabsList>
      <TabsContent value="kintai"><Body label="勤怠" /></TabsContent>
      <TabsContent value="shifts"><Body label="シフト" /></TabsContent>
      <TabsContent value="payroll"><Body label="給与" /></TabsContent>
    </Tabs>
  ),
};
