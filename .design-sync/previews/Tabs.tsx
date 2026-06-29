import { Tabs, TabsList, TabsTrigger, TabsContent } from "@godxjp/ui";

function panel(text: string) {
  return <p style={{ margin: 0, padding: "12px 2px", fontSize: 14, lineHeight: 1.7 }}>{text}</p>;
}

export function Line() {
  return (
    <div style={{ maxWidth: 460 }}>
      <Tabs defaultValue="overview" variant="line">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="shifts">Shifts</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">{panel("Attendance summary for the current pay period.")}</TabsContent>
        <TabsContent value="shifts">{panel("Assigned shifts and swaps.")}</TabsContent>
        <TabsContent value="requests">{panel("Open correction and leave requests.")}</TabsContent>
      </Tabs>
    </div>
  );
}

export function Card() {
  return (
    <div style={{ maxWidth: 460 }}>
      <Tabs defaultValue="day" variant="card">
        <TabsList>
          <TabsTrigger value="day">Day</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
        </TabsList>
        <TabsContent value="day">{panel("Daily breakdown.")}</TabsContent>
        <TabsContent value="week">{panel("Weekly breakdown.")}</TabsContent>
        <TabsContent value="month">{panel("Monthly breakdown.")}</TabsContent>
      </Tabs>
    </div>
  );
}
