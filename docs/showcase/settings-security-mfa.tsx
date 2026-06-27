/**
 * Showcase · case5 — Security / two-factor settings (Bảo mật · Xác thực hai lớp)
 *
 * The CORRECT build of the screen that keeps getting hand-rolled wrong. Every defect from the
 * freelanced version is fixed here by following rules that ALREADY exist in the godx-ui MCP:
 *
 *   ✗ wrong (hand-rolled)                        ✓ here (rule)
 *   ─────────────────────────────────────────────────────────────────────────────────────────
 *   factor row = a centered <div> with the       ListRow — leading icon · title/description ·
 *     title duplicated as its own description       trailing action (no redundant copy)   (#113)
 *   "Xoá" rendered as plain black text            destructive-toned ghost button — delete is a
 *                                                    destructive action, color carries intent
 *   every action a full-width stacked bar         right-aligned, auto-width actions; ONE primary
 *     (rule 217 explicitly forbids this)             per card, secondary = outline      (rule 217)
 *   📱 / ✉️ emoji as "icons"                       lucide icons (no emoji in product UI) (anti-tell)
 *   brand glyph = a styled <span> (size/radius    Avatar primitive — real brand mark      (#116)
 *     baked as literals)
 *
 * Built ENTIRELY from real @godxjp/ui primitives. dxs-kintai DNA: small headings, 14/1.7 body,
 * one --primary action, 1px-border surfaces, no resting shadow, quiet factual copy, no emoji.
 */
import { KeyRound, Mail, ShieldCheck, Smartphone } from "lucide-react";

import { Button, Text } from "@godxjp/ui/general";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  ListRow,
} from "@godxjp/ui/data-display";
import { Flex, PageContainer } from "@godxjp/ui/layout";

// A row-level delete is destructive but low-emphasis — a ghost button toned destructive (color
// carries the intent without a heavy solid-red fill). This is the canonical "delete in a list" action.
function DeleteAction({ label }: { label: string }) {
  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
    >
      {label}
    </Button>
  );
}

export default function SecurityMfaShowcase() {
  return (
    <PageContainer title="Bảo mật" subtitle="Quản lý mật khẩu, xác thực 2 lớp và passkey.">
      <Flex direction="col" gap="lg" className="max-w-3xl">
        {/* Account identity — the brand mark is an Avatar primitive, not a styled span. */}
        <Flex direction="row" align="center" gap="sm">
          <Avatar className="rounded-md">
            <AvatarFallback className="bg-primary text-primary-foreground font-bold">
              T
            </AvatarFallback>
          </Avatar>
          <Flex direction="col" gap="xs">
            <Text weight="medium">Tài khoản godx</Text>
            <Text size="xs" tone="muted">
              tu-phuc-vu@famgia.com
            </Text>
          </Flex>
        </Flex>

        {/* Two-factor authentication. Enrolled factors are ListRows; add/manage actions live in the
         *  trailing slot per row — NOT a stack of full-width bars. */}
        <Card>
          <CardHeader>
            <CardTitle>Xác thực hai lớp</CardTitle>
            <CardDescription>Yêu cầu xác minh thêm khi đăng nhập.</CardDescription>
          </CardHeader>
          <CardContent flush>
            <ListRow
              leading={<Mail aria-hidden="true" className="size-4" />}
              title="OTP qua email"
              description="Gửi mã tới t•••@famgia.com"
              trailing={
                <>
                  <Badge tone="success" icon={null}>
                    Đã bật
                  </Badge>
                  <DeleteAction label="Xoá" />
                </>
              }
            />
            <ListRow
              leading={<Smartphone aria-hidden="true" className="size-4" />}
              title="Ứng dụng xác thực"
              description="Chưa thiết lập"
              trailing={
                <Button size="sm" variant="outline">
                  Thiết lập
                </Button>
              }
            />
            <ListRow
              leading={<KeyRound aria-hidden="true" className="size-4" />}
              title="Passkey"
              description="1 thiết bị · MacBook Pro"
              trailing={
                <Button size="sm" variant="ghost">
                  Quản lý
                </Button>
              }
            />
          </CardContent>
        </Card>

        {/* Recovery codes — a card whose single action sits in a right-aligned footer (rule 217:
         *  primary rightmost, never a centered/full-width bar). */}
        <Card>
          <CardHeader>
            <CardTitle>Mã khôi phục</CardTitle>
            <CardDescription>
              Dùng khi bạn không truy cập được thiết bị xác thực. Còn lại 8 mã chưa dùng.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" align="center" gap="sm">
              <ShieldCheck aria-hidden="true" className="text-success size-4" />
              <Text size="sm" tone="muted">
                Đã tạo ngày 12/03/2026
              </Text>
            </Flex>
          </CardContent>
          <CardFooter separated className="justify-end gap-2">
            <Button variant="ghost" size="sm">
              Tải xuống
            </Button>
            <Button variant="outline" size="sm">
              Tạo lại mã
            </Button>
          </CardFooter>
        </Card>
      </Flex>
    </PageContainer>
  );
}
