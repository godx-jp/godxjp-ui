import { z } from "zod";

import {
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@godxjp/ui/data-entry";
import { Button } from "@godxjp/ui/general";
import { Stack } from "@godxjp/ui/layout";
import { FormFieldControl, FormRoot, useZodForm } from "@godxjp/ui/form";

const customerSchema = z.object({
  name: z.string().min(1, "Họ tên là bắt buộc"),
  email: z.email("Email không hợp lệ"),
  channel: z.string().min(1, "Chọn kênh liên hệ chính"),
  note: z.string().optional(),
});

export default function Demo() {
  const form = useZodForm(customerSchema, {
    defaultValues: { name: "", email: "", channel: "", note: "" },
  });

  return (
    <FormRoot form={form} onSubmit={() => undefined} className="max-w-lg">
      <FormFieldControl name="name" label="Họ tên khách hàng" required>
        {(field) => (
          <Input
            {...field}
            value={typeof field.value === "string" ? field.value : ""}
            placeholder="Nguyễn Thị Mai"
          />
        )}
      </FormFieldControl>
      <FormFieldControl
        name="email"
        label="Email"
        required
        helper="Dùng để gửi thông báo trạng thái đơn hàng"
      >
        {(field) => (
          <Input
            {...field}
            value={typeof field.value === "string" ? field.value : ""}
            type="email"
          />
        )}
      </FormFieldControl>
      <FormFieldControl name="channel" label="Kênh liên hệ chính" required>
        {(field) => (
          <Select
            value={typeof field.value === "string" ? field.value : ""}
            onValueChange={field.onChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Zalo / Facebook / Line" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="zalo">Zalo OA</SelectItem>
                <SelectItem value="facebook">Facebook Page</SelectItem>
                <SelectItem value="line">Line Official</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      </FormFieldControl>
      <FormFieldControl name="note" label="Ghi chú CS">
        {(field) => {
          const { ref: _ref, ...rest } = field;
          return (
            <Textarea {...rest} value={typeof rest.value === "string" ? rest.value : ""} rows={3} />
          );
        }}
      </FormFieldControl>
      <Stack gap="sm" className="flex-row pt-2">
        <Button type="submit">Tạo khách hàng</Button>
        <Button type="button" variant="ghost" onClick={() => form.reset()}>
          Xóa form
        </Button>
      </Stack>
    </FormRoot>
  );
}
