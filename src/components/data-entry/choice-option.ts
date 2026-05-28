import type * as React from "react";

import { cn } from "../../lib/utils";

/** Shared option shape — Ant Design `CheckboxOptionType` / `Radio` options. */
export type ChoiceOption = {
  label: React.ReactNode;
  value: string;
  disabled?: boolean;
  description?: React.ReactNode;
};

export type ChoiceOrientation = "horizontal" | "vertical";

export function choiceGroupClassName(
  _orientation: ChoiceOrientation = "vertical",
  className?: string,
) {
  return cn("ui-choice-group", className);
}
