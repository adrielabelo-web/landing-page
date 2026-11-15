// Ilustrações dos passos "Nicho" e "Monetização", desenhadas em SVG no mesmo estilo das outras
// (grade navy, cartões de vidro, destaque azul com brilho) e exportadas em WebP.
// ROOT = pasta do site. Uso: node illos.mjs
import sharp from "sharp";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const tools = path.dirname(fileURLToPath(import.meta.url));
const root = process.env.ROOT ? path.resolve(process.env.ROOT) : path.resolve(tools, "..");
const out = path.join(root, "assets", "img");
await mkdir(out, { recursive: true });

const S = 1254;
const defs = `
  <defs>
    <radialGradient id="bg" cx="50%" cy="46%" r="70%">
      <stop offset="0" stop-color="#0c2a52"/><stop offset=".55" stop-color="#071a35"/><stop offset="1" stop-color="#040e1f"/>
    </radialGradient>
    <pattern id="grid" width="70" height="70" patternUnits="userSpaceOnUse">
      <path d="M70 0H0V70" fill="none" stroke="#1b4274" stroke-width="1.6" opacity=".5"/>
    </pattern>
    <linearGradient id="hi" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3f97ff"/><stop offset="1" stop-color="#1f74ea"/>
    </linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#17406f" stop-opacity=".78"/><stop offset="1" stop-color="#0d2a50" stop-opacity=".82"/>
    </linearGradient>
    <filter id="blur18" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18"/></filter>
    <filter id="blur30" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="30"/></filter>
    <filter id="blur6" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
  </defs>
  <rect width="${S}" height="${S}" fill="url(#bg)"/>
  <rect width="${S}" height="${S}" fill="url(#grid)"/>`;

// glifos em caixa 100x100, só traço
const G = {
  pot: `<path d="M24 48H76V68a12 12 0 0 1-12 12H36a12 12 0 0 1-12-12Z"/><path d="M18 48H82"/><path d="M30 46C34 30 66 30 70 46"/><circle cx="50" cy="27" r="4"/><path d="M24 58H13M76 58H87"/>`,
  house: `<path d="M16 50 50 22 84 50"/><path d="M26 44V80H74V44"/><path d="M43 80V60H57V80"/>`,
  book: `<path d="M50 30C40 22 26 22 18 26V76C26 72 40 72 50 80C60 72 74 72 82 76V26C74 22 60 22 50 30Z"/><path d="M50 30V80"/>`,
  bag: `<path d="M25 38H75L80 82H20Z"/><path d="M38 38C38 16 62 16 62 38"/>`,
  leaf: `<path d="M22 78C22 40 50 20 80 20C80 54 58 78 22 78Z"/><path d="M22 78 60 40"/>`,
  paw: `<circle cx="30" cy="44" r="7"/><circle cx="44" cy="30" r="7"/><circle cx="60" cy="30" r="7"/><circle cx="72" cy="46" r="7"/><path d="M34 70C34 54 68 54 68 70C68 82 34 82 34 70Z"/>`,
  dumbbell: `<path d="M32 50H68"/><rect x="20" y="34" width="12" height="32" rx="4"/><rect x="68" y="34" width="12" height="32" rx="4"/><path d="M12 42V58M88 42V58"/>`,
  heart: `<path d="M50 80C18 58 16 36 33 29C41 26 48 31 50 38C52 31 59 26 67 29C84 36 82 58 50 80Z"/>`,
  star: `<path d="M50 18 59 41 83 42 64 57 71 81 50 67 29 81 36 57 17 42 41 41Z"/>`,
  play: `<rect x="14" y="24" width="72" height="52" rx="12"/><path d="M43 38V62L64 50Z"/>`,
  chat: `<path d="M16 24H62a8 8 0 0 1 8 8V52a8 8 0 0 1-8 8H38L26 70V60H24a8 8 0 0 1-8-8V32a8 8 0 0 1 8-8Z"/><path d="M78 44a8 8 0 0 1 8 8V70a8 8 0 0 1-8 8H76V86L66 78H50"/><path d="M30 38H56M30 48H48"/>`,
};
// busto em wireframe, caixa 120x150
const BUST = `
  <path d="M60 8C32 8 20 30 20 56C20 70 24 80 28 90C33 104 46 116 60 116C74 116 87 104 92 90C96 80 100 70 100 56C100 30 88 8 60 8Z"/>
  <path d="M20 58C13 56 12 70 23 77M100 58C107 56 108 70 97 77"/>
  <path d="M46 112V128C30 134 10 138 4 150H116C110 138 90 134 74 128V112"/>
  <path d="M22 42C40 49 80 49 98 42M20 62C40 70 80 70 100 62M27 86C44 94 76 94 93 86M60 8V116M40 13C29 40 32 90 46 112M80 13C91 40 88 90 74 112"/>
  <path d="M60 128V150M46 128C40 138 34 146 30 150M74 128C80 138 86 146 90 150M22 140C45 133 75 133 98 140"/>`;

const glyph = (name, cx, cy, size, stroke, sw, opacity = 1) =>
  `<g transform="translate(${cx - size / 2} ${cy - size / 2}) scale(${size / 100})" fill="none" stroke="${stroke}" stroke-width="${sw / (size / 100)}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}">${G[name]}</g>`;
const floor = (cx, cy, rx, o = .55) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${rx * .16}" fill="#2f86f5" opacity="${o}" filter="url(#blur18)"/>`;
const tile = (x, y, w, h, r = 30) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#glass)" stroke="#2c7fe6" stroke-width="3"/>`;
const hiTile = (x, y, w, h, r = 34) => `
  <rect x="${x - 6}" y="${y - 6}" width="${w + 12}" height="${h + 12}" rx="${r + 6}" fill="#3d92ff" opacity=".75" filter="url(#blur30)"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#hi)" stroke="#8cc4ff" stroke-width="3.5"/>`;

/* ── NICHO: nove assuntos, um escolhido ───────────────────── */
function nicho() {
  const t = 212, gap = 44, n = 3, total = n * t + (n - 1) * gap;
  const x0 = (S - total) / 2, y0 = 190;
  const names = ["house", "book", "bag", "leaf", "pot", "paw", "dumbbell", "heart", "star"];
  let s = "";
  names.forEach((nm, i) => {
    const c = i % 3, r = Math.floor(i / 3), x = x0 + c * (t + gap), y = y0 + r * (t + gap);
    if (i === 4) return;
    s += tile(x, y, t, t) + glyph(nm, x + t / 2, y + t / 2, 104, "#5fa6f7", 5, .85);
  });
  const cx = S / 2, cy = y0 + t + gap + t / 2, big = 268;
  // linhas de mira atravessando a grade
  s += `<g stroke="#4f9cf5" stroke-width="2.5" opacity=".75"><path d="M${x0 - 70} ${cy}H${cx - big / 2 - 34}M${cx + big / 2 + 34} ${cy}H${x0 + total + 70}M${cx} ${y0 - 70}V${cy - big / 2 - 34}M${cx} ${cy + big / 2 + 34}V${y0 + total + 70}"/></g>`;
  s += hiTile(cx - big / 2, cy - big / 2, big, big) + glyph("pot", cx, cy, 150, "#ffffff", 6.5);
  // cantoneiras de seleção
  const b = big / 2 + 30, k = 46;
  s += `<g fill="none" stroke="#bfe0ff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M${cx - b} ${cy - b + k}V${cy - b}H${cx - b + k}M${cx + b - k} ${cy - b}H${cx + b}V${cy - b + k}M${cx + b} ${cy + b - k}V${cy + b}H${cx + b - k}M${cx - b + k} ${cy + b}H${cx - b}V${cy + b - k}"/></g>`;
  s += floor(cx, y0 + total + 96, 230, .6) + floor(x0 + t / 2, y0 + total + 84, 110, .3) + floor(x0 + total - t / 2, y0 + total + 84, 110, .3);
  return s;
}

/* ── MONETIZAÇÃO: um personagem, três fontes de receita ───── */
function monetizacao() {
  const cw = 268, ch = 420, cx0 = 120, cy0 = (S - ch) / 2 - 20, mid = cy0 + ch / 2;
  const tw = 214, tx = 880, ys = [mid - 320, mid, mid + 320];
  let s = "";
  // ligações
  ys.forEach((y, i) => {
    const d = `M${cx0 + cw} ${mid}C${cx0 + cw + 230} ${mid} ${tx - 230} ${y} ${tx} ${y}`;
    s += `<path d="${d}" fill="none" stroke="#3d92ff" stroke-width="10" opacity=".35" filter="url(#blur6)"/><path d="${d}" fill="none" stroke="#4f9ff8" stroke-width="3.5"/>`;
  });
  // pontos correndo nas ligações
  [[590, mid - 152], [640, mid], [590, mid + 152]].forEach(([x, y]) => {
    s += `<circle cx="${x}" cy="${y}" r="16" fill="#3d92ff" opacity=".6" filter="url(#blur6)"/><circle cx="${x}" cy="${y}" r="8" fill="#d9ecff"/>`;
  });
  // cartão do personagem
  s += hiTile(cx0, cy0, cw, ch, 36);
  const bs = 1.78;
  s += `<g transform="translate(${cx0 + cw / 2 - 60 * bs} ${cy0 + 78}) scale(${bs})" fill="none" stroke="#ffffff" stroke-width="${3.4 / bs}" stroke-linecap="round" stroke-linejoin="round">${BUST}</g>`;
  s += floor(cx0 + cw / 2, cy0 + ch + 78, 170, .6);
  // três saídas
  ["play", "bag", "chat"].forEach((nm, i) => {
    const y = ys[i] - tw / 2;
    s += tile(tx, y, tw, tw) + glyph(nm, tx + tw / 2, ys[i], 112, "#7db8fb", 5.5);
    // moeda
    const mx = tx + tw - 6, my = y + 6;
    s += `<circle cx="${mx}" cy="${my}" r="46" fill="#3d92ff" opacity=".7" filter="url(#blur18)"/>
      <circle cx="${mx}" cy="${my}" r="38" fill="url(#hi)" stroke="#d9ecff" stroke-width="3.5"/>
      <circle cx="${mx}" cy="${my}" r="28" fill="none" stroke="#d9ecff" stroke-width="2" opacity=".65"/>
      <path d="M${mx + 9} ${my - 11}C${mx + 3} ${my - 18} ${mx - 11} ${my - 16} ${mx - 11} ${my - 7}C${mx - 11} ${my + 2} ${mx + 11} ${my - 2} ${mx + 11} ${my + 8}C${mx + 11} ${my + 17} ${mx - 4} ${my + 18} ${mx - 10} ${my + 11}M${mx} ${my - 22}V${my + 22}" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>`;
  });
  s += floor(tx + tw / 2, ys[2] + tw / 2 + 70, 120, .35);
  return s;
}

const jobs = { nicho: nicho(), monetizacao: monetizacao() };
for (const [name, body] of Object.entries(jobs)) {
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">${defs}${body}</svg>`);
  for (const w of [480, 800]) {
    const file = `${name}-${w}.webp`;
    await sharp(svg, { density: 72 }).resize({ width: w }).webp({ quality: 80 }).toFile(path.join(out, file));
    console.log(file.padEnd(24), ((await stat(path.join(out, file))).size / 1024).toFixed(0), "KB");
  }
}
