import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "../../components/data-entry/Form";
import { FormField } from "../../components/data-entry/FormField";
import { Input } from "../../components/data-entry/Input";
import { InputNumber } from "../../components/data-entry/InputNumber";
import { Checkbox } from "../../components/data-entry/Checkbox";
import { Button } from "../../components/general/Button";
import { Flex } from "../../components/layout";

const schema = z.object({
  name: z.string().min(1, "名前は必須です"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  age: z
    .number({ message: "年齢を入力してください" })
    .min(18, "18 歳以上のみ登録できます"),
  agree: z.literal(true, { message: "利用規約への同意が必要です" }),
});

type FormValues = z.infer<typeof schema>;

const meta: Meta<typeof Form<FormValues>> = {
  title: "Data Entry/Form",
  component: Form,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof Form<FormValues>>;

export const Default: Story = {
  render: () => (
    <Form<FormValues>
      resolver={zodResolver(schema)}
      defaultValues={{ name: "", email: "", age: 18, agree: true }}
      onSubmit={(values) => console.log("submit", values)}
      style={{ display: "grid", gap: "var(--spacing-3)", maxWidth: 360 }}
    >
      <FormField name="name" label="氏名" required>
        <Input placeholder="山田 太郎" />
      </FormField>
      <FormField
        name="email"
        label="メールアドレス"
        required
        description="ログイン ID として使用します"
      >
        <Input type="email" placeholder="taro@example.com" />
      </FormField>
      <FormField name="age" label="年齢" required>
        <InputNumber min={0} max={150} />
      </FormField>
      <FormField name="agree">
        <Checkbox>利用規約に同意する</Checkbox>
      </FormField>
      <Flex gap="small" justify="end">
        <Button type="submit" variant="primary">
          確認
        </Button>
      </Flex>
    </Form>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("form renders with name input and submit button", async () => {
      const name = canvas.getByPlaceholderText("山田 太郎") as HTMLInputElement;
      await expect(name).toBeInTheDocument();
      await expect(canvas.getByRole("button", { name: "確認" })).toBeInTheDocument();
    });
    await step("typing populates the name field", async () => {
      const name = canvas.getByPlaceholderText("山田 太郎") as HTMLInputElement;
      await userEvent.type(name, "佐藤");
      await expect(name.value).toBe("佐藤");
    });
  },
};

export const Validated: Story = {
  render: () => (
    <Form<FormValues>
      resolver={zodResolver(schema)}
      defaultValues={
        {
          name: "",
          email: "not-an-email",
          age: 12,
          agree: false,
        } as unknown as FormValues
      }
      mode="onChange"
      onSubmit={(values) => console.log("submit", values)}
      style={{ display: "grid", gap: "var(--spacing-3)", maxWidth: 360 }}
    >
      <FormField name="name" label="氏名" required>
        <Input placeholder="山田 太郎" />
      </FormField>
      <FormField
        name="email"
        label="メールアドレス"
        required
        description="ログイン ID として使用します"
      >
        <Input type="email" placeholder="taro@example.com" />
      </FormField>
      <FormField name="age" label="年齢" required>
        <InputNumber min={0} max={150} />
      </FormField>
      <FormField name="agree">
        <Checkbox>利用規約に同意する</Checkbox>
      </FormField>
      <Flex gap="small" justify="end">
        <Button type="submit" variant="primary">
          確認
        </Button>
      </Flex>
    </Form>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Form<FormValues>
      resolver={zodResolver(schema)}
      defaultValues={{ name: "", email: "", age: 18, agree: true }}
      onSubmit={(values) => console.log("submit", values)}
      style={{ display: "grid", gap: "var(--spacing-3)", maxWidth: 360 }}
    >
      <FormField name="name" label="氏名" required>
        <Input placeholder="山田 太郎" disabled />
      </FormField>
      <FormField
        name="email"
        label="メールアドレス"
        required
        description="ログイン ID として使用します"
      >
        <Input type="email" placeholder="taro@example.com" disabled />
      </FormField>
      <FormField name="age" label="年齢" required>
        <InputNumber min={0} max={150} disabled />
      </FormField>
      <FormField name="agree">
        <Checkbox disabled>利用規約に同意する</Checkbox>
      </FormField>
      <Flex gap="small" justify="end">
        <Button type="submit" variant="primary" disabled>
          登録
        </Button>
      </Flex>
    </Form>
  ),
};
