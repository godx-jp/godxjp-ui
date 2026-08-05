import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  StatusBadge,
} from "@godxjp/ui/data-display";
import { Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { Star } from "lucide-react";

/**
 * Badge — status / category chip. Composed only from real @godxjp/ui components.
 * variant is STRUCTURAL (default / secondary / outline); tone is SEMANTIC (ToneProp).
 * the reference design: semantic mapping is FIXED (success 若竹 / warning 山吹 / info 群青 /
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
  { tone: "primary" as const, label: "ブランド Brand" },
  { tone: "success" as const, label: "承認済 Approved" },
  { tone: "warning" as const, label: "保留 Pending" },
  { tone: "destructive" as const, label: "却下 Rejected" },
  { tone: "info" as const, label: "情報 Info" },
  { tone: "muted" as const, label: "控えめ Muted" },
  { tone: "neutral" as const, label: "中立 Neutral" },
];

const statuses = ["active", "draft", "pending", "cancelled", "failed", "scheduled"];

/**
 * Subscription/billing lifecycle keys (gh#216). They ship the SAME canonical status→tone→icon
 * map as every other key, so a billing screen never keeps a page-local colour table. They are
 * demoed explicitly because their i18n labels were once missing. A missing key renders the raw
 * `status.trialing` string, and only a rendered demo makes that regression visible.
 */
const billingStatuses = ["trialing", "past_due", "incomplete", "canceled"];

/**
 * StatusBadge is the status-first name for the same chip, so it carries the SAME structural
 * axes. `incomplete` is the one canonical key that resolves to the tone-neutral default, which
 * is why the four variants stay legible next to each other: a tone would repaint the fill.
 */
const statusBadgeVariants = [
  { variant: "default" as const, note: "既定 Default" },
  { variant: "secondary" as const, note: "控えめ Secondary" },
  { variant: "outline" as const, note: "枠線 Outline" },
  { variant: "dashed" as const, note: "点線 Dashed" },
];

/** A project status outside the canonical map declares its own tone; the label stays authored. */
const statusBadgeTones = [
  { tone: "default" as const, label: "受付 Received" },
  { tone: "primary" as const, label: "優先対応 Priority" },
  { tone: "success" as const, label: "検収済 Accepted" },
  { tone: "warning" as const, label: "修正待ち Awaiting fix" },
  { tone: "destructive" as const, label: "検収差戻し Rejected" },
  { tone: "info" as const, label: "監査中 Under audit" },
  { tone: "muted" as const, label: "対象外 Out of scope" },
  { tone: "neutral" as const, label: "下書き Draft" },
];

export default function Demo() {
  return (
    <PageContainer
      title="Badge"
      subtitle="Structural variants, semantic tones, and auto-mapped lifecycle status · labels never wrap"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>Structural variants</CardTitle>
            <CardDescription>
              variant is structural emphasis only: default (filled), secondary (muted fill), outline
              (bordered), dashed (dashed border). It carries no semantic meaning; use tone for that.
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
            <CardTitle level={2}>Shape</CardTitle>
            <CardDescription>
              shape sets corner radius from the tokens: default (badge radius) / pill (fully
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
            <CardTitle level={2}>Semantic tones</CardTitle>
            <CardDescription>
              tone conveys intent, pick by meaning, never aesthetics. success = approved/paid ·
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
            <CardTitle level={2}>Lifecycle status</CardTitle>
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
              <StatusBadge status="active" />
              <Badge status="unknown-key" />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Billing lifecycle</CardTitle>
            <CardDescription>
              Subscription keys map through the SAME canonical table · trialing = info · past_due =
              warning · incomplete = default · canceled = destructive. Every label is translated, so
              a billing screen never shows a raw status.* key and never keeps its own colour map.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" wrap align="center" gap="sm">
              {billingStatuses.map((s) => (
                <StatusBadge key={s} status={s} />
              ))}
              {billingStatuses.map((s) => (
                <StatusBadge key={`${s}-outline`} status={s} variant="outline" />
              ))}
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>StatusBadge · 構造 / 形状 / トーン</CardTitle>
            <CardDescription>
              StatusBadge はステータス主導の別名で、Badge と同じ variant / shape / tone
              を受け取ります。canonical マップに無い自社ステータスは tone
              を明示し、色表をアプリ側に持たせません。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Flex direction="col" gap="xs">
                <Text size="xs" tone="muted">
                  variant · status=&quot;incomplete&quot;（トーン中立のキー）
                </Text>
                <Flex direction="row" wrap align="center" gap="sm">
                  {statusBadgeVariants.map((v) => (
                    <StatusBadge key={v.variant} status="incomplete" variant={v.variant} />
                  ))}
                </Flex>
              </Flex>
              <Flex direction="col" gap="xs">
                <Text size="xs" tone="muted">
                  shape · 既定 / pill / sharp
                </Text>
                <Flex direction="row" wrap align="center" gap="sm">
                  {shapes.map((s) => (
                    <StatusBadge key={s.shape} status="scheduled" shape={s.shape} />
                  ))}
                </Flex>
              </Flex>
              <Flex direction="col" gap="xs">
                <Text size="xs" tone="muted">
                  tone · 自社ステータスに意味の色を与える
                </Text>
                <Flex direction="row" wrap align="center" gap="sm">
                  {statusBadgeTones.map((t) => (
                    <StatusBadge key={t.tone} tone={t.tone}>
                      {t.label}
                    </StatusBadge>
                  ))}
                </Flex>
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Icon overrides</CardTitle>
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
