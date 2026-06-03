import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
import { FormField, Textarea } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Textarea — styled wrapper around the native textarea. Pair with FormField for
 * a labelled field. Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  return (
    <PageContainer title="Textarea" subtitle="Multi-line text — pair with FormField for label / helper">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>States</CardTitle>
            <CardDescription>Placeholder, filled, and disabled.</CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Textarea placeholder="摘要を入力..." />
              <Textarea defaultValue={"4月分 受注\nINV-2024-0312"} />
              <Textarea disabled defaultValue="無効 (disabled)" />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>In FormField</CardTitle>
            <CardDescription>Labelled with a helper hint.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="memo" label="摘要" helper="仕訳に表示される説明文です">
              <Textarea id="memo" placeholder="例: 4月分 受注 INV-2024-0312" />
            </FormField>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
