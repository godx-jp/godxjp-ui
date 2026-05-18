import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { useForm, type Resolver } from "react-hook-form";
import { Form, type FormFieldConfig } from "../../components/data-entry/Form";
import { Input } from "../../components/data-entry/Input";
import { InputNumber } from "../../components/data-entry/InputNumber";
import { Checkbox } from "../../components/data-entry/Checkbox";
import { Button } from "../../components/general/Button";
import { Flex } from "../../components/layout";

interface FormValues {
  name: string;
  email: string;
  age: number | null;
  agree: boolean;
}

const resolver: Resolver<FormValues> = async (values) => {
  const errors: Record<string, { type: string; message: string }> = {};
  if (!values.name?.trim()) errors.name = { type: "required", message: "名前は必須です" };
  if (!values.email) errors.email = { type: "required", message: "メールアドレスは必須です" };
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = { type: "format", message: "有効なメールアドレスを入力してください" };
  }
  if (values.age === null || values.age === undefined) errors.age = { type: "required", message: "年齢を入力してください" };
  else if (values.age < 18) errors.age = { type: "min", message: "18 歳以上のみ登録できます" };
  if (!values.agree) errors.agree = { type: "required", message: "利用規約への同意が必要です" };
  return { values: Object.keys(errors).length ? {} : values, errors };
};

const makeFields = (disabled = false): Array<FormFieldConfig<FormValues>> => [
  {
    name: "name",
    label: "氏名",
    required: true,
    render: ({ value, onChange, onBlur, name, error, invalid }) => (
      <Input
        id={name}
        name={name}
        placeholder="山田 太郎"
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        status={invalid ? "error" : "default"}
        aria-invalid={Boolean(error) || undefined}
      />
    ),
  },
  {
    name: "email",
    label: "メールアドレス",
    required: true,
    description: "ログイン ID として使用します",
    render: ({ value, onChange, onBlur, name, error, invalid }) => (
      <Input
        id={name}
        name={name}
        type="email"
        placeholder="taro@example.com"
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        status={invalid ? "error" : "default"}
        aria-invalid={Boolean(error) || undefined}
      />
    ),
  },
  {
    name: "age",
    label: "年齢",
    required: true,
    render: ({ value, onChange, onBlur, invalid }) => (
      <InputNumber
        value={typeof value === "number" ? value : undefined}
        onValueChange={(next) => onChange(next)}
        onBlur={onBlur}
        min={0}
        max={150}
        disabled={disabled}
        status={invalid ? "error" : "default"}
      />
    ),
  },
  {
    name: "agree",
    render: ({ value, onChange, name, invalid }) => (
      <Checkbox
        id={name}
        checked={Boolean(value)}
        disabled={disabled}
        onCheckedChange={(checked) => onChange(checked === true)}
        aria-invalid={invalid || undefined}
      >
        利用規約に同意する
      </Checkbox>
    ),
  },
];

const meta: Meta<typeof Form> = {
  title: "Data Entry/Form",
  component: Form,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj;

function FormExample({ disabled = false, defaults }: { disabled?: boolean; defaults: FormValues }) {
  const form = useForm<FormValues>({ resolver, defaultValues: defaults, mode: "onTouched" });
  return (
    <Form<FormValues>
      form={form}
      fields={makeFields(disabled)}
      onSubmit={(values) => console.log("submit", values)}
      style={{ display: "grid", gap: "var(--spacing-3)", maxWidth: 360 }}
    >
      <Flex gap="small" justify="end">
        <Button type="submit" variant="primary" disabled={disabled}>
          {disabled ? "登録" : "確認"}
        </Button>
      </Flex>
    </Form>
  );
}

export const Default: Story = {
  render: () => <FormExample defaults={{ name: "", email: "", age: 18, agree: false }} />,
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
  render: () => <FormExample defaults={{ name: "", email: "not-an-email", age: 12, agree: false }} />,
};

export const Disabled: Story = {
  render: () => <FormExample disabled defaults={{ name: "", email: "", age: 18, agree: false }} />,
};
