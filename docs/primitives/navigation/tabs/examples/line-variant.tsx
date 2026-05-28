import { Tabs, TabsContent, TabsList, TabsTrigger } from "@godxjp/ui/navigation";

export default function Demo() {
  return (
    <Tabs defaultValue="exceptions" className="max-w-xl">
      <TabsList variant="line">
        <TabsTrigger value="exceptions">Exceptions</TabsTrigger>
        <TabsTrigger value="sla">SLA</TabsTrigger>
        <TabsTrigger value="handover">Handover</TabsTrigger>
      </TabsList>
      <TabsContent value="exceptions">
        <p className="pt-4 text-sm">12 đơn hàng cần xử lý trước hết giờ làm việc.</p>
      </TabsContent>
      <TabsContent value="sla">
        <p className="pt-4 text-sm">96.4% đơn giữ đúng SLA trong 24 giờ qua.</p>
      </TabsContent>
      <TabsContent value="handover">
        <p className="pt-4 text-sm">3 lô đang chờ bàn giao cho nhà cung cấp.</p>
      </TabsContent>
    </Tabs>
  );
}
