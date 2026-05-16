/* global window */
/* Add me-specific icons to the shared I namespace. */
(function () {
  const I = window.I;
  if (!I) return;

  const mk = (children) => (s) => (
    <svg width={s||16} height={s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );

  const add = {
    shieldCheck: mk(<>
      <path d="M12 3l8 4v6c0 4-3 7-8 8-5-1-8-4-8-8V7l8-4z"/>
      <path d="M9 12l2 2 4-4"/>
    </>),
    briefcase: mk(<>
      <rect x="3" y="7" width="18" height="13" rx="2"/>
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      <path d="M3 13h18"/>
    </>),
    wallet: mk(<>
      <path d="M3 7a2 2 0 0 1 2-2h13v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>
      <path d="M18 12h3v4h-3a2 2 0 0 1 0-4z"/>
    </>),
    handshake: mk(<>
      <path d="M11 17l-2 2a2 2 0 0 1-2.8-2.8L9 13"/>
      <path d="M14 14l-3.5 3.5a2 2 0 1 1-2.8-2.8L11 11.5"/>
      <path d="M13 6l-2 2 5 5 3-3-3-3-3 3"/>
      <path d="M3 13l3-3 3 3"/>
    </>),
    history: mk(<>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8"/>
      <path d="M3 3v5h5"/>
      <path d="M12 7v5l3 2"/>
    </>),
    logout: mk(<>
      <path d="M15 12H4"/>
      <path d="M8 8l-4 4 4 4"/>
      <path d="M9 4h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-9"/>
    </>),
    smartphone: mk(<>
      <rect x="6" y="3" width="12" height="18" rx="2"/>
      <path d="M11 18h2"/>
    </>),
    laptop: mk(<>
      <rect x="4" y="5" width="16" height="11" rx="1.5"/>
      <path d="M2 19h20"/>
    </>),
    desktop: mk(<>
      <rect x="3" y="4" width="18" height="13" rx="2"/>
      <path d="M8 21h8M12 17v4"/>
    </>),
    moon: mk(<>
      <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>
    </>),
    sun: mk(<>
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4"/>
    </>),
    lock: mk(<>
      <rect x="4" y="11" width="16" height="10" rx="2"/>
      <path d="M8 11V8a4 4 0 0 1 8 0v3"/>
    </>),
    unlock: mk(<>
      <rect x="4" y="11" width="16" height="10" rx="2"/>
      <path d="M8 11V8a4 4 0 0 1 7.5-2"/>
    </>),
    fingerprint: mk(<>
      <path d="M12 4a8 8 0 0 0-8 8v3"/>
      <path d="M20 15v-3a8 8 0 0 0-3-6.2"/>
      <path d="M8 12a4 4 0 0 1 8 0v3a4 4 0 0 0 1 2.5"/>
      <path d="M12 12v3a4 4 0 0 1-3 4"/>
    </>),
    bell: mk(<>
      <path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/>
      <path d="M10 19a2 2 0 0 0 4 0"/>
    </>),
    bellOff: mk(<>
      <path d="M8 17H4s2-1 2-6c0-1 0-2 .3-3M9 4a6 6 0 0 1 9 4c0 5 2 6 2 6h-6"/>
      <path d="M10 19a2 2 0 0 0 4 0"/>
      <path d="M3 3l18 18"/>
    </>),
    mail: mk(<>
      <rect x="3" y="5" width="18" height="14" rx="2"/>
      <path d="M3 7l9 6 9-6"/>
    </>),
    star: mk(<>
      <path d="M12 3l2.8 6 6.2.9-4.5 4.3 1 6.4L12 17.6 6.5 20.6l1-6.4L3 9.9l6.2-.9z"/>
    </>),
    plug: mk(<>
      <path d="M9 2v6M15 2v6"/>
      <path d="M7 8h10v3a5 5 0 0 1-10 0V8z"/>
      <path d="M12 16v5"/>
    </>),
    unplug: mk(<>
      <path d="M19 5l-7 7"/>
      <path d="M3 21l7-7"/>
      <path d="M9 11l4 4"/>
      <path d="M7 13l-2 2 4 4 2-2"/>
      <path d="M17 9l2-2-4-4-2 2"/>
    </>),
    archive: mk(<>
      <rect x="3" y="4" width="18" height="4" rx="1"/>
      <path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8"/>
      <path d="M10 12h4"/>
    </>),
    yen: mk(<>
      <path d="M7 4l5 8 5-8"/>
      <path d="M12 12v8"/>
      <path d="M7 14h10"/>
      <path d="M7 18h10"/>
    </>),
    check2: mk(<>
      <path d="M5 12l5 5L20 7"/>
    </>),
    pieChart: mk(<>
      <path d="M12 3v9l8 4.5"/>
      <path d="M21 12a9 9 0 1 1-9-9"/>
    </>),
    globe: mk(<>
      <circle cx="12" cy="12" r="9"/>
      <path d="M3 12h18"/>
      <path d="M12 3a14 14 0 0 1 0 18"/>
      <path d="M12 3a14 14 0 0 0 0 18"/>
    </>),
    sparkles: mk(<>
      <path d="M12 3l1.8 4.7L18 9.5l-4.2 1.8L12 16l-1.8-4.7L6 9.5l4.2-1.8z"/>
      <path d="M19 17l.7 1.5L21 19l-1.3.5L19 21l-.7-1.5L17 19l1.3-.5z"/>
    </>),
    helpCircle: mk(<>
      <circle cx="12" cy="12" r="9"/>
      <path d="M9.5 9a2.5 2.5 0 1 1 4 2c-.7.7-1.5 1.2-1.5 2"/>
      <circle cx="12" cy="17" r="0.5" fill="currentColor"/>
    </>),
    edit3: mk(<>
      <path d="M12 20h9"/>
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>
    </>),
    camera: mk(<>
      <rect x="3" y="6" width="18" height="14" rx="2"/>
      <path d="M9 6l2-3h2l2 3"/>
      <circle cx="12" cy="13" r="3.5"/>
    </>),
  };
  Object.assign(I, add);
})();
