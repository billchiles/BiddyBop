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
- Start browser-only with Vite React TypeScript.
- Add Electron later only after the core bidding slice works.

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
- `SuitBid` is the current type name for a level plus strain, such as `1C`, `1H`, or `3NT`.
- `Call` means anything a player can say in the auction: a `SuitBid`, `Pass`, `Double`, or `Redouble`.
- Use `Call` in auction data, not `Bid`.
- Use `calls: Call[]` on rules, even when there is only one call.
- Do not use both `call` and `calls`.

## Rule Data Policy

- Executable bidding rules are organized by auction stage in arrays such as `OpeningBidRules`, `ResponseBidRules`, `OvercallRules`, `AdvanceRules`, and `OpenerRebidRules`.
- `BidStage` uses bidding-process names such as `opening`, `responding`, `openerRebid`, `responderRebid`, `overcalling`, and `advancing`.
- The evaluator derives the current `BidStage` from the board and authoritative auction, then selects the appropriate rule array. React does not tell the evaluator that a seat is opener/responder.
- There is no required flattened `BiddingRules` array.
- Keep declarative rule arrays in `bidding-rules.ts`. Keep executable `callRefinement` and function-valued `appliesWhen` functions, plus their private helpers, in `bidding-rule-functions.ts`.
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

## Constraint Semantics

- Declarative `appliesWhen` fields are conjunctive by default.
- `totalPoints` uses HCP plus length points by default. Rules that value support explicitly use
  `valuation: 'shortage'`.
- Use `shortPoints`, "short points", or "shortage points". Do not use "dummy points".
- `suitLengths` entries are conjunctive.
- If a `suitLengths` entry specifies a concrete suit, test that suit.
- If a `suitLengths` entry omits the suit, apply it to the suit of the candidate call currently being evaluated.
- `auctionContext.auction` is optional. Older/exact rules may use a compact representative
  partnership auction even though the model stores the full physical auction with passes. The
  matcher derives the opening partnership's non-pass calls for current uncontested rules.
- `auction: ['1H']` together with `openerStrain: 'major'` is a representative rule declaration for
  either 1H or 1S; similarly `auction: ['1C']` plus `openerStrain: 'minor'` represents either minor
  opening. Keep this convention commented near rule declarations that use it.
- Opener-rebid rules may instead constrain `responderCall`. `kind`, absolute `level`, and `jump` are
  rule-declaration constraints; the evaluator derives those facts from responder's actual call.
  `jump: true` requires a jump, `jump: false` requires a non-jump, and omission means the rule does
  not care.
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

## First GUI Punch-Through

- Generate a `Board` containing `deal` plus `dealer` and show all four hands.
- For the current focused practice shortcut, rotate a randomly dealt practice-opening hand to North and set `dealer: 'N'`. Deal generation may use simple hard-coded opening characteristics for efficiency; the bidding evaluator remains authoritative.
- Keep one authoritative physical auction containing the opponent passes that the current UI inserts automatically. Rule declarations may continue to use compact uncontested partnership auctions.
- Model code derives the next physical seat, acting hand, and bidding stage from board + auction. React does not select `deal.N`/`deal.S` for the evaluator or label a call as opener/responder state.
- For now, the UI still has the user enter the partnership's calls and auto-passes the intervening opponents. Do not introduce a controlled-seat/controller abstraction yet.
- Punch through opening, response, and opener rebid, then stop.
- Show matching rules, suggested calls, and guidance.
- Do not build DDS, simulation, competitive bidding, scoring, or full auction judgment yet.
- Later, configurable practice-hand/scenario generation should move out of React and into model code.


## Current Practice-System Decisions

- Default 1NT range is 15-17 balanced.
- Natural 1NT and 2NT openings use only the strict balanced shapes: 4-3-3-3, 4-4-3-2,
  and 5-3-3-2.
- A five-card-major upgrade into the 1NT range is configurable and off by default.
- Standard two-level new-suit responses are the default; the 2/1 game-force treatment is a separate agreement.

- Standard non-forcing 1NT responses to a major are the default. `majorOneNtResponse: 'forcing'`
  means opener may not pass. With 2/1 and `majorOneNtResponse: 'nonForcing'`, the combination is the
  common semi-forcing treatment.
- Stayman and Jacoby transfers are enabled by default.
- Splinters and Texas transfers are enabled so they can appear as candidate options and explanations.
- The existing `splinters` agreement also governs opener-side splinters. Opener-side splinters
  use rank `-100` so their teaching explanation remains visible without competing with ordinary
  rebids.
- After `1M-2M`, a `3M` rebid with six or more trumps is the modern competitive treatment rather
  than a game try. Natural help-suit game tries use a 3+ card side suit.
- After `1M-2M`, a balanced `2NT` game try uses shortage-point valuation because the major-suit fit
  is already known; this is distinct from HCP valuation for ordinary natural notrump rebids.
- Gerber after a notrump opening and Blackwood after a suit auction are baseline conventions, not current on/off settings.
- Gerber and Blackwood are rare, specialized ace-asking treatments rather than general slam
  tries. They use priority rank -100 so they remain visible but sort after ordinary descriptive,
  quantitative, and signoff choices.
- The Guideline of 20 is an executable opening-valuation rule for sub-12-HCP first/second-seat hands.
- Multiple rule-supported calls may be valid for one hand. Higher `priority.rank` means greater
  presentation preference; lower-ranked qualifying alternatives remain visible rather than being
  silently eliminated.

## Pending Bidding Work

- Complete the stronger long-minor/game region after `1m-1NT`, especially the 19-21-point long-minor
  actions, 3NT/game decisions, and overlaps. The current minor-opener rebid slice intentionally
  stopped after the basic minimum/medium actions so those rules could be exercised before choosing
  precedence for the stronger cases.

## Intentionally Unmodeled or Guidance-Only Bidding Treatments

These are treatments we have consciously decided may never need executable trainer rules. Each item
records whether the current trainer should still teach the idea in ordinary rule guidance and what
would cause us to revisit the omission.

### Rare three-card raise after `1H-1S`

- Status: Guidance only; no executable rule currently planned.
- Explanation guidance: Yes. The normal four-card raise and the 1NT rebid guidance explain that a
  good three-card spade holding can occasionally make `2S` preferable when notrump is unattractive.
- Reason: This is a rare judgment treatment. Good support quality plus awkward shape can justify it,
  but we do not have a crisp enough criterion to make the trainer recommend it reliably.
- Revisit if: practice repeatedly exposes hands where accepting or suggesting the three-card raise
  would materially improve the trainer.

### Strong `2C` openings based on playing tricks below the HCP threshold

- Status: Guidance only; no executable exception currently planned.
- Explanation guidance: Yes. The existing strong-`2C` rule notes that some bidding treatments open
  an exceptional playing-strength hand `2C` below the project's 22-HCP threshold.
- Reason: Playing-trick exceptions are uncommon and materially less mechanical than the project's
  chosen 22+ HCP treatment. Encoding them would add judgment complexity with little value for the
  current beginner/intermediate practice goals.
- Revisit if: strong-hand practice becomes important enough that these exceptions occur often.

### Partnership-specific `3NT` opener rebid after a one-level new-suit response

- Status: Unmodeled; no executable meaning is selected.
- Explanation guidance: No routine runtime guidance is required. Keep the omission visible here;
  nearby rule guidance may mention it if that becomes useful.
- Reason: The bidding material itself labels the call as partnership agreement and does not assign a
  universal meaning. Inventing a meaning would be worse than omitting the call.
- Revisit if: the project adopts a specific partnership agreement assigning this `3NT` rebid a
  defined meaning.

### Specialized jumps and higher-notrump continuations after a 2/1 game force

- Status: Core shape-showing rebids are executable; specialized continuations remain unmodeled.
- Explanation guidance: Yes. The 2/1 opener-rebid guidance says to describe shape economically and
  show extra strength later, and notes that specialized higher-notrump meanings are partnership
  choices.
- Reason: Once game is already forced, jump rebids, jump shifts, and higher-notrump rebids can carry
  partnership-specific meanings. The trainer gets most of the teaching value from economical
  support, second-suit, six-card-major, and notrump descriptions without selecting a detailed 2/1
  convention package.
- Revisit if: the project adopts a more specific 2/1 continuation structure or practice shows that
  the omitted calls are important enough to teach directly.
