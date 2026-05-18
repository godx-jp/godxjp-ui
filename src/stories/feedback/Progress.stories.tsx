import type { Meta, StoryObj } from "@storybook/react";
import { Progress } from "../../components/feedback/Progress";
import { Space } from "../../components/layout";

/**
 * Feedback/Progress — linear or circular progress indicator.
 *
 * Vocabulary (per cardinal rule 23 §B — concept-first):
 *  - `value` / `max` — Radix-style numeric state (matches Tabs/Select).
 *  - `variant`       — `line` (default) or `circle`.
 *  - `color`         — semantic role (`default` / `info` / `success` /
 *                      `warning` / `destructive`).
 *  - `size`          — dimensional scale (`small` / `default` / `large`).
 *  - `showInfo`      — toggle the numeric label.
 *  - `strokeWidth`   — circle stroke thickness (default 6).
 *  - `format`        — custom label renderer `(value, max) => ReactNode`.
 */

const meta: Meta<typeof Progress> = {
  title: "Feedback/Progress",
  component: Progress,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Linear or circular progress indicator. Use line for narrow " +
          "in-page bars and circle for KPI tiles or upload progress.",
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["line", "circle"],
    },
    color: {
      control: { type: "select" },
      options: ["default", "info", "success", "warning", "destructive"],
    },
    size: {
      control: { type: "select" },
      options: ["small", "default", "large"],
    },
    showInfo: { control: { type: "boolean" } },
    value: { control: { type: "number", min: 0, max: 100, step: 1 } },
    max: { control: { type: "number" } },
    strokeWidth: { control: { type: "number", min: 1, max: 20, step: 1 } },
  },
};
export default meta;
type Story = StoryObj<typeof Progress>;

// ─── Line variant ────────────────────────────────────────────────

export const Line_Default: Story = {
  render: () => <Progress value={60} />,
};

export const Line_ColorSweep: Story = {
  render: () => (
    <Space direction="vertical" size="default" style={{ width: 360 }}>
      <Progress value={45} />
      <Progress value={45} color="info" />
      <Progress value={45} color="success" />
      <Progress value={45} color="warning" />
      <Progress value={45} color="destructive" />
    </Space>
  ),
};

export const Line_Sizes: Story = {
  render: () => (
    <Space direction="vertical" size="default" style={{ width: 360 }}>
      <Progress value={60} size="small" />
      <Progress value={60} />
      <Progress value={60} size="large" />
    </Space>
  ),
};

export const Line_NoInfo: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <Progress value={72} showInfo={false} />
    </div>
  ),
};

// ─── Circle variant ──────────────────────────────────────────────

export const Circle_Default: Story = {
  render: () => <Progress variant="circle" value={75} />,
};

export const Circle_ColorSweep: Story = {
  render: () => (
    <Space size="default">
      <Progress variant="circle" value={30} />
      <Progress variant="circle" value={55} color="info" />
      <Progress variant="circle" value={80} color="success" />
      <Progress variant="circle" value={68} color="warning" />
      <Progress variant="circle" value={92} color="destructive" />
    </Space>
  ),
};

export const Circle_Sizes: Story = {
  render: () => (
    <Space size="default" align="center">
      <Progress variant="circle" value={62} size="small" />
      <Progress variant="circle" value={62} />
      <Progress variant="circle" value={62} size="large" />
    </Space>
  ),
};

// ─── Custom format + real-world ──────────────────────────────────

export const Custom_Format: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <Progress
        value={3}
        max={5}
        color="info"
        format={(v, m) => `${v}/${m} ステップ`}
      />
    </div>
  ),
};

export const Real_World: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <Progress
        value={85}
        color="warning"
        format={() => "42.8 / 50 GB"}
        aria-label="ストレージ使用状況"
      />
    </div>
  ),
};
