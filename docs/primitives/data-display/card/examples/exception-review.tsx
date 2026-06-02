import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Descriptions,
  Badge,
} from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";

export default function Demo() {
  return (
    <Card className="max-w-xl">
      <CardHeader banded className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Address mismatch</CardTitle>
          <CardDescription>Case EXC-2026-0524-018</CardDescription>
        </div>
        <CardAction>
          <Badge status="failed">High</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Descriptions columns={2}>
          <Descriptions.Item label="Order">YMT-AGT-7622-1048</Descriptions.Item>
          <Descriptions.Item label="Owner">Agent Ops</Descriptions.Item>
          <Descriptions.Item label="Risk">
            Receiver district differs from KYC profile.
          </Descriptions.Item>
          <Descriptions.Item label="Suggested action">
            Request proof of address before delivery.
          </Descriptions.Item>
        </Descriptions>
      </CardContent>
      <CardFooter separated className="justify-between gap-2">
        <Button variant="outline" size="sm">
          Escalate
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Reject
          </Button>
          <Button size="sm">Approve exception</Button>
        </div>
      </CardFooter>
    </Card>
  );
}
