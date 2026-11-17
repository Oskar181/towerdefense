/* main.js — UI, input, game loop, saving. */
(function () {
  'use strict';
  const TD = window.TD;
  const T = TD.T;
  const $ = (id) => document.getElementById(id);
  const SAVE_KEY = 'td-maze.save.v1';

  let S = null; // game state
  const R = new TD.Renderer($('cv'));
  const ui = { buildType: null, selected: null, hover: null, touchPending: null };
  let lastUiSig = '';
  let hoverCache = { key: '', res: null };

  // ------------------------------------------------------------ storage
  const store = {
    get() { try { return localStorage.getItem(SAVE_KEY); } catch (e) { return null; } },
    set(v) { try { localStorage.setItem(SAVE_KEY, v); } catch (e) { /* ignore */ } },
    clear() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ } },
  };
  function save() {
    if (!S) return;
    if (S.phase === 'won') { store.set(TD.serialize(S)); return; }
    if (S.phase === 'prep') store.set(TD.serialize(S));
    else if (S.snapshot) store.set(S.snapshot); // mid-wave / lost: resume from the start of the wave
  }

  // ------------------------------------------------------------ helpers
  const coin = '<i class="coin" aria-hidden="true"></i>';
  const fmt = (n) => String(n).replace('.', ',');
  const plural = (n, one, few, many) => {
    if (n === 1) return one;
    const d = n % 10, dd = n % 100;
    return d >= 2 && d <= 4 && (dd < 12 || dd > 14) ? few : many;
  };
  let toastTimer = 0;
  function toast(msg, kind) {
    const el = $('toast');
    el.textContent = msg;
    el.className = 'toast show ' + (kind || '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (el.className = 'toast ' + (kind || '')), 2200);
  }
  function bump(id) {
    const el = $(id).parentElement;
    el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
  }

  // ------------------------------------------------------------ modal
  function modal(title, bodyHtml, actions) {
    $('modalTitle').textContent = title;
    $('modalBody').innerHTML = bodyHtml;
    const box = $('modalActions');
    box.innerHTML = '';
    actions.forEach((a) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = a.primary ? 'btn-gold' : 'btn-ghost';
      b.textContent = a.label;
      b.addEventListener('click', () => { closeModal(); a.run && a.run(); });
      box.appendChild(b);
    });
    $('modal').hidden = false;
    setTimeout(() => { const f = box.querySelector('.btn-gold') || box.querySelector('button'); f && f.focus(); }, 30);
  }
  function closeModal() { $('modal').hidden = true; $('modalBody').onclick = null; }
  const isModal = () => !$('modal').hidden;

  // Full in-game guide, generated from game data so it stays up to date
  function helpHtml() {
    const tw = TD.TOWER_ORDER.map((k, i) => { const d = TD.TOWERS[k]; return `<div class="help-row"><span class="hico">${TD.towerIconSvg(k, 1)}</span><span><b>${i + 1}. ${d.name}</b> · ${d.cost} zł<br><span class="hdesc">${d.desc}</span></span></div>`; }).join('');
    const bl = TD.BASE_LEVELS.slice(1).map((b, i) => `<li><b>${i + 1}. ${b.name}</b> (${b.cost} zł) — ${b.desc}</li>`).join('');
    const pw = TD.POWER_ORDER.map((k) => { const P = TD.POWERS[k]; return `<div class="help-row"><span class="hico round">${TD.powerIconSvg(k)}</span><span><b>${P.name}</b> · klawisz ${P.hot} · ${P.cd} s<br><span class="hdesc">${P.desc}</span></span></div>`; }).join('');
    const bosses = Object.keys(TD.BOSSES).map((w) => { const e = TD.ENEMIES[TD.BOSSES[w]]; return `<li><b>Fala ${w}: ${e.name}</b> — ${e.desc}</li>`; }).join('');
    const foes = Object.keys(TD.ENEMIES).filter((k) => !TD.ENEMIES[k].boss && k !== 'glutek').map((k) => { const e = TD.ENEMIES[k]; return `<div class="help-row"><span class="hico">${TD.enemyIconSvg(k)}</span><span><b>${e.name}</b>${e.flying ? ' <span class="tag fly">LATA</span>' : ''}${e.note ? `<br><span class="hdesc">${e.note}</span>` : ''}</span></div>`; }).join('');
    return `<div class="help">
<details open><summary>Cel gry</summary>
<p>Bestie wychodzą z <b>Wrót Nawii</b> po lewej i idą brukowaną drogą na <b>twój gród</b> po prawej. Każda, która dojdzie, zabiera życie grodu. Przetrwaj ${TD.TOTAL_WAVES} fal — potem możesz grać dalej w trybie bez końca.</p></details>
<details><summary>Przygotowanie (bez limitu czasu)</summary><ul>
<li>Stawiaj wieże i <b>palisady</b>, żeby wydłużyć drogę — przerywana linia ze strzałkami pokazuje, którędy pójdą bestie.</li>
<li>Gdy wskazujesz pole, zielona linia pokazuje nową trasę i o ile się wydłuży. Czerwone pole zablokowałoby drogę — tam nie zbudujesz.</li>
<li>Kliknij wieżę, żeby ją <b>ulepszyć</b> (4 poziomy), <b>sprzedać</b> (w tej samej przerwie zwrot 100%, potem 70%) lub wybrać, w kogo celuje.</li>
<li>Gdy będziesz gotów — <b>Następna fala</b>.</li></ul></details>
<details><summary>Wieże</summary>${tw}</details>
<details><summary>Fala</summary><ul>
<li>Wieże strzelają same. Możesz przyspieszyć grę (x1/x2/x3), zrobić pauzę albo włączyć <b>Auto</b>, by fale ruszały same.</li>
<li><b>Latające</b> bestie lecą prosto na gród nad labiryntem — fioletowa linia pokazuje ich lot. Postaw wieże wzdłuż niej.</li>
<li>Co 5 fal nadchodzi <b>boss</b> z paskiem życia na górze ekranu.</li></ul></details>
<details><summary>Moce bogów</summary><p>Działają tylko w trakcie fali i odnawiają się podczas walki (lewy dolny róg mapy).</p>${pw}</details>
<details><summary>Gród</summary><p>Kliknij gród (albo licznik żyć, albo klawisz G). Na poziomie 0 gród się nie broni. Rozbudowa między falami:</p><ul>${bl}</ul>
<p><b>Odkupienie życia</b> — w każdej chwili, do początkowej liczby żyć. Cena rośnie z numerem fali i z każdym odkupionym życiem.</p></details>
<details><summary>Złoto</summary><ul>
<li>Złoto dostajesz za pokonane bestie i premię za każdą odpartą falę.</li>
<li><b>Dar Welesa</b>: na start fali dostajesz 5% niewydanego złota (limit rośnie z falą) — czasem warto oszczędzać.</li></ul></details>
<details><summary>Bestie</summary>${foes}</details>
<details><summary>Bossowie</summary><ul>${bosses}</ul></details>
<details><summary>Porażka i zapis</summary><ul>
<li>Gdy gród padnie, możesz <b>powtórzyć falę</b> od jej początku — z tym samym złotem i wieżami.</li>
<li>Gra zapisuje się sama po każdej fali i każdej zmianie w budowie. Wybór krainy i trudności — w menu „Nowa gra”.</li></ul></details>
<details><summary>Sterowanie</summary><ul>
<li><b>Mysz:</b> klik — buduj / wybierz, prawy przycisk lub Esc — anuluj, kółko — przybliżenie, przeciągnięcie — przesuwanie mapy.</li>
<li><b>Klawisze:</b> 1–${TD.TOWER_ORDER.length} wieże, Q W E moce bogów, G gród, U ulepsz, Delete sprzedaj, Spacja następna fala, P pauza, M dźwięk.</li>
<li><b>Telefon:</b> dotknij pola, aby zobaczyć podgląd, i dotknij ponownie, aby postawić. Dwa palce — przybliżenie.</li></ul></details>
</div>`;
  }

  function showStart() {
    const saved = store.get();
    let savedInfo = null;
    if (saved) { try { const o = JSON.parse(saved); savedInfo = o; } catch (e) { /* ignore */ } }
    const actions = [];
    if (savedInfo) actions.push({ label: `Kontynuuj (fala ${savedInfo.wave + 1})`, primary: true, run: () => loadSaved(saved) });
    actions.push({ label: 'Nowa gra', primary: !savedInfo, run: () => chooseNew(false) });
    modal('Obrona Grodu', `<p>Spokojna obrona wieżami w turach: budujesz w swoim tempie, a potem patrzysz, jak fala rozbija się o twój labirynt.</p><ul>
<li>Bestie idą z <b>Wrót Nawii</b> na <b>twój gród</b>. Wieże i palisady wydłużają ich drogę.</li>
<li>Budujesz bez limitu czasu, potem uruchamiasz falę. Wieże strzelają same.</li>
<li>Przegrana nic nie kosztuje — falę można powtórzyć.</li></ul>
<p style="margin-top:8px">Pełny przewodnik: przycisk <b>?</b> w prawym górnym rogu.</p>`, actions);
  }

  function toggleSound() {
    TD.audio.unlock();
    TD.audio.setMuted(!TD.audio.muted);
    syncSound();
    if (!TD.audio.muted) TD.sfx('click');
  }
  function toggleMusic() {
    TD.audio.unlock();
    TD.music.setOn(!TD.music.on);
    syncSound();
  }
  function syncSound() {
    const mb = $('btnMusic');
    mb.classList.toggle('off', !TD.music.on);
    mb.setAttribute('aria-label', TD.music.on ? 'Wyłącz muzykę' : 'Włącz muzykę');
    const b = $('btnSound');
    b.classList.toggle('muted', TD.audio.muted);
    b.setAttribute('aria-label', TD.audio.muted ? 'Włącz dźwięk' : 'Wycisz dźwięk');
  }

  function showMenu() {
    modal('Menu', `<div class="vol-row"><label for="vol">Efekty</label><input type="range" id="vol" min="0" max="100" value="${Math.round(TD.audio.volume * 100)}"></div><div class="vol-row"><label for="mvol">Muzyka</label><input type="range" id="mvol" min="0" max="100" value="${Math.round(TD.music.volume * 100)}"></div><p>Fala ${S.wave + (S.phase === 'wave' ? 1 : 0)} z ${TD.TOTAL_WAVES}. Postęp zapisuje się automatycznie po każdej fali i każdej zmianie w budowie.</p>`, [
      { label: 'Wróć do gry', primary: true },
      { label: 'Nowa gra (nowa mapa)', run: () => confirmNew() },
    ]);
    const v = $('vol');
    v.addEventListener('input', () => { TD.audio.setVolume(v.value / 100); if (TD.audio.muted) { TD.audio.setMuted(false); syncSound(); } });
    v.addEventListener('change', () => TD.sfx('coin'));
    const mv = $('mvol');
    mv.addEventListener('input', () => { TD.music.setVolume(mv.value / 100); if (!TD.music.on) { TD.music.setOn(true); syncSound(); } });
  }
  function confirmNew() {
    modal('Zacząć od nowa?', '<p>Obecna gra zostanie zastąpiona nową, losową mapą.</p>', [
      { label: 'Tak, nowa mapa', primary: true, run: () => chooseNew(true) },
      { label: 'Anuluj' },
    ]);
  }

  // ------------------------------------------------------------ game lifecycle
  async function setState(ns) {
    S = ns;
    ui.selected = null; ui.hover = null; ui.touchPending = null;
    hoverCache.key = '';
    TD.music.setBiome(S.map.biome);
    $('mapName').textContent = `${TD.BIOMES[S.map.biome].name} · ${TD.DIFFS[S.diff].name} · mapa #${(S.seed % 100000).toString().padStart(5, '0')}`;
    if (R.mapRef == null || R.mapRef.seed !== S.map.seed || R.mapRef.biome !== S.map.biome) await R.setMap(S.map);
    else R.mapRef = S.map;
    R.resize();
    lastUiSig = '';
    renderUI();
  }
  const newOpts = { biome: 'meadow', diff: 'normal' };
  try { Object.assign(newOpts, JSON.parse(localStorage.getItem('td-maze.newopts') || '{}')); } catch (e) { /* ignore */ }
  function chooseNew(canCancel) {
    const biomeKeys = Object.keys(TD.BIOMES);
    const render = () => `<div class="choose">
      <h3>Kraina</h3><div class="opts">${biomeKeys.map((k) => `<button type="button" class="opt" data-biome="${k}" aria-pressed="${newOpts.biome === k}"><span class="swatch" style="background:${swatchBg(k)}"></span>${TD.BIOMES[k].name}</button>`).join('')}</div>
      <h3>Trudność</h3><div class="opts">${Object.keys(TD.DIFFS).map((k) => { const d = TD.DIFFS[k]; return `<button type="button" class="opt" data-diff="${k}" aria-pressed="${newOpts.diff === k}">${d.name}<small>${d.lives} żyć · ${d.gold} zł${d.hp !== 1 ? ` · HP ×${String(d.hp).replace('.', ',')}` : ''}</small></button>`; }).join('')}</div>
      <p style="margin-top:4px">Mapa jest za każdym razem losowa. Po 30 fali możesz grać dalej w trybie bez końca.</p></div>`;
    const acts = [{ label: 'Zagraj', primary: true, run: () => startNew() }];
    if (canCancel) acts.push({ label: 'Anuluj' });
    modal('Nowa gra', render(), acts);
    const body = $('modalBody');
    body.onclick = (e) => {
      const b = e.target.closest('.opt');
      if (!b) return;
      if (b.dataset.biome) newOpts.biome = b.dataset.biome;
      if (b.dataset.diff) newOpts.diff = b.dataset.diff;
      body.querySelectorAll('.opt').forEach((o) => o.setAttribute('aria-pressed', String(o.dataset.biome ? o.dataset.biome === newOpts.biome : o.dataset.diff === newOpts.diff)));
      TD.sfx('click');
    };
  }
  function swatchBg(k) {
    const B = TD.BIOMES[k];
    return `linear-gradient(135deg, ${B.base} 0 55%, ${B.water[0]} 55% 75%, ${B.shore[1]} 75%)`;
  }
  async function startNew() {
    try { localStorage.setItem('td-maze.newopts', JSON.stringify(newOpts)); } catch (e) { /* ignore */ }
    await setState(TD.newGame(null, newOpts));
    save();
    hint('Wybierz wieżę i postaw ją na mapie');
  }
  async function loadSaved(str) {
    let ns = null;
    try { ns = TD.deserialize(str); } catch (e) { ns = null; }
    if (!ns) { toast('Nie udało się wczytać zapisu — nowa gra', 'bad'); return startNew(); }
    await setState(ns);
    prevPhase = ns.phase;
    if (ns.phase === 'won') onPhase('wave', 'won');
  }

  function startWave() {
    if (!S || S.phase !== 'prep') return;
    ui.selected = null; ui.touchPending = null;
    TD.startWave(S);
    save();
    hint('');
    renderUI();
  }

  let hintTimer = 0;
  function hint(text, ms) {
    $('boardHint').textContent = text;
    clearTimeout(hintTimer);
    if (text) hintTimer = setTimeout(() => ($('boardHint').textContent = ''), ms || 6000);
  }

  // ------------------------------------------------------------ build / select actions
  function selectBuild(type) {
    if (!S) return;
    ui.buildType = ui.buildType === type ? null : type;
    if (ui.buildType) TD.sfx('select');
    ui.selected = null; ui.touchPending = null; hoverCache.key = '';
    if (ui.buildType) refreshHover();
    else ui.hover && (ui.hover.label = null);
    renderUI(true);
  }

  function evalCell(x, y) {
    const inside = x >= 0 && y >= 0 && x < S.map.cols && y < S.map.rows;
    const res = { x, y, inside, ok: false, label: null, path: null };
    if (!inside) return res;
    res.lx = (x + 0.5) * T; res.ly = y * T - 16;
    if (!ui.buildType || S.phase !== 'prep') return res;
    const k = `${x},${y},${ui.buildType},${S.version},${S.gold}`;
    if (hoverCache.key === k) return Object.assign(res, hoverCache.res);
    const chk = TD.canBuild(S, x, y, ui.buildType);
    const extra = { ok: chk.ok };
    if (chk.ok) {
      const gain = chk.path.length - S.path.length;
      extra.path = gain !== 0 ? chk.path : null;
      extra.label = gain > 0 ? `Trasa +${gain} ${plural(gain, 'pole', 'pola', 'pól')}` : gain < 0 ? `Trasa ${gain} pól` : `${TD.TOWERS[ui.buildType].name} · ${TD.TOWERS[ui.buildType].cost} zł`;
    } else {
      extra.label = chk.reason;
    }
    hoverCache = { key: k, res: extra };
    return Object.assign(res, extra);
  }

  let lastPointer = null;
  function refreshHover() {
    if (!lastPointer || !S) return;
    const w = R.toWorld(lastPointer.x, lastPointer.y);
    ui.hover = evalCell(Math.floor(w.x / T), Math.floor(w.y / T));
  }

  function tapCell(x, y, pointerType) {
    if (!S || isModal()) return;
    const inside = x >= 0 && y >= 0 && x < S.map.cols && y < S.map.rows;
    if (!inside) return;
    const t = S.towers.get(x + ',' + y);
    const b = S.map.base;
    if (x >= b.c && x <= b.c + 1 && y >= b.r - 1 && y <= b.r + 1 && !t) { selectBase(); return; }
    if (ui.buildType && S.phase === 'prep' && !t) {
      const h = evalCell(x, y);
      if (pointerType !== 'mouse') {
        // touch: first tap previews, second tap on the same cell builds
        if (!ui.touchPending || ui.touchPending.x !== x || ui.touchPending.y !== y) {
          ui.touchPending = { x, y };
          ui.hover = h;
          if (h.ok) { hint('Dotknij ponownie, aby postawić', 2500); TD.sfx('click'); }
          else { toast(h.label, 'bad'); TD.sfx('error'); }
          return;
        }
      }
      if (!h.ok) { toast(h.label || 'Nie można tu budować', 'bad'); TD.sfx('error'); return; }
      const res = TD.build(S, x, y, ui.buildType);
      if (res.ok) {
        TD.sfx('build');
        ui.touchPending = null; hoverCache.key = '';
        bump('gold');
        if (S.gold < TD.TOWERS[ui.buildType].cost) { ui.buildType = null; ui.hover = null; }
        else ui.hover = evalCell(x, y);
        save();
        renderUI(true);
      }
      return;
    }
    if (t) {
      ui.selected = ui.selected === t ? null : t;
      if (ui.selected) TD.sfx('click');
      ui.buildType = null; ui.touchPending = null;
      if (ui.hover) ui.hover.label = null;
      renderUI(true);
      return;
    }
    if (ui.buildType && S.phase !== 'prep') { toast('Budowa wróci po zakończeniu fali', 'bad'); return; }
    ui.selected = null; ui.touchPending = null;
    renderUI(true);
  }

  function selectBase() {
    ui.selected = ui.selected === 'base' ? null : 'base';
    ui.buildType = null; ui.touchPending = null; ui.power = null;
    if (ui.hover) ui.hover.label = null;
    TD.sfx('click');
    renderUI(true);
  }
  function doBaseUpgrade() {
    if (!S) return;
    if (S.phase !== 'prep') { toast('Rozbudowa grodu między falami', 'bad'); TD.sfx('error'); return; }
    const c = TD.baseUpgradeCost(S);
    if (c == null) return;
    if (S.gold < c) { toast('Za mało złota', 'bad'); TD.sfx('error'); return; }
    TD.upgradeBase(S); bump('gold'); save();
    toast(`Gród rozbudowany: ${TD.BASE_LEVELS[S.baseLvl].name}`, 'good');
    renderUI(true);
  }
  function doBuyLife() {
    if (!S) return;
    if (S.lives >= TD.maxLives(S)) { toast('Gród ma pełne życie', 'bad'); return; }
    const c = TD.lifeCost(S);
    if (S.gold < c) { toast('Za mało złota', 'bad'); TD.sfx('error'); return; }
    TD.buyLife(S); bump('gold'); bump('lives'); save();
    toast(`Odkupiono życie (−${c} zł). Następne: ${TD.lifeCost(S)} zł`, 'good');
    renderUI(true);
  }

  function doUpgrade() {
    const t = ui.selected;
    if (t === 'base') { doBaseUpgrade(); return; }
    if (!t || !S) return;
    if (S.phase !== 'prep') { toast('Ulepszanie między falami', 'bad'); return; }
    const c = TD.upgradeCost(t.type, t.lvl);
    if (c == null) return;
    if (S.gold < c) { toast('Za mało złota', 'bad'); TD.sfx('error'); return; }
    TD.upgrade(S, t); TD.sfx('upgrade'); bump('gold'); save(); renderUI(true);
  }
  function doSell() {
    const t = ui.selected;
    if (!t || t === 'base' || !S || S.phase !== 'prep') return;
    const v = TD.sellValue(t);
    TD.sell(S, t); ui.selected = null; hoverCache.key = '';
    toast(`Sprzedano za ${v} zł`, 'good'); TD.sfx('sell'); bump('gold'); save(); renderUI(true);
  }

  // ------------------------------------------------------------ god powers
  function buildPowers() {
    const box = $('powers');
    box.innerHTML = '<div class="pw-tip" id="pwTip" hidden></div>';
    TD.POWER_ORDER.forEach((k) => {
      const P = TD.POWERS[k];
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pw'; b.dataset.power = k;
      b.setAttribute('aria-label', P.name); b.setAttribute('aria-pressed', 'false');
      b.innerHTML = `${TD.powerIconSvg(k)}<span class="cd"></span><span class="cdt"></span><span class="hk">${P.hot}</span>`;
      b.addEventListener('click', () => usePower(k));
      b.addEventListener('mouseenter', () => showTip(k));
      b.addEventListener('mouseleave', () => { $('pwTip').hidden = true; });
      box.appendChild(b);
    });
  }
  function showTip(k) {
    const P = TD.POWERS[k], tip = $('pwTip');
    tip.innerHTML = `<b>${P.name}</b>${P.desc}<br><span style="color:#8d99ab">Odnowienie: ${P.cd} s walki · klawisz ${P.hot}</span>`;
    tip.hidden = false;
  }
  function usePower(k) {
    if (!S) return;
    if (S.phase !== 'wave') { toast('Moce bogów działają w trakcie fali', 'bad'); TD.sfx('error'); return; }
    if (S.powers[k] > 0) { toast(`${TD.POWERS[k].name} odnawia się (${Math.ceil(S.powers[k])} s)`, 'bad'); TD.sfx('error'); return; }
    if (!TD.POWERS[k].target) { TD.castPower(S, k); renderPowers(true); return; }
    ui.power = ui.power === k ? null : k;
    ui.buildType = null; ui.selected = null;
    if (ui.power) { TD.sfx('power'); hint(`${TD.POWERS[k].name}: wskaż miejsce na mapie`, 4000); }
    renderPowers(true);
  }
  let lastPwSig = '';
  function renderPowers(force) {
    const sig = TD.POWER_ORDER.map((k) => Math.ceil(S.powers[k] * 4)).join(',') + S.phase + ui.power;
    if (!force && sig === lastPwSig) return;
    lastPwSig = sig;
    document.querySelectorAll('.pw').forEach((b) => {
      const k = b.dataset.power, cd = S.powers[k], P = TD.POWERS[k];
      b.style.setProperty('--p', cd > 0 ? cd / P.cd : 0);
      b.querySelector('.cdt').textContent = cd > 0 ? Math.ceil(cd) : '';
      b.classList.toggle('ready', S.phase === 'wave' && cd <= 0);
      b.setAttribute('aria-pressed', String(ui.power === k));
      b.disabled = S.phase !== 'wave' && cd <= 0 ? false : false;
    });
  }

  // ------------------------------------------------------------ DOM rendering
  function buildCards() {
    const g = $('buildGrid');
    g.innerHTML = '';
    const gb = $('btnGrod');
    if (gb && !gb.dataset.wired) { gb.dataset.wired = '1'; gb.addEventListener('click', selectBase); }
    TD.TOWER_ORDER.forEach((k, i) => {
      const d = TD.TOWERS[k];
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'bcard'; b.dataset.type = k;
      b.setAttribute('aria-pressed', 'false');
      b.innerHTML = `<span class="ico">${TD.towerIconSvg(k, 1)}</span><span class="txt"><span class="nm">${d.label || d.name}</span><span class="price">${coin}${d.cost}</span></span><span class="kbd">${i + 1}</span>`;
      b.addEventListener('click', () => selectBuild(k));
      g.appendChild(b);
    });
  }

  let lastScrolledSel = null;
  function renderUI(force) {
    if (!S) return;
    const sel = ui.selected;
    const sig = [S.gold, S.lives, S.wave, S.phase, S.speed, S.paused, S.auto, ui.buildType, sel === 'base' ? 'base' + S.baseLvl + ',' + S.livesBought : sel ? sel.x + ',' + sel.y + ',' + sel.lvl + sel.mode + sel.buff : '-', S.endless, S.baseLvl,
      S.waveKills, S.enemies.length, S.spawnQueue.length, S.phase === 'prep' && S.auto ? Math.ceil(S.autoTimer) : 0, S.towers.size].join('|');
    if (!force && sig === lastUiSig) return;
    lastUiSig = sig;

    $('gold').textContent = S.gold;
    $('lives').textContent = S.lives;
    const wn = S.wave + (S.phase === 'wave' ? 1 : 0);
    $('waveNum').textContent = S.endless ? `${wn}/∞` : `${Math.min(wn, TD.TOTAL_WAVES)}/${TD.TOTAL_WAVES}`;
    $('waveBar').style.width = Math.min(100, (S.wave / TD.TOTAL_WAVES) * 100) + '%';
    const ph = $('phase');
    ph.className = 'phase' + (S.phase === 'wave' ? ' wave' : '');
    $('phaseText').textContent = S.phase === 'wave' ? (S.paused ? 'Pauza' : 'Walka') : S.phase === 'prep' ? 'Przygotowanie · bez limitu czasu' : S.phase === 'won' ? 'Zwycięstwo!' : 'Gród padł';

    // build cards
    const gb = $('btnGrod');
    if (gb) {
      const L = S.baseLvl || 0, c = TD.baseUpgradeCost(S);
      gb.setAttribute('aria-pressed', String(sel === 'base'));
      $('grodLvl').textContent = `Gród · poziom ${L}/4`;
      $('grodNext').innerHTML = c == null ? 'rozbudowany' : `${TD.BASE_LEVELS[L + 1].name} ${coin}${c}`;
    }
    document.querySelectorAll('.bcard').forEach((b) => {
      const k = b.dataset.type;
      b.setAttribute('aria-pressed', String(ui.buildType === k));
      b.classList.toggle('poor', S.gold < TD.TOWERS[k].cost);
      b.disabled = S.phase !== 'prep';
    });

    // info card
    const info = $('info');
    info.classList.remove('hint-only');
    if (sel !== 'base') lastScrolledSel = null;
    if (sel === 'base') {
      const L = S.baseLvl || 0, up = TD.baseUpgradeCost(S), prep = S.phase === 'prep';
      const nextL = L < 4 ? TD.BASE_LEVELS[L + 1] : null;
      const lifeC = TD.lifeCost(S), maxL = TD.maxLives(S);
      info.innerHTML = `<div class="head"><span class="ico base-ico">${TD.baseIconSvg(L)}</span><div><div class="name">Gród</div><div class="lvl">Poziom ${L} z 4 <span class="pips">${[1, 2, 3, 4].map((i) => `<i class="${i <= L ? 'on' : ''}"></i>`).join('')}</span></div></div></div>
        <div class="stats-box">${TD.BASE_LEVELS.slice(1).map((b, i) => `<div class="stat lvl-row${i + 1 <= L ? ' done' : ''}"><span>${i + 1}. ${b.name}</span><b>${i + 1 <= L ? '✓' : coin + b.cost}</b></div>`).join('')}</div>
        ${nextL ? `<p class="desc"><b>${nextL.name}:</b> ${nextL.desc}</p>` : '<p class="desc">Gród w pełni rozbudowany.</p>'}
        ${nextL ? `<button type="button" class="btn-gold" id="btnBase" ${!prep || S.gold < up ? 'disabled' : ''}>Rozbuduj ${coin}${up}</button>` : ''}
        <div class="life-row"><span>Życia <b>${S.lives}/${maxL}</b></span><button type="button" class="btn-ghost" id="btnLife" ${S.lives >= maxL || S.gold < lifeC ? 'disabled' : ''}>Odkup życie ${coin}${lifeC}</button></div>
        ${prep ? '' : '<p class="desc">Rozbudowa między falami — życie możesz odkupić w każdej chwili.</p>'}`;
      const bb = $('btnBase'); bb && bb.addEventListener('click', doBaseUpgrade);
      $('btnLife').addEventListener('click', doBuyLife);
      if (force && lastScrolledSel !== 'base') { lastScrolledSel = 'base'; requestAnimationFrame(() => info.scrollIntoView({ block: 'nearest', behavior: 'smooth' })); }
    } else if (sel) {
      const d = TD.TOWERS[sel.type];
      const st = TD.towerStats(sel), nx = sel.lvl < 4 ? TD.towerStats(sel, sel.lvl + 1) : null;
      const up = TD.upgradeCost(sel.type, sel.lvl);
      const pips = sel.type === 'W' ? '' : `<span class="pips">${[1, 2, 3, 4].map((i) => `<i class="${i <= sel.lvl ? 'on' : ''}"></i>`).join('')}</span>`;
      let rows = '';
      if (st && st.support) {
        const row = (n, a, b) => `<div class="stat"><span>${n}</span><b>${a}${b != null && b !== a ? ` <span class="up">→ ${b}</span>` : ''}</b></div>`;
        rows = `<div class="stats-box">${row('Wzmocnienie wież', '+' + Math.round(st.buff * 100) + '%', nx && '+' + Math.round(nx.buff * 100) + '%')}${row('Zasięg', fmt(st.range), nx && fmt(nx.range))}</div><p class="desc">${d.desc}</p>`;
      } else if (st) {
        const row = (n, a, b) => `<div class="stat"><span>${n}</span><b>${a}${b != null && b !== a ? ` <span class="up">→ ${b}</span>` : ''}</b></div>`;
        rows = `<div class="stats-box">${row('Obrażenia', st.dmg, nx && nx.dmg)}${row('Zasięg', fmt(st.range), nx && fmt(nx.range))}${row('Strzały', fmt(st.rate) + '/s', nx && fmt(nx.rate) + '/s')}${st.slow ? row('Spowolnienie', Math.round(st.slow * 100) + '%', nx && Math.round(nx.slow * 100) + '%') : ''}${st.splash ? row('Wybuch', fmt(st.splash), nx && fmt(nx.splash)) : ''}${st.chain ? row('Przeskoki', st.chain, nx && nx.chain) : ''}${st.pierce ? '<div class="stat"><span>Przebija pancerz</span><b>tak</b></div>' : ''}${sel.buff ? `<div class="stat"><span>Chram Mokoszy</span><b class="up">+${Math.round(sel.buff * 100)}%</b></div>` : ''}</div>${sel.type === 'Z' ? `<p class="desc">${d.desc}</p>` : ''}`;
      }
      const prep = S.phase === 'prep';
      const upBtn = up == null ? (sel.type === 'W' ? '' : `<button type="button" class="btn-gold" disabled>Maks. poziom</button>`)
        : `<button type="button" class="btn-gold" id="btnUp" ${!prep || S.gold < up ? 'disabled' : ''}>Ulepsz ${coin}${up}</button>`;
      info.innerHTML = `<div class="head"><span class="ico">${TD.towerIconSvg(sel.type, sel.lvl)}</span><div><div class="name">${d.name}</div><div class="lvl">${sel.type === 'W' ? 'Blokada' : `Poziom ${sel.lvl} z 4`} ${pips}</div></div></div>
        ${rows}${sel.type === 'W' ? `<p class="desc">${d.desc}</p>` : ''}
        ${st && !st.support && sel.type !== 'Z' ? `<div class="modes" role="group" aria-label="Cel wieży">${Object.keys(TD.TARGET_MODES).map((k) => `<button type="button" data-mode="${k}" aria-pressed="${sel.mode === k}">${TD.TARGET_MODES[k]}</button>`).join('')}</div>` : ''}
        <div class="btn-row">${upBtn}<button type="button" class="btn-ghost" id="btnSell" ${prep ? '' : 'disabled'}>Sprzedaj +${TD.sellValue(sel)}</button></div>
        ${prep ? '' : '<p class="desc">Zmiany możliwe po zakończeniu fali.</p>'}`;
      const bu = $('btnUp'); bu && bu.addEventListener('click', doUpgrade);
      info.querySelectorAll('.modes button').forEach((b) => b.addEventListener('click', () => { sel.mode = b.dataset.mode; TD.sfx('click'); save(); renderUI(true); }));
      $('btnSell').addEventListener('click', doSell);
    } else if (ui.buildType) {
      const d = TD.TOWERS[ui.buildType], st = TD.towerStats(ui.buildType, 1);
      info.innerHTML = `<div class="head"><span class="ico">${TD.towerIconSvg(ui.buildType, 1)}</span><div><div class="name">${d.name}</div><div class="lvl">${coin} ${d.cost} zł</div></div></div>
        <p class="desc">${d.desc}</p>
        ${st && st.support ? `<div class="stats-box"><div class="stat"><span>Wzmocnienie wież</span><b>+${Math.round(st.buff * 100)}%</b></div><div class="stat"><span>Zasięg</span><b>${fmt(st.range)}</b></div></div>` : ''}
        ${st && !st.support ? `<div class="stats-box"><div class="stat"><span>Obrażenia</span><b>${st.dmg}</b></div><div class="stat"><span>Zasięg</span><b>${fmt(st.range)}</b></div><div class="stat"><span>Strzały</span><b>${fmt(st.rate)}/s</b></div>${st.chain ? `<div class="stat"><span>Przeskoki</span><b>${st.chain}</b></div>` : ''}${st.slow ? `<div class="stat"><span>Spowolnienie</span><b>${Math.round(st.slow * 100)}%</b></div>` : ''}</div>` : ''}
        <p class="desc">Kliknij pole na mapie. <b>Esc</b> lub prawy przycisk — anuluj.</p>`;
    } else {
      info.classList.add('hint-only');
      info.innerHTML = `<h2 class="sec">Wskazówka</h2><p class="desc">${S.phase === 'prep'
        ? 'Wybierz wieżę i postaw ją na mapie. Palisady tanio wydłużają trasę — im dłuższa, tym dłużej wieże strzelają. Kliknij istniejącą wieżę, by ją ulepszyć, a gród — by go rozbudować lub odkupić życie.'
        : S.phase === 'wave' ? 'Fala w toku. Wieże strzelają same — możesz przyspieszyć grę albo zrobić pauzę.' : 'Wybierz w oknie, co dalej.'}</p>`;
    }

    // wave card
    const wc = $('waveCard');
    if (S.phase === 'wave') {
      const done = S.waveKills + (S.waveLeaked || 0);
      wc.innerHTML = `<div class="sec-row"><h2 class="sec">Fala ${S.wave + 1}</h2><span class="small">${S.paused ? 'Pauza' : 'Walka'}</span></div>
        <div class="progress"><span style="width:${(done / Math.max(1, S.waveTotal)) * 100}%"></span></div>
        <span class="small">Pokonano ${S.waveKills} z ${S.waveTotal}${S.waveLeaked ? ` · przeszło ${S.waveLeaked}` : ''}</span>`;
    } else if (S.phase === 'prep') {
      const w = S.wave + 1;
      const groups = TD.waveGroups(w);
      const est = groups.reduce((a, g) => a + g.count * TD.ENEMIES[g.kind].gold, 0) + TD.waveReward(w);
      const gift = TD.velesGift(S), cap = 10 + 2 * w;
      wc.innerHTML = `<div class="sec-row"><h2 class="sec">Następna fala · ${w}</h2><span class="price">${coin}~${est}</span></div>` +
        `<div class="gift" title="Na start fali dostajesz 5% niewydanego złota (maks. ${cap} zł)">${coin}<span>Dar Welesa: <b>+${gift} zł</b> na start${gift >= cap ? ' (maks.)' : ''}</span></div>` +
        groups.map((g) => { const e = TD.ENEMIES[g.kind]; return `<div class="foe-row${e.boss ? ' boss' : ''}"><span class="ico">${TD.enemyIconSvg(g.kind)}</span><span class="nm">${e.name}${e.boss ? '<span class="tag">BOSS</span>' : ''}${e.flying ? '<span class="tag fly">LATA</span>' : ''}${e.note && !e.boss ? ` <span class="note">· ${e.note}</span>` : ''}${e.boss && e.desc ? `<br><span class="note">${e.desc}</span>` : ''}</span><span class="cnt">×${g.count}</span></div>`; }).join('');
    } else {
      wc.innerHTML = `<h2 class="sec">${S.phase === 'won' ? 'Wygrana' : 'Gród padł'}</h2><p class="desc">Pokonani wrogowie: ${S.kills}</p>`;
    }

    // controls
    document.querySelectorAll('#speedSeg button').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.speed === S.speed)));
    const bp = $('btnPause');
    bp.disabled = S.phase !== 'wave';
    bp.classList.toggle('on', S.paused);
    bp.setAttribute('aria-label', S.paused ? 'Wznów' : 'Pauza');
    $('btnAuto').setAttribute('aria-pressed', String(S.auto));
    const bw = $('btnWave');
    bw.disabled = S.phase !== 'prep';
    $('btnWaveText').textContent = S.phase === 'prep'
      ? (S.auto && S.wave > 0 && S.autoTimer > 0 ? `Start za ${Math.ceil(S.autoTimer)}…` : (S.wave === 0 ? 'Rozpocznij falę 1' : 'Następna fala'))
      : S.phase === 'wave' ? 'Fala w toku…' : 'Koniec gry';
  }

  // ------------------------------------------------------------ input
  const cv = $('cv');
  const pointers = new Map();
  let drag = null, pinch = null;

  function localXY(e) {
    const r = cv.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  cv.addEventListener('pointerdown', (e) => {
    if (e.button === 2) return;
    cv.setPointerCapture(e.pointerId);
    const p = localXY(e);
    if (ui.power) ui.powerPos = R.toWorld(p.x, p.y);
    pointers.set(e.pointerId, p);
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), zoom: R.zoom };
      drag = null;
    } else {
      drag = { x: p.x, y: p.y, sx: p.x, sy: p.y, moved: false, type: e.pointerType };
    }
  });
  cv.addEventListener('pointermove', (e) => {
    const p = localXY(e);
    if (pointers.has(e.pointerId)) pointers.set(e.pointerId, p);
    if (pinch && pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      R.setZoom(pinch.zoom * (d / pinch.d), (a.x + b.x) / 2, (a.y + b.y) / 2);
      return;
    }
    if (drag) {
      if (!drag.moved && Math.hypot(p.x - drag.sx, p.y - drag.sy) > 8) drag.moved = true;
      if (drag.moved) { R.pan(p.x - drag.x, p.y - drag.y); drag.x = p.x; drag.y = p.y; }
    }
    if (e.pointerType === 'mouse') { lastPointer = p; refreshHover(); }
    if (ui.power) ui.powerPos = R.toWorld(p.x, p.y);
  });
  function endPointer(e) {
    const p = localXY(e);
    pointers.delete(e.pointerId);
    if (pinch) { if (pointers.size < 2) pinch = null; drag = null; return; }
    if (drag && !drag.moved && e.type === 'pointerup') {
      const w = R.toWorld(p.x, p.y);
      if (ui.power) {
        if (TD.castPower(S, ui.power, w.x, w.y)) { ui.power = null; ui.powerPos = null; hint(''); renderPowers(true); }
        else { ui.power = null; renderPowers(true); }
      } else tapCell(Math.floor(w.x / T), Math.floor(w.y / T), drag.type);
    }
    drag = null;
  }
  cv.addEventListener('pointerup', endPointer);
  cv.addEventListener('pointercancel', endPointer);
  cv.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { lastPointer = null; ui.hover = null; } });
  cv.addEventListener('contextmenu', (e) => { e.preventDefault(); cancel(); });
  cv.addEventListener('wheel', (e) => {
    e.preventDefault();
    const p = localXY(e);
    R.setZoom(R.zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15), p.x, p.y);
    refreshHover();
  }, { passive: false });

  function cancel() {
    if (ui.power) { ui.power = null; ui.powerPos = null; renderPowers(true); hint(''); }
    if (ui.buildType || ui.selected || ui.touchPending) {
      ui.buildType = null; ui.selected = null; ui.touchPending = null; ui.hover = null;
      renderUI(true);
    }
  }

  window.addEventListener('keydown', (e) => {
    if (!S || e.ctrlKey || e.metaKey || e.altKey) return;
    if (isModal()) { if (e.key === 'Escape' && S) closeModal(); return; }
    const k = e.key.toLowerCase();
    if (k >= '1' && k <= String(TD.TOWER_ORDER.length) && k.length === 1) { selectBuild(TD.TOWER_ORDER[+k - 1]); e.preventDefault(); }
    else if (k === 'm') toggleSound();
    else if (k === 'g') selectBase();
    else if (k === 'q') usePower('perun');
    else if (k === 'w') usePower('swarog');
    else if (k === 'e') usePower('marzanna');
    else if (k === 'escape') cancel();
    else if (k === ' ' || k === 'enter') { if (S.phase === 'prep' && document.activeElement === document.body) { startWave(); e.preventDefault(); } }
    else if (k === 'p') togglePause();
    else if (k === 'u') doUpgrade();
    else if (k === 'delete' || k === 'backspace') doSell();
  });

  function togglePause() { if (S && S.phase === 'wave') { S.paused = !S.paused; renderUI(true); } }

  $('btnWave').addEventListener('click', startWave);
  $('btnPause').addEventListener('click', togglePause);
  $('btnAuto').addEventListener('click', () => { S.auto = !S.auto; S.autoTimer = S.auto ? 2.5 : 0; TD.sfx('click'); save(); renderUI(true); toast(S.auto ? 'Auto: kolejne fale startują same' : 'Auto wyłączone'); });
  document.querySelectorAll('#speedSeg button').forEach((b) => b.addEventListener('click', () => { S.speed = +b.dataset.speed; save(); renderUI(true); }));
  $('zoomIn').addEventListener('click', () => R.setZoom(R.zoom * 1.3));
  $('zoomOut').addEventListener('click', () => R.setZoom(R.zoom / 1.3));
  $('btnSound').addEventListener('click', toggleSound);
  $('lives').parentElement.addEventListener('click', () => S && selectBase());
  $('btnMusic').addEventListener('click', toggleMusic);
  ['pointerdown', 'keydown'].forEach((ev) => window.addEventListener(ev, () => TD.audio.unlock(), { capture: true }));
  $('btnHelp').addEventListener('click', () => modal('Jak grać', helpHtml(), [{ label: 'Rozumiem', primary: true }]));
  $('btnMenu').addEventListener('click', showMenu);
  window.addEventListener('resize', () => R.resize());
  document.addEventListener('visibilitychange', () => { if (document.hidden && S && S.phase === 'wave') { S.paused = true; renderUI(true); } });

  // ------------------------------------------------------------ loop
  let last = performance.now(), clock = 0, prevPhase = null;
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now; clock += dt;
    if (S && !isModal()) {
      if (!(S.phase === 'wave' && S.paused)) {
        let total = dt * S.speed;
        while (total > 1e-6) { const d = Math.min(total, 1 / 60); TD.step(S, d); total -= d; }
      }
      if (prevPhase !== S.phase) onPhase(prevPhase, S.phase);
      prevPhase = S.phase;
      renderUI();
      updateBoss();
      renderPowers();
    }
    if (S) R.draw(S, ui, clock);
    requestAnimationFrame(frame);
  }

  let bossShown = null;
  function updateBoss() {
    const b = S.phase === 'wave' ? S.enemies.find((e) => TD.ENEMIES[e.kind].boss) : null;
    const bar = $('bossBar');
    if (!b) { if (!bar.hidden) bar.hidden = true; bossShown = null; return; }
    if (bossShown !== b) {
      bossShown = b;
      const d = TD.ENEMIES[b.kind];
      $('bossName').textContent = d.name;
      $('bossDesc').textContent = d.desc || '';
      $('bossIco').innerHTML = TD.enemyIconSvg(b.kind);
      bar.hidden = false;
      toast(`Nadchodzi boss: ${d.name}!`, 'bad');
    }
    $('bossHp').style.width = Math.max(0, (b.hp / b.maxHp) * 100) + '%';
  }

  function onPhase(from, to) {
    TD.music.setMood(to === 'wave' ? 'wave' : 'prep');
    if (to !== 'wave' && ui.power) { ui.power = null; ui.powerPos = null; }
    renderPowers(true);
    if (from === 'prep' && to === 'wave' && S.lastGift > 0) setTimeout(() => toast(`Dar Welesa: +${S.lastGift} zł za oszczędzanie`, 'good'), 50);
    if (from === 'wave' && to === 'prep' && S.lastWave) {
      const lw = S.lastWave;
      toast(`Fala ${lw.wave} odparta! +${lw.gold} zł${lw.leaked ? ` · przeszło ${lw.leaked}` : ''}`, 'good');
      bump('gold');
      save();
    }
    if (to === 'lost') {
      save();
      modal('Gród padł', `<p>Fala ${S.wave + 1} wdarła się do grodu. Nic straconego — możesz powtórzyć tę falę od początku z tym samym złotem i wieżami, i coś przebudować.</p>`, [
        { label: 'Powtórz falę', primary: true, run: () => retry() },
        { label: 'Nowa gra', run: () => startNew() },
      ]);
    }
    if (from === 'prep' && to === 'wave') TD.sfx('wavestart');
    if (to === 'won') {
      TD.sfx('win');
      modal('Zwycięstwo!', `<p>Wszystkie ${TD.TOTAL_WAVES} fal odparte, Czarnobóg wygnany do Nawii! Pokonani wrogowie: <b>${S.kills}</b>. Twój gród ma jeszcze ${S.lives} ${plural(S.lives, 'życie', 'życia', 'żyć')}.</p><p>Możesz grać dalej na tej mapie — fale i bossowie będą coraz silniejsi.</p>`, [
        { label: 'Graj dalej (bez końca)', primary: true, run: () => goEndless() },
        { label: 'Nowa mapa', run: () => chooseNew(false) },
      ]);
    }
  }

  function goEndless() {
    S.endless = true; S.phase = 'prep'; S.autoTimer = 0; prevPhase = 'prep';
    save(); renderUI(true);
    toast('Tryb bez końca — powodzenia!', 'good');
  }

  async function retry() {
    const snap = S.snapshot;
    const ns = TD.retryWave(S);
    await setState(ns);
    ns.snapshot = snap;
    prevPhase = ns.phase;
    save();
  }

  // ------------------------------------------------------------ boot
  async function boot() {
    buildCards();
    buildPowers();
    syncSound();
    await TD.loadSprites();
    // Show a map behind the start screen right away
    const saved = store.get();
    let ns = null;
    if (saved) { try { ns = TD.deserialize(saved); } catch (e) { ns = null; } }
    await setState(ns || TD.newGame());
    prevPhase = S.phase;
    requestAnimationFrame((t) => { last = t; frame(t); });
    showStart();
  }
  // expose for debugging / tests
  window.TDgame = { get state() { return S; }, ui, renderer: R, startWave, tapCell, selectBuild };
  boot();
})();
