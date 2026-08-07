import { useState } from "react";
import { CheckCircle2, KeyRound, Mail } from "lucide-react";

import { Alert, AlertDescription, AlertTitle, Skeleton } from "@godxjp/ui/feedback";
import {
  Avatar,
  AvatarFallback,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  ListRow,
} from "@godxjp/ui/data-display";
import {
  Checkbox,
  Field,
  FormField,
  Input,
  PasswordInput,
  PasswordStrength,
} from "@godxjp/ui/data-entry";
import { Button, Reveal } from "@godxjp/ui/general";
import {
  AuthDivider,
  AuthFooter,
  AuthIdentity,
  AuthShell,
  AuthStack,
  Flex,
} from "@godxjp/ui/layout";
import { AppSettingPicker } from "@godxjp/ui/navigation";

/**
 * AuthShell preset="registration" (gh#256) — the canonical sign-up measure.
 *
 * The preset owns the whole page geometry: a 360px (22.5rem) form measure at 1440/1024, a 15px
 * inline gutter at 390 (card x=15, width=360 — the same page rhythm as preset="login", so
 * sign-in → sign-up never jumps on a phone), the block-start inset, and the FOOTER CLEARANCE the
 * legal/consent footer keeps at the end of a long scroll. There is no page-local width, inset,
 * media query or colour anywhere in this file.
 *
 * WHY THIS PRESET IS START-ALIGNED (and no other one is): a registration card is the tallest
 * surface in the hosted-identity set — name · email · password · confirm · strength meter ·
 * consent · submit · provider row. A vertically CENTRED tall card overflows ABOVE the scroll
 * origin on a short viewport, which puts its first field permanently out of reach. Start-aligned,
 * the block-start inset is ordinary page padding the user simply scrolls past.
 *
 * Two things in this page are COMPOSITIONS, not framework components (Gate 0 / rule #46) —
 * they are the formally documented public replacements #256 asked for:
 *
 *   · SOCIAL / PROVIDER ACTIONS ("SocialLinks") — an `AuthDivider` + a `Flex direction="col"` of
 *     real `Button variant="outline"`. It owns no behaviour: each provider is a plain action the
 *     app wires to its own OAuth start URL. A framework component here would have to invent the
 *     provider list, its order and its consent semantics — product decisions the package must not
 *     make. `disabled` and `loading` are the Button's own props; no new API.
 *
 *   · ORGANIZATION CHOICE LIST — `Card` + `CardContent flush` + a `<ul>` of `ListRow as="li"`,
 *     the same composition documented on the context-selection page. Its loading / empty / error /
 *     denied states are shown here because #256 asked for them explicitly: Skeleton rows,
 *     `EmptyState`, and an `Alert` — all existing exports, no consumer CSS.
 *
 * Verify at 1440x900 · 1024x900 · 390x844.
 */

type Stage = "form" | "pending-email";
type ListState = "ready" | "loading" | "empty" | "error" | "denied";

const PROVIDERS = [
  { id: "google", label: "Google で登録", icon: Mail },
  { id: "passkey", label: "パスキーで登録", icon: KeyRound },
];

const ORGANIZATIONS = [
  { id: "acme", name: "Acme 株式会社", role: "招待 · 管理者として参加", initials: "AC" },
  { id: "godx-labs", name: "GoDX Labs", role: "招待 · メンバーとして参加", initials: "GL" },
];

export default function Demo() {
  const [stage, setStage] = useState<Stage>("form");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [listState, setListState] = useState<ListState>("ready");

  // The one real validation this page owns — a confirmation that does not match is the classic
  // registration error, and it must be announced, not just coloured (WCAG 1.4.1).
  const mismatch = confirm.length > 0 && confirm !== password;

  return (
    // NO `brand` bar — deliberately, and it is load-bearing for the geometry, not a styling
    // preference. The canonical hosted-identity screens (SCR-001 Login, SCR-002 Registration) put
    // the mark INSIDE the column as `AuthIdentity`, above the card, and pass no top brand bar. Pass
    // one here and the whole column is pushed down by the bar's height — measured at 72px — so
    // every offset read off this page would be 72px wrong, and the preset's canonical card anchor
    // would silently miss. `preset="login"` reads correctly for exactly the same reason.
    <AuthShell
      variant="canonical"
      preset="registration"
      footer={
        <AuthFooter
          product="GoDX ID"
          terms="利用規約"
          privacy="プライバシー"
          locale={<AppSettingPicker kind="locale" appearance="labeled" compact />}
        />
      }
    >
      <AuthIdentity
        title={stage === "form" ? "アカウントを作成" : "メールを確認してください"}
        requester={
          stage === "form"
            ? "すでにアカウントをお持ちの場合はサインインしてください"
            : "satoshi@example.com 宛に確認リンクを送信しました"
        }
      />

      <Reveal>
        {stage === "form" ? (
          <Card>
            <CardHeader>
              <CardTitle level={2}>登録情報</CardTitle>
              <CardDescription>
                すべての項目が必須です。パスワードは 12 文字以上を推奨します。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuthStack>
                <FormField id="reg-name" label="お名前" required>
                  <Input id="reg-name" autoComplete="name" placeholder="山田 太郎" />
                </FormField>

                <FormField
                  id="reg-email"
                  label="メールアドレス"
                  required
                  helper="確認リンクの送信先になります。"
                >
                  <Input
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </FormField>

                <FormField id="reg-password" label="パスワード" required>
                  <PasswordInput
                    id="reg-password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </FormField>

                {/* The strength meter is a real primitive — never a hand-rolled coloured bar. */}
                <PasswordStrength value={password} />

                <FormField
                  id="reg-confirm"
                  label="パスワード（確認）"
                  required
                  // The error is announced through the field's own aria-errormessage wiring, so
                  // the mismatch is not communicated by colour alone.
                  error={mismatch ? "パスワードが一致しません。" : undefined}
                >
                  <PasswordInput
                    id="reg-confirm"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                  />
                </FormField>

                <Field id="reg-consent" label="利用規約とプライバシーポリシーに同意します">
                  <Checkbox
                    id="reg-consent"
                    checked={consent}
                    onCheckedChange={(next) => setConsent(next === true)}
                  />
                </Field>

                <Button
                  loading={submitting}
                  disabled={!consent || mismatch}
                  onClick={() => {
                    setSubmitting(true);
                    setSubmitting(false);
                    setStage("pending-email");
                  }}
                >
                  アカウントを作成
                </Button>

                {/* ── SOCIAL / PROVIDER ACTIONS — the documented "SocialLinks" composition.
                       A divider + real outline Buttons. No new component: the package must not
                       invent which providers a product offers, in what order, or what consent
                       they imply. `disabled` / `loading` are the Button's own props. ── */}
                <AuthDivider label="または" />

                <Flex direction="col" gap="sm">
                  {PROVIDERS.map((provider) => {
                    const Icon = provider.icon;
                    return (
                      <Button key={provider.id} variant="outline" disabled={submitting}>
                        <Icon aria-hidden="true" />
                        {provider.label}
                      </Button>
                    );
                  })}
                </Flex>
              </AuthStack>
            </CardContent>
          </Card>
        ) : (
          /* ── PENDING-EMAIL state — carried by the SAME preset, no geometry change. ── */
          <Card>
            <CardHeader>
              <CardTitle level={2}>確認メールを送信しました</CardTitle>
              <CardDescription>
                メール内のリンクを開くと登録が完了します。リンクの有効期限は 24 時間です。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuthStack>
                <Alert tone="success">
                  <CheckCircle2 aria-hidden="true" />
                  <AlertTitle>satoshi@example.com に送信しました</AlertTitle>
                  <AlertDescription>
                    受信箱に届かない場合は迷惑メールフォルダをご確認ください。
                  </AlertDescription>
                </Alert>
                <Button variant="outline">確認メールを再送する</Button>
                <Button variant="ghost" onClick={() => setStage("form")}>
                  入力内容を修正する
                </Button>
              </AuthStack>
            </CardContent>
          </Card>
        )}
      </Reveal>

      {/* ── ORGANIZATION CHOICE LIST — the documented public composition, with every state #256
             asked for. Card + CardContent flush + <ul> of ListRow as="li"; the states are
             Skeleton / EmptyState / Alert. Nothing here is a new component and nothing needs
             consumer CSS. ── */}
      <Card>
        <CardHeader>
          <CardTitle level={2}>参加する組織</CardTitle>
          <CardDescription>招待されている組織があれば、登録と同時に参加できます。</CardDescription>
        </CardHeader>
        <CardContent flush>
          {listState === "ready" && (
            <ul>
              {ORGANIZATIONS.map((org) => (
                <ListRow
                  as="li"
                  key={org.id}
                  leading={
                    <Avatar>
                      <AvatarFallback>{org.initials}</AvatarFallback>
                    </Avatar>
                  }
                  title={org.name}
                  description={org.role}
                  trailing={
                    <Button variant="ghost" size="sm">
                      参加
                    </Button>
                  }
                />
              ))}
            </ul>
          )}

          {listState === "loading" && (
            <Flex direction="col" gap="sm">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </Flex>
          )}

          {listState === "empty" && (
            <EmptyState
              title="招待されている組織はありません"
              description="登録後に組織を作成するか、管理者に招待を依頼してください。"
            />
          )}

          {listState === "error" && (
            <Alert tone="destructive">
              <AlertTitle>招待一覧を取得できませんでした</AlertTitle>
              <AlertDescription>
                しばらくしてからもう一度お試しください。登録自体は続行できます。
              </AlertDescription>
            </Alert>
          )}

          {listState === "denied" && (
            <Alert tone="warning">
              <AlertTitle>この一覧を表示する権限がありません</AlertTitle>
              <AlertDescription>招待の確認は組織の管理者にご依頼ください。</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Flex direction="row" gap="xs" wrap justify="center">
        {(["ready", "loading", "empty", "error", "denied"] as const).map((state) => (
          <Button
            key={state}
            size="sm"
            variant={state === listState ? "secondary" : "ghost"}
            aria-pressed={state === listState}
            onClick={() => setListState(state)}
          >
            {state}
          </Button>
        ))}
      </Flex>
    </AuthShell>
  );
}
