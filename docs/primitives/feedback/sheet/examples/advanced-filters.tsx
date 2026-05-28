import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@godxjp/ui/feedback";
import { FormField, Input, Switch } from "@godxjp/ui/data-entry";
import { Button } from "@godxjp/ui/general";

export default function Demo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Advanced filters</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Bộ lọc nâng cao</SheetTitle>
          <SheetDescription>Lọc queue theo customer, SLA và trạng thái xử lý.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4">
          <FormField id="customer" label="Customer">
            <Input id="customer" placeholder="Nguyen Mai" />
          </FormField>
          <FormField id="sla-risk" label="Chỉ hiện SLA risk">
            <Switch id="sla-risk" />
          </FormField>
        </div>
        <SheetFooter>
          <Button variant="outline">Reset</Button>
          <Button>Apply</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
