/**
 * Showcase · settings-account-sections — the canonical SETTINGS SECTION / ROW composition (gh#216)
 *
 * ── Gate 0 verdict: COMPOSITION PATTERN, not a framework component ────────────────────────────
 * A "SettingsSection" / "SettingsRow" / "DangerZone" fails the Framework-Component Test
 * (docs/COMPOSITION-VS-COMPONENT.md): C2 — it owns NO behavior (pure layout + content + colour);
 * C3 — it is fully expressible TODAY from `Card` + `CardHeader/CardTitle/CardDescription/
 * CardAction/CardContent flush/CardFooter` + `ListRow` + `Descriptions` + `Switch`/`Select` +
 * `StatusBadge` + `AlertDialog` + the existing `--card-*` / `--list-row-*` / `--descriptions-*`
 * knobs; C4 — its API would be a screen-shaped grab-bag ("identity", "billing", "danger"); C7 —
 * it would ship one design's block to every consumer. So it lives HERE (and as the MCP
 * `settings-section-rows` pattern), never in `src/components/`. Zero new components were added.
 *
 * ── The four blocks the DXS consumer kept re-inventing ───────────────────────────────────────
 *   1. Identity          — avatar + `Descriptions` metadata, one header action (`CardAction`).
 *   2. Preferences       — `CardContent flush` + `ListRow` rows whose trailing slot IS the control
 *                          (`Switch` / `Select`). Never a hand-rolled
 *                          `<div className="flex justify-between border-b">`.
 *   3. Billing handoff   — canonical `StatusBadge status=…` (NO page-local status→colour map),
 *                          money/seats/dates through `Intl`, and a footer button that hands off to
 *                          the external billing portal with an sr-only "opens in a new tab".
 *   4. Danger zone       — `Card accent="destructive"` (the semantic leading rail is already a
 *                          token, `--card-accent-rail-width`) + destructive `ListRow` actions +
 *                          `AlertDialog challenge=…` type-to-confirm friction.
 *
 * ── Acceptance evidence baked into the page ──────────────────────────────────────────────────
 * · 1440 / 1024 / 390 — every block is a Card in a `max-w-3xl` column: `Descriptions` collapses
 *   3→2→1 columns, `ListRow` wraps its trailing controls onto their own line under
 *   `--list-row-body-min-width`, and the header action row wraps. Nothing scrolls horizontally.
 * · long JA/EN/VI labels — the "表示言語 / Label language" Select swaps the WHOLE label bundle to
 *   deliberately long JA, EN and VI strings (and re-tags every `Intl` formatter: ja-JP/JPY,
 *   en-US/USD, vi-VN/VND) so the rows can be checked at their worst case, not their best. It also
 *   drives the APP locale (`useAppLocale().setLocale`), so the library's own `t()` chrome — the
 *   canonical `StatusBadge` label above all — switches with the page instead of lagging behind it.
 * · Intl only — `Intl.NumberFormat` (currency, ISO 4217 + integer seat counts),
 *   `Intl.DateTimeFormat` (member-since / next invoice), `Intl.PluralRules` (seat noun),
 *   `Intl.DisplayNames` (region of the billing account, from ISO 3166-1 alpha-2).
 * · Logical CSS only, semantic tokens only, lucide icons (no emoji), quiet factual copy.
 */
import * as React from "react";
import { ExternalLink, ShieldAlert, UserMinus } from "lucide-react";

import { useAppLocale } from "@godxjp/ui/app";
import { Button, Text } from "@godxjp/ui/general";
import {
  Avatar,
  AvatarFallback,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Descriptions,
  ListRow,
  StatusBadge,
} from "@godxjp/ui/data-display";
import { FormField, Select, Switch } from "@godxjp/ui/data-entry";
import { AlertDialog } from "@godxjp/ui/feedback";
import { Flex, PageContainer } from "@godxjp/ui/layout";

// ── Label bundles: the SAME screen at its longest JA / EN / VI wording ────────────────────────
// Long-label stress is a first-class acceptance criterion (#216), so the bundle intentionally
// carries the verbose form of each label instead of the tidy demo form.

type LabelBundle = {
  /** BCP-47 tag driving every Intl formatter on the page. */
  tag: string;
  /** ISO 4217 code of the billing account. */
  currency: string;
  /** ISO 3166-1 alpha-2 region of the billing account. */
  region: string;
  optionLabel: string;
  pageTitle: string;
  pageSubtitle: string;
  save: string;
  labelLanguage: string;
  identityTitle: string;
  identityDescription: string;
  identityEdit: string;
  fieldName: string;
  fieldEmail: string;
  fieldEmployeeId: string;
  fieldMemberSince: string;
  displayName: string;
  email: string;
  preferencesTitle: string;
  preferencesDescription: string;
  prefDigestTitle: string;
  prefDigestDescription: string;
  prefMentionTitle: string;
  prefMentionDescription: string;
  prefDateFormatTitle: string;
  prefDateFormatDescription: string;
  billingTitle: string;
  billingDescription: string;
  billingPlanLabel: string;
  billingPlanValue: string;
  billingSeatsLabel: string;
  billingAmountLabel: string;
  billingNextInvoiceLabel: string;
  billingRegionLabel: string;
  billingHandoff: string;
  billingHandoffHint: string;
  opensInNewTab: string;
  seat: { one: string; other: string };
  dangerTitle: string;
  dangerDescription: string;
  dangerTransferTitle: string;
  dangerTransferDescription: string;
  dangerTransfer: string;
  dangerDeleteTitle: string;
  dangerDeleteDescription: string;
  dangerDelete: string;
  confirmTitle: string;
  confirmDescription: string;
  confirmLabel: string;
  cancelLabel: string;
};

const BUNDLES: Record<"ja" | "en" | "vi", LabelBundle> = {
  ja: {
    tag: "ja-JP",
    currency: "JPY",
    region: "JP",
    optionLabel: "日本語（長いラベル検証用）",
    pageTitle: "ワークスペースの設定",
    pageSubtitle:
      "アカウント情報・通知の環境設定・請求先ポータルへの引き渡し・取り消せない操作をまとめて管理します。",
    save: "変更内容を保存する",
    labelLanguage: "表示言語",
    identityTitle: "アカウント情報",
    identityDescription: "請求書・監査ログ・共有リンクに表示される氏名とメールアドレスです。",
    identityEdit: "アカウント情報を編集",
    fieldName: "表示名",
    fieldEmail: "連絡先メールアドレス",
    fieldEmployeeId: "従業員番号",
    fieldMemberSince: "利用開始日",
    displayName: "藤原 慧（ふじわら さとし）",
    email: "satoshi.fujiwara@example.co.jp",
    preferencesTitle: "通知と表示の環境設定",
    preferencesDescription: "変更は保存操作なしで即時反映されます。",
    prefDigestTitle: "週次サマリーをメールで受け取る",
    prefDigestDescription: "毎週月曜日の朝に、担当中の申請と未処理の承認をまとめて送信します。",
    prefMentionTitle: "メンションされたときにデスクトップ通知を表示する",
    prefMentionDescription: "ブラウザの通知許可が必要です。",
    prefDateFormatTitle: "日付の表示形式",
    prefDateFormatDescription: "一覧・詳細・書き出したファイルのすべてに適用されます。",
    billingTitle: "請求とサブスクリプション",
    billingDescription: "支払い方法と請求書は外部の請求ポータルで管理します。",
    billingPlanLabel: "契約プラン",
    billingPlanValue: "ビジネス（年額）",
    billingSeatsLabel: "利用ライセンス数",
    billingAmountLabel: "次回請求予定額",
    billingNextInvoiceLabel: "次回請求日",
    billingRegionLabel: "請求先の国／地域",
    billingHandoff: "請求ポータルを開く",
    billingHandoffHint: "支払い方法の変更・請求書のダウンロードは請求ポータルで行います。",
    opensInNewTab: "新しいタブで開きます",
    seat: { one: "{count} ライセンス", other: "{count} ライセンス" },
    dangerTitle: "取り消せない操作",
    dangerDescription: "以下の操作は元に戻せません。実行前に必ず内容を確認してください。",
    dangerTransferTitle: "ワークスペースの所有権を他のメンバーへ移管する",
    dangerTransferDescription: "移管後、あなたは管理者権限を失います。",
    dangerTransfer: "所有権を移管",
    dangerDeleteTitle: "ワークスペースと全データを完全に削除する",
    dangerDeleteDescription: "勤怠記録・申請履歴・監査ログがすべて削除されます。",
    dangerDelete: "ワークスペースを削除",
    confirmTitle: "ワークスペースを完全に削除しますか？",
    confirmDescription:
      "この操作は取り消せません。確認のためワークスペース識別子を入力してください。",
    confirmLabel: "完全に削除する",
    cancelLabel: "キャンセル",
  },
  en: {
    tag: "en-US",
    currency: "USD",
    region: "US",
    optionLabel: "English (long-label stress case)",
    pageTitle: "Workspace settings",
    pageSubtitle:
      "Manage your account identity, notification preferences, the handoff to the billing portal, and irreversible actions.",
    save: "Save all changes",
    labelLanguage: "Label language",
    identityTitle: "Account identity",
    identityDescription:
      "The name and address shown on invoices, audit log entries and shared links.",
    identityEdit: "Edit account identity",
    fieldName: "Display name",
    fieldEmail: "Contact email address",
    fieldEmployeeId: "Employee number",
    fieldMemberSince: "Member since",
    displayName: "Satoshi Fujiwara (Workspace administrator)",
    email: "satoshi.fujiwara@example.co.jp",
    preferencesTitle: "Notification and display preferences",
    preferencesDescription: "Changes apply immediately. There is nothing to save here.",
    prefDigestTitle: "Email me the weekly summary of assigned and pending requests",
    prefDigestDescription:
      "Sent every Monday morning with everything still waiting on your approval.",
    prefMentionTitle: "Show a desktop notification when somebody mentions me",
    prefMentionDescription: "Requires browser notification permission.",
    prefDateFormatTitle: "Date display format",
    prefDateFormatDescription: "Applies to every list, detail page and exported file.",
    billingTitle: "Billing and subscription",
    billingDescription: "Payment methods and invoices live in the external billing portal.",
    billingPlanLabel: "Current plan",
    billingPlanValue: "Business (billed annually)",
    billingSeatsLabel: "Licensed seats in use",
    billingAmountLabel: "Amount due next cycle",
    billingNextInvoiceLabel: "Next invoice date",
    billingRegionLabel: "Billing country or region",
    billingHandoff: "Open the billing portal",
    billingHandoffHint:
      "Change the payment method or download past invoices in the billing portal.",
    opensInNewTab: "opens in a new tab",
    seat: { one: "{count} seat", other: "{count} seats" },
    dangerTitle: "Irreversible actions",
    dangerDescription: "These actions cannot be undone. Read each one before you continue.",
    dangerTransferTitle: "Transfer workspace ownership to another member",
    dangerTransferDescription: "You lose administrator rights as soon as the transfer completes.",
    dangerTransfer: "Transfer ownership",
    dangerDeleteTitle: "Permanently delete this workspace and all of its data",
    dangerDeleteDescription: "Attendance records, request history and audit logs are all removed.",
    dangerDelete: "Delete workspace",
    confirmTitle: "Permanently delete this workspace?",
    confirmDescription:
      "This cannot be undone. Type the workspace identifier below to confirm the deletion.",
    confirmLabel: "Delete permanently",
    cancelLabel: "Cancel",
  },
  vi: {
    tag: "vi-VN",
    currency: "VND",
    region: "VN",
    optionLabel: "Tiếng Việt (nhãn dài nhất)",
    pageTitle: "Cài đặt không gian làm việc",
    pageSubtitle:
      "Quản lý thông tin tài khoản, tuỳ chọn thông báo, chuyển sang cổng thanh toán và các thao tác không thể hoàn tác.",
    save: "Lưu toàn bộ thay đổi",
    labelLanguage: "Ngôn ngữ nhãn",
    identityTitle: "Thông tin tài khoản",
    identityDescription:
      "Tên và địa chỉ hiển thị trên hoá đơn, bản ghi kiểm toán và liên kết chia sẻ.",
    identityEdit: "Sửa thông tin tài khoản",
    fieldName: "Tên hiển thị",
    fieldEmail: "Địa chỉ email liên hệ",
    fieldEmployeeId: "Mã nhân viên",
    fieldMemberSince: "Thành viên từ ngày",
    displayName: "Fujiwara Satoshi (Quản trị viên không gian làm việc)",
    email: "satoshi.fujiwara@example.co.jp",
    preferencesTitle: "Tuỳ chọn thông báo và hiển thị",
    preferencesDescription: "Thay đổi được áp dụng ngay, không cần bấm lưu.",
    prefDigestTitle: "Gửi email tổng hợp hằng tuần về các yêu cầu đang chờ tôi xử lý",
    prefDigestDescription: "Gửi vào sáng thứ Hai, gồm mọi yêu cầu còn chờ bạn phê duyệt.",
    prefMentionTitle: "Hiện thông báo trên máy tính khi có người nhắc đến tôi",
    prefMentionDescription: "Cần quyền thông báo của trình duyệt.",
    prefDateFormatTitle: "Định dạng hiển thị ngày",
    prefDateFormatDescription: "Áp dụng cho mọi danh sách, trang chi tiết và tệp xuất ra.",
    billingTitle: "Thanh toán và gói đăng ký",
    billingDescription: "Phương thức thanh toán và hoá đơn nằm ở cổng thanh toán bên ngoài.",
    billingPlanLabel: "Gói hiện tại",
    billingPlanValue: "Business (thanh toán theo năm)",
    billingSeatsLabel: "Số giấy phép đang dùng",
    billingAmountLabel: "Số tiền của kỳ kế tiếp",
    billingNextInvoiceLabel: "Ngày xuất hoá đơn kế tiếp",
    billingRegionLabel: "Quốc gia hoặc vùng thanh toán",
    billingHandoff: "Mở cổng thanh toán",
    billingHandoffHint: "Đổi phương thức thanh toán hoặc tải hoá đơn cũ ở cổng thanh toán.",
    opensInNewTab: "mở trong tab mới",
    seat: { one: "{count} giấy phép", other: "{count} giấy phép" },
    dangerTitle: "Thao tác không thể hoàn tác",
    dangerDescription: "Các thao tác dưới đây không thể hoàn tác. Hãy đọc kỹ trước khi tiếp tục.",
    dangerTransferTitle: "Chuyển quyền sở hữu không gian làm việc cho thành viên khác",
    dangerTransferDescription: "Bạn sẽ mất quyền quản trị ngay khi việc chuyển giao hoàn tất.",
    dangerTransfer: "Chuyển quyền sở hữu",
    dangerDeleteTitle: "Xoá vĩnh viễn không gian làm việc và toàn bộ dữ liệu",
    dangerDeleteDescription: "Dữ liệu chấm công, lịch sử yêu cầu và bản ghi kiểm toán đều bị xoá.",
    dangerDelete: "Xoá không gian làm việc",
    confirmTitle: "Xoá vĩnh viễn không gian làm việc này?",
    confirmDescription:
      "Không thể hoàn tác. Hãy nhập mã định danh không gian làm việc để xác nhận.",
    confirmLabel: "Xoá vĩnh viễn",
    cancelLabel: "Huỷ",
  },
};

const WORKSPACE_SLUG = "godx-shinjuku-hq";
const EMPLOYEE_ID = "EMP-1042-JP";
const MEMBER_SINCE = new Date("2023-04-01T00:00:00Z");
const NEXT_INVOICE = new Date("2026-08-31T00:00:00Z");
const SEATS = 128;
/** Minor-unit amounts per ISO 4217 account currency (JPY has 0 decimals, USD 2, VND 0). */
const AMOUNT: Record<string, number> = { JPY: 1_536_000, USD: 10_240, VND: 268_800_000 };

/** CLDR plural selection — never one template for a counted noun ("1 seats" is a bug). */
function seatCount(bundle: LabelBundle) {
  const category = new Intl.PluralRules(bundle.tag).select(SEATS);
  const template = category === "one" ? bundle.seat.one : bundle.seat.other;
  return template.replace("{count}", new Intl.NumberFormat(bundle.tag).format(SEATS));
}

export default function SettingsAccountSectionsShowcase() {
  // One language switch drives BOTH halves of the page: the app-authored bundle above AND the
  // library's own `t()` chrome — the canonical `StatusBadge` label, dialog affordances, empty
  // states. Swapping only the local bundle would leave an English page wearing a Vietnamese
  // status pill, so the switch owns `setLocale` too (`AppLocale` is exactly ja | en | vi).
  const { locale, setLocale } = useAppLocale();
  const lang: "ja" | "en" | "vi" = locale;
  const b = BUNDLES[lang];
  const [digest, setDigest] = React.useState(true);
  const [mention, setMention] = React.useState(false);
  const [dateFormat, setDateFormat] = React.useState("iso");
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const money = new Intl.NumberFormat(b.tag, {
    style: "currency",
    currency: b.currency,
  }).format(AMOUNT[b.currency] ?? 0);
  const longDate = (d: Date) =>
    new Intl.DateTimeFormat(b.tag, { dateStyle: "long", timeZone: "UTC" }).format(d);
  const regionName = new Intl.DisplayNames([b.tag], { type: "region" }).of(b.region) ?? b.region;

  // Date-format options are themselves localized samples, formatted with Intl — never a
  // hand-written "YYYY-MM-DD" string table.
  const sample = new Date("2026-07-30T00:00:00Z");
  const dateFormatOptions = [
    {
      value: "iso",
      label: new Intl.DateTimeFormat("en-CA", { dateStyle: "short", timeZone: "UTC" }).format(
        sample,
      ),
    },
    {
      value: "long",
      label: new Intl.DateTimeFormat(b.tag, { dateStyle: "long", timeZone: "UTC" }).format(sample),
    },
    {
      value: "medium",
      label: new Intl.DateTimeFormat(b.tag, { dateStyle: "medium", timeZone: "UTC" }).format(
        sample,
      ),
    },
  ];

  return (
    <PageContainer
      title={b.pageTitle}
      subtitle={b.pageSubtitle}
      breadcrumb={[{ label: b.pageTitle }]}
      // PageHeader action composition (#216): the header owns the page-level actions through
      // `extra`. It wraps at 390 instead of overflowing, so no page-local header geometry.
      extra={
        <Flex direction="row" align="end" gap="sm" wrap>
          <FormField id="label-language" label={b.labelLanguage}>
            <Select
              id="label-language"
              options={(["ja", "en", "vi"] as const).map((id) => ({
                value: id,
                label: BUNDLES[id].optionLabel,
              }))}
              value={lang}
              onValueChange={(next: string) => {
                setLocale(next as "ja" | "en" | "vi");
              }}
            />
          </FormField>
          <Button>{b.save}</Button>
        </Flex>
      }
    >
      <Flex direction="col" gap="lg" className="max-w-3xl">
        {/* ── 1 · Identity ─────────────────────────────────────────────────────────────────
            Metadata is a description list, so it is `Descriptions` (a real <dl>), never a
            two-column flex of styled divs. `CardAction` parks the single header action. */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>{b.identityTitle}</CardTitle>
            <CardDescription>{b.identityDescription}</CardDescription>
            <CardAction>
              <Button variant="outline" size="sm">
                {b.identityEdit}
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md" className="sm:flex-row sm:items-start">
              <Avatar className="size-12 shrink-0 rounded-md">
                <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                  SF
                </AvatarFallback>
              </Avatar>
              <Descriptions columns={2} layout="vertical" className="min-w-0 flex-1">
                <Descriptions.Item label={b.fieldName}>{b.displayName}</Descriptions.Item>
                <Descriptions.Item label={b.fieldEmail}>{b.email}</Descriptions.Item>
                <Descriptions.Item label={b.fieldEmployeeId} mono>
                  {EMPLOYEE_ID}
                </Descriptions.Item>
                <Descriptions.Item label={b.fieldMemberSince}>
                  {/* ISO-8601 machine value in the <time> datetime, localized text for humans. */}
                  <time dateTime={MEMBER_SINCE.toISOString().slice(0, 10)}>
                    {longDate(MEMBER_SINCE)}
                  </time>
                </Descriptions.Item>
              </Descriptions>
            </Flex>
          </CardContent>
        </Card>

        {/* ── 2 · Preferences ─────────────────────────────────────────────────────────────
            THE settings-row pattern: `CardContent flush` + `ListRow`, whose `trailing` slot IS
            the control. `align="start"` + `overflow="wrap"` keep long JA/VI titles readable and
            let the control drop onto its own line at 390 (--list-row-body-min-width). */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>{b.preferencesTitle}</CardTitle>
            <CardDescription>{b.preferencesDescription}</CardDescription>
          </CardHeader>
          <CardContent flush>
            <ListRow
              align="start"
              overflow="wrap"
              title={<label htmlFor="pref-digest">{b.prefDigestTitle}</label>}
              description={b.prefDigestDescription}
              trailing={<Switch id="pref-digest" checked={digest} onCheckedChange={setDigest} />}
            />
            <ListRow
              align="start"
              overflow="wrap"
              title={<label htmlFor="pref-mention">{b.prefMentionTitle}</label>}
              description={b.prefMentionDescription}
              trailing={<Switch id="pref-mention" checked={mention} onCheckedChange={setMention} />}
            />
            <ListRow
              align="start"
              overflow="wrap"
              title={<label htmlFor="pref-date-format">{b.prefDateFormatTitle}</label>}
              description={b.prefDateFormatDescription}
              trailing={
                <Select
                  id="pref-date-format"
                  options={dateFormatOptions}
                  value={dateFormat}
                  onValueChange={setDateFormat}
                  className="w-[var(--filter-picker-width-sm)]"
                />
              }
            />
          </CardContent>
        </Card>

        {/* ── 3 · Billing handoff ─────────────────────────────────────────────────────────
            The subscription state is a canonical `StatusBadge status="past_due"` — the tone and
            icon come from the shared domain-status map in the library, so no page ever keeps its
            own status→colour table (#216 acceptance). Money/seats/dates/region are all Intl. */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>{b.billingTitle}</CardTitle>
            <CardDescription>{b.billingDescription}</CardDescription>
            <CardAction>
              <StatusBadge status="past_due" variant="outline" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <Descriptions columns={2} layout="vertical">
              <Descriptions.Item label={b.billingPlanLabel}>{b.billingPlanValue}</Descriptions.Item>
              <Descriptions.Item label={b.billingSeatsLabel}>{seatCount(b)}</Descriptions.Item>
              <Descriptions.Item label={b.billingAmountLabel}>{money}</Descriptions.Item>
              <Descriptions.Item label={b.billingNextInvoiceLabel}>
                <time dateTime={NEXT_INVOICE.toISOString().slice(0, 10)}>
                  {longDate(NEXT_INVOICE)}
                </time>
              </Descriptions.Item>
              <Descriptions.Item label={b.billingRegionLabel} span={2}>
                {regionName}
              </Descriptions.Item>
            </Descriptions>
          </CardContent>
          <CardFooter separated>
            <Flex direction="col" gap="xs" className="sm:flex-row sm:items-center sm:gap-4">
              <Button variant="outline" asChild>
                <a href="https://billing.example.com/portal" target="_blank" rel="noreferrer">
                  <ExternalLink aria-hidden="true" />
                  {b.billingHandoff}
                  {/* Never signal "leaves the app" with the icon alone (WCAG 1.4.1 / 2.4.4). */}
                  <span className="sr-only"> ({b.opensInNewTab})</span>
                </a>
              </Button>
              <Text size="xs" tone="muted">
                {b.billingHandoffHint}
              </Text>
            </Flex>
          </CardFooter>
        </Card>

        {/* ── 4 · Danger zone ─────────────────────────────────────────────────────────────
            `Card accent="destructive"` paints the semantic leading rail from `--destructive`
            through the existing `--card-accent-rail-width` token — a danger zone needs NO new
            component and NO new token. Colour never carries the meaning alone: the heading says
            "irreversible", the rows say what is lost, and delete is gated behind a type-to-confirm
            AlertDialog (`challenge`). */}
        <Card accent="destructive">
          <CardHeader>
            <CardTitle level={2} className="text-destructive">
              {b.dangerTitle}
            </CardTitle>
            <CardDescription>{b.dangerDescription}</CardDescription>
          </CardHeader>
          <CardContent flush>
            <ListRow
              align="start"
              overflow="wrap"
              leading={<UserMinus className="text-muted-foreground size-4" aria-hidden="true" />}
              title={b.dangerTransferTitle}
              description={b.dangerTransferDescription}
              trailing={
                <Button variant="outline" size="sm">
                  {b.dangerTransfer}
                </Button>
              }
            />
            <ListRow
              align="start"
              overflow="wrap"
              leading={<ShieldAlert className="text-destructive size-4" aria-hidden="true" />}
              title={b.dangerDeleteTitle}
              description={b.dangerDeleteDescription}
              trailing={
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setConfirmOpen(true);
                  }}
                >
                  {b.dangerDelete}
                </Button>
              }
            />
          </CardContent>
        </Card>
      </Flex>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={b.confirmTitle}
        description={b.confirmDescription}
        challenge={WORKSPACE_SLUG}
        variant="destructive"
        confirmLabel={b.confirmLabel}
        cancelLabel={b.cancelLabel}
        onConfirm={() => {
          setConfirmOpen(false);
        }}
      />
    </PageContainer>
  );
}
