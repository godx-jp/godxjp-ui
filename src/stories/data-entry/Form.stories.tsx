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

const settingsSchema = z.object({
  workspaceName: z.string().min(1),
  visibility: z.string(),
  defaultLocale: z.string(),
  notifyOnComment: z.boolean(),
  notifyOnMention: z.boolean(),
  digestFrequency: z.string(),
});
type SettingsValues = z.infer<typeof settingsSchema>;

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

const VISIBILITY_OPTIONS = [
  { value: "private", label: "プライベート" },
  { value: "internal", label: "社内公開" },
  { value: "public", label: "公開" },
];

const LOCALE_OPTIONS = [
  { value: "ja", label: "日本語" },
  { value: "en-US", label: "English (US)" },
  { value: "vi", label: "Tiếng Việt" },
  { value: "fil", label: "Filipino" },
];

const DIGEST_OPTIONS = [
  { value: "off", label: "なし" },
  { value: "daily", label: "毎日" },
  { value: "weekly", label: "週次" },
];

const meta: Meta<typeof Form<RegistrationValues>> = {
  title: "Data Entry/Form",
  component: Form,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof Form<RegistrationValues>>;

// ─── Registration · vertical ─────────────────────────────────────

export const RegistrationVertical: Story = {
  name: "Registration · vertical",
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
        <Button type="submit" variant="primary">確認</Button>
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

// ─── Registration · horizontal ───────────────────────────────────

export const RegistrationHorizontal: Story = {
  name: "Registration · horizontal",
  render: () => (
    <Form<RegistrationValues>
      layout="horizontal"
      resolver={zodResolver(registrationSchema)}
      defaultValues={{ name: "", email: "", age: 18, agree: true }}
      onSubmit={(values) => console.log("submit", values)}
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
        <Button type="submit" variant="primary">確認</Button>
      </Flex>
    </Form>
  ),
};

// ─── Validated · vertical (errors visible) ───────────────────────

export const ValidatedVertical: Story = {
  name: "Validated · vertical",
  render: () => (
    <Form<RegistrationValues>
      resolver={zodResolver(registrationSchema)}
      defaultValues={
        { name: "", email: "not-an-email", age: 12, agree: false } as unknown as RegistrationValues
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
        <Button type="submit" variant="primary">確認</Button>
      </Flex>
    </Form>
  ),
};

// ─── Validated · horizontal ──────────────────────────────────────

export const ValidatedHorizontal: Story = {
  name: "Validated · horizontal",
  render: () => (
    <Form<RegistrationValues>
      layout="horizontal"
      resolver={zodResolver(registrationSchema)}
      defaultValues={
        { name: "", email: "not-an-email", age: 12, agree: false } as unknown as RegistrationValues
      }
      mode="onChange"
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
        <Button type="submit" variant="primary">確認</Button>
      </Flex>
    </Form>
  ),
};

// ─── Disabled · vertical ─────────────────────────────────────────

export const DisabledVertical: Story = {
  name: "Disabled · vertical",
  render: () => (
    <Form<RegistrationValues>
      resolver={zodResolver(registrationSchema)}
      defaultValues={{ name: "佐藤 花子", email: "hanako@example.com", age: 32, agree: true }}
      onSubmit={(v) => console.log(v)}
      style={{ maxWidth: 360 }}
    >
      <FormField name="name" label="氏名" required>
        <Input placeholder="山田 太郎" disabled />
      </FormField>
      <FormField name="email" label="メールアドレス" required description="ログイン ID として使用します">
        <Input type="email" placeholder="taro@example.com" disabled />
      </FormField>
      <FormField name="age" label="年齢" required>
        <InputNumber min={0} max={150} disabled />
      </FormField>
      <FormField name="agree">
        <Checkbox disabled>利用規約に同意する</Checkbox>
      </FormField>
      <Flex gap="small" justify="end">
        <Button type="submit" variant="primary" disabled>登録</Button>
      </Flex>
    </Form>
  ),
};

// ─── Disabled · horizontal ───────────────────────────────────────

export const DisabledHorizontal: Story = {
  name: "Disabled · horizontal",
  render: () => (
    <Form<RegistrationValues>
      layout="horizontal"
      resolver={zodResolver(registrationSchema)}
      defaultValues={{ name: "佐藤 花子", email: "hanako@example.com", age: 32, agree: true }}
      onSubmit={(v) => console.log(v)}
      style={{ maxWidth: 640 }}
    >
      <FormField name="name" label="氏名" required>
        <Input placeholder="山田 太郎" disabled />
      </FormField>
      <FormField name="email" label="メールアドレス" required description="ログイン ID として使用します">
        <Input type="email" placeholder="taro@example.com" disabled />
      </FormField>
      <FormField name="age" label="年齢" required>
        <InputNumber min={0} max={150} disabled />
      </FormField>
      <FormField name="agree">
        <Checkbox disabled>利用規約に同意する</Checkbox>
      </FormField>
      <Flex gap="small" justify="end">
        <Button type="submit" variant="primary" disabled>登録</Button>
      </Flex>
    </Form>
  ),
};

// ─── TwoColumns · vertical (mobile-first 1→2 col grid) ──────────

export const TwoColumnsVertical: Story = {
  name: "Two columns · vertical",
  render: () => (
    <Form<ProfileValues>
      resolver={zodResolver(profileSchema)}
      defaultValues={{ lastName: "", firstName: "", lastNameKana: "", firstNameKana: "", email: "" }}
      onSubmit={(v) => console.log(v)}
      style={{ maxWidth: 480 }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "var(--spacing-3)" }}>
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
        <Button type="submit" variant="primary">保存</Button>
      </Flex>
    </Form>
  ),
};

// ─── TwoColumns · horizontal ─────────────────────────────────────

export const TwoColumnsHorizontal: Story = {
  name: "Two columns · horizontal",
  render: () => (
    <Form<ProfileValues>
      layout="horizontal"
      resolver={zodResolver(profileSchema)}
      defaultValues={{ lastName: "", firstName: "", lastNameKana: "", firstNameKana: "", email: "" }}
      onSubmit={(v) => console.log(v)}
      style={{ maxWidth: 720 }}
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
      <FormField name="email" label="メールアドレス" required>
        <Input type="email" placeholder="taro@example.com" />
      </FormField>
      <Flex gap="small" justify="end">
        <Button type="submit" variant="primary">保存</Button>
      </Flex>
    </Form>
  ),
};

// ─── Address · vertical ──────────────────────────────────────────

export const AddressVertical: Story = {
  name: "Address · vertical",
  render: () => (
    <Form<AddressValues>
      resolver={zodResolver(addressSchema)}
      defaultValues={{ postalCode: "", prefecture: "13", city: "", street: "", building: "" }}
      onSubmit={(v) => console.log(v)}
      style={{ maxWidth: 560 }}
    >
      <FormField name="postalCode" label="郵便番号" required>
        <Input placeholder="100-0001" style={{ maxWidth: "8rem" }} />
      </FormField>
      <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: "var(--spacing-3)" }}>
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
      <FormField name="building" label="建物名 / 部屋番号" description="マンション名・部屋番号があれば入力してください">
        <Input placeholder="○○マンション 101 号室" />
      </FormField>
      <Flex gap="small" justify="end">
        <Button type="submit" variant="primary">保存</Button>
      </Flex>
    </Form>
  ),
};

// ─── Address · horizontal ────────────────────────────────────────

export const AddressHorizontal: Story = {
  name: "Address · horizontal",
  render: () => (
    <Form<AddressValues>
      layout="horizontal"
      resolver={zodResolver(addressSchema)}
      defaultValues={{ postalCode: "", prefecture: "13", city: "", street: "", building: "" }}
      onSubmit={(v) => console.log(v)}
      style={{ maxWidth: 720 }}
    >
      <FormField name="postalCode" label="郵便番号" required>
        <Input placeholder="100-0001" style={{ maxWidth: "10rem" }} />
      </FormField>
      <FormField name="prefecture" label="都道府県" required>
        <Select options={PREFECTURE_OPTIONS} />
      </FormField>
      <FormField name="city" label="市区町村" required>
        <Input placeholder="千代田区" />
      </FormField>
      <FormField name="street" label="番地" required>
        <Input placeholder="1-1-1" />
      </FormField>
      <FormField name="building" label="建物名 / 部屋番号" description="マンション名・部屋番号があれば入力してください">
        <Input placeholder="○○マンション 101 号室" />
      </FormField>
      <Flex gap="small" justify="end">
        <Button type="submit" variant="primary">保存</Button>
      </Flex>
    </Form>
  ),
};

// ─── Phone · vertical ────────────────────────────────────────────

export const PhoneVertical: Story = {
  name: "Phone · vertical (3-col row)",
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
        <Button type="submit" variant="primary">保存</Button>
      </Flex>
    </Form>
  ),
};

// ─── Phone · horizontal ──────────────────────────────────────────

export const PhoneHorizontal: Story = {
  name: "Phone · horizontal",
  render: () => (
    <Form<PhoneValues>
      layout="horizontal"
      resolver={zodResolver(phoneSchema)}
      defaultValues={{ countryCode: "+81", number: "", ext: "" }}
      onSubmit={(v) => console.log(v)}
      style={{ maxWidth: 640 }}
    >
      <FormField name="countryCode" label="国番号" required>
        <Select options={COUNTRY_CODES} />
      </FormField>
      <FormField name="number" label="電話番号" required>
        <Input placeholder="80-1234-5678" />
      </FormField>
      <FormField name="ext" label="内線">
        <Input placeholder="123" style={{ maxWidth: "6rem" }} />
      </FormField>
      <Flex gap="small" justify="end">
        <Button type="submit" variant="primary">保存</Button>
      </Flex>
    </Form>
  ),
};

// ─── WithDescriptions · vertical ─────────────────────────────────

export const WithDescriptionsVertical: Story = {
  name: "With descriptions · vertical",
  render: () => (
    <Form<RegistrationValues>
      resolver={zodResolver(registrationSchema)}
      defaultValues={{ name: "", email: "", age: 18, agree: true }}
      onSubmit={(v) => console.log(v)}
      style={{ maxWidth: 420 }}
    >
      <FormField name="name" label="氏名" required description="戸籍に記載されている氏名を入力してください">
        <Input placeholder="山田 太郎" />
      </FormField>
      <FormField name="email" label="メールアドレス" required description="ログイン ID として使用します。受信できるアドレスを設定してください">
        <Input type="email" placeholder="taro@example.com" />
      </FormField>
      <FormField name="age" label="年齢" required description="18 歳以上のみ登録できます">
        <InputNumber min={0} max={150} />
      </FormField>
      <Flex gap="small" justify="end">
        <Button type="submit" variant="primary">確認</Button>
      </Flex>
    </Form>
  ),
};

// ─── WithDescriptions · horizontal ───────────────────────────────

export const WithDescriptionsHorizontal: Story = {
  name: "With descriptions · horizontal",
  render: () => (
    <Form<RegistrationValues>
      layout="horizontal"
      resolver={zodResolver(registrationSchema)}
      defaultValues={{ name: "", email: "", age: 18, agree: true }}
      onSubmit={(v) => console.log(v)}
      style={{ maxWidth: 720 }}
    >
      <FormField name="name" label="氏名" required description="戸籍に記載されている氏名を入力してください">
        <Input placeholder="山田 太郎" />
      </FormField>
      <FormField name="email" label="メールアドレス" required description="ログイン ID として使用します。受信できるアドレスを設定してください">
        <Input type="email" placeholder="taro@example.com" />
      </FormField>
      <FormField name="age" label="年齢" required description="18 歳以上のみ登録できます">
        <InputNumber min={0} max={150} />
      </FormField>
      <Flex gap="small" justify="end">
        <Button type="submit" variant="primary">確認</Button>
      </Flex>
    </Form>
  ),
};

// ─── WithCounter · vertical (uses Field directly) ───────────────

export const WithCounterVertical: Story = {
  name: "With counter · vertical",
  render: function WithCounterVertical() {
    const [bio, setBio] = useState("プロダクト開発者。マネジメントよりは現場で手を動かしたい派。");
    return (
      <Form defaultValues={{}} onSubmit={(v) => console.log(v)} style={{ maxWidth: 480 }}>
        <Field label="自己紹介" optional count={{ current: bio.length, max: 200 }} help="プロフィール画面に表示されます">
          <Textarea rows={4} maxLength={200} value={bio} onChange={(event) => setBio(event.target.value)} />
        </Field>
        <Flex gap="small" justify="end">
          <Button type="submit" variant="primary">保存</Button>
        </Flex>
      </Form>
    );
  },
};

// ─── WithCounter · horizontal ────────────────────────────────────

export const WithCounterHorizontal: Story = {
  name: "With counter · horizontal",
  render: function WithCounterHorizontal() {
    const [bio, setBio] = useState("プロダクト開発者。マネジメントよりは現場で手を動かしたい派。");
    return (
      <Form layout="horizontal" defaultValues={{}} onSubmit={(v) => console.log(v)} style={{ maxWidth: 720 }}>
        <Field label="自己紹介" optional count={{ current: bio.length, max: 200 }} help="プロフィール画面に表示されます">
          <Textarea rows={4} maxLength={200} value={bio} onChange={(event) => setBio(event.target.value)} />
        </Field>
        <Flex gap="small" justify="end">
          <Button type="submit" variant="primary">保存</Button>
        </Flex>
      </Form>
    );
  },
};

// ─── OptionalMix · vertical ──────────────────────────────────────

export const OptionalMixVertical: Story = {
  name: "Optional mix · vertical",
  render: () => (
    <Form<ProfileValues>
      resolver={zodResolver(profileSchema)}
      defaultValues={{ lastName: "", firstName: "", lastNameKana: "", firstNameKana: "", email: "" }}
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
        <Button type="submit" variant="primary">保存</Button>
      </Flex>
    </Form>
  ),
};

// ─── OptionalMix · horizontal ────────────────────────────────────

export const OptionalMixHorizontal: Story = {
  name: "Optional mix · horizontal",
  render: () => (
    <Form<ProfileValues>
      layout="horizontal"
      resolver={zodResolver(profileSchema)}
      defaultValues={{ lastName: "", firstName: "", lastNameKana: "", firstNameKana: "", email: "" }}
      onSubmit={(v) => console.log(v)}
      style={{ maxWidth: 720 }}
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
        <Button type="submit" variant="primary">保存</Button>
      </Flex>
    </Form>
  ),
};

// ─── Loading · vertical ──────────────────────────────────────────

export const LoadingVertical: Story = {
  name: "Loading · vertical (async submit)",
  render: function LoadingVertical() {
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
          <Button type="submit" variant="primary" loading={submitting}>送信</Button>
        </Flex>
      </Form>
    );
  },
};

// ─── Loading · horizontal ────────────────────────────────────────

export const LoadingHorizontal: Story = {
  name: "Loading · horizontal",
  render: function LoadingHorizontal() {
    const [submitting, setSubmitting] = useState(false);
    return (
      <Form<RegistrationValues>
        layout="horizontal"
        resolver={zodResolver(registrationSchema)}
        defaultValues={{ name: "佐藤 花子", email: "hanako@example.com", age: 28, agree: true }}
        onSubmit={async (values) => {
          setSubmitting(true);
          await new Promise((r) => setTimeout(r, 1500));
          setSubmitting(false);
          console.log("submitted", values);
        }}
        style={{ maxWidth: 640 }}
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
          <Button type="submit" variant="primary" loading={submitting}>送信</Button>
        </Flex>
      </Form>
    );
  },
};

// ─── Settings · horizontal (admin pattern) ───────────────────────

export const SettingsHorizontal: Story = {
  name: "Settings · horizontal (admin pattern)",
  parameters: {
    docs: {
      description: {
        story: "Horizontal layout shines in admin / settings screens — label-on-left makes the key/value pairs read as a config sheet.",
      },
    },
  },
  render: () => (
    <Form<SettingsValues>
      layout="horizontal"
      resolver={zodResolver(settingsSchema)}
      defaultValues={{
        workspaceName: "Acme Forge",
        visibility: "internal",
        defaultLocale: "ja",
        notifyOnComment: true,
        notifyOnMention: true,
        digestFrequency: "weekly",
      }}
      onSubmit={(v) => console.log(v)}
      style={{ maxWidth: 720 }}
    >
      <FormField name="workspaceName" label="ワークスペース名" required>
        <Input placeholder="Acme Forge" />
      </FormField>
      <FormField name="visibility" label="公開範囲" required description="プロジェクトに参加していないメンバーが閲覧できるかを決定します">
        <Select options={VISIBILITY_OPTIONS} />
      </FormField>
      <FormField name="defaultLocale" label="既定の言語">
        <Select options={LOCALE_OPTIONS} />
      </FormField>
      <FormField name="notifyOnComment">
        <Checkbox>コメントが付いたら通知</Checkbox>
      </FormField>
      <FormField name="notifyOnMention">
        <Checkbox>メンションされたら通知</Checkbox>
      </FormField>
      <FormField name="digestFrequency" label="ダイジェスト送信頻度">
        <Select options={DIGEST_OPTIONS} />
      </FormField>
      <Flex gap="small" justify="end">
        <Button type="submit" variant="primary">設定を保存</Button>
      </Flex>
    </Form>
  ),
};

// ─── Inline · single-row filter ──────────────────────────────────

export const InlineFilter: Story = {
  name: "Inline · single-row filter",
  parameters: {
    docs: {
      description: {
        story: "Mobile-first: stacks on xs, single row at sm (≥640px). Common for table filters and search bars.",
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
      <Button type="submit" variant="primary">検索</Button>
    </Form>
  ),
};

// ─── Skeleton · loading initial data ─────────────────────────────

export const SkeletonLoading: Story = {
  name: "Skeleton · loading initial data",
  parameters: {
    docs: {
      description: {
        story: "Form chrome while the consumer fetches its defaults. Each Field shows a Skeleton in place of the control.",
      },
    },
  },
  render: () => (
    <div style={{ display: "grid", gap: "var(--spacing-3)", maxWidth: 360 }}>
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
