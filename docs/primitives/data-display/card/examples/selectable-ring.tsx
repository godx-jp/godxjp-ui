import { Card, CardContent } from "@godxjp/ui/data-display";
import { Inline } from "@godxjp/ui/layout";

export default function Demo() {
  return (
    <Inline gap="md" className="flex-wrap">
      <Card size="compact" className="ring-primary max-w-[11rem] ring-2">
        <CardContent solo className="text-center text-sm font-medium">
          Osaka ✓
        </CardContent>
      </Card>
      <Card size="compact" className="max-w-[11rem] opacity-70">
        <CardContent solo className="text-center text-sm">
          Tokyo
        </CardContent>
      </Card>
      <Card size="compact" className="max-w-[11rem] opacity-70">
        <CardContent solo className="text-center text-sm">
          Yokohama
        </CardContent>
      </Card>
    </Inline>
  );
}
