import { Card, CardContent } from "@godxjp/ui/data-display";

export default function Demo() {
  return (
    <Card className="max-w-md">
      <CardContent solo className="text-muted-foreground text-sm">
        Card không header — dùng cho search box, filter inline hoặc embed form ngắn.
      </CardContent>
    </Card>
  );
}
