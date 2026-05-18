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
import { Card } from "../../components/data-display/Card";
import { Separator } from "../../components/data-display/Separator";
import { Avatar } from "../../components/data-display/Avatar";
import { Typography } from "../../components/general/Typography";
import { AutoComplete } from "../../components/data-entry/AutoComplete";
import { Cascader } from "../../components/data-entry/Cascader";
import { CheckboxGroup } from "../../components/data-entry/CheckboxGroup";
import { ColorPicker } from "../../components/data-entry/ColorPicker";
import { DateField, TimeField } from "../../components/data-entry/DateTimePicker";
import { InputPassword } from "../../components/data-entry/InputPassword";
import { InputSearch } from "../../components/data-entry/InputSearch";
import { RadioGroup } from "../../components/data-entry/Radio";
import { Rate } from "../../components/data-entry/Rate";
import { Slider } from "../../components/data-entry/Slider";
import { Switch } from "../../components/data-entry/Switch";
import { Transfer } from "../../components/data-entry/Transfer";
import { TreeSelect } from "../../components/data-entry/TreeSelect";
import { CalendarDate, Time } from "@internationalized/date";

// ─── Schemas ─────────────────────────────────────────────────────

const signUpSchema = z.object({
  name: z.string().min(1, "氏名は必須です"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z
    .string()
    .min(8, "8 文字以上で入力してください")
    .regex(/[A-Z]/, "大文字を 1 つ以上含めてください")
    .regex(/\d/, "数字を 1 つ以上含めてください"),
  agree: z.literal(true, { message: "利用規約への同意が必要です" }),
});
type SignUpValues = z.infer<typeof signUpSchema>;

const profileSchema = z.object({
  lastName: z.string().min(1, "姓は必須です"),
  firstName: z.string().min(1, "名は必須です"),
  lastNameKana: z.string().optional(),
  firstNameKana: z.string().optional(),
  displayName: z.string().min(1),
  bio: z.string().max(200, "200 文字以内で入力してください").optional(),
});
type ProfileValues = z.infer<typeof profileSchema>;

const settingsSchema = z.object({
  workspaceName: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/, "英小文字・数字・ハイフンのみ"),
  visibility: z.string(),
  defaultLocale: z.string(),
  notifyOnComment: z.boolean(),
  notifyOnMention: z.boolean(),
  notifyOnAssign: z.boolean(),
  digestFrequency: z.string(),
});
type SettingsValues = z.infer<typeof settingsSchema>;

const addressSchema = z.object({
  postalCode: z.string().regex(/^\d{3}-?\d{4}$/, "郵便番号は 7 桁で入力してください"),
  prefecture: z.string().min(1, "都道府県を選択してください"),
  city: z.string().min(1, "市区町村は必須です"),
  street: z.string().min(1, "番地は必須です"),
  building: z.string().optional(),
  shippingMethod: z.string(),
});
type AddressValues = z.infer<typeof addressSchema>;

const phoneSchema = z.object({
  countryCode: z.string().min(1),
  number: z.string().regex(/^[0-9-]+$/, "数字とハイフンのみ"),
  code: z.string().regex(/^\d{6}$/, "6 桁の認証コードを入力してください").optional(),
});
type PhoneValues = z.infer<typeof phoneSchema>;

const projectSchema = z.object({
  name: z.string().min(1, "プロジェクト名は必須です"),
  description: z.string().max(500).optional(),
  team: z.string().min(1),
  visibility: z.string(),
});
type ProjectValues = z.infer<typeof projectSchema>;

const filterSchema = z.object({
  query: z.string().optional(),
  status: z.string().optional(),
  shop: z.string().optional(),
});
type FilterValues = z.infer<typeof filterSchema>;

const deleteSchema = z.object({
  confirm: z.string(),
});

// ─── Option lists ────────────────────────────────────────────────

const PREFECTURE_OPTIONS = [
  { value: "13", label: "東京都" },
  { value: "27", label: "大阪府" },
  { value: "23", label: "愛知県" },
  { value: "14", label: "神奈川県" },
  { value: "01", label: "北海道" },
];

const COUNTRY_CODES = [
  { value: "+81", label: "🇯🇵 +81" },
  { value: "+1", label: "🇺🇸 +1" },
  { value: "+84", label: "🇻🇳 +84" },
  { value: "+63", label: "🇵🇭 +63" },
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
  { value: "private", label: "プライベート — 招待されたメンバーのみ" },
  { value: "internal", label: "社内公開 — Acme Forge メンバー全員" },
  { value: "public", label: "公開 — リンクを知っている全員" },
];

const LOCALE_OPTIONS = [
  { value: "ja", label: "日本語" },
  { value: "en-US", label: "English (US)" },
  { value: "vi", label: "Tiếng Việt" },
  { value: "fil", label: "Filipino" },
];

const DIGEST_OPTIONS = [
  { value: "off", label: "送信しない" },
  { value: "daily", label: "毎朝 9:00 にまとめ送信" },
  { value: "weekly", label: "毎週月曜にまとめ送信" },
];

const TEAM_OPTIONS = [
  { value: "design", label: "Design" },
  { value: "engineering", label: "Engineering" },
  { value: "product", label: "Product" },
  { value: "ops", label: "Ops" },
];

const SHIPPING_OPTIONS = [
  { value: "standard", label: "通常配送 — 3〜5 営業日 (無料)" },
  { value: "express", label: "速達 — 翌日着 (¥800)" },
  { value: "pickup", label: "店舗受け取り — 24 時間以内 (無料)" },
];

const meta: Meta<typeof Form<SignUpValues>> = {
  title: "Data Entry/Form",
  component: Form,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj;

// ─── SignUp · centered card ──────────────────────────────────────

export const SignUp: Story = {
  name: "Sign up · centered onboarding card",
  parameters: { layout: "padded" },
  render: () => (
    <Card
      title="アカウント作成"
      subtitle="30 秒で完了します。後からいつでも変更できます。"
      style={{ maxWidth: 420, margin: "0 auto" }}
    >
      <Form<SignUpValues>
        resolver={zodResolver(signUpSchema)}
        defaultValues={{ name: "", email: "", password: "", agree: false } as unknown as SignUpValues}
        onSubmit={(values) => console.log("signup", values)}
      >
        <FormField name="name" label="氏名" required>
          <Input placeholder="山田 太郎" />
        </FormField>
        <FormField name="email" label="メールアドレス" required>
          <Input type="email" placeholder="taro@example.com" />
        </FormField>
        <FormField
          name="password"
          label="パスワード"
          required
          description="8 文字以上 / 大文字 1 文字以上 / 数字 1 文字以上"
        >
          <Input type="password" placeholder="••••••••" />
        </FormField>
        <FormField name="agree">
          <Checkbox>
            <a href="#" style={{ color: "var(--info)" }}>利用規約</a> と{" "}
            <a href="#" style={{ color: "var(--info)" }}>プライバシーポリシー</a> に同意します
          </Checkbox>
        </FormField>
        <Button type="submit" variant="primary" block>
          アカウントを作成
        </Button>
      </Form>
      <Separator style={{ margin: "var(--spacing-3) 0" }} />
      <Typography.Text color="secondary" style={{ textAlign: "center", display: "block" }}>
        既にアカウントをお持ちですか？{" "}
        <a href="#" style={{ color: "var(--info)" }}>ログイン</a>
      </Typography.Text>
    </Card>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("typing the name updates the input", async () => {
      const name = canvas.getByPlaceholderText("山田 太郎") as HTMLInputElement;
      await userEvent.type(name, "佐藤");
      await expect(name.value).toBe("佐藤");
    });
  },
};

// ─── ProfileEdit · vertical ──────────────────────────────────────

export const ProfileEditVertical: Story = {
  name: "Profile edit · vertical",
  parameters: { layout: "padded" },
  render: () => (
    <Card
      title="プロフィール"
      subtitle="他のメンバーに公開される情報です。"
      style={{ maxWidth: 640 }}
    >
      <Form<ProfileValues>
        resolver={zodResolver(profileSchema)}
        defaultValues={{
          lastName: "山田",
          firstName: "太郎",
          lastNameKana: "ヤマダ",
          firstNameKana: "タロウ",
          displayName: "Taro Y.",
          bio: "プロダクト開発者。マネジメントよりは現場で手を動かしたい派。",
        }}
        onSubmit={(v) => console.log(v)}
      >
        <Flex align="center" gap="middle" style={{ marginBottom: "var(--spacing-2)" }}>
          <Avatar size="lg" alt="山田 太郎" />
          <Flex vertical gap={2}>
            <Button variant="outline" size="small" type="button">写真を変更</Button>
            <Typography.Text color="secondary" style={{ fontSize: "var(--text-xs)" }}>
              JPG / PNG, 最大 2MB
            </Typography.Text>
          </Flex>
        </Flex>
        <div className="grid grid-cols-2" style={{ gap: "var(--spacing-3)" }}>
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
        <FormField
          name="displayName"
          label="表示名"
          required
          description="メンション (@) やコメント欄に表示されます"
        >
          <Input placeholder="Taro Y." />
        </FormField>
        <FormField
          name="bio"
          label="自己紹介"
          optional
          description="200 文字まで。プロフィール画面に表示されます"
        >
          <Textarea rows={3} maxLength={200} placeholder="例: フロントエンドエンジニア。React と TypeScript が好きです。" />
        </FormField>
        <Separator />
        <Flex gap="small" justify="end">
          <Button variant="ghost" type="button">キャンセル</Button>
          <Button type="submit" variant="primary">保存</Button>
        </Flex>
      </Form>
    </Card>
  ),
};

// ─── ProfileEdit · horizontal ────────────────────────────────────

export const ProfileEditHorizontal: Story = {
  name: "Profile edit · horizontal",
  parameters: { layout: "padded" },
  render: () => (
    <Card
      title="プロフィール"
      subtitle="他のメンバーに公開される情報です。"
      style={{ maxWidth: 820 }}
    >
      <Form<ProfileValues>
        layout="horizontal"
        resolver={zodResolver(profileSchema)}
        defaultValues={{
          lastName: "山田",
          firstName: "太郎",
          lastNameKana: "ヤマダ",
          firstNameKana: "タロウ",
          displayName: "Taro Y.",
          bio: "プロダクト開発者。マネジメントよりは現場で手を動かしたい派。",
        }}
        onSubmit={(v) => console.log(v)}
      >
        <Field label="プロフィール写真">
          <Flex align="center" gap="middle">
            <Avatar size="lg" alt="山田 太郎" />
            <Flex vertical gap={2}>
              <Button variant="outline" size="small" type="button">写真を変更</Button>
              <Typography.Text color="secondary" style={{ fontSize: "var(--text-xs)" }}>
                JPG / PNG, 最大 2MB
              </Typography.Text>
            </Flex>
          </Flex>
        </Field>
        <div className="grid grid-cols-2" style={{ gap: "var(--spacing-3)" }}>
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
        <FormField name="displayName" label="表示名" required description="メンション (@) やコメント欄に表示されます">
          <Input placeholder="Taro Y." />
        </FormField>
        <FormField name="bio" label="自己紹介" optional description="200 文字まで。プロフィール画面に表示されます">
          <Textarea rows={3} maxLength={200} />
        </FormField>
        <Separator />
        <Flex gap="small" justify="end">
          <Button variant="ghost" type="button">キャンセル</Button>
          <Button type="submit" variant="primary">保存</Button>
        </Flex>
      </Form>
    </Card>
  ),
};

// ─── WorkspaceSettings · vertical (sectioned) ────────────────────

export const WorkspaceSettingsVertical: Story = {
  name: "Workspace settings · vertical (sectioned)",
  parameters: { layout: "padded" },
  render: () => (
    <Card
      title="ワークスペース設定"
      subtitle="Acme Forge · /acme-forge"
      style={{ maxWidth: 720 }}
    >
      <Form<SettingsValues>
        resolver={zodResolver(settingsSchema)}
        defaultValues={{
          workspaceName: "Acme Forge",
          slug: "acme-forge",
          visibility: "internal",
          defaultLocale: "ja",
          notifyOnComment: true,
          notifyOnMention: true,
          notifyOnAssign: false,
          digestFrequency: "weekly",
        }}
        onSubmit={(v) => console.log(v)}
      >
        <Typography.Title size={5}>基本情報</Typography.Title>
        <FormField name="workspaceName" label="ワークスペース名" required>
          <Input placeholder="Acme Forge" />
        </FormField>
        <FormField
          name="slug"
          label="スラッグ"
          required
          description="URL に使われます: app.godx.jp/{slug}"
        >
          <Input placeholder="acme-forge" />
        </FormField>

        <Separator />
        <Typography.Title size={5}>公開範囲</Typography.Title>
        <FormField
          name="visibility"
          label="閲覧範囲"
          required
          description="プロジェクトに参加していないメンバーが閲覧できるかを決定します"
        >
          <Select options={VISIBILITY_OPTIONS} />
        </FormField>
        <FormField name="defaultLocale" label="既定の言語">
          <Select options={LOCALE_OPTIONS} />
        </FormField>

        <Separator />
        <Typography.Title size={5}>通知</Typography.Title>
        <FormField name="notifyOnComment">
          <Checkbox>コメントが付いたら通知</Checkbox>
        </FormField>
        <FormField name="notifyOnMention">
          <Checkbox>自分がメンションされたら通知</Checkbox>
        </FormField>
        <FormField name="notifyOnAssign">
          <Checkbox>タスクが割り当てられたら通知</Checkbox>
        </FormField>
        <FormField
          name="digestFrequency"
          label="ダイジェスト"
          description="未読の通知をまとめたメールを送信します"
        >
          <Select options={DIGEST_OPTIONS} />
        </FormField>

        <Separator />
        <Flex gap="small" justify="end">
          <Button variant="ghost" type="button">変更を破棄</Button>
          <Button type="submit" variant="primary">設定を保存</Button>
        </Flex>
      </Form>
    </Card>
  ),
};

// ─── WorkspaceSettings · horizontal ──────────────────────────────

export const WorkspaceSettingsHorizontal: Story = {
  name: "Workspace settings · horizontal",
  parameters: { layout: "padded" },
  render: () => (
    <Card
      title="ワークスペース設定"
      subtitle="Acme Forge · /acme-forge"
      style={{ maxWidth: 820 }}
    >
      <Form<SettingsValues>
        layout="horizontal"
        resolver={zodResolver(settingsSchema)}
        defaultValues={{
          workspaceName: "Acme Forge",
          slug: "acme-forge",
          visibility: "internal",
          defaultLocale: "ja",
          notifyOnComment: true,
          notifyOnMention: true,
          notifyOnAssign: false,
          digestFrequency: "weekly",
        }}
        onSubmit={(v) => console.log(v)}
      >
        <Typography.Title size={5}>基本情報</Typography.Title>
        <FormField name="workspaceName" label="名前" required>
          <Input placeholder="Acme Forge" />
        </FormField>
        <FormField name="slug" label="スラッグ" required description="URL に使われます: app.godx.jp/{slug}">
          <Input placeholder="acme-forge" />
        </FormField>

        <Separator />
        <Typography.Title size={5}>公開範囲</Typography.Title>
        <FormField name="visibility" label="閲覧範囲" required>
          <Select options={VISIBILITY_OPTIONS} />
        </FormField>
        <FormField name="defaultLocale" label="既定の言語">
          <Select options={LOCALE_OPTIONS} />
        </FormField>

        <Separator />
        <Typography.Title size={5}>通知</Typography.Title>
        <FormField name="notifyOnComment" label="コメント">
          <Checkbox>コメントが付いたら通知</Checkbox>
        </FormField>
        <FormField name="notifyOnMention" label="メンション">
          <Checkbox>自分がメンションされたら通知</Checkbox>
        </FormField>
        <FormField name="notifyOnAssign" label="アサイン">
          <Checkbox>タスクが割り当てられたら通知</Checkbox>
        </FormField>
        <FormField name="digestFrequency" label="ダイジェスト">
          <Select options={DIGEST_OPTIONS} />
        </FormField>

        <Separator />
        <Flex gap="small" justify="end">
          <Button variant="ghost" type="button">変更を破棄</Button>
          <Button type="submit" variant="primary">設定を保存</Button>
        </Flex>
      </Form>
    </Card>
  ),
};

// ─── AddressCheckout · vertical ──────────────────────────────────

export const AddressCheckoutVertical: Story = {
  name: "Checkout address · vertical",
  parameters: { layout: "padded" },
  render: () => (
    <Card
      title="配送先住所"
      subtitle="ご注文の配送先と配送方法を選択してください。"
      style={{ maxWidth: 640 }}
    >
      <Form<AddressValues>
        resolver={zodResolver(addressSchema)}
        defaultValues={{
          postalCode: "100-0001",
          prefecture: "13",
          city: "千代田区",
          street: "1-1-1",
          building: "",
          shippingMethod: "standard",
        }}
        onSubmit={(v) => console.log(v)}
      >
        <Flex align="end" gap="small">
          <FormField name="postalCode" label="郵便番号" required>
            <Input placeholder="100-0001" style={{ width: "10rem" }} />
          </FormField>
          <Button type="button" variant="outline">住所を検索</Button>
        </Flex>
        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "var(--spacing-3)" }}>
          <FormField name="prefecture" label="都道府県" required>
            <Select options={PREFECTURE_OPTIONS} />
          </FormField>
          <FormField name="city" label="市区町村" required>
            <Input placeholder="千代田区" />
          </FormField>
        </div>
        <FormField name="street" label="番地" required>
          <Input placeholder="1-1-1" />
        </FormField>
        <FormField name="building" label="建物名・部屋番号" optional>
          <Input placeholder="○○マンション 101 号室" />
        </FormField>

        <Separator />
        <Typography.Title size={5}>配送方法</Typography.Title>
        <FormField name="shippingMethod" label="">
          <Select options={SHIPPING_OPTIONS} />
        </FormField>

        <Separator />
        <Flex gap="small" justify="end">
          <Button variant="ghost" type="button">カートに戻る</Button>
          <Button type="submit" variant="primary">この住所で続行</Button>
        </Flex>
      </Form>
    </Card>
  ),
};

// ─── AddressCheckout · horizontal ────────────────────────────────

export const AddressCheckoutHorizontal: Story = {
  name: "Checkout address · horizontal",
  parameters: { layout: "padded" },
  render: () => (
    <Card
      title="配送先住所"
      subtitle="ご注文の配送先と配送方法を選択してください。"
      style={{ maxWidth: 820 }}
    >
      <Form<AddressValues>
        layout="horizontal"
        resolver={zodResolver(addressSchema)}
        defaultValues={{
          postalCode: "100-0001",
          prefecture: "13",
          city: "千代田区",
          street: "1-1-1",
          building: "",
          shippingMethod: "standard",
        }}
        onSubmit={(v) => console.log(v)}
      >
        <FormField name="postalCode" label="郵便番号" required>
          <Flex gap="small" align="center">
            <Input placeholder="100-0001" style={{ width: "10rem" }} />
            <Button type="button" variant="outline" size="small">住所を検索</Button>
          </Flex>
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
        <FormField name="building" label="建物名・部屋番号" optional>
          <Input placeholder="○○マンション 101 号室" />
        </FormField>
        <FormField name="shippingMethod" label="配送方法">
          <Select options={SHIPPING_OPTIONS} />
        </FormField>

        <Separator />
        <Flex gap="small" justify="end">
          <Button variant="ghost" type="button">カートに戻る</Button>
          <Button type="submit" variant="primary">この住所で続行</Button>
        </Flex>
      </Form>
    </Card>
  ),
};

// ─── PhoneVerify · vertical ──────────────────────────────────────

export const PhoneVerifyVertical: Story = {
  name: "Phone verify · vertical",
  parameters: { layout: "padded" },
  render: () => (
    <Card
      title="電話番号認証"
      subtitle="入力された電話番号に SMS で 6 桁の認証コードを送信します。"
      style={{ maxWidth: 480 }}
    >
      <Form<PhoneValues>
        resolver={zodResolver(phoneSchema)}
        defaultValues={{ countryCode: "+81", number: "", code: "" }}
        onSubmit={(v) => console.log(v)}
      >
        <Field label="電話番号" required>
          <Flex gap="small" align="center">
            <FormField name="countryCode" label="">
              <Select options={COUNTRY_CODES} />
            </FormField>
            <FormField name="number" label="">
              <Input placeholder="80-1234-5678" />
            </FormField>
          </Flex>
        </Field>
        <Button type="button" variant="outline" block>
          認証コードを送信
        </Button>

        <Separator />
        <FormField name="code" label="認証コード" description="SMS で届いた 6 桁のコードを入力してください">
          <Input placeholder="123456" style={{ letterSpacing: "0.25em", fontFamily: "var(--font-mono)" }} />
        </FormField>

        <Separator />
        <Flex gap="small" justify="end">
          <Button variant="ghost" type="button">戻る</Button>
          <Button type="submit" variant="primary">認証する</Button>
        </Flex>
      </Form>
    </Card>
  ),
};

// ─── PhoneVerify · horizontal ────────────────────────────────────

export const PhoneVerifyHorizontal: Story = {
  name: "Phone verify · horizontal",
  parameters: { layout: "padded" },
  render: () => (
    <Card
      title="電話番号認証"
      subtitle="入力された電話番号に SMS で 6 桁の認証コードを送信します。"
      style={{ maxWidth: 720 }}
    >
      <Form<PhoneValues>
        layout="horizontal"
        resolver={zodResolver(phoneSchema)}
        defaultValues={{ countryCode: "+81", number: "", code: "" }}
        onSubmit={(v) => console.log(v)}
      >
        <Field label="電話番号" required>
          <Flex gap="small" align="center">
            <FormField name="countryCode" label="">
              <Select options={COUNTRY_CODES} />
            </FormField>
            <FormField name="number" label="">
              <Input placeholder="80-1234-5678" />
            </FormField>
            <Button type="button" variant="outline" size="small">認証コードを送信</Button>
          </Flex>
        </Field>
        <FormField name="code" label="認証コード" description="SMS で届いた 6 桁のコードを入力してください">
          <Input placeholder="123456" style={{ letterSpacing: "0.25em", fontFamily: "var(--font-mono)" }} />
        </FormField>

        <Separator />
        <Flex gap="small" justify="end">
          <Button variant="ghost" type="button">戻る</Button>
          <Button type="submit" variant="primary">認証する</Button>
        </Flex>
      </Form>
    </Card>
  ),
};

// ─── NewProject · modal-style ────────────────────────────────────

export const NewProject: Story = {
  name: "New project · modal-style card",
  parameters: { layout: "padded" },
  render: () => (
    <Card
      title="新規プロジェクト"
      subtitle="プロジェクトの基本情報を入力してください。"
      style={{ maxWidth: 520 }}
    >
      <Form<ProjectValues>
        resolver={zodResolver(projectSchema)}
        defaultValues={{ name: "", description: "", team: "engineering", visibility: "private" }}
        onSubmit={(v) => console.log(v)}
      >
        <FormField name="name" label="プロジェクト名" required>
          <Input placeholder="例: 2026 Q2 リブランディング" />
        </FormField>
        <FormField name="description" label="説明" optional>
          <Textarea rows={3} maxLength={500} placeholder="プロジェクトの目的・スコープを入力してください" />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "var(--spacing-3)" }}>
          <FormField name="team" label="チーム" required>
            <Select options={TEAM_OPTIONS} />
          </FormField>
          <FormField name="visibility" label="公開範囲">
            <Select options={VISIBILITY_OPTIONS.slice(0, 2)} />
          </FormField>
        </div>

        <Separator />
        <Flex gap="small" justify="end">
          <Button variant="ghost" type="button">キャンセル</Button>
          <Button type="submit" variant="primary">プロジェクトを作成</Button>
        </Flex>
      </Form>
    </Card>
  ),
};

// ─── FilterBar · inline above table ──────────────────────────────

export const FilterBar: Story = {
  name: "Filter bar · inline above table",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story:
          "Inline form used as a filter bar above a table. Mobile-first: stacks on xs, single row at sm. Reset is a `ghost` button, search is `primary`.",
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
        <Input placeholder="名前 / メール / 電話番号" style={{ width: "16rem" }} />
      </FormField>
      <FormField name="status" label="ステータス">
        <Select options={STATUS_OPTIONS} />
      </FormField>
      <FormField name="shop" label="店舗">
        <Select options={SHOP_OPTIONS} />
      </FormField>
      <Button type="submit" variant="primary">検索</Button>
      <Button type="reset" variant="ghost">リセット</Button>
    </Form>
  ),
};

// ─── ValidationErrors · all states visible ───────────────────────

export const ValidationErrors: Story = {
  name: "Validation errors · all visible",
  parameters: { layout: "padded" },
  render: () => (
    <Card
      title="アカウント作成"
      subtitle="入力エラーをまとめて表示するモードです。"
      style={{ maxWidth: 420 }}
    >
      <Form<SignUpValues>
        resolver={zodResolver(signUpSchema)}
        defaultValues={
          { name: "", email: "not-an-email", password: "weak", agree: false } as unknown as SignUpValues
        }
        mode="onChange"
        onSubmit={(v) => console.log(v)}
      >
        <FormField name="name" label="氏名" required>
          <Input placeholder="山田 太郎" />
        </FormField>
        <FormField name="email" label="メールアドレス" required>
          <Input type="email" placeholder="taro@example.com" />
        </FormField>
        <FormField
          name="password"
          label="パスワード"
          required
          description="8 文字以上 / 大文字 1 文字以上 / 数字 1 文字以上"
        >
          <Input type="password" />
        </FormField>
        <FormField name="agree">
          <Checkbox>利用規約に同意する</Checkbox>
        </FormField>
        <Button type="submit" variant="primary" block>
          アカウントを作成
        </Button>
      </Form>
    </Card>
  ),
};

// ─── LoadingSubmit · async submit ────────────────────────────────

export const LoadingSubmit: Story = {
  name: "Loading · async submit",
  parameters: { layout: "padded" },
  render: function LoadingSubmit() {
    const [submitting, setSubmitting] = useState(false);
    return (
      <Card
        title="プロフィール"
        subtitle="変更を保存中はフォームを編集できません。"
        style={{ maxWidth: 640 }}
      >
        <Form<ProfileValues>
          resolver={zodResolver(profileSchema)}
          defaultValues={{
            lastName: "山田",
            firstName: "太郎",
            lastNameKana: "ヤマダ",
            firstNameKana: "タロウ",
            displayName: "Taro Y.",
            bio: "プロダクト開発者。",
          }}
          onSubmit={async (values) => {
            setSubmitting(true);
            await new Promise((r) => setTimeout(r, 1800));
            setSubmitting(false);
            console.log("saved", values);
          }}
        >
          <div className="grid grid-cols-2" style={{ gap: "var(--spacing-3)" }}>
            <FormField name="lastName" label="姓" required>
              <Input disabled={submitting} />
            </FormField>
            <FormField name="firstName" label="名" required>
              <Input disabled={submitting} />
            </FormField>
          </div>
          <FormField name="displayName" label="表示名" required>
            <Input disabled={submitting} />
          </FormField>
          <FormField name="bio" label="自己紹介" optional>
            <Textarea rows={3} maxLength={200} disabled={submitting} />
          </FormField>

          <Separator />
          <Flex gap="small" justify="end">
            <Button variant="ghost" type="button" disabled={submitting}>キャンセル</Button>
            <Button type="submit" variant="primary" loading={submitting}>保存</Button>
          </Flex>
        </Form>
      </Card>
    );
  },
};

// ─── DangerZone · destructive action ─────────────────────────────

export const DangerZone: Story = {
  name: "Danger zone · destructive action",
  parameters: { layout: "padded" },
  render: () => (
    <Card
      title="プロジェクトを削除"
      subtitle="削除すると、関連するすべてのタスク・コメント・添付ファイルが復元できなくなります。"
      accent="destructive"
      style={{ maxWidth: 560 }}
    >
      <Form
        resolver={zodResolver(deleteSchema)}
        defaultValues={{ confirm: "" }}
        onSubmit={(v) => console.log(v)}
      >
        <FormField
          name="confirm"
          label='確認のため "acme-forge" と入力してください'
          required
        >
          <Input placeholder="acme-forge" />
        </FormField>

        <Separator />
        <Flex gap="small" justify="end">
          <Button variant="ghost" type="button">キャンセル</Button>
          <Button type="submit" variant="destructive">プロジェクトを完全に削除</Button>
        </Flex>
      </Form>
    </Card>
  ),
};

// ─── SkeletonState · loading initial data ───────────────────────

export const SkeletonState: Story = {
  name: "Skeleton · loading initial data",
  parameters: { layout: "padded" },
  render: () => (
    <Card style={{ maxWidth: 640 }}>
      <Skeleton className="h-6 w-48 rounded-md" />
      <Skeleton className="h-4 w-72 rounded-sm" style={{ marginTop: 6 }} />
      <Separator style={{ margin: "var(--spacing-3) 0" }} />
      <div className="grid grid-cols-2" style={{ gap: "var(--spacing-3)" }}>
        <Field label="姓" required>
          <Skeleton className="h-9 w-full rounded-md" />
        </Field>
        <Field label="名" required>
          <Skeleton className="h-9 w-full rounded-md" />
        </Field>
      </div>
      <Field label="表示名" required>
        <Skeleton className="h-9 w-full rounded-md" />
      </Field>
      <Field label="自己紹介">
        <Skeleton className="h-20 w-full rounded-md" />
      </Field>
      <Separator />
      <Flex gap="small" justify="end">
        <Skeleton className="h-9 w-20 rounded-md" />
        <Skeleton className="h-9 w-20 rounded-md" />
      </Flex>
    </Card>
  ),
};

// ─── EventRegistration — DateField + TimeField + Select + CheckboxGroup ─

const eventSchema = z.object({
  ticketType: z.string(),
  dietary: z.array(z.string()).optional(),
  notes: z.string().max(300).optional(),
});
type EventValues = z.infer<typeof eventSchema>;

const TICKET_OPTIONS = [
  { value: "general", label: "一般 — ¥3,000" },
  { value: "student", label: "学生 — ¥1,500" },
  { value: "vip", label: "VIP — ¥10,000" },
];
const DIETARY_OPTIONS = [
  { value: "veg", label: "ベジタリアン" },
  { value: "halal", label: "ハラール" },
  { value: "gluten-free", label: "グルテンフリー" },
  { value: "allergy", label: "食物アレルギー" },
];

export const EventRegistration: Story = {
  name: "Event registration · DateField + TimeField + CheckboxGroup",
  parameters: { layout: "padded" },
  render: () => (
    <Card
      title="イベント参加登録"
      subtitle="2026 GoDX Forge Conf · Tokyo"
      style={{ maxWidth: 640 }}
    >
      <Form<EventValues>
        resolver={zodResolver(eventSchema)}
        defaultValues={{ ticketType: "general", dietary: [], notes: "" }}
        onSubmit={(v) => console.log(v)}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "var(--spacing-3)" }}>
          <Field label="参加日" required>
            <DateField defaultValue={new CalendarDate(2026, 6, 12)} />
          </Field>
          <div className="grid grid-cols-2" style={{ gap: "var(--spacing-3)" }}>
            <Field label="開始時刻">
              <TimeField defaultValue={new Time(10, 0)} />
            </Field>
            <Field label="終了時刻">
              <TimeField defaultValue={new Time(18, 0)} />
            </Field>
          </div>
        </div>
        <FormField name="ticketType" label="チケット種別" required>
          <Select options={TICKET_OPTIONS} />
        </FormField>
        <FormField name="dietary" label="食事の制限" optional description="該当する項目をすべて選択してください">
          <CheckboxGroup options={DIETARY_OPTIONS} />
        </FormField>
        <FormField name="notes" label="備考" optional>
          <Textarea rows={3} maxLength={300} placeholder="アクセシビリティ要件・付き添い者など" />
        </FormField>

        <Separator />
        <Flex gap="small" justify="end">
          <Button variant="ghost" type="button">キャンセル</Button>
          <Button type="submit" variant="primary">参加登録</Button>
        </Flex>
      </Form>
    </Card>
  ),
};

// ─── ProductReview — Rate + RadioGroup + Textarea + Switch ───────

const reviewSchema = z.object({
  rating: z.number().min(1, "評価を選択してください"),
  recommend: z.string(),
  review: z.string().min(10, "10 文字以上で入力してください"),
  publicReview: z.boolean(),
});
type ReviewValues = z.infer<typeof reviewSchema>;

const RECOMMEND_OPTIONS = [
  { value: "definitely", label: "強くおすすめする" },
  { value: "maybe", label: "条件付きでおすすめする" },
  { value: "no", label: "おすすめしない" },
];

export const ProductReview: Story = {
  name: "Product review · Rate + RadioGroup + Switch",
  parameters: { layout: "padded" },
  render: () => (
    <Card
      title="レビューを投稿"
      subtitle="購入された商品の感想を教えてください。"
      style={{ maxWidth: 560 }}
    >
      <Form<ReviewValues>
        resolver={zodResolver(reviewSchema)}
        defaultValues={{ rating: 4, recommend: "definitely", review: "", publicReview: true }}
        onSubmit={(v) => console.log(v)}
      >
        <FormField name="rating" label="総合評価" required>
          <Rate count={5} />
        </FormField>
        <FormField name="recommend" label="他の人に勧めますか?" required>
          <RadioGroup options={RECOMMEND_OPTIONS} />
        </FormField>
        <FormField name="review" label="レビュー本文" required description="10 文字以上で具体的に">
          <Textarea rows={4} maxLength={500} placeholder="使い心地・気に入った点・改善してほしい点など" />
        </FormField>
        <FormField name="publicReview" label="公開設定">
          <Switch />
        </FormField>

        <Separator />
        <Flex gap="small" justify="end">
          <Button variant="ghost" type="button">下書き保存</Button>
          <Button type="submit" variant="primary">レビューを投稿</Button>
        </Flex>
      </Form>
    </Card>
  ),
};

// ─── PricingPlan — Slider + InputNumber + Switch ─────────────────

const pricingSchema = z.object({
  monthlyPrice: z.number().min(0).max(50000),
  maxUsers: z.number().min(1).max(1000),
  autoRenew: z.boolean(),
  billingNotice: z.boolean(),
  trialEnabled: z.boolean(),
});
type PricingValues = z.infer<typeof pricingSchema>;

export const PricingPlan: Story = {
  name: "Pricing plan · Slider + Switch toggles",
  parameters: { layout: "padded" },
  render: () => (
    <Card
      title="プラン設定"
      subtitle="チーム規模と機能に合わせて調整できます。"
      style={{ maxWidth: 640 }}
    >
      <Form<PricingValues>
        resolver={zodResolver(pricingSchema)}
        defaultValues={{
          monthlyPrice: 12000,
          maxUsers: 25,
          autoRenew: true,
          billingNotice: true,
          trialEnabled: false,
        }}
        onSubmit={(v) => console.log(v)}
      >
        <FormField name="monthlyPrice" label="月額料金 (円)" description="0〜50,000 円の範囲で設定できます">
          <Slider min={0} max={50000} step={500} />
        </FormField>
        <FormField name="maxUsers" label="最大ユーザー数">
          <InputNumber min={1} max={1000} step={5} />
        </FormField>

        <Separator />
        <Typography.Title size={5}>支払い設定</Typography.Title>
        <FormField name="autoRenew" label="自動更新">
          <Switch />
        </FormField>
        <FormField name="billingNotice" label="支払い通知" description="課金 3 日前にメール通知します">
          <Switch />
        </FormField>
        <FormField name="trialEnabled" label="無料トライアル" description="初月を無料に設定します">
          <Switch />
        </FormField>

        <Separator />
        <Flex gap="small" justify="end">
          <Button variant="ghost" type="button">キャンセル</Button>
          <Button type="submit" variant="primary">プランを保存</Button>
        </Flex>
      </Form>
    </Card>
  ),
};

// ─── ThemeBranding — ColorPicker + Select ────────────────────────

const brandingSchema = z.object({
  primaryColor: z.string(),
  accentColor: z.string(),
  fontFamily: z.string(),
  darkModeDefault: z.boolean(),
});
type BrandingValues = z.infer<typeof brandingSchema>;

const FONT_OPTIONS = [
  { value: "inter", label: "Inter (sans-serif)" },
  { value: "ibm-plex", label: "IBM Plex Sans" },
  { value: "noto-sans-jp", label: "Noto Sans JP" },
  { value: "geist", label: "Geist" },
];

export const ThemeBranding: Story = {
  name: "Theme branding · ColorPicker + Switch",
  parameters: { layout: "padded" },
  render: () => (
    <Card
      title="ブランドカスタマイズ"
      subtitle="ワークスペース全体のテーマを設定します。"
      style={{ maxWidth: 560 }}
    >
      <Form<BrandingValues>
        resolver={zodResolver(brandingSchema)}
        defaultValues={{
          primaryColor: "#3b82f6",
          accentColor: "#10b981",
          fontFamily: "inter",
          darkModeDefault: false,
        }}
        onSubmit={(v) => console.log(v)}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "var(--spacing-3)" }}>
          <FormField name="primaryColor" label="プライマリカラー" description="ボタン・リンクに使用">
            <ColorPicker />
          </FormField>
          <FormField name="accentColor" label="アクセントカラー" description="ハイライト・タグに使用">
            <ColorPicker />
          </FormField>
        </div>
        <FormField name="fontFamily" label="フォント">
          <Select options={FONT_OPTIONS} />
        </FormField>
        <FormField name="darkModeDefault" label="ダークモードをデフォルト">
          <Switch />
        </FormField>

        <Separator />
        <Flex gap="small" justify="end">
          <Button variant="ghost" type="button">既定値に戻す</Button>
          <Button type="submit" variant="primary">テーマを適用</Button>
        </Flex>
      </Form>
    </Card>
  ),
};

// ─── TeamInvite — RadioGroup + CheckboxGroup ─────────────────────

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.string(),
  permissions: z.array(z.string()),
  message: z.string().optional(),
});
type InviteValues = z.infer<typeof inviteSchema>;

const ROLE_OPTIONS = [
  { value: "owner", label: "Owner — 全権限" },
  { value: "admin", label: "Admin — メンバー管理 + 設定変更" },
  { value: "member", label: "Member — プロジェクト編集" },
  { value: "guest", label: "Guest — 閲覧のみ" },
];

const PERMISSION_OPTIONS = [
  { value: "billing", label: "請求情報の閲覧" },
  { value: "analytics", label: "アナリティクスへのアクセス" },
  { value: "export", label: "データのエクスポート" },
  { value: "delete", label: "プロジェクトの削除" },
];

export const TeamInvite: Story = {
  name: "Team invite · RadioGroup + CheckboxGroup",
  parameters: { layout: "padded" },
  render: () => (
    <Card
      title="メンバーを招待"
      subtitle="Acme Forge ワークスペースに新しいメンバーを追加します。"
      style={{ maxWidth: 560 }}
    >
      <Form<InviteValues>
        resolver={zodResolver(inviteSchema)}
        defaultValues={{
          email: "",
          role: "member",
          permissions: ["analytics"],
          message: "",
        }}
        onSubmit={(v) => console.log(v)}
      >
        <FormField name="email" label="招待先メールアドレス" required>
          <Input type="email" placeholder="hanako@example.com" />
        </FormField>
        <FormField name="role" label="役割" required>
          <RadioGroup options={ROLE_OPTIONS} orientation="vertical" />
        </FormField>
        <FormField name="permissions" label="追加権限" description="役割に加えて個別に許可する操作">
          <CheckboxGroup options={PERMISSION_OPTIONS} />
        </FormField>
        <FormField name="message" label="招待メッセージ" optional>
          <Textarea rows={3} placeholder="任意のメッセージ (例: チームへようこそ!)" />
        </FormField>

        <Separator />
        <Flex gap="small" justify="end">
          <Button variant="ghost" type="button">キャンセル</Button>
          <Button type="submit" variant="primary">招待を送信</Button>
        </Flex>
      </Form>
    </Card>
  ),
};

// ─── CategoryCascader — nested category picker ───────────────────

const CATEGORY_TREE = [
  {
    value: "electronics",
    label: "電子機器",
    children: [
      {
        value: "phones",
        label: "スマートフォン",
        children: [
          { value: "iphone", label: "iPhone" },
          { value: "android", label: "Android" },
        ],
      },
      {
        value: "laptops",
        label: "ノート PC",
        children: [
          { value: "macbook", label: "MacBook" },
          { value: "thinkpad", label: "ThinkPad" },
        ],
      },
    ],
  },
  {
    value: "apparel",
    label: "ファッション",
    children: [
      {
        value: "mens",
        label: "メンズ",
        children: [
          { value: "shirts", label: "シャツ" },
          { value: "shoes", label: "靴" },
        ],
      },
    ],
  },
];

const cascaderSchema = z.object({
  category: z.array(z.string()).min(1, "カテゴリを選択してください"),
  sku: z.string().min(1),
});
type CascaderValues = z.infer<typeof cascaderSchema>;

export const CategoryCascader: Story = {
  name: "Category cascader · nested picker",
  parameters: { layout: "padded" },
  render: () => (
    <Card
      title="商品カテゴリ"
      subtitle="3 階層から商品の所属カテゴリを選択します。"
      style={{ maxWidth: 520 }}
    >
      <Form<CascaderValues>
        resolver={zodResolver(cascaderSchema)}
        defaultValues={{ category: ["electronics", "phones", "iphone"], sku: "" }}
        onSubmit={(v) => console.log(v)}
      >
        <FormField name="category" label="カテゴリ" required>
          <Cascader options={CATEGORY_TREE} placeholder="カテゴリを選択..." />
        </FormField>
        <FormField name="sku" label="SKU" required>
          <Input placeholder="例: IPH15-256-BLK" />
        </FormField>

        <Separator />
        <Flex gap="small" justify="end">
          <Button variant="ghost" type="button">キャンセル</Button>
          <Button type="submit" variant="primary">商品を登録</Button>
        </Flex>
      </Form>
    </Card>
  ),
};

// ─── PermissionsTree — TreeSelect for nested resources ───────────

const RESOURCE_TREE = [
  {
    value: "workspace",
    label: "ワークスペース",
    children: [
      {
        value: "projects",
        label: "プロジェクト",
        children: [
          { value: "projects.read", label: "閲覧" },
          { value: "projects.write", label: "編集" },
          { value: "projects.delete", label: "削除" },
        ],
      },
      {
        value: "members",
        label: "メンバー",
        children: [
          { value: "members.read", label: "閲覧" },
          { value: "members.invite", label: "招待" },
          { value: "members.remove", label: "削除" },
        ],
      },
    ],
  },
  {
    value: "billing",
    label: "課金",
    children: [
      { value: "billing.read", label: "閲覧" },
      { value: "billing.write", label: "編集" },
    ],
  },
];

const permSchema = z.object({
  resources: z.array(z.string()).min(1, "1 つ以上の権限を選択してください"),
});
type PermValues = z.infer<typeof permSchema>;

export const PermissionsTree: Story = {
  name: "Permissions tree · TreeSelect",
  parameters: { layout: "padded" },
  render: () => (
    <Card
      title="API キーの権限"
      subtitle="このキーがアクセスできるリソースを選択します。"
      style={{ maxWidth: 560 }}
    >
      <Form<PermValues>
        resolver={zodResolver(permSchema)}
        defaultValues={{ resources: ["projects.read", "members.read"] }}
        onSubmit={(v) => console.log(v)}
      >
        <FormField name="resources" label="許可するリソース" required>
          <TreeSelect options={RESOURCE_TREE} multiple placeholder="リソースを選択..." />
        </FormField>

        <Separator />
        <Flex gap="small" justify="end">
          <Button variant="ghost" type="button">キャンセル</Button>
          <Button type="submit" variant="primary">API キーを作成</Button>
        </Flex>
      </Form>
    </Card>
  ),
};

// ─── MemberTransfer — Transfer for moving members between groups ─

const ALL_MEMBERS = [
  { key: "u1", label: "山田 太郎" },
  { key: "u2", label: "佐藤 花子" },
  { key: "u3", label: "Nguyễn Văn A" },
  { key: "u4", label: "Maria Cruz" },
  { key: "u5", label: "鈴木 一郎" },
  { key: "u6", label: "高橋 美咲" },
];

const transferSchema = z.object({
  selectedMembers: z.array(z.string()),
});
type TransferValues = z.infer<typeof transferSchema>;

export const MemberTransfer: Story = {
  name: "Member transfer · move between groups",
  parameters: { layout: "padded" },
  render: () => (
    <Card
      title="チームメンバー設定"
      subtitle="左の一覧から、このチームに含めるメンバーを右に移動してください。"
      style={{ maxWidth: 720 }}
    >
      <Form<TransferValues>
        resolver={zodResolver(transferSchema)}
        defaultValues={{ selectedMembers: ["u1", "u3"] }}
        onSubmit={(v) => console.log(v)}
      >
        <FormField name="selectedMembers" label="メンバー">
          <Transfer dataSource={ALL_MEMBERS} titles={["未参加", "参加中"]} />
        </FormField>

        <Separator />
        <Flex gap="small" justify="end">
          <Button variant="ghost" type="button">キャンセル</Button>
          <Button type="submit" variant="primary">メンバーを更新</Button>
        </Flex>
      </Form>
    </Card>
  ),
};

// ─── AutocompleteSearch — AutoComplete with suggestions ──────────

const COMPANY_SUGGESTIONS = [
  { value: "acme", label: "Acme Forge Inc." },
  { value: "wayne", label: "Wayne Enterprises" },
  { value: "stark", label: "Stark Industries" },
  { value: "umbrella", label: "Umbrella Corp." },
  { value: "initech", label: "Initech" },
];

const acSchema = z.object({
  company: z.string().min(1),
  query: z.string().optional(),
});
type AcValues = z.infer<typeof acSchema>;

export const AutocompleteSearch: Story = {
  name: "Autocomplete + search · global picker",
  parameters: { layout: "padded" },
  render: () => (
    <Card
      title="顧客検索"
      subtitle="社名で検索 — 入力中に候補が表示されます。"
      style={{ maxWidth: 480 }}
    >
      <Form<AcValues>
        resolver={zodResolver(acSchema)}
        defaultValues={{ company: "", query: "" }}
        onSubmit={(v) => console.log(v)}
      >
        <FormField name="company" label="社名" required description="既存の顧客から候補が出ます">
          <AutoComplete options={COMPANY_SUGGESTIONS} placeholder="例: Acme..." />
        </FormField>
        <FormField name="query" label="フリーワード">
          <InputSearch placeholder="案件名・担当者名・タグなど" />
        </FormField>

        <Separator />
        <Flex gap="small" justify="end">
          <Button type="submit" variant="primary">検索</Button>
        </Flex>
      </Form>
    </Card>
  ),
};

// ─── PasswordReset — InputPassword + strength hint ───────────────

const pwSchema = z
  .object({
    current: z.string().min(1, "現在のパスワードを入力してください"),
    next: z
      .string()
      .min(8, "8 文字以上で入力してください")
      .regex(/[A-Z]/, "大文字を 1 つ以上含めてください")
      .regex(/\d/, "数字を 1 つ以上含めてください"),
    confirm: z.string().min(1),
  })
  .refine((data) => data.next === data.confirm, {
    message: "新しいパスワードと一致しません",
    path: ["confirm"],
  });
type PwValues = z.infer<typeof pwSchema>;

// ─── FormInitSkeleton — Form loading={{ kind: "skeleton" }} ──────

export const FormInitSkeleton: Story = {
  name: "Form loading · init skeleton (Form-level)",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story:
          "Setting `<Form loading={{ kind: \"skeleton\" }}>` cascades to every `<FormField>` inside. Use this for the **initial data fetch** state — UX nuance: skeleton on first load, spinner during subsequent saves.",
      },
    },
  },
  render: () => (
    <Card
      title="プロフィール"
      subtitle="サーバーから既存データを読み込んでいます..."
      style={{ maxWidth: 640 }}
    >
      <Form<ProfileValues>
        loading={{ kind: "skeleton" }}
        defaultValues={{
          lastName: "",
          firstName: "",
          lastNameKana: "",
          firstNameKana: "",
          displayName: "",
          bio: "",
        }}
        onSubmit={(v) => console.log(v)}
      >
        <div className="grid grid-cols-2" style={{ gap: "var(--spacing-3)" }}>
          <FormField name="lastName" label="姓" required>
            <Input />
          </FormField>
          <FormField name="firstName" label="名" required>
            <Input />
          </FormField>
        </div>
        <FormField name="displayName" label="表示名" required>
          <Input />
        </FormField>
        <FormField name="bio" label="自己紹介" optional>
          <Textarea rows={3} />
        </FormField>
      </Form>
    </Card>
  ),
};

// ─── FormSubmitSpinner — Form loading={true} during async submit ──

export const FormSubmitSpinner: Story = {
  name: "Form loading · spinner during submit (Form-level)",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story:
          "Setting `<Form loading>` (boolean true) shows a spinner overlay on every field — the controls dim but the layout doesn't jump. Use this during **save / submit**.",
      },
    },
  },
  render: function FormSubmitSpinner() {
    const [submitting, setSubmitting] = useState(false);
    return (
      <Card
        title="プロフィール"
        subtitle="保存中はフォーム全体がロックされます。"
        style={{ maxWidth: 640 }}
      >
        <Form<ProfileValues>
          loading={submitting}
          defaultValues={{
            lastName: "山田",
            firstName: "太郎",
            lastNameKana: "ヤマダ",
            firstNameKana: "タロウ",
            displayName: "Taro Y.",
            bio: "",
          }}
          onSubmit={async () => {
            setSubmitting(true);
            await new Promise((r) => setTimeout(r, 2000));
            setSubmitting(false);
          }}
        >
          <div className="grid grid-cols-2" style={{ gap: "var(--spacing-3)" }}>
            <FormField name="lastName" label="姓" required>
              <Input />
            </FormField>
            <FormField name="firstName" label="名" required>
              <Input />
            </FormField>
          </div>
          <FormField name="displayName" label="表示名" required>
            <Input />
          </FormField>

          <Separator />
          <Flex gap="small" justify="end">
            <Button variant="ghost" type="button" disabled={submitting}>キャンセル</Button>
            <Button type="submit" variant="primary" loading={submitting}>保存</Button>
          </Flex>
        </Form>
      </Card>
    );
  },
};

// ─── FormFieldPerFieldLoading — mix kinds across fields ──────────

export const FormFieldPerFieldLoading: Story = {
  name: "FormField loading · per-field override",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story:
          "Per-field `loading` overrides the Form default. Mix `skeleton` (still fetching) with `spinner` (revalidating) on the same form.",
      },
    },
  },
  render: () => (
    <Card
      title="顧客情報"
      subtitle="一部のフィールドはまだ取得中、一部は再検証中です。"
      style={{ maxWidth: 640 }}
    >
      <Form<ProfileValues>
        defaultValues={{
          lastName: "山田",
          firstName: "太郎",
          lastNameKana: "",
          firstNameKana: "",
          displayName: "Taro Y.",
          bio: "",
        }}
        onSubmit={(v) => console.log(v)}
      >
        <div className="grid grid-cols-2" style={{ gap: "var(--spacing-3)" }}>
          <FormField name="lastName" label="姓" required>
            <Input />
          </FormField>
          <FormField name="firstName" label="名" required>
            <Input />
          </FormField>
        </div>
        <FormField name="displayName" label="表示名 (再検証中)" required loading>
          <Input />
        </FormField>
        <FormField name="bio" label="自己紹介 (取得中)" loading={{ kind: "skeleton" }}>
          <Textarea rows={3} />
        </FormField>
      </Form>
    </Card>
  ),
};

export const PasswordReset: Story = {
  name: "Password reset · InputPassword",
  parameters: { layout: "padded" },
  render: () => (
    <Card
      title="パスワード変更"
      subtitle="現在のパスワードを確認した上で、新しいパスワードを設定します。"
      style={{ maxWidth: 480 }}
    >
      <Form<PwValues>
        resolver={zodResolver(pwSchema)}
        defaultValues={{ current: "", next: "", confirm: "" }}
        onSubmit={(v) => console.log(v)}
      >
        <FormField name="current" label="現在のパスワード" required>
          <InputPassword placeholder="••••••••" />
        </FormField>
        <FormField
          name="next"
          label="新しいパスワード"
          required
          description="8 文字以上 / 大文字 1 文字以上 / 数字 1 文字以上"
        >
          <InputPassword placeholder="••••••••" />
        </FormField>
        <FormField name="confirm" label="新しいパスワード (確認)" required>
          <InputPassword placeholder="••••••••" />
        </FormField>

        <Separator />
        <Flex gap="small" justify="end">
          <Button variant="ghost" type="button">キャンセル</Button>
          <Button type="submit" variant="primary">パスワードを変更</Button>
        </Flex>
      </Form>
    </Card>
  ),
};
