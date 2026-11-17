/* art_slavic.js — Slavic-mythology art based on the concept sheets:
   tall log watch-towers on stone footings, full-body beasts and bosses with bold outlines,
   the Gates of Nawia (old oak with a glowing rift) and a wooden gród. Overrides art.js drawings. */
(function () {
  'use strict';
  const TD = (window.TD = window.TD || {});
  const T = 48;
  const f1 = (n) => Math.round(n * 10) / 10;
  const OL = '#1e140c'; // outline colour

  // ------------------------------------------------------------ gradients (appended to art.js defs)
  TD.extraDefs = (p) => `
<linearGradient id="${p}logs" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b98450"/><stop offset="0.45" stop-color="#8a5a2e"/><stop offset="1" stop-color="#4a2c14"/></linearGradient>
<linearGradient id="${p}logsH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a87447"/><stop offset="1" stop-color="#6b4220"/></linearGradient>
<radialGradient id="${p}plank" cx="40%" cy="35%" r="80%"><stop offset="0" stop-color="#c99a62"/><stop offset="1" stop-color="#7a5230"/></radialGradient>
<linearGradient id="${p}stake" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b98450"/><stop offset="0.6" stop-color="#7a4f28"/><stop offset="1" stop-color="#4a2f14"/></linearGradient>
<linearGradient id="${p}stoneB" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a9a69c"/><stop offset="0.5" stop-color="#7f7c73"/><stop offset="1" stop-color="#4f4d47"/></linearGradient>
<linearGradient id="${p}gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0a8"/><stop offset="0.5" stop-color="#e0b030"/><stop offset="1" stop-color="#8a6010"/></linearGradient>
<linearGradient id="${p}fur" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c0703a"/><stop offset="1" stop-color="#5e2a12"/></linearGradient>
<linearGradient id="${p}gob" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a8d878"/><stop offset="1" stop-color="#4a7a2a"/></linearGradient>
<linearGradient id="${p}wolf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9aa0a8"/><stop offset="1" stop-color="#3c4048"/></linearGradient>
<radialGradient id="${p}wisp"><stop offset="0" stop-color="#ffffff"/><stop offset="0.35" stop-color="#d8ffd8"/><stop offset="0.75" stop-color="#8ef0a0" stop-opacity="0.6"/><stop offset="1" stop-color="#5fd080" stop-opacity="0"/></radialGradient>
<linearGradient id="${p}toad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9ce0c4"/><stop offset="0.5" stop-color="#4fa88a"/><stop offset="1" stop-color="#235a48"/></linearGradient>
<linearGradient id="${p}owl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b08a5e"/><stop offset="1" stop-color="#5a3e22"/></linearGradient>
<linearGradient id="${p}imp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a87a5a"/><stop offset="1" stop-color="#4e3020"/></linearGradient>
<linearGradient id="${p}dead" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b8d4e4"/><stop offset="1" stop-color="#5a7a90"/></linearGradient>
<linearGradient id="${p}mail" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9aa0a8"/><stop offset="1" stop-color="#4a5058"/></linearGradient>
<linearGradient id="${p}cloth" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6a8a4a"/><stop offset="1" stop-color="#2e4220"/></linearGradient>
<linearGradient id="${p}bark" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8a8a4a"/><stop offset="0.5" stop-color="#5e5a30"/><stop offset="1" stop-color="#2e2c16"/></linearGradient>
<linearGradient id="${p}skin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2c8a0"/><stop offset="1" stop-color="#b47e52"/></linearGradient>
<linearGradient id="${p}furB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9a7a5a"/><stop offset="1" stop-color="#4a3420"/></linearGradient>
<linearGradient id="${p}rockM" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6a6e64"/><stop offset="0.6" stop-color="#3c3f38"/><stop offset="1" stop-color="#1e201c"/></linearGradient>
<linearGradient id="${p}dragon" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a8a050"/><stop offset="0.5" stop-color="#6a6a2e"/><stop offset="1" stop-color="#2e3014"/></linearGradient>
<linearGradient id="${p}cloak" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a3440"/><stop offset="1" stop-color="#0c0a0e"/></linearGradient>
<radialGradient id="${p}redglow"><stop offset="0" stop-color="#ff4a2c" stop-opacity="0.55"/><stop offset="1" stop-color="#ff4a2c" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}greenglow"><stop offset="0" stop-color="#9dff7a" stop-opacity="0.7"/><stop offset="1" stop-color="#9dff7a" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}rift" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#e2c8ff"/><stop offset="0.4" stop-color="#9a6ae0"/><stop offset="0.85" stop-color="#4a2a8a"/><stop offset="1" stop-color="#1c0e30"/></radialGradient>
<linearGradient id="${p}thatch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8c878"/><stop offset="1" stop-color="#a88440"/></linearGradient>
<linearGradient id="${p}redtower" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d8503a"/><stop offset="1" stop-color="#8a2a1c"/></linearGradient>
<radialGradient id="${p}canopy3" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#ffc85a"/><stop offset="0.6" stop-color="#e0782a"/><stop offset="1" stop-color="#8a3a14"/></radialGradient>
<radialGradient id="${p}canopy4" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#ffe08a"/><stop offset="0.6" stop-color="#d8a83a"/><stop offset="1" stop-color="#7a5a14"/></radialGradient>`;

  const shadow = (w, y) => `<ellipse cx="2" cy="${y}" rx="${w}" ry="${f1(w * 0.3)}" fill="#000" opacity="0.3"/>`;
  const eye = (x, y, r, iris, pupil) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${iris}" stroke="${OL}" stroke-width="0.8"/><circle cx="${f1(x + r * 0.25)}" cy="${y}" r="${f1(r * 0.45)}" fill="${pupil || '#120805'}"/>`;
  // where each sprite's head ends (for HP bars)
  TD.SPRITE_TOP = {
    crawler: -24, runner: -22, armored: -22, swarm: -16, glut: -22, glutek: -14, ghost: -18, bat: -16, shield: -27, shaman: -27,
    poludnica: -27, zmora: -28, rusalka: -26, bebok: -30,
    ogre: -58, boss: -54, queen: -48, golem: -42, wraith: -46, behemoth: -60,
  };

  // ============================================================ TOWERS
  // Palisade: two staggered rows of pointed, painted stakes on a grassy bank
  TD.wallSvg = function (mask, p) {
    p = p || 's';
    const up = mask & 1, rt = mask & 2, dn = mask & 4, lf = mask & 8;
    const x0 = lf ? 0 : 4, x1 = rt ? 48 : 44;
    const y0 = up ? 0 : 8, y1 = dn ? 48 : 42;
    let s = '';
    if (!dn) s += `<ellipse cx="${(x0 + x1) / 2 + 5}" cy="44" rx="${(x1 - x0) / 2 + 5}" ry="5.5" fill="#0b1a08" opacity="0.32"/>`;
    s += `<path d="M${x0} ${y1} L${x0} ${y0 + 4} Q${x0} ${y0} ${x0 + 4} ${y0} L${x1 - 4} ${y0} Q${x1} ${y0} ${x1} ${y0 + 4} L${x1} ${y1} Z" fill="#7a6438" stroke="${OL}" stroke-width="${mask ? 0 : 1.4}"/>`;
    s += `<path d="M${x0} ${y0 + 4} H${x1}" stroke="#8fae4a" stroke-width="4" stroke-linecap="round" opacity="0.9"/>`;
    const stake = (x, base, h, w) => {
      const top = base - h;
      return `<path d="M${x} ${base} V${top + 6} L${f1(x + w / 2)} ${top} L${x + w} ${top + 6} V${base} Z" fill="url(#${p}stake)" stroke="${OL}" stroke-width="1.2" stroke-linejoin="round"/>` +
        `<path d="M${x + 0.6} ${f1(top + 13)} h${w - 1.2}" stroke="#c2332b" stroke-width="2.2"/><path d="M${x + 0.6} ${f1(top + 16)} h${w - 1.2}" stroke="#f0e6d0" stroke-width="1"/>` +
        `<path d="M${f1(x + w / 2)} ${top + 1} V${base - 1}" stroke="#d6a46a" stroke-width="0.8" opacity="0.6"/>`;
    };
    // back row (shorter, offset) then front row
    const rows = dn || up ? [[y0 + 10, 20], [y0 + 26, 22], ...(dn ? [[48, 22]] : [[42, 24]])] : [[24, 22], [42, 26]];
    rows.forEach(([base, h], ri) => {
      const off = ri % 2 ? 3 : 0;
      for (let x = x0 + off; x < x1 - 2; x += 6.5) s += stake(f1(x), base, h, 6);
    });
    return s;
  };

  const CLOTH = { A: '#3f7a3a', C: '#c0922a', F: '#3f78c0', L: '#e0b030', B: '#b8322a', Z: '#e0602a', M: '#f0e6d0' };
  // Tall log watch-tower on a stone footing (cell box 0..48; platform centre at (24, -2))
  TD.pedestalSvg = function (p, t, lvl) {
    const cx = 24;
    let s = '';
    if (lvl >= 4) s += `<ellipse cx="${cx}" cy="8" rx="30" ry="34" fill="url(#${p}glow)" opacity="0.5"/>`;
    s += `<ellipse cx="${cx + 6}" cy="45" rx="23" ry="6" fill="#0b1a08" opacity="0.35"/>`;
    if (lvl >= 4) {
      for (const [px, flip] of [[cx - 21, -1], [cx + 21, 1]]) {
        s += `<path d="M${px} 44 V-22" stroke="${OL}" stroke-width="3" stroke-linecap="round"/><path d="M${px} 44 V-22" stroke="#8a5e2e" stroke-width="1.6" stroke-linecap="round"/>`;
        s += `<path d="M${px} -22 l${flip * 12} 2 l${-flip * 4} 3 l${flip * 4} 3 l${-flip * 12} 1 z" fill="#c2332b" stroke="${OL}" stroke-width="1"/><path d="M${px} -18.5 l${flip * 8} 1" stroke="#fff6e8" stroke-width="1.4"/>`;
      }
    }
    // stone footing
    s += `<path d="M${cx - 19} 42 L${cx - 16} 30 L${cx + 16} 30 L${cx + 19} 42 Q${cx} 48 ${cx - 19} 42 Z" fill="url(#${p}stoneB)" stroke="${OL}" stroke-width="1.6" stroke-linejoin="round"/>`;
    s += `<path d="M${cx - 17} 36 Q${cx} 40 ${cx + 17} 36 M${cx - 10} 31 v5 M${cx + 1} 32 v6 M${cx + 11} 31 v5 M${cx - 5} 38 v5 M${cx + 7} 38 v5" stroke="#3b3a36" stroke-width="1" fill="none" opacity="0.8"/>`;
    s += `<path d="M${cx - 15} 33 q3 -2 6 0" stroke="#7a9a3a" stroke-width="2" stroke-linecap="round" opacity="0.8"/>`;
    // log body (horizontal logs, log ends on the sides)
    s += `<path d="M${cx - 14} -2 V31 Q${cx} 36 ${cx + 14} 31 V-2 Z" fill="url(#${p}logs)" stroke="${OL}" stroke-width="1.6"/>`;
    for (let y = 2; y <= 30; y += 4.2) s += `<path d="M${cx - 14} ${f1(y)} Q${cx} ${f1(y + 4.5)} ${cx + 14} ${f1(y)}" fill="none" stroke="#3a2410" stroke-width="1" opacity="0.7"/>`;
    for (let y = 0; y <= 30; y += 4.2) {
      s += `<circle cx="${cx - 14}" cy="${f1(y)}" r="2.2" fill="#c99a62" stroke="${OL}" stroke-width="0.8"/><circle cx="${cx + 14}" cy="${f1(y)}" r="2.2" fill="#8a5a2e" stroke="${OL}" stroke-width="0.8"/>`;
    }
    s += `<rect x="${cx + 4}" y="6" width="3" height="6" rx="1" fill="#1e140c"/>`;
    // cloth banner with folk pattern
    const ac = CLOTH[t];
    s += `<path d="M${cx - 9} 8 H${cx - 1} V23 l-2 -2 -2 2 -2 -2 -2 2 Z" fill="${ac}" stroke="${OL}" stroke-width="1"/>`;
    s += `<path d="M${cx - 7.5} 11 l2.5 2.5 2.5 -2.5 M${cx - 7.5} 16 l2.5 2.5 2.5 -2.5" stroke="#fff6e8" stroke-width="0.9" fill="none" opacity="0.85"/>`;
    // lvl 3+: carved horse heads on the sides
    if (lvl >= 3) {
      for (const sg of [-1, 1]) {
        const hx = cx + sg * 14;
        s += `<path d="M${hx} 10 q${sg * 3} -2 ${sg * 4} -7 q${sg * 1} -4 ${sg * 4} -3 l${sg * 2} 2 q${-sg * 1} 1 ${-sg * 1} 3 q${sg * 2} 2 ${sg * 1} 4 q${-sg * 3} 1 ${-sg * 5} 4 z" fill="${lvl >= 4 ? `url(#${p}gold)` : '#a87447'}" stroke="${OL}" stroke-width="1.1" stroke-linejoin="round"/>`;
        s += `<circle cx="${hx + sg * 5.5}" cy="2" r="0.8" fill="${OL}"/>`;
      }
    }
    // lvl 4: golden rosette on the front
    if (lvl >= 4) {
      s += `<circle cx="${cx + 7}" cy="18" r="5.2" fill="url(#${p}gold)" stroke="${OL}" stroke-width="1.1"/>`;
      for (let k = 0; k < 6; k++) s += `<ellipse cx="${cx + 7}" cy="15.8" rx="1.1" ry="2.2" fill="#fff6c8" stroke="#8a6010" stroke-width="0.4" transform="rotate(${k * 60} ${cx + 7} 18)"/>`;
    }
    // platform rim
    const rim = lvl >= 4 ? `url(#${p}gold)` : `url(#${p}plank)`;
    s += `<ellipse cx="${cx}" cy="-2" rx="17" ry="8" fill="${rim}" stroke="${OL}" stroke-width="1.6"/>`;
    s += `<ellipse cx="${cx}" cy="-3" rx="13.5" ry="5.8" fill="url(#${p}plank)" stroke="#4a2f14" stroke-width="1"/>`;
    for (const dy of [-3, 0, 3]) { const hw = 13.5 * Math.sqrt(1 - (dy / 5.8) ** 2) - 1; s += `<path d="M${f1(cx - hw)} ${-3 + dy} H${f1(cx + hw)}" stroke="#7a4f28" stroke-width="0.7" opacity="0.7"/>`; }
    // lvl 2+: red-white embroidered band on the rim
    if (lvl >= 2) {
      s += `<path d="M${cx - 17} -2 A17 8 0 0 0 ${cx + 17} -2 L${cx + 17} 1 A17 8 0 0 1 ${cx - 17} 1 Z" fill="#f0e6d0" stroke="${OL}" stroke-width="1"/>`;
      for (let dx = -14; dx <= 14; dx += 3.5) {
        const yy = -2 + 8 * Math.sqrt(Math.max(0, 1 - (dx / 17) ** 2));
        s += `<path d="M${f1(cx + dx - 1.4)} ${f1(yy + 1.5)} l1.4 -1.4 1.4 1.4 -1.4 1.4 z" fill="#c2332b"/>`;
      }
    }
    // lvl 1: low railing on the back; lvl 3+: crown of stakes
    if (lvl === 1 || lvl === 2) {
      s += `<path d="M${cx - 15} -4 V-11 M${cx - 7} -8.5 V-15 M${cx + 7} -8.5 V-15 M${cx + 15} -4 V-11" stroke="${OL}" stroke-width="3" stroke-linecap="round"/><path d="M${cx - 15} -4 V-11 M${cx - 7} -8.5 V-15 M${cx + 7} -8.5 V-15 M${cx + 15} -4 V-11" stroke="#a87447" stroke-width="1.5" stroke-linecap="round"/>`;
      s += `<path d="M${cx - 15} -10 Q${cx - 11} -14 ${cx - 7} -14 H${cx + 7} Q${cx + 11} -14 ${cx + 15} -10" fill="none" stroke="${OL}" stroke-width="3"/><path d="M${cx - 15} -10 Q${cx - 11} -14 ${cx - 7} -14 H${cx + 7} Q${cx + 11} -14 ${cx + 15} -10" fill="none" stroke="#a87447" stroke-width="1.5"/>`;
    }
    if (lvl >= 3) {
      for (let k = 0; k <= 10; k++) {
        const a = Math.PI + (k / 10) * Math.PI;
        const px = cx + Math.cos(a) * 15.5, py = -2 + Math.sin(a) * 7;
        s += `<path d="M${f1(px - 2)} ${f1(py + 1)} V${f1(py - 6)} L${f1(px)} ${f1(py - 10)} L${f1(px + 2)} ${f1(py - 6)} V${f1(py + 1)} Z" fill="${lvl >= 4 ? `url(#${p}gold)` : '#a87447'}" stroke="${OL}" stroke-width="0.9"/>`;
      }
    }
    for (let k = 0; k < lvl; k++) s += `<circle cx="${cx + (k - (lvl - 1) / 2) * 7}" cy="42.5" r="2.4" fill="#ffd36b" stroke="#7a5510" stroke-width="1"/>`;
    return s;
  };

  // front stakes of the lvl3+ crown are drawn after the turret (so the figure stands inside)
  TD.pedestalFrontSvg = function (p, t, lvl) {
    if (lvl < 3) return '';
    const cx = 24;
    let s = '';
    for (let k = 1; k < 10; k++) {
      const a = (k / 10) * Math.PI;
      const px = cx + Math.cos(a) * 15.5, py = -2 + Math.sin(a) * 7;
      s += `<path d="M${f1(px - 2)} ${f1(py + 1)} V${f1(py - 5)} L${f1(px)} ${f1(py - 8)} L${f1(px + 2)} ${f1(py - 5)} V${f1(py + 1)} Z" fill="${lvl >= 4 ? `url(#${p}gold)` : '#a87447'}" stroke="${OL}" stroke-width="0.9"/>`;
    }
    return s;
  };

  // Tops of the towers, drawn with origin at the platform centre, facing right
  TD.turretSvg = function (p, t) {
    if (t === 'A') // archer in a fur cap and green cloak, drawing a bow
      return `<path d="M-5 0 l-1 -9 M2 0 l1 -9" stroke="${OL}" stroke-width="3.4" stroke-linecap="round"/><path d="M-5 0 l-1 -9 M2 0 l1 -9" stroke="#4a3a2a" stroke-width="2" stroke-linecap="round"/>
<path d="M-8 -8 Q-9 -20 -2 -21 Q5 -20 5 -8 Z" fill="url(#${p}cloth)" stroke="${OL}" stroke-width="1.3"/>
<path d="M-7 -9 Q-1 -6 4 -9" stroke="#c9a46a" stroke-width="1.3" fill="none"/>
<path d="M2 -16 L13 -15" stroke="${OL}" stroke-width="3.4" stroke-linecap="round"/><path d="M2 -16 L13 -15" stroke="url(#${p}skin)" stroke-width="2" stroke-linecap="round"/>
<path d="M12 -27 Q20 -16 12 -4" fill="none" stroke="${OL}" stroke-width="3"/><path d="M12 -27 Q20 -16 12 -4" fill="none" stroke="#8a5a2e" stroke-width="1.6"/>
<path d="M12 -27 L2 -16 L12 -4" fill="none" stroke="#efe6cf" stroke-width="0.8"/>
<path d="M2 -16 H22" stroke="#4a2f14" stroke-width="1.3"/><path d="M23 -16 l-3 -2 v4 z" fill="#c9ced6"/>
<circle cx="-1" cy="-24" r="4.2" fill="url(#${p}skin)" stroke="${OL}" stroke-width="1.1"/>
<path d="M-6 -25 Q-6 -32 -1 -32 Q4 -32 4 -25 Z" fill="#6b4a2c" stroke="${OL}" stroke-width="1.1"/><path d="M-6.5 -25 H4.5" stroke="#c9a46a" stroke-width="2"/>
<path d="M-3 -21 q2 2 4 0" stroke="#8a4a20" stroke-width="1.2" fill="none"/><circle cx="1.3" cy="-24.5" r="0.7" fill="${OL}"/>`;
    if (t === 'C') // small wooden catapult with a stone in the cup
      return `<path d="M-13 0 L-9 -10 L-5 0 M5 0 L9 -10 L13 0" stroke="${OL}" stroke-width="3.6" fill="none" stroke-linejoin="round"/><path d="M-13 0 L-9 -10 L-5 0 M5 0 L9 -10 L13 0" stroke="#8a5a2e" stroke-width="2" fill="none" stroke-linejoin="round"/>
<rect x="-15" y="-2" width="30" height="4" rx="1.5" fill="#7a4f28" stroke="${OL}" stroke-width="1.1"/>
<path d="M-9 -10 H9" stroke="${OL}" stroke-width="3.6"/><path d="M-9 -10 H9" stroke="#a87447" stroke-width="2"/>
<path d="M-12 -4 L12 -24" stroke="${OL}" stroke-width="4"/><path d="M-12 -4 L12 -24" stroke="#a87447" stroke-width="2.4"/>
<rect x="-17" y="-8" width="8" height="8" rx="1.5" fill="#5a5850" stroke="${OL}" stroke-width="1.1"/>
<path d="M9 -24 Q14 -30 18 -25 Q14 -20 9 -24 Z" fill="#7a5230" stroke="${OL}" stroke-width="1"/>
<circle cx="14" cy="-27" r="4.6" fill="#9a978e" stroke="${OL}" stroke-width="1.2"/><path d="M12 -29 l2 1" stroke="#d6d3c8" stroke-width="1.2"/>
<circle cx="-11" cy="-1" r="2" fill="#5a3a1a" stroke="${OL}" stroke-width="0.8"/><circle cx="11" cy="-1" r="2" fill="#5a3a1a" stroke="${OL}" stroke-width="0.8"/>`;
    if (t === 'F') // stone idol of the winter goddess with an ice crown
      return `<ellipse cx="0" cy="-16" rx="16" ry="20" fill="url(#${p}iceglow)"/>
<path d="M-7 0 V-24 Q-7 -31 0 -31 Q7 -31 7 -24 V0 Z" fill="#c9c6bc" stroke="${OL}" stroke-width="1.4"/>
<path d="M-7 0 V-24 Q-7 -31 0 -31" fill="none" stroke="#f0eee6" stroke-width="1.4" opacity="0.8"/>
<path d="M-4.5 -24 h3 M1.5 -24 h3" stroke="#3f78c0" stroke-width="1.6" stroke-linecap="round"/>
<path d="M0 -23 v4 M-3 -18 q3 2 6 0" stroke="#6a665c" stroke-width="1" fill="none"/>
<path d="M-6 -16 Q0 -6 6 -16 L5 -8 Q0 -3 -5 -8 Z" fill="#e8e6de" stroke="#6a665c" stroke-width="0.9"/>
<path d="M-5 -6 h10 M-5 -3 h10" stroke="#6a665c" stroke-width="0.8"/>
<path d="M-7 -30 L-8 -38 L-4 -33 L-2 -41 L0 -34 L2 -41 L4 -33 L8 -38 L7 -30 Z" fill="url(#${p}ice)" stroke="#2a6d98" stroke-width="1.2" stroke-linejoin="round"/>
<path d="M-9 -4 l-3 -3 M9 -12 l3 -2 M-10 -20 l-3 1" stroke="#e6f7ff" stroke-width="1.3" stroke-linecap="round"/>`;
    if (t === 'L') // carved pillar of Perun with a golden thunder flower on top
      return `<circle cx="0" cy="-34" r="13" fill="url(#${p}orb)" opacity="0.85"/>
<path d="M-6.5 0 V-29 H6.5 V0 Z" fill="url(#${p}stake)" stroke="${OL}" stroke-width="1.4"/>
<path d="M-6.5 -6 H6.5 M-6.5 -10 H6.5" stroke="#3a2410" stroke-width="0.9"/>
<path d="M-6.5 -8 l2 -2 2 2 2 -2 2 2 2 -2 2 2" stroke="#e0b030" stroke-width="0.9" fill="none"/>
<path d="M-4.5 -24 h3 M1.5 -24 h3" stroke="${OL}" stroke-width="1.5" stroke-linecap="round"/>
<path d="M0 -23 v3" stroke="#3a2410" stroke-width="1"/>
<path d="M-5.5 -20 Q0 -18 5.5 -20 L4 -12 L2 -14 L0 -11 L-2 -14 L-4 -12 Z" fill="#c99a62" stroke="${OL}" stroke-width="0.9"/>
<path d="M-4 -19 v5 M0 -18.5 v6 M4 -19 v5" stroke="#7a5230" stroke-width="0.6"/>
<path d="M-6.5 -29 Q0 -33 6.5 -29" fill="none" stroke="${OL}" stroke-width="1.2"/>
<circle cx="0" cy="-34" r="5.6" fill="url(#${p}gold)" stroke="${OL}" stroke-width="1.2"/>
${[0, 60, 120, 180, 240, 300].map((a) => `<ellipse cx="0" cy="-36.4" rx="1.3" ry="2.4" fill="#fff6c8" stroke="#8a6010" stroke-width="0.4" transform="rotate(${a} 0 -34)"/>`).join('')}
<path d="M-12 -40 l3 3 -2 1 4 3 M11 -42 l-2 4 3 1 -3 4" stroke="#fff3a0" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (t === 'Z') // Znicz Swaroga: stone fire bowl with a roaring flame
      return `<circle cx="0" cy="-18" r="16" fill="url(#${p}glow)" opacity="0.8"/>
<path d="M-4 0 L-3 -8 M4 0 L3 -8" stroke="${OL}" stroke-width="3.4"/><path d="M-4 0 L-3 -8 M4 0 L3 -8" stroke="#7d7a72" stroke-width="2"/>
<path d="M-11 -9 Q0 -4 11 -9 L9 -14 Q0 -11 -9 -14 Z" fill="url(#${p}stoneB)" stroke="${OL}" stroke-width="1.3"/>
<ellipse cx="0" cy="-14" rx="9.5" ry="3" fill="#3a1a0a" stroke="${OL}" stroke-width="1.2"/>
<path d="M-8 -14 Q-10 -24 -5 -28 Q-4 -22 -1 -22 Q-3 -32 2 -38 Q4 -30 7 -27 Q9 -22 8 -14 Z" fill="#ff7a1a" stroke="#8a2a08" stroke-width="1.2" stroke-linejoin="round"/>
<path d="M-4 -14 Q-5 -20 -2 -22 Q0 -18 1 -19 Q0 -26 3 -29 Q6 -22 4 -14 Z" fill="#ffd25a"/>
<path d="M-1 -14 Q-1 -18 1 -19 Q3 -17 2 -14 Z" fill="#fff6c8"/>
<path d="M-11 -9 h22" stroke="#c2332b" stroke-width="1.4" stroke-dasharray="2 2"/>
<circle cx="-9" cy="-33" r="1.2" fill="#ffb03a"/><circle cx="10" cy="-30" r="1" fill="#ffd25a"/><circle cx="5" cy="-41" r="1.1" fill="#ff8a2a"/>`;
    if (t === 'M') // Chram Mokoszy: small roofed shrine with the goddess' idol and a woven wreath
      return `<circle cx="0" cy="-14" r="18" fill="url(#${p}greenglow)" opacity="0.6"/>
<path d="M-11 0 V-18 M11 0 V-18" stroke="${OL}" stroke-width="3.4"/><path d="M-11 0 V-18 M11 0 V-18" stroke="#8a5e2e" stroke-width="2"/>
<path d="M-15 -17 L0 -31 L15 -17 Z" fill="#6b4a2c" stroke="${OL}" stroke-width="1.4" stroke-linejoin="round"/>
<path d="M-11 -19 L0 -28 L11 -19" stroke="#a87447" stroke-width="1" fill="none"/>
<path d="M0 -31 l-4 -5 q-1 -3 2 -3 l2 2 z M0 -31 l4 -5 q1 -3 -2 -3 l-2 2 z" fill="#a87447" stroke="${OL}" stroke-width="0.9"/>
<path d="M-4.5 0 V-11 Q-4.5 -16 0 -16 Q4.5 -16 4.5 -11 V0 Z" fill="#d6c9a8" stroke="${OL}" stroke-width="1.2"/>
<path d="M-2.5 -12 h1.6 M1 -12 h1.6 M-1.6 -8.5 q1.6 1 3.2 0" stroke="#5a4a30" stroke-width="0.9" fill="none"/>
<path d="M-4.5 -5 h9" stroke="#c2332b" stroke-width="1.6"/><path d="M-4.5 -5 h9" stroke="#f0e6d0" stroke-width="0.6" stroke-dasharray="1.5 1.5"/>
<circle cx="0" cy="-16.5" r="4.6" fill="none" stroke="#5a8a2a" stroke-width="2.2"/>
<circle cx="-3" cy="-19" r="1.1" fill="#f27aa6"/><circle cx="2.5" cy="-20" r="1.1" fill="#ffd23a"/><circle cx="4" cy="-16" r="1" fill="#8ab8ff"/>
<path d="M-9 -3 l-3 -2 M9 -3 l3 -2" stroke="#7ab83a" stroke-width="2" stroke-linecap="round"/>`;
    // B — great crossbow on a wooden mount
    return `<path d="M-4 0 L0 -9 L4 0" stroke="${OL}" stroke-width="3.6" fill="none"/><path d="M-4 0 L0 -9 L4 0" stroke="#7a4f28" stroke-width="2" fill="none"/>
<rect x="-14" y="-13" width="32" height="6" rx="2" fill="url(#${p}stake)" stroke="${OL}" stroke-width="1.3"/>
<path d="M-11 -11.5 l2 1.5 -2 1.5 M-5 -11.5 l2 1.5 -2 1.5 M1 -11.5 l2 1.5 -2 1.5 M7 -11.5 l2 1.5 -2 1.5" stroke="#c2332b" stroke-width="1" fill="none"/>
<path d="M10 -10 Q14 -24 6 -30 M10 -10 Q14 4 6 10" stroke="${OL}" stroke-width="3.6" fill="none" stroke-linecap="round"/>
<path d="M10 -10 Q14 -24 6 -30 M10 -10 Q14 4 6 10" stroke="#a87447" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M6 -30 L-6 -10 L6 10" fill="none" stroke="#efe6cf" stroke-width="0.9"/>
<path d="M-8 -10 H24" stroke="#2a2e36" stroke-width="2.2" stroke-linecap="round"/><path d="M26 -10 l-5 -3.5 v7 z" fill="#d7dbe2" stroke="${OL}" stroke-width="0.7"/>
<circle cx="0" cy="-10" r="3" fill="#7a2a24" stroke="${OL}" stroke-width="1"/>`;
  };

  // ============================================================ BEASTS (feet on the ground at y≈r, facing right)
  const B = {
    crawler(p) { // Bies
      let s = shadow(10, 10);
      s += `<path d="M-6 -2 Q-16 -2 -15 -10 Q-14 -15 -11 -12" stroke="${OL}" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M-6 -2 Q-16 -2 -15 -10 Q-14 -15 -11 -12" stroke="#7a3a1a" stroke-width="1.3" fill="none" stroke-linecap="round"/><path d="M-11 -12 l-3 -3 4 0 z" fill="#3a1a0a" stroke="${OL}" stroke-width="0.8"/>`;
      s += `<path d="M-3 2 L-5 9 M3 2 L4 9" stroke="${OL}" stroke-width="3.6" stroke-linecap="round"/><path d="M-3 2 L-5 9 M3 2 L4 9" stroke="#8a4220" stroke-width="2" stroke-linecap="round"/><path d="M-7 9 h4 M2 9 h4" stroke="#1e140c" stroke-width="2.4" stroke-linecap="round"/>`;
      s += `<ellipse cx="0" cy="-3" rx="6.5" ry="7" fill="url(#${p}fur)" stroke="${OL}" stroke-width="1.5"/>`;
      s += `<path d="M4 -5 L10 -2" stroke="${OL}" stroke-width="3.2" stroke-linecap="round"/><path d="M4 -5 L10 -2" stroke="#a85a2a" stroke-width="1.8" stroke-linecap="round"/>`;
      s += `<path d="M-6 -15 L-11 -14 L-6 -11 Z M6 -15 L11 -15 L6 -11 Z" fill="#a85a2a" stroke="${OL}" stroke-width="1"/>`;
      s += `<circle cx="1" cy="-13" r="6.2" fill="url(#${p}fur)" stroke="${OL}" stroke-width="1.5"/>`;
      s += `<path d="M-3 -17 Q-8 -24 -3 -26 Q-5 -22 -1 -19 Z M4 -18 Q8 -25 3 -27 Q6 -22 2 -19 Z" fill="#e8dcc0" stroke="${OL}" stroke-width="1" stroke-linejoin="round"/>`;
      s += eye(-0.5, -14, 1.6, '#ffd34d') + eye(4, -14, 1.6, '#ffd34d');
      s += `<path d="M-2 -10 Q2 -7 6 -10" stroke="${OL}" stroke-width="1.2" fill="#fff"/>`;
      return s;
    },
    runner(p) { // Chochlik
      let s = shadow(8, 9);
      s += `<path d="M-2 2 L-4 8 M2 2 L4 8" stroke="${OL}" stroke-width="3.2" stroke-linecap="round"/><path d="M-2 2 L-4 8 M2 2 L4 8" stroke="#6a8a3a" stroke-width="1.8" stroke-linecap="round"/><path d="M-6 8.5 h3 M3 8.5 h4" stroke="#4a2f14" stroke-width="2.4" stroke-linecap="round"/>`;
      s += `<path d="M-5 -6 Q-6 3 0 3 Q6 3 5 -6 Z" fill="#6a5a2a" stroke="${OL}" stroke-width="1.3"/>`;
      s += `<path d="M4 -4 L9 -1" stroke="${OL}" stroke-width="2.8" stroke-linecap="round"/><path d="M4 -4 L9 -1" stroke="#9ccc6a" stroke-width="1.5" stroke-linecap="round"/>`;
      s += `<path d="M-4 -12 L-14 -15 L-5 -9 Z M5 -12 L13 -16 L5 -9 Z" fill="url(#${p}gob)" stroke="${OL}" stroke-width="1"/>`;
      s += `<circle cx="0" cy="-11" r="5" fill="url(#${p}gob)" stroke="${OL}" stroke-width="1.3"/>`;
      s += `<path d="M3 -11 L9 -9 L3 -8 Z" fill="#8cbc5a" stroke="${OL}" stroke-width="0.9"/>`;
      s += eye(0.5, -12, 1.4, '#ffe066') + eye(3.6, -12, 1.3, '#ffe066');
      s += `<path d="M-6 -12 Q-6 -18 -1 -22 L3 -16 Q5 -13 5 -12 Q0 -15 -6 -12 Z" fill="#7a5a2a" stroke="${OL}" stroke-width="1.2" stroke-linejoin="round"/>`;
      s += `<path d="M-3 -18 q-7 -4 -9 -3 q4 2 8 5" fill="#c2332b" stroke="${OL}" stroke-width="0.7"/>`;
      return s;
    },
    armored(p) { // Wilkołak — four-legged with a studded collar
      let s = shadow(16, 9);
      s += `<path d="M-14 -6 Q-22 -10 -21 -18 Q-17 -12 -12 -11" fill="url(#${p}wolf)" stroke="${OL}" stroke-width="1.2"/>`;
      for (const [x, d] of [[-10, -1], [-5, 1], [6, -1], [10, 1]]) s += `<path d="M${x} -2 L${x + d} 8" stroke="${OL}" stroke-width="4" stroke-linecap="round"/><path d="M${x} -2 L${x + d} 8" stroke="#5a6068" stroke-width="2.4" stroke-linecap="round"/>`;
      s += `<path d="M-14 -4 Q-15 -13 -6 -14 L8 -15 Q14 -14 14 -6 Q12 1 0 1 Q-12 1 -14 -4 Z" fill="url(#${p}wolf)" stroke="${OL}" stroke-width="1.6"/>`;
      s += `<path d="M-10 -12 l-2 -3 M-5 -13 l-1 -3 M1 -14 l0 -3 M-8 -4 q3 -2 6 0" stroke="#2a2e34" stroke-width="1" fill="none"/>`;
      s += `<path d="M9 -14 Q12 -21 18 -19 L23 -14 Q24 -11 21 -10 L14 -9 Q10 -9 9 -14 Z" fill="url(#${p}wolf)" stroke="${OL}" stroke-width="1.5"/>`;
      s += `<path d="M11 -18 L11 -24 L15 -20 Z" fill="#5a6068" stroke="${OL}" stroke-width="1"/><path d="M14 -19 L16 -25 L18 -19 Z" fill="#5a6068" stroke="${OL}" stroke-width="1"/>`;
      s += `<circle cx="22.5" cy="-13" r="1.2" fill="${OL}"/>` + eye(16, -16, 1.5, '#ffcf3a');
      s += `<path d="M17 -10.5 l1 2 1 -2 1 2" stroke="#fff" stroke-width="0.8" fill="none"/>`;
      s += `<path d="M8 -16 Q11 -8 9 -5" stroke="${OL}" stroke-width="3.8" fill="none"/><path d="M8 -16 Q11 -8 9 -5" stroke="#4a4f59" stroke-width="2.4" fill="none"/><path d="M8.6 -14 l0.8 0 M9.6 -11 h0.8 M9.6 -8 h0.8" stroke="#c9ced6" stroke-width="1.4" stroke-linecap="round"/>`;
      return s;
    },
    swarm(p) { // Błędne ogniki
      let s = '';
      for (const [bx, by, sc] of [[-7, -4, 1], [6, -9, 0.85], [1, 4, 0.9]]) {
        s += `<ellipse cx="${bx}" cy="${f1(by + 12)}" rx="${f1(4 * sc)}" ry="1.4" fill="#000" opacity="0.18"/>`;
        s += `<circle cx="${bx}" cy="${by}" r="${f1(10 * sc)}" fill="url(#${p}wisp)"/>`;
        s += `<path d="M${bx} ${f1(by - 9 * sc)} Q${f1(bx + 6 * sc)} ${f1(by - 2 * sc)} ${f1(bx + 4 * sc)} ${f1(by + 3 * sc)} Q${bx} ${f1(by + 7 * sc)} ${f1(bx - 4 * sc)} ${f1(by + 3 * sc)} Q${f1(bx - 6 * sc)} ${f1(by - 2 * sc)} ${bx} ${f1(by - 9 * sc)} Z" fill="#d8ffd8" stroke="#6ad08a" stroke-width="1"/>`;
        s += `<circle cx="${f1(bx - 1.4)}" cy="${f1(by + 0.5)}" r="0.9" fill="#2a6a3a"/><circle cx="${f1(bx + 1.6)}" cy="${f1(by + 0.5)}" r="0.9" fill="#2a6a3a"/><path d="M${f1(bx - 1)} ${f1(by + 2.5)} q1 1 2 0" stroke="#2a6a3a" stroke-width="0.7" fill="none"/>`;
      }
      return s;
    },
    glut(p) { return toad(p, 1); },
    glutek(p) { return toad(p, 0.6); },
    ghost(p) { // Strzyga — owl with spread wings
      let s = `<ellipse cx="2" cy="18" rx="9" ry="2.6" fill="#000" opacity="0.18"/>`;
      for (const sg of [-1, 1]) {
        s += `<path d="M${sg * 4} -6 Q${sg * 14} -16 ${sg * 26} -14 Q${sg * 22} -10 ${sg * 24} -6 Q${sg * 18} -6 ${sg * 20} -1 Q${sg * 13} -3 ${sg * 13} 2 Q${sg * 8} -1 ${sg * 5} 2 Z" fill="url(#${p}owl)" stroke="${OL}" stroke-width="1.3" stroke-linejoin="round"/>`;
        s += `<path d="M${sg * 8} -8 l${sg * 10} -3 M${sg * 9} -5 l${sg * 9} 0 M${sg * 9} -2 l${sg * 6} 2" stroke="#3a2614" stroke-width="0.8"/>`;
      }
      s += `<ellipse cx="0" cy="0" rx="7.5" ry="10" fill="url(#${p}owl)" stroke="${OL}" stroke-width="1.5"/>`;
      s += `<path d="M-4 2 q1 1.5 2 0 q1 1.5 2 0 q1 1.5 2 0 M-4 6 q1 1.5 2 0 q1 1.5 2 0 q1 1.5 2 0" stroke="#e8d8b8" stroke-width="0.8" fill="none"/>`;
      s += `<path d="M-6 -8 L-7 -15 L-3 -10 Z M6 -8 L7 -15 L3 -10 Z" fill="#7a5a3a" stroke="${OL}" stroke-width="1"/>`;
      s += `<ellipse cx="0" cy="-6" rx="7" ry="5.5" fill="#d8c4a0" stroke="${OL}" stroke-width="1"/>`;
      s += eye(-3, -6.5, 2.6, '#ff9a2a') + eye(3, -6.5, 2.6, '#ff9a2a');
      s += `<path d="M-1 -4 L0 -1 L1 -4 Z" fill="#5a4020" stroke="${OL}" stroke-width="0.6"/>`;
      s += `<path d="M-3 9 l-1 3 M-2 9 l0 3 M2 9 l0 3 M3 9 l1 3" stroke="#d8b84a" stroke-width="1.2" stroke-linecap="round"/>`;
      return s;
    },
    bat(p) { // Latawiec — winged imp
      let s = `<ellipse cx="2" cy="16" rx="7" ry="2.2" fill="#000" opacity="0.18"/>`;
      for (const sg of [-1, 1]) s += `<path d="M${sg * 3} -6 Q${sg * 10} -18 ${sg * 20} -14 Q${sg * 17} -10 ${sg * 18} -6 Q${sg * 14} -8 ${sg * 12} -3 Q${sg * 9} -6 ${sg * 4} -1 Z" fill="#6a4a3a" stroke="${OL}" stroke-width="1.2" stroke-linejoin="round"/><path d="M${sg * 4} -5 L${sg * 18} -13 M${sg * 6} -4 L${sg * 14} -6" stroke="${OL}" stroke-width="0.7"/>`;
      s += `<path d="M-2 3 L-3 9 M2 3 L3 9" stroke="${OL}" stroke-width="2.6" stroke-linecap="round"/><path d="M-2 3 L-3 9 M2 3 L3 9" stroke="#8a5a3a" stroke-width="1.3" stroke-linecap="round"/>`;
      s += `<ellipse cx="0" cy="-1" rx="4.5" ry="5.5" fill="url(#${p}imp)" stroke="${OL}" stroke-width="1.3"/>`;
      s += `<circle cx="0.5" cy="-8" r="4.4" fill="url(#${p}imp)" stroke="${OL}" stroke-width="1.3"/>`;
      s += `<path d="M-2.5 -11 l-1.5 -4 3 2 M3 -11 l2 -4 -0.5 3.5" stroke="#e8dcc0" stroke-width="1.3" fill="none" stroke-linecap="round"/>`;
      s += `<circle cx="-0.8" cy="-8.4" r="1" fill="#ff3a2a"/><circle cx="2.4" cy="-8.4" r="1" fill="#ff3a2a"/><path d="M-0.5 -6 l0.8 1.2 0.8 -1.2" stroke="#fff" stroke-width="0.7" fill="none"/>`;
      return s;
    },
    shield(p) { // Nawiec — ghostly warrior
      let s = shadow(10, 10);
      s += `<path d="M-3 2 L-4 9 M3 2 L4 9" stroke="${OL}" stroke-width="3.6" stroke-linecap="round"/><path d="M-3 2 L-4 9 M3 2 L4 9" stroke="#3a4048" stroke-width="2" stroke-linecap="round"/>`;
      s += `<path d="M-6 -12 Q-7 3 0 3 Q7 3 6 -12 Z" fill="url(#${p}mail)" stroke="${OL}" stroke-width="1.4"/>`;
      s += `<path d="M-5 -8 h10 M-5.5 -4 h11 M-5.5 0 h11" stroke="#3a4048" stroke-width="0.8" stroke-dasharray="1 1"/>`;
      s += `<circle cx="0.5" cy="-17" r="5.2" fill="url(#${p}dead)" stroke="${OL}" stroke-width="1.3"/>`;
      s += `<circle cx="-0.8" cy="-17" r="1.3" fill="#e8ffff"/><circle cx="3" cy="-17" r="1.3" fill="#e8ffff"/><path d="M-1 -13.5 h4" stroke="${OL}" stroke-width="1"/>`;
      s += `<path d="M-5.5 -18 Q-5 -27 0.5 -28 Q6 -27 6.5 -18 Z" fill="url(#${p}mail)" stroke="${OL}" stroke-width="1.2"/><path d="M0.5 -28 v-2" stroke="${OL}" stroke-width="1.4"/><path d="M1 -19 v5" stroke="#4a5058" stroke-width="1.6"/>`;
      s += `<circle cx="7" cy="-4" r="8" fill="#8a5a2e" stroke="${OL}" stroke-width="1.6"/><circle cx="7" cy="-4" r="8" fill="none" stroke="#9aa0a8" stroke-width="1.6"/>`;
      s += `<path d="M1 -4 h12 M7 -10 v12" stroke="#5a3a1a" stroke-width="0.8"/><circle cx="7" cy="-4" r="2.4" fill="#c9ced6" stroke="${OL}" stroke-width="0.9"/>`;
      return s;
    },
    shaman(p) { // Wiedźma
      let s = shadow(10, 10);
      s += `<path d="M9 9 L12 -22" stroke="${OL}" stroke-width="3.2" stroke-linecap="round"/><path d="M9 9 L12 -22" stroke="#7a5230" stroke-width="1.8" stroke-linecap="round"/>`;
      s += `<circle cx="12" cy="-26" r="7" fill="url(#${p}greenglow)"/><path d="M10 -24 q1 -6 2 -9 q2 4 2 9 q-2 2 -4 0 z" fill="#b8ff8a" stroke="#3f9a3a" stroke-width="0.8"/>`;
      s += `<path d="M-9 9 Q-11 -6 -3 -12 Q4 -13 7 -6 L9 9 Q0 11 -9 9 Z" fill="url(#${p}cloth)" stroke="${OL}" stroke-width="1.5" stroke-linejoin="round"/>`;
      s += `<path d="M-8 6 l2 3 2 -3 2 3 2 -3 2 3 2 -3 2 3" stroke="${OL}" stroke-width="0.8" fill="none"/>`;
      s += `<path d="M5 -5 L10 -6" stroke="${OL}" stroke-width="3" stroke-linecap="round"/><path d="M5 -5 L10 -6" stroke="url(#${p}skin)" stroke-width="1.6" stroke-linecap="round"/>`;
      s += `<circle cx="2" cy="-15" r="5" fill="#d8b890" stroke="${OL}" stroke-width="1.2"/>`;
      s += `<path d="M-4 -14 Q-6 -24 2 -22 Q8 -23 7 -14 Q5 -19 2 -19 Q-2 -19 -4 -14 Z" fill="#c8c8c0" stroke="${OL}" stroke-width="0.9"/><path d="M-4 -14 q-2 5 -1 9 M-3 -12 q-1 5 1 8" stroke="#c8c8c0" stroke-width="1.4" fill="none"/>`;
      s += `<path d="M-3.5 -18 Q2 -21 7 -18" stroke="#b8322a" stroke-width="2.2" fill="none"/>`;
      s += `<path d="M5 -15 l4 3 -4 0" fill="#c8a07a" stroke="${OL}" stroke-width="0.8"/><circle cx="3.6" cy="-16" r="0.9" fill="${OL}"/><path d="M1 -12 q2 1 3 0" stroke="${OL}" stroke-width="0.8" fill="none"/>`;
      return s;
    },
    poludnica(p) { // Południca — maiden in white with a sickle and a straw hat
      let s = shadow(9, 10);
      s += `<path d="M-7 9 Q-8 -4 -4 -10 L4 -10 Q8 -4 7 9 Q0 11 -7 9 Z" fill="#f4f0e2" stroke="${OL}" stroke-width="1.4"/>`;
      s += `<path d="M-6 4 h12 M-6.5 6.5 h13" stroke="#c2332b" stroke-width="1" stroke-dasharray="2 1.5"/>`;
      s += `<path d="M3 -7 L10 -12" stroke="${OL}" stroke-width="2.6" stroke-linecap="round"/><path d="M3 -7 L10 -12" stroke="url(#${p}skin)" stroke-width="1.4" stroke-linecap="round"/>`;
      s += `<path d="M9 -10 L13 -20" stroke="${OL}" stroke-width="2.4" stroke-linecap="round"/><path d="M9 -10 L13 -20" stroke="#7a5230" stroke-width="1.2"/>`;
      s += `<path d="M13 -20 Q24 -22 22 -10 Q20 -18 13 -17 Z" fill="#d7dbe2" stroke="${OL}" stroke-width="1.1"/>`;
      s += `<circle cx="0" cy="-15" r="4.6" fill="#f2d6c0" stroke="${OL}" stroke-width="1.1"/>`;
      s += `<path d="M-3 -14 q-3 5 -2 12 M3 -14 q2 5 1 10" stroke="#e8c050" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
      s += `<ellipse cx="0" cy="-19" rx="10" ry="2.8" fill="#e8c878" stroke="${OL}" stroke-width="1.1"/><path d="M-5 -19 Q0 -27 5 -19 Z" fill="#e8c878" stroke="${OL}" stroke-width="1.1"/><path d="M-9 -19 h18" stroke="#c2332b" stroke-width="0.9"/>`;
      s += `<circle cx="-1" cy="-15" r="0.9" fill="#2a5aa0"/><circle cx="2" cy="-15" r="0.9" fill="#2a5aa0"/><path d="M-1 -12.5 q1.5 0.8 3 0" stroke="${OL}" stroke-width="0.7" fill="none"/>`;
      return s;
    },
    zmora(p) { // Zmora — shadowy hag-spirit with long claws
      let s = `<ellipse cx="2" cy="10" rx="9" ry="2.6" fill="#000" opacity="0.25"/>`;
      s += `<path d="M-9 9 Q-11 -4 -6 -12 Q0 -18 6 -12 Q11 -4 9 9 l-3 -3 -3 3 -3 -3 -3 3 -3 -3 z" fill="#3a2a4a" stroke="${OL}" stroke-width="1.4" stroke-linejoin="round"/>`;
      s += `<path d="M-6 -8 Q-2 -2 -4 6 M3 -8 Q6 -2 4 6" stroke="#5a4a6e" stroke-width="1" fill="none"/>`;
      s += `<path d="M5 -6 Q12 -8 14 -2" stroke="${OL}" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M5 -6 Q12 -8 14 -2" stroke="#6a5a7e" stroke-width="1.3" fill="none" stroke-linecap="round"/>`;
      s += `<path d="M14 -2 l3 2 M14 -2 l2 3 M14 -2 l0 4" stroke="#d8d0e8" stroke-width="1" stroke-linecap="round"/>`;
      s += `<path d="M-7 -14 Q-9 -26 0 -27 Q9 -26 7 -14 Q0 -10 -7 -14 Z" fill="#2a1e36" stroke="${OL}" stroke-width="1.3"/>`;
      s += `<path d="M-8 -16 q-4 6 -3 12 M8 -16 q4 6 2 12" stroke="#2a1e36" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
      s += `<circle cx="-2" cy="-19" r="1.6" fill="#c8a0ff"/><circle cx="3" cy="-19" r="1.6" fill="#c8a0ff"/><circle cx="-2" cy="-19" r="3" fill="#c8a0ff" opacity="0.25"/><circle cx="3" cy="-19" r="3" fill="#c8a0ff" opacity="0.25"/>`;
      return s;
    },
    rusalka(p) { // Rusałka — pale water maiden with long green hair and a flower wreath
      let s = shadow(9, 10);
      s += `<path d="M-7 9 Q-7 -4 -3 -9 L3 -9 Q7 -4 7 9 Q0 11 -7 9 Z" fill="#cfe8e0" stroke="${OL}" stroke-width="1.4" opacity="0.95"/>`;
      s += `<path d="M-5 0 q1 4 0 8 M0 -2 v10 M5 0 q-1 4 0 8" stroke="#8ac0b0" stroke-width="0.9" fill="none"/>`;
      s += `<path d="M-6 -16 Q-12 -4 -9 8 M6 -16 Q10 -4 8 6" stroke="${OL}" stroke-width="4.4" fill="none" stroke-linecap="round"/><path d="M-6 -16 Q-12 -4 -9 8 M6 -16 Q10 -4 8 6" stroke="#4a9a6a" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      s += `<circle cx="0" cy="-15" r="4.8" fill="#dff0ea" stroke="${OL}" stroke-width="1.1"/>`;
      s += `<path d="M-5 -17 Q0 -22 5 -17" stroke="#4a9a6a" stroke-width="3" fill="none"/>`;
      for (const [x, c] of [[-4.5, '#f27aa6'], [-1.5, '#fff6e8'], [1.5, '#ffd23a'], [4.5, '#8ab8ff']]) s += `<circle cx="${x}" cy="-20" r="1.5" fill="${c}" stroke="${OL}" stroke-width="0.5"/>`;
      s += `<circle cx="-1" cy="-15" r="0.9" fill="#1a5a4a"/><circle cx="2" cy="-15" r="0.9" fill="#1a5a4a"/><path d="M-0.5 -12.5 q1.2 0.7 2.4 0" stroke="${OL}" stroke-width="0.7" fill="none"/>`;
      s += `<path d="M8 4 q1 3 0 5 M-9 5 q-1 3 0 4" stroke="#8fd8ff" stroke-width="1.2" fill="none" stroke-linecap="round"/>`;
      return s;
    },
    bebok(p) { // Bebok — hulking furry brute
      let s = shadow(15, 13);
      s += `<path d="M-6 6 L-7 12 M6 6 L7 12" stroke="${OL}" stroke-width="7" stroke-linecap="round"/><path d="M-6 6 L-7 12 M6 6 L7 12" stroke="#4a3420" stroke-width="5" stroke-linecap="round"/>`;
      s += `<path d="M-15 -10 Q-19 4 -15 9 M15 -10 Q19 4 15 9" stroke="${OL}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M-15 -10 Q-19 4 -15 9 M15 -10 Q19 4 15 9" stroke="#6a4a2c" stroke-width="5" fill="none" stroke-linecap="round"/>`;
      s += `<path d="M-15 4 Q-17 -14 -8 -20 Q0 -24 8 -20 Q17 -14 15 4 Q12 10 0 10 Q-12 10 -15 4 Z" fill="url(#${p}furB)" stroke="${OL}" stroke-width="1.8"/>`;
      s += `<path d="M-12 -8 l-2 -3 M-6 -14 l-1 -3 M6 -14 l1 -3 M12 -8 l2 -3 M-10 2 l-2 2 M10 2 l2 2" stroke="#2e2014" stroke-width="1.2" stroke-linecap="round"/>`;
      s += `<ellipse cx="2" cy="-2" rx="7" ry="6" fill="#a88a6a" stroke="${OL}" stroke-width="1"/>`;
      s += `<circle cx="3" cy="-21" r="5.5" fill="url(#${p}furB)" stroke="${OL}" stroke-width="1.3"/>`;
      s += `<path d="M-1 -25 l-2 -3 M7 -25 l2 -3" stroke="#e8dcc0" stroke-width="1.6" stroke-linecap="round"/>`;
      s += `<circle cx="2" cy="-21" r="1.1" fill="#ffcf3a"/><circle cx="5.5" cy="-21" r="1.1" fill="#ffcf3a"/><path d="M1.5 -18 q2.5 1.4 5 0" stroke="${OL}" stroke-width="1" fill="none"/><path d="M2 -18 l0.6 1.6 M5.5 -18 l-0.6 1.6" stroke="#fff" stroke-width="0.8"/>`;
      return s;
    },
    // ---------------------------------------------------------- bosses
    ogre(p) { // Leszy
      let s = shadow(18, 17);
      s += `<path d="M-8 4 L-9 16 M7 4 L8 16" stroke="${OL}" stroke-width="7" stroke-linecap="round"/><path d="M-8 4 L-9 16 M7 4 L8 16" stroke="#5e5a30" stroke-width="5" stroke-linecap="round"/>`;
      s += `<path d="M-14 -20 Q-20 -6 -17 6 L-14 7 M14 -20 Q21 -6 18 6 L15 7" stroke="${OL}" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M-14 -20 Q-20 -6 -17 6 M14 -20 Q21 -6 18 6" stroke="#6a6636" stroke-width="5" stroke-linecap="round" fill="none"/>`;
      s += `<path d="M-19 7 l-2 4 M-17 7 l-1 5 M-15 7 l0 4 M17 7 l1 4 M19 7 l2 4 M15 7 l0 4" stroke="${OL}" stroke-width="1.6" stroke-linecap="round"/>`;
      s += `<path d="M-14 -24 Q-16 -2 -9 6 L9 6 Q16 -2 14 -24 Q0 -30 -14 -24 Z" fill="url(#${p}bark)" stroke="${OL}" stroke-width="1.8"/>`;
      s += `<path d="M-8 -20 q2 8 0 18 M2 -22 q-2 10 1 22 M9 -18 q-1 6 1 14" stroke="#2e2c16" stroke-width="1.1" fill="none"/>`;
      s += `<path d="M-14 -14 Q-4 -8 6 -16 Q12 -10 15 -12 M-12 -2 Q0 4 13 -4" stroke="#3a6a1a" stroke-width="2.2" fill="none"/><path d="M-6 -11 l-2 -2 M8 -14 l2 -2 M4 1 l1 2" stroke="#7ab83a" stroke-width="2" stroke-linecap="round"/>`;
      s += `<ellipse cx="0" cy="-32" rx="9" ry="9" fill="url(#${p}bark)" stroke="${OL}" stroke-width="1.6"/>`;
      s += `<path d="M-8 -30 Q-10 -14 0 -10 Q10 -14 8 -30 Q4 -26 0 -26 Q-4 -26 -8 -30 Z" fill="#5a8a2a" stroke="${OL}" stroke-width="1.2"/><path d="M-5 -26 v9 M-1 -25 v12 M3 -25 v10 M6 -27 v7" stroke="#8ac84a" stroke-width="0.9"/>`;
      s += `<circle cx="-3" cy="-33" r="1.8" fill="#b8ff7a"/><circle cx="3.5" cy="-33" r="1.8" fill="#b8ff7a"/><path d="M-6 -36 l5 1.5 M7 -36 l-5 1.5" stroke="${OL}" stroke-width="1.6"/>`;
      for (const sg of [-1, 1]) {
        const d = `M${sg * 4} -39 Q${sg * 10} -48 ${sg * 8} -56 M${sg * 7} -45 Q${sg * 14} -48 ${sg * 20} -54 M${sg * 13} -48 Q${sg * 18} -44 ${sg * 24} -45 M${sg * 8} -51 Q${sg * 4} -55 ${sg * 3} -58`;
        s += `<path d="${d}" stroke="${OL}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#8a6a44" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
      }
      return s;
    },
    boss(p) { // Wołot — giant with a club
      let s = shadow(19, 18);
      s += `<path d="M-7 6 L-8 16 M7 6 L8 16" stroke="${OL}" stroke-width="8" stroke-linecap="round"/><path d="M-7 6 L-8 16 M7 6 L8 16" stroke="#5a4028" stroke-width="6" stroke-linecap="round"/><path d="M-12 17 h8 M5 17 h9" stroke="#3a2614" stroke-width="4" stroke-linecap="round"/>`;
      s += `<path d="M-16 -22 Q-20 -4 -12 8 L12 8 Q20 -4 16 -22 Q0 -30 -16 -22 Z" fill="url(#${p}furB)" stroke="${OL}" stroke-width="1.8"/>`;
      s += `<path d="M-15 -2 H15" stroke="#3a2614" stroke-width="3.4"/><rect x="-3" y="-4.5" width="6" height="5" rx="1" fill="#c9a46a" stroke="${OL}" stroke-width="0.8"/>`;
      s += `<path d="M-15 -20 l-3 4 M-13 -14 l-3 3 M14 -20 l3 4 M13 -10 l3 2 M-10 2 l-2 3 M10 3 l2 3" stroke="#c9a47a" stroke-width="1.6" stroke-linecap="round"/>`;
      s += `<path d="M-16 -20 L-20 -4" stroke="${OL}" stroke-width="7" stroke-linecap="round"/><path d="M-16 -20 L-20 -4" stroke="url(#${p}skin)" stroke-width="5" stroke-linecap="round"/>`;
      s += `<path d="M-30 -2 L22 -40" stroke="${OL}" stroke-width="9" stroke-linecap="round"/><path d="M-30 -2 L22 -40" stroke="#8a5e34" stroke-width="7" stroke-linecap="round"/><path d="M8 -30 L24 -42" stroke="${OL}" stroke-width="12" stroke-linecap="round"/><path d="M8 -30 L24 -42" stroke="#9a6e44" stroke-width="10" stroke-linecap="round"/><path d="M12 -33 l3 -1 M18 -38 l2 1" stroke="#5a3a1a" stroke-width="1.2"/>`;
      s += `<path d="M14 -22 L12 -32" stroke="${OL}" stroke-width="7" stroke-linecap="round"/><path d="M14 -22 L12 -32" stroke="url(#${p}skin)" stroke-width="5" stroke-linecap="round"/>`;
      s += `<circle cx="0" cy="-33" r="8.5" fill="url(#${p}skin)" stroke="${OL}" stroke-width="1.6"/>`;
      s += `<path d="M-8 -34 Q-8 -45 0 -45 Q8 -45 8 -34 Z" fill="#8a919c" stroke="${OL}" stroke-width="1.4"/><path d="M-9 -34 H9" stroke="#5a6068" stroke-width="2.2"/><path d="M1 -35 v7" stroke="#5a6068" stroke-width="2.2"/>`;
      s += `<circle cx="-3" cy="-31.5" r="1.3" fill="${OL}"/><circle cx="4.5" cy="-31.5" r="1.3" fill="${OL}"/>`;
      s += `<path d="M-8 -28 Q-9 -16 -3 -10 L0 -4 L3 -10 Q9 -16 8 -28 Q3 -24 0 -26 Q-3 -24 -8 -28 Z" fill="#d8722a" stroke="${OL}" stroke-width="1.3"/>`;
      s += `<path d="M0 -24 V-6 M-2 -20 l2 2 2 -2 M-2 -15 l2 2 2 -2 M-2 -10 l2 2 2 -2" stroke="#8a3a10" stroke-width="0.9" fill="none"/>`;
      return s;
    },
    queen(p) { // Baba Jaga in a mortar
      let s = shadow(18, 18);
      s += `<path d="M-22 -8 L14 -30" stroke="${OL}" stroke-width="3.6" stroke-linecap="round"/><path d="M-22 -8 L14 -30" stroke="#8a6a3a" stroke-width="2" stroke-linecap="round"/>`;
      s += `<path d="M-22 -8 l-8 -2 M-22 -8 l-8 3 M-22 -8 l-6 6 M-22 -8 l-9 -6 M-22 -8 l-4 8" stroke="#c9a04a" stroke-width="2" stroke-linecap="round"/>`;
      s += `<path d="M-15 -6 L-12 15 Q0 20 12 15 L15 -6 Z" fill="url(#${p}logs)" stroke="${OL}" stroke-width="1.8"/>`;
      s += `<path d="M-14 0 Q0 5 14 0 M-13 8 Q0 13 13 8" stroke="#3a2410" stroke-width="1.6" fill="none"/>`;
      s += `<path d="M-14 0 Q0 5 14 0" stroke="#c2332b" stroke-width="1.6" fill="none" stroke-dasharray="3 2"/>`;
      s += `<path d="M-10 -6 Q-11 -20 -2 -22 Q8 -22 8 -6 Z" fill="#6a6a6e" stroke="${OL}" stroke-width="1.4"/>`;
      s += `<path d="M6 -14 L14 -16" stroke="${OL}" stroke-width="3.4" stroke-linecap="round"/><path d="M6 -14 L14 -16" stroke="url(#${p}skin)" stroke-width="2" stroke-linecap="round"/>`;
      s += `<path d="M14 -40 L13 4" stroke="${OL}" stroke-width="4.6" stroke-linecap="round"/><path d="M14 -40 L13 4" stroke="#a87447" stroke-width="3" stroke-linecap="round"/><ellipse cx="14" cy="-41" rx="3.4" ry="2.4" fill="#a87447" stroke="${OL}" stroke-width="1"/>`;
      s += `<ellipse cx="15" cy="-6" rx="15" ry="5" fill="#5e3b1c" stroke="${OL}" stroke-width="1.6" transform="translate(-15 0)"/>`;
      s += `<circle cx="0" cy="-28" r="6.5" fill="#d8b891" stroke="${OL}" stroke-width="1.3"/>`;
      s += `<path d="M3 -28 q6 1 5 6 l-4 -2" fill="#c9a07a" stroke="${OL}" stroke-width="0.9"/>`;
      s += `<circle cx="1" cy="-30" r="1.1" fill="${OL}"/><circle cx="4" cy="-30" r="1" fill="${OL}"/><path d="M-1 -24 q3 1 5 -1" stroke="${OL}" stroke-width="0.9" fill="none"/><rect x="1" y="-24.5" width="1.4" height="2" fill="#f4ecd6"/>`;
      s += `<path d="M-7 -27 Q-9 -39 0 -39 Q7 -39 7 -30 Q2 -34 -2 -33 Q-5 -32 -7 -27 Z" fill="#c2332b" stroke="${OL}" stroke-width="1.3"/>`;
      for (const [x, y] of [[-4, -35], [1, -36.5], [4, -33.5], [-6, -30.5], [-1, -33]]) s += `<circle cx="${x}" cy="${y}" r="1.1" fill="#fff6e8"/>`;
      s += `<path d="M-7 -27 l-4 4 3 1" fill="#c2332b" stroke="${OL}" stroke-width="0.9"/><path d="M-6 -25 q-2 4 -1 8" stroke="#d6d6cc" stroke-width="1.4" fill="none"/>`;
      return s;
    },
    golem(p) { // Licho — one-eyed stone horror
      let s = shadow(21, 17);
      s += `<path d="M-8 6 L-10 16 M8 6 L10 16" stroke="${OL}" stroke-width="9" stroke-linecap="round"/><path d="M-8 6 L-10 16 M8 6 L10 16" stroke="#4a4d44" stroke-width="7" stroke-linecap="round"/>`;
      s += `<path d="M-17 -16 L-25 0 L-22 10 M17 -16 L25 0 L22 10" stroke="${OL}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M-17 -16 L-25 0 L-22 10 M17 -16 L25 0 L22 10" stroke="#55594e" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
      s += `<path d="M-24 2 l3 2 M23 3 l-3 2 M-22 -6 l4 -1" stroke="#ff8a2a" stroke-width="1.6" stroke-linecap="round"/>`;
      s += `<path d="M-19 4 L-21 -14 L-12 -32 L4 -36 L17 -28 L21 -12 L18 6 L6 10 L-8 10 Z" fill="url(#${p}rockM)" stroke="${OL}" stroke-width="2" stroke-linejoin="round"/>`;
      s += `<path d="M-20 -14 Q-12 -22 -6 -30 Q2 -36 10 -32 Q16 -26 18 -22 Q8 -28 0 -26 Q-10 -22 -20 -14 Z" fill="#5a7a2a" stroke="${OL}" stroke-width="1"/><path d="M-14 -20 l-1 -3 M-6 -26 l0 -3 M6 -30 l1 -3 M12 -26 l2 -2" stroke="#8ab84a" stroke-width="1.4" stroke-linecap="round"/>`;
      s += `<path d="M-15 -4 L-9 0 L-11 6 M10 -8 L14 0 L11 5 M-4 2 L1 6 L-1 9" stroke="#ff7a1a" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M-15 -4 L-9 0 M10 -8 L14 0" stroke="#ffd48a" stroke-width="0.8" fill="none"/>`;
      s += `<circle cx="1" cy="-14" r="8" fill="#2a1a10" stroke="${OL}" stroke-width="1.6"/><circle cx="1" cy="-14" r="6.4" fill="#ff6a2a"/><circle cx="1" cy="-14" r="4" fill="#ffc06a"/><circle cx="2" cy="-14" r="2.2" fill="#2a0a05"/><circle cx="-1" cy="-16" r="1" fill="#fff"/>`;
      s += `<path d="M-8 -23 Q1 -27 10 -23" stroke="${OL}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
      return s;
    },
    wraith(p) { // Żmij — winged serpent dragon
      let s = `<ellipse cx="0" cy="24" rx="18" ry="4" fill="#000" opacity="0.2"/>`;
      s += `<path d="M-6 -12 Q-4 -40 14 -44 Q8 -36 12 -32 Q4 -30 8 -24 Q0 -24 2 -16 Z" fill="#7a7a3a" stroke="${OL}" stroke-width="1.5" stroke-linejoin="round"/><path d="M-4 -14 L12 -42 M-2 -14 L10 -30 M0 -15 L6 -22" stroke="${OL}" stroke-width="0.9"/>`;
      s += `<path d="M-2 -10 Q-18 -4 -14 8 Q-10 18 4 16 Q16 14 12 6 Q8 0 -2 4" stroke="${OL}" stroke-width="11" fill="none" stroke-linecap="round"/><path d="M-2 -10 Q-18 -4 -14 8 Q-10 18 4 16 Q16 14 12 6 Q8 0 -2 4" stroke="url(#${p}dragon)" stroke-width="8.5" fill="none" stroke-linecap="round"/>`;
      s += `<path d="M-13 0 q3 2 1 5 M-8 13 q3 -1 4 2 M6 15 q0 -3 3 -3" stroke="#d6c87a" stroke-width="1.4" fill="none"/>`;
      s += `<path d="M-2 4 Q-8 6 -10 2 L-14 6 L-11 -2 Z" fill="#4a4a1e" stroke="${OL}" stroke-width="1"/>`;
      s += `<path d="M-2 -10 Q4 -18 10 -18" stroke="${OL}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M-2 -10 Q4 -18 10 -18" stroke="url(#${p}dragon)" stroke-width="6.5" fill="none" stroke-linecap="round"/>`;
      s += `<path d="M6 -22 Q14 -26 20 -20 L24 -18 Q24 -14 20 -14 L10 -13 Q5 -15 6 -22 Z" fill="url(#${p}dragon)" stroke="${OL}" stroke-width="1.5"/>`;
      s += `<path d="M8 -22 Q6 -30 2 -32 Q8 -30 11 -24 M12 -23 Q14 -31 12 -34 Q16 -30 15 -23" fill="#d8cca0" stroke="${OL}" stroke-width="1"/>`;
      s += eye(14, -19, 1.7, '#ffd23a') + `<path d="M17 -14.5 l1 1.6 1 -1.6 1 1.6" stroke="#fff" stroke-width="0.7" fill="none"/>`;
      s += `<path d="M24 -16 Q30 -18 34 -14 Q30 -12 34 -8 Q28 -10 24 -14" fill="#ff9a2a" stroke="#c2332b" stroke-width="0.9"/><path d="M25 -15 Q29 -15 31 -13" stroke="#ffe08a" stroke-width="1.4" fill="none"/>`;
      s += `<path d="M-4 -12 l-2 -3 M-1 -14 l-1 -3 M2 -16 l0 -3" stroke="#4a4a1e" stroke-width="1.6" stroke-linecap="round"/>`;
      return s;
    },
    behemoth(p) { // Czarnobóg
      let s = shadow(20, 19);
      s += `<circle cx="0" cy="-22" r="40" fill="url(#${p}redglow)"/>`;
      s += `<path d="M-14 -14 q-6 -8 -2 -16 M14 -10 q6 -8 3 -18 M-18 4 q-8 -4 -8 -12 M18 6 q8 -4 9 -12" stroke="#ff4a2c" stroke-width="2" fill="none" opacity="0.5"/>`;
      s += `<path d="M18 16 L22 -46" stroke="${OL}" stroke-width="4" stroke-linecap="round"/><path d="M18 16 L22 -46" stroke="#3a2a22" stroke-width="2.4" stroke-linecap="round"/>`;
      s += `<path d="M22 -46 q-4 -6 0 -12 q2 4 4 3 q1 5 -4 9 z" fill="#ff5a2a" stroke="#8a1a0a" stroke-width="0.9"/><circle cx="22" cy="-48" r="5" fill="url(#${p}redglow)"/>`;
      s += `<path d="M-14 -30 Q-20 -6 -18 18 L-12 14 L-8 19 L-3 14 L2 19 L7 14 L12 19 L17 14 Q20 -6 14 -30 Q0 -36 -14 -30 Z" fill="url(#${p}cloak)" stroke="${OL}" stroke-width="1.8" stroke-linejoin="round"/>`;
      s += `<path d="M-8 -26 Q-10 -4 -10 12 M0 -28 V14 M8 -26 Q10 -4 9 12" stroke="#2a2430" stroke-width="1.2" fill="none"/>`;
      s += `<path d="M14 -16 L20 -14" stroke="${OL}" stroke-width="4" stroke-linecap="round"/><path d="M14 -16 L20 -14" stroke="#b8b0a4" stroke-width="2.4" stroke-linecap="round"/>`;
      s += `<path d="M-10 -36 Q-12 -48 0 -50 Q12 -48 10 -36 Q8 -26 0 -24 Q-8 -26 -10 -36 Z" fill="#1a141e" stroke="${OL}" stroke-width="1.5"/>`;
      s += `<path d="M-6 -38 Q-6 -46 0 -46 Q6 -46 6 -38 Q5 -30 0 -28 Q-5 -30 -6 -38 Z" fill="#e8e2d6" stroke="${OL}" stroke-width="1.2"/>`;
      s += `<path d="M-4.5 -39 l3 1 -3 1 z M4.5 -39 l-3 1 3 1 z" fill="#ff2a1a"/><path d="M0 -36 v3 M-2 -31 h4" stroke="#6a6458" stroke-width="0.9"/>`;
      s += `<path d="M-6 -46 Q-14 -52 -14 -62 Q-10 -54 -3 -50 Z M6 -46 Q14 -52 14 -62 Q10 -54 3 -50 Z" fill="#1a141e" stroke="${OL}" stroke-width="1.3" stroke-linejoin="round"/>`;
      return s;
    },
  };
  function toad(p, k) { // Wodnik (k=1) / Utopiec (k=0.6)
    const S = (n) => f1(n * k);
    let s = `<ellipse cx="2" cy="${S(10)}" rx="${S(17)}" ry="${S(4.5)}" fill="#000" opacity="0.28"/>`;
    s += `<path d="M${S(-14)} ${S(8)} Q${S(-20)} ${S(4)} ${S(-16)} ${S(-2)}" stroke="${OL}" stroke-width="${S(6)}" fill="none" stroke-linecap="round"/><path d="M${S(-14)} ${S(8)} Q${S(-20)} ${S(4)} ${S(-16)} ${S(-2)}" stroke="#4fa88a" stroke-width="${S(4)}" fill="none" stroke-linecap="round"/>`;
    s += `<path d="M${S(-16)} ${S(6)} Q${S(-18)} ${S(-14)} ${S(-2)} ${S(-16)} Q${S(14)} ${S(-17)} ${S(17)} ${S(-4)} Q${S(19)} ${S(6)} ${S(10)} ${S(9)} L${S(-12)} ${S(9)} Z" fill="url(#${p}toad)" stroke="${OL}" stroke-width="${S(1.8)}"/>`;
    s += `<path d="M${S(8)} ${S(4)} L${S(9)} ${S(10)} M${S(4)} ${S(5)} L${S(3)} ${S(10)}" stroke="${OL}" stroke-width="${S(4)}" stroke-linecap="round"/><path d="M${S(8)} ${S(4)} L${S(9)} ${S(10)}" stroke="#5ab894" stroke-width="${S(2.4)}" stroke-linecap="round"/>`;
    s += `<path d="M${S(2)} ${S(-3)} Q${S(10)} ${S(2)} ${S(18)} ${S(-4)}" stroke="${OL}" stroke-width="${S(1.4)}" fill="#f0a0a0"/>`;
    s += `<circle cx="${S(-6)}" cy="${S(-8)}" r="${S(1.6)}" fill="#2a7a5e"/><circle cx="${S(-10)}" cy="${S(-2)}" r="${S(1.3)}" fill="#2a7a5e"/><circle cx="${S(-2)}" cy="${S(2)}" r="${S(1.4)}" fill="#2a7a5e"/>`;
    for (const ex of [S(5), S(12)]) s += `<circle cx="${ex}" cy="${S(-14)}" r="${S(4)}" fill="#8ad0b0" stroke="${OL}" stroke-width="${S(1.3)}"/><circle cx="${ex}" cy="${S(-14)}" r="${S(2.6)}" fill="#ffe04a"/><ellipse cx="${f1(ex + 0.4)}" cy="${S(-14)}" rx="${S(0.8)}" ry="${S(2)}" fill="${OL}"/>`;
    const hair = `M${S(-12)} ${S(-12)} q${S(-4)} ${S(6)} ${S(-6)} ${S(12)} M${S(-6)} ${S(-16)} q${S(-3)} ${S(8)} ${S(-8)} ${S(12)} M${S(0)} ${S(-17)} q${S(-1)} ${S(6)} ${S(-3)} ${S(10)} M${S(-3)} ${S(-17)} q${S(-5)} ${S(-3)} ${S(-7)} ${S(-8)}`;
    s += `<path d="${hair}" stroke="${OL}" stroke-width="${S(3)}" fill="none" stroke-linecap="round"/><path d="${hair}" stroke="#5a8a2a" stroke-width="${S(1.6)}" fill="none" stroke-linecap="round"/>`;
    s += `<ellipse cx="${S(-6)}" cy="${S(-12)}" rx="${S(3)}" ry="${S(1.6)}" fill="#fff" opacity="0.5"/>`;
    if (k > 0.8) s += `<path d="M18 -6 q2 3 0 5 M-18 2 q-2 3 0 5" stroke="#8fd8ff" stroke-width="1.4" fill="none" stroke-linecap="round"/><circle cx="19" cy="2" r="1.3" fill="#8fd8ff"/>`;
    return s;
  }
  TD.enemySvg = function (p, kind) {
    const fn = B[kind];
    return fn ? fn(p) : '';
  };

  // ============================================================ Gates of Nawia & the gród
  TD.nestSvg = function (p, col, row) {
    const cx = col * T + 46, cy = (row + 1) * T;
    let s = `<ellipse cx="${cx}" cy="${cy + 6}" rx="80" ry="64" fill="url(#${p}portalglow)"/>`;
    // the old oak
    s += `<ellipse cx="${cx + 4}" cy="${cy + 40}" rx="50" ry="10" fill="#000" opacity="0.35"/>`;
    const trunk = `M${cx - 20} ${cy + 20} Q${cx - 14} ${cy - 20} ${cx - 10} ${cy - 50} Q${cx - 6} ${cy - 66} ${cx - 12} ${cy - 80} M${cx + 16} ${cy + 20} Q${cx + 12} ${cy - 20} ${cx + 8} ${cy - 50} Q${cx + 10} ${cy - 66} ${cx + 22} ${cy - 76}`;
    s += `<path d="M${cx - 22} ${cy + 22} Q${cx - 14} ${cy - 20} ${cx - 12} ${cy - 54} L${cx + 10} ${cy - 54} Q${cx + 12} ${cy - 20} ${cx + 18} ${cy + 22} Z" fill="url(#${p}logs)" stroke="${OL}" stroke-width="2.4"/>`;
    s += `<path d="${trunk}" stroke="#4a2f14" stroke-width="2" fill="none"/>`;
    const br = [`M${cx - 10} ${cy - 50} Q${cx - 30} ${cy - 66} ${cx - 44} ${cy - 62}`, `M${cx - 8} ${cy - 54} Q${cx - 16} ${cy - 76} ${cx - 30} ${cy - 86}`, `M${cx + 6} ${cy - 52} Q${cx + 26} ${cy - 70} ${cx + 44} ${cy - 64}`, `M${cx + 4} ${cy - 54} Q${cx + 10} ${cy - 78} ${cx + 26} ${cy - 90}`, `M${cx - 30} ${cy - 86} l-6 -6 M${cx + 26} ${cy - 90} l6 -8 M${cx - 44} ${cy - 62} l-8 2 M${cx + 44} ${cy - 64} l8 -4`];
    for (const d of br) s += `<path d="${d}" stroke="${OL}" stroke-width="8" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#7a5230" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    for (const [x, y, c] of [[-46, -62, '#c2332b'], [-30, -86, '#3f78c0'], [44, -64, '#f0e6d0'], [26, -90, '#c2332b']]) s += `<path d="M${cx + x} ${cy + y} l-2 10 4 -1 z" fill="${c}" stroke="${OL}" stroke-width="0.8"/>`;
    // the rift with roots
    s += `<ellipse cx="${cx}" cy="${cy + 14}" rx="40" ry="22" fill="#1c0e30" stroke="${OL}" stroke-width="2.4"/>`;
    s += `<ellipse cx="${cx}" cy="${cy + 15}" rx="34" ry="17" fill="url(#${p}rift)"/>`;
    s += `<ellipse cx="${cx}" cy="${cy + 15}" rx="22" ry="9" fill="#efe0ff" opacity="0.35"/>`;
    const roots = [`M${cx - 18} ${cy + 18} Q${cx - 30} ${cy + 22} ${cx - 42} ${cy + 18}`, `M${cx - 12} ${cy + 20} Q${cx - 14} ${cy + 30} ${cx - 26} ${cy + 36}`, `M${cx + 14} ${cy + 20} Q${cx + 22} ${cy + 30} ${cx + 36} ${cy + 32}`, `M${cx + 16} ${cy + 18} Q${cx + 30} ${cy + 16} ${cx + 44} ${cy + 20}`, `M${cx} ${cy + 22} Q${cx + 2} ${cy + 32} ${cx - 4} ${cy + 38}`];
    for (const d of roots) s += `<path d="${d}" stroke="${OL}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#6b4a2c" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    s += `<path d="M${cx - 6} ${cy + 8} Q${cx} ${cy - 6} ${cx + 6} ${cy + 8} Z" fill="#0c0618"/>`;
    for (const [x, y] of [[-26, 10], [24, 8], [-10, 26], [14, 26], [-34, 22]]) s += `<circle cx="${cx + x}" cy="${cy + y}" r="5" fill="#8ab8ff" opacity="0.35"/><path d="M${cx + x} ${cy + y - 6} q3 4 2 7 q-2 2 -4 0 q-1 -3 2 -7 z" fill="#bfe0ff" stroke="#4a7ae0" stroke-width="0.8"/>`;
    // stone idols (bałwany)
    for (const [x, y, h] of [[-38, -20, 26], [36, -26, 22]]) {
      s += `<ellipse cx="${cx + x + 3}" cy="${cy + y + 2}" rx="8" ry="3" fill="#000" opacity="0.3"/>`;
      s += `<path d="M${cx + x - 6} ${cy + y} V${cy + y - h + 6} Q${cx + x - 6} ${cy + y - h} ${cx + x} ${cy + y - h} Q${cx + x + 6} ${cy + y - h} ${cx + x + 6} ${cy + y - h + 6} V${cy + y} Z" fill="url(#${p}stoneB)" stroke="${OL}" stroke-width="1.5"/>`;
      s += `<path d="M${cx + x - 3} ${cy + y - h + 8} h2 M${cx + x + 1} ${cy + y - h + 8} h2 M${cx + x} ${cy + y - h + 10} v3 M${cx + x - 3} ${cy + y - h + 15} h6 M${cx + x - 4} ${cy + y - 6} h8" stroke="#3b3a36" stroke-width="1.1"/>`;
      s += `<path d="M${cx + x - 6} ${cy + y - 4} q3 -2 6 0" stroke="#7a9a3a" stroke-width="2" stroke-linecap="round"/>`;
    }
    return s;
  };

  TD.baseSvg = function (p, col, row) {
    const X = col * T, Y = row * T, cx = X + 48;
    let s = `<circle cx="${cx}" cy="${Y + 52}" r="82" fill="url(#${p}baseglow)" opacity="0.6"/>`;
    s += `<ellipse cx="${cx + 4}" cy="${Y + 96}" rx="54" ry="11" fill="#000" opacity="0.3"/>`;
    // rampart
    s += `<ellipse cx="${cx}" cy="${Y + 62}" rx="50" ry="34" fill="#8a7444" stroke="${OL}" stroke-width="2"/>`;
    s += `<ellipse cx="${cx}" cy="${Y + 58}" rx="44" ry="28" fill="#a8a050" stroke="#5a5a2a" stroke-width="1"/>`;
    const stakeAt = (a, rx, ry, h, oy) => {
      const px = cx + Math.cos(a) * rx, py = Y + oy + Math.sin(a) * ry;
      return `<path d="M${f1(px - 3)} ${f1(py + 3)} V${f1(py - h + 5)} L${f1(px)} ${f1(py - h)} L${f1(px + 3)} ${f1(py - h + 5)} V${f1(py + 3)} Z" fill="url(#${p}stake)" stroke="${OL}" stroke-width="1"/>`;
    };
    for (let k = 0; k <= 18; k++) s += stakeAt(Math.PI + (k / 18) * Math.PI, 44, 26, 16, 58);
    // thatched hall
    s += `<rect x="${X + 16}" y="${Y + 40}" width="40" height="22" fill="url(#${p}logs)" stroke="${OL}" stroke-width="1.6"/>`;
    for (let y = Y + 44; y < Y + 62; y += 4.5) s += `<path d="M${X + 16} ${y} H${X + 56}" stroke="#3a2410" stroke-width="0.9" opacity="0.6"/>`;
    s += `<rect x="${X + 33}" y="${Y + 48}" width="8" height="14" fill="#2a1a0c" stroke="${OL}" stroke-width="1"/>`;
    s += `<path d="M${X + 10} ${Y + 42} L${X + 22} ${Y + 18} L${X + 50} ${Y + 18} L${X + 62} ${Y + 42} Z" fill="url(#${p}thatch)" stroke="${OL}" stroke-width="1.8" stroke-linejoin="round"/>`;
    for (let k = 0; k < 9; k++) s += `<path d="M${X + 14 + k * 5.5} ${Y + 41} L${X + 23 + k * 3.4} ${Y + 20}" stroke="#a88440" stroke-width="0.9"/>`;
    s += `<path d="M${X + 22} ${Y + 18} H${X + 50}" stroke="#7a5a2a" stroke-width="2.4"/>`;
    s += `<path d="M${X + 22} ${Y + 18} l-4 -7 q-2 -3 1 -4 l3 2 z M${X + 50} ${Y + 18} l4 -7 q2 -3 -1 -4 l-3 2 z" fill="#a87447" stroke="${OL}" stroke-width="1"/>`;
    // red gate tower (right)
    const tx = X + 70;
    s += `<rect x="${tx - 10}" y="${Y + 16}" width="20" height="58" fill="url(#${p}redtower)" stroke="${OL}" stroke-width="1.8"/>`;
    s += `<path d="M${tx - 10} ${Y + 30} H${tx + 10} M${tx - 10} ${Y + 50} H${tx + 10}" stroke="#f0d8a0" stroke-width="2"/>`;
    for (const yy of [Y + 40, Y + 60]) {
      s += `<circle cx="${tx}" cy="${yy}" r="4.6" fill="#ffd36b" stroke="#8a5a10" stroke-width="1"/>`;
      for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; s += `<path d="M${f1(tx + Math.cos(a) * 5.5)} ${f1(yy + Math.sin(a) * 5.5)} L${f1(tx + Math.cos(a) * 7.5)} ${f1(yy + Math.sin(a) * 7.5)}" stroke="#ffd36b" stroke-width="1.2"/>`; }
    }
    s += `<path d="M${tx - 10} ${Y + 22} l3 3 3 -3 3 3 3 -3 3 3 3 -3" stroke="#f0d8a0" stroke-width="1" fill="none"/>`;
    s += `<path d="M${tx - 15} ${Y + 18} L${tx} ${Y - 4} L${tx + 15} ${Y + 18} Z" fill="url(#${p}redtower)" stroke="${OL}" stroke-width="1.8" stroke-linejoin="round"/>`;
    s += `<path d="M${tx - 9} ${Y + 12} L${tx} ${Y + 2} L${tx + 9} ${Y + 12}" stroke="#f0d8a0" stroke-width="1.2" fill="none"/>`;
    s += `<path d="M${tx} ${Y - 4} V${Y - 30}" stroke="${OL}" stroke-width="2.6" stroke-linecap="round"/><path d="M${tx + 1} ${Y - 30} h20 l-5 5 5 5 h-20 z" fill="#c2332b" stroke="${OL}" stroke-width="1.2"/><circle cx="${tx + 9}" cy="${Y - 25}" r="3" fill="none" stroke="#ffd36b" stroke-width="1.2"/>`;
    // front palisade with the gate
    for (let k = 0; k <= 18; k++) {
      const a = (k / 18) * Math.PI;
      const px = cx + Math.cos(a) * 46;
      if (Math.abs(px - cx) < 10 && Math.sin(a) > 0.9) continue;
      s += stakeAt(a, 46, 30, 22, 62);
    }
    s += `<path d="M${cx - 9} ${Y + 94} V${Y + 76} H${cx + 9} V${Y + 94}" fill="#3a2410" stroke="${OL}" stroke-width="1.6"/>`;
    s += `<path d="M${cx - 9} ${Y + 76} H${cx + 9}" stroke="#a87447" stroke-width="3"/><path d="M${cx} ${Y + 77} V${Y + 94}" stroke="${OL}" stroke-width="1"/>`;
    s += `<path d="M${cx - 16} ${Y + 92} V${Y + 66}" stroke="${OL}" stroke-width="2" stroke-linecap="round"/><path d="M${cx - 16} ${Y + 66} h-9 v12 l4 -2 5 3 z" fill="#c2332b" stroke="${OL}" stroke-width="1"/>`;
    return s;
  };

  // overlays for gród levels; origin = base centre (between the 2x2 cells)
  TD.baseLevelSvg = function (p, lvl) {
    let s = '';
    if (lvl >= 2) { // archers on the rampart
      for (const [x, y] of [[-30, -6], [26, 4]]) {
        s += `<path d="M${x} ${y} v-9" stroke="${OL}" stroke-width="4.4" stroke-linecap="round"/><path d="M${x} ${y} v-9" stroke="#3f7a3a" stroke-width="3" stroke-linecap="round"/>`;
        s += `<circle cx="${x}" cy="${y - 12}" r="2.8" fill="url(#${p}skin)" stroke="${OL}" stroke-width="0.9"/><path d="M${x - 3} ${y - 13} h6" stroke="#6b4a2c" stroke-width="2.2"/>`;
        s += `<path d="M${x + 3} ${y - 15} q4 4 0 9" stroke="${OL}" stroke-width="1.8" fill="none"/><path d="M${x + 3} ${y - 15} q4 4 0 9" stroke="#8a5a2e" stroke-width="0.9" fill="none"/>`;
      }
    }
    if (lvl >= 3) { // znicz — sacred fire bowl in the yard
      s += `<circle cx="-10" cy="10" r="16" fill="url(#${p}glow)" opacity="0.8"/>`;
      s += `<path d="M-17 12 Q-10 16 -3 12 L-4 8 Q-10 10 -16 8 Z" fill="url(#${p}stoneB)" stroke="${OL}" stroke-width="1.2"/>`;
      s += `<path d="M-16 8 Q-17 0 -13 -3 Q-12 2 -10 1 Q-11 -6 -8 -10 Q-6 -3 -4 -1 Q-3 3 -4 8 Z" fill="#ff7a1a" stroke="#8a2a08" stroke-width="1" stroke-linejoin="round"/>`;
      s += `<path d="M-13 8 Q-13 3 -11 1 Q-10 4 -9 3 Q-9 -2 -7 -4 Q-5 2 -6 8 Z" fill="#ffd25a"/>`;
    }
    if (lvl >= 4) { // gromowa kącina — golden thunder rosette over the gate tower
      s += `<circle cx="22" cy="-74" r="14" fill="url(#${p}orb)" opacity="0.9"/>`;
      s += `<circle cx="22" cy="-74" r="6" fill="url(#${p}gold)" stroke="${OL}" stroke-width="1.2"/>`;
      for (let k = 0; k < 6; k++) s += `<ellipse cx="22" cy="-76.4" rx="1.3" ry="2.4" fill="#fff6c8" stroke="#8a6010" stroke-width="0.4" transform="rotate(${k * 60} 22 -74)"/>`;
    }
    return s;
  };
  // Zasieki: cross-braced spiked barricade (drawn on the road in front of the gate)
  TD.zasiekiSvg = function (p) {
    let s = `<ellipse cx="3" cy="10" rx="20" ry="4" fill="#000" opacity="0.3"/>`;
    for (const x of [-12, 0, 12]) {
      s += `<path d="M${x - 7} 9 L${x + 7} -9 M${x + 7} 9 L${x - 7} -9" stroke="${OL}" stroke-width="4.4" stroke-linecap="round"/>`;
      s += `<path d="M${x - 7} 9 L${x + 7} -9 M${x + 7} 9 L${x - 7} -9" stroke="#a87447" stroke-width="2.6" stroke-linecap="round"/>`;
      s += `<path d="M${x + 7} -9 l2 -3 M${x - 7} -9 l-2 -3" stroke="#e8dcc0" stroke-width="1.6" stroke-linecap="round"/>`;
    }
    s += `<path d="M-20 0 H20" stroke="${OL}" stroke-width="4"/><path d="M-20 0 H20" stroke="#8a5e2e" stroke-width="2.4"/>`;
    return s;
  };

  // stone obstacles: boulder, standing stone or carved stone idol
  TD.rockVariantSvg = function (p, x, y, r) {
    const X = x * T, Y = y * T, roll = r();
    if (roll < 0.22) { // standing stone (menhir)
      return `<ellipse cx="${X + 28}" cy="${Y + 41}" rx="12" ry="4" fill="#0b1a08" opacity="0.3"/>` +
        `<path d="M${X + 16} ${Y + 41} L${X + 17} ${Y + 10} Q${X + 22} ${Y + 2} ${X + 29} ${Y + 6} L${X + 32} ${Y + 41} Z" fill="url(#${p}stoneB)" stroke="${OL}" stroke-width="1.6" stroke-linejoin="round"/>` +
        `<path d="M${X + 20} ${Y + 16} l3 4 -2 4 M${X + 25} ${Y + 26} l2 5" stroke="#4a4842" stroke-width="1.1" fill="none"/>` +
        `<path d="M${X + 17} ${Y + 32} q5 -3 9 0 q3 2 5 0" stroke="#7a9a3a" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    }
    if (roll < 0.36) { // stone idol (bałwan)
      return `<ellipse cx="${X + 27}" cy="${Y + 41}" rx="11" ry="4" fill="#0b1a08" opacity="0.3"/>` +
        `<path d="M${X + 16} ${Y + 41} V${Y + 14} Q${X + 16} ${Y + 6} ${X + 24} ${Y + 6} Q${X + 32} ${Y + 6} ${X + 32} ${Y + 14} V${Y + 41} Z" fill="url(#${p}stoneB)" stroke="${OL}" stroke-width="1.6"/>` +
        `<path d="M${X + 19} ${Y + 15} h3 M${X + 26} ${Y + 15} h3 M${X + 24} ${Y + 17} v4 M${X + 20} ${Y + 24} q4 2 8 0 M${X + 18} ${Y + 32} h12" stroke="#3b3a36" stroke-width="1.3" fill="none"/>` +
        `<path d="M${X + 16} ${Y + 12} Q${X + 24} ${Y + 4} ${X + 32} ${Y + 12}" stroke="#7a9a3a" stroke-width="2.4" fill="none"/>`;
    }
    return null; // fall back to the classic boulder
  };
})();
