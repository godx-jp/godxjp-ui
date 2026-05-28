import { toast } from "@godxjp/ui/feedback";
import { Button } from "@godxjp/ui/general";

export default function Demo() {
  return (
    <Button
      onClick={() => {
        toast.success("Lô đơn đã lưu", { description: "23 đơn hàng sẵn sàng xử lý." });
      }}
    >
      Show toast
    </Button>
  );
}
