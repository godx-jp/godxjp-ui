import { describe, it } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrefetchLink } from "../prefetch-link";
import { expectNoA11yViolations } from "@/test/a11y";

// PrefetchLink renders a router <a> with hover/focus prefetch; it must resolve a
// QueryClient from context, so wrap it before handing it to the a11y helper.
describe("PrefetchLink a11y", () => {
  it("has no axe violations as a named link in a list", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    await expectNoA11yViolations(
      <QueryClientProvider client={client}>
        <ul>
          <li>
            <PrefetchLink
              to="/customers/cust_1"
              queryKey={["customer", "cust_1"]}
              queryFn={() => Promise.resolve({ id: "cust_1" })}
            >
              Mai Nguyễn
            </PrefetchLink>
          </li>
        </ul>
      </QueryClientProvider>,
    );
  });
});
