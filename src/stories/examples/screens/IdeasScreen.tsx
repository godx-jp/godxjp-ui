import { useTranslation } from "react-i18next";
import { Button } from "../../../components/general/Button";
import { Badge, type BadgeVariant } from "../../../components/data-display/Badge";
import { Card } from "../../../components/data-display/Card";
import { PageHeader } from "../../../components/data-display/PageHeader";
import { Tag } from "../../../components/data-display/Tag";
import { Typography } from "../../../components/general/Typography";

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

const STATUS_TONE: Record<IdeaStatus, BadgeVariant> = {
  draft: "neutral",
  under_review: "info",
  scored: "warning",
  accepted: "success",
  rejected: "destructive",
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
      <PageHeader
        title={t("nav.ideas")}
        subtitle="Shape Up — problem · appetite · solution"
        actions={<Button variant="primary">+ {t("common.new")}</Button>}
      />

      <div className="grid grid-cols-3 gap-3">
        {IDEAS.map((idea) => (
          <Card key={idea.id} className="flex flex-col gap-2">
            <header className="flex items-center gap-2">
              <Typography.Text code>{idea.id}</Typography.Text>
              <Badge variant={STATUS_TONE[idea.status]}>{STATUS_LABEL[idea.status]}</Badge>
              <Tag className="ml-auto">⏱ {idea.appetite}</Tag>
            </header>
            <Typography.Title size={5}>{idea.title}</Typography.Title>
            <Typography.Paragraph color="secondary" truncate={{ rows: 3 }}>
              {idea.problem}
            </Typography.Paragraph>
            <footer className="flex items-center gap-2 text-[10px] text-muted-foreground mt-auto pt-2 border-t border-border">
              <span>@{idea.pitched_by}</span>
              <span className="ml-auto">▲ {idea.votes}</span>
            </footer>
          </Card>
        ))}
      </div>
    </>
  );
}
