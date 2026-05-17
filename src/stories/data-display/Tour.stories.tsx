import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Tour } from "../../components/data-display/Tour";
import { Button } from "../../components/general/Button";
import { Flex } from "../../components/layout";

/**
 * data-display/Tour — multi-step walkthrough.
 *
 * Documented props (per `Tour.tsx`):
 *   steps, open, defaultOpen, onOpenChange,
 *   current, defaultCurrent, onCurrentChange,
 *   onFinish, onClose, labels, className
 *
 * Each step: { target?, title, description?, placement? }
 *
 * Stories use the documented APIs only (cardinal rule 25).
 */

const meta: Meta<typeof Tour> = {
  title: "Data Display/Tour",
  component: Tour,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**Tour** — overlay walkthrough that highlights named targets step-by-step.

v1 visual: a semi-transparent mask covers the viewport; a target rect
(if resolvable) is outlined; the popover callout positions near the
target (or page-centred for \`placement="center"\`).

Vocabulary (cardinal rule 23 §B): \`open\` / \`defaultOpen\` /
\`onOpenChange\` (Radix-style); \`current\` / \`defaultCurrent\` /
\`onCurrentChange\`; \`placement\` for callout anchor.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Tour>;

// ─── Default · 3-step onboarding pointing at named buttons ──────

export const Default: Story = {
  name: "Default · 3-step onboarding tour",
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <Flex vertical gap="large">
        <Flex gap="middle">
          <Button id="tour-new-btn" variant="primary">
            新規作成
          </Button>
          <Button id="tour-filter-btn" variant="secondary">
            絞り込み
          </Button>
          <Button id="tour-settings-btn" variant="ghost">
            設定
          </Button>
        </Flex>
        <Button variant="outline" onClick={() => setOpen(true)}>
          ツアー開始
        </Button>
        <Tour
          open={open}
          onOpenChange={setOpen}
          onFinish={() => setOpen(false)}
          steps={[
            {
              target: "#tour-new-btn",
              title: "新規作成ボタン",
              description: "ここから新しいレコードを作成できます。",
              placement: "bottom",
            },
            {
              target: "#tour-filter-btn",
              title: "絞り込み",
              description: "条件を指定して一覧を絞り込みます。",
              placement: "bottom",
            },
            {
              target: "#tour-settings-btn",
              title: "設定",
              description: "個人設定とテーマを変更できます。",
              placement: "bottom",
            },
          ]}
        />
      </Flex>
    );
  },
};

// ─── Center · modal-style intro (no target) ─────────────────────

export const Center: Story = {
  name: "Center · no target, modal-style intro",
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <Flex vertical gap="large">
        <Button variant="primary" onClick={() => setOpen(true)}>
          ウェルカムツアー
        </Button>
        <Tour
          open={open}
          onOpenChange={setOpen}
          onFinish={() => setOpen(false)}
          labels={{ next: "次へ", prev: "戻る", finish: "始める", skip: "スキップ" }}
          steps={[
            {
              title: "ようこそ",
              description:
                "ファミギアへようこそ。まずは簡単な紹介をお見せします。",
              placement: "center",
            },
            {
              title: "ダッシュボード",
              description:
                "重要な指標がひと目で分かるダッシュボードを用意しています。",
              placement: "center",
            },
            {
              title: "準備完了",
              description: "それでは始めましょう。",
              placement: "center",
            },
          ]}
        />
      </Flex>
    );
  },
};

// ─── Controlled · external step control ─────────────────────────

export const Controlled: Story = {
  name: "Controlled · step driven by parent state",
  render: () => {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(0);
    return (
      <Flex vertical gap="large">
        <Flex gap="middle">
          <Button id="ctrl-step-a" variant="primary">
            ステップ A
          </Button>
          <Button id="ctrl-step-b" variant="secondary">
            ステップ B
          </Button>
        </Flex>
        <Flex gap="middle">
          <Button
            variant="outline"
            onClick={() => {
              setStep(0);
              setOpen(true);
            }}
          >
            ツアー開始
          </Button>
          <Button
            variant="ghost"
            disabled={!open || step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            外部: 戻る
          </Button>
          <Button
            variant="ghost"
            disabled={!open || step === 1}
            onClick={() => setStep((s) => Math.min(1, s + 1))}
          >
            外部: 進む
          </Button>
        </Flex>
        <Tour
          open={open}
          onOpenChange={setOpen}
          current={step}
          onCurrentChange={setStep}
          onFinish={() => setOpen(false)}
          steps={[
            {
              target: "#ctrl-step-a",
              title: "ステップ A の説明",
              description: "親コンポーネントが current を制御します。",
              placement: "bottom",
            },
            {
              target: "#ctrl-step-b",
              title: "ステップ B の説明",
              description: "外部ボタンから前後に移動できます。",
              placement: "bottom",
            },
          ]}
        />
      </Flex>
    );
  },
};
