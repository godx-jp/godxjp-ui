/**
 * The ACCESSIBLE value of a slider thumb, whichever element carries it.
 *
 * `@radix-ui/react-slider` spelled the value out as `aria-valuenow` / `-valuemin` / `-valuemax` on
 * a `<span role="slider">`. react-aria-components renders a real `<input type="range">`, whose
 * slider role and value are NATIVE — the browser reads `value` / `min` / `max`, and ARIA in HTML
 * asks authors not to repeat them as `aria-value*`. Testing Library's `{ value: { now } }` role
 * filter only reads the ARIA attributes, so it would call every native slider valueless.
 *
 * These read the ARIA attribute when there is one and the native attribute otherwise — the same
 * order an accessibility API uses — so one assertion holds on either base. The Radix-era contract
 * in slider-legacy-contract.test.tsx was run green on the Radix base with these helpers.
 */
function read(element: HTMLElement, aria: string, native: "value" | "min" | "max"): number {
  const spelled = element.getAttribute(aria);
  if (spelled !== null) return Number(spelled);
  return Number(
    native === "value" ? (element as HTMLInputElement).value : element.getAttribute(native),
  );
}

export const sliderValue = (element: HTMLElement): number =>
  read(element, "aria-valuenow", "value");
export const sliderMin = (element: HTMLElement): number => read(element, "aria-valuemin", "min");
export const sliderMax = (element: HTMLElement): number => read(element, "aria-valuemax", "max");
