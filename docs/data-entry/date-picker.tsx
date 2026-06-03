import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { DatePicker, FormField } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * DatePicker — WAI-ARIA date combobox with a real typeable ISO-8601 input.
 * Always give it a `name` for form submission. Use `fromDate`/`toDate` to
 * constrain the selectable range. Never hand-roll a date input + calendar.
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  const [issueDate, setIssueDate] = useState<Date | undefined>(new Date(2026, 0, 15));
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [closingDate, setClosingDate] = useState<Date | undefined>(undefined);

  return (
    <PageContainer
      title="DatePicker"
      subtitle="日付入力 — ISO-8601 タイプ入力 + カレンダーポップオーバー"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>基本 (controlled)</CardTitle>
            <CardDescription>
              value + onValueChange で制御。name= を指定すると ISO yyyy-MM-dd でフォーム送信される。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="issue-date" label="発行日" required>
              <DatePicker
                id="issue-date"
                name="issue_date"
                value={issueDate}
                onValueChange={setIssueDate}
                placeholder="yyyy-mm-dd"
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>fromDate で過去日を無効化</CardTitle>
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
                placeholder="yyyy-mm-dd"
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>fromDate + toDate で範囲を制限</CardTitle>
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
                placeholder="yyyy-mm-dd"
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>disabled 状態</CardTitle>
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
      </Flex>
    </PageContainer>
  );
}
