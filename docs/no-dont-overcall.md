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

## Family B — natural two-level new-suit response (review accepted 21 Nov 2026)

**Status:** User accepted the practical-bidding analysis and recommendations as the direction for design. Numeric eligibility, advanced forcing-Pass rules, and exact executable inventories are **not yet approved**; defer those decisions until the A–E cross-family review. Family B should be **more conservative than Family A**, especially when an established 2/1 game force already exists.

**Entry auctions:** `1D–Pass–2C`, `1H–Pass–2C`, `1H–Pass–2D`, `1S–Pass–2C`, `1S–Pass–2D`, `1S–Pass–2H`. Not `1C–Pass–2D`: a jump shift in Family E. The current rules' responder promises and overlap with major-support new-suit-then-raise routes must be preserved. In these six natural responses `1D–2C` and `1S–2H` promise 5+ cards; the other normal new-suit routes promise 4+. The Standard response is normally 11+ HCP and forcing one round; the configured 2/1 route normally requires 13+ HCP by an **unpassed** responder and establishes a game force. The *public meaning of the call* must not be inferred from the actual hidden hand or a special support route that happened to qualify.

**Sandwich bidder and initial priority**

- Pass is common and important. Use selectively stronger natural overcalls than in Family A, principally a strong six-card suit or exceptionally good five-card suit; their value may be lead direction as much as finding a contract, so do not demand an arbitrary opening-HCP hand. Determine the exact level, jump status and suit quality from the actual last bid. A three-level economical call over a high two-level response can require much more judgment than a two-level intervention. Do not extend every Family A positive option mechanically.
- A takeout Double, if included, still concerns the two genuinely unbid suits, not the existing direct takeout-Double three-suit shape. Under Standard consider a particularly sound two-suit hand and appropriate values. Under an established 2/1 game force, be notably more conservative; whether a positively recommended Double exists here remains open. **Do not** copy a universal 12+ HCP/4–4 test across both response agreements.
- Do not assign an unreviewed natural or artificial meaning to sandwich `2NT`, unusual cuebids, jump overcalls or higher specialized actions. They can receive a scope/judgment boundary where appropriate.

**Opener and responder: Standard vs established 2/1 force**

- **Standard:** Opposing intervention disrupts the ordinary uncontested one-round response obligation. A minimum opener without a sound description can make a real Pass; selected natural repeats, raises, second suits, reverse, NT with the opponent-suit stopper and sensible game calls remain valid when their actual levels/strength permit. Responder can subsequently Pass or make supported natural continuation without being mechanically forced to game.
- **2/1 game forcing:** Once genuinely established, substantive competition does **not** silently turn it into a weak nonforcing response. A Pass below game may be a *forcing Pass*, not a signoff, and could require penalty/defensive decisions BiddyBop does not model. Initially favor positive natural descriptions and explicit guidance/boundary where a forcing-Pass or penalty-Double system would be necessary; do **not** implement such a system merely to close the auction. Preserve the game-force explanation at later turns, including when a 3NT route is obstructed.
- Existing `1D–2C` Standard reverses such as opener `2S` (extra strength) differ from 2/1's shape-first `2S` at comparable levels. Reuse calculations only if the precise current agreement and forcing meaning align. Do not mechanically promote an unavailable uncontested rebid.
- After opener raises responder's suit, responder's minimum Pass under Standard may be right; under 2/1 an otherwise identical printed raise cannot be described as a nonforcing signoff.

**Sandwich advancer and overcaller follow-up**

- After West's natural nonforcing overcall, East usually Passes with little reason to compete; consider only a sound economical natural fit raise. Avoid automatic independent new suits, NT invitations, cuebids or routine game tries in this strong-opponents auction.
- If a genuine takeout Double is taught and opener Passes with the contract still doubled, East ordinarily selects a sound economical unbid suit; penalty Pass is exceptional judgment. If opener instead bids, East has a free competitive decision rather than an identical compulsory advance.
- After a nonforcing raise or partner's takeout suit choice, West's minimum Pass is ordinary when the opening side is quiet. Stronger/higher competition usually needs a boundary, not extra automatic rules.

**Audit:** A direct-interference two-level new-suit response is **not** this Family B: here South responded *before* West acted. Check compact partnership-auction helpers, `getResponderTwoOverOne`, opener/responding-family overlap, actual physical stages, hand-evidence, Pass eligibility and game-force continuation independently of candidate/rule order.

## Family C — natural 1NT response (review accepted 21 Nov 2026)

**Status:** User accepted Family C recommendations and explicitly favors **including a takeout Double over responder's 1NT** in bidding guidance. Its precise point, shape and subsequent bidding tests remain to be reviewed. Not an artificial strong-1NT defense and **independent of DONT**.

**Entry auctions:** `1C–Pass–1NT`, `1D–Pass–1NT`, `1H–Pass–1NT`, `1S–Pass–1NT`. Responder has **not named another natural suit**, so all three suits other than opener's remain unbid. Cheapest natural unbid-suit interventions are two-level; natural sandwich 1NT is unavailable after responder bid it. Avoid automatically assigning `2NT` an artificial or natural meaning.

**Existing 1NT response promises, including overlapping support routes**

- Minor `1m–1NT`: **6–10 HCP, balanced, no four-card major, nonforcing**.
- Major `1M–1NT` Standard: normally **6–10 HCP, nonforcing**. With 2/1 selected and the nonforcing 1NT setting, the **semi-forcing** treatment normally shows 6–12 and opener may Pass. With forcing 1NT and unpassed responder, normally **6–12, forcing one round if opponents do not interfere**. A previously passed responder cannot establish that force.
- A major-opening 1NT response can be an **11–12-shortage-support-point three-card limit-raise route** when a one-level new suit cannot be bid first, under either forcing/nonforcing setting. Thus major 1NT does not universally promise balanced shape, denies support, or cap support points at the normal no-fit HCP range; what partner can infer must use the public partnership agreement, not hidden hand information.

**Sandwich bidder's recommended calls**

- Support a meaningful Pass and sound natural **two-level** unbid-suit overcalls, generally a good six-card suit or selected exceptional five-card suit with sufficient strength; exact thresholds should be reviewed beside Families A/B, not invented separately.
- **Approved direction: include an informational/takeout Double of opener's suit over responder's 1NT**. The Double is not a promise to play NT or a simple penalty Double of responder's 1NT; it asks sandwich advancer to consider the **three suits other than opener's suit**. The fact that the current contract is literally `1NT doubled` must be explained accurately, and East can sometimes Pass exceptionally for penalties (unmodeled expert decision). Do not imply it is the same two-unbid-suit Double as Family A/B or the existing direct-seat Double. Determine actual shape/support, HCP floor, positive alternatives and priority, and safe advancer continuations in the cross-family review. User finds the intended takeout meaning intuitive in context.
- Avoid initial artificial `2NT`, cuebids of opener's suit, routine jumps and specialized penalty/runout systems without separate instructional value.

**Opener after a natural suit or Double**

- After natural sandwich `2X`, opener may make a genuine minimum Pass whether responder's 1NT was nonforcing, semi-forcing or originally forcing: **substantive opposition has intervened, so do not mechanically manufacture the ordinary forcing-1NT minor fallback**. Reuse legitimate natural opener-suit repeats (usually 6+), genuinely natural second suits, fit/game choices and appropriate NT with opposing-suit stopper at their actual legal levels. If `2H` is no longer legal, `3H` does not automatically carry minimum `2H` requirements.
- After West's takeout Double, the actual outstanding contract is `1NT doubled`; opener's Pass is not the same unopposed undoubled 1NT signoff. Consider selected natural escape bids and boundaries for defend/penalty or Redouble judgment, but do not invent a comprehensive penalty-defense system.
- Current `buildOpenerOneNtRebidEvidence` and related `forcingOneNt` classification examine the agreement and previous Pass; after natural sandwich interference that information needs the actual physical opponent action so explanations do not falsely claim a mandatory manufactured rebid.

**Sandwich advancer, responder second turn, sandwich overcaller rebid**

- East after West's nonforcing natural `2X`: selected Pass, sound economical raise/fit, perhaps only independently compelling natural side-suit exception; avoid gratuitous game, NT and cuebid conventions.
- East after West's takeout Double and opener Pass: normally choose economical natural unbid suit with little strength. If opener bids, East is acting freely and may Pass; distinguish that from an outstanding-double obligation. If East passes the Double for penalties, that is a judgment boundary, not an HCP-only rule.
- Responder after opener Pass and East Pass: generally Pass with a minimum. A concealed three-card **major limit-raise route** may instead justify carefully selected competitive support at the actual legal level. Once opener naturally repeats a suit, responder can consider minimum Pass, legitimate invitation/game or delayed support; don't import an uncontested invitational meaning into an involuntary competitive higher raise.
- A responder's reopening Double after `1M–Pass–1NT–2X–Pass–Pass–?` could be **penalty-oriented in some methods**, not the cooperative/takeout Double we are separately considering in Family A. Do not introduce a generic responder-reopening Double that conflates these.
- After a nonforcing East raise and quiet opponents, West may Pass the competitive contract; repeated higher competition needs selected evidence or a boundary.

**Explanations file checkpoint:** As of 21 Nov 2026, `src/models/explanations.ts` has about **9,440 lines, 50 `////` topical sections and 526 KiB**. User favors keeping a coherent, organized single explanation file rather than arbitrary 15–20-file splits. Analysis agrees **no size-only refactor**; monitor evidence-driven explanation quality, direct rule-ID coupling, duplication and genuinely independent concerns. Extend current sections or add appropriate `////` sandwich groups, keeping callers before callees. No separate split workstream approved.

## Family D — responder's natural simple raise (review accepted 21 Nov 2026)

**Status:** User accepts the overall analysis and recommendations. Reserve decisions **1–3** (how light an economical two-level OBAR-style overcall may be, Double strength/shape over 2H vs 2S, and competitive three-level minor-raise requirements) for the **pre-code-generation detailed design**. No executable code authorized; exact thresholds are proposals, not approved rules.

**Core auctions and publicly known fit:**
- `1C–Pass–2C–?`: responder shows 6–10 HCP, at least five clubs (opener may have three): known **8+ clubs**.
- `1D–Pass–2D–?`: responder shows 6–10 HCP, at least four diamonds (opener may have three): **possibly seven**, not guaranteed eight.
- `1H–Pass–2H–?` / `1S–Pass–2S–?`: responder shows 6–10 *total points with shortage* and three or more major support opposite five-card major: known **8+ major fit**.
- **Higher/invitational/preemptive raises** to 3m, 3M, 4M, plus artificial raises, belong with Family E, not the ordinary simple-raise rules.

**Practical bridge principle:** After opener and responder have found a relatively weak **fit**, competing can be attractive with less HCP than in a constructive two-level-new-suit auction. Larry Cohen's *OBAR BIDS* principle is useful instructional context, **not** a mandate to overcall every weak hand or introduce vulnerability-based sacrifice simulations. Hand suitability and actual legal bidding level are crucial: `1H–Pass–2H–2S` is economical at two; `1S–Pass–2S–3H` forces the partnership to three and needs more caution.

**Proposed initial sandwich actions:** Support a genuine Pass, suitable natural unbid-suit overcall (a good five-card two-level major can sometimes be reasonable with less strength than in Family A; three-level actions generally need extra length/quality), and takeout Double of **opener's suit** with support for the other **three** suits. For Double, consider shortness in opener's suit, three-plus cards in unbid suits and especially four in an unbid major; apply level-sensitive strength because advancer often has to answer at three after `2S`. **Do not** apply Family A's Double promising *two* unbid suits, and do not mechanically import direct-seat HCP. Ordinary Pass may be justified even with 13 balanced HCP and unsuitable suit/shape; do not apply Cohen's advice as an always-bid mandate. Omit initial specialized `2NT`, unusual two-suited cuebids, jumps and general penalty/Redouble continuations.

**Opener's first rebid:**
- After `1H–Pass–2H–2S–?`, a natural `3H` may be **competitive, not invitational**. Share relevant existing opener competitive simple-major-raise hand criteria (often six trumps, 12–16 total points with shortage) without reusing **direct-overcall physical context** or importing the uncontested 17–18-point voluntary invitation. Retain minimum Pass and clear natural `4H` where warranted; do not blindly reuse game tries after active competition.
- With `1D–Pass–2D–2H–?`, `3D` may be competitive rather than the uncontested 17–18-point invitation; use conservative **actual fit** tests, noting the possible seven-card diamond fit. After minor raises, natural 3NT needs appropriate opponent-suit stopper and strength. Do not auto-promote bids to a higher level because an economical one is consumed.
- After sandwich Double, `2M` is literally **doubled** pending further action. Opener can Pass and allow sandwich advancer the next choice, or make an appropriately qualified natural contract bid; don't silently use specialized opener Doubles, Redoubles, penalty/runout agreements.

**Sandwich advancer, responder, and sandwich overcaller:**
- After a **natural nonforcing** sandwich overcall, advancer can normally Pass or make a genuinely warranted **competitive support raise**. Independent forcing new suits, cuebids, NT inquiries and automatic game tries are not a priority. Remember sandwich overcaller may have entered somewhat light.
- After West's **takeout Double** and opener Pass, East should ordinarily choose an economical suit from the three unbid suits, sometimes at level three. After opener instead bids, East has a free competitive decision and may Pass. Share takeout-choice calculations with other families after supplying the correct unbid suits and actual doubled-contract state.
- Responder after `1H–Pass–2H–2S–Pass–Pass–?` may Pass or compete to `3H` with sufficient longer fit, shortage and playing strength; **no automatic rise** merely because an eight-card fit is known. If opener bids competitive `3H` and East Passes, responder's Pass is usually an ordinary signoff, **not** a refusal of game invitation. If East raises to `3S`, responder's `4H` is not automatic; apply exceptional clear qualification or a judgment boundary.
- West may Pass East's nonforcing competitive raise or economical takeout choice. Further sacrifice/penalty/competitive decisions generally require judgment, not invented precision.

**Responder reopening Double (user consistency preference):** Treat `1H–Pass–2H–2S–Pass–Pass–Double` consistently **in coverage policy** with the corresponding A/C reopenings: if our deeper shared review establishes an ordinary, useful, teachable reopening Double and its follow-up, evaluate that treatment here; **if we omit/punt the earlier family**, likewise omit this one with a suitable boundary. Do **not** make Family D an independent specialized exception. Still examine actual meaning before sharing a predicate: after an established raise it may be cooperative-penalty, not necessarily the same takeout meaning as after a one-level new suit or the potential penalty orientation after 1NT. Consistency of whether to model the action is **not permission to conflate distinct meanings**.

**Implementation reuse/hazards:** Existing simple-raise, competitive `3M`, fit/shortage, takeout, Pass, NT-stopper and explanation evidence are reusable when semantics match. `auction.ts` currently classifies physical fourth-seat direct *advancer* actions at the same index as Family D's **initial sandwich overcall**; never interpret that intervention as a direct advance. Explicit stage and physical context protection is required to avoid uncontested invitation/leakage. Keep standard formatting, explanation audit, DONT independence and focused temporary before/after regression comparisons.

## Implementation audit and safeguards

- Current entry over `1x – Pass – one-level response` and next opener/advancer turns were unmodeled. Stage detection is **physical-auction dependent**: direct-seat helpers may assume an overcall at `opening.index + 1` or responder Pass. Do not quietly apply them to the fourth-position sandwich intervention.
- `getInterferenceAfterOpening` may report `none` because the first opponent Passed, even after a sandwich intervention. Merely returning `openerRebid` risks turning on **uncontested opener rules**. Explicitly gate sandwich interference in auction matching, opponent-suit/stopper logic and continuation rules.
- Reuse existing stage-specific rule arrays, independent evaluation, natural suit quality, fit/valuation, legal calls, support/NT refiners, and `CallEvidence`/explanations. Prefer a few extra parameters/checks in cohesive helpers over copied versions; retain genuinely different bid meanings in distinct declarations. No parallel evaluator, broad speculative framework, rule-order or candidate-order dependence.
- Code style: callers before callees; types before dependents; preserve substantive comments and `////` sections. Keep direct overcalling, balancing and DONT-on/off outcomes unchanged unless deliberately approved.
- New sandwich turns have **different physical call indices** from direct-overcall test expectations. Extend only the necessary stage-aware assertions. Review complete four-hand practice deals and add them to existing **stage-based** buckets **after** deciding rules; stop at the last important supported call.
- Before each executable batch, capture representative **current-master** matched/rejected rules, alternatives, ranks, turn status/boundaries, and full learner-facing explanation text; review every changed outcome. Target eligibility, forcing, routing, and explanation-delivery tests, not permanent wording snapshots. Use approved small batches, feature branches, concise past-tense subjects, PR/CI and squash merges.

## Next analysis and decisions

1. Complete **Family E** with the same authority-based, end-to-end bidding review as Family A; revisit Family A where a shared meaning or simplification becomes clearer.
2. Separate clearly **agreed**, **recommended but not approved**, **requires another partnership agreement**, and **deliberately omitted** treatments. Resolve useful Pass, Double/NT shape, forcing and ranked alternatives, especially responder's reopening Double, Family B's forcing obligations, and Family C's takeout Double shape/advances.
3. After cross-family review, propose the smallest coherent rule inventory, limited stage/context changes, implementation batches, representative practice auctions, and final judgments for user approval. **No executable code changes until that approval.**
4. Move finalized bidding meanings and scope into `docs/spec.md` as they become implemented, leaving this file only as the active sandwich work plan.
