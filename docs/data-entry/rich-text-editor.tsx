import * as React from "react";
import { RichTextEditor, TranslatableRichText } from "@godxjp/block-editor";
import { Form, FormField, TranslatableInput, type TranslatableValue } from "@godxjp/ui/data-entry";
import { Button, Heading, Text } from "@godxjp/ui/general";
import { useTranslation } from "@godxjp/ui/i18n";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * @godxjp/block-editor RichTextEditor / TranslatableRichText (gh#1365) — a menu admin editing one
 * product whose description is stored as HTML per locale (`{ ja, en, vi }`), next to a
 * TranslatableInput name. The seeded VALUES are per-locale content; Vietnamese is untranslated, so
 * its empty editor shows the Japanese text as its placeholder.
 */

const LOCALES = ["ja", "en", "vi"] as const;

type Errors = Partial<Record<string, string>>;

/** An HTML body with no text (`""`, or tags only) is empty. */
const isBlank = (html: string | undefined) => !html?.replace(/<[^>]*>/g, "").trim();

export default function Demo() {
  const { t } = useTranslation();
  const [name, setName] = React.useState<TranslatableValue>({
    ja: "醤油ラーメン",
    en: "Shoyu Ramen",
  });
  const [description, setDescription] = React.useState<TranslatableValue>({
    ja: "<p>鶏ガラと煮干しの<strong>澄んだスープ</strong>に、自家製の中太縮れ麺。</p><ul><li><p>チャーシュー</p></li><li><p>味玉</p></li></ul>",
    en: "<p>A <strong>clear</strong> chicken and sardine broth with house-made wavy noodles.</p>",
  });
  const [errors, setErrors] = React.useState<Errors>({});
  const [note, setNote] = React.useState(
    "<h3>仕込み</h3><p>スープは前日に<em>8時間</em>炊く。</p>",
  );

  const [saved, setSaved] = React.useState(false);

  return (
    <PageContainer
      title={t("richTextEditorDocs.edit.title")}
      measure="narrow"
      extra={
        <Button type="submit" form="product-edit">
          {t("richTextEditorDocs.edit.save")}
        </Button>
      }
    >
      <Form
        id="product-edit"
        onSubmit={(event) => {
          event.preventDefault();
          const next: Errors = {};
          for (const code of LOCALES) {
            if (isBlank(description[code])) next[code] = t("richTextEditorDocs.edit.required");
          }
          setErrors(next);
          setSaved(Object.keys(next).length === 0);
        }}
      >
        <FormField id="product-name" label={t("richTextEditorDocs.edit.name")} required>
          <TranslatableInput
            locales={LOCALES}
            fallbackLocale="ja"
            value={name}
            onValueChange={(next) => {
              setName(next);
              setSaved(false);
            }}
          />
        </FormField>
        <FormField
          id="product-description"
          label={t("richTextEditorDocs.edit.descriptionLabel")}
          required
          helper={t("richTextEditorDocs.edit.helper")}
        >
          <TranslatableRichText
            locales={LOCALES}
            fallbackLocale="ja"
            value={description}
            onValueChange={(next) => {
              setDescription(next);
              setErrors({});
              setSaved(false);
            }}
            errors={errors}
          />
        </FormField>
        <Flex direction="col" gap="md">
          <Heading level={2}>{t("richTextEditorDocs.single.title")}</Heading>
          <FormField id="prep-note" label={t("richTextEditorDocs.single.label")}>
            <RichTextEditor
              value={note}
              onValueChange={(next) => {
                setNote(next);
                setSaved(false);
              }}
              placeholder={t("richTextEditorDocs.single.placeholder")}
            />
          </FormField>
        </Flex>
        <Text role="status" tone="muted">
          {saved ? t("richTextEditorDocs.edit.saved") : ""}
        </Text>
      </Form>
    </PageContainer>
  );
}
