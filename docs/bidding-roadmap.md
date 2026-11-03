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

## Second-pass instructional quality punch list (Q3–Q4)

- [ ] **Q3 — Better negative feedback for plausible bids.** Distinguish a tested
  failed requirement, an auction/refiner-selected convention or priority, an
  outstanding force, and a judgment/out-of-coverage situation. For a few highly
  instructional refiner-filtered alternatives, preserve the *actual refiner
  decision* when needed rather than guessing a failed requirement. Prioritize
  wrong convention/strain, missing fit/stopper, forcing Pass, and legitimate
  alternatives. Never infer "wrong" from merely absent model support.
- [ ] **Q4 — Presentation and instructional quality gate.** Review actual
  assembled explanations across all modeled stages for accuracy, economy,
  duplication of hand-specific text/rule meaning/practice guidance, natural
  student-facing bridge language, and agreement-sensitive meanings. Sample
  recorded-call substitutions and exercise endings (including unresolved
  forcing obligations). Retain the existing **Report button solely as a
  developer debugging clipboard dump** of hands, auction, agreements, displayed
  explanations and optional telemetry; do not turn it into a student report
  or prioritize making diagnostic fields student-friendly. Verify it faithfully
  captures the same explanation transcript. Reconcile docs and punch-list
  statuses when completed.

For each remaining Q batch, discuss evidence and precise changes before coding. Existing
practice hands and tests are the main inputs; no new deals just for numerical
coverage, no wholesale bidding-rule re-audit, and no browser-automation suite.

## Remaining project quality work

- [ ] **Revisit borderline support-point judgment if play-throughs warrant it.**
  In particular, Pass versus game after a simple major raise may depend on whether
  responder's shortness is in opener's original suit; the current point thresholds
  remain unchanged, although the explanation now acknowledges the limitation.
- [ ] **Ending and scope guidance.** Distinguish exercise completion from a finished
  auction; explain unresolved forcing or game-forcing obligations where relevant.
  Finish the focused audit of auction-stage recognition, agreement-sensitive meanings,
  and missing or misleading scope boundaries.
- [ ] **Final quality checks.** Review remaining substantive full-auction concerns
  using information available to the bidder at each turn, not the unseen hands.
  Check dealer orientation when it materially affects the lesson, guidance accuracy,
  and any interactions between revised deals and existing rule tests.
- [ ] **Final source and test cleanup.** Review naming, comments, organization,
  unnecessary wrappers, and readability without expanding test infrastructure.

## Deferred enhancements

- [ ] **Optional DONT agreement versus a natural defense to a strong 1NT.**
  Defer until after Q3–Q4. This is a separate, cross-stage project: analyze,
  then implement in deliberate batches for overcaller, advancer, opener/responder
  interpretations and rebids, practice-bucket compatibility and explanations.
  Include the settings checkbox only as part of a complete coherent treatment;
  DONT remains fixed and on in the meantime.
- [ ] Make recorded auction calls clickable to explain their meaning under the
  actual auction and agreements, including positive rule matches and meaningful
  constraints. Address after the practice-interface redesign.
