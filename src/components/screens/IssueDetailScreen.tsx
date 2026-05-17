import * as Popover from "@radix-ui/react-popover";
import { ArrowLeft, ChevronRight, Send } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../cn";

type Tab = "conversation" | "checklist" | "code" | "history";
type IssueStatus = "backlog" | "in-progress" | "review" | "done" | "abandoned";
type IssuePriority = "low" | "medium" | "high" | "urgent";

const STATUS_LABEL: Record<IssueStatus, string> = {
  backlog: "Backlog",
  "in-progress": "In progress",
  review: "Review",
  done: "Done",
  abandoned: "Abandoned",
};

const PRIORITY_LABEL: Record<IssuePriority, string> = {
  low: "P3",
  medium: "P2",
  high: "P1",
  urgent: "P0",
};

const TEAM = ["satoshi", "naoki", "anh", "kira"];

const COMMENTS = [
  { id: "c1", who: "satoshi", when: "2h", body: "Cloned latest design; QuickComposer collapse is 52px, expand on focus." },
  { id: "c2", who: "naoki", when: "1h", body: "Picked P1 — release window is tight." },
  { id: "c3", who: "anh", when: "12m", body: "Backend ON CONFLICT works; reproduced count 1→2 via curl." },
];

// IssueDetailScreen — Linear/GitLab-style detail page with the sticky
// QuickComposer pinned to the page bottom (per chat2.md feedback).
//
// Composer collapses to 52 px; focusing the input expands it to a
// markdown editor with three inline pill-pickers (status / assignee /
// priority). Changed pills glow orange + a "submitWithChanges" badge
// surfaces so the user knows the comment will commit those state
// changes alongside.
export interface IssueDetailScreenProps {
  issueId: string;
  onBack: () => void;
  onOpenPlan: (id: string) => void;
}

export function IssueDetailScreen({ issueId, onBack, onOpenPlan }: IssueDetailScreenProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("conversation");

  const [composerOpen, setComposerOpen] = useState(false);
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<IssueStatus>("in-progress");
  const [assignee, setAssignee] = useState<string>(TEAM[0]);
  const [priority, setPriority] = useState<IssuePriority>("medium");
  const initial = { status: "in-progress" as IssueStatus, assignee: TEAM[0], priority: "medium" as IssuePriority };
  const hasChanges =
    status !== initial.status || assignee !== initial.assignee || priority !== initial.priority;

  return (
    <div
      className="flex flex-col"
      style={{ minHeight: "calc(100vh - var(--header-height))" }}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-4 text-xs">
          <button onClick={onBack} className="tb-icon-btn" aria-label={t("common.back")}>
            <ArrowLeft size={14} />
          </button>
          <span className="text-muted-foreground">{t("nav.issues")}</span>
          <ChevronRight size={12} className="text-muted-foreground" />
          <span className="font-mono">{issueId}</span>
        </div>

        <div className="page-header">
          <div>
            <h1 className="page-title">
              Wire sticky QuickComposer for backlog-style edits
            </h1>
            <p className="page-subtitle">@naoki opened · 2 days ago</p>
          </div>
          <div className="page-actions">
            <span className="badge badge-info">
              <span className="dot" /> {STATUS_LABEL[status]}
            </span>
            <span className="badge badge-warning">{PRIORITY_LABEL[priority]}</span>
          </div>
        </div>

        <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 240px" }}>
          <div>
            <div className="tabs mb-4">
              <button className="tab" data-active={tab === "conversation"} onClick={() => setTab("conversation")}>
                {t("issue.conversation")}
              </button>
              <button className="tab" data-active={tab === "checklist"} onClick={() => setTab("checklist")}>
                {t("issue.checklist")}
              </button>
              <button className="tab" data-active={tab === "code"} onClick={() => setTab("code")}>
                {t("issue.codeChanges")}
              </button>
              <button className="tab" data-active={tab === "history"} onClick={() => setTab("history")}>
                {t("issue.history")}
              </button>
            </div>

            {tab === "conversation" && (
              <ul className="flex flex-col gap-3">
                {COMMENTS.map((c) => (
                  <li key={c.id} className="card">
                    <header className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <span className="avatar" style={{ width: 24, height: 24, fontSize: 10 }}>
                        {c.who[0]?.toUpperCase()}
                      </span>
                      <span className="font-medium text-foreground">@{c.who}</span>
                      <span>·</span>
                      <span>{c.when}</span>
                    </header>
                    <p className="text-sm">{c.body}</p>
                  </li>
                ))}
              </ul>
            )}
            {tab === "checklist" && (
              <div className="card">
                <ul className="flex flex-col gap-2 text-sm">
                  <li><label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Sticky composer renders at 52px</label></li>
                  <li><label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Expand on focus, collapse on outside click</label></li>
                  <li><label className="flex items-center gap-2"><input type="checkbox" /> Status/assignee/priority pickers</label></li>
                  <li><label className="flex items-center gap-2"><input type="checkbox" /> ⌘+Enter submit</label></li>
                </ul>
              </div>
            )}
            {tab === "code" && (
              <div className="diff">
                <div className="diff-row ctx"><span className="ln">12</span><span className="ln">12</span><span className="body">function App() &#123;</span></div>
                <div className="diff-row del"><span className="ln">13</span><span className="ln"></span><span className="body">  const [open, setOpen] = useState(false);</span></div>
                <div className="diff-row add"><span className="ln"></span><span className="ln">13</span><span className="body">  const [composerOpen, setComposerOpen] = useState(false);</span></div>
                <div className="diff-row ctx"><span className="ln">14</span><span className="ln">14</span><span className="body">  return &lt;Shell /&gt;;</span></div>
              </div>
            )}
            {tab === "history" && (
              <ul className="flex flex-col gap-1 text-xs">
                <li className="log-line"><span className="time">2d</span><span className="src">@naoki</span><span>opened the issue</span></li>
                <li className="log-line"><span className="time">1d</span><span className="src ok">@satoshi</span><span>moved to In progress</span></li>
                <li className="log-line"><span className="time">2h</span><span className="src warn">@anh</span><span>changed priority to P1</span></li>
              </ul>
            )}
          </div>

          <aside className="flex flex-col gap-3 text-xs">
            <SidebarField label={t("issue.assignee")}>@{assignee}</SidebarField>
            <SidebarField label={t("issue.labels")}>
              <span className="chip">design-system</span>
              <span className="chip">frontend</span>
            </SidebarField>
            <SidebarField label={t("issue.milestone")}>2026-Q2 release</SidebarField>
            <SidebarField label={t("issue.sprint")}>Sprint 12</SidebarField>
            <SidebarField label={t("issue.points")}>5</SidebarField>
            <SidebarField label={t("issue.relatedPlan")}>
              <button onClick={() => onOpenPlan("PDCA-Q2-001")} className="underline text-primary">
                PDCA-Q2-001
              </button>
            </SidebarField>
          </aside>
        </div>
      </div>

      <div
        className="sticky bottom-0 mt-6 py-2 border-t border-border bg-background/85 backdrop-blur"
        style={{ marginLeft: "calc(var(--spacing-6) * -1)", marginRight: "calc(var(--spacing-6) * -1)", paddingLeft: "var(--spacing-6)", paddingRight: "var(--spacing-6)" }}
      >
        {!composerOpen ? (
          <button
            type="button"
            className="flex w-full items-center gap-2 text-xs text-muted-foreground hover:text-foreground py-1"
            onClick={() => setComposerOpen(true)}
          >
            <span className="avatar" style={{ width: 24, height: 24, fontSize: 10 }}>S</span>
            <span>{issueId} · {t("issue.addComment")}</span>
            <span className="ml-auto flex items-center gap-2">
              <span className="chip">{STATUS_LABEL[status]}</span>
              <span className="chip">{PRIORITY_LABEL[priority]}</span>
              <kbd className="kbd">C</kbd>
            </span>
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <textarea
              autoFocus
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t("issue.addComment")}
              rows={3}
              className="input"
              onBlur={(e) => {
                if (!e.currentTarget.value && !e.relatedTarget) {
                  setComposerOpen(false);
                }
              }}
            />
            <div className="flex items-center gap-2 flex-wrap">
              <PillPicker label={t("issue.status")} value={STATUS_LABEL[status]} changed={status !== initial.status}>
                {(Object.keys(STATUS_LABEL) as IssueStatus[]).map((s) => (
                  <button key={s} type="button" className="sw-pop-item w-full text-left" onClick={() => setStatus(s)}>
                    {STATUS_LABEL[s]}
                  </button>
                ))}
              </PillPicker>
              <PillPicker label={t("issue.assignee")} value={`@${assignee}`} changed={assignee !== initial.assignee}>
                {TEAM.map((u) => (
                  <button key={u} type="button" className="sw-pop-item w-full text-left" onClick={() => setAssignee(u)}>
                    @{u}
                  </button>
                ))}
              </PillPicker>
              <PillPicker label={t("issue.priority")} value={PRIORITY_LABEL[priority]} changed={priority !== initial.priority}>
                {(Object.keys(PRIORITY_LABEL) as IssuePriority[]).map((p) => (
                  <button key={p} type="button" className="sw-pop-item w-full text-left" onClick={() => setPriority(p)}>
                    {PRIORITY_LABEL[p]}
                  </button>
                ))}
              </PillPicker>

              {hasChanges && (
                <span className="badge badge-attention">↻ {t("issue.submitWithChanges")}</span>
              )}

              <button
                type="button"
                className="btn btn-primary btn-sm ml-auto"
                onClick={() => {
                  setBody("");
                  setComposerOpen(false);
                }}
                disabled={!body.trim()}
              >
                <Send size={12} /> {t("common.submit")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SidebarField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex flex-wrap items-center gap-1">{children}</div>
    </div>
  );
}

function PillPicker({
  label,
  value,
  changed,
  children,
}: {
  label: string;
  value: string;
  changed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            "chip text-xs cursor-pointer",
            changed && "border border-[var(--attention)] text-[var(--attention)]",
          )}
        >
          {label}: {value}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="sw-pop" align="start" sideOffset={4} style={{ width: 200 }}>
          <div className="sw-pop-list">{children}</div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
