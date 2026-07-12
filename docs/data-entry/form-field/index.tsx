import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Form, FormField, Input, Select } from "@godxjp/ui/data-entry";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@godxjp/ui/feedback";
import { Button } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * FormField — wraps one control with a label, helper, and error, and wires
 * aria-describedby / aria-invalid onto the child. Use it for every stacked
 * labelled control (Input/Textarea/Select/DatePicker…); use Field for a
 * checkbox/switch beside its label. Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  return (
    <PageContainer
      title="FormField"
      subtitle="Label · helper · required · error · a11y wired for the control"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>States</CardTitle>
            <CardDescription>
              required adds a red asterisk; helper is a muted hint; error (role=alert) overrides it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <FormField id="ff-name" label="取引先名" required helper="最大50文字">
                <Input id="ff-name" placeholder="株式会社..." />
              </FormField>
              <FormField
                id="ff-email"
                label="メール"
                error="メールアドレスの形式が正しくありません"
              >
                <Input id="ff-email" type="email" defaultValue="invalid@" />
              </FormField>
              <FormField id="ff-status" label="状態" helper="未選択の場合は下書きになります">
                <Select
                  id="ff-status"
                  name="status"
                  value="paid"
                  onValueChange={() => {}}
                  options={[
                    { value: "draft", label: "下書き" },
                    { value: "paid", label: "入金済" },
                  ]}
                />
              </FormField>
              <FormField
                id="ff-required-status"
                label="承認状態"
                required
                helper="承認ワークフローで使用します"
                error="承認状態を選択してください"
              >
                <Select
                  id="ff-required-status"
                  name="approval_status"
                  value=""
                  onValueChange={() => {}}
                  placeholder="状態を選択"
                  options={[
                    { value: "pending", label: "承認待ち" },
                    { value: "approved", label: "承認済み" },
                  ]}
                />
              </FormField>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>
              Layout matrix · widths / breakpoints / long locale / RTL
            </CardTitle>
            <CardDescription>
              horizontal は md 未満で vertical に collapse。field 単位の width override と 320px
              相当の長文を同時確認する。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-3xl">
              <Form layout="horizontal" labelWidth="12rem" controlWidth="28rem">
                <FormField
                  id="matrix-ja"
                  label="請求書の送付先メールアドレス"
                  required
                  helper="確認メールを送信します"
                >
                  <Input id="matrix-ja" defaultValue="billing@example.jp" />
                </FormField>
                <FormField
                  id="matrix-vi"
                  label="Địa chỉ email nhận hóa đơn và thông báo"
                  controlWidth="20rem"
                >
                  <Input id="matrix-vi" defaultValue="ketoan@example.vn" />
                </FormField>
              </Form>
            </div>
            <div className="mt-6 max-w-80 border p-3" dir="rtl" lang="ar">
              <FormField
                id="matrix-rtl"
                label="البريد الإلكتروني لاستلام الفاتورة"
                helper="سيتم إرسال رسالة تأكيد"
              >
                <Input id="matrix-rtl" type="email" placeholder="name@example.com" />
              </FormField>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>State contract · supported and untested gaps</CardTitle>
            <CardDescription>
              FormField supports helper, required and error. warning, pending, touched/submitted
              timing, server-error mapping and form-summary focus are not FormField props; those
              remain UNTESTED and belong to the form controller/application flow.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <FormField id="state-readonly" label="作成者" helper="システム管理項目">
                <Input id="state-readonly" readOnly defaultValue="山田 太郎" />
              </FormField>
              <FormField id="state-disabled" label="契約番号">
                <Input id="state-disabled" disabled defaultValue="CTR-2026-0042" />
              </FormField>
              <FormField
                id="state-server"
                label="組織名"
                error="保存できませんでした。しばらくしてから再試行してください。"
              >
                <Input id="state-server" defaultValue="株式会社アクメ" />
              </FormField>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Composition · Dialog / Sheet</CardTitle>
            <CardDescription>同じ bounded form を overlay 内で確認する。</CardDescription>
          </CardHeader>
          <CardContent>
            <Flex gap="sm" wrap>
              <Button onClick={() => setDialogOpen(true)}>Dialog form</Button>
              <Button variant="outline" onClick={() => setSheetOpen(true)}>
                Sheet form
              </Button>
            </Flex>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>取引先を追加</DialogTitle>
                </DialogHeader>
                <DialogBody>
                  <Form>
                    <FormField id="dialog-name" label="取引先名" required>
                      <Input id="dialog-name" />
                    </FormField>
                    <FormField id="dialog-email" label="メール" helper="任意">
                      <Input id="dialog-email" type="email" />
                    </FormField>
                  </Form>
                </DialogBody>
              </DialogContent>
            </Dialog>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>請求先設定</SheetTitle>
                </SheetHeader>
                <Form className="mt-4">
                  <FormField id="sheet-name" label="宛名" required>
                    <Input id="sheet-name" />
                  </FormField>
                  <FormField id="sheet-note" label="備考">
                    <Input id="sheet-note" />
                  </FormField>
                </Form>
              </SheetContent>
            </Sheet>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
