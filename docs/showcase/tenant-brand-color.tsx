/**
 * Showcase · tenant-brand-color — "Màu thương hiệu của KHÁCH, ở một vùng, lúc chạy" (gh#861, gh#868).
 *
 * ── Gate 0 verdict: COMPOSITION PATTERN ──────────────────────────────────────────────────────
 * Hai kho tiêu thụ xin một `<TenantTheme primary={hex}>`. Chạy Framework-Component Test
 * (docs/COMPOSITION-VS-COMPONENT.md §3.2) thì nó TRƯỢT: bọc `<div>` không giữ state, không bàn
 * phím, không focus, không ARIA (C2); nó đúng là "token override theo scope" mà chính doctrine
 * chỉ định làm composition (C3); API `primary`/`secondary`/`tenant` không map vào
 * `value`/`onValueChange`/`size` nào (C4); và nó không render chữ nào để `t()` hay APG nói về
 * (C6). Thứ hai consumer thật sự chép tay là PHÉP TÍNH — hex → triplet HSL, và quy tắc tương phản
 * chọn màu chữ. Phép tính ấy ship trong gói (`tenantTheme`, `@godxjp/ui/app`); cái `<div>` ở lại
 * trang này. Không component mới, không token mới.
 *
 * ── Trang này chứng minh bốn thứ, mỗi thứ đo được trên màn hình ──────────────────────────────
 *   1. PHẠM VI. Cùng một hàng component, một bản TRONG vùng `[data-tenant]` và một bản NGOÀI.
 *      Chỉ bản trong đổi màu. Không đụng `<html>`, không stylesheet thứ hai.
 *   2. CẶP MÀU. `--primary` không đi một mình: `--primary-foreground` đi kèm, chọn bằng tương
 *      phản WCAG 2.2 SC 1.4.3 (4.5:1), và tỷ số đạt được HIỆN trên màn hình chứ không giấu.
 *   3. HOVER / ACTIVE KHÔNG IM LẶNG. `tenantTheme` phát hai bước ấy thành TRIPLET THẬT, không
 *      phải `initial` + relative colour, nên màu khách áp ở mọi trạng thái trên mọi engine —
 *      không cần `CSS.supports("color", "hsl(from red h s l)")` như bản tự chế của một kho tiêu thụ.
 *   4. CA ĐÃ CHẠY, KHÔNG PHẢI HAPPY PATH. Bốn hàng cuối là hex không hợp lệ (vùng trở về theme
 *      của app, trang không vỡ), một cặp do máy chủ cấp KHÔNG đạt AA (API nói KHÔNG, kèm số), và
 *      hai màu khách hay chọn nhất mà quy tắc ngây thơ "luôn chữ trắng" sẽ hỏng.
 *
 * ── Điều trang này CỐ TÌNH không làm ─────────────────────────────────────────────────────────
 * Không đụng `--text-link` / `--text-brand` / `--text-primary`. Đó là MỰC trên nền trang, không
 * phải nhãn trên nền nút: độ đọc của nó phụ thuộc `--background` — thứ màu của khách không quyết
 * định — và hướng bước là theo THEME chứ không theo nhãn. Một seed nhạt (#FFD400) cho link 1.4:1
 * trên nền trắng. Xem hàng "mực thương hiệu" trong bảng.
 */
import * as React from "react";

import { AA_NORMAL_TEXT, tenantTheme } from "@godxjp/ui/app";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CodeBlock,
  DataTable,
  Progress,
  Swatch,
  type ColumnDef,
} from "@godxjp/ui/data-display";
import { ColorPicker, FormField, Input, Switch } from "@godxjp/ui/data-entry";
import { Callout } from "@godxjp/ui/feedback";

/** Màu thật của khách — hai đầu mút là chỗ quy tắc "luôn chữ trắng" hỏng. */
const CUSTOMERS = [
  { hex: "#0071bd", name: "Biển Đông Logistics" },
  { hex: "#FFD400", name: "Vàng Mặt Trời" },
  { hex: "#0A1F44", name: "Hàng hải Bắc Hà" },
  { hex: "#00A86B", name: "Ngọc Bích Foods" },
  { hex: "#E30613", name: "Đỏ Sao Vàng" },
  { hex: "#767676", name: "Xám Trung Tính" },
] as const;

type Row = {
  hex: string;
  name: string;
  foreground: string;
  ratio: string;
  meetsAA: boolean;
};

const columns: ColumnDef<Row>[] = [
  {
    key: "hex",
    header: "Màu khách",
    render: (r) => (
      <Flex align="center" gap="sm">
        <Swatch color={r.hex} aria-label={`Màu chính của ${r.name}: ${r.hex}`} />
        <Text as="span" size="xs" mono>
          {r.hex}
        </Text>
      </Flex>
    ),
  },
  { key: "name", header: "Khách", hiddenOnMobile: true },
  {
    key: "foreground",
    header: "Màu chữ đã chọn",
    render: (r) => (
      <Flex align="center" gap="sm">
        <Swatch color={r.foreground} aria-label={`Màu chữ an toàn: ${r.foreground}`} />
        <Text as="span" size="xs" mono>
          {r.foreground}
        </Text>
      </Flex>
    ),
  },
  {
    key: "ratio",
    header: "Tương phản",
    align: "right",
    render: (r) => <Text tabular>{r.ratio}:1</Text>,
  },
  {
    key: "meetsAA",
    header: "WCAG 2.2 AA",
    align: "center",
    render: (r) => (
      <Badge tone={r.meetsAA ? "success" : "destructive"}>{r.meetsAA ? "Đạt" : "Không đạt"}</Badge>
    ),
  },
];

/**
 * Một hàng component THẬT đọc `--primary`. Dùng hai lần trên trang: một lần trong vùng khách,
 * một lần ngoài — cùng markup, khác đúng một `style` của thẻ cha.
 */
function BrandedRow({ idPrefix }: { idPrefix: string }) {
  return (
    <Flex direction="col" gap="md">
      <Flex direction="row" gap="sm" wrap align="center">
        <Button type="button">Mở ứng dụng</Button>
        <Button type="button" variant="outline">
          Chi tiết
        </Button>
        <Badge tone="info">12 dịch vụ</Badge>
        <Switch id={`${idPrefix}-switch`} defaultChecked aria-label="Bật thông báo" />
      </Flex>
      <FormField id={`${idPrefix}-input`} label="Mã tra cứu" helper="Bấm vào ô để thấy vòng focus">
        <Input id={`${idPrefix}-input`} defaultValue="GDX-1042" />
      </FormField>
      <Progress value={62} label="Hạn mức đã dùng" />
    </Flex>
  );
}

export default function Demo() {
  const [hex, setHex] = React.useState("#0071bd");
  const [serverForeground, setServerForeground] = React.useState(false);

  // Cặp do máy chủ cấp — Platform lưu sẵn ở `brands.theme_tokens`. #3b82f6 trên #0071bd chỉ đạt
  // 2.02:1: một cặp THẬT có thể sai, và API phải nói ra chứ không lặng lẽ trả về trắng.
  const seed = tenantTheme(hex, { foreground: serverForeground ? "#3b82f6" : null });
  const invalid = tenantTheme("#nope00");

  const rows: Row[] = CUSTOMERS.map((customer) => {
    const computed = tenantTheme(customer.hex);
    return {
      hex: customer.hex,
      name: customer.name,
      foreground: computed.foreground ?? "—",
      ratio: computed.contrast.toFixed(2),
      meetsAA: computed.meetsAA,
    };
  });

  const declarations = Object.entries(seed.vars)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n");

  return (
    <PageContainer
      title="Màu thương hiệu của khách · một vùng, lúc chạy"
      subtitle="tenantTheme(hex) → khai báo token cho MỘT vùng. Cặp màu chữ chọn bằng WCAG 2.2 SC 1.4.3; hover/pressed là triplet thật nên không im lặng trên engine thiếu relative colour."
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>Màu khách chọn</CardTitle>
            <CardDescription>
              Hex — đúng thứ `ColorPicker` trả về và đúng thứ mọi kho tiêu thụ lưu. Ba hoặc sáu chữ
              số; giá trị hỏng bị bỏ qua chứ không làm vỡ trang.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <FormField id="tenant-hex" label="Màu chính của khách">
                <ColorPicker id="tenant-hex" value={hex} onValueChange={setHex} />
              </FormField>
              <Flex direction="row" gap="sm" wrap>
                {CUSTOMERS.map((customer) => (
                  <Button
                    key={customer.hex}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setHex(customer.hex)}
                  >
                    {customer.name}
                  </Button>
                ))}
              </Flex>
              <Flex direction="row" gap="md" align="center" wrap>
                <Swatch color={seed.primary ?? "#ffffff"} aria-label={`Màu nền: ${seed.primary}`} />
                <Swatch
                  color={seed.foreground ?? "#000000"}
                  aria-label={`Màu chữ: ${seed.foreground}`}
                />
                <Text as="span" size="sm">
                  Tương phản đo được{" "}
                  <Text as="strong" weight="medium" tabular>
                    {seed.contrast.toFixed(2)}:1
                  </Text>{" "}
                  (ngưỡng AA {AA_NORMAL_TEXT}:1)
                </Text>
                <Badge tone={seed.meetsAA ? "success" : "destructive"}>
                  {seed.meetsAA ? "Đạt WCAG 2.2 AA" : "KHÔNG đạt WCAG 2.2 AA"}
                </Badge>
              </Flex>
              <Flex direction="row" gap="sm" align="center">
                <Switch
                  id="server-foreground"
                  checked={serverForeground}
                  onCheckedChange={setServerForeground}
                />
                <Text as="label" size="sm" htmlFor="server-foreground">
                  Dùng cặp do máy chủ cấp (#3b82f6) — một cặp THẬT nhưng dưới ngưỡng
                </Text>
              </Flex>
              {!seed.meetsAA ? (
                <Callout kind="warning">
                  <Callout.Title>API nói KHÔNG, kèm số</Callout.Title>
                  <Callout.Description>
                    Cặp được cấp đo {seed.contrast.toFixed(2)}:1 trên {seed.primary} — dưới 4.5:1
                    của WCAG 2.2 SC 1.4.3. Gói KHÔNG lặng lẽ đổi sang trắng: nó giữ đúng cặp bạn
                    cấp, trả `meetsAA: false`, và cảnh báo ở bản dev. Bỏ trống `foreground` để gói
                    tự chọn màu chữ an toàn.
                  </Callout.Description>
                </Callout>
              ) : null}
            </Flex>
          </CardContent>
        </Card>

        <ResponsiveGrid columns={2}>
          {/* TRONG vùng — đúng một thẻ cha mang data-tenant + style */}
          <Card data-tenant="customer" style={seed.vars}>
            <CardHeader>
              <CardTitle level={2}>Trong vùng của khách</CardTitle>
              <CardDescription>
                `&lt;div data-tenant="…" style=&#123;tenantTheme(hex).vars&#125;&gt;`. Rê chuột và
                giữ chuột trên nút. Hover và pressed đi theo màu khách, không phải xanh mặc định.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BrandedRow idPrefix="inside" />
            </CardContent>
          </Card>

          {/* NGOÀI vùng — cùng markup, không style */}
          <Card>
            <CardHeader>
              <CardTitle level={2}>Ngoài vùng</CardTitle>
              <CardDescription>
                Cùng một hàng component, không thẻ cha nào mang khai báo. Vẫn là theme của ứng dụng
                — đây là bằng chứng phạm vi, không phải ảnh chụp thứ hai.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BrandedRow idPrefix="outside" />
            </CardContent>
          </Card>
        </ResponsiveGrid>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Khai báo mà vùng đang mang</CardTitle>
            <CardDescription>
              Năm dòng, không hơn. `--ring` có mặt vì `derived.css` khai `--ring: var(--primary)` ở
              `:root`, nơi var() thay thế MỘT LẦN. Một scope dưới `&lt;html&gt;` thừa kế vòng focus
              của root nếu không khai lại (docs/TOKENS.md · freeze rule).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock language="css" wrap={false}>
              {`[data-tenant="customer"] {\n${declarations}\n}`}
            </CodeBlock>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Bảng tương phản · màu khách thật</CardTitle>
            <CardDescription>
              Màu chữ được chọn bằng độ chói tương đối của WCAG, không phải hằng số. Hai hàng đáng
              nhìn nhất: #FFD400 nhận chữ ĐEN (quy tắc "luôn trắng" chỉ đạt 1.29:1) và #0A1F44 nhận
              chữ TRẮNG (quy tắc "luôn đen" chỉ đạt 1.29:1).
            </CardDescription>
          </CardHeader>
          <CardContent flush>
            <DataTable
              columns={columns}
              data={rows}
              getRowId={(row) => row.hex}
              label="Bảng tương phản màu khách"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Ca đã chạy: hex không hợp lệ</CardTitle>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Text as="p" size="sm" tone="muted">
                `tenantTheme("#nope00")` trả `vars` RỖNG ({Object.keys(invalid.vars).length} khai
                báo), nên vùng dưới đây giữ nguyên theme của ứng dụng thay vì vỡ. Cùng hợp đồng
                `ColorPicker` đã có: hex hỏng bị bỏ qua, không ném lỗi.
              </Text>
              <div data-tenant="broken" style={invalid.vars}>
                <BrandedRow idPrefix="broken" />
              </div>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Mực thương hiệu · thứ gói KHÔNG tự động đổi</CardTitle>
          </CardHeader>
          <CardContent>
            <Callout kind="important">
              <Callout.Title>
                `--text-link` / `--text-brand` / `--text-primary` là việc của bạn
              </Callout.Title>
              <Callout.Description>
                Chúng là mực trên NỀN TRANG, không phải nhãn trên nền nút, nên độ đọc phụ thuộc
                `--background` — thứ màu của khách không quyết định. Một seed nhạt như #FFD400 cho
                link ~1.4:1 trên nền trắng. `tenantTheme` để yên ba vai đó; nếu bạn muốn link mang
                màu thương hiệu, hãy tự đặt chúng SAU KHI đo bằng `contrastRatio()`.
              </Callout.Description>
            </Callout>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
