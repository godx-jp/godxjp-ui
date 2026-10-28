import { render, fireEvent } from "@testing-library/react";
import { it, expect, vi } from "vitest";
import { Image } from "../image";

it("reports request lifecycle, without notifying again when an inline handler is recreated", () => {
  const notify = vi.fn();
  const { container, rerender } = render(
    <Image src="/one.svg" alt="One" preview={false} onStatusChange={(status) => notify(status)} />,
  );
  expect(notify.mock.calls).toEqual([["loading"]]);
  rerender(
    <Image src="/one.svg" alt="One" preview={false} onStatusChange={(status) => notify(status)} />,
  );
  expect(notify.mock.calls).toEqual([["loading"]]);
  fireEvent.load(container.querySelector("img")!);
  expect(notify.mock.calls).toEqual([["loading"], ["loaded"]]);
  rerender(
    <Image src="/two.svg" alt="Two" preview={false} onStatusChange={(status) => notify(status)} />,
  );
  expect(notify.mock.calls).toEqual([["loading"], ["loaded"], ["loading"]]);
});
