import { act, fireEvent } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";
import { FormRoot, FormFieldControl, useZodForm } from "../index";
import { Textarea } from "../../components/data-entry/textarea";
import { Input } from "../../components/data-entry/input";
import { Select } from "../../components/data-entry/select";
import { Button } from "../../components/general/button";

describe("form integration", () => {
  it("plain input and textarea emit the value callback without affixes or counters", async () => {
    const user = userEvent.setup();
    const inputChange = vi.fn();
    const textareaChange = vi.fn();
    renderWithUi(
      <>
        <Input aria-label="Name" onValueChange={inputChange} />
        <Textarea aria-label="Notes" onValueChange={textareaChange} />
      </>,
    );
    await user.type(screen.getByRole("textbox", { name: "Name" }), "A");
    await user.type(screen.getByRole("textbox", { name: "Notes" }), "B");
    expect(inputChange).toHaveBeenCalledExactlyOnceWith("A");
    expect(textareaChange).toHaveBeenCalledExactlyOnceWith("B");
  });
  it("binds native and value-based controls using the same field bag", async () => {
    const user = userEvent.setup();
    const save = vi.fn();
    function Example() {
      const form = useZodForm(z.object({ name: z.string(), role: z.string() }), {
        defaultValues: { name: "", role: "reader" },
      });
      return (
        <FormRoot form={form} onSubmit={save}>
          <FormFieldControl name="name" label="Name">
            {(field) => <Input {...field} value={String(field.value ?? "")} />}
          </FormFieldControl>
          <FormFieldControl name="role" label="Role">
            {(field) => (
              <Select
                {...field}
                value={String(field.value ?? "")}
                options={[
                  { value: "reader", label: "Reader" },
                  { value: "editor", label: "Editor" },
                ]}
              />
            )}
          </FormFieldControl>
          <Button type="submit">Save</Button>
        </FormRoot>
      );
    }
    renderWithUi(<Example />);
    await user.type(screen.getByRole("textbox", { name: "Name" }), "Ada");
    await user.click(screen.getByRole("combobox", { name: "Role" }));
    await user.click(screen.getByRole("option", { name: "Editor" }));
    await user.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(save).toHaveBeenCalledWith({ name: "Ada", role: "editor" }));
  });
  it("deduplicates native alias callbacks and generates unique ids across forms", async () => {
    const user = userEvent.setup();
    const set = vi.fn();
    function Example() {
      const [value, setValue] = useState("");
      return (
        <FormRoot
          adapter={{
            getValue: () => value,
            setValue: (_name, v) => {
              set(v);
              setValue(String(v));
            },
            getError: () => undefined,
            isSubmitting: false,
          }}
          onSubmit={() => {}}
        >
          <FormFieldControl name="name" label="Name">
            {(field) => <Input {...field} value={String(field.value ?? "")} />}
          </FormFieldControl>
        </FormRoot>
      );
    }
    renderWithUi(
      <>
        <Example />
        <Example />
      </>,
    );
    const fields = screen.getAllByRole("textbox", { name: "Name" });
    expect(fields[0].id).not.toBe(fields[1].id);
    await user.type(fields[0], "Ada");
    expect(set).toHaveBeenCalledTimes(3);
  });
  it("blocks duplicate submits, recovers from rejection and keeps entered values", async () => {
    const user = userEvent.setup();
    let reject!: (error: Error) => void;
    const save = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<void>((_resolve, r) => {
            reject = r;
          }),
      )
      .mockResolvedValue(undefined);
    function Example() {
      const form = useZodForm(z.object({ name: z.string() }), { defaultValues: { name: "Ada" } });
      return (
        <FormRoot form={form} onSubmit={save}>
          <FormFieldControl name="name" label="Name">
            {(field) => <Input {...field} value={String(field.value ?? "")} />}
          </FormFieldControl>
          <Button type="submit">Save</Button>
        </FormRoot>
      );
    }
    const { container } = renderWithUi(<Example />);
    await user.click(screen.getByRole("button", { name: "Save" }));
    fireEvent.submit(container.querySelector("form")!);
    expect(save).toHaveBeenCalledTimes(1);
    await act(async () => reject(new Error("offline")));
    expect(screen.getByRole("alert")).toHaveTextContent(/try again|thử lại|再試行/);
    expect(screen.getByRole("textbox")).toHaveValue("Ada");
    await user.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(save).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
