# BiddyBop — Natural overcalling when DONT is disabled

> Design checkpoint, 16 Nov 2026. Analysis and agreed direction only; **not a code specification to implement without further review**. Baseline GitHub `billchiles/BiddyBop` master commit `4007c98`, with `dont.zip` as the supplied source snapshot. This document is intended to be carried into a new chat if needed.

## Purpose and guardrails

- Add an optional `dont: boolean` setting, ultimately default **off**. When explicitly enabled, preserve existing DONT-on behavior unless a particular instructional correction is approved. An interim on default is acceptable during incremental development.
- When off, teach a coherent natural direct-seat defense of an opposing strong 1NT, selected advances, overcaller rebids, and the original 1NT partnership's useful responding/opener continuations. Selected responder second turns may be worth adding, subject to analysis; no requirement to model every auction.
- The end user bids **all four hands**, which share the selected bidding agreements, including `oneNtOpening` (`15-17` or `16-18`). Do not add a separate assumption or setting for the opponents' 1NT range.
- Rule meaning, evidence, explanations, qualification, priority, and scope boundaries must agree with the chosen DONT setting. Prefer declarative agreement gating and focused auction helpers; no large evaluator conditionals, accidental rule order, or candidate order dependence.
- Follow `docs/spec.md` and `docs/code-style.md`. Before learner-facing explanation edits, capture a temporary current-master comparison baseline (matched rule IDs, alternatives, ranking, statuses and explanation text), review every difference, and avoid permanent wording regression tests. Use reviewed batches and GitHub branch/commit/squash-merge process.


## Final integration implementation handoff — 20 Nov 2026

**Current master before Batch 9A:** `a4f5f608` (PR #145). The uploaded `wrappingdont.zip`
was checked against GitHub `master` for the files in scope. The baseline rule suite
passed: **632 practice deals, 1,509 positive-call assertions, zero failures**.
Batches **1–8** are squash-merged in PRs **#138–#145** respectively. Their completed
work covers setting/gating, natural 1NT defense, quiet/interfered advances, overcaller
rebids, 1NT responder actions, and opener rebids after negative Double and natural
responder suits. The historical design analysis below is retained for decisions,
not as a list of unfinished implementation work.

### Remaining Batch 9 plan (approved 20 Nov 2026)

**9A — Complete the narrowly supported known-fit continuation after an opposing
competitive raise.** Commit subject: **`Completed DONT-off opener fit after competitive raises`**.
Use the existing `refineOneNtInterferenceDoubleFit` and DONT-off rule declaration to
allow the cheapest **legal three-level** fit after `1NT – natural 2X – Double – 3X`
(e.g. `1NT – 2H – Double – 3H – 3S`). Preserve the judgment boundary where the
fit would require a four-level contract (e.g. `1NT – 2S – Double – 3S – ?`), and
preserve DONT-on behavior explicitly. Do not duplicate helpers. Add a focused
four-hand test verifying qualification, explanation delivery, boundary suppression,
and agreement gating. Batch 9A source scope: `opener-rebidding-functions.ts`,
`opener-rebidding-rules.ts`, `tests/rule-tests.ts`, and this document. **This PR
implements 9A; the following batches must remain separate.**

**9B — Add a lean set of realistic multistage DONT-off practice auctions.**
Proposed commit subject: **`Added DONT-off multistage practice deals and tests`**.
Prefer about four to six complete, credible, longer four-hand auctions, including
quiet 3X raises and two-level independent new-suit advances with overcaller rebids;
negative Double with an intervening 3X raise and an economical opener fit; and
natural responder suits with selected opener follow-ups or the approved judgment
boundary. Use all four natural 2X suits across existing and new practice coverage.
Keep shorter exercises only where they teach a distinct decision; finish at the
last interesting supported call, without ceremonial final Passes.

**Practice buckets: no DONT-on or DONT-off buckets.** New exercises requiring
`dont: false` must go into the **same established, stage-based practice buckets**
as existing DONT-on exercises, according to where the important decision lives:
overcalling, advancing, responding, opener rebids, overcaller rebids, etc. Gate
individual deals by agreement as already done for DONT-on; do not introduce a
separate setting-specific bucket or registry hierarchy. Reuse existing deals and
helpers where reasonable. Complete deals must contain 52 distinct cards, four
13-card hands, 40 HCP, and plausible decisions for every seat under the shared 1NT
range. Keep the test additions targeted rather than multiplying permutations.

**Batch 9B completion checkpoint (20 Nov 2026):** Five complete multistage natural-defense
practice deals were added in the existing overcaller-continuation and opener-after-interference
buckets (natural club raise and overcaller Pass, independent heart advance after 2D and
nonforcing overcaller Pass, economical 3S fit after 2H/Double/3H, opener invitation after
natural responder 2H over 2C, and opener's 3H fit after 2S/Double/Pass). All seven older
DONT-on direct-defense exercises were redistributed by their final interesting stage into
ordinary overcalling, advancing and overcaller-continuation buckets. The DONT-specific dropdown
bucket was removed; a neutral “Defense to strong 1NT” direct-overcalling bucket now includes
both agreement-gated variants. No new convention-specific bucket was introduced.
Primary suite after 9B: **637 deals, 1,534 positive-call assertions, zero failures**;
representative explicit-DONT-on before/after snapshots remained identical.

**9C — Change the final DONT default to off, reconcile docs and statistics,
and verify regression.** Proposed commit subject:
**`Completed DONT-off integration and documentation`**. Set
`defaultBiddingSystem.dont = false`, make existing DONT-on tests explicit rather
than relying on the former default, audit agreement-specific practice
compatibility, update `README.md` and `docs/spec.md` to describe natural
1NT defense as default and optional DONT accurately, and regenerate
`docs/by-the-numbers.md` using the established stats tooling if counts change.
Update this planning file with completion and residual bounded scope, preserving
the full separate sandwich-seat workstream below.

**Additional focused documentation review after DONT integration (explicit user
request, 20 Nov):** inspect `docs/spec.md` and `README.md` *against the actual
implemented code* for inaccuracies, unnecessary elaboration, accumulated
feature-creep descriptions, and general noisiness; simplify selectively while
preserving real agreements, intentional scope boundaries, and useful onboarding
information. Do not conflate this broader document-quality pass with the targeted
DONT wording corrections required for 9C. Discuss findings and proposed edits
before the separate doc-cleanup code generation.

**Regression baseline:** Original pre-option reference `4007c98` and Batch-8 master
`a4f5f608`. Explicitly enable DONT on both sides of the representative comparison;
compare rule IDs, qualifying and rejected calls, alternatives, ranking/order,
turn statuses, scope boundaries and **full** learner-facing explanation text.
Retain temporary comparison reports outside the repository; do not install
permanent explanation-wording snapshots. Verify build and complete rule tests,
plus focused same-auction/different-agreement cases, for every batch. Use a fresh
feature branch from current master, show the commit subject before edits, create
a PR, and squash-merge only after verification. Respect `docs/code-style.md`:
callers before callees, types before dependents, existing `////` sections,
important comments and small parameterized edits; no greenfield duplication.

**Defer until later:** the narrow responder second-turn possibility remains
outside DONT integration; the separate systematic sandwich-seat analysis and
its motivating deal remain in the section below, unmodified.

## Final DONT-off decisions and implementation batches — 18 Nov 2026

**Status:** Approved final bounded review, with the setting name, final default, commit-message and verification scope adjustments made on 18 Nov. This section supersedes earlier provisional questions and prior handoff tasks below. This document update does **not** authorize executable code generation.

### Setting and existing-behavior protection

- Name the `BiddingSystem` boolean **`dont`**, with a user-facing **DONT** checkbox. The short name is preferred to a convention-expanded identifier.
- The **final default must be off** (natural defense against an opposing strong 1NT). An interim on default is acceptable while code generation is incomplete, but avoid an unnecessary later default change if the first working batch can safely default off.
- When `dont: true`, retain the existing DONT bidding meanings for both sides; when `dont: false`, use the agreed natural 2C/2D/2H/2S defense. All four seats share this setting. Do not change the unrelated natural 1NT **overcall**-of-a-suit-opening response context.
- Baseline comparisons must explicitly enable DONT on both old and new revisions, **regardless of the new UI default**. Preserve old DONT-on rule IDs, qualifying calls, alternatives, rankings, turn statuses and full explanations except for separately agreed corrections.

### Final bidding-meaning decisions

1. **Negative Double:** over our opening 1NT followed by a DONT-off natural 2C/2D, require 4+ hearts **and** 4+ spades; after 2H require 4+ spades; after 2S require 4+ hearts. In each case require **no more than two cards in the overcalled natural suit** and the existing constructive response HCP floor (8+ under 15–17, 7+ under 16–18). The shortness addition is restricted to DONT-off natural interference over a 1NT *opening*; retain the current DONT-on and natural 1NT *overcall* treatments. Double remains negative/takeout, never an automatic penalty Double.
2. **Quiet advancer's exceptional misfit:** choose a focused **13+ HCP** judgment boundary when no supported independent new suit or competitive raise qualifies; 11–12 HCP with a poor fit can still Pass. Preserve the approved strong-support judgment boundary at 3+ trumps and either 11+ total points with shortage or 10+ actual HCP. No global changes to Pass suppression, boundary suppression, ranking or candidate evaluation.
3. **Overcaller after responder action:** a qualifying nonforcing 3X raise or independent economical 2Y from advancer can still be **Passed** when responder earlier Doubled or made a selected natural suit bid and opener subsequently **Passes**. Never apply that automatic Pass merely because advancer Passed after a Double (the contract might still be doubled), or when opener competes; use a selected scope/judgment boundary for unmodeled competition.
4. **Opening-side continuation:** the approved natural two-/three-level responder suit actions are nonforcing. Reuse the shared natural-1NT response family; generalize existing opener fit/stopper helpers using the actual opposing suit(s), Double-promised majors, and cheapest *legal* level. With a natural three-level minor response and appropriate minimum, opener may Pass. After a natural suit response followed by advancer's raise, recognize only the reviewed physical opener turn and use a judgment boundary rather than inventing a new bid.
5. **Responder second turn:** defer the optional narrow Pass/invitation-acceptance family until after the core DONT-off feature. End corresponding practice at its last interesting supported call, with the existing scope wording.
6. **Sandwich-seat review:** defer the independent systematic workstream until DONT is completed; its complete deal and stage-by-stage scope remain recorded below.

### Source reuse and organization

- Route `dont` through `bidding-types.ts`, `BiddingSystemControls.tsx`, `App.tsx`, and the existing declarative rule-activation path.
- Parameterize `auction.ts`'s `getPartnerOneNtSuitInterference` and related narrow stage recognition, and thread the active `BiddingSystem` into `biddingEvaluation.ts`'s `auctionContextMatches`. Do not create a separate stage or candidate evaluator.
- Extend the existing `overcalling-rules.ts`/`overcalling-functions.ts` and `advancing-rules.ts`/`advancing-functions.ts` domains. Reuse shared card and bidding predicates; provide a small independent-suit-quality helper without changing `hasPreemptSuitQuality`. Do not import suit-opening advance cuebid/forcing meanings into a defense of 1NT.
- Reuse `natural-1nt-interference-partner-calls.ts`, `getOneNtInterferenceContinuation`, `getOneNtDoubleFit`, `refineOneNtInterferenceDoubleFit`, existing natural Pass/3NT refiners, and explanation evidence builders. Different DONT-on versus DONT-off meanings may warrant different **rule declarations**, but not duplicate copies of the same underlying helper.
- **Code style is mandatory:** callers before callees; types immediately before their dependents; preserve `////` sections and substantive comments; prefer modest parameterization over duplicate functions; avoid greenfield frameworks, ID-based evaluator conditionals and unrelated cleanup. Inspect all existing call sites before editing shared functions, especially the independent natural 1NT overcall context.

### Nine incremental batches — proposed commit subjects

For **each** batch: announce its exact commit subject before changing files, branch from current master, use narrow source diffs and focused checks, then commit, PR and squash-merge. **Every batch's final subject must explicitly say DONT or DONT-off.**

1. Agreement, UI/default and existing-rule/deal gates — **`Made DONT optional with off as the default`**.
2. Natural direct 2C/2D/2H/2S, Pass, strong-hand boundary and counterfactual note — **`Added DONT-off natural overcalls of strong 1NT`**.
3. Quiet natural advances: Pass, competitive raises, independent 2-level suits, fit/misfit boundaries — **`Added DONT-off natural advances of 1NT overcalls`**.
4. Same advance rules after responder negative Double or natural suit bid — **`Extended DONT-off advances after responder interference`**.
5. Nonforcing overcaller Pass, selected intervened Pass and judgment boundaries — **`Added DONT-off overcaller rebids after natural advances`**.
6. Shared opening-1NT responder meanings, auction detection and negative-Double shape/shortness — **`Reused natural responder rules after DONT-off interference`**.
7. Opener fit/NT continuations after negative Double, using existing parameterized helpers — **`Extended DONT-off opener rebids after negative Double`**.
8. Opener Pass/fit/NT and bounded judgment after natural responder suits — **`Extended DONT-off opener rebids after natural responses`**.
9. Lean practice/tests, docs and refreshed project statistics if changed — **`Completed DONT-off integration and documentation`**.

### Lean tests, practice deals and temporary comparison

- **Keep additions deliberately small.** Existing build and complete rule-test commands still run after each batch. **Defer additional DONT-off practice-deal construction until the overcaller and opening-partnership continuations have been implemented**; then favor realistic longer auctions with useful decisions at multiple stages. Retain shorter deals in their appropriate buckets when they teach a distinct decision; stop any deal at its last interesting supported bid. In interim batches, test rule qualification with temporary hands and auctions rather than adding permanent practice deals. Do not pursue exhaustive family, suit, rank, rejected-call or auction permutation coverage.
- Prefer reuse of existing deals/tests. Include meaningful variation across the four direct suit overcalls, quiet raise versus independent new suit, at least one responder Double and one natural-suit intervention, and representative overcaller/opener follow-up; reuse deals for multiple checks where appropriate. **Do not create one practice deal or permanent test for each of the ten legal quiet-auction rebid shapes.**
- Focus a handful of regression tests on agreement-dependent meaning for the *same auction*, correct negative-Double shortness and actual opponent suit, Pass/boundary coexistence, legality after competition, and at least one selected opening-side continuation. Avoid broad new infrastructure and **permanent explanation-wording snapshots**.
- Capture a **temporary, bounded representative baseline** on current master with DONT explicitly on: rule IDs, qualifying and rejected calls, alternatives, presentation order/rank, statuses/scope boundaries and complete learner-facing explanations. Compare the same representative cases after every batch and investigate all unexpected differences; do not permanently commit the baseline harness or output.
- Every new *complete* practice deal must still have four thirteen-card hands, 52 distinct cards, 40 HCP, plausible actions under the shared chosen 1NT opening range and no ceremonial closing Passes.
- This planning update alone makes no changes to executable bidding behavior.

## Current advancing agreements — updated 17 Nov 2026

**Status:** The user approved the new-suit requirements, Pass/scope-boundary approach, revised competitive-raise thresholds, and responder-interference scope on 17 Nov 2026. The detailed current decisions are in the **approved competitive advances and responder interference** section below, which supersedes older provisional and historical thresholds. **No bidding code is authorized by this documentation update.**

### Agreed treatment of the quiet auction `1NT – natural 2X – Pass – ?`

- **Pass:** Legitimate when advancer lacks a sufficiently good action, even with 11–12 HCP and poor fit; no inherited 10-HCP ceiling. Do not automatically qualify Pass as an equal alternative where a constructive bid qualifies; use the approved hand-specific Pass predicates and judgment explanation below. Preserve DONT-on behavior.
- **Competitive raise to `3X`:** Nonforcing, **not a routine game invitation**. See the approved exact three-card and four-or-more-card HCP/shortage-point bands below. Do not rely on shortage points alone; two-card support normally does not justify a raise. Check eligibility using realistic complete practice deals.
- **Economical new suit at the two level — agreed:** Natural, **nonforcing**, and a serious offer to play in advancer's own **independently strong suit**, not merely a declaration of six cards. Advancer is proposing that suit as a better contract despite partner's known 6+ card suit, even if overcaller has no support for advancer's suit. This is a practical bidding judgment; the rule establishes a sufficiently strong reason to suggest the new trump suit, not proof that it will take more tricks.
  - **7+ HCP in the entire hand.** Do not waive this floor just because the suit is unusually strong; it is distinct from the suit-independence test.
  - **6+ cards in the new suit**. Six-card suits need especially strong honor concentration; seven and eight cards can achieve the same published suit-quality threshold with fewer counted honors. No five-card exception is agreed.
  - **Klinger's Suit Quality Test: score at least 10**, adding suit length and qualifying honors (A, K, Q, J, 10, with J/10 counting subject to higher-honor support). This is the established 'self-sufficient suit' / Rule of 10 teaching guideline; it assesses the suit's independent quality, not whether the whole hand is strong enough to bid.
  - **Also pass the existing `hasPreemptSuitQuality`** (at least two of A/K/Q or three of A/K/Q/J/10). The combination is deliberately conservative: it prevents suit length alone from validating extremely weak honors. Use a small dedicated helper, e.g. `hasIndependentSuitQuality`, without changing the general preempt helper or adding a trick-taking simulator. Verify the exact published definition for qualifying lower honors when coding.
  - **Normally 0–1 cards in partner's overcalled suit**; with two or more, the known fit makes abandoning it more of a judgment case.
  - **Only economical two-level calls are included:** after 2C, 2D/2H/2S; after 2D, 2H/2S; after 2H, 2S; after 2S, no such call.
  - **Examples of suit quality, not full hands:** KQJT65 (6 cards + 4 honors = 10) needs at least 1 additional HCP outside to meet the 7-HCP total; AKQJ65 qualifies by length/quality and HCP; AQJ8643 (7 + 3 = 10, 7 HCP) qualifies; AQ8765 (6 + 2 = 8) fails the independent-suit test even though it passes existing preempt quality.
  - **No inferred permission to make all high-quality suit changes:** Some close situations still favor Pass. Keep learner explanations clear that the new suit is an *offer to play* rather than a forcing or constructive game try.
- **Overcaller continuation (settled):** Pass after either nonforcing advance in a quiet DONT-off auction, regardless of overcaller's HCP or fit for the new suit. Do not automatically correct at the three level, bid game, or apply a special game-prospect boundary; rare exceptional game decisions remain outside this teaching simplification.
- **Defer:** Three-level new suits, 2NT inquiry, routine natural 3NT, direct games without sound evidence, and broader later competitive auctions. Review responder's intervening Double/action as a separate subfamily after the quiet auction.

### Approved Pass and scope-boundary approach — 17 Nov 2026

These principles were reviewed and approved for DONT-off. They are *design agreements*, not a request to change bidding code. The updated numerical thresholds and responder-interference treatment appear in the later approved section.

- **Bridge legitimacy versus qualifying rules:** A student may legally Pass even when an aggressive natural overcall or advance qualifies. Do not certify Pass as an automatically qualifying, equally ranked alternative in every such case. A rejected/mismatched Pass explanation can acknowledge that a conservative Pass is reasonable, especially given vulnerability and other unmodeled judgment. Preserve the current evaluator architecture and existing DONT-on behavior.
- **Direct overcaller:** When a natural 2-level suit bid qualifies, prefer that concrete qualifying call; the fallback Pass is suppressed as it is today. When no natural suit qualifies, an ordinary hand can qualify for Pass. Strong hands without a confident natural action must reach the strong-hand judgment boundary, not an invented penalty Double or automatic Pass. A good natural suit can qualify on a strong hand; penalty Double may still be an unmodeled judgment option.
- **Advancer in `1NT – natural 2X – Pass – ?`:** Build a dedicated DONT-off Pass predicate, not a general evaluator change. Pass qualifies when there is no qualifying competitive raise, no independently strong natural two-level new suit, and no applicable exceptional-hand judgment boundary. Do *not* import the existing advancing 10-HCP ceiling. For example, a poor-fit 11–12 HCP hand may reasonably Pass.
- **Constructive advance priority:** A qualifying 3X competitive raise or qualifying independent two-level new suit should disqualify the fallback Pass as positive teaching guidance. Retain clear feedback for a student who Passes regardless; do not introduce a preferred/acceptable/questionable-call taxonomy.
- **Exceptional fit:** A strong-support hand above the competitive 3X range should not fall through to Pass simply because 3X no longer qualifies. Use a specifically scoped judgment boundary when game prospects are too uncertain to evaluate. The boundary must be mutually exclusive with *all* concrete eligible bids, especially the fallback Pass, because `maybeSuppressScopeBoundaryWhenBidApplies` suppresses it otherwise.
- **Exceptional misfit:** Ordinary 11–12 HCP with little support may Pass; assess whether substantially stronger hands without a suitable two-level new suit need a separate judgment boundary. Do not invent an upper Pass cap without examining credible hand situations.
- **Minimal implementation:** Keep `maybeSuppressPassWithoutOtherAction`, other global ranking/qualification behavior, and generic boundary suppression as-is. Define focused eligibility/evidence helpers in the DONT-off overcall/advance families, with targeted explanation and test changes. Preserve a temporary comparison baseline of current-master DONT-on rule matches, alternatives, ranking, turn statuses, and explanations before learner-facing code edits.

**Next design analysis (now in progress):** verify the provisional three-card 7–10 *total points with shortage* and four-card 4–6 *total points with shortage* (with an HCP floor) competitive raises; investigate stronger-fit boundaries and high-HCP misfits. Only after agreement, review a small 2NT/game-interest scope, responder intervention, overcaller rebids, and opening-side continuations.

### Earlier integration checklist (superseded where resolved by final review)

1. Validate the **approved three-card versus four-or-more-card competitive raise bands** with credible complete deals, accounting for opposing 15–17/16–18 1NT, available HCP, vulnerability omitted from the app, and existing shortage valuation. Check strong-support judgment boundaries and the no-fallback-Pass invariant.
2. **Next priority: Pass coexistence and scope boundaries.** Trace the selected student calling Pass when a marginal natural overcall or advance qualifies; inspect `maybeSuppressPassWithoutOtherAction`, qualifying alternatives, rejected-call explanations, strong-fit/game-interest boundaries, and whether Pass or a concrete bid inadvertently suppresses necessary judgment guidance. Decide on minimal, agreement-gated behavior before any code generation, preserving DONT-on results.
3. When implementing the agreed new-suit test, confirm the precise honor-count convention for Klinger's Rule of 10 and make sure the 7-HCP floor and existing preempt-quality check each apply independently. Check explanation evidence and sample *complete* deals, but do not reopen the agreed 7-HCP minimum or the nonforcing meaning merely because a rare expert exception exists.
4. Subsequently inspect a narrow selection of 2NT/game continuations, intervening responder action, opener/responder continuations, credible practice deals, and full temporary explanation/evaluation baseline comparisons. No bidding code is yet authorized.

Relevant teaching: ACBL District 16's Meckwell teaching sheet specifies that advancer needs a six-card-or-longer suit strong enough to play opposite a singleton when choosing their own suit (https://www.d16acbl.org/Teaching_Material/Meckwell.pdf). David Loeb's Meckwell discussion calls 2S after natural 2H a natural offer to play (https://www.loebbridge.com/index.php/bridge-articles/meckwell-defense-to-1nt). These are analogies, not an agreement to implement Meckwell. Further source for the agreed independently strong suit test: Ron Klinger, *The Suit Quality Test* (https://csbnews.org/en/the-suit-quality-test-by-ron-klinger/); ACBL Unit 390 teaching examples (https://www.acblunit390.org/Simon/ltc.htm).

## Approved competitive advances and responder interference — 17 Nov 2026

The user **approved** the following criteria and scope, for DONT-off natural 2-level overcalls of an opposing strong 1NT. This section replaces provisional raise thresholds above and in the older historical checkpoints. These are design decisions, **not a request for immediate bidding-code changes**.

### Competitive raise eligibility and boundaries

- **Exactly three trumps:** nonforcing, competitive `3X` with **7–10 total points with shortage and at least 6 actual HCP**, provided actual HCP is **below 10**.
- **Four or more trumps:** nonforcing, competitive `3X` with **4–10 total points with shortage and at least 4 actual HCP**, provided actual HCP is **below 10**. This closes the artificial 7–10 support-point gap for four-card support that would arise from requiring 6 HCP in that band.
- **Strong-support judgment boundary:** with **three or more trumps**, **11+ total points with shortage OR 10+ actual HCP**. Do not turn the threshold into an automatic game/invitation; recognize that fit, shortage and playing tricks need judgment. This boundary and routine `3X` eligibility must not both qualify. Two trump generally do not justify a raise.
- **Ordinary poor-fit Pass:** 11–12 HCP without an independent playable economical new suit can still qualify in a quiet auction; a **13+ HCP** poor-fit/misfit boundary is an approved *candidate* for the quiet auction, not a universally validated expert threshold. Do not let fallback Pass suppress a qualifying scope boundary. When responder has shown constructive values after 1NT, the known HCP commitments normally rule out a 13-HCP advancer.
- **Pass feedback:** Legally passing even with a qualifying competitive action can be reasonable; it is not automatically an equally qualifying teaching alternative. Preserve existing evaluator suppression/ranking, with focused DONT-off explanations.
- These values are **BiddyBop teaching thresholds**, not partnership rules proved by the Law of Total Tricks; use complete 52-card, 40-HCP deals to validate and refine tests. Don't conflate shortage points with actual HCP.

### Advancer after responder interferes

- **Natural negative/takeout Double:** When DONT is off and responder Doubles the natural 2C/2D/2H/2S overcall, retain the existing **negative/takeout** partnership interpretation currently available against natural 2S. Expand the *meaning and active agreement* consistently; **review the actual shape/strength requirements for responder's Double**, particularly whether `2C`/`2D` should really require four cards in *both* majors. Do not silently turn this into a penalty Double. With `15–17` 1NT, the current model ordinarily uses 8+ HCP for responder's constructive action; with `16–18`, 7+ (confirm the actual code paths before implementation).
- After `1NT – natural 2X – Double – ?`, advancer may **Pass** without a suitable action, make a qualifying **nonforcing competitive 3X raise**, or bid an **economical natural nonforcing independent new suit** if it meets the agreed `7+ HCP`, `6+ cards`, `Klinger SQ ≥10`, preempt-quality, and low-support requirements. Double has used no bidding level; keep natural calls legal when available. **Do not assign an executable Redouble** in this stage. The explanation for Pass must not falsely imply partner is certain to play an undoubled partscore; the 2X bid can remain doubled if opener Passes.
- After responder's **natural two-level suit** (`1NT – 2X – 2Y – ?`), advancer may Pass, competitively raise 3X, or bid an independently strong natural new suit **only if still economical and legal at the two level**, and not a suit the opponents have naturally shown. Do not assign advancer's Double a penalty, takeout or other meaning without an agreement. Three-level new suits remain out of scope.
- **HCP commitments:** A constructive negative Double or natural two-level response after a 15+ HCP 1NT and an overcall requiring 7+ HCP leaves at most 10 HCP for advancer when responder requires 8+ (or 7+ with a 16+ opening). No 13-HCP poor-fit boundary is needed *in this constructive-responder-interference subfamily*. Shortage-adjusted strong-support hands still require the boundary above.
- **Bidding space matters:** An opposing suit response can consume the economical new-suit option and reveal where responder has length. Distinguish it from a negative Double. Require correct turn/stage detection and actual meaning for both partnerships; do not blindly reuse quiet-auction predicates.
- **Not currently executable:** Advancer Double/Redouble, unusual higher-level responder continuations, 2NT/3NT and games, and penalty decisions. These need later review or a clear scope boundary; don't invent agreements.
- **Continuation dependency:** Review the opening 1NT partnership's responder-call meanings, negative-Double shape tests, and opener rebids after both advancer Pass and competition before coding this family. In DONT-on mode preserve the conventional 2C/2D/2H interference meanings, and natural 2S meaning.
- **Testing:** All four direct natural 2X suits after negative Double; representative legal natural responder suit overcalls and changed candidate space; weak four-trump 5-HCP/8-shortage-point raise; boundary/no-fallback-Pass; same-auction different agreement meanings; complete current-master DONT-on matched rules, alternatives, ranking, statuses and explanations.

### Latest opening-partnership review completed — 18 Nov 2026

The opening 1NT responder/opener continuation analysis has now been reviewed and approved in principle; its detailed meaning choices, source dependencies and final checks are recorded in the **Agreed 1NT opening partnership treatment after natural interference** and **Implementation constraints and next-chat handoff** sections immediately below. The next step is a new-chat final integration review and scoped implementation plan, **not** immediate coding. The separate systematic sandwich-seat project remains deferred.

## Agreed 1NT opening partnership treatment after natural interference — 18 Nov 2026

**Decision checkpoint:** The user approved the direction and recommendations from the 18 Nov analysis of the opening-1NT partnership. Record these decisions for the final integration review. They are **design agreements, not permission to implement code now**. Preserve explicit checks where a detailed shape/call rule still needs final validation. This section supersedes the older 'immediate next analysis' instruction above.

### Responder's first call after a natural DONT-off 2X overcall

- **Reuse the existing shared natural-1NT-interference response meanings and HCP ranges**, rather than creating duplicate DONT-off rules. These currently serve natural DONT-on 2S over a 1NT opening *and* the separate case of a natural 1NT overcall of a suit opening. The DONT setting must alter **only** the 1NT-*opening* interpretation, not the latter.
- **Pass:** 0–7 HCP with the 15–17 range (0–6 with 16–18). This is a model's supported weak action, not an assertion that Pass is the only practical bridge choice.
- **Economical natural nonforcing two-level new suit:** 8+ HCP (7+ with 16–18), 5+ cards, and two of A/K/Q in the suit. A weak 5–7 HCP escape into a strong long suit can sometimes be sensible in bridge but remains *outside* the initial executable range; don't silently adopt Lebensohl or treat direct two-level suit responses as weak relays.
- **Economical natural three-level new suit:** 10+ HCP (9+ with 16–18), 5+ cards and two of A/K/Q. Constructive but **nonforcing** under the chosen simplified treatment; opener may Pass with an appropriate minimum. Do not accidentally promote a natural 3C/3D to a game force.
- **Natural 2NT invitation:** balanced with stopper in the opponent's *actually shown* suit and 8–9 HCP (7–8 with 16–18).
- **Natural 3NT:** balanced with opposing-suit stopper and 10–15 HCP (9–14 with 16–18). Preserve selected 1NT-partnership HCP shift and hand-evidence requirements.
- **Negative/takeout Double (not penalty):** at least 8 HCP (7 with 16–18). Under natural 2C or 2D, require **4+ hearts and 4+ spades**; under natural 2H, **4+ spades**; under natural 2S, **4+ hearts**. Also require **at most two cards in the opponent's naturally bid suit** (approved conservative takeout-oriented refinement). Other partnerships play broader meanings, but a known major fit avoids inventing a correction auction. Preserve clear hand-specific explanation of the shape and nonpenalty meaning; confirm exact code pathways/complete hand examples during integration review.
- **Stayman, Jacoby and Texas off after natural interference** in this simplified responding family, as already taught. No Lebensohl, artificial 2NT relay, automatic penalty Double, or unspecified cuebid agreements. Existing *DONT-on* 2C/2D/2H artificial defense and 2H two-major continuations must keep their established meanings.

### Opener's next turn after responder's Double or natural suit

- **After negative Double and advancer Pass:** show an actual **known 4–4 major fit** at the cheapest *legal* level. Over natural 2C or 2D, bid 2H with 4+ hearts or 2S with 4+ spades but no suitable hearts; if both fit, prefer hearts first (up-the-line teaching simplification). Over natural 2H, bid 2S with a four-card spade fit. Over natural 2S, bid 3H with a four-card heart fit. This generalizes the current natural-DONT-2S/heart-fit rule; do not duplicate its logic.
- **No qualifying major fit after Double:** retain the existing minimum/middle stopped **2NT** and maximum stopped **3NT** opener rebids, with the real opposing suit determining the stopper. Where neither fit nor sound stopped notrump action qualifies, teach a judgment/scope boundary; do not mechanically convert the Double for penalties or force an arbitrary suit. Penalty conversion may exist in expert bridge but is not an executable automatic recommendation here.
- **After a natural nonforcing response with advancer Pass:** reuse the current **Pass / supported-major invitation or game / suitable stopped 3NT** approach, preserving opener's strength, fit and stopper criteria where their semantics apply. Distinguish level-two from constructive level-three responses, including nonforcing minor bids. Do not infer both opposing majors from a natural 2H overcall.
- **After advancer raises the natural overcall following responder's Double:** add only selected cheap natural known-fit major continuations while legal (e.g. 1NT–2H–Double–3H–3S with opener holding 4 spades); otherwise use a meaningful judgment boundary. In 1NT–2S–Double–3S–?, four hearts now require 4H: don't automatically choose game.
- **After a natural responder-suit response and advancer's later raise:** explicitly recognize carefully selected physical opener turns and give a **judgment boundary initially**, not an unconditional competitive bid or silent stage-null. Do not enable all uncontested opener-rebid rules by removing the competition gate.
- **Responder second turn after a modeled opener invitation:** narrowly investigate Pass versus acceptance (e.g. 1NT–2H–2S–Pass–3S–Pass–?), using the agreed strength/fit and forcing meaning; add only if the full continuation is teachable and stage detection remains sound. Otherwise end the practice exercise after its last supported interesting call and state the scope limit. Do not automatically build a broad responder-rebid family.

### Confirmed source dependencies and integration risks

- `src/models/auction.ts`: `getPartnerOneNtSuitInterference` currently treats only direct DONT 2S as natural after a 1NT *opening*; with DONT off recognize all four natural 2X suits. Preserve its separate meaning after a natural 1NT *overcall*. `isSupportedCompetitiveOpenerRebid` currently admits selected negative-Double plus 3X support auctions but not the natural-suit responder followed by competitive raise; extend only reviewed patterns.
- `src/models/natural-1nt-interference-partner-calls.ts`: reuse the existing shared Pass, natural two-/three-level suits, 2NT, 3NT and negative-Double rules. Its negative-Double predicate already checks selected 4-card majors but needs the agreed opposing-suit shortness. `DontTwoMajorInterferenceResponseRules` and its artificial-DONT 2C/2D/2H scope boundary must be **agreement-gated to DONT on**.
- `src/models/opener-rebidding-functions.ts` and `opener-rebidding-rules.ts`: `getOneNtInterferenceContinuation` is restricted to 2H/2S and has special two-major DONT-2H logic; `getOneNtDoubleFit` currently knows only the DONT 2S/heart case. Generalize actual opponent suit(s), fit selection, stopped NT, level-two/three natural response continuation, evidentiary facts and meaning. Preserve DONT-on 2H's **two naturally shown major suits** and current separate continuation. Don't copy entire helpers into DONT-off twins.
- `src/models/biddingEvaluation.ts`: `auctionContextMatches` currently calls the natural interference helper without `BiddingSystem`. Thread the setting to the existing matching path in a focused way; `RuleEvalContext` itself does not carry system today. `CallRefinementFunction` and `AppliesWhenFunction` already accept the system. Keep evaluator behavior and stage guards unchanged except for necessary contextual wiring.
- `src/models/explanations.ts`: opponent-suit evidence, fit, negative-Double requirements, alternative-call explanations, and DONT-on two-major assumptions must agree with active agreements. Compare full before/after learner-facing outputs, not only supported calls. For identical call strings under opposite settings, preserve *different meanings* even when the selected call is the same.
- Cross-check the actual legality and hand criteria of every proposed continuation, including negative Double after 2C/2D and the response HCP shift. These are approved *teaching decisions*, not claims of automatic suitability for every deal.

## Implementation constraints and next-chat handoff — 18 Nov 2026

**Nonnegotiable instruction from the user:** Years of code-organization and explanation cleanups must not be undone by a large greenfield DONT-off implementation. Read `docs/code-style.md`, `docs/spec.md`, and the latest GitHub `master` **before proposing implementation diffs**, and preserve introductory comments and established `////` sections.

- **Top-down source order:** Put higher-level callers *before* callees; keep related types immediately ahead of their users. Honor existing `//// Descriptive section` organization; make new enduring `////` sections only where a genuinely distinct bidding family requires one. Keep purpose-specific `///` top-level and `//` inline comments, including original substantive comments. No random (batch/week) work-unit section tags, ceremonial wrappers, or unrelated style rewrites.
- **Prefer parameterizing existing code:** If an existing coherent helper can accept one or two extra parameters or a few explicit branches for agreement-sensitive meanings, **extend it** rather than copy most of it into a `DontOff*` variant. Use existing data shapes, candidate refiners, rules, shared hand facts and evidence builders. Do not create a duplicated natural-1NT response family, second stage evaluator, rule-matching framework, or large ID-based conditionals. Parameterize only where the concepts truly share meaning; preserve distinct rule declarations/explanations where DONT-on relay semantics and DONT-off natural semantics actually differ.
- **Inspect all call sites and siblings before a shared-helper edit.** In particular, the existing natural 1NT-interference helper serves *both* our 1NT opening and our natural 1NT overcall of a suit; changes to the former must not alter the latter. Audit agreement propagation, stage matching, rule categories, legal calls, scope-boundary suppression, practice deal selection, explanations, and tests before choosing where a parameter belongs.
- **No accidental behavior changes:** The intended final default is DONT **off**, but preserve all existing DONT-on supported call IDs, rankings, candidate alternatives, stage and scope statuses, and explanation text when DONT is **explicitly enabled**, unless a specific instructional correction is discussed and approved. Before code edits, capture *temporary* comparison output from a known GitHub master baseline and review every difference; don't add permanent wording snapshots.
- **Incremental coding only after approval:** Outline small batches with narrow file lists, semantic goal, shared-function diff/ordering risks, focused high-value tests, and a single proposed past-tense commit subject **shown before each code generation**. Run the build and complete rule tests; use branch/commit/PR/squash merge. Avoid extra permanent testing infrastructure or broad refactors.
- **Practice-exercise integrity:** Verify all four 13-card hands, 52 unique cards and 40 total HCP; opponent actions should be plausible under the same selected 1NT range. Add representative quiet and intervened advances, paired agreement cases, and follow-ups; stop at the last teachable decision without unnecessary closing Passes.

### Earlier next-chat handoff (superseded by final review and batches above)

1. **Final bounded bidding-meaning review:** Confirm the newly agreed 1NT negative-Double shortness/shape details, natural two-/three-level nonforcing response distinctions, opener's cheap fit bids when advancer competes, and whether the narrow responder Pass/invitation-acceptance rebid is worth implementing now or deferred. Find any forcing/meaning conflicts or missing legal auction case; do **not** expand into a complete new NT competitive system.
2. **Full cross-file integration review:** Map setting UI/types/default, opening and 1NT-overcall parsing, DONT-on/DONT-off rule activation, direct overcalls, advancing (quiet/competition), overcaller rebids, responder initial actions, opener continuations, selected responder second turns, explanations, rule tests, and practice buckets. Identify shared helpers to **parameterize** instead of duplicate. Confirm exact code style and maintain coherent caller-before-callee order/`////` sections.
3. **Implementation plan and temporary baseline:** Produce an ordered small-batch plan with precise source boundaries, testing and per-batch commit subjects, baseline capture, and a focused risk checklist. Get user approval **before** editing any executable code. The separate, systematic sandwich-seat workstream stays deferred until DONT is finished.
4. Use the **latest GitHub master** as authoritative. This document contains the accumulated approved direction, superseding the later sections labeled 'historical' or 'earlier checkpoint' where they differ. Do not ask the user to re-explain the already recorded decisions.

### Separate workstream after DONT — systematic sandwich-seat bidding review

**Decision, 17 Nov 2026:** The uncovered auction is evidence of a *material coverage gap*, likely arising from the order in which the existing rules were developed, rather than a consciously chosen narrow exception to avoid. Do not describe it as merely one missing `1S` rule or limit the future solution to one-level bids. Complete the current optional-DONT analysis and, if practical, its implementation first; then undertake a **full, stage-by-stage sandwich-seat design and implementation review** as a distinct workstream. The user expects this auction to arise frequently in New Deal mode.

**Triggering complete deal and auction** (from a New Deal report):

- North ♠ A Q 9, ♥ A Q J 9, ♦ 7 5, ♣ J 8 7 4; East ♠ 8 4 3, ♥ 10, ♦ A J 10 9, ♣ Q 10 6 5 3; South ♠ 2, ♥ K 8 7 4 2, ♦ 6 4 3 2, ♣ A 9 2; West ♠ K J 10 7 6 5, ♥ 6 5 3, ♦ K Q 8, ♣ K.
- `1C – Pass – 1H – 1S – ?`: West has a natural, well-supported **sandwich-seat** `1S` with 12 HCP and six spades headed K-J-T. North has 14 HCP, four hearts headed A-Q-J, and 15 *total points with shortage*, enough to consider economical `2H` support opposite South's 1H response. Both turns currently receive **no bidding guidance**, `stage: null`.
- These are natural, teachable decisions; the absence of guidance results from the auction-stage/supported-auction coverage, not from West's or North's hand failing the ordinary suit-quality/support criteria.
- Sandwich seat is **not balancing**: the auction `1C – Pass – 1H – ?` follows an actual response by the opening partnership, whereas balancing follows two Passes after opening.

**Future analysis must be systematic, not a patch for this single example:**

1. Inventory all `1-suit opening – Pass – response – sandwich action` entry auctions, with a meaningful distinction between responder's one-level and two-level calls, strength, forcing status, and what has been shown; do not silently extend direct-overcall meanings to this later position.
2. Analyze sandwich player's **Pass, natural one- and two-level overcalls, Double, and selected other actions** using bridge references and practical priorities, explicitly deciding what to model or leave at a judgment boundary. Include hand conditions, agreement meanings, and evidence/explanation requirements.
3. For the opening partnership, systematically review **opener's rebids after sandwich interference**, including simple raises, other natural rebids, Doubles where relevant, forcing obligations, and the distinction between ordinary support and support-Double partnership agreements. Do not blindly enable all uncontested opener rules.
4. Review **subsequent responder, advancer, sandwich-overcaller rebids, and continuing competitive auctions**, selecting coherent, common and teachable cases; make deliberate scope decisions only after the end-to-end coverage audit. Reuse or parameterize the existing advancing, overcalling, and opener-rebid calculations where meanings genuinely align, and create dedicated rules/evidence when they do not.
5. Add credible four-hand practice deals, focused stage/rule/explanation-delivery tests, and temporary before/after matched-rule/alternative/status/explanation comparisons; preserve currently covered auctions and agreed code style. Document specific *remaining* scope limitations in `docs/spec.md` rather than assuming this auction must stop.

**Relationship to DONT-off work:** This gap occurs over a **suit opening**, regardless of DONT being on or off; keep its future rules independent of the DONT setting. Preserve this workstream here to avoid losing it during chat resets, then move it into a dedicated plan or `docs/spec.md` when the sandwich review begins. **The DONT-off implementation plan is recorded above; sandwich-seat implementation remains deferred.**

## Approved quiet-auction natural overcaller rebids — 17 Nov 2026

The user approved the rebid meanings and closed the exceptional-game question on 17 Nov 2026. They apply **only when DONT is off** and the auction began with an opposing strong `1NT` opening and a natural two-level suit overcall. **The two quiet-auction rebids are fully designed: Pass without an HCP/shape exception.** No bidding-code changes are authorized by this documentation decision.

### Quiet auctions and rebid meanings

- **After a competitive nonforcing raise:** `1NT – natural 2X – Pass – 3X – Pass – ?` (any of 2C/2D/2H/2S), overcaller **Passes**. Advancer's `3X` is competitive and less than invitational; overcaller has no further bidding obligation and no game-acceptance test is applied.
- **After an economical, independent, natural new suit:** `1NT – natural 2X – Pass – 2Y – Pass – ?`, with `Y` different from `X` and legally available at the two level, overcaller **Passes, even with zero cards in advancer's suit**. Advancer offered a long, independently strong, playable suit—not a relay, forcing bid, or game try. Do not require support for the new suit, force a three-level correction, or test HCP to authorize Pass.
- **Available economical advances:** 2C → 2D/2H/2S; 2D → 2H/2S; 2H → 2S; 2S → none. Across four same-suit raises and six economical new-suit auctions, reason through the ten legal shapes, but add only representative tests and practice deals; the rule design need not declare ten independent rules.
- **Exceptional game-prospect investigation CLOSED — no extra rules:** Rare exceptionally strong overcallers may reasonably consider game, but HCP, suit length, and fit alone are not reliable enough to identify those decisions. For these **quiet auctions**, always support Pass independent of overcaller's HCP, suit length, or fit; do **not** add special game bids, an exceptional-game scope boundary, or a strength threshold borrowed from weak-two defenses. Explanation may briefly say unusual hands can require additional judgment, without making that judgment an executable requirement. This is a deliberate simplified teaching choice, not a claim that Pass is uniquely best on every possible hand.
- **If the original 1NT opener competes instead of passing** (e.g., `1NT – 2H – Pass – 2S – 3C – ?`), this is *not* a quiet auction. Neither automatic Pass rule should apply. Evaluate this auction family separately, with a deliberate scope explanation in the interim.

### Existing code, agreement differences, and test safeguards

- `src/models/auction.ts` already recognizes the physical fifth-turn `overcallerRebid` stage for these auction shapes. The missing piece is the **DONT-off rule family**, not a broad stage-selector rewrite.
- In `src/models/overcalling-rules.ts`, existing `overcaller-rebid-dont-pass-or-correct` handles conventional DONT continuations. Gate it to **DONT on** and add separate DONT-off natural rebid rules/eligibility and suitable explanation evidence; reuse auction parsing where meanings truly coincide.
- These identical call sequences carry **different meanings**: `1NT–2C–Pass–2D–Pass` is a DONT relay when enabled, but natural diamonds offered as trumps when disabled; similarly `1NT–2D–Pass–2H–Pass` and `1NT–2H–Pass–2S–Pass`. The eventual Pass might be the same, but qualifications, explanation text, alternative calls, and active agreement must remain correct.
- Overcaller may infer only what advancer's bid **promised**; do **not** inspect advancer's hidden hand to judge whether Pass or a correction qualifies, despite all four hands being represented internally.
- Use two focused positive families: Pass after a competitive raise; Pass after a nonforcing independent new suit. **No overcaller strength/fit exclusions or exceptional-game boundary** in these quiet auctions. Preserve the current evaluator's behavior; the separate **advancer** strong-support/misfit boundary proposals still apply at advancer's earlier turn.
- Verify DONT-on rule IDs, qualifying calls, alternatives, ranking, scope statuses, and full learner-facing explanations against the temporary master baseline. Add focused DONT-off tests for representative quiet shapes and a small number of paired agreement tests for same-auction/different-meaning relays.

### Next analysis, before code generation

**Next substantive analysis:** Advancer's turn when the original 1NT responder **Doubles or bids a suit instead of Passing** (`1NT – natural 2X – Double/2Y/... – ?`), including which earlier quiet-auction Pass, raise, and independent-new-suit rules survive or must change. Distinguish opener's side's 1NT interference agreements and preserve DONT-on meanings. Then consider selected subsequent responder/opener continuations, realistic four-hand practice coverage, and implementation batches. **No further quiet overcaller exceptional-game analysis is planned.**

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
- **Overcaller follow-ups (superseded by approved quiet-auction design above):** Pass either nonforcing advance, even if void in advancer's independently strong new suit. No exceptional game rule or boundary for these quiet auctions. Different, actively competitive later auctions remain subject to separate analysis.
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
