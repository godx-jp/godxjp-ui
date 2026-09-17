import {
  ArrowUpRight,
  Check,
  Download,
  FileWarning,
  Globe,
  Lock,
  ShieldCheck,
  Smartphone,
  Unlock,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Button, Heading, Icon, Text } from "@godxjp/ui/general";
import { Flex, PageContainer, Separator } from "@godxjp/ui/layout";

/**
 * Icon · a glyph on the `--icon-size-*` scale, and the only supported way to draw a standalone one.
 *
 * A lucide component ships `width="24" height="24"`. Four rules in this library override that
 * (`.ui-button svg`, the menu row, the topbar cell, the ListRow leading slot) and nothing else
 * does · so a glyph in a `Text`, a table cell or an `<a>` draws at 24px beside 14px type, 1.7× the
 * text it annotates. `docs/CONSUMER-RULES.md` §3/§8 forbid the `size-4` / `w-[16px]` escape, which
 * left a consumer with 38 oversized glyphs and no supported fix (gh#712).
 *
 * `Icon` renders ONTO the glyph · the sized element is the `<svg>` itself · so it composes
 * anywhere a bare glyph does and adds no box to the row. Decorative (`aria-hidden`) by default;
 * `label` switches it to `role="img"` with that accessible name.
 *
 * Composed only from real @godxjp/ui components. All copy is consumer-owned and localized.
 */

/** The nine steps, with the px each resolves to at a 16px root · docs/TOKENS.md. */
const SIZES = [
  { size: "2xs", px: "10px", note: "アバターの在席ドット" },
  { size: "xs", px: "12px", note: "表の並べ替えカーソル" },
  { size: "sm", px: "14px", note: 'size="sm" のコントロール' },
  { size: "md", px: "16px", note: "既定のアイコン段" },
  { size: "lg", px: "20px", note: "アラート・ランチャー" },
  { size: "xl", px: "24px", note: "アップロードタイル" },
  { size: "2xl", px: "36px", note: "StatCard のメダリオン" },
  { size: "3xl", px: "40px", note: "ドロップゾーン" },
  { size: "4xl", px: "48px", note: "空状態の枠" },
] as const;

/** `tone` shares Text's vocabulary · one table for the glyph and the label beside it. */
const TONES = [
  { tone: "default", label: "default · 前景色" },
  { tone: "muted", label: "muted · 補足" },
  { tone: "primary", label: "primary · 主要導線" },
  { tone: "success", label: "success · 有効" },
  { tone: "warning", label: "warning · 要確認" },
  { tone: "destructive", label: "destructive · 失敗" },
  { tone: "info", label: "info · 情報" },
  { tone: "inherit", label: "inherit · 面の色を継承" },
] as const;

/** The real screen: a security settings list whose status is carried by a glyph beside 14px text. */
const SESSIONS = [
  {
    id: "s1",
    device: "MacBook Pro · 東京",
    detail: "2026-09-17 09:12 · 192.0.2.24",
    secure: true,
  },
  {
    id: "s2",
    device: "iPhone 15 · 大阪",
    detail: "2026-09-16 21:40 · 198.51.100.7",
    secure: true,
  },
  {
    id: "s3",
    device: "Windows PC · 未確認の拠点",
    detail: "2026-09-15 02:05 · 203.0.113.19",
    secure: false,
  },
];

export default function Demo() {
  return (
    <PageContainer
      title="Icon"
      subtitle='--icon-size-* の9段にグリフを載せる唯一の方法 · 既定は装飾（aria-hidden）· label で role="img"'
    >
      <Flex direction="col" gap="lg">
        {/* ── The real screen · the defect this primitive exists for: a status glyph inline with
             14px body text, where no context rule would ever have sized it. ── */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>サインイン中の端末</CardTitle>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              {SESSIONS.map((session) => (
                <Flex key={session.id} direction="row" gap="sm" align="center" justify="between">
                  <Flex direction="row" gap="sm" align="center">
                    <Icon
                      as={session.secure ? ShieldCheck : FileWarning}
                      size="lg"
                      tone={session.secure ? "success" : "warning"}
                      label={session.secure ? "保護された接続" : "確認が必要な接続"}
                    />
                    <Flex direction="col">
                      <Text weight="medium">{session.device}</Text>
                      {/* A decorative glyph INSIDE 14px text · `sm` puts it on the type's own step. */}
                      <Text size="xs" tone="muted">
                        <Icon as={Globe} size="xs" /> {session.detail}
                      </Text>
                    </Flex>
                  </Flex>
                  <Button variant="outline" size="sm">
                    <Icon as={session.secure ? Lock : Unlock} size="sm" />
                    サインアウト
                  </Button>
                </Flex>
              ))}
            </Flex>
          </CardContent>
        </Card>

        {/* ── Every step of the scale ── */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>size · 9段のアイコンスケール</CardTitle>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm">
              {SIZES.map((step) => (
                <Flex key={step.size} direction="row" gap="md" align="center">
                  <Flex direction="row" gap="sm" align="center">
                    <Icon as={Smartphone} size={step.size} />
                  </Flex>
                  <Text size="sm" mono>
                    {step.size}
                  </Text>
                  <Text size="sm" tone="muted" mono>
                    {step.px}
                  </Text>
                  <Text size="sm" tone="muted">
                    {step.note}
                  </Text>
                </Flex>
              ))}
            </Flex>
          </CardContent>
        </Card>

        {/* ── Every tone, beside the Text that shares the vocabulary ── */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>tone · Text と同じ意味の語彙</CardTitle>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm">
              {TONES.map((entry) => (
                <Flex key={entry.tone} direction="row" gap="sm" align="center">
                  <Icon as={Check} size="md" tone={entry.tone} />
                  <Text size="sm" tone={entry.tone}>
                    {entry.label}
                  </Text>
                </Flex>
              ))}
            </Flex>
          </CardContent>
        </Card>

        {/* ── Where it composes · inside Text, inside a Button, standalone in a link ── */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>合成 · Text の中・Button の中・単独</CardTitle>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Flex direction="col" gap="xs">
                <Heading level={3}>Text の中</Heading>
                <Text size="sm">
                  請求書は <Icon as={Lock} size="sm" tone="muted" /> 暗号化されて保管されます。
                </Text>
              </Flex>

              <Separator />

              <Flex direction="col" gap="xs">
                <Heading level={3}>Button の中 · 明示した段が Button の既定に勝つ</Heading>
                {/* 320px では 2 つのラベル付き Button が 1 行に収まらない。Button はラベル幅より
                    縮まないので、行を折り返させるのは並べた側の責任（`wrap`）。 */}
                <Flex direction="row" gap="sm" align="center" wrap>
                  <Button size="sm">
                    <Icon as={Download} size="sm" />
                    書き出す
                  </Button>
                  <Button variant="outline">
                    <Icon as={Download} size="lg" />
                    大きめのグリフ
                  </Button>
                </Flex>
              </Flex>

              <Separator />

              <Flex direction="col" gap="xs">
                <Heading level={3}>単独 · 名前を持つグリフ</Heading>
                <Flex direction="row" gap="sm" align="center">
                  <Text as="a" href="#icon-standalone" size="sm" tone="primary">
                    監査ログを開く <Icon as={ArrowUpRight} size="sm" />
                  </Text>
                  <Icon as={ShieldCheck} size="md" tone="success" label="二要素認証は有効です" />
                </Flex>
              </Flex>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
