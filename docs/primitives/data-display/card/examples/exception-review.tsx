import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  KeyValueGrid,
  StatusBadge,
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
          <StatusBadge status="failed" label="High" />
        </CardAction>
      </CardHeader>
      <CardContent>
        <KeyValueGrid columns={2}>
          <KeyValueGrid.Item label="Order">YMT-AGT-7622-1048</KeyValueGrid.Item>
          <KeyValueGrid.Item label="Owner">Agent Ops</KeyValueGrid.Item>
          <KeyValueGrid.Item label="Risk">
            Receiver district differs from KYC profile.
          </KeyValueGrid.Item>
          <KeyValueGrid.Item label="Suggested action">
            Request proof of address before delivery.
          </KeyValueGrid.Item>
        </KeyValueGrid>
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
