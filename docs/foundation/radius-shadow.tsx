import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";

/**
 * Radius & Shadow — design-token foundation. base radius 6px; shadows stay flat
 * (cards have NO shadow at rest — elevation only climbs at popover / dialog).
 * Boxes render the real token var; composed only from real @godxjp/ui components.
 */
const radii = [
  { token: "--radius-sm", px: "2px" },
  { token: "--radius-md", px: "4px" },
  { token: "--radius", px: "6px (base)" },
  { token: "--radius-xl", px: "10px" },
  { token: "--radius-full", px: "pill" },
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
      subtitle="6px base radius · flat by default — elevation climbs only at popover / dialog"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Corner radius</CardTitle>
            <CardDescription>Base 6px; sub-radii for nested chips, full for pills.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid columns={{ sm: 2, md: 3, lg: 5 }}>
              {radii.map((r) => (
                <Flex key={r.token} direction="col" gap="xs">
                  <div
                    className="bg-secondary border-border h-16 border"
                    style={{ borderRadius: `var(${r.token})` }}
                  />
                  <div>
                    <div className="font-mono text-xs">{r.token}</div>
                    <div className="text-muted-foreground text-xs">{r.px}</div>
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
              surfaces — popover and dialog.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid columns={{ sm: 1, md: 3 }}>
              {shadows.map((s) => (
                <Flex key={s.token} direction="col" gap="xs">
                  <div
                    className="bg-card h-16 rounded-md"
                    style={{ boxShadow: `var(${s.token})` }}
                  />
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
