import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";

/**
 * Colors — design-token foundation. Every swatch is a real semantic Tailwind
 * utility wired to the dxs-kintai token (@theme in src/styles/index.css); no raw
 * hex, no raw palette. Composed only from real @godxjp/ui components.
 */
const surfaces = [
  { cls: "bg-background text-foreground", token: "--background", role: "page" },
  { cls: "bg-card text-card-foreground", token: "--card", role: "raised surface" },
  { cls: "bg-secondary text-secondary-foreground", token: "--secondary", role: "muted fill" },
  { cls: "bg-muted text-muted-foreground", token: "--muted", role: "muted" },
  { cls: "bg-accent text-accent-foreground", token: "--accent", role: "hover" },
];

const status = [
  { cls: "bg-primary text-primary-foreground", token: "--primary", role: "brand · #0077c7" },
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
  { cls: "bg-wa-sumi", token: "--wa-sumi", role: "墨 ink" },
  { cls: "bg-wa-nezu", token: "--wa-nezu", role: "鼠 mouse grey" },
];

export default function Demo() {
  return (
    <PageContainer
      title="Colors"
      subtitle="Semantic roles + 和色 (wa-iro) — OKLCH, 渋み (chroma ≤ 0.18)"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Semantic surfaces</CardTitle>
            <CardDescription>
              Page / raised / muted neutrals. Use these — never invent a new grey. Each box shows
              its own foreground text token.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid columns={{ sm: 2, md: 3, lg: 4 }}>
              {surfaces.map((s) => (
                <Flex key={s.token} direction="col" gap="xs">
                  <div
                    className={`border-border flex h-14 items-end rounded-md border p-2 ${s.cls}`}
                  >
                    <span className="font-mono text-[11px] leading-none">Aa 亜</span>
                  </div>
                  <div>
                    <div className="font-mono text-xs">{s.token}</div>
                    <div className="text-muted-foreground text-xs">{s.role}</div>
                  </div>
                </Flex>
              ))}
            </ResponsiveGrid>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Brand & status</CardTitle>
            <CardDescription>
              Fixed semantic mapping — never substitute. primary = the single most important action;
              status is success / warning / info / attention / danger.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid columns={{ sm: 2, md: 3, lg: 4 }}>
              {status.map((s) => (
                <Flex key={s.token} direction="col" gap="xs">
                  <div
                    className={`border-border flex h-14 items-end rounded-md border p-2 ${s.cls}`}
                  >
                    <span className="font-mono text-[11px] leading-none">Aa 亜</span>
                  </div>
                  <div>
                    <div className="font-mono text-xs">{s.token}</div>
                    <div className="text-muted-foreground text-xs">{s.role}</div>
                  </div>
                </Flex>
              ))}
            </ResponsiveGrid>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>和色 wa-iro — decorative only</CardTitle>
            <CardDescription>
              Traditional Japanese accents for charts / tags / tenant theming. NEVER map a wa-iro
              hue to a semantic role beyond the five canonical ones above.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid columns={{ sm: 2, md: 3, lg: 4 }}>
              {waIro.map((s) => (
                <Flex key={s.token} direction="col" gap="xs">
                  <div className={`border-border h-14 rounded-md border ${s.cls}`} />
                  <div>
                    <div className="font-mono text-xs">{s.token}</div>
                    <div className="text-muted-foreground text-xs">{s.role}</div>
                  </div>
                </Flex>
              ))}
            </ResponsiveGrid>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
