import * as React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

import { Card, CardContent } from "@godxjp/ui/data-display";
import { Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";

import { AppProvider } from "../../src/app/app-provider";
import { StoryDemoBlock } from "./demo-block";
import { SimpleDemoBlock } from "./simple-demo-block";
import { Markdown, stripLeadingHeading } from "./markdown";
import {
  STORY_ENTRIES,
  STORY_MAP,
  STORY_TREE,
  getStorySource,
  type StoryEntry,
  type StoryGroup,
} from "./preview-catalog";
import { queryClient, StoryErrorBoundary, useLazyStory } from "./preview-runtime";

const HOST_MOBILE_QUERY = "(max-width: 639px)";

function parseHashPath(raw: string): string {
  return raw.replace(/^#\/?/, "").split("?")[0] ?? "";
}

function isKnownStoryRoute(raw: string): boolean {
  const storyId = parseHashPath(raw.replace(/^#\/?/, ""));
  return Boolean(storyId && STORY_MAP.has(storyId));
}

function useHostMobile(): { hostMobile: boolean; deviceWidth: number } {
  const [state, setState] = React.useState(() => ({
    hostMobile: window.matchMedia(HOST_MOBILE_QUERY).matches,
    deviceWidth: window.innerWidth,
  }));

  React.useEffect(() => {
    const mq = window.matchMedia(HOST_MOBILE_QUERY);
    const sync = () => setState({ hostMobile: mq.matches, deviceWidth: window.innerWidth });
    mq.addEventListener("change", sync);
    window.addEventListener("resize", sync);
    return () => {
      mq.removeEventListener("change", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  return state;
}

const EXPANDED_STORAGE_KEY = "godxjp-ui-preview:expanded-v2";
const ROUTE_STORAGE_KEY = "godxjp-ui-preview:route";
const SIDEBAR_STORAGE_KEY = "godxjp-ui-preview:sidebar";

function loadSidebarOpen(): boolean {
  if (window.matchMedia(HOST_MOBILE_QUERY).matches) return false;
  try {
    const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored !== null) return stored === "1";
  } catch {
    /* ignore */
  }
  return window.matchMedia("(min-width: 640px)").matches;
}

function loadInitialRoute(defaultId: string): string {
  const hash = window.location.hash.replace(/^#\/?/, "");
  if (hash && isKnownStoryRoute(hash)) return hash;

  try {
    const stored = window.localStorage.getItem(ROUTE_STORAGE_KEY);
    if (stored && STORY_MAP.has(stored)) return stored;
  } catch {
    /* ignore */
  }

  return defaultId;
}

function loadExpanded(fallback: Set<string>): Set<string> {
  try {
    const stored = window.localStorage.getItem(EXPANDED_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as string[];
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch {
    /* ignore */
  }
  return fallback;
}

function useHashRoute(defaultId: string): [string, (id: string) => void] {
  const initial = loadInitialRoute(defaultId);
  const [hash, setHash] = React.useState(
    () => window.location.hash.replace(/^#\/?/, "") || initial,
  );

  React.useEffect(() => {
    const current = window.location.hash.replace(/^#\/?/, "");
    if (!current || !isKnownStoryRoute(current)) {
      window.location.replace(`#/${initial}`);
    }
  }, [initial]);

  React.useEffect(() => {
    const onChange = () => setHash(window.location.hash.replace(/^#\/?/, "") || initial);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, [initial]);

  const setRoute = React.useCallback((id: string) => {
    try {
      window.localStorage.setItem(ROUTE_STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
    window.location.hash = `/${id}`;
  }, []);

  return [hash, setRoute];
}

function countExamples(group: StoryGroup): number {
  let total = group.examples.length;
  for (const child of group.children) total += countExamples(child);
  return total;
}

function isGroupOnActivePath(group: StoryGroup, activeStory: StoryEntry | undefined): boolean {
  if (!activeStory) return false;
  if (group.path.length > activeStory.groupPath.length) return false;
  return group.path.every((segment, index) => activeStory.groupPath[index] === segment);
}

function StoryTreeNode({
  group,
  depth,
  activeStory,
  onSelect,
  expandedKeys,
  toggle,
  activeLeafRef,
}: {
  group: StoryGroup;
  depth: number;
  activeStory: StoryEntry | undefined;
  onSelect: (id: string) => void;
  expandedKeys: Set<string>;
  toggle: (key: string) => void;
  activeLeafRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const groupKey = group.path.join("/");
  const isTopLevel = depth === 0;
  // Top-level groups are Storybook-style section headers: a muted, non-collapsible
  // title with their contents always shown. Only nested groups collapse.
  const expanded = isTopLevel ? true : expandedKeys.has(groupKey);
  const indentStyle = { ["--depth" as string]: depth };
  const total = countExamples(group);
  const onActivePath = isGroupOnActivePath(group, activeStory);

  return (
    <li className="preview-tree-item" data-depth={depth}>
      {isTopLevel ? (
        <div className="preview-tree-row preview-tree-section" style={indentStyle}>
          <span className="preview-tree-label">{group.name}</span>
          <span className="preview-tree-count">{total}</span>
        </div>
      ) : (
        <button
          type="button"
          className="preview-tree-row preview-tree-group"
          style={indentStyle}
          onClick={() => toggle(groupKey)}
          aria-expanded={expanded}
          data-active-path={onActivePath}
        >
          <span className="preview-tree-caret" data-open={expanded} aria-hidden="true">
            <svg viewBox="0 0 12 12" width="10" height="10">
              <path
                d="M4 2 L8 6 L4 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="preview-tree-label">{group.name}</span>
          <span className="preview-tree-count">{total}</span>
        </button>
      )}
      {expanded ? (
        <ul className="preview-tree-list">
          {group.examples.map((story) => {
            const isActive = story.id === activeStory?.id;
            return (
              <li key={story.id} className="preview-tree-item" data-depth={depth + 1}>
                <button
                  ref={isActive ? activeLeafRef : undefined}
                  type="button"
                  className="preview-tree-row preview-tree-leaf"
                  data-active={isActive}
                  aria-current={isActive ? "page" : undefined}
                  style={{ ["--depth" as string]: depth + 1 }}
                  onClick={() => onSelect(story.id)}
                >
                  <span className="preview-tree-bullet" aria-hidden="true" />
                  <span className="preview-tree-label">{story.storyName}</span>
                </button>
              </li>
            );
          })}
          {group.children.map((child) => (
            <StoryTreeNode
              key={child.path.join("/")}
              group={child}
              depth={depth + 1}
              activeStory={activeStory}
              onSelect={onSelect}
              expandedKeys={expandedKeys}
              toggle={toggle}
              activeLeafRef={activeLeafRef}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function defaultExpanded(tree: StoryGroup[]): Set<string> {
  const keys = new Set<string>();
  for (const group of tree) keys.add(group.path.join("/"));
  return keys;
}

function DocPage({
  entry,
  Render,
  loading,
  error,
  sourceVersion,
}: {
  entry: StoryEntry;
  Render: React.ComponentType | null;
  loading: boolean;
  error: string | null;
  sourceVersion: number;
}) {
  const source = React.useMemo(() => getStorySource(entry), [entry, sourceVersion]);
  const groupIntro = entry.groupReadme ? stripLeadingHeading(entry.groupReadme) : "";
  const isPrimitive =
    entry.groupPath[0] === "Primitives" &&
    !entry.groupPath.some((segment) => segment.toLowerCase() === "examples");
  const demo = Render ? (
    <StoryErrorBoundary storyId={entry.id}>
      <Render />
    </StoryErrorBoundary>
  ) : null;

  return (
    <div className="preview-stage">
      <PageContainer title={entry.storyName} subtitle={entry.groupPath.join(" / ")} variant="flush">
        <Flex direction="col" gap="xl">
          <Card>
            <CardContent>
              <Flex direction="col" gap="md">
                {groupIntro ? <Markdown source={groupIntro} className="doc-page-intro" /> : null}
                {entry.storyDoc ? (
                  <Markdown source={entry.storyDoc} className="doc-story-body" />
                ) : null}
              </Flex>
            </CardContent>
          </Card>

          <ResponsiveGrid columns={{ sm: 1, md: 1, lg: 1 }}>
            <Card>
              <CardContent>
                {isPrimitive ? (
                  <SimpleDemoBlock source={source} loading={loading} error={error}>
                    {demo}
                  </SimpleDemoBlock>
                ) : (
                  <StoryDemoBlock
                    storyId={entry.id}
                    source={source}
                    layout={entry.layout}
                    viewportWidth={entry.viewportWidth}
                    viewportHeight={entry.viewportHeight}
                    loading={loading}
                    error={error}
                  >
                    {demo}
                  </StoryDemoBlock>
                )}
              </CardContent>
            </Card>
          </ResponsiveGrid>
        </Flex>
      </PageContainer>
    </div>
  );
}

function StoryCanvas({
  entry,
  Render,
  loading,
  error,
  sourceVersion,
}: {
  entry: StoryEntry;
  Render: React.ComponentType | null;
  loading: boolean;
  error: string | null;
  sourceVersion: number;
}) {
  if (entry.kind === "doc") {
    return (
      <DocPage
        entry={entry}
        Render={Render}
        loading={loading}
        error={error}
        sourceVersion={sourceVersion}
      />
    );
  }

  const source = React.useMemo(() => getStorySource(entry), [entry, sourceVersion]);

  return (
    <div className="preview-stage">
      <PageContainer title={entry.storyName} subtitle={entry.fullTitle} variant="flush">
        <Flex direction="col" gap="xl">
          <ResponsiveGrid columns={{ sm: 1, md: 1, lg: 1 }}>
            <Card>
              <CardContent>
                <StoryDemoBlock
                  storyId={entry.id}
                  source={source}
                  layout={entry.layout}
                  viewportWidth={entry.viewportWidth}
                  viewportHeight={entry.viewportHeight}
                  loading={loading}
                  error={error}
                >
                  {Render ? (
                    <StoryErrorBoundary storyId={entry.id}>
                      <Render />
                    </StoryErrorBoundary>
                  ) : null}
                </StoryDemoBlock>
              </CardContent>
            </Card>
          </ResponsiveGrid>
        </Flex>
      </PageContainer>
    </div>
  );
}

export function App() {
  const initialId =
    STORY_ENTRIES.find((e) => e.id === "primitives-data-display-overview")?.id ??
    STORY_ENTRIES.find((e) => e.groupPath[0] === "Primitives")?.id ??
    STORY_ENTRIES[0]?.id ??
    "";
  const [routeHash, setRouteId] = useHashRoute(initialId);
  const storyId = parseHashPath(routeHash);
  const story = STORY_MAP.get(storyId) ?? STORY_ENTRIES[0];
  const { Render, loading, error, sourceVersion } = useLazyStory(story);

  const [expandedKeys, setExpandedKeys] = React.useState<Set<string>>(() =>
    loadExpanded(defaultExpanded(STORY_TREE)),
  );
  const [filter, setFilter] = React.useState("");
  const [sidebarOpen, setSidebarOpen] = React.useState(loadSidebarOpen);
  const { hostMobile } = useHostMobile();
  const activeLeafRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!story) return;
    activeLeafRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [story?.id]);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(EXPANDED_STORAGE_KEY, JSON.stringify(Array.from(expandedKeys)));
    } catch {
      /* ignore */
    }
  }, [expandedKeys]);

  React.useEffect(() => {
    if (hostMobile) setSidebarOpen(false);
  }, [hostMobile]);

  React.useEffect(() => {
    if (hostMobile) return;
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, sidebarOpen ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [sidebarOpen, hostMobile]);

  const selectStory = React.useCallback(
    (id: string) => {
      setRouteId(id);
      if (window.matchMedia("(max-width: 639px)").matches) setSidebarOpen(false);
    },
    [setRouteId],
  );

  const toggle = React.useCallback((key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const visibleTree = React.useMemo(() => {
    if (!filter.trim()) return STORY_TREE;
    const needle = filter.trim().toLowerCase();
    const prune = (group: StoryGroup): StoryGroup | null => {
      const examples = group.examples.filter(
        (s) =>
          s.storyName.toLowerCase().includes(needle) || s.fullTitle.toLowerCase().includes(needle),
      );
      const children = group.children.map(prune).filter((g): g is StoryGroup => g !== null);
      if (examples.length === 0 && children.length === 0) return null;
      return { ...group, examples, children };
    };
    return STORY_TREE.map(prune).filter((g): g is StoryGroup => g !== null);
  }, [filter]);

  const filterExpandedKeys = React.useMemo(() => {
    if (!filter.trim()) return expandedKeys;
    const keys = new Set(expandedKeys);
    const walk = (group: StoryGroup) => {
      keys.add(group.path.join("/"));
      group.children.forEach(walk);
    };
    visibleTree.forEach(walk);
    return keys;
  }, [filter, expandedKeys, visibleTree]);

  React.useEffect(() => {
    if (story) {
      const ancestors: string[] = [];
      story.groupPath.forEach((_, i) => ancestors.push(story.groupPath.slice(0, i + 1).join("/")));
      setExpandedKeys((prev) => {
        const next = new Set(prev);
        ancestors.forEach((k) => next.add(k));
        return next;
      });
    }
  }, [story]);

  if (!story) {
    return (
      <div className="preview-empty">
        No pages found. Add a <code>.tsx</code> file under <code>docs/</code>.
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AppProvider persist={false}>
          <div
            className="preview-shell"
            data-sidebar-open={sidebarOpen}
            data-host-mobile={hostMobile}
          >
            {sidebarOpen ? (
              <button
                type="button"
                className="preview-sidebar-backdrop"
                aria-label="Close menu"
                onClick={() => setSidebarOpen(false)}
              />
            ) : null}
            <aside className="preview-sidebar" aria-hidden={!sidebarOpen}>
              <div className="preview-sidebar-header">
                <div className="preview-brand">
                  <span className="preview-brand-mark" aria-hidden="true">
                    tx
                  </span>
                  <span className="preview-brand-name">godxjp-ui</span>
                  <span className="preview-brand-badge">preview</span>
                </div>
                <button
                  type="button"
                  className="preview-sidebar-close"
                  aria-label="Close menu"
                  onClick={() => setSidebarOpen(false)}
                >
                  ×
                </button>
              </div>
              <span className="preview-sidebar-sub">{STORY_ENTRIES.length} examples</span>
              <div className="preview-search">
                <input
                  type="search"
                  placeholder="Filter examples..."
                  value={filter}
                  onChange={(e) => setFilter(e.currentTarget.value)}
                  className="preview-search-input"
                  aria-label="Filter examples"
                />
              </div>
              <nav className="preview-tree" aria-label="Examples">
                <ul className="preview-tree-list preview-tree-list-root">
                  {visibleTree.length === 0 ? (
                    <li className="preview-tree-empty">No matches</li>
                  ) : (
                    visibleTree.map((group) => (
                      <StoryTreeNode
                        key={group.path.join("/")}
                        group={group}
                        depth={0}
                        activeStory={story}
                        onSelect={selectStory}
                        expandedKeys={filterExpandedKeys}
                        toggle={toggle}
                        activeLeafRef={activeLeafRef}
                      />
                    ))
                  )}
                </ul>
              </nav>
            </aside>
            <main className="preview-main">
              <header className="preview-toolbar">
                <div className="preview-toolbar-start">
                  <button
                    type="button"
                    className="preview-menu-btn"
                    aria-label={sidebarOpen ? "Close menu" : "Open menu"}
                    aria-expanded={sidebarOpen}
                    onClick={() => setSidebarOpen((open) => !open)}
                  >
                    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                      <path
                        d="M2 4h12M2 8h12M2 12h12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                  <div className="preview-toolbar-title">
                    <strong className="preview-toolbar-story">{story.storyName}</strong>
                    <span className="preview-toolbar-path">{story.groupPath.join(" / ")}</span>
                  </div>
                </div>
              </header>
              <StoryCanvas
                entry={story}
                Render={Render}
                loading={loading}
                error={error}
                sourceVersion={sourceVersion}
              />
            </main>
          </div>
        </AppProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}
