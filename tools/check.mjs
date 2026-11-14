// Checagens da LP servida por HTTP (igual ao GitHub Pages):
// 404, imagens, fontes renderizadas, scroll horizontal, axe, carrossel, simulador, lightbox, CTAs, termos proibidos.
// Uso: ROOT=<pasta do site> node check.mjs <tag>
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import http from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const tools = path.dirname(fileURLToPath(import.meta.url));
const root = process.env.ROOT ? path.resolve(process.env.ROOT) : path.resolve(tools, "..");
const tag = process.argv[2] || "v1";
const shots = path.join(tools, "..", "reference", "screens", tag);
await mkdir(shots, { recursive: true });

const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".woff2": "font/woff2" };
const server = http.createServer(async (req, res) => {
  const p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const file = path.join(root, p === "/" ? "index.html" : p);
  try { const b = await readFile(file); res.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream" }); res.end(b); }
  catch { res.writeHead(404).end(); }
}).listen(4181);
const url = "http://localhost:4181/";

const widths = [360, 390, 430, 768, 1024, 1280, 1440, 1920];
const browser = await chromium.launch();
const report = { root, http404: [], consoleErrors: [], widths: {}, axe: {}, banned: {} };

async function loadAll(page) {
  await page.evaluate(async () => {
    document.querySelectorAll("img[loading=lazy]").forEach(i => { i.loading = "eager"; });
    await Promise.all([...document.images].filter(i => i.getAttribute("src")).map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
    await document.fonts.ready;
    for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); }
    // para no placar como um visitante faria, espera a contagem terminar
    const sc = document.querySelector(".score"); if (sc) { sc.scrollIntoView({ block: "center" }); await new Promise(r => setTimeout(r, 1600)); }
    window.scrollTo(0, 0);
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("is-in"));
    await new Promise(r => setTimeout(r, 300));
  });
}

for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 768 ? 844 : 900 } });
  const page = await ctx.newPage();
  page.on("response", r => { if (r.status() >= 400) report.http404.push(`${w}px ${r.status()} ${r.url()}`); });
  page.on("console", m => { if (m.type() === "error") report.consoleErrors.push(`${w}px ${m.text()}`); });
  page.on("pageerror", e => report.consoleErrors.push(`${w}px ${e.message}`));
  await page.goto(url, { waitUntil: "networkidle" });
  await loadAll(page);
  report.widths[w] = await page.evaluate(() => {
    const iw = window.innerWidth;
    const over = [...document.querySelectorAll("body *")].filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && (r.right > iw + 1 || r.left < -1) && !el.closest(".hero__art, .final__bg, .sticky-cta, .gallery > li, .carousel__slide, .lightbox, .portrait");
    }).slice(0, 6).map(el => el.tagName.toLowerCase() + "." + [...el.classList].join("."));
    const broken = [...document.images].filter(i => i.getAttribute("src") && !i.naturalWidth).map(i => i.getAttribute("src"));
    const score = [...document.querySelectorAll(".score__line")].map(l => ({ text: l.textContent, lines: Math.round(l.getBoundingClientRect().height / parseFloat(getComputedStyle(l).fontSize) / 0.9), fits: l.scrollWidth <= l.parentElement.closest(".score__item").clientWidth, size: getComputedStyle(l).fontSize }));
    const track = document.querySelector("[data-car-track]");
    const tr = track.getBoundingClientRect();
    const slidesVisible = [...track.children].map(s => s.getBoundingClientRect()).filter(r => r.left >= tr.left - 1 && r.right <= tr.right + 1).length;
    const peek = [...track.children].some(s => { const r = s.getBoundingClientRect(); return r.left < iw && r.right > iw; });
    const shotH = [...track.querySelectorAll(".shot")].map(s => Math.round(s.getBoundingClientRect().height));
    const offers = [...document.querySelectorAll(".offers > .sk-offer")].map(o => { const r = o.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top + scrollY), Math.round(r.width)]; });
    return { scrollWidth: document.documentElement.scrollWidth, innerWidth: iw, overflowing: over, broken, score, carousel: { slidesVisible, peek, shotHeights: [...new Set(shotH)] }, offers };
  });
  await page.screenshot({ path: path.join(shots, `full-${w}.png`), fullPage: true });
  for (const [id, name] of [["numeros", "proof"], ["simulador", "sim"], ["oferta", "offer"]]) {
    await page.locator("#" + id).screenshot({ path: path.join(shots, `${name}-${w}.png`) });
  }
  if (w === 390 || w === 1440) {
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    report.axe[w] = r.violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length, sample: v.nodes.slice(0, 3).map(n => n.target.join(" ")) }));
  }
  if (w === 1440) {
    // fontes realmente renderizadas (o mesmo dado de DevTools > Computed > Rendered Fonts)
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("DOM.enable"); await cdp.send("CSS.enable");
    const doc = await cdp.send("DOM.getDocument", { depth: -1 });
    report.renderedFonts = {};
    for (const sel of [".hero__title", ".hero__lead", ".score__line", ".score__label", ".sk-eyebrow", ".sim__rev-val", ".sk-faq summary"]) {
      const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: doc.root.nodeId, selector: sel });
      const f = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
      report.renderedFonts[sel] = f.fonts.map(x => `${x.familyName} (${x.isCustomFont ? "web font" : "SISTEMA"})`).join(", ");
    }
    // carrossel: arrastar com o mouse
    await page.locator("#numeros .carousel").scrollIntoViewIfNeeded();
    const track = page.locator("[data-car-track]");
    const box = await track.boundingBox();
    const before = await track.evaluate(t => t.scrollLeft);
    await page.mouse.move(box.x + box.width * 0.7, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2, { steps: 12 });
    await page.mouse.up();
    await page.waitForTimeout(900);
    const after = await track.evaluate(t => t.scrollLeft);
    const counter = await page.locator("[data-car-index]").textContent();
    const lbOpenAfterDrag = await page.evaluate(() => document.getElementById("lightbox").open);
    await page.click("[data-car-next]"); await page.waitForTimeout(700);
    const counterNext = await page.locator("[data-car-index]").textContent();
    report.carouselDrag = { before, after, counter, counterNext, lightboxOpenedByDrag: lbOpenAfterDrag };
    // lightbox com setas
    await page.locator("[data-car-track] .shot").nth(Number(counterNext) - 1).click();
    await page.waitForTimeout(300);
    const lb1 = await page.evaluate(() => ({ open: document.getElementById("lightbox").open, count: document.getElementById("lightbox-count").textContent, focus: document.activeElement.className }));
    await page.keyboard.press("ArrowRight"); await page.waitForTimeout(150);
    const lb2 = await page.evaluate(() => document.getElementById("lightbox-count").textContent);
    await page.screenshot({ path: path.join(shots, "lightbox-1440.png") });
    await page.keyboard.press("Escape"); await page.waitForTimeout(200);
    report.lightbox = { lb1, afterArrow: lb2, closed: !(await page.evaluate(() => document.getElementById("lightbox").open)), focusBack: await page.evaluate(() => document.activeElement.className) };
    // simulador
    await page.locator("#simulador").scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const out = () => page.evaluate(() => Object.fromEntries([...document.querySelectorAll("[data-sim-out]")].map(e => [e.dataset.simOut, e.textContent])));
    const sim = { defaults: await out() };
    await page.fill("#sim-views", "2000000"); await page.waitForTimeout(450);
    sim.typedViews2M = await out();
    await page.click('[data-sim-chip="49.9"]'); await page.waitForTimeout(450);
    sim.chip49 = await out();
    await page.fill("#sim-price", "120"); await page.waitForTimeout(450);
    sim.price120 = { out: await out(), msg: await page.locator("[data-sim-price-msg]").textContent(), shown: await page.locator('[data-sim-show="price"]').textContent() };
    await page.locator("#sim-ctr-range").focus(); await page.keyboard.press("ArrowRight"); await page.waitForTimeout(450);
    sim.sliderKeyboard = { ctrField: await page.inputValue("#sim-ctr"), out: await out() };
    sim.bars = await page.locator("[data-sim-chart] rect").count();
    report.sim = sim;
  }
  if (w === 390) {
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300);
    const s0 = await page.evaluate(() => document.querySelector("[data-sticky]").classList.contains("is-on"));
    await page.evaluate(() => window.scrollTo(0, document.getElementById("metodo").offsetTop)); await page.waitForTimeout(400);
    const s1 = await page.evaluate(() => document.querySelector("[data-sticky]").classList.contains("is-on"));
    const hrefs = await page.evaluate(() => [...document.querySelectorAll("[data-cta]")].map(a => a.dataset.cta + " " + a.href));
    report.sticky = { atTop: s0, afterHero: s1, hrefs };
  }
  await ctx.close();
}

// reduced motion: tudo estático e valores finais
const rm = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
await rm.goto(url, { waitUntil: "networkidle" });
await rm.waitForTimeout(1500);
report.reducedMotion = await rm.evaluate(() => ({
  timecode: document.querySelector("[data-timecode]").textContent,
  pulse: getComputedStyle(document.querySelector(".sk-dot.pulse")).animationName,
  score: [...document.querySelectorAll("[data-count]")].map(e => e.textContent),
  tilt: getComputedStyle(document.querySelector(".score__item")).transform,
}));
await rm.goto(url + "?utm_source=x&src=bio", { waitUntil: "networkidle" });
report.utm = await rm.evaluate(() => [...document.querySelectorAll("[data-cta]")].map(a => a.dataset.cta + " " + a.href));
await browser.close();
server.close();

const banned = { "SKY-": /SKY-/g, "CLIPE": /CLIPE/g, "66 páginas": /66 p[aá]ginas/gi, "call gravada": /call gravada/gi, "anúncio/orgânico": /quase sem an[uú]ncio|org[aâ]nic|from ads|tempo todo/gi, "— –": /[—–]/g };
for (const f of ["index.html", "docs/COPY.md", "styles.css", "main.js", "sim.js", "site.css"]) {
  let t = ""; try { t = await readFile(path.join(root, f), "utf8"); } catch { report.banned[f] = "arquivo não encontrado"; continue; }
  report.banned[f] = Object.fromEntries(Object.entries(banned).map(([k, re]) => [k, (t.match(re) || []).length]));
}

await writeFile(path.join(shots, "report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 1));
