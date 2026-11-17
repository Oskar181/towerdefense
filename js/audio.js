/* audio.js — sound effects synthesised with Web Audio (no audio files). */
(function () {
  'use strict';
  const TD = (window.TD = window.TD || {});
  const PREF_KEY = 'td-maze.audio.v1';

  let ctx = null, master = null, comp = null, noiseBuf = null;
  const prefs = { volume: 0.6, muted: false };
  try { Object.assign(prefs, JSON.parse(localStorage.getItem(PREF_KEY) || '{}')); } catch (e) { /* ignore */ }
  const savePrefs = () => { try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) { /* ignore */ } };

  function init() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try { ctx = new AC(); } catch (e) { ctx = null; return false; }
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.knee.value = 12; comp.ratio.value = 4;
    master = ctx.createGain();
    master.gain.value = prefs.muted ? 0 : prefs.volume * 0.5;
    master.connect(comp); comp.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 1, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return true;
  }

  // Must be called from a user gesture (click / key / touch)
  function unlock() {
    if (!init()) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    if (typeof startMusic === 'function' && music.on && !music.running) startMusic();
  }

  // ------------------------------------------------------------ building blocks
  function env(g, t, a, peak, dur, end) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(end || 0.0001, t + dur);
  }
  function tone(type, f0, f1, dur, vol, opts) {
    opts = opts || {};
    const t = ctx.currentTime + (opts.delay || 0);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    if (opts.detune) o.detune.value = opts.detune;
    env(g, t, opts.attack || 0.005, vol, dur);
    let node = o;
    if (opts.filter) {
      const f = ctx.createBiquadFilter();
      f.type = opts.filter; f.frequency.value = opts.ff || 1200; f.Q.value = opts.q || 0.7;
      node.connect(f); node = f;
    }
    node.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, vol, ftype, f0, f1, opts) {
    opts = opts || {};
    const t = ctx.currentTime + (opts.delay || 0);
    const src = ctx.createBufferSource(); src.buffer = noiseBuf;
    src.playbackRate.value = opts.rate || 1;
    const f = ctx.createBiquadFilter(); f.type = ftype; f.Q.value = opts.q || 1;
    f.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = ctx.createGain(); env(g, t, opts.attack || 0.003, vol, dur);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.05);
  }
  const rnd = (a, b) => a + Math.random() * (b - a);

  // ------------------------------------------------------------ the sounds
  const SOUNDS = {
    arrow: () => { noise(0.07, 0.18, 'bandpass', 3200, 1800, { q: 2 }); tone('triangle', rnd(700, 820), 380, 0.07, 0.06); },
    ballista: () => { tone('triangle', 200, 90, 0.22, 0.32); noise(0.12, 0.25, 'bandpass', 1400, 500, { q: 1.5 }); tone('square', 900, 300, 0.03, 0.05); },
    thud: () => { tone('sine', 160, 70, 0.12, 0.25); },
    cannon: () => { tone('sine', 130, 40, 0.28, 0.5); noise(0.18, 0.3, 'lowpass', 900, 120); },
    boom: () => { noise(0.45, 0.42, 'lowpass', 1400, 80); tone('sine', 90, 35, 0.4, 0.4); },
    frost: () => { tone('sine', rnd(1500, 1700), 2400, 0.16, 0.06); tone('triangle', 2600, 3200, 0.12, 0.03, { delay: 0.03 }); noise(0.12, 0.05, 'highpass', 5000, 7000); },
    zap: () => {
      noise(0.16, 0.22, 'bandpass', rnd(2500, 3500), 1200, { q: 4 });
      tone('sawtooth', rnd(110, 140), 60, 0.16, 0.12, { filter: 'lowpass', ff: 2200 });
      tone('square', 1800, 600, 0.05, 0.05, { delay: 0.04 });
    },
    death: () => { tone('square', rnd(520, 640), 140, 0.09, 0.07, { filter: 'lowpass', ff: 1800 }); noise(0.06, 0.06, 'bandpass', 1500, 600); },
    bigdeath: () => { tone('sawtooth', 220, 40, 0.8, 0.3, { filter: 'lowpass', ff: 900 }); noise(0.7, 0.35, 'lowpass', 1200, 60); },
    coin: () => { tone('sine', 1319, 1319, 0.08, 0.1); tone('sine', 1976, 1976, 0.16, 0.09, { delay: 0.06 }); },
    leak: () => { tone('triangle', 330, 110, 0.35, 0.28); tone('sine', 82, 60, 0.4, 0.3); },
    build: () => { noise(0.08, 0.35, 'lowpass', 900, 300); tone('sine', 200, 120, 0.12, 0.3); tone('triangle', 520, 520, 0.05, 0.06, { delay: 0.05 }); },
    upgrade: () => { [523, 659, 784, 1047].forEach((f, i) => tone('triangle', f, f, 0.16, 0.12, { delay: i * 0.07 })); },
    sell: () => { [1047, 784, 659].forEach((f, i) => tone('sine', f, f, 0.12, 0.1, { delay: i * 0.06 })); },
    error: () => { tone('square', 150, 130, 0.14, 0.08, { filter: 'lowpass', ff: 700 }); tone('square', 150, 120, 0.14, 0.08, { delay: 0.16, filter: 'lowpass', ff: 700 }); },
    click: () => { tone('triangle', 900, 700, 0.04, 0.06); },
    select: () => { tone('sine', 660, 880, 0.08, 0.08); },
    wavestart: () => {
      tone('sawtooth', 196, 196, 0.35, 0.12, { filter: 'lowpass', ff: 1100, attack: 0.04 });
      tone('sawtooth', 294, 294, 0.5, 0.12, { delay: 0.3, filter: 'lowpass', ff: 1200, attack: 0.04 });
      noise(0.5, 0.05, 'lowpass', 400, 200, { delay: 0.05 });
    },
    waveclear: () => { [523, 659, 784].forEach((f) => tone('triangle', f, f, 0.9, 0.08, { attack: 0.02 })); tone('sine', 1047, 1047, 0.9, 0.05, { delay: 0.12, attack: 0.03 }); },
    lose: () => { [392, 330, 262, 196].forEach((f, i) => tone('triangle', f, f * 0.98, 0.4, 0.12, { delay: i * 0.22 })); },
    bossroar: () => {
      tone('sawtooth', 110, 55, 1.0, 0.22, { filter: 'lowpass', ff: 700, attack: 0.08 });
      tone('sawtooth', 116, 58, 1.0, 0.16, { filter: 'lowpass', ff: 600, attack: 0.1 });
      noise(0.9, 0.18, 'lowpass', 600, 120, { attack: 0.1 });
    },
    summon: () => { tone('sine', 300, 900, 0.3, 0.1); tone('triangle', 450, 1350, 0.3, 0.06, { delay: 0.05 }); },
    shield: () => { tone('triangle', 1400, 500, 0.18, 0.12); noise(0.15, 0.12, 'highpass', 4000, 2000); },
    thunder: () => {
      noise(0.08, 0.6, 'highpass', 3000, 1500);
      noise(1.6, 0.55, 'lowpass', 1800, 60, { delay: 0.03, attack: 0.01 });
      tone('sine', 70, 30, 1.2, 0.45, { delay: 0.02 });
    },
    fire: () => { noise(1.2, 0.3, 'bandpass', 600, 1400, { q: 0.7, attack: 0.15 }); tone('sawtooth', 90, 140, 0.8, 0.06, { filter: 'lowpass', ff: 500, attack: 0.1 }); },
    freeze: () => {
      noise(1.0, 0.18, 'highpass', 6000, 2500, { attack: 0.05 });
      [1568, 2093, 2637, 3136].forEach((f, i) => tone('sine', f, f * 1.01, 0.6, 0.05, { delay: i * 0.07 }));
    },
    power: () => { tone('triangle', 440, 880, 0.15, 0.08); },
    win: () => { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone('triangle', f, f, 0.35, 0.12, { delay: i * 0.13 })); },
  };

  // per-sound throttling so x3 speed with many towers does not turn into noise
  const MIN_GAP = { thunder: 0.3, fire: 0.3, freeze: 0.5, bossroar: 1.5, summon: 0.3, shield: 0.1, arrow: 0.05, frost: 0.08, zap: 0.08, death: 0.04, coin: 0.06, thud: 0.06, cannon: 0.07, boom: 0.08, ballista: 0.08, leak: 0.12 };
  const lastAt = {};
  const VOL = { arrow: 0.8, death: 0.9 };

  TD.sfx = function (name) {
    if (!ctx || prefs.muted || ctx.state !== 'running') return;
    const fn = SOUNDS[name];
    if (!fn) return;
    const now = ctx.currentTime;
    if (lastAt[name] && now - lastAt[name] < (MIN_GAP[name] || 0.03)) return;
    lastAt[name] = now;
    try { fn(VOL[name] || 1); } catch (e) { /* ignore */ }
  };

  // ------------------------------------------------------------ music: generative Slavic-folk style
  // drone (bagpipe-like 'dudy'), plucked gusli arpeggios, a fujarka (flute) melody, frame drum in battle
  const MODES = { dorian: [0, 2, 3, 5, 7, 9, 10], aeolian: [0, 2, 3, 5, 7, 8, 10], mixolydian: [0, 2, 4, 5, 7, 9, 10] };
  const KEYS = { meadow: { root: 50, mode: 'dorian' }, winter: { root: 45, mode: 'aeolian' }, desert: { root: 43, mode: 'mixolydian' }, autumn: { root: 48, mode: 'aeolian' } }; // MIDI roots: D3, A2, G2
  const PROG = [[0, 2, 4], [6, 1, 3], [0, 2, 4], [4, 6, 1], [5, 0, 2], [6, 1, 3], [4, 6, 1], [0, 2, 4]]; // i VII i v VI VII v i (scale degrees)
  // melody motifs: [degree, beats]; degree 7+ = next octave, -1 = rest
  const MOTIFS = [
    [[4, 1], [3, 0.5], [2, 0.5], [3, 1], [4, 1], [2, 2], [-1, 2]],
    [[0, 1], [2, 1], [4, 1.5], [3, 0.5], [2, 1], [1, 1], [0, 2]],
    [[4, 0.5], [5, 0.5], [6, 1], [7, 1.5], [6, 0.5], [5, 1], [4, 3]],
    [[7, 1], [6, 0.5], [5, 0.5], [4, 1], [3, 1], [4, 2], [-1, 2]],
    [[2, 0.5], [3, 0.5], [4, 1], [4, 1], [5, 0.5], [4, 0.5], [3, 1], [2, 1], [0, 2]],
    [[4, 1.5], [5, 0.5], [4, 1], [2, 1], [3, 1.5], [2, 0.5], [1, 2]],
  ];
  const music = { on: prefs.musicOn !== false, vol: prefs.musicVol == null ? 0.5 : prefs.musicVol, mood: 'prep', biome: 'meadow', running: false, gain: null, drone: null, timer: 0, next: 0, beat: 0, melodyQueue: [], melT: 0 };
  const BPM = 74, BEAT = 60 / BPM;
  const midiHz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  function deg(d) {
    const K = KEYS[music.biome] || KEYS.meadow, sc = MODES[K.mode];
    const o = Math.floor(d / 7), i = ((d % 7) + 7) % 7;
    return K.root + sc[i] + 12 * o;
  }
  function mGain(target, t) { if (music.gain) music.gain.gain.setTargetAtTime(target, t || ctx.currentTime, 0.8); }
  function musicLevel() { return music.on && !prefs.muted ? music.vol * 0.55 : 0; }

  function startDrone() {
    const K = KEYS[music.biome] || KEYS.meadow;
    const t = ctx.currentTime;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; lp.Q.value = 0.6;
    const g = ctx.createGain(); g.gain.value = 0.0001; g.gain.setTargetAtTime(music.mood === 'wave' ? 0.08 : 0.06, t, 2);
    const lfo = ctx.createOscillator(), lfoG = ctx.createGain(); lfo.frequency.value = 0.07; lfoG.gain.value = 120; lfo.connect(lfoG); lfoG.connect(lp.frequency); lfo.start();
    const oscs = [K.root - 12, K.root - 5, K.root].map((m, i) => {
      const o = ctx.createOscillator(); o.type = i === 2 ? 'triangle' : 'sawtooth'; o.frequency.value = midiHz(m); o.detune.value = (i - 1) * 4;
      const og = ctx.createGain(); og.gain.value = i === 2 ? 0.35 : 0.5; o.connect(og); og.connect(lp); o.start(); return o;
    });
    lp.connect(g); g.connect(music.gain);
    music.drone = { g, oscs, lfo };
  }
  function stopDrone() {
    if (!music.drone) return;
    const d = music.drone, t = ctx.currentTime;
    d.g.gain.setTargetAtTime(0.0001, t, 0.6);
    setTimeout(() => { try { d.oscs.forEach((o) => o.stop()); d.lfo.stop(); } catch (e) { /* ignore */ } }, 3000);
    music.drone = null;
  }

  function pluck(m, t, vol, dur) {
    const f = midiHz(m);
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
    o.type = 'triangle'; o2.type = 'sawtooth'; o.frequency.value = f; o2.frequency.value = f * 1.002;
    lp.type = 'lowpass'; lp.frequency.setValueAtTime(f * 6, t); lp.frequency.exponentialRampToValueAtTime(f * 1.5, t + dur);
    const g2 = ctx.createGain(); g2.gain.value = 0.25;
    o.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g); g.connect(music.gain);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t); o2.start(t); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
  }
  function flute(m, t, dur, vol) {
    const f = midiHz(m);
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o2.type = 'triangle'; o.frequency.value = f; o2.frequency.value = f * 2;
    const vib = ctx.createOscillator(), vg = ctx.createGain(); vib.frequency.value = 5.2; vg.gain.value = f * 0.006;
    vib.connect(vg); vg.connect(o.frequency); vg.connect(o2.frequency);
    const g2 = ctx.createGain(); g2.gain.value = 0.12; o2.connect(g2); g2.connect(g); o.connect(g); g.connect(music.gain);
    const breath = ctx.createBufferSource(); breath.buffer = noiseBuf; const bf = ctx.createBiquadFilter(); bf.type = 'bandpass'; bf.frequency.value = f * 2; bf.Q.value = 3;
    const bg = ctx.createGain(); bg.gain.value = 0.0001; breath.connect(bf); bf.connect(bg); bg.connect(music.gain);
    bg.gain.setValueAtTime(0.0001, t); bg.gain.exponentialRampToValueAtTime(vol * 0.12, t + 0.04); bg.gain.exponentialRampToValueAtTime(0.0001, t + Math.min(dur, 0.3));
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.07); g.gain.setValueAtTime(vol, t + Math.max(0.08, dur - 0.12)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.15);
    [o, o2, vib].forEach((x) => { x.start(t); x.stop(t + dur + 0.25); });
    breath.start(t, Math.random() * 0.5); breath.stop(t + 0.35);
  }
  function drum(t, low, vol) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(low ? 110 : 190, t); o.frequency.exponentialRampToValueAtTime(low ? 48 : 90, t + 0.25);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    o.connect(g); g.connect(music.gain); o.start(t); o.stop(t + 0.4);
    const n = ctx.createBufferSource(); n.buffer = noiseBuf; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = low ? 300 : 1200; f.Q.value = 1;
    const ng = ctx.createGain(); ng.gain.setValueAtTime(0.0001, t); ng.gain.exponentialRampToValueAtTime(vol * (low ? 0.3 : 0.5), t + 0.003); ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    n.connect(f); f.connect(ng); ng.connect(music.gain); n.start(t, Math.random() * 0.5); n.stop(t + 0.15);
  }

  function scheduleBeat(t, b) {
    const bar = Math.floor(b / 4), inBar = b % 4;
    const chord = PROG[bar % PROG.length];
    const wave = music.mood === 'wave';
    // gusli: arpeggio — quarters in prep, eighths in battle
    const steps = wave ? 2 : 1;
    for (let k = 0; k < steps; k++) {
      const tt = t + k * (BEAT / steps);
      const idx = (inBar * steps + k) % 4;
      const d = [chord[0], chord[1], chord[2], chord[1]][idx] + (idx === 2 ? 7 : 0);
      if (!wave && inBar === 3 && Math.random() < 0.5) continue;
      pluck(deg(d), tt + (Math.random() * 0.012), wave ? 0.07 : 0.06, wave ? 1.0 : 1.6);
    }
    if (inBar === 0) pluck(deg(chord[0] - 7), t, 0.08, 2.4);
    // drum: only during battle — boom on 1 and 3, tak on the off-beats
    if (wave) {
      if (inBar === 0 || inBar === 2) drum(t, true, 0.22);
      drum(t + BEAT / 2, false, 0.07);
      if (inBar === 3) drum(t + BEAT * 0.75, false, 0.05);
    }
    // melody: phrases of 8 bars; fujarka plays in some phrases
    if (b % 32 === 0) music.playMelody = wave ? Math.random() < 0.75 : Math.random() < 0.55;
    if (music.playMelody && b % 8 === 0) {
      const motif = MOTIFS[Math.floor(Math.random() * MOTIFS.length)];
      let mt = t;
      for (const [d, beats] of motif) {
        const dur = beats * BEAT;
        if (d >= 0) flute(deg(d + 7), mt, dur * 0.95, wave ? 0.07 : 0.06);
        mt += dur;
      }
    }
  }

  function tick() {
    if (!music.running) return;
    const ahead = ctx.currentTime + 0.35;
    while (music.next < ahead) { scheduleBeat(music.next, music.beat); music.next += BEAT; music.beat++; }
    music.timer = setTimeout(tick, 90);
  }
  function startMusic() {
    if (!ctx || music.running || !music.on) return;
    if (!music.gain) { music.gain = ctx.createGain(); music.gain.gain.value = 0.0001; music.gain.connect(comp); }
    music.running = true;
    mGain(musicLevel());
    startDrone();
    music.next = ctx.currentTime + 0.2; music.beat = 0;
    tick();
  }
  function stopMusic() {
    music.running = false; clearTimeout(music.timer);
    if (ctx && music.gain) mGain(0.0001);
    if (ctx) stopDrone();
  }

  TD.music = {
    get on() { return music.on; },
    get volume() { return music.vol; },
    setOn(v) { music.on = !!v; prefs.musicOn = music.on; savePrefs(); if (music.on) { unlock(); startMusic(); } else stopMusic(); },
    setVolume(v) { music.vol = Math.max(0, Math.min(1, v)); prefs.musicVol = music.vol; savePrefs(); if (ctx) mGain(musicLevel()); },
    setMood(m) {
      if (music.mood === m) return;
      music.mood = m;
      if (music.drone && ctx) music.drone.g.gain.setTargetAtTime(m === 'wave' ? 0.08 : 0.06, ctx.currentTime, 1.5);
    },
    setBiome(b) {
      if (music.biome === b) return;
      music.biome = b;
      if (music.running) { stopDrone(); setTimeout(() => { if (music.running) startDrone(); }, 600); }
    },
    refresh() { if (ctx) mGain(musicLevel()); },
  };

  TD.audio = {
    unlock,
    get muted() { return prefs.muted; },
    get volume() { return prefs.volume; },
    setMuted(m) { prefs.muted = !!m; if (master) master.gain.value = prefs.muted ? 0 : prefs.volume * 0.5; savePrefs(); TD.music.refresh(); },
    setVolume(v) { prefs.volume = Math.max(0, Math.min(1, v)); if (master) master.gain.value = prefs.muted ? 0 : prefs.volume * 0.5; savePrefs(); },
  };
})();
