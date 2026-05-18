import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";
import { List } from "../../components/data-display/List";
import { Avatar } from "../../components/data-display/Avatar";
import { Button } from "../../components/general/Button";
import { Tag } from "../../components/data-display/Tag";

/**
 * Data Display/List — header + items + footer surface.
 *
 * Data-driven (`dataSource` + `renderItem`). Grid mode via `cols`.
 */

const meta: Meta<typeof List> = {
  title: "Data Display/List",
  component: List,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof List>;

interface Employee {
  id: string;
  name: string;
  role: string;
  status: "active" | "leave" | "remote";
}

const EMPLOYEES: Employee[] = [
  { id: "1", name: "佐藤 健一", role: "プロダクトマネージャー", status: "active" },
  { id: "2", name: "山田 美咲", role: "シニアエンジニア", status: "remote" },
  { id: "3", name: "鈴木 大輔", role: "デザイナー", status: "active" },
  { id: "4", name: "高橋 結衣", role: "QAエンジニア", status: "leave" },
  { id: "5", name: "田中 一郎", role: "テックリード", status: "active" },
];

const STATUS_COLOR: Record<Employee["status"], string> = {
  active: "success",
  remote: "info",
  leave: "warning",
};

const STATUS_LABEL: Record<Employee["status"], string> = {
  active: "勤務中",
  remote: "リモート",
  leave: "休暇中",
};

const EmployeeRow = ({
  avatar,
  title,
  description,
  extra,
  actions,
}: {
  avatar?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  extra?: ReactNode;
  actions?: ReactNode[];
}) => (
  <>
    {avatar !== undefined && <div className="list-item-avatar">{avatar}</div>}
    <div className="list-item-meta">
      <div className="list-item-title">{title}</div>
      {description !== undefined && <div className="list-item-desc">{description}</div>}
    </div>
    {extra !== undefined && <div className="list-item-extra">{extra}</div>}
    {actions && (
      <div className="list-item-actions">
        {actions.map((action, index) => (
          <span key={index} className="list-item-action">
            {action}
          </span>
        ))}
      </div>
    )}
  </>
);

export const Default: Story = {
  parameters: {
    docs: {
      source: {
        language: "tsx",
        code: `import type { ReactNode } from "react";
import { Avatar, List, Tag } from "@godxjp/ui";

interface Employee {
  id: string;
  name: string;
  role: string;
  status: "active" | "leave" | "remote";
}

const employees: Employee[] = [
  { id: "1", name: "佐藤 健一", role: "プロダクトマネージャー", status: "active" },
  { id: "2", name: "山田 美咲", role: "シニアエンジニア", status: "remote" },
  { id: "3", name: "鈴木 大輔", role: "デザイナー", status: "active" },
  { id: "4", name: "高橋 結衣", role: "QAエンジニア", status: "leave" },
  { id: "5", name: "田中 一郎", role: "テックリード", status: "active" },
];

const statusColor: Record<Employee["status"], string> = {
  active: "success",
  remote: "info",
  leave: "warning",
};

const statusLabel: Record<Employee["status"], string> = {
  active: "勤務中",
  remote: "リモート",
  leave: "休暇中",
};

function EmployeeRow({
  avatar,
  title,
  description,
  extra,
}: {
  avatar?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  extra?: ReactNode;
}) {
  return (
    <>
      {avatar !== undefined && <div className="list-item-avatar">{avatar}</div>}
      <div className="list-item-meta">
        <div className="list-item-title">{title}</div>
        {description !== undefined && <div className="list-item-desc">{description}</div>}
      </div>
      {extra !== undefined && <div className="list-item-extra">{extra}</div>}
    </>
  );
}

export function EmployeeList() {
  return (
    <div style={{ maxWidth: 720 }}>
      <List
        title="社員一覧"
        dataSource={employees}
        renderItem={(employee) => (
          <EmployeeRow
            avatar={<Avatar>{employee.name.charAt(0)}</Avatar>}
            title={employee.name}
            description={employee.role}
            extra={
              <Tag color={statusColor[employee.status] as never}>
                {statusLabel[employee.status]}
              </Tag>
            }
          />
        )}
      />
    </div>
  );
}`,
      },
    },
  },
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <List
        title="社員一覧"
        dataSource={EMPLOYEES}
        renderItem={(emp) => (
          <EmployeeRow
            avatar={<Avatar>{emp.name.charAt(0)}</Avatar>}
            title={emp.name}
            description={emp.role}
            extra={<Tag color={STATUS_COLOR[emp.status] as never}>{STATUS_LABEL[emp.status]}</Tag>}
          />
        )}
      />
    </div>
  ),
};

export const Bordered: Story = {
  parameters: {
    docs: {
      source: {
        language: "tsx",
        code: `import type { ReactNode } from "react";
import { Avatar, Button, List } from "@godxjp/ui";

interface Employee {
  id: string;
  name: string;
  role: string;
  status: "active" | "leave" | "remote";
}

const employees: Employee[] = [
  { id: "1", name: "佐藤 健一", role: "プロダクトマネージャー", status: "active" },
  { id: "2", name: "山田 美咲", role: "シニアエンジニア", status: "remote" },
  { id: "3", name: "鈴木 大輔", role: "デザイナー", status: "active" },
  { id: "4", name: "高橋 結衣", role: "QAエンジニア", status: "leave" },
];

function EmployeeRow({
  avatar,
  title,
  description,
  actions,
}: {
  avatar?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode[];
}) {
  return (
    <>
      {avatar !== undefined && <div className="list-item-avatar">{avatar}</div>}
      <div className="list-item-meta">
        <div className="list-item-title">{title}</div>
        {description !== undefined && <div className="list-item-desc">{description}</div>}
      </div>
      {actions && (
        <div className="list-item-actions">
          {actions.map((action, index) => (
            <span key={index} className="list-item-action">
              {action}
            </span>
          ))}
        </div>
      )}
    </>
  );
}

export function BorderedEmployeeList() {
  return (
    <div style={{ maxWidth: 720 }}>
      <List
        bordered
        header="今週の出勤予定"
        dataSource={employees}
        renderItem={(employee) => (
          <EmployeeRow
            avatar={<Avatar>{employee.name.charAt(0)}</Avatar>}
            title={employee.name}
            description={employee.role}
            actions={[
              <Button key="view" size="small" variant="ghost">
                詳細
              </Button>,
            ]}
          />
        )}
      />
    </div>
  );
}`,
      },
    },
  },
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <List
        bordered
        header="今週の出勤予定"
        dataSource={EMPLOYEES.slice(0, 4)}
        renderItem={(emp) => (
          <EmployeeRow
            avatar={<Avatar>{emp.name.charAt(0)}</Avatar>}
            title={emp.name}
            description={emp.role}
            actions={[<Button key="view" size="small" variant="ghost">詳細</Button>]}
          />
        )}
      />
    </div>
  ),
};

interface Product {
  id: string;
  name: string;
  price: string;
  sku: string;
}

const PRODUCTS: Product[] = [
  { id: "p1", name: "和紙ノート 五冊", price: "¥3,200", sku: "WP-5001" },
  { id: "p2", name: "万年筆 蒔絵", price: "¥18,000", sku: "MW-2104" },
  { id: "p3", name: "錫の名刺入れ", price: "¥9,800", sku: "SZ-3300" },
  { id: "p4", name: "桐の文箱", price: "¥12,400", sku: "KR-7820" },
  { id: "p5", name: "藍染ハンカチ", price: "¥2,400", sku: "AI-1102" },
  { id: "p6", name: "竹の名札", price: "¥1,800", sku: "BM-0501" },
];

export const Grid: Story = {
  parameters: {
    docs: {
      source: {
        language: "tsx",
        code: `import { List } from "@godxjp/ui";

interface Product {
  id: string;
  name: string;
  price: string;
  sku: string;
}

const products: Product[] = [
  { id: "p1", name: "和紙ノート 五冊", price: "¥3,200", sku: "WP-5001" },
  { id: "p2", name: "万年筆 蒔絵", price: "¥18,000", sku: "MW-2104" },
  { id: "p3", name: "錫の名刺入れ", price: "¥9,800", sku: "SZ-3300" },
  { id: "p4", name: "桐の文箱", price: "¥12,400", sku: "KR-7820" },
  { id: "p5", name: "藍染ハンカチ", price: "¥2,400", sku: "AI-1102" },
  { id: "p6", name: "竹の名札", price: "¥1,800", sku: "BM-0501" },
];

export function ProductGridList() {
  return (
    <div style={{ maxWidth: 960 }}>
      <List
        title="今月の和雑貨"
        cols={3}
        dataSource={products}
        renderItem={(product) => (
          <div
            style={{
              padding: "var(--spacing-4)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              background: "var(--card)",
            }}
          >
            <div
              style={{
                fontWeight: "var(--font-weight-medium)",
                marginBottom: "var(--spacing-1)",
              }}
            >
              {product.name}
            </div>
            <div
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--muted-foreground)",
                marginBottom: "var(--spacing-2)",
              }}
            >
              SKU: {product.sku}
            </div>
            <div style={{ fontWeight: "var(--font-weight-bold)" }}>
              {product.price}
            </div>
          </div>
        )}
      />
    </div>
  );
}`,
      },
    },
  },
  render: () => (
    <div style={{ maxWidth: 960 }}>
      <List
        title="今月の和雑貨"
        cols={3}
        dataSource={PRODUCTS}
        renderItem={(p) => (
          <div
            style={{
              padding: "var(--spacing-4)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              background: "var(--card)",
            }}
          >
            <div
              style={{
                fontWeight: "var(--font-weight-medium)",
                marginBottom: "var(--spacing-1)",
              }}
            >
              {p.name}
            </div>
            <div
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--muted-foreground)",
                marginBottom: "var(--spacing-2)",
              }}
            >
              SKU: {p.sku}
            </div>
            <div style={{ fontWeight: "var(--font-weight-bold)" }}>
              {p.price}
            </div>
          </div>
        )}
      />
    </div>
  ),
};

export const WithFooter: Story = {
  parameters: {
    docs: {
      source: {
        language: "tsx",
        code: `import type { ReactNode } from "react";
import { Avatar, Button, List } from "@godxjp/ui";

interface Employee {
  id: string;
  name: string;
  role: string;
  status: "active" | "leave" | "remote";
}

const employees: Employee[] = [
  { id: "1", name: "佐藤 健一", role: "プロダクトマネージャー", status: "active" },
  { id: "2", name: "山田 美咲", role: "シニアエンジニア", status: "remote" },
  { id: "3", name: "鈴木 大輔", role: "デザイナー", status: "active" },
  { id: "4", name: "高橋 結衣", role: "QAエンジニア", status: "leave" },
  { id: "5", name: "田中 一郎", role: "テックリード", status: "active" },
];

function EmployeeRow({
  avatar,
  title,
  description,
}: {
  avatar?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
}) {
  return (
    <>
      {avatar !== undefined && <div className="list-item-avatar">{avatar}</div>}
      <div className="list-item-meta">
        <div className="list-item-title">{title}</div>
        {description !== undefined && <div className="list-item-desc">{description}</div>}
      </div>
    </>
  );
}

export function EmployeeListWithFooter() {
  return (
    <div style={{ maxWidth: 720 }}>
      <List
        bordered
        header="申請一覧 (page 1 / 5)"
        dataSource={employees}
        renderItem={(employee) => (
          <EmployeeRow
            avatar={<Avatar>{employee.name.charAt(0)}</Avatar>}
            title={employee.name}
            description={\`\${employee.role} — 申請日: 2026-05-\${10 + Number(employee.id)}\`}
          />
        )}
        footer={
          <div
            style={{
              display: "flex",
              gap: "var(--spacing-2)",
              justifyContent: "center",
            }}
          >
            <Button size="small" variant="ghost">
              前へ
            </Button>
            <Button size="small" variant="ghost">
              次へ
            </Button>
          </div>
        }
      />
    </div>
  );
}`,
      },
    },
  },
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <List
        bordered
        header="申請一覧 (page 1 / 5)"
        dataSource={EMPLOYEES}
        renderItem={(emp) => (
          <EmployeeRow
            avatar={<Avatar>{emp.name.charAt(0)}</Avatar>}
            title={emp.name}
            description={`${emp.role} — 申請日: 2026-05-${10 + Number(emp.id)}`}
          />
        )}
        footer={
          <div
            style={{
              display: "flex",
              gap: "var(--spacing-2)",
              justifyContent: "center",
            }}
          >
            <Button size="small" variant="ghost">前へ</Button>
            <Button size="small" variant="ghost">次へ</Button>
          </div>
        }
      />
    </div>
  ),
};

export const Empty: Story = {
  parameters: {
    docs: {
      source: {
        language: "tsx",
        code: `import { List } from "@godxjp/ui";

export function EmptyList() {
  return (
    <div style={{ maxWidth: 720 }}>
      <List
        bordered
        title="承認待ち申請"
        dataSource={[]}
        renderItem={() => null}
        empty={<span>承認待ちの申請はありません。</span>}
      />
    </div>
  );
}`,
      },
    },
  },
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <List
        bordered
        title="承認待ち申請"
        dataSource={[]}
        renderItem={() => null}
        empty={<span>承認待ちの申請はありません。</span>}
      />
    </div>
  ),
};

export const Loading: Story = {
  parameters: {
    docs: {
      source: {
        language: "tsx",
        code: `import { List } from "@godxjp/ui";

export function LoadingList() {
  return (
    <div style={{ maxWidth: 720 }}>
      <List
        bordered
        title="今週の出勤"
        loading
        dataSource={[]}
        renderItem={() => null}
      />
    </div>
  );
}`,
      },
    },
  },
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <List
        bordered
        title="今週の出勤"
        loading
        dataSource={[]}
        renderItem={() => null}
      />
    </div>
  ),
};
