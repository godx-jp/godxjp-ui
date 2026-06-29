import { AspectRatio } from "@godxjp/ui";

export function Ratios() {
  const box = (label: string) => (
    <div
      style={{
        width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
        background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))",
        borderRadius: "var(--radius)", fontSize: 13, fontWeight: 500,
      }}
    >
      {label}
    </div>
  );
  return (
    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr", maxWidth: 460 }}>
      <AspectRatio ratio={16 / 9}>{box("16 : 9")}</AspectRatio>
      <AspectRatio ratio={1}>{box("1 : 1")}</AspectRatio>
    </div>
  );
}
