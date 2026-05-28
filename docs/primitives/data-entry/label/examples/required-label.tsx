import { Input, Label } from "@godxjp/ui/data-entry";

export default function Demo() {
  return (
    <div className="grid max-w-sm gap-2">
      <Label htmlFor="seller-code">Seller code</Label>
      <Input id="seller-code" placeholder="YMT-SLR-7734-2108" />
    </div>
  );
}
