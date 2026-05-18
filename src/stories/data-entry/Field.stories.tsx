import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { Field } from "../../components/data-entry/Field";
import { Input, Textarea } from "../../components/data-entry/Input";
import { Flex } from "../../components/layout";

const meta: Meta<typeof Field> = {
  title: "Data Entry/Field",
  component: Field,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof Field>;

export const Default: Story = {
  name: "Default · label + input + help",
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Field label="従業員コード" help="英数字 4–8 文字で入力してください。">
        <Input placeholder="EMP-0001" />
      </Field>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("label, control, and help all render", async () => {
      await expect(canvas.getByText("従業員コード")).toBeInTheDocument();
      await expect(canvas.getByPlaceholderText("EMP-0001")).toBeInTheDocument();
      await expect(canvas.getByText("英数字 4–8 文字で入力してください。")).toBeInTheDocument();
    });
    await step("typing updates the input value", async () => {
      const input = canvas.getByPlaceholderText("EMP-0001") as HTMLInputElement;
      await userEvent.type(input, "EMP-0042");
      await expect(input.value).toBe("EMP-0042");
    });
  },
};

export const Required: Story = {
  name: "Required · asterisk",
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Field label="メールアドレス" required help="業務連絡で使用するアドレスを入力。">
        <Input type="email" placeholder="name@famgia.com" />
      </Field>
    </div>
  ),
};

export const WithError: Story = {
  name: "WithError · status=error + help tone",
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Field label="パスワード" required help="8 文字以上、英数字+記号を含めてください。" tone="error">
        <Input type="password" status="error" defaultValue="weak" />
      </Field>
    </div>
  ),
};

export const WithCount: Story = {
  name: "WithCount · textarea + count",
  render: function WithCount() {
    const [value, setValue] = useState("承認時に表示するコメントを記入してください。");
    return (
      <div style={{ maxWidth: 360 }}>
        <Field
          label="承認コメント"
          optional
          help="承認者のみ閲覧できます。"
          count={{ current: value.length, max: 200 }}
        >
          <Textarea
            rows={4}
            maxLength={200}
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </Field>
      </div>
    );
  },
};

export const Horizontal: Story = {
  name: "Horizontal · Flex row composition",
  render: () => (
    <Flex vertical gap="middle" style={{ maxWidth: 480 }}>
      <Flex align="center" gap="middle">
        <label htmlFor="hz-name" style={{ flex: "0 0 120px", fontSize: "var(--text-sm)" }}>
          氏名
        </label>
        <Input id="hz-name" placeholder="田中 美咲" />
      </Flex>
    </Flex>
  ),
};
