import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, MonthPicker } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/** MonthPicker — typeable yyyy/MM field with a localized month-grid affordance. */
export default function Demo() {
  const [month, setMonth] = useState<Date | undefined>(new Date(2026, 6, 1));

  return (
    <PageContainer title="MonthPicker" subtitle="年月入力 · yyyy/MM + 月グリッド">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>Controlled · form submission</CardTitle>
            <CardDescription>
              value + onValueChange で制御し、name は yyyy/MM の表示値を送信する。直接入力と
              月グリッド選択のどちらも利用できる。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="billing-month" label="請求年月" required helper="yyyy/MM 形式">
              <MonthPicker
                id="billing-month"
                name="billing_month"
                value={month}
                onValueChange={setMonth}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Uncontrolled · bounded years</CardTitle>
            <CardDescription>
              defaultValue で内部状態を初期化し、fromYear / toYear で年移動を制限する。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="fiscal-month" label="会計年月">
              <MonthPicker
                id="fiscal-month"
                name="fiscal_month"
                defaultValue={new Date(2025, 3, 1)}
                fromYear={2024}
                toYear={2027}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Clear affordance variants</CardTitle>
            <CardDescription>
              値がある既定状態ではクリア操作を表示する。必須フィールドでは allowClear=false
              にして不用意な空値を防ぐ。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <FormField id="clearable-month" label="クリア可能">
                <MonthPicker id="clearable-month" defaultValue={new Date(2026, 0, 1)} />
              </FormField>
              <FormField id="fixed-month" label="クリア不可" required>
                <MonthPicker
                  id="fixed-month"
                  defaultValue={new Date(2026, 0, 1)}
                  allowClear={false}
                />
              </FormField>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Disabled · empty and populated</CardTitle>
            <CardDescription>権限不足または確定済みデータの操作不可状態。</CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <FormField id="disabled-month-empty" label="無効（未選択）">
                <MonthPicker id="disabled-month-empty" disabled />
              </FormField>
              <FormField id="disabled-month-value" label="無効（選択済み）">
                <MonthPicker
                  id="disabled-month-value"
                  defaultValue={new Date(2026, 8, 1)}
                  disabled
                />
              </FormField>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
