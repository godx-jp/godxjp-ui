/* global React, window */
/* eslint-disable react/prop-types */
const { useState: useStateA, useMemo: useMemoA } = React;

// Helper: yen-format integer.
const yen = (n) => "¥" + (n || 0).toLocaleString();

// ── Dashboard ─────────────────────────────────────────────────────────
function MeDashboard({ user, memberships, invitations, payslips, activity, setRoute, locale, services }) {
  const I = window.I;
  const today = new Date(2026, 4, 16);
  const greet = locale === "ja" ? "おはようございます" : locale === "vi" ? "Xin chào" : "Good morning";
  const dateLabel = locale === "ja"
    ? `${today.getFullYear()}年${today.getMonth()+1}月${today.getDate()}日(${["日","月","火","水","木","金","土"][today.getDay()]})`
    : today.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", { weekday: "long", year: "numeric", month: "short", day: "numeric" });

  const active = memberships.filter(m => m.status === "active");
  const past   = memberships.filter(m => m.status === "past");
  const accountAgeY = Math.floor((today - new Date(user.joinedSystem)) / (365.25*24*60*60*1000));
  const latestPayslip = payslips.find(p => p.status === "released");

  return (
    <div className="page me-page">
      <header className="me-hero">
        <div className="me-hero-avatar" style={{ background: user.avatarAccent }}>{user.initials}</div>
        <div className="me-hero-body">
          <h1 className="me-hero-name">
            {greet}、{user.name}
            <span className="me-hero-name-kana">{user.nameKana}</span>
          </h1>
          <div className="me-hero-meta">
            <span>{dateLabel}</span>
            <span className="sep">·</span>
            <span>アカウント開設から {accountAgeY} 年</span>
            <span className="sep">·</span>
            <span className="row gap-1" style={{ display: "inline-flex" }}>
              <span className="dot" style={{ background: "var(--success)" }}/> 二段階認証 有効
            </span>
          </div>
        </div>
        <div className="me-hero-stats">
          <div>
            <div className="me-hero-stat-v tnum">{active.length}</div>
            <div className="me-hero-stat-l">所属組織</div>
          </div>
          <div>
            <div className="me-hero-stat-v tnum">{past.length}</div>
            <div className="me-hero-stat-l">過去の組織</div>
          </div>
          <div>
            <div className="me-hero-stat-v tnum">{invitations.length}</div>
            <div className="me-hero-stat-l">未読の招待</div>
          </div>
        </div>
      </header>

      {invitations.length > 0 && (
        <div className="invite-banner" onClick={() => setRoute("invitations")} style={{ cursor: "pointer" }}>
          <div className="invite-banner-icon">{I.handshake(18)}</div>
          <div className="invite-banner-body">
            <div className="invite-banner-title">
              {invitations.length} 件の招待があります
            </div>
            <div className="invite-banner-desc">
              {invitations.map(i => i.orgName).join(" · ")} から組織への参加を依頼されています
            </div>
          </div>
          <button className="btn btn-secondary btn-sm">確認する {I.arrowRight(13)}</button>
        </div>
      )}

      <section className="ds-section">
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
          <div className="ds-section-label" style={{ margin: 0 }}>所属組織</div>
          <button className="btn btn-ghost btn-sm" onClick={() => setRoute("orgs")}>すべて表示 {I.arrowRight(12)}</button>
        </div>
        <div className="me-orgs">
          {active.map(m => <MiniOrgCard key={m.id} m={m} services={services} onOpen={() => setRoute("orgs")} />)}
        </div>
      </section>

      <div className="ov-grid" style={{ gridTemplateColumns: "1.4fr 1fr", marginBottom: 36 }}>
        <section>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
            <div className="ds-section-label" style={{ margin: 0 }}>最新の給与明細</div>
            <button className="btn btn-ghost btn-sm" onClick={() => setRoute("payslips")}>明細一覧 {I.arrowRight(12)}</button>
          </div>
          {latestPayslip && <LatestPayslipCard p={latestPayslip} setRoute={setRoute} />}
        </section>

        <section>
          <div className="ds-section-label">最近のアクティビティ</div>
          <div className="card" style={{ padding: "8px 16px" }}>
            <div className="activity-list">
              {activity.slice(0,6).map(a => (
                <div key={a.id} className="activity-item">
                  <div className="activity-time">{a.at}</div>
                  <div className={`activity-icon ${a.kind}`}>{I[a.icon] ? I[a.icon](14) : I.info(14)}</div>
                  <div className="activity-text">{a.text}</div>
                  <div className="activity-org">{a.org || ""}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="ds-section">
        <div className="ds-section-label">クイックアクション</div>
        <div className="ds-stats">
          <QuickAction icon={I.handshake(18)} label="組織を作成"      desc="自分の組織を新しく立ち上げる" onClick={() => setRoute("orgs")}/>
          <QuickAction icon={I.wallet(18)}    label="給与明細をDL"   desc="今月分の PDF をダウンロード" onClick={() => setRoute("payslips")}/>
          <QuickAction icon={I.shieldCheck(18)} label="本人確認を更新" desc="マイナンバー・身分証情報"   onClick={() => setRoute("identity")}/>
          <QuickAction icon={I.lock(18)}      label="プライバシー設定" desc="各組織との情報共有を確認"   onClick={() => setRoute("privacy")}/>
        </div>
      </section>
    </div>
  );
}

function MiniOrgCard({ m, services, onOpen }) {
  const I = window.I;
  return (
    <article className="me-org-card" onClick={onOpen} style={{ cursor: "pointer" }}>
      <div className="me-org-head">
        <div className="me-org-mark" style={{ background: m.orgColor }}>{m.orgInitial}</div>
        <div className="grow" style={{ minWidth: 0 }}>
          <div className="me-org-name">{m.orgName}</div>
          <div className="me-org-role">
            {m.role} · {m.department === "—" ? m.branch : m.department}
          </div>
        </div>
        {m.isOwner && <span className="badge badge-attention" title="Owner"><span className="dot"/>Owner</span>}
      </div>
      <div className="me-org-services">
        {m.services.length === 0 ? <span className="muted" style={{ fontSize: 11 }}>連携サービスなし</span> :
          m.services.map(sid => {
            const s = services[sid];
            return <span key={sid} className="chip"><span className="prod-sticker xs" style={{ background: s.accent }}>{s.sticker}</span>{s.name}</span>;
          })}
      </div>
    </article>
  );
}

function LatestPayslipCard({ p, setRoute }) {
  const I = window.I;
  return (
    <div className="card" style={{ padding: "20px 24px" }}>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="muted" style={{ fontSize: 12 }}>{p.orgName} · {p.periodLabel}</div>
          <div className="payslip-summary-v" style={{ marginTop: 4 }}>
            {yen(p.net)}<span className="yen">手取り</span>
          </div>
          <div className="payslip-summary-l">支給日 {p.paidAt}</div>
        </div>
        <span className="badge badge-success"><span className="dot"/>公開済み</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
        <Mini l="総支給額" v={yen(p.gross)} />
        <Mini l="控除合計" v={yen(p.deductions)} />
        <Mini l="差引支給" v={yen(p.net)} primary />
      </div>
      <div className="row gap-2" style={{ marginTop: 16 }}>
        <button className="btn btn-secondary btn-sm">{I.download(12)} PDFをダウンロード</button>
        <button className="btn btn-ghost btn-sm" onClick={() => setRoute("payslips")}>詳細を見る</button>
      </div>
    </div>
  );
}

function Mini({ l, v, primary }) {
  return (
    <div>
      <div className="muted" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</div>
      <div className="tnum" style={{ fontSize: primary ? 18 : 15, fontWeight: 500, marginTop: 2, color: primary ? "var(--primary)" : undefined }}>{v}</div>
    </div>
  );
}

function QuickAction({ icon, label, desc, onClick }) {
  const I = window.I;
  return (
    <button className="ov-tile" onClick={onClick} style={{ textAlign: "left" }}>
      <div className="ov-tile-icon">{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.3 }}>{label}</div>
      <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{desc}</div>
    </button>
  );
}

// ── Profile ──────────────────────────────────────────────────────────
function MeProfile({ user }) {
  const I = window.I;
  return (
    <div className="page me-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">プロフィール</h1>
          <p className="page-subtitle">あなたの基本情報。所属するすべての組織で共有されます。</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm">{I.check(13)} 変更を保存</button>
        </div>
      </header>

      <div className="ov-grid" style={{ gridTemplateColumns: "320px 1fr" }}>
        <div className="card identity-card">
          <div className="identity-avatar" style={{ background: user.avatarAccent }}>
            {user.initials}
            <button className="change" title="変更">{I.camera(14)}</button>
          </div>
          <div className="identity-name">{user.name}</div>
          <div className="identity-kana">{user.nameKana}</div>
          <div className="identity-email">{user.email}</div>
          <div className="identity-badges">
            {user.emailVerified && <span className="badge badge-success"><span className="dot"/>メール確認済み</span>}
            {user.phoneVerified && <span className="badge badge-success"><span className="dot"/>電話確認済み</span>}
            {user.twoFactorEnabled && <span className="badge badge-info"><span className="dot"/>2FA 有効</span>}
            {user.hasMyNumber && <span className="badge badge-info"><span className="dot"/>マイナンバー登録済</span>}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">基本情報</h3></div>
          <div className="settings-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <ProfileField label="表示名" value={user.name} hint="所属組織すべてで表示されます" />
            <ProfileField label="ローマ字" value={user.nameRomaji} />
            <ProfileField label="フリガナ" value={user.nameKana} />
            <ProfileField label="生年月日" value={user.birthDate} type="date" />
            <ProfileField label="性別" value="女性" />
            <ProfileField label="国籍" value="🇯🇵 日本" />
            <ProfileField label="使用言語" value={user.languages.map(l => ({ja:"日本語",en:"English",vi:"Tiếng Việt"}[l])).join(" · ")} />
            <ProfileField label="タイムゾーン" value="Asia/Tokyo (UTC+9)" />
          </div>
          <hr className="divider"/>
          <div className="muted" style={{ fontSize: 12 }}>
            これらの情報は<strong style={{ color: "var(--foreground)" }}>あなた個人のもの</strong>で、所属組織にコピーされません。各組織が見れる項目は<a style={{ color: "var(--primary)", marginLeft: 4 }}>プライバシー設定</a>で個別に管理できます。
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, value, hint, type }) {
  return (
    <div className="form-row">
      <label className="label">{label}</label>
      <input className="input" type={type || "text"} defaultValue={value}/>
      {hint && <div className="help">{hint}</div>}
    </div>
  );
}

// ── Contact ──────────────────────────────────────────────────────────
function MeContact({ user }) {
  const I = window.I;
  return (
    <div className="page me-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">連絡先</h1>
          <p className="page-subtitle">サインインに使用するメール、緊急時の連絡先。</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm">{I.check(13)} 保存</button>
        </div>
      </header>

      <div className="settings-grid">
        <div className="card">
          <div className="card-header"><h3 className="card-title">メールアドレス</h3></div>
          <div className="form-row">
            <label className="label">プライマリ</label>
            <div className="row gap-2">
              <input className="input mono" defaultValue={user.email} style={{ flex: 1 }}/>
              <span className="badge badge-success"><span className="dot"/>確認済</span>
            </div>
            <div className="help">サインインとパスワードリセットに使用</div>
          </div>
          <div className="form-row">
            <label className="label">セカンダリ（業務用）</label>
            <div className="row gap-2">
              <input className="input mono" defaultValue={user.emailSecondary} style={{ flex: 1 }}/>
              <button className="btn btn-ghost btn-sm">{I.trash(12)}</button>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm">{I.plus(13)} メールを追加</button>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">電話番号</h3></div>
          <div className="form-row">
            <label className="label">携帯</label>
            <div className="row gap-2">
              <input className="input" defaultValue={user.phone} style={{ flex: 1 }}/>
              <span className="badge badge-success"><span className="dot"/>SMS 確認済</span>
            </div>
            <div className="help">2段階認証と緊急時の連絡に使用</div>
          </div>
        </div>

        <div className="card" style={{ gridColumn: "span 2" }}>
          <div className="card-header"><h3 className="card-title">住所</h3></div>
          <div className="settings-grid" style={{ gridTemplateColumns: "120px 1fr 1fr", gap: 16 }}>
            <ProfileField label="郵便番号" value={user.postalCode}/>
            <ProfileField label="国・地域" value="🇯🇵 日本"/>
            <div></div>
          </div>
          <div className="form-row" style={{ marginTop: 8 }}>
            <label className="label">住所</label>
            <input className="input" defaultValue={user.address}/>
          </div>
          <div className="form-row">
            <label className="label">建物名・部屋番号 (任意)</label>
            <input className="input" placeholder=""/>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Identity verification ────────────────────────────────────────────
function MeIdentity({ user }) {
  const I = window.I;
  return (
    <div className="page me-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">本人確認</h1>
          <p className="page-subtitle">マイナンバーや身分証情報。組織への共有はプライバシー設定で個別に許可します。</p>
        </div>
      </header>

      <div className="settings-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">マイナンバー</h3>
            <span className="badge badge-info ml-auto"><span className="dot"/>登録済</span>
          </div>
          <div className="form-row">
            <label className="label">個人番号</label>
            <div className="row gap-2">
              <input className="input mono" defaultValue={user.myNumberLast4} readOnly style={{ flex: 1, letterSpacing: "0.1em" }}/>
              <button className="btn btn-ghost btn-sm">{I.eye(12)} 表示</button>
            </div>
            <div className="help">暗号化保管。アクセスログは <a style={{ color: "var(--primary)" }}>セキュリティ</a> で確認できます。</div>
          </div>
          <hr className="divider"/>
          <div className="muted" style={{ fontSize: 12, lineHeight: 1.6 }}>
            源泉徴収・年末調整のために必要な場合、組織へ共有する許可を求められます。共有履歴：<strong style={{ color: "var(--foreground)" }}>Famgia (2024年12月)</strong>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">身分証</h3>
            <span className="badge badge-warning ml-auto"><span className="dot"/>1件 期限近い</span>
          </div>
          <DocRow type="運転免許証" issuer="東京都公安委員会" expires="2028-03-14" status="valid"/>
          <hr className="divider"/>
          <DocRow type="パスポート" issuer="外務省" expires="2026-11-22" status="expiring"/>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }}>{I.plus(13)} 身分証をアップロード</button>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">本人確認レベル</h3></div>
          <VerifyStep done label="メール確認" detail="yuki.tanaka@gmail.com"/>
          <VerifyStep done label="電話番号 (SMS)" detail="+81 90-•••• -5678"/>
          <VerifyStep done label="マイナンバー登録"/>
          <VerifyStep label="身分証アップロード" detail="運転免許証で完了"/>
          <VerifyStep label="顔写真照合 (eKYC)" detail="未完了"/>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">緊急連絡先</h3></div>
          <div className="form-row">
            <label className="label">氏名</label>
            <input className="input" defaultValue="田中 太郎"/>
          </div>
          <div className="settings-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <ProfileField label="続柄" value="父"/>
            <ProfileField label="電話" value="+81 80-9999-0000"/>
          </div>
          <div className="help">災害・緊急時のみ所属組織から連絡される情報です。</div>
        </div>
      </div>
    </div>
  );
}

function DocRow({ type, issuer, expires, status }) {
  const I = window.I;
  return (
    <div className="row gap-3" style={{ padding: "10px 0", alignItems: "center" }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--surface-3)", display: "grid", placeItems: "center" }}>{I.doc(16)}</div>
      <div className="grow">
        <div style={{ fontWeight: 500, fontSize: 13 }}>{type}</div>
        <div className="muted" style={{ fontSize: 11 }}>{issuer} · 有効期限 {expires}</div>
      </div>
      {status === "valid"    && <span className="badge badge-success"><span className="dot"/>有効</span>}
      {status === "expiring" && <span className="badge badge-warning"><span className="dot"/>期限近い</span>}
      <button className="tb-icon-btn">{I.moreV(13)}</button>
    </div>
  );
}

function VerifyStep({ done, label, detail }) {
  const I = window.I;
  return (
    <div className="row gap-3" style={{ padding: "8px 0", alignItems: "center" }}>
      <div style={{ width: 22, height: 22, borderRadius: 99, background: done ? "var(--success)" : "var(--surface-3)", color: done ? "white" : "var(--muted-foreground)", display: "grid", placeItems: "center", flexShrink: 0 }}>
        {done ? I.check(12) : <span style={{ fontSize: 11, fontWeight: 600 }}>·</span>}
      </div>
      <div className="grow">
        <div style={{ fontSize: 13, fontWeight: done ? 500 : 400 }}>{label}</div>
        {detail && <div className="muted" style={{ fontSize: 11 }}>{detail}</div>}
      </div>
      {!done && <button className="btn btn-ghost btn-sm">設定</button>}
    </div>
  );
}

Object.assign(window, { MeDashboard, MeProfile, MeContact, MeIdentity, MiniOrgCard });
