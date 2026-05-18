"use client";

import {
  Card,
  CardSection,
  Card,
  CardTitleText,
  Label,
  Select,
  SelectMenu,
  SelectOptionRow,
  SelectControl,
  SelectDisplay,
} from "@godxjp/ui";

import { PageContent } from "@/components/layout/page-content";
import { PageHeader } from "@/components/layout/page-header";
import { useLocale, useTranslation, useTimezone } from "@/providers/app-provider";

export default function SettingsPage() {
  const { t } = useTranslation();
  const { locale, setLocale, locales } = useLocale();
  const { timezone, setTimezone } = useTimezone();

  const timezones = [
    "Asia/Tokyo",
    "Asia/Ho_Chi_Minh",
    "Asia/Manila",
    "UTC",
    "America/New_York",
    "America/Los_Angeles",
    "Europe/London",
  ];

  return (
    <>
      <PageHeader title={t("nav.me.settings")} />
      <PageContent>
        <Card className="max-w-xl">
          <Card>
            <CardTitleText>Ngôn ngữ & Múi giờ</CardTitleText>
          </Card>
          <CardSection className="space-y-4">
            <div className="space-y-2">
              <Label>Ngôn ngữ</Label>
              <Select value={locale} onValueChange={(v) => setLocale(v as typeof locale)}>
                <SelectControl>
                  <SelectDisplay />
                </SelectControl>
                <SelectMenu>
                  {(Object.keys(locales) as Array<keyof typeof locales>).map((l) => (
                    <SelectOptionRow key={l} value={l}>
                      {l}
                    </SelectOptionRow>
                  ))}
                </SelectMenu>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Múi giờ</Label>
              <Select value={timezone} onValueChange={(v) => setTimezone(v)}>
                <SelectControl>
                  <SelectDisplay />
                </SelectControl>
                <SelectMenu>
                  {timezones.map((tz) => (
                    <SelectOptionRow key={tz} value={tz}>
                      {tz}
                    </SelectOptionRow>
                  ))}
                </SelectMenu>
              </Select>
            </div>
          </CardSection>
        </Card>
      </PageContent>
    </>
  );
}
