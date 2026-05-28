import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";

export default function Demo() {
  return (
    <Card className="max-w-lg">
      <CardHeader banded>
        <CardTitle>Audit events</CardTitle>
        <CardDescription>Realm internal · last 24h</CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm">
        Prop <code className="text-xs">banded</code> trên{" "}
        <code className="text-xs">CardHeader</code> — band nền muted chạy sát mép card, body giữ
        section gap bên dưới border.
      </CardContent>
    </Card>
  );
}
