import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import {
  Collapse,
  CollapsePanel,
} from "../../components/data-display/Collapse";

/**
 * Data Display/Collapse — accordion panel group.
 *
 * Single or multi-open via `multiple`. State via `value` /
 * `defaultValue` / `onValueChange` (cardinal rule 23 §B).
 * NEVER Ant's `activeKey` / `accordion` / `bordered`.
 */

const meta: Meta<typeof Collapse> = {
  title: "Data Display/Collapse",
  component: Collapse,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof Collapse>;

const FAQ = [
  {
    value: "q1",
    title: "godx-adminとは何ですか？",
    body:
      "godx-adminは、開発者ワークスペース・プロジェクト管理・サンドボックス起動を統合した社内プラットフォームです。",
  },
  {
    value: "q2",
    title: "サンドボックスは何分で起動しますか？",
    body:
      "新規サンドボックス作成は通常1〜2分程度です。clone・Vault secrets配布・MCP登録を含みます。",
  },
  {
    value: "q3",
    title: "@godxjp/uiの採用は必須ですか？",
    body:
      "はい。全てのフロントエンドはCLAUDE.mdの15番ルールに従って@godxjp/uiを採用する必要があります。",
  },
  {
    value: "q4",
    title: "プランはどこに保存されますか？",
    body:
      "プランはクラウド上のgxトラッカーに保存されます。ローカルファイルシステムには保存されません（CLAUDE.md #9）。",
  },
];

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <Collapse defaultValue="q1">
        {FAQ.map((q) => (
          <CollapsePanel key={q.value} value={q.value} title={q.title}>
            <p style={{ margin: 0 }}>{q.body}</p>
          </CollapsePanel>
        ))}
      </Collapse>
    </div>
  ),
  // Regression pin for the "Tailwind .collapse utility hides the whole
  // accordion via inherited `visibility: collapse`" bug. The fix was
  // renaming the root class to `.collapse-root` — if a future refactor
  // reverts to `.collapse`, this `play` fails because the title text
  // is no longer visible.
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("root subtree is actually visible", async () => {
      // q1 is open by default; its title must render visibly. If the
      // Tailwind utility re-shadows `.collapse`, this trigger reads as
      // not-visible (visibility: collapse on the ancestor).
      const trigger = canvas.getByRole("button", { name: /godx-admin/ });
      await expect(trigger).toBeVisible();
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
    });

    await step("clicking another panel opens it (single mode)", async () => {
      const q2 = canvas.getByRole("button", { name: /サンドボックス/ });
      await userEvent.click(q2);
      await expect(q2).toHaveAttribute("aria-expanded", "true");

      // single-mode: q1 closes when q2 opens
      const q1 = canvas.getByRole("button", { name: /godx-admin/ });
      await expect(q1).toHaveAttribute("aria-expanded", "false");
    });
  },
};

export const Multiple: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <Collapse multiple defaultValue={["q1", "q2"]}>
        {FAQ.map((q) => (
          <CollapsePanel key={q.value} value={q.value} title={q.title}>
            <p style={{ margin: 0 }}>{q.body}</p>
          </CollapsePanel>
        ))}
      </Collapse>
    </div>
  ),
};

export const Ghost: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <Collapse variant="ghost" defaultValue="q1">
        {FAQ.map((q) => (
          <CollapsePanel key={q.value} value={q.value} title={q.title}>
            <p style={{ margin: 0 }}>{q.body}</p>
          </CollapsePanel>
        ))}
      </Collapse>
    </div>
  ),
};

export const Outlined: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <Collapse variant="outlined" defaultValue="q1">
        {FAQ.map((q) => (
          <CollapsePanel
            key={q.value}
            value={q.value}
            title={q.title}
            extra={<span>必読</span>}
          >
            <p style={{ margin: 0 }}>{q.body}</p>
          </CollapsePanel>
        ))}
      </Collapse>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <Collapse disabled defaultValue="q1">
        {FAQ.slice(0, 3).map((q) => (
          <CollapsePanel key={q.value} value={q.value} title={q.title}>
            <p style={{ margin: 0 }}>{q.body}</p>
          </CollapsePanel>
        ))}
      </Collapse>
    </div>
  ),
};
