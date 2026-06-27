import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, TimeInput } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * TimeInput — masking HH:mm input with validation and optional minute step
 * quantization. Lighter than TimePicker (no popover) — use for simple time
 * filter fields or schedule pickers that don't need a scrollable column UI.
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  const [filterTime, setFilterTime] = useState("09:00");
  const [openTime, setOpenTime] = useState("08:30");
  const [closeTime, setCloseTime] = useState("17:30");

  return (
    <PageContainer
      title="TimeInput"
      subtitle="HH:mm マスク入力 · ポップオーバーなしの軽量時刻フィールド"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>基本 (controlled)</CardTitle>
            <CardDescription>
              value + onValueChange で制御。バリデーション済みの HH:mm 文字列が返される。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="filter-time" label="締め時刻フィルター">
              <TimeInput
                id="filter-time"
                name="filter_time"
                value={filterTime}
                onValueChange={setFilterTime}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>step={15} — 15 分刻みの量子化</CardTitle>
            <CardDescription>
              勤務時間の開始・終了など 15 分単位で入力させるフィールドに使用。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" gap="md" wrap>
              <FormField id="open-time" label="業務開始時刻">
                <TimeInput
                  id="open-time"
                  name="open_time"
                  value={openTime}
                  onValueChange={setOpenTime}
                  step={15}
                />
              </FormField>
              <FormField id="close-time" label="業務終了時刻">
                <TimeInput
                  id="close-time"
                  name="close_time"
                  value={closeTime}
                  onValueChange={setCloseTime}
                  step={15}
                />
              </FormField>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>uncontrolled (defaultValue)</CardTitle>
            <CardDescription>
              React 管理不要なネイティブフォームで使用。送信時に name 経由で HH:mm 値が渡される。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="cutoff-uncontrolled" label="締め時刻 (非制御)">
              <TimeInput
                id="cutoff-uncontrolled"
                name="cutoff_time"
                defaultValue="23:59"
                placeholder="hh:mm"
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>disabled 状態</CardTitle>
            <CardDescription>確定済みスケジュールや読み取り専用フィールドに使用。</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="locked-time" label="確定時刻">
              <TimeInput id="locked-time" name="locked_time" value="12:00" disabled />
            </FormField>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
