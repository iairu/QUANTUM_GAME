# Improving the learner's experience in *Little Psi in the Quantum World*

> Goal: anyone who **finishes a level** has, with high probability, **actually learned** that level's ideas.
> They should not be able to finish by clicking through, guessing, or copying a hint.

This review is based on a full read of the code (`js/main.js`, `js/ui.js`, `js/settings.js`, `js/eqblanks.js`,
`js/content.js`, `js/knowledge.js`, `js/levels/*.js`) and the English dialogue file `lang/en.csv`. The numbers below
come from small scripts run over that data (for example, the answer-length statistics).

---

## 1. Summary

The game already has unusually good learning material: interactive experiments that match the lectures, several
pictures of the same state (the 👁 views), a "predict, then test" step in some levels, inquiry tasks ("which box holds
|+⟩?", "Bell state or mixture?"), feedback that explains every quiz answer, and links back to the lecture source for
the fill-in equations.

What it **does not** have is a guarantee. Right now, finishing a level proves only that the player reached the end.
It does not prove they understood anything. There are five structural gaps:

| # | Gap | Effect |
|---|-----|--------|
| G1 | Settings let a player skip every question **and still get 3 ★** | You can finish without answering anything |
| G2 | In **75 of 108** multiple-choice questions (69 %), the correct answer is the **longest option** | A player who knows nothing can still pass by picking the longest answer |
| G3 | Each question is asked **once**. A wrong answer shows the right one and the game moves on, with no retry and no later re-ask | Mistakes are never fixed |
| G4 | Hints and fixed targets **give away the answer** (exact target values, CHSH angles, the same 60° every time) | You can solve tasks by copying, not reasoning |
| G5 | Equation fill-ins are **front-loaded, graded, and partly about things the game never teaches** (Normal: about 17 in level 1, about 5 before Euler says a word) | Players overload early, lose stars for lecture recall, and learn to dismiss dialogs |

Fixing G1–G4 is mostly small, local code changes. Fixing G5 changes the pacing. Sections 3–4 give the evidence;
sections 5–6 give the fixes.

---

## 2. What already works (keep and extend)

- **Learning by doing, with lecture-faithful physics.** L1 hand on the complex plane, L3 gate puzzles with a limited
  gate set, L5 bra-ket builder with type checking (`diracType` in `l5_dirac.js`), L9 hidden-φ measurement, L10
  tomography, L11 "|+⟩ or |−⟩?" boxes and Bell-vs-mixture. These are the strongest parts. The learner *finds out*
  something instead of being told.
- **Predict → test.** L2 `predict()` and L4 `pure()`/`withMeasure()` ask for a prediction before the experiment runs.
- **Several representations.** The 👁 views show the same state as clock hands, Bloch cuts, bases and ρ, and
  `viewState()` exists in every level.
- **Feedback that explains.** Every quiz has a `why`, and fill-ins show the full correct equation.
- **Links to the lectures.** Fill-ins carry `src` (📄 L4, L1 · board) and a "boxed in the lecture" mark.
- **Misconceptions as content.** The "language traps" target the real misconceptions students hold about quantum mechanics.
- **Snap to correct.** The UI glides onto the exact value once the answer is accepted, so the learner sees the clean
  state that matches the equation.

The recommendations below keep all of this. They change **how progress is earned** more than **what is taught**.

---

## 3. Where learning can currently be skipped or faked

### G1 — Skipping everything still gives full marks
- `ui.js:253`: with `Settings.noBlanks` ("⏭ Skip quizzing") on, `UI.quiz` records the question as **`ok: true`** and
  calls `cb(true)`. `eqblanks.js:474` returns no fill-ins.
- `ui.js:201`: with `Settings.skipDialog` on, all mentor lines are dropped.
- `main.js:110`: stars are computed only from `this.mistakes`. With both settings on, mistakes = 0, so **3 ★**, and
  `Game.completeLevel` unlocks the next level and all Codex cards.
- The welcome screen offers both toggles on the first run (`welcome.js:153–161`).

Result: someone can finish all levels with three stars each without reading a line or answering a question.

### G2 — The answer-length cue
Measured over every `*.options.N` group in `lang/en.csv` (the correct answer is always `options.0`):

```
questions: 108   (2 options: 2, 3 options: 91, 4 options: 15)
correct option is the unique longest: 75   (69 %)
correct option is the shortest:       14   (13 %)
```

Example (`traps.1.1`): *"rotating the 'hand' in the complex plane by the angle φ"* vs. *"increasing the probability"*
vs. *"physically spinning the particle"*.

It gets worse on Easy and Layman. `ui.js:273–275` drops one wrong option, so each of the 91 three-option questions
becomes a **two-option** question: 50 % by coin flip, close to 100 % with the length cue.

### G3 — One shot, no fixing
- `UI.quiz` disables all buttons after the first click, marks the right answer, and continues. `UI.blanks` does the same.
- No list of missed items is kept, and nothing missed is asked again later (`progress` stores stars, Codex, scrolls,
  eqs — not per-item results).
- The language traps all come in **one block at the end of the level** (`Level.finale`). This tests what the player
  remembers right now, not what they keep long-term.

### G4 — Answers given away
| Where | What gives it away |
|---|---|
| `l1_complex.js:58` | On **Normal** (not only Easy) the tip prints the target's exact magnitude and phase, so the task turns into "move the slider to 0.70 and 3π/4". `l1_complex.js:43` (Easy) also shows the live distance to the target. |
| `l1_complex.js:30`, `l2_stern.js:73` | Targets are random **only on Hard**. On Easy and Normal it is always 0.7·e^{i3π/4} and always 60°, so a replay is just memory. |
| `l7_bell.js:99` | The 💡 Hint toast states the four optimal CHSH angles. |
| `l3_bloch.js` `updReadout` | Easy shows the target θ, φ, which makes the puzzle "match the numbers". |
| `l3_bloch.js:197` | The geometry lab has "Continue to the final exam ▸" from the first second, so exploring is optional and goes unseen. |
| `l11_born.js:30,61` | Easy needs 2 correct box guesses in a row. Pure guessing passes 25 % of the time. A wrong guess just deals a new box with no cost to retry, and a lucky pass without H still advances (`l11.phaseReveal.lucky`). |
| `l4_interference.js:44`, `l2_stern.js:78` | The prediction's `why` shows **before** the experiment runs, so the experiment confirms an answer the player has already been told. It no longer tests their prediction. |
| `l6_rabi.js:54`, `t2` | Some steps are passed by **waiting** ("watch for 4 s", "wait until it shrinks"). |
| `main.js:706` | F9 unlocks everything (fine for teachers, but it should be clear that this is not progress). |

### G5 — Front-loaded, graded, partly off-topic fill-ins
Counting `EQ_BLANKS` per step with the selection rules in `EqBlanks.for` (Normal = all boxed items + up to 2 core items):

```
L1  intro ~5   setHand ~5   timesI ~4   interference ~3     ≈ 17 fill-ins on Normal
L5  intro ~6   tasks ~6                                     ≈ 12
L9  intro 4    coords 4     rotations 5   measureAxis 5   unitaryVsDeco 6   ≈ 24
L11 intro 5    phaseReveal 5  midCircuit 4  feedback 4   bellReadout 6     ≈ 24
```

- `main.js:60–70`: they run **before** the step's dialogue and task. In L1 the very first things the player sees are
  `f′(x) = f(x)`, the recursion `a_{n+1} = a_n/(n+1)`, `x(t) = x₀eᵗ`, and `s = s₀ + vt`. These come from lecture 1 (differential
  equations), and **nothing in the game teaches them**.
- Every wrong blank adds to `this.mistakes`, so on Normal (3 ★ only at 0 mistakes) the star rating mostly measures
  lecture recall, not what the player understood in the game.
- By volume, the blank context texts (`blanks.*`, about 30 000 characters) are **more than ten times** the dialogue
  of any single level (L1 about 2 200 characters). The player reads more quiz text than teaching text.
- `settings.js:17`: `glyphs` requires Easy, so the **Hall of Symbols (portal 0)** and the 🔑 key never appear on
  Normal, the default. The players who face the most fill-ins are the ones who don't get the symbol primer.

---

## 4. Other friction for the learner

- **Long dialogues before any action.** A step can open with: historic scroll → fill-ins → "Equation first" card →
  4 mentor lines → task. Learners skim when there is too much text in a row.
- **Passive Codex and Journal.** Cards unlock when a level is done, but nothing asks the learner to use them.
- **One `why` for every wrong answer.** The feedback doesn't depend on *which* wrong option was picked, so the player never
  hears why *their* idea was wrong.
- **No learning goals.** The portal tooltip lists the tasks (`PORTAL_CONTENTS`), not what the player will be able to *do*
  afterwards.
- **"🔎 Ask Google" sends the question text out** (`ui.js:401`). It is fine as an extra, but it is an easy way out
  *before* thinking, so it should only appear after an answer (as it already does for quizzes) and not on fill-ins
  before checking.
- **The README and the code disagree** on the default theme (README: Classic; `settings.js`: `'menu'`). This doesn't
  affect learning, but players may be confused.

---

## 5. Design principles for "guaranteed" learning

1. **Every level has 2–4 explicit objectives** ("I can predict P(0) after H·H", "I can tell |+⟩ from |−⟩ with one
   gate"). Every check in the level is tagged with the objective it gives evidence for.
2. **Progress needs evidence, not just reaching the end.** A level counts as *mastered* only when each objective has
   (a) one correct **interactive** result and (b) one correct **transfer** answer (new numbers or a new situation, not
   seen before).
3. **Retry until correct, then check again later.** A wrong answer gets specific feedback and a fresh *variant* right
   away, plus a spaced re-check in a later session or level.
4. **Prediction comes before the reveal.** Lock the prediction → run the experiment → compare → explain.
5. **Hints cost something and come in steps.** First a nudge, then a method, then the answer. Using the answer hint marks the
   objective as "assisted", and it has to be shown again without help.
6. **Equations are asked about after they are seen.** A fill-in checks a relation the player has just *watched
   happen*. Lecture-only relations belong in an optional drill.
7. **Players can still opt out, but opting out isn't graded as mastery.** "Skip" modes become *review mode*: no stars, no
   mastery, and clearly labelled as such.

---

## 6. Recommendations

Priority: **P0** = needed for the "guarantee", small effort. **P1** = big learning gain, moderate effort.
**P2** = polish or measurement.

### P0-1 Skipping must not count as mastering (fixes G1)
- In `UI.quiz` (`ui.js:253`) call `cb(null)` instead of `cb(true)` when skipped, and count skipped items in the level.
- In `Level.finale` (`main.js:110`): if any question was skipped, or `skipDialog`/`noBlanks` is on, call
  `Game.completeLevel(n, 0)` with a "📖 reviewed" badge instead of stars, and **don't** mark the Codex cards as mastered.
- In step-by-step unlock mode, a reviewed level still opens the next portal (so nobody gets stuck), but the hub shows
  "reviewed, not mastered".
- On the welcome screen, describe both toggles as *review mode*, not as a normal way to play.

### P0-2 Remove the answer-length cue (fixes G2)
1. **Add a lint check to `tools/build-lang.js`.** For each `*.options.*` group, warn when `options.0` is the unique
   longest and more than 1.3× the median of the others. Show the share per level and fail the build above, say, 35 %.
2. **Rewrite the flagged questions** so options have similar length and structure. Make wrong options *plausible*
   misconceptions, as detailed as the right one (e.g. "rotating the hand by φ **and scaling its length by cos φ**").
3. **Add "none of these" / "both" options** in a few places so the longest answer stops being a reliable bet.
4. On Easy, instead of dropping a random wrong option (`ui.js:273`), drop the **least plausible** one (add a
   `weak: n` field), or keep all options and give a hint button instead.

### P0-3 Retry and a list of missed items (fixes G3)
- **Retry right away.** After a wrong answer and its `why`, give a *variant* of the same item (different numbers or
  wording, same idea). Only a correct variant clears the item. Mistakes still count toward stars; clearing affects
  mastery, not stars.
- **Missed-item list.** Add `progress.review = { itemId: { box, due } }` (a Leitner box: 1 → 2 → 3, due after 0 / 1 /
  3 sessions). Every quiz and fill-in item needs a stable id. The DL key already works (`traps.1.0`, `blanks.1.intro.2`).
- **Re-ask later.** See P1-3.
- **Specific feedback per wrong option.** Let `why` be an array or allow `whyWrong: { 1: '…', 2: '…' }`, so picking
  "−0.36" says *"a probability can't be negative — you squared α without the conjugate"*.

### P0-4 Hints and targets that make you think (fixes G4)
- `l1_complex.js:58`: on Normal, replace the exact numbers with a **qualitative** hint ("upper-left quadrant,
  a bit shorter than 1"). Keep the exact numbers only on Layman, and only after a hint click.
- **Random targets on every difficulty**, with tolerances still set by difficulty: `l1_complex.js:30`
  (`tMag`, `tPh`), `l2_stern.js:73` (angle), `l4` decoherence target, `l10` pseudo-pure target, `l9` coordinate
  targets. Easy can pick from a short list of "nice" values (π/2, 3π/4, 60°, 120°…).
- `l7_bell.js:99`: hints in three steps:
  1. "The team wins most when Alice and Bob measure *almost* the same axis, except when x = y = 1."
  2. "Try angle differences of 45°."
  3. The full angles, marked **assisted**. Step 3 is the only one that gives the answer.
- `l3_bloch.js:197`: show "Continue to the final exam" only after the learner has done **one rotation and one
  measurement along a non-z axis**. Or make the lab a 3-question challenge ("rotate |0⟩ so that P(+x) = 0.85") with
  random targets.
- `l11_born.js:61`: allow a guess only after **at least one run** with the current circuit. When `useH` is off, show
  "you have no evidence yet: the Z statistics are the same for both boxes". Count only guesses backed by an H run toward
  `need`.
- Passive waiting steps (`l6` precession, `t2`): turn each into a question about what was seen ("in the rotating frame,
  where does the arrow point after 4 s?" with a click on the sphere), or into a prediction ("at what time will |r|
  fall below 0.3?").

### P0-5 Predict → observe → explain (fixes the L2/L4 order)
For `l2 predict`, `l4 pure`, `l4 withMeasure` and any new prediction:
1. Ask the prediction and **record it without saying if it's right** ("Prediction locked: always 0").
2. Run the experiment.
3. Then show the outcome next to the prediction, with the `why`, plus a short follow-up question:
   "Which part of the H·H picture caused the cancellation?"

Add this pattern where the physics invites it: L3 measure (predict the 100-copy histogram for |+i⟩), L6 π/2 pulse
(predict P(1)), L7 no-signalling (predict Bob's marginals), L9 rotations (predict where the arrow ends), L11 mid-circuit.

### P1-1 Move fill-ins after the step and keep them on topic (fixes G5)
- **Reorder** in `Level.next()` (`main.js:56–81`): run the step first, then the fill-ins *about the relation just
  shown* ("you saw the hand turn 90° per press. Complete: i·i = ( )"). This turns fill-ins from cold recall into
  retrieval right after seeing the thing.
- If you want some pre-questions, keep **one** per step as an *ungraded warm-up guess* (label it as a guess, don't
  count it as a mistake). Guessing before learning helps memory when it is followed by teaching.
- **Cap** fill-ins at 2 per step on Normal and 3 on Hard. Spread the rest through the spaced review (P1-3).
- **Lecture-only relations** (`1.intro.*` differential equations, motion `s = s₀ + vt`, and so on): move them to an optional
  **"📄 Lecture drill"** at the hub or in the Codex, grouped by lecture. Keep the `src` labels there.
- Give stars only from objectives the level teaches. Track drill results separately.

### P1-2 Learning objectives on the portal and at the end of the level
- Add `OBJECTIVES[num] = [{ id, text }]` (2–4 per level). Show them in the portal tooltip instead of only the task
  list, and on a card when the level starts ("By the end you will be able to…").
- Tag each check with `obj: 'l1.phase'`.
- Replace the plain star rating at the end with a checklist: ✅ shown alone · 🟡 shown with help · ⬜ not shown yet.
  Mastery = all ✅. Stars can stay as a score for accuracy.

### P1-3 Spaced review across levels
- **Spark's warm-up**: when entering any level (or talking to Spark at the hub), ask **3 due items** from the review
  list, drawn from *earlier* levels and mixed across topics. Keep it under a minute.
- Due items come from P0-3's Leitner boxes, so whatever a player gets wrong comes back until they get it right.
- Before Dragon's Peak (and the L0 final exam), add a **mixed review** across all levels. It shows what was actually kept.

### P1-4 Transfer questions with new numbers
Every objective should have at least one question the player has **not seen in that form**:
- L1: "Amplitude α = 0.5·e^{iπ/3}. P = ?" with random magnitude and phase.
- L2: random second-magnet angle and "predict the fraction up".
- L3: "Which single gate takes |+i⟩ to |−i⟩?" with random start and end states from the six cardinal states.
- L4: random decoherence p → "what is P(0) after H?".
- L5: builder tasks with shuffled targets ("build a *number*" / "build an *operator*").
- L9–L11: random hidden states.

Generate these from code (most levels already have the simulator: `Q`, `Gate`, `C`), not as fixed CSV text, so they
can't be memorised.

### P1-5 Explain your own answer
After a solved puzzle or experiment, ask one short **"why did that work?"** multiple-choice question (with options of
similar length). For example, after L3 puzzle 5 (|0⟩ → |1⟩ without X, via H Z H): "Why does H·Z·H act like X?" →
"H swaps the x and z axes, so a rotation about z becomes a rotation about x." Short self-explanation questions are
cheap and help understanding stick.

### P1-6 Confidence ratings
Before revealing a quiz answer, ask "How sure are you? 🤷 / 🙂 / 💯".
- High confidence + wrong → highlight the feedback ("this is a common misconception") and schedule the item twice.
  These are the corrections people remember best.
- Low confidence + right → schedule a re-check (it may have been luck).
- At the end of a level, show a small calibration line ("you were sure on 6 of 6 and right on 5 of 6").

### P1-7 Symbol primer for Normal players
`settings.js:17` hides the Hall of Symbols unless the player is on Easy. Either:
- show portal 0 on every difficulty, with plain typeset instead of glyphs on Normal and Hard, or
- add a 2-minute "symbols you will meet" card at the start of each level, listing only that level's symbols
  (taken from `CODEX` entries with `type: 'symbol'` and `level === num`).

### P2-1 Shorter text before the first action
- At most **3 lines before the first interaction** in any step. Move the rest *into* the task (a line appears when the
  player first moves a slider or presses a gate).
- Show historic scrolls **after** a step instead of before, as a reward ("you just did what Stern and Gerlach did in
  1922").
- Make the "Equation first" card appear when the player opens the 📐 panel or when the live equation changes, not as
  another modal.

### P2-2 Make the Codex active
- Mark each card *seen* (unlocked) or *mastered* (its objective is ✅ and it passed one spaced re-check).
- Add a "test me" button on each card that asks 1–2 items from the review list for that concept.

### P2-3 Measure whether the game teaches
- **Short pre-test and post-test** per level: 3 matched items (same idea, different numbers), the pre-test as an
  ungraded warm-up before the first step and the post-test as part of the finale. Store both in `progress.assess`.
- **Teacher export**: a "⬇ Export my progress (JSON)" button in settings (per-item results, objectives, hint use,
  time per step). Students on the course can hand it in, and you get real data on which items and levels fail.
- **Local stats** for the author: % first-try correct per item, % hint use per task, median time per step. Use them to
  find items that are too easy (everyone right → probably a cue) or confusing (everyone picks the same wrong option →
  bad wording or a real misconception worth a new task).

### P2-4 Fade the worked examples in L3/L9 puzzles
Puzzle 1 already acts as a worked example. Make the fading explicit:
1. Worked: the mentor applies the gate and narrates the rotation.
2. Partial: the learner chooses the gate, and the axis is drawn.
3. Independent: no axis drawing, and a limited gate count.
4. Transfer: random start and end states (P1-4).

---

## 7. Notes per level

| Level | Strongest part | Main change |
|---|---|---|
| 0 Hall of Symbols | 3D exhibits and chapter reviews | Make it available on Normal (P1-7). Feed its items into the review list |
| 1 Complex Harbour | Interference slider with the classical-vs-quantum chart | Random target, qualitative hint (P0-4). Move the lecture-1 ODE fill-ins to the drill (P1-1). Transfer: "P for 0.5·e^{iπ/3}?" |
| 2 Stern–Gerlach | Building sequences of magnets | Lock the prediction before the reveal (P0-5). Random angle on all difficulties. Ask "predict Z after Z→X" before running |
| 3 Bloch Observatory | Gate puzzles with a limited gate set | Gate the lab behind one non-z measurement. Easy target shows a direction, not numbers. "Why did H Z H = X work?" (P1-5) |
| 4 Temple of Interference | H·H vs H·M·H with ρ bars | Prediction locked, then experiment, then explanation (P0-5). Decoherence target random |
| 5 Dirac's Library | Builder with type checking — the best "learn by constructing" task | Feedback per wrong attempt already exists. Add shuffled targets and a "type of this expression?" transfer round |
| 6 Rabi's Resonator | Pulse area → flip | Replace the "watch 4 s" and "wait for T₂" steps with predictions (P0-4) |
| 7 Bell's Bridge | CHSH with >75 % classical bound | Hint in steps. Predict no-signalling marginals before showing them |
| 8 Interpretations | Conversations with thinkers | The quizzes here are the most prone to the length cue (wordy correct answers). Rewrite first (P0-2) |
| 9 Pauli Workshop | Hidden φ from measurements | About 24 fill-ins on Normal. Cap and move them after the step (P1-1) |
| 10 Purity Refinery | Tomography of an unknown state | Already uses evidence. Add "predict |r| after U" transfer |
| 11 Born's Readout | Inquiry boxes, Bell vs mixture | Require evidence before a guess counts (P0-4) |
| 12 NMR Workshop | Real lab procedure (tune, calibrate, echo) | Good as is. Add a short "why is τ₉₀ = τ₁₈₀/2?" self-explanation |
| 13 Dragon's Peak | Strike = measurement with P = ½(1 + r·n) | Use it as a **mixed spaced review** of all levels (P1-3), not only new questions |

---

## 8. Suggested order of work

1. **P0-1** skipped ≠ mastered (`ui.js`, `main.js`, `welcome.js`) — about an hour.
2. **P0-2 lint** in `tools/build-lang.js` — about an hour. Then rewrite the flagged options, starting with levels 8, 1 and 3.
3. **P0-5** predict → observe → explain in L2/L4 — small change in the `ask` callbacks.
4. **P0-4** hints and random targets (L1, L2, L3 lab, L7, L11).
5. **P0-3** item ids + retry with a variant + `progress.review`.
6. **P1-1** reorder and cap fill-ins, and the lecture drill.
7. **P1-2** objectives and the end-of-level checklist (needs the item tags from step 5).
8. **P1-3** Spark's warm-up (uses the review list).
9. P1-4 … P2-4 as time allows. **P2-3** (pre/post test and export) is worth doing before the next course run, so the
   changes can be measured.

---

## 9. Definition of done: "the learner will learn something just by playing"

A level meets the bar when **all** of these are true:

- [ ] It shows 2–4 objectives, and every graded check is tagged with one.
- [ ] It can't be marked *mastered* with skip settings on, or with only assisted (answer-hint) solutions.
- [ ] At most 35 % of its multiple-choice questions have the correct option as the unique longest (the build lint passes).
- [ ] Every wrong answer leads to specific feedback **and** a variant that must be answered correctly.
- [ ] Every objective has at least one transfer item with new numbers or a new situation.
- [ ] Every prediction is locked before the experiment shows the answer.
- [ ] No more than 3 lines of text come before the first interaction of any step. Fill-ins come after what they ask about.
- [ ] Items the player got wrong come back in a later session (spaced review).
- [ ] The pre-test → post-test gain is measured, and over a playtest group it is clearly positive.

---

## 10. Implementation status (2026-10-17)

All P0 and P1 items and most P2 items are now in the game. The new code is in `js/learn.js`; the levels, `js/main.js`, `js/ui.js` and `js/eqblanks.js` call into it.

| Item | Status | Where |
|---|---|---|
| P0-1 skipped ≠ mastered | ✅ A skipped question returns `null` (not `true`). With ⏭ Skip quizzing the level is *📖 reviewed*: no stars, no mastered goals, the next level still opens | `UI.quiz`, `Learn.finish`, `Game.starLabel` |
| P0-2 answer-length cue | ✅ About 60 questions rewritten in SK/EN/UK, plus per-option explanations (`*.whyWrong.N`) for the most common misconceptions. Easy drops only an option marked `*.weak`. The `tools/build-lang.js` lint fails above 35 %. Now 16 % EN, 23 % SK, 25 % UK | `lang/*.csv`, `tools/build-lang.js`, `QZ()` |
| P0-3 retry + missed list | ✅ Stable ids (CSV key, `L{n}.{step}.{k}`, `blank.{c}`, `gen.{k}`), a wrong generated question gets an immediate fresh variant, 🔁 second chance at the end of the level, Leitner boxes in `progress.review` | `Learn.ask`, `Learn.answered`, `Learn.secondChance` |
| P0-4 hints and targets | ✅ L1 qualitative → method → numbers; L7 CHSH in 3 steps (the last marks the task as assisted). Random targets in L1, L2, L4, L9 (extra random coordinate), L10. L3 Easy shows a direction, not numbers. The L3 lab needs a rotation and a non-z measurement. L11 guesses need evidence (an H run / an XX run) | levels, `UI.hints` |
| P0-5 predict → observe → explain | ✅ L2 predict, L4 pure / withMeasure, plus new ones in L3 (100 copies), L6 (T₂ time), L7 (no-signalling), L11 (mid-circuit) | `UI.predict`, `Learn.predict` / `Learn.reveal` |
| P1-1 fill-ins after the step | ✅ At most 2 (Normal) / 3 (Hard) after each step; 73 lecture-only relations go to **Codex → 📄 Lecture drill** (ungraded) | `Level.afterStep`, `EqBlanks.for`, `LECTURE_ONLY` |
| P1-2 objectives | ✅ 2–4 per level (L1–L13), on the portal tooltip, at the start and as a ✅/🟡/⬜ checklist at the end; 🎓 when all are ✅ | `OBJECTIVES`, `Learn.objStatus` |
| P1-3 spaced review | ✅ Spark's warm-up (up to 3 due items from other levels) on every level entry; mixed review of 6 before Dragon's Peak | `Learn.intro`, `Learn.due`, `Learn.mixed` |
| P1-4 transfer questions | ✅ 32 simulator-backed generators, one per goal in the final exam (L8 has none — its goals are checked by its own questions) | `GEN`, `TRANSFER` |
| P1-5 "why did that work?" | ✅ L1, L3 (H·Z·H), L4, L6, L7, L11 | `Level.explainWhy`, `l*.explain` |
| P1-6 confidence | ✅ After picking an option; a confident mistake goes to box 0, a lucky guess is re-checked; calibration line at the end (⚙ toggle) | `UI.quiz`, `Settings.confidence` |
| P1-7 symbol primer | ✅ A "symbols you will meet here" card on the first entry when the glyph language is off | `Learn.intro` |
| P2-1 less text up front | 🟡 Historic scrolls now come *after* the step and fill-ins moved after it. Dialogue lines were not shortened, and in the Equation language the "Equation first" card still opens each step (it is what defines that mode) | `Level.afterStep` |
| P2-2 active Codex | 🟡 Cards show 🎓 mastered / 👁 seen **per level** (not per concept) and have a 🧪 *Test me* button | `UI.renderCodex`, `Learn.testMe` |
| P2-3 measurement | ✅ Ungraded warm-up guesses (pre-test) on the first entry, matched transfer questions in the finale (post-test), per-item stats, hint counts, step times, ⬇ JSON export | `Learn.intro`, `Learn.export` |
| P2-4 faded worked examples | 🟡 L3 only: puzzle 1 is demonstrated by Bloch, puzzles 2–3 draw the gate axes, then no reference line, then a random puzzle. L9 rotations are not faded yet | `L3Bloch.loadPuzzle` |

Deliberate differences from the plan above:
- **💬 Skip all dialogue on its own does not block mastery.** The questions are still asked and graded, so mastery still rests on evidence. Only skipping questions (⏭ Skip quizzing) turns a level into review mode.
- **The P1-1 "one ungraded guess per step" became one block of warm-up guesses per level** (the pre-test), so the pre-test and P2-3 share the same matched items.
- **Stars are unchanged** (accuracy). Mastery is shown separately (✅/🟡/⬜ and 🎓), so existing saves keep their stars.
