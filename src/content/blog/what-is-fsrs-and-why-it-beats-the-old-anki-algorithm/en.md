---
title: "FSRS vs Anki's Old Algorithm: What's Different?"
excerpt: "FSRS predicts memory with 19 personalized parameters instead of fixed rules—cutting review time 20-30% while keeping retention high. Here's how it works."
date: "2026-10-10"
image: "/blog/what-is-fsrs-and-why-it-beats-the-old-anki-algorithm/cover.jpg"
---

FSRS (Free Spaced Repetition Scheduler) is a memory-modeling algorithm that predicts, for each flashcard and each learner, the exact probability you'll remember it on any given day—then schedules the review right before that probability drops too low. It replaces Anki's original SM-2 algorithm from 1987, and in head-to-head benchmarks it cuts the number of reviews needed by roughly 20-30% while holding retention steady, because it learns from your actual memory, not from a one-size-fits-all formula.

## Why the Old Algorithm Struggled

SM-2 was designed by Piotr Wozniak for SuperMemo in 1987, decades before anyone had millions of review logs to learn from. It tracks a single "ease factor" per card: if you remember it, the interval multiplies by that factor (usually around 2.5); if you forget it, the ease factor drops by a fixed penalty and the interval resets to one day.

The problem is that SM-2 treats every learner, every card, and every memory lapse the same way. A word you've seen in five different sentences and a word you just learned yesterday get nudged by the same arithmetic. It can't tell the difference between a card that's intrinsically hard (an irregular German verb) and a card you simply mis-clicked. Over years of use, ease factors drift and intervals become wildly inaccurate—some cards show up far too often, others not often enough.

## How FSRS Actually Works

FSRS, built by Jarrett Ye and released as open-source in 2022, replaces the single ease factor with a **DSR model**: Difficulty, Stability, and Retrievability.

- **Difficulty** estimates how hard a specific card is for you, based on your history with it.
- **Stability** estimates how many days it takes for your recall probability to fall to 90%.
- **Retrievability** is the live, moment-by-moment probability you'd get the card right right now.

Instead of one fixed multiplier, FSRS uses 19 parameters that are fitted to *your* review log using gradient descent—the same optimization technique behind modern machine learning models. Two learners studying the same Spanish deck end up with different schedules, because their forgetting curves are different.

The forgetting-curve math itself traces back to Hermann Ebbinghaus's 1885 memory experiments and Wozniak's own power-function model, but FSRS is the first widely deployed scheduler to fit that curve per-user with real data rather than assuming everyone decays at the same rate.

## The Numbers That Matter

In the official FSRS benchmark published by the Open Spaced Repetition project, FSRS reduced forecasted review burden by about 20-30% compared to SM-2 at matched retention rates (commonly tested around 90%). In practical terms: a deck that demanded 40 reviews a day under SM-2 can often be held at the same retention with 28-32 reviews a day under FSRS. That's not a marginal tweak—it's the difference between spaced repetition feeling sustainable or feeling like a chore.

## How to Benefit From This Right Now

1. **Give it real data.** FSRS needs at least 100-200 reviews on a card type before its personalized parameters are reliable. Don't judge it after day one.
2. **Pick a retention target you can live with.** 85-90% retention is the sweet spot most research (including Settles & Meeter, 2016, on spacing effects) points to for balancing workload against forgetting.
3. **Rate yourself honestly.** FSRS's accuracy depends entirely on honest "again/hard/good/easy" grading—sandbagging or always hitting "easy" corrupts the difficulty estimate.
4. **Let intervals grow unevenly.** Expect some cards to jump to 60 days quickly and others to stay stuck at 3 days for weeks—that's the model correctly identifying which words are harder for you specifically.

## FAQ

**Does FSRS replace spaced repetition itself?** No—it's a scheduler, not a new learning method. It still relies on the spacing effect first documented by Ebbinghaus.

**Is FSRS only for Anki?** No. The algorithm is open-source and increasingly used across flashcard and language apps beyond Anki.

**Do I need to tune the parameters myself?** No—modern implementations optimize them automatically from your review history.

## FSRS in Zenzu

Zenzu schedules every flashcard—made from YouTube clips, podcasts, articles, or photos—using FSRS-5, so reviews adapt to your personal memory instead of a fixed formula. Lisa, your AI coach, explains tricky words and plans what to study next in your own language, keeping daily reviews realistic across English, German, French, and Spanish.
