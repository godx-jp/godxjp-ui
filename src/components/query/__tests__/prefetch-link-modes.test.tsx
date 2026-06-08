import { describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";

import { PrefetchLink } from "../prefetch-link";

function setup(prefetchOn: "both" | "hover" | "focus" | "none" | undefined) {
  const queryFn = vi.fn(() => Promise.resolve({ ok: true }));
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const onMouseEnter = vi.fn();
  const onFocus = vi.fn();
  renderWithUi(
    <QueryClientProvider client={client}>
      <PrefetchLink
        to="/x"
        queryKey={["k"]}
        queryFn={queryFn}
        prefetchOn={prefetchOn}
        onMouseEnter={onMouseEnter}
        onFocus={onFocus}
      >
        詳細
      </PrefetchLink>
    </QueryClientProvider>,
  );
  return { queryFn, onMouseEnter, onFocus, link: screen.getByRole("link", { name: "詳細" }) };
}

describe("PrefetchLink — prefetchOn modes", () => {
  it('prefetchOn="focus" fires on focus but NOT on hover', async () => {
    const user = userEvent.setup();
    const { queryFn, link } = setup("focus");
    await user.hover(link);
    expect(queryFn).not.toHaveBeenCalled();
    await user.click(link.parentElement ?? link); // move focus onto the link region
    link.focus();
    await waitFor(() => expect(queryFn).toHaveBeenCalled());
  });

  it('prefetchOn="hover" fires on hover but NOT on focus', async () => {
    const user = userEvent.setup();
    const { queryFn, link } = setup("hover");
    link.focus();
    expect(queryFn).not.toHaveBeenCalled();
    await user.hover(link);
    await waitFor(() => expect(queryFn).toHaveBeenCalled());
  });

  it('prefetchOn="none" never prefetches', async () => {
    const user = userEvent.setup();
    const { queryFn, link } = setup("none");
    await user.hover(link);
    link.focus();
    expect(queryFn).not.toHaveBeenCalled();
  });

  it("still calls the consumer's onMouseEnter / onFocus handlers", async () => {
    const user = userEvent.setup();
    const { onMouseEnter, onFocus, link } = setup("both");
    await user.hover(link);
    expect(onMouseEnter).toHaveBeenCalled();
    link.focus();
    expect(onFocus).toHaveBeenCalled();
  });
});
