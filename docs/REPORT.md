# Relatório · Revision Brief 3

## 1. Bugs

### a) Imagens em branco: a causa
O código estava certo. Servindo esta pasta por HTTP, exatamente como o GitHub Pages serve, deu **0 erros 404, 0 imagens quebradas e Exo 2 renderizando**. As caixas brancas e a fonte do sistema têm a mesma origem: **arquivos de `assets/` que não chegaram ao repositório**.

O upload pelo site do GitHub aceita no máximo 100 arquivos por envio, e a pasta tinha 113, sendo 80 só em `assets/img`. O que passou do limite ficou de fora. Imagens e fontes estavam na mesma pasta, por isso as duas quebraram juntas.

**Correções:**
- Só WebP, um arquivo por print: de 80 para **24 imagens**. **O site inteiro agora tem 62 arquivos** e cabe num envio.
- Saiu o `<picture>` com fontes AVIF/JPG. Cada `<img>` aponta para um único arquivo, que existe com certeza.
- A checagem agora roda por HTTP, registra todo 404 e falha se alguma imagem não renderizar.
- O espaço reservado do lightbox (`data:,`) aparecia como imagem quebrada no DevTools. Foi removido.

### b) Fontes
- 10 arquivos WOFF2 em **`/fonts`**:
  - Exo 2: 400, 500, 600, 700, 800, 900 e itálico 400;
  - Roboto Mono: 500, 600 e 700.
- Os `@font-face` levam `font-display: swap`. Os pesos 400 e 800 da Exo 2 são pré-carregados.
- Não há nenhum link para o Google Fonts: o `@import` do `skylab.css` é removido no build.

**Prova (CDP `CSS.getPlatformFontsForNode`, o mesmo dado de DevTools > Computed > Rendered Fonts), em 1440 px:**

| Elemento | Fonte renderizada |
|---|---|
| Título do hero | Exo 2 ExtraBold (web font) |
| Texto do hero | Exo 2 (web font) |
| Números do placar | Exo 2 Black (web font) |
| Etiquetas do placar | Roboto Mono SemiBold (web font) |
| Eyebrows | Roboto Mono SemiBold (web font) |
| Faturamento do simulador | Exo 2 Black (web font) |
| Perguntas do FAQ | Exo 2 SemiBold (web font) |

Os números em mono que você viu eram de propósito no brief original. Agora o placar usa Exo 2 900.

### c) Páginas do ebook
Todas as ocorrências viraram "+ de 70 páginas". A busca por "66 páginas" no HTML, CSS, JS e COPY dá 0.

**Atenção:** a imagem do sumário, na amostra do ebook, ainda mostra "02 / 66" no rodapé quando ampliada.

### d) e e) Oferta
- O contador virou pílula de status com o ponto vermelho, logo abaixo do texto.
- Os dois cards começam na mesma altura no desktop, por exemplo os dois em y=7926 px a 1440. A comunidade continua mais forte: glow, borda azul e mais padding.
- No mobile, a comunidade vem primeiro.

## 2. Placar 3D
- "+ DE 6,4 MI · EM VISUALIZAÇÕES", "+ DE 60 MIL · SEGUIDORES NOVOS", "+ DE R$ 2,7 MIL · FATURADOS COM EBOOK".
- Números em Exo 2 900, de 73 px (360) a 102 px (1440).
- O tamanho vem de container query, `clamp(48px, 25cqi, 112px)`. Usei `cqi` no lugar de `vw` porque com `9vw` o "R$ 2,7 MIL" quebraria em 3 colunas. **Nenhum número quebra em nenhuma largura.**
- Extrusão com 7 camadas de `text-shadow` em #275591 até um navy escuro, brilho fino no topo e glow azul atrás.
- O card inclina até 6° seguindo o mouse. Fica parado no toque e com reduced motion.
- A contagem vai de 0 ao valor final em 1,2 s quando o placar aparece. Os valores finais já estão no HTML: sem JS ou com reduced motion, a página aparece completa. Se você passar direto por ele, pela rolagem ou por um link de âncora, o valor final aparece sem animação.

## 3. Carrossel de prints
**Escolha:** CSS scroll-snap nativo + cerca de 60 linhas de JS próprio, sem o Embla.

O scroll-snap já entrega no navegador o swipe com inércia, o snap e a acessibilidade de rolagem. Faltavam só três coisas:
- arrastar com o mouse;
- as setas;
- o contador.

Isso cabe em poucas linhas. O Embla (MIT) resolveria o mesmo com cerca de 7 KB a mais e um arquivo a mais para subir.

**Resultado:**

| Largura | Comportamento |
|---|---|
| Desktop e tablet | 2 prints lado a lado |
| Mobile | 1 print a 85% da largura, com o próximo aparecendo na borda |

- Altura fixa por card, com `object-fit: contain` sobre `--surface-100`, para a fileira não pular.
- Contador "1 / 10", setas de 48 px que desabilitam nas pontas e setas do teclado com o carrossel em foco.
- Arrastar com o mouse foi testado: de 0 a 568 px, o contador foi para 2, e o arraste **não** abriu o lightbox.
- Lightbox:
  - setas na tela e no teclado ("3 / 10" para "4 / 10");
  - Esc fecha e o foco volta para o print.
- Ordem: Kiwify (painel, notificações), views e seguidores, depois os comparativos.

## 4. Simulador
O cálculo fica em `sim.js`, numa função pura `calc()`. Ela foi rodada em Node:

```
calc({ views: 1000000, ctr: 0.2, conv: 2.5, price: 19.9 })
→ { clicks: 2000, sales: 50, perDay: 1.67, revenue: 995 }
```

**Testado no navegador:**

| Ação | Cliques | Vendas/mês | Vendas/dia | Faturamento/mês |
|---|---|---|---|---|
| Valores padrão | 2.000 | 50 | 1,7 | R$ 995,00 |
| Digitar 2.000.000 views | 4.000 | 100 | 3,3 | R$ 1.990,00 |
| Chip 49,90 | 4.000 | 100 | 3,3 | R$ 4.990,00 |
| Digitar 120 no preço | 4.000 | 100 | 3,3 | R$ 4.990,00 |
| Seta → no slider de clique | 5.000 | 125 | 4,2 | R$ 6.237,50 |

- Ao digitar 120, o preço é limitado a R$ 49,90 e aparece a mensagem "Até R$ 49,90 para manter o produto de entrada."
- Com a seta, o campo de clique acompanha o slider e mostra 0,25.

**Interface:**
- Sliders nativos (`input type=range`), com polegar de 28 px e área de toque de 48 px. Cada um tem um campo de texto sincronizado, que aceita vírgula ou ponto.
- O gráfico SVG mostra os 30 dias acumulados, com o dia de hoje em destaque.
- Os números animam em 300 ms, e na hora com reduced motion.
- O painel inclina até 5° no desktop. O aviso fica sempre visível.
- Botões `sim-community` e `sim-ebook`.
- No mobile, a barra fixa se esconde enquanto o simulador está na tela.

## 5. Checagens finais
| Teste | Resultado |
|---|---|
| Scroll horizontal (360, 390, 430, 768, 1024, 1280, 1440, 1920) | 0 |
| 404 / erros no console / imagens quebradas | 0 / 0 / 0 |
| axe WCAG 2.1 AA (390 e 1440) | 0 violações |
| "SKY-", "CLIPE", "66 páginas", "call gravada", "—", "–" | 0 |
| Os 10 botões com o checkout certo e UTMs | ok |
| Lighthouse mobile | **94** · 100 · 100 · 100 |

**Screenshots** (pasta de trabalho, `Landing/reference/screens/final2/`):
- `proof-*.png` e `sim-*.png` em 360, 390, 768, 1024, 1440 e 1920;
- `offer-*.png`, `full-*.png` e `lightbox-1440.png`.

## Pendências (as mesmas de antes)
- **REVIEW:** frases do método, "isso pode pagar bem" e tempo por vídeo no FAQ.
- **CONFIRM:** duração do acesso do fundador, links de privacidade e termos, URL absoluta do og:image, IDs do GTM e do Pixel.
- **Prints do X** para o bloco "ONDE TUDO COMEÇOU", que continua marcado no HTML.
