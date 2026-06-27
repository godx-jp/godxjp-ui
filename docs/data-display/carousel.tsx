import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  StatCard,
} from "@godxjp/ui/data-display";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Carousel — Embla-backed stepping list with prev/next controls.
 * Compose Carousel > CarouselContent > CarouselItem + CarouselPrevious/Next.
 * Structurally configured via `opts` (loop, align, axis) and `plugins`; `setApi`
 * exposes the Embla api for external controls (e.g. dot indicators via scrollTo).
 * Composed only from real @godxjp/ui components.
 */
const months = [
  { label: "1月 売上", value: "¥7.4M", delta: "+4%" },
  { label: "2月 売上", value: "¥7.9M", delta: "+7%" },
  { label: "3月 売上", value: "¥8.0M", delta: "+1%" },
  { label: "4月 売上", value: "¥8.2M", delta: "+12%" },
  { label: "5月 売上", value: "¥8.6M", delta: "+5%" },
];

const slides = [
  { label: "第1四半期", value: "¥23.3M" },
  { label: "第2四半期", value: "¥25.4M" },
  { label: "第3四半期", value: "¥26.1M" },
];

/** Dot navigation — `CarouselDots` reads the Embla api from context; no manual `setApi` wiring. */
function DotNavExample() {
  return (
    <Carousel className="px-10" opts={{ loop: true }}>
      <CarouselContent>
        {slides.map((s) => (
          <CarouselItem key={s.label}>
            <StatCard label={s.label} value={s.value} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <CarouselDots />
    </Carousel>
  );
}

export default function Demo() {
  return (
    <PageContainer title="Carousel" subtitle="Embla-backed stepping list with prev/next controls">
      <Flex direction="col" gap="lg">
        {/* Default horizontal, multi-up responsive track. px-10 clears the absolute arrow buttons. */}
        <Card>
          <CardHeader>
            <CardTitle>月次 KPI</CardTitle>
            <CardDescription>
              Default horizontal track. Step with prev/next; arrows auto-disable at the first and
              last slide.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Carousel className="px-10">
              <CarouselContent>
                {months.map((m) => (
                  <CarouselItem key={m.label} className="basis-full sm:basis-1/2 lg:basis-1/3">
                    <StatCard label={m.label} value={m.value} delta={m.delta} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </CardContent>
        </Card>

        {/* opts: looping single-up gallery — wraps past the ends, so both arrows stay enabled. */}
        <Card>
          <CardHeader>
            <CardTitle>ループ ギャラリー</CardTitle>
            <CardDescription>
              opts=&#123;&#123; loop: true, align: &quot;start&quot; &#125;&#125; — wraps past the
              ends, so prev/next never disable.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Carousel className="px-10" opts={{ loop: true, align: "start" }}>
              <CarouselContent>
                {months.map((m) => (
                  <CarouselItem key={m.label}>
                    <StatCard label={m.label} value={m.value} delta={m.delta} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </CardContent>
        </Card>

        {/* setApi + scrollTo: external dot navigation, active dot seeded visible at rest. */}
        <Card>
          <CardHeader>
            <CardTitle>ドット ナビゲーション</CardTitle>
            <CardDescription>
              Drop in CarouselDots and it reads the Embla api from context, rendering one dot per
              slide. The active dot widens and carries aria-current.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DotNavExample />
          </CardContent>
        </Card>

        {/* opts.axis: vertical orientation — emits data-orientation="vertical". */}
        <Card>
          <CardHeader>
            <CardTitle>縦方向 (vertical)</CardTitle>
            <CardDescription>
              opts=&#123;&#123; axis: &quot;y&quot; &#125;&#125; — stacks slides and moves the
              prev/next controls to top and bottom.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Carousel className="py-10" opts={{ axis: "y" }}>
              <CarouselContent className="h-48">
                {slides.map((s) => (
                  <CarouselItem key={s.label}>
                    <StatCard label={s.label} value={s.value} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
