---
title: "FSRS vs. o Algoritmo Antigo do Anki: Qual é a Diferença?"
excerpt: "O FSRS prevê a memória com 19 parâmetros personalizados em vez de regras fixas — reduzindo o tempo de revisão em 20-30% e mantendo a retenção alta. Veja como funciona."
date: "2026-10-10"
image: "/blog/what-is-fsrs-and-why-it-beats-the-old-anki-algorithm/cover.jpg"
---

O FSRS (Free Spaced Repetition Scheduler) é um algoritmo de modelagem de memória que prevê, para cada flashcard e cada aluno, a probabilidade exata de você lembrar dele em um determinado dia — e então agenda a revisão pouco antes dessa probabilidade cair demais. Ele substitui o algoritmo original do Anki, o SM-2, de 1987, e em testes comparativos diretos reduz o número de revisões necessárias em cerca de 20-30%, mantendo a retenção estável, porque aprende a partir da sua memória real, e não de uma fórmula única para todos.

## Por Que o Algoritmo Antigo Tinha Dificuldades

O SM-2 foi projetado por Piotr Wozniak para o SuperMemo em 1987, décadas antes de existirem milhões de registros de revisão para aprender com eles. Ele acompanha um único "fator de facilidade" por cartão: se você lembra, o intervalo é multiplicado por esse fator (geralmente em torno de 2,5); se você esquece, o fator de facilidade cai por uma penalidade fixa e o intervalo volta a um dia.

O problema é que o SM-2 trata todo aluno, todo cartão e todo deslize de memória da mesma forma. Uma palavra que você já viu em cinco frases diferentes e uma palavra que você aprendeu ontem são ajustadas pela mesma aritmética. Ele não consegue diferenciar um cartão que é intrinsecamente difícil (um verbo irregular em alemão) de um cartão em que você simplesmente clicou errado. Com anos de uso, os fatores de facilidade vão se desviando e os intervalos ficam extremamente imprecisos — alguns cartões aparecem com muito mais frequência do que deveriam, outros com muito menos.

## Como o FSRS Realmente Funciona

O FSRS, criado por Jarrett Ye e lançado como código aberto em 2022, substitui o fator de facilidade único por um **modelo DSR**: Dificuldade, Estabilidade e Recuperabilidade (*Difficulty, Stability, Retrievability*).

- **Dificuldade** estima o quão difícil um cartão específico é para você, com base no seu histórico com ele.
- **Estabilidade** estima quantos dias são necessários para que a sua probabilidade de lembrar caia para 90%.
- **Recuperabilidade** é a probabilidade, em tempo real, de você acertar o cartão naquele exato momento.

Em vez de um único multiplicador fixo, o FSRS usa 19 parâmetros ajustados ao *seu* histórico de revisões por meio de gradiente descendente — a mesma técnica de otimização usada em modelos modernos de aprendizado de máquina. Dois alunos estudando o mesmo baralho de espanhol acabam com cronogramas diferentes, porque suas curvas de esquecimento são diferentes.

A matemática da curva de esquecimento remonta aos experimentos de memória de Hermann Ebbinghaus em 1885 e ao modelo de função de potência do próprio Wozniak, mas o FSRS é o primeiro agendador amplamente utilizado a ajustar essa curva individualmente, por usuário, com dados reais, em vez de assumir que todo mundo esquece na mesma velocidade.

## Os Números Que Importam

No benchmark oficial do FSRS, publicado pelo projeto Open Spaced Repetition, o FSRS reduziu a carga prevista de revisões em cerca de 20-30% em comparação com o SM-2, com taxas de retenção equivalentes (geralmente testadas em torno de 90%). Na prática: um baralho que exigia 40 revisões por dia no SM-2 muitas vezes pode manter a mesma retenção com apenas 28-32 revisões por dia no FSRS. Isso não é um ajuste marginal — é a diferença entre a repetição espaçada parecer sustentável ou parecer um fardo.

## Como Aproveitar Isso Agora Mesmo

1. **Dê dados reais ao sistema.** O FSRS precisa de pelo menos 100-200 revisões em um tipo de cartão antes que seus parâmetros personalizados se tornem confiáveis. Não julgue o algoritmo depois de apenas um dia.
2. **Escolha uma meta de retenção que faça sentido para você.** Uma retenção de 85-90% é o ponto ideal indicado pela maioria das pesquisas (incluindo Settles & Meeter, 2016, sobre o efeito do espaçamento) para equilibrar carga de estudo e esquecimento.
3. **Avalie-se com honestidade.** A precisão do FSRS depende totalmente de respostas honestas nas opções "de novo/difícil/bom/fácil" — subestimar-se de propósito ou sempre marcar "fácil" corrompe a estimativa de dificuldade.
4. **Deixe os intervalos crescerem de forma desigual.** É normal que alguns cartões saltem rapidamente para 60 dias, enquanto outros fiquem travados em 3 dias por semanas — isso é o modelo identificando corretamente quais palavras são mais difíceis especificamente para você.

## Perguntas Frequentes

**O FSRS substitui a repetição espaçada em si?** Não — ele é um agendador, não um novo método de aprendizado. Ele continua se baseando no efeito do espaçamento documentado originalmente por Ebbinghaus.

**O FSRS é exclusivo do Anki?** Não. O algoritmo é de código aberto e vem sendo cada vez mais usado em aplicativos de flashcards e de idiomas além do Anki.

**Eu preciso ajustar os parâmetros manualmente?** Não — as implementações modernas os otimizam automaticamente a partir do seu histórico de revisões.

## O FSRS no Zenzu

O Zenzu agenda cada flashcard — criado a partir de vídeos do YouTube, podcasts, artigos ou fotos — usando o FSRS-5, de modo que as revisões se adaptam à sua memória pessoal em vez de seguirem uma fórmula fixa. A Lisa, sua coach de IA, explica palavras complicadas e planeja o que estudar a seguir no seu próprio idioma, mantendo as revisões diárias realistas em inglês, alemão, francês e espanhol.
