/** Ant Design `showCheckedStrategy` equivalents for TreeSelect. */
export const SHOW_CHILD = "SHOW_CHILD" as const;
export const SHOW_PARENT = "SHOW_PARENT" as const;
export const SHOW_ALL = "SHOW_ALL" as const;

export type ShowCheckedStrategy = typeof SHOW_CHILD | typeof SHOW_PARENT | typeof SHOW_ALL;
