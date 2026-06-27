import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
import { Text } from "@godxjp/ui/general";
import { Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";

/**
 * Radius & Shadow · design-token foundation. base radius 6px; shadows stay flat
 * (cards have NO shadow at rest · elevation only climbs at popover / dialog).
 * Boxes render the real token var; composed only from real @godxjp/ui components.
 */
// DS authors the base --radius (6px) and derives sm/md/lg in @theme. --radius-xl
// and --radius-full are NOT overridden · they fall through to Tailwind defaults.
// `value` is the CSS the swatch renders. ds tokens resolve their var; xl/full are NOT authored as
// vars (they fall through to Tailwind `rounded-xl` / `rounded-full`), so we render their literal
// value — otherwise `var(--radius-full)` is undefined and the swatch collapses to a square.
const radii = [
  { token: "--radius-sm", px: "2px", value: "var(--radius-sm)", source: "ds" as const },
  { token: "--radius-md", px: "4px", value: "var(--radius-md)", source: "ds" as const },
  { token: "--radius", px: "6px (base)", value: "var(--radius)", source: "ds" as const },
  { token: "--radius-lg", px: "6px", value: "var(--radius-lg)", source: "ds" as const },
  { token: "--radius-xl", px: "12px", value: "0.75rem", source: "tw" as const },
  { token: "--radius-full", px: "pill", value: "9999px", source: "tw" as const },
];

const shadows = [
  { token: "--shadow-sm", role: "subtle lift" },
  { token: "--shadow-lg", role: "popover / elevated" },
  { token: "--shadow-xl", role: "dialog" },
];

export default function Demo() {
  return (
    <PageContainer
      title="Radius & Shadow"
      subtitle="6px base radius · flat by default · elevation climbs only at popover / dialog"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Corner radius</CardTitle>
            <CardDescription>
              The system authors the base 6px radius and derives sm/md/lg from it. xl and full are
              not overridden; they fall through to Tailwind defaults.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid columns={{ sm: 2, md: 3, lg: 6 }}>
              {radii.map((r) => (
                <Flex key={r.token} direction="col" gap="xs">
                  <div
                    className="bg-secondary border-border h-16 border"
                    style={{ borderRadius: r.value }}
                  />
                  <div>
                    <Flex align="center" gap="xs">
                      <Text size="xs" mono>
                        {r.token}
                      </Text>
                      {r.source === "tw" ? (
                        <Badge variant="outline" className="text-xs">
                          Tailwind default
                        </Badge>
                      ) : null}
                    </Flex>
                    <Text as="div" size="xs" tone="muted">
                      {r.px}
                    </Text>
                  </div>
                </Flex>
              ))}
            </ResponsiveGrid>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Elevation</CardTitle>
            <CardDescription>
              Cards carry a 1px border and NO shadow at rest. Shadow appears only on floating
              surfaces: popover and dialog.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="lg">
              <ResponsiveGrid columns={{ sm: 1, md: 3 }}>
                {shadows.map((s) => (
                  <Flex key={s.token} direction="col" gap="xs">
                    <div
                      className="bg-card h-16 rounded-md"
                      style={{ boxShadow: `var(${s.token})` }}
                    />
                    <div>
                      <Text as="div" size="xs" mono>
                        {s.token}
                      </Text>
                      <Text as="div" size="xs" tone="muted">
                        {s.role}
                      </Text>
                    </div>
                  </Flex>
                ))}
              </ResponsiveGrid>

              {/* Rest vs elevated, shown live: a resting Card (border, no shadow) next to a
                  floating surface lifted by --shadow-lg, so the elevation rule is demonstrated,
                  not just asserted. */}
              <ResponsiveGrid columns={{ sm: 1, md: 2 }}>
                <Flex direction="col" gap="xs">
                  <Card>
                    <CardContent>
                      <Text as="div" weight="medium">
                        At rest（カード）
                      </Text>
                      <Text as="div" size="xs" tone="muted">
                        border-border, no shadow
                      </Text>
                    </CardContent>
                  </Card>
                  <Text as="div" size="xs" tone="muted">
                    resting surface · flat
                  </Text>
                </Flex>
                <Flex direction="col" gap="xs">
                  <div
                    className="bg-popover text-popover-foreground border-border rounded-md border p-4"
                    style={{ boxShadow: "var(--shadow-lg)" }}
                  >
                    <Text as="div" weight="medium">
                      Floating（ポップオーバー）
                    </Text>
                    <Text as="div" size="xs" tone="muted">
                      --shadow-lg lifts it off the page
                    </Text>
                  </div>
                  <Text as="div" size="xs" tone="muted">
                    floating surface · elevated
                  </Text>
                </Flex>
              </ResponsiveGrid>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
