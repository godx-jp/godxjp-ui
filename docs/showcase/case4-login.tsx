/**
 * Showcase · case4 — Login (ログイン)
 *
 * The dxs-kintai auth surface, served at `/showcase/case4-login`.
 * Built ENTIRELY from real @godxjp/ui primitives — the design handoff
 * (UI Kit.html §04 + Handy login) recreated as a "skeleton" (intent + look),
 * not a transcription of the prototype DOM.
 *
 * Composition map (prototype block → @godxjp/ui primitive):
 *   no shell ............... a bare centered page (login has no AppShell)
 *   comfortable density .... `.ui-density-comfortable` wrapper → 44px touch floor
 *   locale + theme toggle .. Select (locale) + ToggleGroup (theme) top-right
 *   split brand panel ...... Card composition, hidden < lg (mobile-first)
 *   auth card .............. Card (shadow-lg — the one resting shadow login allows)
 *   SSO buttons ............ Button(outline) full-width + brand SVG slot
 *   email / password ....... FormField + Input / PasswordInput
 *   "forgot" link .......... FormField labelAddon (right-aligned ghost link)
 *   divider "または" ....... Separator pair + center text
 *   footer ................. muted 利用規約 · プライバシーポリシー links
 *
 * DNA applied: comfortable density (44px), small headings (20/18/14/13),
 * 14px/1.7 body, fixed color signaling (the single --primary action = ログイン),
 * 1px-border surfaces, no resting shadow EXCEPT the auth card (documented
 * exception), quiet factual copy, no emoji, ASCII quotes in code-like labels.
 */
import * as React from "react";
import { Languages, Monitor, Moon, Sun } from "lucide-react";

import { Button, Heading, Logo, Text } from "@godxjp/ui/general";
import {
  FormField,
  Input,
  PasswordInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ToggleGroup,
  ToggleGroupItem,
} from "@godxjp/ui/data-entry";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@godxjp/ui/data-display";
import { Separator } from "@godxjp/ui/layout";

// ── The single allowed multi-color brand mark (Google "G") ─────────────────────
// Icons normally inherit currentColor; a third-party brand mark is the documented
// exception (ui-kit-surfaces §5). lucide has no Google glyph, so the official
// 4-color path is inlined — the only place a non-token fill appears.
function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.27-4.74 3.27-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

// ── Brand lockup ("勤" mark + dxs · kintai wordmark) ───────────────────────────
function BrandLockup({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <div className="flex items-center gap-2.5">
      <Logo glyph="勤" size={size} aria-hidden="true" />
      <div className="leading-tight">
        <Text as="div" size="lg" weight="bold" className="tracking-tight">
          dxs{" "}
          <Text as="span" tone="primary">
            ·
          </Text>{" "}
          kintai
        </Text>
        <Text as="div" size="2xs" tone="muted">
          勤怠管理プラットフォーム
        </Text>
      </div>
    </div>
  );
}

const LOCALES: Array<{ code: string; label: string }> = [
  { code: "ja", label: "日本語" },
  { code: "en", label: "English" },
  { code: "vi", label: "Tiếng Việt" },
];

export default function LoginShowcase() {
  // Independent local state (Rule #6) — controlled + uncontrolled both shown:
  // theme/locale are controlled (value + onValueChange), the fields are uncontrolled
  // with seeded defaultValue so the filled state is visible at rest (Rule #2).
  const [locale, setLocale] = React.useState("ja");
  const [theme, setTheme] = React.useState("light");

  return (
    <div className="ui-density-comfortable bg-muted/40 text-foreground min-h-screen">
      {/* Locale + theme toggle, pinned top-right. Stacks under brand on narrow. */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="lg:hidden">
          <BrandLockup />
        </div>
        <div className="ms-auto flex items-center gap-2">
          <Select value={locale} onValueChange={setLocale}>
            <SelectTrigger size="sm" className="w-32" aria-label="言語を選択">
              <Languages aria-hidden="true" className="text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {LOCALES.map((l) => (
                <SelectItem key={l.code} value={l.code}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ToggleGroup
            type="single"
            value={theme}
            onValueChange={(v) => v && setTheme(v)}
            variant="outline"
            size="sm"
            aria-label="テーマを切り替え"
          >
            <ToggleGroupItem value="light" aria-label="ライト">
              <Sun aria-hidden="true" />
            </ToggleGroupItem>
            <ToggleGroupItem value="dark" aria-label="ダーク">
              <Moon aria-hidden="true" />
            </ToggleGroupItem>
            <ToggleGroupItem value="system" aria-label="システム">
              <Monitor aria-hidden="true" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Centered auth area. Split brand panel + card sit side-by-side from lg. */}
      <div className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-5xl items-center px-4 py-8 sm:px-6">
        <div className="mx-auto grid w-full grid-cols-1 items-stretch gap-8 lg:grid-cols-2">
          {/* Split brand panel — hidden on mobile (mobile-first), shown from lg. */}
          <aside className="hidden lg:flex">
            <Card className="bg-primary/5 w-full">
              <CardContent solo className="flex h-full flex-col justify-between gap-8">
              <BrandLockup size="lg" />
              <div className="flex flex-col gap-3">
                <Heading level={2} className="leading-snug">
                  打刻から承認まで、ひとつの勤怠基盤で。
                </Heading>
                <Text as="p" tone="muted" className="leading-relaxed">
                  出勤・休憩・残業の打刻、シフト調整、欠勤・遅刻の承認を一元化します。
                  多拠点・多テナントに対応し、現場と管理をつなぎます。
                </Text>
              </div>
              <dl className="border-border grid grid-cols-3 gap-4 border-t pt-6">
                <div>
                  <Text as="dt" size="2xs" tone="muted">
                    導入企業
                  </Text>
                  <Text as="dd" size="lg" weight="bold" tabular>
                    1,240
                  </Text>
                </div>
                <div>
                  <Text as="dt" size="2xs" tone="muted">
                    稼働拠点
                  </Text>
                  <Text as="dd" size="lg" weight="bold" tabular>
                    8,600
                  </Text>
                </div>
                <div>
                  <Text as="dt" size="2xs" tone="muted">
                    月間打刻
                  </Text>
                  <Text as="dd" size="lg" weight="bold" tabular>
                    21M
                  </Text>
                </div>
              </dl>
              </CardContent>
            </Card>
          </aside>

          {/* Auth card — the one surface allowed a resting shadow (shadow-lg). */}
          <Card className="mx-auto w-full max-w-sm self-center shadow-lg lg:mx-0">
            <CardHeader className="flex flex-col gap-1.5 pb-2 text-center lg:text-start">
              <div className="flex justify-center lg:hidden">
                <BrandLockup />
              </div>
              <CardTitle className="text-lg font-semibold">ログイン</CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
                勤怠管理プラットフォームへようこそ
              </CardDescription>
            </CardHeader>

            <CardContent solo className="flex flex-col gap-5">
              {/* SSO buttons — outline, full-width, 44px (comfortable). */}
              <div className="flex flex-col gap-2.5">
                <Button variant="outline" className="w-full justify-center">
                  <GoogleMark />
                  Google で続ける
                </Button>
                <Button variant="outline" className="w-full justify-center">
                  シングルサインオン (SSO)
                </Button>
              </div>

              {/* Divider "または" — Separator pair + centered label. */}
              <div className="flex items-center gap-3">
                <Separator className="flex-1" />
                <Text size="xs" tone="muted">
                  または
                </Text>
                <Separator className="flex-1" />
              </div>

              {/* Email — uncontrolled, seeded so the filled state shows at rest. */}
              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <FormField id="login-email" label="メールアドレス" required>
                  <Input
                    type="email"
                    name="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="name@example.com"
                    defaultValue="m.tanaka@famgia.com"
                  />
                </FormField>

                {/* Password — labelAddon hosts the right-aligned "忘れた場合" link. */}
                <FormField
                  id="login-password"
                  label="パスワード"
                  required
                  labelAddon={
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="ms-auto h-auto p-0 text-xs"
                    >
                      お忘れの場合
                    </Button>
                  }
                >
                  <PasswordInput
                    name="password"
                    autoComplete="current-password"
                    placeholder="パスワードを入力"
                    defaultValue="example-pass"
                  />
                </FormField>

                {/* The single --primary action of the view. */}
                <Button type="submit" className="w-full justify-center">
                  ログイン
                </Button>
              </form>

              <Text as="p" size="2xs" tone="muted" align="center" className="leading-relaxed">
                ログインすると{" "}
                <Button variant="link" size="sm" className="h-auto p-0 text-[var(--font-size-2xs)]">
                  利用規約
                </Button>{" "}
                ·{" "}
                <Button variant="link" size="sm" className="h-auto p-0 text-[var(--font-size-2xs)]">
                  プライバシーポリシー
                </Button>{" "}
                に同意したものとみなされます。
              </Text>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
