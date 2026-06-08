import { useState } from "react";

import {
  CheckboxGroup,
  Field,
  Form,
  FormField,
  Input,
  RadioGroup,
  Select,
  Switch,
  TimeInput,
} from "@godxjp/ui/data-entry";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Alert, AlertDescription, AlertTitle } from "@godxjp/ui/feedback";
import { Button, Text } from "@godxjp/ui/general";
import {
  AppShell,
  Flex,
  PageContainer,
  Sidebar,
  type SidebarSection,
  Topbar,
} from "@godxjp/ui/layout";
import { Loader2, Settings, ShieldCheck, User, Users } from "lucide-react";

const sections: SidebarSection[] = [
  {
    label: "設定",
    items: [
      { id: "profile", label: "プロフィール", icon: User },
      { id: "members", label: "メンバー", icon: Users },
      { id: "security", label: "セキュリティ", icon: ShieldCheck },
      { id: "preferences", label: "環境設定", icon: Settings },
    ],
  },
];

/**
 * Employee settings — a horizontal-layout (labelWidth) settings screen using Card sections. Shows
 * read-only system fields (employee number, joined date), a disabled field, controlled selects and
 * choice groups, and a save flow with a pending spinner and a "保存しました" success Alert. The
 * action bar lives in the page footer (Cancel + Save, primary rightmost — rule 41). Composed only
 * from real @godxjp/ui primitives; typography via the Text primitive.
 */
export default function Demo() {
  const [name, setName] = useState("山田 太郎");
  const [department, setDepartment] = useState("sales");
  const [role, setRole] = useState("member");
  const [notify, setNotify] = useState<string[]>(["email", "slack"]);
  const [coreStart, setCoreStart] = useState("10:00");
  const [coreEnd, setCoreEnd] = useState("15:00");
  const [twoFactor, setTwoFactor] = useState(true);
  const [status, setStatus] = useState<"idle" | "pending" | "saved">("idle");

  function dirty() {
    if (status === "saved") setStatus("idle");
  }

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setStatus("pending");
    window.setTimeout(() => setStatus("saved"), 1000);
  }

  const pending = status === "pending";

  return (
    <AppShell
      sidebar={
        <Sidebar
          activeId="profile"
          sections={sections}
          onSelect={() => {}}
          product={{ name: "CoreBooks", role: "設定", color: "hsl(var(--primary))" }}
        />
      }
      topbar={
        <Topbar
          product={{ name: "CoreBooks", color: "hsl(var(--primary))" }}
          onSearchOpen={() => {}}
        />
      }
    >
      <PageContainer
        title="従業員設定"
        breadcrumb={[{ label: "設定", to: "#" }, { label: "プロフィール" }]}
        footer={
          <Flex direction="row" wrap gap="sm" justify="end">
            <Button variant="outline" type="button" disabled={pending}>
              キャンセル
            </Button>
            <Button type="submit" form="settings-form" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" />
                  保存中…
                </>
              ) : (
                "保存"
              )}
            </Button>
          </Flex>
        }
      >
        {/* One <form> wraps all sections (nested <form> is invalid HTML). The Form sets a default
            horizontal layout; the 勤務・通知 fields below override to vertical per-field. */}
        <Form id="settings-form" onSubmit={handleSave} layout="horizontal" labelWidth={140}>
          <Flex direction="col" gap="lg" className="max-w-2xl">
            {status === "saved" ? (
              <Alert tone="success">
                <AlertTitle>保存しました</AlertTitle>
                <AlertDescription>従業員設定を更新しました。</AlertDescription>
              </Alert>
            ) : null}

            <Card>
              <CardHeader>
                <CardTitle>基本情報</CardTitle>
                <CardDescription>
                  ラベルは固定幅の列に横並び（horizontal）。システム発番の項目は read-only。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="ui-form">
                  <FormField id="es-number" label="従業員番号">
                    <Input id="es-number" readOnly value="EMP-2021-0042" />
                  </FormField>
                  <FormField id="es-joined" label="入社日">
                    <Input id="es-joined" readOnly value="2021-04-01" />
                  </FormField>
                  <FormField id="es-name" label="氏名" required>
                    <Input
                      id="es-name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        dirty();
                      }}
                      disabled={pending}
                    />
                  </FormField>
                  <FormField id="es-email" label="メール（変更不可 · disabled）">
                    <Input id="es-email" disabled value="taro@example.co.jp" />
                  </FormField>
                  <FormField id="es-dept" label="所属部署">
                    <Select
                      id="es-dept"
                      name="department"
                      value={department}
                      onValueChange={(v) => {
                        setDepartment(v);
                        dirty();
                      }}
                      disabled={pending}
                      options={[
                        { value: "sales", label: "営業部" },
                        { value: "accounting", label: "経理部" },
                        { value: "engineering", label: "開発部" },
                      ]}
                    />
                  </FormField>
                  <FormField id="es-role" label="権限">
                    <RadioGroup
                      value={role}
                      onValueChange={(v) => {
                        setRole(v);
                        dirty();
                      }}
                      orientation="horizontal"
                      options={[
                        { value: "admin", label: "管理者" },
                        { value: "member", label: "一般" },
                        { value: "viewer", label: "閲覧のみ" },
                      ]}
                    />
                  </FormField>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>勤務・通知</CardTitle>
                <CardDescription>コアタイムと通知チャネル、二要素認証の設定。</CardDescription>
              </CardHeader>
              <CardContent>
                <Flex direction="col" gap="md">
                  <Flex direction="row" gap="md" wrap>
                    <FormField id="es-core-start" label="コアタイム開始" layout="vertical">
                      <TimeInput
                        id="es-core-start"
                        name="core_start"
                        value={coreStart}
                        onValueChange={(v) => {
                          setCoreStart(v);
                          dirty();
                        }}
                        step={15}
                      />
                    </FormField>
                    <FormField id="es-core-end" label="コアタイム終了" layout="vertical">
                      <TimeInput
                        id="es-core-end"
                        name="core_end"
                        value={coreEnd}
                        onValueChange={(v) => {
                          setCoreEnd(v);
                          dirty();
                        }}
                        step={15}
                      />
                    </FormField>
                  </Flex>
                  <FormField
                    id="es-notify"
                    label="通知チャネル"
                    helper="複数選択可"
                    layout="vertical"
                  >
                    <CheckboxGroup
                      value={notify}
                      onValueChange={(v) => {
                        setNotify(v);
                        dirty();
                      }}
                      orientation="horizontal"
                      options={[
                        { value: "email", label: "メール" },
                        { value: "slack", label: "Slack" },
                        { value: "sms", label: "SMS" },
                      ]}
                    />
                  </FormField>
                  <Field
                    id="es-2fa"
                    label="二要素認証を有効にする"
                    description="ログイン時にワンタイムコードを要求します"
                  >
                    <Switch
                      id="es-2fa"
                      checked={twoFactor}
                      onCheckedChange={(c) => {
                        setTwoFactor(c);
                        dirty();
                      }}
                      disabled={pending}
                    />
                  </Field>
                  <Text tone="muted" size="xs">
                    変更は「保存」を押すまで反映されません。
                  </Text>
                </Flex>
              </CardContent>
            </Card>
          </Flex>
        </Form>
      </PageContainer>
    </AppShell>
  );
}
