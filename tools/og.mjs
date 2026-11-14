// Gera assets/og-image.png (1200x630) e assets/apple-touch-icon.png (180x180) no estilo da marca.
import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
import { writeFile, unlink } from "node:fs/promises";
// usa site.css (fontes locais); o HTML temporário fica na raiz para os caminhos relativos funcionarem
const css = "site.css";

const og = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${css}">
<style>
  html,body{margin:0;width:1200px;height:630px}
  body{display:grid;grid-template-columns:1fr 360px;align-items:center;padding:0 80px;box-sizing:border-box;font-family:var(--font-display);color:var(--ink)}
  h1{margin:24px 0 20px;font-size:92px;line-height:.92;font-weight:800;text-transform:uppercase}
  h1 span{display:block;color:var(--brand)}
  p{margin:0;font-size:26px;color:var(--ink-soft);max-width:22ch;line-height:1.35}
  .tag{font-family:var(--font-mono);font-size:18px;letter-spacing:.14em;color:var(--brand-text)}
  .sk-stack{width:200px;margin:0 auto 0 30px}
</style></head><body class="sk-grid">
  <div><div class="tag">SKYLAB IA COMMUNITY · EDIÇÃO DE FUNDAÇÃO</div>
  <h1>Personagem que <span>vende</span></h1>
  <p>Vídeos com IA com personagem fixo, do primeiro clipe à venda.</p></div>
  <div class="sk-stack"><div class="sk-frame sk-frame--back"></div><div class="sk-frame sk-frame--mid"></div>
  <div class="sk-frame sk-frame--front"><span class="sk-tc sk-tc--top"><span class="sk-dot rec"></span>REC</span><span class="sk-play"></span><span class="sk-tc sk-tc--bottom">00:08</span></div></div>
</body></html>`;

const icon = `<!doctype html><html><body style="margin:0;width:180px;height:180px;background:#0E1A2B">
<img src="${pathToFileURL(path.join(root, "assets", "favicon.svg")).href}" width="180" height="180"></body></html>`;

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1200, height: 630 } });
const tmp = path.join(root, "_og-temp.html");
await writeFile(tmp, og);
await p.goto(pathToFileURL(tmp).href, { waitUntil: "networkidle" });
await unlink(tmp);
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: path.join(root, "assets", "og-image.png") });
await browser.close();
// ícone do iPhone direto do SVG
const sharp = (await import("sharp")).default;
await sharp(path.join(root, "assets", "favicon.svg"), { density: 300 }).resize(180, 180).flatten({ background: "#0E1A2B" }).png().toFile(path.join(root, "assets", "apple-touch-icon.png"));
console.log("ok");
