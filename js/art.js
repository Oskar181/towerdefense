/* art.js — all game graphics, generated as SVG and rasterised once into canvases. */
(function () {
  'use strict';
  const TD = (window.TD = window.TD || {});
  const T = 48;
  TD.T = T;

  // ------------------------------------------------------------ helpers
  function rnd(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const uni = (r, a, b) => a + r() * (b - a);
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
  const f1 = (n) => Math.round(n * 10) / 10;

  function defs(p) {
    return `<defs>
<radialGradient id="${p}stone" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#b9bcc3"/><stop offset="1" stop-color="#7d818b"/></radialGradient>
<linearGradient id="${p}cyl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9ea3ac"/><stop offset="0.45" stop-color="#7d828c"/><stop offset="1" stop-color="#4a4e57"/></linearGradient>
<radialGradient id="${p}rock" cx="30%" cy="25%" r="85%"><stop offset="0" stop-color="#c4c2bc"/><stop offset="0.55" stop-color="#8f8d88"/><stop offset="1" stop-color="#5e5c58"/></radialGradient>
<radialGradient id="${p}rockd" cx="30%" cy="25%" r="85%"><stop offset="0" stop-color="#f0c48e"/><stop offset="0.55" stop-color="#c98d55"/><stop offset="1" stop-color="#8a5a2e"/></radialGradient>
<linearGradient id="${p}ice2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e4f6ff"/><stop offset="1" stop-color="#94c9e6"/></linearGradient>
<linearGradient id="${p}oasis" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fd0dc"/><stop offset="1" stop-color="#22798f"/></linearGradient>
<linearGradient id="${p}cactus" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8fcf6a"/><stop offset="0.5" stop-color="#5a9f42"/><stop offset="1" stop-color="#2f6b2a"/></linearGradient>
<linearGradient id="${p}water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4fa3d6"/><stop offset="1" stop-color="#2c6e9f"/></linearGradient>
<radialGradient id="${p}canopy" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#5fae4c"/><stop offset="0.6" stop-color="#3a8636"/><stop offset="1" stop-color="#245a24"/></radialGradient>
<radialGradient id="${p}canopy2" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#7cbf55"/><stop offset="0.6" stop-color="#4e9a3a"/><stop offset="1" stop-color="#2e6a28"/></radialGradient>
<radialGradient id="${p}metal" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#8d95a3"/><stop offset="1" stop-color="#2c313a"/></radialGradient>
<radialGradient id="${p}teal" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#7fdcb0"/><stop offset="1" stop-color="#2a7a57"/></radialGradient>
<linearGradient id="${p}ice" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6f7ff"/><stop offset="0.5" stop-color="#8fd0f2"/><stop offset="1" stop-color="#3f8fc4"/></linearGradient>
<radialGradient id="${p}iceglow"><stop offset="0" stop-color="#bfeaff" stop-opacity="0.7"/><stop offset="1" stop-color="#bfeaff" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}foe" cx="35%" cy="28%" r="80%"><stop offset="0" stop-color="#ff9a86"/><stop offset="0.55" stop-color="#e0574c"/><stop offset="1" stop-color="#9c2f2a"/></radialGradient>
<radialGradient id="${p}foe2" cx="35%" cy="28%" r="80%"><stop offset="0" stop-color="#d98d7a"/><stop offset="0.55" stop-color="#a8443f"/><stop offset="1" stop-color="#5e1f1c"/></radialGradient>
<radialGradient id="${p}foe3" cx="35%" cy="28%" r="80%"><stop offset="0" stop-color="#ffe08a"/><stop offset="0.55" stop-color="#f0a531"/><stop offset="1" stop-color="#a5600f"/></radialGradient>
<radialGradient id="${p}foe4" cx="35%" cy="28%" r="80%"><stop offset="0" stop-color="#d7a0ff"/><stop offset="0.55" stop-color="#8a3fc4"/><stop offset="1" stop-color="#3f1366"/></radialGradient>
<radialGradient id="${p}foe5" cx="35%" cy="28%" r="80%"><stop offset="0" stop-color="#d8ffb0" stop-opacity="0.95"/><stop offset="0.55" stop-color="#7fd14a" stop-opacity="0.9"/><stop offset="1" stop-color="#3c7a1c" stop-opacity="0.95"/></radialGradient>
<radialGradient id="${p}foe6" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#ffffff"/><stop offset="0.6" stop-color="#d6e6ff"/><stop offset="1" stop-color="#8aa6d6"/></radialGradient>
<radialGradient id="${p}foe7" cx="35%" cy="28%" r="80%"><stop offset="0" stop-color="#c9a6e8"/><stop offset="0.55" stop-color="#6e4a99"/><stop offset="1" stop-color="#33204d"/></radialGradient>
<radialGradient id="${p}foe8" cx="35%" cy="28%" r="80%"><stop offset="0" stop-color="#b8f0e6"/><stop offset="0.55" stop-color="#3fb39e"/><stop offset="1" stop-color="#1c5f53"/></radialGradient>
<radialGradient id="${p}orb"><stop offset="0" stop-color="#ffffff"/><stop offset="0.35" stop-color="#fff3a0"/><stop offset="1" stop-color="#f2b544" stop-opacity="0"/></radialGradient>
<linearGradient id="${p}copper" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f0b27a"/><stop offset="0.5" stop-color="#c47a3c"/><stop offset="1" stop-color="#7a4318"/></linearGradient>
<linearGradient id="${p}wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a87447"/><stop offset="1" stop-color="#5e3b1c"/></linearGradient>
<radialGradient id="${p}bat" cx="35%" cy="28%" r="80%"><stop offset="0" stop-color="#9c8ab8"/><stop offset="1" stop-color="#3a2d52"/></radialGradient>
<radialGradient id="${p}steel" cx="35%" cy="28%" r="80%"><stop offset="0" stop-color="#a9c2e0"/><stop offset="0.55" stop-color="#5d7aa6"/><stop offset="1" stop-color="#2c3f61"/></radialGradient>
<radialGradient id="${p}ogre" cx="35%" cy="28%" r="80%"><stop offset="0" stop-color="#b9d08a"/><stop offset="0.55" stop-color="#7a9450"/><stop offset="1" stop-color="#3f5226"/></radialGradient>
<radialGradient id="${p}queen" cx="35%" cy="28%" r="80%"><stop offset="0" stop-color="#c8fff2"/><stop offset="0.5" stop-color="#3fb39e"/><stop offset="1" stop-color="#123f37"/></radialGradient>
<radialGradient id="${p}golem" cx="35%" cy="28%" r="80%"><stop offset="0" stop-color="#b7b2a8"/><stop offset="0.55" stop-color="#77726a"/><stop offset="1" stop-color="#3c3933"/></radialGradient>
<radialGradient id="${p}wraith" cx="40%" cy="25%" r="80%"><stop offset="0" stop-color="#6c4f8f"/><stop offset="0.6" stop-color="#2d1d42"/><stop offset="1" stop-color="#120a1c"/></radialGradient>
<radialGradient id="${p}behe" cx="35%" cy="28%" r="80%"><stop offset="0" stop-color="#e07a62"/><stop offset="0.55" stop-color="#8f2a22"/><stop offset="1" stop-color="#3a0d0a"/></radialGradient>
<radialGradient id="${p}glow" ><stop offset="0" stop-color="#ffd27a" stop-opacity="0.9"/><stop offset="1" stop-color="#ff7a2b" stop-opacity="0"/></radialGradient>
<linearGradient id="${p}plate" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d4d8df"/><stop offset="1" stop-color="#6c727d"/></linearGradient>
<radialGradient id="${p}corrupt"><stop offset="0" stop-color="#3a1f4d" stop-opacity="0.85"/><stop offset="0.55" stop-color="#4a2f5c" stop-opacity="0.45"/><stop offset="1" stop-color="#4a2f5c" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}portal" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#ffd1ff"/><stop offset="0.35" stop-color="#d06bff"/><stop offset="0.8" stop-color="#5a1a8a"/><stop offset="1" stop-color="#1c0a2a"/></radialGradient>
<radialGradient id="${p}portalglow"><stop offset="0" stop-color="#c46bff" stop-opacity="0.55"/><stop offset="1" stop-color="#c46bff" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}plaza"><stop offset="0" stop-color="#cfc6b0" stop-opacity="0.95"/><stop offset="0.7" stop-color="#b8ae96" stop-opacity="0.8"/><stop offset="1" stop-color="#b8ae96" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}baseglow"><stop offset="0" stop-color="#8fc2ff" stop-opacity="0.45"/><stop offset="1" stop-color="#8fc2ff" stop-opacity="0"/></radialGradient>
<linearGradient id="${p}keep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ece6d6"/><stop offset="1" stop-color="#c9c0aa"/></linearGradient>
<linearGradient id="${p}roof" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5b9be6"/><stop offset="1" stop-color="#2a5ea8"/></linearGradient>
<radialGradient id="${p}vig" cx="50%" cy="50%" r="72%"><stop offset="0.62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.32"/></radialGradient>
<radialGradient id="${p}sun" cx="30%" cy="20%" r="70%"><stop offset="0" stop-color="#fff6d0" stop-opacity="0.16"/><stop offset="1" stop-color="#fff6d0" stop-opacity="0"/></radialGradient>
${TD.extraDefs ? TD.extraDefs(p) : ''}
<filter id="${p}blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter>
<filter id="${p}cloud" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30"/></filter>
</defs>`;
  }

  // ------------------------------------------------------------ biomes
  TD.BIOMES = {
    meadow: {
      name: 'Łąka', base: '#a3a64a', patches: ['#b9b257', '#c7ad55', '#8f9c42', '#a9b058', '#cfbb62'],
      tufts: ['#7a8a36', '#9aa040', '#c2a84a'], deco: 'flowers', shore: ['#c9b07a', '#9a8250'],
      water: ['#5aa8a0', '#2e6e6a'], ripple: '#c8f0e8', ice: false, swatch: '#a3a64a',
    },
    autumn: {
      name: 'Jesień', base: '#b05a2a', patches: ['#c46a32', '#a24a22', '#cf8a3c', '#94421e', '#d89a4a'],
      tufts: ['#7a3a16', '#d9a04a', '#8a5a1e'], deco: 'leaves', shore: ['#b8925a', '#8a6a3a'],
      water: ['#4f9a8e', '#255a54'], ripple: '#c8f0e8', ice: false, swatch: '#b05a2a',
    },
    winter: {
      name: 'Zima', base: '#dbe5ee', patches: ['#eef4f8', '#d0dce7', '#c4d2df', '#f6f9fb', '#cad8e4'],
      tufts: ['#a9b9c8', '#b8c6d3', '#93a5b6'], deco: 'snow', shore: ['#c7d4df', '#a7b9c9'],
      water: ['#c9ebfa', '#86c0e0'], ripple: '#ffffff', ice: true, swatch: '#dbe5ee',
    },
    desert: {
      name: 'Pustynia', base: '#e0c287', patches: ['#ead19a', '#d6b476', '#cca66a', '#f0d9a8', '#d9ba7f'],
      tufts: ['#b39150', '#a8874a', '#c2a35e'], deco: 'pebbles', shore: ['#f2e0b3', '#cfb27c'],
      water: ['#46b6c6', '#2a8399'], ripple: '#c9f4f8', ice: false, swatch: '#e0c287',
    },
  };
  let BIOME = TD.BIOMES.meadow;

  // ------------------------------------------------------------ terrain pieces
  function blob(cells, pad, rx, fill) {
    const set = new Set(cells.map((c) => c[0] + ',' + c[1]));
    const has = (x, y) => set.has(x + ',' + y);
    let s = '';
    for (const [x, y] of cells) {
      s += `<rect x="${x * T - pad}" y="${y * T - pad}" width="${T + 2 * pad}" height="${T + 2 * pad}" rx="${rx}" fill="${fill}"/>`;
      if (has(x + 1, y)) s += `<rect x="${x * T + T / 2}" y="${y * T - pad}" width="${T}" height="${T + 2 * pad}" fill="${fill}"/>`;
      if (has(x, y + 1)) s += `<rect x="${x * T - pad}" y="${y * T + T / 2}" width="${T + 2 * pad}" height="${T}" fill="${fill}"/>`;
      if (has(x + 1, y) && has(x, y + 1) && has(x + 1, y + 1))
        s += `<rect x="${x * T + T / 2}" y="${y * T + T / 2}" width="${T}" height="${T}" fill="${fill}"/>`;
    }
    return s;
  }

  function rockSvg(p, x, y) {
    const r = rnd(x * 31 + y * 7 + 1);
    if (TD.rockVariantSvg && BIOME !== TD.BIOMES.desert) { const v = TD.rockVariantSvg(p, x, y, r); if (v) return v; }
    const X = x * T, Y = y * T;
    let s = `<ellipse cx="${X + 27}" cy="${Y + 40}" rx="20" ry="6" fill="#0b1a08" opacity="0.25"/>`;
    const stone = (cx, cy, w, h) => {
      const pts = [];
      for (let k = 0; k < 7; k++) {
        const a = -Math.PI / 2 + (k * Math.PI * 2) / 7;
        const rad = 1 + uni(r, -0.15, 0.1);
        pts.push(f1(cx + Math.cos(a) * w * rad) + ',' + f1(cy + Math.sin(a) * h * rad));
      }
      s += `<polygon points="${pts.join(' ')}" fill="url(#${p}${BIOME === TD.BIOMES.desert ? 'rockd' : 'rock'})" stroke="${BIOME === TD.BIOMES.desert ? '#6b4524' : '#47454a'}" stroke-width="2" stroke-linejoin="round"/>`;
      if (BIOME.ice) s += `<path d="M${f1(cx - w * 0.8)} ${f1(cy - h * 0.25)} Q${f1(cx - w * 0.3)} ${f1(cy - h * 1.15)} ${f1(cx + w * 0.75)} ${f1(cy - h * 0.35)} Q${f1(cx + w * 0.1)} ${f1(cy - h * 0.55)} ${f1(cx - w * 0.8)} ${f1(cy - h * 0.25)} Z" fill="#fbfdff" stroke="#c4d2df" stroke-width="1"/>`;
      s += `<path d="M${f1(cx - w * 0.55)} ${f1(cy - h * 0.2)} L${f1(cx - w * 0.1)} ${f1(cy - h * 0.75)} L${f1(cx + w * 0.4)} ${f1(cy - h * 0.45)}" stroke="#e2e0da" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.7"/>`;
    };
    stone(X + 22, Y + 26, 15, 14);
    if (r() < 0.7) stone(X + 36, Y + 34, 8, 7);
    if (BIOME === TD.BIOMES.meadow && r() < 0.6) s += `<ellipse cx="${X + 16}" cy="${Y + 20}" rx="5" ry="3" fill="#6f9a45" opacity="0.85"/>`;
    return s;
  }

  function cactusSvg(p, X, Y, r) {
    let s = `<ellipse cx="${f1(X + 6)}" cy="${f1(Y + 22)}" rx="14" ry="5" fill="#3a2a10" opacity="0.28"/>`;
    const arm = (dx, h, up) => `<path d="M${f1(X)} ${f1(Y + 2 + up)} H${f1(X + dx)} V${f1(Y - h + up)}" fill="none" stroke="#2c5a22" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M${f1(X)} ${f1(Y + 2 + up)} H${f1(X + dx)} V${f1(Y - h + up)}" fill="none" stroke="url(#${p}cactus)" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += arm(-11, 12, r() * 4);
    if (r() < 0.7) s += arm(11, 8, r() * 6);
    s += `<rect x="${f1(X - 6)}" y="${f1(Y - 20)}" width="12" height="42" rx="6" fill="url(#${p}cactus)" stroke="#2c5a22" stroke-width="1.6"/>`;
    s += `<path d="M${f1(X - 2)} ${f1(Y - 16)}V${f1(Y + 18)}M${f1(X + 2.5)} ${f1(Y - 16)}V${f1(Y + 18)}" stroke="#2f6b2a" stroke-width="1" opacity="0.6"/>`;
    if (r() < 0.4) s += `<circle cx="${f1(X)}" cy="${f1(Y - 21)}" r="3.2" fill="#f27aa6" stroke="#a83a63" stroke-width="1"/>`;
    return s;
  }
  function palmSvg(p, X, Y, r) {
    let s = `<ellipse cx="${f1(X + 10)}" cy="${f1(Y + 22)}" rx="20" ry="6" fill="#3a2a10" opacity="0.25"/>`;
    s += `<path d="M${f1(X + 2)} ${f1(Y + 22)} Q${f1(X - 4)} ${f1(Y + 6)} ${f1(X + 3)} ${f1(Y - 12)}" stroke="#7a5426" stroke-width="5.5" fill="none" stroke-linecap="round"/>`;
    s += `<path d="M${f1(X + 2)} ${f1(Y + 18)}l3 -2M${f1(X)} ${f1(Y + 10)}l3 -2M${f1(X)} ${f1(Y + 2)}l3 -2M${f1(X + 1)} ${f1(Y - 6)}l3 -2" stroke="#4e3416" stroke-width="1.4"/>`;
    const cx = X + 3, cy = Y - 13;
    for (let k = 0; k < 6; k++) {
      const a = -Math.PI / 2 + (k - 2.5) * 0.75 + uni(r, -0.15, 0.15);
      const ex = cx + Math.cos(a) * 20, ey = cy + Math.sin(a) * 14 + 6;
      const mx = cx + Math.cos(a) * 11, my = cy + Math.sin(a) * 10 - 5;
      s += `<path d="M${f1(cx)} ${f1(cy)} Q${f1(mx)} ${f1(my)} ${f1(ex)} ${f1(ey)}" stroke="#2f6b2a" stroke-width="6" fill="none" stroke-linecap="round"/>`;
      s += `<path d="M${f1(cx)} ${f1(cy)} Q${f1(mx)} ${f1(my)} ${f1(ex)} ${f1(ey)}" stroke="#6cb54a" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    }
    s += `<circle cx="${f1(cx - 2)}" cy="${f1(cy + 2)}" r="2.6" fill="#6b4a1c"/><circle cx="${f1(cx + 2.5)}" cy="${f1(cy + 2.5)}" r="2.6" fill="#6b4a1c"/>`;
    return s;
  }
  function treeSvg(p, x, y) {
    const r = rnd(x * 17 + y * 13 + 5);
    const X = x * T + 24 + uni(r, -3, 3), Y = y * T + 20 + uni(r, -2, 2);
    let s = '';
    if (BIOME === TD.BIOMES.desert) return r() < 0.6 ? cactusSvg(p, X, Y, r) : palmSvg(p, X, Y, r);
    if (BIOME.ice || r() < 0.38) {
      s += `<ellipse cx="${f1(X + 7)}" cy="${f1(Y + 22)}" rx="17" ry="6" fill="#0b1a08" opacity="0.3"/>`;
      s += `<rect x="${f1(X - 2.5)}" y="${f1(Y + 12)}" width="5" height="10" rx="2" fill="#5e4026"/>`;
      for (const [bw, by, th] of [[17, 16, 18], [13, 6, 17], [9, -4, 16]]) {
        const b = Y + by;
        s += `<path d="M${f1(X - bw)} ${f1(b)} L${f1(X)} ${f1(b - th)} L${f1(X + bw)} ${f1(b)} Q${f1(X)} ${f1(b + 5)} ${f1(X - bw)} ${f1(b)} Z" fill="#245a2e" stroke="#163c1e" stroke-width="1.4" stroke-linejoin="round"/>`;
        s += `<path d="M${f1(X - bw + 2)} ${f1(b - 0.5)} L${f1(X)} ${f1(b - th + 1)} L${f1(X)} ${f1(b + 3)} Q${f1(X - bw / 2)} ${f1(b + 2)} ${f1(X - bw + 2)} ${f1(b - 0.5)} Z" fill="#3f8a45"/>`;
        if (BIOME.ice) s += `<path d="M${f1(X - bw * 0.55)} ${f1(b - th * 0.45)} L${f1(X)} ${f1(b - th)} L${f1(X + bw * 0.55)} ${f1(b - th * 0.45)} Q${f1(X + bw * 0.2)} ${f1(b - th * 0.3)} ${f1(X)} ${f1(b - th * 0.42)} Q${f1(X - bw * 0.25)} ${f1(b - th * 0.28)} ${f1(X - bw * 0.55)} ${f1(b - th * 0.45)} Z" fill="#fbfdff" stroke="#c4d2df" stroke-width="0.8"/>`;
      }
      return s;
    }
    const grad = BIOME === TD.BIOMES.autumn ? (r() < 0.55 ? `url(#${p}canopy3)` : `url(#${p}canopy4)`) : r() < 0.6 ? `url(#${p}canopy)` : `url(#${p}canopy2)`;
    s += `<ellipse cx="${f1(X + 7)}" cy="${f1(Y + 22)}" rx="21" ry="7" fill="#0b1a08" opacity="0.3"/>`;
    s += `<rect x="${f1(X - 3)}" y="${f1(Y + 8)}" width="6" height="14" rx="2" fill="#6b4a2c"/>`;
    const blobs = [[-8, 2, 12], [8, 3, 12], [0, -6, 14], [0, 4, 13]];
    for (const [dx, dy, rad] of blobs) s += `<circle cx="${f1(X + dx)}" cy="${f1(Y + dy)}" r="${rad}" fill="#1f4a20"/>`;
    for (const [dx, dy, rad] of blobs) s += `<circle cx="${f1(X + dx)}" cy="${f1(Y + dy - 1)}" r="${rad - 1.5}" fill="${grad}"/>`;
    s += `<circle cx="${f1(X - 5)}" cy="${f1(Y - 9)}" r="4.5" fill="#b4e489" opacity="0.5"/>`;
    s += `<circle cx="${f1(X + 6)}" cy="${f1(Y - 2)}" r="2.5" fill="#b4e489" opacity="0.4"/>`;
    if (r() < 0.3) for (let k = 0; k < 3; k++) s += `<circle cx="${f1(X + uni(r, -9, 9))}" cy="${f1(Y + uni(r, -8, 6))}" r="1.8" fill="#e5605a"/>`;
    return s;
  }

  function nestSvg(p, col, row) {
    const cx = col * T + 48, cy = (row + 1) * T - 2;
    let s = `<circle cx="${cx}" cy="${cy}" r="78" fill="url(#${p}portalglow)"/>`;
    s += `<ellipse cx="${cx + 6}" cy="${cy + 40}" rx="46" ry="10" fill="#000" opacity="0.35"/>`;
    s += `<path d="M${cx - 44} ${cy + 40} Q${cx - 50} ${cy - 10} ${cx - 28} ${cy - 34} Q${cx} ${cy - 58} ${cx + 28} ${cy - 34} Q${cx + 50} ${cy - 10} ${cx + 44} ${cy + 40} Z" fill="#3a2a48" stroke="#1a1122" stroke-width="3" stroke-linejoin="round"/>`;
    s += `<path d="M${cx - 36} ${cy + 10} Q${cx - 38} ${cy - 16} ${cx - 20} ${cy - 32}" stroke="#5e4774" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    for (const [dx, h, w] of [[-30, -30, 8], [-12, -52, 9], [10, -50, 8], [28, -28, 7], [-40, 0, 6], [40, 4, 6]]) {
      const bx = cx + dx, by = cy + h + 18;
      s += `<path d="M${bx - w} ${by} L${bx} ${by - 22} L${bx + w} ${by} Z" fill="#7a4fa8" stroke="#2a1638" stroke-width="2" stroke-linejoin="round"/>`;
      s += `<path d="M${bx - 2} ${by - 3} L${bx} ${by - 17}" stroke="#d9b3ff" stroke-width="1.5" opacity="0.7"/>`;
    }
    s += `<ellipse cx="${cx}" cy="${cy + 12}" rx="24" ry="27" fill="url(#${p}portal)" stroke="#1a1122" stroke-width="3"/>`;
    s += `<ellipse cx="${cx}" cy="${cy + 12}" rx="13" ry="16" fill="none" stroke="#ffd1ff" stroke-width="1.5" stroke-dasharray="5 6" opacity="0.7"/>`;
    s += `<ellipse cx="${cx - 8}" cy="${cy + 6}" rx="3" ry="2" fill="#fff2a8"/><ellipse cx="${cx + 7}" cy="${cy + 10}" rx="3" ry="2" fill="#fff2a8"/>`;
    return s;
  }

  function baseSvg(p, col, row) {
    const X = col * T, Y = row * T;
    let s = `<circle cx="${X + 48}" cy="${Y + 50}" r="80" fill="url(#${p}baseglow)"/>`;
    s += `<ellipse cx="${X + 54}" cy="${Y + 94}" rx="50" ry="10" fill="#000" opacity="0.3"/>`;
    s += `<rect x="${X + 6}" y="${Y + 40}" width="84" height="50" rx="4" fill="#b5ab94" stroke="#6d6553" stroke-width="2"/>`;
    s += `<rect x="${X + 6}" y="${Y + 30}" width="84" height="14" rx="3" fill="url(#${p}keep)" stroke="#6d6553" stroke-width="2"/>`;
    for (let i = 0; i < 7; i++) s += `<rect x="${X + 8 + i * 12}" y="${Y + 24}" width="8" height="9" rx="1.5" fill="url(#${p}keep)" stroke="#6d6553" stroke-width="1.6"/>`;
    for (const by of [Y + 56, Y + 70]) s += `<path d="M${X + 8} ${by}H${X + 88}" stroke="#93896f" stroke-width="1.3"/>`;
    s += `<path d="M${X + 36} ${Y + 90} V${Y + 66} a12 12 0 0 1 24 0 V${Y + 90} Z" fill="#4a3826" stroke="#2b2015" stroke-width="2"/>`;
    s += `<path d="M${X + 42} ${Y + 68}V${Y + 90}M${X + 48} ${Y + 64}V${Y + 90}M${X + 54} ${Y + 68}V${Y + 90}" stroke="#2b2015" stroke-width="1.4"/>`;
    s += `<rect x="${X + 30}" y="${Y + 2}" width="36" height="36" rx="3" fill="url(#${p}keep)" stroke="#6d6553" stroke-width="2"/>`;
    for (let i = 0; i < 4; i++) s += `<rect x="${X + 31 + i * 9}" y="${Y - 4}" width="6" height="8" rx="1" fill="#ece6d6" stroke="#6d6553" stroke-width="1.5"/>`;
    s += `<rect x="${X + 44}" y="${Y + 14}" width="8" height="12" rx="4" fill="#3a5f8f"/>`;
    for (const tx of [X + 2, X + 76]) {
      s += `<rect x="${tx}" y="${Y + 30}" width="18" height="60" rx="3" fill="url(#${p}keep)" stroke="#6d6553" stroke-width="2"/>`;
      s += `<path d="M${tx - 3} ${Y + 32} L${tx + 9} ${Y + 6} L${tx + 21} ${Y + 32} Z" fill="url(#${p}roof)" stroke="#1e3f73" stroke-width="2" stroke-linejoin="round"/>`;
      s += `<rect x="${tx + 6}" y="${Y + 44}" width="6" height="10" rx="3" fill="#3a5f8f"/>`;
    }
    s += `<path d="M${X + 48} ${Y - 4}V${Y - 34}" stroke="#4a3826" stroke-width="2.5" stroke-linecap="round"/>`;
    s += `<path d="M${X + 49} ${Y - 34} q10 -4 20 0 q-4 5 0 10 q-10 -4 -20 0 z" fill="#3f86e0" stroke="#1e3f73" stroke-width="1.5"/>`;
    return s;
  }

  // ------------------------------------------------------------ whole static map layer
  // map: {cols, rows, cell(x,y) -> kind, water:[[x,y]], ponds:[[[x,y]..]], rocks, trees, nest:{c,r}, base:{c,r}, seed}
  TD.mapSvg = function (map) {
    const p = 'm';
    BIOME = TD.BIOMES[map.biome] || TD.BIOMES.meadow;
    const B = BIOME;
    const W = map.cols * T, H = map.rows * T;
    const r = rnd(map.seed * 7 + 11);
    const blocked = (x, y) => map.kind[y * map.cols + x] !== 0;
    const isWater = (x, y) => x >= 0 && y >= 0 && x < map.cols && y < map.rows && map.kind[y * map.cols + x] === 1;
    let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs(p)}`;
    s += `<rect width="${W}" height="${H}" fill="${B.base}"/><g filter="url(#${p}blur)">`;
    const patchCount = Math.round((W * H) / 22000);
    for (let i = 0; i < patchCount; i++) {
      const col = pick(r, B.patches);
      s += `<ellipse cx="${f1(uni(r, 0, W))}" cy="${f1(uni(r, 0, H))}" rx="${f1(uni(r, 50, 130))}" ry="${f1(uni(r, 30, 80))}" fill="${col}" opacity="0.7"/>`;
    }
    s += '</g>';
    const nx = map.nest.c * T + 48, ny = (map.nest.r + 1) * T;
    const bx = map.base.c * T + 48, by = (map.base.r + 1) * T;
    s += `<ellipse cx="${nx}" cy="${ny}" rx="230" ry="190" fill="url(#${p}corrupt)"/>`;
    s += `<ellipse cx="${bx}" cy="${by}" rx="150" ry="140" fill="url(#${p}plaza)"/>`;
    for (let i = 0; i < 46; i++) {
      const a = uni(r, 0, Math.PI * 2), d = uni(r, 20, 120);
      const x = bx + Math.cos(a) * d, y = by + Math.sin(a) * d * 0.95;
      s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(uni(r, 6, 10))}" ry="${f1(uni(r, 4, 7))}" fill="#d9d1bd" stroke="#a39a84" stroke-width="1" opacity="${f1(Math.max(0.15, 1 - d / 130))}"/>`;
    }
    for (let i = 0; i < 14; i++) {
      const x = nx + uni(r, -40, 150), y = ny + uni(r, -140, 140);
      s += `<path d="M${f1(x)} ${f1(y)} l${f1(uni(r, -14, 14))} ${f1(uni(r, 6, 16))} l${f1(uni(r, -10, 10))} ${f1(uni(r, 6, 14))}" stroke="#2a1838" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.55"/>`;
    }
    // grass detail
    for (let i = 0; i < Math.round((W * H) / 8000); i++) {
      const x = uni(r, 4, W - 4), y = uni(r, 8, H - 4);
      if (isWater(Math.floor(x / T), Math.floor(y / T))) continue;
      const sh = pick(r, B.tufts);
      if (B.ice) { s += `<path d="M${f1(x)} ${f1(y)}l-2 -6M${f1(x + 2)} ${f1(y)}l1 -7" stroke="${sh}" stroke-width="1.2" stroke-linecap="round" opacity="0.7"/>`; continue; }
      s += `<path d="M${f1(x)} ${f1(y)}q-1 -4 -3 -6M${f1(x + 2)} ${f1(y)}q0 -4 0.5 -7M${f1(x + 4)} ${f1(y)}q1 -4 3 -5" stroke="${sh}" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.75"/>`;
    }
    for (let i = 0; i < Math.round((W * H) / 15000); i++) {
      const x = uni(r, 10, W - 10), y = uni(r, 10, H - 10);
      if (blocked(Math.floor(x / T), Math.floor(y / T))) continue;
      const col = pick(r, ['#fff4d6', '#ffd65c', '#f7a6c8', '#c9b8ff']);
      if (B.deco === 'snow') { s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="7" ry="3.5" fill="#ffffff" opacity="0.9"/><path d="M${f1(x - 3)} ${f1(y - 6)}l1.5 3 1.5 -3M${f1(x + 5)} ${f1(y - 9)}h3" stroke="#ffffff" stroke-width="1.3" opacity="0.9"/>`; continue; }
      if (B.deco === 'leaves') { s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="3" ry="1.6" fill="${pick(r, ['#e8a23a', '#d0602a', '#f0c050'])}" transform="rotate(${Math.round(uni(r, 0, 180))} ${f1(x)} ${f1(y)})"/><ellipse cx="${f1(x + 5)}" cy="${f1(y + 3)}" rx="2.6" ry="1.4" fill="#b8481e" transform="rotate(40 ${f1(x + 5)} ${f1(y + 3)})"/>`; continue; }
      if (B.deco === 'pebbles') { s += `<path d="M${f1(x - 6)} ${f1(y)} q3 -7 6 -1 q3 -8 6 0" stroke="#9c7a3a" stroke-width="1.5" fill="none" stroke-linecap="round"/><circle cx="${f1(x + 7)}" cy="${f1(y + 1)}" r="1.8" fill="#b08a54"/>`; continue; }
      s += `<circle cx="${f1(x)}" cy="${f1(y - 2)}" r="2.2" fill="${col}"/><circle cx="${f1(x + 3)}" cy="${f1(y + 1)}" r="2.2" fill="${col}"/><circle cx="${f1(x - 3)}" cy="${f1(y + 1)}" r="2.2" fill="${col}"/><circle cx="${f1(x)}" cy="${f1(y)}" r="1.3" fill="#e0a12b"/>`;
    }
    for (let i = 0; i < Math.round((W * H) / 26000); i++) {
      const x = uni(r, 10, W - 10), y = uni(r, 10, H - 10);
      if (blocked(Math.floor(x / T), Math.floor(y / T))) continue;
      s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="3" ry="2" fill="#a8a69f" stroke="#6f6d68" stroke-width="0.8"/>`;
    }
    // water
    s += `<defs><linearGradient id="${p}waterB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${B.water[0]}"/><stop offset="1" stop-color="${B.water[1]}"/></linearGradient></defs>`;
    const wfill = B.ice ? `url(#${p}ice2)` : B === TD.BIOMES.desert ? `url(#${p}oasis)` : `url(#${p}waterB)`;
    for (const pond of map.ponds) {
      s += blob(pond, 7, 22, B.shore[0]);
      s += blob(pond, 3, 20, B.shore[1]);
      s += blob(pond, 0, 18, wfill);
    }
    for (const [x, y] of map.water) if (!isWater(x, y - 1)) s += `<rect x="${x * T + 4}" y="${y * T}" width="${T - 8}" height="7" rx="3" fill="#0d3350" opacity="0.28"/>`;
    const wr = rnd(map.seed + 5);
    for (const [x, y] of map.water) {
      const X = x * T, Y = y * T;
      if (B.ice) {
        s += `<path d="M${X + 6} ${Y + 12}l${f1(uni(wr, 8, 16))} ${f1(uni(wr, 6, 12))}l${f1(uni(wr, 4, 12))} ${f1(uni(wr, -4, 8))}M${X + 30} ${Y + 30}l${f1(uni(wr, -10, 6))} ${f1(uni(wr, 6, 12))}" stroke="#ffffff" stroke-width="1.4" fill="none" stroke-linecap="round" opacity="0.85"/>`;
        s += `<path d="M${X + 10} ${Y + 36}l8 -8" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.5"/>`;
        continue;
      }
      s += `<path d="M${X + 8} ${Y + 16}q5 -4 10 0t10 0M${X + 18} ${Y + 33}q5 -4 10 0t10 0" stroke="${B.ripple}" stroke-width="1.8" fill="none" stroke-linecap="round" opacity="0.65"/>`;
      if (B === TD.BIOMES.meadow && wr() < 0.35) {
        const lx = X + uni(wr, 12, 36), ly = Y + uni(wr, 12, 36);
        s += `<path d="M${f1(lx)} ${f1(ly)}m-7 0a7 6 0 1 0 7 -6l0 6z" fill="#5f9e45" stroke="#3d6d2c" stroke-width="1"/>`;
        if (wr() < 0.5) s += `<circle cx="${f1(lx - 2)}" cy="${f1(ly - 2)}" r="2.3" fill="#ffd1e6"/>`;
      }
      if (wr() < 0.4) s += `<path d="M${X + 30} ${Y + 10}l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5z" fill="#fff" opacity="0.85"/>`;
    }
    // obstacles in row order
    const obs = [];
    for (const [x, y] of map.rocks) obs.push([y, rockSvg(p, x, y)]);
    for (const [x, y] of map.trees) obs.push([y, treeSvg(p, x, y)]);
    obs.push([map.nest.r + 0.6, (TD.nestSvg || nestSvg)(p, map.nest.c, map.nest.r)]);
    obs.push([map.base.r + 1.2, (TD.baseSvg || baseSvg)(p, map.base.c, map.base.r)]);
    obs.sort((a, b) => a[0] - b[0]);
    for (const o of obs) s += o[1];
    s += '</svg>';
    return s;
  };

  TD.overlaySvg = function (map) {
    const p = 'o';
    const W = map.cols * T, H = map.rows * T;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs(p)}
<g filter="url(#${p}cloud)" opacity="0.09"><ellipse cx="${W * 0.32}" cy="${H * 0.7}" rx="170" ry="80" fill="#000"/><ellipse cx="${W * 0.4}" cy="${H * 0.66}" rx="110" ry="60" fill="#000"/><ellipse cx="${W * 0.78}" cy="${H * 0.22}" rx="150" ry="70" fill="#000"/></g>
<rect width="${W}" height="${H}" fill="url(#${p}sun)"/><rect width="${W}" height="${H}" fill="url(#${p}vig)"/></svg>`;
  };

  // ------------------------------------------------------------ sprites (drawn around origin)
  // Wall sprite for a neighbour mask (bit0 up, bit1 right, bit2 down, bit3 left). Cell box 0..48, padded.
  TD.wallSvg = function (mask) {
    const up = mask & 1, rt = mask & 2, dn = mask & 4, lf = mask & 8;
    const vertical = up || dn || !(lf || rt);
    const X = 0, Y = 0;
    const x0 = lf ? X : X + 6, x1 = rt ? X + 48 : X + 42;
    const y0 = up ? Y : Y + 2;
    const yEnd = dn ? Y + 48 : Y + 30;
    let s = '';
    if (!rt) s += `<rect x="${x1 - 2}" y="${y0 + 8}" width="9" height="${(dn ? Y + 48 : Y + 44) - (y0 + 8)}" rx="3" fill="#0b1a08" opacity="0.22"/>`;
    if (!dn) {
      s += `<ellipse cx="${(x0 + x1) / 2 + 5}" cy="${Y + 45}" rx="${(x1 - x0) / 2 + 4}" ry="5" fill="#0b1a08" opacity="0.3"/>`;
      s += `<rect x="${x0}" y="${Y + 24}" width="${x1 - x0}" height="20" rx="4" fill="#6a5f50" stroke="#4a4136" stroke-width="1.4"/>`;
      s += `<path d="M${x0 + 1} ${Y + 34}H${x1 - 1}" stroke="#53493d" stroke-width="1.3"/>`;
      for (let bx = x0 + 9; bx < x1 - 2; bx += 12) s += `<path d="M${bx} ${Y + 30}v4M${bx + 6} ${Y + 34}v9" stroke="#53493d" stroke-width="1.3"/>`;
    }
    s += `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${yEnd - y0}" rx="${mask ? 2 : 5}" fill="#94886f"/>`;
    for (let jy = y0 + 10; jy < yEnd - 2; jy += 12) s += `<path d="M${x0 + 8} ${jy}H${x1 - 8}" stroke="#7f735d" stroke-width="1.2"/>`;
    const merlon = (mx, my, w, h) =>
      `<rect x="${mx + 1.5}" y="${my + 2}" width="${w}" height="${h}" rx="1.5" fill="#3d3529" opacity="0.35"/><rect x="${mx}" y="${my}" width="${w}" height="${h}" rx="1.5" fill="#c9bda3" stroke="#6e6352" stroke-width="1.1"/>`;
    if (vertical) {
      for (let my = y0 + 1; my < yEnd - 6; my += 13) s += merlon(x0 + 1, my, 7, 9) + merlon(x1 - 8, my, 7, 9);
    } else {
      for (let mx = x0 + 1; mx < x1 - 6; mx += 13) s += merlon(mx, y0 + 1, 9, 7) + merlon(mx, yEnd - 10, 9, 7);
    }
    s += `<path d="M${x0} ${y0 + 2}V${yEnd}" stroke="#d9cfb8" stroke-width="1.5" opacity="0.6"/>`;
    s += `<path d="M${x1} ${y0 + 2}V${yEnd}" stroke="#5a5043" stroke-width="1.6"/>`;
    if (!up) s += `<path d="M${x0 + 2} ${y0}H${x1 - 2}" stroke="#ddd3bc" stroke-width="1.6"/>`;
    return s;
  };

  const ACCENT = { A: ['#3f9a72', '#1f4a37'], C: ['#c98a3c', '#5e3a10'], F: ['#57b4e8', '#1f5a80'], L: ['#ead14a', '#6b5a08'], B: ['#c4483f', '#5a1a16'] };
  // Pedestal, cell box 0..48
  TD.pedestalSvg = function (p, t, lvl) {
    const cx = 24, Y = 0;
    const [ac, acd] = ACCENT[t];
    const ell = (dx) => 8 * Math.sqrt(Math.max(0, 1 - (dx / 19) * (dx / 19)));
    let s = '';
    if (lvl >= 4) s += `<ellipse cx="${cx + 2}" cy="${Y + 36}" rx="30" ry="14" fill="url(#${p}glow)" opacity="0.55"/>`;
    s += `<ellipse cx="${cx + 7}" cy="${Y + 44}" rx="23" ry="6.5" fill="#0b1a08" opacity="0.32"/>`;
    // level 4: pennants behind the tower
    if (lvl >= 4) {
      for (const [px, flip] of [[cx - 15, -1], [cx + 15, 1]]) {
        s += `<path d="M${px} ${Y + 18} V${Y - 12}" stroke="#5e3b1c" stroke-width="2" stroke-linecap="round"/>`;
        s += `<path d="M${px} ${Y - 12} l${flip * 12} 3 l${-flip * 4} 3 l${flip * 4} 3 l${-flip * 12} 0 z" fill="#c2332b" stroke="#6b1410" stroke-width="1"/>`;
        s += `<path d="M${px} ${Y - 9} l${flip * 8} 2" stroke="#fff" stroke-width="1.6"/>`;
      }
    }
    s += `<path d="M${cx - 19} ${Y + 20} V${Y + 38} A19 8 0 0 0 ${cx + 19} ${Y + 38} V${Y + 20} Z" fill="url(#${p}cyl)" stroke="#33363d" stroke-width="1.6"/>`;
    s += `<path d="M${cx - 19} ${Y + 29} A19 8 0 0 0 ${cx + 19} ${Y + 29}" fill="none" stroke="#3b3f47" stroke-width="1.1" opacity="0.55"/>`;
    s += `<path d="M${cx - 8} ${Y + 27.5}v8M${cx + 7} ${Y + 28}v8M${cx - 14} ${Y + 36}v5M${cx + 1} ${Y + 37}v6M${cx + 14} ${Y + 35}v5" stroke="#3b3f47" stroke-width="1" opacity="0.5"/>`;
    // level 2+: red folk embroidery band with white zig-zag
    if (lvl >= 2) {
      s += `<path d="M${cx - 19} ${Y + 25} A19 8 0 0 0 ${cx + 19} ${Y + 25} V${Y + 31} A19 8 0 0 1 ${cx - 19} ${Y + 31} Z" fill="#b8322a" stroke="#6b1410" stroke-width="0.8"/>`;
      let zz = '';
      for (let dx = -17; dx <= 17; dx += 4.25) {
        const yy = Y + 25 + ell(dx) + (Math.round((dx + 17) / 4.25) % 2 ? 1.2 : 4.6);
        zz += (zz ? ' L' : 'M') + f1(cx + dx) + ' ' + f1(yy);
      }
      s += `<path d="${zz}" fill="none" stroke="#fff6e8" stroke-width="1.3" stroke-linejoin="round"/>`;
    }
    // level 4: thunder rosette (six petals) on the front
    if (lvl >= 4) {
      const rx0 = cx, ry0 = Y + 33;
      s += `<circle cx="${rx0}" cy="${ry0}" r="5.6" fill="#7a5510" stroke="#ffd36b" stroke-width="1.2"/>`;
      for (let k = 0; k < 6; k++) s += `<ellipse cx="${rx0}" cy="${ry0 - 2.4}" rx="1.3" ry="2.4" fill="#ffe08f" transform="rotate(${k * 60} ${rx0} ${ry0})"/>`;
    }
    s += `<ellipse cx="${cx}" cy="${Y + 20}" rx="19" ry="12" fill="url(#${p}stone)" stroke="${lvl >= 4 ? '#c99a2e' : '#33363d'}" stroke-width="${lvl >= 4 ? 2.4 : 1.6}"/>`;
    s += `<ellipse cx="${cx}" cy="${Y + 20}" rx="15" ry="9" fill="none" stroke="${lvl >= 4 ? '#ffd36b' : ac}" stroke-width="3.2"/>`;
    s += `<ellipse cx="${cx}" cy="${Y + 20}" rx="15" ry="9" fill="none" stroke="${acd}" stroke-width="0.8" opacity="0.6"/>`;
    // level 3+: wooden palisade ring on the back rim
    if (lvl >= 3) {
      for (let k = 0; k <= 8; k++) {
        const a = Math.PI + (k / 8) * Math.PI;
        const px = cx + Math.cos(a) * 18, py = Y + 20 + Math.sin(a) * 11;
        s += `<path d="M${f1(px - 2)} ${f1(py + 1)} V${f1(py - 6)} L${f1(px)} ${f1(py - 9)} L${f1(px + 2)} ${f1(py - 6)} V${f1(py + 1)} Z" fill="${lvl >= 4 ? '#e0b04a' : '#8a5e2e'}" stroke="${lvl >= 4 ? '#7a5510' : '#4a2f14'}" stroke-width="0.9"/>`;
      }
    }
    for (let k = 0; k < lvl; k++) s += `<circle cx="${cx + (k - (lvl - 1) / 2) * 8}" cy="${Y + 40.5}" r="2.7" fill="#ffd36b" stroke="#7a5510" stroke-width="1"/>`;
    return s;
  };

  // Turret centred at origin, facing +x
  TD.turretSvg = function (p, t) {
    if (t === 'A')
      return `<path d="M-3 -13 Q10 -10 12 0 Q10 10 -3 13" fill="none" stroke="#6b4a2c" stroke-width="3.2" stroke-linecap="round"/>
<path d="M-2 -12 L-2 12" stroke="#e8dcc0" stroke-width="1" opacity="0.8"/>
<circle cx="0" cy="0" r="9.5" fill="url(#${p}teal)" stroke="#1f4a37" stroke-width="1.8"/>
<path d="M-4 0 H19" stroke="#3b2a18" stroke-width="2.4" stroke-linecap="round"/><path d="M19 0 l-5 -3.5 v7 z" fill="#d7dbe2"/>
<circle cx="-3" cy="-3" r="3" fill="#c9f5df" opacity="0.7"/>`;
    if (t === 'C')
      return `<rect x="2" y="-5" width="21" height="10" rx="3" fill="#2a2e36"/>
<rect x="18" y="-6.5" width="6" height="13" rx="2" fill="#3c424c" stroke="#16181d" stroke-width="1"/>
<path d="M4 -3 H18" stroke="#6f7784" stroke-width="1.5"/>
<circle cx="0" cy="0" r="12" fill="url(#${p}metal)" stroke="#16181d" stroke-width="1.8"/>
<circle cx="0" cy="0" r="5" fill="none" stroke="#16181d" stroke-width="1.2" opacity="0.6"/>
<circle cx="-4" cy="-4" r="3" fill="#c3c9d3" opacity="0.55"/>`;
    if (t === 'L')
      return `<ellipse cx="0" cy="8" rx="11" ry="4" fill="#3b3f47"/>
<rect x="-5" y="-12" width="10" height="20" rx="3" fill="url(#${p}copper)" stroke="#5a2f10" stroke-width="1.2"/>
<path d="M-7 4 h14 M-7 -1 h14 M-7 -6 h14" stroke="#7a4318" stroke-width="2.6" stroke-linecap="round"/>
<path d="M-7 4 h14 M-7 -1 h14 M-7 -6 h14" stroke="#f6c08c" stroke-width="1" stroke-linecap="round" opacity="0.8"/>
<circle cx="0" cy="-16" r="13" fill="url(#${p}orb)"/>
<circle cx="0" cy="-16" r="5.5" fill="#fffbe0" stroke="#e0a12b" stroke-width="1.5"/>
<path d="M-11 -22 l4 3 -3 2 5 3 M10 -24 l-3 4 3 1 -4 4" stroke="#fff3a0" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (t === 'B')
      return `<path d="M2 -17 Q12 -14 13 0 Q12 14 2 17" fill="none" stroke="#4a2c12" stroke-width="4.5" stroke-linecap="round"/>
<path d="M2 -17 Q12 -14 13 0 Q12 14 2 17" fill="none" stroke="#b88452" stroke-width="2" stroke-linecap="round"/>
<path d="M2 -17 L-6 0 L2 17" fill="none" stroke="#e8dcc0" stroke-width="1.1"/>
<rect x="-12" y="-4" width="30" height="8" rx="2.5" fill="url(#${p}wood)" stroke="#3b2410" stroke-width="1.4"/>
<path d="M-8 0 H26" stroke="#2a2e36" stroke-width="2.6" stroke-linecap="round"/><path d="M28 0 l-6 -4.5 v9 z" fill="#d7dbe2" stroke="#4a4f59" stroke-width="0.8"/>
<path d="M-8 0 l-3 -3.5 M-8 0 l-3 3.5" stroke="#c4483f" stroke-width="2" stroke-linecap="round"/>
<circle cx="0" cy="0" r="5" fill="#7a2a24" stroke="#3b1210" stroke-width="1.4"/>`;
    return `<circle cx="0" cy="0" r="17" fill="url(#${p}iceglow)"/>
<path d="M0 -15 L8 -3 L5 11 L-5 11 L-8 -3 Z" fill="url(#${p}ice)" stroke="#2a6d98" stroke-width="1.6" stroke-linejoin="round"/>
<path d="M0 -15 L0 11 M-8 -3 L0 2 L8 -3" stroke="#2a6d98" stroke-width="1" fill="none" opacity="0.55"/>
<path d="M-3 -9 L-5 -2" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity="0.85"/>`;
  };

  // Enemy body centred at origin; dir = [dx,dy]
  TD.enemySvg = function (p, kind, dir) {
    const conf = { crawler: [11, 'foe'], armored: [14, 'foe2'], runner: [9, 'foe3'], boss: [20, 'foe4'], swarm: [7, 'foe8'], glut: [15, 'foe5'], glutek: [9, 'foe5'], ghost: [12, 'foe6'], shaman: [12, 'foe7'] }[kind];
    if (kind === 'ghost') return ghostSvg(p, dir);
    if (BOSSART[kind]) return BOSSART[kind](p, dir);
    if (kind === 'glut' || kind === 'glutek') return slimeSvg(p, kind === 'glut' ? 15 : 9, dir);
    if (kind === 'swarm') return swarmSvg(p, dir);
    const r = conf[0], grad = conf[1];
    const [dx, dy] = dir;
    let s = `<ellipse cx="2" cy="${r - 1}" rx="${r}" ry="${f1(r * 0.35)}" fill="#000" opacity="0.3"/>`;
    s += `<ellipse cx="${f1(-r * 0.45)}" cy="${r - 3}" rx="3.5" ry="2.5" fill="#4a1513"/><ellipse cx="${f1(r * 0.45)}" cy="${r - 3}" rx="3.5" ry="2.5" fill="#4a1513"/>`;
    if (kind === 'runner') s += `<path d="M-6 ${-r + 2} l-4 -9 l7 5 z M6 ${-r + 2} l4 -9 l-7 5 z" fill="#d98a1f" stroke="#6b3a06" stroke-width="1.5" stroke-linejoin="round"/>`;
    if (kind === 'shaman') {
      s += `<path d="M${r - 2} -2 L${r + 6} -22" stroke="#5e3b1c" stroke-width="2.6" stroke-linecap="round"/>`;
      s += `<circle cx="${r + 6}" cy="-25" r="7" fill="#9dff9a" opacity="0.35"/><circle cx="${r + 6}" cy="-25" r="3.6" fill="#d9ffd2" stroke="#3f9a5e" stroke-width="1.2"/>`;
    }
    if (kind === 'boss') s += `<path d="M-12 -12 q-10 -6 -8 -18 q4 8 12 10 z M12 -12 q10 -6 8 -18 q-4 8 -12 10 z" fill="#efe2c4" stroke="#4a3a20" stroke-width="1.8" stroke-linejoin="round"/>`;
    s += `<ellipse cx="0" cy="0" rx="${r}" ry="${f1(r * 0.92)}" fill="url(#${p}${grad})" stroke="#3a1110" stroke-width="2"/>`;
    if (kind === 'shaman') {
      s += `<path d="M${-r} 1 Q${-r + 1} ${-r - 9} 0 ${-r - 7} Q${r - 1} ${-r - 9} ${r} 1 Q0 -5 ${-r} 1 Z" fill="#3f2a5c" stroke="#1d1030" stroke-width="1.6" stroke-linejoin="round"/>`;
      s += `<path d="M-6 6 h12" stroke="#d9ffd2" stroke-width="1.6" stroke-linecap="round" opacity="0.8"/>`;
    }
    if (kind === 'armored') {
      s += `<path d="M${-r + 1} -1 Q0 ${-r - 8} ${r - 1} -1 Z" fill="url(#${p}plate)" stroke="#2f333a" stroke-width="1.8" stroke-linejoin="round"/>`;
      s += `<circle cx="-6" cy="-4" r="1.4" fill="#2f333a"/><circle cx="6" cy="-4" r="1.4" fill="#2f333a"/>`;
    }
    const ey = kind === 'armored' ? 2 : kind === 'boss' ? -2 : kind === 'shaman' ? 0 : -1;
    const ex = kind === 'boss' ? 7 : 4;
    const er = kind === 'boss' ? 4.6 : 3.2;
    for (const e of [-ex, ex]) {
      s += `<ellipse cx="${e}" cy="${ey}" rx="${er}" ry="${f1(er * 1.12)}" fill="#fff"/>`;
      s += `<circle cx="${f1(e + dx * 1.4)}" cy="${f1(ey + dy * 1.4 + 0.5)}" r="${f1(er * 0.53)}" fill="#1a0b0a"/>`;
    }
    if (kind === 'boss') s += `<path d="M-8 9 q8 5 16 0" stroke="#2a0b3a" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    if (kind !== 'armored' && kind !== 'shaman') s += `<ellipse cx="${f1(-r * 0.4)}" cy="${f1(-r * 0.5)}" rx="${f1(r * 0.27)}" ry="${f1(r * 0.18)}" fill="#fff" opacity="0.45"/>`;
    return s;
  };

  function eyes(ex, ey, er, dir) {
    let s = '';
    for (const e of [-ex, ex]) {
      s += `<ellipse cx="${e}" cy="${ey}" rx="${er}" ry="${f1(er * 1.12)}" fill="#fff"/>`;
      s += `<circle cx="${f1(e + dir[0] * 1.2)}" cy="${f1(ey + dir[1] * 1.2 + 0.4)}" r="${f1(er * 0.55)}" fill="#1a0b0a"/>`;
    }
    return s;
  }
  function slimeSvg(p, r, dir) {
    let s = `<ellipse cx="2" cy="${r - 2}" rx="${r + 2}" ry="${f1(r * 0.35)}" fill="#000" opacity="0.28"/>`;
    s += `<path d="M${-r} ${r * 0.55} Q${-r - 1} ${-r * 0.9} 0 ${-r} Q${r + 1} ${-r * 0.9} ${r} ${r * 0.55} Q${r * 0.5} ${r * 0.85} 0 ${r * 0.6} Q${-r * 0.5} ${r * 0.85} ${-r} ${r * 0.55} Z" fill="url(#${p}foe5)" stroke="#2d5a14" stroke-width="2" stroke-linejoin="round"/>`;
    s += `<ellipse cx="${f1(-r * 0.4)}" cy="${f1(-r * 0.45)}" rx="${f1(r * 0.3)}" ry="${f1(r * 0.18)}" fill="#fff" opacity="0.6"/>`;
    if (r > 10) s += `<circle cx="${f1(r * 0.35)}" cy="${f1(r * 0.15)}" r="2.2" fill="#d8ffb0" opacity="0.8"/><circle cx="${f1(-r * 0.15)}" cy="${f1(r * 0.3)}" r="1.6" fill="#d8ffb0" opacity="0.7"/>`;
    s += eyes(r > 10 ? 5 : 3.2, -2, r > 10 ? 3.4 : 2.4, dir);
    return s;
  }
  function ghostSvg(p, dir) {
    let s = `<ellipse cx="2" cy="16" rx="10" ry="3" fill="#000" opacity="0.18"/>`;
    s += `<path d="M-12 10 V-2 A12 12 0 0 1 12 -2 V10 l-4 -3 -4 4 -4 -4 -4 4 -4 -4 z" fill="url(#${p}foe6)" stroke="#5b74a6" stroke-width="1.8" stroke-linejoin="round" opacity="0.92"/>`;
    s += `<ellipse cx="${f1(-4 + dir[0])}" cy="${f1(-2 + dir[1])}" rx="2.8" ry="4" fill="#20304f"/><ellipse cx="${f1(4 + dir[0])}" cy="${f1(-2 + dir[1])}" rx="2.8" ry="4" fill="#20304f"/>`;
    s += `<ellipse cx="0" cy="6" rx="2.6" ry="2" fill="#20304f" opacity="0.7"/>`;
    s += `<ellipse cx="-6" cy="-9" rx="3" ry="2" fill="#fff" opacity="0.8"/>`;
    return s;
  }
  function swarmSvg(p, dir) {
    let s = '';
    const bugs = [[-7, -3], [6, -6], [0, 5]];
    for (const [bx, by] of bugs) {
      s += `<ellipse cx="${bx + 1}" cy="${by + 9}" rx="5" ry="1.8" fill="#000" opacity="0.2"/>`;
      s += `<ellipse cx="${bx - 3}" cy="${by - 4}" rx="4.5" ry="2.6" fill="#e9fbff" opacity="0.75" transform="rotate(-30 ${bx - 3} ${by - 4})"/>`;
      s += `<ellipse cx="${bx + 3}" cy="${by - 4}" rx="4.5" ry="2.6" fill="#e9fbff" opacity="0.75" transform="rotate(30 ${bx + 3} ${by - 4})"/>`;
      s += `<circle cx="${bx}" cy="${by}" r="5" fill="url(#${p}foe8)" stroke="#123f37" stroke-width="1.4"/>`;
      s += `<circle cx="${f1(bx - 1.6 + dir[0])}" cy="${f1(by - 1 + dir[1])}" r="1.3" fill="#1a0b0a"/><circle cx="${f1(bx + 1.6 + dir[0])}" cy="${f1(by - 1 + dir[1])}" r="1.3" fill="#1a0b0a"/>`;
    }
    return s;
  }

  const shadow = (r, y) => `<ellipse cx="3" cy="${y}" rx="${r}" ry="${f1(r * 0.33)}" fill="#000" opacity="0.3"/>`;
  const BOSSART = {
    bat(p, dir) {
      let s = `<ellipse cx="2" cy="16" rx="8" ry="2.5" fill="#000" opacity="0.2"/>`;
      s += `<path d="M-3 -2 Q-12 -14 -21 -6 Q-17 -5 -16 -1 Q-12 -4 -10 1 Q-7 -2 -3 2 Z" fill="#4a3a66" stroke="#1c1428" stroke-width="1.4" stroke-linejoin="round"/>`;
      s += `<path d="M3 -2 Q12 -14 21 -6 Q17 -5 16 -1 Q12 -4 10 1 Q7 -2 3 2 Z" fill="#4a3a66" stroke="#1c1428" stroke-width="1.4" stroke-linejoin="round"/>`;
      s += `<path d="M-5 -6 l-2 -6 4 3 M5 -6 l2 -6 -4 3" fill="#3a2d52" stroke="#1c1428" stroke-width="1.2"/>`;
      s += `<circle cx="0" cy="0" r="7" fill="url(#${p}bat)" stroke="#1c1428" stroke-width="1.6"/>`;
      s += `<circle cx="${f1(-2.5 + dir[0])}" cy="${f1(-1 + dir[1])}" r="1.6" fill="#ffd34d"/><circle cx="${f1(2.5 + dir[0])}" cy="${f1(-1 + dir[1])}" r="1.6" fill="#ffd34d"/>`;
      s += `<path d="M-2 3 l1 2 1 -2 1 2 1 -2" stroke="#fff" stroke-width="0.9" fill="none"/>`;
      return s;
    },
    shield(p, dir) {
      const r = 12;
      let s = shadow(r, r - 1);
      s += `<ellipse cx="-5" cy="${r - 3}" rx="3.5" ry="2.5" fill="#1e2c45"/><ellipse cx="5" cy="${r - 3}" rx="3.5" ry="2.5" fill="#1e2c45"/>`;
      s += `<ellipse cx="0" cy="0" rx="${r}" ry="${f1(r * 0.92)}" fill="url(#${p}steel)" stroke="#1e2c45" stroke-width="2"/>`;
      s += `<path d="M-9 -4 Q0 -18 9 -4 Z" fill="url(#${p}plate)" stroke="#2f333a" stroke-width="1.5"/>`;
      s += eyes(4, 1, 3, dir);
      const sx = dir[0] >= 0 ? 9 : -9;
      s += `<path d="M${sx - 6} -9 H${sx + 6} V2 Q${sx + 6} 10 ${sx} 14 Q${sx - 6} 10 ${sx - 6} 2 Z" fill="#d7dde6" stroke="#3a4558" stroke-width="1.8" stroke-linejoin="round"/>`;
      s += `<path d="M${sx} -7 V11 M${sx - 5} 0 H${sx + 5}" stroke="#5b9be6" stroke-width="2.2"/>`;
      return s;
    },
    ogre(p, dir) {
      const r = 18;
      let s = shadow(r, r - 2);
      s += `<ellipse cx="-8" cy="${r - 4}" rx="5" ry="3.5" fill="#2c3a18"/><ellipse cx="8" cy="${r - 4}" rx="5" ry="3.5" fill="#2c3a18"/>`;
      s += `<path d="M${r - 2} 2 L${r + 10} -16" stroke="#5e3b1c" stroke-width="5" stroke-linecap="round"/><circle cx="${r + 11}" cy="-18" r="7" fill="#7a5530" stroke="#3b2410" stroke-width="2"/>`;
      s += `<circle cx="${r + 8}" cy="-21" r="1.6" fill="#c9c2b2"/><circle cx="${r + 14}" cy="-16" r="1.6" fill="#c9c2b2"/>`;
      s += `<ellipse cx="0" cy="0" rx="${r}" ry="${f1(r * 0.9)}" fill="url(#${p}ogre)" stroke="#26331a" stroke-width="2.4"/>`;
      s += `<path d="M-10 -10 q10 -6 20 0" stroke="#26331a" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      s += eyes(6, -3, 3.2, dir);
      s += `<path d="M-8 7 q8 5 16 0" stroke="#26331a" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
      s += `<path d="M-6 7 l1.5 -6 2 6 Z M6 7 l-1.5 -6 -2 6 Z" fill="#f4ecd6" stroke="#6b6352" stroke-width="0.8"/>`;
      return s;
    },
    queen(p, dir) {
      const r = 20;
      let s = shadow(r + 2, r - 1);
      s += `<ellipse cx="${-dir[0] * 12}" cy="${6 - dir[1] * 6}" rx="14" ry="11" fill="url(#${p}queen)" stroke="#0d2f29" stroke-width="2"/>`;
      s += `<path d="M${-dir[0] * 12 - 10} 6 h20 M${-dir[0] * 12 - 8} 11 h16" stroke="#0d2f29" stroke-width="2" opacity="0.6"/>`;
      for (const sg of [-1, 1]) {
        s += `<ellipse cx="${sg * 16}" cy="-12" rx="14" ry="7" fill="#e9fbff" opacity="0.7" stroke="#8fd8e8" stroke-width="1" transform="rotate(${sg * 25} ${sg * 16} -12)"/>`;
      }
      s += `<circle cx="0" cy="-2" r="14" fill="url(#${p}queen)" stroke="#0d2f29" stroke-width="2.2"/>`;
      s += eyes(5.5, -3, 3.6, dir);
      s += `<path d="M-10 -14 L-8 -24 L-3 -17 L0 -26 L3 -17 L8 -24 L10 -14 Z" fill="#ffd34d" stroke="#8a5a10" stroke-width="1.6" stroke-linejoin="round"/>`;
      s += `<circle cx="0" cy="-19" r="2" fill="#e5605a"/>`;
      s += `<path d="M-4 -14 q-6 -10 -10 -10 M4 -14 q6 -10 10 -10" stroke="#0d2f29" stroke-width="1.5" fill="none"/>`;
      return s;
    },
    golem(p, dir) {
      const r = 21;
      let s = shadow(r + 2, r - 2);
      s += `<circle cx="0" cy="0" r="30" fill="url(#${p}glow)" opacity="0.35"/>`;
      s += `<path d="M-23 4 L-26 -4 L-18 -10 M23 4 L26 -4 L18 -10" stroke="#3c3933" stroke-width="9" stroke-linecap="round" fill="none"/>`;
      s += `<path d="M-${r} 6 L-${r - 2} -10 L-10 -${r} L8 -${r + 1} L${r - 1} -9 L${r} 8 L10 ${r - 2} L-10 ${r - 2} Z" fill="url(#${p}golem)" stroke="#2a2824" stroke-width="2.5" stroke-linejoin="round"/>`;
      s += `<path d="M-12 -8 L-4 2 L-9 12 M6 -14 L4 -2 L13 6 M-2 10 L4 16" stroke="#ff9a3c" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      s += `<path d="M-12 -8 L-4 2 L-9 12 M6 -14 L4 -2 L13 6" stroke="#ffe0a0" stroke-width="0.9" fill="none"/>`;
      s += `<rect x="${f1(-9 + dir[0] * 1.5)}" y="${f1(-8 + dir[1])}" width="6" height="4" rx="1.5" fill="#ffcf5a"/><rect x="${f1(3 + dir[0] * 1.5)}" y="${f1(-8 + dir[1])}" width="6" height="4" rx="1.5" fill="#ffcf5a"/>`;
      s += `<path d="M-14 -16 l6 2 M10 -17 l5 3" stroke="#b7b2a8" stroke-width="2" stroke-linecap="round"/>`;
      return s;
    },
    wraith(p, dir) {
      let s = `<ellipse cx="3" cy="24" rx="16" ry="4" fill="#000" opacity="0.2"/>`;
      s += `<circle cx="0" cy="-2" r="28" fill="#b06bff" opacity="0.18"/>`;
      s += `<path d="M-20 16 Q-22 -4 -14 -16 Q0 -30 14 -16 Q22 -4 20 16 l-5 -5 -5 7 -5 -7 -5 7 -5 -7 -5 7 -5 -7 z" fill="url(#${p}wraith)" stroke="#0a0510" stroke-width="2" stroke-linejoin="round"/>`;
      s += `<path d="M-14 -14 Q0 -26 14 -14 Q8 -4 0 -6 Q-8 -4 -14 -14 Z" fill="#120a1c"/>`;
      s += `<ellipse cx="${f1(-5 + dir[0] * 1.5)}" cy="${f1(-12 + dir[1])}" rx="3" ry="2.2" fill="#d9a6ff"/><ellipse cx="${f1(5 + dir[0] * 1.5)}" cy="${f1(-12 + dir[1])}" rx="3" ry="2.2" fill="#d9a6ff"/>`;
      s += `<path d="M-20 0 q-8 4 -10 12 M20 0 q8 4 10 12" stroke="#2d1d42" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      s += `<path d="M-30 12 l-3 3 M-30 12 l2 4 M30 12 l3 3 M30 12 l-2 4" stroke="#d9a6ff" stroke-width="1.6" stroke-linecap="round"/>`;
      return s;
    },
    behemoth(p, dir) {
      const r = 24;
      let s = shadow(r + 3, r - 2);
      s += `<ellipse cx="-11" cy="${r - 4}" rx="6" ry="4" fill="#2a0806"/><ellipse cx="11" cy="${r - 4}" rx="6" ry="4" fill="#2a0806"/>`;
      for (let k = -2; k <= 2; k++) s += `<path d="M${k * 8 - 4} ${-r + 6 + Math.abs(k) * 3} L${k * 8} ${-r - 6 + Math.abs(k) * 4} L${k * 8 + 4} ${-r + 6 + Math.abs(k) * 3} Z" fill="#3a0d0a" stroke="#1a0503" stroke-width="1.4"/>`;
      s += `<ellipse cx="0" cy="0" rx="${r}" ry="${f1(r * 0.9)}" fill="url(#${p}behe)" stroke="#1a0503" stroke-width="2.6"/>`;
      s += `<path d="M-14 -10 q-14 -6 -14 -22 q6 10 18 12 z M14 -10 q14 -6 14 -22 q-6 10 -18 12 z" fill="#efe2c4" stroke="#4a3a20" stroke-width="1.8" stroke-linejoin="round"/>`;
      s += `<path d="M-11 -6 l8 3 M11 -6 l-8 3" stroke="#1a0503" stroke-width="3" stroke-linecap="round"/>`;
      s += `<ellipse cx="${f1(-7 + dir[0] * 1.5)}" cy="${f1(-1 + dir[1])}" rx="3.6" ry="2.8" fill="#ffcf5a"/><ellipse cx="${f1(7 + dir[0] * 1.5)}" cy="${f1(-1 + dir[1])}" rx="3.6" ry="2.8" fill="#ffcf5a"/>`;
      s += `<path d="M-12 10 Q0 18 12 10 L9 13 L6 10 L3 14 L0 10 L-3 14 L-6 10 L-9 13 Z" fill="#1a0503" stroke="#1a0503" stroke-width="1.5" stroke-linejoin="round"/>`;
      s += `<path d="M-7 11 l1.5 3 1.5 -3 M1 11 l1.5 3 1.5 -3" stroke="#f4ecd6" stroke-width="1.2" fill="none"/>`;
      return s;
    },
  };

  // ------------------------------------------------------------ rasterising
  TD.svgToCanvas = function (svgText, w, h, scale) {
    return new Promise((resolve) => {
      const img = new Image();
      const blob = new Blob([svgText], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = Math.ceil(w * scale);
        c.height = Math.ceil(h * scale);
        const g = c.getContext('2d');
        g.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        const c = document.createElement('canvas');
        c.width = 1; c.height = 1;
        resolve(c);
      };
      img.src = url;
    });
  };

  function spriteDoc(inner, vb, p) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${vb[2]}" height="${vb[3]}" viewBox="${vb.join(' ')}">${defs(p)}${inner}</svg>`;
  }

  // Sprites: each {canvas, ox, oy, w, h} where (ox,oy) is the world offset of the canvas' top-left from the anchor.
  TD.sprites = {};
  const SS = 2.5; // raster scale for sprites
  async function make(name, inner, vb, p) {
    const c = await TD.svgToCanvas(spriteDoc(inner, vb, p || 's'), vb[2], vb[3], SS);
    TD.sprites[name] = { canvas: c, ox: vb[0], oy: vb[1], w: vb[2], h: vb[3] };
  }
  TD.spriteScale = SS;

  TD.loadSprites = async function () {
    const jobs = [];
    const cellBox = [-12, -30, 72, 90];
    const turBox = [-36, -54, 72, 76];
    for (let m = 0; m < 16; m++) jobs.push(make('wall' + m, TD.wallSvg(m), cellBox));
    for (const t of ['A', 'C', 'F', 'L', 'B', 'Z', 'M']) {
      for (let l = 1; l <= 4; l++) {
        jobs.push(make('ped' + t + l, TD.pedestalSvg('s', t, l), cellBox));
        if (TD.pedestalFrontSvg && l >= 3) jobs.push(make('pedf' + t + l, TD.pedestalFrontSvg('s', t, l), cellBox));
      }
      jobs.push(make('tur' + t, TD.turretSvg('s', t), turBox));
    }
    const dirs = { r: [1, 0], l: [-1, 0], u: [0, -1], d: [0, 1] };
    for (const k of ['crawler', 'armored', 'runner', 'swarm', 'glut', 'glutek', 'ghost', 'shaman', 'bat', 'shield', 'poludnica', 'zmora', 'rusalka', 'bebok']) {
      jobs.push(make('foe_' + k + '_r', TD.enemySvg('s', k, dirs.r), [-36, -40, 72, 72]));
    }
    for (const k of ['boss', 'ogre', 'queen', 'golem', 'wraith', 'behemoth']) {
      jobs.push(make('foe_' + k + '_r', TD.enemySvg('s', k, dirs.r), [-52, -70, 104, 112]));
    }
    if (TD.baseLevelSvg) for (let l = 2; l <= 4; l++) jobs.push(make('baseLvl' + l, TD.baseLevelSvg('s', l), [-50, -96, 100, 130]));
    if (TD.zasiekiSvg) jobs.push(make('zasieki', TD.zasiekiSvg('s'), [-26, -18, 52, 34]));
    await Promise.all(jobs);
  };

  // Small SVG icons used in the DOM UI (tower and enemy portraits)
  TD.towerIconSvg = function (t, lvl) {
    const p = 'i' + t;
    let inner;
    if (t === 'W') inner = TD.wallSvg(0, p);
    else inner = TD.pedestalSvg(p, t, lvl || 1) + `<g transform="translate(24 -2) scale(${[1, 1.04, 1.08, 1.12][(lvl || 1) - 1]})">${TD.turretSvg(p, t)}</g>` + (TD.pedestalFrontSvg ? TD.pedestalFrontSvg(p, t, lvl || 1) : '');
    return `<svg viewBox="${t === 'W' ? '-4 -6 56 56' : '-10 -54 68 102'}" width="100%" height="100%" aria-hidden="true">${defs(p)}${inner}</svg>`;
  };
  TD.powerIconSvg = function (k) {
    if (k === 'perun') return `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" fill="#2a3a66" stroke="#ffd36b" stroke-width="2"/>${[0, 60, 120, 180, 240, 300].map((a) => `<ellipse cx="24" cy="13" rx="3" ry="9" fill="none" stroke="#ffd36b" stroke-width="1.2" opacity="0.45" transform="rotate(${a} 24 24)"/>`).join('')}<path d="M27 6 L15 26 H23 L19 42 L34 19 H25 Z" fill="#fff3a0" stroke="#b07a10" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
    if (k === 'swarog') return `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" fill="#5a1a10" stroke="#ff9a3c" stroke-width="2"/><path d="M24 7 C30 15 36 19 34 29 C33 37 27 41 24 41 C19 41 13 37 13 29 C13 23 17 21 18 15 C21 19 21 22 23 23 C24 18 22 12 24 7 Z" fill="#ff8a2b" stroke="#8a2a08" stroke-width="1.6" stroke-linejoin="round"/><path d="M24 22 C27 27 29 30 28 34 C27 37 25 38 24 38 C21 38 19 36 19 33 C19 30 22 28 24 22 Z" fill="#ffe08a"/></svg>`;
    return `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" fill="#1d3f5c" stroke="#bfeaff" stroke-width="2"/><g stroke="#e6f7ff" stroke-width="2.4" stroke-linecap="round">${[0, 60, 120].map((a) => `<path d="M24 9 V39 M24 13 l-4 -3 M24 13 l4 -3 M24 35 l-4 3 M24 35 l4 3" transform="rotate(${a} 24 24)"/>`).join('')}</g><circle cx="24" cy="24" r="3.5" fill="#bfeaff"/></svg>`;
  };

  TD.baseIconSvg = function (lvl) {
    const p = 'ib';
    return `<svg viewBox="${26 * 48 - 20} ${7 * 48 - 50} 140 150" width="100%" height="100%" aria-hidden="true">${defs(p)}${(TD.baseSvg)(p, 26, 7)}<g transform="translate(${27 * 48} ${8 * 48})">${lvl >= 2 && TD.baseLevelSvg ? TD.baseLevelSvg(p, lvl) : ''}</g></svg>`;
  };

  TD.enemyIconSvg = function (kind) {
    const p = 'e' + kind;
    if (['boss', 'ogre', 'queen', 'golem', 'wraith', 'behemoth'].includes(kind)) return `<svg viewBox="-40 -64 80 86" width="100%" height="100%" aria-hidden="true">${defs(p)}${TD.enemySvg(p, kind, [1, 0])}</svg>`;
    return `<svg viewBox="-27 -29 54 44" width="100%" height="100%" aria-hidden="true">${defs(p)}${TD.enemySvg(p, kind, [1, 0])}</svg>`;
  };
})();
