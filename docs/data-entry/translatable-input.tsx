import * as React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
import {
  Form,
  FormField,
  TranslatableInput,
  TranslatableTextarea,
  type TranslatableValue,
} from "@godxjp/ui/data-entry";
import { Button } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * TranslatableInput / TranslatableTextarea — a restaurant menu admin editing one product whose
 * name and description are stored per locale (ja / en / vi), the `*_translations` shape a Laravel
 * Astrotomic backend sends. Composed only from real @godxjp/ui components; the tab names come from
 * Intl.DisplayNames in the app's UI language, so switching the app locale relabels them.
 */

const LOCALES = ["ja", "en", "vi"] as const;

type Errors = Partial<Record<string, string>>;

const REQUIRED: Record<string, string> = {
  ja: "日本語の商品名を入力してください",
  en: "英語の商品名を入力してください",
  vi: "ベトナム語の商品名を入力してください",
};

/** One error per EMPTY locale — what a `required` rule on every locale returns. */
function validate(value: TranslatableValue): Errors {
  const errors: Errors = {};
  for (const code of LOCALES) if (!value[code]?.trim()) errors[code] = REQUIRED[code];
  return errors;
}

/** Card 1 — the edit form. Vietnamese is untranslated, so it shows the Japanese text through. */
function ProductEditForm() {
  const [name, setName] = React.useState<TranslatableValue>({
    ja: "醤油ラーメン",
    en: "Shoyu Ramen",
  });
  const [description, setDescription] = React.useState<TranslatableValue>({
    ja: "鶏ガラと煮干しの澄んだスープに、自家製の中太縮れ麺。",
  });
  const [errors, setErrors] = React.useState<Errors>({});
  const [saved, setSaved] = React.useState(false);

  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        const next = validate(name);
        setErrors(next);
        setSaved(Object.keys(next).length === 0);
      }}
    >
      <CardContent>
        <Flex direction="col" gap="md">
          <FormField
            id="product-name"
            label="商品名"
            required
            helper="メニューと注文画面に表示されます"
          >
            <TranslatableInput
              locales={LOCALES}
              fallbackLocale="ja"
              defaultLocale="vi"
              value={name}
              onValueChange={(next) => {
                setName(next);
                if (Object.keys(errors).length) setErrors(validate(next));
              }}
              errors={errors}
              allowClear
            />
          </FormField>
          <FormField id="product-description" label="説明">
            <TranslatableTextarea
              locales={LOCALES}
              fallbackLocale="ja"
              value={description}
              onValueChange={setDescription}
              autoGrow
              minRows={3}
              maxRows={8}
              count={{ max: 200 }}
            />
          </FormField>
        </Flex>
      </CardContent>
      <CardFooter>
        <Flex direction="row" justify="end" gap="sm" align="center">
          {saved ? <CardDescription role="status">保存しました</CardDescription> : null}
          <Button type="submit">保存</Button>
        </Flex>
      </CardFooter>
    </Form>
  );
}

/** Card 2 — the state after a failed save, staged at rest: two locales marked, the active one says why. */
function ValidationErrorsAtRest() {
  const [name, setName] = React.useState<TranslatableValue>({ ja: "味噌ラーメン" });
  return (
    <FormField id="category-name" label="カテゴリー名" required>
      <TranslatableInput
        locales={LOCALES}
        fallbackLocale="ja"
        defaultLocale="en"
        value={name}
        onValueChange={setName}
        errors={{ en: REQUIRED.en, vi: REQUIRED.vi }}
      />
    </FormField>
  );
}

/** Card 3 — sizes, a two-locale field, uncontrolled, and disabled. */
function Variants() {
  return (
    <Flex direction="col" gap="md">
      <FormField id="size-xs" label="xs">
        <TranslatableInput size="xs" locales={LOCALES} defaultValue={{ ja: "替え玉" }} />
      </FormField>
      <FormField id="size-sm" label="sm">
        <TranslatableInput size="sm" locales={LOCALES} defaultValue={{ ja: "味玉" }} />
      </FormField>
      <FormField id="size-md" label="md">
        <TranslatableInput size="md" locales={LOCALES} defaultValue={{ ja: "チャーシュー" }} />
      </FormField>
      <FormField id="size-lg" label="lg">
        <TranslatableInput size="lg" locales={LOCALES} defaultValue={{ ja: "メンマ" }} />
      </FormField>
      <FormField id="two-locales" label="店舗の表示名" helper="日本語と英語だけを持つ項目">
        <TranslatableInput
          locales={["ja", "en"]}
          defaultLocale="en"
          fallbackLocale="ja"
          defaultValue={{ ja: "渋谷本店" }}
          placeholder="Store name"
        />
      </FormField>
      <FormField
        id="disabled-field"
        label="仕入先メモ"
        helper="編集できません。言語タブは閲覧のために操作できます"
      >
        <TranslatableTextarea
          locales={LOCALES}
          disabled
          defaultValue={{ ja: "毎週火曜に麺を納品", en: "Noodles delivered every Tuesday" }}
        />
      </FormField>
    </Flex>
  );
}

export default function Demo() {
  return (
    <PageContainer
      title="TranslatableInput"
      subtitle="言語ごとの値を 1 つのフィールドで編集 · ja / en / vi"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>商品を編集</CardTitle>
            <CardDescription>
              ベトナム語は未翻訳のため、日本語の商品名がプレースホルダーとして表示されます。
              空のまま保存すると、未入力の言語タブにエラーの印が付きます。
            </CardDescription>
          </CardHeader>
          <ProductEditForm />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>検証エラー</CardTitle>
            <CardDescription>
              英語とベトナム語にエラー。選択中の言語のメッセージがフィールドの下に表示され、
              他の言語はタブの印と読み上げで伝わります。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ValidationErrorsAtRest />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>サイズ・言語の指定・無効</CardTitle>
            <CardDescription>
              size は Input と同じ段階。locales で項目ごとに言語を絞り込めます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Variants />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
