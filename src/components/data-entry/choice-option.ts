import type * as React from "react";

import { cn } from "../../lib/utils";

/** Shared option shape — the conventional `CheckboxOptionType` / `Radio` options entry. */
export type ChoiceOption = {
  label: React.ReactNode;
  value: string;
  disabled?: boolean;
  description?: React.ReactNode;
  /** `RadioGroup optionType="card"` only — see `ChoiceOptionProp.leading`. */
  leading?: React.ReactNode;
  /** `RadioGroup optionType="card"` only — see `ChoiceOptionProp.extra`. */
  extra?: React.ReactNode;
};

/** A labelled section of options — see `ChoiceOptionSectionProp`. */
export type ChoiceOptionSection = {
  label: React.ReactNode;
  options: ChoiceOption[];
  appearance?: "muted";
};

export function isChoiceOptionSection(
  entry: ChoiceOption | ChoiceOptionSection,
): entry is ChoiceOptionSection {
  return "options" in entry && Array.isArray(entry.options);
}

export type ChoiceOrientation = "horizontal" | "vertical";

export function choiceGroupClassName(
  _orientation: ChoiceOrientation = "vertical",
  className?: string,
) {
  return cn("ui-choice-group", className);
}
