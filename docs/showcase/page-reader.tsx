/**
 * Showcase · page-reader — a long-form document READING page (gh#1296).
 *
 * DESIGN.md "Admin Screen Anatomy · Reader": the document owns the page's one `<h1>`, so
 * PageContainer carries only the breadcrumb and the page action and gets NO `title` (it then
 * renders no heading of its own). LegalDocumentShell draws the reading column: title two type
 * steps above the section headings, a metadata line (version, `dateKind="updated"` so the date
 * reads as a revision, not an effective date), the contents rail with scroll spy, and the prose
 * at a reading measure. Japanese prose breaks between phrases (`Text break="phrase"`).
 *
 * No Card around the article, no subtitle under the title, no icon per heading.
 */
import { Button, Text } from "@godxjp/ui/general";
import { useTranslation } from "@godxjp/ui/i18n";
import { LegalDocumentShell } from "@godxjp/ui/lab";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/** The document as the server returned it. Its text is DATA; the sample is localized (docs/i18n
 * `showcase.pageReader.*`) only so the page reads in one language per locale. */
const DOC = {
  version: "7",
  updatedAt: "2026-10-12",
  sections: [
    { id: "first-day", key: "s1" },
    { id: "environment", key: "s2" },
    { id: "first-week", key: "s3" },
  ],
};

export default function PageReader() {
  const { t } = useTranslation();

  return (
    <PageContainer
      breadcrumb={[
        { label: t("showcase.pageReader.crumbSpace"), to: "#" },
        { label: t("showcase.pageReader.crumbGuides"), to: "#" },
        { label: t("showcase.pageReader.docTitle") },
      ]}
      extra={<Button variant="outline">{t("showcase.pageReader.edit")}</Button>}
    >
      <LegalDocumentShell
        title={t("showcase.pageReader.docTitle")}
        version={DOC.version}
        effectiveDate={DOC.updatedAt}
        dateKind="updated"
        contentsLabel={t("showcase.pageReader.contents")}
        summary={
          <Text as="p" break="phrase">
            {t("showcase.pageReader.lead")}
          </Text>
        }
        sections={DOC.sections.map((section) => ({
          id: section.id,
          title: t(`showcase.pageReader.${section.key}Title`),
          content: (
            <Flex direction="col" gap="sm">
              {(["p1", "p2"] as const).map((p) => (
                <Text as="p" break="phrase" key={p}>
                  {t(`showcase.pageReader.${section.key}${p}`)}
                </Text>
              ))}
            </Flex>
          ),
        }))}
      />
    </PageContainer>
  );
}
