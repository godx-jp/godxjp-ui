import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  CalendarDays,
  LayoutGrid,
  List,
  Moon,
  Rows3,
  Sun,
  SunMoon,
} from "lucide-react";
import { SegmentedControl } from "../components/primitives/SegmentedControl";
import { Flex, Space } from "../components/primitives/layout";

const meta: Meta<typeof SegmentedControl> = {
  title: "Primitives/SegmentedControl",
  component: SegmentedControl,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**SegmentedControl** — single-choice toggle group with no tab panel.

Mirrors the canonical \`.seg\` strip at
\`design-handoff/.../preview/comp-pageheader.html:21-24\` (day / week /
month switch). Use this when you want the visual of a tab strip
without the tab-panel mechanics — calendar view pickers, density
toggles, locale dropdowns, sort-direction toggles.

Two visual variants:
- \`bar\` (default) — connected button row with hairline dividers.
- \`pill\`         — rounded background; active item lifts onto the
                     base background with a soft shadow.

Controlled or uncontrolled. \`aria-checked\` per item exposes the
selected state to assistive tech.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof SegmentedControl>;

export const Default: Story = {
  name: "Default — day / month",
  parameters: { controls: { disable: true } },
  render: () => (
    <SegmentedControl
      items={[
        { value: "day", label: "日" },
        { value: "month", label: "月" },
      ]}
      defaultValue="month"
      aria-label="View granularity"
    />
  ),
};

export const PillActive: Story = {
  name: "Variant — pill (active on background)",
  parameters: { controls: { disable: true } },
  render: () => {
    const [v, set] = useState("month");
    return (
      <SegmentedControl
        variant="pill"
        items={[
          { value: "day", label: "日" },
          { value: "week", label: "週" },
          { value: "month", label: "月" },
          { value: "year", label: "年" },
        ]}
        value={v}
        onChange={set}
        aria-label="View granularity"
      />
    );
  },
};

export const WithIcons: Story = {
  name: "Variant — with leading icons",
  parameters: { controls: { disable: true } },
  render: () => {
    const [layout, setLayout] = useState<"grid" | "list" | "rows">("grid");
    return (
      <SegmentedControl
        items={[
          { value: "grid", label: "Grid", icon: <LayoutGrid size={13} /> },
          { value: "list", label: "List", icon: <List size={13} /> },
          { value: "rows", label: "Rows", icon: <Rows3 size={13} /> },
        ]}
        value={layout}
        onChange={setLayout}
        aria-label="Layout"
      />
    );
  },
};

export const ThemeToggle: Story = {
  name: "Composition — theme toggle (pill)",
  parameters: { controls: { disable: true } },
  render: () => {
    const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
    return (
      <SegmentedControl
        variant="pill"
        size="sm"
        items={[
          { value: "light", label: "Light", icon: <Sun size={12} /> },
          { value: "dark", label: "Dark", icon: <Moon size={12} /> },
          { value: "system", label: "System", icon: <SunMoon size={12} /> },
        ]}
        value={theme}
        onChange={setTheme}
        aria-label="Theme"
      />
    );
  },
};

export const CalendarToolbar: Story = {
  name: "Composition — calendar toolbar",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex align="center" gap="middle">
      <CalendarDays size={14} style={{ color: "var(--muted-foreground)" }} />
      <SegmentedControl
        items={[
          { value: "day", label: "日" },
          { value: "week", label: "週" },
          { value: "month", label: "月" },
        ]}
        defaultValue="month"
      />
    </Flex>
  ),
};

export const Disabled: Story = {
  name: "State — disabled option",
  parameters: { controls: { disable: true } },
  render: () => (
    <Space size="middle">
      <SegmentedControl
        items={[
          { value: "day", label: "日" },
          { value: "week", label: "週" },
          { value: "month", label: "月", disabled: true },
        ]}
        defaultValue="day"
      />
      <SegmentedControl
        variant="pill"
        items={[
          { value: "day", label: "日" },
          { value: "week", label: "週", disabled: true },
          { value: "month", label: "月" },
        ]}
        defaultValue="day"
      />
    </Space>
  ),
};
