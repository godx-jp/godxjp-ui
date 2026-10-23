import * as React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { Input } from "../input";
import { Textarea } from "../textarea";

/**
 * A burst of `input` events delivered back to back, without yielding to the scheduler between
 * them — what an IME (Telex/VNI), a fast typist or browser automation produces. Each event is a
 * discrete React update, so it renders and commits synchronously; anything the component defers to
 * a later task (a passive-effect `setState`) is still pending when the next keystroke commits.
 *
 * Input and Textarea used to mirror their controlled `value` into state from a `useEffect`, which
 * left exactly such pending work after every keystroke. React counts a commit that leaves update
 * work behind as a nested update, and after 50 of them throws "Maximum update depth exceeded"
 * (#185) out of the consumer's `setState` — and the keystroke that threw was lost.
 */
const BURST = "Có thể dùng kênh này để trao đổi về dự án, lịch họp và tài liệu chung.";

function typeBurst(element: HTMLInputElement | HTMLTextAreaElement, text: string) {
  const setValue = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), "value")?.set;
  for (const character of text) {
    setValue?.call(element, element.value + character);
    element.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

const actEnvironment = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
const actEnvironmentBefore = actEnvironment.IS_REACT_ACT_ENVIRONMENT;

afterEach(() => {
  actEnvironment.IS_REACT_ACT_ENVIRONMENT = actEnvironmentBefore;
});

/** Types the burst outside `act`, so React defers work to a later task the way a browser would. */
function burstAndCollectErrors(element: HTMLInputElement | HTMLTextAreaElement) {
  const errors: unknown[] = [];
  const onError = (event: ErrorEvent) => {
    errors.push(event.error ?? event.message);
    event.preventDefault();
  };
  actEnvironment.IS_REACT_ACT_ENVIRONMENT = false;
  window.addEventListener("error", onError);
  try {
    typeBurst(element, BURST);
  } finally {
    window.removeEventListener("error", onError);
  }
  return errors;
}

type ControlProps = { allowClear?: boolean; count?: { max: number }; autoGrow?: boolean };

function Controlled({ control, ...props }: ControlProps & { control: "input" | "textarea" }) {
  const [text, setText] = React.useState("");
  const shared = {
    "aria-label": "field",
    value: text,
    onChange: (event: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) =>
      setText(event.target.value),
  };
  return (
    <>
      {control === "input" ? (
        <Input {...shared} allowClear={props.allowClear} count={props.count} />
      ) : (
        <Textarea rows={2} {...shared} {...props} />
      )}
      <output data-testid="state">{text}</output>
    </>
  );
}

const cases: Array<[string, ControlProps]> = [
  ["plain", {}],
  ["count", { count: { max: 200 } }],
  ["allowClear", { allowClear: true }],
];

describe.each(["input", "textarea"] as const)(
  "%s — a controlled burst of input events",
  (control) => {
    it.each(
      control === "textarea"
        ? [...cases, ["autoGrow", { autoGrow: true }] as [string, ControlProps]]
        : cases,
    )("keeps every character and never exceeds the update depth (%s)", (_label, props) => {
      renderWithUi(<Controlled control={control} {...props} />, { loopGuard: false });
      const field = screen.getByLabelText<HTMLInputElement | HTMLTextAreaElement>("field");

      const errors = burstAndCollectErrors(field);

      expect(errors).toEqual([]);
      expect(field.value).toBe(BURST);
      expect(screen.getByTestId("state").textContent).toBe(BURST);
    });
  },
);
