import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";
import { Form } from "../form";
import { FormErrors } from "../form-errors";
import { FormField } from "../form-field";
import { Input } from "../input";

// FormErrors — the "no field to stand on" error summary. A Form carries the server error bag;
// every mounted FormField with a `name` CLAIMS its key (it displays that message itself), and
// FormErrors renders only the unclaimed remainder — errors attached to hidden/derived fields
// (action_mode, page, source_slip_cd…) that would otherwise fail silently.
describe("FormErrors", () => {
  it("renders only the bag entries no mounted FormField claims", () => {
    renderWithUi(
      <Form errors={{ customer_nm: "顧客名は必須です", action_mode: "操作モードが不正です" }}>
        <FormErrors title="入力エラー" />
        <FormField name="customer_nm" label="顧客名">
          <Input />
        </FormField>
      </Form>,
    );

    const banner = screen.getByText("入力エラー").closest('[data-slot="alert"]') as HTMLElement;
    expect(banner).not.toBeNull();
    // The hidden-field error surfaces in the banner…
    expect(banner).toHaveTextContent("操作モードが不正です");
    // …while the claimed key does NOT repeat there — it renders on its own field.
    expect(banner).not.toHaveTextContent("顧客名は必須です");
    const fieldError = screen.getByText("顧客名は必須です");
    expect(fieldError.id).toMatch(/-error$/);
  });

  it("resolves a FormField's error from the bag by name (explicit `error` prop wins)", () => {
    renderWithUi(
      <Form errors={{ customer_nm: "bagのメッセージ", tel_no: "bag側 (上書きされる)" }}>
        <FormField name="customer_nm" label="顧客名">
          <Input />
        </FormField>
        <FormField name="tel_no" label="電話番号" error="明示的なメッセージ">
          <Input />
        </FormField>
        <FormErrors title="入力エラー" />
      </Form>,
    );

    // Auto-resolved from the bag by name.
    expect(screen.getByText("bagのメッセージ")).toBeInTheDocument();
    // Explicit error prop wins over the bag entry…
    expect(screen.getByText("明示的なメッセージ")).toBeInTheDocument();
    expect(screen.queryByText("bag側 (上書きされる)")).not.toBeInTheDocument();
    // …and both keys are claimed, so the banner renders nothing at all.
    expect(screen.queryByText("入力エラー")).not.toBeInTheDocument();
  });

  it("renders nothing when the bag is empty or absent", () => {
    const { container } = renderWithUi(
      <Form errors={{}}>
        <FormErrors title="入力エラー" />
        <FormField label="顧客名">
          <Input />
        </FormField>
      </Form>,
    );
    expect(container.querySelector('[data-slot="alert"]')).toBeNull();
  });

  it("releases a claim on unmount — the message returns to the banner", () => {
    const bag = { source_slip_cd: "元伝票が存在しません" };
    const withField = (
      <Form errors={bag}>
        <FormErrors title="入力エラー" />
        <FormField name="source_slip_cd" label="元伝票">
          <Input />
        </FormField>
      </Form>
    );
    const withoutField = (
      <Form errors={bag}>
        <FormErrors title="入力エラー" />
      </Form>
    );

    const { rerender } = renderWithUi(withField);
    expect(screen.queryByText("入力エラー")).not.toBeInTheDocument();

    rerender(withoutField);
    const banner = screen.getByText("入力エラー").closest('[data-slot="alert"]') as HTMLElement;
    expect(banner).toHaveTextContent("元伝票が存在しません");
  });

  it("lists every message of an array entry; a field shows the first (Laravel `$errors->first()`)", () => {
    renderWithUi(
      <Form
        errors={{
          page: ["ページ番号が不正です", "ページ範囲を超えています"],
          zip_cd: ["郵便番号の形式が不正です", "郵便番号は7桁で入力してください"],
        }}
      >
        <FormErrors title="入力エラー" />
        <FormField name="zip_cd" label="郵便番号">
          <Input />
        </FormField>
      </Form>,
    );

    const banner = screen.getByText("入力エラー").closest('[data-slot="alert"]') as HTMLElement;
    expect(banner).toHaveTextContent("ページ番号が不正です");
    expect(banner).toHaveTextContent("ページ範囲を超えています");
    expect(banner).not.toHaveTextContent("郵便番号の形式が不正です");
    // The field shows the FIRST message of its array entry only.
    expect(screen.getByText("郵便番号の形式が不正です")).toBeInTheDocument();
    expect(screen.queryByText("郵便番号は7桁で入力してください")).not.toBeInTheDocument();
  });

  it("an explicit `errors` prop overrides the Form bag but still honours claims", () => {
    renderWithUi(
      <Form errors={{ ignored: "Formのbagは使われない" }}>
        <FormErrors
          title="入力エラー"
          errors={{ customer_nm: "顧客名は必須です", action_mode: "操作モードが不正です" }}
        />
        <FormField name="customer_nm" label="顧客名">
          <Input />
        </FormField>
      </Form>,
    );

    const banner = screen.getByText("入力エラー").closest('[data-slot="alert"]') as HTMLElement;
    expect(banner).toHaveTextContent("操作モードが不正です");
    expect(banner).not.toHaveTextContent("顧客名は必須です");
    expect(banner).not.toHaveTextContent("Formのbagは使われない");
  });

  it("forwards className to the banner root", () => {
    renderWithUi(
      <Form errors={{ action_mode: "操作モードが不正です" }}>
        <FormErrors title="入力エラー" className="contract-form-errors" />
      </Form>,
    );
    const banner = screen.getByText("入力エラー").closest('[data-slot="alert"]') as HTMLElement;
    expect(banner).toHaveClass("contract-form-errors");
  });

  it("uses the localized default title when none is passed", () => {
    renderWithUi(
      <Form errors={{ action_mode: "操作モードが不正です" }}>
        <FormErrors />
      </Form>,
    );
    // renderWithUi mounts AppProvider with defaultLocale="vi".
    expect(screen.getByText("Dữ liệu nhập có lỗi, vui lòng kiểm tra")).toBeInTheDocument();
  });
});
