import { useTranslation } from "react-i18next";

type IdeaStatus = "draft" | "under_review" | "scored" | "accepted" | "rejected";
type Appetite = "1d" | "3d" | "1w" | "2w" | "6w";

interface IdeaCardData {
  id: string;
  title: string;
  problem: string;
  appetite: Appetite;
  status: IdeaStatus;
  votes: number;
  pitched_by: string;
}

const IDEAS: IdeaCardData[] = [
  { id: "IDEA-12", title: "Bulk action on issues board", problem: "Triaging 30+ issues requires clicking each card. Need shift-click multi-select + bulk move/edit.", appetite: "1w", status: "under_review", votes: 7, pitched_by: "satoshi" },
  { id: "IDEA-13", title: "Sandbox snapshot for AI debugging", problem: "When agent goes off the rails I want to time-travel the sandbox FS to a known-good state.", appetite: "6w", status: "draft", votes: 4, pitched_by: "naoki" },
  { id: "IDEA-14", title: "Workspace dark-mode default detection", problem: "First-load flicker as theme resolves from localStorage — should follow system pref pre-hydration.", appetite: "3d", status: "scored", votes: 2, pitched_by: "anh" },
];

const STATUS_TONE: Record<IdeaStatus, string> = {
  draft: "badge-neutral",
  under_review: "badge-info",
  scored: "badge-warning",
  accepted: "badge-success",
  rejected: "badge-error",
};

const STATUS_LABEL: Record<IdeaStatus, string> = {
  draft: "Draft",
  under_review: "Review",
  scored: "Scored",
  accepted: "Accepted",
  rejected: "Rejected",
};

export function IdeasScreen() {
  const { t } = useTranslation();
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("nav.ideas")}</h1>
          <p className="page-subtitle">Shape Up — problem · appetite · solution</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary">+ {t("common.new")}</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {IDEAS.map((idea) => (
          <article key={idea.id} className="card flex flex-col gap-2">
            <header className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">{idea.id}</span>
              <span className={`badge ${STATUS_TONE[idea.status]}`}>
                <span className="dot" /> {STATUS_LABEL[idea.status]}
              </span>
              <span className="chip ml-auto">⏱ {idea.appetite}</span>
            </header>
            <h3 className="text-base font-medium">{idea.title}</h3>
            <p className="text-xs text-muted-foreground line-clamp-3">{idea.problem}</p>
            <footer className="flex items-center gap-2 text-[10px] text-muted-foreground mt-auto pt-2 border-t border-border">
              <span>@{idea.pitched_by}</span>
              <span className="ml-auto">▲ {idea.votes}</span>
            </footer>
          </article>
        ))}
      </div>
    </>
  );
}
