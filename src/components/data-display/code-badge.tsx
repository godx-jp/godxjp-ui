import type { ComponentType, SVGProps } from "react";
import { Hash, ShoppingBag, Truck } from "lucide-react";

export type CodeBadgeKind = "internal" | "seller" | "yamato";

export type CodeBadgeProps = {
  kind: CodeBadgeKind;
  value: string;
};

const codeBadgeConfig = {
  internal: { label: "INT", icon: Hash },
  seller: { label: "SLR", icon: ShoppingBag },
  yamato: { label: "YMT", icon: Truck },
} satisfies Record<CodeBadgeKind, { label: string; icon: ComponentType<SVGProps<SVGSVGElement>> }>;

export function CodeBadge({ kind, value }: CodeBadgeProps) {
  const config = codeBadgeConfig[kind] ?? codeBadgeConfig.internal;
  const Icon = config.icon;

  return (
    <span className="ui-code-badge" data-kind={kind}>
      <span className="ui-code-badge-label">{config.label}</span>
      <Icon aria-hidden="true" />
      <span className="ui-code-badge-value">{value}</span>
    </span>
  );
}
