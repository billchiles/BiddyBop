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
- The evaluator selects the appropriate stage array from the current auction state; there is no required flattened `BiddingRules` array.
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
  rules. `getRulesForAuctionState` does not select them, so they cannot generate candidate calls
  or ordinary rule explanations.
- `appliesWhen` should contain only constraints the code can evaluate.
- Human explanation belongs in `guidance`.
- `meaning` is optional. Use it mainly when the call has a non-obvious or conventional meaning.
- `callCategory` describes the call, for example `natural`, `forcing`, `conventional`, `invitational`, or `signoff`.
- Rule IDs are primarily for debugging, review, diagnostics, and tests.
- Prefer semantic rule properties when cross-rule behavior can be identified clearly that way.
  A narrowly targeted suppressor may use stable rule IDs when the relationship is specific to
  particular rules and adding another semantic tag would make the model less clear.

## Evaluator Flow and Invariants

- Select the rule array for the current auction stage.
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
- Rank `-100` is an intentional "present last" sentinel for rare specialized ace-asking
  treatments such as Gerber and Blackwood.
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
- `auction: ['1H']` together with `openerStrain: 'major'` is a representative rule declaration for either 1H or 1S; similarly `auction: ['1C']` plus `openerStrain: 'minor'` represents either minor opening. Keep this convention commented near the rule declarations.
- Do not put prose such as `text` inside `appliesWhen`.
- Do not put judgment phrases such as "good suit" inside `appliesWhen` unless the code has a defined evaluator for them.
- `supportLength` is always interpreted against partner's opened suit. It describes only the
  required holding in that suit; it does not implicitly choose a total-points valuation.
- `balanced` means one of the strict balanced shapes: 4-3-3-3, 4-4-3-2, or 5-3-3-2.
- `balancedOrSemiBalanced` additionally permits 5-4-2-2 and 6-3-2-2: every suit has at least
  two cards and the hand has at most two doubletons.
- Natural 1NT and 2NT opening rules require the strict `balanced` shapes, not
  `balancedOrSemiBalanced`.

## First GUI Punch-Through

- Generate one random deal.
- Show all four hands.
- Assume North is dealer initially, but rotate a randomly dealt practice-opening hand to North. Deal generation may use simple hard-coded opening characteristics for efficiency; the bidding evaluator remains authoritative.
- Ignore opponent interference in the first punch-through. Rule auction contexts omit opponent passes/interference rather than carrying an `assumesUncontested` flag.
- Evaluate North's opening call.
- If North opens, evaluate South's response.
- Show matching rules, suggested calls, and guidance.
- Do not build DDS, simulation, competitive bidding, scoring, or full auction judgment yet.


## Current Practice-System Decisions

- Default 1NT range is 15-17 balanced.
- Natural 1NT and 2NT openings use only the strict balanced shapes: 4-3-3-3, 4-4-3-2,
  and 5-3-3-2.
- A five-card-major upgrade into the 1NT range is configurable and off by default.
- Standard two-level new-suit responses are the default; the 2/1 game-force treatment is a separate agreement.

- Standard non-forcing 1NT responses to a major are the default; forcing/semi-forcing 1NT is a separate agreement.
- Stayman and Jacoby transfers are enabled by default.
- Splinters and Texas transfers are enabled so they can appear as candidate options and explanations.
- Gerber after a notrump opening and Blackwood after a suit auction are baseline conventions, not current on/off settings.
- Gerber and Blackwood are rare, specialized ace-asking treatments rather than general slam
  tries. They use priority rank -100 so they remain visible but sort after ordinary descriptive,
  quantitative, and signoff choices.
- The Guideline of 20 is an executable opening-valuation rule for sub-12-HCP first/second-seat hands.
- Multiple rule-supported calls may be valid for one hand. Higher `priority.rank` means greater
  presentation preference; lower-ranked qualifying alternatives remain visible rather than being
  silently eliminated.
