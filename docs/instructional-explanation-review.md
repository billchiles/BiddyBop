# Instructional Explanation Coverage Review

This is a working plan for reviewing instructional quality, not a history of
completed implementation batches or a per-rule certification register. Source
and practice counts, including executable and scope-boundary declarations by
rule collection, belong in [`by-the-numbers.md`](by-the-numbers.md), generated
by `tests/stats.ts`. Pending project tasks belong in
[`bidding-roadmap.md`](bidding-roadmap.md).

## Purpose and acceptance standard

Review each outstanding **decision family** using actual qualifying calls,
plausible rejected calls, and the information available to the bidder at that
turn. Check that the explanation teaches, where useful:

- What partner's bid promises and whether it is forcing.
- The evaluated facts that matter: strength, length, fit, shape, stoppers,
  suit quality, and bidding level. Distinguish HCP, points with length, and
  points with shortage when the distinction matters.
- Why a bid fits and how it compares with **genuinely qualifying** alternatives
  under the selected agreements, without claiming unsupported options qualify.
- Why a plausible rejected bid fails a tested requirement, without inventing
  facts or treating an unmodeled judgment as a determinate error.
- Why an auction stops at a judgment boundary, especially if a forcing
  obligation appears unresolved.

Use these review dispositions: **Adequate** (existing teaching is sufficient),
**Improve** (a concrete explanation/evidence gap), **Judgment boundary**
(honest limited guidance), or **Integration issue** (the evaluated explanation
is not consistently delivered). Do not require a custom explanation for every
rule. A straightforward Pass, compulsory call, or explicit scope boundary can
be adequately taught by its meaning and shared guidance.

## Current review plan

1. **Competitive opener rebids — next implementation batch (9B).** Review and
   explicitly approve only the changes that improve the following cases:
   - After `1C–(1D)–1H–(1S)–Pass`, explain why the opposing intervention
     permits opener to Pass despite responder's initially forcing new suit;
     avoid implying that opener must still bid immediately.
   - After `1H–(1S)–2C–(Pass)–2NT`, check whether the actual spade holding
     supporting the notrump stopper requirement is available and useful to
     report; investigate rejected natural 3NT evidence before promising a
     hand-specific rejection message.
   - Correct awkward shortage-point grammar (for example, `1 shortage points`)
     and repetitive point-range language in competitive Pass/raise feedback.
   - Verify that changes do not alter qualification, priorities, or force
     treatment. Review genuine alternatives and judgment boundaries, not
     hypothetical bids.
2. **Finish targeted competitive opener-rebid review.** Check Jordan 2NT,
   cuebids, weak/NT/game-forcing responses, advancer action after interference,
   and jump-overcall continuations. Do not assume a family is cleared merely
   because it already has a specialized explanation function.
3. **Review overcaller/Doubler rebids and responder rebids across stages.**
   Verify forcing obligations, agreement-specific language, evaluated
   hand-constraint evidence, and honest stopping boundaries against recorded
   and relevant rejected calls. Preserve adequate explanations unchanged.
4. **Final cross-stage quality check.** Look for inconsistent advice across
   related stages, use only bidder-visible information, and check feedback in
   ordinary entry, recorded-call substitution, and the clipboard Report.
   After the evidence review is complete, run `npm run stats:bidding` and
   inspect the `by-the-numbers.md` diff. Its static unreached-ID category
   counts currently need reconciliation with the generated total; do not
   silently preserve an inconsistent classification.

### Recovery and change-verification rules

- GitHub `master` is authoritative. Compare any uploaded ZIP with current
  master before editing, and fetch recently changed files again if needed.
- Keep code changes small, review recommendations before implementation, and
  commit and squash-merge approved batches. Remove completed punch-list items
  from the roadmap; update this document only for **remaining** review work.
- Before modifying learner-facing explanation code, capture a temporary
  **current-master** baseline of recorded-call and relevant attempted-call
  feedback. Compare rule matches, qualified alternatives, turn statuses,
  and explanation lines after the change. Inspect every text difference and
  explicitly distinguish deliberate instructional improvements from drift.
  Do not claim a comparison against an older local snapshot was performed
  against current master, and do not assume older raw replay archives exist.
- Permanent regression tests check evaluated facts and explanation delivery,
  **not** exact English wording. Keep the broad replay harness temporary.

## Deferred or intentionally limited

- No generalized penalty doubles/redoubles, Lebensohl, unconstrained later auctions, speculative game/slam judgment, or new convention families solely to close a coverage gap.
- No extra practice deals solely for coverage percentages; use existing credible cases and add a focused regression case only when a meaningful distinction is fixed.
- Keep user-facing text concise, use "app" rather than "trainer" in newly written instruction, and preserve [rule IDs]. Avoid development terminology in future student-facing guidance.
- Clickable auction-call explanations and wider interface redesign remain separate future features.

## Stable implementation decisions

- The bidding evaluator and rule functions determine qualified calls and retain hand/auction evidence. High-level feedback assembly and individual explanation helpers live in `explanations.ts`; React receives and renders those lines without making independent bridge decisions.
- Non-browser regression tests check qualified calls, structured hand facts, and the delivery of dynamically generated explanation lines. Do not assert exact English sentences or snapshots.
- The Report button is solely a debugging clipboard tool. Preserve the auction, hands, agreements, rule IDs, explanations, and optional telemetry for diagnosis.
- Keep fixed DONT treatment until the separate, later natural-defense option is intentionally developed across all affected bidding stages.
