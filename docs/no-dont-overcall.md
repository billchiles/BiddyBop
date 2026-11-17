# BiddyBop — Natural overcalling when DONT is disabled

> Design checkpoint, 16 Nov 2026. Analysis and agreed direction only; **not a code specification to implement without further review**. Baseline GitHub `billchiles/BiddyBop` master commit `4007c98`, with `dont.zip` as the supplied source snapshot. This document is intended to be carried into a new chat if needed.

## Purpose and guardrails

- Add an optional `dontAgainstStrongOneNt` setting, default **on**, while preserving present DONT-on behavior unless a specific instructional correction is approved.
- When off, teach a coherent natural direct-seat defense of an opposing strong 1NT, selected advances, overcaller rebids, and the original 1NT partnership's useful responding/opener continuations. Selected responder second turns may be worth adding, subject to analysis; no requirement to model every auction.
- The end user bids **all four hands**, which share the selected bidding agreements, including `oneNtOpening` (`15-17` or `16-18`). Do not add a separate assumption or setting for the opponents' 1NT range.
- Rule meaning, evidence, explanations, qualification, priority, and scope boundaries must agree with the chosen DONT setting. Prefer declarative agreement gating and focused auction helpers; no large evaluator conditionals, accidental rule order, or candidate order dependence.
- Follow `docs/spec.md` and `docs/code-style.md`. Before learner-facing explanation edits, capture a temporary current-master comparison baseline (matched rule IDs, alternatives, ranking, statuses and explanation text), review every difference, and avoid permanent wording regression tests. Use reviewed batches and GitHub branch/commit/squash-merge process.

## Current advancing agreements — updated 17 Nov 2026

**Status:** The user approved the natural, nonforcing new-suit advance and its minimum-strength/quality requirements on 17 Nov 2026. The general Pass/raise approach is also approved, while precise competitive-raise ranges and Pass-versus-boundary behavior still need review. This section supersedes earlier provisional advancer thresholds later in the file. **No bidding code is authorized by this document update.**

### Agreed treatment of the quiet auction `1NT – natural 2X – Pass – ?`

- **Pass:** Legitimate when advancer lacks a sufficiently good action, even with 11–12 HCP and poor fit; no inherited 10-HCP ceiling. The existing question of Pass as a lower-priority *qualifying alternative* versus a judgment explanation remains open; preserve DONT-on behavior.
- **Competitive raise to `3X`:** Nonforcing, **not a routine game invitation**. A three-card raise with roughly 7–10 *total points with shortage* is the leading candidate; a weaker four-card raise with roughly 4–6 *total points with shortage* and at least some real HCP (first candidate: 4+) is also worth supporting. Do not use shortage points alone to justify nearly honorless raises. Two-card support normally does not justify a raise. These numeric cutoffs and actual four-hand practice examples still need verification, not automatic implementation.
- **Economical new suit at the two level — agreed:** Natural, **nonforcing**, and a serious offer to play in advancer's own **independently strong suit**, not merely a declaration of six cards. Advancer is proposing that suit as a better contract despite partner's known 6+ card suit, even if overcaller has no support for advancer's suit. This is a practical bidding judgment; the rule establishes a sufficiently strong reason to suggest the new trump suit, not proof that it will take more tricks.
  - **7+ HCP in the entire hand.** Do not waive this floor just because the suit is unusually strong; it is distinct from the suit-independence test.
  - **6+ cards in the new suit**. Six-card suits need especially strong honor concentration; seven and eight cards can achieve the same published suit-quality threshold with fewer counted honors. No five-card exception is agreed.
  - **Klinger's Suit Quality Test: score at least 10**, adding suit length and qualifying honors (A, K, Q, J, 10, with J/10 counting subject to higher-honor support). This is the established 'self-sufficient suit' / Rule of 10 teaching guideline; it assesses the suit's independent quality, not whether the whole hand is strong enough to bid.
  - **Also pass the existing `hasPreemptSuitQuality`** (at least two of A/K/Q or three of A/K/Q/J/10). The combination is deliberately conservative: it prevents suit length alone from validating extremely weak honors. Use a small dedicated helper, e.g. `hasIndependentSuitQuality`, without changing the general preempt helper or adding a trick-taking simulator. Verify the exact published definition for qualifying lower honors when coding.
  - **Normally 0–1 cards in partner's overcalled suit**; with two or more, the known fit makes abandoning it more of a judgment case.
  - **Only economical two-level calls are included:** after 2C, 2D/2H/2S; after 2D, 2H/2S; after 2H, 2S; after 2S, no such call.
  - **Examples of suit quality, not full hands:** KQJT65 (6 cards + 4 honors = 10) needs at least 1 additional HCP outside to meet the 7-HCP total; AKQJ65 qualifies by length/quality and HCP; AQJ8643 (7 + 3 = 10, 7 HCP) qualifies; AQ8765 (6 + 2 = 8) fails the independent-suit test even though it passes existing preempt quality.
  - **No inferred permission to make all high-quality suit changes:** Some close situations still favor Pass. Keep learner explanations clear that the new suit is an *offer to play* rather than a forcing or constructive game try.
- **Overcaller continuation:** Normally Pass a nonforcing 3X competitive raise or an economical nonforcing new suit; do not automatically correct to the three level because of a spade misfit or bid game based only on HCP. For genuine exceptional game/prospect or difficult misfit decisions, use a judgment boundary.
- **Defer:** Three-level new suits, 2NT inquiry, routine natural 3NT, direct games without sound evidence, and broader later competitive auctions. Review responder's intervening Double/action as a separate subfamily after the quiet auction.

### Approved Pass and scope-boundary approach — 17 Nov 2026

These principles were reviewed and approved for DONT-off. They are *design agreements*, not a new request to change bidding code. The numerical thresholds below remain candidates pending the final competitive-raise review.

- **Bridge legitimacy versus qualifying rules:** A student may legally Pass even when an aggressive natural overcall or advance qualifies. Do not certify Pass as an automatically qualifying, equally ranked alternative in every such case. A rejected/mismatched Pass explanation can acknowledge that a conservative Pass is reasonable, especially given vulnerability and other unmodeled judgment. Preserve the current evaluator architecture and existing DONT-on behavior.
- **Direct overcaller:** When a natural 2-level suit bid qualifies, prefer that concrete qualifying call; the fallback Pass is suppressed as it is today. When no natural suit qualifies, an ordinary hand can qualify for Pass. Strong hands without a confident natural action must reach the strong-hand judgment boundary, not an invented penalty Double or automatic Pass. A good natural suit can qualify on a strong hand; penalty Double may still be an unmodeled judgment option.
- **Advancer in `1NT – natural 2X – Pass – ?`:** Build a dedicated DONT-off Pass predicate, not a general evaluator change. Pass qualifies when there is no qualifying competitive raise, no independently strong natural two-level new suit, and no applicable exceptional-hand judgment boundary. Do *not* import the existing advancing 10-HCP ceiling. For example, a poor-fit 11–12 HCP hand may reasonably Pass.
- **Constructive advance priority:** A qualifying 3X competitive raise or qualifying independent two-level new suit should disqualify the fallback Pass as positive teaching guidance. Retain clear feedback for a student who Passes regardless; do not introduce a preferred/acceptable/questionable-call taxonomy.
- **Exceptional fit:** A strong-support hand above the competitive 3X range should not fall through to Pass simply because 3X no longer qualifies. Use a specifically scoped judgment boundary when game prospects are too uncertain to evaluate. The boundary must be mutually exclusive with *all* concrete eligible bids, especially the fallback Pass, because `maybeSuppressScopeBoundaryWhenBidApplies` suppresses it otherwise.
- **Exceptional misfit:** Ordinary 11–12 HCP with little support may Pass; assess whether substantially stronger hands without a suitable two-level new suit need a separate judgment boundary. Do not invent an upper Pass cap without examining credible hand situations.
- **Minimal implementation:** Keep `maybeSuppressPassWithoutOtherAction`, other global ranking/qualification behavior, and generic boundary suppression as-is. Define focused eligibility/evidence helpers in the DONT-off overcall/advance families, with targeted explanation and test changes. Preserve a temporary comparison baseline of current-master DONT-on rule matches, alternatives, ranking, turn statuses, and explanations before learner-facing code edits.

**Next design analysis (now in progress):** verify the provisional three-card 7–10 *total points with shortage* and four-card 4–6 *total points with shortage* (with an HCP floor) competitive raises; investigate stronger-fit boundaries and high-HCP misfits. Only after agreement, review a small 2NT/game-interest scope, responder intervention, overcaller rebids, and opening-side continuations.

### Still to resolve before coding

1. Verify **three-card versus weaker four-card competitive raises** through credible complete deals, accounting for the opposing 15–17/16–18 1NT, available partnership HCP, the absence of vulnerability, and BiddyBop's existing shortage valuation. Check strong-support judgment boundaries.
2. **Next priority: Pass coexistence and scope boundaries.** Trace the selected student calling Pass when a marginal natural overcall or advance qualifies; inspect `maybeSuppressPassWithoutOtherAction`, qualifying alternatives, rejected-call explanations, strong-fit/game-interest boundaries, and whether Pass or a concrete bid inadvertently suppresses necessary judgment guidance. Decide on minimal, agreement-gated behavior before any code generation, preserving DONT-on results.
3. When implementing the agreed new-suit test, confirm the precise honor-count convention for Klinger's Rule of 10 and make sure the 7-HCP floor and existing preempt-quality check each apply independently. Check explanation evidence and sample *complete* deals, but do not reopen the agreed 7-HCP minimum or the nonforcing meaning merely because a rare expert exception exists.
4. Subsequently inspect a narrow selection of 2NT/game continuations, intervening responder action, opener/responder continuations, credible practice deals, and full temporary explanation/evaluation baseline comparisons. No bidding code is yet authorized.

Relevant teaching: ACBL District 16's Meckwell teaching sheet specifies that advancer needs a six-card-or-longer suit strong enough to play opposite a singleton when choosing their own suit (https://www.d16acbl.org/Teaching_Material/Meckwell.pdf). David Loeb's Meckwell discussion calls 2S after natural 2H a natural offer to play (https://www.loebbridge.com/index.php/bridge-articles/meckwell-defense-to-1nt). These are analogies, not an agreement to implement Meckwell. Further source for the agreed independently strong suit test: Ron Klinger, *The Suit Quality Test* (https://csbnews.org/en/the-suit-quality-test-by-ron-klinger/); ACBL Unit 390 teaching examples (https://www.acblunit390.org/Simon/ltc.htm).

## Competitive raise and exceptional-advancer recommendations — 17 Nov 2026 (pending approval)

This records the latest *recommendations* from the final quiet-auction advancing review. The user asked that they be preserved, **not yet treated as accepted numerical agreements or bidding-code authorization**. Their suitability still needs the user's review after the separate auction issue below is analyzed.

For `1NT – natural 2X – Pass – ?` when DONT is off:

- **Three-card support competitive raise `3X`:** candidate 7–10 *total points with shortage*, with **at least 6 actual HCP**; remain under 10 actual HCP. The added HCP floor avoids qualifying barely honorable hands from shortage points alone. This is competitive/nonforcing, not invitational.
- **Four-plus-card support weaker competitive raise `3X`:** candidate 4–6 *total points with shortage* with **at least 4 HCP**. At 7–10 support points, the ordinary band applies, subject to the strong-support boundary. Four cards guarantee at least ten combined trumps because natural 2X promises 6+; no mechanical rule that the LAW requires raising when the opponents have passed. Vulnerability and actual playing tricks remain unmodeled.
- **Strong-support judgment boundary:** with 3+ trumps, candidate **11+ total points with shortage OR 10+ actual HCP**. This is not a claim that the hand is game-going; the app should avoid suggesting a purely competitive 3X, indiscriminate Pass, or automatic game on such a hand. Avoid conflicts where a boundary and qualifying concrete call coexist.
- **Strong misfit judgment boundary:** with poor fit, no qualifying independent economical new suit, and candidate **13+ HCP**, review whether guidance should stop rather than treating all such hands as fallback Pass. Poor-fit 11–12 HCP can still normally Pass. A 13+ cutoff is only a proposed instructional simplification.
- **Pass and evaluators:** As already agreed, do not introduce general evaluator suppression changes or label all marginal passes as equal qualifying alternatives; explain legal/conservative Pass where useful. Keep DONT-on output unchanged.
- **Practice feasibility:** Check all 52 unique cards, 40 HCP, and whether the 1NT responder's recorded Pass is plausible. Illustrative deals should not be converted into rules merely because the HCP totals work.

### New immediate review priority — scope gaps outside DONT-off

Before analyzing the *natural defense overcaller's rebid* or coding the new DONT-off family, inspect this actual user-generated auction:

- North ♠ A Q 9, ♥ A Q J 9, ♦ 7 5, ♣ J 8 7 4; East ♠ 8 4 3, ♥ 10, ♦ A J 10 9, ♣ Q 10 6 5 3; South ♠ 2, ♥ K 8 7 4 2, ♦ 6 4 3 2, ♣ A 9 2; West ♠ K J 10 7 6 5, ♥ 6 5 3, ♦ K Q 8, ♣ K.
- Auction `1C – Pass – 1H – 1S – ?`: the report has no guidance for West's fourth-seat 1S or North's next call; user asks why a natural 1S interference cannot be taught and whether North's cheap 2H support (four hearts opposite responder's five) should be supported.
- This is **not** the DONT-off `1NT – natural 2X` auction and should be analyzed independently. Determine whether the lack of a stage is an intentional scope boundary or a worthwhile, narrow gap in natural overcalling/opener rebidding. Trace the actual auction-stage gates, rule applicability, and comments before recommending code. Do not broaden the DONT project automatically.
- Return to limited natural-defense overcaller rebids, intervening responder action, and the opening-side continuations only after agreeing on the separate example's significance.

## Agreed/provisionally accepted natural overcalling treatment

At the **direct overcaller's turn immediately after opponent's 1NT** when DONT is off:

- `2C`, `2D`, `2H`, and `2S` are **natural**, normally nonforcing, showing **6+ cards** in the named suit, **7+ HCP**, and sufficient suit quality according to existing `hasPreemptSuitQuality` (at least two of A/K/Q or three of A/K/Q/J/10). This is a sound teaching simplification, not a claim of one universal expert minimum.
- These natural overcalls may be made with fewer than opening points. A second four-card suit is permitted but is **not promised**. A five-card suit alone does not qualify in this initial system. No automatically imposed maximum HCP just because penalty Double is conceivable.
- Retain the same suit-quality function for now; don't add playing-trick, losers, Rule of Eight, vulnerability, or scoring machinery simply to support this setting. Vulnerability/scoring and competing vs passing are real-world judgment factors; don't claim the test proves one bid uniquely correct.
- `Pass` should remain a legitimate conservative *bridge option* even when a marginal natural overcall meets a mechanical threshold. **Unresolved implementation choice:** how to communicate an accepted lower-priority Pass versus merely explaining that Pass is reasonable; investigate existing Pass suppression and student feedback carefully before changing qualification. Do **not** make Pass an automatic equal alternative for every hand or change DONT-on behavior.
- `Double` when DONT is **off** has penalty-oriented *partnership meaning*, but BiddyBop will **not positively recommend it** based on an unreliable HCP-only or defense-trick test. Strong hands without reliable preferred natural action receive a judgment/scope boundary; strong hands with a good natural suit may qualify naturally while the explanation notes that penalty Double could be considered. If a recorded auction has `1NT – Double` with DONT off, responder receives a boundary, not invented Redouble/runout instructions. **Unresolved case:** how to handle a high-HCP hand qualifying for both a natural suit and a possible penalty Double so that the explanation is balanced and any strong-hand boundary isn't incorrectly suppressed.
- There is no separate weak/off-range opening adjustment or opponent range; all four hands follow the selected 1NT range. Whether it should alter a rare strong-hand boundary threshold remains to decide. Do not blindly transfer `oneNtResponseHcpShift` to these overcalls.

## Educational comparison when DONT is disabled

- Prefer a **small supplemental note**, only on the *initial direct overcall* and only when informative: "With DONT enabled, this hand would qualify for [call], showing [the exact suit(s)]." This helps learners see why they might practice DONT, particularly when a 5–4 or other qualifying two-suit hand cannot make a six-card natural overcall.
- Derive the comparison from the **existing DONT qualification functions/evidence**, rather than building a parallel DONT evaluator in `explanations.ts` or adding DONT bids as active alternative calls under the wrong agreement.
- Do not show repetitive notes if the natural and DONT action would be the same, and do not imply DONT is always superior. Keep selected-agreement call feedback distinct from counterfactual education.
- Example: ♠ A984, ♥ KQ1097, ♦ 85, ♣ 63 (9 HCP): DONT off does not allow a natural two-level suit overcall (no six-card suit); DONT on may qualify for 2H showing both majors.

## Initial-stage scope and agreements

- Preserve existing DONT call meanings, basic pass-or-correct advances and their overcaller corrections when enabled.
- DONT-off direct 2-level suit overcalls are natural; **both partnerships** must interpret this correctly. With DONT enabled, 1NT–2H represents the majors, whereas DONT off means hearts alone; the original opening side's negative Doubles and stopper logic therefore differ.
- Against natural suit interference over *our* 1NT, continue modeling useful responder calls (Pass, natural suits, negative Double, 2NT/3NT as supported) and selected opener continuations. Investigate adding a small set of responder second turns to complete coherent sequences rather than blanket-expanding competitive bidding.
- Against a penalty-oriented Double over our 1NT, deliberately stop at responder's judgment boundary. Don't build generic penalty Double, Redouble, rescue, runout, scoring, or other later continuations for this project.
- Fourth-seat balancing against 1NT, slam exploration, broad multi-round competitive auctions, elaborate cuebids/game tries, and specialized conventional 2NT inquiries are outside initial scope unless separately approved.

## Current source dependencies to review

- Types/defaults and setting control: `src/models/bidding-types.ts`, `src/components/BiddingSystemControls.tsx` (verify exact UI path in current tree).
- Direct DONT: `overcalling-rules.ts` / `overcalling-functions.ts`; initial Double, 2C/2D/2H/2S, fallback Pass, and strong-hand boundary. Avoid tagging unrelated shared overcall Pass as DONT-only.
- DONT advancing and corrections: `advancing-rules.ts`, `advancing-functions.ts`, `overcalling-rules.ts`, `overcalling-functions.ts`.
- Natural overcall advancer helpers for **opposing suit openings** explicitly exclude opposing 1NT: do not just extend their auction context; 1NT has no cuebiddable known opener's suit or named suit requiring a stopper. Decide dedicated 1NT-natural advance family, with reused helpers where genuinely applicable.
- Opening partnership's interpretation: `auction.ts` (`getPartnerOneNtSuitInterference`), `natural-1nt-interference-partner-calls.ts`, `opener-rebidding-rules.ts`/`opener-rebidding-functions.ts`, `biddingEvaluation.ts`, `explanations.ts`.
- Practice: seven DONT direct-defense deals, two responder deals interpreting 2H as both majors, and seven opener interference continuation deals (16 identified in initial audit); gate DONT-dependent exercises with `requiredSystem` and design only useful natural substitutes. Re-check precise inventories before code.
- Documentation: `README.md`, `docs/spec.md`, `docs/code-style.md`, `docs/rule-tests.md`, `docs/by-the-numbers.md`.

## Next design review — advancing a natural overcall of 1NT

Analyze actual cases such as `1NT – 2H – Pass – ?` for all four suits. Priorities:

1. Pass with zero/minimum support or simply inadequate strength and possible misfit.
2. Raising a known 6+ card suit: support thresholds, length/shortage point treatment, minimum raise versus preemptive jumps, and whether game invitation/major game makes sense when the overcaller could have just 7 HCP.
3. New natural suits: suit length, minimum strength, forcing or nonforcing, and whether a forcing action necessarily has an overcaller rebid modeled.
4. 2NT and 3NT: whether natural, game-try, or artificial/inquiry; avoid importing stopper rules or cuebids from advances of suit openings without justification.
5. Separate quiet auctions (opponent responder Pass) from intervention by that responder; begin with quiet auctions. Natural overcalls can be followed by opener/responder competition, but don't promise complete modeling of that second layer.
6. Test HCP reality given the opener's 15–17 or 16–18 and the overcaller's 7+; verify hand-credible practice examples and call priority/Pass behavior. Distinguish existing rule support from proposed expansion.

**Status:** No bidding code changes or final advancement agreement authorized by this checkpoint. Discussion and design first.

## Advancer research checkpoint — 16 Nov 2026 (historical proposals; superseded where clarified above)

The direct-seat auction `1NT – 2X – Pass – ?` is the first advancer case to model. Research checked:

- Karen Walker, *Choosing a notrump defense*: https://kwbridge.com/ntdef.htm (natural one-suit overcalls promise at least six cards; initial 2NT overcall usually shows the minors).
- Larry Cohen, *DONT*: https://www.larryco.com/bridge-articles/dont (defense to a strong 1NT chiefly aims for safe competition and obstructing opponents, not routine game exploration).
- Larry Cohen, *Simple Overcalls*: https://www.larryco.com/bridge-articles/simple-overcalls (ordinary suit-opening overcall advances can use either nonforcing or forcing new suits; the cuebid of **opener's suit** shows strong support—an option unavailable after a 1NT opening).
- David Loeb, *Meckwell Defense to 1NT*: https://www.loebbridge.com/index.php/bridge-articles/meckwell-defense-to-1nt (after its **natural** 2H/2S overcall: Pass is to play, 3H/3S is **less than invitational**, a 2S change over 2H is natural to play, and 2NT is **artificial game interest**). Meckwell is not the proposed BiddyBop natural defense, but those selected natural-call continuations are an instructive comparison.

Observations:

- If the selected 1NT opening is 15–17, the *entire defending partnership* has at most 25 HCP; if 16–18, at most 24 HCP. Games can make with less because of distribution/playing tricks, but ordinary HCP-driven game invitations and natural 3NT advances are not an automatic fit.
- The existing `advance-two-level-suit-overcall-*` family is explicitly for **opposing suit openings** (`openerStrain: 'suit'`). Its support cuebid, stopper in opener's suit, and 11–13 HCP natural 2NT invitation cannot be copied to overcalls of an opposing 1NT. `getNaturalSuitOvercallForAdvancer` also explicitly rejects opener strain NT.
- For the simplest natural-defense advance, `3X` after `1NT – 2X – Pass` should be investigated as a **competitive, nonforcing** raise, **not** a normal game invitation. A provisional test to discuss is 3+ support and around 7–10 *total points with shortage*. Because the overcaller shows 6+ trumps, two-card support creates an eight-card fit but may be insufficient to risk the three-level; 3+ gives a nine-card fit. Four trumps with even weaker support values is a realistic but less deterministic competitive exception; do not add it without review of vulnerability limits.
- A first candidate for a cheapest **two-level natural new suit** (e.g., `1NT–2H–Pass–2S`) is 6+ good cards, 7+ HCP, little fit for partner, and **nonforcing**. Avoid forcing overcaller to the three-level when the partnership may have very limited strength. The precise values and whether a five-card exceptionally strong suit can qualify remain open.
- If partner naturally overcalls 2C, available 2-level new suits are 2D/2H/2S; over 2D, only 2H/2S; over 2H, only 2S; over 2S, none. Three-level new suits, 2NT game-interest inquiry (if any), natural 3NT, major game jumps, and other constructive approaches should be separately justified or excluded initially, not silently given suit-opening advance meanings.
- Pass is important even with **more than 10 HCP** if advancer has no fit and no safe new suit. Do not copy `naturalSuitOvercallPassApplies`' existing 10-HCP ceiling; a no-fit 12-HCP hand can reasonably Pass a weak natural overcall of a strong 1NT. Still decide whether borderline Pass is a qualifying lower-priority alternative when a positive advance qualifies.
- For a coherent next turn after quiet advances: overcaller may Pass a nonforcing 3X raise with a minimum, and may Pass a natural nonforcing two-level new suit if it offers a sensible landing place; when fit is poor or game might be on, a **scope boundary** is preferable to a forced three-level correction or HCP-only game try.
- For practice, first support responder Pass. Analyze responder Double/suit intervention separately; advancer's physical next stage is already recognized, but the meanings and follow-ups need a separate narrow design if added. The opening side's continuations after natural interference remain in scope through selected opener/reponder turns, subject to existing competitive stage gates.
- `RuleEvalContext` currently has no `BiddingSystem` field. Rule declarations can be filtered by agreement, but helper functions that interpret `2H` as DONT both majors versus natural hearts need explicit, carefully scoped setting awareness. The actor's seat by itself does not change the literal bid.

**Review before implementing**: (1) 3X raise length/shortage thresholds and whether to include weak four-trump raises, (2) new-suit nonforcing semantics and exact length/HCP tests, (3) Pass coexistence and strong-misfit boundaries, (4) whether any 2NT inquiry or direct major game is important enough to model, (5) overcaller's next-turn reply, (6) any responder intervention cases. These proposals are not yet agreed or coded.

## Earlier advancer checkpoint — 16 Nov 2026 (see current agreements above)

The user approved the **general direction** of the advancing analysis. The rules below are a proposed teaching design, **not yet permission to generate bidding code or final approval of numerical thresholds**. Preserve this distinction in future discussions.

- **Scope:** Start with the quiet direct-seat sequence `1NT – natural 2X – Pass – ?` in each of the four suits. Then support a small number of coherent overcaller rebids. Analyze responder interference (`1NT – 2X – Double/other call – ?`) separately.
- **Pass:** Keep Pass a real choice when there is no suitable constructive advance, **without borrowing the existing 10-HCP ceiling** from advances of suit openings. With 11–12 HCP, a poor fit and no independently playable new suit can still justify Pass. Revisit whether marginal Pass is an active alternative or simply mentioned in feedback before code generation.
- **Simple raise:** Treat `1NT – 2X – Pass – 3X` as a **competitive, nonforcing raise, not a routine invitation to game**. First candidate for eligibility is 3+ trumps and roughly 7–10 **total points with shortage**, reflecting a guaranteed nine-card fit; exact threshold and possible weaker four-trump raises are not yet decided. Avoid unjustified game invitations from HCP alone.
- **Economical new suit:** Tentatively make the cheapest legal **two-level** new-suit advance natural, nonforcing, and independently playable: six good cards, normally 7+ HCP, and little support for partner's suit. For `2C`: `2D/2H/2S`; for `2D`: `2H/2S`; for `2H`: `2S`; for `2S`: no available two-level new suit. The forcing nature, thresholds, and whether a narrowly defined five-card exception is justified must be reviewed before implementing.
- **What not to import:** The existing natural advance family follows opponents' *suit* openings. Do not reuse its cuebid of opener's known suit, stopper requirement in that suit, natural 2NT invitation, or forcing-new-suit convention uncritically when opener bid 1NT.
- **Overcaller follow-ups:** Aim for a short, understandable story. A minimum overcaller normally Passes a competitive `3X` raise; may Pass an economical nonforcing new suit when it provides a reasonable fit; do not mechanically correct to the three-level or bid game solely on HCP. Use an explicit judgment boundary where continuation cannot be taught reliably.
- **Defer for now:** Three-level new suits, an artificial 2NT game inquiry, natural 3NT, automatic direct game jumps, comprehensive competitive auctions, and detailed intervening responder sequences. Reconsider a narrow, instructive exception only if the source/rule review supports it.
- **Exercises:** Choose credible four-hand practice deals for important calls and meaningful rejected alternatives, with recorded calls consistent with the active agreement; don't manufacture deals solely for coverage numbers.

### Earlier design questions (see updated unresolved issues above)

1. **Competitive three-level raises.** Should `3X` require at least three-card support and approximately 7–10 *total points with shortage*, or should four trumps permit a weaker competitive raise? Assess the absence of vulnerability/scoring, the strength and fit implied by a 7-HCP overcaller, and whether some two-trump cases merit Pass rather than a raise. Review concrete plausible hands, not just abstract thresholds.
2. **Two-level new-suit advances.** Confirm whether an economical new suit should be **nonforcing** rather than the forcing treatment used in some other BiddyBop advancing families. Decide the minimum six-card suit/quality/7-HCP test, possible five-card exceptions, partner-suit support limitations, and precisely which overcaller Pass or correction is safe and teachable. Ensure an explanatory boundary for other continuations.

### Additional implementation caveats retained

- Inspect the selected student's Pass feedback and existing `maybeSuppressPassWithoutOtherAction` behavior before deciding whether a marginal Pass can qualify as a lower-priority alternative. Don't make every Pass automatically correct, and preserve DONT-on results.
- Do not synthesize an HCP-only penalty-Double rule. Allow a good natural suit at higher HCP without an automatic maximum; explain that Double may also be an expert judgment option. When no reliable natural bid exists, use the agreed strong-hand boundary; after a recorded natural-defense penalty Double, stop at responder's boundary.
- When DONT is off, add only a small **counterfactual** note about what DONT would show when its existing predicate/evidence genuinely qualifies, particularly for two-suited hands. It is educational text, not an active candidate, and should not require a second DONT evaluator.
- Ensure every stage interpreting `1NT – 2H` (or `2C/2D/2S`) uses the correct DONT-versus-natural meaning, for **both** partnerships. Keep rule meanings, turn statuses, alternatives, ranking, scope boundaries, explanations, and deal compatibility agreement-aware.
- Before modifying explanation code, capture and compare a temporary current-master baseline including rule IDs, alternatives, rankings, turn statuses, and full learner-facing explanation text; inspect all differences and avoid permanent exact-wording tests.
- Use small reviewed batches on branches, state the commit subject before changes, inspect and test, and squash-merge into master after approval. This design-document commit alone introduces **no bidding behavior change**.
