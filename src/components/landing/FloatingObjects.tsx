/**
 * Hand-crafted "clay" 3D-ish objects for the hero — a diary, a pencil and
 * bubbles. Warm amber + graphite tones so they glow against the near-black
 * canvas (not pastel). Used as the on-brand default and as the reduced-motion
 * / no-scene fallback for the Spline hero.
 */

function ClayBook() {
  return (
    <svg viewBox="0 0 220 180" width="100%" height="100%" role="img" aria-label="A clay diary book" className="float-soft">
      <defs>
        <linearGradient id="cover" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0c886" />
          <stop offset="1" stopColor="#d99f52" />
        </linearGradient>
        <linearGradient id="page" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2a2e" />
          <stop offset="1" stopColor="#1d1d20" />
        </linearGradient>
        <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="14" stdDeviation="14" floodColor="#e6b566" floodOpacity="0.18" />
        </filter>
      </defs>
      <g filter="url(#soft)">
        <rect x="26" y="34" width="168" height="118" rx="16" fill="url(#cover)" />
        <rect x="34" y="42" width="152" height="102" rx="10" fill="url(#page)" />
        <rect x="106" y="42" width="8" height="102" fill="#000" opacity="0.35" />
        <g stroke="#4a4a50" strokeWidth="3" strokeLinecap="round">
          <line x1="46" y1="60" x2="96" y2="60" />
          <line x1="46" y1="72" x2="98" y2="72" />
          <line x1="46" y1="84" x2="90" y2="84" />
          <line x1="122" y1="60" x2="176" y2="60" />
          <line x1="122" y1="72" x2="172" y2="72" />
        </g>
        <path d="M150 34 h16 v40 l-8 -8 l-8 8 z" fill="#d97b6c" />
        <rect x="26" y="34" width="168" height="118" rx="16" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

function ClayPencil() {
  return (
    <svg viewBox="0 0 60 200" width="100%" height="100%" role="img" aria-label="A clay pencil" className="float-slow">
      <defs>
        <linearGradient id="body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f0c886" />
          <stop offset="0.5" stopColor="#e6b566" />
          <stop offset="1" stopColor="#c9964a" />
        </linearGradient>
        <filter id="soft2" x="-80%" y="-40%" width="260%" height="180%">
          <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#e6b566" floodOpacity="0.16" />
        </filter>
      </defs>
      <g filter="url(#soft2)" transform="rotate(14 30 100)">
        <rect x="18" y="14" width="24" height="18" rx="8" fill="#8a8f9c" />
        <rect x="18" y="30" width="24" height="12" fill="#5b5f6b" />
        <rect x="18" y="40" width="24" height="120" fill="url(#body)" />
        <path d="M18 160 h24 l-12 26 z" fill="#c9a77b" />
        <path d="M25 176 h10 l-5 10 z" fill="#161618" />
        <rect x="22" y="40" width="4" height="120" fill="#fff" opacity="0.35" />
      </g>
    </svg>
  );
}

function Bubbles() {
  return (
    <svg viewBox="0 0 160 160" width="100%" height="100%" role="img" aria-label="Floating bubbles" className="float-soft">
      <defs>
        <radialGradient id="bub" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="0.4" stopColor="#a99bcf" stopOpacity="0.35" />
          <stop offset="1" stopColor="#7fb59d" stopOpacity="0.28" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="70" r="40" fill="url(#bub)" />
      <circle cx="118" cy="44" r="22" fill="url(#bub)" />
      <circle cx="112" cy="104" r="14" fill="url(#bub)" />
      <circle cx="52" cy="58" r="9" fill="#fff" opacity="0.5" />
    </svg>
  );
}

export function FloatingObjects() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      <div className="absolute left-[8%] top-[16%] w-[62%]">
        <ClayBook />
      </div>
      <div className="absolute right-[6%] top-[2%] w-[16%]">
        <ClayPencil />
      </div>
      <div className="absolute bottom-[4%] right-[10%] w-[42%]">
        <Bubbles />
      </div>
      <div className="absolute bottom-[10%] left-[2%] w-[26%]">
        <Bubbles />
      </div>
    </div>
  );
}
