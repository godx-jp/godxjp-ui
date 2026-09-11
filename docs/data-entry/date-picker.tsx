import { useState } from "react";
import { ja } from "date-fns/locale";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { DatePicker, FormField } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import type { DateRange } from "react-day-picker";

/**
 * DatePicker — ONE date control. `picker` sets the granularity (day · week · month · quarter ·
 * year), `range` turns it into a two-endpoint field, `multiple` into a set. Always give it a
 * `name` for form submission; it emits ISO-8601 at the picker's own precision. Use
 * `minDate`/`maxDate` to constrain what is selectable. Never hand-roll a date input + calendar,
 * and never compose two DatePickers side-by-side to fake a range — that is `range`.
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  const [issueDate, setIssueDate] = useState<Date | undefined>(new Date(2026, 0, 15));
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [closingDate, setClosingDate] = useState<Date | undefined>(undefined);
  const [meetingDate, setMeetingDate] = useState<Date | undefined>(new Date(2026, 5, 25));
  const [settlementDate, setSettlementDate] = useState<Date | undefined>(undefined);
  const [period, setPeriod] = useState<DateRange | undefined>({
    from: new Date(2026, 3, 1),
    to: new Date(2027, 2, 31),
  });
  const [term, setTerm] = useState<DateRange | undefined>(undefined);

  return (
    <PageContainer
      title="DatePicker"
      subtitle="日付入力 · ISO-8601 タイプ入力 + カレンダーポップオーバー"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>基本 (controlled)</CardTitle>
            <CardDescription>
              value + onValueChange で制御。name= を指定すると ISO yyyy-MM-dd でフォーム送信される。
              入力欄に直接タイプでき、カレンダーと同期。フォーカスを外すと正規の ISO
              形式に整形され、 解釈できない入力は元の値へ復帰する。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="issue-date" label="発行日" required>
              <DatePicker
                id="issue-date"
                name="issue_date"
                value={issueDate}
                onValueChange={setIssueDate}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>fromDate で過去日を無効化</CardTitle>
            <CardDescription>
              支払期限など、今日以降しか選べない場合に fromDate=&#123;new Date(2026, 0, 1)&#125;
              で制限。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="due-date" label="支払期限">
              <DatePicker
                id="due-date"
                name="due_date"
                value={dueDate}
                onValueChange={setDueDate}
                fromDate={new Date(2026, 0, 1)}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>fromDate + toDate で範囲を制限</CardTitle>
            <CardDescription>決算締め日など、選択可能期間を会計年度内に絞る場合。</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="closing-date" label="締め日">
              <DatePicker
                id="closing-date"
                name="closing_date"
                value={closingDate}
                onValueChange={setClosingDate}
                fromDate={new Date(2026, 3, 1)}
                toDate={new Date(2027, 2, 31)}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>disabled 状態</CardTitle>
            <CardDescription>確定済み伝票など編集不可フィールドに使用。</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="posted-date" label="転記日">
              <DatePicker
                id="posted-date"
                name="posted_date"
                value={new Date(2026, 2, 31)}
                disabled
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>defaultValue (uncontrolled)</CardTitle>
            <CardDescription>
              value/onValueChange を渡さず defaultValue で初期値だけ与える非制御モード。状態は
              コンポーネント内部で保持され、name= でそのままフォーム送信できる。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="entry-date" label="起票日">
              <DatePicker id="entry-date" name="entry_date" defaultValue={new Date(2026, 0, 31)} />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>locale で暦の言語を切替</CardTitle>
            <CardDescription>
              locale={"{ja}"} を渡すとカレンダーの曜日・月名が日本語表示になる。値は ISO-8601
              のまま不変で、表示のみ各 locale に追従する。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="meeting-date" label="取締役会開催日">
              <DatePicker
                id="meeting-date"
                name="meeting_date"
                value={meetingDate}
                onValueChange={setMeetingDate}
                locale={ja}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>error 状態 (aria-invalid)</CardTitle>
            <CardDescription>
              FormField の error= を指定すると aria-invalid と role=&quot;alert&quot;
              のエラーメッセージが付与される。必須日付の未入力や範囲外選択の検証結果を提示する。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              id="settlement-date"
              label="決算日"
              required
              error="決算日は会計年度内の日付を入力してください。"
            >
              <DatePicker
                id="settlement-date"
                name="settlement_date"
                value={settlementDate}
                onValueChange={setSettlementDate}
                fromDate={new Date(2026, 3, 1)}
                toDate={new Date(2027, 2, 31)}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>フッター操作 (showToday / showClose)</CardTitle>
            <CardDescription>
              showToday は今日を選択して閉じる。showClose は選択せずに閉じる。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="visit-date" label="来訪日">
              <DatePicker
                id="visit-date"
                name="visit_date"
                value={meetingDate}
                onValueChange={setMeetingDate}
                showToday
                showClose
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>表示形式と元号</CardTitle>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <FormField id="formatted-date" label="契約日">
                <DatePicker
                  id="formatted-date"
                  name="contract"
                  defaultValue={new Date(2026, 8, 9)}
                  format="yyyy年MM月dd日"
                />
              </FormField>
              <FormField id="era-date" label="和暦">
                <DatePicker
                  id="era-date"
                  name="era"
                  defaultValue={new Date(2026, 8, 9)}
                  format={{
                    calendar: "japanese",
                    era: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }}
                  inputReadOnly
                />
              </FormField>
            </Flex>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle level={2}>日時の予約</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField id="appointment-date" label="予約日時">
              <DatePicker
                id="appointment-date"
                name="appointment"
                defaultValue={new Date(2026, 8, 9, 17, 30)}
                showTime
                needConfirm
                presets={[{ label: "翌営業日", value: () => new Date(2026, 8, 10, 9, 0) }]}
              />
            </FormField>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle level={2}>集計単位</CardTitle>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              {(["week", "month", "quarter", "year"] as const).map((picker) => (
                <FormField key={picker} id={`period-${picker}`} label={picker}>
                  <DatePicker
                    id={`period-${picker}`}
                    picker={picker}
                    defaultValue={new Date(2026, 8, 9)}
                    showWeek
                  />
                </FormField>
              ))}
            </Flex>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle level={2}>複数日を確定</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField id="multiple-dates" label="出勤日">
              <DatePicker
                id="multiple-dates"
                name="attendance"
                multiple
                needConfirm
                defaultValue={[new Date(2026, 8, 9), new Date(2026, 8, 11)]}
              />
            </FormField>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle level={2}>期間 (range)</CardTitle>
            <CardDescription>
              range を付けると値は DateRange になり、開始/終了の 2 入力を 1
              つのコントロールにまとめる。 name=&#34;period&#34; は period_from / period_to として
              ISO 送信される。 開始 &gt; 終了で入力しても order (既定 true) が昇順に正規化する。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="period" label="会計期間" required>
              <DatePicker
                range
                id="period"
                name="period"
                value={period}
                onValueChange={setPeriod}
                minDate={new Date(2020, 0, 1)}
                maxDate={new Date(2030, 11, 31)}
              />
            </FormField>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle level={2}>月次の期間 (range × picker)</CardTitle>
            <CardDescription>
              range と picker は直交する。picker=&#34;month&#34; の期間は月グリッドで選び、
              term_from / term_to を ISO yyyy-MM で送信する。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="term" label="対象期間">
              <DatePicker
                range
                picker="month"
                id="term"
                name="term"
                value={term}
                onValueChange={setTerm}
                minDate={new Date(2024, 0, 1)}
                maxDate={new Date(2027, 11, 31)}
              />
            </FormField>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle level={2}>期間プリセットと確定</CardTitle>
            <CardDescription>
              presets · needConfirm · allowEmpty は range でも同じ綴りで効く。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="preset-range" label="集計期間">
              <DatePicker
                range
                id="preset-range"
                name="report"
                format="yyyy/MM/dd"
                needConfirm
                allowEmpty={[false, true]}
                showWeek
                minDate={new Date(2026, 0, 1)}
                maxDate={new Date(2026, 11, 31)}
                presets={[
                  {
                    label: "9月",
                    value: () => ({ from: new Date(2026, 8, 1), to: new Date(2026, 8, 30) }),
                  },
                ]}
              />
            </FormField>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle level={2}>パネルの初期表示 (defaultPickerValue)</CardTitle>
            <CardDescription>
              値とは独立に「パネルがどの期間を開くか」を指定する。会計年度の開始月で開く、
              編集中の行の月で開く、といった要求はこれでしか表現できない。antd と同じく
              開くたびに再適用される。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="fiscal-open" label="会計年度開始月">
              <DatePicker
                id="fiscal-open"
                name="fiscal_open"
                picker="month"
                defaultPickerValue={new Date(2027, 3, 1)}
              />
            </FormField>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle level={2}>片側だけ固定した期間</CardTitle>
            <CardDescription>
              range のとき disabled は [from, to] のタプルを取り、片方だけロックできる。
              「開始日は契約で確定、終了日だけ交渉中」がこれで表現できる。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="contract-period" label="契約期間">
              <DatePicker
                range
                id="contract-period"
                name="contract_period"
                defaultValue={{ from: new Date(2026, 3, 1), to: new Date(2027, 2, 31) }}
                disabled={[true, false]}
              />
            </FormField>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle level={2}>disabled な期間</CardTitle>
            <CardDescription>確定済み期間や読み取り専用フィールドに使用。</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="locked-period" label="確定期間">
              <DatePicker
                range
                id="locked-period"
                name="locked_period"
                value={{ from: new Date(2025, 3, 1), to: new Date(2026, 2, 31) }}
                disabled
              />
            </FormField>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
