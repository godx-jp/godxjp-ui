import { useState } from "react";
import { ja } from "date-fns/locale";

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
  const [campaign, setCampaign] = useState<DateRange | undefined>({
    from: new Date(2026, 5, 1),
    to: new Date(2026, 5, 30),
  });

  return (
    <PageContainer
      title="DateRangePicker"
      subtitle="期間入力 · 開始/終了 ISO 入力 + 範囲カレンダーポップオーバー"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>基本 (controlled)</CardTitle>
            <CardDescription>
              value + onValueChange で制御。開始/終了を直接タイプ入力するか、カレンダーアイコンを開いて
              範囲を選択できる。name=&#34;period&#34; を指定すると period_from / period_to として ISO
              yyyy-MM-dd でフォーム送信される。
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
            <CardTitle>非制御 (defaultValue)</CardTitle>
            <CardDescription>
              value / onValueChange を渡さず defaultValue で初期範囲だけ与える。状態はコンポーネント内部で
              保持され、name=&#34;fiscal_year&#34; のまま fiscal_year_from / fiscal_year_to として送信される。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="fiscal-year" label="会計年度 (初期値のみ)">
              <DateRangePicker
                id="fiscal-year"
                name="fiscal_year"
                defaultValue={{
                  from: new Date(2026, 3, 1),
                  to: new Date(2027, 2, 31),
                }}
                fromDate={new Date(2020, 0, 1)}
                toDate={new Date(2030, 11, 31)}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>locale で日本語カレンダー</CardTitle>
            <CardDescription>
              locale=&#123;ja&#125; を渡すとポップオーバーのカレンダーが日本語表記 (曜日・月名) になる。
              入力欄は常に ISO yyyy-MM-dd を保持する。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="campaign-period" label="キャンペーン期間">
              <DateRangePicker
                id="campaign-period"
                name="campaign_period"
                value={campaign}
                onValueChange={setCampaign}
                locale={ja}
                fromDate={new Date(2024, 0, 1)}
                toDate={new Date(2027, 11, 31)}
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
