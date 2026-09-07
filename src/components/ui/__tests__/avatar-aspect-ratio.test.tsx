import * as RadixAvatar from "@radix-ui/react-avatar";
import { act, render } from "@testing-library/react";
import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AspectRatio } from "../aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";

/*
 * Hai primitive này React Aria KHÔNG có, nên chúng được TỰ DỰNG chứ không ánh
 * xạ. Radix vẫn còn trong node_modules ở nhánh này, nên phần so được thì SO,
 * phần không so được thì khẳng định trực tiếp — và nói rõ vì sao không so được.
 *
 *   Avatar      — SO ĐƯỢC từng ký tự. DOM là <span>/<img>/<span>, cùng thứ tự
 *                 thuộc tính, và logic tải ảnh được dựng lại đúng như Radix
 *                 (`new Image()` rời + trạng thái dùng chung qua context).
 *   AspectRatio — KHÔNG so được, CỐ Ý. Radix phát hai node (wrapper
 *                 `padding-bottom` + con `position:absolute`), bản này phát
 *                 MỘT node với thuộc tính CSS `aspect-ratio`. Đó chính là thay
 *                 đổi được yêu cầu, nên phần đó là khẳng định trực tiếp.
 */

function markup(el: HTMLElement) {
  return (el.firstElementChild as HTMLElement).outerHTML;
}

/*
 * Cả bản này lẫn Radix đều dò bằng `new window.Image()`, nên MỘT bản giả duy
 * nhất lái được cả hai — đó là điều làm phép so sánh ở dưới có nghĩa. jsdom
 * không tải ảnh: không có bản giả thì mọi ảnh đứng mãi ở "loading" và ba nhánh
 * (về / hỏng / chưa về) không phân biệt được.
 */
class FakeImage {
  static instances: FakeImage[] = [];

  complete = false;
  naturalWidth = 0;
  crossOrigin: string | null = null;
  referrerPolicy = "";
  src = "";

  private listeners: Record<string, Array<(event: unknown) => void>> = {};

  constructor() {
    FakeImage.instances.push(this);
  }

  addEventListener(type: string, callback: (event: unknown) => void) {
    (this.listeners[type] ??= []).push(callback);
  }

  removeEventListener(type: string, callback: (event: unknown) => void) {
    this.listeners[type] = (this.listeners[type] ?? []).filter((item) => item !== callback);
  }

  /** Ảnh về: `complete` VÀ `naturalWidth > 0` — hai điều kiện, không phải một. */
  succeed() {
    this.complete = true;
    this.naturalWidth = 64;
    for (const callback of this.listeners.load ?? []) {
      callback({ currentTarget: this });
    }
  }

  fail() {
    this.complete = true;
    this.naturalWidth = 0;
    for (const callback of this.listeners.error ?? []) {
      callback({ currentTarget: this });
    }
  }
}

beforeEach(() => {
  FakeImage.instances = [];
  vi.stubGlobal("Image", FakeImage);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

type Outcome = "loaded" | "error" | "pending";

/** Dựng cây, rồi lái CÁI probe mà chính cây đó vừa tạo tới kết cục đã cho. */
function renderWithImage(ui: React.ReactElement, outcome: Outcome) {
  const before = FakeImage.instances.length;
  const view = render(ui);
  const image = FakeImage.instances[before];

  if (image && outcome !== "pending") {
    act(() => {
      if (outcome === "loaded") {
        image.succeed();
      } else {
        image.fail();
      }
    });
  }

  return view;
}

/** Cùng một cây, dựng bằng bản này và bằng Radix, với y hệt móc CSS. */
function pair(outcome: Outcome, { delayMs }: { delayMs?: number } = {}) {
  const mine = renderWithImage(
    <Avatar>
      <AvatarImage src="/tanaka.png" alt="田中" />
      <AvatarFallback delayMs={delayMs}>田</AvatarFallback>
    </Avatar>,
    outcome,
  );
  const radix = renderWithImage(
    <RadixAvatar.Root data-slot="avatar" className="ui-avatar">
      <RadixAvatar.Image
        data-slot="avatar-image"
        className="ui-avatar-image"
        alt="田中"
        src="/tanaka.png"
      />
      <RadixAvatar.Fallback
        data-slot="avatar-fallback"
        className="ui-avatar-fallback"
        delayMs={delayMs}
      >
        田
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>,
    outcome,
  );

  return { mine: markup(mine.container), radix: markup(radix.container) };
}

describe("Avatar — khớp từng điểm với @radix-ui/react-avatar", () => {
  it("chưa về: fallback đứng thay, KHÔNG có <img> nào trong DOM", () => {
    const { mine, radix } = pair("pending");

    expect(mine).toBe(radix);
    expect(mine).toContain('data-slot="avatar-fallback"');
    expect(mine).not.toContain("<img");
  });

  it("ảnh về: <img> hiện, fallback biến mất", () => {
    const { mine, radix } = pair("loaded");

    expect(mine).toBe(radix);
    expect(mine).toContain(
      '<img data-slot="avatar-image" class="ui-avatar-image" alt="田中" src="/tanaka.png">',
    );
    expect(mine).not.toContain('data-slot="avatar-fallback"');
  });

  it("ảnh HỎNG: fallback ở lại, và thẻ ảnh vỡ không bao giờ vào DOM", () => {
    const { mine, radix } = pair("error");

    expect(mine).toBe(radix);
    expect(mine).toContain('data-slot="avatar-fallback"');
    expect(mine).not.toContain("<img");
  });

  it("KHÔNG có src: coi như hỏng ngay, fallback hiện", () => {
    const mine = render(
      <Avatar>
        <AvatarImage alt="田中" />
        <AvatarFallback>田</AvatarFallback>
      </Avatar>,
    );
    const radix = render(
      <RadixAvatar.Root data-slot="avatar" className="ui-avatar">
        <RadixAvatar.Image data-slot="avatar-image" className="ui-avatar-image" alt="田中" />
        <RadixAvatar.Fallback data-slot="avatar-fallback" className="ui-avatar-fallback">
          田
        </RadixAvatar.Fallback>
      </RadixAvatar.Root>,
    );

    expect(markup(mine.container)).toBe(markup(radix.container));
    expect(markup(mine.container)).toContain('data-slot="avatar-fallback"');
  });

  it("ảnh đã nằm sẵn trong cache: `loaded` đọc ĐỒNG BỘ, không đợi sự kiện nào", () => {
    /*
     * Trình duyệt không bắn `load` cho ảnh đã cache — nó chỉ đặt `complete`.
     * Bỏ lượt đọc đồng bộ sau khi gán `src` là avatar đứng mãi ở fallback trên
     * mọi lượt điều hướng thứ hai, và không test nào dựa vào sự kiện bắt được.
     */
    class CachedImage extends FakeImage {
      constructor() {
        super();
        this.complete = true;
        this.naturalWidth = 64;
      }
    }
    vi.stubGlobal("Image", CachedImage);

    const mine = render(
      <Avatar>
        <AvatarImage src="/tanaka.png" alt="田中" />
        <AvatarFallback>田</AvatarFallback>
      </Avatar>,
    );
    const radix = render(
      <RadixAvatar.Root data-slot="avatar" className="ui-avatar">
        <RadixAvatar.Image
          data-slot="avatar-image"
          className="ui-avatar-image"
          alt="田中"
          src="/tanaka.png"
        />
        <RadixAvatar.Fallback data-slot="avatar-fallback" className="ui-avatar-fallback">
          田
        </RadixAvatar.Fallback>
      </RadixAvatar.Root>,
    );

    expect(markup(mine.container)).toBe(markup(radix.container));
    expect(markup(mine.container)).toContain("<img");
  });

  it("`delayMs`: fallback im lặng cho tới hạn, rồi mới được vẽ", () => {
    vi.useFakeTimers();

    const before = pair("pending", { delayMs: 600 });
    expect(before.mine).toBe(before.radix);
    expect(before.mine).not.toContain('data-slot="avatar-fallback"');

    act(() => {
      vi.advanceTimersByTime(600);
    });

    const [mineRoot, radixRoot] = Array.from(
      document.querySelectorAll('[data-slot="avatar"]'),
    ) as HTMLElement[];
    expect(mineRoot.outerHTML).toBe(radixRoot.outerHTML);
    expect(mineRoot.outerHTML).toContain('data-slot="avatar-fallback"');
  });

  it("`delayMs`: ảnh về TRƯỚC hạn thì fallback không bao giờ nháy", () => {
    vi.useFakeTimers();

    const { mine, radix } = pair("loaded", { delayMs: 600 });
    expect(mine).toBe(radix);
    // `田` một mình không kiểm được gì: nó cũng nằm trong `alt="田中"` của thẻ ảnh.
    expect(mine).not.toContain('data-slot="avatar-fallback"');

    act(() => {
      vi.advanceTimersByTime(600);
    });

    const [mineRoot, radixRoot] = Array.from(
      document.querySelectorAll('[data-slot="avatar"]'),
    ) as HTMLElement[];
    expect(mineRoot.outerHTML).toBe(radixRoot.outerHTML);
    expect(mineRoot.outerHTML).not.toContain('data-slot="avatar-fallback"');
  });

  it("`onLoadingStatusChange` bắn khi trạng thái ĐỔI, không bắn mỗi lượt render", () => {
    const mineSpy = vi.fn();
    const radixSpy = vi.fn();

    renderWithImage(
      <Avatar>
        <AvatarImage src="/tanaka.png" alt="田中" onLoadingStatusChange={mineSpy} />
        <AvatarFallback>田</AvatarFallback>
      </Avatar>,
      "loaded",
    );
    renderWithImage(
      <RadixAvatar.Root>
        <RadixAvatar.Image src="/tanaka.png" alt="田中" onLoadingStatusChange={radixSpy} />
        <RadixAvatar.Fallback>田</RadixAvatar.Fallback>
      </RadixAvatar.Root>,
      "loaded",
    );

    expect(mineSpy.mock.calls).toEqual(radixSpy.mock.calls);
    expect(mineSpy).toHaveBeenLastCalledWith("loaded");
  });

  it("dùng ngoài `<Avatar>` thì ném lỗi, không lặng lẽ dựng ra một nửa avatar", () => {
    expect(() => render(<AvatarFallback>田</AvatarFallback>)).toThrow(
      /must be used within `Avatar`/,
    );
  });

  it("`presence` — phần Radix KHÔNG có, nên khẳng định trực tiếp", () => {
    const { container } = render(
      <Avatar presence="online" presenceLabel="Online">
        <AvatarFallback>田</AvatarFallback>
      </Avatar>,
    );
    const root = container.querySelector('[data-slot="avatar"]')!;

    expect(root).toHaveAttribute("data-presence", "online");
    expect(root.querySelector('[data-slot="avatar-presence"]')).toHaveTextContent("Online");
  });
});

describe("AspectRatio — một node, thuộc tính CSS `aspect-ratio`", () => {
  /*
   * KHÔNG so với Radix ở đây, và đó là điểm của bài: Radix phát
   *   <div data-radix-aspect-ratio-wrapper style="position:relative;width:100%;padding-bottom:56.25%">
   *     <div data-slot="aspect-ratio" style="position:absolute;top:0;right:0;bottom:0;left:0">
   * còn bản này phát đúng một node. Đã kiểm `src/styles/`: không luật nào bám
   * vào `[data-radix-aspect-ratio-wrapper]` hay vào việc `.ui-aspect-ratio`
   * phải là con của node khác — luật duy nhất chạm tới nó là
   * `.ui-aspect-ratio { overflow: clip; overflow-clip-margin }` trong
   * `layout.css`, bám vào CHÍNH node còn lại.
   */
  it("phát MỘT node, mang móc CSS và tỉ lệ", () => {
    const { container } = render(
      <AspectRatio ratio={16 / 9}>
        <img data-testid="media" src="/x.png" alt="ビル" />
      </AspectRatio>,
    );

    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-slot", "aspect-ratio");
    expect(root).toHaveClass("ui-aspect-ratio");
    expect(root.style.aspectRatio).toBe(`${16 / 9} / 1`);
    expect(root.style.position).toBe("relative");
    expect(root.style.width).toBe("100%");
    // Con là con TRỰC TIẾP — không còn tầng bọc nào ở giữa.
    expect(root.querySelector('[data-testid="media"]')?.parentElement).toBe(root);
  });

  it("wrapper `padding-bottom` của Radix đã biến mất hẳn", () => {
    const { container } = render(
      <AspectRatio ratio={1}>
        <div>square</div>
      </AspectRatio>,
    );

    expect(container.querySelector("[data-radix-aspect-ratio-wrapper]")).toBeNull();
    expect(container.innerHTML).not.toContain("padding-bottom");
  });

  it("mặc định 16/9, và consumer KHÔNG ghi đè được phần định vị của hộp", () => {
    const { container } = render(
      <AspectRatio className="rounded-md" style={{ position: "static", color: "red" }}>
        <div>x</div>
      </AspectRatio>,
    );

    const root = container.firstElementChild as HTMLElement;
    expect(root.style.aspectRatio).toBe(`${16 / 9} / 1`);
    expect(root).toHaveClass("rounded-md");
    // Style của consumer đi qua, trừ đúng phần làm hộp thôi là hộp tỉ lệ.
    expect(root.style.color).toBe("red");
    expect(root.style.position).toBe("relative");
  });

  it("`asChild` mượn thẻ của con — API cũ giữ nguyên sau khi bỏ Radix", () => {
    const { container } = render(
      <AspectRatio asChild ratio={4 / 3}>
        <a href="/poster">poster</a>
      </AspectRatio>,
    );

    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe("A");
    expect(root).toHaveClass("ui-aspect-ratio");
    expect(root.style.aspectRatio).toBe(`${4 / 3} / 1`);
  });
});
