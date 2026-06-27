import { type RefObject, useLayoutEffect, useRef, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Spacing · design-token foundation. Two raw scales (a 4px grid + a golden-ratio
 * φ scale) feed the semantic layout tokens that Flex / PageContainer consume.
 * Each bar's width is the real token var() and every px label is resolved from
 * that same var() at runtime, so nothing can drift from the source. Composed
 * only from real @godxjp/ui components.
 */
const rawScale = [
  "--space-0",
  "--space-1",
  "--space-2",
  "--space-3",
  "--space-4",
  "--space-5",
  "--space-6",
  "--space-8",
  "--space-10",
  "--space-12",
];

const phiScale = [
  { token: "--phi-n2", role: "φ⁻² · phi-unit ÷ φ²" },
  { token: "--phi-n1", role: "φ⁻¹ · phi-unit ÷ φ" },
  { token: "--phi-0", role: "φ⁰ · phi-unit (= --space-4)" },
  { token: "--phi-p1", role: "φ¹ · phi-unit × φ" },
  { token: "--phi-p2", role: "φ² · phi-unit × φ²" },
];

const layoutScale = [
  { token: "--space-page-x", role: "page gutter X (PageContainer)" },
  { token: "--space-page-y", role: "page gutter Y (PageContainer)" },
  { token: "--space-section", role: "section gap (= --phi-0)" },
  { token: "--space-stack-xs", role: "Flex gap='xs'" },
  { token: "--space-stack-sm", role: "Flex gap='sm'" },
  { token: "--space-stack-md", role: "Flex gap='md' (default · = --phi-0)" },
  { token: "--space-stack-lg", role: "Flex gap='lg' (= --phi-p1)" },
  { token: "--space-stack-xl", role: "Flex gap='xl' (= --phi-p2)" },
  { token: "--space-inline-xs", role: "inline gap='xs'" },
  { token: "--space-inline-sm", role: "inline gap='sm'" },
  { token: "--space-inline-md", role: "inline gap='md' (= --phi-n1)" },
  { token: "--space-inline-lg", role: "inline gap='lg' (= --phi-0)" },
];

const allTokens = [
  ...rawScale,
  ...phiScale.map((s) => s.token),
  ...layoutScale.map((s) => s.token),
];

/** Resolve each token's computed pixel value from a live probe element, so the
 *  px labels are read from the same var() as the bars and can never drift. */
type PxMap = Record<string, string> & { __probeRef: RefObject<HTMLDivElement | null> };

function usePx(tokens: string[]): PxMap {
  const probeRef = useRef<HTMLDivElement>(null);
  const [px, setPx] = useState<Record<string, string>>({});

  useLayoutEffect(() => {
    const host = probeRef.current;
    if (!host) return;
    const next: Record<string, string> = {};
    for (const token of tokens) {
      const probe = document.createElement("div");
      probe.style.width = `var(${token})`;
      host.appendChild(probe);
      const width = probe.getBoundingClientRect().width;
      host.removeChild(probe);
      next[token] = `${Math.round(width * 10) / 10}px`;
    }
    setPx(next);
  }, [tokens]);

  return { ...px, __probeRef: probeRef } as PxMap;
}

function TokenBar({
  token,
  px,
  role,
  className,
}: {
  token: string;
  px?: string;
  role?: string;
  className: string;
}) {
  return (
    <Flex direction="row" align="center" gap="md">
      <Text size="xs" tone="muted" mono className="w-44 shrink-0">
        {token}
      </Text>
      <div className={className} style={{ width: `var(${token})` }} />
      <Text size="xs" tone="muted" mono className="w-14 shrink-0 text-end">
        {px ?? "·"}
      </Text>
      {role ? (
        <Text size="xs" tone="muted">
          {role}
        </Text>
      ) : null}
    </Flex>
  );
}

export default function Demo() {
  const px = usePx(allTokens);

  return (
    <PageContainer
      title="Spacing"
      subtitle="4px raw grid + golden-ratio (φ) scale → semantic layout gaps · never raw gap-* / margins"
    >
      {/* Off-screen probe host: bars are measured here, then removed. */}
      <div
        ref={px.__probeRef}
        aria-hidden
        className="pointer-events-none absolute -z-10 opacity-0"
      />

      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Raw scale · 4px grid</CardTitle>
            <CardDescription>
              The base step is 4px; every value is a 4-multiple. Bar width is the live token var(),
              the px label is resolved from it at runtime.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm">
              {rawScale.map((token) => (
                <TokenBar
                  key={token}
                  token={token}
                  px={px[token]}
                  className="bg-primary h-3 shrink-0 rounded-sm"
                />
              ))}
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Golden-ratio scale · φ ≈ 1.618</CardTitle>
            <CardDescription>
              Off-grid by design: each step is the previous multiplied or divided by φ around{" "}
              <Text mono>--phi-unit</Text> (= --space-4). These back the larger stack / inline gaps,
              so they read as off the 4px grid (e.g. stack-lg ≈ 25.9px).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm">
              {phiScale.map((s) => (
                <TokenBar
                  key={s.token}
                  token={s.token}
                  px={px[s.token]}
                  role={s.role}
                  className="bg-attention h-3 shrink-0 rounded-sm"
                />
              ))}
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Semantic layout tokens</CardTitle>
            <CardDescription>
              What Flex gap and PageContainer padding resolve to: set the rhythm once, never
              hand-tune margins per element. Tokens marked (= --phi-*) inherit the golden-ratio
              scale above, so their px value is off the 4px grid.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm">
              {layoutScale.map((s) => (
                <TokenBar
                  key={s.token}
                  token={s.token}
                  px={px[s.token]}
                  role={s.role}
                  className="bg-info h-3 shrink-0 rounded-sm"
                />
              ))}
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Density retunes the φ scale</CardTitle>
            <CardDescription>
              PageContainer density remaps <Text mono>--phi-unit</Text> (compact → --space-3,
              comfortable → --space-6). Because every φ-derived token (stack-md/lg/xl, inline-md/lg,
              section) is built from --phi-unit, the whole semantic rhythm scales with one knob ·
              the px values above shift accordingly.
            </CardDescription>
          </CardHeader>
        </Card>
      </Flex>
    </PageContainer>
  );
}
