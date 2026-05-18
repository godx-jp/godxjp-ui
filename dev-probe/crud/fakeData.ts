// dev-only — seed generators. No external deps.

import type { AnyRecord, ObjectSchema, PropertyDef } from "./schemaTypes";
import { OBJECTS, ENUMS_BY_NAME } from "./loadObjects";

// People names — mixed Japanese / Latin / Vietnamese so the UI proves
// it can render both scripts side-by-side.
const PEOPLE: Array<{ first: string; last: string }> = [
  { first: "美咲", last: "田中" },
  { first: "健一", last: "佐藤" },
  { first: "由美", last: "高橋" },
  { first: "健太", last: "鈴木" },
  { first: "結衣", last: "中村" },
  { first: "大樹", last: "小林" },
  { first: "翔太", last: "伊藤" },
  { first: "陽菜", last: "山本" },
  { first: "智也", last: "渡辺" },
  { first: "彩花", last: "斎藤" },
  { first: "Lan",  last: "Nguyễn" },
  { first: "Minh", last: "Trần" },
  { first: "Hoa",  last: "Lê" },
  { first: "Tuan", last: "Phạm" },
  { first: "Linh", last: "Hoàng" },
  { first: "Sarah", last: "Johnson" },
  { first: "Michael", last: "Brown" },
  { first: "Emma", last: "Davis" },
  { first: "James", last: "Wilson" },
  { first: "Olivia", last: "Garcia" },
  { first: "Daniel", last: "Martinez" },
  { first: "Sophia", last: "Lopez" },
  { first: "Ryan", last: "Lee" },
  { first: "Chloe", last: "Kim" },
  { first: "Lucas", last: "Park" },
  { first: "Ava", last: "Smith" },
  { first: "Noah", last: "Jones" },
  { first: "Mia", last: "Taylor" },
  { first: "Ethan", last: "Anderson" },
  { first: "Isabella", last: "Thomas" },
];

const COMPANIES = [
  "Acme Corp", "ニトリ商事", "Globex", "サイバーソリューションズ", "Initech",
  "東京デザイン工房", "Umbrella", "FutureWorks", "ヴェルテックス", "Nguyen Trading",
  "ペガサス物流", "Tran Industries", "Sakura Foods", "ハーモニーラボ", "Stellar Bank",
  "Bluefield", "オリオン製作所", "TealCo", "京都クラフト", "Highrise Realty",
];

const WEBSITES = ["acme.com", "globex.co.jp", "initech.io", "umbrella.net", "future.dev"];
const DOMAINS = ["acme.com", "example.com", "godx.jp", "ouroboros.io", "stellar.bank"];

const ACTIVITY_SUBJECTS = [
  "初回打ち合わせ",
  "見積もり送付",
  "Demo follow-up",
  "契約レビュー",
  "Quarterly review",
  "電話フォロー",
  "提案書ドラフト",
  "Implementation kick-off",
];

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function pickFactory(rand: () => number) {
  return <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)]!;
}

const NOW = Date.now();

function randomTimestamp(rand: () => number): string {
  // past 18 months
  const past = NOW - Math.floor(rand() * 1000 * 60 * 60 * 24 * 540);
  return new Date(past).toISOString();
}

function randomFutureDate(rand: () => number): string {
  const future = NOW + Math.floor(rand() * 1000 * 60 * 60 * 24 * 180);
  return new Date(future).toISOString().slice(0, 10);
}

interface Bag {
  users: AnyRecord[];
  accounts: AnyRecord[];
  contacts: AnyRecord[];
}

function generateUsers(rand: () => number): AnyRecord[] {
  const pick = pickFactory(rand);
  const rows: AnyRecord[] = [];
  const used = new Set<string>();
  for (let i = 0; i < 50; i++) {
    const p = PEOPLE[i % PEOPLE.length]!;
    const fullName = `${p.last} ${p.first}`;
    let email = `${p.first.toLowerCase()}.${p.last.toLowerCase()}@${pick(DOMAINS)}`
      .replace(/[^a-z0-9.@]/g, "");
    while (used.has(email)) email = `u${i}.${email}`;
    used.add(email);
    rows.push({
      id: crypto.randomUUID(),
      name: fullName,
      email,
      role: pick(["admin", "manager", "sales", "sales", "sales"] as const),
      createdAt: randomTimestamp(rand),
    });
  }
  return rows;
}

function generateAccounts(rand: () => number, users: AnyRecord[]): AnyRecord[] {
  const pick = pickFactory(rand);
  const industries = ENUMS_BY_NAME["Industry"]!.values.map((v) =>
    typeof v === "string" ? v : v.value,
  );
  const rows: AnyRecord[] = [];
  for (let i = 0; i < 50; i++) {
    const name = `${COMPANIES[i % COMPANIES.length]}${i >= COMPANIES.length ? ` ${Math.floor(i / COMPANIES.length) + 1}` : ""}`;
    rows.push({
      id: crypto.randomUUID(),
      name,
      industry: pick(industries),
      website: `https://${pick(WEBSITES)}`,
      phone: `03-${1000 + Math.floor(rand() * 8999)}-${1000 + Math.floor(rand() * 8999)}`,
      employees: 10 + Math.floor(rand() * 5000),
      annualRevenue: Number((1_000_000 + rand() * 999_000_000).toFixed(2)),
      owner: pick(users).id,
      createdAt: randomTimestamp(rand),
    });
  }
  return rows;
}

function generateContacts(rand: () => number, users: AnyRecord[], accounts: AnyRecord[]): AnyRecord[] {
  const pick = pickFactory(rand);
  const rows: AnyRecord[] = [];
  for (let i = 0; i < 50; i++) {
    const p = PEOPLE[i % PEOPLE.length]!;
    rows.push({
      id: crypto.randomUUID(),
      firstName: p.first,
      lastName: p.last,
      email: `${p.first.toLowerCase()}.${p.last.toLowerCase()}.${i}@${pick(DOMAINS)}`
        .replace(/[^a-z0-9.@]/g, ""),
      phone: `080-${1000 + Math.floor(rand() * 8999)}-${1000 + Math.floor(rand() * 8999)}`,
      title: pick(["CEO", "CTO", "Manager", "営業部長", "Director", "Engineer"] as const),
      account: pick(accounts).id,
      owner: pick(users).id,
      createdAt: randomTimestamp(rand),
    });
  }
  return rows;
}

function generateLeads(rand: () => number, users: AnyRecord[]): AnyRecord[] {
  const pick = pickFactory(rand);
  const statuses = ENUMS_BY_NAME["LeadStatus"]!.values.map((v) => (typeof v === "string" ? v : v.value));
  const sources = ENUMS_BY_NAME["LeadSource"]!.values.map((v) => (typeof v === "string" ? v : v.value));
  const rows: AnyRecord[] = [];
  for (let i = 0; i < 50; i++) {
    const p = PEOPLE[i % PEOPLE.length]!;
    rows.push({
      id: crypto.randomUUID(),
      name: `${p.last} ${p.first}`,
      email: `${p.first.toLowerCase()}.${p.last.toLowerCase()}.l${i}@${pick(DOMAINS)}`
        .replace(/[^a-z0-9.@]/g, ""),
      company: COMPANIES[i % COMPANIES.length]!,
      status: pick(statuses),
      source: pick(sources),
      owner: pick(users).id,
      createdAt: randomTimestamp(rand),
    });
  }
  return rows;
}

function generateOpportunities(rand: () => number, users: AnyRecord[], accounts: AnyRecord[]): AnyRecord[] {
  const pick = pickFactory(rand);
  const stages = ENUMS_BY_NAME["OpportunityStage"]!.values.map((v) =>
    typeof v === "string" ? v : v.value,
  );
  const rows: AnyRecord[] = [];
  for (let i = 0; i < 50; i++) {
    const acct = pick(accounts);
    rows.push({
      id: crypto.randomUUID(),
      name: `${(acct.name as string)} - ${pick(["Annual License", "POC", "Renewal", "Expansion", "Add-on"] as const)}`,
      account: acct.id,
      stage: pick(stages),
      amount: Number((100_000 + rand() * 9_900_000).toFixed(2)),
      closeDate: randomFutureDate(rand),
      owner: pick(users).id,
      createdAt: randomTimestamp(rand),
    });
  }
  return rows;
}

function generateActivities(rand: () => number, users: AnyRecord[], contacts: AnyRecord[]): AnyRecord[] {
  const pick = pickFactory(rand);
  const kinds = ENUMS_BY_NAME["ActivityKind"]!.values.map((v) =>
    typeof v === "string" ? v : v.value,
  );
  const rows: AnyRecord[] = [];
  for (let i = 0; i < 50; i++) {
    rows.push({
      id: crypto.randomUUID(),
      subject: ACTIVITY_SUBJECTS[i % ACTIVITY_SUBJECTS.length]! + ` #${i + 1}`,
      kind: pick(kinds),
      dueDate: randomFutureDate(rand),
      relatedTo: pick(contacts).id,
      owner: pick(users).id,
      done: rand() < 0.4,
      createdAt: randomTimestamp(rand),
    });
  }
  return rows;
}

export function generateAll(): Record<string, AnyRecord[]> {
  const rand = rng(0xC0FFEE);
  const users = generateUsers(rand);
  const accounts = generateAccounts(rand, users);
  const contacts = generateContacts(rand, users, accounts);
  return {
    User: users,
    Account: accounts,
    Contact: contacts,
    Lead: generateLeads(rand, users),
    Opportunity: generateOpportunities(rand, users, accounts),
    Activity: generateActivities(rand, users, contacts),
  };
}

export function defaultRecord(obj: ObjectSchema): AnyRecord {
  const out: AnyRecord = { id: crypto.randomUUID() };
  for (const [name, raw] of Object.entries(obj.properties)) {
    const prop = raw as PropertyDef;
    if ("default" in prop && prop.default !== undefined) {
      out[name] = prop.default;
      continue;
    }
    switch (prop.type) {
      case "Boolean": out[name] = false; break;
      case "Timestamp": out[name] = new Date().toISOString(); break;
      case "Int": case "BigInt": case "TinyInt": case "Float": case "Decimal":
        out[name] = 0; break;
      default: out[name] = "";
    }
  }
  return out;
}

// Tiny no-op reference so tree-shakers + tsc keep OBJECTS bound to a
// runtime symbol — used by the loader's downstream consumer in store.ts.
export const __OBJECTS_REF = OBJECTS;
