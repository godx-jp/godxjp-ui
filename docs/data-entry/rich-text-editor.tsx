import * as React from "react";
import { RichTextEditor, TranslatableRichText } from "@godxjp/block-editor";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CodeBlock,
} from "@godxjp/ui/data-display";
import { Form, FormField, TranslatableInput, type TranslatableValue } from "@godxjp/ui/data-entry";
import { Button } from "@godxjp/ui/general";
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

  return (
    <PageContainer title="RichTextEditor" subtitle={t("richTextEditorDocs.subtitle")}>
      <Card>
        <CardHeader>
          <CardTitle level={2}>{t("richTextEditorDocs.edit.title")}</CardTitle>
          <CardDescription>{t("richTextEditorDocs.edit.description")}</CardDescription>
        </CardHeader>
        <Form
          onSubmit={(event) => {
            event.preventDefault();
            const next: Errors = {};
            for (const code of LOCALES) {
              if (isBlank(description[code])) next[code] = t("richTextEditorDocs.edit.required");
            }
            setErrors(next);
          }}
        >
          <CardContent>
            <Flex direction="col" gap="md">
              <FormField id="product-name" label={t("richTextEditorDocs.edit.name")} required>
                <TranslatableInput
                  locales={LOCALES}
                  fallbackLocale="ja"
                  value={name}
                  onValueChange={setName}
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
                  }}
                  errors={errors}
                />
              </FormField>
            </Flex>
          </CardContent>
          <CardFooter>
            <Flex direction="row" justify="end" gap="sm" align="center">
              <Button type="submit">{t("richTextEditorDocs.edit.save")}</Button>
            </Flex>
          </CardFooter>
        </Form>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle level={2}>{t("richTextEditorDocs.saved.title")}</CardTitle>
          <CardDescription>{t("richTextEditorDocs.saved.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <CodeBlock language="json">{JSON.stringify(description, null, 2)}</CodeBlock>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle level={2}>{t("richTextEditorDocs.single.title")}</CardTitle>
          <CardDescription>{t("richTextEditorDocs.single.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form onSubmit={(event) => event.preventDefault()}>
            <FormField id="prep-note" label={t("richTextEditorDocs.single.label")}>
              <RichTextEditor
                value={note}
                onValueChange={setNote}
                placeholder={t("richTextEditorDocs.single.placeholder")}
              />
            </FormField>
            <FormField id="prep-note-readonly" label={t("richTextEditorDocs.single.readOnly")}>
              <RichTextEditor value={note} readOnly />
            </FormField>
            <FormField id="prep-note-disabled" label={t("richTextEditorDocs.single.disabled")}>
              <RichTextEditor value={note} disabled />
            </FormField>
          </Form>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
