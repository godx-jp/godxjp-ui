import "./editorial-examples.css";
import { useState } from "react";
import { useTranslation } from "@godxjp/ui/i18n";
import { Badge } from "@godxjp/ui/data-display";
import { Form, FormField, Input } from "@godxjp/ui/data-entry";
import { Button, Text } from "@godxjp/ui/general";
import {
  CenteredShell,
  EditorialSection,
  EditorialPageHeader,
  EditorialMetaBar,
  EditorialEmptyPanel,
  EditorialStats,
  EditorialToolbar,
  EditorialToggleGroup,
  SettingsLayout,
  SettingsPanel,
  ThemePicker,
  EditorialFootnote,
  EditorialTextButton,
  EditorialAuth,
  EditorialAuthCard,
  Flex,
} from "@godxjp/ui/layout";

/** Collection overview and its editable display preferences. */
export default function Demo() {
  const { t, locale } = useTranslation();
  const [view, setView] = useState("grid");
  const [theme, setTheme] = useState("system");
  return (
    <CenteredShell flow="sections" className="editorial-example">
      <EditorialSection spacing="section">
        <EditorialPageHeader
          title={t("editorialExamples.account")}
          description={t("editorialExamples.lead")}
          eyebrowTone="accent"
        />
        <EditorialMetaBar
          start={t("editorialExamples.source")}
          end={<Text>{t("editorialExamples.saved")}</Text>}
        />
        <EditorialStats
          items={[
            { label: t("editorialExamples.saved"), value: new Intl.NumberFormat(locale).format(0) },
          ]}
        />
        <EditorialToolbar
          divider
          start={<Text>{t("editorialExamples.all")}</Text>}
          end={
            <EditorialToggleGroup
              aria-label={t("editorialExamples.browse")}
              value={view}
              onValueChange={setView}
              items={[
                { value: "grid", label: t("editorialExamples.grid") },
                { value: "list", label: t("editorialExamples.list") },
              ]}
            />
          }
        />
        <EditorialEmptyPanel
          variant="empty"
          title={t("editorialExamples.empty")}
          description={t("editorialExamples.emptyDesc")}
        />
        <SettingsLayout aside={<Text>{t("editorialExamples.settings")}</Text>}>
          <SettingsPanel
            number="01"
            title={t("editorialExamples.settings")}
            description={t("editorialExamples.note")}
          >
            <ThemePicker
              legend={t("editorialExamples.theme")}
              value={theme}
              onValueChange={setTheme}
              options={[
                { value: "light", label: t("editorialExamples.light"), preview: "light" },
                { value: "dark", label: t("editorialExamples.dark"), preview: "dark" },
                { value: "system", label: t("editorialExamples.system"), preview: "system" },
              ]}
            />
          </SettingsPanel>
        </SettingsLayout>
        <EditorialFootnote
          action={
            <EditorialTextButton
              onClick={() => {
                setTheme("system");
                setView("grid");
              }}
            >
              {t("editorialExamples.reset")}
            </EditorialTextButton>
          }
        >
          {t("editorialExamples.note")}
        </EditorialFootnote>
        {/* The sign-in shape: a brand story column (on-brand ink), free-form art instead of the
         * rotated card pair, and an h2 story title because this page already owns its h1. Below
         * 48rem the columns stack and the story becomes a compact band. */}
        <EditorialAuth
          appearance="brand"
          level={2}
          title={t("editorialExamples.signIn")}
          description={t("editorialExamples.signInLead")}
          artFrame="none"
          art={
            <Flex wrap gap="sm">
              <Badge variant="secondary">{t("editorialExamples.saved")}</Badge>
              <Badge variant="secondary">{t("editorialExamples.all")}</Badge>
            </Flex>
          }
          benefits={[t("editorialExamples.benefitSync"), t("editorialExamples.benefitNotes")]}
        >
          <EditorialAuthCard title={t("editorialExamples.welcome")} level={3}>
            <Form onSubmit={(event) => event.preventDefault()}>
              <Flex direction="col" gap="md">
                <FormField id="editorial-auth-email" label={t("editorialExamples.email")}>
                  <Input id="editorial-auth-email" type="email" autoComplete="email" />
                </FormField>
                <Button type="submit">{t("editorialExamples.continue")}</Button>
              </Flex>
            </Form>
          </EditorialAuthCard>
        </EditorialAuth>
      </EditorialSection>
    </CenteredShell>
  );
}
