/** Design token catalog taught by the MCP. Mirrors the 3-tier token model. */

export type TokenCategory = "primitive" | "semantic" | "component";

export interface TokenEntry {
  name: string;
  category: TokenCategory;
  role: string;
  tier: "primitive" | "semantic" | "component";
}

export const TOKENS: TokenEntry[] = [
  { name: "--wa-*", category: "primitive", tier: "primitive", role: "Neutral decorative Japanese accent primitives for charts/tags/decoration only." },
  { name: "--chart-1..6", category: "primitive", tier: "primitive", role: "Neutral decorative chart primitives; @theme chart colors reference these tokens." },
  { name: "--space-0..12", category: "primitive", tier: "primitive", role: "Raw spacing scale." },
  { name: "--font-size-*", category: "primitive", tier: "primitive", role: "Raw typography scale." },
  { name: "--primary", category: "semantic", tier: "semantic", role: "Brand/action color role." },
  { name: "--success", category: "semantic", tier: "semantic", role: "Success status role." },
  { name: "--warning", category: "semantic", tier: "semantic", role: "Warning status role." },
  { name: "--destructive", category: "semantic", tier: "semantic", role: "Destructive/error status role." },
  { name: "--info", category: "semantic", tier: "semantic", role: "Information status role." },
  { name: "--attention", category: "semantic", tier: "semantic", role: "Attention status role." },
  { name: "--badge-space-*", category: "component", tier: "component", role: "Badge spacing." },
  { name: "--card-*", category: "component", tier: "component", role: "Card surface, border, spacing, and typography." },
  { name: "--control-*", category: "component", tier: "component", role: "Shared form control heights, padding, icons, and focus chrome." },
  { name: "--table-*", category: "component", tier: "component", role: "Table row/cell sizing." },
  { name: "--dialog-* / --alert-* / --skeleton-*", category: "component", tier: "component", role: "Feedback component sizing and spacing." },
];

export function tokensByCategory(category: TokenCategory): TokenEntry[] {
  return TOKENS.filter((t) => t.category === category);
}
