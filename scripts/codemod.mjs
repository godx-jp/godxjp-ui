#!/usr/bin/env node
/**
 * `npx godxjp-ui codemod v32 [paths…] [--godx] [--dry-run]` — the mechanical half of upgrading to
 * v32 (docs/migrations/v32.md). What it cannot decide, it reports instead of guessing.
 *
 *   --godx      the app is a GoDX product: keep today's look with the GoDX preset (violet, the GoDX
 *               mark, vi default locale, the Japanese fonts)
 *   --dry-run   list every change without writing
 *
 * Transforms (each one idempotent: running twice changes nothing the second time):
 *  1. fonts are opt-in (gh#1221): after an import of "@godxjp/ui/styles", add the fonts import.
 *  2. with --godx (gh#1220): add the preset stylesheet after it, and `preset={godxPreset}` (+ its
 *     import) to every `<AppProvider` that has no `preset`.
 *  3. component renames/moves (gh#1223): import specifiers rewritten from RENAMES below.
 * Reported, not changed: an `<AppProvider` with no `defaultLocale` and no preset now starts in `en`
 * (or `<html lang>`), not `vi` (gh#1219).
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

/**
 * gh#1223 import renames: `{ from: [module, name], to: [module, name] }`. A JSX usage of the old
 * name is renamed with it. Moves that change props (Banner → Alert variant) carry `note`, which is
 * reported for the human to finish.
 */
const UI = (group) => [`@godxjp/ui/${group}`, "@godxjp/ui"];
/**
 * `add`: props written onto every opening tag of the renamed component (unless that prop is already
 * there). `map`: prop values rewritten in the same tag. `note`: what only a person can finish.
 */
const rename = (groups, from, toMod, to, extra = {}) => ({
  from: [groups, from],
  to: [toMod, to],
  ...(typeof extra === "string" ? { note: extra } : extra),
});
const move = (groups, toMod, names) => names.map((n) => rename(groups, n, toMod, n));

export const RENAMES = [
  rename(UI("feedback"), "Banner", "@godxjp/ui/feedback", "Alert", { add: { variant: "banner" } }),
  rename(UI("feedback"), "Callout", "@godxjp/ui/feedback", "Alert", {
    add: { variant: "callout" },
  }),
  rename(UI("data-entry"), "TagInput", "@godxjp/ui/data-entry", "Select", {
    add: { mode: "tags", open: "{false}" },
    note: "Select takes no ref; move a ref to a wrapper element",
  }),
  rename(UI("data-display"), "Thumbnail", "@godxjp/ui/data-display", "Image", {
    add: { fit: "intrinsic", preview: "{false}" },
  }),
  rename(UI("data-display"), "HoverCard", "@godxjp/ui/data-display", "Popover", {
    add: { openOn: "hover" },
  }),
  rename(UI("data-display"), "HoverCardTrigger", "@godxjp/ui/data-display", "PopoverTrigger"),
  rename(UI("data-display"), "HoverCardContent", "@godxjp/ui/data-display", "PopoverContent"),
  rename(UI("layout"), "AuthShell", "@godxjp/ui/layout", "CenteredShell", {
    add: { variant: "auth" },
    map: { variant: { canonical: "auth-canonical" } },
  }),
  rename(UI("layout"), "SpaceCompact", "@godxjp/ui/layout", "Flex", {
    add: { attached: true },
    note: 'orientation="vertical" / vertical becomes direction="col"',
  }),
  rename(UI("navigation"), "AppSettingToggle", "@godxjp/ui/navigation", "AppSettingPicker", {
    add: { menu: "{false}" },
  }),
  rename(UI("general"), "Title", "@godxjp/ui/general", "Heading", {
    note: "Title (antd shim) was removed: check level / size on Heading",
  }),
  rename(UI("general"), "Paragraph", "@godxjp/ui/general", "Text", {
    add: { as: "p" },
    note: "ellipsis.rows becomes clamp",
  }),
  rename(UI("general"), "Typography", "@godxjp/ui/data-display", "Prose", {
    note: "Typography (antd shim) was removed: check the children render as prose",
  }),
  // Prop types whose component was merged (gh#1223): the new name, where one exists.
  rename(UI("layout"), "AuthShellProp", "@godxjp/ui/layout", "CenteredShellAuthProp"),
  rename(UI("layout"), "AuthShellProps", "@godxjp/ui/layout", "CenteredShellAuthProp"),
  rename(
    UI("navigation"),
    "AppSettingToggleProp",
    "@godxjp/ui/navigation",
    "AppSettingPickerCycleProp",
  ),
  rename(
    UI("navigation"),
    "AppSettingToggleProps",
    "@godxjp/ui/navigation",
    "AppSettingPickerCycleProp",
  ),
  rename(UI("navigation"), "AppSettingToggleKind", "@godxjp/ui/navigation", "AppSettingCycleKind"),
  rename(UI("feedback"), "SkeletonAvatarProp", "@godxjp/ui/feedback", "SkeletonArticleAvatarProp"),
  rename(UI("feedback"), "SkeletonAvatarProps", "@godxjp/ui/feedback", "SkeletonArticleAvatarProp"),
  ...move(UI("general"), "@godxjp/ui/lab", [
    "FloatButton",
    "FloatButtonBackTopProp",
    "FloatButtonBackTopProps",
    "FloatButtonBadgeProp",
    "FloatButtonGroupProp",
    "FloatButtonGroupProps",
    "FloatButtonPlacementProp",
    "FloatButtonProp",
    "FloatButtonProps",
    "FloatButtonShapeProp",
    "FloatButtonTooltipProp",
    "FloatButtonTriggerProp",
    "FloatButtonTypeProp",
  ]),
  ...move(UI("layout"), "@godxjp/ui/lab", [
    "PageCover",
    "PageCoverProp",
    "PageCoverProps",
    "DraggablePanel",
    "DraggablePanelProp",
    "DraggablePanelProps",
    "DraggablePanelPlacementProp",
    "DraggablePanelPositionProp",
    "DraggablePanelLabels",
    "DragAxisProp",
    "DragBoundsProp",
    "LegalDocumentShell",
    "LegalDocumentSectionProp",
    "LegalDocumentShellProp",
    "LegalDocumentShellProps",
    "Masonry",
    "MasonryColumnsProp",
    "MasonryGapProp",
    "MasonryItemProp",
    "MasonryLayoutEntryProp",
    "MasonryProp",
    "MasonryProps",
  ]),
  ...move(UI("data-display"), "@godxjp/ui/lab", [
    "Marquee",
    "MarqueeDirectionProp",
    "MarqueeProp",
    "MarqueeProps",
    "MarqueeSpeedProp",
    "TextDiff",
    "diffText",
    "tokenizeText",
    "TextDiffGranularity",
    "TextDiffProp",
    "TextDiffProps",
    "TextDiffSegment",
    "TimelineGrid",
    "TimelineGridColumnProp",
    "TimelineGridEventProp",
    "TimelineGridProp",
    "TimelineGridProps",
    "Carousel",
    "CarouselContent",
    "CarouselItem",
    "CarouselNext",
    "CarouselPrevious",
    "CarouselDots",
    "useCarousel",
    "CarouselApi",
    "RangeTimeline",
    "RangeTimelineProps",
    "RangeTimelineRow",
    "OrgChart",
    "OrgChartNodeProp",
    "OrgChartNodeVariantProp",
    "OrgChartProp",
    "OrgChartProps",
  ]),
  ...move(UI("data-entry"), "@godxjp/ui/lab", [
    "EmojiPicker",
    "SortableList",
    "SortableListItemProp",
    "SortableListProp",
    "SortableListProps",
    "EmojiPickerProp",
    "EmojiPickerProps",
  ]),
  ...move(UI("navigation"), "@godxjp/ui/lab", [
    "MegaMenu",
    "MegaMenuProp",
    "MegaMenuProps",
    "MegaMenuItemProp",
    "MegaMenuItemProps",
    "MegaMenuPanelProp",
    "MegaMenuPanelProps",
    "MegaMenuGroupProp",
    "MegaMenuGroupProps",
    "MegaMenuLinkProp",
    "MegaMenuLinkProps",
    "MegaMenuLinkComponentProp",
    "MegaMenuLinkComponentProps",
    "MegaMenuTriggerActionProp",
    "MegaMenuTriggerActionProps",
    "Anchor",
    "AnchorContainerProp",
    "AnchorDirectionProp",
    "AnchorItemProp",
    "AnchorProp",
    "AnchorProps",
  ]),
  ...move(UI("data-display"), "@godxjp/chat", [
    "ChatBubble",
    "ChatBubbleList",
    "ChatBubbleListProp",
    "ChatBubbleListProps",
    "ChatBubblePlacementProp",
    "ChatBubbleProp",
    "ChatBubbleProps",
    "ChatBubbleToneProp",
    "ChatBubbleTypingProp",
    "ChatBubbleVariantProp",
    "ChatMessageProp",
    "Welcome",
    "WelcomeProp",
    "WelcomeProps",
    "WelcomeVariantProp",
    "ThoughtChain",
    "ThoughtChainItem",
    "ThoughtChainProp",
    "ThoughtChainProps",
    "ThoughtChainItemsProp",
    "ThoughtChainItemProp",
    "ThoughtChainItemProps",
    "ThoughtChainStatusProp",
    "ThoughtChainLineProp",
    "ThoughtChainVariantProp",
  ]),
  ...move(UI("data-entry"), "@godxjp/chat", [
    "ChatComposer",
    "ChatComposerProp",
    "ChatComposerProps",
    "ChatComposerSubmitTypeProp",
    "ChatSuggestion",
    "ChatSuggestionProp",
    "ChatSuggestionProps",
    "ChatSuggestionItemProp",
    "ChatSuggestionRenderProp",
    "Attachments",
    "AttachmentsProp",
    "AttachmentsProps",
    "AttachmentsItemProp",
    "AttachmentsPlaceholderProp",
    "AttachmentsOverflowProp",
    "AttachmentsRefProp",
  ]),
  ...move(UI("navigation"), "@godxjp/chat", [
    "Conversations",
    "ConversationsProp",
    "ConversationsProps",
    "ConversationsItemProp",
    "ConversationsDividerProp",
    "ConversationsEntryProp",
    "ConversationsMenuProp",
    "ConversationsMenuItemProp",
    "ConversationsGroupableProp",
    "ConversationsCreationProp",
  ]),
];

/** Removed with no replacement: reported, never rewritten. */
export const REMOVED = {
  BannerProp: 'use AlertProp with variant="banner"',
  BannerProps: 'use AlertProp with variant="banner"',
  CalloutProp: 'use AlertProp with variant="callout"',
  CalloutProps: 'use AlertProp with variant="callout"',
  ThumbnailProp: 'use ImageProp with fit="intrinsic"',
  ThumbnailProps: 'use ImageProp with fit="intrinsic"',
  ThumbnailSizeProp: "use Image width/height",
  TagInputProps: 'use the Select props (mode="tags")',
  SpaceCompactProp: "use FlexProp with attached",
  SpaceCompactProps: "use FlexProp with attached",
  TypographyProp: "use the Prose props",
  TypographyProps: "use the Prose props",
  TypographyTitleProp: "use HeadingProp",
  TitleProps: "use HeadingProp",
  ParagraphProp: 'use TextProp with as="p"',
  ParagraphProps: 'use TextProp with as="p"',
  SkeletonButtonProp: "use a sized Skeleton",
  SkeletonButtonProps: "use a sized Skeleton",
  SkeletonNodeProp: "use a sized Skeleton",
  SkeletonNodeProps: "use a sized Skeleton",
  SkeletonImageProp: "use a sized Skeleton",
  SkeletonImageProps: "use a sized Skeleton",
  SkeletonAvatar: "use SkeletonArticle avatar, or a sized Skeleton",
  SkeletonButton: "use a sized Skeleton",
  SkeletonImage: "use a sized Skeleton",
  SkeletonNode: "use a sized Skeleton",
};

const SKIP_DIRS = new Set([
  "node_modules",
  "dist",
  "build",
  "vendor",
  ".git",
  "public",
  "coverage",
]);
const CODE = /\.(tsx?|jsx?|mjs|cjs)$/;
const STYLE_IMPORT_CSS = /^([ \t]*)@import\s+(["'])@godxjp\/ui\/styles\2\s*;[ \t]*$/m;
const STYLE_IMPORT_JS = /^([ \t]*)import\s+(["'])@godxjp\/ui\/styles\2\s*;?[ \t]*$/m;
const FONTS = "@godxjp/ui/styles/fonts.css";
const GODX_CSS = "@godxjp/ui/themes/godx.css";

export function transformSource(file, source, { godx = false } = {}) {
  let out = source;
  const notes = [];
  const isCss = file.endsWith(".css");
  const styleImport = isCss ? STYLE_IMPORT_CSS : STYLE_IMPORT_JS;
  const m = out.match(styleImport);
  if (m) {
    const [line, indent, q] = m;
    const add = [];
    if (!out.includes(FONTS) && !out.includes("@godxjp/ui/styles/fonts")) add.push(FONTS);
    if (godx && !out.includes(GODX_CSS)) add.push(GODX_CSS);
    if (add.length) {
      const extra = add
        .map((spec) =>
          isCss ? `${indent}@import ${q}${spec}${q};` : `${indent}import ${q}${spec}${q};`,
        )
        .join("\n");
      out = out.replace(line, `${line}\n${extra}`);
    }
  }
  if (!isCss && /<AppProvider\b/.test(out)) {
    const tags = out.match(/<AppProvider\b[^>]*>/g) ?? [];
    for (const tag of tags) {
      if (/\bpreset=/.test(tag)) continue;
      if (godx) {
        out = out.replace(tag, tag.replace(/^<AppProvider\b/, "<AppProvider preset={godxPreset}"));
      } else if (!/\bdefaultLocale=/.test(tag)) {
        notes.push(
          "<AppProvider> has no defaultLocale and no preset: v32 starts in <html lang> or en (was vi). " +
            'Add defaultLocale="vi" if that is what you meant, or rerun with --godx.',
        );
      }
    }
    if (
      godx &&
      out.includes("preset={godxPreset}") &&
      !/\bgodxPreset\b[^\n]*from\s+["']@godxjp\/ui\/themes\/godx["']/.test(out)
    ) {
      out = addImport(out, 'import { godxPreset } from "@godxjp/ui/themes/godx";');
    }
  }
  if (!isCss) out = applyRenames(out, notes);
  if (!isCss) out = narrowLocaleType(out, notes, godx);
  return { out, changed: out !== source, notes };
}

const IMPORT_RE =
  /import\s*(type\s+)?\{([^}]*)\}\s*from\s*(["'])(@godxjp\/[\w-]+(?:\/[\w-]+)?)\3\s*;?/g;

function applyRenames(source, notes) {
  let out = source;
  const moved = new Map(); // toMod -> [{ spec, typeOnly }]
  const jsxRenames = [];
  out = out.replace(IMPORT_RE, (stmt, typeKw, body, q, mod) => {
    const keep = [];
    let touched = false;
    for (const raw of body
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)) {
      const inlineType = raw.startsWith("type ");
      const spec = raw.replace(/^type\s+/, "");
      const [name, alias] = spec.split(/\s+as\s+/);
      const removed = REMOVED[name];
      if (removed && mod.startsWith("@godxjp/ui"))
        notes.push(`${name} was removed in v32: ${removed}`);
      const r = RENAMES.find((x) => x.from[1] === name && x.from[0].includes(mod));
      if (!r) {
        keep.push(raw);
        continue;
      }
      touched = true;
      const [toMod, toName] = r.to;
      const newSpec = alias ? `${toName} as ${alias}` : toName;
      const list = moved.get(toMod) ?? [];
      list.push({ spec: newSpec, typeOnly: Boolean(typeKw) || inlineType });
      moved.set(toMod, list);
      if (!alias && (toName !== name || r.add || r.map)) jsxRenames.push([name, toName, r]);
      if (r.note) notes.push(`${name} → ${toName}${toMod !== mod ? ` (${toMod})` : ""}: ${r.note}`);
    }
    if (!touched) return stmt;
    return keep.length ? `import ${typeKw ?? ""}{ ${keep.join(", ")} } from ${q}${mod}${q};` : "";
  });
  for (const [from, to, r] of jsxRenames) {
    // Opening tags first, so the props the merge needs land on the element itself.
    out = out.replace(
      new RegExp(`<${from}(?=[\\s>/])([^>]*?)(/?)>`, "g"),
      (_all, attrs, selfClose) => {
        let a = attrs;
        for (const [prop, values] of Object.entries(r.map ?? {})) {
          for (const [oldValue, newValue] of Object.entries(values)) {
            a = a.replace(new RegExp(`\\b${prop}=(["'])${oldValue}\\1`), `${prop}="${newValue}"`);
          }
        }
        for (const [prop, value] of Object.entries(r.add ?? {})) {
          if (new RegExp(`(^|\\s)${prop}(=|\\s|$)`).test(a)) continue;
          const written =
            value === true
              ? prop
              : String(value).startsWith("{")
                ? `${prop}=${value}`
                : `${prop}="${value}"`;
          a = ` ${written}${a}`;
        }
        return `<${to}${a}${selfClose}>`;
      },
    );
    // Closing tags and compound members (`</Callout>`, `<Callout.Title>`).
    out = out.replace(new RegExp(`(</|<)${from}(?=[.>])`, "g"), `$1${to}`);
  }
  for (const [toMod, specs] of moved) {
    for (const typeOnly of [false, true]) {
      const names = specs.filter((x) => x.typeOnly === typeOnly).map((x) => x.spec);
      if (!names.length) continue;
      const existing = new RegExp(
        `import\\s*${typeOnly ? "type\\s+" : ""}\\{([^}]*)\\}\\s*from\\s*(["'])${toMod.replace(/[/]/g, "\\/")}\\2\\s*;?`,
      );
      const m = out.match(existing);
      if (m) {
        const have = m[1]
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean);
        const merged = [...new Set([...have, ...names])];
        out = out.replace(
          m[0],
          `import ${typeOnly ? "type " : ""}{ ${merged.join(", ")} } from ${m[2]}${toMod}${m[2]};`,
        );
      } else {
        out = addImport(
          out,
          `import ${typeOnly ? "type " : ""}{ ${[...new Set(names)].join(", ")} } from "${toMod}";`,
        );
      }
    }
  }
  return out.replace(/\n{3,}/g, "\n\n");
}

/**
 * gh#1219: `AppLocale` widened from "vi" | "en" | "ja" to any BCP-47 string; the old union is now
 * `BuiltInLocale`. Code that indexes a { ja, en, vi } copy table with an AppLocale stops compiling.
 * A GoDX product only uses the built-ins, so under --godx the type is renamed (behaviour unchanged).
 * Otherwise it is reported: the app decides whether it will register other locales.
 */
function narrowLocaleType(source, notes, godx) {
  const imp = source.match(
    /import\s*(type\s+)?\{[^}]*\bAppLocale\b[^}]*\}\s*from\s*["']@godxjp\/ui(?:\/app)?["']/,
  );
  if (!imp) return source;
  if (!godx) {
    notes.push(
      "AppLocale is any BCP-47 string since v32; indexing a { ja, en, vi } table with it no longer type-checks. Use BuiltInLocale for such tables, or rerun with --godx.",
    );
    return source;
  }
  return source.replace(/\bAppLocale\b/g, "BuiltInLocale");
}

function addImport(source, line) {
  const imports = [...source.matchAll(/^import[^;]*;[ \t]*$/gm)];
  if (!imports.length) return `${line}\n${source}`;
  const last = imports[imports.length - 1];
  const at = last.index + last[0].length;
  return `${source.slice(0, at)}\n${line}${source.slice(at)}`;
}

function* walk(target) {
  const st = statSync(target);
  if (st.isFile()) {
    yield target;
    return;
  }
  for (const entry of readdirSync(target)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = path.join(target, entry);
    const s = statSync(full);
    if (s.isDirectory()) yield* walk(full);
    else if (CODE.test(entry) || entry.endsWith(".css")) yield full;
  }
}

export function run(argv) {
  const [version, ...rest] = argv;
  if (version !== "v32") {
    console.error("usage: godxjp-ui codemod v32 [paths…] [--godx] [--dry-run]");
    return 2;
  }
  const godx = rest.includes("--godx");
  const dryRun = rest.includes("--dry-run");
  const targets = rest.filter((a) => !a.startsWith("--"));
  const roots = targets.length ? targets : ["."];
  let changed = 0;
  const report = [];
  for (const root of roots) {
    if (!existsSync(root)) {
      console.error(`✗ ${root} does not exist`);
      return 2;
    }
    for (const file of walk(root)) {
      const source = readFileSync(file, "utf8");
      if (!source.includes("@godxjp/")) continue;
      const { out, changed: did, notes } = transformSource(file, source, { godx });
      if (did) {
        changed += 1;
        report.push(`${dryRun ? "would change" : "changed"} ${file}`);
        if (!dryRun) writeFileSync(file, out);
      }
      for (const n of notes) report.push(`note ${file}: ${n}`);
    }
  }
  for (const line of report) console.log(line);
  console.log(
    `${dryRun ? "dry run: " : ""}${changed} file(s) ${dryRun ? "would change" : "changed"}.`,
  );
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) process.exit(run(process.argv.slice(2)));
