import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Checkbox, CheckboxGroup, Field } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Checkbox — a single boolean (wrap in Field for a labelled row) or a
 * CheckboxGroup from an options array. Composed only from real @godxjp/ui
 * components.
 */
export default function Demo() {
  return (
    <PageContainer
      title="Checkbox"
      subtitle="Single checkbox (in Field) or a CheckboxGroup from options"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Single — labelled with Field</CardTitle>
            <CardDescription>
              Field pairs the control with a label + optional description.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Field id="agree" label="利用規約に同意する" description="続行するには同意が必要です">
                <Checkbox id="agree" defaultChecked />
              </Field>
              <Field id="news" label="お知らせを受け取る">
                <Checkbox id="news" />
              </Field>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CheckboxGroup (options)</CardTitle>
            <CardDescription>Multi-select from a data-driven options array.</CardDescription>
          </CardHeader>
          <CardContent>
            <CheckboxGroup
              defaultValue={["pdf"]}
              options={[
                { value: "pdf", label: "PDF 出力" },
                { value: "csv", label: "CSV 出力" },
                { value: "mail", label: "メール送信" },
              ]}
            />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
