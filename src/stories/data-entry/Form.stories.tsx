import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { useForm, type Resolver } from "react-hook-form";
import { Form, FormField } from "../../components/data-entry/Form";
import { Input } from "../../components/data-entry/Input";
import { InputNumber } from "../../components/data-entry/InputNumber";
import { Checkbox } from "../../components/data-entry/Checkbox";
import { Button } from "../../components/general/Button";
import { Flex } from "../../components/layout";

/**
 * data-entry/Form — react-hook-form wrapper.
 *
 * Cardinal rules honoured:
 *   §3  — react-hook-form is the shadcn/Radix-canonical form
 *          binding library.
 *   §14 — locked stack peer (rule 23 §D deep-research). Errors
 *          render via the canonical `<FieldHelp tone="error">` chain.
 *   §21 — every nested primitive (Input / InputNumber / Checkbox)
 *          honours every axis already.
 *   §23 — vocabulary: render-prop yields
 *          `{ value, onChange, onBlur, name, ref, error, invalid }`.
 *          NOT Ant's `rules` / `validateStatus` / `wrapperCol`.
 *   §25 — stories show the canonical composition; primitive owns
 *          the layout + error tone.
 *
 * Note on validation: the story uses a tiny hand-rolled `resolver`
 * (no Zod dependency) to keep the example resolver-agnostic. Real
 * apps typically plug `@hookform/resolvers/{zod,yup,valibot,...}`.
 */

interface FormValues {
  name: string;
  email: string;
  age: number | null;
  agree: boolean;
}

const resolver: Resolver<FormValues> = async (values) => {
  const errors: Record<string, { type: string; message: string }> = {};
  if (!values.name?.trim()) {
    errors.name = { type: "required", message: "名前は必須です" };
  }
  if (!values.email) {
    errors.email = { type: "required", message: "メールアドレスは必須です" };
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = { type: "format", message: "有効なメールアドレスを入力してください" };
  }
  if (values.age === null || values.age === undefined) {
    errors.age = { type: "required", message: "年齢を入力してください" };
  } else if (values.age < 18) {
    errors.age = { type: "min", message: "18 歳以上のみ登録できます" };
  } else if (values.age > 120) {
    errors.age = { type: "max", message: "120 歳以下を入力してください" };
  }
  if (!values.agree) {
    errors.agree = { type: "required", message: "利用規約への同意が必要です" };
  }
  return {
    values: Object.keys(errors).length ? {} : values,
    errors,
  };
};

const meta: Meta = {
  title: "Data Entry/Form",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Form** — thin wrapper over \`react-hook-form\` + the canonical
\`<Field>\` label/help composition (shadcn/ui pattern).

Vocabulary per cardinal rule 23 §B:
- \`form\` — \`UseFormReturn<T>\` from \`useForm()\` (caller-owned)
- \`onSubmit\` — receives the typed values after the resolver passes
- \`FormField\` — render-prop binding to one \`useController\` slot

Validation is delegated to any \`@hookform/resolvers\` adapter
(Zod / Yup / Valibot / Joi / …). The example below uses a tiny
hand-rolled resolver to stay dependency-agnostic. Errors render
automatically via \`<FieldHelp tone="error">\`.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj;

// ─── Default ────────────────────────────────────────────────────

export const Default: Story = {
  render: function Default() {
    const form = useForm<FormValues>({
      resolver,
      defaultValues: { name: "", email: "", age: 18, agree: false },
      mode: "onTouched",
    });
    return (
      <Form<FormValues>
        form={form}
        onSubmit={(values) => {
          // eslint-disable-next-line no-console
          console.log("submit", values);
        }}
        style={{ display: "grid", gap: "var(--spacing-3)", maxWidth: 360 }}
      >
        <FormField<FormValues, "name"> name="name" label="氏名" required>
          {({ value, onChange, onBlur, name, error, invalid }) => (
            <Input
              id={name}
              name={name}
              placeholder="山田 太郎"
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              status={invalid ? "error" : "default"}
              aria-invalid={Boolean(error) || undefined}
            />
          )}
        </FormField>
        <FormField<FormValues, "email">
          name="email"
          label="メールアドレス"
          required
          description="ログイン ID として使用します"
        >
          {({ value, onChange, onBlur, name, error, invalid }) => (
            <Input
              id={name}
              name={name}
              type="email"
              placeholder="taro@example.com"
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              status={invalid ? "error" : "default"}
              aria-invalid={Boolean(error) || undefined}
            />
          )}
        </FormField>
        <FormField<FormValues, "age"> name="age" label="年齢" required>
          {({ value, onChange, onBlur, invalid }) => (
            <InputNumber
              value={value ?? undefined}
              onValueChange={(n) => onChange(n)}
              onBlur={onBlur}
              min={0}
              max={150}
              status={invalid ? "error" : "default"}
            />
          )}
        </FormField>
        <FormField<FormValues, "agree"> name="agree">
          {({ value, onChange, name, invalid }) => (
            <Checkbox
              id={name}
              checked={Boolean(value)}
              onCheckedChange={(checked) => onChange(checked === true)}
              aria-invalid={invalid || undefined}
            >
              利用規約に同意する
            </Checkbox>
          )}
        </FormField>
        <Flex gap="small" justify="end">
          <Button type="submit" variant="primary">
            登録
          </Button>
        </Flex>
      </Form>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("form renders with name input and submit button", async () => {
      const name = canvas.getByPlaceholderText("山田 太郎") as HTMLInputElement;
      await expect(name).toBeInTheDocument();
      const submit = canvas.getByRole("button", { name: "登録" });
      await expect(submit).toBeInTheDocument();
    });

    await step("typing populates the name field", async () => {
      const name = canvas.getByPlaceholderText("山田 太郎") as HTMLInputElement;
      await userEvent.type(name, "佐藤");
      await expect(name.value).toBe("佐藤");
    });
  },
};

// ─── Validated — pre-populated with invalid values ──────────────

export const Validated: Story = {
  render: function Validated() {
    const form = useForm<FormValues>({
      resolver,
      defaultValues: { name: "", email: "not-an-email", age: 12, agree: false },
      mode: "all",
    });

    return (
      <Form<FormValues>
        form={form}
        onSubmit={() => undefined}
        style={{ display: "grid", gap: "var(--spacing-3)", maxWidth: 360 }}
      >
        <FormField<FormValues, "name"> name="name" label="氏名" required>
          {({ value, onChange, onBlur, name, invalid }) => (
            <Input
              id={name}
              name={name}
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              status={invalid ? "error" : "default"}
            />
          )}
        </FormField>
        <FormField<FormValues, "email"> name="email" label="メール" required>
          {({ value, onChange, onBlur, name, invalid }) => (
            <Input
              id={name}
              name={name}
              type="email"
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              status={invalid ? "error" : "default"}
            />
          )}
        </FormField>
        <FormField<FormValues, "age"> name="age" label="年齢" required>
          {({ value, onChange, onBlur, invalid }) => (
            <InputNumber
              value={value ?? undefined}
              onValueChange={onChange}
              onBlur={onBlur}
              min={0}
              status={invalid ? "error" : "default"}
            />
          )}
        </FormField>
        <FormField<FormValues, "agree"> name="agree">
          {({ value, onChange, name, invalid }) => (
            <Checkbox
              id={name}
              checked={Boolean(value)}
              onCheckedChange={(c) => onChange(c === true)}
              aria-invalid={invalid || undefined}
            >
              利用規約に同意する
            </Checkbox>
          )}
        </FormField>
        <Flex gap="small" justify="end">
          <Button type="submit" variant="primary">
            確認
          </Button>
        </Flex>
      </Form>
    );
  },
};

// ─── Disabled ───────────────────────────────────────────────────

export const Disabled: Story = {
  render: function Disabled() {
    const form = useForm<FormValues>({
      resolver,
      defaultValues: { name: "", email: "", age: 18, agree: false },
      mode: "onTouched",
    });
    return (
      <Form<FormValues>
        form={form}
        onSubmit={() => undefined}
        style={{ display: "grid", gap: "var(--spacing-3)", maxWidth: 360 }}
      >
        <FormField<FormValues, "name"> name="name" label="氏名" required>
          {({ value, onChange, onBlur, name, error, invalid }) => (
            <Input
              id={name}
              name={name}
              placeholder="山田 太郎"
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              disabled
              status={invalid ? "error" : "default"}
              aria-invalid={Boolean(error) || undefined}
            />
          )}
        </FormField>
        <FormField<FormValues, "email">
          name="email"
          label="メールアドレス"
          required
          description="ログイン ID として使用します"
        >
          {({ value, onChange, onBlur, name, error, invalid }) => (
            <Input
              id={name}
              name={name}
              type="email"
              placeholder="taro@example.com"
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              disabled
              status={invalid ? "error" : "default"}
              aria-invalid={Boolean(error) || undefined}
            />
          )}
        </FormField>
        <FormField<FormValues, "age"> name="age" label="年齢" required>
          {({ value, onChange, onBlur, invalid }) => (
            <InputNumber
              value={value ?? undefined}
              onValueChange={(n) => onChange(n)}
              onBlur={onBlur}
              min={0}
              max={150}
              disabled
              status={invalid ? "error" : "default"}
            />
          )}
        </FormField>
        <FormField<FormValues, "agree"> name="agree">
          {({ value, onChange, name, invalid }) => (
            <Checkbox
              id={name}
              checked={Boolean(value)}
              disabled
              onCheckedChange={(checked) => onChange(checked === true)}
              aria-invalid={invalid || undefined}
            >
              利用規約に同意する
            </Checkbox>
          )}
        </FormField>
        <Flex gap="small" justify="end">
          <Button type="submit" variant="primary" disabled>
            登録
          </Button>
        </Flex>
      </Form>
    );
  },
};
