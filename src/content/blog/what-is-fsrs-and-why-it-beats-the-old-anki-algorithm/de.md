---
title: "FSRS vs. Ankis altem Algorithmus: Was ist der Unterschied?"
excerpt: "FSRS sagt dein Erinnerungsvermögen mit 19 personalisierten Parametern voraus statt mit starren Regeln – das spart 20–30 % Lernzeit bei gleichbleibend hoher Behaltensquote. So funktioniert es."
date: "2026-10-10"
image: "/blog/what-is-fsrs-and-why-it-beats-the-old-anki-algorithm/cover.jpg"
---

FSRS (Free Spaced Repetition Scheduler) ist ein Algorithmus zur Gedächtnismodellierung, der für jede Karteikarte und jeden Lernenden die exakte Wahrscheinlichkeit vorhersagt, dass du sie an einem bestimmten Tag noch weißt – und die Wiederholung genau dann einplant, kurz bevor diese Wahrscheinlichkeit zu stark absinkt. Er ersetzt Ankis ursprünglichen SM-2-Algorithmus aus dem Jahr 1987 und reduziert in direkten Vergleichstests die Anzahl benötigter Wiederholungen um rund 20–30 %, während die Behaltensquote gleich bleibt – denn er lernt aus deinem tatsächlichen Gedächtnisverhalten statt aus einer Formel nach dem Einheitsprinzip.

## Warum der alte Algorithmus an seine Grenzen kam

SM-2 wurde 1987 von Piotr Wozniak für SuperMemo entwickelt – Jahrzehnte bevor jemand Millionen von Wiederholungsdaten zum Lernen zur Verfügung hatte. Er verfolgt pro Karte einen einzigen „Leichtigkeitsfaktor": Erinnerst du dich, wird das Intervall mit diesem Faktor multipliziert (meist etwa 2,5); vergisst du die Karte, sinkt der Faktor um einen festen Abzug und das Intervall springt zurück auf einen Tag.

Das Problem: SM-2 behandelt jeden Lernenden, jede Karte und jeden Gedächtnisausfall gleich. Ein Wort, das du bereits in fünf verschiedenen Sätzen gesehen hast, und ein Wort, das du erst gestern gelernt hast, werden von derselben Rechenlogik gleich behandelt. Der Algorithmus kann nicht unterscheiden zwischen einer Karte, die von Natur aus schwer ist (ein unregelmäßiges deutsches Verb), und einer Karte, bei der du dich einfach nur verklickt hast. Über Jahre der Nutzung verschieben sich die Leichtigkeitsfaktoren, und die Intervalle werden zunehmend ungenau – manche Karten erscheinen viel zu oft, andere viel zu selten.

## Wie FSRS tatsächlich funktioniert

FSRS wurde von Jarrett Ye entwickelt und 2022 als Open Source veröffentlicht. Es ersetzt den einen Leichtigkeitsfaktor durch ein **DSR-Modell**: Difficulty (Schwierigkeit), Stability (Stabilität) und Retrievability (Abrufbarkeit).

- **Difficulty (Schwierigkeit)** schätzt, wie schwer eine bestimmte Karte für dich persönlich ist – basierend auf deiner bisherigen Geschichte mit ihr.
- **Stability (Stabilität)** schätzt, wie viele Tage es dauert, bis deine Erinnerungswahrscheinlichkeit auf 90 % sinkt.
- **Retrievability (Abrufbarkeit)** ist die aktuelle, momentane Wahrscheinlichkeit, dass du die Karte gerade jetzt richtig beantworten würdest.

Statt eines einzigen festen Multiplikators verwendet FSRS 19 Parameter, die mittels Gradientenabstieg an *deinen* Wiederholungsverlauf angepasst werden – dasselbe Optimierungsverfahren, das auch modernen Machine-Learning-Modellen zugrunde liegt. Zwei Lernende, die denselben spanischen Kartensatz üben, erhalten am Ende unterschiedliche Lernpläne, weil ihre Vergessenskurven unterschiedlich verlaufen.

Die Mathematik der Vergessenskurve selbst geht auf Hermann Ebbinghaus' Gedächtnisexperimente von 1885 und Wozniaks eigenes Potenzfunktionsmodell zurück. FSRS ist jedoch der erste weit verbreitete Scheduler, der diese Kurve mit echten Daten individuell pro Nutzer anpasst, statt davon auszugehen, dass alle Menschen gleich schnell vergessen.

## Die Zahlen, die wirklich zählen

Im offiziellen FSRS-Benchmark des Open-Spaced-Repetition-Projekts reduzierte FSRS die prognostizierte Wiederholungslast bei vergleichbarer Behaltensquote (üblicherweise getestet bei etwa 90 %) um rund 20–30 % gegenüber SM-2. In der Praxis bedeutet das: Ein Kartensatz, der unter SM-2 40 Wiederholungen pro Tag erfordert hat, lässt sich mit FSRS oft bei derselben Behaltensquote mit nur 28–32 Wiederholungen pro Tag halten. Das ist keine marginale Optimierung – das ist der Unterschied zwischen Spaced Repetition, das sich nachhaltig anfühlt, und solchem, das sich wie lästige Pflicht anfühlt.

## So profitierst du sofort davon

1. **Gib dem System echte Daten.** FSRS braucht mindestens 100–200 Wiederholungen pro Kartentyp, bevor die personalisierten Parameter verlässlich werden. Beurteile das System nicht schon nach dem ersten Tag.
2. **Wähle ein Behaltensziel, mit dem du gut leben kannst.** 85–90 % Behaltensquote gilt laut den meisten Studien (unter anderem Settles & Meeter, 2016, zum Spacing-Effekt) als idealer Mittelweg zwischen Arbeitsaufwand und Vergessen.
3. **Bewerte dich ehrlich.** Die Genauigkeit von FSRS hängt vollständig von einer ehrlichen Bewertung mit „Nochmal/Schwer/Gut/Leicht" ab – wer sich schlechter macht als nötig oder immer „Leicht" wählt, verzerrt die Schwierigkeitseinschätzung.
4. **Lass die Intervalle ungleichmäßig wachsen.** Es ist normal, dass manche Karten schnell auf 60 Tage springen, während andere wochenlang bei 3 Tagen festhängen – das zeigt lediglich, dass das Modell korrekt erkennt, welche Wörter für dich persönlich schwieriger sind.

## Häufig gestellte Fragen

**Ersetzt FSRS das Prinzip der Spaced Repetition selbst?** Nein – es ist ein Scheduler, keine neue Lernmethode. Es basiert weiterhin auf dem Spacing-Effekt, den schon Ebbinghaus dokumentiert hat.

**Ist FSRS nur für Anki gedacht?** Nein. Der Algorithmus ist Open Source und wird zunehmend auch in anderen Karteikarten- und Sprach-Apps eingesetzt.

**Muss ich die Parameter selbst anpassen?** Nein – moderne Implementierungen optimieren sie automatisch anhand deines Wiederholungsverlaufs.

## FSRS in Zenzu

Zenzu plant jede Karteikarte – ob aus YouTube-Clips, Podcasts, Artikeln oder Fotos erstellt – mithilfe von FSRS-5, sodass sich die Wiederholungen an dein persönliches Gedächtnis anpassen statt an eine starre Formel. Lisa, dein KI-Coach, erklärt schwierige Wörter und plant in deiner eigenen Sprache, was du als Nächstes lernen solltest – damit dein tägliches Lernpensum in Englisch, Deutsch, Französisch und Spanisch realistisch bleibt.
