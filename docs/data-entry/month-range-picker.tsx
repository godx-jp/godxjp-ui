import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, MonthRangePicker } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import type { DateRange } from "react-day-picker";

/**
 * MonthRangePicker — 年月 (yyyy/MM) 範囲入力。DateRangePicker と同じ
 * 「ひとつのコントロール [開始 → 終了 ✕ 📅]」規約で、月グリッドポップオーバーを
 * 視覚的アフォーダンスとして持つ。逆順 (from > to) は自動で入れ替え正規化される。
 * MonthPicker を 2 つ並べて範囲を偽装しないこと。
 */
export default function Demo() {
  const [closing, setClosing] = useState<DateRange | undefined>({
    from: new Date(2026, 0, 1),
    to: new Date(2026, 5, 1),
  });
  const [negotiation, setNegotiation] = useState<DateRange | undefined>(undefined);

  return (
    <PageContainer
      title="MonthRangePicker"
      subtitle="年月範囲入力 · 開始/終了 yyyy/MM 入力 + 月グリッドポップオーバー"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>基本 (controlled)</CardTitle>
            <CardDescription>
              value + onValueChange で制御。開始/終了を直接タイプ入力するか、カレンダーアイコンから
              月グリッドで 2 ステップ選択 (開始 → 終了)。逆順に選んでも from ≤ to
              に自動正規化される。name=&#34;closing_ym&#34; を指定すると closing_ym_from /
              closing_ym_to として yyyy/MM でフォーム送信される。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="closing-ym" label="締め年月" required>
              <MonthRangePicker
                id="closing-ym"
                name="closing_ym"
                value={closing}
                onValueChange={setClosing}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>検索フィルター (未選択)</CardTitle>
            <CardDescription>
              初期値なし。確定済み範囲の上でもう一度選ぶと新しい範囲が開始される (reset-on-complete
              — 開始月が固まって選び直せない、が起きない)。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="negotiation-ym" label="商談発生年月">
              <MonthRangePicker
                id="negotiation-ym"
                name="search_negotiation_ym"
                value={negotiation}
                onValueChange={setNegotiation}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>非制御 (defaultValue) + 年クランプ</CardTitle>
            <CardDescription>
              defaultValue で初期範囲だけ与え、fromYear / toYear
              でグリッドの年ナビゲーションを境界年で止める。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="fiscal-ym" label="会計年度範囲 (2024–2027)">
              <MonthRangePicker
                id="fiscal-ym"
                name="fiscal_ym"
                defaultValue={{
                  from: new Date(2026, 3, 1),
                  to: new Date(2027, 2, 1),
                }}
                fromYear={2024}
                toYear={2027}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>disabled 状態</CardTitle>
            <CardDescription>確定済み範囲や読み取り専用フィールドに使用。</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="locked-ym" label="確定範囲">
              <MonthRangePicker
                id="locked-ym"
                name="locked_ym"
                value={{
                  from: new Date(2025, 3, 1),
                  to: new Date(2026, 2, 1),
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
