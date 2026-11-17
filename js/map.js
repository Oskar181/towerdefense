/* map.js — random level generation and pathfinding. */
(function () {
  'use strict';
  const TD = (window.TD = window.TD || {});

  // kinds: 0 free, 1 water, 2 rock, 3 tree, 4 nest, 5 base
  TD.KIND = { FREE: 0, WATER: 1, ROCK: 2, TREE: 3, NEST: 4, BASE: 5 };

  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  TD.rng = rng;
  const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1)); // inclusive

  const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];

  // Distance field from goal (BFS). blockedFn(x,y) -> bool. Returns Int16Array (-1 unreachable).
  TD.distanceField = function (cols, rows, goal, blockedFn) {
    const dist = new Int16Array(cols * rows).fill(-1);
    const q = new Int32Array(cols * rows);
    let h = 0, t = 0;
    dist[goal.y * cols + goal.x] = 0;
    q[t++] = goal.y * cols + goal.x;
    while (h < t) {
      const i = q[h++], x = i % cols, y = (i / cols) | 0, d = dist[i];
      for (const [dx, dy] of DIRS) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
        const ni = ny * cols + nx;
        if (dist[ni] !== -1 || blockedFn(nx, ny)) continue;
        dist[ni] = d + 1;
        q[t++] = ni;
      }
    }
    return dist;
  };

  // Shortest path start->goal; among equal choices keeps going straight (fewer zig-zags).
  TD.findPath = function (cols, rows, start, goal, blockedFn) {
    const dist = TD.distanceField(cols, rows, goal, blockedFn);
    if (dist[start.y * cols + start.x] < 0) return null;
    const path = [[start.x, start.y]];
    let x = start.x, y = start.y, pdx = 1, pdy = 0;
    let guard = cols * rows;
    while (!(x === goal.x && y === goal.y) && guard-- > 0) {
      const d = dist[y * cols + x];
      let best = null;
      const order = [[pdx, pdy]].concat(DIRS.filter(([a, b]) => !(a === pdx && b === pdy)));
      for (const [dx, dy] of order) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
        if (dist[ny * cols + nx] === d - 1) { best = [dx, dy]; break; }
      }
      if (!best) return null;
      x += best[0]; y += best[1]; pdx = best[0]; pdy = best[1];
      path.push([x, y]);
    }
    return path;
  };

  // ------------------------------------------------------------ generation
  TD.generateMap = function (seed, cols, rows) {
    cols = cols || 28; rows = rows || 16;
    for (let attempt = 0; attempt < 40; attempt++) {
      const m = tryGenerate((seed + attempt * 7919) >>> 0, cols, rows);
      if (m) { m.seed = seed; return m; }
    }
    // fallback: empty map
    return tryGenerate(seed, cols, rows, true);
  };

  function tryGenerate(seed, cols, rows, empty) {
    const r = rng(seed);
    const kind = new Uint8Array(cols * rows);
    const idx = (x, y) => y * cols + x;
    const inb = (x, y) => x >= 0 && y >= 0 && x < cols && y < rows;

    const nestR = ri(r, 4, rows - 6), baseR = ri(r, 4, rows - 6);
    const nest = { c: 0, r: nestR }, base = { c: cols - 2, r: baseR };
    for (let dx = 0; dx < 2; dx++) for (let dy = 0; dy < 2; dy++) {
      kind[idx(nest.c + dx, nest.r + dy)] = 4;
      kind[idx(base.c + dx, base.r + dy)] = 5;
    }
    const start = { x: 1, y: nestR }, goal = { x: cols - 2, y: baseR };

    const safe = (x, y) => {
      // keep space around nest exit and base entrance
      if (x <= 3 && Math.abs(y - nestR - 0.5) <= 2.5) return false;
      if (x >= cols - 5 && Math.abs(y - baseR - 0.5) <= 2.5) return false;
      if (x >= cols - 3 && (y === baseR - 1)) return false; // flag
      return true;
    };
    const free = (x, y) => inb(x, y) && kind[idx(x, y)] === 0 && safe(x, y);

    const ponds = [], water = [], rocks = [], trees = [];
    if (!empty) {
      // ponds: random-walk blobs
      const pondCount = ri(r, 2, 3);
      for (let p = 0; p < pondCount; p++) {
        const size = ri(r, 5, 9);
        let x = ri(r, 5, cols - 7), y = ri(r, 1, rows - 3);
        const cells = [];
        let tries = 0;
        while (cells.length < size && tries++ < 60) {
          if (free(x, y)) { kind[idx(x, y)] = 1; cells.push([x, y]); }
          const [dx, dy] = DIRS[Math.floor(r() * 4)];
          const base0 = cells.length ? cells[Math.floor(r() * cells.length)] : [x, y];
          x = base0[0] + dx; y = base0[1] + dy;
        }
        if (cells.length) { ponds.push(cells); water.push(...cells); }
      }
      // rock clusters
      const rockClusters = ri(r, 5, 7);
      for (let k = 0; k < rockClusters; k++) {
        let x = ri(r, 2, cols - 3), y = ri(r, 0, rows - 1);
        const n = ri(r, 1, 3);
        for (let j = 0; j < n; j++) {
          if (free(x, y)) { kind[idx(x, y)] = 2; rocks.push([x, y]); }
          const [dx, dy] = DIRS[Math.floor(r() * 4)];
          x += dx; y += dy;
        }
      }
      // tree groves, biased toward the edges
      const groves = ri(r, 7, 10);
      for (let k = 0; k < groves; k++) {
        let x = ri(r, 0, cols - 1);
        let y = r() < 0.6 ? (r() < 0.5 ? ri(r, 0, 2) : ri(r, rows - 3, rows - 1)) : ri(r, 0, rows - 1);
        const n = ri(r, 1, 5);
        for (let j = 0; j < n; j++) {
          if (free(x, y)) { kind[idx(x, y)] = 3; trees.push([x, y]); }
          const [dx, dy] = DIRS[Math.floor(r() * 4)];
          x += dx; y += dy;
        }
      }
    }
    const map = { cols, rows, kind, nest, base, start, goal, ponds, water, rocks, trees, seed };
    const p = TD.findPath(cols, rows, start, goal, (x, y) => TD.mapBlocked(map, x, y));
    if (!p) return null;
    // forgiving maps: plenty of room — reject maps that are too cramped
    let freeCount = 0;
    for (let i = 0; i < kind.length; i++) if (kind[i] === 0) freeCount++;
    if (!empty && freeCount < kind.length * 0.8) return null;
    return map;
  }

  // Is a cell blocked by terrain (not counting towers)? Start and goal cells are walkable.
  TD.mapBlocked = function (map, x, y) {
    if ((x === map.start.x && y === map.start.y) || (x === map.goal.x && y === map.goal.y)) return false;
    return map.kind[y * map.cols + x] !== 0;
  };

  // Can the player build here (terrain-wise)?
  TD.mapBuildable = function (map, x, y) {
    if (x < 0 || y < 0 || x >= map.cols || y >= map.rows) return false;
    if (map.kind[y * map.cols + x] !== 0) return false;
    // keep the cell in front of the nest and the base free so they can never be sealed
    if (x === map.start.x + 1 && y === map.start.y) return false;
    if (x === map.goal.x - 1 && y === map.goal.y) return false;
    return true;
  };
})();
