import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CODEC_ID, normalize, parse, readDirective, serialize } from "../codec";
import type { DirectiveRenderProps, MarkdownProps } from "../markdown";
import { Markdown } from "../markdown";

/**
 * Directive blocks: a container directive the kit does not model (`:::poll[…]{…}`, `::::form`) is
 * one block a HOST gives meaning to. The codec keeps it byte-stable as a `directive` node, the
 * renderer hands it to a renderer the host registered by name, and without one it renders as
 * before.
 */
const html = (markdown: string, props: Partial<MarkdownProps> = {}) =>
  renderToStaticMarkup(<Markdown {...props}>{markdown}</Markdown>);

const POLL =
  ":::poll[Which launch date works for you?]{id=launch-date type=single reason=optional results=after-vote closes=2026-11-10}\n- 11月15日\n- 11月22日 {#d22}\n- Neither (please explain)\n:::";
const FORM =
  "::::form[Survey]{id=f}\n:::poll[A?]{id=a}\n- x\n- y\n:::\n\n:::poll{type=ack id=b}\nI agree.\n:::\n::::";

describe("codec: directive blocks round-trip byte-stably", () => {
  const CASES: [string, string][] = [
    [POLL, `${POLL}\n`],
    // A value with a colon is quoted on the first normalize, then stays put.
    [
      ':::poll[When?]{id=t closes=2026-11-10T09:00 anonymous note="two words"}\n- a\n- b\n:::',
      ':::poll[When?]{id=t closes="2026-11-10T09:00" anonymous note="two words"}\n- a\n- b\n:::\n',
    ],
    // A label with inline Markdown; a 4-colon opener with nothing inside collapses to 3.
    [
      "::::poll[*Bold* **q** `c` [l](https://x.y)]{id=x}\n- a\n- b\n::::",
      ":::poll[*Bold* **q** `c` [l](https://x.y)]{id=x}\n- a\n- b\n:::\n",
    ],
    [FORM, `${FORM}\n`],
    [":::poll{type=ack id=b}\nI agree.\n:::", ":::poll{type=ack id=b}\nI agree.\n:::\n"],
    [":::poll[Q]{#key .cls}\nbody\n:::", ":::poll[Q]{id=key class=cls}\nbody\n:::\n"],
    [":::aside[x]{a=1}\nbody\n:::", ":::aside[x]{a=1}\nbody\n:::\n"],
    // Inside a callout and a list item: the fences keep the container's prefix.
    [
      "> [!NOTE]\n> :::poll[Q]{id=q}\n> - a\n> - b\n> :::",
      "> [!NOTE]\n>\n> :::poll[Q]{id=q}\n> - a\n> - b\n> :::\n",
    ],
    [
      "- item\n\n  :::poll[Q]{id=q}\n  - a\n  - b\n  :::",
      "- item\n\n  :::poll[Q]{id=q}\n  - a\n  - b\n  :::\n",
    ],
  ];

  it.each(CASES)("normalizes %j once, then stays put", (markdown, canonical) => {
    expect(normalize(markdown)).toBe(canonical);
    expect(normalize(canonical)).toBe(canonical);
  });

  it("is one `directive` node with its name and canonical source", () => {
    expect(parse(POLL).content).toEqual([
      { type: "directive", attrs: { name: "poll", source: POLL } },
    ]);
    // A form is ONE block; its polls live in its source.
    expect(parse(FORM).content).toEqual([
      { type: "directive", attrs: { name: "form", source: FORM } },
    ]);
    expect(serialize(parse(FORM))).toBe(`${FORM}\n`);
  });

  it("keeps a malformed toggle or column row a raw block, not a host block", () => {
    expect(parse(":::toggle[x]{a=1}\nbody\n:::").content[0]!.type).toBe("rawBlock");
    expect(parse("::::columns\n:::column\nA\n:::\n::::").content[0]!.type).toBe("rawBlock");
  });

  it("writes every body exactly as before (the codec id does not move)", () => {
    expect(CODEC_ID).toBe("kit-md@2");
  });

  it("reads a directive's parts back from its source", () => {
    expect(readDirective(POLL)).toEqual({
      name: "poll",
      label: "Which launch date works for you?",
      attributes: {
        id: "launch-date",
        type: "single",
        reason: "optional",
        results: "after-vote",
        closes: "2026-11-10",
      },
      source: POLL,
      body: "- 11月15日\n- 11月22日 {#d22}\n- Neither (please explain)",
    });
    expect(readDirective(":::poll{type=ack anonymous}\n:::")).toMatchObject({
      label: null,
      attributes: { type: "ack", anonymous: "" },
      body: "",
    });
    expect(readDirective("not a directive")).toBeNull();
    expect(readDirective(`${POLL}\n\nmore`)).toBeNull();
  });
});

describe("renderer: host directive renderers", () => {
  const seen: DirectiveRenderProps[] = [];
  const poll = (block: DirectiveRenderProps) => {
    seen.push(block);
    return (
      <section data-poll={block.attributes.id}>
        {block.label}|{Object.keys(block.attributes).join(",")}
      </section>
    );
  };

  it("draws a registered directive with the host's renderer, parts as written", () => {
    seen.length = 0;
    expect(html(POLL, { directives: { poll } })).toBe(
      '<section data-poll="launch-date">Which launch date works for you?|id,type,reason,results,closes</section>',
    );
    expect(seen[0]).toMatchObject({
      name: "poll",
      label: "Which launch date works for you?",
      attributes: { id: "launch-date", closes: "2026-11-10" },
      source: POLL,
      body: "- 11月15日\n- 11月22日 {#d22}\n- Neither (please explain)",
    });
  });

  it("slices a block inside a callout free of the callout's `> `", () => {
    seen.length = 0;
    html("> [!NOTE]\n> :::poll[*Q*]{id=q}\n> - a\n>\n> - b\n> :::", { directives: { poll } });
    expect(seen[0]).toMatchObject({
      label: "*Q*",
      source: ":::poll[*Q*]{id=q}\n- a\n\n- b\n:::",
      body: "- a\n\n- b",
    });
  });

  it("renders an unregistered directive — or one the host declines — exactly as before", () => {
    const plain = html(FORM);
    expect(html(FORM, { directives: { other: poll } })).toBe(plain);
    expect(html(FORM, { directives: { poll: () => undefined, form: () => undefined } })).toBe(
      plain,
    );
  });

  it("hands a container its rendered content, label excluded — a form's poll cards", () => {
    const out = html(FORM, {
      directives: {
        poll,
        form: (block) => (
          <form aria-label={block.label ?? undefined} data-id={block.attributes.id}>
            {block.children}
          </form>
        ),
      },
    });
    expect(out).toBe(
      '<form aria-label="Survey" data-id="f"><section data-poll="a">A?|id</section><section data-poll="b">|type,id</section></form>',
    );
  });

  it("ignores a name that is only an Object.prototype key", () => {
    const body = ":::constructor\nx\n:::";
    expect(html(body, { directives: { poll } })).toBe(html(body));
  });

  it("never lets a host take over the kit's own toggle and columns", () => {
    const toggle = ":::toggle[Summary]\nBody\n:::";
    expect(html(toggle, { directives: { toggle: () => <b>no</b> } })).toBe(html(toggle));
  });

  it("keeps a host `div` override for every other div", () => {
    const out = html("> [!NOTE]\n> x\n\n" + POLL, {
      directives: { poll },
      components: { div: (props) => <div data-host="" className={props.className} /> },
    });
    expect(out).toContain('<div data-host="" class="ui-prose-callout"></div>');
    expect(out).toContain('<section data-poll="launch-date">');
    expect(out).not.toContain("data-directive");
  });
});
