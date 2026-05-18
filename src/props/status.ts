/**
 * Shared status / tone prop-vocabulary per cardinal rule 23 §B.
 *
 * `StatusProp` is the 4-step ladder used by inputs and inline indicators.
 * `ToneProp` is a strict alias — same values, different verb-form chosen
 * by the consuming primitive (Field uses `tone`, Input uses `status`).
 * `HelpToneProp` is the broader 5-step ladder that adds `info` and `warn`
 * for help-text colouring (Field.help, Alert).
 */

export type StatusProp = "default" | "error" | "warning" | "success";

/** Same values as `StatusProp` — call it `tone` when the prop describes
 * surface colouring rather than validation state. */
export type ToneProp = StatusProp;

/** Help-line / Alert colour ladder (5 steps including info + warn). */
export type HelpToneProp =
  | "default"
  | "info"
  | "warn"
  | "error"
  | "success";
