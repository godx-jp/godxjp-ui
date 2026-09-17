import { useState } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";
import { FormFieldControl, FormRoot, useZodForm } from "../index";
import { Checkbox } from "../../components/data-entry/checkbox";
import { Button } from "../../components/general/button";

/*
 * gh#709 — antd `Form.Item valuePropName="checked"`: a boolean field whose control carries its own
 * inline label. `{(field) => <Checkbox {...field}>label</Checkbox>}` with no manual wiring.
 */

const schema = z.object({ is_shared: z.boolean() });
type Values = z.infer<typeof schema>;

const scrollIntoView = vi.fn();
beforeAll(() => {
  Element.prototype.scrollIntoView = scrollIntoView;
});

function Harness({
  onSubmit,
  label,
  errors,
}: {
  onSubmit: (values: Values) => void;
  label?: string;
  errors?: Record<string, string[]>;
}) {
  const form = useZodForm(schema, { defaultValues: { is_shared: false } });
  return (
    <FormRoot form={form} onSubmit={onSubmit} errors={errors}>
      <FormFieldControl<Values> name="is_shared" label={label} valuePropName="checked">
        {(field) => <Checkbox {...field}>プロジェクトに共有する</Checkbox>}
      </FormFieldControl>
      <Button type="submit">Save</Button>
    </FormRoot>
  );
}

describe("FormFieldControl valuePropName='checked' (gh#709)", () => {
  it("binds checked/onCheckedChange and submits a boolean", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithUi(<Harness onSubmit={onSubmit} />);
    const box = screen.getByRole("checkbox", { name: "プロジェクトに共有する" });
    expect(box).not.toBeChecked();

    await user.click(screen.getByText("プロジェクトに共有する"));
    expect(box).toBeChecked();
    await user.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]![0]).toEqual({ is_shared: true });

    await user.click(screen.getByText("プロジェクトに共有する"));
    await user.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
    expect(onSubmit.mock.calls[1]![0]).toEqual({ is_shared: false });
  });

  it("renders no label row when `label` is omitted", () => {
    const { container } = renderWithUi(<Harness onSubmit={() => {}} />);
    const field = container.querySelector('[data-slot="form-field"]')!;
    expect(field.querySelector('[data-slot="form-field-label"]')).toBeNull();
    expect(field.firstElementChild).toHaveAttribute("data-slot", "form-field-control");
    const box = screen.getByRole("checkbox");
    expect(box).not.toHaveAttribute("aria-labelledby");
    expect(box).not.toHaveAttribute("aria-label");
  });

  it("keeps the box text in the name when the field also has a label", () => {
    renderWithUi(<Harness onSubmit={() => {}} label="公開範囲" />);
    expect(
      screen.getByRole("checkbox", { name: "公開範囲 プロジェクトに共有する" }),
    ).toBeInTheDocument();
  });

  it("exposes a 422 error on the checkbox via aria-describedby + aria-invalid", async () => {
    const user = userEvent.setup();
    function ServerHarness() {
      const [errors, setErrors] = useState<Record<string, string[]>>();
      return (
        <Harness
          errors={errors}
          onSubmit={() => setErrors({ is_shared: ["共有設定を確認してください"] })}
        />
      );
    }
    renderWithUi(<ServerHarness />);
    await user.click(screen.getByRole("button", { name: "Save" }));

    const box = await screen.findByRole("checkbox", { name: "プロジェクトに共有する" });
    await waitFor(() => expect(box).toHaveAttribute("aria-invalid", "true"));
    expect(box).toHaveAccessibleDescription("共有設定を確認してください");
    expect(screen.getByRole("alert")).toHaveTextContent("共有設定を確認してください");
  });

  it("scrollToFirstError reaches the checkbox", async () => {
    const user = userEvent.setup();
    scrollIntoView.mockClear();
    const strict = z.object({ is_shared: z.literal(true, { error: "required" }) });
    function StrictHarness() {
      const form = useZodForm(strict, {
        defaultValues: { is_shared: false } as unknown as z.infer<typeof strict>,
      });
      return (
        <FormRoot form={form} onSubmit={() => {}}>
          <FormFieldControl<z.infer<typeof strict>> name="is_shared" valuePropName="checked">
            {(field) => <Checkbox {...field}>同意する</Checkbox>}
          </FormFieldControl>
          <Button type="submit">Save</Button>
        </FormRoot>
      );
    }
    renderWithUi(<StrictHarness />);
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled());
    const target = scrollIntoView.mock.instances[0] as HTMLElement;
    expect(target.getAttribute("data-slot")).toBe("form-field");
    const box = screen.getByRole("checkbox", { name: "同意する" });
    expect(box).toHaveFocus();
    expect(box).toHaveAttribute("aria-invalid", "true");
  });
});
