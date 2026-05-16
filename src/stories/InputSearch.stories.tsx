import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { InputSearch } from "../components/primitives/InputSearch";
import { Flex } from "../components/primitives/layout";

const meta: Meta<typeof InputSearch> = {
  title: "Primitives/Input — Search",
  component: InputSearch,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**InputSearch** — Input subtype with leading magnifier + optional
trailing X clear button.

Mirrors the canonical search pattern used in
\`design-handoff/.../preview/comp-pageheader.html\` and
\`comp-topbar.html\`. Wraps \`<Input>\` so every base prop pass-through
works (\`size\`, \`status\`, etc.). Sets \`type="search"\` for native
semantics (mobile keyboards, form reset).

When \`allowClear\` (default \`true\`) and the input has a non-empty
value, a trailing X button appears. Click → fires \`onClear()\` if
provided, otherwise synthesizes a \`change\` event with empty value
so consumer state stays in sync.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof InputSearch>;

export const Default: Story = {
  name: "Default — empty",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ width: 320 }}>
      <InputSearch placeholder="従業員を検索" />
    </div>
  ),
};

export const WithClear: Story = {
  name: "Variant — with clear button (non-empty value)",
  parameters: { controls: { disable: true } },
  render: () => {
    const [v, setV] = useState("田中");
    return (
      <div style={{ width: 320 }}>
        <InputSearch
          value={v}
          onChange={(e) => setV(e.target.value)}
          onClear={() => setV("")}
          placeholder="従業員を検索"
        />
      </div>
    );
  },
};

export const Sizes: Story = {
  name: "Sizes — small / default / large",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="middle" style={{ width: 320 }}>
      <InputSearch size="small" placeholder="検索" defaultValue="田中" />
      <InputSearch placeholder="検索" defaultValue="田中" />
      <InputSearch size="large" placeholder="検索" defaultValue="田中" />
    </Flex>
  ),
};

export const Disabled: Story = {
  name: "State — disabled",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ width: 320 }}>
      <InputSearch disabled placeholder="検索 (disabled)" />
    </div>
  ),
};

export const InToolbar: Story = {
  name: "Composition — page-header search slot",
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0 16px",
        height: 48,
        border: "1px solid var(--border)",
        borderRadius: 6,
      }}
    >
      <strong style={{ fontSize: 14 }}>従業員一覧</strong>
      <span style={{ flex: 1 }} />
      <InputSearch
        placeholder="検索…"
        defaultValue="田中"
        style={{ width: 240 }}
      />
    </div>
  ),
};
