// Ilustrações e fundo do CTA -> WebP responsivo.
// ROOT = pasta do site (padrão: a pasta acima de tools). Originais em ../assets/src (pasta de trabalho).
import sharp from "sharp";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const tools = path.dirname(fileURLToPath(import.meta.url));
const root = process.env.ROOT ? path.resolve(process.env.ROOT) : path.resolve(tools, "..");
const src = path.resolve(tools, "..", "assets", "src");
const out = path.join(root, "assets", "img");
await mkdir(out, { recursive: true });

const jobs = [
  { name: "personagem", widths: [480, 800] },
  { name: "roteiro", widths: [480, 800] },
  { name: "producao", widths: [480, 800] },
  { name: "funil", widths: [480, 800] },
  { name: "cta-bg", widths: [960, 1536] },
];

for (const { name, widths } of jobs) {
  for (const w of widths) {
    const file = `${name}-${w}.webp`;
    await sharp(path.join(src, `${name}.png`)).resize({ width: w }).webp({ quality: 76 }).toFile(path.join(out, file));
    console.log(file.padEnd(24), ((await stat(path.join(out, file))).size / 1024).toFixed(0), "KB");
  }
}
