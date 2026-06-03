import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { DateRangePicker, FormField } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import type { DateRange } from "react-day-picker";

/**
 * DateRangePicker — WAI-ARIA date-range control with two typeable ISO inputs
 * + popover calendar. Submits as ${name}_from / ${name}_to. Never compose
 * two DatePickers side-by-side to fake a range. Composed only from real
 * @godxjp/ui components.
 */
export default function Demo() {
  const [period, setPeriod] = useState<DateRange | undefined>({
    from: new Date(2026, 3, 1),
    to: new Date(2027, 2, 31),
  });
  const [reportRange, setReportRange] = useState<DateRange | undefined>(undefined);

  return (
    <PageContainer
      title="DateRangePicker"
      subtitle="期間入力 — 開始/終了 ISO 入力 + 範囲カレンダーポップオーバー"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>基本 (controlled)</CardTitle>
            <CardDescription>
              value + onValueChange で制御。name=“period” を指定すると period_from / period_to
              として ISO yyyy-MM-dd でフォーム送信される。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="period" label="会計期間" required>
              <DateRangePicker
                id="period"
                name="period"
                value={period}
                onValueChange={setPeriod}
                fromDate={new Date(2020, 0, 1)}
                toDate={new Date(2030, 11, 31)}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>レポート期間フィルター (未選択)</CardTitle>
            <CardDescription>
              初期値なし。選択後は reportRange_from / reportRange_to
              がクエリパラメータとして使われる。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="report-range" label="レポート期間">
              <DateRangePicker
                id="report-range"
                name="reportRange"
                value={reportRange}
                onValueChange={setReportRange}
                fromDate={new Date(2024, 0, 1)}
                toDate={new Date(2026, 11, 31)}
                placeholder="yyyy-mm-dd"
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>disabled 状態</CardTitle>
            <CardDescription>確定済み期間や読み取り専用フィールドに使用。</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="locked-period" label="確定期間">
              <DateRangePicker
                id="locked-period"
                name="locked_period"
                value={{
                  from: new Date(2025, 3, 1),
                  to: new Date(2026, 2, 31),
                }}
                disabled
              />
            </FormField>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
