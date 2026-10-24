import "./editorial-examples.css";
import { useTranslation } from "@godxjp/ui/i18n";
import { Text } from "@godxjp/ui/general";
import {
  CenteredShell,
  EditorialSection,
  EditorialHero,
  Eyebrow,
  EditorialSectionHead,
  EditorialArticle,
  EditorialArticleSection,
  EditorialNote,
  EditorialPanel,
  EditorialTextLink,
  EditorialPillNav,
  EditorialPillNavItem,
  ResponsiveGrid,
} from "@godxjp/ui/layout";

/** A reference-library landing page and its linked reading section. */
export default function Demo() {
  const { t } = useTranslation();
  return (
    <CenteredShell flow="sections" className="editorial-example">
      <EditorialSection tone="hero" divider="end" spacing="section">
        <EditorialHero
          eyebrow={<Eyebrow>{t("editorialExamples.category")}</Eyebrow>}
          title={
            <>
              {t("editorialExamples.title")}{" "}
              <Text size="inherit" tone="primary">
                {t("editorialExamples.item")}
              </Text>
            </>
          }
          description={t("editorialExamples.lead")}
          footer={
            <EditorialTextLink href="#reading">{t("editorialExamples.read")}</EditorialTextLink>
          }
        />
      </EditorialSection>
      <EditorialSection
        tone="surface"
        spacing="section"
        as="nav"
        aria-label={t("editorialExamples.browse")}
      >
        <EditorialPillNav aria-label={t("editorialExamples.category")}>
          <EditorialPillNavItem href="#reading" icon="dot" aria-current="true">
            {t("editorialExamples.section")}
          </EditorialPillNavItem>
          <EditorialPillNavItem href="#next">{t("editorialExamples.details")}</EditorialPillNavItem>
        </EditorialPillNav>
      </EditorialSection>
      <EditorialSection id="reading" spacing="section">
        <EditorialArticle
          eyebrow={<Eyebrow variant="plain">{t("editorialExamples.category")}</Eyebrow>}
          title={t("editorialExamples.section")}
          intro={t("editorialExamples.lead")}
        >
          <EditorialArticleSection
            title={t("editorialExamples.details")}
            paragraphs={[t("editorialExamples.note")]}
          />
          <EditorialNote>{t("editorialExamples.source")}</EditorialNote>
        </EditorialArticle>
      </EditorialSection>
      <EditorialSection id="next" tone="subtle" divider="both" spacing="section">
        <EditorialSectionHead
          title={t("editorialExamples.browse")}
          action={
            <EditorialTextLink href="#reading">{t("editorialExamples.read")}</EditorialTextLink>
          }
        />
        <ResponsiveGrid>
          <EditorialPanel
            title={t("editorialExamples.details")}
            items={[t("editorialExamples.note"), t("editorialExamples.source")]}
          />
        </ResponsiveGrid>
      </EditorialSection>
    </CenteredShell>
  );
}
