import { useTranslation } from "react-i18next";
import { Button } from "../../../components/general/Button";
import { PageHeader } from "../../../components/data-display/PageHeader";
import { Tag } from "../../../components/data-display/Tag";

type IssueStatus = "backlog" | "in-progress" | "review" | "done";
type IssuePriority = "low" | "medium" | "high" | "urgent";
type IssueType = "task" | "bug" | "feature" | "chore";

interface IssueCardData {
  id: string;
  status: IssueStatus;
  title: string;
  type: IssueType;
  priority: IssuePriority;
  assignee: string;
}

const ISSUES: IssueCardData[] = [
  { id: "GK-301", status: "backlog", title: "Notify SSE handshake retries when token expired", type: "bug", priority: "high", assignee: "satoshi" },
  { id: "GK-310", status: "in-progress", title: "Wire sticky QuickComposer for backlog-style edits", type: "feature", priority: "medium", assignee: "naoki" },
  { id: "GK-311", status: "in-progress", title: "Tweaks panel keyboard shortcut conflict", type: "task", priority: "low", assignee: "anh" },
  { id: "GK-302", status: "review", title: "Forge nav grouping per audience", type: "task", priority: "medium", assignee: "kira" },
  { id: "GK-298", status: "done", title: "Drop NOT NULL project_id on plans/issues", type: "bug", priority: "urgent", assignee: "satoshi" },
];

const COLS: { id: IssueStatus; label: string }[] = [
  { id: "backlog", label: "Backlog" },
  { id: "in-progress", label: "In progress" },
  { id: "review", label: "Review" },
  { id: "done", label: "Done" },
];

const PRIO_DOT: Record<IssuePriority, string> = {
  low: "var(--muted-foreground)",
  medium: "var(--info)",
  high: "var(--warning)",
  urgent: "var(--destructive)",
};

export interface IssuesScreenProps {
  onOpenIssue: (id: string) => void;
}

export function IssuesScreen({ onOpenIssue }: IssuesScreenProps) {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader
        title={t("nav.issues")}
        subtitle={`${ISSUES.length} issues`}
        actions={<Button variant="primary">+ {t("common.new")}</Button>}
      />

      <div className="kanban">
        {COLS.map((col) => {
          const rows = ISSUES.filter((i) => i.status === col.id);
          return (
            <div key={col.id} className="kanban-col">
              <div className="kanban-col-head">
                <span>{col.label}</span>
                <span className="kanban-col-count">{rows.length}</span>
              </div>
              {rows.map((issue) => (
                <button
                  key={issue.id}
                  type="button"
                  onClick={() => onOpenIssue(issue.id)}
                  className="issue-card text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="issue-id">{issue.id}</span>
                    <span
                      className="dot"
                      style={{ background: PRIO_DOT[issue.priority] }}
                      aria-label={issue.priority}
                    />
                    <Tag className="ml-auto">{issue.type}</Tag>
                  </div>
                  <span className="issue-title">{issue.title}</span>
                  <span className="text-[10px] text-muted-foreground">@{issue.assignee}</span>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}
