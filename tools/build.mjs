// Gera ROOT/site.css = @font-face locais + skylab.css (sem o @import do Google) + styles.css, minificado.
// Copia as fontes WOFF2 (Fontsource, OFL) para ROOT/fonts.
// skylab.css e styles.css continuam sendo as fontes; edite neles e rode `npm run build`.
import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const tools = path.dirname(fileURLToPath(import.meta.url));
const root = process.env.ROOT ? path.resolve(process.env.ROOT) : path.resolve(tools, "..");
const fontsDir = path.join(root, "fonts");
await mkdir(fontsDir, { recursive: true });

const RANGE = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
const fonts = [
  // [família, pacote, peso, estilo]
  ...[400, 500, 600, 700, 800, 900].map(w => ["Exo 2", "exo-2", w, "normal"]),
  ["Exo 2", "exo-2", 400, "italic"],
  ...[500, 600, 700].map(w => ["Roboto Mono", "roboto-mono", w, "normal"]),
];
let faces = "";
for (const [family, pkg, w, style] of fonts) {
  const file = `${pkg}-latin-${w}-${style}.woff2`;
  await copyFile(path.join(tools, "node_modules", "@fontsource", pkg, "files", file), path.join(fontsDir, file));
  faces += `@font-face{font-family:"${family}";font-style:${style};font-weight:${w};font-display:swap;src:url(fonts/${file}) format("woff2");unicode-range:${RANGE}}\n`;
}
await copyFile(path.join(tools, "node_modules", "@fontsource", "exo-2", "LICENSE"), path.join(fontsDir, "LICENSE-Exo2-OFL.txt"));
await copyFile(path.join(tools, "node_modules", "@fontsource", "roboto-mono", "LICENSE"), path.join(fontsDir, "LICENSE-RobotoMono-OFL.txt"));

const skylab = (await readFile(path.join(root, "skylab.css"), "utf8")).replace(/@import\s+url\((["']?)[^)]*?\1\)[^;]*;/g, "");
if (skylab.includes("@import")) throw new Error("@import não removido de skylab.css");
// o FAQ do skylab.css desenha um traço (U+2013) no item aberto; no bundle vira sinal de menos (U+2212)
const skylabClean = skylab.replace(/–/g, "\\2212");
const styles = await readFile(path.join(root, "styles.css"), "utf8");
const min = (css) => css
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\s+/g, " ")
  .replace(/\s*([{};,>])\s*/g, "$1")
  .replace(/;}/g, "}")
  .trim();

const out = "/* gerado por tools/build.mjs, não edite: edite skylab.css e styles.css */\n" + faces + min(skylabClean) + "\n" + min(styles) + "\n";
await writeFile(path.join(root, "site.css"), out);
console.log("site.css", (Buffer.byteLength(out) / 1024).toFixed(1), "KB ·", fonts.length, "fontes em", fontsDir);
