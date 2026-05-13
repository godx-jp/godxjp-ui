// cn — class-name merger. Standard shadcn utility: clsx merges values
// and tailwind-merge resolves Tailwind class conflicts (e.g. last
// `bg-*` wins). Every primitive in this package and every consumer
// service imports cn from this single location to keep the dedupe
// rules consistent.
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
