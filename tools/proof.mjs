// Prints de prova, páginas do ebook, foto e avatar do X -> ROOT/assets/img (só WebP, 1 arquivo por imagem)
// Borra o avatar no canto superior direito dos prints do Meta Business Suite.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const tools = path.dirname(fileURLToPath(import.meta.url));
const root = process.env.ROOT ? path.resolve(process.env.ROOT) : path.resolve(tools, "..");
const out = path.join(root, "assets", "img");
const DL = "C:/Users/Adriel/Downloads/";
const ORIG = path.resolve(tools, "..", "assets", "src", "originais") + "/";
await mkdir(out, { recursive: true });

// [saída, origem, borrar avatar no canto?, cortar N px do topo]
// Fora da página: visões gerais do Instagram e do Facebook (mostram views de anúncio).
// kiwify-painel: corta os filtros do topo. ig-desempenho: corta a faixa de tarefas ("Publish one ad").
const proofs = [
  ["kiwify-painel", ORIG + "kiwify-painel.png", false, 82],
  ["kiwify-notificacoes", DL + "WhatsApp Image 2026-11-07 at 19.46.22.jpeg", false],
  ["ig-desempenho", DL + "WhatsApp Image 2026-11-07 at 00.17.47 (1).jpeg", true, 185],
  ["ig-metricas", DL + "WhatsApp Image 2026-11-07 at 00.17.48.jpeg", true],
  ["ig-por-video", DL + "WhatsApp Image 2026-11-07 at 00.20.06.jpeg", false],
  ["ig-comparativo", DL + "WhatsApp Image 2026-11-07 at 00.18.51.jpeg", true],
  ["fb-desempenho", DL + "WhatsApp Image 2026-11-07 at 00.17.47.jpeg", true],
  ["fb-metricas", DL + "WhatsApp Image 2026-11-07 at 00.17.47 (2).jpeg", true],
  ["fb-comparativo", DL + "WhatsApp Image 2026-11-07 at 00.18.51 (1).jpeg", true],
  ["views-6-7-nov", DL + "WhatsApp Image 2026-11-08 at 22.02.13.jpeg", false],
  ["ebook-sumario", ORIG + "ebook-sumario.png", false],
  ["ebook-ficha", ORIG + "ebook-ficha.png", false],
];

const sizes = {};
for (const [name, src, blur, cropTop = 0] of proofs) {
  const img = sharp(src).flatten({ background: "#ffffff" });
  const meta = await img.metadata();
  let buf = await img.png().toBuffer();
  if (blur) {
    const w = 76, h = 78, left = meta.width - w;
    const patch = await sharp(buf).extract({ left, top: 0, width: w, height: h }).blur(14).toBuffer();
    buf = await sharp(buf).composite([{ input: patch, left, top: 0 }]).png().toBuffer();
  }
  const height = meta.height - cropTop;
  if (cropTop) buf = await sharp(buf).extract({ left: 0, top: cropTop, width: meta.width, height }).png().toBuffer();
  await sharp(buf).webp({ quality: 82 }).toFile(path.join(out, `${name}.webp`));
  sizes[name] = [meta.width, height];
}

// Foto do Adriel: o original tem só 150x150. Sai em 300x300 (2x) e aparece em até 150 px na página, para ficar nítida.
await sharp(ORIG + "adriel.png").resize(300, 300, { kernel: "lanczos3" }).sharpen({ sigma: 0.6, m1: 0.6, m2: 1.2 }).webp({ quality: 90 }).toFile(path.join(out, "adriel-300.webp"));
// Avatar do X: 144 px (56 px na tela @2x+)
await sharp(ORIG + "x-avatar.png").resize(144, 144).webp({ quality: 85 }).toFile(path.join(out, "x-avatar-144.webp"));

console.log(JSON.stringify(sizes));
