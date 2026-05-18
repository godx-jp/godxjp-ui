import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Switch } from "../../components/data-entry/Switch";
import { Flex } from "../../components/layout";
import { Card } from "../../components/data-display/Card";
import { Separator } from "../../components/data-display/Separator";
import { Typography } from "../../components/general/Typography";
import { Button } from "../../components/general/Button";
import { Field } from "../../components/data-entry/Field";

/**
 * data-entry/Switch — boolean toggle.
 *
 * Cardinal rules:
 *   §3  — Radix @radix-ui/react-switch.
 *   §23 — `checked` / `defaultChecked` / `onCheckedChange` per Radix
 *          for a boolean control. `disabled` is the shared axis.
 *   §25 — story is documentation; primitive owns the UI.
 */

const meta: Meta<typeof Switch> = {
  title: "Data Entry/Switch",
  component: Switch,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  render: () => <Switch defaultChecked />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("default-checked starts true", async () => {
      const sw = canvas.getByRole("switch");
      await expect(sw).toHaveAttribute("aria-checked", "true");
    });

    await step("clicking toggles aria-checked", async () => {
      const sw = canvas.getByRole("switch");
      await userEvent.click(sw);
      await waitFor(() => {
        expect(sw).toHaveAttribute("aria-checked", "false");
      });
    });
  },
};

export const Disabled: Story = {
  render: () => (
    <Flex gap="default" align="center">
      <Switch disabled />
      <Switch disabled defaultChecked />
    </Flex>
  ),
};

export const Controlled: Story = {
  render: function Controlled() {
    const [on, setOn] = useState(false);
    return (
      <Flex vertical gap="small" align="start">
        <Switch checked={on} onCheckedChange={setOn} />
        <code className="mono" style={{ fontSize: "var(--text-xs)" }}>
          {on ? "ON" : "OFF"}
        </code>
      </Flex>
    );
  },
};

export const WithLabel: Story = {
  name: "With label",
  render: () => (
    <Flex vertical gap="small" align="start">
      <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <Switch defaultChecked />
        <span>メール通知を受け取る</span>
      </label>
      <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <Switch />
        <span>ダークモード</span>
      </label>
    </Flex>
  ),
};

// ─── FeatureFlags · early access toggles ─────────────────────────

export const FeatureFlags: Story = {
  name: "Feature flags · early access toggles",
  parameters: { layout: "padded" },
  render: () => (
    <Card
      title="アーリーアクセス機能"
      subtitle="ベータ機能を有効にすると、リリース前の機能を試せます。"
      style={{ maxWidth: 560 }}
    >
      <Flex vertical gap="default">
        {[
          { name: "AI 自動要約", help: "コメントスレッドを自動で要約します", on: true },
          { name: "コマンドパレット", help: "⌘K で全機能にジャンプできます", on: true },
          { name: "デスクトップ通知", help: "ブラウザを開いていなくても通知を受信", on: false },
          { name: "リッチテキストエディタ v2", help: "新しい Markdown エディタを試す", on: false },
        ].map((flag) => (
          <Flex key={flag.name} align="center" justify="space-between" gap="default">
            <Flex vertical gap="small">
              <Typography.Text strong>{flag.name}</Typography.Text>
              <Typography.Text color="secondary" style={{ fontSize: "var(--text-xs)" }}>
                {flag.help}
              </Typography.Text>
            </Flex>
            <Switch defaultChecked={flag.on} />
          </Flex>
        ))}
      </Flex>
    </Card>
  ),
};

// ─── NotificationCenter · per-channel toggles ────────────────────

export const NotificationCenter: Story = {
  name: "Notification center · multi-channel preferences",
  parameters: { layout: "padded" },
  render: () => (
    <Card
      title="通知設定"
      subtitle="チャンネルごとに通知の有無を設定できます。"
      style={{ maxWidth: 640 }}
    >
      <Flex vertical gap="default">
        <Typography.Title size={5}>メール</Typography.Title>
        {[
          ["週次ダイジェスト", true],
          ["メンション通知", true],
          ["新着コメント", false],
        ].map(([label, on]) => (
          <Flex key={label as string} align="center" justify="space-between">
            <Typography.Text>{label}</Typography.Text>
            <Switch defaultChecked={on as boolean} />
          </Flex>
        ))}

        <Separator />
        <Typography.Title size={5}>SMS</Typography.Title>
        {[
          ["緊急アラート", true],
          ["2 段階認証コード", true],
          ["マーケティング", false],
        ].map(([label, on]) => (
          <Flex key={label as string} align="center" justify="space-between">
            <Typography.Text>{label}</Typography.Text>
            <Switch defaultChecked={on as boolean} />
          </Flex>
        ))}

        <Separator />
        <Typography.Title size={5}>プッシュ通知</Typography.Title>
        {[
          ["デスクトップ", true],
          ["モバイル", true],
        ].map(([label, on]) => (
          <Flex key={label as string} align="center" justify="space-between">
            <Typography.Text>{label}</Typography.Text>
            <Switch defaultChecked={on as boolean} />
          </Flex>
        ))}

        <Separator />
        <Flex gap="small" justify="end">
          <Button variant="ghost" type="button">既定値に戻す</Button>
          <Button variant="primary">設定を保存</Button>
        </Flex>
      </Flex>
    </Card>
  ),
};

// ─── AccessibilitySettings · a11y toggles ────────────────────────

export const AccessibilitySettings: Story = {
  name: "Accessibility settings",
  parameters: { layout: "padded" },
  render: () => (
    <Card
      title="アクセシビリティ"
      subtitle="表示と操作を環境に合わせて調整できます。"
      style={{ maxWidth: 560 }}
    >
      <Flex vertical gap="default">
        {[
          {
            name: "ハイコントラスト表示",
            help: "テキストとボタンのコントラストを強調します",
          },
          {
            name: "アニメーション低減",
            help: "ヒラヒラとした遷移を無効化します (prefers-reduced-motion)",
          },
          {
            name: "大きな文字",
            help: "全体の文字サイズを 18px ベースに拡大します",
          },
          {
            name: "キーボード操作のヒント表示",
            help: "ボタンに対応するショートカットをホバー時に表示",
          },
          {
            name: "スクリーンリーダー最適化",
            help: "装飾要素の aria-hidden を強制します",
          },
        ].map((item, idx) => (
          <Flex key={item.name} align="center" justify="space-between" gap="default">
            <Flex vertical gap="small">
              <Typography.Text strong>{item.name}</Typography.Text>
              <Typography.Text color="secondary" style={{ fontSize: "var(--text-xs)" }}>
                {item.help}
              </Typography.Text>
            </Flex>
            <Switch defaultChecked={idx === 1} />
          </Flex>
        ))}
      </Flex>
    </Card>
  ),
};

// ─── SecurityToggles · 2FA + session settings ────────────────────

export const SecurityToggles: Story = {
  name: "Security · 2FA + session policy",
  parameters: { layout: "padded" },
  render: () => (
    <Card
      title="セキュリティ設定"
      subtitle="アカウントの保護レベルを管理します。"
      style={{ maxWidth: 560 }}
    >
      <Flex vertical gap="default">
        <Field label="2 段階認証" help="ログイン時に SMS で送信される 6 桁コードを要求します">
          <Switch defaultChecked />
        </Field>
        <Field
          label="不審なログイン通知"
          help="未登録の端末からログインがあった際にメールで通知します"
        >
          <Switch defaultChecked />
        </Field>
        <Field
          label="セッション自動ログアウト"
          help="30 分操作がない場合に自動的にログアウトします"
        >
          <Switch />
        </Field>
        <Field
          label="API キーの IP 制限"
          help="登録された IP アドレスからのみ API アクセスを許可"
          tone="warn"
        >
          <Switch />
        </Field>

        <Separator />
        <Flex gap="small" justify="end">
          <Button variant="ghost" type="button">キャンセル</Button>
          <Button variant="primary">設定を保存</Button>
        </Flex>
      </Flex>
    </Card>
  ),
};
