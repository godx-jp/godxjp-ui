import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { LocaleTabs } from "../components/primitives/LocaleTabs";
import { Field } from "../components/primitives/Field";
import { Input } from "../components/primitives/Input";
import { Flex } from "../components/primitives/layout";

const meta: Meta<typeof LocaleTabs> = {
  title: "Primitives/LocaleTabs",
  component: LocaleTabs,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**LocaleTabs** — bare tab strip with status dots per locale.

Mirrors the canonical \`.loc-tabs\` strip at
\`design-handoff/.../preview/comp-inputs.html:248-284\` (pattern ①,
"Locale tabs"). This is the **header-only** subset of the locale
input — the consumer wires the panel below. For the full input +
panel composition see \`<LocaleInput>\` under
\`components/composites/locale-input\`.

Each tab carries a coloured dot signalling translation status:
\`translated\` (green), \`draft\` (amber, stale relative to base),
\`missing\` (red).

The base locale (first in \`locales\`, or \`baseLocale\` if provided)
carries a subtle "(基準)" suffix.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof LocaleTabs>;

export const Default: Story = {
  name: "Default — three locales",
  parameters: { controls: { disable: true } },
  render: () => (
    <LocaleTabs
      locales={[
        { code: "ja", label: "日本語", status: "translated" },
        { code: "en", label: "English", status: "translated" },
        { code: "vi", label: "Tiếng Việt", status: "draft" },
      ]}
      baseLocale="ja"
    />
  ),
};

export const FourLocales: Story = {
  name: "Variant — four locales with meta + add",
  parameters: { controls: { disable: true } },
  render: () => (
    <LocaleTabs
      locales={[
        { code: "ja", label: "日本語", status: "translated" },
        { code: "en", label: "English", status: "translated" },
        { code: "vi", label: "Tiếng Việt", status: "draft" },
        { code: "zh", label: "简体中文", status: "missing" },
      ]}
      baseLocale="ja"
      meta="3 / 4 翻訳済"
      onAdd={() => alert("Add locale")}
    />
  ),
};

export const Controlled: Story = {
  name: "Behavior — controlled active locale with panel",
  parameters: { controls: { disable: true } },
  render: () => {
    const [active, setActive] = useState("ja");
    const values: Record<string, string> = {
      ja: "特選 まぐろ握り 6貫盛り合わせ",
      en: "Tuna nigiri assortment (6 pcs)",
      vi: "",
      zh: "",
    };
    return (
      <div style={{ width: 480 }}>
        <Field>
          <Field.Label required>商品名</Field.Label>
          <LocaleTabs
            value={active}
            onChange={setActive}
            locales={[
              { code: "ja", label: "日本語", status: "translated" },
              { code: "en", label: "English", status: "translated" },
              { code: "vi", label: "Tiếng Việt", status: "draft" },
              { code: "zh", label: "简体中文", status: "missing" },
            ]}
            baseLocale="ja"
            meta="3 / 4 翻訳済"
          />
          <div className="loc-panel">
            <Input value={values[active] ?? ""} readOnly />
            <Field.RowHelp>
              <Field.Help info>
                日本語が基準言語 · 翻訳がない場合はこの値が使われます
              </Field.Help>
              <Field.Count current={(values[active] ?? "").length} max={60} />
            </Field.RowHelp>
          </div>
        </Field>
      </div>
    );
  },
};

export const StatusLegend: Story = {
  name: "Showcase — status states (translated / draft / missing)",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="middle" style={{ width: 480 }}>
      <LocaleTabs
        locales={[
          { code: "ja", status: "translated" },
          { code: "en", status: "translated" },
          { code: "vi", status: "translated" },
        ]}
        baseLocale="ja"
        meta="3 / 3 翻訳済"
      />
      <LocaleTabs
        locales={[
          { code: "ja", status: "translated" },
          { code: "en", status: "draft" },
          { code: "vi", status: "draft" },
        ]}
        baseLocale="ja"
        meta="1 / 3 翻訳済"
      />
      <LocaleTabs
        locales={[
          { code: "ja", status: "translated" },
          { code: "en", status: "missing" },
          { code: "vi", status: "missing" },
          { code: "zh", status: "missing" },
        ]}
        baseLocale="ja"
        meta="1 / 4 翻訳済"
      />
    </Flex>
  ),
};
