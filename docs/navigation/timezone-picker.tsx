import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { TimezonePicker } from "@godxjp/ui/navigation";
import type { AppTimezone } from "@godxjp/ui/app";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * TimezonePicker — IANA タイムゾーンセレクター。AppProvider なしで使う場合は
 * controlled モード (value + onValueChange) が必須。options で表示リストを絞れる。
 * グローブアイコン付き Select として構成済み — 手書き実装不要。
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  const [timezone, setTimezone] = useState<AppTimezone>("Asia/Tokyo");
  const [orgTimezone, setOrgTimezone] = useState<AppTimezone>("Asia/Tokyo");
  const [reportTimezone, setReportTimezone] = useState<AppTimezone>("UTC");

  return (
    <PageContainer
      title="TimezonePicker"
      subtitle="タイムゾーンセレクター — AppProvider なしで controlled モードで動作"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>全 IANA タイムゾーン（コントロール済み）</CardTitle>
            <CardDescription>全タイムゾーンリストから選択。選択中: {timezone}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="tz-picker-main" className="text-sm font-medium">
                タイムゾーン
              </label>
              <TimezonePicker id="tz-picker-main" value={timezone} onValueChange={setTimezone} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>オプション絞り込み — アジア太平洋</CardTitle>
            <CardDescription>
              options プロパティでリストをアジア太平洋のみに制限した例。 選択中: {orgTimezone}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="tz-picker-apac" className="text-sm font-medium">
                組織タイムゾーン
              </label>
              <TimezonePicker
                id="tz-picker-apac"
                value={orgTimezone}
                onValueChange={setOrgTimezone}
                options={[
                  "Asia/Tokyo",
                  "Asia/Seoul",
                  "Asia/Shanghai",
                  "Asia/Singapore",
                  "Asia/Ho_Chi_Minh",
                  "Asia/Bangkok",
                  "Australia/Sydney",
                ]}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>レポート出力タイムゾーン</CardTitle>
            <CardDescription>
              CSV・PDF エクスポート時の日時表示タイムゾーンを個別に設定できます。 選択中:{" "}
              {reportTimezone}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex max-w-sm flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="tz-picker-report" className="text-sm font-medium">
                  エクスポートタイムゾーン
                </label>
                <TimezonePicker
                  id="tz-picker-report"
                  value={reportTimezone}
                  onValueChange={setReportTimezone}
                  options={["Asia/Tokyo", "UTC", "America/New_York", "Europe/London"]}
                />
              </div>
              <p className="text-muted-foreground text-xs">
                グローバルアプリ設定とは独立したレポート専用の設定です。
              </p>
            </div>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
