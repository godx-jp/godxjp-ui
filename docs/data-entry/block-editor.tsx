import * as React from "react";
import { BlockEditor } from "@godxjp/block-editor";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CodeBlock,
} from "@godxjp/ui/data-display";
import { Form, FormField } from "@godxjp/ui/data-entry";
import { Button } from "@godxjp/ui/general";
import { useTranslation } from "@godxjp/ui/i18n";
import { Flex, PageContainer } from "@godxjp/ui/layout";

import shot from "../assets/shot-landscape.svg";

const initial = `# 議事録 2026-10-05

> [!NOTE] 次回まで
> 決済モジュールの再発行は **税率変更後** のケースを追加する

- [ ] 仕様の確認
- [x] [[Guide|設計ガイド]] の更新

:::toggle[詳細]
「/」でブロックを挿入、⋮⋮ でドラッグ。
:::
`;

/** The host's page index — targets are ids, labels are localized like any other copy. */
const PAGES = [
  { target: "Guide", labelKey: "blockEditorDocs.pages.guide" },
  { target: "Setup", labelKey: "blockEditorDocs.pages.setup" },
  { target: "Release", labelKey: "blockEditorDocs.pages.release" },
] as const;

/** Stands in for the host's storage: a real app uploads the file and returns `asset:<id>`. */
async function demoUpload(file: File) {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return { url: shot, name: file.name };
}

/**
 * @godxjp/block-editor — the block editor (gh#1156). A page form: the editor inside a FormField,
 * the Markdown it saves shown beside it (exactly what `normalize()` returns), files through the
 * host's `upload`, `[[` suggestions from the host's page index.
 */
export default function Demo() {
  const { t } = useTranslation();
  const [body, setBody] = React.useState(initial);
  return (
    <PageContainer title="BlockEditor" subtitle={t("blockEditorDocs.subtitle")}>
      <Card>
        <CardHeader>
          <CardTitle level={2}>{t("blockEditorDocs.edit.title")}</CardTitle>
          <CardDescription>{t("blockEditorDocs.edit.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form onSubmit={(event) => event.preventDefault()}>
            <Flex direction="col" gap="md">
              <FormField id="block-body" label={t("blockEditorDocs.edit.label")}>
                <BlockEditor
                  value={body}
                  onValueChange={setBody}
                  upload={demoUpload}
                  suggestWikilinks={(query) =>
                    PAGES.map((p) => ({ target: p.target, label: t(p.labelKey) })).filter((p) =>
                      `${p.target} ${p.label}`.toLowerCase().includes(query.toLowerCase()),
                    )
                  }
                />
              </FormField>
              <Flex justify="end">
                <Button type="submit">{t("blockEditorDocs.edit.save")}</Button>
              </Flex>
            </Flex>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle level={2}>{t("blockEditorDocs.markdown.title")}</CardTitle>
          <CardDescription>{t("blockEditorDocs.markdown.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <CodeBlock language="markdown">{body}</CodeBlock>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle level={2}>{t("blockEditorDocs.readOnly.title")}</CardTitle>
          <CardDescription>{t("blockEditorDocs.readOnly.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <BlockEditor
            defaultValue={initial}
            readOnly
            aria-label={t("blockEditorDocs.readOnly.label")}
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
