import { GitBranch } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "../../../components/data-display/Card";
import { PageHeader } from "../../../components/data-display/PageHeader";
import { Tag } from "../../../components/data-display/Tag";
import { Button } from "../../../components/general/Button";
import { PROJECT_KIND, type ForgeProduct, type ForgeProject } from "../products";

// ProjectsListScreen — every project owning the active product, in a
// design-system `.table` shape. Click a row to drill in.
export interface ProjectsListScreenProps {
  product: ForgeProduct;
  onSelect: (project: ForgeProject) => void;
}

export function ProjectsListScreen({ product, onSelect }: ProjectsListScreenProps) {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader
        title={t("nav.projects")}
        subtitle={`${product.name} · ${product.projects.length} ${t("nav.projects").toLowerCase()}`}
        actions={<Button variant="primary">+ {t("common.new")}</Button>}
      />

      <Card padding="none" className="overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Stack</th>
              <th>Kind</th>
              <th className="num">Devs</th>
              <th className="num">Issues</th>
              <th className="num">PR</th>
              <th>Branch</th>
              <th>Last commit</th>
            </tr>
          </thead>
          <tbody>
            {product.projects.map((p) => (
              <tr key={p.id} onClick={() => onSelect(p)} className="cursor-pointer">
                <td className="font-medium">{p.name}</td>
                <td className="muted">{p.stack}</td>
                <td>
                  <Tag color={PROJECT_KIND[p.kind].color}>
                    {PROJECT_KIND[p.kind].label}
                  </Tag>
                </td>
                <td className="num">{p.devs}</td>
                <td className="num">{p.openIssues}</td>
                <td className="num">{p.prs}</td>
                <td className="mono">
                  <span className="inline-flex items-center gap-1">
                    <GitBranch size={11} /> {p.branch}
                  </span>
                </td>
                <td className="muted">{p.lastCommit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
