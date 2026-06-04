import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, Input, Select } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * FormField — wraps one control with a label, helper, and error, and wires
 * aria-describedby / aria-invalid onto the child. Use it for every stacked
 * labelled control (Input/Textarea/Select/DatePicker…); use Field for a
 * checkbox/switch beside its label. Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  return (
    <PageContainer
      title="FormField"
      subtitle="Label · helper · required · error — a11y wired for the control"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>States</CardTitle>
            <CardDescription>
              required adds a red asterisk; helper is a muted hint; error (role=alert) overrides it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <FormField id="ff-name" label="取引先名" required helper="最大50文字">
                <Input id="ff-name" placeholder="株式会社..." />
              </FormField>
              <FormField
                id="ff-email"
                label="メール"
                error="メールアドレスの形式が正しくありません"
              >
                <Input id="ff-email" type="email" defaultValue="invalid@" />
              </FormField>
              <FormField id="ff-status" label="状態" helper="未選択の場合は下書きになります">
                <Select
                  id="ff-status"
                  name="status"
                  value="paid"
                  onValueChange={() => {}}
                  options={[
                    { value: "draft", label: "下書き" },
                    { value: "paid", label: "入金済" },
                  ]}
                />
              </FormField>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
