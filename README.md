# Personagem que Vende · SkyLab IA Community

Landing page de venda do ebook **Personagem que Vende** e da edição de fundação da **SkyLab IA Community**.

HTML, CSS e JavaScript puros: sem framework e sem dependência externa. As fontes ficam no próprio site. Abre com duplo clique no `index.html` e publica em qualquer hospedagem estática (GitHub Pages, Netlify, Vercel, Hostinger).

## Estrutura (73 arquivos, cabe num upload só)

```
index.html        página
privacidade.html  política de privacidade
termos.html       termos de uso
CNAME             domínio skylabcommunity.com.br (tem que ir em todo upload)
site.css          CSS final carregado pela página (gerado; ver "Editar o visual")
skylab.css        design system da marca (fonte)
styles.css        estilos próprios da landing (fonte)
main.js           checkouts, contador, placar, carrossel, lightbox, barra fixa
sim.js            simulador de vendas (função pura calc() + interface)
fonts/            Exo 2 (400 a 900 + itálico) e Roboto Mono (500 a 700), WOFF2, licença OFL
assets/
  img/            30 imagens WebP (ilustrações, prints, provas sociais, páginas do ebook, foto)
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

**Domínio:** `skylabcommunity.com.br`. O arquivo `CNAME` guarda esse endereço e precisa ir em todo upload. Na Hostinger, o registro DNS é 4 registros A `@` (185.199.108.153, .109.153, .110.153, .111.153) e CNAME `www` → `adrielabelo-web.github.io`.

## O que trocar com frequência

No topo do `main.js`:

```js
var COMMUNITY_URL = "https://pay.kiwify.com.br/1VOMmqt"; // comunidade + ebook, R$ 97
var EBOOK_URL     = "https://pay.kiwify.com.br/6oCzApc"; // só o ebook, R$ 19,90
var DEADLINE      = new Date("2026-11-30T23:59:59-03:00"); // fim da edição de fundação
```

- Cada botão escolhe o link pelo final do `data-cta`: `-community` ou `-ebook`. As UTMs (`utm_*`, `src`, `sck`) são repassadas.
- Os limites e valores padrão do simulador ficam no topo do `sim.js` (`LIMITS`).

**Tracking:** o Meta Pixel `1687925566262146` está ativo no `<head>` do `index.html` (PageView). Cada clique de checkout envia `InitiateCheckout` ao Pixel, com valor e BRL, e `begin_checkout` ao `dataLayer`. GTM e GA4 seguem comentados.

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
- Um e-mail de contato para as páginas `privacidade.html` e `termos.html` (hoje o contato é por DM no Instagram e no X)
- ID do GTM (se for usar)
- Frases com `<!-- REVIEW -->` e `<!-- CONFIRM -->` (lista em `docs/REPORT.md`)
