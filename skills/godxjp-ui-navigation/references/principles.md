# Navigation and IA for a multi-role B2B operations app: an evidence-based reference

Scope: one web app, many roles. Frontline staff use it on phones; managers and HQ use it on desktop.
Researched 2026-10-16. Every rule cites a URL that actually returned content during research.
Quotes are kept to 15 words or fewer.

**Source tiers.** These tags show how much weight each source carries:
- **[P] Primary.** Research or official design-system guidance: NN/g, m3.material.io, developer.android.com, Apple HIG, GOV.UK Design System, the HMRC design system, SAP Fiori, Shopify dev docs, Microsoft Fluent 2, IBM Carbon and W3C WCAG.
- **[Pr] Practitioner.** Books and specialist sites: Dave O'Brien, *Tree Testing for Websites*; MeasuringU; A List Apart (Prater, McGovern); uxtigers (Nielsen's personal site).
- **[B] Blog or vendor.** Atlassian design blog, Salesforce Trailhead, Smashing Magazine.

The Atlassian Design System's public navigation page and the Salesforce Lightning Design System navigation page returned no guidance text. For those two systems I cite the Atlassian blog and Trailhead instead, and tag them [B].

---

## 0. Numbers at a glance

| Topic | Number | Source |
|---|---|---|
| Bottom navigation bar destinations | **3–5**. Fewer than 3: use tabs. More than 5: don't use a bar | [P] https://m3.material.io/components/navigation-bar/guidelines |
| Bottom bar label | **1–2 words**. Never remove it, wrap it or truncate it | [P] same |
| Navigation rail (tablet and desktop, collapsed) | **3–7** items; "should not be hidden" | [P] https://m3.material.io/components/navigation-rail/guidelines |
| Navigation bar on desktop | Don't use it ("not intended for desktop") | [P] m3 navigation bar |
| iOS tab bar | "aim for a default list of five or fewer"; "Avoid overflow tabs" | [P] https://developer.apple.com/design/human-interface-guidelines/tab-bars |
| Visible vs hidden navigation on mobile | **4 or fewer** top-level links: show them all as visible links | [P] https://www.nngroup.com/articles/hamburger-menus/ |
| Hidden navigation on desktop | Discoverability drops by more than **20%**; tasks take at least **39%** longer | [P] same |
| Sidebar depth | "no more than **two levels** of hierarchy" | [P] https://developer.apple.com/design/human-interface-guidelines/sidebars |
| Left panel (Carbon) | Two tiers; "does not support three tiers" | [P] https://carbondesignsystem.com/components/UI-shell-left-panel/usage/ |
| Fluent nav | "up to two levels of hierarchy" | [P] https://fluent2.microsoft.design/components/web/react/core/nav/usage |
| Progressive disclosure | **2 levels** is the practical maximum | [P] https://www.nngroup.com/articles/progressive-disclosure/ |
| Horizontal local navigation | "can support only **2–3 tiers**" | [P] https://www.nngroup.com/articles/local-navigation/ |
| Mega menu / cascading menus | Mega menus handle 2–3 tiers; cascading menus are inadvisable beyond 2 | [P] https://www.nngroup.com/articles/menu-design/ |
| Shopify app nav | Items from the **7th** onward collapse into "View more" | [P] https://shopify.dev/docs/apps/design/navigation |
| SAP Fiori page | **2–5 sections** per page, **3–7 apps** per section, **25 apps at most** per page | [P] https://www.sap.com/design-system/fiori-design-web/v1-148/foundations/integration-and-services/sap-fiori-launchpad/sap-fiori-launchpad-spaces |
| Tab labels (in-page tabs) | 1–2 words; "The fewer tabs, the better." | [P] https://www.nngroup.com/articles/tabs-used-right/ |
| Top tasks | "usually less than 10, often less than five" | [Pr] https://alistapart.com/article/what-really-matters-focusing-on-top-tasks/ |
| Card sort | **30–50 cards**. Qualitative: at least **15** participants. Quantitative: **30–50** | [P] https://www.nngroup.com/articles/card-sorting-definition/ |
| Tree test sample size | **50+ per tree** for quantitative comparison | [P] https://www.nngroup.com/articles/interpreting-tree-test-results/ |
| Tree test sample size and task count | About 50 per user group; **8–10 tasks** per participant | [Pr] https://treetesting.atlassian.net/wiki/spaces/TTFW/pages/1310747 and https://treetesting.atlassian.net/wiki/spaces/TTFW/pages/164260 |
| Tree test success bands | Poor <40, fair 41–60, good 61–80, very good 80–90, excellent >90 (%). Critical tasks: >90% | [P] NN/g interpreting tree test results (bands from Albert & Tullis across 98 usability studies, not only tree tests) |
| First click | 87% succeed after a correct first click, 46% after a wrong one | [Pr] https://measuringu.com/first-click/ (MeasuringU attributes the figures to outside research, webusability.com; the original paper was not checked) |
| Polyhierarchy (one item under several parents) | Cross-list only when a substantial share of users look in each parent (example: 30% each) | [P] NN/g interpreting tree test results |
| Breadcrumb tap target (mobile) | At least 1 cm × 1 cm | [P] https://www.nngroup.com/articles/breadcrumbs/ |
| Saved scroll position | Restore within a session (about 30–60 minutes) when content has not changed | [P] https://www.nngroup.com/articles/saving-scroll-position/ |

---

## 1. Global navigation structure

### 1.1 How many top-level destinations
- **Phone (bottom bar): 3–5.** Material says bars are for "Three to five main pages in the product." With more than 5, "don't use a navigation bar"; use tabs within a page or a modal expanded rail instead. With fewer than 3, use tabs. [P] https://m3.material.io/components/navigation-bar/guidelines
- **Android:** a bar holds "three to five navigation destinations across the same hierarchy level." A drawer can hold more than 5, but "isn't as ideal" because users have to reach to the top of the screen. [P] https://developer.android.com/design/ui/mobile/guides/layout-and-content/layout-and-nav-patterns
- **iOS:** "it's generally easier to navigate among fewer tabs". Avoid overflow tabs, because a More tab "makes it harder for people to reach and notice content". For complex apps, consider a sidebar, or a tab bar that adapts into one. [P] Apple HIG tab bars
- **Desktop (rail or sidebar):** the collapsed rail holds 3–7 items. The expanded rail "can reveal secondary destinations." Compact windows should always use a bar; expanded and larger windows use a rail. [P] https://m3.material.io/components/navigation-rail/guidelines
- **Navigation is not a site map.** GOV.UK: "Navigation is not a site map and does not need to list every part of your service." Link only "the most important top-level sections". [P] https://design-system.service.gov.uk/patterns/navigate-a-service/
- **Lean role pages.** SAP: "Show only the most important and most used apps per space". Rarely used apps stay reachable through the App Finder. [P] SAP spaces URL above
- **Few categories.** Shopify: define the app with the fewest possible categories; items 7 and beyond are truncated. [P] https://shopify.dev/docs/apps/design/navigation

### 1.2 Group by user task or work area, not by department or table
- NN/g's intranet research: "Task-based structures often better withstood organizational change" than structures organized by department. By 2014, 86% of new intranet IAs were fully or mostly task-based. Task-based means grouping information "according to how employees use it" rather than by who creates it. [P] https://www.nngroup.com/articles/intranet-information-architecture-ia/
- SAP names a space after the work area, not the role ("Do not use the business role name as a space title"). Page titles should be "task-oriented", never function- or product-oriented. [P] SAP spaces
- **Where OOUX fits.** Object-oriented UX (Sophia Prater) organizes the system around the real-world objects users recognize, with "object design before procedural action design". Navigation comes from the relationships between objects: "The content is the navigation, and it's all in context." Global navigation is "the fire escape." [Pr] https://alistapart.com/article/object-oriented-ux/
  - **Reconciling the two.** Top-level entries can be user-recognized objects (Orders, Inspections, Incidents) or work areas (Today, Inspect, Review). Either way, the label must be the user's noun and the user's task. "One entry per database table" is neither. See §8.
- **Audience-based menus often hurt.** "Segmenting a website's navigation by audience categories will often degrade usability" [P] https://www.nngroup.com/videos/audience-based-website-navigation/ For an app with logins, set the role through authentication instead of asking users to choose an audience menu (§2).

### 1.3 Labels
- **Nouns, short.** Shopify: "Use nouns instead of verbs to keep the navigation menu concise." Buttons use the verb + noun pattern instead. [P] Shopify app nav
- **1–2 words, always present, never truncated.** [P] m3 nav bar. The rail asks for "a one word label text" [P] m3 rail. Apple: "Use single words whenever possible." [P] HIG tab bars
- **Familiar words, no coined terms.** "Menus are not the place to get cute with made-up words." [P] https://www.nngroup.com/articles/menu-design/ Mistake #10 is to "make up their own terminology for labels". [P] https://www.nngroup.com/articles/top-10-ia-mistakes/ "Unfamiliar terminology can actually drive users away." [P] https://www.nngroup.com/articles/navigation-cognitive-strain/
- **Specific labels and information scent.** Labels should be "a succinct yet accurate description of what the page is about". It is "always good to be as specific as possible". [P] https://www.nngroup.com/articles/information-scent/ Broad labels: "Users are often reluctant to click on categories that are too broad." [P] https://www.nngroup.com/articles/fixing-bad-intranet-navigation/
- **Verb labels are not required.** Task-based labels "don't need a verb or an 'I need to…' pattern"; forcing that pattern makes labels long. [P] NN/g intranet IA
- **Icons support labels; they do not replace them.** [P] NN/g menu design. "Don't remove the labels from navigation items." [P] m3 nav bar
- **Front-load the key word** and left-align vertical menus. [P] NN/g menu design; https://www.nngroup.com/articles/mega-menus-work-well/
- **Sentence case** ("only capitalize the first word"). [P] Fluent nav. NN/g on tabs: "All caps negatively impacts legibility." [P]

### 1.4 Ordering and section headings
- **Most frequent first.** Fluent: "Prioritize the most important categories people might want to get to first." [P] Put common items nearest the trigger. [P] NN/g menu design. Put the most-used mega-menu group top-left. [P] NN/g mega menus
- **Find the frequent items with a top-tasks vote**, not by asking stakeholders. [Pr] McGovern, A List Apart. Base the split on "task analysis, field studies, and frequency-of-use data"; raw traffic can reflect mistaken visits. [P] NN/g progressive disclosure. SAP's "Day in a life of…" method asks what users need first and next, and what they bundle together. [P] SAP spaces
- **Fixed positions.** "Navigation bar destinations have fixed positions. Don't scroll them or modify their positions." [P] m3 nav bar. WCAG 3.2.3: repeated navigation must "occur in the same relative order each time". [P] https://www.w3.org/WAI/WCAG22/Understanding/consistent-navigation.html
- **Section headings in a sidebar.** "use succinct, descriptive labels to title each group." Use disclosure controls when the sidebar has many items. [P] Apple HIG sidebars. Fluent categories act as accordions. If a sub-item is active while its category is collapsed, the selection indicator moves to the category. [P] Fluent nav. SAP recommends standard section names, "Quick Access" and "Insights", to keep pages consistent. [P] SAP spaces

### 1.5 Settings, admin and utilities
- Utilities such as account, help and settings are "secondary" and can take a less prominent spot, but only if they follow convention. Users look "in the top-right corner" for them. [P] https://www.nngroup.com/articles/utility-navigation/
- Atlassian's redesign kept product navigation in the sidebar and moved notifications, settings and profile to the top bar. Users struggled to find settings at first; Atlassian kept the location because it matched other tools, and added onboarding. [B] https://www.atlassian.com/blog/design/designing-atlassians-new-navigation
- Apple: "Avoid putting critical information or actions at the bottom of a sidebar." [P] HIG sidebars. Fluent: avoid nav footers, which "might obscure other nav content." [P]
- Shopify: the overflow menu holds only "About this app" and "Support"; it is not for navigation. [P] Shopify app nav
- **Applied here:** keep configuration such as master data, users and templates out of the daily destinations. Give it its own admin area, entered from the utility or account area or the last sidebar group, and show it only to roles that can use it (§2).

### 1.6 Where "Create" goes
- A tab bar is for navigation, not actions: "Use a tab bar to support navigation, not to provide actions." [P] HIG tab bars
- Material: the FAB sits "right-aligned above the navigation bar" and must not cover it. In a rail, the FAB is top-aligned, "placing the app's key action above navigation destinations." [P] m3 bar and rail
- Atlassian: the top bar is "dedicated to universal actions like search and create". [B] Atlassian blog
- Salesforce: create a record from navigation-bar shortcuts or from **New** on the object home. Related lists have their own **New** buttons, which create a record already linked to the parent. [B] https://trailhead.salesforce.com/content/learn/modules/lightning-experience-for-salesforce-classic-users/work-with-your-data
- Shopify: the page header holds in-page actions; "Avoid placing the main navigation in the page header." [P]
- **Pattern:** one primary create action per context. Put it in the FAB or top bar for the role's main object, on the list page for that object, and as a related-list **New** for children, so the child inherits its parent.

---

## 2. Role-based navigation

- **Separate entry points per role.** SAP: "A space serves as an entry point for a business role". A user with several roles sees several top-level entries. [P] SAP spaces
- **Fixed start destination per role.** Android: "Every app you build has a fixed start destination." Login and setup screens are not start destinations. [P] https://developer.android.com/guide/navigation/principles
- **Broad roles are maintainable; fine-grained ones are not.** NN/g found that personalizing by "broader characteristics, such as location, department or management level" is easier to maintain, while over-segmenting became "impossible or too time consuming." Good personalization will "add content or reshuffle content rather than removing access". Offer "View as" for support staff. Let people reach content outside their profile. Wrong role data hurts "at every visit." [P] https://www.nngroup.com/articles/personalization/
- **Hide or disable: the sources only seem to disagree.**
  - Apple: "Don't disable or hide tab bar buttons, even when their content is unavailable", because doing so makes the interface "unstable and unpredictable." If a section is empty, explain why. [P] HIG tab bars
  - Smashing's test: "Will a given user ever be able to interact with this element?" Yes → disable it. No (permissions, access control) → hide it. [B] https://www.smashingmagazine.com/2024/05/hidden-vs-disabled-ux/ Nielsen: "features that are never available to a user should be hidden"; disable temporarily unavailable ones in a muted color and explain why. [Pr] https://www.uxtigers.com/post/inactive-buttons
  - **Reconciled rule:** give each role a navigation set that stays **stable within that role**. Leave out destinations the role can never use. Never add or remove items based on data state. An empty section stays visible and explains its emptiness. Inside a page, disable a temporarily blocked action and say why.
- **Progressive disclosure for advanced and admin features.** Frequent items go on the first level; rare ones go behind a visible, predictably labelled control. Two levels at most. "Avoid offering several routes to the same secondary options." [P] NN/g progressive disclosure. Atlassian lists progressive disclosure as a principle: approachable for newcomers, still powerful for experts. [B]
- **User customization as a complement.** Apple suggests letting people customize the tab bar and sidebar, keeping the default at five tabs or fewer. [P] HIG. SAP lets users personalize pages and keeps everything else in the App Finder. [P] Atlassian added Starred and Recent. [B]

---

## 3. Structure: hub-and-spoke, hierarchy, list → detail → sub-object

### 3.1 Hub-and-spoke vs persistent navigation
- A navigation hub, where the home page is the menu, "can work well in task-based websites and apps," especially when users stay in one branch per session. The costs: wasted home-page space and an extra step for every move. [P] https://www.nngroup.com/articles/mobile-navigation-patterns/
- **Applied here:** a phone user working one task at a time (for example, doing checks) can use a hub-style "Today" home behind a 3–5 item bottom bar. Desktop managers who move between sections need persistent sidebar navigation.

### 3.2 List → detail (object page) → sub-object
- **SAP floorplans.** The list report is for finding items in large data sets with filters. Use it when "Users need to find relevant items without knowing the exact item details." Use the object page when users "display, create, or edit an object" or need an overview of one object. Use the initial page when the identifier is known, for example "a code identified by a scanner". Use the wizard for guided creation. [P] https://www.sap.com/design-system/fiori-design-web/v1-148/page-types/floorplans/object-page/usage
- **Object page layout.** The header (title, key facts, global actions such as Edit and Delete) comes first. Then sections, reached by an **anchor bar (the default)** or by **tabs**. "Use tab navigation if your object page covers different topics that each have complex content", such as long tables. Tabs can show a count, for example "Checks (12)". On small screens the anchor bar becomes a dropdown. [P] SAP object page
- **Salesforce record page.** A highlights panel at the top, then Details, Related and Activity tabs. Related-list cards show up to 6 records in a wide region (3 in a narrow one), with a "View All" link. [B] Trailhead
- **Apple:** when a hierarchy is deeper than 2 levels, use a split view (sidebar → content list → detail) instead of deeper sidebar nesting. [P] HIG sidebars. For content below a sub-menu, Carbon says to use tabs inside the page instead. [P] Carbon left panel

### 3.3 Local navigation: tabs on an object page
- Local navigation is "contextual to the user's current location" and "should not be more salient than the global navigation." [P] https://www.nngroup.com/articles/local-navigation/
- Tabs: use them for distinct groupings that users don't need side by side. Put "high-use content … first in the list and selected by default". Labels of 1–2 words. Use at least 2 selection indicators. Never mix in-page tabs and navigation tabs in one control. Don't stack tab rows. [P] https://www.nngroup.com/articles/tabs-used-right/
- Material: "Use navigation for distinct pages and tabs for related content within a page". [P] m3 nav bar

### 3.4 Breadcrumbs
- **Use them** on deep hierarchies, especially for users who arrive by an external link or deep link. **Skip them** on flat (1–2 level) or linear flows. [P] NN/g breadcrumbs. GOV.UK: "Do not use the breadcrumbs component on websites with a flat structure". [P] https://design-system.service.gov.uk/components/breadcrumbs/
- **Show location, not history.** Breadcrumbs "show the hierarchical structure of the site", not the session path. For an item with several parents, pick one canonical trail. Link only to real pages. [P] NN/g breadcrumbs
- **Should the trail include the current page? The sources disagree.**
  - NN/g: end with the current page, shown as non-clickable text ("You should never have a link that does nothing").
  - GOV.UK: "end with the parent section of the current page"; it later removed advice to include the current page.
  - **Recommendation for this app:** the object page header already shows the object title as an H1 directly under the breadcrumb, so follow GOV.UK and end at the parent. Repeating the title adds nothing. If a page has no visible H1 title, follow NN/g instead.
- **Depth.** SAP: "Limit the breadcrumb to the drilldown levels within the object page." [P] The global nav covers the top level, so don't repeat "Home" if the nav already has it. [P] NN/g
- **Mobile.** Don't let the trail wrap. Show only the last level or two, for example "← Order 2024-118". [P] NN/g. GOV.UK has a `collapseOnMobile` option that keeps the first and last items. [P]
- **Back link vs breadcrumb.** "Never use the back link component together with the Breadcrumbs component." A back link must return users "in the state they last saw it". [P] https://design-system.service.gov.uk/components/back-link/

### 3.5 Back behavior, deep links and keeping context
- Back "is supposed to lead back to the previous screen, essentially acting as an undo." [P] https://www.nngroup.com/articles/mental-models/
- **Deep links rebuild the path.** A deep link's back stack "should match a back stack that could have been achieved" by navigating normally. In practice, opening an incident from a notification and pressing Back goes to its parent list, not out of the app. [P] Android principles of navigation
- **Restore list state.** Failing to save the scroll position "increases the interaction cost". Restore the position, and the pagination page, when users bounce between list and detail ("pogo-sticking"). Reset after about 30–60 minutes or when content has changed, with a visible cue. [P] https://www.nngroup.com/articles/saving-scroll-position/
- **Remember each section's state.** When users switch destinations often, "preserve each section's state" (scroll, tab, in-line search). Re-tapping the active item scrolls to the top. [P] m3 nav bar. Apple: tab bars let people switch "while preserving the current navigation state within each section." [P] HIG tab bars
- **Filters and branch/location scope.** *No source here covers this directly; this is an inference.* The sources above all say to return users to the state they left: Material's preserve-state option, GOV.UK's "state they last saw it", and NN/g's scroll and pagination restoration. So keep list filters, and the selected branch or location, across list → detail → back and across sections. Put them in the URL, so deep links and shared links reproduce the same view. Show the current scope as a persistent, visible control in the header, never only inside a filter panel.

---

## 4. Cross-linking related objects (order ↔ inspection ↔ incident)

- **OOUX.** Find each object's relationships ("nested objects") and make them cross-links, so every instance links to its neighbors and there are no dead ends. Rank related objects by importance before placing them. Use "an object map, not a sitemap". [Pr] https://alistapart.com/article/object-oriented-ux/
- **Related lists on the record page**, each with a count, a few preview rows, "View All" and a contextual **New**. [B] Trailhead. SAP object page subsections can mix related content, and inline links can open another page or a quick view. [P] SAP object page
- **Search tied into structure.** Mistake #2 is search results that don't let users "navigate the neighborhood around their search destination". [P] NN/g top-10 IA mistakes
- **Actions where they apply.** Global actions belong in the object header, such as Edit and Delete. [P] SAP. Atlassian consolidated item actions onto the navigation item itself, shown on hover. [B]
- **Multiple ways, not duplicate entries.** WCAG 2.4.5: "More than one way is available to locate a web page" [P] https://www.w3.org/WAI/WCAG22/Understanding/multiple-ways.html That calls for multiple *mechanisms* (navigation, search, cross-links). It does not call for listing the same item twice in the menu. NN/g: show each choice only once in a menu [P] NN/g mega menus; "Designers know these links are duplicates, but users do not." [P] NN/g cognitive strain. Cross-list an item under two parents only when a substantial share of users look in each (NN/g example: 30% each). [P] NN/g interpreting tree tests

---

## 5. Mobile navigation (frontline phones)

- **Bottom bar with 3–5 destinations**, icon plus a 1–2 word label, one active item, fixed order. No swiping between destinations. Keep the bar visible, except when a dialog, sheet or keyboard covers it temporarily. Don't hide it on scroll while a screen reader is active. [P] m3 nav bar. Apple: keep it visible across sections, except under modals. [P] HIG tab bars
- **Prefer visible navigation.** With 4 or fewer top-level links, show them all. Hidden navigation was used in 57% of mobile cases versus 86% for combo navigation, and mobile tasks took 15% longer with it. Never use a hamburger on desktop. [P] https://www.nngroup.com/articles/hamburger-menus/
- **Primary action.** Use a FAB above the bar, right-aligned, not covering it. Never put an action in a tab slot. [P] m3; HIG
- **What goes under "More".** Apple discourages overflow because hidden tabs are hard "to reach and notice". [P] HIG. In practice, put only low-frequency, non-daily items there: profile, settings, help, sign out, switch branch. Never put a top task there. If a role needs more than 5 daily destinations, the role's IA is too broad. Split by task, or move secondary objects into object pages (§3–4). For links you must hide, add in-page links to important content. [P] NN/g hamburger
- **Badges** only for critical, actionable information, such as overdue checks. [P] HIG tab bars; m3
- **Adapt by width, not by device type.** Use a bar in compact widths, a bar or rail in medium widths, and a rail or sidebar in expanded widths. "Avoid using the same bottom navigation bar across sizes." [P] Android layout patterns; m3

---

## 6. Wayfinding signals

- **Active state.** One active indicator only, with at least a 3:1 contrast ratio. Use a filled icon for active and outlined for inactive. [P] m3 nav bar and rail. Not showing the current location is "probably the single most common mistake" in menus. [P] NN/g menu design. The selected section should become "more visually prominent"; use color and position together. [P] https://www.nngroup.com/articles/navigation-you-are-here/
- **Page title matches the menu label.** The `<title>` should start with "the same <h1> as the page". The format is H1 – section – service; leave out GOV.UK on internal services. Every title must be unique. [P] https://design.tax.service.gov.uk/hmrc-design-patterns/page-title/
  - *Inference:* the H1 of a top-level destination should use the same word as its navigation label. NN/g says labels must promise what the destination delivers [P] NN/g information scent. WCAG 3.2.4 requires same-function components to be "identified consistently". [P] https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification.html
- **Consistent navigation.** Mistake #8: sites that "change their navigation features as users move around". [P] NN/g top-10 IA. Hiding the tab bar makes people "forget which area of the app they're in." [P] HIG
- **Every page can be an entry point.** "Each page on a website could be the first page your website visitors see." Show enough context to continue. [P] NN/g you-are-here
- **Use the same name for an object everywhere:** navigation, H1, breadcrumb, related-list title and buttons ("New check", not "Add inspection"). [P] WCAG 3.2.4; NN/g information scent

---

## 7. How to evaluate

1. **Top tasks first.** Ask each role to vote for its top 5 from a long list written in users' words. The result is a league table that sets navigation priority. [Pr] McGovern
2. **Card sort, to generate a structure.** Open sorts suit discovery. Use 30–50 cards, at least 15 participants for a qualitative study or 30–50 for a quantitative one. Card sorting is for "generating" a structure, not evaluating one, and it produces only one level of grouping. [P] https://www.nngroup.com/articles/card-sorting-definition/
3. **Tree test, to evaluate a structure.** Use a text-only hierarchy. Measure success, directness (whether people got there without backtracking) and first click. Task wording must "avoid using terms that give away the answers". Pilot with a few moderated sessions. [P] https://www.nngroup.com/articles/tree-testing/
   - Thresholds: good is 61–80%, critical tasks need >90%, and direct failures are "a particularly bad result." Scattered first clicks mean the categories overlap. Use 50+ participants per tree when comparing trees. [P] https://www.nngroup.com/articles/interpreting-tree-test-results/
   - Use 8–10 tasks per participant, about 50 participants per user group, more when each person gets only a subset of tasks. [Pr] O'Brien, treetesting.atlassian.net
4. **First-click and click tests on screenshots or wireframes** check the visual layer, not the IA. Combine methods to tell IA problems from UI problems. [P] https://www.nngroup.com/articles/navigation-ia-tests/ A correct first click predicts success: 87% vs 46%. [Pr] MeasuringU
5. **Usability testing of the real UI**, measuring task success, difficulty and time. [P] NN/g navigation-IA tests. McGovern's Task Performance Indicator tracks success and time for top tasks. [Pr]
6. **Lightweight expert walkthrough, without users.** This is a cognitive walkthrough applied to the tree. It finds problems but does not replace a tree test. [P] https://www.nngroup.com/articles/cognitive-walkthroughs/
   - a. Write 8–10 realistic tasks per role, using the role's own words and no menu labels (for example, "A delivery arrived damaged this morning. Log the problem.").
   - b. Write out the navigation tree per role as text: top level → second level → page.
   - c. For each task, at each level, answer NN/g's four questions: will the user try the right result? Notice the correct option? Link the label to the goal? See progress afterwards? Any "no" marks that step as failed.
   - d. Record the expected first click and any second-best label that competes with it. Competing labels predict scattered first clicks.
   - e. Check against the anti-patterns in §8 and the numbers table in §0.
   - f. Treat the output as hypotheses. Confirm critical tasks with a real tree test (50+ per tree) when possible. NN/g says the walkthrough "should be paired with other methods".

---

## 8. Anti-patterns

| Anti-pattern | Evidence |
|---|---|
| Menu mirrors the org chart or departments | Task-based IA "better withstood organizational change" than department-based IA. [P] NN/g intranet IA |
| Menu mirrors the database schema (one entry per table) | *No source says this verbatim.* It follows from: users navigate by their own mental model ("gap between designers' and users' mental models") [P] https://www.nngroup.com/articles/mental-models/; task-based beats structure by owner [P] NN/g intranet IA; OOUX models *user-recognized* objects and their relationships, not storage tables [Pr] |
| Too many top-level items | More than 5 breaks the bottom bar [P] m3. "Numerous weak categories" and "too many classification options" [P] NN/g top-10 IA #4. "Too many places to look." [P] #9 |
| Ambiguous, coined or jargon labels | #10 "make up their own terminology". [P] NN/g. "Unfamiliar terminology can actually drive users away." [P] NN/g cognitive strain. Labels that are too broad. [P] NN/g fixing intranet navigation |
| Configuration mixed with daily work | Primary items for frequent needs; rare ones on a secondary level. [P] NN/g progressive disclosure. Show only the most-used apps per space. [P] SAP spaces |
| Duplicate entries | "Designers know these links are duplicates, but users do not." [P] NN/g cognitive strain. Show each choice once. [P] NN/g mega menus. Extreme polyhierarchy. [P] NN/g top-10 #4 |
| Hidden navigation on desktop or a hamburger | "Do not use hidden navigation… in desktop user interfaces." [P] NN/g hamburger. "any feature that users can't see might as well not exist" [P] NN/g top-10 #6 |
| Navigation that changes between pages or with data state | #8 inconsistent navigation [P] NN/g. "Don't disable or hide tab bar buttons" [P] HIG. WCAG 3.2.3 [P] |
| Actions in navigation slots | "Use a tab bar to support navigation, not to provide actions." [P] HIG |
| Audience-segmented menus | "will often degrade usability" [P] NN/g video |
| Breadcrumb as history, or a breadcrumb plus a back link | Breadcrumbs show hierarchy [P] NN/g; "Never use the back link… together with the Breadcrumbs" [P] GOV.UK |
| Losing list position or filters on Back | "the page often resets to the top of the list" [P] NN/g saving scroll position |
| Main navigation in the page header, or repeated in the page body | "Avoid placing the main navigation in the page header"; avoid "replicating the app nav content in the app body" [P] Shopify |
| More than 2 levels of sidebar or cascading menus | [P] HIG sidebars; Carbon; Fluent; NN/g menu design |
| Dead ends on object pages | Give paths onward from every object instance [Pr] OOUX (A List Apart) |

---

## 9. Checklist (28 rules for a design skill)

| # | Rule | Source |
|---|---|---|
| 1 | Phone: bottom bar with 3–5 destinations. Fewer than 3: use tabs. More than 5: rethink the IA, don't add overflow. | https://m3.material.io/components/navigation-bar/guidelines |
| 2 | Desktop: persistent, visible sidebar or rail (3–7 primary items when collapsed). Never a hamburger-only menu on desktop. | https://m3.material.io/components/navigation-rail/guidelines ; https://www.nngroup.com/articles/hamburger-menus/ |
| 3 | Choose navigation by window width (bar → rail → sidebar), not by device type. Never stretch the bottom bar to desktop. | https://developer.android.com/design/ui/mobile/guides/layout-and-content/layout-and-nav-patterns |
| 4 | Global navigation is not a site map. List only the top sections each role uses most. | https://design-system.service.gov.uk/patterns/navigate-a-service/ |
| 5 | Group by user task or work area, never by department, org chart or table. | https://www.nngroup.com/articles/intranet-information-architecture-ia/ |
| 6 | Labels are short nouns in the users' words, 1–2 words, never coined terms. | https://shopify.dev/docs/apps/design/navigation ; https://www.nngroup.com/articles/top-10-ia-mistakes/ |
| 7 | Every navigation item has a visible text label. Icons only support the label. Never truncate. | https://m3.material.io/components/navigation-bar/guidelines |
| 8 | Order by frequency of use measured from users (top-tasks vote or field study). Positions stay fixed. | https://www.nngroup.com/articles/progressive-disclosure/ ; https://www.w3.org/WAI/WCAG22/Understanding/consistent-navigation.html |
| 9 | Sidebar: at most 2 levels, with short group headings. Deeper data goes into list → detail inside the page. | https://developer.apple.com/design/human-interface-guidelines/sidebars |
| 10 | Settings, admin and configuration live apart from daily work (utility area or admin section), behind a second level at most. | https://www.nngroup.com/articles/utility-navigation/ ; https://www.nngroup.com/articles/progressive-disclosure/ |
| 11 | Navigation slots navigate; they never perform actions. Put Create in a FAB or top bar for the main object, and in context for children. | https://developer.apple.com/design/human-interface-guidelines/tab-bars |
| 12 | Each role gets its own fixed start page, named after the work area, with task-oriented sections. | https://www.sap.com/design-system/fiori-design-web/v1-148/foundations/integration-and-services/sap-fiori-launchpad/sap-fiori-launchpad-spaces |
| 13 | Keep start pages lean: 2–5 sections, 3–7 entries per section, 25 at most. Everything else stays reachable through search or "All". | same SAP URL |
| 14 | Leave out destinations a role can never use. Never add or remove items based on data state. Disable temporarily blocked actions and explain why. | https://www.smashingmagazine.com/2024/05/hidden-vs-disabled-ux/ ; https://developer.apple.com/design/human-interface-guidelines/tab-bars |
| 15 | Use a few broad roles. Reshuffle what is shown rather than removing access. Provide "View as" for support. | https://www.nngroup.com/articles/personalization/ |
| 16 | List page for finding items; object page for one item (header with key facts and global actions, then sections). Scan-to-open goes straight to the object. | https://www.sap.com/design-system/fiori-design-web/v1-148/page-types/floorplans/object-page/usage |
| 17 | Object-page sections use an anchor bar, or tabs when sections are heavy. Tabs have 1–2 word labels, the most-used tab first and selected, and a count. | https://www.nngroup.com/articles/tabs-used-right/ |
| 18 | Local navigation is always visually subordinate to global navigation. | https://www.nngroup.com/articles/local-navigation/ |
| 19 | Breadcrumbs show hierarchy, not history, and only on pages at least 3 levels deep. Each crumb is a real page. Collapse to the parent on mobile. Never combine them with a back link. | https://www.nngroup.com/articles/breadcrumbs/ ; https://design-system.service.gov.uk/components/back-link/ |
| 20 | Deep links rebuild the normal parent path, so Back goes to the parent list. | https://developer.android.com/guide/navigation/principles |
| 21 | Back restores the list's scroll position, page, filters and scope. Put filters and scope in the URL. | https://www.nngroup.com/articles/saving-scroll-position/ |
| 22 | Each top-level section keeps its own state when users switch away and back. Re-tapping the active item scrolls to the top. | https://m3.material.io/components/navigation-bar/guidelines |
| 23 | Every object links to its related objects (related lists with a count, preview rows, View all and a contextual New). No dead ends. | https://alistapart.com/article/object-oriented-ux/ |
| 24 | Offer several ways to find things (navigation, search, cross-links), but each menu entry appears once. Cross-list only when about 30% or more of users look in each parent. | https://www.w3.org/WAI/WCAG22/Understanding/multiple-ways.html ; https://www.nngroup.com/articles/interpreting-tree-test-results/ |
| 25 | Show one clear active state (2 cues, at least 3:1 contrast). Show the current location at every level. | https://www.nngroup.com/articles/menu-design/ |
| 26 | The page H1 and `<title>` use the same word as the navigation label. Each object keeps one name everywhere. | https://design.tax.service.gov.uk/hmrc-design-patterns/page-title/ ; https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification.html |
| 27 | Navigation stays the same on every page (no moving, appearing or disappearing items) and stays visible except under modals. | https://www.nngroup.com/articles/top-10-ia-mistakes/ |
| 28 | Validate the structure: expert cognitive walkthrough of the tree per role (8–10 tasks), then a tree test where possible. Critical tasks need >90% success. Treat direct failures as defects. | https://www.nngroup.com/articles/cognitive-walkthroughs/ ; https://www.nngroup.com/articles/interpreting-tree-test-results/ |

---

### Known gaps and caveats
- **Branch and location scope persistence** (§3.5) and **"don't mirror the DB schema"** (§8) are inferences from related primary guidance. No source states either directly.
- The Albert & Tullis success bands come from general usability studies. NN/g applies them to tree tests.
- The 87% / 46% first-click figures are cited secondhand (MeasuringU → webusability.com). The original paper was not checked.
- Several sources returned 404/410 or no text and are not cited: NN/g hub-and-spoke, Jakob's-law and first-click URLs; the GOV.UK "start pages" pattern (replaced in March 2022 by https://design-system.service.gov.uk/patterns/start-using-a-service); the atlassian.design navigation page; the Lightning Design System navigation page.
- Jakob's law is cited through NN/g's mental-models article: "Users spend most of their time on websites other than yours." https://www.nngroup.com/articles/mental-models/
