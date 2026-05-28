import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Timeline,
} from "@godxjp/ui/data-display";

const events = [
  {
    title: "Batch approved",
    location: "Admin Console",
    time: "09:12",
    note: "Approved by ops lead after order payload validation.",
  },
  {
    title: "Vendor handoff",
    location: "Osaka Store",
    time: "10:45",
    note: "18 items scanned into outbound queue OSK-AX-04.",
  },
  {
    title: "Order dispatched",
    location: "Dispatch Center 2",
    time: "13:20",
    note: "ETA customer 18:55 local time.",
    current: true,
  },
];

export default function Demo() {
  return (
    <Card className="max-w-xl">
      <CardHeader banded>
        <CardTitle>Audit timeline</CardTitle>
        <CardDescription>REC-8801 · last 24h</CardDescription>
      </CardHeader>
      <CardContent>
        <Timeline items={events} />
      </CardContent>
    </Card>
  );
}
