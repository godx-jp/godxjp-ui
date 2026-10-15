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
import { useTranslation } from "@godxjp/ui/i18n";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * TranslatableInput / TranslatableTextarea — a restaurant menu admin editing one product whose
 * name and description are stored per locale (ja / en / vi), the `*_translations` shape a Laravel
 * Astrotomic backend sends. Composed only from real @godxjp/ui components; the tab names come from
 * Intl.DisplayNames in the app's UI language, so switching the app locale relabels them. The seeded
 * VALUES are per-locale content (a ja product name stays Japanese whatever the UI language is).
 */

const LOCALES = ["ja", "en", "vi"] as const;

type Errors = Partial<Record<string, string>>;
type T = ReturnType<typeof useTranslation>["t"];

/** One error per EMPTY locale — what a `required` rule on every locale returns. */
function validate(value: TranslatableValue, t: T): Errors {
  const errors: Errors = {};
  for (const code of LOCALES) {
    if (!value[code]?.trim()) errors[code] = t(`translatableInputDocs.required.${code}`);
  }
  return errors;
}

/** Card 1 — the edit form. Vietnamese is untranslated, so it shows the Japanese text through. */
function ProductEditForm() {
  const { t } = useTranslation();
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
        const next = validate(name, t);
        setErrors(next);
        setSaved(Object.keys(next).length === 0);
      }}
    >
      <CardContent>
        <Flex direction="col" gap="md">
          <FormField
            id="product-name"
            label={t("translatableInputDocs.productName")}
            required
            helper={t("translatableInputDocs.productNameHelper")}
          >
            <TranslatableInput
              locales={LOCALES}
              fallbackLocale="ja"
              defaultLocale="vi"
              value={name}
              onValueChange={(next) => {
                setName(next);
                if (Object.keys(errors).length) setErrors(validate(next, t));
              }}
              errors={errors}
              allowClear
            />
          </FormField>
          <FormField id="product-description" label={t("translatableInputDocs.description")}>
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
          {saved ? (
            <CardDescription role="status">{t("translatableInputDocs.saved")}</CardDescription>
          ) : null}
          <Button type="submit">{t("translatableInputDocs.save")}</Button>
        </Flex>
      </CardFooter>
    </Form>
  );
}

/** Card 2 — the state after a failed save, staged at rest: two locales marked, the active one says why. */
function ValidationErrorsAtRest() {
  const { t } = useTranslation();
  const [name, setName] = React.useState<TranslatableValue>({ ja: "味噌ラーメン" });
  return (
    <FormField id="category-name" label={t("translatableInputDocs.categoryName")} required>
      <TranslatableInput
        locales={LOCALES}
        fallbackLocale="ja"
        defaultLocale="en"
        value={name}
        onValueChange={setName}
        errors={{
          en: t("translatableInputDocs.required.en"),
          vi: t("translatableInputDocs.required.vi"),
        }}
      />
    </FormField>
  );
}

/** Card 3 — sizes, a two-locale field, uncontrolled, and disabled. */
function Variants() {
  const { t } = useTranslation();
  return (
    <Form>
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
      <FormField
        id="two-locales"
        label={t("translatableInputDocs.storeName")}
        helper={t("translatableInputDocs.storeNameHelper")}
      >
        <TranslatableInput
          locales={["ja", "en"]}
          defaultLocale="en"
          fallbackLocale="ja"
          defaultValue={{ ja: "渋谷本店" }}
          placeholder={t("translatableInputDocs.storeNamePlaceholder")}
        />
      </FormField>
      <FormField
        id="disabled-field"
        label={t("translatableInputDocs.supplierNote")}
        helper={t("translatableInputDocs.supplierNoteHelper")}
      >
        <TranslatableTextarea
          locales={LOCALES}
          disabled
          defaultValue={{ ja: "毎週火曜に麺を納品", en: "Noodles delivered every Tuesday" }}
        />
      </FormField>
    </Form>
  );
}

export default function Demo() {
  const { t } = useTranslation();
  return (
    <PageContainer title="TranslatableInput" subtitle={t("translatableInputDocs.subtitle")}>
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>{t("translatableInputDocs.editTitle")}</CardTitle>
            <CardDescription>{t("translatableInputDocs.editHint")}</CardDescription>
          </CardHeader>
          <ProductEditForm />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>{t("translatableInputDocs.errorsTitle")}</CardTitle>
            <CardDescription>{t("translatableInputDocs.errorsHint")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ValidationErrorsAtRest />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>{t("translatableInputDocs.variantsTitle")}</CardTitle>
            <CardDescription>{t("translatableInputDocs.variantsHint")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Variants />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
