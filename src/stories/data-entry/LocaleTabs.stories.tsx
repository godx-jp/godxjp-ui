import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { LocaleTabs } from "../../components/data-entry/LocaleTabs";
import { Textarea } from "../../components/data-entry/Input";
import { Flex } from "../../components/layout";

/**
 * data-entry/LocaleTabs — bare locale tab strip with status dots.
 *
 * Documented props (per `LocaleTabs.tsx`):
 *   locales:        LocaleTabItem[]         { code, label?, status? }
 *   value?:         string                  controlled active code
 *   defaultValue?:  string                  uncontrolled initial code
 *   onChange?:      (code: string) => void
 *   baseLocale?:    string                  defaults to locales[0].code
 *   baseLabel?:     ReactNode               default "(基準)"
 *   meta?:          ReactNode               right-side meta string
 *   onAdd?:         () => void              renders "⊕ 追加" button when set
 *   addLabel?:      ReactNode               button copy override
 *
 *   LocaleTabStatus = "translated" | "draft" | "missing"
 *
 * Maps to `.loc-tabs` + `.dot.draft` / `.dot.empty` classes in shell.css.
 */

const meta: Meta<typeof LocaleTabs> = {
  title: "Data Entry/LocaleTabs",
  component: LocaleTabs,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**LocaleTabs** — header-only tab strip per locale, with a coloured
status dot per tab (\`translated\` = green / \`draft\` = amber /
\`missing\` = red). The base locale carries a "(基準)" suffix so
reviewers see the fallback source. Consumers wire the panel below.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof LocaleTabs>;

// ─── Default — ja / en / vi mix of statuses ──────────────────────

function DefaultDemo() {
  const [active, setActive] = useState("ja");
  return (
    <LocaleTabs
      locales={[
        { code: "ja", label: "日本語", status: "translated" },
        { code: "en", label: "English", status: "translated" },
        { code: "vi", label: "Tiếng Việt", status: "draft" },
      ]}
      value={active}
      onChange={setActive}
      meta="3 / 3 編集中"
    />
  );
}

export const Default: Story = {
  name: "Default · ja / en / vi",
  render: () => <DefaultDemo />,
};

// ─── WithAddButton — onAdd handler renders "⊕ 追加" ──────────────

function AddButtonDemo() {
  const [active, setActive] = useState("ja");
  return (
    <LocaleTabs
      locales={[
        { code: "ja", label: "日本語", status: "translated" },
        { code: "en", label: "English", status: "translated" },
        { code: "vi", label: "Tiếng Việt", status: "draft" },
        { code: "zh", label: "简体中文", status: "missing" },
      ]}
      value={active}
      onChange={setActive}
      meta="2 / 4 翻訳済"
      onAdd={() => {
        /* open add-locale picker */
      }}
    />
  );
}

export const WithAddButton: Story = {
  name: "WithAddButton · onAdd handler + meta",
  render: () => <AddButtonDemo />,
};

// ─── WithPanel — header + textarea panel composition ─────────────

function PanelDemo() {
  const [active, setActive] = useState("ja");
  const copy: Record<string, string> = {
    ja: "渋谷本店のシフトを公開しました。",
    en: "Shibuya HQ shift schedule is now published.",
    vi: "",
  };
  return (
    <Flex vertical gap="small" style={{ maxWidth: 480 }}>
      <LocaleTabs
        locales={[
          { code: "ja", label: "日本語", status: "translated" },
          { code: "en", label: "English", status: "translated" },
          { code: "vi", label: "Tiếng Việt", status: "missing" },
        ]}
        value={active}
        onChange={setActive}
        meta="2 / 3 翻訳済"
      />
      <Textarea
        rows={4}
        value={copy[active]}
        placeholder="未翻訳"
        readOnly
      />
    </Flex>
  );
}

export const WithPanel: Story = {
  name: "WithPanel · header + textarea body",
  render: () => <PanelDemo />,
};

// ─── AllStatuses — translated / draft / missing dots ─────────────

export const AllStatuses: Story = {
  name: "AllStatuses · translated / draft / missing dots",
  render: () => (
    <LocaleTabs
      defaultValue="ja"
      locales={[
        { code: "ja", label: "日本語", status: "translated" },
        { code: "en", label: "English", status: "translated" },
        { code: "vi", label: "Tiếng Việt", status: "draft" },
        { code: "zh", label: "简体中文", status: "missing" },
      ]}
      meta="2 / 4 翻訳済"
    />
  ),
};
