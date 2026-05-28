import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";

export default function Demo() {
  return (
    <div className="bg-muted/50 rounded-lg p-4">
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader>
          <CardTitle>Batch preview</CardTitle>
          <CardDescription>Trên nền muted — không border card</CardDescription>
        </CardHeader>
        <CardContent className="text-sm">Borderless / ghost card cho nested preview.</CardContent>
      </Card>
    </div>
  );
}
