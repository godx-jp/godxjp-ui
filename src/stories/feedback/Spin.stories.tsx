import type { Meta, StoryObj } from "@storybook/react";
import { Spinner } from "../../components/feedback/Spinner";
import { Button } from "../../components/general/Button";
import { Space } from "../../components/layout";

/**
 * Feedback/Spin — small inline circular loading indicator
 * (aliases the Spinner primitive).
 *
 * Vocabulary (per cardinal rule 23 §B — concept-first):
 *  - `size` — `sm` / `md` / `lg` (10 / 12 / 16 px).
 *  - `tone` — semantic role for the rotating arc: `info` / `muted` /
 *    `primary` / `success` / `warning` / `destructive`.
 */

const meta: Meta<typeof Spinner> = {
  title: "Feedback/Spin",
  component: Spinner,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Inline loading indicator. Use inside Button / Input suffix / " +
          "help text. For full-region loading, prefer Skeleton.",
      },
    },
  },
  argTypes: {
    size: { control: { type: "select" }, options: ["sm", "md", "lg"] },
    tone: {
      control: { type: "select" },
      options: ["info", "muted", "primary", "success", "warning", "destructive"],
    },
  },
};
export default meta;
type Story = StoryObj<typeof Spinner>;

export const Sizes: Story = {
  name: "Sizes — sm / md / lg",
  render: () => (
    <Space size="large" align="center">
      <Spinner size="sm" aria-label="読み込み中 (sm)" />
      <Spinner size="md" aria-label="読み込み中 (md)" />
      <Spinner size="lg" aria-label="読み込み中 (lg)" />
    </Space>
  ),
};

export const Tones: Story = {
  name: "Tones — info / muted / primary / success / warning / destructive",
  render: () => (
    <Space size="large" align="center" wrap>
      <Spinner tone="info" aria-label="info" />
      <Spinner tone="muted" aria-label="muted" />
      <Spinner tone="primary" aria-label="primary" />
      <Spinner tone="success" aria-label="success" />
      <Spinner tone="warning" aria-label="warning" />
      <Spinner tone="destructive" aria-label="destructive" />
    </Space>
  ),
};

export const Embedded_In_Button: Story = {
  name: "Embedded in Button — loading state",
  render: () => (
    <Space size="default" align="center">
      <Button variant="primary" disabled>
        <Spinner size="sm" aria-label="保存中" />
        保存中…
      </Button>
      <Button variant="secondary" disabled>
        <Spinner size="sm" tone="muted" aria-label="同期中" />
        同期中…
      </Button>
    </Space>
  ),
};
