import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ColorSwatchCheckbox } from "../components/primitives/calendar";

const meta: Meta<typeof ColorSwatchCheckbox> = {
  title: "Primitives/Calendar/ColorSwatchCheckbox",
  component: ColorSwatchCheckbox,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof ColorSwatchCheckbox>;

function Wrapper(args: React.ComponentProps<typeof ColorSwatchCheckbox>) {
  const [on, setOn] = useState(args.checked);
  return (
    <div style={{ width: 240 }}>
      <ColorSwatchCheckbox {...args} checked={on} onChange={setOn} />
    </div>
  );
}

export const On: Story = {
  render: (args) => <Wrapper {...args} />,
  args: { color: "#4c6cb3", label: "godx-admin · Product", checked: true },
};

export const Off: Story = {
  render: (args) => <Wrapper {...args} />,
  args: { color: "#eb6101", label: "Hà · cá nhân", checked: false },
};

export const Disabled: Story = {
  render: (args) => <Wrapper {...args} />,
  args: {
    color: "#949495",
    label: "Ngày lễ Nhật Bản",
    checked: true,
    disabled: true,
  },
};

export const ReadonlyMarker: Story = {
  render: (args) => <Wrapper {...args} />,
  args: {
    color: "#949495",
    label: "Ngày lễ Nhật Bản",
    checked: true,
    readonly: true,
  },
};
