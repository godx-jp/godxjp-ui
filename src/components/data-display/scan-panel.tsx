import { ScanLine } from "lucide-react";

export type ScanPanelProps = {
  title: string;
  description?: string;
};

export function ScanPanel({ title, description }: ScanPanelProps) {
  return (
    <div className="ui-scan-panel">
      <ScanLine aria-hidden="true" />
      <div className="ui-scan-title">{title}</div>
      {description ? <div className="ui-scan-description">{description}</div> : null}
    </div>
  );
}
