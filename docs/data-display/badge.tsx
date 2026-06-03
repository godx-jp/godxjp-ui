import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Badge — status / category chip. Composed only from real @godxjp/ui components.
 * dxs-kintai: semantic mapping is FIXED (success 若竹 / warning 山吹 / info 群青 /
 * danger 茜). Labels never wrap (rule #35).
 */
const variants = [
  { variant: "default" as const, label: "既定 Default" },
  { variant: "secondary" as const, label: "区分 Category" },
  { variant: "outline" as const, label: "補助 Subtle" },
  { variant: "neutral" as const, label: "中立 Neutral" },
  { variant: "success" as const, label: "承認済 Approved" },
  { variant: "warning" as const, label: "保留 Pending" },
  { variant: "info" as const, label: "情報 Info" },
  { variant: "destructive" as const, label: "却下 Rejected" },
];

const statuses = ["active", "draft", "pending", "cancelled", "failed", "scheduled"];

export default function Demo() {
  return (
    <PageContainer
      title="Badge"
      subtitle="Static variants + auto-mapped lifecycle status — labels never wrap"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Static variants</CardTitle>
            <CardDescription>
              Pick by intent, never aesthetics. success = approved/paid · warning = pending ·
              destructive = rejected · info · secondary/outline/neutral = neutral category.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" wrap align="center" gap="sm">
              {variants.map((v) => (
                <Badge key={v.variant} variant={v.variant}>
                  {v.label}
                </Badge>
              ))}
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lifecycle status</CardTitle>
            <CardDescription>
              status=&quot;key&quot; auto-maps known lifecycle keys to tone + icon + i18n label.
              Unknown keys fall back to neutral.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" wrap align="center" gap="sm">
              {statuses.map((s) => (
                <Badge key={s} status={s} />
              ))}
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
