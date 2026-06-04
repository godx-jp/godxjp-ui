import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  StatCard,
} from "@godxjp/ui/data-display";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Carousel — Embla-backed horizontal stepping list with prev/next controls.
 * Compose Carousel > CarouselContent > CarouselItem + CarouselPrevious/Next.
 * Composed only from real @godxjp/ui components.
 */
const months = [
  { label: "1月 売上", value: "¥7.4M", delta: "+4%" },
  { label: "2月 売上", value: "¥7.9M", delta: "+7%" },
  { label: "3月 売上", value: "¥8.0M", delta: "+1%" },
  { label: "4月 売上", value: "¥8.2M", delta: "+12%" },
  { label: "5月 売上", value: "¥8.6M", delta: "+5%" },
];

export default function Demo() {
  return (
    <PageContainer title="Carousel" subtitle="Horizontal stepping list with prev/next controls">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>月次 KPI</CardTitle>
            <CardDescription>
              Use prev/next to step through cards on narrow surfaces.
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
      </Flex>
    </PageContainer>
  );
}
