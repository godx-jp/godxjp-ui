"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
          <CardHeader>
            <CardTitle>Ngôn ngữ & Múi giờ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Ngôn ngữ</Label>
              <Select value={locale} onValueChange={(v) => setLocale(v as typeof locale)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(locales) as Array<keyof typeof locales>).map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Múi giờ</Label>
              <Select value={timezone} onValueChange={(v) => setTimezone(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </PageContent>
    </>
  );
}
