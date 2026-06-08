import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { Star } from "lucide-react";

/**
 * Badge — status / category chip. Composed only from real @godxjp/ui components.
 * variant is STRUCTURAL (default / secondary / outline); tone is SEMANTIC (ToneProp).
 * dxs-kintai: semantic mapping is FIXED (success 若竹 / warning 山吹 / info 群青 /
 * destructive 茜). Labels never wrap (rule #35).
 */
const variants = [
  { variant: "default" as const, label: "既定 Default" },
  { variant: "secondary" as const, label: "区分 Category" },
  { variant: "outline" as const, label: "補助 Subtle" },
  { variant: "dashed" as const, label: "点線 Dashed" },
];

const shapes = [
  { shape: "default" as const, label: "既定 Default" },
  { shape: "pill" as const, label: "丸み Pill" },
  { shape: "sharp" as const, label: "角 Sharp" },
];

const tones = [
  { tone: "default" as const, label: "既定 Default" },
  { tone: "success" as const, label: "承認済 Approved" },
  { tone: "warning" as const, label: "保留 Pending" },
  { tone: "destructive" as const, label: "却下 Rejected" },
  { tone: "info" as const, label: "情報 Info" },
  { tone: "muted" as const, label: "控えめ Muted" },
  { tone: "neutral" as const, label: "中立 Neutral" },
];

const statuses = ["active", "draft", "pending", "cancelled", "failed", "scheduled"];

export default function Demo() {
  return (
    <PageContainer
      title="Badge"
      subtitle="Structural variants, semantic tones, and auto-mapped lifecycle status — labels never wrap"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Structural variants</CardTitle>
            <CardDescription>
              variant is structural emphasis only — default (filled), secondary (muted fill),
              outline (bordered), dashed (dashed border). It carries no semantic meaning; use tone
              for that.
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
            <CardTitle>Shape</CardTitle>
            <CardDescription>
              shape sets corner radius from the tokens — default (badge radius) / pill (fully
              rounded) / sharp (square). Independent of variant and tone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" wrap align="center" gap="sm">
              {shapes.map((s) => (
                <Badge key={s.shape} shape={s.shape} tone="info">
                  {s.label}
                </Badge>
              ))}
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Semantic tones</CardTitle>
            <CardDescription>
              tone conveys intent — pick by meaning, never aesthetics. success = approved/paid ·
              warning = pending · destructive = rejected · info · muted · neutral = category.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" wrap align="center" gap="sm">
              {tones.map((t) => (
                <Badge key={t.tone} tone={t.tone}>
                  {t.label}
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
              Unknown keys fall back to neutral + a generic icon + the raw key text.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" wrap align="center" gap="sm">
              {statuses.map((s) => (
                <Badge key={s} status={s} />
              ))}
              <Badge status="unknown-key" />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Icon overrides</CardTitle>
            <CardDescription>
              icon replaces the status-mapped icon; icon=&#123;null&#125; suppresses it entirely
              while keeping the resolved tone and label.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" wrap align="center" gap="sm">
              <Badge status="active" icon={Star} />
              <Badge status="active" icon={null} />
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
