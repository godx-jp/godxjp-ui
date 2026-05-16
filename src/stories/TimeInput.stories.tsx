import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Clock } from "lucide-react";
import { TimeInput } from "../components/primitives/TimeInput";
import { Label } from "../components/primitives/Label";
import { Flex, Space } from "../components/primitives/layout";

const meta: Meta<typeof TimeInput> = {
  title: "Primitives/TimeInput",
  component: TimeInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**TimeInput** — narrow text input for \`HH:mm\` (24-hour) values.

Mirrors the public \`@godxjp/ui@0.2.0\` API so call sites don't change when upgrading.
Visual contract lives in \`.time-input\` in \`tokens.css\`; \`className\` is layout glue
only.

**Validation** — accepts \`HH:mm\`, \`HHmm\`, \`H:mm\`, and \`Hmm\` while typing; on blur
the value is normalised to canonical \`HH:mm\` and \`onChange\` fires with the
normalised string. If the buffer can't parse the input is left as-is and
\`aria-invalid\` is set so the consumer can style the error.

**onChange signature** — \`(time: string) => void\` (the canonical "HH:mm"), **not** a
synthetic React event. Wire it directly to your state setter.

**Accessibility (WCAG 2.1 AA)** — \`inputMode="numeric"\` triggers the numeric keyboard
on mobile; \`autoComplete="off"\` + \`spellCheck={false}\` keep autofill and spell-check
out of the way; \`maxLength={5}\` matches the canonical format. Pair with
\`<Label htmlFor>\`. \`disabled\` propagates as \`aria-disabled\`.
        `.trim(),
      },
    },
  },
  argTypes: {
    value: { control: "text", description: 'Current value in `"HH:mm"`.' },
    placeholder: { control: "text", description: "Defaults to `HH:mm`." },
    disabled: { control: "boolean" },
    id: { control: "text" },
    name: { control: "text" },
    onChange: { action: "change" },
  },
};
export default meta;

type Story = StoryObj<typeof TimeInput>;

function PlaygroundDemo(args: { disabled?: boolean; placeholder?: string }) {
  const [v, setV] = useState("09:00");
  return (
    <Flex vertical gap="small" style={{ maxWidth: 200 }}>
      <Label htmlFor="play-time">時刻</Label>
      <TimeInput id="play-time" value={v} onChange={setV} {...args} />
      <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
        Normalised value: <code>{v}</code>
      </span>
    </Flex>
  );
}

export const Playground: Story = {
  args: { disabled: false, placeholder: "HH:mm" },
  render: (args) => <PlaygroundDemo {...args} />,
};

export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    function Demo() {
      const [v, setV] = useState("09:00");
      return (
        <Flex vertical gap="small" style={{ maxWidth: 200 }}>
          <Label htmlFor="d-time">時刻</Label>
          <TimeInput id="d-time" value={v} onChange={setV} />
          <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
            Value: <code>{v}</code>
          </span>
        </Flex>
      );
    }
    return <Demo />;
  },
};

export const Empty: Story = {
  name: "States — empty (placeholder visible)",
  parameters: { controls: { disable: true } },
  render: () => {
    function Demo() {
      const [v, setV] = useState("");
      return (
        <Flex vertical gap="small" style={{ maxWidth: 200 }}>
          <Label htmlFor="e-time">勤務開始</Label>
          <TimeInput id="e-time" value={v} onChange={setV} placeholder="HH:mm" />
        </Flex>
      );
    }
    return <Demo />;
  },
};

export const Disabled: Story = {
  name: "States — disabled",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 200 }}>
      <Label htmlFor="dis-time">時刻 (locked)</Label>
      <TimeInput id="dis-time" value="09:00" disabled />
    </Flex>
  ),
};

export const InvalidInput: Story = {
  name: "States — invalid (aria-invalid)",
  parameters: { controls: { disable: true } },
  render: () => {
    function Demo() {
      // Seed with an unparseable buffer so aria-invalid surfaces.
      const [v, setV] = useState("99:99");
      return (
        <Flex vertical gap="small" style={{ maxWidth: 240 }}>
          <Label htmlFor="inv-time">時刻</Label>
          <TimeInput id="inv-time" value={v} onChange={setV} />
          <span style={{ fontSize: 12, color: "var(--destructive)" }}>
            Try typing <code>0900</code> or <code>9:00</code> and blur — it normalises.
          </span>
        </Flex>
      );
    }
    return <Demo />;
  },
};

export const ParsingExamples: Story = {
  name: "Behaviour — parsing examples",
  parameters: { controls: { disable: true } },
  render: () => {
    function Row({ label, initial }: { label: string; initial: string }) {
      const [v, setV] = useState(initial);
      return (
        <Flex align="center" gap="middle">
          <span style={{ minWidth: 120, color: "var(--muted-foreground)", fontSize: 12 }}>
            {label}
          </span>
          <TimeInput value={v} onChange={setV} />
          <code style={{ fontSize: 12 }}>→ {v || "(empty)"}</code>
        </Flex>
      );
    }
    return (
      <Flex vertical gap="small">
        <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
          Edit, then blur. Buffer normalises on blur.
        </span>
        <Row label="Canonical" initial="09:00" />
        <Row label="No separator" initial="0900" />
        <Row label="Short hour" initial="9:00" />
        <Row label="Compact" initial="900" />
        <Row label="Empty" initial="" />
      </Flex>
    );
  },
};

export const TimeRange: Story = {
  name: "Composition — start / end range",
  parameters: { controls: { disable: true } },
  render: () => {
    function Demo() {
      const [start, setStart] = useState("09:00");
      const [end, setEnd] = useState("18:00");
      return (
        <Flex vertical gap="small">
          <span style={{ fontWeight: 500 }}>勤務時間</span>
          <Space size="middle" align="center">
            <Flex vertical gap="small">
              <Label htmlFor="r-start">開始</Label>
              <TimeInput id="r-start" value={start} onChange={setStart} />
            </Flex>
            <span style={{ color: "var(--muted-foreground)", paddingTop: 22 }}>—</span>
            <Flex vertical gap="small">
              <Label htmlFor="r-end">終了</Label>
              <TimeInput id="r-end" value={end} onChange={setEnd} />
            </Flex>
          </Space>
          <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
            {start} – {end} (Asia/Tokyo)
          </span>
        </Flex>
      );
    }
    return <Demo />;
  },
};

export const WithIconPrefix: Story = {
  name: "Composition — with leading icon",
  parameters: { controls: { disable: true } },
  render: () => {
    function Demo() {
      const [v, setV] = useState("10:30");
      return (
        <Flex vertical gap="small">
          <Label htmlFor="i-time">会議開始</Label>
          <Space size="middle" align="center">
            <Clock size={16} aria-hidden style={{ color: "var(--muted-foreground)" }} />
            <TimeInput id="i-time" value={v} onChange={setV} />
          </Space>
        </Flex>
      );
    }
    return <Demo />;
  },
};
