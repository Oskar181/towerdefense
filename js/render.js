/* render.js — canvas renderer with a pannable / zoomable camera. */
(function () {
  'use strict';
  const TD = (window.TD = window.TD || {});
  const T = TD.T;
  const RASTER = 2; // static layers are rasterised at 2x world size

  class Renderer {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.zoom = 1; // 1 = whole map fits
      this.cx = 0; this.cy = 0; // camera centre in world px
      this.staticLayer = null; this.overlayLayer = null;
      this.mapRef = null;
      this.grid = null;
    }

    async setMap(map) {
      this.mapRef = map;
      this.W = map.cols * T; this.H = map.rows * T;
      this.cx = this.W / 2; this.cy = this.H / 2;
      const [a, b] = await Promise.all([
        TD.svgToCanvas(TD.mapSvg(map), this.W, this.H, RASTER),
        TD.svgToCanvas(TD.overlaySvg(map), this.W, this.H, 1),
      ]);
      if (this.mapRef !== map) return;
      this.staticLayer = a; this.overlayLayer = b;
      const g = new Path2D();
      for (let x = 1; x < map.cols; x++) { g.moveTo(x * T, 0); g.lineTo(x * T, this.H); }
      for (let y = 1; y < map.rows; y++) { g.moveTo(0, y * T); g.lineTo(this.W, y * T); }
      this.grid = g;
    }

    resize() {
      const r = this.canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      this.dpr = dpr;
      this.vw = Math.max(1, r.width); this.vh = Math.max(1, r.height);
      const w = Math.round(this.vw * dpr), h = Math.round(this.vh * dpr);
      if (this.canvas.width !== w || this.canvas.height !== h) { this.canvas.width = w; this.canvas.height = h; }
      this.clampCamera();
    }

    get fit() { return this.W ? Math.min(this.vw / this.W, this.vh / this.H) : 1; }
    get scale() { return this.fit * this.zoom; }

    clampCamera() {
      if (!this.W) return;
      const s = this.scale;
      const halfW = this.vw / 2 / s, halfH = this.vh / 2 / s;
      this.cx = halfW * 2 >= this.W ? this.W / 2 : Math.min(Math.max(this.cx, halfW), this.W - halfW);
      this.cy = halfH * 2 >= this.H ? this.H / 2 : Math.min(Math.max(this.cy, halfH), this.H - halfH);
    }

    setZoom(z, sx, sy) {
      z = Math.min(Math.max(z, 1), 3.2);
      if (sx != null) {
        const before = this.toWorld(sx, sy);
        this.zoom = z;
        const after = this.toWorld(sx, sy);
        this.cx += before.x - after.x; this.cy += before.y - after.y;
      } else this.zoom = z;
      this.clampCamera();
    }

    pan(dxScreen, dyScreen) {
      this.cx -= dxScreen / this.scale; this.cy -= dyScreen / this.scale;
      this.clampCamera();
    }

    toWorld(sx, sy) {
      const s = this.scale;
      return { x: (sx - this.vw / 2) / s + this.cx, y: (sy - this.vh / 2) / s + this.cy };
    }

    // ------------------------------------------------------------ frame
    draw(s, ui, time) {
      const ctx = this.ctx;
      this.time = time;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#0e131a';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      if (!this.staticLayer) return;
      const sc = this.scale * this.dpr;
      ctx.setTransform(sc, 0, 0, sc, (this.vw / 2 - this.cx * this.scale) * this.dpr, (this.vh / 2 - this.cy * this.scale) * this.dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(this.staticLayer, 0, 0, this.W, this.H);

      // grid
      ctx.strokeStyle = s.phase === 'prep' ? 'rgba(18,48,18,0.11)' : 'rgba(18,48,18,0.05)';
      ctx.lineWidth = 1;
      ctx.stroke(this.grid);

      this.drawRoute(s, time);
      this.drawGroundFx(s, time);
      this.drawBaseGround(s, ui, time);
      this.drawFlight(s, time);

      // selection range / hover
      if (ui.selected && ui.selected !== 'base') this.drawRange(ui.selected.x, ui.selected.y, TD.towerStats(ui.selected), ui.selected.type === 'M' ? '#9dff7a' : '#ffd36b');
      if (ui.hover && s.phase === 'prep') this.drawHover(s, ui, time);
      if (ui.power && ui.powerPos && TD.POWERS[ui.power].target) {
        const P = TD.POWERS[ui.power], pp = ui.powerPos, rr = P.radius * T;
        const col = ui.power === 'perun' ? '255,236,140' : '255,140,60';
        ctx.fillStyle = `rgba(${col},0.18)`; ctx.strokeStyle = `rgba(${col},0.95)`; ctx.lineWidth = 2.5; ctx.setLineDash([8, 6]); ctx.lineDashOffset = -time * 20;
        ctx.beginPath(); ctx.arc(pp.x, pp.y, rr, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
      }

      // towers (painter's order)
      const towers = [...s.towers.values()].sort((a, b) => a.y - b.y || a.x - b.x);
      const ghost = ui.hover && ui.hover.ok && ui.buildType ? ui.hover : null;
      for (const t of towers) {
        if (ghost && ghost.y < t.y && !ghost.drawn) { this.drawGhost(s, ghost, ui.buildType); ghost.drawn = true; }
        this.drawTower(s, t, ui.selected === t);
      }
      if (ghost && !ghost.drawn) this.drawGhost(s, ghost, ui.buildType);
      if (ghost) ghost.drawn = false;

      // gród level decorations
      if ((s.baseLvl || 0) >= 2) { const bc = TD.baseCenter(s); this.sprite('baseLvl' + s.baseLvl, bc.x, bc.y); }
      if (ui.selected === 'base') {
        const bc = TD.baseCenter(s);
        ctx.strokeStyle = '#ffd36b'; ctx.lineWidth = 3; ctx.setLineDash([8, 6]); ctx.lineDashOffset = -time * 20;
        ctx.beginPath(); ctx.ellipse(bc.x, bc.y + 10, 56, 44, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(bc.x, bc.y, 4 * T, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(255,211,107,0.6)'; ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]);
      }

      // enemies
      const foes = s.enemies.slice().sort((a, b) => a.y - b.y);
      for (const e of foes) this.drawEnemy(e, time);

      this.drawProjectiles(s);
      this.drawEffects(s);

      ctx.drawImage(this.overlayLayer, 0, 0, this.W, this.H);
      if (ui.hover && ui.hover.label) this.drawLabel(ui.hover.lx, ui.hover.ly, ui.hover.label, ui.hover.ok ? '#d9ffe3' : '#ffd1cc', ui.hover.ok ? '#4caf6e' : '#d9534f');
      if (s.phase === 'prep' && s.wave === 0 && !s.towers.size) {
        const m = s.map;
        this.drawLabel(m.nest.c * T + 56, (m.nest.r + 2) * T + 30, 'Wrota Nawii', '#f0d6ff', '#7a4fa8');
        this.drawLabel(m.base.c * T + 40, (m.base.r + 2) * T + 32, 'Twój gród', '#ffe2b8', '#b8322a');
      }
    }

    buildRoad(path, biome) {
      const key = biome + '|' + path.map((c) => c[0] + ',' + c[1]).join(';');
      if (key === this.roadKey) return;
      this.roadKey = key;
      const SC = 1.5;
      const c = this.roadCanvas || document.createElement('canvas');
      c.width = this.W * SC; c.height = this.H * SC;
      const g = c.getContext('2d');
      g.setTransform(SC, 0, 0, SC, 0, 0);
      g.clearRect(0, 0, this.W, this.H);
      const pts = path.map(([x, y]) => [(x + 0.5) * T, (y + 0.5) * T]);
      pts.unshift([pts[0][0] - T * 0.7, pts[0][1]]);
      const line = () => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); };
      const snow = biome === 'winter', sand = biome === 'desert';
      g.lineJoin = 'round'; g.lineCap = 'round';
      line(); g.strokeStyle = snow ? 'rgba(120,130,140,0.35)' : 'rgba(70,50,25,0.45)'; g.lineWidth = 32; g.stroke();
      line(); g.strokeStyle = snow ? 'rgba(200,205,210,0.9)' : sand ? 'rgba(196,160,104,0.95)' : 'rgba(140,112,70,0.95)'; g.lineWidth = 27; g.stroke();
      let seed = 7;
      const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
      const cols = snow ? ['#d8dde2', '#c4cad0', '#e8ecef'] : sand ? ['#d8c090', '#c9ae7a', '#e6d2a6'] : ['#b8b2a2', '#a8a292', '#c9c3b2', '#9a9484'];
      for (let i = 0; i < pts.length - 1; i++) {
        const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
        const len = Math.hypot(bx - ax, by - ay), nx = -(by - ay) / len, ny = (bx - ax) / len;
        for (let d = 0; d < len; d += 6.5) {
          const fx = ax + ((bx - ax) * d) / len, fy = ay + ((by - ay) * d) / len;
          for (const off of [-8, 0, 8]) {
            const o = off + (rnd() - 0.5) * 4;
            const x = fx + nx * o + (rnd() - 0.5) * 2, y = fy + ny * o + (rnd() - 0.5) * 2;
            g.fillStyle = cols[Math.floor(rnd() * cols.length)];
            g.strokeStyle = snow ? '#8a949e' : '#5a5446'; g.lineWidth = 1;
            g.beginPath(); g.ellipse(x, y, 2.6 + rnd() * 1.4, 2 + rnd() * 1.1, rnd() * 3, 0, Math.PI * 2); g.fill(); g.stroke();
          }
        }
      }
      this.roadCanvas = c;
    }

    drawRoute(s, time) {
      const ctx = this.ctx, p = s.path;
      if (!p) return;
      this.buildRoad(p, s.map.biome);
      ctx.drawImage(this.roadCanvas, 0, 0, this.W, this.H);
      const pts = p.map(([x, y]) => [(x + 0.5) * T, (y + 0.5) * T]);
      // start inside the nest
      pts.unshift([pts[0][0] - T * 0.6, pts[0][1]]);
      const line = () => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); };
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      if (s.phase !== 'prep') return;
      line(); ctx.strokeStyle = 'rgba(29,42,18,0.25)'; ctx.lineWidth = 8; ctx.stroke();
      line(); ctx.strokeStyle = '#fff6dc'; ctx.lineWidth = 4; ctx.setLineDash([1, 11]); ctx.lineDashOffset = -time * 14; ctx.stroke(); ctx.setLineDash([]);
      for (let i = 3; i < pts.length - 2; i += 4) {
        const a = pts[i], b = pts[i + 1];
        const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
        ctx.save(); ctx.translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2); ctx.rotate(ang);
        ctx.beginPath(); ctx.moveTo(-5, -6.5); ctx.lineTo(4, 0); ctx.lineTo(-5, 6.5);
        ctx.strokeStyle = 'rgba(29,42,18,0.35)'; ctx.lineWidth = 6.5; ctx.stroke();
        ctx.strokeStyle = '#fff6dc'; ctx.lineWidth = 3.5; ctx.stroke();
        ctx.restore();
      }
    }

    drawBaseGround(s, ui, time) {
      const ctx = this.ctx, lvl = s.baseLvl || 0;
      // Chram Mokoszy: soft green circle on the ground + leaves on buffed towers
      TD.computeBuffs(s);
      for (const m of s.towers.values()) {
        if (m.type !== 'M') continue;
        const st = TD.towerStats(m), cx = (m.x + 0.5) * T, cy = (m.y + 0.5) * T, rr = st.range * T;
        ctx.fillStyle = 'rgba(157,255,122,0.07)'; ctx.strokeStyle = 'rgba(157,255,122,0.35)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 6]);
        ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
      }
      if (lvl >= 1 && s.path) {
        const p = TD.pathPos(s, s.path.length - 1 - 1.3);
        this.sprite('zasieki', p.x, p.y + 4);
      }
      if (lvl >= 3 && s.phase === 'wave') {
        const bc = TD.baseCenter(s), rr = 2 * T;
        const g = ctx.createRadialGradient(bc.x, bc.y, rr * 0.6, bc.x, bc.y, rr);
        g.addColorStop(0, 'rgba(255,120,40,0)'); g.addColorStop(1, `rgba(255,120,40,${0.12 + 0.05 * Math.sin(time * 4)})`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(bc.x, bc.y, rr, 0, Math.PI * 2); ctx.fill();
      }
    }

    drawGroundFx(s, time) {
      const ctx = this.ctx;
      for (const fx of s.effects) {
        if (fx.type !== 'scorch') continue;
        const k = fx.t / fx.life;
        const g = ctx.createRadialGradient(fx.x, fx.y, 0, fx.x, fx.y, fx.r * 0.8);
        g.addColorStop(0, `rgba(30,20,10,${0.45 * (1 - k)})`); g.addColorStop(1, 'rgba(30,20,10,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(fx.x, fx.y, fx.r * 0.8, fx.r * 0.6, 0, 0, Math.PI * 2); ctx.fill();
      }
      for (const f of s.fields || []) {
        const fade = Math.min(1, (f.life - f.t) / 0.8, f.t / 0.3);
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
        g.addColorStop(0, `rgba(255,170,60,${0.45 * fade})`); g.addColorStop(0.7, `rgba(255,90,30,${0.3 * fade})`); g.addColorStop(1, 'rgba(255,60,20,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(f.x, f.y, f.r, f.r * 0.75, 0, 0, Math.PI * 2); ctx.fill();
        for (let i = 0; i < 14; i++) {
          const a = i * 2.39996, d = (0.25 + ((i * 37) % 10) / 13) * f.r * 0.85;
          const fx = f.x + Math.cos(a) * d, fy = f.y + Math.sin(a) * d * 0.7;
          const h = (9 + 6 * Math.sin(time * 9 + i * 1.7)) * fade;
          ctx.fillStyle = `rgba(255,${120 + (i % 3) * 40},40,${0.85 * fade})`;
          ctx.beginPath(); ctx.moveTo(fx - 4, fy); ctx.quadraticCurveTo(fx - 3, fy - h * 0.6, fx, fy - h); ctx.quadraticCurveTo(fx + 3, fy - h * 0.6, fx + 4, fy); ctx.closePath(); ctx.fill();
          ctx.fillStyle = `rgba(255,236,160,${0.8 * fade})`;
          ctx.beginPath(); ctx.moveTo(fx - 2, fy); ctx.quadraticCurveTo(fx, fy - h * 0.5, fx + 2, fy); ctx.closePath(); ctx.fill();
        }
      }
    }

    drawFlight(s, time) {
      const f = s.fly;
      if (!f) return;
      const show = s.phase === 'prep' ? TD.waveHasFlyers(s.wave + 1) : s.phase === 'wave' && s.enemies.some((e) => TD.ENEMIES[e.kind].flying);
      if (!show) return;
      const ctx = this.ctx;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(f.x0, f.y0); ctx.lineTo(f.x1, f.y1);
      ctx.strokeStyle = 'rgba(200,170,255,0.18)'; ctx.lineWidth = 22; ctx.stroke();
      ctx.strokeStyle = 'rgba(232,214,255,0.9)'; ctx.lineWidth = 3; ctx.setLineDash([10, 9]); ctx.lineDashOffset = -time * 18; ctx.stroke();
      ctx.setLineDash([]);
      if (s.phase === 'prep') {
        const mx = f.x0 + (f.x1 - f.x0) * 0.2, my = f.y0 + (f.y1 - f.y0) * 0.2;
        ctx.restore();
        this.drawLabel(mx + 40, my - 30, 'Latające bestie lecą prosto na gród', '#eadbff', '#8a6bc9');
        return;
      }
      ctx.restore();
    }

    drawRange(x, y, st, col) {
      if (!st) return;
      const ctx = this.ctx, cx = (x + 0.5) * T, cy = (y + 0.5) * T, r = st.range * T;
      const g = ctx.createRadialGradient(cx, cy, r * 0.7, cx, cy, r);
      g.addColorStop(0, hexA(col, 0.04)); g.addColorStop(1, hexA(col, 0.2));
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
      ctx.setLineDash([8, 6]); ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.stroke(); ctx.setLineDash([]);
    }

    drawHover(s, ui, time) {
      const ctx = this.ctx, h = ui.hover;
      if (!ui.buildType) {
        if (h.inside) {
          ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2;
          roundRect(ctx, h.x * T + 3, h.y * T + 3, T - 6, T - 6, 8); ctx.stroke();
        }
        return;
      }
      if (!h.inside) return;
      // preview of the new route
      if (h.ok && h.path) {
        ctx.beginPath();
        h.path.forEach(([x, y], i) => (i ? ctx.lineTo((x + 0.5) * T, (y + 0.5) * T) : ctx.moveTo((x + 0.5) * T, (y + 0.5) * T)));
        ctx.strokeStyle = 'rgba(160,255,180,0.75)'; ctx.lineWidth = 3; ctx.setLineDash([6, 8]); ctx.lineDashOffset = -time * 20; ctx.stroke(); ctx.setLineDash([]);
      }
      if (h.ok) {
        const st = TD.towerStats(ui.buildType, 1);
        if (st) this.drawRange(h.x, h.y, st, '#7dff9a');
      }
      ctx.fillStyle = h.ok ? 'rgba(125,255,154,0.32)' : 'rgba(229,96,90,0.38)';
      ctx.strokeStyle = h.ok ? '#e1ffe8' : '#ffb3ae';
      ctx.lineWidth = 2.5;
      roundRect(ctx, h.x * T + 2, h.y * T + 2, T - 4, T - 4, 8); ctx.fill(); ctx.stroke();
      if (!h.ok) {
        ctx.strokeStyle = '#ffd1cc'; ctx.lineWidth = 3; ctx.beginPath();
        ctx.moveTo(h.x * T + 16, h.y * T + 16); ctx.lineTo(h.x * T + 32, h.y * T + 32);
        ctx.moveTo(h.x * T + 32, h.y * T + 16); ctx.lineTo(h.x * T + 16, h.y * T + 32); ctx.stroke();
      }
    }

    sprite(name, x, y, alpha) {
      const sp = TD.sprites[name];
      if (!sp) return;
      if (alpha != null) this.ctx.globalAlpha = alpha;
      this.ctx.drawImage(sp.canvas, x + sp.ox, y + sp.oy, sp.w, sp.h);
      if (alpha != null) this.ctx.globalAlpha = 1;
    }

    drawGhost(s, h, type) {
      const X = h.x * T, Y = h.y * T;
      if (type === 'W') { this.sprite('wall' + wallMask(s, h.x, h.y, true), X, Y, 0.75); return; }
      this.sprite('ped' + type + '1', X, Y, 0.75);
      this.turret(type, X, Y, 0, 0.75);
    }

    turret(type, X, Y, angle, alpha, lvl) {
      const sp = TD.sprites['tur' + type];
      if (!sp) return;
      const ctx = this.ctx;
      ctx.save();
      ctx.translate(X + 24, Y - 2);
      const k = [1, 1.04, 1.08, 1.12][(lvl || 1) - 1];
      const flip = (type === 'A' || type === 'C' || type === 'B') && Math.cos(angle) < -0.05 ? -1 : 1;
      ctx.scale(k * flip, k);
      if (alpha != null) ctx.globalAlpha = alpha;
      ctx.drawImage(sp.canvas, sp.ox, sp.oy, sp.w, sp.h);
      ctx.restore();
    }

    drawTower(s, t, selected) {
      const X = t.x * T, Y = t.y * T, ctx = this.ctx;
      if (t.type === 'W') this.sprite('wall' + wallMask(s, t.x, t.y), X, Y);
      else {
        this.sprite('ped' + t.type + t.lvl, X, Y);
        this.turret(t.type, X, Y, t.angle, null, t.lvl);
        if (t.lvl >= 3) this.sprite('pedf' + t.type + t.lvl, X, Y);
        if (t.buff > 0) {
          const tm = this.time || 0;
          for (let i = 0; i < 2; i++) {
            const a = tm * 1.1 + i * Math.PI + t.y;
            ctx.fillStyle = 'rgba(140,230,100,0.85)';
            ctx.beginPath(); ctx.ellipse(X + 24 + Math.cos(a) * 15, Y + 18 + Math.sin(a) * 6, 2.6, 1.4, a, 0, Math.PI * 2); ctx.fill();
          }
        }
        if (t.lvl >= 4) {
          const tm = this.time || 0;
          for (let i = 0; i < 3; i++) {
            const a = tm * 1.4 + i * 2.09 + t.x;
            const sx = X + 24 + Math.cos(a) * 18, sy = Y - 6 + Math.sin(a) * 8 - Math.abs(Math.sin(tm * 2 + i)) * 8;
            ctx.fillStyle = `rgba(255,230,140,${0.5 + 0.4 * Math.sin(tm * 5 + i)})`;
            ctx.beginPath(); ctx.arc(sx, sy, 1.6, 0, Math.PI * 2); ctx.fill();
          }
        }
      }
      if (selected) {
        ctx.strokeStyle = '#ffd36b'; ctx.lineWidth = 3;
        roundRect(ctx, X + 1, Y, T - 2, T, 10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(X + 24, Y - 14); ctx.lineTo(X + 18, Y - 22); ctx.lineTo(X + 30, Y - 22); ctx.closePath();
        ctx.fillStyle = '#ffd36b'; ctx.fill(); ctx.strokeStyle = '#7a5510'; ctx.lineWidth = 1.5; ctx.stroke();
      }
    }

    drawEnemy(e, time) {
      const ctx = this.ctx, def = TD.ENEMIES[e.kind];
      if (!TD.sprites['foe_' + e.kind + '_r']) return;
      if (e.dir === 'l') e.face = -1; else if (e.dir === 'r') e.face = 1;
      const face = e.face || 1;
      const top = (TD.SPRITE_TOP && TD.SPRITE_TOP[e.kind]) || -def.r - 4;
      const ghost = e.kind === 'ghost';
      const flying = def.flying;
      const bob = flying ? Math.sin(time * (e.kind === 'bat' ? 14 : 3) + e.id * 20) * 3 - 2 : Math.sin(time * (e.kind === 'swarm' ? 22 : 10) + e.id * 20) * (e.kind === 'swarm' ? 2 : def.boss ? 0.8 : 1.2);
      if (flying) { ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.ellipse(e.x + 4, e.y + 22, def.r * 0.8, def.r * 0.28, 0, 0, Math.PI * 2); ctx.fill(); }
      if (def.boss) {
        const g = ctx.createRadialGradient(e.x, e.y, def.r * 0.5, e.x, e.y, def.r * 2.2);
        g.addColorStop(0, 'rgba(255,90,70,0.0)'); g.addColorStop(0.6, `rgba(255,90,70,${0.12 + 0.06 * Math.sin(time * 4)})`); g.addColorStop(1, 'rgba(255,90,70,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(e.x, e.y, def.r * 2.2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.save(); ctx.translate(e.x, e.y + bob - 4);
      const flap = flying && !def.boss ? 0.8 + 0.2 * Math.abs(Math.sin(time * (e.kind === 'bat' ? 16 : 6) + e.id * 9)) : 1;
      const walk = !flying ? 1 + 0.04 * Math.sin(time * 12 + e.id * 20) : 1;
      ctx.scale(face, flap / walk); if (walk !== 1) ctx.scale(walk, 1);
      if (ghost) ctx.globalAlpha = 0.95;
      this.sprite('foe_' + e.kind + '_r', 0, 0);
      ctx.restore();
      if (e.frozenT > 0) {
        ctx.fillStyle = 'rgba(200,236,255,0.55)'; ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 1.5;
        const rr = def.r + 4, ey0 = e.y + top * 0.4;
        ctx.save(); ctx.translate(0, ey0 - e.y);
        ctx.beginPath(); ctx.moveTo(e.x - rr, e.y + rr * 0.6); ctx.lineTo(e.x - rr * 0.8, e.y - rr * 0.9); ctx.lineTo(e.x + rr * 0.2, e.y - rr * 1.1); ctx.lineTo(e.x + rr, e.y - rr * 0.5); ctx.lineTo(e.x + rr * 0.9, e.y + rr * 0.7); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.moveTo(e.x - rr * 0.5, e.y - rr * 0.6); ctx.lineTo(e.x - rr * 0.1, e.y - rr * 0.1); ctx.stroke();
        ctx.restore();
      }
      if (e.burnT > 0) {
        ctx.fillStyle = 'rgba(255,140,40,0.75)';
        for (let i = 0; i < 3; i++) { const fx = e.x + (i - 1) * 6, h = 8 + 4 * Math.sin(time * 14 + i * 2); ctx.beginPath(); ctx.moveTo(fx - 3, e.y - 2); ctx.quadraticCurveTo(fx, e.y - 2 - h * 1.4, fx + 3, e.y - 2); ctx.fill(); }
      }
      if (e.crumbled) { ctx.fillStyle = 'rgba(255,140,60,0.18)'; ctx.beginPath(); ctx.arc(e.x, e.y + bob, def.r + 2, 0, Math.PI * 2); ctx.fill(); }
      if (e.shield > 0) {
        const a = 0.25 + 0.55 * (e.shield / e.maxShield);
        ctx.strokeStyle = `rgba(143,200,255,${a})`; ctx.fillStyle = `rgba(143,200,255,${a * 0.25})`; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.ellipse(e.x, e.y + bob + top * 0.42, def.r + 7, -top * 0.5 + 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
      if (TD.ENEMIES[e.kind].heal) {
        const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, 30);
        g.addColorStop(0, 'rgba(157,255,154,0.22)'); g.addColorStop(1, 'rgba(157,255,154,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(e.x, e.y, 30, 0, Math.PI * 2); ctx.fill();
      }
      const r = def.r;
      if (e.hitT > 0) {
        ctx.globalAlpha = 0.35; ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.ellipse(e.x, e.y + bob + top * 0.45, r * 0.9, -top * 0.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      }
      if (e.slowT > 0) {
        ctx.fillStyle = 'rgba(191,234,255,0.25)'; ctx.strokeStyle = '#bfeaff'; ctx.lineWidth = 2; ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.ellipse(e.x, e.y + bob, r + 4, r + 3, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
      }
      if (e.hp < e.maxHp || def.boss || e.shield < e.maxShield) {
        const w = def.boss ? 56 : 28, by = e.y + top - 10 + bob, f = Math.max(0, e.hp / e.maxHp);
        const hgt = def.boss ? 7 : 5;
        ctx.fillStyle = 'rgba(26,15,15,0.85)'; roundRect(ctx, e.x - w / 2 - 1, by - 1, w + 2, hgt + 2, 3); ctx.fill();
        ctx.fillStyle = def.boss ? '#ff6a55' : f > 0.6 ? '#6fdc7a' : f > 0.3 ? '#f2c14e' : '#ff7a6b';
        roundRect(ctx, e.x - w / 2, by, w * f, hgt, 2.5); ctx.fill();
        if (e.maxShield) {
          ctx.fillStyle = '#8fc8ff';
          roundRect(ctx, e.x - w / 2, by - 4, w * (e.shield / e.maxShield), 3, 1.5); ctx.fill();
        }
      }
    }

    drawProjectiles(s) {
      const ctx = this.ctx;
      for (const p of s.projectiles) {
        if (p.type === 'bolt') {
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle || 0);
          ctx.strokeStyle = 'rgba(255,220,200,0.4)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(-12, 0); ctx.stroke();
          ctx.strokeStyle = '#3b2410'; ctx.lineWidth = 3.4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(8, 0); ctx.stroke();
          ctx.fillStyle = '#e8ebf0'; ctx.strokeStyle = '#4a4f59'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(6, -4.5); ctx.lineTo(6, 4.5); ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.strokeStyle = '#c4483f'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(-20, -4); ctx.moveTo(-16, 0); ctx.lineTo(-20, 4); ctx.stroke();
          ctx.restore();
        } else if (p.type === 'arrow') {
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle || 0);
          ctx.strokeStyle = 'rgba(255,243,176,0.45)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(-8, 0); ctx.stroke();
          ctx.strokeStyle = '#5b3d22'; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(6, 0); ctx.stroke();
          ctx.fillStyle = '#e8ebf0'; ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(4, -3.5); ctx.lineTo(4, 3.5); ctx.fill();
          ctx.strokeStyle = '#f4f1ea'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(-15, -3); ctx.moveTo(-12, 0); ctx.lineTo(-15, 3); ctx.stroke();
          ctx.restore();
        } else if (p.type === 'ball') {
          const f = Math.min(1, p.t / p.dur);
          const gx = p.sx + (p.tx - p.sx) * f, gy = p.sy + (p.ty - p.sy) * f;
          const hgt = Math.sin(f * Math.PI) * 46;
          ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(gx, gy + 8, 6, 2.5, 0, 0, Math.PI * 2); ctx.fill();
          for (let k = 1; k <= 3; k++) {
            const ff = Math.max(0, f - k * 0.08);
            const sx = p.sx + (p.tx - p.sx) * ff, sy = p.sy + (p.ty - p.sy) * ff - Math.sin(ff * Math.PI) * 46;
            ctx.fillStyle = `rgba(190,170,130,${0.45 - k * 0.12})`; ctx.beginPath(); ctx.arc(sx, sy, 3 + k * 1.3, 0, Math.PI * 2); ctx.fill();
          }
          ctx.fillStyle = '#8a877e'; ctx.strokeStyle = '#3b3a36'; ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.arc(gx, gy - hgt, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#b5b2a8'; ctx.beginPath(); ctx.arc(gx - 2.5, gy - hgt - 2.5, 2.4, 0, Math.PI * 2); ctx.fill();
        }
      }
    }

    drawEffects(s) {
      const ctx = this.ctx;
      for (const fx of s.effects) {
        const k = fx.t / fx.life;
        if (fx.type === 'scorch') continue;
        if (fx.type === 'firering') {
          const rr = fx.r * (0.35 + 0.65 * k);
          ctx.strokeStyle = `rgba(255,140,40,${0.8 * (1 - k)})`; ctx.lineWidth = 6 * (1 - k) + 1;
          ctx.beginPath(); ctx.ellipse(fx.x, fx.y, rr, rr * 0.8, 0, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = `rgba(255,200,80,${0.7 * (1 - k)})`;
          for (let i = 0; i < 10; i++) { const a = i * 0.628 + fx.x; const px = fx.x + Math.cos(a) * rr, py = fx.y + Math.sin(a) * rr * 0.8; ctx.beginPath(); ctx.moveTo(px - 3, py); ctx.quadraticCurveTo(px, py - 12 * (1 - k), px + 3, py); ctx.fill(); }
          continue;
        }
        if (fx.type === 'miss') {
          ctx.globalAlpha = 1 - k; ctx.font = '700 12px Inter, sans-serif'; ctx.textAlign = 'center';
          ctx.lineWidth = 3; ctx.strokeStyle = '#1e140c'; ctx.strokeText('unik!', fx.x, fx.y - k * 14); ctx.fillStyle = '#f4f0e2'; ctx.fillText('unik!', fx.x, fx.y - k * 14);
          ctx.textAlign = 'start'; ctx.globalAlpha = 1; continue;
        }
        if (fx.type === 'blink') {
          ctx.strokeStyle = `rgba(200,160,255,${1 - k})`; ctx.lineWidth = 2.5;
          for (let i = 0; i < 6; i++) { const a = i * 1.047; ctx.beginPath(); ctx.moveTo(fx.x + Math.cos(a) * (6 + k * 16), fx.y - 10 + Math.sin(a) * (6 + k * 16)); ctx.lineTo(fx.x + Math.cos(a) * (10 + k * 20), fx.y - 10 + Math.sin(a) * (10 + k * 20)); ctx.stroke(); }
          continue;
        }
        if (fx.type === 'stop') {
          ctx.strokeStyle = `rgba(255,230,160,${1 - k})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(fx.x, fx.y - 6, 10 + k * 14, 0, Math.PI * 2); ctx.stroke();
          continue;
        }
        if (fx.type === 'perun') {
          if (k < 0.35) {
            let seed = Math.floor(fx.t * 30) + 7;
            const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280 - 0.5; };
            const pts = [[fx.x + 60, fx.y - 520]];
            for (let i = 1; i <= 12; i++) { const f = i / 12; pts.push([fx.x + 60 * (1 - f) + rnd() * 40 * (1 - f * 0.7), fx.y - 520 * (1 - f)]); }
            pts[pts.length - 1] = [fx.x, fx.y];
            const line = () => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); };
            ctx.lineJoin = 'round'; ctx.lineCap = 'round';
            line(); ctx.strokeStyle = 'rgba(180,200,255,0.45)'; ctx.lineWidth = 22; ctx.stroke();
            line(); ctx.strokeStyle = 'rgba(255,250,210,0.95)'; ctx.lineWidth = 6; ctx.stroke();
            line(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5; ctx.stroke();
          }
          const r = fx.r * (0.4 + k * 0.9);
          const g = ctx.createRadialGradient(fx.x, fx.y, 0, fx.x, fx.y, r);
          g.addColorStop(0, `rgba(255,255,230,${0.9 * (1 - k)})`); g.addColorStop(0.5, `rgba(255,220,120,${0.5 * (1 - k)})`); g.addColorStop(1, 'rgba(120,160,255,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(fx.x, fx.y, r, 0, Math.PI * 2); ctx.fill();
          if (k < 0.15) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(255,255,240,${0.35 * (1 - k / 0.15)})`; ctx.fillRect(0, 0, this.canvas.width, this.canvas.height); ctx.restore(); }
          continue;
        }
        if (fx.type === 'winter') {
          const a = k < 0.1 ? k / 0.1 : k > 0.75 ? (1 - k) / 0.25 : 1;
          ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
          const W = this.canvas.width, H = this.canvas.height;
          const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.7);
          g.addColorStop(0, 'rgba(200,236,255,0)'); g.addColorStop(1, `rgba(200,236,255,${0.55 * a})`);
          ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
          ctx.fillStyle = `rgba(255,255,255,${0.8 * a})`;
          for (let i = 0; i < 60; i++) {
            const x = ((i * 137.5 + fx.t * 30 * (1 + (i % 3))) % W), y = ((i * 89.3 + fx.t * 60 * (1 + (i % 2))) % H);
            ctx.beginPath(); ctx.arc(x, y, (1 + (i % 3)) * this.dpr, 0, Math.PI * 2); ctx.fill();
          }
          ctx.restore();
          continue;
        }
        if (fx.type === 'shieldbreak') {
          ctx.strokeStyle = `rgba(143,200,255,${1 - k})`; ctx.lineWidth = 2.5;
          for (let i = 0; i < 8; i++) {
            const a = i * Math.PI / 4, r1 = 14 + k * 20;
            ctx.beginPath(); ctx.moveTo(fx.x + Math.cos(a) * r1, fx.y + Math.sin(a) * r1); ctx.lineTo(fx.x + Math.cos(a) * (r1 + 6), fx.y + Math.sin(a) * (r1 + 6)); ctx.stroke();
          }
        } else if (fx.type === 'crumble') {
          ctx.fillStyle = `rgba(120,114,106,${1 - k})`;
          for (let i = 0; i < 10; i++) {
            const a = i * 0.63, d = 10 + k * 40;
            ctx.beginPath(); ctx.arc(fx.x + Math.cos(a) * d, fx.y + Math.sin(a) * d * 0.7 + k * k * 20, 4 * (1 - k) + 1.5, 0, Math.PI * 2); ctx.fill();
          }
        } else if (fx.type === 'summon') {
          ctx.strokeStyle = `rgba(200,150,255,${1 - k})`; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.arc(fx.x, fx.y, 8 + k * 34, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.arc(fx.x, fx.y, 4 + k * 18, 0, Math.PI * 2); ctx.stroke();
        } else if (fx.type === 'zap') {
          const pts = fx.pts;
          let seed = fx.seed + Math.floor(fx.t * 40);
          const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280 - 0.5; };
          const path = [];
          for (let i = 0; i < pts.length - 1; i++) {
            const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
            const n = 6;
            for (let j = 0; j < n; j++) {
              const f = j / n;
              path.push([ax + (bx - ax) * f + (j ? rnd() * 14 : 0), ay + (by - ay) * f + (j ? rnd() * 14 : 0)]);
            }
          }
          path.push(pts[pts.length - 1]);
          const line = () => { ctx.beginPath(); path.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); };
          ctx.lineJoin = 'round'; ctx.lineCap = 'round';
          line(); ctx.strokeStyle = `rgba(255,236,120,${0.35 * (1 - k)})`; ctx.lineWidth = 10; ctx.stroke();
          line(); ctx.strokeStyle = `rgba(255,255,235,${1 - k})`; ctx.lineWidth = 2.6; ctx.stroke();
          for (let i = 1; i < pts.length; i++) {
            ctx.fillStyle = `rgba(255,243,160,${0.6 * (1 - k)})`; ctx.beginPath(); ctx.arc(pts[i][0], pts[i][1], 9 * (1 - k) + 3, 0, Math.PI * 2); ctx.fill();
          }
        } else if (fx.type === 'splat') {
          ctx.fillStyle = `rgba(110,200,190,${0.7 * (1 - k)})`;
          for (let i = 0; i < 7; i++) {
            const a = i * 0.9, d = 6 + k * 22;
            ctx.beginPath(); ctx.arc(fx.x + Math.cos(a) * d, fx.y + Math.sin(a) * d * 0.7, 4 * (1 - k) + 1.5, 0, Math.PI * 2); ctx.fill();
          }
        } else if (fx.type === 'healring') {
          ctx.strokeStyle = `rgba(157,255,154,${0.55 * (1 - k)})`; ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.arc(fx.x, fx.y, fx.r * (0.3 + 0.7 * k), 0, Math.PI * 2); ctx.stroke();
        } else if (fx.type === 'plus') {
          const y = fx.y - k * 18;
          ctx.globalAlpha = 1 - k;
          ctx.strokeStyle = '#1f5a2c'; ctx.lineWidth = 5; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(fx.x - 5, y); ctx.lineTo(fx.x + 5, y); ctx.moveTo(fx.x, y - 5); ctx.lineTo(fx.x, y + 5); ctx.stroke();
          ctx.strokeStyle = '#9dff9a'; ctx.lineWidth = 2.6; ctx.stroke();
          ctx.globalAlpha = 1;
        } else if (fx.type === 'boom') {
          const r = fx.r * (0.5 + k * 0.6);
          const g = ctx.createRadialGradient(fx.x, fx.y, 0, fx.x, fx.y, r);
          g.addColorStop(0, `rgba(255,247,194,${1 - k})`); g.addColorStop(0.4, `rgba(255,179,71,${0.85 * (1 - k)})`); g.addColorStop(1, 'rgba(255,106,43,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(fx.x, fx.y, r, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = `rgba(255,231,163,${1 - k})`; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
          for (let i = 0; i < 6; i++) {
            const a = (i * Math.PI) / 3 + 0.3, r1 = 10 + k * 18;
            ctx.beginPath(); ctx.moveTo(fx.x + Math.cos(a) * r1, fx.y + Math.sin(a) * r1); ctx.lineTo(fx.x + Math.cos(a) * (r1 + 7), fx.y + Math.sin(a) * (r1 + 7)); ctx.stroke();
          }
        } else if (fx.type === 'beam') {
          ctx.lineCap = 'round';
          ctx.strokeStyle = `rgba(143,216,255,${0.3 * (1 - k)})`; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(fx.x, fx.y); ctx.lineTo(fx.x2, fx.y2); ctx.stroke();
          ctx.strokeStyle = `rgba(232,248,255,${1 - k})`; ctx.lineWidth = 3; ctx.stroke();
        } else if (fx.type === 'flash') {
          ctx.fillStyle = `rgba(255,200,90,${1 - k})`; ctx.beginPath(); ctx.arc(fx.x, fx.y, 7 + k * 6, 0, Math.PI * 2); ctx.fill();
        } else if (fx.type === 'poof') {
          ctx.strokeStyle = `rgba(255,255,255,${0.7 * (1 - k)})`; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.arc(fx.x, fx.y, fx.r + k * 14, 0, Math.PI * 2); ctx.stroke();
        } else if (fx.type === 'leak') {
          ctx.strokeStyle = `rgba(229,96,90,${1 - k})`; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.arc(fx.x, fx.y, 12 + k * 30, 0, Math.PI * 2); ctx.stroke();
        } else if (fx.type === 'gold') {
          const y = fx.y - k * 26;
          ctx.globalAlpha = Math.min(1, (1 - k) * 2);
          ctx.fillStyle = '#f2b544'; ctx.strokeStyle = '#7a5510'; ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.arc(fx.x - 8, y - 6, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.font = '700 18px Fredoka, Inter, sans-serif'; ctx.textBaseline = 'alphabetic';
          ctx.lineWidth = 3.5; ctx.strokeStyle = '#4a3200'; ctx.strokeText(fx.text, fx.x + 2, y);
          ctx.fillStyle = '#ffd56b'; ctx.fillText(fx.text, fx.x + 2, y);
          ctx.globalAlpha = 1;
        }
      }
    }

    drawLabel(x, y, text, fg, border) {
      const ctx = this.ctx;
      ctx.font = '600 13px Inter, sans-serif';
      const w = ctx.measureText(text).width + 20, h = 26;
      let lx = Math.max(6, Math.min(x - w / 2, this.W - w - 6));
      let ly = Math.max(6, Math.min(y - h / 2, this.H - h - 6));
      ctx.fillStyle = 'rgba(16,21,29,0.88)'; ctx.strokeStyle = border; ctx.lineWidth = 1.5;
      roundRect(ctx, lx, ly, w, h, 13); ctx.fill(); ctx.stroke();
      ctx.fillStyle = fg; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
      ctx.fillText(text, lx + w / 2, ly + h / 2 + 1);
      ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
    }
  }

  function wallMask(s, x, y, ghost) {
    const has = (a, b) => s.towers.has(a + ',' + b);
    return (has(x, y - 1) ? 1 : 0) | (has(x + 1, y) ? 2 : 0) | (has(x, y + 1) ? 4 : 0) | (has(x - 1, y) ? 8 : 0);
  }

  function roundRect(ctx, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  function hexA(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }

  TD.Renderer = Renderer;
})();
