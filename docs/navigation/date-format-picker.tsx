import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { DateFormatPicker } from "@godxjp/ui/navigation";
import type { AppDateFormat } from "@godxjp/ui/app";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * DateFormatPicker — 日付表示形式セレクター (ISO / DMY / MDY)。
 * AppProvider なしで使う場合は controlled モード (value + onValueChange) が必須。
 * CalendarDays アイコン付き Select として構成済み。
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  const [dateFormat, setDateFormat] = useState<AppDateFormat>("iso");
  const [exportFormat, setExportFormat] = useState<AppDateFormat>("dmy");

  return (
    <PageContainer
      title="DateFormatPicker"
      subtitle="日付表示形式セレクター — ISO / DMY / MDY をコントロールモードで選択"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>表示形式設定（コントロール済み）</CardTitle>
            <CardDescription>
              アプリ全体の日付表示形式を選択します。選択中: {dateFormat}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="date-fmt-main" className="text-sm font-medium">
                日付フォーマット
              </label>
              <DateFormatPicker
                id="date-fmt-main"
                value={dateFormat}
                onValueChange={setDateFormat}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>エクスポートダイアログ — 個別設定</CardTitle>
            <CardDescription>
              CSV・PDF エクスポート時の日付形式をグローバル設定とは独立して選択。 選択中:{" "}
              {exportFormat}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex max-w-xs flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="date-fmt-export" className="text-sm font-medium">
                  エクスポート日付形式
                </label>
                <DateFormatPicker
                  id="date-fmt-export"
                  value={exportFormat}
                  onValueChange={setExportFormat}
                />
              </div>
              <p className="text-muted-foreground text-xs">
                この設定はこのエクスポートにのみ適用されます。グローバル設定は変更されません。
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
                htmlFor="date-fmt-disabled"
                className="text-muted-foreground text-sm font-medium"
              >
                日付フォーマット（読み取り専用）
              </label>
              <DateFormatPicker
                id="date-fmt-disabled"
                value="iso"
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
