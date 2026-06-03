import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Spacing — design-token foundation. A 4px grid raw scale plus the semantic
 * layout tokens that Flex / PageContainer consume. Each bar's width is the real
 * token var; composed only from real @godxjp/ui components.
 */
const rawScale = [
  { token: "--space-1", px: "4px" },
  { token: "--space-2", px: "8px" },
  { token: "--space-3", px: "12px" },
  { token: "--space-4", px: "16px" },
  { token: "--space-5", px: "20px" },
  { token: "--space-6", px: "24px" },
  { token: "--space-8", px: "32px" },
  { token: "--space-10", px: "40px" },
  { token: "--space-12", px: "48px" },
];

const layoutScale = [
  { token: "--space-page-x", role: "page gutter (PageContainer)" },
  { token: "--space-stack-sm", role: "Flex gap='sm'" },
  { token: "--space-stack-md", role: "Flex gap='md' (default)" },
  { token: "--space-stack-lg", role: "Flex gap='lg'" },
  { token: "--space-stack-xl", role: "Flex gap='xl'" },
  { token: "--space-inline-sm", role: "inline gap='sm'" },
];

export default function Demo() {
  return (
    <PageContainer
      title="Spacing"
      subtitle="4px grid raw scale + semantic layout gaps — never raw gap-* / margins"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Raw scale (4px grid)</CardTitle>
            <CardDescription>
              All gap / padding / margin uses a --space-* token or a 4-multiple. Bar width is the
              token value.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm">
              {rawScale.map((s) => (
                <Flex key={s.token} direction="row" align="center" gap="md">
                  <span className="text-muted-foreground w-28 shrink-0 font-mono text-xs">
                    {s.token}
                  </span>
                  <div
                    className="bg-primary h-3 shrink-0 rounded-sm"
                    style={{ width: `var(${s.token})` }}
                  />
                  <span className="text-muted-foreground font-mono text-xs">{s.px}</span>
                </Flex>
              ))}
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Semantic layout tokens</CardTitle>
            <CardDescription>
              What Flex gap and PageContainer padding resolve to — set the rhythm once, never
              hand-tune margins per element.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm">
              {layoutScale.map((s) => (
                <Flex key={s.token} direction="row" align="center" gap="md">
                  <span className="text-muted-foreground w-40 shrink-0 font-mono text-xs">
                    {s.token}
                  </span>
                  <div
                    className="bg-info h-3 shrink-0 rounded-sm"
                    style={{ width: `var(${s.token})` }}
                  />
                  <span className="text-muted-foreground text-xs">{s.role}</span>
                </Flex>
              ))}
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
