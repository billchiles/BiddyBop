# Bridge Trainer Spec

## Project Goal

Build a TypeScript and React bridge bidding trainer focused on guided practice, convention recognition, and bid feedback.

The app should help the user practice bidding decisions using structured convention data from various books that are mostly standard American plus some modern bidding.

## Rules of Engagement

- Use suit letters in code, rule declarations, and documentation: C, D, H, S, NT.
- The GUI may render styled suit glyphs for presentation.
- Don't use "audrey", "grant", "audreygrant" in names.  I'm using multiple books and modifying Audrey Grant's rules
- Do not preserve source/provenance wrappers in code unless there is a concrete app need.
- Convention data represents my evolving bidding system, not a named book/system.
- Prefer plain rule arrays over knowledge-base wrapper objects.
- Keep the core app browser-first with Vite React TypeScript; any desktop wrapper should remain
  outside the core bidding model.

## Code Style

- Use TypeScript.
- Use line-oriented comments only.
- Use `///` comments at top level.
- Use `//` comments in indented code.
- Do not use block comments.
- Use explicit tests for `undefined`, `null`, `0`, empty string, and empty arrays.
- Do not rely on implicit falsy conversions.
- Do not rely on implicit truthiness for values whose type is not exactly boolean.
- For boolean values, use direct boolean checks such as `if (isBalanced)` or `if (!isBalanced)`.
- Do not write `prop?: T | undefined`; use `prop?: T`.
- Use `prop: T | undefined` only when the property must always exist but may hold undefined.
- Prefer higher-level callers before lower-level helper/callee functions so a file reads top-down from intent to implementation. TypeScript function declarations may appear after their callers.
- Prefer readable, explicit domain code over clever abstractions.
- Most functions should have comments that explain purpose, domain meaning, inputs, outputs, and important invariants.  Very small functions whose names say it all, usually don't need comments.
- Do not emit comments that merely restate the code.

## Bidding Terminology

- `Suit` means one of `C`, `D`, `H`, or `S`.
- `Strain` means a `Suit` or `NT`.
- `SuitBid` is the type name for a level plus strain, such as `1C`, `1H`, or `3NT`.
- `Call` means anything a player can say in the auction: a `SuitBid`, `Pass`, `Double`, or `Redouble`.
- `advancing` means responding to partner's overcall or double.
- Use `Call` in auction data, not `Bid`.
- Use `calls: Call[]` on rules, even when there is only one call.
- Do not use both `call` and `calls`.

## Rule Data Policy

- Executable bidding rules are organized by auction stage in arrays such as `OpeningBidRules`, `ResponseBidRules`, `OvercallRules`, `AdvanceRules`, and `OpenerRebidRules`.
- `BidStage` uses bidding-process names such as `opening`, `responding`, `openerRebid`, `responderRebid`, `overcalling`, and `advancing`.
- The evaluator derives the current `BidStage` from the board and authoritative auction, then selects the appropriate rule array. React does not tell the evaluator that a seat is opener/responder.
- There is no required flattened `BiddingRules` array.
- Keep rule declarations in the stage-specific `*-rules.ts` files and their refiners and applicability checks in the corresponding `*-functions.ts` files. `bidding-rules.ts` re-exports the rule arrays and retains shared teaching notes; `common-rule-helpers.ts` contains only helpers needed across stages.
- `BiddingSystem` is the configurable set of bidding agreements for the current practice session.
- A rule's optional `agreement` selects whether the whole rule is active in the current `BiddingSystem`.
- Declarative `appliesWhen` values should remain concrete and literal. Prefer representing bidding
  variations as alternative declared rules rather than hiding applicability logic inside
  `BiddingSystem`. Typed `callRefinement` and function-valued `appliesWhen` are explicit escape
  hatches when executable domain logic is clearer than declarative constraints.
- `appliesWhen` may instead be a typed function for a rule whose applicability is clearer as executable domain logic, such as the Guideline of 20. Function-valued rules are normal compiled TypeScript functions, not `eval`-style code.
- `callRefinement` may be a typed function that removes or orders candidates within one rule.
  Use it when forcing that logic into declarative data would make the rule less clear.
- `BiddingNotes` contains documentation and teaching concepts that are not executable bidding
  rules. Stage rule selection does not include them, so they cannot generate candidate calls or
  ordinary rule explanations.
- `appliesWhen` should contain only constraints the code can evaluate.
- Human explanation belongs in `guidance`.
- `meaning` is optional. Use it mainly when the call has a non-obvious or conventional meaning.
- `callCategory` describes the call, for example `natural`, `forcing`, `conventional`, `invitational`, or `signoff`.
- Rule IDs are primarily for debugging, review, diagnostics, and tests.
- Prefer semantic rule properties when cross-rule behavior can be identified clearly that way.
  A narrowly targeted suppressor may use stable rule IDs when the relationship is specific to
  particular rules and adding another semantic tag would make the model less clear.

## Evaluator Flow and Invariants

- `Board` contains the physical `Deal` plus `dealer`. The authoritative auction is a `Call[]` containing every physical call, including passes.
- Derive the acting seat, acting hand, and current `BidStage` from `Board + auction`, then select the rule array for that stage.
- `RuleEvalContext` is model-derived evaluation state; React supplies board, auction, and the user call rather than choosing a hand or role for the evaluator.
- `auction.ts` owns shared physical-auction parsing and navigation: contract-bid parsing, seat rotation,
  opener/responder lookup, partnership-call extraction, jump/cheapest-bid calculations, auction
  completion, and stage derivation. Evaluator and rule-function code may both query this lower-level
  module.
- Keep `RuleEvalContext` to broadly useful evaluation state. Do not precompute stage-specific auction
  artifacts such as partner's opening call or responder's call into every context; derive them on
  demand through `auction.ts` when a rule or evaluator path needs them.
- Remove rules whose `agreement` does not match the current `BiddingSystem`.
- Filter the active rules by auction context.
- Evaluate every remaining rule independently:
  - run `callRefinement`, if present;
  - evaluate each surviving candidate against `appliesWhen`;
  - set each candidate's `ruleApplies`;
  - set the parent rule's `ruleApplies` if any candidate applies.
- After independent evaluation, run cross-rule suppressors for relationships that are clearer
  between rules than inside one declarative rule.
- Suppressors may remove otherwise-valid candidates when another bidding treatment has precedence.
- After candidate suppression, preserve this invariant:
  `result.ruleApplies === result.candidates.some(candidate => candidate.ruleApplies)`.
- Finally sort results by `priority.rank` for presentation.
- Higher rank means greater presentation preference. Ranking does not eliminate lower-ranked
  qualifying alternatives.
- A missing rank is equivalent to rank `0`.
- Rank `-100` is an intentional "present last" sentinel for specialized alternatives that should
  remain visible without competing with ordinary teaching choices, such as Gerber, Blackwood, and
  optional opener-side splinters.
- Refiners operate within one rule; cross-rule suppressors resolve relationships among
  independently evaluated rules.
- Evaluation diagnostics should preserve per-call rejection provenance at the point where a
  candidate is rejected or removed. Explanations should be able to distinguish a specific recorded
  rejection reason from a user call that simply has no modeled candidate. Do not assume evaluator
  or refiner early returns provide a complete rejection history.
- `kind: 'scopeBoundary'` is an explanatory stopping declaration, not a bid rule. It creates no
  candidate `Call`. A boundary may be hand-qualified through `scopeBoundaryWhen`, and its guidance
  should explain why the trainer stops and what judgment remains. If a concrete modeled call
  applies to the same hand, the concrete bid suppresses the boundary.
- Reaching a scope boundary means the trainer deliberately stops judging later calls in that branch;
  it does not imply that Pass is correct or that further bidding is impossible.

## Constraint Semantics

- Declarative `appliesWhen` fields are conjunctive by default.
- `totalPoints` uses HCP plus length points by default. Rules that value support explicitly use
  `valuation: 'shortage'`.
- Use `shortPoints`, "short points", or "shortage points". Do not use "dummy points".
- `suitLengths` entries are conjunctive.
- If a `suitLengths` entry specifies a concrete suit, test that suit.
- If a `suitLengths` entry omits the suit, apply it to the suit of the candidate call currently being evaluated.
- `auctionContext` decides whether a rule belongs to the current auction; `appliesWhen` decides
  whether the hand qualifies, and `callRefinement` narrows or orders the rule's candidate calls.
- `auctionContext.auction` is optional and always literal. The matcher derives the opening
  partnership's compact non-pass calls from the full physical auction, then every declared call
  must match exactly; `auction` is never made representative by another context field.
- Use `openerCalls` for a small explicit set such as the weak-two openings `2D`/`2H`/`2S`; use
  `openerLevel` and `openerStrain` for semantic families such as any one-level minor opening.
- Opener-rebid rules may instead constrain `responderCall`. `kind`, absolute `level`, and `jump` are
  rule-declaration constraints; the evaluator derives those facts from responder's actual call.
  `jump: 0` requires a non-jump, `jump: 1` a single jump, `jump: 2` a double jump, and omission
  means the rule does not care about jump size.
- Do not put prose such as `text` inside `appliesWhen`.
- Do not put judgment phrases such as "good suit" inside `appliesWhen` unless the code has a defined evaluator for them.
- `supportLength` means length in partner's relevant naturally bid suit for the current stage.
  While responding it is partner's opening suit; on opener's rebid it is responder's suit. It
  describes only the required holding and does not implicitly choose a total-points valuation.
- `balanced` means one of the strict balanced shapes: 4-3-3-3, 4-4-3-2, or 5-3-3-2.
- `balancedOrSemiBalanced` additionally permits 5-4-2-2 and 6-3-2-2: every suit has at least
  two cards and the hand has at most two doubletons.
- Natural 1NT and 2NT opening rules require the strict `balanced` shapes, not
  `balancedOrSemiBalanced`.

## GUI Interaction Design

- A `Board` contains the physical `deal` plus `dealer`; the UI shows all four hands.
- Random practice generation accepts the dealer as an input and can require the dealer to receive a
  practice-opening hand. Generation and bidding APIs do not assume a particular compass seat.
- Keep one authoritative physical auction. Practice scenarios may insert recorded setup calls,
  but ordinary bidding records each of the user-entered calls for all four seats.
- Model code derives the next physical seat, acting hand, and bidding stage from board + auction.
  React does not select `deal.N`/`deal.S` for the evaluator or label a call as opener/responder state.
- The interaction model permits user-entered calls for all four physical seats and does not require
  an automated bidder to establish auction state.
- Free bidding remains open for user-entered calls and ends after three final passes.
- A selected practice lesson ends at its last recorded call, even when the full bridge auction
  would continue. When the student chooses a different call, evaluate that choice but use the
  recorded continuation to keep teaching the remaining lesson. State that the recorded call
  is the exercise's chosen path, not necessarily the only sound bid.
- Show matching rules, suggested calls, and guidance.
- The trainer excludes DDS, simulation, scoring, penalty-double/redouble evaluation, and full
  auction judgment. Leave meanings outside the selected bidding system unresolved rather than
  inventing deterministic rules for them.
- Configurable practice-hand/scenario generation belongs in model code rather than React.


## Practice-Deal Design

- Design each deal around a specific instructional point. All four hands should support
  the lesson, not merely make an isolated assertion pass.
- Avoid implausibly high partnership strength that invites unrelated game or slam choices
  unless that is the lesson. Do not apply arbitrary HCP ceilings to genuinely strong auctions.
- Avoid extreme suit distributions and concentrated remaining suits merely to fill unused
  seats. Seven-card or longer suits are appropriate when the lesson calls for them.
- Specify an opponent's hand when its overcall, Double, raise, or other competitive call
  is part of the teaching point. The neutral completion of other hands is not a bidder.
- For unspecified opponents, reproducibly shuffle the unused cards and deal them without
  forcing artificial balanced shapes or equal HCP. Review the result if its cards affect
  how a student would understand the auction.
- Keep recorded auction calls consistent with the stated lesson and required system.
  Avoid unnecessary setup calls that create stronger alternative actions elsewhere.
- Prefer a few useful contrasting examples over exhaustive fixture-specific regression
  assertions. Do not add regression tests simply to police the editorial choice of hands.
- Optional `practiceGuidance` supplements the normal rule explanation only when the
  specific deal needs it. Each note references the zero-based physical `practiceAuction`
  index and acting seat, so one seat can have distinct notes for opening and rebidding.
  Notes appear after the corresponding call is entered or inserted, never before it, and
  appear only when their corresponding recorded call is reached. Unannotated
  decisions need no placeholder entries.

## Continuing Development Guidance

- Treat the latest provided source as authoritative. Inspect existing rules, auction routing,
  practice deals, documentation, and explicit omissions before extending a bidding family.
  Favor instructional continuity and partner promises over maximizing executable rule counts.
- Keep changes tightly scoped. Follow `docs/code-style.md`, including meaningful `////`
  section titles and standalone `//` separators between bidding rules. Avoid historical
  patch or phase labels in permanent code, and unnecessary one-line wrapper helpers.
- Write `README.md` for people using the trainer, in ordinary bridge language. Preserve its
  organization and the user's wording; explain real Pass recommendations distinctly from
  situations needing additional judgment. Change coverage statuses only when code changes.
- Practice deals should teach coherent auctions with plausible complete hands and supported
  recorded calls. Prefer selected instructional contrasts and targeted tests for risky rule
  interactions, not mechanical exhaustive regression matrices. Add per-deal guidance only
  when it teaches something beyond the ordinary rule explanation.
- Delete completed roadmap tasks rather than preserving checked-off items. For source patches,
  provide a unified `.patch` and identical `.txt`, with verification details. Do not generate
  downloadable test-output files unless explicitly requested.

## Practice-System Decisions

- Default 1NT range is 15-17 balanced.
- With the alternate 16-18 1NT opening and our 25-combined-HCP game guideline, shift the
  ordinary 15-17 response HCP thresholds down one. The optional five-card-major 1NT upgrade
  does not lower the response thresholds another point. Existing range-specific rule IDs and
  titles retain their 15-17 wording; their guidance describes both ranges.
- Natural 1NT and 2NT openings use only the strict balanced shapes: 4-3-3-3, 4-4-3-2,
  and 5-3-3-2.
- Responding to a natural 20-21 HCP 2NT opening, Pass is available with 0-3 HCP regardless
  of distribution; a qualifying suit response takes precedence. With ordinary 4-10 HCP,
  bid 3NT even when unbalanced if no preferred suit route applies. When Stayman or Jacoby
  is disabled, the corresponding 3C or 3D call may be natural and game forcing with 10+ HCP,
  a five-card-or-longer minor, and an unbalanced hand; opener's basic continuation is 3NT.
  The usual 25-combined-HCP game guideline is not an absolute requirement.
- A five-card-major upgrade into the 1NT range is configurable and off by default.
- Standard two-level new-suit responses are the default; the 2/1 game-force treatment is a separate agreement.

- Standard non-forcing 1NT responses to a major are the default. `majorOneNtResponse: 'forcing'`
  means opener may not pass. With 2/1 and `majorOneNtResponse: 'nonForcing'`, the combination is the
  common semi-forcing treatment.
- Stayman and Jacoby transfers are enabled by default.
- After natural 1NT or 2NT, ordinary Stayman replies are one level above the opening: deny
  both majors with D, show H with four or more hearts (including both four-card majors), or
  show S with four or more spades and fewer than four hearts. Jacoby and Texas transfers are
  completed normally at the next required level.
- Opener passes direct natural 3NT/6NT/7NT signoffs, natural 4M with Texas off, and weak
  natural 2M signoffs over 1NT with Jacoby off. With Texas enabled, 4H is instead the
  artificial transfer to 4S, so opener must not Pass. A natural 1NT-3m invitation requires
  a six-card minor with at least two of A/K/Q; opener tries 3NT with A/K/Q in that minor
  and otherwise passes. Without Jacoby, natural 1NT/2NT-3M is game forcing: opener chooses
  3NT with exactly two-card support and 4M with three or more cards.
- Over 1NT-2NT, opener declines with the opening-range minimum, accepts at maximum, and
  retains both Pass and 3NT at the middle HCP (16 over 15-17, 17 over 16-18).
- With Jacoby enabled, a direct natural 1NT-3M shows a six-card-or-longer major with slam
  interest. Four of responder's major remains available; a middle-or-better opener may rank
  the cheapest side-suit A/K control below game ahead of 4M while retaining 4M as an option.
- Direct 4NT over natural 1NT/2NT is quantitative, not ace-asking. With a minimum 1NT
  opener decline with Pass, with a maximum accept with 6NT, and keep both as judgment
  alternatives at middle HCP. Over a 20-21 2NT opening, 20 declines; even at 21 HCP,
  accepting a balanced 11-12 HCP invitation depends on trick-taking prospects.
- Splinters and Texas transfers are enabled so they can appear as candidate options and explanations.
- The existing `splinters` agreement also governs opener-side splinters. Opener-side splinters
  use rank `-100` so their teaching explanation remains visible without competing with ordinary
  rebids.
- After `1M-2M`, a `3M` rebid with six or more trumps is the modern competitive treatment rather
  than a game try. Natural help-suit game tries use a 3+ card side suit.
- After `1M-2M`, a natural balanced `2NT` game try uses 17-18 HCP, not shortage-point
  valuation. Natural help-suit game tries use shortage points.
- With the `jacoby2NT` major-support agreement, responder's `2NT` is artificial and game forcing
  with four-card-or-longer support and 13+ support points.  Opener describes distribution before
  generic strength: a three-level new suit shows singleton/void; a four-level new suit shows a good
  five-card-or-longer side suit, using at least two of A/K/Q/J as the executable quality threshold.
  When both descriptions apply, shortness ranks ahead while the side-suit call remains visible.
  With no singleton or void, `4M` shows a minimum through 13 HCP, `3NT` shows 14-15 HCP, and `3M`
  shows 16-21 HCP with slam interest.
- After a four-card `1M-3M` limit raise showing 11-12 support points, opener revalues with
  shortage points: 12 declines, 14+ accepts in `4M`, and 13 keeps both Pass and game available
  as a judgment case.
- Gerber after a notrump opening and Blackwood after a suit auction are baseline conventions rather than configurable agreements.
- Gerber and Blackwood are rare, specialized ace-asking treatments rather than general slam
  tries. They use priority rank -100 so they remain visible but sort after ordinary descriptive,
  quantitative, and signoff choices.
- The Guideline of 20 is an executable opening-valuation rule for sub-12-HCP first/second-seat hands.
- Multiple rule-supported calls may be valid for one hand. Higher `priority.rank` means greater
  presentation preference; lower-ranked qualifying alternatives remain visible rather than being
  silently eliminated.
- Opener-rebid reverse classification uses the actual response and cheapest legal second-suit bid.
  A natural jump in a suit whose non-jump bid is already a reverse is not treated as an ordinary
  maximum jump shift.  For example, 1C-1H-3D because 2D is a reverse, pushing partner to 3C.
- After `1m-1NT`, a natural `3NT` rebid is 20-21 HCP with semi-balanced but not strict-balanced
  shape.  A strict-balanced 20-21 HCP hand belongs in the 2NT opening.
- After a standard natural `1m-2m` minimum raise, opener passes with 12-16 total points,
  raises the agreed minor to three with 17-18, and usually bids 3NT with 19+ total points.
  A very long seven-card-or-longer minor with extreme distribution can keep five of the minor
  available as a lower-ranked judgment alternative.
- After a standard natural `1m-3m` limit raise, a bad 12-13-total-point minimum can Pass; with
  14+ total points, 3NT is the usual game target.  With 17+ total points, a seven-card-or-longer
  agreed minor, and extreme distribution, five of the minor remains a lower-ranked alternative.
- Minor-raise 3NT rules do not hard-require opener to hold full stoppers in all outside suits.
  Guidance uses A, Kx or longer, or Qxx or longer as a conservative full-stopper heuristic when
  human judgment makes stoppers relevant; Qx, Jxx, and lead/declaring-position-dependent holdings
  remain judgment cases. The selected natural-minor-raise design excludes inverted minors and
  stopper-showing continuations.
- After a natural `1m-2NT` response showing 11-12 HCP, balanced shape, and no four-card major,
  opener declines with 12 HCP, accepts with 14+ HCP, and keeps both Pass and 3NT available with
  13 HCP as a judgment case.  The acceptance decision uses HCP rather than distribution points.
  It does not hard-require opener to be balanced or to hold every outside stopper; the same
  conservative stopper guidance applies when human judgment makes an outside suit a concern.
  More detailed shape-showing continuations are left to partnership treatment.
- A direct natural `1m-3NT` response is a signoff showing balanced 13-15 HCP with no four-card
  major.  Pass remains available for opener.  With 18-21 HCP, opener may also bid quantitative
  `4NT` to invite 6NT; the trainer presents the slam try ahead of Pass but retains both as judgment
  choices.  In this family `4NT` is quantitative, not Blackwood.
- The chosen direct `1M-3NT` treatment shows 13-15 HCP, 4-3-3-3 shape, and exactly three-card
  support for opener's major.  The opening major is therefore a known 5-3 or longer fit, so `4M`
  is presented ahead of Pass.  With 18-21 HCP, quantitative `4NT` is also available between `4M`
  and Pass.  This project explicitly treats that `4NT` as quantitative in this direct-3NT family.
- A direct `1M-4M` response with five-card support and fewer than 10 support points is a natural
  preemptive signoff. Opener Passes in the executable treatment; exceptional slam-oriented
  continuations remain judgment rather than receiving a deterministic rule.
- Under the weak jump-shift agreement, responder uses a single jump in a six-card-or-longer new
  suit with 4-7 HCP.  With multiple qualifying suits the trainer chooses the longest, breaking an
  equal-length tie with the higher-ranking suit.  After a major opening, normal three-card-or-longer
  support takes priority over the weak jump shift.  Opener normally Passes; exceptional continuations
  with unusual strength and fit are left to judgment rather than modeled as deterministic rules.
- Under the classic strong jump-shift agreement, responder uses a single jump with 17+ HCP and a
  good one-suited 5+ card suit; the executable suit-quality threshold is at least 5 HCP in that suit.
  With two 5+ unbid suits, responder instead starts naturally in the higher-ranking suit and plans to
  show the lower-ranking suit later.  The strong jump shift is game forcing.  Opener first prefers an
  economical raise with three-card support; otherwise opener can repeat a 6+ opening suit, show a
  four-card second suit, or rebid notrump with balanced/semi-balanced shape at the cheapest legal
  level.  Extra strength is shown later rather than by unnecessary jumps.
- Weak `2D`/`2H`/`2S` openings use 5-10 HCP, exactly six cards, and a good suit: at least two
  of A/K/Q or at least three of A/K/Q/J/T.  Three-level preempts use exactly seven cards, the
  same good-suit test, and stay below ordinary one-level opening values.  Vulnerability and
  playing-trick estimates remain guidance rather than executable board state.
- After a weak two, raises are non-forcing while `2NT` and natural new suits are forcing.  The
  Guideline of 17 (responder HCP plus cards in opener's suit) is a rough executable trigger for
  game investigation, not a playing-trick calculator.  After `2NT`, a 5-7 minimum repeats the
  preempt suit; an 8-10 maximum shows a side ace/king feature; AKQJ in the six-card opening suit
  is the app's conservative executable approximation for the special solid-suit `3NT` message.
- After a three-level preempt, the app models Pass, trump-count raises, and forcing natural new
  suits below game when their structural requirements are known.  Direct game placement based
  only on expected playing tricks remains guidance rather than an invented HCP threshold.
- The artificial strong `2C` opening remains 22+ HCP in the executable treatment.  Responder's
  `2D` is an artificial waiting bid available with any strength or distribution.  With about 8+
  HCP, responder can instead make a positive response in a good five-card-or-longer suit, using
  the shared two-of-top-three or three-of-top-five honor test, or bid `2NT` with any balanced hand.
  Positive responses are game forcing; `2D` remains available but is presented behind a qualifying
  descriptive positive response.
- After `2C-2D`, a balanced opener rebids `2NT` with 22-24 HCP, `3NT` with 25-27, or natural `4NT`
  with 28-30.  No extra qualification is imposed beyond the app's ordinary balanced-shape
  definition and the stated HCP range.  With an unbalanced hand, opener instead shows the longest
  five-card-or-longer suit economically, choosing the higher-ranking suit when equal five- or
  six-card suits are available; that natural suit rebid is forcing.
- After Standard `1D-2C`, `2H`/`2S` retain ordinary reverse strength.  A cheap `2D` rebid can be
  five cards when a minimum opener has no better call; responder's five-card club promise means
  three-card opener support is enough for the natural club raise.
- After 2/1 game-forcing `1D-2C`, opener describes shape without traditional reverse-strength
  implications: rebid `2D` with five or more diamonds; otherwise show a four-card major up the
  line; otherwise usually rebid `2NT`, with `3C` available when notrump is unattractive.

## Intentionally Unmodeled or Guidance-Only Bidding Treatments

These treatments are deliberate scope boundaries. They are omitted from executable rules, or kept
as explanation-only guidance, because the trainer cannot assign them a sufficiently deterministic
meaning without adding disproportionate judgment or partnership-specific machinery.

### Rare three-card raise after a one-level new-suit response

- Design: Guidance only. Normal executable raises use four-card support. Guidance may mention that a
  good three-card holding can occasionally justify a raise when notrump or another rebid is
  unattractive.
- Reason: This is a judgment treatment. Good support quality plus awkward shape can justify it, but
  there is no crisp enough criterion for the trainer to recommend it reliably.

### Strong `2C` playing-trick exceptions

- Design: Omitted from executable rules. The strong-`2C` rule uses 22+ HCP and may explain that
  highly distributional hands can be awkward to describe. The trainer does not lower the 2C HCP
  threshold by counting playing tricks.
- Reason: Playing-trick exceptions are less mechanical than the chosen 22+ HCP treatment and add
  little value for the trainer's focus on common, foundational contract bridge bidding.

### Partnership-specific higher rebids after a one-level new-suit response

- Design: Assign no executable meaning where no treatment has been selected. Examples include an
  undefined `3NT` rebid and jumps such as `1C-1H-3D`, where the economical `2D` rebid is already a
  reverse. Ordinary natural jump shifts and the configured double-jump splinter treatment remain
  executable when their meanings are identifiable.
- Reason: The bidding material labels these higher calls as partnership agreement without assigning
  one universal meaning. Inventing meanings would be worse than omitting the calls.

### Specialized jumps and higher-notrump continuations after a 2/1 game force

- Design: Use the core economical shape-showing rebids and leave specialized jumps and
  higher-notrump meanings unresolved. Guidance may explain that those calls can carry
  partnership-specific meanings.
- Reason: Once game is forced, specialized continuations add substantial agreement-specific detail.
  The trainer gets most of the teaching value from economical support, second-suit,
  long-opening-suit, and notrump descriptions without selecting a detailed 2/1 convention package.
  The specialized solid-six-card `3D` exception after `1D-2C` remains guidance-only.

## Competitive Bidding Design

Practice scenarios may use recorded setup calls to reach a bidding decision. Recorded setup calls
establish physical auction context; they are not outputs of an opponent-bidding model. If the user
diverges from a recorded auction, subsequent physical calls remain explicit user-entered calls.

The evaluator removes contract calls that fail to outrank the last bid *before* call refinement.
`OvercallRules` cover direct, non-jump natural suit overcalls and informational takeout doubles
after one-level suit openings. Simple overcall suit quality means a good five-card suit (two of
A/K/Q or three of A/K/Q/J/T) or any six-card-or-longer suit. One-level calls require at least
7 total points with length; two-level calls require at least 13, both capped at 17 HCP.
An ordinary takeout double requires at least 13 points with shortage and three or more cards
in every unbid suit; an 18+ HCP strong-hand exception has no distribution requirement. Strong
playing-strength exceptions below 18 HCP remain judgment-only. The double is informational, never
a generic penalty-double rule. Natural 1NT overcalls use 15-18 HCP, strict balanced shape,
and A, Kx, Qxx, or Jxxx in opener's suit as a simple stopper approximation. Preemptive
jump overcalls use the shared good-suit test with six cards at the two level (5-11 HCP),
seven at the three level (under 10 HCP), or eight at the four level (under 10 HCP).
These exact lengths and HCP interpretations are deterministic choices from the source's
weak-hand guidance. `responding` is the stage after the opponent's first call following an
opening. The competitive rule model does not infer Pass merely because no candidate remains.
Double is evaluated only for specifically declared informational treatments, never penalties.

## Responder after an opponent's natural suit overcall

For one-level suit openings, `AuctionContext.interference` classifies the first opponent's
call as none, a natural non-jump suit overcall, a jump suit overcall, takeout Double,
natural 1NT, or other. Omission of this context property intentionally leaves a rule
shareable. Existing weak Pass, economical single raises, and major preemptive game raises
remain shared. Other ordinary first responses use `interference: 'none'`, so original
2/1 forcing, natural jump shifts, limit jumps, and Jacoby 2NT cannot accidentally describe
competitive actions. Literal compact partnership-auction matching is unchanged.

After a *natural non-jump suit overcall*, responder rules offer:

- Informational negative Double with 6+ HCP over a one-level suit or 10+ HCP over a
  non-jump two-level suit, with explicit unbid-major holdings (at least four cards),
  or at least four cards in both unbid minors if neither unbid suit is a major. After
  `1m-(1H)`, use exactly four spades for this treatment; natural 1S needs five.
  The model is deliberately conservative and is not a substitute for partnership
  judgment; penalty doubles are never generated.
- Natural one-level new suit: 6+ HCP; usually five cards, but after `1m-(1D)` a
  four-card major is sufficient. Natural non-jump two-level new suit: 10+ HCP,
  five cards, forcing one round even under 2/1 agreements. Three-level *nonjump*
  new suit: 13+ HCP and five cards; game forcing. Candidate jumps are calculated
  from the actual intervening contract, not simply the original opening.
- Three-level *jump* raise: four-card support and fewer than 10 shortage-adjusted
  points, preemptive. A cuebid of the overcalled suit shows 11+ shortage-adjusted
  points and at least three-card major support or four-card minor support.
- Natural 1NT/2NT/3NT with balanced shape, A/Kx/Qxx/Jxxx stopper in the overcalled
  suit, and respective 6-10, 11-12, or 13-15 HCP bands. The same stopper
  approximation is reused by natural 1NT overcalls.

Responder's raises pushed above the two level by a *jump* preempt (e.g.,
`1H-(2S)-3H`) are treated separately below. Zero remaining candidate bids is not a rule to Pass.
These responder treatments rely on outside competitive-bidding teaching references;
they are not attributed to source pages 18-21, which address overcalls and advances.

## Responder after an opponent's takeout double

`getInterferenceAfterOpening` identifies the opponent's first call after opener's suit bid.
The word *after* is deliberately specific: it does not classify balancing or later interference.
When that call is `Double` of a one-level suit opening, responder's rules include:

- Redouble with **10+ HCP**. This shows strength, without promising or denying support;
  opener is not compelled to rebid if opponents pass. The trainer does not model later
  penalty-double decisions or calculate a doubled/redoubled contract's score.
- Jordan **2NT** as an artificial limit-or-better support raise, requiring 10+ shortage-
  adjusted points and at least three-card major, four-card diamond, or five-card club
  support. These support thresholds and use over minor openings are explicit partnership
  choices. A qualifying Redouble remains a visible alternative; rank sets presentation,
  not exclusive selection. Support points include HCP plus appropriate shortage points,
  so a hand can qualify with fewer than 10 HCP. Jordan is independent of the uncontested
  Jacoby 2NT setting.
- Natural one-level new suit: four cards, 6+ HCP, forcing one round (possibly 10+ HCP).
  Natural *nonjump* two-level new suit: good six-card suit and 5-9 HCP, nonforcing.
- Jump shift: weak, six-card or longer suit and 4-7 HCP, independent of the uncontested
  weak/strong jump-shift setting. Jump raise to three: weak, 0-6 HCP, no more than nine
  support points, and four-card major/diamond or five-card club support.
- Natural 1NT with 6-9 HCP and strict balanced shape; no specific opposing-suit stopper
  is required because the opponent has doubled rather than bid a suit.

Unchanged weak Pass and ordinary simple raises continue to use shared responder rules. Competitive
opener rebids use two explicit gates. `getBidStage` recognizes only physical competitive opener
turns whose responder/advancer pattern has a declared continuation treatment. Within those turns,
an ordinary opener-rebid rule must set `openerRebidAfterInterference: true` before its uncontested
meaning can be reused; purpose-built competitive rules declare their `interference` context instead.
`AdvancerCallContext` classifies the fourth physical call by meaning (`raise`, `preemptiveRaise`,
`newSuit`, `responsiveDouble`, `cuebid`, and so on) so opener rules do not infer semantics from the
bid text alone. When a natural opener rule is reused in competition, every suit the opponents have
introduced naturally is removed from opener's natural candidates, and a natural notrump rebid
requires the shared basic stopper in each such suit. Artificial cuebids and responsive Doubles do
not create a natural opponent suit merely because they name or affect a strain.

A natural forcing responder suit can retain selected descriptive opener rebids after a suit
overcall or takeout Double even when advancer competes naturally. The reviewed advancer actions are
a raise or weak preemptive raise of a suit overcall, or a natural unbid suit; advancer bidding a suit
responder has already shown naturally is classified with the artificial/cuebid side instead. An
ordinary simple raise has its own selected continuations after advancer raises, makes a weak
preemptive raise, bids a natural new suit, or makes a responsive Double. Minimum hands may Pass and
clear maximum hands can still bid game.

For a natural forcing responder suit, competition does not mechanically promote an unavailable
uncontested rebid one level higher. Opener can support responder below game, repeat a six-card
opening suit below game, retain an economical second suit or reverse only when that original call
remains available, and use the ordinary balanced notrump range only when that NT level remains
available. A reused NT call requires the shared basic stopper in every suit the opponents have bid
naturally. The one-level forcing families use their normal four-card support threshold. A natural
two-level new-suit response after a suit overcall is a distinct forcing-one-round family,
independent of the uncontested `twoLevelNewSuitResponse` agreement; it promises five or more cards,
so three-card opener support is sufficient.

When a minimum opener has none of those selected descriptive continuations after advancer acts, a
real Pass is available because responder still has another turn. For extra-value hands with no
concrete modeled call, `scopeBoundary` guidance states what responder actually promised before
explaining the remaining judgment. The one-level overcall family promises at least 6 HCP and
normally five cards, subject to the existing four-card-major exception after a minor opening and
1D overcall; the two-level overcall family promises 5+ cards and 10+ HCP; the one-level response to
a takeout Double promises 4+ cards and 6+ HCP. Those responses would force opener for one round
without advancer intervention. The boundary then explains that Pass versus bidding
on can depend on playing strength, fit, honor location, vulnerability, and the level reached rather
than pretending the point model determines one call.

Ordinary medium game tries after a simple raise remain reusable only in the reviewed
Pass/simple-raise auctions; after the other advancer actions, 17-18-point hands use a
`scopeBoundary` because Pass versus continuing depends on competitive judgment not represented by
the point model alone.

A support cuebid and Jordan 2NT are artificial limit-or-better raises rather than natural new-suit
or notrump responses. With a clear minimum, opener rebids the agreed suit at the three level so
responder can continue; with a major-suit fit and enough combined values, opener bids game. The two
treatments use their own responder point floors and must not leak into natural-response or Jacoby
families.

Natural 1NT, weak two-/three-level new suits, and a weak jump raise after a takeout Double are
nonforcing responder actions. A minimum opener may Pass them rather than manufacture a rebid.
After a negative Double of a natural suit overcall, opener first looks for four-card support in
one of the suits the Double implied. With advancer Pass, a minimum opener bids that fit economically,
a medium opener jumps one level, and maximum values place an implied major in game. When both
majors have already been named, the same fit logic can apply to the implied minors; maximum minor
values use a strong descriptive jump rather than assuming five of a minor is automatic.

If opener lacks an implied-suit fit, the selected fallback descriptions are a six-card opening-suit
repeat through the three level or the ordinary 12-14 1NT / 18-19 2NT rebid when that exact NT level
is still available and every naturally bid opponent suit is stopped. Once advancer acts, a still-
economical implied-suit fit remains descriptive, but competition must not promote a consumed
three-level call into an automatic game. A minimum opener with no selected descriptive route may
Pass and leave responder another turn. If extra values remain but no deterministic action survives,
a scope boundary explains the competing Pass/bid-on judgment rather than inventing a call.

After responder's strength-showing Redouble of a takeout Double and advancer's Pass, opener may
also Pass; this waits for the doubler's next turn and does not create a general penalty-double
system. If advancer instead makes the selected weak suit escape, opener reaches an explicit
penalty/runout scope boundary rather than reusing that Pass. Responder Pass is also a physical call
that can matter to opener even though the compact partnership auction omits Passes: after a suit
overcall and Pass-Pass, opener reaches reopening/balancing guidance; after a takeout Double and
Pass-Pass, opener reaches doubled-contract runout/stand guidance. Semantic `responderCall` matching
therefore reads responder's physical first action rather than assuming the compact partnership
auction contains it.

After a natural suit overcall, responder's natural 1NT/2NT/3NT bids keep their competitive natural
meanings on opener's next turn rather than inheriting forcing-1NT or artificial-major-opening
notrump meanings. Selected continuations preserve ordinary balanced ranges, a six-card opening-suit
description where defined, invitation acceptance/decline, and 3NT signoff. Stronger hands without a
selected continuation reach scope guidance rather than manufacturing a quantitative or slam call.
A game-forcing three-level natural responder suit can produce major-suit game with support or 3NT
with balanced/semi-balanced shape and stoppers in every naturally bid opponent suit; other shapes
terminate with explicit guidance.

A competitive three-level jump raise after a suit overcall is weak and preemptive, not an
uncontested limit raise. A minimum opener may Pass; extra values use judgment guidance unless a
separate concrete call is modeled. The shared weak four-of-a-major preemptive raise remains a
signoff. With a minor-opening support cuebid, the minimum agreed-suit continuation remains concrete,
but extra values reach a stopper/playing-strength boundary rather than assuming minor game or 3NT.
After an opposing natural 1NT overcall, selected weak natural two-level suits and preemptive raises
are nonforcing and can be passed by a minimum opener; stronger continuations are deliberately
judgmental unless another concrete rule applies.

After natural two-level suit interference over a 1NT opening, the ordinary natural 2NT invitation
accept/decline and natural 3NT signoff continuations retain their meanings.

## Responder after an opponent's natural 1NT overcall

After `1m/M-(1NT)` where the opponent's overcall is natural, the chosen treatment is:

- An ordinary, nonforcing simple raise of opener's suit remains available with the existing
  support-length and shortage-adjusted 6-10 support-point criteria. Weak Pass rules remain shared.
- An economical new suit at the **two level** is natural, nonforcing, and requires a good six-card-
  or-longer suit and 5-9 HCP. The refiner measures the cheapest suit bid above the opponent's
  1NT, rather than partner's opening; it never treats opener's suit as a new suit. This conservative
  range intentionally leaves some strong hands unsupported rather than assigning them weak calls.
- A three-level jump raise of opener's suit is weak and preemptive: 0-6 HCP, no more than nine
  shortage-adjusted points, and four-card major/diamond or five-card club support. This is
  independent of uncontested invitational jump-raise agreements.
- The selected treatment assigns no Double over an opposing natural 1NT because that call is
  usually penalty-oriented, and assigns no natural or artificial 2NT without a partnership
  agreement. An otherwise eligible responder can therefore have no modeled action.


## Responder after an opponent's preemptive jump suit overcall

The selected first-round treatment covers natural two- and three-level jump suit overcalls
of a one-level suit opening, not four-level jumps. Bids are evaluated above the *actual*
opposing contract, so `1H-(2S)-3H` and `1S-(3H)-3S` are economical raises, not jump raises.

- A cheapest three-level raise is nonforcing with 8-10 shortage-adjusted support points;
  require 3+ major, 4+ diamond, or 5+ club support. Responder with 6-9 HCP may Pass
  when no such raise qualifies. This is an explicit limited rule; no general inferred
  Pass is enabled, and unsupported strong hands are not automatically treated as weak.
- New suits at their cheapest available level are natural: at the two level, 5+ cards
  and 10+ HCP, forcing one round; at the three level, 5+ cards and 13+ HCP, game forcing.
  The opponent's suit is reserved for an artificial cuebid, not a natural new-suit call.
- Negative Double is informational with 10+ HCP over a two-level jump or 12+ HCP over
  a three-level jump, requiring four cards in each unbid major (or each unbid minor
  if no major remains). This is a conservative subset, never a penalty treatment.
- After a two-level jump overcall of a major opening, the economical opponent-suit
  cuebid shows game-going support: 3+ trumps and 13+ shortage-adjusted points.
  Minor-opening cuebids and higher cuebids remain undefined; they may have a stopper-
  asking meaning in some partnerships.
- Natural, strictly balanced 2NT shows 11-12 HCP, and 3NT shows 13-15 HCP; both
  require the existing A/Kx/Qxx/Jxxx stopper approximation in the opponent's suit.
  2NT cannot be bid above a three-level preempt. Constructive 4M needs 3+ support
  and 13+ shortage-adjusted points. The separately modeled weak 4M preemptive raise
  can still qualify with five trumps and very limited strength.

These are explicit deterministic thresholds, not universal agreements or playing-trick
calculations. The selected responder treatment excludes responses after a four-level jump
preempt, penalty doubles, and scoring.
