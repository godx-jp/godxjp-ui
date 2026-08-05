import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Field, Switch } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Switch — a boolean toggle. Wrap in Field (NOT FormField) for a labelled row
 * with the hidden form input + description. Composed only from real @godxjp/ui
 * components.
 */
export default function Demo() {
  return (
    <PageContainer title="Switch" subtitle="Boolean toggle · wrap in Field for a labelled row">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>Labelled rows (Field)</CardTitle>
            <CardDescription>Field owns the label, description, and form input.</CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Field
                id="invoice-mail"
                label="請求書をメール送信"
                description="発行時に取引先へ自動送信します"
              >
                <Switch id="invoice-mail" defaultChecked />
              </Field>
              <Field id="reminder" label="支払期日リマインダー" description="期日3日前に通知します">
                <Switch id="reminder" />
              </Field>
              <Field id="locked" label="期間ロック" description="確定済みのため変更できません">
                <Switch id="locked" disabled defaultChecked />
              </Field>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>size · sm / md</CardTitle>
            <CardDescription>
              sm は一覧行やツールバーなど密度の高い場所、md (既定) は設定画面の行に使う。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Field
                id="sw-size-sm"
                label="自動保存 (sm)"
                description="行の高さを抑えた一覧向けのサイズ"
              >
                <Switch id="sw-size-sm" size="sm" defaultChecked />
              </Field>
              <Field
                id="sw-size-md"
                label="自動保存 (md · 既定)"
                description="設定画面の標準サイズ"
              >
                <Switch id="sw-size-md" size="md" defaultChecked />
              </Field>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
