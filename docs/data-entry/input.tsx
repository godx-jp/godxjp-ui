import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, Input } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Input — styled wrapper around the native input. Always pair with FormField for
 * a labelled, a11y-wired field. Never a raw <input>. Composed only from real
 * @godxjp/ui components.
 */
export default function Demo() {
  return (
    <PageContainer
      title="Input"
      subtitle="Text field · pair with FormField for label / helper / error"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>States</CardTitle>
            <CardDescription>
              Placeholder, filled, disabled, readOnly, and invalid
              (aria-invalid). Focus an empty field to see the focus-visible
              ring.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Input placeholder="プレースホルダー" />
              <Input defaultValue="入力済みの値" />
              <Input disabled defaultValue="無効 (disabled)" />
              <Input readOnly defaultValue="読み取り専用 (readOnly)" />
              <Input aria-invalid defaultValue="不正な値 (aria-invalid)" />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Types</CardTitle>
            <CardDescription>
              The native type attribute drives the input mode and built-in UI;
              type="file" uses the file: styling baked into the component.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Input type="password" defaultValue="secret-value" />
              <Input type="number" defaultValue={42} />
              <Input type="date" defaultValue="2026-06-04" />
              <Input type="file" aria-label="ファイルを選択" />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>In FormField · label / helper / required / error</CardTitle>
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
      </Flex>
    </PageContainer>
  );
}
