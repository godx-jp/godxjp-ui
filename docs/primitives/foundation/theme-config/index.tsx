import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Inline, Stack } from "@godxjp/ui/layout";

export default function Demo() {
  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Theme Config</CardTitle>
      </CardHeader>
      <CardContent>
        <Stack gap="md">
          <Inline gap="sm">
            <Button>Primary action</Button>
            <Button variant="outline">Secondary</Button>
            <Badge tone="success">Success</Badge>
            <Badge status="pending" />
          </Inline>
          <pre className="bg-muted overflow-auto rounded-md p-3 text-xs">
            {`:root {
  --primary: 211 73% 15%;
  --radius: 0.375rem;
  --control-height-default: 2rem;
  --space-section: var(--phi-0);
}`}
          </pre>
        </Stack>
      </CardContent>
    </Card>
  );
}
