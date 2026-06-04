import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Density — design-token foundation. One knob (`<PageContainer density>`)
 * retunes control heights, table rows, and the φ spacing unit. Bars render the
 * real --control-height token; composed only from real @godxjp/ui components.
 */
const sizes = [
  { token: "--control-height-xs", px: "24px" },
  { token: "--control-height-sm", px: "28px" },
  { token: "--control-height", px: "32px (default)" },
  { token: "--control-height-lg", px: "36px" },
];

const modes = [
  { token: "--control-height-compact", label: "compact", px: "28px", role: "kintone-style tables" },
  { token: "--control-height-default", label: "default", px: "32px", role: "app surfaces" },
  {
    token: "--control-height-comfortable",
    label: "comfortable",
    px: "44px",
    role: "login / mobile · WCAG touch floor",
  },
];

export default function Demo() {
  return (
    <PageContainer
      title="Density"
      subtitle="One knob — <PageContainer density> — retunes control heights, tables, φ unit"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Control sizes (default density)</CardTitle>
            <CardDescription>
              Shared height scale every form control (Button / Input / Select …) snaps to. 44px is
              the WCAG / Digital Agency touch floor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" align="end" gap="md" wrap>
              {sizes.map((s) => (
                <Flex key={s.token} direction="col" gap="xs" align="center">
                  <div
                    className="bg-secondary border-border w-20 rounded-md border"
                    style={{ height: `var(${s.token})` }}
                  />
                  <span className="text-muted-foreground font-mono text-xs">{s.px}</span>
                </Flex>
              ))}
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Density modes</CardTitle>
            <CardDescription>
              Set once per page via the density prop — never the .ui-density-* classes. compact for
              heavy tables, comfortable for public / mobile surfaces.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" align="end" gap="lg" wrap>
              {modes.map((m) => (
                <Flex key={m.token} direction="col" gap="xs" align="center">
                  <div
                    className="bg-primary w-24 rounded-md"
                    style={{ height: `var(${m.token})` }}
                  />
                  <div className="text-center">
                    <div className="font-mono text-xs">
                      {m.label} · {m.px}
                    </div>
                    <div className="text-muted-foreground text-xs">{m.role}</div>
                  </div>
                </Flex>
              ))}
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
