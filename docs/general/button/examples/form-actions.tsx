import { Card, CardContent, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, Input } from "@godxjp/ui/data-entry";
import { Button } from "@godxjp/ui/general";
import { Flex } from "@godxjp/ui/layout";

/**
 * Form footer — the canonical pairing: one primary submit + an outline cancel,
 * right-aligned. type="submit" / type="button" prevent accidental double-submit.
 */
export default function Demo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>取引先の編集</CardTitle>
      </CardHeader>
      <CardContent>
        <Flex direction="col" gap="md">
          <FormField id="partner-name" label="取引先名">
            <Input id="partner-name" defaultValue="株式会社ベトヤ" />
          </FormField>
          <FormField id="partner-code" label="取引先コード">
            <Input id="partner-code" defaultValue="BTY-0012" />
          </FormField>
          <Flex direction="row" wrap justify="end" gap="sm">
            <Button variant="outline" type="button">
              キャンセル
            </Button>
            <Button type="submit">保存</Button>
          </Flex>
        </Flex>
      </CardContent>
    </Card>
  );
}
