import type * as React from "react";

/** Minimal preview case types for `*.preview.tsx` files. */
export type PreviewMeta<TArgs = Record<string, unknown>> = {
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component?: React.ComponentType<any>;
  tags?: string[];
  parameters?: Record<string, unknown>;
  argTypes?: Record<string, unknown>;
  decorators?: Array<(Preview: React.ComponentType) => React.ReactNode>;
};

export type PreviewCase<TArgs = Record<string, unknown>> = {
  name?: string;
  args?: Partial<TArgs> & Record<string, unknown>;
  render?: (...args: unknown[]) => React.ReactNode;
  parameters?: Record<string, unknown>;
  decorators?: PreviewMeta["decorators"];
};
