---
title: "FSRS frente al antiguo algoritmo de Anki: ¿cuáles son las diferencias?"
excerpt: "FSRS predice la memoria con 19 parámetros personalizados en lugar de reglas fijas, reduciendo el tiempo de repaso entre un 20 y un 30 % sin sacrificar la retención. Así es como funciona."
date: "2026-10-10"
image: "/blog/what-is-fsrs-and-why-it-beats-the-old-anki-algorithm/cover.jpg"
---

FSRS (Free Spaced Repetition Scheduler, o Programador de Repetición Espaciada Libre) es un algoritmo de modelado de memoria que predice, para cada tarjeta y cada estudiante, la probabilidad exacta de que recuerdes esa tarjeta en un día determinado, y programa el repaso justo antes de que esa probabilidad caiga demasiado. Sustituye al algoritmo original de Anki, SM-2, de 1987, y en comparaciones directas reduce el número de repasos necesarios en aproximadamente un 20-30 %, manteniendo la retención estable, porque aprende de tu memoria real en lugar de aplicar una fórmula genérica para todos.

## Por qué el antiguo algoritmo tenía dificultades

SM-2 fue diseñado por Piotr Wozniak para SuperMemo en 1987, décadas antes de que existieran millones de registros de repaso de los que aprender. Rastrea un único "factor de facilidad" por tarjeta: si la recuerdas, el intervalo se multiplica por ese factor (normalmente alrededor de 2.5); si la olvidas, el factor de facilidad baja por una penalización fija y el intervalo vuelve a un día.

El problema es que SM-2 trata a todos los estudiantes, todas las tarjetas y todos los olvidos de la misma manera. Una palabra que has visto en cinco oraciones distintas y una que acabas de aprender ayer se ajustan con la misma aritmética. No puede distinguir entre una tarjeta que es intrínsecamente difícil (un verbo irregular en alemán) y una tarjeta en la que simplemente hiciste clic por error. Con años de uso, los factores de facilidad se desvían y los intervalos se vuelven muy imprecisos: algunas tarjetas aparecen con demasiada frecuencia y otras, con muy poca.

## Cómo funciona realmente FSRS

FSRS, creado por Jarrett Ye y publicado como código abierto en 2022, sustituye el único factor de facilidad por un **modelo DSR**: Dificultad, Estabilidad y Recuperabilidad (por sus siglas en inglés, *Difficulty, Stability, Retrievability*).

- La **Dificultad** estima lo difícil que te resulta una tarjeta en concreto, según tu historial con ella.
- La **Estabilidad** estima cuántos días tardará tu probabilidad de recordarla en caer al 90 %.
- La **Recuperabilidad** es la probabilidad en tiempo real, momento a momento, de que aciertes la tarjeta ahora mismo.

En lugar de un único multiplicador fijo, FSRS usa 19 parámetros que se ajustan a *tu* historial de repasos mediante descenso de gradiente, la misma técnica de optimización que hay detrás de los modelos modernos de aprendizaje automático. Dos estudiantes que repasan el mismo mazo de español terminan con calendarios distintos, porque sus curvas de olvido son diferentes.

Las matemáticas de la curva de olvido se remontan a los experimentos de memoria de Hermann Ebbinghaus en 1885 y al propio modelo de función de potencia de Wozniak, pero FSRS es el primer programador ampliamente utilizado que ajusta esa curva por usuario con datos reales, en lugar de asumir que todos olvidan al mismo ritmo.

## Los números que importan

En el benchmark oficial de FSRS publicado por el proyecto Open Spaced Repetition, FSRS redujo la carga prevista de repasos en torno a un 20-30 % en comparación con SM-2, manteniendo tasas de retención equivalentes (habitualmente probadas alrededor del 90 %). En términos prácticos: un mazo que exigía 40 repasos al día con SM-2 a menudo puede mantener la misma retención con solo 28-32 repasos al día con FSRS. No es un ajuste menor: es la diferencia entre que la repetición espaciada se sienta sostenible o se sienta como una obligación pesada.

## Cómo aprovecharlo desde ya

1. **Dale datos reales.** FSRS necesita al menos 100-200 repasos de un tipo de tarjeta antes de que sus parámetros personalizados sean fiables. No lo juzgues tras el primer día.
2. **Elige un objetivo de retención que puedas sostener.** Un 85-90 % de retención es el punto óptimo que señala la mayoría de la investigación (incluido el estudio de Settles y Meeter, 2016, sobre el efecto del espaciado) para equilibrar la carga de trabajo con el olvido.
3. **Califícate con honestidad.** La precisión de FSRS depende por completo de que califiques con sinceridad cada repaso ("otra vez/difícil/bien/fácil"); si minimizas tu desempeño o siempre marcas "fácil", distorsionas la estimación de dificultad.
4. **Deja que los intervalos crezcan de forma desigual.** Es normal que algunas tarjetas salten a 60 días rápidamente y otras se queden estancadas en 3 días durante semanas; eso es el modelo identificando correctamente qué palabras te resultan más difíciles a ti en particular.

## Preguntas frecuentes

**¿FSRS sustituye a la repetición espaciada en sí?** No; es un programador, no un nuevo método de aprendizaje. Sigue basándose en el efecto del espaciado documentado originalmente por Ebbinghaus.

**¿FSRS es exclusivo de Anki?** No. El algoritmo es de código abierto y cada vez se usa más en aplicaciones de tarjetas y de idiomas más allá de Anki.

**¿Tengo que ajustar yo mismo los parámetros?** No; las implementaciones modernas los optimizan automáticamente a partir de tu historial de repasos.

## FSRS en Zenzu

Zenzu programa cada tarjeta de estudio (creada a partir de videos de YouTube, podcasts, artículos o fotos) usando FSRS-5, de modo que los repasos se adaptan a tu memoria personal en lugar de a una fórmula fija. Lisa, tu entrenadora con IA, te explica las palabras difíciles y planifica qué estudiar a continuación en tu propio idioma, manteniendo los repasos diarios realistas en inglés, alemán, francés y español.
