# Bridge Trainer Spec

## Project Goal

Build a TypeScript and React bridge bidding trainer focused on guided practice, convention recognition, and bid feedback.

The app should help the user practice bidding decisions using structured convention data from various books that are mostly standard American plus some modern bidding.

## Rules of Engagement

- Use suit letters only: C, D, H, S, NT.
- Do not use suit glyphs.
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
- Define types and functions before other later types/functions that refer to the earlier definitions.
- Prefer readable, explicit domain code over clever abstractions.
- Most functions should have comments that explain purpose, domain meaning, inputs, outputs, and important invariants.  Very small functions whose names say it all, usually don't need comments.
- Do not emit comments that merely restate the code.

## Bidding Terminology

- `Suit` includes `C`, `D`, `H`, `S`, and `NT`.
- `SuitBid` means a level plus suit, such as `1C`, `1H`, or `3NT`.
- `Call` means anything a player can say in the auction: a `SuitBid`, `Pass`, `Double`, or `Redouble`.
- Use `Call` in auction data, not `Bid`.
- Use `calls: Call[]` on rules, even when there is only one call.
- Do not use both `call` and `calls`.

## Rule Data Policy

- Executable bidding rules are organized by auction stage in arrays such as `OpeningBidRules`, `ResponseBidRules`, `OvercallRules`, `AdvanceRules`, and `OpenerRebidRules`.
- The evaluator selects the appropriate stage array from the current auction state; there is no required flattened `BiddingRules` array.
- `BiddingSystem` is the configurable set of bidding agreements for the current practice session.
- A rule's optional `agreement` selects whether the whole rule is active in the current `BiddingSystem`.
- Declarative `appliesWhen` values should remain concrete and literal; we tend to represent bidding  variations as alternative rules with different constraint than than to call out to a bidding system for whether something applies.  However, we do have the callRefinement and appliesWhen function hatches, but they are manifest in the declared rule vs hidden off in a bidding system somewhere else.
- `appliesWhen` may instead be a typed function for a rule whose applicability is clearer as executable domain logic, such as the Guideline of 20. Function-valued rules are normal compiled TypeScript functions, not `eval`-style code.
- `callRefinement` may be a typed function that narrows a rule's broad declared calls to calls valid for the actual auction. Use it when forcing the logic into declarative data would make the rule less clear.
- `BiddingNotes` contains teaching notes, concepts, priorities, and guidance not directly matched as bid rules.
- `appliesWhen` should contain only constraints the code can evaluate.
- Human explanation belongs in `guidance`.
- `meaning` is optional. Use it mainly when the call has a non-obvious or conventional meaning.
- `callCategory` describes the call, for example `natural`, `forcing`, `conventional`, `invitational`, or `signoff`.
- Rule IDs are for debugging, review, diagnostics, and tests only.
- Do not branch on rule IDs in evaluator code.

## Constraint Semantics

- Declarative `appliesWhen` fields are conjunctive by default.
- `totalPoints` is semantic: ordinary rules use HCP plus length points; support rules use HCP plus shortage points.
- Use `shortPoints`, "short points", or "shortage points". Do not use "dummy points".
- `suitLengths` entries are conjunctive.
- If a `suitLengths` entry specifies a concrete suit, test that suit.
- If a `suitLengths` entry omits the suit, apply it to the suit of the candidate call currently being evaluated.
- `auction: ['1H']` together with `openerStrain: 'major'` is a representative rule declaration for either 1H or 1S; similarly `auction: ['1C']` plus `openerStrain: 'minor'` represents either minor opening. Keep this convention commented near the rule declarations.
- Do not put prose such as `text` inside `appliesWhen`.
- Do not put judgment phrases such as "good suit" inside `appliesWhen` unless the code has a defined evaluator for them.
- Use `supportFor: 'partnersOpenedSuit'` for support rules when the rule explicitly depends on support. A bare `supportLength` constraint is interpreted against partner's opened suit.

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
- A five-card-suit length upgrade into the 1NT range is configurable and off by default.
- Standard two-level new-suit responses are the default; the 2/1 game-force treatment is a separate agreement.
- Standard non-forcing 1NT responses to a major are the default; forcing/semi-forcing 1NT is a separate agreement.
- Stayman and Jacoby transfers are enabled by default.
- Splinters and Texas transfers are enabled so they can appear as candidate options and explanations.
- Gerber after a notrump opening and Blackwood after a suit auction are baseline conventions, not current on/off settings.
- The Guideline of 20 is an executable opening-valuation rule for sub-12-HCP first/second-seat hands.
- Multiple rule-supported calls may be valid for one hand. Priority is not a total ordering and the evaluator must not silently collapse legitimate alternatives.
