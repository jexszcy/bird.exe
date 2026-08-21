// ── Persistence ───────────────────────────────────────────────
const storage = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)); if (window.Sync) window.Sync.onLocalChange(key, val); },
  coins: () => storage.get('flappy-coins', 0),
  best: () => storage.get('flappy-best', 0),
  owned: () => storage.get('flappy-owned', ['classic']),
  equipped: () => storage.get('flappy-equipped', 'classic'),
  saveCoins(v) { storage.set('flappy-coins', v); },
  saveBest(v) { storage.set('flappy-best', v); },
  saveOwned(v) { storage.set('flappy-owned', v); },
  saveEquipped(v) { storage.set('flappy-equipped', v); },
  sOwned: () => storage.get('flappy-scenery-owned', ['classic']),
  sEquipped: () => storage.get('flappy-scenery-equipped', 'classic'),
  saveSOwned(v) { storage.set('flappy-scenery-owned', v); },
  saveSEquipped(v) { storage.set('flappy-scenery-equipped', v); },
  clearAll() {
    ['flappy-coins', 'flappy-best', 'flappy-owned', 'flappy-equipped',
     'flappy-scenery-owned', 'flappy-scenery-equipped', 'flappy-pending'
    ].forEach(function (k) { localStorage.removeItem(k); });
  },
};

// ── Bird Definitions ─────────────────────────────────────────
const BIRDS = [
  { id: 'classic', name: 'Golden Classic', price: 0, svg: svgClassic, color: '#ffb703' },
  { id: 'ruby', name: 'Inferno Phoenix', price: 350, svg: svgPhoenix, color: '#e11d48' },
  { id: 'ocean', name: 'Glacier Kingfisher', price: 750, svg: svgKingfisher, color: '#3b82f6' },
  { id: 'forest', name: 'Emerald Macaw', price: 1200, svg: svgMacaw, color: '#22c55e' },
  { id: 'sunset', name: 'Crystal Hummingbird', price: 2000, svg: svgHumming, color: '#f97316' },
  { id: 'royal', name: 'Royal Peacock', price: 3500, svg: svgPeacock, color: '#9333ea' },
  { id: 'golden', name: 'Nebula Eagle', price: 6000, svg: svgEagle, color: '#f59e0b' },
  { id: 'rainbow', name: 'Celestial Archangel', price: 10000, svg: svgCelestial, color: '#8b5cf6' },
];

function getBird(id) { return BIRDS.find(b => b.id === id) || BIRDS[0]; }

// ── Scenery Definitions ──────────────────────────────────────
// Each theme configures: sky gradient, stars, ground, pipes,
// ambient spawnables and parallax layers. All visuals only - no collision.
const SCENERIES = [
  {
    id: 'classic', name: 'Classic Sky', price: 0,
    theme: {
      sky: ['#4a90d9', '#7ec3e8', '#b5e0f2'],
      skyStops: [0, 0.55, 1],
      stars: 0,
      sun: true,
      ground: { top: '#65a30d', bottom: '#854d0e', line: '#84cc16', pattern: 'grass' },
      pipe: { body: '#22c55e', bodyLight: '#4ade80', cap: '#16a34a', style: 'plain' },
      ambient: [
        { type: 'cloud', spawnEvery: 5, speed: 14 },
      ],
      parallax: [],
    },
  },
  {
    id: 'forest', name: 'Enchanted Forest', price: 3000,
    theme: {
      sky: ['#0b3d2e', '#14532d', '#3f6212'],
      stars: 0,
      ground: { top: '#4d7c0f', bottom: '#713f12', line: '#a16207', pattern: 'forest' },
      pipe: { body: '#7c4a1e', bodyLight: '#8b5a2b', cap: '#4d7c0f', style: 'trunk' },
      ambient: [
        { type: 'leaf', spawnEvery: 0.5, speed: 60 },
        { type: 'firefly', spawnEvery: 2.5, speed: 20 },
      ],
      parallax: [
        { kind: 'trees', sprite: 'pineDark', factor: 0.2, y: 0.88 },
        { kind: 'trees', sprite: 'pine', factor: 0.4, y: 0.93 },
        { kind: 'trees', sprite: 'tree', factor: 0.45, y: 0.93, sparse: 2 },
      ],
    },
  },
  {
    id: 'highway', name: 'Neon Highway', price: 6000,
    theme: {
      sky: ['#1e1b4b', '#312e81', '#1e3a8a'],
      stars: 0,
      ground: { top: '#374151', bottom: '#111827', line: '#fbbf24', pattern: 'lane' },
      pipe: { body: '#64748b', bodyLight: '#94a3b8', cap: '#facc15', style: 'hazard' },
      ambient: [
        { type: 'car', spawnEvery: 1.6, speed: 220 },
        { type: 'streetlight', spawnEvery: 3.5, speed: null },
      ],
      parallax: [
        { kind: 'buildings', sprite: ['building1', 'building2', 'building3'], dark: true, factor: 0.2, y: 0.9 },
        { kind: 'buildings', sprite: ['building1', 'building2', 'building3'], factor: 0.4, y: 0.94 },
      ],
    },
  },
  {
    id: 'space', name: 'Deep Space', price: 10000,
    theme: {
      sky: ['#020617', '#0f172a', '#1e1b4b'],
      stars: 120,
      ground: { top: '#475569', bottom: '#334155', line: '#64748b', pattern: 'rock' },
      pipe: { body: '#1e3a8a', bodyLight: '#312e81', cap: '#06b6d4', style: 'alien' },
      ambient: [
        { type: 'comet', spawnEvery: 4, speed: 500 },
        { type: 'ship', spawnEvery: 3, speed: 120 },
        { type: 'shootingstar', spawnEvery: 7, speed: 900 },
        { type: 'asteroid', spawnEvery: 5, speed: 160 },
      ],
      parallax: [
        { kind: 'planet', sprite: 'planet', factor: 0.05, y: 0.2 },
        { kind: 'moon', sprite: 'moon', factor: 0.08, y: 0.32 },
        { kind: 'nebula', color: '#4c1d95', factor: 0.02, y: 0.35 },
      ],
    },
  },
];

function getScenery(id) { return SCENERIES.find(s => s.id === id) || SCENERIES[0]; }

// ── SVG Sprites ──────────────────────────────────────────────
// Eight hand-crafted bird species, each with its own silhouette.
// viewBox 0 0 100 70; the game draws them into a 40x32 box. The main
// body of every bird stays within x 20-80 / y 15-55 so the 26x22 hitbox
// (centered on the box) stays player-fair; crests, tails, beaks and
// wings may extend beyond it.
function svgWrap(body) {
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 70">' + body + '</svg>';
}
function eye(cx, cy, r, angry) {
  return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#fff" stroke="#1e293b" stroke-width="1.2"/>' +
    '<circle cx="' + (cx + 1.5) + '" cy="' + (cy + 0.5) + '" r="' + (r * 0.5) + '" fill="#1e293b"/>' +
    '<circle cx="' + (cx + 2.6) + '" cy="' + (cy - 0.9) + '" r="' + (r * 0.22) + '" fill="#fff"/>' +
    (angry ? '<path d="M' + (cx - 7) + ' ' + (cy - 8) + ' L' + (cx + 8) + ' ' + (cy - 3) + ' L' + (cx + 7) + ' ' + (cy - 1) + ' L' + (cx - 7) + ' ' + (cy - 5) + ' Z" fill="#1e293b"/>' : '');
}
function wingBase(cx, cy, w, h, rot, fill, line) {
  return '<g transform="rotate(' + rot + ' ' + cx + ' ' + cy + ')">' +
    '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + w + '" ry="' + h + '" fill="' + fill + '"/>' +
    '<path d="M' + (cx - w + 2) + ' ' + (cy - h + 2) + ' Q' + cx + ' ' + (cy - h - 2) + ' ' + (cx + w - 2) + ' ' + (cy - h + 2) + '" stroke="' + line + '" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
    '<path d="M' + (cx - w + 2) + ' ' + (cy + 1) + ' Q' + cx + ' ' + (cy - 3) + ' ' + (cx + w - 2) + ' ' + (cy + 1) + '" stroke="' + line + '" stroke-width="1.1" fill="none" stroke-linecap="round"/>' +
    '</g>';
}

// 1. Golden Classic - the iconic round yellow bird, polished.
function svgClassic() {
  return svgWrap(
    '<defs><radialGradient id="bg" cx="35%" cy="30%" r="72%">' +
      '<stop offset="0" stop-color="#ffe08a"/><stop offset="0.55" stop-color="#ffb703"/>' +
      '<stop offset="1" stop-color="#d97706"/></radialGradient></defs>' +
    '<path d="M24 44 L10 30 L30 46 Z" fill="#f59e0b" opacity="0.9"/>' +
    '<path d="M26 50 L12 48 L20 56 Z" fill="#d97706"/>' +
    '<ellipse cx="50" cy="40" rx="27" ry="23" fill="url(#bg)"/>' +
    '<ellipse cx="43" cy="52" rx="16" ry="9" fill="#fff7d6" opacity="0.95"/>' +
    wingBase(38, 45, 12, 8, -20, '#f59e0b', '#d97706') +
    eye(62, 23, 6) +
    '<path d="M69 26 L96 42 L69 36 Z" fill="#f97316"/>' +
    '<path d="M70 37 L93 44 L70 42 Z" fill="#fb923c"/>'
  );
}

// 2. Inferno Phoenix - fire bird: flame crest, layered flame tail, fierce eye.
function svgPhoenix() {
  return svgWrap(
    '<defs><linearGradient id="bg" x1="0" y1="1" x2="0" y2="0">' +
      '<stop offset="0" stop-color="#dc2626"/><stop offset="0.5" stop-color="#f97316"/>' +
      '<stop offset="1" stop-color="#fbbf24"/></linearGradient></defs>' +
    // flame tail feathers trailing back
    '<path d="M24 40 Q6 30 14 20 Q20 30 28 34 Z" fill="#f97316" opacity="0.9"/>' +
    '<path d="M22 46 Q2 44 8 34 Q16 40 26 44 Z" fill="#dc2626"/>' +
    '<path d="M26 52 Q10 58 6 48 Q16 52 28 50 Z" fill="#fbbf24" opacity="0.9"/>' +
    // body
    '<ellipse cx="50" cy="40" rx="25" ry="21" fill="url(#bg)"/>' +
    '<ellipse cx="44" cy="50" rx="13" ry="7" fill="#fde68a" opacity="0.8"/>' +
    // flame-tipped wing
    '<g transform="rotate(-15 38 45)">' +
      '<ellipse cx="38" cy="45" rx="12" ry="7" fill="#ea580c"/>' +
      '<path d="M28 40 L22 34 L30 42 Z" fill="#fbbf24"/>' +
      '<path d="M30 44 L24 40 L32 46 Z" fill="#f97316"/>' +
    '</g>' +
    // flame crest (3 curved tongues)
    '<path d="M56 20 Q54 6 62 2 Q60 12 64 18 Z" fill="#fbbf24"/>' +
    '<path d="M62 16 Q66 2 74 4 Q68 12 68 18 Z" fill="#f97316"/>' +
    '<path d="M66 20 Q74 8 80 12 Q74 18 70 22 Z" fill="#dc2626"/>' +
    // fierce angled eye with brow
    '<circle cx="63" cy="24" r="5.5" fill="#fff" stroke="#7c2d12" stroke-width="1.2"/>' +
    '<circle cx="64.5" cy="24.5" r="2.8" fill="#1e293b"/>' +
    '<circle cx="65.6" cy="23.1" r="1.2" fill="#fff"/>' +
    '<path d="M56 17 L71 22 L70 25 L56 20 Z" fill="#7c2d12"/>' +
    // beak
    '<path d="M69 27 L95 40 L69 35 Z" fill="#fbbf24"/>' +
    '<path d="M70 36 L92 42 L70 41 Z" fill="#f59e0b"/>'
  );
}

// 3. Glacier Kingfisher - sleek, longest straight beak, frost belly, icicle.
function svgKingfisher() {
  return svgWrap(
    '<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#38bdf8"/><stop offset="0.6" stop-color="#0ea5e9"/>' +
      '<stop offset="1" stop-color="#0369a1"/></linearGradient></defs>' +
    // long straight tail
    '<path d="M24 44 L6 36 L24 50 Z" fill="#0284c7"/>' +
    // sleek elongated body
    '<ellipse cx="50" cy="40" rx="27" ry="19" fill="url(#bg)"/>' +
    // frost belly
    '<ellipse cx="44" cy="50" rx="15" ry="8" fill="#e0f2fe" opacity="0.95"/>' +
    // small compact wing
    wingBase(36, 44, 10, 6, -15, '#0284c7', '#075985') +
    // crystalline eye
    '<circle cx="63" cy="24" r="5" fill="#f0f9ff" stroke="#075985" stroke-width="1.2"/>' +
    '<circle cx="64.5" cy="24.5" r="2.5" fill="#0c4a6e"/>' +
    '<circle cx="65.5" cy="23.2" r="1.1" fill="#fff"/>' +
    // longest beak: long straight dagger
    '<path d="M69 27 L99 36 L69 33 Z" fill="#0c4a6e"/>' +
    '<path d="M69 33 L99 36 L69 36 Z" fill="#075985"/>' +
    // icicle drip under the beak
    '<path d="M72 37 L74 44 L76 37 Z" fill="#bae6fd" opacity="0.9"/>'
  );
}

// 4. Emerald Macaw - big hooked parrot beak, green body, red-blue wing patches.
function svgMacaw() {
  return svgWrap(
    '<defs><radialGradient id="bg" cx="35%" cy="30%" r="72%">' +
      '<stop offset="0" stop-color="#4ade80"/><stop offset="0.55" stop-color="#22c55e"/>' +
      '<stop offset="1" stop-color="#15803d"/></radialGradient></defs>' +
    // short tail fan
    '<path d="M24 44 L10 34 L22 52 Z" fill="#16a34a"/>' +
    '<path d="M26 48 L14 44 L24 56 Z" fill="#15803d"/>' +
    // round head + body
    '<ellipse cx="50" cy="40" rx="26" ry="22" fill="url(#bg)"/>' +
    '<ellipse cx="44" cy="52" rx="14" ry="8" fill="#bbf7d0" opacity="0.9"/>' +
    // macaw wing: red patch + blue flight feathers
    '<g transform="rotate(-18 38 45)">' +
      '<ellipse cx="38" cy="45" rx="12" ry="8" fill="#ef4444"/>' +
      '<path d="M30 40 L26 34 L34 42 Z" fill="#3b82f6"/>' +
      '<path d="M32 44 L28 40 L36 46 Z" fill="#2563eb"/>' +
    '</g>' +
    // white face patch
    '<ellipse cx="60" cy="28" rx="9" ry="8" fill="#f8fafc" opacity="0.95"/>' +
    eye(62, 26, 4.5) +
    // big hooked parrot beak: upper mandible curves down over lower
    '<path d="M68 28 Q88 24 90 34 Q90 40 84 42 Q80 36 70 36 Z" fill="#facc15"/>' +
    '<path d="M70 37 Q80 40 84 42 Q78 46 70 42 Z" fill="#f59e0b"/>'
  );
}

// 5. Crystal Hummingbird - needle beak, tiny body, iridescent, throat gem.
function svgHumming() {
  return svgWrap(
    '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#e879f9"/><stop offset="0.5" stop-color="#fbbf24"/>' +
      '<stop offset="1" stop-color="#2dd4bf"/></linearGradient></defs>' +
    // small tail fan
    '<path d="M26 44 L12 40 L20 50 Z" fill="#c026d3" opacity="0.9"/>' +
    '<path d="M28 48 L16 50 L24 56 Z" fill="#0d9488" opacity="0.9"/>' +
    // tiny round body
    '<ellipse cx="50" cy="40" rx="20" ry="17" fill="url(#bg)"/>' +
    '<ellipse cx="46" cy="48" rx="10" ry="6" fill="#fdf4ff" opacity="0.85"/>' +
    // small wing detail
    wingBase(40, 42, 8, 5, -25, '#a21caf', '#701a75') +
    // jewel throat gem
    '<circle cx="58" cy="36" r="3.5" fill="#f0abfc" stroke="#a21caf" stroke-width="1"/>' +
    '<circle cx="57" cy="35" r="1.2" fill="#fff"/>' +
    eye(60, 24, 4) +
    // needle-thin long beak
    '<path d="M66 28 L100 33 L66 31 Z" fill="#1e293b"/>'
  );
}

// 6. Royal Peacock - small body, huge ornate tail train fan, crown crest.
function svgPeacock() {
  return svgWrap(
    '<defs><radialGradient id="bg" cx="35%" cy="30%" r="72%">' +
      '<stop offset="0" stop-color="#a78bfa"/><stop offset="0.55" stop-color="#7c3aed"/>' +
      '<stop offset="1" stop-color="#5b21b6"/></radialGradient></defs>' +
    // tail train fan: layered arcs with eyespots
    '<path d="M50 30 Q-6 6 6 44 Q20 30 50 34 Z" fill="#0d9488" opacity="0.9"/>' +
    '<path d="M50 34 Q-2 16 12 48 Q24 36 50 38 Z" fill="#14b8a6" opacity="0.9"/>' +
    '<circle cx="16" cy="26" r="5" fill="#facc15" stroke="#0f766e" stroke-width="1.5"/>' +
    '<circle cx="16" cy="26" r="2" fill="#7c2d12"/>' +
    '<circle cx="8" cy="38" r="4.5" fill="#facc15" stroke="#0f766e" stroke-width="1.5"/>' +
    '<circle cx="8" cy="38" r="1.8" fill="#7c2d12"/>' +
    '<circle cx="26" cy="20" r="4" fill="#facc15" stroke="#0f766e" stroke-width="1.5"/>' +
    '<circle cx="26" cy="20" r="1.6" fill="#7c2d12"/>' +
    '<circle cx="4" cy="50" r="4" fill="#facc15" stroke="#0f766e" stroke-width="1.5"/>' +
    '<circle cx="4" cy="50" r="1.6" fill="#7c2d12"/>' +
    // small elegant body
    '<ellipse cx="50" cy="42" rx="20" ry="17" fill="url(#bg)"/>' +
    '<ellipse cx="45" cy="50" rx="11" ry="6" fill="#ede9fe" opacity="0.9"/>' +
    wingBase(40, 44, 9, 6, -15, '#6d28d9', '#4c1d95') +
    // crown crest: 3 thin feathers with dots
    '<path d="M56 26 L54 12 L58 26 Z" fill="#facc15"/>' +
    '<path d="M61 24 L62 10 L65 24 Z" fill="#facc15"/>' +
    '<path d="M66 26 L70 12 L69 26 Z" fill="#facc15"/>' +
    '<circle cx="55" cy="11" r="1.8" fill="#f59e0b"/>' +
    '<circle cx="63" cy="9" r="1.8" fill="#f59e0b"/>' +
    '<circle cx="71" cy="11" r="1.8" fill="#f59e0b"/>' +
    eye(62, 26, 4.5) +
    '<path d="M68 30 L88 38 L68 36 Z" fill="#facc15"/>' +
    '<path d="M68 37 L84 40 L68 41 Z" fill="#f59e0b"/>'
  );
}

// 7. Nebula Eagle - broad chest, hooked beak, aggressive brow, spread wings.
function svgEagle() {
  return svgWrap(
    '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#fde68a"/><stop offset="0.5" stop-color="#f59e0b"/>' +
      '<stop offset="1" stop-color="#b45309"/></linearGradient></defs>' +
    // spread majestic wings - widest silhouette
    '<path d="M30 40 Q8 22 2 30 Q14 34 24 44 Z" fill="#d97706"/>' +
    '<path d="M28 44 Q4 34 0 44 Q12 44 24 50 Z" fill="#b45309"/>' +
    '<path d="M70 40 Q92 22 98 30 Q86 34 76 44 Z" fill="#d97706"/>' +
    '<path d="M72 44 Q96 34 100 44 Q88 44 76 50 Z" fill="#b45309"/>' +
    // white star sparkle accents
    '<path d="M10 26 L11 29 L14 30 L11 31 L10 34 L9 31 L6 30 L9 29 Z" fill="#fff" opacity="0.9"/>' +
    '<path d="M90 26 L91 28 L93 29 L91 30 L90 32 L89 30 L87 29 L89 28 Z" fill="#fff" opacity="0.9"/>' +
    // broad muscular chest
    '<ellipse cx="50" cy="42" rx="24" ry="20" fill="url(#bg)"/>' +
    '<ellipse cx="45" cy="51" rx="13" ry="7" fill="#fef3c7" opacity="0.9"/>' +
    // folded wing hint over chest
    wingBase(38, 45, 11, 7, -15, '#b45309', '#92400e') +
    // forward-set aggressive brow + fierce eye
    '<circle cx="63" cy="24" r="5.5" fill="#fff" stroke="#78350f" stroke-width="1.2"/>' +
    '<circle cx="64.5" cy="24.5" r="2.8" fill="#1e293b"/>' +
    '<circle cx="65.6" cy="23.1" r="1.2" fill="#fff"/>' +
    '<path d="M55 16 L71 21 L70 24 L55 20 Z" fill="#78350f"/>' +
    // hooked fierce beak
    '<path d="M69 27 Q90 24 93 33 Q93 38 88 40 Q84 35 70 35 Z" fill="#fbbf24"/>' +
    '<path d="M70 36 Q82 39 88 40 Q82 44 70 41 Z" fill="#f59e0b"/>'
  );
}

// 8. Celestial Archangel - rainbow gradient, halo, streamers, serene.
function svgCelestial() {
  return svgWrap(
    '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#ef4444"/><stop offset="0.2" stop-color="#f97316"/>' +
      '<stop offset="0.4" stop-color="#facc15"/><stop offset="0.6" stop-color="#22c55e"/>' +
      '<stop offset="0.8" stop-color="#3b82f6"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient>' +
      '<linearGradient id="st" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#c4b5fd" stop-opacity="0.9"/><stop offset="1" stop-color="#c4b5fd" stop-opacity="0.1"/>' +
      '</linearGradient></defs>' +
    // flowing tail streamers (translucent ribbons)
    '<path d="M26 44 Q8 40 4 30 Q14 40 24 50 Z" fill="url(#st)"/>' +
    '<path d="M28 48 Q10 52 2 46 Q14 52 26 56 Z" fill="url(#st)"/>' +
    '<path d="M30 52 Q16 60 8 58 Q18 60 28 58 Z" fill="url(#st)"/>' +
    // halo ring above head with glow
    '<circle cx="62" cy="10" r="7" fill="none" stroke="#fde047" stroke-width="2.5"/>' +
    '<circle cx="62" cy="10" r="10" fill="#fde047" opacity="0.15"/>' +
    // radiant body
    '<ellipse cx="50" cy="40" rx="24" ry="20" fill="url(#bg)"/>' +
    '<ellipse cx="45" cy="50" rx="13" ry="7" fill="#ffffff" opacity="0.85"/>' +
    // tiny white wing pair
    '<path d="M32 40 Q18 30 14 38 Q22 40 30 46 Z" fill="#f8fafc"/>' +
    '<path d="M68 40 Q82 30 86 38 Q78 40 70 46 Z" fill="#f8fafc"/>' +
    // closed serene eye with eyelashes
    '<path d="M58 24 Q63 28 68 24" stroke="#1e293b" stroke-width="2" fill="none" stroke-linecap="round"/>' +
    '<path d="M59 21 L57 18 M63 22 L63 19 M67 21 L69 18" stroke="#1e293b" stroke-width="1.2" stroke-linecap="round"/>' +
    // soft starburst sparkles
    '<path d="M44 16 L45 19 L48 20 L45 21 L44 24 L43 21 L40 20 L43 19 Z" fill="#fff" opacity="0.9"/>' +
    '<path d="M78 30 L79 32 L81 33 L79 34 L78 36 L77 34 L75 33 L77 32 Z" fill="#fff" opacity="0.9"/>' +
    '<path d="M36 30 L37 32 L39 33 L37 34 L36 36 L35 34 L33 33 L35 32 Z" fill="#fff" opacity="0.8"/>' +
    // small gentle beak
    '<path d="M69 30 L90 36 L69 35 Z" fill="#fde047"/>'
  );
}

// Load each bird sprite as an <img> from an SVG data-URI. Async:
// drawSpriteTo() falls back to a colored circle until an image is ready.
const birdImages = {};
function loadBirdImages(done) {
  let remaining = BIRDS.length;
  BIRDS.forEach(b => {
    const img = new Image();
    img.onload = img.onerror = () => { if (--remaining === 0) done && done(); };
    img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(b.svg ? b.svg() : svgClassic());
    birdImages[b.id] = img;
  });
}

function drawSpriteTo(c, birdDef, x, y, w, h) {
  const img = birdImages[birdDef.id];
  if (img && img.complete && img.naturalWidth > 0) {
    c.drawImage(img, x, y, w, h);
  } else {
    c.fillStyle = birdDef.color || '#facc15';
    c.beginPath();
    c.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    c.fill();
  }
}

// ── Scenery Sprites ──────────────────────────────────────────
// Same pattern as the birds: hand-drawn SVG art as data-URI <img>s.
// Every sprite has a canvas fallback in the draw helpers below so the
// game still renders (simplified shapes) while images load.
const scenerySprites = {};

function registerScenery(name, body) {
  const img = new Image();
  img.onload = img.onerror = () => {};
  img.src = 'data:image/svg+xml;utf8,' +
    encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' + body + '</svg>');
  scenerySprites[name] = img;
}

function loadScenerySprites(done) {
  const sprites = {
    pine:
      '<polygon points="50,12 26,52 74,52" fill="#14532d"/>' +
      '<polygon points="50,12 34,52 66,52" fill="#166534" opacity="0.55"/>' +
      '<polygon points="50,30 30,66 70,66" fill="#166534"/>' +
      '<polygon points="50,30 36,66 64,66" fill="#15803d" opacity="0.5"/>' +
      '<polygon points="50,46 34,80 66,80" fill="#15803d"/>' +
      '<polygon points="50,46 40,80 60,80" fill="#22c55e" opacity="0.4"/>' +
      '<rect x="44" y="80" width="12" height="14" fill="#7c4a1e"/>',
    pineDark:
      '<polygon points="50,12 26,52 74,52" fill="#052e16"/>' +
      '<polygon points="50,12 34,52 66,52" fill="#0a3d1f" opacity="0.55"/>' +
      '<polygon points="50,30 30,66 70,66" fill="#0a3d1f"/>' +
      '<polygon points="50,30 36,66 64,66" fill="#14532d" opacity="0.5"/>' +
      '<polygon points="50,46 34,80 66,80" fill="#14532d"/>' +
      '<rect x="44" y="80" width="12" height="14" fill="#5b3410"/>',
    tree:
      '<rect x="44" y="52" width="12" height="30" fill="#7c4a1e"/>' +
      '<rect x="47" y="54" width="3" height="26" fill="#8b5a2b"/>' +
      '<circle cx="34" cy="42" r="20" fill="#15803d"/>' +
      '<circle cx="62" cy="40" r="22" fill="#16a34a"/>' +
      '<circle cx="48" cy="28" r="18" fill="#22c55e"/>' +
      '<circle cx="42" cy="24" r="10" fill="#4ade80" opacity="0.7"/>',
    streetlight:
      '<defs><radialGradient id="lg" cx="50%" cy="0%" r="80%">' +
        '<stop offset="0" stop-color="#fef08a" stop-opacity="0.6"/>' +
        '<stop offset="1" stop-color="#fef08a" stop-opacity="0"/>' +
      '</radialGradient></defs>' +
      '<rect x="8" y="20" width="4" height="80" fill="#475569"/>' +
      '<path d="M12 20 Q12 8 28 8 L36 8" stroke="#475569" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<rect x="34" y="4" width="16" height="9" rx="3" fill="#1e293b"/>' +
      '<rect x="36" y="9" width="12" height="4" fill="#fef08a"/>' +
      '<ellipse cx="42" cy="30" rx="26" ry="14" fill="url(#lg)"/>',
    building1:
      '<rect x="0" y="8" width="100" height="92" fill="#0f172a"/>' +
      '<rect x="6" y="2" width="10" height="10" fill="#1e293b"/>' +
      '<rect x="0" y="8" width="100" height="6" fill="#334155"/>' +
      '<circle cx="80" cy="6" r="2.5" fill="#ef4444"/>' +
      '<g fill="#fbbf24">' +
        '<rect x="10" y="22" width="8" height="9" opacity="0.9"/><rect x="26" y="22" width="8" height="9" opacity="0.35"/>' +
        '<rect x="42" y="22" width="8" height="9" opacity="0.9"/><rect x="58" y="22" width="8" height="9" opacity="0.35"/>' +
        '<rect x="74" y="22" width="8" height="9" opacity="0.9"/><rect x="10" y="40" width="8" height="9" opacity="0.35"/>' +
        '<rect x="26" y="40" width="8" height="9" opacity="0.9"/><rect x="42" y="40" width="8" height="9" opacity="0.35"/>' +
        '<rect x="58" y="40" width="8" height="9" opacity="0.9"/><rect x="74" y="40" width="8" height="9" opacity="0.35"/>' +
        '<rect x="10" y="58" width="8" height="9" opacity="0.9"/><rect x="26" y="58" width="8" height="9" opacity="0.35"/>' +
        '<rect x="42" y="58" width="8" height="9" opacity="0.9"/><rect x="58" y="58" width="8" height="9" opacity="0.35"/>' +
        '<rect x="74" y="58" width="8" height="9" opacity="0.9"/>' +
      '</g>',
    building2:
      '<rect x="0" y="34" width="100" height="66" fill="#16213e"/>' +
      '<rect x="0" y="34" width="100" height="5" fill="#334155"/>' +
      '<g fill="#fbbf24">' +
        '<rect x="10" y="48" width="9" height="8" opacity="0.9"/><rect x="28" y="48" width="9" height="8" opacity="0.4"/>' +
        '<rect x="46" y="48" width="9" height="8" opacity="0.9"/><rect x="64" y="48" width="9" height="8" opacity="0.4"/>' +
        '<rect x="82" y="48" width="9" height="8" opacity="0.9"/><rect x="10" y="66" width="9" height="8" opacity="0.4"/>' +
        '<rect x="28" y="66" width="9" height="8" opacity="0.9"/><rect x="46" y="66" width="9" height="8" opacity="0.4"/>' +
        '<rect x="64" y="66" width="9" height="8" opacity="0.9"/><rect x="82" y="66" width="9" height="8" opacity="0.4"/>' +
      '</g>',
    building3:
      '<rect x="0" y="12" width="100" height="88" fill="#0b1120"/>' +
      '<rect x="46" y="0" width="8" height="14" fill="#334155"/>' +
      '<circle cx="50" cy="2" r="2.5" fill="#ef4444"/>' +
      '<rect x="0" y="12" width="100" height="5" fill="#1e293b"/>' +
      '<rect x="0" y="78" width="100" height="4" fill="#334155"/>' +
      '<g fill="#fbbf24">' +
        '<rect x="12" y="26" width="7" height="8" opacity="0.9"/><rect x="30" y="26" width="7" height="8" opacity="0.3"/>' +
        '<rect x="48" y="26" width="7" height="8" opacity="0.9"/><rect x="66" y="26" width="7" height="8" opacity="0.3"/>' +
        '<rect x="84" y="26" width="7" height="8" opacity="0.9"/><rect x="12" y="42" width="7" height="8" opacity="0.3"/>' +
        '<rect x="30" y="42" width="7" height="8" opacity="0.9"/><rect x="48" y="42" width="7" height="8" opacity="0.3"/>' +
        '<rect x="66" y="42" width="7" height="8" opacity="0.9"/><rect x="84" y="42" width="7" height="8" opacity="0.3"/>' +
        '<rect x="12" y="58" width="7" height="8" opacity="0.9"/><rect x="30" y="58" width="7" height="8" opacity="0.3"/>' +
        '<rect x="48" y="58" width="7" height="8" opacity="0.9"/><rect x="66" y="58" width="7" height="8" opacity="0.3"/>' +
        '<rect x="84" y="58" width="7" height="8" opacity="0.9"/>' +
      '</g>',
    car:
      '<defs><linearGradient id="cb" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#f87171"/><stop offset="1" stop-color="#b91c1c"/></linearGradient></defs>' +
      '<rect x="6" y="42" width="72" height="28" rx="12" fill="url(#cb)"/>' +
      '<path d="M18 42 L30 24 L52 24 L64 42 Z" fill="#ef4444"/>' +
      '<rect x="33" y="28" width="16" height="14" fill="#bfdbfe"/>' +
      '<rect x="33" y="28" width="16" height="14" fill="#67e8f9" opacity="0.7"/>' +
      '<circle cx="24" cy="76" r="12" fill="#111827"/>' +
      '<circle cx="24" cy="76" r="5.5" fill="#9ca3af"/>' +
      '<circle cx="60" cy="76" r="12" fill="#111827"/>' +
      '<circle cx="60" cy="76" r="5.5" fill="#9ca3af"/>' +
      '<rect x="0" y="52" width="6" height="9" fill="#fde047"/>' +
      '<rect x="94" y="52" width="6" height="9" fill="#ef4444"/>',
    carBlue:
      '<defs><linearGradient id="cb2" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#60a5fa"/><stop offset="1" stop-color="#1e40af"/></linearGradient></defs>' +
      '<rect x="6" y="42" width="72" height="28" rx="12" fill="url(#cb2)"/>' +
      '<path d="M18 42 L30 24 L52 24 L64 42 Z" fill="#3b82f6"/>' +
      '<rect x="33" y="28" width="16" height="14" fill="#bfdbfe"/>' +
      '<rect x="33" y="28" width="16" height="14" fill="#67e8f9" opacity="0.7"/>' +
      '<circle cx="24" cy="76" r="12" fill="#111827"/>' +
      '<circle cx="24" cy="76" r="5.5" fill="#9ca3af"/>' +
      '<circle cx="60" cy="76" r="12" fill="#111827"/>' +
      '<circle cx="60" cy="76" r="5.5" fill="#9ca3af"/>' +
      '<rect x="0" y="52" width="6" height="9" fill="#fde047"/>' +
      '<rect x="94" y="52" width="6" height="9" fill="#ef4444"/>',
    comet:
      '<defs><radialGradient id="ch" cx="50%" cy="50%" r="50%">' +
        '<stop offset="0" stop-color="#ffffff"/><stop offset="0.5" stop-color="#fef08a"/>' +
        '<stop offset="1" stop-color="#f97316" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="ct" x1="0" y1="1" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#fef08a" stop-opacity="0.9"/><stop offset="1" stop-color="#fef08a" stop-opacity="0"/></linearGradient></defs>' +
      // head at bottom-left (leading), gradient tail trailing up-right
      '<path d="M30 70 L86 22 L60 76 Z" fill="url(#ct)"/>' +
      '<circle cx="28" cy="72" r="9" fill="url(#ch)"/>',
    asteroid:
      '<ellipse cx="50" cy="50" rx="38" ry="32" fill="#57534e"/>' +
      '<ellipse cx="38" cy="40" rx="24" ry="18" fill="#78716c" opacity="0.5"/>' +
      '<circle cx="32" cy="34" r="7" fill="#44403c"/>' +
      '<circle cx="30" cy="32" r="2.5" fill="#a8a29e"/>' +
      '<circle cx="60" cy="56" r="9" fill="#44403c"/>' +
      '<circle cx="58" cy="54" r="3" fill="#a8a29e"/>' +
      '<circle cx="52" cy="30" r="5" fill="#44403c"/>' +
      '<circle cx="51" cy="29" r="1.8" fill="#a8a29e"/>' +
      '<path d="M24 60 Q34 52 44 60" stroke="#a8a29e" stroke-width="3" fill="none" opacity="0.7"/>',
    ship:
      // nose points left (ships travel right-to-left on screen)
      '<path d="M82 50 L58 20 L54 50 L58 80 Z" fill="#94a3b8"/>' +
      '<path d="M82 50 L58 20 L54 50 L58 80 Z" fill="#cbd5e1" opacity="0.35"/>' +
      '<path d="M58 28 L26 12 L26 34 L54 46 Z" fill="#64748b"/>' +
      '<path d="M58 72 L26 88 L26 66 L54 54 Z" fill="#64748b"/>' +
      '<path d="M58 30 L34 20 L34 36 L54 46 Z" fill="#94a3b8" opacity="0.6"/>' +
      '<circle cx="58" cy="50" r="8" fill="#22d3ee"/>' +
      '<circle cx="59" cy="49" r="4" fill="#a5f3fc"/>' +
      '<path d="M74 88 L58 80 L42 88 Z" fill="#f97316"/>' +
      '<path d="M70 88 L58 82 L46 88 Z" fill="#fbbf24" opacity="0.8"/>',
    ufo:
      '<ellipse cx="50" cy="58" rx="38" ry="12" fill="#94a3b8"/>' +
      '<ellipse cx="50" cy="56" rx="26" ry="7" fill="#cbd5e1" opacity="0.6"/>' +
      '<path d="M34 58 Q50 44 66 58 Z" fill="#e2e8f0"/>' +
      '<path d="M44 50 Q50 46 56 50" stroke="#67e8f9" stroke-width="2" fill="none"/>' +
      '<circle cx="50" cy="52" r="4" fill="#a5f3fc"/>' +
      '<rect x="40" y="26" width="3" height="26" fill="#a5f3fc" opacity="0.8"/>' +
      '<rect x="57" y="26" width="3" height="26" fill="#a5f3fc" opacity="0.8"/>' +
      '<circle cx="41.5" cy="22" r="4" fill="#22d3ee"/>' +
      '<circle cx="58.5" cy="22" r="4" fill="#22d3ee"/>',
    cloud:
      '<g fill="#ffffff">' +
        '<circle cx="30" cy="58" r="20"/><circle cx="52" cy="50" r="26"/>' +
        '<circle cx="74" cy="58" r="18"/><circle cx="52" cy="68" r="20"/>' +
      '</g>',
    firefly:
      '<defs><radialGradient id="fg" cx="50%" cy="50%" r="50%">' +
        '<stop offset="0" stop-color="#fefce8"/><stop offset="0.4" stop-color="#fde047"/>' +
        '<stop offset="1" stop-color="#fde047" stop-opacity="0"/></radialGradient></defs>' +
      '<circle cx="50" cy="50" r="26" fill="url(#fg)"/>' +
      '<circle cx="50" cy="50" r="5" fill="#fef9c3"/>',
    sun:
      '<defs>' +
      '<radialGradient id="sg" cx="50%" cy="50%" r="50%">' +
        '<stop offset="0" stop-color="#fde047" stop-opacity="0.5"/><stop offset="0.6" stop-color="#fbbf24" stop-opacity="0.18"/><stop offset="1" stop-color="#fbbf24" stop-opacity="0"/>' +
      '</radialGradient>' +
      '<radialGradient id="sdc" cx="42%" cy="38%" r="68%">' +
        '<stop offset="0" stop-color="#fffbeb"/><stop offset="0.45" stop-color="#fde047"/><stop offset="1" stop-color="#f59e0b"/>' +
      '</radialGradient>' +
      '<radialGradient id="scc" cx="45%" cy="40%" r="55%">' +
        '<stop offset="0" stop-color="#ffffff"/><stop offset="0.7" stop-color="#fef9c3" stop-opacity="0.9"/><stop offset="1" stop-color="#fef9c3" stop-opacity="0"/>' +
      '</radialGradient>' +
      '<linearGradient id="slf" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#fff7cc" stop-opacity="0"/><stop offset="0.5" stop-color="#fff7cc" stop-opacity="0.35"/><stop offset="1" stop-color="#fff7cc" stop-opacity="0"/>' +
      '</linearGradient>' +
      '</defs>' +
      '<circle cx="50" cy="50" r="42" fill="url(#sg)"/>' +
      '<g fill="#fde047">' +
        '<path d="M50 4 L54 18 L58 4 Z" opacity="0.75"/>' +
        '<path d="M50 82 L54 96 L58 82 Z" opacity="0.75"/>' +
        '<path d="M4 50 L18 54 L26 58 Z" opacity="0.75"/>' +
        '<path d="M74 42 L82 46 L96 50 Z" opacity="0.75"/>' +
        '<path d="M16 16 L26 24 L22 32 Z" opacity="0.45"/>' +
        '<path d="M78 20 L84 24 L94 22 Z" opacity="0.45"/>' +
        '<path d="M8 72 L14 76 L12 88 Z" opacity="0.45"/>' +
        '<path d="M74 68 L84 72 L88 82 Z" opacity="0.45"/>' +
        '<path d="M32 6 L36 14 L44 12 Z" opacity="0.3"/>' +
        '<path d="M60 82 L64 92 L70 88 Z" opacity="0.3"/>' +
        '<path d="M8 30 L16 32 L14 42 Z" opacity="0.3"/>' +
        '<path d="M84 52 L92 56 L94 66 Z" opacity="0.3"/>' +
      '</g>' +
      '<circle cx="50" cy="50" r="28" fill="url(#sdc)"/>' +
      '<circle cx="50" cy="50" r="16" fill="url(#scc)"/>' +
      '<ellipse cx="50" cy="48" rx="46" ry="7" fill="url(#slf)" transform="rotate(-14 50 48)"/>',
    bush:
      '<g fill="#16a34a">' +
        '<circle cx="30" cy="52" r="18"/><circle cx="55" cy="46" r="20"/>' +
        '<circle cx="72" cy="54" r="15"/>' +
      '</g>' +
      '<g fill="#22c55e" opacity="0.7">' +
        '<circle cx="42" cy="46" r="10"/><circle cx="62" cy="42" r="9"/>' +
      '</g>',
    mushroom:
      '<rect x="44" y="60" width="12" height="24" fill="#e7e5e4"/>' +
      '<path d="M28 62 Q50 26 72 62 Z" fill="#dc2626"/>' +
      '<circle cx="42" cy="48" r="5" fill="#ffffff" opacity="0.85"/>' +
      '<circle cx="58" cy="44" r="4" fill="#ffffff" opacity="0.85"/>',
    flower:
      '<rect x="49" y="52" width="3" height="30" fill="#22c55e"/>' +
      '<ellipse cx="38" cy="42" rx="9" ry="7" fill="#f9a8d4"/>' +
      '<ellipse cx="62" cy="42" rx="9" ry="7" fill="#f9a8d4"/>' +
      '<ellipse cx="50" cy="32" rx="9" ry="7" fill="#f9a8d4"/>' +
      '<ellipse cx="50" cy="52" rx="9" ry="7" fill="#f9a8d4"/>' +
      '<circle cx="50" cy="42" r="6" fill="#fbbf24"/>',
    rock:
      '<path d="M20 80 L30 50 L55 44 L78 58 L70 80 Z" fill="#6b7280"/>' +
      '<path d="M30 50 L55 44 L58 64 L36 66 Z" fill="#9ca3af" opacity="0.6"/>' +
      '<circle cx="42" cy="62" r="4" fill="#4b5563"/>',
    moon:
      '<circle cx="50" cy="50" r="44" fill="#cbd5e1"/>' +
      '<circle cx="38" cy="38" r="9" fill="#94a3b8"/>' +
      '<circle cx="62" cy="56" r="12" fill="#94a3b8"/>' +
      '<circle cx="52" cy="70" r="6" fill="#94a3b8"/>' +
      '<circle cx="66" cy="32" r="5" fill="#94a3b8"/>',
    enemyBird:
      // angry dark bird: red/dark body, frown + brow over eye, sharp beak, wing
      '<ellipse cx="50" cy="42" rx="26" ry="22" fill="#7f1d1d"/>' +
      '<ellipse cx="50" cy="42" rx="26" ry="22" fill="#b91c1c" opacity="0.35"/>' +
      '<ellipse cx="42" cy="52" rx="14" ry="8" fill="#450a0a" opacity="0.8"/>' +
      '<g transform="rotate(-20 38 46)">' +
        '<ellipse cx="38" cy="46" rx="12" ry="8" fill="#991b1b"/>' +
        '<path d="M29 39 Q38 33 47 37" stroke="#450a0a" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
      '</g>' +
      // eye + angry brow
      '<circle cx="62" cy="24" r="6" fill="#fff" stroke="#450a0a" stroke-width="1.2"/>' +
      '<circle cx="63.5" cy="24.5" r="3" fill="#1e293b"/>' +
      '<circle cx="64.6" cy="23.1" r="1.3" fill="#fff"/>' +
      '<path d="M55 16 L70 21 L69 24 L55 20 Z" fill="#450a0a"/>' +
      // frown
      '<path d="M58 33 Q63 30 68 33" stroke="#450a0a" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
      // sharp beak
      '<path d="M69 27 L97 40 L69 35 Z" fill="#facc15"/>' +
      '<path d="M70 36 L93 42 L70 41 Z" fill="#f59e0b"/>',
    enemyRed:
      // classic angry red bird: round red body, darker belly, angry eyes
      // with thick inward-angled brows, orange/black two-part beak
      '<path d="M26 46 L8 38 L24 52 Z" fill="#be123c"/>' +
      '<path d="M28 52 L12 56 L26 58 Z" fill="#9f1239"/>' +
      '<ellipse cx="50" cy="50" rx="27" ry="24" fill="#e11d48"/>' +
      '<ellipse cx="50" cy="50" rx="27" ry="24" fill="#f43f5e" opacity="0.35"/>' +
      '<ellipse cx="44" cy="60" rx="15" ry="9" fill="#be123c"/>' +
      '<g transform="rotate(-20 38 54)">' +
        '<ellipse cx="38" cy="54" rx="13" ry="8" fill="#be123c"/>' +
        '<path d="M28 48 Q38 42 48 46" stroke="#881337" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
      '</g>' +
      '<circle cx="56" cy="34" r="6" fill="#fff" stroke="#881337" stroke-width="1.2"/>' +
      '<circle cx="57.5" cy="34.5" r="3" fill="#1e293b"/>' +
      '<circle cx="58.6" cy="33.1" r="1.3" fill="#fff"/>' +
      '<circle cx="70" cy="34" r="6" fill="#fff" stroke="#881337" stroke-width="1.2"/>' +
      '<circle cx="71.5" cy="34.5" r="3" fill="#1e293b"/>' +
      '<circle cx="72.6" cy="33.1" r="1.3" fill="#fff"/>' +
      '<path d="M49 25 L63 30 L62 33 L49 28 Z" fill="#1e293b"/>' +
      '<path d="M77 25 L63 30 L64 33 L77 28 Z" fill="#1e293b"/>' +
      '<path d="M76 40 L98 48 L76 46 Z" fill="#f97316"/>' +
      '<path d="M76 47 L94 50 L76 51 Z" fill="#1e293b"/>',
    enemyYellow:
      // fast bird: yellow body, orange belly, long pointed beak, swept-back wing
      '<g transform="rotate(-35 36 52)">' +
        '<ellipse cx="36" cy="52" rx="14" ry="7" fill="#f59e0b"/>' +
        '<path d="M26 46 Q36 40 46 44" stroke="#b45309" stroke-width="1.5" fill="none" stroke-linecap="round"/>' +
      '</g>' +
      '<ellipse cx="50" cy="50" rx="24" ry="21" fill="#facc15"/>' +
      '<ellipse cx="50" cy="50" rx="24" ry="21" fill="#fde047" opacity="0.35"/>' +
      '<ellipse cx="45" cy="59" rx="13" ry="8" fill="#f59e0b"/>' +
      '<circle cx="55" cy="36" r="5.5" fill="#fff" stroke="#b45309" stroke-width="1.2"/>' +
      '<circle cx="56.5" cy="36.5" r="2.8" fill="#1e293b"/>' +
      '<circle cx="57.6" cy="35.1" r="1.2" fill="#fff"/>' +
      '<circle cx="68" cy="36" r="5.5" fill="#fff" stroke="#b45309" stroke-width="1.2"/>' +
      '<circle cx="69.5" cy="36.5" r="2.8" fill="#1e293b"/>' +
      '<circle cx="70.6" cy="35.1" r="1.2" fill="#fff"/>' +
      '<path d="M48 28 L60 32 L59 35 L48 31 Z" fill="#1e293b"/>' +
      '<path d="M74 28 L62 32 L63 35 L74 31 Z" fill="#1e293b"/>' +
      '<path d="M72 42 L100 48 L72 50 Z" fill="#f97316"/>' +
      '<path d="M72 50 L96 52 L72 54 Z" fill="#ea580c"/>',
    enemyBlack:
      // bomb bird: charcoal body, white belly patch, fuse on top, stubby beak
      '<ellipse cx="50" cy="50" rx="26" ry="23" fill="#1f2937"/>' +
      '<ellipse cx="50" cy="50" rx="26" ry="23" fill="#374151" opacity="0.4"/>' +
      '<ellipse cx="44" cy="60" rx="14" ry="9" fill="#e5e7eb"/>' +
      '<g transform="rotate(-20 38 54)">' +
        '<ellipse cx="38" cy="54" rx="12" ry="8" fill="#111827"/>' +
        '<path d="M29 48 Q38 42 47 46" stroke="#4b5563" stroke-width="1.5" fill="none" stroke-linecap="round"/>' +
      '</g>' +
      '<circle cx="56" cy="34" r="5.5" fill="#fff" stroke="#111827" stroke-width="1.2"/>' +
      '<circle cx="57.5" cy="34.5" r="2.8" fill="#1e293b"/>' +
      '<circle cx="58.6" cy="33.1" r="1.2" fill="#fff"/>' +
      '<circle cx="69" cy="34" r="5.5" fill="#fff" stroke="#111827" stroke-width="1.2"/>' +
      '<circle cx="70.5" cy="34.5" r="2.8" fill="#1e293b"/>' +
      '<circle cx="71.6" cy="33.1" r="1.2" fill="#fff"/>' +
      '<path d="M49 26 L62 30 L61 33 L49 29 Z" fill="#111827"/>' +
      '<path d="M76 26 L63 30 L64 33 L76 29 Z" fill="#111827"/>' +
      '<path d="M74 42 L92 47 L74 49 Z" fill="#9ca3af"/>' +
      '<path d="M62 28 Q64 20 60 14" stroke="#d1d5db" stroke-width="2" fill="none" stroke-linecap="round"/>',
    enemyBigRed:
      // enormous red bird: same design, bulkier chest, bigger angrier brows
      '<path d="M24 48 L4 38 L22 54 Z" fill="#be123c"/>' +
      '<path d="M26 56 L8 62 L24 62 Z" fill="#9f1239"/>' +
      '<ellipse cx="50" cy="50" rx="32" ry="28" fill="#e11d48"/>' +
      '<ellipse cx="50" cy="50" rx="32" ry="28" fill="#f43f5e" opacity="0.35"/>' +
      '<ellipse cx="42" cy="62" rx="18" ry="11" fill="#be123c"/>' +
      '<g transform="rotate(-20 36 56)">' +
        '<ellipse cx="36" cy="56" rx="15" ry="10" fill="#be123c"/>' +
        '<path d="M24 48 Q36 40 48 46" stroke="#881337" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      '</g>' +
      '<circle cx="55" cy="32" r="7" fill="#fff" stroke="#881337" stroke-width="1.4"/>' +
      '<circle cx="56.5" cy="32.5" r="3.5" fill="#1e293b"/>' +
      '<circle cx="58" cy="30.8" r="1.5" fill="#fff"/>' +
      '<circle cx="71" cy="32" r="7" fill="#fff" stroke="#881337" stroke-width="1.4"/>' +
      '<circle cx="72.5" cy="32.5" r="3.5" fill="#1e293b"/>' +
      '<circle cx="74" cy="30.8" r="1.5" fill="#fff"/>' +
      '<path d="M46 20 L64 27 L63 31 L46 24 Z" fill="#1e293b"/>' +
      '<path d="M80 20 L62 27 L63 31 L80 24 Z" fill="#1e293b"/>' +
      '<path d="M76 40 L99 50 L76 47 Z" fill="#f97316"/>' +
      '<path d="M76 48 L95 52 L76 53 Z" fill="#1e293b"/>',
    coinSprite:
      '<defs><radialGradient id="cg" cx="40%" cy="35%" r="70%">' +
        '<stop offset="0" stop-color="#fefce8"/><stop offset="0.5" stop-color="#fbbf24"/>' +
        '<stop offset="1" stop-color="#d97706"/></radialGradient></defs>' +
      '<circle cx="50" cy="50" r="42" fill="url(#cg)" stroke="#b45309" stroke-width="4"/>' +
      '<circle cx="50" cy="50" r="30" fill="none" stroke="#b45309" stroke-width="3"/>' +
      '<path d="M50 30 L54 44 L68 44 L57 53 L61 67 L50 58 L39 67 L43 53 L32 44 L46 44 Z" fill="#b45309"/>',
    planet:
      '<defs><radialGradient id="pg" cx="35%" cy="35%" r="75%">' +
        '<stop offset="0" stop-color="#c084fc"/><stop offset="0.6" stop-color="#7c3aed"/>' +
        '<stop offset="1" stop-color="#4c1d95"/></radialGradient></defs>' +
      '<circle cx="50" cy="50" r="40" fill="url(#pg)"/>' +
      '<path d="M18 42 A40 40 0 0 1 82 42" stroke="#f0abfc" stroke-width="5" fill="none" opacity="0.7"/>' +
      '<path d="M12 54 A40 40 0 0 1 88 54" stroke="#c4b5fd" stroke-width="5" fill="none" opacity="0.7"/>' +
      '<ellipse cx="50" cy="50" rx="64" ry="13" fill="none" stroke="#e9d5ff" stroke-width="5" transform="rotate(-18 50 50)"/>' +
      '<path d="M14 42 A64 13 0 0 0 86 42" stroke="#1e1b4b" stroke-width="5" fill="none" transform="rotate(-18 50 50)"/>',
  };
  for (const name in sprites) registerScenery(name, sprites[name]);
  done && done();
}

// ── Sound (Web Audio API) ────────────────────────────────────
let audioCtx;
function ensureAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playTone(freq, dur, type, vol) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type || 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol || 0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + dur);
}

const SFX = {
  flap() { playTone(600, 0.1, 'sine', 0.12); },
  score() { playTone(880, 0.15, 'sine', 0.1); setTimeout(() => playTone(1100, 0.15, 'sine', 0.1), 80); },
  hit() { playTone(200, 0.25, 'square', 0.15); },
  coin() { playTone(1320, 0.08, 'sine', 0.12); setTimeout(() => playTone(1760, 0.12, 'sine', 0.12), 70); },
};

// ── State Machine ────────────────────────────────────────────
let state = 'menu'; // menu | playing | gameover | shop
let score = 0;
let runCoins = 0;
let runCoinPickups = 0;
const COIN_VALUE = 5;
let bestScore = storage.best();
let totalCoins = storage.coins();

// ── Canvas Setup ─────────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resize() {
  const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  const vw = window.visualViewport ? window.visualViewport.width : window.innerWidth;
  canvas.width = vw * devicePixelRatio;
  canvas.height = vh * devicePixelRatio;
  canvas.style.width = vw + 'px';
  canvas.style.height = vh + 'px';
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
window.addEventListener('resize', resize);
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', resize);
}
resize();

const W = () => window.visualViewport ? window.visualViewport.width : window.innerWidth;
const H = () => window.visualViewport ? window.visualViewport.height : window.innerHeight;

// ── Bird State ───────────────────────────────────────────────
const GRAVITY = 0.45;
const FLAP_VEL = -7.5;
const BIRD_W = 40;
const BIRD_H = 32;
// Hitbox inset: the SVG bird (viewBox 0 0 100 70) has transparent padding
// around the art. Body ellipse (cx=50 cy=40 rx=27 ry=23) maps to ~21.6x21px
// at the 40x32 draw scale, centered ~(20, 18.3). A 26x22 box centered on
// the box center covers the body with ~2px side tolerance, most of the
// beak, and sits 1.8px above the body bottom (generous to the player).
const BIRD_HIT_W = 26;
const BIRD_HIT_H = 22;

let birdY, birdVel, birdRot;
function resetBird() {
  birdY = H() / 2 - BIRD_H / 2;
  birdVel = 0;
  birdRot = 0;
}

// ── Pipes ────────────────────────────────────────────────────
const PIPE_W = 56;
const PIPE_GAP = 150;
const PIPE_SPEED = 2.5;
const PIPE_SPACING = 220;

// Speed multiplier: +0.1% per 10 score, capped at 2x. Scales pipes,
// ground/parallax scroll and ambient timing together; bird physics
// intentionally NOT scaled.
const speedMult = () => Math.min(2, 1 + Math.floor(score / 10) * 0.001);

let pipes;
let pipeTimer;
function resetPipes() {
  pipes = [];
  pipeTimer = PIPE_SPACING;
}

function spawnPipe() {
  const GAP_CENTER_MIN = H() * 0.28;  // gap center never above 28% of screen height
  const GAP_CENTER_MAX = H() * 0.62;  // gap center never below 62%
  const centerY = GAP_CENTER_MIN + Math.random() * (GAP_CENTER_MAX - GAP_CENTER_MIN);
  let topH = centerY - PIPE_GAP / 2;
  // clamp so pipes keep a minimum wall (60px top wall, 60px bottom wall above the ground line at H()-50)
  topH = Math.max(60, Math.min(topH, H() - 50 - PIPE_GAP - 60));
  // 7-coin formation: center + left/right stacks of 3, all offset from gap
  // center. Coins are pipe-attached (absolute x = p.x + PIPE_W/2 + xOffset),
  // so they scroll and die with their pipe. STACK_Y=28 keeps coin edges
  // (r=11) within the 150px gap; STACK_X=46 keeps stacks clear of the pipe
  // body (PIPE_W/2 = 28, coin edge at 46-11 = 35 > 28).
  const STACK_X = 46, STACK_Y = 28;
  const coins = [];
  for (let i = 0; i < 7; i++) {
    const side = i === 0 ? 0 : (i < 4 ? -STACK_X : STACK_X);
    const stack = [-STACK_Y, 0, STACK_Y][(i - 1) % 3];
    coins.push({ xOffset: side, yOffset: i === 0 ? 0 : stack, collected: false, spin: 0, angle0: (i % 3) * 0.35 });
  }
  pipes.push({
    x: W(), topH, scored: false, coins,
  });
}

function updatePipes(dt) {
  pipeTimer -= PIPE_SPEED * dt * 60 * speedMult();
  if (pipeTimer <= 0) { spawnPipe(); pipeTimer = PIPE_SPACING; }
  for (const p of pipes) {
    p.x -= PIPE_SPEED * dt * 60 * speedMult();
    for (const c of p.coins) c.spin += dt * 2.4;
  }
  pipes = pipes.filter(p => p.x + PIPE_W > -10);
}

// ── Enemy Birds ──────────────────────────────────────────────
// Hostile birds: spawn once score >= 15, up to floor(score/15) alive
// (max 4). They fly through pipes (view-only) and kill on touch.
// Types unlock by score; each has its own sprite, size, speed and radius.
const ENEMY_TYPES = {
  red:    { sprite: 'enemyRed',    size: 34, speed: 1,   radius: 12, minScore: 15, weight: 40 },
  yellow: { sprite: 'enemyYellow', size: 28, speed: 2.2, radius: 10, minScore: 25, weight: 30 },
  black:  { sprite: 'enemyBlack',  size: 34, speed: 1,   radius: 12, minScore: 35, weight: 20 },
  bigred: { sprite: 'enemyBigRed', size: 85, speed: 1,   radius: 30, minScore: 50, weight: 10 },
};

let enemies = [];
let enemyTimer = 0;
let explosions = [];

function resetEnemies() {
  enemies = [];
  explosions = [];
  enemyTimer = 0;
}

function spawnEnemy() {
  // weighted pick among types whose minScore is reached
  const pool = Object.keys(ENEMY_TYPES).filter(t => score >= ENEMY_TYPES[t].minScore);
  if (!pool.length) return; // ponytail: no eligible type yet
  let total = 0;
  for (const t of pool) total += ENEMY_TYPES[t].weight;
  let roll = Math.random() * total;
  let type = pool[0];
  for (const t of pool) {
    roll -= ENEMY_TYPES[t].weight;
    if (roll <= 0) { type = t; break; }
  }
  const def = ENEMY_TYPES[type];
  enemies.push({
    type,
    x: W() + 30,
    y: H() * (0.3 + Math.random() * 0.4),
    phase: Math.random() * Math.PI * 2,
    size: def.size,
    speed: def.speed,
    radius: def.radius,
    fuse: type === 'black' ? 2.5 + Math.random() : 0, // black: detonate 2.5-3.5s after spawn
  });
}

function updateEnemies(dt) {
  const maxAlive = Math.min(6, Math.floor(score / 15));
  if (score >= 15 && enemies.length < maxAlive) {
    enemyTimer -= dt;
    if (enemyTimer <= 0) {
      spawnEnemy();
      const baseTimer = 2.5 + Math.random() * 2;
      const accel = Math.max(0.5, 1 - score * 0.005);
      enemyTimer = baseTimer * accel;
    }
  } else if (score >= 15) {
    // cap full: keep timer fresh so it doesn't resume stale when a slot frees
    const baseTimer = 2.5 + Math.random() * 2;
    const accel = Math.max(0.5, 1 - score * 0.005);
    enemyTimer = baseTimer * accel;
  }
  for (const e of enemies) {
    e.x -= (PIPE_SPEED * 60 * speedMult() * 0.9 + 30) * e.speed * dt;
    e.y += Math.sin(gameTime * 2.5 + e.phase) * 45 * dt;
    if (e.type === 'black') {
      e.fuse -= dt;
      if (e.fuse <= 0) {
        explosions.push({ x: e.x, y: e.y, t: 0, maxR: 45 });
        e.dead = true;
      }
    }
  }
  enemies = enemies.filter(e => !e.dead && e.x > -60);
  for (const ex of explosions) ex.t += dt;
  explosions = explosions.filter(ex => ex.t <= 0.4);
}

// ── Background Parallax ──────────────────────────────────────
let bgOffset = 0;
let groundOffset = 0;

// Deterministic pseudo-random for stable star/parallax placement
function seeded(i, salt) { return (Math.abs(42 * (i + 1) * (13 + salt * 7)) % 1000) / 1000; }

function drawSky(theme) {
  const w = W(), h = H();
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  if (theme.skyStops) {
    theme.sky.forEach((c, i) => skyGrad.addColorStop(theme.skyStops[i], c));
  } else {
    theme.sky.forEach((c, i) => skyGrad.addColorStop(i / (theme.sky.length - 1), c));
  }
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // sun (daylight themes)
  if (theme.sun) {
    const sw = 110;
    drawScenerySprite('sun', w * 0.78, h * 0.1, sw, sw);
  }

  // stars
  if (theme.stars > 0) {
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    for (let i = 0; i < theme.stars; i++) {
      const sx = ((42 * (i + 1) * 13) % 1000) / 1000 * w;
      const sy = ((42 * (i + 1) * 7) % 1000) / 1000 * h * 0.5;
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }
  }

  // nebula blobs (space)
  for (const p of theme.parallax) {
    if (p.kind === 'nebula') {
      const nx = (seeded(3, 1) * w - bgOffset * p.factor) % (w + 300) - 150;
      const ny = seeded(4, 2) * h * 0.4;
      const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, 220);
      g.addColorStop(0, p.color + '55');
      g.addColorStop(1, p.color + '00');
      ctx.fillStyle = g;
      ctx.fillRect(nx - 220, ny - 220, 440, 440);
    }
  }
}

function drawScenerySprite(name, x, y, w, h, rot, flip, targetCtx) {
  const img = scenerySprites[name];
  const c = targetCtx || ctx;
  if (img && img.complete && img.naturalWidth > 0) {
    if (rot || flip) {
      c.save();
      c.translate(x + w / 2, y + h / 2);
      c.rotate(rot || 0);
      if (flip) c.scale(-1, 1);
      c.drawImage(img, -w / 2, -h / 2, w, h);
      c.restore();
    } else {
      c.drawImage(img, x, y, w, h);
    }
  }
}

function drawParallax(theme) {
  const w = W(), h = H();
  for (const p of theme.parallax) {
    // Tile-index tiling: x = i * step - scroll, where i is a STABLE
    // integer per tile. Seeded() values are keyed on i, so they never
    // change between frames; sprites drift by exactly the scroll delta
    // and the wrap is seamless (new tiles enter offscreen-left).
    const scroll = bgOffset * p.factor;
    if (p.kind === 'trees') {
      const step = p.sparse ? 220 : 110;
      const tw = p.sparse ? 90 : 60;
      for (let i = Math.floor(scroll / step) - 1; i * step - scroll < w + step; i++) {
        const x = i * step - scroll;
        const jx = x + seeded(i, 11) * 30 - 15;
        drawScenerySprite(p.sprite, jx, h * p.y - tw, tw, tw * 1.4);
      }
    } else if (p.kind === 'buildings') {
      const step = 130;
      const variants = p.sprite || ['building1', 'building2', 'building3'];
      for (let i = Math.floor(scroll / step) - 1; i * step - scroll < w + step; i++) {
        const x = i * step - scroll;
        const pick = variants[Math.floor(seeded(i, 7) * variants.length)];
        const bw = 90 + seeded(i, 6) * 30;
        const bh = 130 + seeded(i, 8) * 110;
        ctx.globalAlpha = p.dark ? 0.75 : 1;
        drawScenerySprite(pick, x, h * p.y - bh, bw, bh);
        ctx.globalAlpha = 1;
      }
    } else if (p.kind === 'planet') {
      const px = (w * 0.75 - bgOffset * p.factor) % (w + 400) - 200;
      const py = h * p.y;
      const ps = p.sprite === 'planet' ? 130 : 110;
      drawScenerySprite(p.sprite || 'planet', px - ps / 2, py - ps / 2, ps, ps);
    } else if (p.kind === 'moon') {
      // small cratered moon in the upper left, slower drift
      const mx = (w * 0.2 - bgOffset * p.factor) % (w + 400) - 200;
      drawScenerySprite(p.sprite, mx - 28, h * p.y - 28, 56, 56);
    }
  }
}

function drawGround(theme) {
  const w = W(), h = H();
  const groundY = h - 50;
  const g = theme.ground;
  const step = 30;

  // base surface
  ctx.fillStyle = g.bottom;
  ctx.fillRect(0, groundY, w, 50);

  if (g.pattern === 'grass') {
    // bright grass strip with rounded blades, dirt below
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(0, groundY, w, 8);
    ctx.fillStyle = '#65a30d';
    ctx.fillRect(0, groundY + 8, w, 4);
    ctx.fillStyle = g.bottom;
    ctx.fillRect(0, groundY + 12, w, 38);
    // grass blade tufts
    ctx.fillStyle = '#84cc16';
    for (let gx = -step + -(groundOffset % step); gx < w + step; gx += step) {
      ctx.beginPath();
      ctx.moveTo(gx, groundY);
      ctx.lineTo(gx + 4, groundY - 6);
      ctx.lineTo(gx + 8, groundY);
      ctx.closePath();
      ctx.fill();
    }
    // dirt speckles
    ctx.fillStyle = '#a16207';
    for (let gx = -step + -(groundOffset % (step * 2)); gx < w + step; gx += step * 2) {
      ctx.fillRect(gx + 4, groundY + 22, 5, 3);
      ctx.fillRect(gx + 16, groundY + 34, 4, 3);
    }
  } else if (g.pattern === 'forest') {
    // dirt band with grass tufts on top + roots
    ctx.fillStyle = '#713f12';
    ctx.fillRect(0, groundY, w, 50);
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(0, groundY, w, 4);
    ctx.fillStyle = '#65a30d';
    for (let gx = -step + -(groundOffset % step); gx < w + step; gx += step) {
      ctx.beginPath();
      ctx.moveTo(gx, groundY);
      ctx.lineTo(gx + 3, groundY - 5);
      ctx.lineTo(gx + 6, groundY);
      ctx.closePath();
      ctx.fill();
    }
    // exposed roots
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 3;
    for (let gx = -step * 2 + -(groundOffset % (step * 2)); gx < w + step * 2; gx += step * 2) {
      ctx.beginPath();
      ctx.moveTo(gx, groundY + 6);
      ctx.quadraticCurveTo(gx + 8, groundY + 14, gx + 14, groundY + 8);
      ctx.stroke();
    }
    // mushrooms + flowers + bushes
    for (let i = Math.floor(groundOffset / (step * 3)) - 1; i * step * 3 - groundOffset < w + step * 3; i++) {
      const gx = i * step * 3 - groundOffset;
      const roll = seeded(i, 4);
      if (roll > 0.75) {
        drawScenerySprite('mushroom', gx, groundY - 14, 16, 16);
      } else if (roll > 0.6) {
        drawScenerySprite('flower', gx + 6, groundY - 12, 12, 12);
      } else if (roll > 0.45) {
        drawScenerySprite('bush', gx - 10, groundY - 16, 28, 18);
      }
    }
  } else if (g.pattern === 'lane') {
    // asphalt: dark base, curb strip, center dashes, edge lines
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, groundY, w, 50);
    // curb
    ctx.fillStyle = '#6b7280';
    ctx.fillRect(0, groundY, w, 5);
    ctx.fillStyle = '#9ca3af';
    ctx.fillRect(0, groundY, w, 2);
    // lane dashes (yellow center)
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.setLineDash([18, 14]);
    ctx.beginPath();
    ctx.moveTo(-(groundOffset % 32), groundY + 25);
    ctx.lineTo(w, groundY + 25);
    ctx.stroke();
    ctx.setLineDash([]);
    // white edge lines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY + 8);
    ctx.lineTo(w, groundY + 8);
    ctx.moveTo(0, groundY + 42);
    ctx.lineTo(w, groundY + 42);
    ctx.stroke();
    // road texture speckles
    ctx.fillStyle = '#374151';
    for (let gx = -step + -(groundOffset % step); gx < w + step; gx += step) {
      ctx.fillRect(gx, groundY + 13, 4, 2);
      ctx.fillRect(gx + 8, groundY + 33, 3, 2);
    }
    // roadside hazard markers
    ctx.fillStyle = '#f87171';
    for (let gx = -step * 2 + -(groundOffset % (step * 2)); gx < w + step * 2; gx += step * 2) {
      ctx.fillRect(gx, groundY - 4, 4, 4);
    }
  } else if (g.pattern === 'rock') {
    // lunar surface: gray with crater ellipses + rocks
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, groundY, w, 50);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, groundY, w, 2);
    // craters
    for (let i = Math.floor(groundOffset / (step * 2)) - 1; i * step * 2 - groundOffset < w + step * 2; i++) {
      const gx = i * step * 2 - groundOffset;
      const r = 6 + seeded(i, 6) * 5;
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.ellipse(gx, groundY + 18 + seeded(i, 7) * 14, r, r * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(gx + 1, groundY + 17 + seeded(i, 7) * 14, r, r * 0.55, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
    }
    // rocks
    for (let i = Math.floor(groundOffset / (step * 3)) - 1; i * step * 3 - groundOffset < w + step * 3; i++) {
      const gx = i * step * 3 - groundOffset;
      if (seeded(i, 8) > 0.5) drawScenerySprite('rock', gx, groundY - 8, 20, 20);
    }
  }
}

// ── Ambient Decor (view-only, no collision) ─────────────────
let ambientItems = [];
let ambientTimers = {};

function resetAmbient() {
  ambientItems = [];
  ambientTimers = {};
}

function spawnAmbient(type, theme) {
  const w = W(), h = H();
  const item = { type, x: w + 20, y: 0, vx: 0, vy: 0, t: 0, seed: Math.random() };
  if (type === 'leaf') {
    item.y = Math.random() * h * 0.6;
    item.vy = 30 + Math.random() * 40;
    item.vx = -(defSpeed(type, theme, 20) + Math.random() * 20);
    item.color = ['#4d7c0f', '#a16207', '#b91c1c'][Math.floor(Math.random() * 3)];
  } else if (type === 'firefly') {
    item.y = Math.random() * h * 0.7;
    item.vy = -10 - Math.random() * 15;
    item.vx = -(defSpeed(type, theme, 15) + Math.random() * 20);
  } else if (type === 'cloud') {
    item.y = Math.random() * h * 0.3;
    item.vx = -(defSpeed(type, theme, 14) + Math.random() * 10);
    item.scale = 0.6 + Math.random() * 0.8;
  } else if (type === 'car') {
    // wheels rest on the asphalt surface (ground band top at H()-50)
    item.y = H() - 61;
    item.vx = -defSpeed(type, theme, 100);
    item.color = ['#ef4444', '#3b82f6'][Math.floor(Math.random() * 2)];
  } else if (type === 'streetlight') {
    item.y = H() - 50;
    item.vx = -defSpeed(type, theme, PIPE_SPEED * 60);
  } else if (type === 'comet') {
    item.y = Math.random() * h * 0.5;
    item.vx = -(defSpeed(type, theme, 500) + Math.random() * 200);
    item.vy = 60 + Math.random() * 80;
  } else if (type === 'ship') {
    item.y = Math.random() * h * 0.5;
    item.vx = -(defSpeed(type, theme, 80) + Math.random() * 80);
    item.vy = (Math.random() - 0.5) * 20;
    item.kind = Math.random() > 0.5 ? 'ship' : 'ufo';
  } else if (type === 'asteroid') {
    item.y = Math.random() * h * 0.6;
    item.vx = -(defSpeed(type, theme, 160) + Math.random() * 60);
    item.vy = 40 + Math.random() * 60;
    item.size = 26 + Math.random() * 22;
  } else if (type === 'shootingstar') {
    item.y = Math.random() * h * 0.3;
    item.vx = -(defSpeed(type, theme, 900) + Math.random() * 300);
    item.vy = 200 + Math.random() * 150;
  }
  ambientItems.push(item);
}

function defSpeed(type, theme, fallback) {
  const def = theme.ambient.find(a => a.type === type);
  return def && def.speed ? def.speed : fallback;
}

function updateAmbient(dt, theme) {
  for (const def of theme.ambient) {
    ambientTimers[def.type] = (ambientTimers[def.type] || 0) - dt * speedMult();
    if (ambientTimers[def.type] <= 0) {
      ambientTimers[def.type] = def.spawnEvery;
      spawnAmbient(def.type, theme);
    }
  }
  for (const it of ambientItems) {
    it.t += dt;
    it.x += it.vx * dt * speedMult();
    it.y += it.vy * dt * speedMult();
    if (it.type === 'leaf') it.x += Math.sin(it.t * 3 + it.seed * 6) * 20 * dt; // sway
    if (it.type === 'firefly') it.y += Math.sin(it.t * 2 + it.seed * 6) * 10 * dt;
    if (it.kind === 'ufo') it.y += Math.sin(it.t * 2.5) * 18 * dt; // wobble
  }
  ambientItems = ambientItems.filter(it => it.x > -60 && it.y > -60 && it.y < H() + 60);
}

function drawAmbient(theme) {
  for (const it of ambientItems) {
    if (it.type === 'leaf') {
      ctx.fillStyle = it.color;
      ctx.save();
      ctx.translate(it.x, it.y);
      ctx.rotate(it.t * 4 + it.seed * 6);
      ctx.fillRect(-3, -2, 6, 4);
      ctx.restore();
    } else if (it.type === 'firefly') {
      // glow sprite: radial dot with soft halo, pulsing opacity
      const glow = 0.5 + 0.5 * Math.abs(Math.sin(it.t * 3));
      ctx.globalAlpha = glow;
      drawScenerySprite('firefly', it.x - 8, it.y - 8, 16, 16);
      ctx.globalAlpha = 1;
    } else if (it.type === 'cloud') {
      const s = 70 * it.scale;
      ctx.globalAlpha = 0.85;
      drawScenerySprite('cloud', it.x - s / 2, it.y - s / 3, s, s * 0.6);
      ctx.globalAlpha = 1;
    } else if (it.type === 'car') {
      drawScenerySprite(it.color === '#3b82f6' ? 'carBlue' : 'car', it.x - 16, it.y - 12, 36, 24);
    } else if (it.type === 'streetlight') {
      drawScenerySprite('streetlight', it.x, it.y - 90, 44, 90);
    } else if (it.type === 'comet') {
      // sprite head (bottom-left) leads the flight path; align head to (x,y)
      drawScenerySprite('comet', it.x - 16, it.y - 29, 56, 40);
    } else if (it.type === 'ship') {
      if (it.kind === 'ufo') {
        const wob = Math.sin(it.t * 2.5 + it.seed * 6) * 0.12;
        drawScenerySprite('ufo', it.x - 28, it.y - 16, 56, 32, wob);
      } else {
        drawScenerySprite('ship', it.x - 26, it.y - 18, 52, 36, Math.sin(it.t * 1.5 + it.seed * 6) * 0.2);
      }
    } else if (it.type === 'asteroid') {
      // tumbling rock
      drawScenerySprite('asteroid', it.x - it.size / 2, it.y - it.size / 2, it.size, it.size, it.t * 1.6 + it.seed * 6);
    } else if (it.type === 'shootingstar') {
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(it.x, it.y);
      ctx.lineTo(it.x - 40, it.y - 20);
      ctx.stroke();
    }
  }
}

function drawBackground() {
  const theme = getScenery(storage.sEquipped()).theme;
  drawSky(theme);
  drawParallax(theme);
  drawGround(theme);
  drawAmbient(theme);
}

// ── Draw Pipes ───────────────────────────────────────────────
function drawPipes() {
  const h = H();
  const theme = getScenery(storage.sEquipped()).theme;
  const pc = theme.pipe;
  for (const p of pipes) {
    // coin formation in the gap (drawn first so pipes overlap its edges)
    for (const c of p.coins) {
      if (!c.collected) drawCoin(p.x + PIPE_W / 2 + c.xOffset, p.topH + PIPE_GAP / 2 + c.yOffset, c.spin + c.angle0);
    }
    // top pipe
    ctx.fillStyle = pc.body;
    ctx.fillRect(p.x, 0, PIPE_W, p.topH);
    ctx.fillStyle = pc.bodyLight;
    ctx.fillRect(p.x + 4, 0, PIPE_W - 8, p.topH);
    // top cap
    drawPipeCap(p.x, p.topH - 20, pc);

    // bottom pipe
    const botY = p.topH + PIPE_GAP;
    ctx.fillStyle = pc.body;
    ctx.fillRect(p.x, botY, PIPE_W, h - botY - 50);
    ctx.fillStyle = pc.bodyLight;
    ctx.fillRect(p.x + 4, botY, PIPE_W - 8, h - botY - 50);
    // bottom cap
    drawPipeCap(p.x, botY, pc);
  }
}

// Spinning gold coin: cos-driven horizontal squash gives the classic spin
// illusion. Near cos=1 (facing viewer) the full coin face shows with a
// moving white shine; near 0 (edge-on) it collapses to a thin gold line.
// Soft radial glow + subtle scale breathing behind.
function drawCoin(x, y, angle) {
  const r = 11;
  const ca = Math.cos(angle);
  const w = Math.max(2, r * 2 * Math.abs(ca)); // 2px edge-on, full face at cos=1
  const scale = 0.92 + 0.08 * Math.sin(angle * 2); // subtle breathing
  const hr = r * scale;
  const glow = ctx.createRadialGradient(x, y, 0, x, y, hr * 2.6);
  glow.addColorStop(0, 'rgba(253,224,71,0.35)');
  glow.addColorStop(1, 'rgba(253,224,71,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, hr * 2.6, 0, Math.PI * 2);
  ctx.fill();
  if (w <= 3) {
    // edge-on: thin gold line
    ctx.fillStyle = '#eab308';
    ctx.fillRect(x - w / 2, y - hr, w, hr * 2);
    return;
  }
  drawScenerySprite('coinSprite', x - w / 2, y - hr, w, hr * 2);
  // shine arc follows the spin: offset drifts with the coin's facing
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(x + Math.cos(angle) * 2.5, y - hr * 0.35, w * 0.34, hr * 0.28, 0, Math.PI, Math.PI * 2);
  ctx.stroke();
}

// ── Draw Enemies ────────────────────────────────────────────
function drawEnemies() {
  for (const e of enemies) {
    const sway = Math.sin(gameTime * 2.5 + e.phase);
    drawScenerySprite(ENEMY_TYPES[e.type].sprite, e.x - e.size / 2, e.y - e.size / 2, e.size, e.size, sway * 0.25, true);
    // black bird fuse spark: flickers to telegraph the detonation
    if (e.type === 'black') {
      const a = 0.5 + 0.5 * Math.sin(gameTime * 30);
      ctx.globalAlpha = a;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(e.x + e.size * 0.12, e.y - e.size * 0.5, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
  // explosions: expanding ring + white-core/orange radial gradient
  for (const ex of explosions) {
    const k = ex.t / 0.4;
    const r = ex.maxR * k;
    const g = ctx.createRadialGradient(ex.x, ex.y, 0, ex.x, ex.y, r);
    g.addColorStop(0, 'rgba(255,255,255,0.95)');
    g.addColorStop(0.35, 'rgba(251,146,60,0.9)');
    g.addColorStop(1, 'rgba(249,115,22,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(ex.x, ex.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,' + (0.9 * (1 - k)) + ')';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(ex.x, ex.y, r, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawPipeCap(x, y, pc) {
  const capH = 20;
  if (pc.style === 'plain') {
    ctx.fillStyle = pc.cap;
    ctx.fillRect(x - 4, y, PIPE_W + 8, capH);
  } else if (pc.style === 'trunk') {
    // darker rings on the body above the cap
    ctx.fillStyle = '#5b3410';
    ctx.fillRect(x, y, PIPE_W, 4);
    ctx.fillRect(x, y + 8, PIPE_W, 3);
    // leaf cap kept INSIDE the pipe width so it never overhangs the
    // collision edge
    ctx.fillStyle = pc.cap;
    ctx.fillRect(x, y - 4, PIPE_W, capH);
    ctx.fillStyle = '#65a30d';
    ctx.beginPath();
    ctx.arc(x + 7, y - 4, 7, 0, Math.PI * 2);
    ctx.arc(x + PIPE_W - 7, y - 4, 7, 0, Math.PI * 2);
    ctx.fill();
  } else if (pc.style === 'hazard') {
    ctx.fillStyle = pc.cap;
    ctx.fillRect(x - 4, y, PIPE_W + 8, capH);
    // yellow/black diagonal stripes as alternating triangles
    ctx.fillStyle = '#111827';
    for (let sx = x - 4; sx < x + PIPE_W + 8; sx += 12) {
      ctx.beginPath();
      ctx.moveTo(sx, y);
      ctx.lineTo(sx + 6, y);
      ctx.lineTo(sx, y + capH);
      ctx.closePath();
      ctx.fill();
    }
    // bolts
    ctx.fillStyle = '#1f2937';
    for (let bx = x + 8; bx < x + PIPE_W - 4; bx += 16) {
      ctx.beginPath();
      ctx.arc(bx, y - 8, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (pc.style === 'alien') {
    ctx.fillStyle = pc.cap;
    ctx.fillRect(x - 4, y, PIPE_W + 8, capH);
    // glowing cyan edge strips with a subtle sin-based pulse
    const pulse = 0.6 + 0.4 * Math.sin(gameTime * 4);
    ctx.fillStyle = 'rgba(34,211,238,' + pulse + ')';
    ctx.fillRect(x - 4, y, 3, capH);
    ctx.fillRect(x + PIPE_W + 1, y, 3, capH);
    // glowing dots
    ctx.fillStyle = 'rgba(34,211,238,' + (0.5 + 0.4 * pulse) + ')';
    for (let dx = x + 6; dx < x + PIPE_W - 4; dx += 14) {
      ctx.beginPath();
      ctx.arc(dx, y + capH / 2, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ── Collision Detection ──────────────────────────────────────
function checkCollision() {
  const h = H();
  const groundY = h - 50;
  // Hitbox centered on the bird center, inset to the visible art
  const cx = 80 + BIRD_W / 2, cy = birdY + BIRD_H / 2;
  const birdLeft = cx - BIRD_HIT_W / 2;
  const birdRight = cx + BIRD_HIT_W / 2;
  const birdTop = cy - BIRD_HIT_H / 2;
  const birdBottom = cy + BIRD_HIT_H / 2;

  // ground/ceiling
  if (birdBottom >= groundY || birdTop <= 0) return true;

  // pipes
  for (const p of pipes) {
    const pLeft = p.x;
    const pRight = p.x + PIPE_W;
    if (birdRight > pLeft && birdLeft < pRight) {
      if (birdTop < p.topH || birdBottom > p.topH + PIPE_GAP) return true;
    }
  }

  // enemy birds: per-type radius (red 12, yellow 10, black 12, bigred 30)
  for (const e of enemies) {
    const dx = cx - e.x, dy = cy - e.y;
    if (dx * dx + dy * dy < e.radius * e.radius) return true;
  }
  // explosions: expanding circle, radius 45 * (t/0.4)
  for (const ex of explosions) {
    const dx = cx - ex.x, dy = cy - ex.y;
    const r = 45 * (ex.t / 0.4);
    if (dx * dx + dy * dy < r * r) return true;
  }
  return false;
}

// ── Coin Collection ──────────────────────────────────────────
function checkCoins() {
  const birdCX = 80 + BIRD_W / 2;
  const birdCY = birdY + BIRD_H / 2;
  for (const p of pipes) {
    for (const c of p.coins) {
      if (c.collected) continue;
      const cx = p.x + PIPE_W / 2 + c.xOffset;
      const cy = p.topH + PIPE_GAP / 2 + c.yOffset;
      if (Math.abs(cx - birdCX) < 20 && Math.abs(cy - birdCY) < 20) {
        c.collected = true;
        runCoinPickups++;
        totalCoins += COIN_VALUE;
        storage.saveCoins(totalCoins);
        SFX.coin();
      }
    }
  }
}

// ── Score Check ──────────────────────────────────────────────
function checkScore() {
  const birdCX = 80 + BIRD_W / 2;
  for (const p of pipes) {
    if (!p.scored && p.x + PIPE_W < birdCX) {
      p.scored = true;
      score++;
      SFX.score();
    }
  }
}

// ── Update Game ──────────────────────────────────────────────
let lastTime = 0;
let gameTime = 0;

function updateGame(timestamp) {
  const dt = lastTime ? Math.min((timestamp - lastTime) / 1000, 0.05) : 0.016;
  lastTime = timestamp;
  gameTime += dt;

  if (state !== 'playing') {
    // Demo mode (menu / gameover / shop): live scrolling scenery with the
    // equipped theme's ambient decor and a gently bobbing equipped bird.
    // No pipes, no enemies, no score, no collision.
    groundOffset += PIPE_SPEED * dt * 60;
    bgOffset += PIPE_SPEED * dt * 60;
    const theme = getScenery(storage.sEquipped()).theme;
    updateAmbient(dt, theme);
    drawBackground();
    const bird = getBird(storage.equipped());
    const bob = Math.sin(gameTime * 15) * 1.5;
    ctx.save();
    ctx.translate(W() * 0.3, H() * 0.45 + Math.sin(gameTime * 2.2) * H() * 0.06 + bob);
    ctx.rotate(Math.cos(gameTime * 2.2) * 0.15);
    drawSpriteTo(ctx, bird, -BIRD_W / 2, -BIRD_H / 2, BIRD_W, BIRD_H);
    ctx.restore();
  } else {
    // bird physics (dt-scaled to match 60fps baseline like pipes/ground)
    birdVel += GRAVITY * dt * 60;
    birdY += birdVel * dt * 60;

    // bird rotation
    if (birdVel < 0) birdRot = Math.max(-0.5, birdVel * 0.06);
    else birdRot = Math.min(1.2, birdVel * 0.08);

    // pipes
    updatePipes(dt);
    checkScore();
    checkCoins();

    // enemies
    updateEnemies(dt);

    // ground + parallax scroll
    groundOffset += PIPE_SPEED * dt * 60 * speedMult();
    bgOffset += PIPE_SPEED * dt * 60 * speedMult();

    // ambient decor
    const theme = getScenery(storage.sEquipped()).theme;
    updateAmbient(dt, theme);

    // collision
    if (checkCollision()) {
      SFX.hit();
      gameOver();
    } else {
      // draw
      drawBackground();
      drawPipes();
      drawEnemies();

      // draw bird
      const bird = getBird(storage.equipped());
      const bob = Math.sin(gameTime * 15) * 1.5;
      ctx.save();
      ctx.translate(80 + BIRD_W / 2, birdY + BIRD_H / 2 + bob);
      ctx.rotate(birdRot);
      drawSpriteTo(ctx, bird, -BIRD_W / 2, -BIRD_H / 2, BIRD_W, BIRD_H);
      ctx.restore();

      // score overlay
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(score, W() / 2, 56);
      ctx.fillStyle = '#fff';
      ctx.fillText(score, W() / 2, 54);

      // coin counter: real balance with a coin sprite (emoji doesn't render everywhere)
      const coinSize = 20;
      drawScenerySprite('coinSprite', 16, 30 - coinSize / 2, coinSize, coinSize);
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffd700';
      ctx.fillText(totalCoins, 16 + coinSize + 6, 30);
    }
  }

  requestAnimationFrame(updateGame);
}

// ── Game Over ────────────────────────────────────────────────
function gameOver() {
  state = 'gameover';
  runCoins = score + runCoinPickups * COIN_VALUE;
  totalCoins += score;
  storage.saveCoins(totalCoins);
  if (score > bestScore) {
    bestScore = score;
    storage.saveBest(bestScore);
  }
  document.getElementById('finalScore').textContent = score;
  document.getElementById('coinsEarned').textContent = runCoins;
  document.getElementById('totalCoins').textContent = totalCoins;
  if (window.Sync) window.Sync.submitRun(score, runCoinPickups);
  showScreen('gameOverScreen');
}

// ── Screen Management ────────────────────────────────────────
function showScreen(id) {
  ['startScreen', 'shopScreen', 'gameOverScreen'].forEach(s => {
    document.getElementById(s).style.display = s === id ? 'flex' : 'none';
  });
}

function startGame() {
  state = 'playing';
  score = 0;
  runCoins = 0;
  runCoinPickups = 0;
  lastTime = 0;
  gameTime = 0;
  groundOffset = 0;
  bgOffset = 0;
  resetBird();
  resetPipes();
  resetEnemies();
  resetAmbient();
  showScreen(null);
}

// ── Shop ─────────────────────────────────────────────────────
function buyItem(price, ownedKey, saveOwned, saveEquipped, id, refresh) {
  totalCoins -= price;
  storage.saveCoins(totalCoins);
  const o = storage[ownedKey]();
  o.push(id);
  storage[saveOwned](o);
  storage[saveEquipped](id);
  if (window.Sync) window.Sync.purchase(ownedKey === 'owned' ? 'bird' : 'scenery', id);
  refresh();
  updateCoinDisplays();
}

function buildShop() {
  const grid = document.getElementById('shopGrid');
  grid.innerHTML = '';
  const owned = storage.owned();
  const equipped = storage.equipped();

  for (const bird of BIRDS) {
    const card = document.createElement('div');
    card.className = 'shop-card' + (bird.id === equipped ? ' equipped' : '');

    const cvs = document.createElement('canvas');
    cvs.width = 120;
    cvs.height = 90;
    const c = cvs.getContext('2d');
    drawSpriteTo(c, bird, 10, 10, 100, 70);

    const name = document.createElement('div');
    name.className = 'bird-name';
    name.textContent = bird.name;

    card.appendChild(cvs);
    card.appendChild(name);

    if (bird.price === 0 || owned.includes(bird.id)) {
      const btn = document.createElement('button');
      btn.className = bird.id === equipped ? 'btn btn-equipped' : 'btn btn-equip';
      btn.textContent = bird.id === equipped ? 'Equipped' : 'Equip';
      if (bird.id !== equipped) {
        btn.onclick = () => { storage.saveEquipped(bird.id); buildShop(); updateStartPreview(); };
      }
      card.appendChild(btn);
    } else {
      const price = document.createElement('div');
      price.className = 'bird-price';
      price.textContent = '🪙 ' + bird.price;
      card.appendChild(price);

      const btn = document.createElement('button');
      btn.className = 'btn btn-buy';
      btn.textContent = totalCoins >= bird.price ? 'Buy' : 'Need more coins';
      btn.disabled = totalCoins < bird.price;
      if (totalCoins >= bird.price) {
        btn.onclick = () => {
          buyItem(bird.price, 'owned', 'saveOwned', 'saveEquipped', bird.id, () => { buildShop(); updateStartPreview(); });
        };
      }
      card.appendChild(btn);
    }

    grid.appendChild(card);
  }

  // ── Scenery section ────────────────────────────────────────
  const sceneryGrid = document.getElementById('sceneryGrid');
  sceneryGrid.innerHTML = '';
  const sOwned = storage.sOwned();
  const sEquipped = storage.sEquipped();

  for (const sc of SCENERIES) {
    const card = document.createElement('div');
    card.className = 'shop-card' + (sc.id === sEquipped ? ' equipped' : '');

    const cvs = document.createElement('canvas');
    cvs.width = 120;
    cvs.height = 70;
    const c = cvs.getContext('2d');
    drawSceneryPreview(c, sc);

    const name = document.createElement('div');
    name.className = 'bird-name';
    name.textContent = sc.name;

    card.appendChild(cvs);
    card.appendChild(name);

    if (sc.price === 0 || sOwned.includes(sc.id)) {
      const btn = document.createElement('button');
      btn.className = sc.id === sEquipped ? 'btn btn-equipped' : 'btn btn-equip';
      btn.textContent = sc.id === sEquipped ? 'Equipped' : 'Equip';
      if (sc.id !== sEquipped) {
        btn.onclick = () => { storage.saveSEquipped(sc.id); buildShop(); updateSceneryPreview(); };
      }
      card.appendChild(btn);
    } else {
      const price = document.createElement('div');
      price.className = 'bird-price';
      price.textContent = '🪙 ' + sc.price;
      card.appendChild(price);

      const btn = document.createElement('button');
      btn.className = 'btn btn-buy';
      btn.textContent = totalCoins >= sc.price ? 'Buy' : 'Need more coins';
      btn.disabled = totalCoins < sc.price;
      if (totalCoins >= sc.price) {
        btn.onclick = () => {
          buyItem(sc.price, 'sOwned', 'saveSOwned', 'saveSEquipped', sc.id, () => { buildShop(); updateSceneryPreview(); });
        };
      }
      card.appendChild(btn);
    }

    sceneryGrid.appendChild(card);
  }
}

// Mini preview: sky rect, one pipe slice, ground strip - enough to
// distinguish themes at a glance.
function drawSceneryPreview(c, sc) {
  const t = sc.theme;
  const skyGrad = c.createLinearGradient(0, 0, 0, 70);
  t.sky.forEach((col, i) => skyGrad.addColorStop(i / (t.sky.length - 1), col));
  c.fillStyle = skyGrad;
  c.fillRect(0, 0, 120, 70);

  // pipe slice
  c.fillStyle = t.pipe.body;
  c.fillRect(52, 8, 16, 40);
  c.fillStyle = t.pipe.bodyLight;
  c.fillRect(55, 8, 10, 40);
  c.fillStyle = t.pipe.cap;
  c.fillRect(48, 4, 24, 8);

  // ground strip
  c.fillStyle = t.ground.bottom;
  c.fillRect(0, 58, 120, 12);
  c.fillStyle = t.ground.top;
  c.fillRect(0, 58, 120, 4);
}

function updateCoinDisplays() {
  // Draw coin sprite on all coin icons
  document.querySelectorAll('.coin-icon').forEach(c => {
    const cc = c.getContext('2d');
    cc.clearRect(0, 0, 24, 24);
    drawScenerySprite('coinSprite', 0, 0, 24, 24, 0, false, cc);
  });
  document.getElementById('startCoins').textContent = totalCoins;
  document.getElementById('shopCoins').textContent = totalCoins;
}

function updateStartPreview() {
  const cvs = document.getElementById('birdPreview');
  const c = cvs.getContext('2d');
  c.clearRect(0, 0, 120, 90);
  const bird = getBird(storage.equipped());
  drawSpriteTo(c, bird, 10, 10, 100, 70);
}

// Mini live scenery preview for the start screen: sky + ground strip +
// one ambient element from the equipped theme. Re-renders on every equip.
function updateSceneryPreview() {
  const cvs = document.getElementById('sceneryPreview');
  if (!cvs) return;
  const c = cvs.getContext('2d');
  const sc = getScenery(storage.sEquipped());
  const t = sc.theme;
  c.clearRect(0, 0, 160, 90);

  // sky
  const skyGrad = c.createLinearGradient(0, 0, 0, 70);
  if (t.skyStops) t.sky.forEach((col, i) => skyGrad.addColorStop(t.skyStops[i], col));
  else t.sky.forEach((col, i) => skyGrad.addColorStop(i / (t.sky.length - 1), col));
  c.fillStyle = skyGrad;
  c.fillRect(0, 0, 160, 70);

  // ambient element (one, from the equipped theme)
  if (t.ambient && t.ambient[0]) {
    const type = t.ambient[0].type;
    if (type === 'cloud') drawScenerySprite('cloud', 100, 8, 42, 25, 0, false, c);
    else if (type === 'leaf') { c.fillStyle = '#b91c1c'; c.save(); c.translate(105, 20); c.rotate(0.4); c.fillRect(-3, -2, 6, 4); c.restore(); }
    else if (type === 'firefly') drawScenerySprite('firefly', 92, 10, 28, 28, 0, false, c);
    else if (type === 'car') drawScenerySprite('car', 88, 30, 44, 29, 0, false, c);
    else if (type === 'streetlight') drawScenerySprite('streetlight', 120, 16, 30, 60, 0, false, c);
    else if (type === 'comet') drawScenerySprite('comet', 92, 8, 36, 26, 0, false, c);
    else if (type === 'ship') drawScenerySprite('ship', 92, 10, 36, 25, 0, false, c);
    else if (type === 'shootingstar') { c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 2; c.beginPath(); c.moveTo(130, 8); c.lineTo(100, 22); c.stroke(); }
    else if (type === 'asteroid') drawScenerySprite('asteroid', 96, 10, 30, 30, 0, false, c);
  }

  // ground strip
  c.fillStyle = t.ground.bottom;
  c.fillRect(0, 58, 160, 12);
  c.fillStyle = t.ground.top;
  c.fillRect(0, 58, 160, 4);
}

// Arrow buttons cycle the equipped bird among owned birds. Exactly one
// source of truth: storage.equipped().
function showSelectorHint(msg) {
  const el = document.getElementById('selectorHint');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('show');
  void el.offsetWidth; // restart the fade animation
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2000);
}

function cycleBird(dir) {
  const owned = storage.owned();
  if (owned.length <= 1) { showSelectorHint('Only 1 bird — buy more in the Shop'); return; }
  const idx = owned.indexOf(storage.equipped());
  const cur = idx === -1 ? 0 : idx; // clamp: equipped not in owned
  const next = owned[(cur + dir + owned.length) % owned.length];
  storage.saveEquipped(next);
  updateStartPreview();
}

// Same for scenery: cycle owned scenery themes and equip them live.
function cycleScenery(dir) {
  const sOwned = storage.sOwned();
  if (sOwned.length <= 1) { showSelectorHint('Only 1 scenery — buy more in the Shop'); return; }
  const idx = sOwned.indexOf(storage.sEquipped());
  const cur = idx === -1 ? 0 : idx;
  const next = sOwned[(cur + dir + sOwned.length) % sOwned.length];
  storage.saveSEquipped(next);
  updateSceneryPreview();
}

document.getElementById('btnPrevBird').onclick = () => cycleBird(-1);
document.getElementById('btnNextBird').onclick = () => cycleBird(1);
document.getElementById('btnPrevScenery').onclick = () => cycleScenery(-1);
document.getElementById('btnNextScenery').onclick = () => cycleScenery(1);

// ── Leaderboard ──────────────────────────────────────────────
const lbPanel = document.getElementById('leaderboard');
const lbBody = document.getElementById('lbBody');

async function loadLeaderboard() {
  lbBody.textContent = 'Loading…';
  if (!window.Sync) { lbBody.textContent = 'Sign in to see the leaderboard'; return; }
  try {
    const res = await window.Sync.fetchLeaderboard();
    const rows = (res.list || []).slice(0, 10);
    if (!rows.length) { lbBody.textContent = 'No scores yet. Be the first!'; return; }
    lbBody.innerHTML = '';
    rows.forEach((r, i) => {
      const row = document.createElement('div');
      row.className = 'lb-row' + (r.user_id === res.currentUserId ? ' lb-you' : '');
      const rank = document.createElement('span');
      rank.className = 'lb-rank';
      rank.textContent = '#' + (i + 1);
      const name = document.createElement('span');
      name.className = 'lb-name';
      name.textContent = r.user_id === res.currentUserId ? 'You' : 'Player ' + (i + 1);
      const score = document.createElement('span');
      score.className = 'lb-score';
      score.textContent = r.best_score;
      row.appendChild(rank);
      row.appendChild(name);
      row.appendChild(score);
      lbBody.appendChild(row);
    });
    if (!res.currentUserId) {
      const hint = document.createElement('div');
      hint.style.cssText = 'text-align:center;color:#a5b4fc;font-size:0.8rem;margin-top:10px;';
      hint.textContent = 'Log in to compete!';
      lbBody.appendChild(hint);
    }
  } catch (e) {
    lbBody.textContent = 'Sign in to see the leaderboard';
  }
}

document.getElementById('btnScores').onclick = () => {
  lbPanel.style.display = 'flex';
  loadLeaderboard();
};
document.getElementById('btnScoresClose').onclick = () => { lbPanel.style.display = 'none'; };
// close on backdrop click (clicks inside the modal panel don't bubble to it)
lbPanel.addEventListener('click', e => { if (e.target === lbPanel) lbPanel.style.display = 'none'; });

// ── Event Handlers ───────────────────────────────────────────
function flap() {
  if (state !== 'playing') return;
  birdVel = FLAP_VEL;
  SFX.flap();
}

document.getElementById('btnPlay').onclick = () => { ensureAudio(); startGame(); };
document.getElementById('btnRestart').onclick = () => { ensureAudio(); startGame(); };
document.getElementById('btnShopFromStart').onclick = () => {
  state = 'shop';
  buildShop();
  updateCoinDisplays();
  showScreen('shopScreen');
};
document.getElementById('btnShopFromOver').onclick = () => {
  state = 'shop';
  buildShop();
  updateCoinDisplays();
  showScreen('shopScreen');
};
document.getElementById('btnBack').onclick = () => {
  state = 'menu';
  updateCoinDisplays();
  updateStartPreview();
  showScreen('startScreen');
};

// keyboard
document.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault();
    flap();
  }
});

// mouse/touch on canvas
canvas.addEventListener('mousedown', e => { e.preventDefault(); flap(); });
canvas.addEventListener('touchstart', e => { e.preventDefault(); flap(); }, { passive: false });

// ── Init ─────────────────────────────────────────────────────
// Images load asynchronously: init the UI only after all sprites are
// ready so shop cards and the preview render the real art.
loadBirdImages(() => {
  loadScenerySprites(() => {
    updateCoinDisplays();
    updateStartPreview();
    updateSceneryPreview();
    showScreen('startScreen');
    // The single rAF loop runs forever: it draws the live demo behind the
    // menu/gameover/shop overlays and the real game while playing.
    requestAnimationFrame(updateGame);
    if (window.Sync) window.Sync.init(); // restore refreshes coins/preview when done
  });
});
