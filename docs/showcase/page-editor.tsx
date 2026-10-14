/**
 * Showcase · page-editor — the EDIT screen of a document or record (gh#1296).
 *
 * DESIGN.md "Admin Screen Anatomy · Editor": the record name in the header with its status Badge,
 * ONE primary Save in `extra` (it submits the form by id, so it works from the header), the title
 * field and a large body editor in the main column, metadata and the change note in a SplitPane
 * aside. No Card per field group, no KPI row, no subtitle that restates the title: the subtitle
 * states the one fact the title does not (when it was last saved).
 *
 * The body editor is `@godxjp/block-editor` (a separate package). An app without it uses
 * `Textarea autoSize` in the same FormField; nothing else on the screen changes.
 */
import * as React from "react";
import { BlockEditor } from "@godxjp/block-editor";

import { Badge, Descriptions } from "@godxjp/ui/data-display";
import { Form, FormField, Input, Select, Textarea } from "@godxjp/ui/data-entry";
import { Button } from "@godxjp/ui/general";
import { useTranslation } from "@godxjp/ui/i18n";
import { Flex, PageContainer, SplitPane } from "@godxjp/ui/layout";

const FORM_ID = "page-edit-form";
/** Sized for the longest option, not stretched to the aside. */
const SELECT_WIDTH = "16rem";

/** The record as the server returned it. Its title and body are DATA; the sample is localized
 * (docs/i18n `showcase.pageEditor.doc*`) only so the page reads in one language per locale. */
const PAGE = {
  parent: "guides",
  visibility: "internal",
  editor: "佐藤 美咲",
  updatedAt: "2026-10-12T09:30:00+09:00",
  version: 7,
};

export default function PageEditor() {
  const { t, locale } = useTranslation();
  const savedTitle = t("showcase.pageEditor.docTitle");
  const [title, setTitle] = React.useState(savedTitle);
  const [body, setBody] = React.useState(() => t("showcase.pageEditor.docBody"));
  const [parent, setParent] = React.useState(PAGE.parent);
  const [visibility, setVisibility] = React.useState(PAGE.visibility);
  const [note, setNote] = React.useState("");
  const [savedAt, setSavedAt] = React.useState(PAGE.updatedAt);
  const [submitted, setSubmitted] = React.useState(false);

  const dateTime = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
  const titleError =
    submitted && title.trim() === "" ? t("showcase.pageEditor.titleRequired") : undefined;

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (title.trim() === "") return;
    setSavedAt(new Date().toISOString());
    setNote("");
  };

  return (
    <PageContainer
      title={title.trim() || savedTitle}
      subtitle={t("showcase.pageEditor.savedAt", { time: dateTime.format(new Date(savedAt)) })}
      status={<Badge status="draft" />}
      breadcrumb={[
        { label: t("showcase.pageEditor.crumbSpace"), to: "#" },
        { label: t("showcase.pageEditor.crumbGuides"), to: "#" },
        { label: t("showcase.pageEditor.crumbEdit") },
      ]}
      extra={
        <Flex direction="row" gap="sm" align="center" wrap>
          <Button variant="outline">{t("showcase.pageEditor.cancel")}</Button>
          <Button type="submit" form={FORM_ID}>
            {t("showcase.pageEditor.save")}
          </Button>
        </Flex>
      }
    >
      <Form id={FORM_ID} onSubmit={onSubmit} noValidate>
        <SplitPane
          asideWidth="sm"
          asideLabel={t("showcase.pageEditor.details")}
          aside={
            <Flex direction="col" gap="md">
              <FormField
                id="page-parent"
                controlWidth={SELECT_WIDTH}
                label={t("showcase.pageEditor.parent")}
              >
                <Select
                  value={parent}
                  onValueChange={setParent}
                  options={[
                    { value: "guides", label: t("showcase.pageEditor.crumbGuides") },
                    { value: "policies", label: t("showcase.pageEditor.parentPolicies") },
                    { value: "releases", label: t("showcase.pageEditor.parentReleases") },
                  ]}
                />
              </FormField>
              <FormField
                id="page-visibility"
                controlWidth={SELECT_WIDTH}
                label={t("showcase.pageEditor.visibility")}
              >
                <Select
                  value={visibility}
                  onValueChange={setVisibility}
                  options={[
                    { value: "private", label: t("showcase.pageEditor.visibilityPrivate") },
                    { value: "internal", label: t("showcase.pageEditor.visibilityInternal") },
                    { value: "public", label: t("showcase.pageEditor.visibilityPublic") },
                  ]}
                />
              </FormField>
              <Descriptions columns={1}>
                <Descriptions.Item label={t("showcase.pageEditor.lastEditor")}>
                  {PAGE.editor}
                </Descriptions.Item>
                <Descriptions.Item label={t("showcase.pageEditor.version")}>
                  {PAGE.version}
                </Descriptions.Item>
              </Descriptions>
              <FormField
                id="page-note"
                label={t("showcase.pageEditor.changeNote")}
                helper={t("showcase.pageEditor.changeNoteHelper")}
              >
                <Textarea value={note} onValueChange={setNote} autoSize />
              </FormField>
            </Flex>
          }
        >
          <Flex direction="col" gap="md">
            <FormField
              id="page-title"
              label={t("showcase.pageEditor.titleField")}
              required
              error={titleError}
            >
              <Input value={title} onValueChange={setTitle} />
            </FormField>
            <FormField id="page-body" label={t("showcase.pageEditor.body")}>
              <BlockEditor value={body} onValueChange={setBody} />
            </FormField>
          </Flex>
        </SplitPane>
      </Form>
    </PageContainer>
  );
}
