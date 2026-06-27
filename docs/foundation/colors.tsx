import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Text } from "@godxjp/ui/general";
import { Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";

/**
 * Colors · design-token foundation. Every swatch is a real semantic Tailwind
 * utility wired to the dxs-kintai token (@theme in src/styles/index.css); no raw
 * hex, no raw palette. Composed only from real @godxjp/ui components.
 */
const surfaces = [
  { cls: "bg-background text-foreground", token: "--background", role: "page" },
  { cls: "bg-card text-card-foreground", token: "--card", role: "raised surface" },
  { cls: "bg-popover text-popover-foreground", token: "--popover", role: "overlay surface" },
  { cls: "bg-secondary text-secondary-foreground", token: "--secondary", role: "muted fill" },
  { cls: "bg-muted text-muted-foreground", token: "--muted", role: "muted" },
  { cls: "bg-accent text-accent-foreground", token: "--accent", role: "hover" },
];

// Structural neutrals · hairlines, field borders, focus ring. Shown as fills so
// the named token is visible (in practice they paint borders/outlines, not areas).
const structural = [
  { cls: "bg-border", token: "--border", role: "hairline / divider" },
  { cls: "bg-input", token: "--input", role: "field border" },
  { cls: "bg-ring", token: "--ring", role: "focus ring" },
];

const status = [
  { cls: "bg-primary text-primary-foreground", token: "--primary", role: "brand action" },
  { cls: "bg-success text-success-foreground", token: "--success", role: "若竹 success" },
  { cls: "bg-warning text-warning-foreground", token: "--warning", role: "山吹 warning" },
  { cls: "bg-info text-info-foreground", token: "--info", role: "群青 info" },
  { cls: "bg-attention text-attention-foreground", token: "--attention", role: "朱 attention" },
  { cls: "bg-destructive text-destructive-foreground", token: "--destructive", role: "茜 danger" },
];

const waIro = [
  { cls: "bg-wa-ai", token: "--wa-ai", role: "藍 indigo" },
  { cls: "bg-wa-gunjo", token: "--wa-gunjo", role: "群青 ultramarine" },
  { cls: "bg-wa-ruri", token: "--wa-ruri", role: "瑠璃 lapis" },
  { cls: "bg-wa-kon", token: "--wa-kon", role: "紺 navy" },
  { cls: "bg-wa-wakatake", token: "--wa-wakatake", role: "若竹 young bamboo" },
  { cls: "bg-wa-moegi", token: "--wa-moegi", role: "萌葱 spring green" },
  { cls: "bg-wa-yamabuki", token: "--wa-yamabuki", role: "山吹 mountain yellow" },
  { cls: "bg-wa-shu", token: "--wa-shu", role: "朱 vermilion" },
  { cls: "bg-wa-akane", token: "--wa-akane", role: "茜 madder" },
  { cls: "bg-wa-enji", token: "--wa-enji", role: "臙脂 cochineal" },
  { cls: "bg-wa-sakura", token: "--wa-sakura", role: "桜 cherry (soft bg)" },
  { cls: "bg-wa-sumi", token: "--wa-sumi", role: "墨 ink" },
  { cls: "bg-wa-nezu", token: "--wa-nezu", role: "鼠 mouse grey" },
];

// Chart accents · neutral decorative primitives for series colour, NOT business
// semantics. Wired to --color-chart-1…6 (bg-chart-N utilities).
const charts = [
  { cls: "bg-chart-1", token: "--chart-1", role: "series 1" },
  { cls: "bg-chart-2", token: "--chart-2", role: "series 2" },
  { cls: "bg-chart-3", token: "--chart-3", role: "series 3" },
  { cls: "bg-chart-4", token: "--chart-4", role: "series 4" },
  { cls: "bg-chart-5", token: "--chart-5", role: "series 5" },
  { cls: "bg-chart-6", token: "--chart-6", role: "series 6" },
];

type Swatch = { cls: string; token: string; role: string };

/** One swatch tile: a token-coloured box (with foreground text when paired) + its token name + role. */
function SwatchTile({ swatch, text }: { swatch: Swatch; text?: boolean }) {
  return (
    <Flex direction="col" gap="xs">
      <div className={`border-border flex h-14 items-end rounded-md border p-2 ${swatch.cls}`}>
        {text ? (
          <Text size="xs" mono className="leading-none">
            Aa 亜
          </Text>
        ) : null}
      </div>
      <div>
        <Text as="div" size="xs" mono>
          {swatch.token}
        </Text>
        <Text as="div" size="xs" tone="muted">
          {swatch.role}
        </Text>
      </div>
    </Flex>
  );
}

/**
 * A token group rendered TWICE · light theme then a `.dark`-scoped copy · so a
 * single static screenshot proves both renditions defined in foundation.css.
 * Themed groups (`dark`) re-paint under the `.dark` wrapper; decorative groups
 * (wa-iro, chart) are theme-invariant and render once.
 */
function SwatchGroup({ items, text, dark }: { items: Swatch[]; text?: boolean; dark?: boolean }) {
  const grid = (
    <ResponsiveGrid columns={{ sm: 2, md: 3, lg: 4 }}>
      {items.map((s) => (
        <SwatchTile key={s.token} swatch={s} text={text} />
      ))}
    </ResponsiveGrid>
  );
  if (!dark) return grid;
  return (
    <Flex direction="col" gap="md">
      <div>
        <Text as="div" size="xs" tone="muted" weight="medium" className="mb-2">
          Light
        </Text>
        {grid}
      </div>
      <div className="bg-background text-foreground dark rounded-md p-3">
        <Text as="div" size="xs" tone="muted" weight="medium" className="mb-2">
          Dark (.dark)
        </Text>
        <ResponsiveGrid columns={{ sm: 2, md: 3, lg: 4 }}>
          {items.map((s) => (
            <SwatchTile key={s.token} swatch={s} text={text} />
          ))}
        </ResponsiveGrid>
      </div>
    </Flex>
  );
}

export default function Demo() {
  return (
    <PageContainer
      title="Colors"
      subtitle="Semantic roles + 和色 (wa-iro) · OKLCH, 渋み (chroma ≤ 0.18)"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Semantic surfaces</CardTitle>
            <CardDescription>
              Page / raised / overlay / muted neutrals. Use these; never invent a new grey. Each
              box shows its own foreground text token. Every role is redefined under .dark.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SwatchGroup items={surfaces} text dark />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Structural neutrals</CardTitle>
            <CardDescription>
              Hairlines, field borders, focus ring. In practice these paint borders and outlines,
              not areas. They are shown as fills here so the named token is visible. Also themed under
              .dark.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SwatchGroup items={structural} dark />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Brand & status</CardTitle>
            <CardDescription>
              Fixed semantic mapping: never substitute. primary = the single most important action;
              status is success / warning / info / attention / danger. Lifted for contrast under
              .dark.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SwatchGroup items={status} text dark />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>和色 wa-iro · decorative only</CardTitle>
            <CardDescription>
              Traditional Japanese accents for charts / tags / tenant theming. NEVER map a wa-iro
              hue to a semantic role beyond the five canonical ones above. Fixed hex ·
              theme-invariant.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SwatchGroup items={waIro} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chart accents</CardTitle>
            <CardDescription>
              Series colours for data visualisation: neutral decorative primitives, NOT business
              semantics. Use bg-chart-1…6 in order; theme-invariant like wa-iro.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SwatchGroup items={charts} />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
