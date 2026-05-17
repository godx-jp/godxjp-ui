import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Checkbox } from "../../components/data-entry/Checkbox";
import { CheckboxGroup } from "../../components/data-entry/CheckboxGroup";
import { Flex } from "../../components/layout";

/**
 * data-entry/Checkbox — boolean + group selection.
 *
 * Cardinal rules:
 *   §3  — Radix @radix-ui/react-checkbox under the hood.
 *   §23 — `value` / `defaultValue` / `onValueChange` for the group;
 *          `checked` is internal to a single Checkbox.
 *   §25 — primitive owns the UI; story is documentation only.
 */

const meta: Meta<typeof Checkbox> = {
  title: "Data Entry/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Single: Story = {
  render: () => (
    <label style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
      <Checkbox defaultChecked />
      <span>利用規約に同意する</span>
    </label>
  ),
};

export const GroupHorizontal: Story = {
  name: "Group · horizontal",
  render: () => (
    <CheckboxGroup
      defaultValue={["apple"]}
      options={[
        { value: "apple", label: "りんご" },
        { value: "orange", label: "みかん" },
        { value: "grape", label: "ぶどう" },
      ]}
    />
  ),
};

export const GroupVertical: Story = {
  name: "Group · vertical",
  render: () => (
    <CheckboxGroup
      orientation="vertical"
      defaultValue={["email"]}
      options={[
        { value: "email", label: "メール通知" },
        { value: "sms", label: "SMS 通知" },
        { value: "push", label: "プッシュ通知" },
      ]}
    />
  ),
};

export const Indeterminate: Story = {
  render: () => (
    <Flex vertical gap="small">
      <label style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
        <Checkbox checked="indeterminate" />
        <span>すべて選択(部分選択中)</span>
      </label>
      <CheckboxGroup
        defaultValue={["a"]}
        options={[
          { value: "a", label: "項目 A" },
          { value: "b", label: "項目 B" },
          { value: "c", label: "項目 C" },
        ]}
      />
    </Flex>
  ),
};

export const Disabled: Story = {
  render: () => (
    <CheckboxGroup
      disabled
      defaultValue={["read"]}
      options={[
        { value: "read", label: "読み取り" },
        { value: "write", label: "書き込み" },
        { value: "admin", label: "管理者" },
      ]}
    />
  ),
};

function ControlledDemo() {
  const [value, setValue] = useState<string[]>(["jp"]);
  return (
    <Flex vertical gap="small">
      <CheckboxGroup
        value={value}
        onValueChange={setValue}
        options={[
          { value: "jp", label: "日本語" },
          { value: "en", label: "English" },
          { value: "vi", label: "Tiếng Việt" },
        ]}
      />
      <code className="mono" style={{ fontSize: "var(--text-xs)" }}>
        {JSON.stringify(value)}
      </code>
    </Flex>
  );
}

export const Controlled: Story = {
  render: () => <ControlledDemo />,
};
