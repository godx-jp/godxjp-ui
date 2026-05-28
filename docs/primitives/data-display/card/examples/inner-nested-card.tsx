import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";

export default function Demo() {
  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Policy bundle</CardTitle>
        <CardDescription>ABAC rules · realm internal</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Card size="compact" className="bg-muted/30 shadow-none">
          <CardContent solo className="space-y-1">
            <CardTitle className="text-sm">Rule: media.read</CardTitle>
            <p className="text-muted-foreground text-xs">Allow read on temp + permanent bucket.</p>
          </CardContent>
        </Card>
        <Card size="compact" className="bg-muted/30 shadow-none">
          <CardContent solo className="space-y-1">
            <CardTitle className="text-sm">Rule: media.promote</CardTitle>
            <p className="text-muted-foreground text-xs">Owner type commerce/product only.</p>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
