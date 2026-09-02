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

- `BiddingRules` contains executable or near-executable bidding rules.
- `BiddingSystem` is the configurable set of bidding agreements for the current practice session.
- A rule's optional `agreement` selects whether the whole rule is active in the current `BiddingSystem`.
- Keep `appliesWhen` concrete and literal; represent system variations as alternative rules rather than indirect system-valued constraints.
- `BiddingNotes` contains teaching notes, concepts, priorities, and guidance not directly matched as bid rules.
- `appliesWhen` should contain only constraints the code can evaluate.
- Human explanation belongs in `guidance`.
- `meaning` is optional. Use it mainly when the call has a non-obvious or conventional meaning.
- `callCategory` describes the call, for example `natural`, `forcing`, `conventional`, `invitational`, or `signoff`.
- Rule IDs are for debugging, review, diagnostics, and tests only.
- Do not branch on rule IDs in evaluator code.

## Constraint Semantics

- `appliesWhen` fields are conjunctive by default.
- `totalPoints` is semantic: ordinary rules use HCP plus length points; support rules use HCP plus shortage points.
- Use `shortPoints`, "short points", or "shortage points". Do not use "dummy points".
- `suitLengths` entries are conjunctive.
- If a `suitLengths` entry specifies a concrete suit, test that suit.
- If a `suitLengths` entry omits the suit, apply it to the suit of the candidate call currently being evaluated.
- If a rule needs "one major" or "one minor", represent that explicitly with a group-style constraint, not hidden prose.
- Do not put prose such as `text` inside `appliesWhen`.
- Do not put judgment phrases such as "good suit" inside `appliesWhen` unless the code has a defined evaluator for them.
- Use `supportFor: 'partnersOpenedSuit'` for support rules.

## First GUI Punch-Through

- Generate one random deal.
- Show all four hands.
- Assume North is dealer initially, but set Nort hand to a hand with opening points.
- Ignore opponent interference.
- Evaluate North's opening call.
- If North opens, evaluate South's response.
- Show matching rules, suggested calls, and guidance.
- Do not build DDS, simulation, competitive bidding, scoring, or full auction judgment yet.

