import cover from "../assets/cover-terrain.svg";
import { useTranslation } from "@godxjp/ui/i18n";
import { Button, Heading, Text } from "@godxjp/ui/general";
import { Image } from "@godxjp/ui/data-display";
import { CatalogCard, CenteredShell, Flex, ResponsiveGrid } from "@godxjp/ui/layout";

/** Public reading scope: plain prose, linked headings, image-led titles and control opt-out. */
export default function Demo() {
  const { t } = useTranslation();
  return (
    <div data-ui-reading-links>
      <CenteredShell
        topbar={<a href="#reading-guide">{t("readingLinksDocs.header")}</a>}
        footer={<a href="#reading-guide">{t("readingLinksDocs.footer")}</a>}
      >
        <Flex direction="col" gap="lg">
          <Heading level={1}>{t("readingLinksDocs.title")}</Heading>
          <Text tone="muted">{t("readingLinksDocs.intro")}</Text>
          <Text>
            <a href="#reading-guide">{t("readingLinksDocs.body")}</a>
          </Text>
          <ResponsiveGrid preset="catalog">
            <CatalogCard
              level={2}
              variant="sealed"
              media={<Image src={cover} alt="" fit="contain" preview={false} />}
              title={<a href="#reading-guide">{t("readingLinksDocs.article")}</a>}
              footer={<Text tone="muted">{t("readingLinksDocs.summary")}</Text>}
            />
            <a href="#reading-guide">
              <Heading level={2}>{t("readingLinksDocs.article")}</Heading>
              <Text tone="muted">{t("readingLinksDocs.summary")}</Text>
            </a>
          </ResponsiveGrid>
          <section id="reading-guide">
            <Heading level={2}>{t("readingLinksDocs.article")}</Heading>
            <Text tone="muted">{t("readingLinksDocs.summary")}</Text>
          </section>
          <Flex gap="sm" wrap>
            <Button asChild>
              <a href="#reading-guide">{t("readingLinksDocs.action")}</a>
            </Button>
            <a href="#reading-guide" data-ui-link-style="control">
              {t("readingLinksDocs.control")}
            </a>
          </Flex>
        </Flex>
      </CenteredShell>
    </div>
  );
}
