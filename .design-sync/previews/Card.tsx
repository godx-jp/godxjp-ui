import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction,
  Button, Badge,
} from "@godxjp/ui";

export function Basic() {
  return (
    <Card style={{ maxWidth: 380 }}>
      <CardHeader>
        <CardTitle>Monthly attendance</CardTitle>
        <CardDescription>Summary for the current pay period.</CardDescription>
      </CardHeader>
      <CardContent>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7 }}>
          21 working days recorded. Overtime is within the approved limit and no
          unresolved correction requests remain.
        </p>
      </CardContent>
      <CardFooter>
        <Button size="sm" variant="outline">View timesheet</Button>
      </CardFooter>
    </Card>
  );
}

export function WithActionAndBadge() {
  return (
    <Card variant="featured" style={{ maxWidth: 380 }}>
      <CardHeader>
        <CardTitle>Shift request</CardTitle>
        <CardDescription>Submitted 2 hours ago.</CardDescription>
        <CardAction>
          <Badge tone="warning">Pending</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7 }}>
          Tanaka requested to swap the Friday late shift with Suzuki.
        </p>
      </CardContent>
      <CardFooter style={{ gap: 8 }}>
        <Button size="sm">Approve</Button>
        <Button size="sm" variant="ghost">Decline</Button>
      </CardFooter>
    </Card>
  );
}

export function Variants() {
  return (
    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
      <Card variant="default"><CardContent>Default</CardContent></Card>
      <Card variant="muted"><CardContent>Muted</CardContent></Card>
      <Card variant="outline"><CardContent>Outline</CardContent></Card>
      <Card accent="primary"><CardContent>Primary accent</CardContent></Card>
    </div>
  );
}
