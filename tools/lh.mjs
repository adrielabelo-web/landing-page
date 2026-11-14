// Lighthouse mobile via servidor estático local + Chromium do Playwright.
import http from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const root = process.env.ROOT ? path.resolve(process.env.ROOT) : path.resolve(toolsDir, "..");
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif", ".woff2": "font/woff2" };
const server = http.createServer(async (req, res) => {
  const p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const file = path.join(root, p === "/" ? "index.html" : p);
  if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
  try {
    const body = await readFile(file);
    res.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream", "cache-control": "max-age=31536000" });
    res.end(body);
  } catch { res.writeHead(404).end(); }
}).listen(4173);

const chrome = await chromeLauncher.launch({ chromePath: chromium.executablePath(), chromeFlags: ["--headless=new"] });
const r = await lighthouse("http://localhost:4173/", { port: chrome.port, output: "html", onlyCategories: ["performance", "accessibility", "best-practices", "seo"] });
await writeFile(path.join(toolsDir, "..", "reference", "lighthouse-mobile.html"), r.report);
const out = Object.fromEntries(Object.entries(r.lhr.categories).map(([k, v]) => [k, Math.round(v.score * 100)]));
const fails = Object.values(r.lhr.audits).filter(a => a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== "informative" && a.scoreDisplayMode !== "notApplicable").map(a => `${a.id}: ${a.displayValue || a.score}`);
console.log(out, { LCP: r.lhr.audits["largest-contentful-paint"].displayValue, CLS: r.lhr.audits["cumulative-layout-shift"].displayValue }, fails);
await chrome.kill();
server.close();
