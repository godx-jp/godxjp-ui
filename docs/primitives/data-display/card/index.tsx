import {
  Card,
  CardAction,
  CardContent,
  CardCover,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";

export default function Demo() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>CardTitle</CardTitle>
          <CardDescription>CardDescription</CardDescription>
        </CardHeader>
        <CardContent>CardContent</CardContent>
        <CardFooter>CardFooter</CardFooter>
      </Card>

      <Card size="compact">
        <CardHeader banded>
          <CardTitle>CardHeader banded</CardTitle>
          <CardDescription>size compact</CardDescription>
        </CardHeader>
        <CardContent solo>CardContent solo</CardContent>
        <CardFooter separated>CardFooter separated</CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CardTitle</CardTitle>
          <CardAction>CardAction</CardAction>
        </CardHeader>
        <CardContent>CardContent</CardContent>
      </Card>

      <Card>
        <CardCover>CardCover</CardCover>
        <CardHeader>
          <CardTitle>CardTitle</CardTitle>
          <CardDescription>CardDescription</CardDescription>
        </CardHeader>
        <CardContent>CardContent</CardContent>
      </Card>

      <Card variant="muted">
        <CardContent solo>variant=&quot;muted&quot;</CardContent>
      </Card>
      <Card variant="outline">
        <CardContent solo>variant=&quot;outline&quot;</CardContent>
      </Card>
      <Card variant="featured">
        <CardContent solo>variant=&quot;featured&quot;</CardContent>
      </Card>

      <Card accent="primary">
        <CardContent solo>accent=&quot;primary&quot;</CardContent>
      </Card>
      <Card accent="destructive">
        <CardContent solo>accent=&quot;destructive&quot;</CardContent>
      </Card>

      <Card density="tight">
        <CardContent solo>density=&quot;tight&quot;</CardContent>
      </Card>
      <Card density="cozy">
        <CardContent solo>density=&quot;cozy&quot;</CardContent>
      </Card>
    </>
  );
}
