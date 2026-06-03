import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
import { Field, Switch } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Switch — a boolean toggle. Wrap in Field (NOT FormField) for a labelled row
 * with the hidden form input + description. Composed only from real @godxjp/ui
 * components.
 */
export default function Demo() {
  return (
    <PageContainer title="Switch" subtitle="Boolean toggle — wrap in Field for a labelled row">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Labelled rows (Field)</CardTitle>
            <CardDescription>Field owns the label, description, and form input.</CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Field id="invoice-mail" label="請求書をメール送信" description="発行時に取引先へ自動送信します">
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
      </Flex>
    </PageContainer>
  );
}
