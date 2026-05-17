/* global React, window */
/* eslint-disable react/prop-types */
const { useState: useStateI, useEffect: useEffectI } = React;

function InviteModal({ open, onClose, branches, teams, services }) {
  if (!open) return null;
  const I = window.I;
  const [step, setStep] = useStateI(1);
  const [emails, setEmails] = useStateI("");
  const [role, setRole] = useStateI("Member");
  const [pickedBranches, setPickedBranches] = useStateI([]);
  const [pickedTeams, setPickedTeams] = useStateI([]);
  const [pickedServices, setPickedServices] = useStateI(["task"]);
  const [message, setMessage] = useStateI("Famgia の組織に招待されました。");

  useEffectI(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  const emailList = emails.split(/[\s,;]+/).map(s => s.trim()).filter(Boolean);
  const validEmails = emailList.filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
  const canNext1 = validEmails.length > 0;

  const toggle = (arr, setArr, id) =>
    setArr(arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]);

  const subscribed = services.filter(s => s.status === "registered");

  return (
    <div className="modal-shade" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card invite-modal">
        <header className="modal-head">
          <div>
            <div className="muted" style={{ fontSize: "var(--text-2xs)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Step {step} of 3</div>
            <h2 style={{ margin: "2px 0 0", fontSize: "var(--text-lg)", fontWeight: 500 }}>
              {step === 1 && "Invite members"}
              {step === 2 && "Assign role & access"}
              {step === 3 && "Review & send"}
            </h2>
          </div>
          <button className="tb-icon-btn" onClick={onClose}>{I.x(16)}</button>
        </header>

        <div className="invite-steps">
          <Step n="1" label="Recipients" active={step>=1} done={step>1} />
          <Step n="2" label="Access"     active={step>=2} done={step>2} />
          <Step n="3" label="Review"     active={step>=3} done={false}  />
        </div>

        <div className="modal-body">
          {step === 1 && (
            <div className="col gap-4">
              <div className="form-row">
                <label className="label">Email addresses</label>
                <textarea
                  className="input"
                  rows={5}
                  placeholder="email@example.com&#10;Separate multiple addresses with commas or newlines"
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                />
                <div className="help">
                  {emailList.length === 0
                    ? "Up to 50 addresses at once"
                    : `${validEmails.length} valid · ${emailList.length - validEmails.length} invalid`}
                </div>
              </div>

              {validEmails.length > 0 && (
                <div className="invite-chips">
                  {validEmails.map(e => <span key={e} className="chip">{I.mail(12)} {e}</span>)}
                </div>
              )}

              <div className="form-row">
                <label className="label">Custom message (optional)</label>
                <textarea className="input" rows={3} value={message} onChange={e => setMessage(e.target.value)} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="col gap-4">
              <div className="form-row">
                <label className="label">Role</label>
                <div className="seg">
                  {["Admin","Manager","Member"].map(r => (
                    <button key={r} className={role===r?"on":""} onClick={() => setRole(r)}>{r}</button>
                  ))}
                </div>
                <div className="help">
                  {role==="Admin"   && "Can manage members, branches, services. Cannot delete org."}
                  {role==="Manager" && "Can manage own branch/team members and subscribe services."}
                  {role==="Member"  && "Can use assigned services only."}
                </div>
              </div>

              <div className="form-row">
                <label className="label">Branches <span className="muted">({pickedBranches.length} selected)</span></label>
                <div className="picker-grid">
                  {branches.map(b => (
                    <Picker key={b.id} active={pickedBranches.includes(b.id)} onClick={() => toggle(pickedBranches, setPickedBranches, b.id)}>
                      <span className="dot" style={{ width: 8, height: 8, background: "var(--muted-foreground)" }}/>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: "var(--text-sm)" }}>{b.name}</div>
                        <div className="muted mono" style={{ fontSize: "var(--text-2xs)" }}>{b.code} · {b.city}</div>
                      </div>
                    </Picker>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <label className="label">Teams <span className="muted">({pickedTeams.length} selected)</span></label>
                <div className="picker-grid">
                  {teams.map(t => (
                    <Picker key={t.id} active={pickedTeams.includes(t.id)} onClick={() => toggle(pickedTeams, setPickedTeams, t.id)}>
                      <span className="dot" style={{ width: 8, height: 8, background: t.color }}/>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: "var(--text-sm)" }}>{t.name}</div>
                        <div className="muted" style={{ fontSize: "var(--text-2xs)" }}>{t.desc}</div>
                      </div>
                    </Picker>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <label className="label">Services <span className="muted">({pickedServices.length} selected)</span></label>
                <div className="picker-grid">
                  {subscribed.map(s => (
                    <Picker key={s.id} active={pickedServices.includes(s.id)} onClick={() => toggle(pickedServices, setPickedServices, s.id)}>
                      <span className="prod-sticker xs" style={{ background: s.accent }}>{s.sticker}</span>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: "var(--text-sm)" }}>{s.name}</div>
                        <div className="muted" style={{ fontSize: "var(--text-2xs)" }}>{s.plan}</div>
                      </div>
                    </Picker>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="col gap-3">
              <ReviewRow label="Recipients">
                <div className="row gap-1" style={{ flexWrap: "wrap" }}>
                  {validEmails.map(e => <span key={e} className="chip">{e}</span>)}
                </div>
              </ReviewRow>
              <ReviewRow label="Role"><window.RoleBadge role={role} /></ReviewRow>
              <ReviewRow label="Branches">
                {pickedBranches.length === 0 ? <span className="muted">None</span> :
                  <div className="row gap-1" style={{ flexWrap: "wrap" }}>
                    {pickedBranches.map(id => <span key={id} className="chip">{branches.find(b=>b.id===id)?.code}</span>)}
                  </div>}
              </ReviewRow>
              <ReviewRow label="Teams">
                {pickedTeams.length === 0 ? <span className="muted">None</span> :
                  <div className="row gap-1" style={{ flexWrap: "wrap" }}>
                    {pickedTeams.map(id => {
                      const t = teams.find(x=>x.id===id);
                      return <span key={id} className="chip"><span className="dot" style={{ background: t.color }}/>{t.name}</span>;
                    })}
                  </div>}
              </ReviewRow>
              <ReviewRow label="Services">
                {pickedServices.length === 0 ? <span className="muted">None</span> :
                  <div className="row gap-1" style={{ flexWrap: "wrap" }}>
                    {pickedServices.map(id => {
                      const s = subscribed.find(x=>x.id===id);
                      return <span key={id} className="chip"><span className="prod-sticker xs" style={{ background: s?.accent }}>{s?.sticker}</span>{s?.name}</span>;
                    })}
                  </div>}
              </ReviewRow>
              <ReviewRow label="Message">
                <div className="msg-preview">{message}</div>
              </ReviewRow>
              <div className="invite-summary">
                {I.send(14)} <strong>{validEmails.length}</strong> invitation{validEmails.length !== 1 && "s"} will be sent now.
                Each recipient will be added as a <strong>{role}</strong>.
              </div>
            </div>
          )}
        </div>

        <footer className="modal-foot">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
          <div className="ml-auto row gap-2">
            {step > 1 && <button className="btn btn-secondary btn-sm" onClick={() => setStep(step-1)}>{I.chevronLeft(14)} Back</button>}
            {step < 3 && <button className="btn btn-primary btn-sm" disabled={step===1 && !canNext1} onClick={() => setStep(step+1)}>Next {I.chevronRight(14)}</button>}
            {step === 3 && <button className="btn btn-primary btn-sm" onClick={() => { onClose(); }}>{I.send(14)} Send invitations</button>}
          </div>
        </footer>
      </div>
    </div>
  );
}

function Step({ n, label, active, done }) {
  return (
    <div className={`invite-step ${active ? "active" : ""} ${done ? "done" : ""}`}>
      <div className="invite-step-bub">{done ? window.I.check(12) : n}</div>
      <span>{label}</span>
    </div>
  );
}

function Picker({ active, onClick, children }) {
  return (
    <button type="button" className={`picker ${active ? "on" : ""}`} onClick={onClick}>
      <div className="picker-check">{active && window.I.check(12)}</div>
      <div className="picker-body">{children}</div>
    </button>
  );
}

function ReviewRow({ label, children }) {
  return (
    <div className="review-row">
      <div className="review-label">{label}</div>
      <div className="review-val">{children}</div>
    </div>
  );
}

window.InviteModal = InviteModal;
