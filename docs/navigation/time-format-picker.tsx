import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { TimeFormatPicker } from "@godxjp/ui/navigation";
import type { AppTimeFormat } from "@godxjp/ui/app";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * TimeFormatPicker — 時刻表示形式セレクター (12h / 24h)。
 * AppProvider なしで使う場合は controlled モード (value + onValueChange) が必須。
 * Clock アイコン付き Select として構成済み。
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  const [timeFormat, setTimeFormat] = useState<AppTimeFormat>("24h");
  const [reportTimeFormat, setReportTimeFormat] = useState<AppTimeFormat>("12h");

  return (
    <PageContainer
      title="TimeFormatPicker"
      subtitle="時刻表示形式セレクター — 12時間制 / 24時間制をコントロールモードで選択"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>時刻表示設定（コントロール済み）</CardTitle>
            <CardDescription>
              アプリ全体の時刻表示形式を選択します。選択中: {timeFormat}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="time-fmt-main" className="text-sm font-medium">
                時刻フォーマット
              </label>
              <TimeFormatPicker
                id="time-fmt-main"
                value={timeFormat}
                onValueChange={setTimeFormat}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ユーザープロフィール設定</CardTitle>
            <CardDescription>
              LocalePicker・TimezonePicker・DateFormatPicker と並べて使う設定パネルの例。 選択中:{" "}
              {reportTimeFormat}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex max-w-xs flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="time-fmt-profile" className="text-sm font-medium">
                  時刻の表示形式
                </label>
                <TimeFormatPicker
                  id="time-fmt-profile"
                  value={reportTimeFormat}
                  onValueChange={setReportTimeFormat}
                />
              </div>
              <p className="text-muted-foreground text-xs">
                日本・ベトナムでは 24 時間制、英語圏では 12 時間制が一般的です。
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>無効状態</CardTitle>
            <CardDescription>
              disabled プロパティでセレクターを読み取り専用にできます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="time-fmt-disabled"
                className="text-muted-foreground text-sm font-medium"
              >
                時刻フォーマット（読み取り専用）
              </label>
              <TimeFormatPicker
                id="time-fmt-disabled"
                value="24h"
                onValueChange={() => {}}
                disabled
              />
            </div>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
