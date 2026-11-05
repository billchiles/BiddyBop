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

## Second-pass instructional quality punch list (Q4)

- [ ] **Q4-8 — Independent cross-stage instructional quality gate.** Sample
  actual assembled feedback across decision families to find contradictions
  between partnership promises, positive and rejected alternatives, practice
  notes, and exercise endings (including outstanding forces). Check economy,
  consistent hand valuations, and natural student-facing bridge language.
  Confirm the **Report button remains only a developer debugging clipboard
  dump** and faithfully captures the displayed explanation transcript,
  including recorded-call substitutions and optional telemetry. Avoid an
  exhaustive sentence-by-sentence wording pass.

For Q4-8, discuss evidence and precise changes before coding. Existing
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
  Defer until after Q4. This is a separate, cross-stage project: analyze,
  then implement in deliberate batches for overcaller, advancer, opener/responder
  interpretations and rebids, practice-bucket compatibility and explanations.
  Include the settings checkbox only as part of a complete coherent treatment;
  DONT remains fixed and on in the meantime.
- [ ] Make recorded auction calls clickable to explain their meaning under the
  actual auction and agreements, including positive rule matches and meaningful
  constraints. Address after the practice-interface redesign.
