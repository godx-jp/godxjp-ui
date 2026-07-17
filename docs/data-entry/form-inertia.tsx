import { useState } from "react";
import { Input } from "@godxjp/ui/data-entry";
import { Button } from "@godxjp/ui/general";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { PageContainer } from "@godxjp/ui/layout";
import { FormFieldControl, FormRoot, useFormSubmitting } from "@godxjp/ui/form";
import { inertiaAdapter } from "@godxjp/ui/inertia";

// Stand-in for Inertia's useForm() — the real hook from @inertiajs/react has this exact shape, so a
// page passes it straight to inertiaAdapter (the library never imports @inertiajs). Here a tiny local
// mock drives the demo: server-style state + errors + processing, no react-hook-form.
function useMockInertiaForm(initial: Record<string, string>) {
  const [data, setData] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  return {
    data,
    errors,
    processing,
    setData: (key: string, value: unknown) => {
      setData((d) => ({ ...d, [key]: String(value) }));
      setErrors((e) => ({ ...e, [key]: "" })); // clear the field error on edit (Inertia behaviour)
    },
    post: () => {
      setProcessing(true);
      window.setTimeout(() => {
        setProcessing(false);
        // Simulate a Laravel FormRequest validation error landing in form.errors.
        setErrors({ email: "このメールアドレスは登録されていません。" });
      }, 600);
    },
  };
}

// The submit button reads processing via useFormSubmitting() — app code, not a library component.
function SubmitButton() {
  return (
    <Button type="submit" loading={useFormSubmitting()}>
      サインイン
    </Button>
  );
}

/**
 * FormRoot with an Inertia adapter — server-driven form binding. inertiaAdapter(form) lets Inertia's
 * useForm drive FormFieldControl with the SAME auto-binding as the react-hook-form path: no manual
 * value/onChange/error/aria-invalid per field; server errors surface on the right field and clear on
 * edit; processing flows to the submit button via useFormSubmitting(). Composed of real @godxjp/ui.
 */
export default function Demo() {
  const form = useMockInertiaForm({ email: "", password: "" });

  return (
    <PageContainer
      title="FormRoot with Inertia"
      subtitle="Server-driven form binding via inertiaAdapter · no per-field wiring"
    >
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle level={2}>サインイン</CardTitle>
          <CardDescription>
            Inertia の useForm を inertiaAdapter でラップし、FormRoot に渡すだけ。value / onChange /
            error / aria は name から自動でバインドされる。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormRoot adapter={inertiaAdapter(form)} onSubmit={() => form.post()}>
            <FormFieldControl name="email" label="メールアドレス" required>
              {(field) => <Input {...field} type="email" value={String(field.value ?? "")} />}
            </FormFieldControl>
            <FormFieldControl name="password" label="パスワード" required>
              {(field) => <Input {...field} type="password" value={String(field.value ?? "")} />}
            </FormFieldControl>
            <SubmitButton />
          </FormRoot>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
