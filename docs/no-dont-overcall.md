# BiddyBop — Sandwich-seat bidding review

**Status:** Active bidding design and implementation planning; no executable sandwich rules or implementation batches approved. The optional DONT/natural defense of an opposing strong 1NT is **completed** and specified in [spec.md](spec.md). This file is only for the separate sandwich-seat workstream over **one-level suit openings**, independent of the DONT setting.

## Purpose and motivating deal

The current missing auction is `1C – Pass – 1H – 1S – ?`. In a New Deal report:

- North (opener): ♠ A Q 9, ♥ A Q J 9, ♦ 7 5, ♣ J 8 7 4 — 14 HCP; four-card heart support and 15 total points with shortage.
- East (sandwich advancer): ♠ 8 4 3, ♥ 10, ♦ A J 10 9, ♣ Q 10 6 5 3.
- South (responder): ♠ 2, ♥ K 8 7 4 2, ♦ 6 4 3 2, ♣ A 9 2.
- West (sandwich overcaller): ♠ K J 10 7 6 5, ♥ 6 5 3, ♦ K Q 8, ♣ K — 12 HCP and a sound six-card spade suit headed K-J-T.

West's natural `1S` and North's subsequent economical `2H` are ordinary, teachable decisions, but both were `stage: null` before sandwich coverage. North's `2H` is already supported when West instead Passes. The work must repair **whole-auction continuity**, not add one isolated overcall rule.

## Roles, stage names, and terminology

- Preserve existing `overcaller` and `advancer` for the **direct-overcall** family. Use `sandwichOvercaller` for the opponent who intervenes after `one-level suit opening – Pass – responder action`, and `sandwichAdvancer` for that bidder's partner. North/South remain opener/responder in the example; West/East are sandwich overcaller/advancer.
- A sandwich advancer necessarily Passed **immediately after this opening**. Do not assume that either player previously passed before the opening bid. A previously passed sandwich bidder's special 1NT meaning is low priority.
- Keep fourth-position **balancing** after `1x – Pass – Pass – ?` separate from a sandwich entry after an actual responder bid.
- In `auction.ts` where existing variables `overcaller`/`advancer` identify seats even when no one has overcalled, prefer **`seatAfterOpener`** and **`seatAfterResponder`**; `afterOpener`/`afterResponder` are acceptable if shorter and equally clear. Avoid `directSeat`, `fourthSeat`, `directOvercaller`, and `directAdvancer` as blanket replacements. No unrelated renaming.
- Provisional new stages: `sandwichOvercalling`, `sandwichAdvancing`, `sandwichOvercallerRebid`. Opener/responder continue to use `openerRebid`/`responderRebid`, with explicit sandwich context. **Finalize exact stage implementation only after cross-file integration audit.**

## Bidding standard and decisions reached

**Primary standard:** Teach sound, commonly understood and reasonably intuitive bridge rather than a collection of expert or highly specialized treatments. Assess each unusual action's prevalence, clarity, incremental instructional value, forcing implications and implementation cost. Favor natural bids, ordinary fit/shape descriptions, useful Pass, and honest judgment boundaries. Do not confuse a 5–4 *holding* qualifying for a two-suit takeout Double with a convention promising exactly 5–4.

**Agreed direction:**

- Sandwich 1NT is **natural**, not artificial Sandwich NT: strong balanced hand and basic stoppers in both naturally named opposing suits. **16–18 HCP is a recommendation, not an approved final numeric range.** Do not invent another 1NT convention for a previously passed sandwich bidder.
- Sandwich Double after opponents name different natural suits is informational/takeout for the **two unbid suits**; ordinary 4–4 shape and sound strength are the starting point. A 5–4 holding can satisfy that promise. HCP boundaries, suit-overcall preferences and a possible stronger 4–3 exception still require review. Never equate this with the existing direct-seat three-unbid-suit takeout Double.
- **Do not implement a specialized opener Double** after sandwich suit interference in the initial scope: no implicit support Double, support Redouble, opponent's takeout meaning, or other artificial treatment.
- Todd's `3H` strong-spade-raise cuebid after `1C – Pass – 1H – 1S – 2H – ?` is **not approved**. Reconsider only with evidence it is common and worth teaching; otherwise prefer ordinary natural actions or a boundary. Do not prebuild its forcing continuations.
- Responder's **reopening/cooperative Double** after sandwich overcall and two Passes, e.g. `1D – Pass – 1H – 1S – Pass – Pass – Double`, **deserves further analysis**, not automatic implementation: evaluate partnership meaning, takeout-versus-penalty ambiguity, hand tests and what happens next.
- Other Family A recommendations remain **proposals to examine**; the user broadly agrees with the direction but has not approved exact HCP bands, all optional calls, or the implementation sequence.

**Pass and judgment:** A supported Pass, a plausible conservative alternative, and a hand beyond reliable judgment are different outcomes. Do not infer Pass when no positive rule qualifies. Do not assign a penalty Double without a declared treatment, or use a scope boundary as an endorsement of Pass. Competition can change the level and meaning of a call; do not mechanically elevate an unavailable uncontested rebid.

## Systematic entry families to analyze

The current practice corpus is neither exhaustive nor the source of bidding policy. Use `docs/spec.md`, the current implementation, and instructional authorities (ACBL/SAYC, Larry Cohen, Audrey Grant, Karen Walker and relevant competitive-bidding references). Examine **each useful later turn** by both partnerships, without a predetermined practice-deal count.

| Family | Response after `1x – Pass` | Design questions |
| --- | --- | --- |
| **A** | Natural **one-level new suit**, e.g. `1C – Pass – 1H` | Ordinary sandwich overcalls/Double/NT/Pass; full opener, sandwich advancer, responder, and sandwich-overcaller continuations |
| **B** | Natural **two-level new suit**, e.g. `1S – Pass – 2H` | Actual Standard versus 2/1 game-forcing response meanings, higher level, forcing and subsequent options |
| **C** | Natural **1NT** response, e.g. `1H – Pass – 1NT` | Responder has not named a second natural suit; forcing/nonforcing 1NT, different Double and NT implications |
| **D** | **Raise** of opener, e.g. `1H – Pass – 2H` | Known opposing fit; natural competition, takeout meanings, Pass and continuation |
| **E** | **Invitational, artificial, jump-shift or game-going** response, e.g. `1S – Pass – 2NT` | Respect actual Jacoby/splinter/jump-shift/other selected meaning; prefer appropriate selected calls or boundaries |

For each family distinguish ordinary bridge principles, optional partnership agreements, teaching simplifications, and decisions not reliably modeled without vulnerability, scoring, defensive-trick or playing-trick judgment. Analyze call legality, HCP, length, suit quality, stoppers, known fits, shortage, force status, rank, suppressors, alternatives, and evidence/explanations.

## Family A — natural one-level new-suit response

**Six entry auctions:** `1C–Pass–1D`, `1C–Pass–1H`, `1C–Pass–1S`, `1D–Pass–1H`, `1D–Pass–1S`, `1H–Pass–1S`. Responder ordinarily shows four or more cards and 6+ HCP in the chosen response, **not a universal maximum**; use the exact current agreement and promise. The same suit bid may be a jump in one auction and economical in another: `1C–Pass–1D–2H` is a jump, whereas `1C–Pass–1S–2H` is not.

### Initial sandwich overcaller

- **Proposed core:** Explicit hand-qualified Pass; economical natural one-/two-level suit overcalls; informational Double of two unbid suits; natural strong 1NT stopped in both opponents' suits; scope boundaries when no reliable choice is established.
- **Tentative requirements, not approvals:** Approximately 10+ HCP with a good 5+ suit at one level; stronger suit/hand for a two-level overcall (normally good 6+, possibly exceptional five); 12+ HCP and 4–4 in unbid suits as a first Double model; natural 1NT around 16–18 HCP with balanced shape and both stoppers. Do not copy direct-seat ranges, automatic upper caps or jump meanings without review.
- Compare competing Double and natural overcall for an unbid 5–4 hand using explicit priorities, not declaration/candidate order. Unusual 2NT, bid of an opponent's suit, jump overcalls and other expert artificial meanings are not automatically in scope.

### Opener after sandwich intervention

- Consider economical **four-card support** of responder's actual natural suit, repeat of a sufficiently long opening suit, legitimate second suit/reverse, natural NT with appropriate opposing-suit stopper, stronger support/game actions, hand-qualified Pass and boundaries.
- In `1C – Pass – 1H – 1S – ?`, North's `2H` is a useful ordinary heart raise. An unavailable `1NT` or `2H` does **not** become an equivalently weak `2NT` or `3H` when a higher overcall consumes space; do not mistakenly retain an uncontested invitational-jump meaning.
- Analyze follow-ups separately after a **natural sandwich suit**, an informational sandwich Double, and natural sandwich 1NT. Do not introduce opener's specialized Double.
- The responder's original forcing and shape promise still matters; competition may alter whether opener can Pass without misrepresenting that promise.

### Sandwich advancer

- After partner's natural suit, examine a real Pass, economical **nonforcing** support, suitably strong and independently playable natural new suit (nonforcing is favored but not yet finally approved), selected natural NT if genuinely supported, competitive actions after opener raises, and exceptional fit/misfit boundaries. No arbitrary upper HCP bound merely because the player Passed over opener.
- After sandwich **takeout Double**, distinguish `... – Double – opener Pass – ?` (partner needs a suitable economical takeout when the double remains outstanding) from `... – Double – opener bid – ?` (a free decision, where Pass may qualify). Avoid incorrectly importing direct-seat advance obligations.
- Reconsider strong-support cuebids only if common and comprehensible; Todd's specific `3H` treatment is not authorized.

### Responder's next turn

- After opener's quiet raise with sandwich advancer Pass, review normal Pass/invitation/game ladder using known support and hand-specific evidence.
- After `1C – Pass – 1H – 1S – 2H – 2S – ?`, South's `3H` may be **competitive**, not the 11–12-point uncontested invitation; distinguish known minimum four-heart support from North's hidden actual hearts. Analyze fit, shortage, alternatives and boundaries.
- After `... – natural sandwich suit – opener Pass – sandwichAdvancer Pass – ?`, consider responder's legitimate Pass, long-suit competition, and the still-open **cooperative reopening Double** investigation. Do not assume responder's first forcing new-suit response always requires a mechanical rebid under interference.

### Sandwich overcaller's rebid and later competition

- After a nonforcing raise or independent suit from sandwich advancer, consider sensible minimum Pass and selected further natural calls. An actual forcing advance cannot be met by an automatic Pass.
- After takeout Double, handle advancer's economical suit choice and only well-supported stronger continuations. After natural sandwich 1NT, evaluate selected ordinary **systems-on** responses and compulsory completions when quiet; do not inherit opening-1NT HCP assumptions or convention use after competition without review.
- Continue while ordinary fit, signoff, invitation or game actions remain teachable. Higher competitive sacrifices, penalty decisions and repeated raises often need scope guidance rather than manufactured certainty.

## Implementation audit and safeguards

- Current entry over `1x – Pass – one-level response` and next opener/advancer turns were unmodeled. Stage detection is **physical-auction dependent**: direct-seat helpers may assume an overcall at `opening.index + 1` or responder Pass. Do not quietly apply them to the fourth-position sandwich intervention.
- `getInterferenceAfterOpening` may report `none` because the first opponent Passed, even after a sandwich intervention. Merely returning `openerRebid` risks turning on **uncontested opener rules**. Explicitly gate sandwich interference in auction matching, opponent-suit/stopper logic and continuation rules.
- Reuse existing stage-specific rule arrays, independent evaluation, natural suit quality, fit/valuation, legal calls, support/NT refiners, and `CallEvidence`/explanations. Prefer a few extra parameters/checks in cohesive helpers over copied versions; retain genuinely different bid meanings in distinct declarations. No parallel evaluator, broad speculative framework, rule-order or candidate-order dependence.
- Code style: callers before callees; types before dependents; preserve substantive comments and `////` sections. Keep direct overcalling, balancing and DONT-on/off outcomes unchanged unless deliberately approved.
- New sandwich turns have **different physical call indices** from direct-overcall test expectations. Extend only the necessary stage-aware assertions. Review complete four-hand practice deals and add them to existing **stage-based** buckets **after** deciding rules; stop at the last important supported call.
- Before each executable batch, capture representative **current-master** matched/rejected rules, alternatives, ranks, turn status/boundaries, and full learner-facing explanation text; review every changed outcome. Target eligibility, forcing, routing, and explanation-delivery tests, not permanent wording snapshots. Use approved small batches, feature branches, concise past-tense subjects, PR/CI and squash merges.

## Next analysis and decisions

1. Complete **Families B–E** with the same authority-based, end-to-end bidding review as Family A; revisit Family A where a shared meaning or simplification becomes clearer.
2. Separate clearly **agreed**, **recommended but not approved**, **requires another partnership agreement**, and **deliberately omitted** treatments. Resolve useful Pass, Double/NT shape, forcing and ranked alternatives, especially responder's reopening Double and the natural 1NT continuations.
3. After cross-family review, propose the smallest coherent rule inventory, limited stage/context changes, implementation batches, representative practice auctions, and final judgments for user approval. **No executable code changes until that approval.**
4. Move finalized bidding meanings and scope into `docs/spec.md` as they become implemented, leaving this file only as the active sandwich work plan.
