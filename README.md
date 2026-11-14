# Personagem que Vende · SkyLab IA Community

Landing page de venda do ebook **Personagem que Vende** e da edição de fundação da **SkyLab IA Community**.

HTML, CSS e JavaScript puros: sem framework e sem dependência externa. As fontes ficam no próprio site. Abre com duplo clique no `index.html` e publica em qualquer hospedagem estática (GitHub Pages, Netlify, Vercel, Hostinger).

## Estrutura (62 arquivos, cabe num upload só)

```
index.html        página
site.css          CSS final carregado pela página (gerado; ver "Editar o visual")
skylab.css        design system da marca (fonte)
styles.css        estilos próprios da landing (fonte)
main.js           checkouts, contador, placar, carrossel, lightbox, barra fixa
sim.js            simulador de vendas (função pura calc() + interface)
fonts/            Exo 2 (400 a 900 + itálico) e Roboto Mono (500 a 700), WOFF2, licença OFL
assets/
  img/            24 imagens WebP (ilustrações, prints, páginas do ebook, foto)
  favicon.svg, apple-touch-icon.png, og-image.png
docs/             COPY.md (texto), REPORT.md (decisões e checagens), auditoria antiga
tools/            scripts de desenvolvimento (Node), fora do site
CREDITS.md        licenças
```

## Subir para o GitHub
Suba **o conteúdo desta pasta inteira**, mantendo as pastas `fonts/` e `assets/img/`. Se algum arquivo dessas pastas faltar no repositório, a página mostra caixa branca no lugar da imagem e fonte do sistema no lugar da Exo 2.

Para conferir depois de publicar, abra estes dois endereços. Os dois precisam carregar:
- `https://SEU-USUARIO.github.io/REPO/fonts/exo-2-latin-800-normal.woff2`
- `https://SEU-USUARIO.github.io/REPO/assets/img/kiwify-painel.webp`

No GitHub Pages: **Settings › Pages** › *Deploy from a branch* › `main` › `/ (root)`.

## O que trocar com frequência

No topo do `main.js`:

```js
var COMMUNITY_URL = "https://pay.kiwify.com.br/1VOMmqt"; // comunidade + ebook, R$ 97
var EBOOK_URL     = "https://pay.kiwify.com.br/6oCzApc"; // só o ebook, R$ 19,90
var DEADLINE      = new Date("2026-11-30T23:59:59-03:00"); // fim da edição de fundação
```

- Cada botão escolhe o link pelo final do `data-cta`: `-community` ou `-ebook`. As UTMs (`utm_*`, `src`, `sck`) são repassadas.
- Os limites e valores padrão do simulador ficam no topo do `sim.js` (`LIMITS`).

**Tracking:** há blocos comentados de GTM, Meta Pixel e GA4 no `<head>` do `index.html`. Cada clique envia `begin_checkout` ao `dataLayer`.

## Editar o visual

`site.css` é gerado a partir de `skylab.css` + `styles.css`, junto com as fontes. Depois de editar um deles:

```
cd tools
npm install
npm run build
```

Outros scripts:
- `npm run check`: servidor HTTP local, 8 larguras, 404, fontes renderizadas, axe, carrossel, simulador, termos proibidos;
- `npm run lighthouse`;
- `npm run og`.

## Antes de divulgar
- Links de **Política de privacidade** e **Termos de uso** no rodapé (hoje `[CONFIRMAR LINK]`)
- URL absoluta do `og:image` e do `twitter:image`
- IDs do GTM e do Pixel
- Frases com `<!-- REVIEW -->` e `<!-- CONFIRM -->` (lista em `docs/REPORT.md`)
