import * as React from "react";
import type { PreviewMeta, PreviewCase } from "../preview-types";
import { PageContainer } from "../../src/components/layout/page-container";
import { PageInset } from "../../src/components/layout/page-inset";
import { Stack } from "../../src/components/layout/stack";
import { Inline } from "../../src/components/layout/inline";
import { Button } from "../../src/components/general/button";
import { DataTable, type ColumnDef } from "../../src/components/data-display/data-table";
import { StatusBadge } from "../../src/components/data-display/status-badge";
import { Badge } from "../../src/components/data-display/badge";
import { KeyValueGrid } from "../../src/components/data-display/key-value-grid";
import { FilterBar, FilterGroup } from "../../src/components/navigation/filter-bar";
import { Input } from "../../src/components/data-entry/input";
import { SearchInput } from "../../src/components/data-entry/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../src/components/data-entry/select";
import type { PageContainerProp } from "../../src/props/components/layout.prop";
import { customerDetail, customers } from "../fixtures/demo-content";

type CustomerRow = (typeof customers)[number];

const customerColumns: ColumnDef<CustomerRow>[] = [
  { key: "name", header: "Khách hàng", sortable: true },
  { key: "email", header: "Email" },
  { key: "channel", header: "Kênh" },
  {
    key: "orders",
    header: "Đơn",
    align: "right",
    width: "w-16",
    render: (row) => <span className="tabular-nums">{row.orders}</span>,
  },
  { key: "lastOrder", header: "Đơn cuối", sortable: true },
  {
    key: "status",
    header: "Trạng thái",
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: "tags",
    header: "Tags",
    render: (row) => (
      <span className="flex flex-wrap gap-1">
        {row.tags.length === 0 ? (
          <span className="text-muted-foreground text-xs">—</span>
        ) : (
          row.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="px-1.5 py-0 text-[10px]">
              {tag}
            </Badge>
          ))
        )}
      </span>
    ),
  },
];

function CrmCustomerListPage() {
  const [selected, setSelected] = React.useState<Set<string>>(new Set(["cust_01k8m2x"]));
  const [sort, setSort] = React.useState<{ key: string; direction: "asc" | "desc" } | undefined>({
    key: "lastOrder",
    direction: "desc",
  });

  return (
    <PageContainer
      variant="flush"
      title="Khách hàng"
      subtitle="1.248 hồ sơ · 89 VIP · Cập nhật 2 phút trước"
      extra={
        <Inline gap="sm">
          <Button variant="outline">Nhập CSV</Button>
          <Button>Thêm khách hàng</Button>
        </Inline>
      }
    >
      <Stack gap="sm">
        <PageInset>
          <FilterBar onClear={() => undefined} hasActiveFilters>
            <FilterGroup label="Tìm kiếm">
              <SearchInput
                defaultValue="Mai"
                placeholder="Tên, email, SĐT, mã khách…"
                onSearch={() => undefined}
                ariaLabel="Tìm khách hàng"
              />
            </FilterGroup>
            <FilterGroup label="Kênh">
              <Select defaultValue="website">
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả kênh</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="line">Line</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </FilterGroup>
            <FilterGroup label="Trạng thái">
              <Select defaultValue="active">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </FilterGroup>
            <FilterGroup label="Tag">
              <Input defaultValue="VIP" placeholder="VIP, Wholesale…" className="w-28" />
            </FilterGroup>
          </FilterBar>
        </PageInset>

        <DataTable
          data={[...customers]}
          columns={customerColumns}
          getRowId={(row) => row.id}
          selectable
          selected={selected}
          onSelectChange={setSelected}
          sort={sort}
          onSortChange={setSort}
          onRowClick={() => undefined}
        >
          <DataTable.Toolbar>
            <DataTable.BulkActions>
              <Button variant="outline" size="sm">
                Gán tag VIP
              </Button>
              <Button variant="outline" size="sm">
                Gửi email hàng loạt
              </Button>
              <Button variant="destructive" size="sm">
                Archive ({selected.size})
              </Button>
            </DataTable.BulkActions>
            <DataTable.DensityToggle />
          </DataTable.Toolbar>
          <DataTable.Content />
          <DataTable.Pagination cursor="cursor_cust_page2" hasMore onChange={() => undefined} />
        </DataTable>
      </Stack>
    </PageContainer>
  );
}

const meta: PreviewMeta<PageContainerProp> = {
  title: "Layout/PageContainer",
  component: PageContainer,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          'Shell bắt buộc cho mọi trang admin. `variant="flush"` + `<PageInset>` + `<DataTable>` là pattern chuẩn cho trang danh sách.',
      },
    },
  },
  argTypes: {
    density: { control: "select", options: ["compact", "default", "comfortable"] },
    variant: {
      control: "select",
      options: ["default", "narrow", "flush", "ghost"],
    },
    stickyFooter: { control: "boolean" },
  },
};

export default meta;
type Story = PreviewCase<PageContainerProp>;

export const CustomerList: Story = {
  name: "Danh sách CRM (flush)",
  render: () => <CrmCustomerListPage />,
};

export const CustomerDetail: Story = {
  name: "Chi tiết khách hàng",
  args: {
    title: customerDetail.name,
    subtitle: `${customerDetail.email} · ${customerDetail.phone}`,
    breadcrumb: [
      { label: "CRM", to: "/crm" },
      { label: "Khách hàng", to: "/crm/customers" },
      { label: customerDetail.name },
    ],
    extra: (
      <Inline gap="sm">
        <Button variant="outline">Gửi email</Button>
        <Button variant="outline">Lịch sử đơn hàng</Button>
        <Button>Chỉnh sửa hồ sơ</Button>
      </Inline>
    ),
    children: (
      <Stack gap="lg">
        <Inline gap="sm">
          <StatusBadge status="active" />
          <Badge variant="secondary">VIP</Badge>
          <Badge variant="outline">Wholesale</Badge>
        </Inline>
        <KeyValueGrid columns={2}>
          <KeyValueGrid.Item label="Mã khách hàng" mono>
            {customerDetail.id}
          </KeyValueGrid.Item>
          <KeyValueGrid.Item label="Thành viên từ">{customerDetail.memberSince}</KeyValueGrid.Item>
          <KeyValueGrid.Item label="Tổng chi tiêu">{customerDetail.totalSpent}</KeyValueGrid.Item>
          <KeyValueGrid.Item label="Đơn đang mở">{customerDetail.openOrders} đơn</KeyValueGrid.Item>
          <KeyValueGrid.Item label="ID liên hệ" mono>
            {customerDetail.zaloId}
          </KeyValueGrid.Item>
          <KeyValueGrid.Item label="Địa chỉ giao hàng">{customerDetail.address}</KeyValueGrid.Item>
          <KeyValueGrid.Item label="Ghi chú nội bộ" span={2}>
            {customerDetail.note}
          </KeyValueGrid.Item>
        </KeyValueGrid>
      </Stack>
    ),
  },
};

export const EditFormWithFooter: Story = {
  name: "Form chỉnh sửa (narrow + stickyFooter)",
  args: {
    variant: "narrow",
    stickyFooter: true,
    title: "Chỉnh sửa thông tin đơn hàng",
    subtitle: "ORD-2026-8842 · Osaka → HCM",
    breadcrumb: [
      { label: "Đơn hàng", to: "/orders" },
      { label: "Danh sách", to: "/orders/list" },
      { label: "ORD-2026-8842", to: "/orders/8842" },
      { label: "Chỉnh sửa" },
    ],
    footer: (
      <Inline gap="sm" className="ml-auto">
        <Button variant="ghost">Hủy — quay lại chi tiết</Button>
        <Button variant="outline">Lưu nháp</Button>
        <Button>Lưu & gửi thông báo khách</Button>
      </Inline>
    ),
    children: (
      <Stack gap="sm" className="text-muted-foreground max-w-xl text-sm">
        <p>Form gồm: địa chỉ nhận, số điện thoại, ghi chú nội bộ, tùy chọn vận chuyển…</p>
        <p>
          Sau khi lưu, hệ thống publish event <code className="text-xs">order.updated</code> qua
          outbox.
        </p>
        <p className="text-muted-foreground/80">
          Footer dính đáy viewport khi scroll — kết hợp{" "}
          <code className="text-xs">variant=&quot;narrow&quot;</code> +{" "}
          <code className="text-xs">stickyFooter</code>.
        </p>
      </Stack>
    ),
  },
};

export const SettingsForm: Story = {
  name: "Cài đặt (narrow)",
  args: {
    variant: "narrow",
    title: "Thông báo email",
    subtitle: "Cấu hình template gửi khách khi đơn hàng cập nhật trạng thái",
    breadcrumb: [
      { label: "Cài đặt", to: "/settings" },
      { label: "Thông báo", to: "/settings/notifications" },
      { label: "Email" },
    ],
    extra: <Button>Lưu</Button>,
    children: (
      <Stack gap="md" className="text-muted-foreground text-sm">
        <p>Body giới hạn ~42rem — phù hợp form field, toggle, textarea.</p>
        <div className="rounded-md border border-dashed p-4 text-xs">[ FormField × N ]</div>
      </Stack>
    ),
  },
};

export const DashboardGhost: Story = {
  name: "Dashboard (ghost)",
  args: {
    variant: "ghost",
    title: "Ops hôm nay",
    subtitle: "Chi nhánh Osaka · Cut-off 11:00 JST",
    extra: <Button variant="outline">Xuất báo cáo</Button>,
    children: (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {["Lô đơn chờ", "Đơn giữ xét duyệt", "SLA &lt; 4h"].map((label) => (
          <div key={label} className="bg-card rounded-lg border p-4 text-sm">
            <p className="font-medium">{label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">128</p>
          </div>
        ))}
      </div>
    ),
  },
};

export const DefaultShell: Story = {
  name: "Default",
  args: {
    variant: "default",
    title: "Audit log",
    subtitle: "Sự kiện identity · platform · media",
    children: (
      <p className="text-muted-foreground text-sm">
        Shell mặc định — padding đều, header có border-bottom. Dùng cho detail page hoặc mixed
        content.
      </p>
    ),
  },
};

export const CompactDensity: Story = {
  name: "Compact — màn hình ops",
  args: {
    density: "compact",
    title: "Lô đơn xuất kho Osaka #0524-AM",
    subtitle: "47 đơn hàng · 128.4 kg · Cut-off 11:00 JST",
    extra: <Button size="sm">In danh sách lô</Button>,
    children: (
      <p className="text-muted-foreground text-sm">
        Density compact dùng cho màn hình ops cần hiển thị nhiều dòng trên một viewport.
      </p>
    ),
  },
};
