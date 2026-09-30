# Code Style

This file records the coding and code-review conventions to use across projects unless a project-specific spec explicitly overrides them.

## Core Priorities

- Optimize first for code that is easy for a human reader to follow.
- Prefer direct, explicit domain code over clever abstractions, but might be worth discussing.
- Keep architecture proportional to the problem being solved now. Avoid speculative machinery for possible future requirements, but it ok to mention it in discussion since I might want it.
- Preserve established project structure, naming, comments, and control flow unless there is a concrete reason to change them.
- When modifying existing code, prefer the smallest change that fully fixes the problem, and don't randomly rewrite functions or change comments unless substantive need drives that.
- Do not hide a semantic problem behind defensive code, a refiner, a wrapper, or a UI workaround when the underlying data or model should be corrected.

## File and Definition Ordering

Code should read top-down from intent to implementation.

- Put public or higher-level entry points before the lower-level functions they call.
- Put callers before callees. Function declarations may appear after their call sites.
- Do not move a helper above its caller merely because some languages require declaration-before-use; TypeScript does not.
- Put types before the code that uses them and reasonably close to where they matter.
- When several related types form a small conceptual group, order them for top-down reading: put the higher-level type that refers to another type first, then define the supporting type below it.
- Keep closely related definitions together rather than collecting every type or every helper into a distant global section.
- Prefer the file to present the main operation first and let the reader descend into implementation details as needed.

## Functions and Helpers

A function or helper should earn the extra name and indirection it introduces.

- Do not create one-line wrappers that merely rename an already-clear operation.
- Prefer a direct call over a helper when the helper adds no logic, invariant, reuse, or meaningful abstraction.
- A domain-specific name is not automatically useful if the underlying call already expresses the same idea clearly.
- Single-use lambdas are appropriate when they directly parameterize an existing generic helper.
- Keep a named helper when it:
  - encapsulates meaningful logic;
  - is reused;
  - enforces or centralizes an invariant;
  - substantially improves domain readability;
  - is independently worth testing; or
  - removes genuinely repetitive or non-obvious argument construction.
- Do not split straightforward logic into many tiny helpers merely to make functions shorter.
- Conversely, extract substantial pure logic when it clarifies a stateful orchestrator or prevents real duplication.
- Prefer plain local functions for local helpers. Use React hooks such as `useCallback` when stable function identity actually matters, for example for handlers passed through JSX to memoized children.

### Example: avoid ceremonial wrappers

Prefer:

```ts
// Choose appropriate call 2 levels higher
callRefinement: (calls, context) =>
  refineNewSuitByExtraLevels(calls, context, 2, 'double-jump'),
```

over:

```ts
function refineSplinterDoubleJump(calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  return refineNewSuitByExtraLevels(calls, context, 2, 'double-jump');
}
```

when the wrapper is used once and contributes no additional logic.

## Types

- Prefer a small number of meaningful domain types over a large number of aliases and wrappers.
- Introduce a named interface or type for a real value that flows through the program and has domain meaning.
- Avoid one-line aliases that merely rename an obvious array, primitive, or operation without adding useful semantics.
- Reuse an existing identical shape instead of creating duplicate types with different names.
- Prefer explicit unions and booleans over stringly typed flags.
- Prefer constants plus a derived union type over TypeScript enums when a closed set of values is needed.
  Prefer the simplest representation of a closed set. Use a literal union when only the type is needed. Add a
  runtime constant array or object when the values themselves must be enumerated or referenced at runtime. Do 
  not introduce an enum or derived-value machinery when a simple union communicates the model clearly.
- Use singular names for element/domain types and `T[]` directly for ordinary collections unless the collection itself has distinct domain meaning.

## Naming

- Prefer conceptual/domain names over names that encode temporary implementation details.
- Name durable APIs for the behavior they conceptually provide, not for temporary prototype or scaffolding mechanics.
- Prefer concise established abbreviations when they improve readability without losing meaning, for example `RuleEvalContext` rather than `RuleEvaluationContext`.
- Do not shorten names merely to save characters if the result is less clear.
- When porting existing code, preserve established names unless the rename fixes a concrete semantic or readability problem.

## Comments

- Use line-oriented comments only.
- Use `///` for top-level comments.
- Use `//` for comments inside indented code.
- Do not use block comments.
- Comments should explain purpose, domain meaning, assumptions, inputs/outputs when useful, and important invariants.
- Explain why something exists or why a non-obvious choice is correct.
- Do not emit comments that merely restate the code.
- Very small functions whose names completely state their purpose usually do not need comments.
- Preserve useful existing comments during ports and focused edits.
- Avoid comments that falsely elevate one source, implementation accident, or temporary behavior into an architectural rule.

## Booleans, Nullability, and Explicit Tests

- For values whose type is exactly boolean, use direct boolean checks:

```ts
if (isBalanced) {
  ...
}

if (!isBalanced) {
  ...
}
```

- Do not write `=== true` or `=== false` for ordinary boolean checks.
- Do not rely on implicit truthiness for values whose type is not exactly boolean.
- Explicitly distinguish meaningful `undefined`, `null`, `0`, empty string, and empty-array cases when those states matter.
- Prefer explicit `null`/`undefined` tests over assertion helpers when the explicit condition is clearer.
- Do not add redundant defensive checks immediately after an invariant has already established that a value exists.
- Avoid guards that contradict the manifest execution conditions of the surrounding code.
- Do not silently fabricate missing data just to keep code running; return a missing value or raise an explicit error when that better represents the state.

### Optional properties

Use:

```ts
prop?: T;
```

not:

```ts
prop?: T | undefined;
```

Use:

```ts
prop: T | undefined;
```

only when the property itself must always exist but its value may be `undefined`.

## Control Flow and Readability

- Prefer straightforward control flow over compressed or clever expressions, but I do like functional style and fluid APIs
- Make important invariants visible in the code rather than relying on a reader to infer them from incidental behavior.
- Avoid broad implicit queries, hidden mutation, or helper functions that perform more than their names suggest.
- Separate computing/building data from presenting/printing it when those are distinct responsibilities.
- Separate filtering/shaping policy from totaling or other neutral computation when practical.
- Keep core/model logic independent from React, Electron, browser APIs, or other presentation/integration layers unless the dependency is genuinely part of the model.

## Architecture Boundaries

- Keep domain/model code authoritative for domain facts and rules.
- Keep React responsible for rendering and user interaction, not for re-implementing model semantics.
- Prefer passing model state across the UI/model boundary and deriving secondary facts inside the model rather than having the UI tell the model facts it can derive itself, unless the deriving is an engineering efficiency issue
- Keep temporary UI/controller workflow separate from durable model APIs.
- Do not promote temporary scaffolding behavior into first-class model fields or long-lived API parameters.
- If an interim workflow needs crude hard-coded orchestration, keep that crudity local and obvious rather than designing a polished abstraction around code that will shortly disappear.
- It is acceptable for a temporary workflow to end roughly or become inoperable once the currently implemented path is exhausted; do not add ceremonial completion-state machinery unless it prevents a real correctness or usability problem.
- When an eventual architecture is known but not needed yet, leave a clear seam rather than implementing the future framework prematurely.

## API Design

- Durable APIs should expose durable concepts.
- Avoid parameters that exist only to control temporary workflow behavior.
- Boolean parameters are especially suspicious when their meaning is not self-evident at the call site, but replacing them with an options object does not fix a bad conceptual API.
- First ask whether the behavior belongs in the callee's contract at all.
- If temporary behavior belongs only to orchestration, leave it in the orchestration layer rather than adding `addPass`, `finalStage`, or similar knobs to a general API.
- Prefer an API that accepts the true domain inputs and derives consequences internally when those consequences are inherent to the domain state.

## React and UI Code

- Keep state ownership aligned with the component or model responsibility that actually owns the concept.
- Avoid encoding temporary concept assumptions in otherwise general state/function names.
- Prefer model-derived values over duplicated UI-maintained facts when the model has enough information to derive them safely, as long there isn't an engineering efficiency concern
- Keep model/UI boundaries clean: UI code may orchestrate an intentionally temporary flow, but it should not redefine bidding, financial, parsing, or other domain semantics.
- Do not create polished UI-state machinery for temporary development scaffolding unless it materially aids current testing or correctness.

## Refactoring and Code Generation

- Discuss substantive design changes before generating a large patch.
- Straightforward, low-risk corrections can be supplied immediately as tight diffs.
- Prefer surgical diffs. Avoid unrelated cleanup in the same patch unless it is required for correctness or makes the requested change substantially clearer.
- Do not perform broad renames or file moves merely for aesthetic consistency during a focused behavior change.
- When a fresh ZIP, commit, or source snapshot is designated authoritative, use it rather than reconstructing code from earlier conversations.
- Follow all relevant call sites and callees before changing a shared function or type; do not patch only the first visible use.
- Preserve working code while making incremental ports or large migrations. Favor faithful structure first, then refactor after behavior parity is established.
- When translating tested code from another language, preserve control flow, function boundaries, names, and useful comments unless TypeScript or the target architecture provides a concrete reason to diverge.

## Abstraction and Generalization

- Do not introduce an abstraction solely because multiple future cases can be imagined.
- Generalize when multiple concrete current cases expose the same real relationship.
- Prefer a small semantic helper over a new DSL, hierarchy, framework, or configuration layer when a helper expresses the rule clearly.
- Prefer declarative data when the rule is naturally declarative; use executable functions when relationship-dependent logic would otherwise make the declarations misleading or contorted.

## Temporary Code

Temporary code should be obviously temporary and cheap to remove.

- Prefer rough, explicit orchestration to polished temporary abstractions.
- Do not add completion flags, wrapper APIs, or state machines merely to make an incomplete workflow appear finished.
- Do not let temporary behavior leak into signatures of functions likely to survive the prototype.
- Keep hard-coded development assumptions at the highest practical layer so lower-level model code stays reusable.
- When temporary assumptions are replaced later, remove their scaffolding rather than preserving compatibility wrappers without a concrete need.

## Project-Specific Conventions Belong Elsewhere

Keep domain-specific conventions in the project's own spec rather than turning them into universal code style. Examples include:

- bridge suit-letter notation and bidding terminology;
- a finance application's currency units or report semantics;
- a Go application's game-tree invariants;
- a particular project's supported agreements or feature scope.

`code-style.md` should describe how code is written and organized. The project spec should describe what that particular program means and does.
