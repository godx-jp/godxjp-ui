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
        <Input id="code" size="sm" placeholder="Compact tier (sm)" aria-label="Code" />
      </Flex>
    </PageContainer>
  );
}
