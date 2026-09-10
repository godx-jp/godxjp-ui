# ADV-B · R0 blind opening

**Position: Option B primary. Confidence: 78/100 (initial; no position change).**

Evidence is a read-only snapshot on 2026-09-10. I read no other advocate file or bus content. No builds, tests, browser verification, or Platform-source inspection were performed. Screen examples below are proposed acceptance cases, not observed Platform defects. Proposals and judgments are explicitly identified; empirical claims carry sources.

## Toulmin case

**Claim.** Make demonstrated consumer capability failures the admission queue for parity work. Use Ant to research how to solve those failures; do not make exhaustion of Ant's surface the release target. This is the best primary strategy for this repository under assumptions A1–A4 below [judgment].

**Grounds.** Platform is explicitly the first consumer and development/debugging environment; public APIs/tokens are mandatory, framework workarounds are forbidden, and real Platform browser/E2E evidence is required for acceptance (`CLAUDE.md:6-10`). The parity roadmap itself defines P0 as breaking a real screen and P1 as a hand-rolled, accessibility-risky workaround (`docs/roadmap/antd-parity.md:38-39`). GATE 0 requires universality, non-composability and justified reuse/bundle cost, not presence in Ant (`docs/COMPOSITION-VS-COMPONENT.md:32-42`).

**Warrant.** A consumer failure supplies the trigger, required behavior, and acceptance result needed to spend engineering effort intelligently. An absent Ant prop supplies none of those by itself [inference from those contracts]. B makes the repository's acceptance environment also determine the work queue. It refuses to spend the week turning unrequested surface area into permanent obligations [proposal].

**Backing.** This is not merely a preference for demos. `TabsList` already implements a constrained scrollport and calls `useKeepActiveTabVisible` (`src/components/navigation/tabs.tsx:493-528`); the roadmap nevertheless identifies a missing overflow affordance (`docs/roadmap/antd-parity.md:65`). Conversely, `TreeList` really is a flat list with only `items` props and no interaction (`src/components/data-display/tree-list.tsx:14-39`). These are different user problems, not equal entries in a missing-prop count. Ant itself separates Badge and Tag and now lists both deprecated List and Listy ([overview](https://ant.design/components/overview/)); its taxonomy is useful reference material, not this package's immutable scope [inference].

**Qualifier / explicit assumptions.**

- **A1:** This week's primary objective is useful capability parity for Platform, rather than a guarantee of universal Ant substitutability. This is an interpretation, supported by `CLAUDE.md:6-10`, not proof of what “không miss” ultimately means.
- **A2:** During implementation, Platform routes, role fixtures and realistic data can be accessed. Availability is **[unsupported]** in this R0; do not claim a route passed without access.
- **A3:** Platform is representative enough of near-term consumer demand to justify deferring unneeded capabilities. Representativeness is **[unsupported]**; being the first consumer does not establish it.
- **A4:** The coordinator can impose exclusive file ownership and a bounded verification queue on the ongoing agents. Enforceability is **[unsupported]**; the shared-tree constraint is given in `00-Topic.md`, “Work already in flight.”
- **A5:** Existing specifications and assigned implementations remain commitments. B changes subsequent admission and sequencing; it does not authorize deleting concurrent work or silently narrowing agreed component contracts (`docs/roadmap/ai-chat-components.md:36-38`; `docs/roadmap/tree-components.md:117-132`).

**Rebuttal anticipation, with steelman first.** A's strongest case is systematic discovery across the catalogue; D's is durable detection of mapping/registry drift; C's is maximum discoverable surface (their definitions: `00-Topic.md:85-112`). Those are genuine advantages. My objection is to making that inventory the primary work generator: neither a ledger nor registry consistency demonstrates successful interaction, and C explicitly includes additions barred by GATE 0. A and D can also require browser tests; B has no monopoly on correctness. Its advantage is earlier evidence for *which* behavior warrants investment [inference; `CLAUDE.md:10`, `docs/COMPOSITION-VS-COMPONENT.md:32-42`]. Retain current read-only audit findings as subordinate reference; do not require a new exhaustive map before unblocking a screen [proposal].

## Four decisions for this week

**1. Scope [proposal].** Audit every actual Platform screen for blocked tasks, copied controls, private imports and page-specific CSS masking missing behavior. Admit reusable gaps through existing primitives first. Scope includes errors, empty/prerequisite/loading states, keyboard, mobile, RTL and supported locales—not merely screenshots. New Ant-only capabilities remain explicitly deferred until a consumer need appears. Already specified Tree/chat work continues to its agreed acceptance contract. List virtualization becomes urgent only on demonstrated data/interaction cost; Masonry only on a real packing requirement. Neither is faked with `ScrollArea` or uniform `ResponsiveGrid` (`docs/roadmap/list-masonry.md:25-31,92-98`). This is demand-driven implementation, not a promise of eventual full Ant coverage.

**2. Composition boundary [proposal].** Screen investigator records the failed task, attempted public composition, existing owner and candidate reusable behavior. A framework reviewer owns the published C1–C7 verdict before coding; the consumer owner validates the task, but cannot waive the gate. Any failed criterion routes to composition; missing visual control routes to a documented token. Existing Tree, CountBadge and four chat ledgers stand; ConversationList/ThoughtChain remain conditional. Attachments extend Upload; Welcome/Prompts remain compositions (`docs/roadmap/tree-components.md:43-55`; `badge-tag-chip-count.md:51-63`; `ai-chat-components.md:18-38,157-174`, all under `docs/roadmap/`).

Use house vocabulary, never a parallel Ant dialect. The vocabulary document itself still prints `ButtonSizeProp` with `default` and `ColumnAlignProp` with `left/right` (`docs/PROPS-VOCABULARY.md:57-63`): resolve that discrepancy against the topic's explicit hard constraints and current registered API, rather than copying that table into new APIs (`00-Topic.md:66-74`).

**3. Priority [proposal].** Day 1 inventories routes × roles × states, assigning each an owner and PASS/FAIL/UNTESTED evidence; missing fixtures remain UNTESTED. Scan source as well as walking screens, since inaccessible or abandoned flows cannot be discovered by clicking happy paths. P0 means an essential real task is blocked or inaccessible; P1 means a needed behavior requires a hand-rolled workaround or materially impairs discovery; P2 means polish or an Ant capability with no demonstrated demand. Within priority, fix shared blockers before isolated ones. Days 2–4 deliver the smallest contract-complete fixes and remove their consumer workarounds; day 5 re-walk affected journeys and report untouched coverage explicitly. These dates are a proposed schedule, not a throughput guarantee. Priority definitions derive from `docs/roadmap/antd-parity.md:38-39`.

**4. Execution [proposal].** Keep the three current code owners; do not start competing Tree/chat implementations. At their next safe boundary, each declares its exact write set. Tree and ChatBubble both touch data-display: group assignment alone cannot prevent collision. One integration owner exclusively writes shared files: `mcp/src/data/components.ts`, `src/props/registry.ts`, group prop files/barrels, `src/tokens/base.css`, shared styles and locale JSON. Workers supply integration instructions in handoffs and edit only leased component-specific source/tests/tokens/docs. Tree utility movement and dependent imports form one serialized task (`docs/roadmap/tree-components.md:129-132`). If two tasks need one file, queue one; no simultaneous section-based editing.

Let existing read-only audits finish; subsequently reuse those agents for screen investigations, not extra concurrent writers. One verification slot runs required static gates and relevant tests with at most two workers; full suite stays in CI. One owner rebuilds local dist and verifies Platform consumes it; browser/E2E acceptance and responsive evidence follow. CI remains asynchronous (`CLAUDE.md:8-13,26`). This is the later implementation protocol: R0 runs none of these commands. Preserve unrelated changes; never bulk format, restore or stage the shared tree.

## Worked examples: different admission decisions

The rival comparisons below follow their topic definitions, not unseen dossiers (`00-Topic.md:85-112`).

| Component and grounded starting point | B's concrete action and acceptance case | Difference from A / C / D |
| --- | --- | --- |
| **TreeList**: flat `ul`, `depth`, only `items`; no selection or expansion (`src/components/data-display/tree-list.tsx:5-39`). | If a permission hierarchy needs expansion/selection, use the assigned **Tree**, retain TreeList compatibility, share traversal, and verify deep keyboard navigation, parent indeterminate checks and RTL. A genuinely static indented list is not made interactive merely to resemble Ant. Follow existing migration instructions (`docs/roadmap/tree-components.md:88-103,117-132`). | A records all Ant tree gaps; B's next task comes from the hierarchy journey. C pursues the wider surface; B does not advance drag/drop or virtualization without demand (already v1-deferred at spec lines 81-82). D maps first; B accepts the screen fix without waiting for a global map. |
| **Badge**: actual props have status/tone/color/shape but no count/removal (`src/components/data-display/badge.tsx:99-134`). | Route selectable filters to Toggle, numeric buttons to existing count APIs, attached unread markers to specified CountBadge. A filter-summary remover triggers the specified Badge extension plus TagInput reuse. Verify localized names, focus after removal and count announcements in context; do not rename Badge (`docs/roadmap/badge-tag-chip-count.md:23-26,83-94,105-118,142-146`). | A/D enumerate or encode the family globally; B selects work by the actual marker/removal need. C ports wider surface; B keeps Ribbon in composition and refuses duplicate Chip. These boundaries are shared with A/D; demand-based scheduling is B's distinctive choice. |
| **Tabs**: current strip scrolls and maintains visibility (`src/components/navigation/tabs.tsx:493-528`); roadmap identifies more-menu P1 (`docs/roadmap/antd-parity.md:57-70`). | Exercise narrow, long-localized-label screens with touch and keyboard; deliver the already identified overflow affordance against that case. Do not spend the same slice adding unused visual knobs. Test selection, overflow discovery and return focus; accessible scrolling is not evidence of adequate touch discoverability. | A drains the remaining ledger; C expands API coverage; D adds mapping infrastructure before fixes. B stops after the needed contract is accepted, retaining P2 as deferred. Ant's own [Tabs docs](https://ant.design/components/tabs/) inform behavior, not house naming. |

Snapshot correction: `src/components/data-display/tree.tsx:562-565` now exports Tree. The roadmap's “not implemented” statement is historical; source presence is not completed acceptance. The same caution applies to chat's ongoing work. I do not infer passing tests from exports.

## Weakest point and failure condition

**B cannot guarantee “không miss” across the Ant universe.** A perfectly maintained Platform coverage matrix can still omit capabilities no Platform screen expresses. Worse, developers may have abandoned screens because the primitive was absent; current usage then understates demand. Source scans, blocked-task intake and retained audit findings mitigate this but do not eliminate it [logical limitation of A1–A3].

B fails as primary if universal Ant replacement is the actual product promise, if new consumers differ substantially from Platform, or if representative state fixtures cannot be obtained. Then A's discovery or D's persistent map deserves primacy. Calling unknown capabilities “unneeded” without A3 evidence would be dishonest. Also, no measured bundle savings are claimed: tree shaking may avoid consumer payload costs; avoiding a public API still avoids its required documentation, registry and behavioral maintenance obligations (`docs/roadmap/ai-chat-components.md:178-195`).

## Self-score (judgment, not measured quality)

| Fixed rubric | Score /100 | Weighted | Reason and loss |
| --- | ---: | ---: | --- |
| Coverage, weight 25 | 52 | 13.00 | Systematic within inventoried screens; loses decisively on unseen Ant capabilities and automatic map drift detection. |
| Correctness/international integrity, 25 | 90 | 22.50 | Consumer states plus mandatory component contract; browser fixtures and interaction coverage remain fallible (`CLAUDE.md:10,26`). |
| Codebase discipline, 20 | 95 | 19.00 | Directly follows consumer/framework boundary and seven gates; consumer overfitting remains a review risk. |
| Cost/effort/load, 15 | 85 | 12.75 | Reuses the prescribed local loop and bounds writers/tests; fixture preparation is real cost and savings are unmeasured. |
| Reversibility, 15 | 90 | 13.50 | Deferral/composition avoids premature public APIs; newly shipped needed primitives are still costly to retract (Badge compatibility: spec lines 142-146). |
| **Total** | | **80.75/100** | Best primary under A1–A4, not best universal-coverage mechanism. |


## R1 rebuttal

**B remains my primary recommendation; confidence 52/100, down 26 from 78.** A defeats my implication that broader discovery requires broader implementation; D supplies concrete evidence that existing checks miss drift. These weaken B substantially, but neither establishes that a new contract must block current repairs. References `ADV-*.md` below mean files in this directory. This round inspected all four R0 dossiers and envelopes; no runtime acceptance is claimed.

### Steelman first: all three rivals

- **A:** Exhaustively account for capabilities without promising to implement every prop. Its reverse Ant/core-X index catches wholly absent components; P0/P1 still derive from real screens, GATE 0 still controls additions, and fixes can proceed while audits continue. This gets much of B's delivery discipline without accepting Platform's discovery blind spots (`ADV-A.md:35-61`).
- **D:** A reviewed, pinned inventory plus checked destinations and transitions preserves decisions across edits. It separates API disposition from behavioral verification, exposes unresolved extraction, and tests the checker with negative fixtures. Its strongest evidence is the documented parser bug that hid 460 of 1,019 props and misled catalog consumers; this is a real reason to invest in automation, not merely a preference for JSON (`ADV-D.md:19-43`; `scripts/check-mcp-prop-sync.mjs:81-96`).
- **C:** Centrally supported convenience APIs can spare multiple consumers repeated discovery, assembly and regression work. Recording a composition does not make its supported packaging available. That economic argument survives C's eligibility concession, although its demand/cost assumptions remain unmeasured (`ADV-C.md:9-12,17-27`).

### Rebuttal: A's discovery case wins; its primacy is not free

I withdraw the R0 suggestion that A necessarily turns unrequested surface into permanent APIs. A explicitly defers work and requires consumer evidence (`ADV-A.md:41,51-53`). B cannot answer A's reverse index with more thorough Platform walks: an upstream capability with no route remains outside that denominator (`ADV-B.md:55`). **Pure B cannot honestly promise all-Ant “không miss,” even when that means accounting rather than shipping.** My R0 failure condition was too narrow: universal *substitutability* is not necessary for B to lose on systematic discovery (`00-Topic.md:123-124`).

The remaining distinction is whether an unused, valid MISSING row eventually generates implementation work or remains deferred until demand appears. B chooses the latter after honoring existing commitments (`ADV-B.md:23,29`); A proposes draining P1 repairs and maintaining broader coverage (`ADV-A.md:53,61`). B's advantage therefore depends on the unmeasured cost of maintaining that broader programme exceeding its avoided future discovery cost—not on a unique correctness advantage. Platform is the first consumer and required acceptance environment, but that policy does **not** prove representative demand (`CLAUDE.md:6-10`). A is the strongest challenge to B this week.

### Rebuttal: D establishes value, not a prerequisite

D's checked artifact is worth considering: deletion of a mapped destination can trigger a repeatable failure that a prose ledger cannot. I accept that advantage. Its load-bearing leap is **pause parity edits before fixing anything**, while the two-day bootstrap explicitly excludes complete prop/behavior review (`ADV-D.md:12,55-57`). Thus the initial pause buys a partial consistency mechanism, not exhaustive discovery; the broader inventory still needs the same reviewers and evidence (`ADV-D.md:25,37-43`).

This repository's existing example checker calls its inherited surface a lower bound and skips those cases (`scripts/check-doc-prop-existence.mjs:25-39`). D correctly proposes stronger resolution and fixtures; that is additional implementation work, not evidence it fits two days. Meanwhile D assigns the checker/map to the same coordinator who must integrate shared catalog, registry, group props and locales (`ADV-D.md:56-57`). This creates a proposed scheduling dependency; its actual delay is unmeasured. No observed urgent Platform failure or measured B speedup is claimed.

My counterproposal is B's demand queue plus selective drift checks after a concrete capability contract is reviewed, without a global bootstrap prerequisite. D becomes preferable if a bounded implementation demonstrates meaningful drift detection and inventory completeness at an acceptable delivery cost. “A gate is useful” alone does not establish “all fixes must wait.”

### C: the remaining economic claim

Repeated assembly could justify central ownership, but C supplies no measured cross-consumer savings, and its own TreeList example shows that public API pruning requires compatibility work (`ADV-C.md:57-59`). Under unchanged constraints it remains inadmissible; no further attack on that conceded point is needed.

### Explicit assumptions and revised commitment

B's remaining case assumes accessible Platform fixtures, sufficiently concentrated near-term demand, and enforceable file ownership; all three remain **[unsupported]**. Existing scope commitments stand. Proposed sequence: finish current audits and owned Tree/chat contracts, preserve discovered gaps as MISSING/deferred, then admit new implementation from evidenced consumer failures; retain one shared-file integrator and one validation slot (`ADV-B.md:23,35-39`). Audit findings are subordinate discovery evidence, not grounds to label unseen capabilities unneeded or claim complete parity.

The **−26 confidence change** is driven by A's reverse inventory plus demand-sensitive sequencing (`ADV-A.md:37,51-53`), and D's documented historical drift plus explicit behavioral verification distinction (`ADV-D.md:19,33`). I retain B narrowly for its demand-based spending rule and rejection of D's unmeasured prerequisite. If exhaustive upstream accountability is decisive, B does not satisfy it alone; this dissent must not be reported as a “không miss” guarantee.


## R2 answer

**Steelman.** A already prioritizes demonstrated screen failures and defers speculative implementation; therefore B must demonstrate net savings sufficient to justify losing upstream discovery. Public-API compliance does not establish correct composition or exercise every exported mode (`02-Research/ADV-A.md:51-53`; `scripts/check-catalog-contradictions.mjs:9-16`). Debate-relative citations below use this directory as their base.

**Direct answer: I have no measured saving, and my R1 proposal has no demonstrated recurring detector for either failure. I withdraw B as primary and recommend A, retaining consumer journeys for priority and acceptance.** My assumption that discovery breadth necessarily costs more than it prevents was unsupported (`02-Research/ADV-B.md:85,91,101`). Rejecting D's prerequisite does not distinguish B from A. The fixed coverage promise requires accountable discovery, not universal shipping (`00-Topic.md:85-90,123`; `03-Reports/JUDGE-r2-questions.md:31-37`).

The challenge is valid: the catalog documents a consumer following incorrect Topbar advice, and the current guard checks only reciprocal name presence. With names intact, wrong advice escapes that condition (`scripts/check-catalog-contradictions.mjs:9-16,34-46`; source inference, not an executed recurrence). The recorded Cascader incident likewise shows search-only acceptance missed parent drilling, deep hover and nested controls (`.claude/skills/godxjp-ui-component/SKILL.md:143-150`). Another Platform screen inventory cannot close either denominator.

**What I would change [proposal, not implemented].** Under A, every integration diff affecting component behavior, catalog guidance/examples or shared dependencies reopens affected capability/mode acceptance rows. A weekly sweep reviews outstanding/unexercised exported modes and the pinned upstream inventory, including capabilities with no Platform route. For Topbar, review the actual advice and rendered slot composition against TopbarItem's ownership rule; merely finding reciprocal names cannot pass. For Cascader, require terminal-state evidence for parent drilling, depth-3 hover and search, plus console output; missing or failing evidence blocks acceptance of the affected mode. This applies the existing forcing rule above. Test the proposed rejection process later with deliberately incorrect advice preserving names and a broken non-search mode. Neither rejection has been demonstrated here; manual review can still miss semantic errors.

**Cost and ownership [all unsupported estimates/proposals].** For a two-case pilot, budget audit/fixture work 2 × 1.5 h = 3 h; independent review 2 × 0.5 h = 1 h; integration 1 h; serialized validation 2 × 1 h = 2 h: **7 person-hours**, excluding fixes and full inventory coverage. Reserve another 2 reviewer-hours/week for triage, with overflow explicitly pending. No measured basis or B-versus-A saving exists. Exact-file ownership acknowledgments are unavailable: at a safe boundary, Tree and ChatBubble must list and acknowledge their write sets; the current holder releases each overlapping file before the next acknowledges acquisition. One integrator separately acquires `mcp/src/data/components.ts` and `src/props/registry.ts`, applies queued handoffs, then releases them. No claimed parallel capacity until acknowledgments exist (`00-Topic.md:48-51,75-79`).

**Assumptions.** Fixed scope and constraints remain binding; the recurrence examples are counterfactual. Fixture access, reviewer capacity, complete dependency-to-row mapping and enforceable ownership remain **[unsupported]**. Existing Tree/chat commitments remain. No runtime checks were run.

**Final confidence: 20/100 that B is best primary; delta −32 from R1's 52.** The decisive argument is A's already demand-sensitive queue: B has no evidenced incremental saving to offset its admitted discovery blind spot (`02-Research/ADV-A.md:51-53`; `02-Research/ADV-B.md:83-85`). This supports changing primary to A, not certifying A's proposed controls. Retained dissent: discovering a MISSING capability alone does not justify shipping it.
