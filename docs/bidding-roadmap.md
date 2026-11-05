# Bidding Coverage Roadmap

This is a short list of work remaining after introducing all-seat practice
and before final project cleanup. The executable bidding rules, practice corpus, and README
describe the selected bidding system and its deliberate scope limits; this file is
not a historical progress log or a commitment to model every possible auction.

## Agreed scope

- Generally teach openings, responses, opener rebids, and selected responder rebids;
  and overcalls/Doubles, advances, and selected overcaller/Doubler rebids. Later
  judgment-heavy bidding may end with auction-specific guidance.
- Do not create practice exercises merely to achieve numerical rule coverage.
  Preserve credible alternatives and prioritize useful instructional decisions.
- Use the same selected bidding agreements for all four seats, including the
  compact fixed DONT treatment against a strong 1NT opening.
- Practice deals have four fixed, complete hands and credible recorded calls for
  every seat. North is always dealer, but need not be opener. Exercise completion
  need not mean the actual bridge auction is over.

## Remaining project quality work

- [ ] **Classify uncovered rules and assess practice representativeness.**
  Use the executable rule IDs lacking a qualifying recorded call or alternative
  in `docs/by-the-numbers.md`; classify rare conventions/slam continuations,
  unpracticed but supported auction families, and meaningful gaps. Distinguish
  rules merely considered in evaluator diagnostics, qualified as alternatives,
  cited in feedback, and given substantive failed-requirement explanations.
  Expand `tests/stats.ts` to compute these additional metrics before adding a
  corresponding section to the statistical report. Do not set coverage quotas
  or add student practice deals solely to increase a percentage.
- [ ] **Coverage-guided stress testing beyond practice deals.**
  After classifying the gaps, test representative unseen hands and agreement
  configurations with seeded, reproducible evaluations in plausible auctions.
  Examine bid alternatives and the final delivered instructional feedback.
- [ ] **Revisit borderline support-point judgment if play-throughs warrant it.**
  In particular, Pass versus game after a simple major raise may depend on whether
  responder's shortness is in opener's original suit; the current point thresholds
  remain unchanged, although the explanation now acknowledges the limitation.
- [ ] **Ending and scope guidance — targeted defects identified.**
  * A natural 3NT after an evaluated 2/1 game force must discharge that force
    when the prior auction establishes a natural notrump game; preserve artificial
    Jacoby 3NT, Texas transfers, and artificial control bids.
  * An auction that legally ends below an established game force must still
    identify the broken partnership commitment, without prohibiting Pass.
  * Distinguish an auction for which no bidding treatment exists (e.g. responder
    after an opposing Double of a weak-two opening) from an evaluated auction
    with no qualifying call. Neither condition implies Pass is recommended.
  * Replace misleading "later auction" headings with "no bidding guidance for
    this turn." New Deal should make no promise about later turns; practice mode
    can identify the next known recorded lesson turn without suggesting an
    unsupported call is wrong. Preserve later return to evaluated stages.
  Add focused regression checks; do not change bidding eligibility or agreements.
- [ ] **Final quality checks.** Review remaining substantive full-auction concerns
  using information available to the bidder at each turn, not the unseen hands.
  Check dealer orientation when it materially affects the lesson, guidance accuracy,
  and any interactions between revised deals and existing rule tests.
- [ ] **Final source and test cleanup.** Review naming, comments, organization,
  unnecessary wrappers, and readability without expanding test infrastructure.

## Deferred enhancements

- [ ] **Optional DONT agreement versus a natural defense to a strong 1NT.**
  This is a separate, cross-stage project: analyze,
  then implement in deliberate batches for overcaller, advancer, opener/responder
  interpretations and rebids, practice-bucket compatibility and explanations.
  Include the settings checkbox only as part of a complete coherent treatment;
  DONT remains fixed and on in the meantime.
- [ ] Make recorded auction calls clickable to explain their meaning under the
  actual auction and agreements, including positive rule matches and meaningful
  constraints. Address after the practice-interface redesign.
