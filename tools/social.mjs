// Provas sociais (prints de WhatsApp) e foto do Adriel -> ROOT/assets/img.
// Privacidade: o cabeçalho de cada conversa (nome e foto da pessoa) é cortado fora.
// No segundo print, uma palavra grosseira é removida a pedido do autor: o fim do balão (hora) é puxado para a esquerda.
import sharp from "sharp";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const tools = path.dirname(fileURLToPath(import.meta.url));
const root = process.env.ROOT ? path.resolve(process.env.ROOT) : path.resolve(tools, "..");
const src = path.resolve(tools, "..", "assets", "src");
const out = path.join(root, "assets", "img");
await mkdir(out, { recursive: true });
const log = async (f) => console.log(f.padEnd(28), ((await stat(path.join(out, f))).size / 1024).toFixed(0), "KB");

// 1) feedback do aluno: corta o cabeçalho (nome + foto)
await sharp(path.join(src, "social", "aluno-feedback.png"))
  .extract({ left: 56, top: 88, width: 792 - 56, height: 403 - 88 })
  .resize({ width: 1104, kernel: "lanczos3" }).webp({ quality: 88 }).toFile(path.join(out, "prova-aluno.webp"));
await log("prova-aluno.webp");

// 2) personagem criado por um comprador: remove a palavra e corta o cabeçalho
const p2 = path.join(src, "social", "comprador-personagem.png");
const tail = await sharp(p2).extract({ left: 276, top: 136, width: 56, height: 48 }).toBuffer();   // hora + borda direita do balão
const bg = await sharp({ create: { width: 62, height: 48, channels: 3, background: { r: 22, g: 23, b: 23 } } }).png().toBuffer();
const edited = await sharp(p2).composite([{ input: bg, left: 270, top: 136 }, { input: tail, left: 216, top: 136 }]).png().toBuffer();
await sharp(edited).extract({ left: 60, top: 84, width: 540 - 60, height: 477 - 84 })
  .resize({ width: 960, kernel: "lanczos3" }).webp({ quality: 88 }).toFile(path.join(out, "prova-personagem.webp"));
await log("prova-personagem.webp");

// 3) foto do Adriel (607x607): tira as faixas escuras das laterais e sai em 560 px
await sharp(path.join(src, "originais", "adriel-607.jpg"))
  .extract({ left: 26, top: 0, width: 556, height: 556 })
  .resize(560, 560, { kernel: "lanczos3" }).webp({ quality: 84 }).toFile(path.join(out, "adriel-560.webp"));
await log("adriel-560.webp");

// 4) personagens de exemplo (gerados no ChatGPT pelo autor): A = mulher, recorte 3:4 para a fileira "mesmo rosto"; B = homem, quadrado para a ficha
const av = path.join(src, "avatars");
{
  const m = await sharp(path.join(av, "avatar-a.png")).metadata();
  const k = m.width / 1254;
  await sharp(path.join(av, "avatar-a.png")).extract({ left: Math.round(190 * k), top: Math.round(40 * k), width: Math.round(874 * k), height: Math.round(1165 * k) })
    .resize(360, 480).webp({ quality: 80 }).toFile(path.join(out, "avatar-a.webp"));
  await log("avatar-a.webp");
  await sharp(path.join(av, "avatar-b.png")).resize(480, 480).webp({ quality: 80 }).toFile(path.join(out, "avatar-b.webp"));
  await log("avatar-b.webp");
}

// 5) segundo feedback de aluno (WhatsApp claro): corta a barra do celular e o cabeçalho com nome e foto
{
  const p = path.join(src, "social", "aluno-feedback-2.png");
  const m = await sharp(p).metadata();
  const k = m.width / 1170;
  const top = Math.round(328 * k);
  await sharp(p).extract({ left: 0, top, width: m.width, height: m.height - top }).resize({ width: 960 }).webp({ quality: 86 }).toFile(path.join(out, "prova-aluno-2.webp"));
  await log("prova-aluno-2.webp");
}
// 6) app da Kiwify, receita dos últimos 30 dias: corta a barra do celular e o menu de baixo
{
  const p = path.join(src, "originais", "kiwify-app.png");
  const m = await sharp(p).metadata();
  const k = m.width / 739;
  const top = Math.round(120 * k), bottom = Math.round(1445 * k);
  await sharp(p).extract({ left: 0, top, width: m.width, height: bottom - top }).resize({ width: 739, withoutEnlargement: true }).webp({ quality: 86 }).toFile(path.join(out, "kiwify-app.webp"));
  await log("kiwify-app.webp");
}
