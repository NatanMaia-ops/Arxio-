# Comentários — como funciona hoje e o que vamos mudar

Anotações de referência para o vídeo. Linguagem simples, sem termo técnico sem explicação.

## Como funciona hoje

Cada comentário guarda o id do comentário que ele está respondendo. A gente chama esse campo de "comentário pai". Se o comentário não é resposta de nada (é um comentário novo, direto no artigo), esse campo fica vazio.

O problema: **não existe limite** pra quantas vezes isso pode se repetir. Um comentário pode responder outro, que responde outro, que responde outro... sem fim. Isso é o que chamamos de "árvore ilimitada".

A lista de comentários que o servidor devolve é simples, sem organização nenhuma — quem organiza isso visualmente (quem respondeu quem, com a indentação certinha) é o próprio navegador do usuário, não o servidor.

Ver código de hoje e o que propomos mudar → [antes-e-depois-banco-de-dados.md](./antes-e-depois-banco-de-dados.md)

### Bugs que isso já causou

- Precisamos adicionar uma proteção pra evitar que a organização da árvore entrasse em loop infinito, caso um dado viesse corrompido.
- A indentação visual (o espaço que empurra a resposta pra direita a cada nível) ficava acumulando de forma errada. Corrigido, mas o problema de raiz — árvore sem limite — continua lá.

## Por que isso é um problema (e por que não dá pra ser "instantâneo")

Quanto mais comentários um artigo tem, mais tempo o site leva pra organizar tudo antes de mostrar na tela. A pergunta é: esse tempo cresce numa velocidade razoável (proporcional à quantidade de comentários), ou fica cada vez pior conforme mais gente comenta?

| O que o site faz | O tempo que isso leva | Dá pra melhorar? |
|---|---|---|
| Achar 1 comentário específico | Cresce bem devagar, quase não importa quantos comentários existem | Já está no ponto ideal |
| Listar todos os comentários de um artigo | Cresce na mesma proporção da quantidade de comentários | Já está no ponto ideal — pra mostrar 100 comentários, precisa ler os 100 |
| Organizar tudo em árvore (quem respondeu quem) | Normalmente cresce na mesma proporção dos comentários... | ...mas numa discussão muito longa e "em cadeia" (A responde o post, B responde A, C responde B...), pode ficar bem mais lento do que devia |

Não existe forma de deixar isso instantâneo — pra mostrar N comentários, o site sempre vai precisar ler cada um deles ao menos uma vez. Mas dá pra evitar o cenário de "fica bem mais lento do que devia", guardando resultados já calculados em vez de recalcular tudo de novo a cada comentário.

## O que vamos mudar

Vamos limitar em **2 níveis**, do jeito que Instagram, Facebook e Twitter já fazem: só existe "comentário" e "resposta". Se alguém responder uma resposta, essa resposta nova **não vira um terceiro nível** — ela entra junto com as outras respostas do comentário original, e o site escreve o nome de quem ela está respondendo no início do texto (tipo "@fulano, concordo...").

Por que isso resolve o problema:
- Os dois bugs que já tivemos deixam de poder acontecer, porque não existe mais "resposta de resposta de resposta" pra dar errado.
- Fica mais fácil de entender pra quem tá lendo — igual às redes sociais que a gente já usa todo dia.
- O código fica mais simples dos dois lados (servidor e site).

Os comentários que já existem estão só em ambiente de desenvolvimento e podem ser apagados — então não precisamos escrever nada pra "converter" comentário antigo pro formato novo.

### O que muda em cada parte

- Banco de dados (onde os comentários ficam guardados) → [antes-e-depois-banco-de-dados.md](./antes-e-depois-banco-de-dados.md)
- Servidor (a regra que decide onde uma resposta nova é encaixada) → [antes-e-depois-servidor.md](./antes-e-depois-servidor.md)
- Site — organização da lista (como os comentários são agrupados pra exibir) → [antes-e-depois-site-organizacao.md](./antes-e-depois-site-organizacao.md)
- Site — visual (como cada comentário aparece na tela) → [antes-e-depois-site-visual.md](./antes-e-depois-site-visual.md)
