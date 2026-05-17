/* global React, window */
/* eslint-disable react/prop-types */
const { useState: useStateC, useMemo: useMemoC } = React;

// ── Connected services across all orgs ─────────────────────────────────
function MeServices({ memberships, services }) {
  const I = window.I;
  // Collapse: per service, which orgs grant it (and whether read-only/history).
  const rows = useMemoC(() => {
    const map = new Map();
    memberships.forEach(m => {
      m.services.forEach(sid => {
        if (!map.has(sid)) map.set(sid, { sid, current: [], history: [] });
        map.get(sid).current.push(m);
      });
      m.historicalServices.forEach(sid => {
        if (!m.services.includes(sid)) {
          if (!map.has(sid)) map.set(sid, { sid, current: [], history: [] });
          map.get(sid).history.push(m);
        }
      });
    });
    return Array.from(map.values());
  }, [memberships]);

  return (
    <div className="page me-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">連携サービス</h1>
          <p className="page-subtitle">所属組織を通じて利用できるすべてのサービス。退職した組織からも、給与等の履歴は読み取り専用で残ります。</p>
        </div>
      </header>

      <div className="ds-cards">
        {rows.map(r => {
          const s = services[r.sid];
          if (!s) return null;
          return (
            <article key={r.sid} className="prod-card">
              <div className="prod-sticker" style={{ background: s.accent }}>{s.sticker}</div>
              <div className="prod-body">
                <div className="prod-title">{s.name}</div>
                <div className="prod-desc">
                  {r.current.length > 0 && <>現在利用中 — {r.current.map(m => m.orgName).join(" · ")}</>}
                  {r.current.length === 0 && r.history.length > 0 && <span className="muted">履歴データのみ参照可</span>}
                </div>
                <div className="me-org-services" style={{ marginTop: 6 }}>
                  {r.current.map(m => (
                    <span key={m.id} className="chip">
                      <span style={{ width: 8, height: 8, borderRadius: 99, background: m.orgColor, display: "inline-block" }}/>
                      {m.orgName}
                    </span>
                  ))}
                  {r.history.map(m => (
                    <span key={m.id} className="chip" style={{ opacity: 0.7 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 99, background: m.orgColor, display: "inline-block" }}/>
                      {m.orgName}
                      <span className="muted" style={{ fontSize: 10, marginLeft: 4 }}>(退職・履歴のみ)</span>
                    </span>
                  ))}
                </div>
              </div>
              <div className="prod-meta">
                {r.current.length > 0 ? (
                  <>
                    <span className="badge badge-success"><span className="dot"/>{r.current.length} 組織で有効</span>
                    <button className="btn btn-primary btn-sm">Open {I.external(13)}</button>
                  </>
                ) : (
                  <>
                    <span className="badge badge-neutral"><span className="dot"/>履歴のみ</span>
                    <button className="btn btn-secondary btn-sm">{I.eye(13)} 履歴を見る</button>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

// ── External accounts (Google/Apple/LINE links) ────────────────────────
function MeExternals({ links }) {
  const I = window.I;
  return (
    <div className="page me-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">外部アカウント</h1>
          <p className="page-subtitle">サインインに使用できる外部 ID プロバイダ。プライマリは削除できません。</p>
        </div>
      </header>

      <div className="ds-cards">
        {links.map(l => (
          <div key={l.id} className="link-card">
            <div className={`link-logo ${l.id}`}>{l.id === "google" ? "G" : l.id === "apple" ? "" : "L"}</div>
            <div className="grow">
              <div style={{ fontSize: 14, fontWeight: 500 }}>{l.provider}</div>
              {l.status === "linked"
                ? <div className="muted mono" style={{ fontSize: 11 }}>{l.email} · 連携日 {l.linkedAt}</div>
                : <div className="muted" style={{ fontSize: 12 }}>未連携</div>}
            </div>
            {l.status === "linked" && l.role === "primary" && <span className="badge badge-info"><span className="dot"/>プライマリ</span>}
            {l.status === "linked" && l.role === "secondary" && <span className="badge badge-success"><span className="dot"/>連携中</span>}
            {l.status === "linked"
              ? <button className="btn btn-ghost btn-sm" disabled={l.role === "primary"} style={{ color: l.role === "primary" ? "var(--muted-foreground)" : "var(--destructive)" }}>{I.unplug(13)} 解除</button>
              : <button className="btn btn-secondary btn-sm">{I.plug(13)} 連携</button>}
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header"><h3 className="card-title">連携可能なサービス</h3></div>
        <div className="muted" style={{ fontSize: 12, marginBottom: 12 }}>
          以下のサービスに dxs アカウントを連携すると、当該サービス側で本人として認識されます。
        </div>
        <div className="me-org-services">
          <span className="chip">Slack</span>
          <span className="chip">Microsoft Entra ID</span>
          <span className="chip">GitHub</span>
          <span className="chip">Zoom</span>
          <span className="chip">Notion</span>
        </div>
      </div>
    </div>
  );
}

// ── Privacy matrix ─────────────────────────────────────────────────────
function MePrivacy({ memberships, privacyFields, privacyGrants }) {
  const I = window.I;
  const all = memberships;

  return (
    <div className="page me-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">プライバシー</h1>
          <p className="page-subtitle">どの組織があなたのどの情報を見られるか。チェックを外せばその組織からは即座に隠されます。</p>
        </div>
      </header>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="table privacy-table">
          <thead>
            <tr>
              <th>項目</th>
              {all.map(m => (
                <th key={m.id} style={{ textAlign: "center", minWidth: 110 }}>
                  <div className="col" style={{ alignItems: "center", gap: 4 }}>
                    <span className="me-org-mark" style={{ background: m.orgColor, width: 22, height: 22, fontSize: 11, borderRadius: 6 }}>{m.orgInitial}</span>
                    <span style={{ fontSize: 11, color: "var(--foreground)", fontWeight: 500 }}>{m.orgName}</span>
                    {m.status === "past" && <span className="muted" style={{ fontSize: 9 }}>退職済み</span>}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {privacyFields.map(f => (
              <tr key={f.key}>
                <td>
                  <div className="row gap-2" style={{ alignItems: "center" }}>
                    <strong>{f.label}</strong>
                    <span className="privacy-cat">{f.category}</span>
                    {f.required && <span className="privacy-required">必須</span>}
                  </div>
                </td>
                {all.map(m => {
                  const has = privacyGrants[m.orgId]?.includes(f.key);
                  return (
                    <td key={m.id} style={{ textAlign: "center" }}>
                      {has
                        ? <span className="privacy-cell-on" title="共有">{I.check2(13)}</span>
                        : <span className="privacy-cell-off">—</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="settings-grid" style={{ marginTop: 24, gridTemplateColumns: "1fr 1fr" }}>
        <div className="card">
          <div className="card-header"><h3 className="card-title">データのエクスポート</h3></div>
          <div className="muted" style={{ fontSize: 13, marginBottom: 12, lineHeight: 1.6 }}>
            あなたに関するすべてのデータ (プロフィール、給与履歴、勤怠記録、ログイン履歴) を JSON 形式でダウンロードできます。
          </div>
          <button className="btn btn-secondary btn-sm">{I.download(13)} エクスポートをリクエスト</button>
        </div>
        <div className="card danger">
          <div className="card-header"><h3 className="card-title" style={{ color: "var(--destructive)" }}>アカウント削除</h3></div>
          <div className="muted" style={{ fontSize: 13, marginBottom: 12, lineHeight: 1.6 }}>
            アカウントを削除すると、所属するすべての組織から自動的に退会します。法定保存期間中の給与等は組織側で匿名化された状態で保持されます。
          </div>
          <button className="btn btn-danger btn-sm">{I.trash(13)} アカウントを削除…</button>
        </div>
      </div>
    </div>
  );
}

// ── Security ──────────────────────────────────────────────────────────
function MeSecurity({ user, sessions }) {
  const I = window.I;
  return (
    <div className="page me-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">セキュリティ</h1>
          <p className="page-subtitle">サインイン方法、二段階認証、有効なセッションの管理。</p>
        </div>
      </header>

      <div className="settings-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">パスワード</h3>
            <span className="muted ml-auto" style={{ fontSize: 11 }}>最終変更 184日前</span>
          </div>
          <div className="muted" style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>
            6ヶ月以上経過しています。強力なパスワードへの変更を推奨します。
          </div>
          <button className="btn btn-secondary btn-sm">{I.key(13)} パスワードを変更</button>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">二段階認証</h3>
            <span className="badge badge-success ml-auto"><span className="dot"/>有効</span>
          </div>
          <SecMethod icon={I.smartphone(16)} label="認証アプリ (TOTP)"  detail="Google Authenticator" on/>
          <SecMethod icon={I.mail(16)}       label="SMS"               detail="+81 90-•••• -5678" on/>
          <SecMethod icon={I.fingerprint(16)} label="パスキー"          detail="MacBook Pro · iPhone" on/>
          <SecMethod icon={I.key(16)}        label="リカバリーコード"  detail="10/10 未使用"/>
        </div>

        <div className="card" style={{ gridColumn: "span 2" }}>
          <div className="card-header">
            <h3 className="card-title">アクティブなセッション</h3>
            <button className="btn btn-ghost btn-sm ml-auto" style={{ color: "var(--destructive)" }}>
              {I.logout(13)} 他のすべてのセッションをサインアウト
            </button>
          </div>
          <table className="table">
            <thead><tr>
              <th>デバイス</th>
              <th>場所・IP</th>
              <th>最終アクセス</th>
              <th>状態</th>
              <th></th>
            </tr></thead>
            <tbody>
              {sessions.map(s => {
                const icon = s.device.match(/Mac|Pro/) ? I.laptop(16) : s.device.match(/iPad|Pixel|Phone/) ? I.smartphone(16) : I.desktop(16);
                return (
                  <tr key={s.id} className="session-row" data-current={s.current || undefined}>
                    <td>
                      <div className="session-device">
                        <div className="session-icon">{icon}</div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{s.device}</div>
                          <div className="muted" style={{ fontSize: 11 }}>{s.os} · {s.browser}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>{s.location}</div>
                      <div className="muted mono" style={{ fontSize: 11 }}>{s.ip}</div>
                    </td>
                    <td className="mono" style={{ fontSize: 12 }}>{s.lastSeen}</td>
                    <td>
                      {s.current  && <span className="badge badge-success"><span className="dot pulse"/>現在のセッション</span>}
                      {!s.current && s.trusted && <span className="badge badge-info"><span className="dot"/>信頼済み</span>}
                      {!s.current && !s.trusted && <span className="badge badge-attention"><span className="dot"/>未知の端末</span>}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {!s.current && <button className="btn btn-ghost btn-sm" style={{ color: "var(--destructive)" }}>{I.x(13)} 切断</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SecMethod({ icon, label, detail, on }) {
  const I = window.I;
  return (
    <div className="row gap-3" style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--surface-3)", display: "grid", placeItems: "center", color: "var(--muted-foreground)" }}>{icon}</div>
      <div className="grow">
        <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
        <div className="muted" style={{ fontSize: 11 }}>{detail}</div>
      </div>
      {on
        ? <span className="badge badge-success"><span className="dot"/>有効</span>
        : <button className="btn btn-ghost btn-sm">設定</button>}
      <button className="tb-icon-btn">{I.moreV(13)}</button>
    </div>
  );
}

// ── Notifications ─────────────────────────────────────────────────────
function MeNotifications({ categories }) {
  const I = window.I;
  const [state, setState] = useStateC(categories);
  const toggle = (id, ch) => setState(s => s.map(c => c.id === id ? { ...c, [ch]: !c[ch] } : c));

  return (
    <div className="page me-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">通知</h1>
          <p className="page-subtitle">どのイベントを、どのチャンネルで受け取るかを設定します。</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm">{I.bellOff(13)} すべて停止 (DND)</button>
        </div>
      </header>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="table notif-table">
          <thead><tr>
            <th>カテゴリ</th>
            <th style={{ width: 100 }}>メール</th>
            <th style={{ width: 100 }}>プッシュ</th>
            <th style={{ width: 100 }}>アプリ内</th>
          </tr></thead>
          <tbody>
            {state.map(c => (
              <tr key={c.id}>
                <td>
                  <div style={{ fontWeight: 500 }}>{c.label}</div>
                  <div className="muted" style={{ fontSize: 11 }}>{c.desc}</div>
                </td>
                <td><button className="switch" data-on={c.email} onClick={() => toggle(c.id, "email")} aria-label={`${c.label} - メール`}/></td>
                <td><button className="switch" data-on={c.push}  onClick={() => toggle(c.id, "push")}  aria-label={`${c.label} - プッシュ`}/></td>
                <td><button className="switch" data-on={c.inApp} onClick={() => toggle(c.id, "inApp")} aria-label={`${c.label} - アプリ内`}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header"><h3 className="card-title">配信時間帯</h3></div>
        <div className="settings-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div className="form-row">
            <label className="label">静かな時間帯 開始</label>
            <input className="input mono" defaultValue="22:00" type="time"/>
          </div>
          <div className="form-row">
            <label className="label">静かな時間帯 終了</label>
            <input className="input mono" defaultValue="07:00" type="time"/>
          </div>
          <div className="form-row">
            <label className="label">タイムゾーン</label>
            <input className="input" defaultValue="Asia/Tokyo"/>
          </div>
        </div>
        <div className="help">この時間帯のプッシュ通知は配信されず、翌朝にまとめて届きます。</div>
      </div>
    </div>
  );
}

// ── Preferences ───────────────────────────────────────────────────────
function MePreferences({ user, theme, setTheme, density, setDensity, locale, setLocale }) {
  const I = window.I;

  return (
    <div className="page me-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">環境設定</h1>
          <p className="page-subtitle">表示・言語・アクセシビリティ。あなたのアカウントだけに適用されます。</p>
        </div>
      </header>

      <div className="settings-grid">
        <div className="card">
          <div className="card-header"><h3 className="card-title">言語と地域</h3></div>
          <div className="form-row">
            <label className="label">表示言語</label>
            <div className="seg" style={{ width: "fit-content" }}>
              <button className={locale==="ja"?"on":""} onClick={() => setLocale("ja")}>日本語</button>
              <button className={locale==="en"?"on":""} onClick={() => setLocale("en")}>English</button>
              <button className={locale==="vi"?"on":""} onClick={() => setLocale("vi")}>Tiếng Việt</button>
            </div>
          </div>
          <div className="form-row">
            <label className="label">タイムゾーン</label>
            <input className="input" defaultValue="Asia/Tokyo (UTC+9)"/>
          </div>
          <div className="form-row">
            <label className="label">日付形式</label>
            <div className="seg" style={{ width: "fit-content" }}>
              <button className="on">2026/05/16</button>
              <button>2026-05-16</button>
              <button>16 May 2026</button>
            </div>
          </div>
          <div className="form-row">
            <label className="label">通貨表示</label>
            <input className="input" defaultValue="¥ (JPY)"/>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">表示</h3></div>
          <div className="form-row">
            <label className="label">テーマ</label>
            <div className="seg" style={{ width: "fit-content" }}>
              <button className={theme==="light"?"on":""} onClick={() => setTheme("light")}>{I.sun(13)} ライト</button>
              <button className={theme==="dark"?"on":""}  onClick={() => setTheme("dark")}>{I.moon(13)} ダーク</button>
              <button>システム</button>
            </div>
          </div>
          <div className="form-row">
            <label className="label">表示密度</label>
            <div className="seg" style={{ width: "fit-content" }}>
              <button className={density==="compact"?"on":""}     onClick={() => setDensity("compact")}>密</button>
              <button className={density==="default"?"on":""}     onClick={() => setDensity("default")}>標準</button>
              <button className={density==="comfortable"?"on":""} onClick={() => setDensity("comfortable")}>広</button>
            </div>
          </div>
          <div className="form-row">
            <label className="label">サイドバー</label>
            <div className="row gap-2" style={{ alignItems: "center" }}>
              <button className="switch" data-on="true" aria-label="ピン留め"/>
              <span style={{ fontSize: 13 }}>常にピン留め (折りたたまない)</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">アクセシビリティ</h3></div>
          <SettingRow label="モーションを減らす"      desc="アニメーションを最小限に"/>
          <SettingRow label="高コントラスト" />
          <SettingRow label="フォーカスリングを強調"/>
          <SettingRow label="文字サイズを大きく"      desc="標準 14px → 16px"/>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">スタートページ</h3></div>
          <div className="muted" style={{ fontSize: 12, marginBottom: 12 }}>サインイン直後に表示する画面</div>
          <div className="picker-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <PageOption label="マイページ" hint="ダッシュボード"   on/>
            <PageOption label="所属組織"   hint="組織一覧"/>
            <PageOption label="給与明細"   hint="最新を表示"/>
            <PageOption label="勤怠管理"   hint="最初の組織へ転送"/>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ label, desc }) {
  const [on, setOn] = useStateC(false);
  return (
    <div className="row gap-3" style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
      <div className="grow">
        <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
        {desc && <div className="muted" style={{ fontSize: 11 }}>{desc}</div>}
      </div>
      <button className="switch" data-on={on} onClick={() => setOn(!on)} aria-label={label}/>
    </div>
  );
}

function PageOption({ label, hint, on }) {
  const I = window.I;
  return (
    <button className={`picker ${on ? "on" : ""}`}>
      <div className="picker-check">{on && I.check(12)}</div>
      <div className="picker-body">
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
          <div className="muted" style={{ fontSize: 11 }}>{hint}</div>
        </div>
      </div>
    </button>
  );
}

Object.assign(window, { MeServices, MeExternals, MePrivacy, MeSecurity, MeNotifications, MePreferences });
