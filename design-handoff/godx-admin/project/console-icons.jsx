/* global window */
/* Add console-specific icons to the shared I namespace. */
(function () {
  const I = window.I;
  if (!I) return;
  const Icon = window.Icon;

  const mk = (children) => (s) => (
    <svg width={s||16} height={s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );

  const add = {
    layoutGrid: mk(<>
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </>),
    building: mk(<>
      <rect x="4" y="3" width="16" height="18" rx="1.5"/>
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/>
      <path d="M10 21v-3h4v3"/>
    </>),
    branchSign: mk(<>
      <path d="M12 3v6"/>
      <path d="M5 9h14l-2 3 2 3H5l2-3-2-3z"/>
      <path d="M12 15v6"/>
    </>),
    tag: mk(<>
      <path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9z"/>
      <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor"/>
    </>),
    cube: mk(<>
      <path d="M12 3l9 5v8l-9 5-9-5V8z"/>
      <path d="M3 8l9 5 9-5"/>
      <path d="M12 13v10"/>
    </>),
    card: mk(<>
      <rect x="3" y="5" width="18" height="14" rx="2"/>
      <path d="M3 10h18"/>
      <path d="M7 15h3"/>
    </>),
    receipt: mk(<>
      <path d="M5 3h14v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5z"/>
      <path d="M8 8h8M8 12h8M8 16h5"/>
    </>),
    user: mk(<>
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>
    </>),
    monitor: mk(<>
      <rect x="3" y="4" width="18" height="13" rx="2"/>
      <path d="M8 21h8M12 17v4"/>
    </>),
    translate: mk(<>
      <path d="M3 5h10M7 4v2c0 4-2 7-4 8"/>
      <path d="M5 9c0 3 3 6 7 7"/>
      <path d="M13 21l4-10 4 10M14.5 17h5"/>
    </>),
    arrowRight: mk(<><path d="M5 12h14M13 5l7 7-7 7"/></>),
    arrowUpRight: mk(<><path d="M7 17L17 7M9 7h8v8"/></>),
    pinHere: mk(<>
      <path d="M12 2l3 6 6 .9-4.5 4.2 1 6.4L12 16.7 6.5 19.5l1-6.4L3 8.9l6-.9z"/>
    </>),
    mapPin: mk(<>
      <path d="M12 22s-7-6.3-7-12a7 7 0 0 1 14 0c0 5.7-7 12-7 12z"/>
      <circle cx="12" cy="10" r="2.5"/>
    </>),
    eye: mk(<>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>
      <circle cx="12" cy="12" r="3"/>
    </>),
    key: mk(<>
      <circle cx="8" cy="15" r="4"/>
      <path d="M10.8 12.2L21 2l-3 3 2 2-3 3 2 2-3 3"/>
    </>),
    clock: mk(<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>),
    calendar: mk(<>
      <rect x="3" y="5" width="18" height="16" rx="2"/>
      <path d="M3 10h18M8 3v4M16 3v4"/>
    </>),
    info: mk(<><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v1"/></>),
    send: mk(<><path d="M3 11l18-8-8 18-2-8z"/></>),
    chevronUpDown: mk(<>
      <path d="M8 9l4-4 4 4"/><path d="M8 15l4 4 4-4"/>
    </>),
    arrowLeftRight: mk(<>
      <path d="M3 8h14l-3-3M21 16H7l3 3"/>
    </>),
    moreV: mk(<>
      <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
      <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
      <circle cx="12" cy="19" r="1.5" fill="currentColor"/>
    </>),
    sliders: mk(<>
      <path d="M4 6h8M16 6h4M4 12h2M10 12h10M4 18h12M18 18h2"/>
      <circle cx="14" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="18" r="2"/>
    </>),
  };
  Object.assign(I, add);
})();
