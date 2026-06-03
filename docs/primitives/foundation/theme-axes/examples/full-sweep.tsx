import { Button } from "@godxjp/ui/general";
import {
  Input,
  Textarea,
  Switch,
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Calendar,
  TimePicker,
  DatePicker,
} from "@godxjp/ui/data-entry";
import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@godxjp/ui/data-display";
import { SkeletonCard, SkeletonTable } from "@godxjp/ui/feedback";
import { Inline, Stack } from "@godxjp/ui/layout";
import { Pagination, Steps, Tabs, TabsList, TabsTrigger } from "@godxjp/ui/navigation";

export default function Demo() {
  return (
    <Stack gap="lg" className="max-w-2xl">
      <p className="text-muted-foreground text-sm">
        Đổi theme để kiểm tra toàn bộ token — không còn hardcode{" "}
        <code className="text-xs">h-9</code> / <code className="text-xs">bg-green-*</code>.
      </p>

      <Stack gap="sm">
        <h3 className="text-sm font-semibold">Actions & form</h3>
        <Inline gap="sm" className="flex-wrap">
          <Button>Tạo đơn hàng</Button>
          <Button variant="outline">Xuất CSV</Button>
          <Button variant="ghost">Hủy</Button>
          <Button variant="link">Chi tiết</Button>
        </Inline>
        <Input defaultValue="REF-00991" aria-label="Order Ref" />
        <Textarea defaultValue="Ghi chú nội bộ" aria-label="Notes" />
        <Select defaultValue="hcm">
          <SelectTrigger aria-label="Location">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hcm">Chi nhánh HCM</SelectItem>
            <SelectItem value="tyo">Chi nhánh Tokyo</SelectItem>
          </SelectContent>
        </Select>
        <Inline gap="md" className="flex-wrap items-end">
          <DatePicker value={new Date(2026, 4, 1)} onValueChange={() => undefined} />
          <TimePicker defaultValue="14:30" />
        </Inline>
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm">Thông báo khách hàng</span>
          <Switch defaultChecked aria-label="Customer notify" />
        </div>
        <label htmlFor="theme-axes-confirm" className="flex items-center gap-2 text-sm">
          <Checkbox id="theme-axes-confirm" defaultChecked />
          Xác nhận đơn hàng
        </label>
        <Slider defaultValue={[40]} max={100} step={1} aria-label="Priority" />
      </Stack>

      <Stack gap="sm">
        <h3 className="text-sm font-semibold">Pickers & navigation</h3>
        <Calendar mode="single" selected={new Date(2026, 4, 1)} />
        <Tabs defaultValue="export">
          <TabsList>
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>
        </Tabs>
        <Tabs
          variant="line"
          defaultValue="line-a"
          items={[
            { value: "line-a", label: "Line tabs", content: null },
            { value: "line-b", label: "Secondary", content: null },
          ]}
        />
        <Steps
          current={1}
          items={[{ title: "Draft" }, { title: "Review" }, { title: "Fulfilled" }]}
        />
        <Pagination current={2} total={160} pageSize={20} onValueChange={() => undefined} />
      </Stack>

      <Stack gap="sm">
        <h3 className="text-sm font-semibold">Display & status</h3>
        <Inline gap="sm" className="flex-wrap">
          <Badge>Batch #0524</Badge>
          <Badge variant="secondary">VIP</Badge>
          <Badge tone="success">Fulfilled</Badge>
          <Badge variant="outline">Draft</Badge>
        </Inline>
        <Inline gap="sm" className="flex-wrap">
          <Badge status="active" />
          <Badge status="pending" />
          <Badge status="failed" />
          <Badge status="scheduled" />
        </Inline>
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Ref</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-sm">REF-00991</TableCell>
                <TableCell className="text-sm">Chi nhánh HCM</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <SkeletonTable rows={3} columns={3} />
        <SkeletonCard />
      </Stack>
    </Stack>
  );
}
