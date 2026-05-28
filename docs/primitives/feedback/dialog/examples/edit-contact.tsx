import {
  Dialog,
  DialogAction,
  DialogCancel,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@godxjp/ui/feedback";
import { FormField, Input } from "@godxjp/ui/data-entry";
import { Button } from "@godxjp/ui/general";

export default function Demo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Edit contact</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cập nhật liên hệ</DialogTitle>
          <DialogDescription>Thay đổi email nhận thông báo trạng thái.</DialogDescription>
        </DialogHeader>
        <FormField id="contact-email" label="Email khách">
          <Input id="contact-email" type="email" defaultValue="mai.nguyen@shop-vn.com" />
        </FormField>
        <DialogFooter>
          <DialogCancel>Hủy</DialogCancel>
          <DialogAction>Lưu</DialogAction>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
