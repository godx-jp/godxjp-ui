import { Card, CardContent, CardDescription } from "@godxjp/ui/data-display";

export default function Demo() {
  return (
    <Card size="compact" className="max-w-sm">
      <CardContent solo>
        <CardDescription>Quick stat</CardDescription>
        <p className="text-2xl font-semibold tabular-nums">47</p>
      </CardContent>
    </Card>
  );
}
