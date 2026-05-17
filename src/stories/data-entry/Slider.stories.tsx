import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Slider } from "../../components/data-entry/Slider";
import { Flex } from "../../components/layout";

/**
 * data-entry/Slider — range input.
 *
 * Cardinal rules:
 *   §3  — Radix @radix-ui/react-slider.
 *   §23 — `value` / `defaultValue` / `onValueChange`; HTML standards
 *          `min` / `max` / `step`; `range` flag flips single → dual.
 *   §25 — story is documentation; primitive owns the UI.
 */

const meta: Meta<typeof Slider> = {
  title: "Data Entry/Slider",
  component: Slider,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <Slider defaultValue={30} />
    </div>
  ),
};

export const Range: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <Slider range defaultValue={[20, 80]} />
    </div>
  ),
};

export const WithMarks: Story = {
  name: "With marks",
  render: () => (
    <div style={{ width: 360 }}>
      <Slider
        defaultValue={40}
        min={0}
        max={100}
        step={10}
        marks={[
          { value: 0, label: "0%" },
          { value: 25, label: "25%" },
          { value: 50, label: "50%" },
          { value: 75, label: "75%" },
          { value: 100, label: "100%" },
        ]}
      />
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div style={{ height: 200 }}>
      <Slider
        orientation="vertical"
        defaultValue={60}
        marks={[
          { value: 0, label: "低" },
          { value: 50, label: "中" },
          { value: 100, label: "高" },
        ]}
      />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <Slider disabled defaultValue={45} />
    </div>
  ),
};

export const Disabled_Range: Story = {
  name: "Disabled · range",
  render: () => (
    <div style={{ width: 320 }}>
      <Slider disabled range defaultValue={[20, 70]} />
    </div>
  ),
};

function ControlledDemo() {
  const [value, setValue] = useState<number | [number, number]>(35);
  return (
    <Flex vertical gap="small" style={{ width: 320 }}>
      <Slider value={value} onValueChange={setValue} />
      <code className="mono" style={{ fontSize: "var(--text-xs)" }}>
        {JSON.stringify(value)}
      </code>
    </Flex>
  );
}

export const Controlled: Story = {
  render: () => <ControlledDemo />,
};
