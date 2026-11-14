// Corta um screenshot full-page em fatias legíveis: node slice.mjs <arquivo> <altura>
import sharp from "sharp";
const [file, h = "1800"] = process.argv.slice(2);
const img = sharp(file);
const { width, height } = await img.metadata();
const step = parseInt(h, 10);
for (let y = 0, i = 0; y < height; y += step, i++) {
  await sharp(file).extract({ left: 0, top: y, width, height: Math.min(step, height - y) }).toFile(file.replace(/\.png$/, `-s${i}.png`));
}
console.log(Math.ceil(height / step), "fatias");
