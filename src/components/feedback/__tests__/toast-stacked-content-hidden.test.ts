import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

/**
 * A COLLAPSED TOAST STACK MUST HIDE ITS BACK TOASTS FROM THE A11Y TREE, NOT ONLY FROM THE EYE.
 *
 * Sonner draws the stack from every live toast's box but fades the CONTENT of everything behind
 * the front one to `opacity: 0`. Transparent text is still text: it stays in the accessibility
 * tree and a contrast checker measures it against a surface it is invisible on. A consumer's
 * browser test caught exactly that — [serious] color-contrast, 1.03:1, on
 * `li[data-index="1"] > [data-content] > [data-title]`, whose reported `#f9f9f9` is nothing more
 * than `--popover-foreground` flattened over `--popover` at the ~2% opacity the fade was passing
 * through. `visibility: hidden` takes the subtree out of paint AND out of the a11y tree.
 *
 * The guard is written against SONNER'S OWN selector, read from its shipped stylesheet: if a
 * sonner upgrade renames or re-scopes the rule that hides stacked content, our counterpart stops
 * matching the same elements and this fails instead of silently leaving the defect uncovered.
 */

const require = createRequire(import.meta.url);
const sonnerCss = readFileSync(require.resolve("sonner/dist/styles.css"), "utf8");
const alertLayout = readFileSync(join(process.cwd(), "src/styles/alert-layout.css"), "utf8");

/** The sonner rule that fades a collapsed, non-front toast's content away. */
const SONNER_SELECTOR =
  "[data-sonner-toast][data-expanded='false'][data-front='false'][data-styled='true'] > *";

describe("collapsed toast stack — hidden content is hidden from AT too", () => {
  it("sonner still hides stacked content with opacity alone", () => {
    const rule = sonnerCss.match(
      /\[data-sonner-toast\]\[data-expanded='false'\]\[data-front='false'\]\[data-styled='true'\]\s*>\s*\*\s*\{([^}]*)\}/,
    );
    expect(rule, `sonner no longer ships ${SONNER_SELECTOR}`).not.toBeNull();
    expect(rule![1]).toContain("opacity: 0");
  });

  it("our stylesheet covers the same elements with visibility: hidden", () => {
    const rule = alertLayout.match(
      /\[data-sonner-toast\]\[data-expanded="false"\]\[data-front="false"\]\[data-styled="true"\]\s*>\s*\*\s*\{([^}]*)\}/,
    );
    expect(rule, "alert-layout.css does not counter sonner's opacity-only rule").not.toBeNull();
    expect(rule![1].replace(/\s+/g, " ")).toContain("visibility: hidden");
  });

  it("does not transition visibility — the defect must not stay measurable during the fade", () => {
    // Sonner fades the content over 400ms. A transitioned `visibility` would keep the subtree
    // in the a11y tree for that whole window, which is precisely when the consumer's axe run
    // measured 1.03:1 (opacity ≈ 0.02, i.e. near the END of the fade).
    const rule = alertLayout.match(
      /\[data-sonner-toast\]\[data-expanded="false"\]\[data-front="false"\]\[data-styled="true"\]\s*>\s*\*\s*\{([^}]*)\}/,
    );
    expect(rule![1]).not.toMatch(/transition/);
  });
});

describe("collapsed toast stack — applied cascade", () => {
  afterEach(() => {
    document.head.querySelectorAll("style[data-toast-cascade]").forEach((n) => n.remove());
    document.body.innerHTML = "";
  });

  /** Sonner's markup for one toast, reduced to the nesting the axe report named. */
  function mountStack() {
    const style = document.createElement("style");
    style.setAttribute("data-toast-cascade", "");
    style.textContent = `
      [data-sonner-toast][data-expanded='false'][data-front='false'][data-styled='true'] > * {
        opacity: 0;
      }
      [data-sonner-toast][data-expanded="false"][data-front="false"][data-styled="true"] > * {
        visibility: hidden;
      }
    `;
    document.head.appendChild(style);
    document.body.innerHTML = `
      <ol data-sonner-toaster="true">
        <li data-sonner-toast data-styled="true" data-index="0" data-front="true" data-expanded="false">
          <div data-content><div data-title id="front">Profile update failed.</div></div>
        </li>
        <li data-sonner-toast data-styled="true" data-index="1" data-front="false" data-expanded="false">
          <div data-content id="back-content"><div data-title id="back">Profile updated.</div></div>
        </li>
      </ol>`;
  }

  it("hides the back toast's title and leaves the front one visible", () => {
    mountStack();
    expect(getComputedStyle(document.getElementById("back-content")!).visibility).toBe("hidden");
    expect(getComputedStyle(document.getElementById("back")!).visibility).toBe("hidden");
    expect(getComputedStyle(document.getElementById("front")!).visibility).not.toBe("hidden");
  });
});
