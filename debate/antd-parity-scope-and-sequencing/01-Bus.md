# Message Bus — Ant Design parity: scope, sequencing, agent organisation

Append-only. Chronological. One fenced envelope per message. Never rewrite an existing entry.

Envelope format:

```
### r<N> · <from> → <to> · <type>
claim:        <one-sentence position>
steelman:     <strongest version of the view you are arguing AGAINST>   (required for rebuttal)
evidence:     <code refs / file:line / citations / data — or [unsupported]>
warrant:      <why the evidence supports the claim>
assumptions:  <explicit assumptions this rests on>
confidence:   <0-100>  (delta: <+/-N since last>, because: <which specific argument moved you>)
```

---

## Timeline

### r0 · ADV-C → all · opening
claim:        Option C offers the strongest commitment to supported upstream surface availability, including packaged compositions, but is inadmissible under unchanged GATE 0/no-duplication constraints.
steelman:     [n/a in R0]
evidence:     src/components/data-display/tree-list.tsx:14–38; src/components/data-display/badge.tsx:99–134; docs/roadmap/tree-components.md:81–82,119–125; docs/roadmap/ai-chat-components.md:26–38; docs/roadmap/badge-tag-chip-count.md:135–146; docs/COMPOSITION-VS-COMPONENT.md:32–42; https://ant.design/components/overview/; https://x.ant.design/components/overview/
warrant:      Central supported APIs make upstream capabilities predictably available rather than requiring consumer assembly; composition exclusions and v1 deferrals show the concrete surface C would additionally commit to, while existing consumer-bound exports demonstrate pruning cost.
assumptions:  Unmeasured future cross-consumer demand and avoided assembly costs justify bloat; representative usage evidence and migration cooperation become available; the owner changes the composition/no-duplication boundary before failed candidates enter source. No such exception is currently authorized. Current Tree work is already present at src/components/data-display/tree.tsx:562–565, not verified complete.
confidence:   15/100 — initial confidence that C is the best admissible strategy under the fixed topic; self-score 41/100, disqualified without a policy change.

### r0 · ADV-B → all · opening
claim:        Consumer-screen-driven parity should be primary because demonstrated Platform failures provide the work queue and acceptance evidence this repository already requires.
steelman:     [n/a in R0]
evidence:     CLAUDE.md:6-10; docs/roadmap/antd-parity.md:38-39; docs/COMPOSITION-VS-COMPONENT.md:32-42; src/components/data-display/tree-list.tsx:14-39; src/components/navigation/tabs.tsx:493-528; https://ant.design/components/tabs/
warrant:      Real blocked tasks justify reusable behavior and define successful interaction; absence in Ant's counterpart alone establishes neither urgency nor correctness, while GATE 0 still governs every addition.
assumptions:  Platform-first useful parity is this week's objective; representative routes/roles/data will be accessible; Platform approximates near-term demand; exact file ownership can be enforced; existing specs and in-flight commitments remain intact. Representativeness/access are unverified. B cannot guarantee all-Ant coverage.
confidence:   78

### r0 · ADV-A → all · opening
claim:        Option A best addresses systematic capability omissions this week by reviewing an exhaustive ledger and repairing the smallest Gate-0-compliant gaps in P0→P1→P2 order.
steelman:     [n/a in R0]
evidence:     docs/roadmap/antd-parity.md:9-39,99-108; src/components/data-display/tree-list.tsx:14-39; src/components/data-display/tree.tsx:537,562-564; src/components/data-display/badge.tsx:99-134; src/props/components/navigation.prop.ts:301-327; mcp/src/data/components.ts:11925-11941; docs/roadmap/ai-chat-components.md:182-195; https://ant.design/components/tabs/
warrant:      The same audit distinguishes absent tree interaction, already-owned selectable chips, renamed Tabs capabilities and narrow remaining repairs; existing scope contracts permit implementation now, while shared-file ownership and behavior evidence prevent group parallelism or prop presence from masquerading as correctness.
assumptions:  “không miss” means explicit disposition, not every Ant prop shipped; the 127-entry topic snapshot is a baseline, not immutable live state; a coordinator enforces one writer per group and one integrator for shared files; Platform supplies urgency and acceptance; reference versions are fixed per wave; ledger maintenance remains a human obligation, not an automatic regression guarantee.
confidence:   84

### r0 · ADV-D → all · opening
claim:        Option D should be primary because checked capability mappings make omissions and regressions explicit across edits, while audits and Platform journeys supply evidence and priority.
steelman:     [n/a in R0]
evidence:     scripts/check-mcp-prop-sync.mjs:81; scripts/check-mcp-prop-sync.mjs:170; scripts/check-doc-prop-existence.mjs:25; src/props/registry.ts:2376; src/props/components/navigation.prop.ts:316; docs/roadmap/antd-parity.md:25; docs/COMPOSITION-VS-COMPONENT.md:32; https://ant.design/components/tabs/
warrant:      This repo documents prior silent catalog drift and current extraction limits; a pinned upstream inventory, checked targets and reviewed behavior evidence can detect structural drift without equating prop presence with correctness.
assumptions:  Capability accountability, not literal API cloning, defines parity; upstream versions are pinned; one coordinator can serialize shared files and pause current writers safely; a two-day bootstrap is an unmeasured estimate; reviewers validate semantic claims; green consistency does not mean complete parity.
confidence:   82


```text
### r1 · ADV-A → all · rebuttal
claim:        A remains the best primary sequence this week: exhaustive discovery and reviewed repairs can proceed while useful drift checks are introduced incrementally.
steelman:     B grounds spending and acceptance in complete Platform journeys; C centrally owns supported convenience APIs to avoid repeated assembly; D enforces a pinned inventory, checked destinations and reviewed verification transitions without confusing prop presence with behavior.
evidence:     debate/antd-parity-scope-and-sequencing/02-Research/ADV-B.md:19-25,55-57; debate/antd-parity-scope-and-sequencing/02-Research/ADV-C.md:17-27,57-59; debate/antd-parity-scope-and-sequencing/02-Research/ADV-D.md:12,37-43,55-56; scripts/check-mcp-prop-sync.mjs:81-91; scripts/check-doc-prop-existence.mjs:25-40; docs/roadmap/antd-parity.md:27-39,99-108.
warrant:      B's screen denominator cannot expose every unseen capability, and recording a gap does not incur a shipped API's cost; D proves a need for persistent checks but supplies no measured justification for pausing all repairs during its incomplete bootstrap; C's policy exception remains ungranted.
assumptions:  Parity means exhaustive disposition, not immediate universal delivery; upstream scope is pinned; reviewers, Platform acceptance access and exclusive file ownership are available [unsupported operating assumptions]; bootstrap break-even remains unmeasured; A retains a human-maintenance risk.
confidence:   76 (delta: -8, because: D's documented 460/1,019-prop parser blind spot and independent-inventory/negative-fixture proposal establish stronger drift accountability than A's human reopening rule, but do not establish that a global repair pause pays this week.)
```


```text
### r1 · ADV-B → all · rebuttal
claim:        Keep B primary for demand-based implementation this week, while conceding that its Platform queue cannot guarantee all-Ant “không miss” and that D has not justified pausing fixes for bootstrap.
steelman:     A combines reverse upstream discovery with consumer priorities and deferred implementation; D preserves reviewed mappings through checked transitions and separate behavior evidence; C can centralize repeated consumer assembly costs, despite conceded inadmissibility.
evidence:     debate/antd-parity-scope-and-sequencing/02-Research/ADV-A.md:37,51-61; debate/antd-parity-scope-and-sequencing/02-Research/ADV-D.md:12,33,37-43,55-57; debate/antd-parity-scope-and-sequencing/02-Research/ADV-C.md:17-27,57-59; scripts/check-mcp-prop-sync.mjs:81-96; scripts/check-doc-prop-existence.mjs:25-39; CLAUDE.md:6-10.
warrant:      Exhaustive discovery does not force implementation, so A defeats that R0 objection; documented drift supports D's artifact, but a partial, unmeasured bootstrap does not establish that every repair must wait; B retains a demand-based admission rule with an explicit coverage deficit.
assumptions:  Platform fixtures are accessible, near-term demand is concentrated, and exclusive file ownership is enforceable [unsupported]; existing commitments stand; retained audit findings do not prove exhaustive upstream coverage; B's cost advantage and D's bootstrap duration are unmeasured.
confidence:   52  (delta: -26, because: A's reverse inventory plus consumer-sensitive sequencing removes my implied breadth-versus-usefulness tradeoff, and D's documented 460/1019-prop blind spot establishes a concrete need for durable drift detection.)
```


```text
### r1 · ADV-D → all · rebuttal
claim:        D remains the best primary strategy because enforced mapping transitions address post-audit drift that neither a maintained ledger nor Platform's queue guarantees, conditional on a bounded bootstrap.
steelman:     A already offers exhaustive reverse discovery and immediate behavior-validated repairs; B supplies demonstrated demand, complete journey states and cheaper deferral; C offers predictable supported availability that a recorded gap cannot supply, while conceding its required policy exception.
evidence:     debate/antd-parity-scope-and-sequencing/02-Research/ADV-A.md:31-37,75-77; debate/antd-parity-scope-and-sequencing/02-Research/ADV-B.md:19-26,55-57; debate/antd-parity-scope-and-sequencing/02-Research/ADV-C.md:17-27,59; scripts/check-mcp-prop-sync.mjs:81-91,181; scripts/check-doc-prop-existence.mjs:25-29; docs/roadmap/antd-parity.md:34-39.
warrant:      Historical catalog/link drift establishes a concrete target for automation, not measured ROI; B's representative-screen assumption cannot enumerate unseen capabilities, while D can record missing work without building speculative APIs. A shares discovery and correctness methods; D's remaining advantage is mandatory structural checking before repair admission, not semantic proof.
assumptions:  Accountable pinned-reference dispositions define parity; reviewers validate behavior; exclusive file ownership is feasible; two-day bootstrap and net savings are unsupported estimates. Require demonstrated omission/member/link/unresolved-type detection before fixes resume; if the minimum misses that budget, prefer A for this week. Green consistency never means delivered parity.
confidence:   70  (delta: -12, because: A's explicit reverse inventory defeats D's claimed discovery advantage, A's ready repairs expose the pause's opportunity cost, and B correctly separates inventory from behavioral acceptance.)
```


```text
### r1 · ADV-C → all · rebuttal
claim:        A currently has the strongest admissible this-week sequencing case: D earns drift-checking investment but has not justified a global bootstrap pause, and B cannot establish Ant-wide “không miss.”
steelman:     A inventories upstream-only gaps and prioritizes reviewed extensions; B investigates real routes/roles/states and abandoned flows while preserving existing commitments; D checks pinned inventory, destinations, transitions and evidence without equating presence with correctness.
evidence:     debate/antd-parity-scope-and-sequencing/02-Research/ADV-A.md:37-61; debate/antd-parity-scope-and-sequencing/02-Research/ADV-B.md:25-39,55-57; debate/antd-parity-scope-and-sequencing/02-Research/ADV-D.md:12,31-43,55-56; scripts/check-mcp-prop-sync.mjs:81-91,170-181; scripts/check-doc-prop-existence.mjs:25-41; docs/roadmap/tree-components.md:81-82.
warrant:      Recorded parser/catalog failures justify repeated checks, but unresolved extraction and an unmeasured bootstrap do not establish that repairs must wait; consumer sampling cannot enumerate capabilities absent from its screens, while a recorded deferred gap is still undelivered.
assumptions:  Fixed GATE 0 remains binding; “không miss” means systematic disposition, not every prop shipped; exclusive ownership/review can be arranged; bootstrap economics and future demand remain unmeasured; C's packaging dissent remains conditional on an unauthorized policy change.
confidence:   5/100 in C as best admissible strategy (delta: -10, because: A's reverse upstream inventory and D's separate disposition/verification states show systematic coverage does not require wholesale delivery; C's 41/100 self-score and disqualification stand).
```


```
### r1 · SKEPTIC → all · rebuttal
claim:        All four can turn an incomplete or incorrect acceptance claim into apparent parity without demonstrating a mechanism that rejects wrong-but-present behavior.
steelman:     Independent inventories, explicit exceptions, behavioral evidence, reciprocal catalog links and one integration/validation owner could jointly constrain omissions, drift and load; D additionally proposes executable rejection of structural drift.
evidence:     .claude/skills/godxjp-ui-component/SKILL.md:143-150; scripts/check-mcp-prop-sync.mjs:81-91; scripts/check-doc-prop-existence.mjs:25-41,195-196; docs/roadmap/antd-parity.md:34-35; commit 8365bf05 (mcp/src/data/components.ts); CLAUDE.md:26; debate/antd-parity-scope-and-sequencing/02-Research/ADV-D.md:12,40-43,55-58
warrant:      Cascader's search-only acceptance missed broken parent/deep-hover modes and nested buttons; catalog guidance and its checker previously missed real capabilities; recording a status, link or reviewer promise does not prove rejection of those failures, and a parity checker cannot enforce machine-wide scheduling.
assumptions:  Fixed constraints remain binding; historical incidents are documented accounts, not rerun here; proposed controls have not been demonstrated in these dossiers; shared-tree contents can change; reviewer capacity and enforceable ownership are [unsupported].
confidence:   94/100 (initial R1 assessment; no position change or convergence; no favourite)
```


```text
### r2 · JUDGE → ADV-D · question
claim:        What incremental failure would your two-day prerequisite catch beyond the existing catalog guard—for the 8365bf05 case where reciprocal names remain but Topbar again teaches Button—and what evidence makes preventing that failure worth pausing repairs, after pricing the same coordinator’s checker and integration queue?
steelman:     D preserves reviewed decisions across edits and explicitly separates structural consistency from accepted behavior.
evidence:     debate/antd-parity-scope-and-sequencing/02-Research/ADV-D.md:37-43,55-58,112-118; scripts/check-catalog-contradictions.mjs:15-16,34-46; commit 8365bf05, mcp/src/data/components.ts.; debate/antd-parity-scope-and-sequencing/03-Reports/JUDGE-r2-questions.md (common answer standard).
warrant:      D rises relative to A if a bounded, evidenced bootstrap adds material detection that requires preceding repairs; duplicate checking, semantic escape or unpriced queue delay moves D down.
assumptions:  D retains its prerequisite sequence; unchanged names plus incorrect guidance are a counterfactual, not an observed current regression. No new tests in this round; costs and ownership controls require evidence, otherwise label unsupported.
confidence:   [n/a — judge does not advocate]
```

```text
### r2 · JUDGE → ADV-B · question
claim:        What measured saving over A’s already demand-sensitive queue compensates for B’s admitted upstream discovery blind spot, when a Platform screen can follow only public APIs and still repeat 8365bf05—and what recurring trigger detects that mistake or an unexercised exported mode rather than waiting for a user report?
steelman:     B preserves agreed contracts and uses actual consumer failures to avoid speculative implementation and supply acceptance cases.
evidence:     debate/antd-parity-scope-and-sequencing/02-Research/ADV-B.md:35-39,83-85,101-103; debate/antd-parity-scope-and-sequencing/02-Research/ADV-A.md:51-53; debate/antd-parity-scope-and-sequencing/02-Research/SKEPTIC.md:23-25; commit 8365bf05, mcp/src/data/components.ts.; debate/antd-parity-scope-and-sequencing/03-Reports/JUDGE-r2-questions.md (common answer standard).
warrant:      B rises relative to A with evidenced net savings and bounded, explicit missed-capability exposure; another screen inventory or an unmeasured saving moves B down.
assumptions:  The topic’s coverage promise stays fixed; narrower demand does not establish that undiscovered capabilities are unnecessary. No new tests in this round; costs and ownership controls require evidence, otherwise label unsupported.
confidence:   [n/a — judge does not advocate]
```

```text
### r2 · JUDGE → ADV-A · question
claim:        Between audit completion and your optional checker pilot, what event actually reopens a stale PRESENT/COVERED-ELSEWHERE row when the 8365bf05 advice error recurs with reciprocal names intact, or a Cascader mode breaks with its prop intact—and what evidence shows your reviewer and shared-file owner can catch it within this week’s priced capacity?
steelman:     A inventories both upstream and local capabilities, permits reviewed repairs immediately, and can add targeted checks without a global pause.
evidence:     debate/antd-parity-scope-and-sequencing/02-Research/ADV-A.md:57-61,75-77,113-115; debate/antd-parity-scope-and-sequencing/02-Research/SKEPTIC.md:13-15; scripts/check-catalog-contradictions.mjs:34-46; commit 8365bf05, mcp/src/data/components.ts.; debate/antd-parity-scope-and-sequencing/03-Reports/JUDGE-r2-questions.md (common answer standard).
warrant:      A rises relative to D with an evidenced recurring trigger and affordable review capacity before the pilot; voluntary rediscovery or an unpriced bottleneck moves A down.
assumptions:  The pilot is not a repair prerequisite; the recurrence cases are counterfactuals, not fresh allegations of broken components. No new tests in this round; costs and ownership controls require evidence, otherwise label unsupported.
confidence:   [n/a — judge does not advocate]
```

```text
### r2 · JUDGE → ADV-C · question
claim:        Without reopening your conceded policy exception, what concrete deferred capability and evidence-based delivery threshold would make you withdraw R1’s endorsement of A in favor of D or B, given that A’s ledger and D’s green map can both retain MISSING indefinitely?
steelman:     C distinguishes supported availability from merely recording a gap, while conceding that its packaging exception is unauthorized.
evidence:     debate/antd-parity-scope-and-sequencing/02-Research/ADV-C.md:79,91,97-99; debate/antd-parity-scope-and-sequencing/02-Research/ADV-D.md:25,41; debate/antd-parity-scope-and-sequencing/01-Bus.md:88-94.; debate/antd-parity-scope-and-sequencing/03-Reports/JUDGE-r2-questions.md (common answer standard).
warrant:      An evidenced delivery distinction could move A relative to D/B; without one, C’s endorsement receives no comparative weight, while its availability dissent remains recorded.
assumptions:  C’s concession and endorsement affect the comparison; constraints remain unchanged and this question does not reopen eligibility. No new tests in this round; costs and ownership controls require evidence, otherwise label unsupported.
confidence:   [n/a — judge does not advocate]
```

```text
### r2 · JUDGE → SKEPTIC · question
claim:        Assuming acknowledged exclusive file ownership, which residual risk would you actually accept this week—A’s manual drift exposure, B’s unseen capabilities, or D’s bootstrap delay—and why, including which surviving option is most likely to ship wrong-but-present behavior and the concrete failure threshold that would reverse your choice?
steelman:     SKEPTIC separates catalog truth, behavioral acceptance and scheduling, and proposes bounded historical counterexamples instead of trusting promised safeguards.
evidence:     debate/antd-parity-scope-and-sequencing/02-Research/SKEPTIC.md:11-15,21-25,41-45,54-60; debate/antd-parity-scope-and-sequencing/00-Topic.md:123-127.; debate/antd-parity-scope-and-sequencing/03-Reports/JUDGE-r2-questions.md (common answer standard).
warrant:      An evidence-based accepted tradeoff changes the relative case for A/B/D; rejecting all three without a discriminating threshold adds no ranking evidence.
assumptions:  Ownership acknowledgment is conditional, not established; accepting residual risk never waives constraint 8 or authorizes false acceptance. No new tests in this round; costs and ownership controls require evidence, otherwise label unsupported.
confidence:   [n/a — judge does not advocate]
```


```text
### r2 · ADV-C → JUDGE · answer
claim:        For deferred Tree virtualization, I would favor D over A only after D rejects an incomplete agreed milestone that A accepts and demonstrably delivers the accepted repair earlier including all overhead; no such evidence currently supports my R1 endorsement of A.
steelman:     A's ledger and D's green consistency map can both retain MISSING indefinitely, so neither proves supported availability or a delivery advantage.
evidence:     docs/roadmap/tree-components.md:82; docs/roadmap/antd-parity.md:38-39; CLAUDE.md:7-10; debate/antd-parity-scope-and-sequencing/02-Research/ADV-D.md:25,41; debate/antd-parity-scope-and-sequencing/02-Research/ADV-C.md:97; debate/antd-parity-scope-and-sequencing/03-Reports/JUDGE-r2-questions.md:53-61; debate/antd-parity-scope-and-sequencing/00-Topic.md:60-65,100-104.
warrant:      D proposes a separate delivery gate, but its rejection and net delivery benefit require demonstration; acceptance must repair the same measured Platform task through public APIs with framework and browser evidence, so I withdraw A's unsupported comparative endorsement without switching on promises.
assumptions:  Fixed constraints; documented deferral is not fresh absence evidence; identical scope, observed dataset/device, agreed interaction budget/deadline and acceptance rules; future fixture, ownership, timings and rejection are unestablished [unsupported], not results; compare bootstrap, audit/fixtures, review, integration and validation costs.
confidence:   0/100 that C is best admissible (delta: -5, because: the Judge's delivery challenge defeats the remaining comparative force of availability without accepted-delivery evidence, while C's policy disqualification remains binding).
```


```text
### r2 · ADV-D → JUDGE · answer
claim:        No demonstrated incremental detection justifies my two-day prerequisite; I withdraw the pause and choose A primary with a bounded D pilot.
steelman:     Reciprocal names can survive incorrect Topbar guidance, so D must prove additional rejection and pay for its coordinator's checker and integration queue before delaying repairs.
evidence:     scripts/check-catalog-contradictions.mjs:9-16,34-46; commit 8365bf05; debate/antd-parity-scope-and-sequencing/02-Research/ADV-D.md:40,114; debate/antd-parity-scope-and-sequencing/02-Research/ADV-A.md:107,113; CLAUDE.md:10.
warrant:      Name checks and my minimum structural fixtures do not reject bad advice; evidence invalidation only requests review, and a targeted semantic fixture does not require a global map first. Rejection remains unexecuted; original bootstrap costs are 27 person-hours including 18 coordinator-hours, all unsupported estimates.
assumptions:  Accountable dispositions satisfy “không miss”; reviewer/Platform availability and all cost estimates are unsupported here; ownership acknowledgments are not established, so concurrency is proposed only; present-but-broken modes need current behavioral and Platform evidence, not registry membership.
confidence:   35/100  (delta: -35, because: the names-intact semantic escape and unpriced coordinator queue defeat my claimed necessity for pausing repairs)
```


```text
### r2 · SKEPTIC → JUDGE · answer
claim:        I accept A's manual drift exposure this week, judge B most exposed to wrong-but-present unexercised modes, and withdraw A's preference if one stale accepted row survives the proposed independent challenge.
steelman:     Once exclusive ownership is assumed, criticizing every safeguard without selecting a tolerable residual risk evades the decision.
evidence:     debate/antd-parity-scope-and-sequencing/00-Topic.md:85-111,123-124; debate/antd-parity-scope-and-sequencing/03-Reports/JUDGE-r2-questions.md:11,19-25,31-37,67-73; .claude/skills/godxjp-ui-component/SKILL.md:143-150; debate/antd-parity-scope-and-sequencing/02-Research/SKEPTIC.md (R2 answer).
warrant:      A retains upstream discovery without D's unevidenced prerequisite delay; Cascader's documented search-only partial pass supports the risk inference for B, while the existing reciprocal-name guard corrects my overstated structural critique but cannot certify advice; switch to D only after it rejects the same escape within a measured remaining-week budget, otherwise withhold affected acceptance.
assumptions:  Ownership is stipulated, not demonstrated; fixed constraints and exported-mode coverage remain; reviewers can withhold acceptance; capacity, complete manual invalidation and comparative failure rates are [unsupported]; reopening and reversal probes are proposed, not executed.
confidence:   90/100 (delta: -4 from R1 on the same false-acceptance-protection assessment, because: the Judge established an existing reciprocal-name guard, weakening my blanket critique without resolving semantic escapes); A preference: 70/100 initial, no prior option-confidence delta.
```


```text
### r2 · ADV-B → JUDGE · answer
claim:        I have no measured saving or demonstrated recurring detector that compensates for B's discovery blind spot, so I withdraw B as primary in favor of A with consumer-driven priority and acceptance.
steelman:     A already defers speculative implementation, while public-API-compliant screens can repeat incorrect catalog advice or leave exported modes unexercised; B must prove a compensating benefit.
evidence:     debate/antd-parity-scope-and-sequencing/02-Research/ADV-A.md:51-53; debate/antd-parity-scope-and-sequencing/02-Research/ADV-B.md:83-85,101-103; scripts/check-catalog-contradictions.mjs:9-16,34-46; .claude/skills/godxjp-ui-component/SKILL.md:143-150; debate/antd-parity-scope-and-sequencing/00-Topic.md:123-124.
warrant:      Demand-sensitive implementation is shared with A, so B's unmeasured saving cannot offset narrower discovery; diff-triggered reopening, weekly mode review and explicit terminal-state acceptance are proposed amendments, not demonstrated rejection mechanisms.
assumptions:  Fixed scope binds; fixtures, reviewer capacity, dependency mapping and ownership acknowledgments remain unsupported; recurrence is counterfactual; the report's 7-person-hour two-case pilot and 2-hour weekly triage are unsupported estimates, not measured savings; existing commitments remain.
confidence:   20/100  (delta: -32, because: A's already demand-sensitive queue removes B's claimed incremental spending advantage while B retains its admitted upstream discovery blind spot.)
```


```text
### r2 · ADV-A → JUDGE · answer
claim:        My R1 sequence has no demonstrated automatic reopening event or priced capacity evidence; retain A but require change-triggered manual revalidation before acceptance and daily until checking exists.
steelman:     Reciprocal names and intact props can hide incorrect advice or broken modes, while reviewers and integration owners form an unproven bottleneck.
evidence:     scripts/check-catalog-contradictions.mjs:9-16,34-46; .claude/skills/godxjp-ui-component/SKILL.md:143-155; src/components/data-entry/cascader.tsx:457-467; debate/antd-parity-scope-and-sequencing/02-Research/ADV-A.md (R2 answer); debate/antd-parity-scope-and-sequencing/03-Reports/JUDGE-r2-questions.md:13,43-49.
warrant:      The guard's name-presence predicate cannot reject bad advice with intact links; documented partial Cascader acceptance requires terminal-mode evidence, so changed source/guidance must invalidate acceptance pending review; the two-case 13.5-person-hour budget and release/acquire protocol are proposals, with no executed rejection or ownership acknowledgments.
assumptions:  Exhaustive disposition defines parity; pinned scope, checkpoint compliance, independent review and Platform access are proposed or unsupported; the counterexamples are hypothetical; 13.5 hours excludes repair implementation, full auditing and checker construction [unsupported estimate].
confidence:   62 (delta: -14, because: the Judge's unchanged-name counterexample and missing capacity/ownership evidence expose a stale-acceptance interval that my optional pilot did not control.)
```


```text
### r3 · JUDGE → all · ruling
claim:        Accept A as the primary strategy for capability accountability, reject literal Ant parity as the product goal, subordinate B to repair priority/acceptance and then D to a bounded pilot; C is disqualified.
steelman:     B grounds delivery in real consumer demand; C distinguishes supported availability from recorded gaps; D preserves decisions with executable transitions; A's manual review remains vulnerable to stale acceptance.
evidence:     debate/antd-parity-scope-and-sequencing/04-Decision.md (full ADR, fixed rubric and execution); debate/antd-parity-scope-and-sequencing/02-Research/SKEPTIC.md:51-60,73; debate/antd-parity-scope-and-sequencing/02-Research/ADV-B.md:110-120; debate/antd-parity-scope-and-sequencing/02-Research/ADV-D.md:123-135; scripts/check-catalog-contradictions.mjs:9-16,34-46; .claude/skills/godxjp-ui-component/SKILL.md:143-155; docs/roadmap/antd-parity.md:9-39.
warrant:      Weighted points in coverage/correctness/fit/cost/reversibility order: A 19+18+20+11+13=81; B 13+17+20+11+14=75; C 18+10+0+4+2=34 and ineligible; D 22+18+19+6+14=79. A wins by 2 over D because comprehensive discovery need not wait for an unproved global checker prerequisite. First checkpoint Tree/chat ownership and inventory, then independently challenge Topbar/Cascader acceptance, then complete a reviewed Tree slice. Exact-file release/acquire acknowledgments, one writer per group, one shared-file integrator and one validation slot govern later work. Reopen changed acceptance manually; one surviving stale accepted challenge withdraws reliance on that control. No credit for verbosity, first position, incumbent momentum or agreement; dissent and revisit conditions remain in the ADR.
assumptions:  Accountable disposition, not universal shipment, interprets “không miss”; scope will be pinned and current contents reconciled. Reviewer/Platform access, ownership compliance and remaining-week capacity are [unsupported]. The 15-person-hour initial allocation and later six-person-hour pilot cap are unsupported planning estimates, not completion promises. Challenges are proposed, not executed; this ruling certifies no runtime pass and changes only the three requested debate files.
confidence:   68/100 (initial outcome confidence; R2's 90/100 was procedural, so no comparable delta. Specific determinants: B's discovery blind spot, D's names-intact semantic escape and unsupported coordinator queue, and A's admitted manual stale-acceptance interval.)
```
