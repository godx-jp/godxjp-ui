import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, Input } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Input — styled wrapper around the native input. Always pair with FormField for
 * a labelled, a11y-wired field. Never a raw <input>. Composed only from real
 * @godxjp/ui components.
 */
export default function Demo() {
  const [contractValue, setContractValue] = useState("制御値");
  return (
    <PageContainer
      title="Input"
      subtitle="Text field · pair with FormField for label / helper / error"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>States</CardTitle>
            <CardDescription>
              Placeholder, filled, disabled, readOnly, and invalid (aria-invalid). Focus an empty
              field to see the focus-visible ring.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Input aria-label="プレースホルダー状態" placeholder="プレースホルダー" />
              <Input aria-label="入力済み状態" defaultValue="入力済みの値" />
              <Input aria-label="無効状態" disabled defaultValue="無効 (disabled)" />
              <Input
                aria-label="読み取り専用状態"
                readOnly
                defaultValue="読み取り専用 (readOnly)"
              />
              <Input
                aria-label="不正な値の状態"
                aria-invalid
                defaultValue="不正な値 (aria-invalid)"
              />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Owned affordances · controlled and uncontrolled</CardTitle>
            <CardDescription>
              Leading/trailing content and allowClear/onClear are rendered with both value modes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Input
                aria-label="制御されたクリア可能入力"
                value={contractValue}
                onChange={(event) => setContractValue(event.target.value)}
                allowClear
                onClear={() => setContractValue("")}
                leadingIcon={<span aria-hidden="true">¥</span>}
              />
              <Input
                aria-label="非制御の装飾付き入力"
                defaultValue="INV-2026-001"
                allowClear={false}
                trailingIcon={<span aria-hidden="true">#</span>}
              />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Types</CardTitle>
            <CardDescription>
              The native type attribute drives the input mode and built-in UI; type="file" uses the
              file: styling baked into the component.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Input aria-label="パスワード型" type="password" defaultValue="secret-value" />
              <Input aria-label="数値型" type="number" defaultValue={42} />
              <Input aria-label="日付型" type="date" defaultValue="2026-06-04" />
              <Input type="file" aria-label="ファイルを選択" />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>In FormField · label / helper / required / error</CardTitle>
            <CardDescription>
              FormField wires the label and aria-describedby for you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <FormField id="partner" label="取引先名" required helper="最大50文字">
                <Input id="partner" placeholder="株式会社..." />
              </FormField>
              <FormField id="email" label="メール" error="メールアドレスの形式が正しくありません">
                <Input id="email" type="email" defaultValue="invalid@" />
              </FormField>
            </Flex>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle level={2}>Ant Design axes · status, variant, size</CardTitle>
            <CardDescription>
              status is the validation state a form paints consistently (error also reports
              aria-invalid; warning does not, because a warning is not a validity failure). variant
              is how much chrome the field draws. size is the shared control-height ladder.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Input aria-label="エラー状態" status="error" defaultValue="不正な値" />
              <Input aria-label="警告状態" status="warning" defaultValue="確認してください" />
              <Input aria-label="枠線あり" variant="outlined" defaultValue="outlined" />
              <Input aria-label="塗りつぶし" variant="filled" defaultValue="filled" />
              <Input aria-label="枠線なし" variant="borderless" defaultValue="borderless" />
              <Input aria-label="小さいサイズ" size="sm" placeholder="Compact tier (sm)" />
              <Input aria-label="標準サイズ" size="md" placeholder="Default tier (md)" />
              <Input aria-label="大きいサイズ" size="lg" placeholder="Comfortable tier (lg)" />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Affixes · prefix / suffix inside, addons outside</CardTitle>
            <CardDescription>
              A prefix or suffix sits inside the field&apos;s own box, in its padding. An addon is a
              separate surface welded to the outside of the border: a protocol, a currency, a unit.
              The counter reports an overrun and never edits the value.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Input aria-label="金額" prefix="¥" suffix="円" defaultValue="12000" />
              <Input
                aria-label="サイト"
                addonBefore="https://"
                addonAfter=".co.jp"
                defaultValue="example"
              />
              <Input aria-label="件名" count={{ max: 20 }} defaultValue="東京都の請求書" />
              <Input aria-label="超過した件名" count={{ max: 5 }} defaultValue="長すぎる件名です" />
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
