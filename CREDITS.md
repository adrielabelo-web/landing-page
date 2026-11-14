# Créditos e licenças

## Na página publicada
| Item | Fonte | Licença |
|---|---|---|
| Fonte Exo 2 (400, 500, 600, 700, 800, 900, itálico 400) | @fontsource/exo-2 · github.com/googlefonts/Exo-2.0 | SIL Open Font License 1.1 (`fonts/LICENSE-Exo2-OFL.txt`) |
| Fonte Roboto Mono (500, 600, 700) | @fontsource/roboto-mono · github.com/googlefonts/robotomono | SIL Open Font License 1.1 (`fonts/LICENSE-RobotoMono-OFL.txt`) |
| Ilustrações (personagem, roteiro, produção, funil, fundo do CTA) | Imagens do autor | Do autor |
| Prints de resultados, páginas do ebook, foto e avatar do X | Enviados pelo autor; avatar de perfil borrado nos prints do Meta | Do autor |
| `skylab.css` | Design system da SkyLab IA Community | Do autor |

Nenhum código de terceiros roda na página:
- o carrossel usa CSS scroll-snap nativo + cerca de 60 linhas de JS próprio;
- o gráfico do simulador é SVG gerado por JS próprio;
- o lightbox usa o elemento `<dialog>` nativo.

## Só em desenvolvimento (`tools/`, não vai para o site)
| Ferramenta | Uso | Licença |
|---|---|---|
| sharp | Converter imagens para WebP | Apache-2.0 |
| playwright | Screenshots e checagens | Apache-2.0 |
| @axe-core/playwright | Teste de acessibilidade | MPL-2.0 |
| lighthouse | Auditoria de performance, a11y e SEO | Apache-2.0 |
| @fontsource/exo-2, @fontsource/roboto-mono | Origem dos arquivos de fonte | OFL-1.1 (fontes), MIT (pacote) |
