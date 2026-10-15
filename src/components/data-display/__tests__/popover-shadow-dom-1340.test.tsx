import { describe, expect, it, vi } from "vitest";
import { renderWithUi, userEvent } from "@/test/render";

import { OverlayPortalProvider } from "../../../lib/overlay-portal";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "../popover";

/**
 * gh#1340 — PopoverContent inside a SHADOW ROOT (GoDX Dock: the whole app mounted in a shadow
 * root, `OverlayPortalProvider` pointing every overlay back into it).
 *
 * The outside-press listener sits on `document`. By the time a press inside the shadow tree gets
 * there, `event.target` has been retargeted to the shadow HOST, so the old
 * `contentRef.current.contains(event.target)` read a press on a button INSIDE the panel as outside,
 * and the panel closed on pointerdown — the click never reached the button. jsdom retargets for a
 * real `attachShadow` tree exactly as a browser does (float-button.test.tsx relies on the same).
 */
function mountShadowHost() {
  const host = document.createElement("div");
  document.body.append(host);
  const shadow = host.attachShadow({ mode: "open" });
  const mount = document.createElement("div");
  const portal = document.createElement("div");
  shadow.append(mount, portal);
  const outside = document.createElement("button");
  outside.textContent = "outside the host";
  document.body.append(outside);
  return { host, shadow, mount, portal, outside };
}

function Dock({
  portal,
  onOpenChange,
  onView,
}: {
  portal: HTMLElement;
  onOpenChange: (open: boolean) => void;
  onView: () => void;
}) {
  return (
    <OverlayPortalProvider container={portal}>
      <Popover defaultOpen onOpenChange={onOpenChange}>
        <PopoverTrigger>Notifications</PopoverTrigger>
        <PopoverContent>
          <button type="button" data-testid="view" onClick={onView}>
            View
          </button>
        </PopoverContent>
      </Popover>
    </OverlayPortalProvider>
  );
}

function setup() {
  const dom = mountShadowHost();
  const onOpenChange = vi.fn();
  const onView = vi.fn();
  const view = renderWithUi(
    <Dock portal={dom.portal} onOpenChange={onOpenChange} onView={onView} />,
    { container: dom.mount },
  );
  const cleanup = () => {
    view.unmount();
    dom.host.remove();
    dom.outside.remove();
  };
  return { ...dom, onOpenChange, onView, cleanup };
}

describe("PopoverContent in a shadow root (gh#1340)", () => {
  it("renders the panel inside the shadow root, through the portal container", () => {
    const { shadow, portal, cleanup } = setup();
    expect(portal.querySelector('[data-testid="view"]')).not.toBeNull();
    expect(shadow.querySelector('[data-testid="view"]')).not.toBeNull();
    cleanup();
  });

  it("a press on a button INSIDE the panel keeps it open and the click lands", async () => {
    const user = userEvent.setup();
    const { shadow, onOpenChange, onView, cleanup } = setup();

    await user.click(shadow.querySelector('[data-testid="view"]') as HTMLElement);

    expect(onView).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(shadow.querySelector('[data-testid="view"]')).not.toBeNull();
    cleanup();
  });

  it("a press OUTSIDE the host still closes it", async () => {
    const user = userEvent.setup();
    const { shadow, outside, onOpenChange, cleanup } = setup();

    await user.click(outside);

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(shadow.querySelector('[data-testid="view"]')).toBeNull();
    cleanup();
  });

  it("a press on the trigger does exactly what it does in the light DOM", async () => {
    const user = userEvent.setup();

    // The light-DOM reference, measured rather than assumed.
    const lightOnOpenChange = vi.fn();
    const light = renderWithUi(
      <Popover defaultOpen onOpenChange={lightOnOpenChange}>
        <PopoverTrigger>Notifications</PopoverTrigger>
        <PopoverContent>
          <button type="button">View</button>
        </PopoverContent>
      </Popover>,
    );
    await user.click(light.getByText("Notifications"));
    const lightOpen = light.queryByText("View") !== null;
    light.unmount();

    const { shadow, onOpenChange, cleanup } = setup();
    const trigger = [...shadow.querySelectorAll("button")].find(
      (button) => button.textContent === "Notifications",
    ) as HTMLElement;
    await user.click(trigger);

    expect(onOpenChange.mock.calls).toEqual(lightOnOpenChange.mock.calls);
    expect(shadow.querySelector('[data-testid="view"]') !== null).toBe(lightOpen);
    cleanup();
  });

  it("an anchored popover treats a press on its anchor as inside", async () => {
    const user = userEvent.setup();
    const dom = mountShadowHost();
    const onOpenChange = vi.fn();
    const view = renderWithUi(
      <OverlayPortalProvider container={dom.portal}>
        <Popover defaultOpen onOpenChange={onOpenChange}>
          <PopoverAnchor>
            <span data-testid="anchor">draft box</span>
          </PopoverAnchor>
          <PopoverContent>
            <span data-testid="panel">panel</span>
          </PopoverContent>
        </Popover>
      </OverlayPortalProvider>,
      { container: dom.mount },
    );

    await user.click(dom.shadow.querySelector('[data-testid="anchor"]') as HTMLElement);

    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(dom.shadow.querySelector('[data-testid="panel"]')).not.toBeNull();
    view.unmount();
    dom.host.remove();
    dom.outside.remove();
  });
});
