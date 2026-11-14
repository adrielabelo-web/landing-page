import sharp from "sharp";
const H = 2400, dir = "../reference/";
const parts = [dir + "mockup.png", dir + "screens/final/full-1440.png", dir + "screens/final/full-390.png"];
const imgs = await Promise.all(parts.map(async p => { const b = await sharp(p).resize({ height: H }).png().toBuffer(); const m = await sharp(b).metadata(); return { b, w: m.width }; }));
const gap = 40; const W = imgs.reduce((s, i) => s + i.w, 0) + gap * (imgs.length + 1);
let x = gap; const comp = imgs.map(i => { const c = { input: i.b, left: x, top: gap }; x += i.w + gap; return c; });
await sharp({ create: { width: W, height: H + gap * 2, channels: 3, background: "#0E1A2B" } }).composite(comp).png().toFile(dir + "comparativo-final.png");
console.log("ok", W);

