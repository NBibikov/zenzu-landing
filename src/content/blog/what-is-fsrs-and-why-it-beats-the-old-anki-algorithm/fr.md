---
title: "FSRS contre l'ancien algorithme d'Anki : quelles sont les différences ?"
excerpt: "FSRS prédit la mémoire grâce à 19 paramètres personnalisés au lieu de règles fixes, réduisant le temps de révision de 20 à 30 % tout en maintenant une rétention élevée. Voici comment il fonctionne."
date: "2026-10-10"
image: "/blog/what-is-fsrs-and-why-it-beats-the-old-anki-algorithm/cover.jpg"
---

FSRS (Free Spaced Repetition Scheduler) est un algorithme de modélisation de la mémoire qui prédit, pour chaque carte et chaque apprenant, la probabilité exacte que vous vous en souveniez un jour donné — puis programme la révision juste avant que cette probabilité ne descende trop bas. Il remplace l'algorithme original SM-2 d'Anki datant de 1987, et dans des comparaisons directes, il réduit le nombre de révisions nécessaires d'environ 20 à 30 % tout en maintenant une rétention stable, car il apprend de votre mémoire réelle, et non d'une formule universelle.

## Pourquoi l'ancien algorithme peinait

SM-2 a été conçu par Piotr Wozniak pour SuperMemo en 1987, des décennies avant que quiconque ne dispose de millions de journaux de révision pour en tirer des enseignements. Il suit un seul « facteur de facilité » par carte : si vous vous en souvenez, l'intervalle est multiplié par ce facteur (généralement autour de 2,5) ; si vous l'oubliez, le facteur de facilité diminue d'une pénalité fixe et l'intervalle revient à un jour.

Le problème, c'est que SM-2 traite chaque apprenant, chaque carte et chaque trou de mémoire de la même manière. Un mot que vous avez déjà rencontré dans cinq phrases différentes et un mot que vous venez d'apprendre hier sont ajustés par le même calcul. Il ne peut pas faire la différence entre une carte intrinsèquement difficile (un verbe allemand irrégulier) et une carte sur laquelle vous avez simplement cliqué par erreur. Au fil des années d'utilisation, les facteurs de facilité dérivent et les intervalles deviennent complètement inexacts — certaines cartes apparaissent beaucoup trop souvent, d'autres pas assez.

## Comment FSRS fonctionne réellement

FSRS, créé par Jarrett Ye et publié en open source en 2022, remplace le facteur de facilité unique par un **modèle DSR** : Difficulté, Stabilité et Récupérabilité (*Difficulty, Stability, Retrievability*).

- **La difficulté** estime à quel point une carte spécifique est difficile pour vous, en fonction de votre historique avec elle.
- **La stabilité** estime le nombre de jours nécessaires pour que votre probabilité de rappel tombe à 90 %.
- **La récupérabilité** est la probabilité en temps réel, instant par instant, que vous répondiez correctement à la carte en ce moment précis.

Au lieu d'un multiplicateur fixe unique, FSRS utilise 19 paramètres ajustés à *votre* journal de révisions grâce à la descente de gradient — la même technique d'optimisation qui sous-tend les modèles d'apprentissage automatique modernes. Deux apprenants étudiant le même paquet de cartes en espagnol se retrouvent avec des calendriers différents, car leurs courbes d'oubli sont différentes.

Les mathématiques de la courbe d'oubli remontent elles-mêmes aux expériences sur la mémoire menées par Hermann Ebbinghaus en 1885, ainsi qu'au modèle de fonction puissance de Wozniak, mais FSRS est le premier planificateur largement déployé à ajuster cette courbe individuellement, pour chaque utilisateur, à partir de données réelles, plutôt que de supposer que tout le monde oublie au même rythme.

## Les chiffres qui comptent

Dans le benchmark officiel de FSRS publié par le projet Open Spaced Repetition, FSRS a réduit la charge de révision prévue d'environ 20 à 30 % par rapport à SM-2, à taux de rétention équivalent (généralement testé autour de 90 %). En termes concrets : un paquet de cartes qui nécessitait 40 révisions par jour sous SM-2 peut souvent être maintenu au même niveau de rétention avec seulement 28 à 32 révisions par jour sous FSRS. Ce n'est pas un ajustement marginal — c'est la différence entre une répétition espacée qui paraît supportable et une répétition espacée qui ressemble à une corvée.

## Comment en profiter dès maintenant

1. **Fournissez-lui de vraies données.** FSRS a besoin d'au moins 100 à 200 révisions sur un type de carte avant que ses paramètres personnalisés ne deviennent fiables. Ne le jugez pas après une seule journée.
2. **Choisissez un objectif de rétention qui vous convient.** Un taux de rétention de 85 à 90 % est le juste équilibre que recommande la plupart des recherches (notamment Settles & Meeter, 2016, sur les effets d'espacement) pour concilier charge de travail et oubli.
3. **Évaluez-vous honnêtement.** La précision de FSRS dépend entièrement d'une notation honnête (« à revoir / difficile / correct / facile ») — sous-estimer vos réponses ou toujours cliquer sur « facile » fausse l'estimation de la difficulté.
4. **Laissez les intervalles évoluer de façon inégale.** Attendez-vous à ce que certaines cartes bondissent rapidement à 60 jours tandis que d'autres restent bloquées à 3 jours pendant des semaines — c'est le signe que le modèle identifie correctement quels mots vous posent le plus de difficulté.

## FAQ

**FSRS remplace-t-il la répétition espacée elle-même ?** Non — c'est un planificateur, pas une nouvelle méthode d'apprentissage. Il repose toujours sur l'effet d'espacement documenté pour la première fois par Ebbinghaus.

**FSRS est-il réservé à Anki ?** Non. L'algorithme est open source et est de plus en plus utilisé dans des applications de cartes mémoire et d'apprentissage des langues au-delà d'Anki.

**Dois-je régler les paramètres moi-même ?** Non — les implémentations modernes les optimisent automatiquement à partir de votre historique de révisions.

## FSRS dans Zenzu

Zenzu planifie chaque carte mémoire — créée à partir d'extraits YouTube, de podcasts, d'articles ou de photos — grâce à FSRS-5, afin que les révisions s'adaptent à votre mémoire personnelle plutôt qu'à une formule fixe. Lisa, votre coach IA, explique les mots difficiles et planifie ce qu'il faut étudier ensuite dans votre propre langue, pour que les révisions quotidiennes restent réalistes en anglais, allemand, français et espagnol.
