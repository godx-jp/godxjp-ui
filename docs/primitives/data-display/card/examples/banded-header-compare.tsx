import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";

export default function Demo() {
  return (
    <div className="grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Plain header</CardTitle>
          <CardDescription>Nền card mặc định</CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">Không truyền prop.</CardContent>
      </Card>
      <Card>
        <CardHeader banded>
          <CardTitle>Banded header</CardTitle>
          <CardDescription>Nền muted</CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Full-bleed band + border-bottom.
        </CardContent>
      </Card>
    </div>
  );
}
