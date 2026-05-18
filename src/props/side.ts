/**
 * Shared edge-side / placement prop-vocabulary per cardinal rule 23 §B.
 *
 * `SideProp` is the 4-edge ladder used by Sheet, Tooltip, Popover,
 * Drawer — the prop that picks WHICH edge the floating panel docks
 * against.
 *
 * `PlacementProp` extends `SideProp` with `"center"` for primitives
 * that ALSO support a centred anchor (Tabs placement, Tour spotlight).
 */

export type SideProp = "top" | "right" | "bottom" | "left";

export type PlacementProp = SideProp | "center";
