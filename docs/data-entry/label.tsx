import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Checkbox, FormField, Input, Label, Switch, Textarea } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Label — styled Radix Label. Always pass htmlFor matching the control's id.
 * PREFER FormField for fields that need helper text, error, or a required marker —
 * it renders Label internally and wires aria-describedby / aria-invalid. Use bare
 * Label only when FormField's block layout is too heavy (inline settings rows,
 * table cells, third-party controls). Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  return (
    <PageContainer
      title="Label"
      subtitle="Bare Radix Label · always htmlFor; prefer FormField when helper / error / required is needed"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Label + Checkbox (inline)</CardTitle>
            <CardDescription>
              A compact pair where Field’s two-line layout is unnecessary, e.g. a “remember me”
              row. When the peer control is disabled, the Label dims (peer-disabled:opacity-70 +
              cursor-not-allowed).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm">
              <Flex direction="row" gap="sm" align="center">
                <Checkbox id="remember-me" defaultChecked />
                <Label htmlFor="remember-me">ログイン状態を保持する</Label>
              </Flex>
              <Flex direction="row" gap="sm" align="center">
                <Checkbox id="remember-device" disabled />
                <Label htmlFor="remember-device">この端末を信頼する（無効）</Label>
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Label + Switch (settings row)</CardTitle>
            <CardDescription>
              Labelling a standalone Switch in an inline row that FormField’s full-width block would
              break.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Flex direction="row" gap="sm" align="center" justify="between">
                <Label htmlFor="auto-save">自動保存</Label>
                <Switch id="auto-save" defaultChecked />
              </Flex>
              <Flex direction="row" gap="sm" align="center" justify="between">
                <Label htmlFor="due-reminder">支払い期日リマインダー</Label>
                <Switch id="due-reminder" />
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Label + Textarea (minimal)</CardTitle>
            <CardDescription>
              A free-text field where helper / error slots are not needed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="memo" label="備考">
              <Textarea id="memo" placeholder="仕訳に関するメモを入力..." rows={3} />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>FormField vs bare Label · prefer FormField</CardTitle>
            <CardDescription>
              FormField renders Label internally, wires aria-describedby / aria-invalid, and adds
              the helper / error / required slots. Use it for real form fields.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <FormField id="invoice-no" label="請求書番号" required helper="例: INV-2024-001">
                <Input id="invoice-no" placeholder="INV-2024-001" />
              </FormField>
              <FormField id="note" label="摘要" error="摘要は必須です">
                <Input id="note" defaultValue="" />
              </FormField>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
