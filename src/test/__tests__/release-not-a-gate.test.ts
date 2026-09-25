import { describe, expect, it } from "vitest";

const { REQUIRED_CI_CHECK_RUNS, assertCiProvenance } =
  // @ts-expect-error Release core intentionally stays dependency-free JavaScript for direct Node use.
  (await import("../../../scripts/release-core.mjs")) as {
    REQUIRED_CI_CHECK_RUNS: readonly string[];
    assertCiProvenance: (input: {
      sha: string;
      checkRuns: unknown[];
      totalCount: number;
    }) => unknown;
  };

/**
 * A DEPLOYMENT IS NOT A GATE (gh#634).
 *
 * The release refuses on any red check run for a good reason — "a gate we do not name is still a
 * gate". But a gate makes a CLAIM ABOUT THE COMMIT, while a deployment performs an ACTION SOMEWHERE
 * ELSE. When the Pages preview fails, nothing has been learned about the tarball.
 *
 * It cost two hours on 23.4.11. Every gate on the commit was green — four test shards, guards,
 * contrast, lockstep — and the release still aborted:
 *
 *     ✗ Refusing to publish f4191588: CI has not proven this commit green.
 *       - other red check: deploy (failure)
 *
 * `deploy` had failed on a GitHub 502, with the action saying so itself: "Server error, is
 * githubstatus.com reporting a Pages outage? Please re-run the deployment at a later time."
 * Re-running it turned the release green in 26 seconds.
 *
 * These tests pin BOTH sides of that line, because widening it by accident is how a release guard
 * stops guarding: the deployment must not block, and everything that verifies still must.
 */
const green = (name: string) => ({
  name,
  status: "completed",
  conclusion: "success",
  started_at: "2026-09-13T00:00:00Z",
});
const red = (name: string) => ({
  name,
  status: "completed",
  conclusion: "failure",
  started_at: "2026-09-13T00:00:00Z",
});

const allGatesGreen = () => REQUIRED_CI_CHECK_RUNS.map(green);

describe("release CI provenance — a deployment is not a gate", () => {
  it("passes when every required gate is green", () => {
    const runs = allGatesGreen();
    expect(() =>
      assertCiProvenance({ sha: "abc", checkRuns: runs, totalCount: runs.length }),
    ).not.toThrow();
  });

  it("does NOT block on a red `deploy` — the Pages preview verifies nothing", () => {
    const runs = [...allGatesGreen(), red("deploy")];
    expect(() =>
      assertCiProvenance({ sha: "abc", checkRuns: runs, totalCount: runs.length }),
    ).not.toThrow();
  });

  /*
   * `publish` IS THIS JOB, và bỏ sót nó khiến release không bao giờ thử lại được CHÍNH NÓ.
   *
   * Đo trên v30.5.2: lần chạy đầu publish THÀNH CÔNG cả hai tarball rồi đỏ ở bước tự xác minh,
   * vì registry chưa kịp phục vụ ("this release is COMPLETE but unpropagated", lời của chính
   * nó). Việc còn lại đúng một thao tác đổi dist-tag. Nhưng lần đỏ ấy để lại một check `publish`
   * đỏ trên commit được tag, nên lần thử lại từ chối khởi động — `other red check: publish
   * (failure)` — và mọi lần sau cũng thế. Một release hỏng một lần là không bao giờ hoàn tất
   * được.
   *
   * Khác `deploy` ở trên: cái đó là hỏng CHẬP CHỜN, chờ hoặc rerun là qua. Cái này là deadlock
   * TOÀN PHẦN, tự khoá, không lối ra.
   */
  it("does NOT block on a red `publish` — nó là chính job này, không phải một claim về commit", () => {
    const runs = [...allGatesGreen(), red("publish")];
    expect(() =>
      assertCiProvenance({ sha: "abc", checkRuns: runs, totalCount: runs.length }),
    ).not.toThrow();
  });

  it("matches `publish` exactly — một tên chỉ CHỨA nó vẫn chặn", () => {
    // Ca âm tính: nếu không có nó thì một prefix-match lỏng lẻo sẽ lọt, và một gate thật tên
    // `publish-contract` sẽ bị bỏ qua trong im lặng.
    const runs = [...allGatesGreen(), red("publish-contract")];
    expect(() =>
      assertCiProvenance({ sha: "abc", checkRuns: runs, totalCount: runs.length }),
    ).toThrow(/other red check: publish-contract/);
  });

  it("STILL blocks on a red required gate — the guard keeps guarding", () => {
    const runs = allGatesGreen();
    const shard = runs.findIndex((r: { name: string }) => r.name.startsWith("Tests (shard"));
    runs[shard] = red(runs[shard].name);
    expect(() =>
      assertCiProvenance({ sha: "abc", checkRuns: runs, totalCount: runs.length }),
    ).toThrow(/not successful/);
  });

  it("STILL blocks on an unnamed red check that is not a deployment", () => {
    const runs = [...allGatesGreen(), red("some-new-gate")];
    expect(() =>
      assertCiProvenance({ sha: "abc", checkRuns: runs, totalCount: runs.length }),
    ).toThrow(/other red check: some-new-gate/);
  });

  it("matches `deploy` exactly, so a name merely CONTAINING it still blocks", () => {
    const runs = [...allGatesGreen(), red("deploy-and-verify")];
    expect(() =>
      assertCiProvenance({ sha: "abc", checkRuns: runs, totalCount: runs.length }),
    ).toThrow(/other red check: deploy-and-verify/);
  });

  it("still blocks when a required gate never ran at all — absence is not success", () => {
    const runs = allGatesGreen().slice(1);
    expect(() =>
      assertCiProvenance({ sha: "abc", checkRuns: runs, totalCount: runs.length }),
    ).toThrow(/never ran/);
  });

  it("tells the reader which bucket a red check is in", () => {
    const runs = [...allGatesGreen(), red("some-new-gate")];
    try {
      assertCiProvenance({ sha: "abc", checkRuns: runs, totalCount: runs.length });
      throw new Error("expected a refusal");
    } catch (error) {
      expect((error as Error).message).toMatch(/nobody named as a gate/);
    }
  });
});
