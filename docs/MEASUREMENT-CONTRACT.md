# Measurement contract

**What box this library means when it says a target is 24×24, and where the `--space-*` scale stops
applying.** The facts below also ship as data at
`node_modules/@godxjp/ui/dist/contracts/measurement.json`, so a gate can read them without reading
this page.

## Why this page exists

Three issues — [#503], [#506], [#507] — were each closed and reopened four times between 23.0.0 and
23.4.5. Every reopening carried a correct measurement. Every closing carried a correct fix. The two
sides were measuring different boxes:

| issue | the consumer's gate read | what the library ships       |
| ----- | ------------------------ | ---------------------------- |
| #507  | `20×20`                  | a **24×24** target           |
| #506  | `24×13`                  | a **24×26** target           |
| #503  | text `5.1px` from edge   | 5.1px **derived** from the band |

`getBoundingClientRect()` returns an element's **border box**, and a border box does not include an
absolutely-positioned pseudo-element. So a gate built on it reports the same number forever no
matter what the library ships — which means it cannot tell *fixed* from *ignored*, and reopening the
issue is the correct thing for it to do. Prose could not close that gap either: `docs/SPACING.md`
carried the #503 derivation from 23.4.0 onward and the issue was reopened twice afterwards, because
a gate cannot read prose.

## Target size

**WCAG 2.2 SC 2.5.8 Target Size (Minimum), level AA — 24×24 CSS px.** The criterion measures the
**target**: the region that accepts the pointer action. That is not always the painted box, and
carrying the target on a pseudo-element is the technique [Understanding 2.5.8] names.

This library does that in three places, because in each one growing the **paint** would move
geometry that belongs to something else:

| selector                        | paint stays | why the paint cannot grow                                                   |
| ------------------------------- | ----------- | --------------------------------------------------------------------------- |
| `.ui-control-inline-affix-action` | 20×20     | it is an affix inside a 32px field; growing it moves the field's own geometry |
| `.ui-number-input-step`         | 24×13       | two steppers stacked in a 32px band — 24×2 = 48 does not fit                 |
| `.ui-data-table-sort-button`     | header size | a header cell's height is the table's row rhythm                            |

The authoritative list is `targetSize.expanders` in `dist/contracts/measurement.json`; it is
generated from the CSS, and `scripts/check-measurement-contract.mjs` proves every entry in a real
browser before release, so it cannot claim a target the library does not ship.

### Measuring a target

Scan outward from the centre with `elementFromPoint` until the point stops belonging to the element.
This reads the real target, and it also catches the case `getBoundingClientRect` misses in the other
direction — a 44×44 button half-covered by something else still reports 44×44 from its rect.

```js
function hitRegion(el) {
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const edge = (dx, dy) => {
    let reach = 0;
    for (let i = 0; i <= 40; i += 0.25) {
      const hit = document.elementFromPoint(cx + dx * i, cy + dy * i);
      if (hit === el || el.contains(hit)) reach = i;
      else break;
    }
    return reach;
  };
  return { width: edge(-1, 0) + edge(1, 0), height: edge(0, -1) + edge(0, 1) };
}
```

If your gate cannot run a hit-test, read the contract and treat a listed selector as conforming at
its `targetMin` instead:

```js
const contract = require("@godxjp/ui/contracts/measurement.json");
const expanded = contract.targetSize.expanders.map((e) => e.selector);

// inside the gate, per candidate element:
if (expanded.some((sel) => el.matches(sel) || el.closest(sel))) return; // target is on a ::after
```

## Spacing

`--space-*` measures the distance **between** things: page sections, siblings in a stack, a card's
shell against its content. It is **not** a floor for the **interior** of a control — that geometry
derives from the control band (`--control-height`, `--control-padding-x`).

```
interior height = --control-height − (interior padding × 2)
```

A gate can tell the two apart at runtime without a selector list:

> An element is a control when its painted block-size equals the resolved `--control-height` for its
> size.

`Segmented`'s track satisfies it, and so do `Button`, `Input` and `Select` — which is the useful part
of the test: a `--space-2` floor applied inside a control flags all four, not just the one that got
reported. `docs/SPACING.md` § *Control interiors are NOT on this scale* carries the full derivation
and the `--segmented-track-padding` knob for a service that wants a roomier control.

## MCP

`get_rule` · `list_audit_rules` · `get_tokens` — and `draft_bug_report` if a measurement taken this
way still disagrees with what the library claims. Bring the number; that is what this page is for.

[#503]: https://github.com/godx-jp/godxjp-ui/issues/503
[#506]: https://github.com/godx-jp/godxjp-ui/issues/506
[#507]: https://github.com/godx-jp/godxjp-ui/issues/507
[understanding 2.5.8]: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
