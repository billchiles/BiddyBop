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

## First-pass instructional milestone

- [x] Source-based first-pass explanation development across all modeled bidding stages:
  opening, responding, opener rebid, responder rebid, direct overcalling/Double,
  balancing, advancing, and overcaller/takeout-Doubler rebid. The final targeted
  opener-rebid interference closeout is merged. The project does **not** model a
  separate advancer's rebid stage.
- This milestone means the identified first-pass families were addressed; it is
  **not** a final certification of all rendered feedback or all bidding rules.
  Detailed decisions and earlier batches remain in
  [Instructional Explanation Coverage Review](instructional-explanation-review.md).

## Second-pass instructional quality punch list (Q1–Q4)

- [x] **Q1 — Correctness and feedback integration (first).** In `BidPanel.tsx`,
  the early `hasCallSpecificFailure` check omits some helpers that
  `buildExplanationLines` later uses; the no-candidate scope-boundary checks
  also omit some collected reasons. Investigate actual affected auctions and
  correct the path so available rejected-call evidence is not bypassed.
  Consolidate relevant feedback gathering/selection into a small *pure TypeScript*
  presentation/assembly function outside React, reusing the **same** collected
  reasons for the decision to show detail, the heading, and any additional
  judgment guidance. Keep bidding qualifications in the model; do not rebuild
  bidding logic in the React component. Fix confirmed misleading text, e.g.,
  duplicated "Double negative Double", "4M" shorthand, and four-four Stayman-fit
  claims when the actual fit may be five-four. Retain [rule IDs].
  Add **non-browser** regression tests from the real evaluator through final
  assembled explanation lines for representative supported, rejected, and
  boundary cases. **Do not hardcode exact English sentences or snapshots**:
  assert structured evaluated facts, nonempty relevant generated reasons, and
  that those dynamically generated reasons reach the assembled feedback.
  A narrow hand-fact check may use a suit/value derived from evaluator evidence,
  never a copied whole sentence. No browser tests or new test infrastructure.
  **Completed:** The shared high-level assembly and rule-meaning helpers are
  grouped near the top of `explanations.ts`; `BidPanel.tsx` calls them for the
  student's feedback and recorded-call explanations. The same list of rejected
  reasons now controls routing, headings and scope guidance. Representative
  delivery tests compare generated helper lines dynamically and inspect
  structured stopper evidence; no English snapshots or browser tests.
- [ ] **Q2 — Richer positive instruction and valid alternatives.** Review modeled
  stages in manageable groups, starting with responding/advancing, then rebids
  and direct competitive decisions. Where *both* bids genuinely qualify, use
  evaluated evidence and priority to explain when one is preferable (e.g.,
  3NT versus five of a minor, suitable suit/support responses). A supported
  alternative must not be graded as wrong or treated as uniquely inferior.
  Do not add prose to automatic transfers or ordinary Passes merely for coverage.
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

For each Q batch, discuss evidence and precise changes before coding. Existing
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
  Defer until after Q1–Q4. This is a separate, cross-stage project: analyze,
  then implement in deliberate batches for overcaller, advancer, opener/responder
  interpretations and rebids, practice-bucket compatibility and explanations.
  Include the settings checkbox only as part of a complete coherent treatment;
  DONT remains fixed and on in the meantime.
- [ ] Make recorded auction calls clickable to explain their meaning under the
  actual auction and agreements, including positive rule matches and meaningful
  constraints. Address after the practice-interface redesign.
