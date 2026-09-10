import { describe, expect, it } from "vitest";
import { OverlayPortalProvider } from "@/app";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/data-display/popover";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/feedback/dialog";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/feedback/sheet";
import { Button } from "@/components/general/button";
import { renderWithUi, screen, userEvent } from "@/test/render";

/**
 * EVERY overlay portals out of the tree that declared it — it has to, or an `overflow: hidden`
 * ancestor clips it. The destination is `document.body`, which is right everywhere except inside a
 * SHADOW ROOT: there it lands outside the tree carrying this library's stylesheet and renders with
 * none of it. Measured on an embedded bar before this provider existed: `border: 0`, `radius: 0`,
 * `background: transparent`, and the anchor maths 40px off.
 *
 * One provider rather than a prop per component, because a consumer asked to remember six props
 * gets five of them right — and because a component that owns its own overlay (AppLauncher) is
 * unreachable by any prop the consumer passes to it.
 */

function portalTarget() {
    const target = document.createElement("div");
    target.id = "portal-target";
    document.body.appendChild(target);

    return target;
}

describe("OverlayPortalProvider", () => {
    it("puts a Popover panel in the given container instead of document.body", async () => {
        const user = userEvent.setup();
        const target = portalTarget();

        renderWithUi(
            <OverlayPortalProvider container={target}>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button>開く</Button>
                    </PopoverTrigger>
                    <PopoverContent>パネル</PopoverContent>
                </Popover>
            </OverlayPortalProvider>,
        );

        await user.click(screen.getByRole("button", { name: "開く" }));

        const panel = await screen.findByText("パネル");
        expect(target.contains(panel)).toBe(true);
    });

    it("moves a Dialog and a Sheet too — the provider is not popover-specific", async () => {
        const user = userEvent.setup();
        const target = portalTarget();

        const { unmount } = renderWithUi(
            <OverlayPortalProvider container={target}>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>ダイアログ</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>題名</DialogTitle>
                    </DialogContent>
                </Dialog>
            </OverlayPortalProvider>,
        );
        await user.click(screen.getByRole("button", { name: "ダイアログ" }));
        expect(target.contains(await screen.findByText("題名"))).toBe(true);
        unmount();

        renderWithUi(
            <OverlayPortalProvider container={target}>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button>シート</Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetTitle>見出し</SheetTitle>
                    </SheetContent>
                </Sheet>
            </OverlayPortalProvider>,
        );
        await user.click(screen.getByRole("button", { name: "シート" }));
        expect(target.contains(await screen.findByText("見出し"))).toBe(true);
    });

    it("leaves the default alone when no provider is present", async () => {
        const user = userEvent.setup();
        const target = portalTarget();

        renderWithUi(
            <Popover>
                <PopoverTrigger asChild>
                    <Button>既定</Button>
                </PopoverTrigger>
                <PopoverContent>既定パネル</PopoverContent>
            </Popover>,
        );

        await user.click(screen.getByRole("button", { name: "既定" }));

        const panel = await screen.findByText("既定パネル");
        expect(target.contains(panel)).toBe(false);
        expect(document.body.contains(panel)).toBe(true);
    });

    it("lets one panel opt out without unmounting the provider around it", async () => {
        const user = userEvent.setup();
        const provided = portalTarget();
        const elsewhere = portalTarget();

        renderWithUi(
            <OverlayPortalProvider container={provided}>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button>例外</Button>
                    </PopoverTrigger>
                    <PopoverContent portalContainer={elsewhere}>例外パネル</PopoverContent>
                </Popover>
            </OverlayPortalProvider>,
        );

        await user.click(screen.getByRole("button", { name: "例外" }));

        const panel = await screen.findByText("例外パネル");
        expect(elsewhere.contains(panel)).toBe(true);
        expect(provided.contains(panel)).toBe(false);
    });
});
