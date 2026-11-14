# Auditoria de originalidade

Fiz duas rodadas. Os screenshots estão em `reference/screens/` (v1, v2, v3 e final). O comparativo com o mockup está em `reference/comparativo-v3.png` e `reference/comparativo-final.png`.

## Rodada 1 (screens v1/v2)

| Pergunta | Resposta | O que fiz |
|---|---|---|
| Sem o nome, o hero serviria para qualquer SaaS ou curso? | **Não.** O quadro 9:16 empilhado com o REC SKY-01A pulsando e o timecode contando de 00:00 a 00:08 só faz sentido para um produto de vídeo curto. A grade de mesa de edição reforça isso. | Nada |
| Alguma seção é padrão de estoque sem motivo? | **Em parte.** Os números saem em 3 cards, que é um padrão comum. Ficaram porque cada card leva fonte e período, que o brief exige, e a fila secundária quebra a simetria. Não usei carrossel de depoimentos, tabela de 3 planos, blob de gradiente nem cards com borda colorida à esquerda. | O problema virou um "log de clipes", e não 3 cards de ícone |
| Os elementos de assinatura fazem trabalho real? | **Sim, com uma ressalva.** A timeline mostra um capítulo por quadro e reage ao mouse ou toque na lista. O prompt copia de verdade. As legendas mono carregam a fonte dos números. Os códigos SKY-0XX substituem "01 / 02". Ressalva: o quadro do hero ainda é decoração até a VSL existir. | Fica registrado como fraqueza |
| A página parece do mesmo mundo da referência? Onde ela se afasta? | **Sim**, na paleta, na grade, no glow, nas ilustrações e no card de perfil. Desvio 1: as etiquetas SKY-0XX saíam em 19px, porque o `skylab.css` aplica 19px a todo `p` do cabeçalho, enquanto no mockup são etiquetas pequenas. Desvio 2: o quadro do hero estava chapado, e o da referência tem volume. | Corrigi os dois na rodada 2 |
| Todo número tem fonte e data? | **Quase.** Os números do Meta e da Kiwify têm fonte e período. Os do **ManyChat** (66%, 33.705 DMs) têm fonte, mas ainda **não têm período**: está visível como `[CONFIRMAR PERÍODO]`. | Pendente com você |
| Alguma linha soa genérica ou como texto de IA? | **Sim, duas.** (1) "O vídeo não tem um personagem fixo, não tem uma história e não leva a lugar nenhum." é uma tríade retórica. (2) "Tudo que eu uso, num pagamento de fundador" é um slogan genérico. | (1) virou "Falta um personagem que se repete e um caminho do vídeo até a venda." (2) virou "O que entra na edição de fundação". |
| Há travessão (— ou –)? | **Não** no texto. Havia um "–" desenhado pelo `skylab.css` no FAQ aberto. | Troquei pelo sinal de menos (U+2212) no `styles.css` |
| O azul passa de 10% em alguma tela? | **Não.** A tela com mais azul é o hero no mobile: o quadro mais o botão ocupam cerca de 10% a 12% do viewport, no limite. O resto fica bem abaixo. | Nada |

## Rodada 2 (screens v3 e final)
- Etiquetas de clipe voltaram a 12px mono, iguais ao mockup.
- O quadro do hero ganhou gradiente de luz feito só com tokens (`--brand-text` › `--brand` › `--brand-deep`).
- As colunas da esquerda ficam fixas no desktop (problema, amostra, comunidade, FAQ), o que acaba com o vazio ao lado das listas longas.
- A nota do hero não quebra mais no meio de um item (antes saía "GARANTIA DE 7 / DIAS").
- Releitura das perguntas: nada novo no nível de "sim". Zero travessões. Azul dentro do limite.

## 3 coisas que tornam esta página diferente de outras de curso de IA
1. **A página inteira se comporta como uma mesa de edição.** Seções são clipes (SKY-01A…SKY-10J), a dor aparece como log de clipes com timecode e o ebook vira uma linha do tempo de quadros 9:16.
2. **Prova honesta e verificável.** Os números são exatos, cada um com fonte e período em mono, e há o aviso "não são garantia". Não há depoimento inventado nem contador falso. A escassez é real e vira "encerrada" sozinha depois de 30/11.
3. **Ela entrega um pedaço do produto.** O mapa da história do capítulo 05 está na página, com o botão de copiar funcionando.

## 3 partes mais fracas que ainda vejo
1. **O quadro do hero ainda está vazio.** Sem a VSL ou um loop do personagem, ele é só símbolo. É o maior ganho pendente.
2. **Não há prints reais nem depoimentos.** Os números sustentam a página, mas um print da Kiwify com a data visível valeria mais que o card. O slot já está pronto no HTML.
3. **O FAQ tem dois `[CONFIRMAR]` sem resposta** (custo das ferramentas e tempo por dia). São justamente as objeções mais comuns de quem compra.
