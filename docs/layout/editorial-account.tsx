import "./editorial-examples.css";
import { useState } from "react";
import { useTranslation } from "@godxjp/ui/i18n";
import { Text } from "@godxjp/ui/general";
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
      </EditorialSection>
    </CenteredShell>
  );
}
