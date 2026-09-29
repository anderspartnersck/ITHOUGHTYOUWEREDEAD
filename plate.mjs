// THE STREET PLATE — Detroit at sunset, painted in code (0929). The image models kept putting PALM TREES in
// Detroit; a procedural plate can't. One-point perspective down a residential street toward the Renaissance
// Center: sunset sky + sun, the RenCen towers and skyline, gabled row houses receding on both sides, power
// poles and sagging lines, BARE Midwestern trees (fractal branches), a cracked street, and a halftone-dot
// screen so it sits with the comic sprites. Deterministic (seeded) — the same street every time.
// Presentation only. Sprites/plates can replace it later; the ASCII-era duel.png is the fallback.

function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

const PAL = {
  skyTop: "#2a1633", skyMid: "#b8432a", skyLow: "#f08a3a", sun: "#ffd98a",
  far: "#5a2e3a", rencen: "#3a2230", rencenLit: "#7a3e3c",
  house: ["#4a3a3f", "#56403c", "#3f3542", "#5a4638"], roof: "#261a22", window: "#f6b35a", windowDark: "#2b1c24",
  street: "#3a2f33", streetLine: "#5a4a48", curb: "#6b5a55", crack: "#241a1e",
  pole: "#1c1318", wire: "rgba(20,12,16,.8)", tree: "#23161b", leaf: "#8a3b22",
};

export function drawPlate(cv, seed = 7) {
  const W = cv.width, H = cv.height, g = cv.getContext("2d"), r = rng(seed);
  const vx = W * 0.5, hy = H * 0.52;                                  // vanishing point / horizon

  // sky
  const sky = g.createLinearGradient(0, 0, 0, hy);
  sky.addColorStop(0, PAL.skyTop); sky.addColorStop(0.55, PAL.skyMid); sky.addColorStop(1, PAL.skyLow);
  g.fillStyle = sky; g.fillRect(0, 0, W, hy + 2);
  // streaky clouds
  g.globalAlpha = 0.18; g.fillStyle = "#ffb070";
  for (let i = 0; i < 14; i++) { const y = hy * (0.15 + r() * 0.6), x = r() * W, w = W * (0.15 + r() * 0.3); g.fillRect(x - w / 2, y, w, 2 + r() * 3); }
  g.globalAlpha = 1;
  // the sun, low and to the right
  const sx = W * 0.72, sy = hy * 0.72, sr = H * 0.07;
  const glow = g.createRadialGradient(sx, sy, sr * 0.3, sx, sy, sr * 4);
  glow.addColorStop(0, "rgba(255,217,138,.55)"); glow.addColorStop(1, "rgba(255,217,138,0)");
  g.fillStyle = glow; g.fillRect(0, 0, W, hy);
  g.fillStyle = PAL.sun; g.beginPath(); g.arc(sx, sy, sr, 0, Math.PI * 2); g.fill();

  // far skyline blocks
  g.fillStyle = PAL.far;
  for (let x = 0; x < W; ) { const w = W * (0.02 + r() * 0.035), h = hy * (0.08 + r() * 0.22); g.fillRect(x, hy - h, w, h); x += w * (0.8 + r() * 0.5); }
  // the Renaissance Center: a tall central cylinder ringed by four shorter ones, dead center at the vanishing point
  const tower = (cx, w, h, lit) => {
    g.fillStyle = PAL.rencen; g.fillRect(cx - w / 2, hy - h, w, h);
    g.fillStyle = lit; g.fillRect(cx - w / 2 + w * 0.62, hy - h, w * 0.18, h);            // sun-side sheen
    g.fillStyle = "rgba(255,190,110,.25)";
    for (let y = hy - h + 6; y < hy - 4; y += 7) g.fillRect(cx - w / 2 + 2, y, w - 4, 1);  // floor lines
  };
  const tw = W * 0.028;
  [[-2.3, 0.62], [2.3, 0.62], [-1.15, 0.72], [1.15, 0.72]].forEach(([dx, s]) => tower(vx + dx * tw, tw * 1.05, hy * 0.5 * s, PAL.rencenLit));
  tower(vx, tw * 1.25, hy * 0.62, PAL.rencenLit);
  g.fillStyle = PAL.rencen; g.fillRect(vx - tw * 0.2, hy - hy * 0.62 - hy * 0.05, tw * 0.4, hy * 0.05);  // the crown

  // the street (one-point perspective)
  g.fillStyle = PAL.street; g.beginPath(); g.moveTo(vx - W * 0.02, hy); g.lineTo(vx + W * 0.02, hy); g.lineTo(W * 0.92, H); g.lineTo(W * 0.08, H); g.fill();
  // sidewalks / lawns
  g.fillStyle = "#2e2226"; g.beginPath(); g.moveTo(0, hy); g.lineTo(vx - W * 0.02, hy); g.lineTo(W * 0.08, H); g.lineTo(0, H); g.fill();
  g.beginPath(); g.moveTo(W, hy); g.lineTo(vx + W * 0.02, hy); g.lineTo(W * 0.92, H); g.lineTo(W, H); g.fill();
  g.strokeStyle = PAL.curb; g.lineWidth = 2;
  g.beginPath(); g.moveTo(vx - W * 0.02, hy); g.lineTo(W * 0.08, H); g.moveTo(vx + W * 0.02, hy); g.lineTo(W * 0.92, H); g.stroke();
  // cracks + fallen leaves (Michigan autumn)
  g.strokeStyle = PAL.crack; g.lineWidth = 1.2;
  for (let i = 0; i < 26; i++) {
    const t = 0.15 + r() * 0.85, y = hy + (H - hy) * t, half = (W * 0.02) + (W * 0.42) * t, x = vx + (r() * 2 - 1) * half * 0.9;
    g.beginPath(); g.moveTo(x, y); let cx = x, cy = y;
    for (let k = 0; k < 4; k++) { cx += (r() - 0.5) * 30 * t; cy += (r() - 0.3) * 10 * t; g.lineTo(cx, cy); } g.stroke();
  }
  g.fillStyle = PAL.leaf;
  for (let i = 0; i < 90; i++) { const t = r(), y = hy + (H - hy) * t, x = r() * W, s = 1 + 3 * t; g.fillRect(x, y, s * 1.4, s); }

  // row houses both sides, receding (drawn far → near)
  const houses = (side) => {
    for (let i = 9; i >= 0; i--) {
      const t = (i + 1) / 10, near = 1 - t;                               // near = 1 is closest
      const scale = 0.12 + near * 0.9, hh = H * 0.28 * scale, ww = W * 0.16 * scale;
      const baseY = hy + (H - hy) * (near * 0.72), edge = side < 0 ? vx - W * 0.04 - (vx) * near * 1.05 : vx + W * 0.04 + (W - vx) * near * 1.05;
      const x = side < 0 ? edge - ww : edge;
      g.fillStyle = PAL.house[i % PAL.house.length]; g.fillRect(x, baseY - hh, ww, hh);
      g.fillStyle = PAL.roof; g.beginPath(); g.moveTo(x - ww * 0.06, baseY - hh); g.lineTo(x + ww / 2, baseY - hh - hh * 0.45); g.lineTo(x + ww * 1.06, baseY - hh); g.fill();
      for (let k = 0; k < 2; k++) {                                        // two windows, some lit
        g.fillStyle = r() < 0.45 ? PAL.window : PAL.windowDark;
        g.fillRect(x + ww * (0.18 + k * 0.42), baseY - hh * 0.72, ww * 0.2, hh * 0.24);
      }
      g.fillStyle = "#2a1d22"; g.fillRect(x + ww * 0.1, baseY - hh * 0.1, ww * 0.8, hh * 0.1);  // porch
    }
  };
  houses(-1); houses(1);

  // bare trees (fractal branches) between the houses
  const branch = (x, y, len, ang, d) => {
    if (d === 0 || len < 2) return;
    const x2 = x + Math.cos(ang) * len, y2 = y - Math.sin(ang) * len;
    g.lineWidth = Math.max(0.6, d * 0.9); g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke();
    branch(x2, y2, len * (0.66 + r() * 0.1), ang + 0.35 + r() * 0.25, d - 1);
    branch(x2, y2, len * (0.66 + r() * 0.1), ang - 0.35 - r() * 0.25, d - 1);
  };
  g.strokeStyle = PAL.tree;
  for (const side of [-1, 1]) for (let i = 0; i < 5; i++) {
    const near = 0.15 + i * 0.2, y = hy + (H - hy) * near * 0.72, x = side < 0 ? vx - W * 0.06 - vx * near * 0.95 : vx + W * 0.06 + (W - vx) * near * 0.95;
    branch(x, y, H * 0.09 * (0.3 + near), Math.PI / 2 + (r() - 0.5) * 0.2, 6);
  }

  // power poles + sagging lines, both sides
  const poles = [];
  for (const side of [-1, 1]) for (let i = 0; i < 6; i++) {
    const near = 0.08 + i * 0.18, y = hy + (H - hy) * near * 0.8, x = side < 0 ? vx - W * 0.03 - vx * near * 0.9 : vx + W * 0.03 + (W - vx) * near * 0.9;
    const h = H * 0.42 * (0.15 + near); poles.push([side, x, y - h, near]);
    g.fillStyle = PAL.pole; g.fillRect(x - 1 - near * 3, y - h, 2 + near * 6, h);
    g.fillRect(x - h * 0.12, y - h * 0.95, h * 0.24, 2 + near * 3);   // crossbar
  }
  g.strokeStyle = PAL.wire; g.lineWidth = 1;
  for (const side of [-1, 1]) {
    const ps = poles.filter(p => p[0] === side).sort((a, b) => a[3] - b[3]);
    for (let i = 0; i < ps.length - 1; i++) for (const off of [-1, 1]) {
      const [, x1, y1, n1] = ps[i], [, x2, y2, n2] = ps[i + 1], o1 = off * H * 0.02 * n1, o2 = off * H * 0.02 * n2;
      g.beginPath(); g.moveTo(x1 + o1, y1 + 4); g.quadraticCurveTo((x1 + x2) / 2, (y1 + y2) / 2 + 14, x2 + o2, y2 + 4); g.stroke();
    }
  }

  // haze at the horizon + the halftone screen
  const hz = g.createLinearGradient(0, hy - H * 0.12, 0, hy + H * 0.08);
  hz.addColorStop(0, "rgba(240,138,58,0)"); hz.addColorStop(0.6, "rgba(240,138,58,.28)"); hz.addColorStop(1, "rgba(240,138,58,0)");
  g.fillStyle = hz; g.fillRect(0, hy - H * 0.12, W, H * 0.2);
  g.fillStyle = "rgba(0,0,0,.16)";
  for (let y = 0; y < H; y += 4) for (let x = (y / 4) % 2 ? 2 : 0; x < W; x += 4) g.fillRect(x, y, 1, 1);
}
