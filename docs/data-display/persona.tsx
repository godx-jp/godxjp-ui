import { Persona, Badge, Card, CardContent } from "@godxjp/ui/data-display";
import { Heading } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { useTranslation } from "@godxjp/ui/i18n";

export default function Demo() {
  const { t } = useTranslation();
  return (
    <PageContainer title="Persona">
      <Flex direction="col" gap="lg">
        <Heading level={2}>{t("personaExamples.sizes")}</Heading>
        <Persona
          name={t("personaExamples.name")}
          description="alex.morgan.research-and-development@example.com"
          trailing={<Badge tone="neutral">{t("personaExamples.you")}</Badge>}
        />
        <Persona
          size="sm"
          name={t("personaExamples.name")}
          description="alex.morgan.research-and-development@example.com"
        />
        <Heading level={2}>{t("personaExamples.minimal")}</Heading>
        <Persona name={t("personaExamples.name")} />
        <Persona
          size="sm"
          name="ليلى عبد الرحمن الحسن"
          description="layla.alhassan@example.com"
          avatarFallback="ل"
        />
        <Heading level={2}>{t("personaExamples.dark")}</Heading>
        <Card className="dark" data-theme="dark">
          <CardContent>
            <Persona
              name={t("personaExamples.name")}
              description="alex@example.com"
              avatarSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='white'/%3E%3Ctext y='30' font-size='30'%3EA%3C/text%3E%3C/svg%3E"
              avatarFallback="A"
            />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
