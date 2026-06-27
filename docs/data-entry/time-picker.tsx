import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, TimePicker } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * TimePicker — 24h HH:mm combobox with a scrollable hour/minute popover.
 * The visible input IS the form field — give it a `name` and it submits
 * directly. Adjust minuteStep for domain needs (15 for scheduling, 1 for
 * precise entry). Never a raw <input type="time">. Composed only from real
 * @godxjp/ui components.
 */
export default function Demo() {
  const [cutoffTime, setCutoffTime] = useState("17:00");
  const [shiftStart, setShiftStart] = useState("09:00");
  const [shiftEnd, setShiftEnd] = useState("18:00");

  return (
    <PageContainer
      title="TimePicker"
      subtitle="時刻入力 · 24h HH:mm コンボボックス、スクロール選択付き"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>基本 (controlled)</CardTitle>
            <CardDescription>
              value + onValueChange で制御。name= を指定すると HH:mm でフォーム送信される。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="cutoff-time" label="締め時刻" required>
              <TimePicker
                id="cutoff-time"
                name="cutoff_time"
                value={cutoffTime}
                onValueChange={setCutoffTime}
                minuteStep={5}
                className="w-36"
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>minuteStep={15} — シフト入力</CardTitle>
            <CardDescription>
              勤怠管理など 15 分刻みの列を表示。typed 入力は任意の HH:mm を受け付ける。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" gap="md" wrap>
              <FormField id="shift-start" label="出勤時刻">
                <TimePicker
                  id="shift-start"
                  name="shift_start"
                  value={shiftStart}
                  onValueChange={setShiftStart}
                  minuteStep={15}
                  className="w-36"
                />
              </FormField>
              <FormField id="shift-end" label="退勤時刻">
                <TimePicker
                  id="shift-end"
                  name="shift_end"
                  value={shiftEnd}
                  onValueChange={setShiftEnd}
                  minuteStep={15}
                  className="w-36"
                />
              </FormField>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>disabled 状態</CardTitle>
            <CardDescription>確定済みシフトや読み取り専用フィールドに使用。</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="locked-time" label="確定時刻">
              <TimePicker
                id="locked-time"
                name="locked_time"
                value="09:00"
                disabled
                className="w-36"
              />
            </FormField>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
