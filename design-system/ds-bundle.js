/* @ds-bundle: {"format":4,"namespace":"AnkleProgramDesignSystem_c80d8b","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Chip","sourcePath":"components/core/Chip.jsx"},{"name":"Fab","sourcePath":"components/core/Fab.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"ICON_NAMES","sourcePath":"components/core/Icon.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Avatar","sourcePath":"components/data/Avatar.jsx"},{"name":"ProgressBar","sourcePath":"components/data/ProgressBar.jsx"},{"name":"SessionCard","sourcePath":"components/data/SessionCard.jsx"},{"name":"StatCard","sourcePath":"components/data/StatCard.jsx"},{"name":"TimeRangePill","sourcePath":"components/data/TimeRangePill.jsx"},{"name":"TimelineSlot","sourcePath":"components/data/TimelineSlot.jsx"},{"name":"SearchField","sourcePath":"components/forms/SearchField.jsx"},{"name":"SegmentedControl","sourcePath":"components/forms/SegmentedControl.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"TextField","sourcePath":"components/forms/TextField.jsx"},{"name":"DateStrip","sourcePath":"components/navigation/DateStrip.jsx"},{"name":"SectionHeader","sourcePath":"components/navigation/SectionHeader.jsx"},{"name":"TabBar","sourcePath":"components/navigation/TabBar.jsx"},{"name":"TopBar","sourcePath":"components/navigation/TopBar.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"5428a6400d79","components/core/Button.jsx":"d8ca311ca235","components/core/Card.jsx":"99e2ce9278b5","components/core/Chip.jsx":"1bcec575b70b","components/core/Fab.jsx":"d455f5857a10","components/core/Icon.jsx":"520420680d30","components/core/IconButton.jsx":"345dfea5afa9","components/data/Avatar.jsx":"23917a0b2f7f","components/data/ProgressBar.jsx":"6a74684dae04","components/data/SessionCard.jsx":"dedf69627762","components/data/StatCard.jsx":"d56809a23629","components/data/TimeRangePill.jsx":"852ede230c41","components/data/TimelineSlot.jsx":"6750019c2c0b","components/forms/SearchField.jsx":"8c6c4fb32c18","components/forms/SegmentedControl.jsx":"805ea14cff24","components/forms/Switch.jsx":"ed9f73923018","components/forms/TextField.jsx":"fcef9bb834a5","components/navigation/DateStrip.jsx":"68fce6979571","components/navigation/SectionHeader.jsx":"00777060336d","components/navigation/TabBar.jsx":"286381b1f678","components/navigation/TopBar.jsx":"738f2168c237","ui_kits/app/AppShell.jsx":"436d66f263e4","ui_kits/app/ProgramScreen.jsx":"22e341f41138","ui_kits/app/ProgressScreen.jsx":"cac759d1a836","ui_kits/app/SessionScreen.jsx":"95643190ac87","ui_kits/app/TodayScreen.jsx":"2d20cae783e4","ui_kits/site/HomePage.jsx":"2b11e10a8ce2","ui_kits/site/JoinPage.jsx":"1d8af577a7c0","ui_kits/site/ProgramPage.jsx":"6b09e7da2d91","ui_kits/site/SiteHeader.jsx":"258fe3fffeff"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.AnkleProgramDesignSystem_c80d8b = window.AnkleProgramDesignSystem_c80d8b || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
function Badge({
  tone = 'neutral',
  size = 'md',
  children,
  style: styleProp
}) {
  const skin = {
    neutral: {
      background: 'var(--surface-raised)',
      color: 'var(--text-body)',
      border: '1px solid var(--border-subtle)'
    },
    accent: {
      background: 'var(--brand-orange)',
      color: 'var(--text-on-accent)',
      border: '1px solid transparent'
    },
    accentQuiet: {
      background: 'var(--orange-a16)',
      color: 'var(--text-accent)',
      border: '1px solid transparent'
    },
    good: {
      background: 'var(--green-a16)',
      color: 'var(--green-500)',
      border: '1px solid transparent'
    },
    warn: {
      background: 'rgba(242,176,35,.16)',
      color: 'var(--amber-500)',
      border: '1px solid transparent'
    },
    bad: {
      background: 'var(--red-a16)',
      color: 'var(--red-500)',
      border: '1px solid transparent'
    },
    count: {
      background: 'var(--red-500)',
      color: 'var(--white)',
      border: '1px solid transparent'
    }
  }[tone];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      height: size === 'sm' ? 20 : 24,
      padding: size === 'sm' ? '0 7px' : '0 10px',
      fontFamily: tone === 'count' ? 'var(--font-mono)' : 'var(--font-ui)',
      fontSize: size === 'sm' ? 11 : 12,
      fontWeight: 'var(--weight-semibold)',
      fontVariantNumeric: 'tabular-nums',
      borderRadius: 'var(--radius-pill)',
      whiteSpace: 'nowrap',
      ...skin,
      ...styleProp
    }
  }, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
const PAD = {
  sm: '0 14px',
  md: '0 18px',
  lg: '0 24px'
};
const HEIGHT = {
  sm: 36,
  md: 44,
  lg: 52
};
const FONT = {
  sm: 13,
  md: 15,
  lg: 16
};
function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  iconLeft = null,
  iconRight = null,
  type = 'button',
  onClick,
  children,
  style: styleProp
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const skin = {
    primary: {
      background: hover ? 'var(--orange-400)' : 'var(--brand-orange)',
      color: 'var(--text-on-accent)',
      border: '1px solid transparent',
      boxShadow: press ? 'none' : 'var(--shadow-card)'
    },
    secondary: {
      background: hover ? 'var(--surface-raised)' : 'var(--surface-card)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-subtle)',
      boxShadow: 'var(--shadow-hairline)'
    },
    ghost: {
      background: hover ? 'rgba(255,255,255,.06)' : 'transparent',
      color: 'var(--text-body)',
      border: '1px solid transparent',
      boxShadow: 'none'
    },
    quiet: {
      background: hover ? 'var(--orange-a16)' : 'var(--orange-a08)',
      color: 'var(--text-accent)',
      border: '1px solid transparent',
      boxShadow: 'none'
    },
    danger: {
      background: hover ? '#EE5B60' : 'var(--red-500)',
      color: 'var(--white)',
      border: '1px solid transparent',
      boxShadow: 'var(--shadow-card)'
    }
  }[variant];
  return /*#__PURE__*/React.createElement("button", {
    type: type,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-3)',
      width: fullWidth ? '100%' : 'auto',
      height: HEIGHT[size],
      padding: PAD[size],
      fontFamily: 'var(--font-ui)',
      fontSize: FONT[size],
      fontWeight: 'var(--weight-semibold)',
      letterSpacing: '-0.005em',
      borderRadius: 'var(--radius-pill)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.38 : 1,
      transform: press && !disabled ? 'scale(var(--press-scale))' : 'scale(1)',
      transition: 'background var(--dur-fast) var(--ease-standard), transform var(--dur-instant) var(--ease-standard), opacity var(--dur-fast) linear',
      ...skin,
      ...styleProp
    }
  }, iconLeft, children, iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function Card({
  tone = 'default',
  padding = 'md',
  interactive = false,
  onClick,
  children,
  style: styleProp
}) {
  const [hover, setHover] = React.useState(false);
  const pad = {
    none: 0,
    tight: 'var(--card-pad-tight)',
    md: 'var(--card-pad)',
    lg: 'var(--space-6)'
  }[padding];
  const skin = {
    default: {
      background: 'var(--surface-card)',
      color: 'var(--text-body)',
      border: '1px solid var(--border-hairline)',
      boxShadow: 'var(--shadow-hairline)'
    },
    raised: {
      background: 'var(--surface-raised)',
      color: 'var(--text-body)',
      border: '1px solid var(--border-subtle)',
      boxShadow: 'var(--shadow-raised)'
    },
    accent: {
      background: 'var(--brand-orange)',
      color: 'var(--text-on-accent)',
      border: '1px solid transparent',
      boxShadow: 'var(--shadow-accent)'
    },
    outline: {
      background: 'transparent',
      color: 'var(--text-body)',
      border: '1px solid var(--border-subtle)',
      boxShadow: 'none'
    },
    dashed: {
      background: 'rgba(242,86,35,.05)',
      color: 'var(--text-muted)',
      border: '1px dashed var(--orange-a32)',
      boxShadow: 'none'
    }
  }[tone];
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      borderRadius: 'var(--radius-card)',
      padding: pad,
      overflow: 'hidden',
      cursor: interactive ? 'pointer' : 'default',
      transform: interactive && hover ? 'translateY(var(--hover-lift))' : 'none',
      transition: 'transform var(--dur-fast) var(--ease-standard), background var(--dur-fast) linear',
      ...skin,
      ...styleProp
    }
  }, children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Chip.jsx
try { (() => {
function Chip({
  selected = false,
  disabled = false,
  iconLeft = null,
  onClick,
  children,
  style: styleProp
}) {
  const [hover, setHover] = React.useState(false);
  const interactive = typeof onClick === 'function' && !disabled;
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      height: 34,
      padding: iconLeft ? '0 14px 0 11px' : '0 14px',
      fontFamily: 'var(--font-ui)',
      fontSize: 13,
      fontWeight: 'var(--weight-medium)',
      borderRadius: 'var(--radius-chip)',
      background: selected ? 'var(--white)' : hover && interactive ? 'var(--surface-raised)' : 'var(--surface-card)',
      color: selected ? 'var(--ink-850)' : 'var(--text-body)',
      border: selected ? '1px solid transparent' : '1px solid var(--border-subtle)',
      cursor: interactive ? 'pointer' : 'default',
      opacity: disabled ? 0.38 : 1,
      transition: 'background var(--dur-fast) var(--ease-standard), color var(--dur-fast) linear',
      ...styleProp
    }
  }, iconLeft, children);
}
Object.assign(__ds_scope, { Chip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Chip.jsx", error: String((e && e.message) || e) }); }

// components/core/Fab.jsx
try { (() => {
function Fab({
  label = 'Add',
  size = 56,
  offset = 20,
  position = 'absolute',
  onClick,
  children,
  style: styleProp
}) {
  const [press, setPress] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": label,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    style: {
      position,
      right: offset,
      bottom: offset,
      zIndex: 40,
      width: size,
      height: size,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'var(--radius-pill)',
      border: 'none',
      background: hover ? 'var(--orange-400)' : 'var(--brand-orange)',
      color: 'var(--text-on-accent)',
      boxShadow: 'var(--shadow-accent)',
      cursor: 'pointer',
      transform: press ? 'scale(var(--press-scale))' : 'scale(1)',
      transition: 'transform var(--dur-instant) var(--ease-standard), background var(--dur-fast) var(--ease-standard)',
      ...styleProp
    }
  }, children);
}
Object.assign(__ds_scope, { Fab });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Fab.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
/* Lucide 0.436.0 geometry, inlined so glyphs need no network and inherit currentColor.
   Lucide is a substitution — the supplied source material shipped no icon set.
   Mirrored as individual files in assets/icons/lucide/ for non-React consumers. */
const GLYPHS = {
  'house': '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />',
  'calendar-days': '<path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" />',
  'trending-up': '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />',
  'users': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />',
  'bell': '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />',
  'search': '<circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />',
  'plus': '<path d="M5 12h14" /><path d="M12 5v14" />',
  'check': '<path d="M20 6 9 17l-5-5" />',
  'play': '<polygon points="6 3 20 12 6 21 6 3" />',
  'pause': '<rect x="14" y="4" width="4" height="16" rx="1" /><rect x="6" y="4" width="4" height="16" rx="1" />',
  'arrow-up': '<path d="m5 12 7-7 7 7" /><path d="M12 19V5" />',
  'arrow-down': '<path d="M12 5v14" /><path d="m19 12-7 7-7-7" />',
  'arrow-left': '<path d="m12 19-7-7 7-7" /><path d="M19 12H5" />',
  'arrow-right': '<path d="M5 12h14" /><path d="m12 5 7 7-7 7" />',
  'chevron-right': '<path d="m9 18 6-6-6-6" />',
  'chevron-left': '<path d="m15 18-6-6 6-6" />',
  'chevron-up': '<path d="m18 15-6-6-6 6" />',
  'chevron-down': '<path d="m6 9 6 6 6-6" />',
  'ellipsis-vertical': '<circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />',
  'ellipsis': '<circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />',
  'menu': '<line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" />',
  'share': '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" x2="12" y1="2" y2="15" />',
  'timer': '<line x1="10" x2="14" y1="2" y2="2" /><line x1="12" x2="15" y1="14" y2="11" /><circle cx="12" cy="14" r="8" />',
  'clock': '<circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />',
  'activity': '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />',
  'footprints': '<path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z" /><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z" /><path d="M16 17h4" /><path d="M4 13h4" />',
  'dumbbell': '<path d="M14.4 14.4 9.6 9.6" /><path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z" /><path d="m21.5 21.5-1.4-1.4" /><path d="M3.9 3.9 2.5 2.5" /><path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z" />',
  'heart-pulse': '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />',
  'flame': '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />',
  'lock': '<rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />',
  'rotate-ccw': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />',
  'settings': '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" />',
  'user': '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />',
  'message-circle': '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />',
  'circle-check': '<circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />',
  'info': '<circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />',
  'triangle-alert': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" />',
  'x': '<path d="M18 6 6 18" /><path d="m6 6 12 12" />',
  'signal': '<path d="M2 20h.01" /><path d="M7 20v-4" /><path d="M12 20v-8" /><path d="M17 20V8" /><path d="M22 4v16" />',
  'wifi': '<path d="M12 20h.01" /><path d="M2 8.82a15 15 0 0 1 20 0" /><path d="M5 12.859a10 10 0 0 1 14 0" /><path d="M8.5 16.429a5 5 0 0 1 7 0" />',
  'battery-full': '<rect width="16" height="10" x="2" y="7" rx="2" ry="2" /><line x1="22" x2="22" y1="11" y2="13" /><line x1="6" x2="6" y1="11" y2="13" /><line x1="10" x2="10" y1="11" y2="13" /><line x1="14" x2="14" y1="11" y2="13" />'
};
const ALIASES = {
  'more-vertical': 'ellipsis-vertical',
  'more-horizontal': 'ellipsis',
  'home': 'house',
  'alert-triangle': 'triangle-alert',
  'check-circle': 'circle-check',
  'calendar': 'calendar-days'
};
function Icon({
  name,
  size = 20,
  strokeWidth = 2,
  style: styleProp
}) {
  const key = ALIASES[name] || name;
  const body = GLYPHS[key];
  if (!body) {
    if (typeof console !== 'undefined') console.warn('Icon: unknown glyph "' + name + '"');
    return null;
  }
  return /*#__PURE__*/React.createElement("svg", {
    "aria-hidden": "true",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      display: 'block',
      flex: '0 0 auto',
      ...styleProp
    },
    dangerouslySetInnerHTML: {
      __html: body
    }
  });
}
const ICON_NAMES = Object.keys(GLYPHS);
Object.assign(__ds_scope, { Icon, ICON_NAMES });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
const SIZE = {
  sm: 32,
  md: 40,
  lg: 48
};
function IconButton({
  variant = 'ghost',
  size = 'md',
  shape = 'circle',
  active = false,
  disabled = false,
  label,
  badge = null,
  onClick,
  children,
  style: styleProp
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const dim = SIZE[size];
  const skin = {
    ghost: {
      background: hover ? 'rgba(255,255,255,.07)' : 'transparent',
      color: 'var(--text-body)',
      border: '1px solid transparent'
    },
    surface: {
      background: hover ? 'var(--surface-raised)' : 'var(--surface-card)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-subtle)'
    },
    accent: {
      background: hover ? 'var(--orange-400)' : 'var(--brand-orange)',
      color: 'var(--text-on-accent)',
      border: '1px solid transparent'
    }
  }[active ? 'accent' : variant];
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": label,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    style: {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: dim,
      height: dim,
      padding: 0,
      borderRadius: shape === 'circle' ? 'var(--radius-pill)' : 'var(--radius-md)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.38 : 1,
      transform: press && !disabled ? 'scale(var(--press-scale))' : 'scale(1)',
      transition: 'background var(--dur-fast) var(--ease-standard), transform var(--dur-instant) var(--ease-standard)',
      ...skin,
      ...styleProp
    }
  }, children, badge != null && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: -2,
      right: -6,
      minWidth: 20,
      height: 18,
      padding: '0 5px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--red-500)',
      color: 'var(--white)',
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      fontWeight: 700,
      borderRadius: 'var(--radius-pill)',
      border: '2px solid var(--canvas)'
    }
  }, badge));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/data/Avatar.jsx
try { (() => {
function Avatar({
  name = '',
  src,
  size = 36,
  ring = false,
  style: styleProp
}) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto',
      width: size,
      height: size,
      borderRadius: 'var(--radius-pill)',
      overflow: 'hidden',
      background: 'var(--ink-700)',
      color: 'var(--text-body)',
      fontFamily: 'var(--font-display)',
      fontSize: Math.round(size * 0.38),
      fontWeight: 'var(--weight-bold)',
      border: ring ? '2px solid var(--brand-orange)' : '1px solid var(--border-hairline)',
      ...styleProp
    }
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : initials);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/data/ProgressBar.jsx
try { (() => {
function ProgressBar({
  value = 0,
  max = 100,
  label,
  valueLabel,
  height = 8,
  tone = 'accent',
  style: styleProp
}) {
  const pct = Math.max(0, Math.min(100, value / max * 100));
  const fill = tone === 'accent' ? 'var(--brand-orange)' : tone === 'good' ? 'var(--green-500)' : 'var(--ink-150)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
      ...styleProp
    }
  }, (label || valueLabel) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 'var(--space-4)'
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 'var(--weight-medium)',
      color: 'var(--text-body)'
    }
  }, label), valueLabel && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--text-muted)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, valueLabel)), /*#__PURE__*/React.createElement("div", {
    style: {
      height,
      borderRadius: 'var(--radius-pill)',
      background: 'var(--ink-700)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: pct + '%',
      height: '100%',
      borderRadius: 'var(--radius-pill)',
      background: fill,
      transition: 'width var(--dur-slow) var(--ease-standard)'
    }
  })));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/data/StatCard.jsx
try { (() => {
function StatCard({
  label,
  sublabel,
  value,
  tone = 'neutral',
  trend,
  trendDirection = 'up',
  style: styleProp
}) {
  const accent = tone === 'accent';
  const dirUp = trendDirection === 'up';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
      padding: 'var(--card-pad)',
      minHeight: 116,
      borderRadius: 'var(--radius-card)',
      background: accent ? 'var(--brand-orange)' : 'var(--surface-card)',
      border: '1px solid ' + (accent ? 'transparent' : 'var(--border-hairline)'),
      boxShadow: accent ? 'var(--shadow-accent)' : 'var(--shadow-hairline)',
      color: accent ? 'var(--text-on-accent)' : 'var(--text-primary)',
      ...styleProp
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-ui)',
      fontSize: 15,
      fontWeight: 'var(--weight-semibold)'
    }
  }, label), sublabel && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      marginTop: 2,
      color: accent ? 'rgba(23,23,23,.62)' : 'var(--text-faint)'
    }
  }, sublabel)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--metric-size)',
      lineHeight: 'var(--metric-line)',
      letterSpacing: 'var(--metric-track)',
      fontWeight: 'var(--weight-bold)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, value), trend != null && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 28,
      height: 28,
      borderRadius: 'var(--radius-pill)',
      background: accent ? 'rgba(255,255,255,.55)' : 'transparent',
      color: accent ? 'var(--ink-850)' : dirUp ? 'var(--green-500)' : 'var(--red-500)',
      fontSize: 15,
      fontWeight: 700
    }
  }, trend)));
}
Object.assign(__ds_scope, { StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/StatCard.jsx", error: String((e && e.message) || e) }); }

// components/data/TimeRangePill.jsx
try { (() => {
function Part({
  time,
  suffix,
  dark
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'baseline',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 'var(--weight-bold)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, time), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      fontWeight: 'var(--weight-bold)',
      textTransform: 'uppercase',
      opacity: dark ? 0.65 : 0.6
    }
  }, suffix));
}
function TimeRangePill({
  start,
  startSuffix = 'am',
  end,
  endSuffix = 'am',
  tone = 'accent',
  style: styleProp
}) {
  const accent = tone === 'accent';
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      height: 28,
      padding: '0 12px',
      borderRadius: 'var(--radius-pill)',
      background: accent ? 'var(--brand-orange)' : 'var(--surface-raised)',
      color: accent ? 'var(--text-on-accent)' : 'var(--text-body)',
      fontFamily: 'var(--font-ui)',
      ...styleProp
    }
  }, /*#__PURE__*/React.createElement(Part, {
    time: start,
    suffix: startSuffix,
    dark: accent
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: 0.55,
      fontSize: 11
    }
  }, "\u2192"), /*#__PURE__*/React.createElement(Part, {
    time: end,
    suffix: endSuffix,
    dark: accent
  }));
}
Object.assign(__ds_scope, { TimeRangePill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/TimeRangePill.jsx", error: String((e && e.message) || e) }); }

// components/data/SessionCard.jsx
try { (() => {
function SessionCard({
  start,
  startSuffix,
  end,
  endSuffix,
  reference,
  duration,
  blocks,
  person,
  personRole = 'Coach',
  personAvatar,
  detailsLabel = 'Details',
  onDetails,
  style: styleProp
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-card)',
      boxShadow: 'var(--shadow-hairline)',
      overflow: 'hidden',
      ...styleProp
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--space-4)',
      padding: 'var(--space-4) var(--space-4) var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.TimeRangePill, {
    start: start,
    startSuffix: startSuffix,
    end: end,
    endSuffix: endSuffix
  }), reference && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text-faint)',
      letterSpacing: '0.02em'
    }
  }, reference)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
      padding: '0 var(--space-4) var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 17,
      fontWeight: 'var(--weight-bold)',
      letterSpacing: '-0.015em',
      color: 'var(--text-primary)'
    }
  }, duration), blocks && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: 'var(--text-muted)'
    }
  }, blocks)), person && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
      padding: 'var(--space-3) var(--space-4)',
      borderTop: '1px solid var(--border-hairline)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
    name: person,
    src: personAvatar,
    size: 30
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--text-primary)'
    }
  }, person), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--text-faint)'
    }
  }, personRole)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onDetails,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      height: 32,
      padding: '0 12px',
      background: 'transparent',
      border: 'none',
      borderRadius: 'var(--radius-pill)',
      color: 'var(--text-body)',
      fontSize: 13,
      fontWeight: 'var(--weight-medium)',
      cursor: 'pointer'
    }
  }, detailsLabel, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 20,
      height: 20,
      borderRadius: 'var(--radius-pill)',
      border: '1px solid var(--border-subtle)',
      fontSize: 11,
      color: 'var(--text-muted)'
    }
  }, "\u203A"))));
}
Object.assign(__ds_scope, { SessionCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/SessionCard.jsx", error: String((e && e.message) || e) }); }

// components/data/TimelineSlot.jsx
try { (() => {
function TimelineSlot({
  time,
  variant = 'filled',
  label,
  children,
  onClick,
  style: styleProp
}) {
  const hatch = 'repeating-linear-gradient(115deg, var(--ink-800) 0 8px, var(--ink-750) 8px 16px)';
  const body = {
    filled: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-hairline)'
    },
    blocked: {
      background: hatch,
      border: '1px solid var(--border-hairline)'
    },
    empty: {
      background: 'rgba(242,86,35,.06)',
      border: '1px dashed var(--orange-a32)'
    }
  }[variant];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-4)',
      ...styleProp
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 46,
      flex: '0 0 46px',
      paddingTop: 6,
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      lineHeight: '14px',
      color: 'var(--text-faint)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, time), /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: {
      flex: 1,
      minWidth: 0,
      minHeight: 48,
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: children ? 'stretch' : 'center',
      padding: children ? 'var(--space-3)' : 0,
      cursor: onClick ? 'pointer' : 'default',
      ...body
    }
  }, children || /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 13,
      fontWeight: 'var(--weight-medium)',
      color: variant === 'empty' ? 'var(--text-accent)' : 'var(--text-muted)'
    }
  }, label)));
}
Object.assign(__ds_scope, { TimelineSlot });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/TimelineSlot.jsx", error: String((e && e.message) || e) }); }

// components/forms/SearchField.jsx
try { (() => {
function SearchField({
  value,
  placeholder = 'Search here',
  onChange,
  onSubmit,
  trailing = null,
  style: styleProp
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
      height: 52,
      padding: '0 var(--space-5)',
      background: 'var(--surface-card)',
      border: focus ? '1px solid var(--border-accent)' : '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-pill)',
      transition: 'border-color var(--dur-fast) var(--ease-standard)',
      ...styleProp
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: value,
    placeholder: placeholder,
    onChange: e => onChange && onChange(e.target.value),
    onKeyDown: e => {
      if (e.key === 'Enter' && onSubmit) onSubmit(value);
    },
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      minWidth: 0,
      background: 'transparent',
      border: 'none',
      outline: 'none',
      fontFamily: 'var(--font-ui)',
      fontSize: 16,
      color: 'var(--text-primary)'
    }
  }), trailing);
}
Object.assign(__ds_scope, { SearchField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SearchField.jsx", error: String((e && e.message) || e) }); }

// components/forms/SegmentedControl.jsx
try { (() => {
function SegmentedControl({
  options = [],
  value,
  onChange,
  fullWidth = false,
  style: styleProp
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      width: fullWidth ? '100%' : 'auto',
      padding: 3,
      gap: 2,
      background: 'var(--surface-sunken)',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-pill)',
      ...styleProp
    }
  }, options.map(opt => {
    const val = typeof opt === 'string' ? opt : opt.value;
    const lab = typeof opt === 'string' ? opt : opt.label;
    const on = val === value;
    return /*#__PURE__*/React.createElement("button", {
      key: val,
      type: "button",
      onClick: () => onChange && onChange(val),
      style: {
        flex: fullWidth ? 1 : '0 0 auto',
        height: 34,
        padding: '0 16px',
        border: 'none',
        borderRadius: 'var(--radius-pill)',
        cursor: 'pointer',
        background: on ? 'var(--surface-raised)' : 'transparent',
        color: on ? 'var(--text-primary)' : 'var(--text-muted)',
        fontFamily: 'var(--font-ui)',
        fontSize: 13,
        fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-medium)',
        boxShadow: on ? 'var(--shadow-card)' : 'none',
        transition: 'background var(--dur-fast) var(--ease-standard), color var(--dur-fast) linear'
      }
    }, lab);
  }));
}
Object.assign(__ds_scope, { SegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SegmentedControl.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function Switch({
  checked = false,
  disabled = false,
  label,
  onChange,
  style: styleProp
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      ...styleProp
    }
  }, /*#__PURE__*/React.createElement("span", {
    onClick: () => !disabled && onChange && onChange(!checked),
    style: {
      position: 'relative',
      width: 46,
      height: 28,
      flex: '0 0 auto',
      borderRadius: 'var(--radius-pill)',
      background: checked ? 'var(--brand-orange)' : 'var(--ink-700)',
      border: '1px solid ' + (checked ? 'transparent' : 'var(--border-strong)'),
      transition: 'background var(--dur-base) var(--ease-standard)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 3,
      left: checked ? 21 : 3,
      width: 20,
      height: 20,
      borderRadius: 'var(--radius-pill)',
      background: checked ? 'var(--ink-850)' : 'var(--ink-200)',
      transition: 'left var(--dur-base) var(--ease-spring), background var(--dur-base) linear'
    }
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      color: 'var(--text-body)'
    }
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/forms/TextField.jsx
try { (() => {
function TextField({
  label,
  value,
  placeholder,
  hint,
  error,
  type = 'text',
  disabled = false,
  onChange,
  style: styleProp
}) {
  const [focus, setFocus] = React.useState(false);
  const borderColor = error ? 'var(--red-500)' : focus ? 'var(--border-accent)' : 'var(--border-subtle)';
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
      opacity: disabled ? 0.45 : 1,
      ...styleProp
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-ui)',
      fontSize: 'var(--eyebrow-size)',
      letterSpacing: 'var(--eyebrow-track)',
      textTransform: 'uppercase',
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--text-muted)'
    }
  }, label), /*#__PURE__*/React.createElement("input", {
    type: type,
    value: value,
    placeholder: placeholder,
    disabled: disabled,
    onChange: e => onChange && onChange(e.target.value),
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      height: 48,
      padding: '0 var(--space-5)',
      background: 'var(--surface-card)',
      color: 'var(--text-primary)',
      border: '1px solid ' + borderColor,
      borderRadius: 'var(--radius-field)',
      outline: 'none',
      fontFamily: 'var(--font-ui)',
      fontSize: 15,
      transition: 'border-color var(--dur-fast) var(--ease-standard)'
    }
  }), (error || hint) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      lineHeight: '16px',
      color: error ? 'var(--red-500)' : 'var(--text-faint)'
    }
  }, error || hint));
}
Object.assign(__ds_scope, { TextField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/TextField.jsx", error: String((e && e.message) || e) }); }

// components/navigation/DateStrip.jsx
try { (() => {
function DateStrip({
  days = [],
  value,
  onChange,
  monthLabel,
  onPrev,
  onNext,
  style: styleProp
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)',
      ...styleProp
    }
  }, monthLabel && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onPrev,
    "aria-label": "Previous",
    style: {
      background: 'transparent',
      border: 'none',
      color: 'var(--text-muted)',
      cursor: 'pointer',
      fontSize: 18,
      lineHeight: 1,
      padding: 6
    }
  }, "\u2039"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 16,
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--text-primary)'
    }
  }, monthLabel), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onNext,
    "aria-label": "Next",
    style: {
      background: 'transparent',
      border: 'none',
      color: 'var(--text-muted)',
      cursor: 'pointer',
      fontSize: 18,
      lineHeight: 1,
      padding: 6
    }
  }, "\u203A")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-2)',
      overflowX: 'auto'
    }
  }, days.map(d => {
    const on = d.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: d.value,
      type: "button",
      onClick: () => onChange && onChange(d.value),
      style: {
        flex: '1 0 46px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        padding: '10px 0 12px',
        cursor: 'pointer',
        borderRadius: 'var(--radius-pill)',
        border: '1px solid ' + (on ? 'transparent' : 'var(--border-hairline)'),
        background: on ? 'var(--brand-orange)' : 'var(--surface-card)',
        color: on ? 'var(--text-on-accent)' : 'var(--text-body)',
        transition: 'background var(--dur-fast) var(--ease-standard), color var(--dur-fast) linear'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 'var(--weight-medium)',
        opacity: on ? 0.7 : 0.55
      }
    }, d.dow), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-display)',
        fontSize: 17,
        fontWeight: 'var(--weight-bold)',
        letterSpacing: '-0.02em'
      }
    }, d.day), d.dot && /*#__PURE__*/React.createElement("span", {
      style: {
        width: 4,
        height: 4,
        borderRadius: 999,
        background: on ? 'var(--text-on-accent)' : 'var(--brand-orange)'
      }
    }));
  })));
}
Object.assign(__ds_scope, { DateStrip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/DateStrip.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SectionHeader.jsx
try { (() => {
function SectionHeader({
  title,
  count,
  action = null,
  onAction,
  style: styleProp
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
      padding: '0 var(--space-1)',
      ...styleProp
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--head-2-size)',
      lineHeight: 'var(--head-2-line)',
      letterSpacing: 'var(--head-2-track)',
      fontWeight: 'var(--weight-bold)',
      color: 'var(--text-primary)'
    }
  }, title), count != null && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      height: 24,
      padding: '0 9px',
      background: 'var(--surface-raised)',
      color: 'var(--text-body)',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      fontVariantNumeric: 'tabular-nums',
      borderRadius: 'var(--radius-pill)'
    }
  }, count), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), action && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onAction,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 28,
      height: 28,
      borderRadius: 'var(--radius-pill)',
      background: 'transparent',
      border: '1px solid var(--border-subtle)',
      color: 'var(--text-muted)',
      cursor: 'pointer'
    }
  }, action));
}
Object.assign(__ds_scope, { SectionHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SectionHeader.jsx", error: String((e && e.message) || e) }); }

// components/navigation/TabBar.jsx
try { (() => {
function TabBar({
  items = [],
  value,
  onChange,
  style: styleProp
}) {
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(' + Math.max(items.length, 1) + ',1fr)',
      height: 'var(--tabbar-height)',
      padding: '0 var(--space-2)',
      background: 'var(--surface-sunken)',
      borderTop: '1px solid var(--border-hairline)',
      ...styleProp
    }
  }, items.map(item => {
    const on = item.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: item.value,
      type: "button",
      onClick: () => onChange && onChange(item.value),
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        color: on ? 'var(--brand-orange)' : 'var(--text-faint)',
        transition: 'color var(--dur-fast) linear'
      }
    }, item.icon, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-ui)',
        fontSize: 11,
        fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-medium)'
      }
    }, item.label));
  }));
}
Object.assign(__ds_scope, { TabBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/TabBar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/TopBar.jsx
try { (() => {
function TopBar({
  leading = null,
  title = null,
  trailing = null,
  borderless = true,
  style: styleProp
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--space-4)',
      height: 'var(--topbar-height)',
      padding: '0 var(--gutter-screen)',
      background: 'transparent',
      borderBottom: borderless ? 'none' : '1px solid var(--border-hairline)',
      ...styleProp
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      minWidth: 40
    }
  }, leading), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontFamily: 'var(--font-display)',
      fontSize: 16,
      fontWeight: 'var(--weight-bold)',
      letterSpacing: '-0.01em',
      color: 'var(--text-primary)'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      minWidth: 40,
      justifyContent: 'flex-end'
    }
  }, trailing));
}
Object.assign(__ds_scope, { TopBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/TopBar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/AppShell.jsx
try { (() => {
const {
  TabBar,
  Icon
} = window.AnkleProgramDesignSystem_c80d8b;
function AppShell() {
  const [tab, setTab] = React.useState('today');
  const [session, setSession] = React.useState(null);
  const screen = session ? /*#__PURE__*/React.createElement(SessionScreen, {
    session: session,
    onBack: () => setSession(null)
  }) : tab === 'today' ? /*#__PURE__*/React.createElement(TodayScreen, {
    onOpen: setSession,
    onSeeProgram: () => setTab('program')
  }) : tab === 'program' ? /*#__PURE__*/React.createElement(ProgramScreen, {
    onOpen: setSession
  }) : tab === 'progress' ? /*#__PURE__*/React.createElement(ProgressScreen, null) : /*#__PURE__*/React.createElement(CoachScreen, null);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--canvas)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "status"
  }, /*#__PURE__*/React.createElement("span", null, "9:41"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "signal",
    size: 15
  }), /*#__PURE__*/React.createElement(Icon, {
    name: "wifi",
    size: 15
  }), /*#__PURE__*/React.createElement(Icon, {
    name: "battery-full",
    size: 17
  }))), /*#__PURE__*/React.createElement("div", {
    className: "scroll"
  }, screen), !session && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0
    }
  }, /*#__PURE__*/React.createElement(TabBar, {
    value: tab,
    onChange: setTab,
    items: [{
      value: 'today',
      label: 'Today',
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "house",
        size: 22
      })
    }, {
      value: 'program',
      label: 'Program',
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "calendar-days",
        size: 22
      })
    }, {
      value: 'progress',
      label: 'Progress',
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "trending-up",
        size: 22
      })
    }, {
      value: 'coach',
      label: 'Coach',
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "users",
        size: 22
      })
    }]
  })));
}
function CoachScreen() {
  const {
    Card,
    Avatar,
    Button,
    SectionHeader,
    Icon
  } = window.AnkleProgramDesignSystem_c80d8b;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px var(--gutter-screen) 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    title: "Coach"
  }), /*#__PURE__*/React.createElement(Card, {
    padding: "md",
    style: {
      display: 'flex',
      gap: 14,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Sam Okafor",
    size: 52
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 600,
      color: 'var(--text-primary)'
    }
  }, "Sam Okafor"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--text-faint)'
    }
  }, "Sports physio \xB7 replies within a day")), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 18,
    style: {
      color: 'var(--text-faint)'
    }
  })), /*#__PURE__*/React.createElement(Card, {
    padding: "md",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ap-eyebrow"
  }, "Last note \xB7 3 days ago"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      lineHeight: '23px',
      color: 'var(--text-body)'
    }
  }, "Hop tests look good. Keep the eccentric calf work at 3 x 12 this week, then we add the lateral bounds."), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    fullWidth: true
  }, "Send an update")));
}
Object.assign(window, {
  AppShell,
  CoachScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/AppShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/ProgramScreen.jsx
try { (() => {
const PS = window.AnkleProgramDesignSystem_c80d8b;
function ProgramScreen({
  onOpen
}) {
  const {
    TopBar,
    IconButton,
    Icon,
    DateStrip,
    SectionHeader,
    TimelineSlot,
    TimeRangePill,
    Avatar,
    Fab
  } = PS;
  const [day, setDay] = React.useState('20');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 96
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    leading: /*#__PURE__*/React.createElement(IconButton, {
      label: "Menu"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "more-vertical"
    })),
    title: /*#__PURE__*/React.createElement(IconButton, {
      label: "Calendar",
      active: true,
      shape: "rounded"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "calendar-days"
    })),
    trailing: /*#__PURE__*/React.createElement(IconButton, {
      label: "Notifications",
      badge: "08"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "bell"
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px var(--gutter-screen) 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(DateStrip, {
    monthLabel: "October 2026",
    value: day,
    onChange: setDay,
    days: [{
      value: '18',
      dow: 'S',
      day: '18'
    }, {
      value: '19',
      dow: 'S',
      day: '19'
    }, {
      value: '20',
      dow: 'M',
      day: '20',
      dot: true
    }, {
      value: '21',
      dow: 'T',
      day: '21',
      dot: true
    }, {
      value: '22',
      dow: 'W',
      day: '22'
    }, {
      value: '23',
      dow: 'T',
      day: '23',
      dot: true
    }]
  }), /*#__PURE__*/React.createElement(SectionHeader, {
    title: "Day 20",
    count: "04"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(TimelineSlot, {
    time: /*#__PURE__*/React.createElement(React.Fragment, null, "9:00", /*#__PURE__*/React.createElement("br", null), "am"),
    variant: "blocked",
    label: "Warm-up \xB7 10min"
  }), /*#__PURE__*/React.createElement(TimelineSlot, {
    time: /*#__PURE__*/React.createElement(React.Fragment, null, "9:30", /*#__PURE__*/React.createElement("br", null), "am")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(TimeRangePill, {
    start: "9:30",
    end: "10:30"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--text-faint)',
      textAlign: 'right'
    }
  }, "Sam O.", /*#__PURE__*/React.createElement("br", null), "Coach"), /*#__PURE__*/React.createElement(Avatar, {
    name: "Sam Okafor",
    size: 26
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: 'var(--text-body)'
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--text-primary)'
    }
  }, "45min"), "\xA0 x04 exercises"), /*#__PURE__*/React.createElement("button", {
    onClick: () => onOpen({
      title: 'Loading · Session 12'
    }),
    style: {
      background: 'none',
      border: 'none',
      color: 'var(--text-muted)',
      fontSize: 13,
      cursor: 'pointer',
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, "Details ", /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 14
  }))))), /*#__PURE__*/React.createElement(TimelineSlot, {
    time: /*#__PURE__*/React.createElement(React.Fragment, null, "10:30", /*#__PURE__*/React.createElement("br", null), "am"),
    variant: "empty",
    label: "+ Add a block",
    onClick: () => {}
  }), /*#__PURE__*/React.createElement(TimelineSlot, {
    time: /*#__PURE__*/React.createElement(React.Fragment, null, "6:00", /*#__PURE__*/React.createElement("br", null), "pm")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(TimeRangePill, {
    start: "6:00",
    startSuffix: "pm",
    end: "6:30",
    endSuffix: "pm",
    tone: "neutral"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--text-muted)'
    }
  }, "30min \xB7 x02"))))), /*#__PURE__*/React.createElement(Fab, {
    label: "Add a session",
    style: {
      bottom: 20
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 24
  })));
}
Object.assign(window, {
  ProgramScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/ProgramScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/ProgressScreen.jsx
try { (() => {
const PRS = window.AnkleProgramDesignSystem_c80d8b;
function ProgressScreen() {
  const {
    TopBar,
    IconButton,
    Icon,
    SegmentedControl,
    SectionHeader,
    StatCard,
    Card,
    ProgressBar,
    Chip,
    Badge,
    Switch
  } = PRS;
  const [range, setRange] = React.useState('Week');
  const [filter, setFilter] = React.useState('All');
  const [remind, setRemind] = React.useState(true);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 40
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    leading: /*#__PURE__*/React.createElement(IconButton, {
      label: "Menu"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "more-vertical"
    })),
    title: "Progress",
    trailing: /*#__PURE__*/React.createElement(IconButton, {
      label: "Export"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "share"
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px var(--gutter-screen) 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(SegmentedControl, {
    fullWidth: true,
    options: ['Week', 'Month', 'Phase'],
    value: range,
    onChange: setRange
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    tone: "accent",
    label: "Adherence",
    sublabel: range,
    value: "86%",
    trend: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-up",
      size: 16
    })
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Pain, avg",
    sublabel: range,
    value: "2.1",
    trend: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-down",
      size: 16
    }),
    trendDirection: "down"
  })), /*#__PURE__*/React.createElement(Card, {
    padding: "md",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ap-eyebrow"
  }, "Hop test \xB7 left vs right"), /*#__PURE__*/React.createElement(Badge, {
    tone: "good"
  }, "On track")), /*#__PURE__*/React.createElement(ProgressBar, {
    label: "Left",
    value: 88,
    valueLabel: "88%"
  }), /*#__PURE__*/React.createElement(ProgressBar, {
    label: "Right",
    value: 100,
    valueLabel: "100%",
    tone: "neutral"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      lineHeight: '19px',
      color: 'var(--text-muted)'
    }
  }, "Within 10% of the uninvolved side is the gate for phase 3.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    title: "Sessions",
    count: "14"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      overflowX: 'auto',
      paddingBottom: 2
    }
  }, ['All', 'Mobility', 'Strength', 'Balance'].map(c => /*#__PURE__*/React.createElement(Chip, {
    key: c,
    selected: filter === c,
    onClick: () => setFilter(c)
  }, c))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, [['Mon 20 Oct', '45min', 'Strength', true], ['Sun 19 Oct', '30min', 'Balance', true], ['Sat 18 Oct', '—', 'Missed', false]].map(row => /*#__PURE__*/React.createElement(Card, {
    key: row[0],
    padding: "tight",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      minHeight: 'var(--row-min-height)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--text-primary)'
    }
  }, row[0]), /*#__PURE__*/React.createElement("div", {
    className: "ap-mono",
    style: {
      color: 'var(--text-faint)',
      marginTop: 2
    }
  }, row[1], " \xB7 ", row[2])), /*#__PURE__*/React.createElement(Badge, {
    tone: row[3] ? 'good' : 'bad',
    size: "sm"
  }, row[3] ? 'Done' : 'Missed'))))), /*#__PURE__*/React.createElement(Card, {
    padding: "md",
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 600,
      color: 'var(--text-primary)'
    }
  }, "Daily reminder"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--text-faint)',
      marginTop: 2
    }
  }, "9:00 am, every day")), /*#__PURE__*/React.createElement(Switch, {
    checked: remind,
    onChange: setRemind
  }))));
}
Object.assign(window, {
  ProgressScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/ProgressScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/SessionScreen.jsx
try { (() => {
const SS = window.AnkleProgramDesignSystem_c80d8b;
const EXERCISES = [{
  name: 'Eccentric calf raise',
  dose: '3 x 12 · 3s down',
  done: true
}, {
  name: 'Single-leg balance',
  dose: '3 x 40s hold',
  done: true
}, {
  name: 'Banded eversion',
  dose: '3 x 15 each side',
  done: false
}, {
  name: 'Lateral bound',
  dose: '4 x 6 · rest 60s',
  done: false
}];
function SessionScreen({
  session,
  onBack
}) {
  const {
    TopBar,
    IconButton,
    Icon,
    Button,
    Card,
    ProgressBar,
    Badge,
    TimeRangePill
  } = SS;
  const [step, setStep] = React.useState(2);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 32
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    leading: /*#__PURE__*/React.createElement(IconButton, {
      label: "Back",
      onClick: onBack
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-left"
    })),
    title: "Session 12",
    trailing: /*#__PURE__*/React.createElement(IconButton, {
      label: "More"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "more-vertical"
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px var(--gutter-screen) 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: 200,
      borderRadius: 'var(--radius-card)',
      overflow: 'hidden',
      background: 'linear-gradient(135deg,#332620,#5c4130)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--ink-400)',
      fontSize: 12,
      letterSpacing: '.08em',
      textTransform: 'uppercase'
    }
  }, "Exercise video placeholder"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--scrim-bottom)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: 14,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 22,
      fontWeight: 700,
      letterSpacing: '-0.018em',
      color: '#fff'
    }
  }, EXERCISES[step].name), /*#__PURE__*/React.createElement("div", {
    className: "ap-mono",
    style: {
      color: 'rgba(255,255,255,.72)',
      marginTop: 4
    }
  }, EXERCISES[step].dose)), /*#__PURE__*/React.createElement(IconButton, {
    label: "Play",
    variant: "accent",
    size: "lg"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "play",
    size: 22
  })))), /*#__PURE__*/React.createElement(Card, {
    padding: "md",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement(TimeRangePill, {
    start: "9:30",
    end: "10:30"
  }), /*#__PURE__*/React.createElement(Badge, {
    tone: "accentQuiet",
    size: "sm"
  }, "Phase 2")), /*#__PURE__*/React.createElement(ProgressBar, {
    label: "Session progress",
    value: step,
    max: EXERCISES.length,
    valueLabel: step + ' / ' + EXERCISES.length
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, EXERCISES.map((ex, i) => /*#__PURE__*/React.createElement(Card, {
    key: ex.name,
    tone: i === step ? 'raised' : 'default',
    padding: "tight",
    interactive: true,
    onClick: () => setStep(i),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      minHeight: 'var(--row-min-height)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 26,
      height: 26,
      flex: '0 0 auto',
      borderRadius: 999,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: i < step ? 'var(--brand-orange)' : 'transparent',
      border: i < step ? 'none' : '1px solid var(--border-strong)',
      color: i < step ? 'var(--text-on-accent)' : 'var(--text-faint)',
      fontFamily: 'var(--font-mono)',
      fontSize: 11
    }
  }, i < step ? /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 14
  }) : String(i + 1).padStart(2, '0')), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--text-primary)'
    }
  }, ex.name), /*#__PURE__*/React.createElement("div", {
    className: "ap-mono",
    style: {
      color: 'var(--text-faint)',
      marginTop: 2
    }
  }, ex.dose)), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 16,
    style: {
      color: 'var(--text-faint)'
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "lg",
    onClick: () => setStep(Math.max(0, step - 1))
  }, "Back"), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    fullWidth: true,
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 18
    }),
    onClick: () => setStep(Math.min(EXERCISES.length - 1, step + 1))
  }, "Mark set complete"))));
}
Object.assign(window, {
  SessionScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/SessionScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/TodayScreen.jsx
try { (() => {
const TS = window.AnkleProgramDesignSystem_c80d8b;
function TodayScreen({
  onOpen,
  onSeeProgram
}) {
  const {
    TopBar,
    IconButton,
    Icon,
    SearchField,
    StatCard,
    SectionHeader,
    SessionCard,
    Card,
    Fab,
    ProgressBar
  } = TS;
  const [q, setQ] = React.useState('');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 96
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    leading: /*#__PURE__*/React.createElement(IconButton, {
      label: "Menu"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "menu"
    })),
    title: /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        letterSpacing: '-0.02em'
      }
    }, "ANKLE", /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--brand-orange)'
      }
    }, "\xB7"), "PROGRAM"),
    trailing: /*#__PURE__*/React.createElement(IconButton, {
      label: "Notifications",
      badge: "08"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "bell"
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px var(--gutter-screen) 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(SearchField, {
    value: q,
    onChange: setQ,
    placeholder: "Search exercises",
    trailing: /*#__PURE__*/React.createElement(Icon, {
      name: "search",
      style: {
        color: 'var(--text-muted)'
      }
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    title: "Your week",
    action: /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 14
    }),
    onAction: onSeeProgram
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    tone: "accent",
    label: "Sessions done",
    sublabel: "This week",
    value: "28",
    trend: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-up",
      size: 16
    })
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Missed",
    sublabel: "Month",
    value: "12%",
    trend: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-down",
      size: 16
    }),
    trendDirection: "down"
  })), /*#__PURE__*/React.createElement(Card, {
    padding: "md"
  }, /*#__PURE__*/React.createElement(ProgressBar, {
    label: "Phase 2 \xB7 Loading",
    value: 3,
    max: 5,
    valueLabel: "3 / 5 weeks"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    title: "Today's sessions",
    count: "02",
    action: /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 14
    }),
    onAction: onSeeProgram
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(SessionCard, {
    start: "9:30",
    end: "10:30",
    reference: "REF 6790766C",
    duration: "45min",
    blocks: "x04 exercises",
    person: "Sam Okafor",
    personRole: "Coach",
    detailsLabel: "Details",
    onDetails: () => onOpen({
      title: 'Loading · Session 12'
    })
  }), /*#__PURE__*/React.createElement(SessionCard, {
    start: "6:00",
    startSuffix: "pm",
    end: "6:30",
    endSuffix: "pm",
    reference: "REF 6798373M",
    duration: "30min",
    blocks: "x02 exercises",
    person: "Solo",
    personRole: "Home",
    detailsLabel: "Details",
    onDetails: () => onOpen({
      title: 'Balance · Session 13'
    })
  })))), /*#__PURE__*/React.createElement(Fab, {
    label: "Log a session",
    offset: 20,
    style: {
      bottom: 20
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 24
  })));
}
Object.assign(window, {
  TodayScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/TodayScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/site/HomePage.jsx
try { (() => {
const HP = window.AnkleProgramDesignSystem_c80d8b;
function HomePage({
  onNavigate
}) {
  const {
    Button,
    Card,
    Icon,
    Badge,
    StatCard
  } = HP;
  return /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--brand-black)',
      color: 'var(--white)',
      padding: '96px 0 112px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap",
    style: {
      display: 'grid',
      gridTemplateColumns: '1.15fr .85fr',
      gap: 56,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ap-eyebrow",
    style: {
      color: 'var(--orange-400)'
    }
  }, "Four phases \xB7 twelve weeks"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 64,
      lineHeight: '60px',
      letterSpacing: '-0.03em',
      fontWeight: 800,
      color: 'var(--white)',
      margin: 0
    }
  }, "Rebuild the ankle", /*#__PURE__*/React.createElement("br", null), "you had before."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 17,
      lineHeight: '26px',
      color: 'var(--ink-200)',
      maxWidth: '52ch'
    }
  }, "A structured rehab program you run yourself: graded loading, balance work and return-to-sport testing, scheduled session by session."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    onClick: () => onNavigate('join')
  }, "Start week 1"), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    variant: "ghost",
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 18
    }),
    onClick: () => onNavigate('program'),
    style: {
      color: 'var(--white)'
    }
  }, "See the phases"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    tone: "accent",
    label: "Sessions done",
    sublabel: "Average member, week 6",
    value: "28",
    trend: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-up",
      size: 16
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    label: "Adherence",
    sublabel: "12 weeks",
    value: "86%"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Pain, avg",
    sublabel: "12 weeks",
    value: "2.1",
    trend: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-down",
      size: 16
    }),
    trendDirection: "down"
  }))))), /*#__PURE__*/React.createElement("section", {
    className: "wrap",
    style: {
      padding: '80px 32px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 24,
      marginBottom: 28
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 36,
      lineHeight: '38px',
      letterSpacing: '-0.024em',
      color: 'var(--text-primary)',
      margin: 0,
      maxWidth: '20ch'
    }
  }, "What a week looks like"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNavigate('program');
    },
    style: {
      fontSize: 14,
      fontWeight: 600
    }
  }, "Full breakdown \u2192")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 16
    }
  }, [['timer', 'Four sessions', '45min guided, 30min solo — scheduled, not suggested.'], ['activity', 'Graded load', 'Every set has a dose. Progression is a gate, not a guess.'], ['footprints', 'Return-to-sport tests', 'Hop and balance tests decide when the next phase opens.']].map(([icon, title, body]) => /*#__PURE__*/React.createElement(Card, {
    key: title,
    padding: "lg",
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      boxShadow: 'var(--shadow-card-light)',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      minHeight: 190
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 44,
      height: 44,
      borderRadius: 'var(--radius-pill)',
      background: 'var(--orange-a08)',
      color: 'var(--brand-orange)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 22
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 22,
      letterSpacing: '-0.018em',
      color: 'var(--text-primary)',
      margin: 0
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      lineHeight: '23px',
      color: 'var(--text-muted)'
    }
  }, body))))), /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--surface-card)',
      borderTop: '1px solid var(--border-subtle)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '72px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap",
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 56,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 320,
      borderRadius: 'var(--radius-card)',
      background: 'var(--ink-100)',
      border: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text-faint)',
      fontSize: 12,
      letterSpacing: '.08em',
      textTransform: 'uppercase'
    }
  }, "App screenshot placeholder"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "accentQuiet"
  }, "In the app"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 36,
      lineHeight: '38px',
      letterSpacing: '-0.024em',
      color: 'var(--text-primary)',
      margin: 0
    }
  }, "Your day, already planned"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 17,
      lineHeight: '26px',
      color: 'var(--text-muted)'
    }
  }, "Open the app and the session is there \u2014 warm-up, four exercises, the dose for each, and the test that ends the phase."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: () => onNavigate('join')
  }, "Start week 1"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: () => onNavigate('program')
  }, "How phases work"))))));
}
Object.assign(window, {
  HomePage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/site/HomePage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/site/JoinPage.jsx
try { (() => {
const JP = window.AnkleProgramDesignSystem_c80d8b;
function JoinPage() {
  const {
    Card,
    TextField,
    Button,
    SegmentedControl,
    Switch,
    Chip,
    Badge,
    Icon,
    ProgressBar
  } = JP;
  const [side, setSide] = React.useState('Left');
  const [stage, setStage] = React.useState('6+ weeks');
  const [emails, setEmails] = React.useState(true);
  const [sent, setSent] = React.useState(false);
  return /*#__PURE__*/React.createElement("main", {
    className: "wrap",
    style: {
      padding: '64px 32px 96px',
      display: 'grid',
      gridTemplateColumns: '1fr .85fr',
      gap: 56,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ap-eyebrow"
  }, "Get started"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 48,
      lineHeight: '46px',
      letterSpacing: '-0.028em',
      color: 'var(--text-primary)',
      margin: 0
    }
  }, "Tell us about the ankle."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 17,
      lineHeight: '26px',
      color: 'var(--text-muted)',
      maxWidth: '52ch'
    }
  }, "Three answers set your starting phase. You can change them later \u2014 the tests will correct us anyway."), /*#__PURE__*/React.createElement(Card, {
    padding: "lg",
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      boxShadow: 'var(--shadow-card-light)',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      maxWidth: 520
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ap-eyebrow"
  }, "Which side"), /*#__PURE__*/React.createElement(SegmentedControl, {
    options: ['Left', 'Right', 'Both'],
    value: side,
    onChange: setSide
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ap-eyebrow"
  }, "Time since injury"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, ['0–2 weeks', '2–6 weeks', '6+ weeks', 'Recurring'].map(s => /*#__PURE__*/React.createElement(Chip, {
    key: s,
    selected: stage === s,
    onClick: () => setStage(s)
  }, s)))), /*#__PURE__*/React.createElement(TextField, {
    label: "Email",
    value: "",
    placeholder: "you@example.com",
    hint: "Weekly plan, nothing else."
  }), /*#__PURE__*/React.createElement(Switch, {
    checked: emails,
    onChange: setEmails,
    label: "Remind me on session days"
  }), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    fullWidth: true,
    onClick: () => setSent(true),
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 18
    })
  }, sent ? 'Plan created' : 'Create my plan'))), /*#__PURE__*/React.createElement(Card, {
    padding: "lg",
    style: {
      background: 'var(--brand-black)',
      border: '1px solid transparent',
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ap-eyebrow",
    style: {
      color: 'var(--orange-400)'
    }
  }, "Your starting point"), /*#__PURE__*/React.createElement(Badge, {
    tone: "accent",
    size: "sm"
  }, sent ? 'Ready' : 'Draft')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 36,
      lineHeight: '38px',
      letterSpacing: '-0.024em',
      fontWeight: 700,
      color: 'var(--white)'
    }
  }, "Phase ", stage === '0–2 weeks' ? '1 · Calm' : stage === '2–6 weeks' ? '2 · Loading' : '3 · Power'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(ProgressBar, {
    label: "Weeks planned",
    value: 12,
    valueLabel: "12 weeks"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 14,
      color: 'var(--ink-200)'
    }
  }, /*#__PURE__*/React.createElement("span", null, side, " ankle"), /*#__PURE__*/React.createElement("span", {
    className: "ap-mono"
  }, "4 sessions / week"))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      lineHeight: '20px',
      color: 'var(--ink-300)'
    }
  }, "Not medical advice. If you cannot weight-bear, see a clinician before starting.")));
}
Object.assign(window, {
  JoinPage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/site/JoinPage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/site/ProgramPage.jsx
try { (() => {
const PP = window.AnkleProgramDesignSystem_c80d8b;
const PHASES = [{
  n: '01',
  name: 'Calm',
  weeks: 'Weeks 1–2',
  body: 'Swelling down, range back. Isometrics and daily ankle alphabet.',
  gate: 'Full weight-bearing, no limp'
}, {
  n: '02',
  name: 'Loading',
  weeks: 'Weeks 3–7',
  body: 'Eccentric calf work, banded eversion, single-leg balance under fatigue.',
  gate: 'Hop test within 10% of the other side'
}, {
  n: '03',
  name: 'Power',
  weeks: 'Weeks 8–10',
  body: 'Bounds, hops, direction changes. Load rises before speed does.',
  gate: 'Triple hop, both legs, no pain next morning'
}, {
  n: '04',
  name: 'Return',
  weeks: 'Weeks 11–12',
  body: 'Sport-specific drills and a graded return to training minutes.',
  gate: 'Full training, two weeks symptom-free'
}];
function ProgramPage({
  onNavigate
}) {
  const {
    Card,
    Badge,
    Button,
    ProgressBar,
    SegmentedControl,
    Icon
  } = PP;
  const [open, setOpen] = React.useState('02');
  const [view, setView] = React.useState('Phases');
  return /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--brand-black)',
      color: 'var(--white)',
      padding: '72px 0 64px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      maxWidth: 820
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ap-eyebrow",
    style: {
      color: 'var(--orange-400)'
    }
  }, "The program"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 48,
      lineHeight: '46px',
      letterSpacing: '-0.028em',
      fontWeight: 800,
      color: 'var(--white)',
      margin: 0
    }
  }, "Four phases, each with a gate you have to pass."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 17,
      lineHeight: '26px',
      color: 'var(--ink-200)',
      maxWidth: '58ch'
    }
  }, "Weeks are a guide. The gate is the rule \u2014 you move on when the test says so."))), /*#__PURE__*/React.createElement("section", {
    className: "wrap",
    style: {
      padding: '48px 32px 80px',
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement(SegmentedControl, {
    options: ['Phases', 'Week 6'],
    value: view,
    onChange: setView
  }), view === 'Phases' ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, PHASES.map(p => {
    const on = p.n === open;
    return /*#__PURE__*/React.createElement(Card, {
      key: p.n,
      padding: "lg",
      interactive: true,
      onClick: () => setOpen(p.n),
      style: {
        background: 'var(--surface-card)',
        border: '1px solid ' + (on ? 'var(--brand-orange)' : 'var(--border-subtle)'),
        boxShadow: on ? 'var(--shadow-card-light)' : 'none'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 20
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--brand-orange)'
      }
    }, p.n), /*#__PURE__*/React.createElement("h3", {
      style: {
        fontFamily: 'var(--font-display)',
        fontSize: 22,
        letterSpacing: '-0.018em',
        color: 'var(--text-primary)',
        margin: 0,
        minWidth: 120
      }
    }, p.name), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        color: 'var(--text-muted)'
      }
    }, p.weeks), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(Icon, {
      name: on ? 'chevron-up' : 'chevron-down',
      size: 18,
      style: {
        color: 'var(--text-faint)'
      }
    })), on && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 16,
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr',
        gap: 32,
        alignItems: 'start'
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 15,
        lineHeight: '23px',
        color: 'var(--text-body)'
      }
    }, p.body), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "ap-eyebrow"
    }, "Gate to the next phase"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      tone: "good"
    }, "Test"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        color: 'var(--text-primary)'
      }
    }, p.gate)))));
  })) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 12
    }
  }, [['Mon', 'Strength · 45min'], ['Wed', 'Balance · 30min'], ['Fri', 'Strength · 45min'], ['Sun', 'Test day · 20min']].map(([d, s]) => /*#__PURE__*/React.createElement(Card, {
    key: d,
    padding: "md",
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      minHeight: 120
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ap-eyebrow"
  }, d), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 18,
      letterSpacing: '-0.012em',
      color: 'var(--text-primary)'
    }
  }, s), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(ProgressBar, {
    value: d === 'Sun' ? 0 : 100,
    height: 6,
    tone: d === 'Sun' ? 'neutral' : 'accent'
  })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    onClick: () => onNavigate('join')
  }, "Start week 1"))));
}
Object.assign(window, {
  ProgramPage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/site/ProgramPage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/site/SiteHeader.jsx
try { (() => {
const SH = window.AnkleProgramDesignSystem_c80d8b;
function Wordmark({
  dark
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 19,
      fontWeight: 800,
      letterSpacing: '-0.02em',
      color: dark ? 'var(--white)' : 'var(--ink-850)'
    }
  }, "ANKLE", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--brand-orange)'
    }
  }, "\xB7"), "PROGRAM");
}
function SiteHeader({
  page,
  onNavigate
}) {
  const {
    Button
  } = SH;
  const links = [['home', 'Overview'], ['program', 'The program'], ['join', 'Get started']];
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 30,
      background: 'rgba(244,244,244,.86)',
      backdropFilter: 'var(--blur-glass)',
      WebkitBackdropFilter: 'var(--blur-glass)',
      borderBottom: '1px solid var(--border-hairline)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap",
    style: {
      height: 72,
      display: 'flex',
      alignItems: 'center',
      gap: 32
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNavigate('home');
    },
    style: {
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Wordmark, null)), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      gap: 4,
      marginLeft: 8
    }
  }, links.map(([id, label]) => /*#__PURE__*/React.createElement("a", {
    key: id,
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNavigate(id);
    },
    style: {
      padding: '8px 14px',
      borderRadius: 'var(--radius-pill)',
      fontSize: 14,
      fontWeight: 500,
      color: page === id ? 'var(--ink-850)' : 'var(--text-muted)',
      background: page === id ? 'var(--white)' : 'transparent'
    }
  }, label))), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      fontSize: 14,
      color: 'var(--text-muted)'
    }
  }, "Sign in"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    onClick: () => onNavigate('join')
  }, "Start week 1")));
}
function SiteFooter() {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: 'var(--brand-black)',
      color: 'var(--ink-200)',
      padding: '56px 0 40px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap",
    style: {
      display: 'flex',
      gap: 48,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '1 1 280px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Wordmark, {
    dark: true
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      lineHeight: '20px',
      color: 'var(--ink-300)',
      maxWidth: 280
    }
  }, "Structured ankle rehab, four phases, delivered week by week.")), [['Program', ['Phases', 'Exercise library', 'Coaching']], ['Company', ['About', 'Contact', 'Privacy']]].map(([title, items]) => /*#__PURE__*/React.createElement("div", {
    key: title,
    style: {
      flex: '0 0 160px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ap-eyebrow",
    style: {
      color: 'var(--ink-400)'
    }
  }, title), items.map(i => /*#__PURE__*/React.createElement("a", {
    key: i,
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      fontSize: 14,
      color: 'var(--ink-200)'
    }
  }, i))))), /*#__PURE__*/React.createElement("div", {
    className: "wrap",
    style: {
      marginTop: 40,
      paddingTop: 20,
      borderTop: '1px solid rgba(255,255,255,.08)',
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 12,
      color: 'var(--ink-400)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 Ankle Program"), /*#__PURE__*/React.createElement("span", {
    className: "ap-mono"
  }, "#F25623")));
}
Object.assign(window, {
  SiteHeader,
  SiteFooter,
  Wordmark
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/site/SiteHeader.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.Fab = __ds_scope.Fab;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.ICON_NAMES = __ds_scope.ICON_NAMES;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.SessionCard = __ds_scope.SessionCard;

__ds_ns.StatCard = __ds_scope.StatCard;

__ds_ns.TimeRangePill = __ds_scope.TimeRangePill;

__ds_ns.TimelineSlot = __ds_scope.TimelineSlot;

__ds_ns.SearchField = __ds_scope.SearchField;

__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.TextField = __ds_scope.TextField;

__ds_ns.DateStrip = __ds_scope.DateStrip;

__ds_ns.SectionHeader = __ds_scope.SectionHeader;

__ds_ns.TabBar = __ds_scope.TabBar;

__ds_ns.TopBar = __ds_scope.TopBar;

})();
