import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "../../components/data-entry/Form";
import { FormField } from "../../components/data-entry/FormField";
import { Field } from "../../components/data-entry/Field";
import { Input, Textarea } from "../../components/data-entry/Input";
import { InputNumber } from "../../components/data-entry/InputNumber";
import { Checkbox } from "../../components/data-entry/Checkbox";
import { Select } from "../../components/data-entry/Select";
import { Button } from "../../components/general/Button";
import { Flex } from "../../components/layout";
import { Skeleton } from "../../components/feedback/Skeleton";

// ─── Schemas ─────────────────────────────────────────────────────

const registrationSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  age: z
    .number({ message: "年齢を入力してください" })
    .min(18, "18 歳以上のみ登録できます"),
  agree: z.literal(true, { message: "利用規約への同意が必要です" }),
});
type RegistrationValues = z.infer<typeof registrationSchema>;

const profileSchema = z.object({
  lastName: z.string().min(1, "姓は必須です"),
  firstName: z.string().min(1, "名は必須です"),
  lastNameKana: z.string().optional(),
  firstNameKana: z.string().optional(),
  email: z.string().email(),
});
type ProfileValues = z.infer<typeof profileSchema>;

const addressSchema = z.object({
  postalCode: z.string().regex(/^\d{3}-?\d{4}$/, "郵便番号は 7 桁で入力してください"),
  prefecture: z.string().min(1, "都道府県を選択してください"),
  city: z.string().min(1, "市区町村は必須です"),
  street: z.string().min(1, "番地は必須です"),
  building: z.string().optional(),
});
type AddressValues = z.infer<typeof addressSchema>;

const phoneSchema = z.object({
  countryCode: z.string().min(1),
  number: z.string().regex(/^[0-9-]+$/, "数字とハイフンのみ"),
  ext: z.string().optional(),
});
type PhoneValues = z.infer<typeof phoneSchema>;

const filterSchema = z.object({
  query: z.string().optional(),
  status: z.string().optional(),
  shop: z.string().optional(),
});
type FilterValues = z.infer<typeof filterSchema>;

// ─── Option lists ────────────────────────────────────────────────

const PREFECTURE_OPTIONS = [
  { value: "13", label: "東京都" },
  { value: "27", label: "大阪府" },
  { value: "23", label: "愛知県" },
  { value: "14", label: "神奈川県" },
  { value: "01", label: "北海道" },
];

const COUNTRY_CODES = [
  { value: "+81", label: "🇯🇵 +81 (JP)" },
  { value: "+1", label: "🇺🇸 +1 (US)" },
  { value: "+84", label: "🇻🇳 +84 (VN)" },
  { value: "+63", label: "🇵🇭 +63 (PH)" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "稼働中" },
  { value: "paused", label: "一時停止" },
  { value: "closed", label: "終了" },
];

const SHOP_OPTIONS = [
  { value: "shibuya", label: "渋谷店" },
  { value: "shinjuku", label: "新宿店" },
  { value: "ikebukuro", label: "池袋店" },
];

const meta: Meta<typeof Form<RegistrationValues>> = {
  title: "Data Entry/Form",
  component: Form,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof Form<RegistrationValues>>;

// ─── Default · 4-field registration ──────────────────────────────

export const Default: Story = {
  render: () => (
    <Form<RegistrationValues>
      resolver={zodResolver(registrationSchema)}
      defaultValues={{ name: "", email: "", age: 18, agree: true }}
      onSubmit={(values) => console.log("submit", values)}
      style={{ maxWidth: 360 }}
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
    await step("renders + accepts input", async () => {
      const name = canvas.getByPlaceholderText("山田 太郎") as HTMLInputElement;
      await expect(name).toBeInTheDocument();
      await userEvent.type(name, "佐藤");
      await expect(name.value).toBe("佐藤");
    });
  },
};

// ─── Validated · invalid defaults, errors visible ────────────────

export const Validated: Story = {
  render: () => (
    <Form<RegistrationValues>
      resolver={zodResolver(registrationSchema)}
      defaultValues={
        {
          name: "",
          email: "not-an-email",
          age: 12,
          agree: false,
        } as unknown as RegistrationValues
      }
      mode="onChange"
      onSubmit={(v) => console.log(v)}
      style={{ maxWidth: 360 }}
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

// ─── Disabled · whole form locked ────────────────────────────────

export const Disabled: Story = {
  render: () => (
    <Form<RegistrationValues>
      resolver={zodResolver(registrationSchema)}
      defaultValues={{ name: "", email: "", age: 18, agree: true }}
      onSubmit={(v) => console.log(v)}
      style={{ maxWidth: 360 }}
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

// ─── Horizontal · label-left from md ─────────────────────────────

export const Horizontal: Story = {
  name: "Horizontal · label-left from md",
  parameters: {
    docs: {
      description: {
        story:
          "Mobile-first: stays vertical on xs/sm, label moves to the left at md (≥768px). Use `layout=\"horizontal\"`.",
      },
    },
  },
  render: () => (
    <Form<RegistrationValues>
      layout="horizontal"
      resolver={zodResolver(registrationSchema)}
      defaultValues={{ name: "", email: "", age: 18, agree: true }}
      onSubmit={(v) => console.log(v)}
      style={{ maxWidth: 640 }}
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

// ─── Inline · single-row search/filter (mobile stacks) ───────────

export const Inline: Story = {
  name: "Inline · single-row filter",
  parameters: {
    docs: {
      description: {
        story:
          "Mobile-first: stacks on xs, collapses to one row at sm (≥640px). Common for table filters and search bars.",
      },
    },
  },
  render: () => (
    <Form<FilterValues>
      layout="inline"
      defaultValues={{ query: "", status: "active", shop: "shibuya" }}
      onSubmit={(v) => console.log(v)}
    >
      <FormField name="query" label="キーワード">
        <Input placeholder="名前 / メール / 電話番号" />
      </FormField>
      <FormField name="status" label="ステータス">
        <Select options={STATUS_OPTIONS} />
      </FormField>
      <FormField name="shop" label="店舗">
        <Select options={SHOP_OPTIONS} />
      </FormField>
      <Button type="submit" variant="primary">
        検索
      </Button>
    </Form>
  ),
};

// ─── TwoColumns · 姓 + 名 ────────────────────────────────────────

export const TwoColumns: Story = {
  name: "Two columns · 姓 + 名",
  parameters: {
    docs: {
      description: {
        story:
          "Mobile-first 2-column grid: 1 column on xs, 2 columns at sm (≥640px). Common for name pairs.",
      },
    },
  },
  render: () => (
    <Form<ProfileValues>
      resolver={zodResolver(profileSchema)}
      defaultValues={{
        lastName: "",
        firstName: "",
        lastNameKana: "",
        firstNameKana: "",
        email: "",
      }}
      onSubmit={(v) => console.log(v)}
      style={{ maxWidth: 480 }}
    >
      <div
        className="grid grid-cols-1 sm:grid-cols-2"
        style={{ gap: "var(--spacing-3)" }}
      >
        <FormField name="lastName" label="姓" required>
          <Input placeholder="山田" />
        </FormField>
        <FormField name="firstName" label="名" required>
          <Input placeholder="太郎" />
        </FormField>
        <FormField name="lastNameKana" label="姓 (カナ)">
          <Input placeholder="ヤマダ" />
        </FormField>
        <FormField name="firstNameKana" label="名 (カナ)">
          <Input placeholder="タロウ" />
        </FormField>
      </div>
      <FormField name="email" label="メールアドレス" required>
        <Input type="email" placeholder="taro@example.com" />
      </FormField>
      <Flex gap="small" justify="end">
        <Button type="submit" variant="primary">
          保存
        </Button>
      </Flex>
    </Form>
  ),
};

// ─── Address · 3-column row + multi-line ─────────────────────────

export const Address: Story = {
  name: "Address · 郵便番号 / 都道府県 / 市区町村",
  parameters: {
    docs: {
      description: {
        story:
          "Mobile-first 3-column grid for the prefecture row. Postal code on its own row; street + building stacked below.",
      },
    },
  },
  render: () => (
    <Form<AddressValues>
      resolver={zodResolver(addressSchema)}
      defaultValues={{
        postalCode: "",
        prefecture: "13",
        city: "",
        street: "",
        building: "",
      }}
      onSubmit={(v) => console.log(v)}
      style={{ maxWidth: 560 }}
    >
      <FormField name="postalCode" label="郵便番号" required>
        <Input placeholder="100-0001" style={{ maxWidth: "8rem" }} />
      </FormField>
      <div
        className="grid grid-cols-1 sm:grid-cols-3"
        style={{ gap: "var(--spacing-3)" }}
      >
        <FormField name="prefecture" label="都道府県" required>
          <Select options={PREFECTURE_OPTIONS} />
        </FormField>
        <FormField name="city" label="市区町村" required>
          <Input placeholder="千代田区" />
        </FormField>
        <FormField name="street" label="番地" required>
          <Input placeholder="1-1-1" />
        </FormField>
      </div>
      <FormField
        name="building"
        label="建物名 / 部屋番号"
        description="マンション名・部屋番号があれば入力してください"
      >
        <Input placeholder="○○マンション 101 号室" />
      </FormField>
      <Flex gap="small" justify="end">
        <Button type="submit" variant="primary">
          保存
        </Button>
      </Flex>
    </Form>
  ),
};

// ─── PhoneNumber · country code + number + ext ───────────────────

export const PhoneNumber: Story = {
  name: "Phone · 国番号 + 番号 + 内線",
  parameters: {
    docs: {
      description: {
        story:
          "Mobile-first phone composition: stacked on xs, 3-column at sm. Three separate FormFields share a single visual row.",
      },
    },
  },
  render: () => (
    <Form<PhoneValues>
      resolver={zodResolver(phoneSchema)}
      defaultValues={{ countryCode: "+81", number: "", ext: "" }}
      onSubmit={(v) => console.log(v)}
      style={{ maxWidth: 480 }}
    >
      <div
        className="grid grid-cols-1 sm:grid-cols-[8rem_1fr_6rem]"
        style={{ gap: "var(--spacing-3)" }}
      >
        <FormField name="countryCode" label="国番号" required>
          <Select options={COUNTRY_CODES} />
        </FormField>
        <FormField name="number" label="電話番号" required>
          <Input placeholder="80-1234-5678" />
        </FormField>
        <FormField name="ext" label="内線">
          <Input placeholder="123" />
        </FormField>
      </div>
      <Flex gap="small" justify="end">
        <Button type="submit" variant="primary">
          保存
        </Button>
      </Flex>
    </Form>
  ),
};

// ─── WithDescriptions · explainer text per field ────────────────

export const WithDescriptions: Story = {
  name: "With descriptions · manual hints",
  render: () => (
    <Form<RegistrationValues>
      resolver={zodResolver(registrationSchema)}
      defaultValues={{ name: "", email: "", age: 18, agree: true }}
      onSubmit={(v) => console.log(v)}
      style={{ maxWidth: 420 }}
    >
      <FormField
        name="name"
        label="氏名"
        required
        description="戸籍に記載されている氏名を入力してください"
      >
        <Input placeholder="山田 太郎" />
      </FormField>
      <FormField
        name="email"
        label="メールアドレス"
        required
        description="ログイン ID として使用します。受信できるアドレスを設定してください"
      >
        <Input type="email" placeholder="taro@example.com" />
      </FormField>
      <FormField
        name="age"
        label="年齢"
        required
        description="18 歳以上のみ登録できます"
      >
        <InputNumber min={0} max={150} />
      </FormField>
      <Flex gap="small" justify="end">
        <Button type="submit" variant="primary">
          確認
        </Button>
      </Flex>
    </Form>
  ),
};

// ─── WithCounter · textarea + char count ─────────────────────────

export const WithCounter: Story = {
  name: "With counter · textarea + maxLength",
  render: function WithCounter() {
    const [bio, setBio] = useState(
      "プロダクト開発者。マネジメントよりは現場で手を動かしたい派。",
    );
    return (
      <Form
        defaultValues={{}}
        onSubmit={(v) => console.log(v)}
        style={{ maxWidth: 480 }}
      >
        <Field
          label="自己紹介"
          optional
          count={{ current: bio.length, max: 200 }}
          help="プロフィール画面に表示されます"
        >
          <Textarea
            rows={4}
            maxLength={200}
            value={bio}
            onChange={(event) => setBio(event.target.value)}
          />
        </Field>
        <Flex gap="small" justify="end">
          <Button type="submit" variant="primary">
            保存
          </Button>
        </Flex>
      </Form>
    );
  },
};

// ─── OptionalMix · required vs optional ──────────────────────────

export const OptionalMix: Story = {
  name: "Optional mix · required + 任意 badge",
  render: () => (
    <Form<ProfileValues>
      resolver={zodResolver(profileSchema)}
      defaultValues={{
        lastName: "",
        firstName: "",
        lastNameKana: "",
        firstNameKana: "",
        email: "",
      }}
      onSubmit={(v) => console.log(v)}
      style={{ maxWidth: 420 }}
    >
      <FormField name="lastName" label="姓" required>
        <Input placeholder="山田" />
      </FormField>
      <FormField name="firstName" label="名" required>
        <Input placeholder="太郎" />
      </FormField>
      <FormField name="lastNameKana" label="姓 (カナ)" optional>
        <Input placeholder="ヤマダ" />
      </FormField>
      <FormField name="firstNameKana" label="名 (カナ)" optional>
        <Input placeholder="タロウ" />
      </FormField>
      <FormField name="email" label="メールアドレス" required>
        <Input type="email" placeholder="taro@example.com" />
      </FormField>
      <Flex gap="small" justify="end">
        <Button type="submit" variant="primary">
          保存
        </Button>
      </Flex>
    </Form>
  ),
};

// ─── Loading · async submit + spinner ────────────────────────────

export const Loading: Story = {
  name: "Loading · async submit",
  parameters: {
    docs: {
      description: {
        story:
          "Submit button shows the `loading` spinner while the async submit handler runs.",
      },
    },
  },
  render: function Loading() {
    const [submitting, setSubmitting] = useState(false);
    return (
      <Form<RegistrationValues>
        resolver={zodResolver(registrationSchema)}
        defaultValues={{ name: "佐藤 花子", email: "hanako@example.com", age: 28, agree: true }}
        onSubmit={async (values) => {
          setSubmitting(true);
          await new Promise((r) => setTimeout(r, 1500));
          setSubmitting(false);
          console.log("submitted", values);
        }}
        style={{ maxWidth: 360 }}
      >
        <FormField name="name" label="氏名" required>
          <Input />
        </FormField>
        <FormField name="email" label="メールアドレス" required>
          <Input type="email" />
        </FormField>
        <FormField name="age" label="年齢" required>
          <InputNumber min={0} max={150} />
        </FormField>
        <FormField name="agree">
          <Checkbox>利用規約に同意する</Checkbox>
        </FormField>
        <Flex gap="small" justify="end">
          <Button type="submit" variant="primary" loading={submitting}>
            送信
          </Button>
        </Flex>
      </Form>
    );
  },
};

// ─── SkeletonLoading · while initial data fetches ────────────────

export const SkeletonLoading: Story = {
  name: "Skeleton · loading initial data",
  parameters: {
    docs: {
      description: {
        story:
          "Form chrome while the consumer fetches its defaults. Each Field shows a Skeleton in place of the control.",
      },
    },
  },
  render: () => (
    <div
      style={{
        display: "grid",
        gap: "var(--spacing-3)",
        maxWidth: 360,
      }}
    >
      <Field label="氏名" required>
        <Skeleton className="h-9 w-full rounded-md" />
      </Field>
      <Field label="メールアドレス" required>
        <Skeleton className="h-9 w-full rounded-md" />
      </Field>
      <Field label="年齢" required>
        <Skeleton className="h-9 w-32 rounded-md" />
      </Field>
      <Skeleton className="h-5 w-48 rounded-sm" />
      <Flex gap="small" justify="end">
        <Skeleton className="h-9 w-24 rounded-md" />
      </Flex>
    </div>
  ),
};
