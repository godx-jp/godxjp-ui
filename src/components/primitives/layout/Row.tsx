// <Row> — 24-column responsive grid (Ant Design model).
//
// Pairs with <Col span={…} xs={…} sm={…} md={…} lg={…} xl={…} />.
// Children Cols sum to ≤24 per breakpoint; extra Cols wrap.
//
//   <Row gutter={16}>
//     <Col xs={24} md={8}>left</Col>
//     <Col xs={24} md={16}>right</Col>
//   </Row>
//
// `gutter` can be a single number (horizontal only), [h, v] tuple,
// or per-breakpoint object `{ xs: 8, md: 16 }`. The Row sets the
// negative margin so the rightmost Col aligns with the container
// edge; Cols add the matching positive padding.
//
// Why not raw `grid-cols-*`: per rule 12 Clause 1 the framework owns
// layout primitives. Service code never writes `grid-cols-[280px_1fr]`.

import { createContext, useContext, type ComponentProps, type ReactNode } from "react";
import { cn } from "../cn";

export type GutterValue = number | [number, number] | Partial<Record<Breakpoint, number>>;

export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";

export type Justify = "start" | "end" | "center" | "space-around" | "space-between" | "space-evenly";
export type Align = "top" | "middle" | "bottom" | "stretch";

export interface RowProps extends Omit<ComponentProps<"div">, "children"> {
  /** Horizontal gap (px), or [horizontal, vertical], or per-breakpoint object. */
  gutter?: GutterValue;
  /** Flex justify on the cross axis. */
  justify?: Justify;
  /** Flex align on the main axis. */
  align?: Align;
  /** Wrap children when sum > 24 cols (default true). */
  wrap?: boolean;
  children?: ReactNode;
}

interface RowCtx {
  gutter: [number, number];
}

const Ctx = createContext<RowCtx>({ gutter: [0, 0] });

export function useRowGutter(): [number, number] {
  return useContext(Ctx).gutter;
}

const JUSTIFY_CLASS: Record<Justify, string> = {
  start: "justify-start",
  end: "justify-end",
  center: "justify-center",
  "space-around": "justify-around",
  "space-between": "justify-between",
  "space-evenly": "justify-evenly",
};

const ALIGN_CLASS: Record<Align, string> = {
  top: "items-start",
  middle: "items-center",
  bottom: "items-end",
  stretch: "items-stretch",
};

function normalizeGutter(g: GutterValue | undefined): [number, number] {
  if (g === undefined) return [0, 0];
  if (typeof g === "number") return [g, 0];
  if (Array.isArray(g)) return [g[0] ?? 0, g[1] ?? 0];
  // Per-breakpoint object — pick the widest matching at runtime via
  // window.matchMedia. Server / first-paint falls back to xs.
  if (typeof window === "undefined") return [g.xs ?? 0, 0];
  const order: Breakpoint[] = ["xxl", "xl", "lg", "md", "sm", "xs"];
  const widths: Record<Breakpoint, string> = {
    xs: "0px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    xxl: "1536px",
  };
  for (const bp of order) {
    if (g[bp] !== undefined && window.matchMedia(`(min-width: ${widths[bp]})`).matches) {
      return [g[bp] as number, 0];
    }
  }
  return [g.xs ?? 0, 0];
}

export function Row({
  gutter,
  justify,
  align,
  wrap = true,
  className,
  style,
  children,
  ...rest
}: RowProps) {
  const [h, v] = normalizeGutter(gutter);
  return (
    <Ctx.Provider value={{ gutter: [h, v] }}>
      <div
        className={cn(
          "flex",
          wrap ? "flex-wrap" : "flex-nowrap",
          justify && JUSTIFY_CLASS[justify],
          align && ALIGN_CLASS[align],
          className,
        )}
        style={{
          rowGap: v ? `${v}px` : undefined,
          marginLeft: h ? `-${h / 2}px` : undefined,
          marginRight: h ? `-${h / 2}px` : undefined,
          ...style,
        }}
        {...rest}
      >
        {children}
      </div>
    </Ctx.Provider>
  );
}
