import { Tabs, TabsContent, TabsList, TabsTrigger } from "@godxjp/ui/navigation";

export default function Demo() {
  return (
    <Tabs defaultValue="one">
      <TabsList variant="line">
        <TabsTrigger value="one">One</TabsTrigger>
        <TabsTrigger value="two">Two</TabsTrigger>
        <TabsTrigger value="disabled" disabled>
          Disabled
        </TabsTrigger>
      </TabsList>
      <TabsContent value="one">Content one</TabsContent>
      <TabsContent value="two">Content two</TabsContent>
    </Tabs>
  );
}
