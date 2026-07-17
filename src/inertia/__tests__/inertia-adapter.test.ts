import { describe, expect, it, vi } from "vitest";

import { inertiaAdapter, useInertiaField, type InertiaFormLike } from "../index";

function makeForm(overrides: Partial<InertiaFormLike> = {}): InertiaFormLike {
  return {
    data: { email: "a@example.com", password: "" },
    setData: vi.fn(),
    errors: { password: "Required." },
    processing: false,
    ...overrides,
  };
}

describe("inertiaAdapter", () => {
  it("maps getValue/getError/isSubmitting from the Inertia form", () => {
    const adapter = inertiaAdapter(makeForm({ processing: true }));
    expect(adapter.getValue("email")).toBe("a@example.com");
    expect(adapter.getError("password")).toBe("Required.");
    expect(adapter.getError("email")).toBeUndefined();
    expect(adapter.isSubmitting).toBe(true);
  });

  it("setValue delegates to Inertia setData(name, value)", () => {
    const form = makeForm();
    inertiaAdapter(form).setValue("email", "b@example.com");
    expect(form.setData).toHaveBeenCalledWith("email", "b@example.com");
  });

  it("getValues returns the whole data snapshot", () => {
    const form = makeForm();
    expect(inertiaAdapter(form).getValues?.()).toBe(form.data);
  });
});

describe("useInertiaField", () => {
  it("returns spreadable value/error/name and an onChange that writes back", () => {
    const form = makeForm();
    const field = useInertiaField(form, "email");
    expect(field.name).toBe("email");
    expect(field.value).toBe("a@example.com");
    expect(field.error).toBeUndefined();
    field.onChange({ target: { value: "c@example.com" } });
    expect(form.setData).toHaveBeenCalledWith("email", "c@example.com");
  });

  it("exposes the server error for the field", () => {
    expect(useInertiaField(makeForm(), "password").error).toBe("Required.");
  });
});
