/* game.js — rules, state and simulation (no drawing, no DOM). */
(function () {
  'use strict';
  const TD = (window.TD = window.TD || {});

  // ------------------------------------------------------------ balance
  TD.TOTAL_WAVES = 30;
  TD.START_GOLD = 100;
  TD.START_LIVES = 20;

  TD.TOWERS = {
    W: { key: 'W', name: 'Palisada', label: 'Pali\u00ADsada', cost: 5, attack: false, desc: 'Ostrokół z bali. Tania blokada, która wydłuża trasę wrogów.' },
    A: {
      key: 'A', name: 'Łucznik', cost: 20, attack: true, desc: 'Strażnica z łucznikiem. Szybkie strzały w jeden cel.',
      dmg: [6, 10, 15, 22], range: [2.6, 2.8, 3.0, 3.3], rate: [1.5, 1.7, 1.9, 2.2],
    },
    C: {
      key: 'C', name: 'Kamieniomiot', label: 'Kamienio\u00ADmiot', cost: 45, attack: true, desc: 'Ciska głazami. Rani wszystkich w miejscu upadku, przebija pancerz.',
      dmg: [14, 22, 33, 48], range: [2.5, 2.7, 2.9, 3.2], rate: [0.55, 0.6, 0.66, 0.72], splash: [0.9, 1.0, 1.1, 1.25],
    },
    F: {
      key: 'F', name: 'Bożek Mrozu', cost: 35, attack: true, desc: 'Rzeźbiony idol Marzanny. Mrozi i spowalnia wrogów.',
      dmg: [2, 3, 5, 7], range: [2.2, 2.4, 2.6, 2.9], rate: [1.0, 1.1, 1.2, 1.3], slow: [0.4, 0.47, 0.54, 0.6],
    },
    L: {
      key: 'L', name: 'Słup Peruna', cost: 60, attack: true, desc: 'Gromowładny idol. Błyskawica przeskakuje między wrogami i rozbija tarcze.',
      dmg: [10, 15, 22, 32], range: [2.3, 2.5, 2.7, 3.0], rate: [0.8, 0.9, 1.0, 1.1], chain: [3, 4, 5, 6],
    },
    B: {
      key: 'B', name: 'Samostrzał', label: 'Samo\u00ADstrzał', cost: 70, attack: true, desc: 'Wielka kusza wałowa. Ogromny zasięg, przebija pancerz, celuje w najsilniejszego.',
      dmg: [40, 62, 90, 130], range: [4.0, 4.4, 4.8, 5.3], rate: [0.35, 0.38, 0.42, 0.47], pierce: true,
    },
  };
  TD.TOWERS.Z = {
    key: 'Z', name: 'Znicz Swaroga', label: 'Znicz Swa\u00ADroga', cost: 110, attack: true, aura: true,
    desc: 'Święty ogień bucha wokół wieży i pali wszystkich naziemnych wrogów w zasięgu.',
    dmg: [9, 14, 20, 29], range: [1.6, 1.75, 1.9, 2.1], rate: [1.6, 1.8, 2.0, 2.3],
  };
  TD.TOWERS.M = {
    key: 'M', name: 'Chram Mokoszy', label: 'Chram Mo\u00ADkoszy', cost: 150, attack: false, support: true,
    desc: 'Kącina bogini Mokoszy. Wzmacnia obrażenia wież w zasięgu (nie sumuje się z innym chramem).',
    range: [2.1, 2.3, 2.6, 3.0], buff: [0.2, 0.28, 0.36, 0.45],
  };
  TD.TOWER_ORDER = ['W', 'A', 'C', 'F', 'L', 'B', 'Z', 'M'];
  TD.UPGRADE_MULT = [0, 1.2, 1.8, 2.6]; // cost to go from level n to n+1 = cost * mult[n]
  TD.upgradeCost = (t, lvl) => (lvl >= 4 || t === 'W' ? null : Math.round(TD.TOWERS[t].cost * TD.UPGRADE_MULT[lvl]));

  TD.ENEMIES = {
    crawler: { name: 'Bies', hp: 22, speed: 1.35, gold: 2, r: 11, armor: 0, lives: 1, note: '' },
    runner: { name: 'Chochlik', hp: 14, speed: 2.3, gold: 2, r: 9, armor: 0, lives: 1, note: 'szybki' },
    armored: { name: 'Wilkołak', hp: 55, speed: 0.85, gold: 5, r: 14, armor: 3, lives: 1, note: 'twarda skóra' },
    swarm: { name: 'Błędne Ogniki', hp: 6, speed: 1.75, gold: 1, r: 7, armor: 0, lives: 1, note: 'rój' },
    glut: { name: 'Wodnik', hp: 46, speed: 1.0, gold: 3, r: 15, armor: 0, lives: 1, note: 'rozpada się na Utopce', split: 'glutek' },
    glutek: { name: 'Utopiec', hp: 14, speed: 1.5, gold: 1, r: 9, armor: 0, lives: 1, note: '' },
    ghost: { name: 'Strzyga', hp: 24, speed: 1.0, gold: 4, r: 12, armor: 0, lives: 1, note: 'lata prosto do bazy', noSlow: true, flying: true },
    bat: { name: 'Latawiec', hp: 9, speed: 1.5, gold: 1, r: 9, armor: 0, lives: 1, note: 'lata, stado', flying: true },
    shield: { name: 'Nawiec', hp: 34, speed: 1.0, gold: 4, r: 12, armor: 0, lives: 1, note: 'tarcza z Nawii', shield: 0.6 },
    shaman: { name: 'Wiedźma', hp: 40, speed: 1.0, gold: 6, r: 12, armor: 0, lives: 1, note: 'leczy innych', heal: 0.025 },
    poludnica: { name: 'Południca', hp: 26, speed: 1.55, gold: 4, r: 10, armor: 0, lives: 1, note: 'unika strzał', evade: 0.25 },
    zmora: { name: 'Zmora', hp: 32, speed: 1.0, gold: 4, r: 11, armor: 0, lives: 1, note: 'przeskakuje do przodu', blink: { every: 4, dist: 1.6 } },
    rusalka: { name: 'Rusałka', hp: 38, speed: 1.0, gold: 4, r: 10, armor: 0, lives: 1, note: 'sama się leczy', regen: 0.03 },
    bebok: { name: 'Bebok', hp: 150, speed: 0.55, gold: 9, r: 15, armor: 2, lives: 2, note: 'bardzo wytrzymały' },
    boss: { name: 'Wołot', hp: 320, speed: 0.6, gold: 40, r: 20, armor: 2, lives: 5, note: 'boss', boss: true, desc: 'Olbrzym w skórach i żelaznym hełmie.' },
    ogre: { name: 'Leszy', hp: 170, speed: 0.7, gold: 25, r: 18, armor: 1, lives: 4, note: 'boss', boss: true, desc: 'Pan lasu. Wytrzymały jak stary dąb.' },
    queen: { name: 'Baba Jaga', hp: 300, speed: 0.6, gold: 50, r: 20, armor: 0, lives: 5, note: 'boss', boss: true, summon: { kind: 'swarm', every: 3.5, count: 2 }, desc: 'Leci w stępie i wypuszcza Błędne Ogniki.' },
    golem: { name: 'Licho', hp: 420, speed: 0.5, gold: 60, r: 21, armor: 5, lives: 6, note: 'boss', boss: true, noSlow: true, crumble: true, desc: 'Jednooki kamienny stwór. Przy połowie życia kruszy się i przyspiesza.' },
    wraith: { name: 'Żmij', hp: 430, speed: 0.45, gold: 80, r: 20, armor: 0, lives: 6, note: 'boss', boss: true, flying: true, noSlow: true, summon: { kind: 'bat', every: 4, count: 3 }, desc: 'Skrzydlaty smok. Leci prosto na gród i wzywa Latawce.' },
    behemoth: { name: 'Czarnobóg', hp: 950, speed: 0.4, gold: 150, r: 24, armor: 4, lives: 8, note: 'boss', boss: true, regen: 0.004, escort: 'armored', desc: 'Mroczny bóg. Odradza się, a przy połowie życia wzywa Wilkołaki.' },
  };
  TD.hpScale = (w) => 1 + 0.16 * (w - 1) + 0.0075 * (w - 1) * (w - 1);
  TD.BOSSES = { 5: 'ogre', 10: 'boss', 15: 'queen', 20: 'golem', 25: 'wraith', 30: 'behemoth' };
  TD.bossFor = (w) => (w % 5 !== 0 ? null : TD.BOSSES[w] || ['ogre', 'boss', 'queen', 'golem', 'wraith', 'behemoth'][(w / 5 - 1) % 6]);
  TD.DIFFS = {
    easy: { name: 'Spokojny', hp: 0.8, gold: 130, lives: 30 },
    normal: { name: 'Normalny', hp: 1, gold: 100, lives: 20 },
    hard: { name: 'Wyzwanie', hp: 1.18, gold: 105, lives: 15 },
  };
  // The gród (player base): level 0..4
  TD.BASE_LEVELS = [
    { name: 'Gród', desc: 'Drewniany gród. Sam się nie broni.' },
    { name: 'Zasieki', cost: 60, desc: 'Zasieki przed bramą zatrzymują każdego naziemnego wroga na 2,5 s (bossów na 1 s).' },
    { name: 'Łucznicy na wałach', cost: 120, desc: 'Gród sam strzela z łuków — także do latających. Zasięg 4 pola.' },
    { name: 'Znicz grodu', cost: 220, desc: 'Święty ogień pali naziemnych wrogów w promieniu 2 pól od grodu. Zasieki trzymają 3,5 s, łucznicy strzelają szybciej.' },
    { name: 'Gromowa Kącina', cost: 360, desc: 'Co 5 s piorun Peruna trafia najsilniejszego wroga w zasięgu 6 pól. Po każdej fali gród odzyskuje 1 życie.' },
  ];
  TD.baseUpgradeCost = (s) => (s.baseLvl >= 4 ? null : TD.BASE_LEVELS[s.baseLvl + 1].cost);
  TD.maxLives = (s) => TD.DIFFS[s.diff || 'normal'].lives;
  // buying back a life: grows with the wave and with every life already bought
  TD.lifeCost = (s) => Math.round((18 + 4 * (s.wave + 1)) * Math.pow(1.18, s.livesBought || 0));
  TD.upgradeBase = function (s) {
    const c = TD.baseUpgradeCost(s);
    if (s.phase !== 'prep' || c == null || s.gold < c) return false;
    s.gold -= c; s.baseLvl++; s.baseInvested = (s.baseInvested || 0) + c; s.version++;
    sfx('upgrade');
    return true;
  };
  TD.buyLife = function (s) {
    const c = TD.lifeCost(s);
    if (s.lives >= TD.maxLives(s) || s.gold < c || (s.phase !== 'prep' && s.phase !== 'wave')) return false;
    s.gold -= c; s.lives++; s.livesBought = (s.livesBought || 0) + 1;
    sfx('coin');
    return true;
  };
  // Chram Mokoszy: damage buff for towers in range (strongest aura wins, no stacking)
  TD.computeBuffs = function (s) {
    const T = TD.T;
    for (const t of s.towers.values()) t.buff = 0;
    for (const m of s.towers.values()) {
      if (m.type !== 'M') continue;
      const ms = TD.towerStats(m), rr = ms.range * T;
      for (const t of s.towers.values()) {
        if (t === m || t.type === 'W' || t.type === 'M') continue;
        if (Math.hypot((t.x - m.x) * T, (t.y - m.y) * T) <= rr) t.buff = Math.max(t.buff, ms.buff);
      }
    }
  };
  TD.baseCenter = (s) => ({ x: (s.map.base.c + 1) * TD.T, y: (s.map.base.r + 1) * TD.T });

  // God powers: cooldowns tick only while a wave is running
  TD.POWERS = {
    perun: { key: 'perun', hot: 'Q', name: 'Gniew Peruna', desc: 'Piorun uderza w wybrane miejsce. Ogromne obrażenia, ignoruje pancerz i tarcze.', cd: 40, target: true, radius: 1.4 },
    swarog: { key: 'swarog', hot: 'W', name: 'Ogień Swaroga', desc: 'Święty ogień płonie 8 s i pali każdego, kto przez niego przejdzie.', cd: 45, target: true, radius: 1.25 },
    marzanna: { key: 'marzanna', hot: 'E', name: 'Oddech Marzanny', desc: 'Mróz zatrzymuje wszystkich wrogów na 3 s, potem spowalnia ich o połowę.', cd: 70, target: false },
  };
  TD.POWER_ORDER = ['perun', 'swarog', 'marzanna'];
  // Veles' gift: interest on unspent gold paid when a wave starts
  TD.velesGift = (s) => Math.min(Math.floor(s.gold * 0.05), 10 + 2 * (s.wave + 1));
  TD.TARGET_MODES = { first: 'Pierwszy', strong: 'Najsilniejszy', close: 'Najbliższy' };

  // Wave composition: list of groups {kind, count, gap}
  // parallel: starts together with the first group (mixes in) instead of after the previous one
  TD.waveGroups = function (w) {
    const g = [];
    g.push({ kind: 'crawler', count: 6 + Math.floor(w * 0.9), gap: 0.85 });
    if (w >= 5 && w % 2 === 1) g.push({ kind: 'swarm', count: 3 + w, gap: 0.3 });
    if (w >= 4) g.push({ kind: 'armored', count: Math.floor((w - 2) / 2), gap: 1.5 });
    if (w >= 6) g.push({ kind: 'runner', count: 2 + Math.floor(w / 2.5), gap: 0.45 });
    if (w >= 8) g.push({ kind: 'glut', count: Math.floor((w - 4) / 3), gap: 1.6 });
    if (w >= 9 && w % 3 === 0) g.push({ kind: 'bat', count: 4 + Math.floor(w / 2), gap: 0.35, parallel: true });
    if (w >= 11 && w % 2 === 0) g.push({ kind: 'ghost', count: 2 + Math.floor((w - 10) / 3), gap: 1.1 });
    if (w >= 12 && w % 3 === 1) g.push({ kind: 'shield', count: 2 + Math.floor((w - 10) / 3), gap: 1.2 });
    if (w >= 7 && w % 4 === 3) g.push({ kind: 'poludnica', count: 3 + Math.floor(w / 4), gap: 0.7 });
    if (w >= 10 && w % 3 === 2) g.push({ kind: 'zmora', count: 2 + Math.floor((w - 8) / 3), gap: 1.0 });
    if (w >= 13 && w % 3 === 0) g.push({ kind: 'rusalka', count: 3 + Math.floor((w - 12) / 3), gap: 0.9 });
    if (w >= 16 && w % 2 === 1) g.push({ kind: 'bebok', count: 1 + Math.floor((w - 16) / 4), gap: 2.5 });
    if (w >= 14) g.push({ kind: 'shaman', count: 1 + Math.floor((w - 14) / 4), gap: 4, parallel: true });
    const boss = TD.bossFor(w);
    if (boss) g.push({ kind: boss, count: w > 30 ? 1 + Math.floor((w - 30) / 30) : 1, gap: 6, boss: true });
    return g;
  };
  TD.waveReward = (w) => 8 + w * 2;

  // ------------------------------------------------------------ state
  TD.newGame = function (seed, opts) {
    seed = seed == null ? (Math.random() * 2 ** 31) >>> 0 : seed;
    opts = opts || {};
    const diff = TD.DIFFS[opts.diff] ? opts.diff : 'normal';
    const map = TD.generateMap(seed);
    map.biome = TD.BIOMES && TD.BIOMES[opts.biome] ? opts.biome : 'meadow';
    const s = {
      seed, map, diff, endless: false,
      towers: new Map(), // key "x,y"
      gold: TD.DIFFS[diff].gold, lives: TD.DIFFS[diff].lives,
      wave: 0, // waves completed
      phase: 'prep', // prep | wave | lost | won
      speed: 1, auto: false, paused: false,
      enemies: [], projectiles: [], effects: [],
      spawnQueue: [], spawnClock: 0, waveTime: 0,
      kills: 0, waveKills: 0, waveTotal: 0, waveGold: 0,
      autoTimer: 0, snapshot: null, path: null,
      powers: { perun: 0, swarog: 0, marzanna: 0 }, fields: [],
      baseLvl: 0, baseInvested: 0, livesBought: 0, baseCd: 0, baseBoltCd: 2,
      version: 0, // bumps when the map/towers change (for redraw caches)
    };
    s.path = TD.computePath(s);
    TD.setFlight(s);
    return s;
  };

  const key = (x, y) => x + ',' + y;
  TD.key = key;

  TD.blockedWith = function (s, extra) {
    return (x, y) => TD.mapBlocked(s.map, x, y) || s.towers.has(key(x, y)) || (extra && extra.x === x && extra.y === y);
  };

  TD.computePath = function (s, extra) {
    const m = s.map;
    return TD.findPath(m.cols, m.rows, m.start, m.goal, TD.blockedWith(s, extra));
  };

  // Placement check: returns {ok, reason, path}
  TD.canBuild = function (s, x, y, type) {
    if (s.phase !== 'prep') return { ok: false, reason: 'Budowa tylko między falami' };
    if (!TD.mapBuildable(s.map, x, y)) return { ok: false, reason: 'Tu nie można budować' };
    if (s.towers.has(key(x, y))) return { ok: false, reason: 'Pole zajęte' };
    if (s.gold < TD.TOWERS[type].cost) return { ok: false, reason: 'Za mało złota', path: null, poor: true };
    const p = TD.computePath(s, { x, y });
    if (!p) return { ok: false, reason: 'Zablokowałoby drogę wrogom', block: true };
    return { ok: true, path: p };
  };

  TD.build = function (s, x, y, type) {
    const chk = TD.canBuild(s, x, y, type);
    if (!chk.ok) return chk;
    const def = TD.TOWERS[type];
    s.gold -= def.cost;
    s.towers.set(key(x, y), { x, y, type, lvl: 1, invested: def.cost, fresh: true, cd: 0, angle: -Math.PI / 2, kills: 0, mode: type === 'B' ? 'strong' : 'first' });
    s.path = chk.path;
    s.version++;
    return chk;
  };

  TD.upgrade = function (s, t) {
    if (s.phase !== 'prep') return false;
    const c = TD.upgradeCost(t.type, t.lvl);
    if (c == null || s.gold < c) return false;
    s.gold -= c; t.invested += c; t.lvl++;
    s.version++;
    return true;
  };

  TD.sellValue = (t) => (t.fresh ? t.invested : Math.floor(t.invested * 0.7));

  TD.sell = function (s, t) {
    if (s.phase !== 'prep') return false;
    s.gold += TD.sellValue(t);
    s.towers.delete(key(t.x, t.y));
    s.path = TD.computePath(s);
    s.version++;
    return true;
  };

  TD.towerStats = function (t, lvlOverride) {
    const d = TD.TOWERS[t.type || t];
    const i = (lvlOverride || t.lvl || 1) - 1;
    if (d.support) return { range: d.range[i], buff: d.buff[i], support: true };
    if (!d.attack) return null;
    return { dmg: d.dmg[i], range: d.range[i], rate: d.rate[i], splash: d.splash ? d.splash[i] : 0, slow: d.slow ? d.slow[i] : 0, chain: d.chain ? d.chain[i] : 0, pierce: !!d.pierce };
  };

  // ------------------------------------------------------------ waves
  TD.startWave = function (s) {
    if (s.phase !== 'prep') return;
    s.snapshot = TD.serialize(s);
    const w = s.wave + 1;
    const gift = TD.velesGift(s);
    s.gold += gift;
    s.lastGift = gift;
    s.fields = [];
    s.baseCd = 0.5; s.baseBoltCd = 2;
    s.path = TD.computePath(s); // frozen for this wave
    s.pathLen = s.path.length - 1;
    TD.setFlight(s);
    s.bossAnnounced = false;
    s.spawnQueue = [];
    let t = 0.3;
    for (const g of TD.waveGroups(w)) {
      if (g.parallel) {
        let pt = 2.5;
        for (let i = 0; i < g.count; i++) { s.spawnQueue.push({ at: pt, kind: g.kind }); pt += g.gap; }
        continue;
      }
      for (let i = 0; i < g.count; i++) { s.spawnQueue.push({ at: t, kind: g.kind }); t += g.gap; }
      t += 1.2;
    }
    s.spawnQueue.sort((a, b) => a.at - b.at);
    s.waveTotal = s.spawnQueue.length;
    s.waveKills = 0; s.waveLeaked = 0; s.waveGold = 0;
    s.waveTime = 0;
    s.phase = 'wave';
    for (const t2 of s.towers.values()) { t2.fresh = false; t2.cd = 0.2; }
    s.version++;
  };

  // Straight flight line for flying enemies: from the nest mouth to the base gate
  TD.setFlight = function (s) {
    const m = s.map, T = TD.T;
    s.fly = { x0: (m.start.x + 0.5) * T, y0: (m.start.y + 0.5) * T, x1: (m.goal.x + 0.5) * T, y1: (m.goal.y + 0.5) * T };
    s.fly.len = Math.hypot(s.fly.x1 - s.fly.x0, s.fly.y1 - s.fly.y0) / T;
  };
  TD.waveHasFlyers = (w) => TD.waveGroups(w).some((g) => TD.ENEMIES[g.kind].flying || (TD.ENEMIES[g.kind].summon && TD.ENEMIES[TD.ENEMIES[g.kind].summon.kind].flying));
  TD.diffHp = (s) => TD.DIFFS[s.diff || 'normal'].hp;

  function spawn(s, kind, d) {
    const def = TD.ENEMIES[kind];
    let hp = def.hp * TD.hpScale(s.wave + 1) * TD.diffHp(s);
    if (def.boss && s.wave + 1 > 30) hp *= 1 + (s.wave + 1 - 30) * 0.08;
    hp = Math.round(hp);
    if (def.boss) { s.effects.push({ type: 'roar', x: 0, y: 0, t: 0, life: 1.2, boss: kind }); sfx('bossroar'); }
    const sh = def.shield ? Math.round(hp * def.shield) : 0;
    s.enemies.push({ kind, hp, maxHp: hp, shield: sh, maxShield: sh, shieldT: 0, armor: def.armor, sumT: def.summon ? def.summon.every * 0.6 : 0, d: d != null ? d : -0.6 - Math.random() * 0.2, speed: def.speed * (0.94 + Math.random() * 0.12), slowT: 0, slowF: 0, x: 0, y: 0, dir: 'r', hitT: 0, id: Math.random() });
  }

  function enemyPos(s, e) {
    if (!TD.ENEMIES[e.kind].flying) return pathPos(s, e.d);
    const f = s.fly, T = TD.T;
    const k = Math.max(-0.6, Math.min(e.d, f.len)) / f.len;
    const dx = f.x1 - f.x0, dy = f.y1 - f.y0;
    const dir = Math.abs(dx) > Math.abs(dy) * 1.3 ? (dx > 0 ? 'r' : 'l') : dy > 0 ? 'd' : 'u';
    return { x: f.x0 + dx * k, y: f.y0 + dy * k - 10, dir };
  }
  TD.enemyPos = enemyPos;
  const endOf = (s, e) => (TD.ENEMIES[e.kind].flying ? s.fly.len : s.path.length - 1);

  // Position along the frozen path; d measured in tiles from path start.
  function pathPos(s, d) {
    const T = TD.T, p = s.path;
    if (d <= 0) {
      const [x, y] = p[0];
      return { x: (x + 0.5) * T + d * T * 0.6 - 0.0, y: (y + 0.5) * T, dir: 'r' };
    }
    const i = Math.min(Math.floor(d), p.length - 2), f = Math.min(d - i, 1);
    const a = p[i], b = p[i + 1];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    return { x: (a[0] + 0.5 + dx * f) * T, y: (a[1] + 0.5 + dy * f) * T, dir: dx > 0 ? 'r' : dx < 0 ? 'l' : dy > 0 ? 'd' : 'u' };
  }
  TD.pathPos = pathPos;

  function damage(s, e, amount, pierce, shieldBreaker) {
    const armor = pierce ? 0 : e.armor || 0;
    let dmg = Math.max(1, amount - armor);
    e.hitT = 0.12;
    if (e.shield > 0) {
      e.shieldT = 3;
      const sd = shieldBreaker ? dmg * 2 : dmg;
      if (sd <= e.shield) { e.shield -= sd; return; }
      dmg = Math.max(0, (sd - e.shield) / (shieldBreaker ? 2 : 1));
      e.shield = 0;
      s.effects.push({ type: 'shieldbreak', x: e.x, y: e.y, t: 0, life: 0.45 });
      sfx('shield');
    }
    e.hp -= dmg;
    const def0 = TD.ENEMIES[e.kind];
    if (def0.crumble && !e.crumbled && e.hp > 0 && e.hp < e.maxHp * 0.5) {
      e.crumbled = true; e.armor = 2; e.speed *= 1.6;
      s.effects.push({ type: 'crumble', x: e.x, y: e.y, t: 0, life: 0.9 });
      sfx('boom');
    }
    if (def0.escort && !e.escorted && e.hp > 0 && e.hp < e.maxHp * 0.5) {
      e.escorted = true;
      for (let k = 0; k < 4; k++) { spawn(s, def0.escort, Math.max(0, e.d - 0.4 - k * 0.5)); placeNew(s); }
      s.waveTotal += 4;
      s.effects.push({ type: 'summon', x: e.x, y: e.y, t: 0, life: 0.8 });
      sfx('bossroar');
    }
    if (e.hp <= 0 && !e.dead) {
      e.dead = true;
      const g = TD.ENEMIES[e.kind].gold;
      s.gold += g; s.waveGold += g; s.kills++; s.waveKills++;
      s.effects.push({ type: 'gold', x: e.x, y: e.y - 18, t: 0, life: 1.1, text: '+' + g });
      s.effects.push({ type: 'poof', x: e.x, y: e.y, t: 0, life: 0.45, r: TD.ENEMIES[e.kind].r });
      sfx(e.kind === 'boss' ? 'bigdeath' : 'death');
      const sp = TD.ENEMIES[e.kind].split;
      if (sp) {
        for (const off of [-0.18, 0.18]) { spawn(s, sp, Math.max(0, e.d + off)); placeNew(s); }
        s.waveTotal += 2;
        s.effects.push({ type: 'splat', x: e.x, y: e.y, t: 0, life: 0.5 });
      }
    }
  }
  function placeNew(s) {
    const n = s.enemies[s.enemies.length - 1];
    const p = enemyPos(s, n); n.x = p.x; n.y = p.y; n.dir = p.dir;
  }
  const sfx = (n) => TD.sfx && TD.sfx(n);
  TD.sfxCall = sfx;

  // ------------------------------------------------------------ simulation step (dt in game seconds)
  TD.step = function (s, dt) {
    const T = TD.T;
    for (const fx of s.effects) fx.t += dt;
    s.effects = s.effects.filter((f) => f.t < f.life);

    if (s.phase === 'prep') {
      if (s.auto && s.wave > 0 && s.autoTimer > 0) {
        s.autoTimer -= dt;
        if (s.autoTimer <= 0) TD.startWave(s);
      }
      return;
    }
    if (s.phase !== 'wave') return;

    s.waveTime += dt;
    for (const k in s.powers) if (s.powers[k] > 0) s.powers[k] = Math.max(0, s.powers[k] - dt);
    for (const f of s.fields) {
      f.t += dt;
      for (const e of s.enemies) {
        if (e.dead || TD.ENEMIES[e.kind].flying) continue;
        if (Math.hypot(e.x - f.x, e.y - f.y) <= f.r) {
          e.burnAcc = (e.burnAcc || 0) + f.dps * dt;
          if (e.burnAcc >= 1) { const a = Math.floor(e.burnAcc); e.burnAcc -= a; e.hp -= a; e.burnT = 0.3; if (e.hp <= 0) { e.hp = 0.01; damage(s, e, 1, true); } }
        }
      }
    }
    s.fields = s.fields.filter((f) => f.t < f.life);
    while (s.spawnQueue.length && s.spawnQueue[0].at <= s.waveTime) spawn(s, s.spawnQueue.shift().kind);

    // shamans heal neighbours
    for (const sh of s.enemies) {
      const hd = TD.ENEMIES[sh.kind].heal;
      if (!hd || sh.dead || sh.d < 0) continue;
      sh.healT = (sh.healT || 0) - dt;
      const pulse = sh.healT <= 0;
      if (pulse) sh.healT = 1.2;
      for (const o of s.enemies) {
        if (o === sh || o.dead || o.hp >= o.maxHp) continue;
        if (Math.hypot(o.x - sh.x, o.y - sh.y) > 1.5 * T) continue;
        o.hp = Math.min(o.maxHp, o.hp + o.maxHp * hd * dt);
        if (pulse && Math.random() < 0.5) s.effects.push({ type: 'plus', x: o.x, y: o.y - 10, t: 0, life: 0.7 });
      }
      if (pulse) s.effects.push({ type: 'healring', x: sh.x, y: sh.y, t: 0, life: 0.8, r: 1.5 * T });
    }

    // abilities: shields regen, summons, regeneration
    const born = [];
    for (const e of s.enemies) {
      const def = TD.ENEMIES[e.kind];
      if (e.maxShield) {
        if (e.shieldT > 0) e.shieldT -= dt;
        else if (e.shield < e.maxShield) e.shield = Math.min(e.maxShield, e.shield + e.maxShield * 0.25 * dt);
      }
      if (def.regen && e.hp < e.maxHp) e.hp = Math.min(e.maxHp, e.hp + e.maxHp * def.regen * dt);
      if (def.summon && e.d > 0.5 && !e.dead) {
        e.sumT -= dt;
        if (e.sumT <= 0) {
          e.sumT = def.summon.every;
          born.push([def.summon.kind, def.summon.count, e.d]);
          s.effects.push({ type: 'summon', x: e.x, y: e.y, t: 0, life: 0.8 });
          sfx('summon');
        }
      }
    }
    for (const [k, n, d] of born) {
      for (let i = 0; i < n; i++) { spawn(s, k, Math.max(0, d - 0.3 - i * 0.35)); placeNew(s); }
      s.waveTotal += n;
    }

    // move enemies
    const lvl = s.baseLvl || 0;
    for (const e of s.enemies) {
      const def = TD.ENEMIES[e.kind];
      if (e.slowT > 0) e.slowT -= dt;
      if (e.frozenT > 0) e.frozenT -= dt;
      if (e.burnT > 0) e.burnT -= dt;
      if (e.stopT > 0) e.stopT -= dt;
      // Zasieki in front of the gate (base level 1+)
      if (lvl >= 1 && !e.stopped && !def.flying && e.d >= s.path.length - 1 - 1.5) {
        e.stopped = true;
        e.stopT = def.boss ? 1 : lvl >= 3 ? 3.5 : 2.5;
        s.effects.push({ type: 'stop', x: e.x, y: e.y, t: 0, life: 0.5 });
      }
      // Zmora blinks forward
      if (def.blink && e.d > 0.5) {
        e.blinkT = (e.blinkT == null ? def.blink.every * 0.7 : e.blinkT) - dt;
        if (e.blinkT <= 0) {
          e.blinkT = def.blink.every;
          const lim = endOf(s, e) - (lvl >= 1 && !e.stopped ? 1.7 : 0.5);
          if (e.d < lim) {
            s.effects.push({ type: 'blink', x: e.x, y: e.y, t: 0, life: 0.5 });
            e.d = Math.min(lim, e.d + def.blink.dist);
            sfx('summon');
          }
        }
      }
      const f = e.frozenT > 0 || e.stopT > 0 ? 0 : e.slowT > 0 ? 1 - e.slowF : 1;
      e.d += e.speed * f * dt;
      if (e.hitT > 0) e.hitT -= dt;
      const p = enemyPos(s, e);
      e.x = p.x; e.y = p.y; e.dir = p.dir;
      const endD = endOf(s, e);
      e.rem = endD - e.d;
      if (e.d >= endD - 0.2 && !e.dead) {
        e.dead = true; e.leaked = true;
        s.lives = Math.max(0, s.lives - TD.ENEMIES[e.kind].lives);
        s.waveLeaked++;
        s.effects.push({ type: 'leak', x: e.x, y: e.y, t: 0, life: 0.8 });
        sfx('leak');
      }
    }

    // the gród defends itself
    if (lvl >= 2) {
      const bc = TD.baseCenter(s), w = s.wave + 1;
      s.baseCd -= dt;
      if (s.baseCd <= 0) {
        let target = null, best = -Infinity;
        for (const e of s.enemies) {
          if (e.dead || e.d < 0) continue;
          if (Math.hypot(e.x - bc.x, e.y - bc.y) > 4 * T) continue;
          if (-e.rem > best) { best = -e.rem; target = e; }
        }
        if (target) {
          s.baseCd = 1 / (lvl >= 4 ? 2.6 : lvl >= 3 ? 2 : 1.5);
          s.projectiles.push({ type: 'arrow', x: bc.x + (Math.random() - 0.5) * 50, y: bc.y - 30, target, dmg: Math.round((6 + 2 * w) * TD.diffHp(s) ** 0.5), speed: 11 * T });
          sfx('arrow');
        }
      }
      if (lvl >= 3) {
        const dps = (4 + 1.2 * w) * TD.diffHp(s) ** 0.5;
        for (const e of s.enemies) {
          if (e.dead || TD.ENEMIES[e.kind].flying) continue;
          if (Math.hypot(e.x - bc.x, e.y - bc.y) > 2 * T) continue;
          e.baseBurn = (e.baseBurn || 0) + dps * dt;
          if (e.baseBurn >= 1) { const a = Math.floor(e.baseBurn); e.baseBurn -= a; e.burnT = 0.3; damage(s, e, a, true); }
        }
      }
      if (lvl >= 4) {
        s.baseBoltCd -= dt;
        if (s.baseBoltCd <= 0) {
          let target = null, best = -1;
          for (const e of s.enemies) {
            if (e.dead || e.d < 0) continue;
            if (Math.hypot(e.x - bc.x, e.y - bc.y) > 6 * T) continue;
            if (e.hp > best) { best = e.hp; target = e; }
          }
          if (target) {
            s.baseBoltCd = 5;
            damage(s, target, Math.round(45 * TD.hpScale(w) * TD.diffHp(s)), true);
            s.effects.push({ type: 'zap', pts: [[bc.x + 22, bc.y - 74], [target.x, target.y - 6]], t: 0, life: 0.3, seed: Math.random() * 1000 });
            s.effects.push({ type: 'boom', x: target.x, y: target.y, t: 0, life: 0.35, r: 24 });
            sfx('thunder');
          }
        }
      }
    }

    TD.computeBuffs(s);

    // towers
    for (const t of s.towers.values()) {
      if (t.type === 'W' || t.type === 'M') continue;
      const st0 = TD.towerStats(t);
      const st = t.buff ? Object.assign({}, st0, { dmg: Math.round(st0.dmg * (1 + t.buff)) }) : st0;
      const cx = (t.x + 0.5) * T, cy = (t.y + 0.5) * T;
      const rr = st.range * T;
      let target = null, best = -Infinity;
      const mode = t.mode || 'first';
      for (const e of s.enemies) {
        if (e.dead || e.d < 0) continue;
        const dx = e.x - cx, dy = e.y - cy, d2 = dx * dx + dy * dy;
        if (d2 > rr * rr) continue;
        const score = mode === 'strong' ? (e.hp + e.shield) * 1000 - e.rem : mode === 'close' ? -d2 : -e.rem;
        if (score > best) { best = score; target = e; }
      }
      t.cd -= dt;
      if (t.type === 'Z') {
        if (t.cd > 0) continue;
        let any = false;
        for (const e of s.enemies) {
          if (e.dead || e.d < 0 || TD.ENEMIES[e.kind].flying) continue;
          if (Math.hypot(e.x - cx, e.y - cy) <= rr) { damage(s, e, st.dmg, false); e.burnT = 0.4; any = true; }
        }
        if (any) { t.cd = 1 / st.rate; s.effects.push({ type: 'firering', x: cx, y: cy, t: 0, life: 0.45, r: rr }); sfx('fire'); }
        continue;
      }
      if (!target) continue;
      const want = Math.atan2(target.y - (cy - 6), target.x - cx);
      let da = want - t.angle;
      while (da > Math.PI) da -= Math.PI * 2;
      while (da < -Math.PI) da += Math.PI * 2;
      t.angle += da * Math.min(1, dt * 14);
      if (t.cd > 0) continue;
      t.cd = 1 / st.rate;
      const ox = cx + (Math.cos(t.angle) < 0 ? -12 : 12), oy = cy - 48;
      if (t.type === 'A') {
        s.projectiles.push({ type: 'arrow', x: ox, y: oy, target, dmg: st.dmg, speed: 11 * T, src: t });
        sfx('arrow');
      } else if (t.type === 'B') {
        s.projectiles.push({ type: 'bolt', x: ox, y: oy, target, dmg: st.dmg, speed: 17 * T, src: t, pierce: true });
        sfx('ballista');
      } else if (t.type === 'L') {
        const pts = [[cx, cy - 60]];
        const hit = new Set();
        let cur = target, dmg = st.dmg;
        for (let k = 0; k < st.chain && cur; k++) {
          hit.add(cur);
          pts.push([cur.x, cur.y - 4]);
          damage(s, cur, Math.round(dmg), false, true);
          dmg *= 0.75;
          let nxt = null, nd = 1.6 * T;
          for (const e of s.enemies) {
            if (e.dead || hit.has(e) || e.d < 0) continue;
            const dd = Math.hypot(e.x - cur.x, e.y - cur.y);
            if (dd < nd) { nd = dd; nxt = e; }
          }
          cur = nxt;
        }
        s.effects.push({ type: 'zap', pts, t: 0, life: 0.22, seed: Math.random() * 1000 });
        sfx('zap');
      } else if (t.type === 'C') {
        // lead the target a little
        const lead = enemyPos(s, { kind: target.kind, d: target.d + target.speed * (target.slowT > 0 ? 1 - target.slowF : 1) * 0.55 });
        s.projectiles.push({ type: 'ball', sx: ox, sy: oy, tx: lead.x, ty: lead.y, t: 0, dur: 0.55, dmg: st.dmg, splash: st.splash * T, src: t });
        s.effects.push({ type: 'flash', x: ox, y: oy, t: 0, life: 0.12 });
        sfx('cannon');
      } else if (t.type === 'F') {
        damage(s, target, st.dmg, false);
        sfx('frost');
        if (!TD.ENEMIES[target.kind].noSlow) {
        target.slowF = target.slowT > 0 ? Math.max(target.slowF, st.slow) : st.slow;
        target.slowT = 1.6;
        }
        s.effects.push({ type: 'beam', x: ox, y: oy, x2: target.x, y2: target.y, t: 0, life: 0.18 });
      }
    }

    // projectiles
    for (const p of s.projectiles) {
      if (p.type === 'arrow' || p.type === 'bolt') {
        const tg = p.target;
        const tx = tg.x, ty = tg.y - 4;
        const dx = tx - p.x, dy = ty - p.y, dist = Math.hypot(dx, dy);
        p.angle = Math.atan2(dy, dx);
        const stepLen = p.speed * dt;
        if (dist <= stepLen || tg.dead) {
          if (!tg.dead) {
            const ev = TD.ENEMIES[tg.kind].evade;
            if (ev && Math.random() < ev) s.effects.push({ type: 'miss', x: tg.x, y: tg.y - 22, t: 0, life: 0.7 });
            else { damage(s, tg, p.dmg, !!p.pierce); if (p.pierce) sfx('thud'); }
          }
          p.done = true;
        } else { p.x += (dx / dist) * stepLen; p.y += (dy / dist) * stepLen; }
      } else if (p.type === 'ball') {
        p.t += dt;
        if (p.t >= p.dur) {
          p.done = true;
          for (const e of s.enemies) {
            if (e.dead) continue;
            const d = Math.hypot(e.x - p.tx, e.y - p.ty);
            if (d <= p.splash) {
              if (TD.ENEMIES[e.kind].evade && Math.random() < TD.ENEMIES[e.kind].evade) { s.effects.push({ type: 'miss', x: e.x, y: e.y - 22, t: 0, life: 0.7 }); continue; }
              damage(s, e, d < p.splash * 0.4 ? p.dmg : Math.round(p.dmg * 0.6), true);
            }
          }
          s.effects.push({ type: 'boom', x: p.tx, y: p.ty, t: 0, life: 0.4, r: p.splash });
          sfx('boom');
        }
      }
    }
    s.projectiles = s.projectiles.filter((p) => !p.done);
    s.enemies = s.enemies.filter((e) => !e.dead);

    // end conditions
    if (s.lives <= 0) {
      s.phase = 'lost';
      sfx('lose');
      s.projectiles = [];
      return;
    }
    if (!s.spawnQueue.length && !s.enemies.length) {
      s.wave++;
      const bonus = TD.waveReward(s.wave);
      s.gold += bonus;
      if ((s.baseLvl || 0) >= 4 && s.lives < TD.maxLives(s)) s.lives++;
      s.lastWave = { wave: s.wave, kills: s.waveKills, leaked: s.waveLeaked, gold: s.waveGold + bonus, bonus };
      s.best = Math.max(s.best || 0, s.wave);
      s.projectiles = [];
      s.fields = [];
      sfx('waveclear');
      if (s.wave >= TD.TOTAL_WAVES && !s.endless) { s.phase = 'won'; }
      else { s.phase = 'prep'; s.autoTimer = 2.5; }
      s.version++;
    }
  };

  TD.castPower = function (s, key, x, y) {
    const P = TD.POWERS[key], T = TD.T;
    if (s.phase !== 'wave' || s.powers[key] > 0) return false;
    const w = s.wave + 1, sc = TD.hpScale(w);
    s.powers[key] = P.cd;
    if (key === 'perun') {
      const r = P.radius * T;
      for (const e of s.enemies) {
        if (e.dead) continue;
        const d = Math.hypot(e.x - x, e.y - y);
        if (d <= r) {
          const amt = Math.round(75 * sc * (d < r * 0.5 ? 1 : 0.65));
          if (e.shield) { e.shield = 0; }
          damage(s, e, amt, true);
        }
      }
      s.effects.push({ type: 'perun', x, y, t: 0, life: 0.9, r });
      s.effects.push({ type: 'scorch', x, y, t: 0, life: 6, r });
      sfx('thunder');
    } else if (key === 'swarog') {
      s.fields.push({ x, y, r: P.radius * T, t: 0, life: 8, dps: 16 * sc });
      sfx('fire');
    } else if (key === 'marzanna') {
      for (const e of s.enemies) {
        if (e.dead) continue;
        const boss = TD.ENEMIES[e.kind].boss;
        e.frozenT = boss ? 1.5 : 3;
        e.slowT = e.frozenT + 3; e.slowF = 0.5;
      }
      s.effects.push({ type: 'winter', x: 0, y: 0, t: 0, life: 3.5 });
      sfx('freeze');
    }
    return true;
  };

  // ------------------------------------------------------------ save / load
  TD.serialize = function (s) {
    return JSON.stringify({
      v: 1, seed: s.seed, gold: s.gold, lives: s.lives, wave: s.wave, kills: s.kills, speed: s.speed, auto: s.auto,
      biome: s.map.biome, diff: s.diff, endless: s.endless, powers: s.powers,
      baseLvl: s.baseLvl || 0, baseInvested: s.baseInvested || 0, livesBought: s.livesBought || 0,
      towers: [...s.towers.values()].map((t) => [t.x, t.y, t.type, t.lvl, t.invested, t.mode]),
    });
  };

  TD.deserialize = function (str) {
    const o = JSON.parse(str);
    if (!o || o.v !== 1) return null;
    const s = TD.newGame(o.seed, { biome: o.biome, diff: o.diff });
    s.endless = !!o.endless;
    if (o.powers) Object.assign(s.powers, o.powers);
    s.baseLvl = o.baseLvl || 0; s.baseInvested = o.baseInvested || 0; s.livesBought = o.livesBought || 0;
    s.gold = o.gold; s.lives = o.lives; s.wave = o.wave; s.kills = o.kills || 0;
    s.speed = o.speed || 1; s.auto = !!o.auto;
    for (const [x, y, type, lvl, invested, mode] of o.towers) {
      s.towers.set(key(x, y), { x, y, type, lvl, invested, fresh: false, cd: 0, angle: -Math.PI / 2, kills: 0, mode: mode || (type === 'B' ? 'strong' : 'first') });
    }
    s.path = TD.computePath(s);
    if (!s.path) { s.towers.clear(); s.path = TD.computePath(s); }
    if (s.wave >= TD.TOTAL_WAVES && !s.endless) s.phase = 'won';
    TD.setFlight(s);
    return s;
  };

  TD.retryWave = function (s) {
    if (!s.snapshot) return s;
    const n = TD.deserialize(s.snapshot);
    n.snapshot = s.snapshot;
    return n;
  };
})();
