import type { Meta, StoryObj } from "@storybook/react";
import { MiniMonth } from "../components/primitives/calendar";
import { ASAGI_ACCENT, TODAY } from "./calendar-fixtures";

const accentDecorator = (Story: React.ComponentType) => (
  <div style={{ width: 240, padding: 12, ["--accent-color" as never]: ASAGI_ACCENT }}>
    <Story />
  </div>
);

const meta: Meta<typeof MiniMonth> = {
  title: "Primitives/Calendar/MiniMonth",
  component: MiniMonth,
  tags: ["autodocs"],
  decorators: [accentDecorator],
};
export default meta;
type Story = StoryObj<typeof MiniMonth>;

export const Default: Story = {
  args: {
    year: 2026,
    month: 5,
    today: TODAY,
    selected: TODAY,
  },
};

export const WithEventDots: Story = {
  args: {
    year: 2026,
    month: 5,
    today: TODAY,
    selected: { y: 2026, m: 5, d: 22 },
    eventDots: {
      "2026-05-06": true,
      "2026-05-08": true,
      "2026-05-13": true,
      "2026-05-19": true,
      "2026-05-20": true,
      "2026-05-21": true,
      "2026-05-22": true,
    },
  },
};

export const DarkTheme: Story = {
  decorators: [
    (Story) => (
      <div data-theme="dark" style={{ background: "var(--background)", padding: 16, borderRadius: 8 }}>
        <Story />
      </div>
    ),
    accentDecorator,
  ],
  args: {
    year: 2026,
    month: 5,
    today: TODAY,
    selected: { y: 2026, m: 5, d: 22 },
  },
};
