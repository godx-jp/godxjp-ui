/**
 * Showcase · case4 — Login (ログイン)
 *
 * The reference-design auth surface, served at `/showcase/case4-login`.
 * Built ENTIRELY from real @godxjp/ui primitives — the design handoff
 * (UI Kit.html §04 + Handy login) recreated as a "skeleton" (intent + look),
 * not a transcription of the prototype DOM.
 *
 * Composition map (prototype block → @godxjp/ui primitive):
 *   page shell ............. AuthShell (the unauthenticated root shell)
 *   comfortable density .... AuthShell's own control tier → 44px touch floor
 *   locale + theme toggle .. AuthShell `actions` (banner, inline end)
 *   two-column measure ..... AuthShell `measure="wide"` → 64rem content slot
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

import { Button, Heading, Text } from "@godxjp/ui/general";
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
import {
  Avatar,
  AvatarFallback,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Descriptions,
} from "@godxjp/ui/data-display";
import { AuthShell, Flex, ResponsiveGrid, Separator } from "@godxjp/ui/layout";

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

// ── Brand lockup ("勤" mark + Acme · 勤怠 wordmark) ───────────────────────────
function BrandLockup({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <Flex align="center" gap="sm">
      <Avatar aria-hidden="true" className={`rounded-md ${size === "lg" ? "size-11 text-lg" : ""}`}>
        <AvatarFallback className="bg-primary text-primary-foreground font-bold">勤</AvatarFallback>
      </Avatar>
      <div className="leading-tight">
        <Text as="div" size="lg" weight="bold" className="tracking-tight">
          Acme{" "}
          <Text as="span" tone="primary">
            ·
          </Text>{" "}
          勤怠
        </Text>
        <Text as="div" size="2xs" tone="muted">
          勤怠管理プラットフォーム
        </Text>
      </div>
    </Flex>
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
    <AuthShell
      /* The 64rem content slot the split (brand panel + card) login needs. */
      measure="wide"
      className="text-foreground"
      /* Brand mark in the banner below lg; from lg the split panel carries it. */
      brand={
        <div className="lg:hidden">
          <BrandLockup />
        </div>
      }
      /* Page-level controls, pinned to the banner's inline end. */
      actions={
        <>
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
        </>
      }
    >
      {/* Centered auth area. Split brand panel + card sit side-by-side from lg. */}
      <ResponsiveGrid columns={{ sm: 1, lg: 2, md: 1 }} gap="xl" className="w-full items-stretch">
        {/* Split brand panel — hidden on mobile (mobile-first), shown from lg. */}
        <aside className="hidden lg:block">
          <Card className="bg-primary/5 h-full w-full">
            <CardContent solo className="h-full">
              <Flex direction="col" justify="between" gap="xl">
                <BrandLockup size="lg" />
                <Flex direction="col" gap="md">
                  <Heading level={2} className="leading-snug">
                    打刻から承認まで、ひとつの勤怠基盤で。
                  </Heading>
                  <Text as="p" tone="muted" className="leading-relaxed">
                    出勤・休憩・残業の打刻、シフト調整、欠勤・遅刻の承認を一元化します。
                    多拠点・多テナントに対応し、現場と管理をつなぎます。
                  </Text>
                </Flex>
                <Separator />
                <Descriptions columns={3}>
                  <Descriptions.Item label="導入企業">
                    <Text size="lg" weight="bold" tabular>
                      1,240
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="稼働拠点">
                    <Text size="lg" weight="bold" tabular>
                      8,600
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="月間打刻">
                    <Text size="lg" weight="bold" tabular>
                      21M
                    </Text>
                  </Descriptions.Item>
                </Descriptions>
              </Flex>
            </CardContent>
          </Card>
        </aside>

        {/* Auth card — the one surface allowed a resting shadow (shadow-lg). */}
        <Card className="mx-auto w-full max-w-sm self-center shadow-lg">
          <CardHeader className="text-center lg:text-start">
            <Flex justify="center" className="lg:hidden">
              <BrandLockup />
            </Flex>
            <CardTitle className="text-lg font-semibold">ログイン</CardTitle>
            <CardDescription className="text-muted-foreground text-xs">
              勤怠管理プラットフォームへようこそ
            </CardDescription>
          </CardHeader>

          <CardContent solo>
            <Flex direction="col" gap="lg">
              {/* SSO buttons — outline, full-width, 44px (comfortable). */}
              <Flex direction="col" gap="sm">
                <Button variant="outline" className="w-full justify-center">
                  <GoogleMark />
                  Google で続ける
                </Button>
                <Button variant="outline" className="w-full justify-center">
                  シングルサインオン (SSO)
                </Button>
              </Flex>

              {/* Divider "または" — Separator pair + centered label. */}
              <Flex align="center" gap="md">
                <Separator className="flex-1" />
                <Text size="xs" tone="muted">
                  または
                </Text>
                <Separator className="flex-1" />
              </Flex>

              {/* Email — uncontrolled, seeded so the filled state shows at rest. */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <Flex direction="col" gap="md">
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
                      <Button type="button" variant="link" size="sm" className="ms-auto text-xs">
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
                </Flex>
              </form>

              <Text as="p" size="2xs" tone="muted" align="center" className="leading-relaxed">
                ログインすると{" "}
                <Button variant="link" size="sm" className="text-[var(--font-size-2xs)]">
                  利用規約
                </Button>{" "}
                ·{" "}
                <Button variant="link" size="sm" className="text-[var(--font-size-2xs)]">
                  プライバシーポリシー
                </Button>{" "}
                に同意したものとみなされます。
              </Text>
            </Flex>
          </CardContent>
        </Card>
      </ResponsiveGrid>
    </AuthShell>
  );
}
