import * as React from "react";
import { MarkdownEditor } from "@godxjp/editor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Form, FormField } from "@godxjp/ui/data-entry";
import { Button } from "@godxjp/ui/general";
import { useTranslation } from "@godxjp/ui/i18n";
import { Flex, PageContainer } from "@godxjp/ui/layout";

import shot from "../assets/shot-landscape.svg";

const initial = `## 議事録 2026-10-02

- 決済モジュールの再発行は **税率変更後** のケースを追加する
- 次回レビュー：_10/9_

画像はこの欄に貼り付けるか、ドラッグするか、クリップのボタンから添付します。`;

/** Stands in for the host's storage: a real app uploads the file and returns its URL. */
async function demoUpload(file: File) {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return { url: shot, name: file.name };
}

/**
 * @godxjp/editor — the Markdown editor (gh#1109). A page form: the editor inside a FormField,
 * the preview through @godxjp/markdown, files through the host's `upload`.
 */
export default function Demo() {
  const { t } = useTranslation();
  const [body, setBody] = React.useState(initial);
  return (
    <PageContainer title="MarkdownEditor" subtitle={t("markdownEditorDocs.subtitle")}>
      <Card>
        <CardHeader>
          <CardTitle level={2}>{t("markdownEditorDocs.edit.title")}</CardTitle>
          <CardDescription>{t("markdownEditorDocs.edit.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form onSubmit={(event) => event.preventDefault()}>
            <Flex direction="col" gap="md">
              <FormField id="page-body" label={t("markdownEditorDocs.edit.label")}>
                <MarkdownEditor
                  value={body}
                  onValueChange={setBody}
                  upload={demoUpload}
                  defaultMode="split"
                />
              </FormField>
              <Flex justify="end">
                <Button type="submit">{t("markdownEditorDocs.edit.save")}</Button>
              </Flex>
            </Flex>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle level={2}>{t("markdownEditorDocs.readOnly.title")}</CardTitle>
          <CardDescription>{t("markdownEditorDocs.readOnly.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <FormField id="page-body-readonly" label={t("markdownEditorDocs.readOnly.label")}>
            <MarkdownEditor defaultValue={initial} readOnly />
          </FormField>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
