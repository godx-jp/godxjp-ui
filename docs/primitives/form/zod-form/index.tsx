import { z } from "zod";

import { Input } from "@godxjp/ui/data-entry";
import { Button } from "@godxjp/ui/general";
import { FormFieldControl, FormRoot, useZodForm } from "@godxjp/ui/form";

const schema = z.object({
  email: z.email("Email không hợp lệ"),
});

export default function Demo() {
  const form = useZodForm(schema, {
    defaultValues: { email: "mai.nguyen@shop-vn.com" },
  });

  return (
    <FormRoot form={form} onSubmit={() => undefined} className="max-w-sm">
      <FormFieldControl name="email" label="Email" required>
        {(field) => (
          <Input
            {...field}
            value={typeof field.value === "string" ? field.value : ""}
            type="email"
          />
        )}
      </FormFieldControl>
      <Button type="submit">Save</Button>
    </FormRoot>
  );
}
