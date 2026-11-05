# BiddyBop by the Numbers

Regenerate this statistical snapshot with `npm run stats:bidding`. The command
reads the current source declarations and practice corpus, writes this document,
and prints a short summary. It is not part of the normal build or test commands.

## Counting definitions

- **Rule declaration**: one entry in a rule collection. A distinct ID may appear in more than one collection.
- **Executable rule**: a rule that can qualify a call, excluding `scopeBoundary` declarations.
- **Practice selection**: one bucket entry; the same deal may appear in two buckets.
- **Matched recorded call**: rule that qualified the authored call at its exact auction position.
- **Qualifying alternative**: a different call that qualified at that recorded position.
- **Considered in diagnostics**: the evaluator assessed the rule as a candidate at a recorded position. The rule may have failed; being considered is **not** evidence that its bid qualified or that an explanation was displayed.
- **Cited in core feedback**: a bracketed rule ID emitted by the shared explanation assembler during replay. It does not include practice-specific interface notes and does not by itself prove the explanation was useful.

## Rule inventory

| Measurement | Count |
|---|---:|
| Executable rule declarations | **646** |
| Distinct executable rule IDs | **622** |
| Extra executable declarations from reused IDs | **24** |
| Scope-boundary declarations | **85** |
| Distinct scope-boundary IDs | **85** |
| Combined executable plus scope declarations | **731** |
| Distinct IDs including scope boundaries | **707** |
| Distinct IDs with a nonempty meaning | **700** |
| Distinct IDs with nonempty guidance | **433** |

The difference between executable declarations and distinct executable IDs comes
from rules reused in more than one collection, principally responding and
advancing. Those declarations represent different stage placements of a shared
rule ID, not necessarily independent bidding treatments. The six collections
exclude non-executable `BiddingNotes`.

## Practice corpus and primary test assertions

| Measurement | Count |
|---|---:|
| Practice buckets | **70** |
| Distinct practice-deal definitions | **627** |
| Practice selections | **627** |
| Recorded auction calls across practice selections | **2,979** |
| Calls at supported evaluator stages | **2,479** |
| Calls without a supported-stage classification | **500** |
| Practice-guidance notes across selections | **32** |
| Primary positive call/rule assertions | **1,504** |
| Primary elimination assertions | **750** |
| Primary call-order assertions | **31** |
| Primary recorded-call checks | **1,421** |

Primary assertion counts use the declared expected calls and rule IDs,
rejected calls, ordering pairs, and tested auction positions from the practice
corpus. These are not the same as replaying every auction call, which includes
opponent actions and deliberately unjudged turns. The full rule-test suite
also runs separate regression and agreement-compatibility checks.

## Rule reach during recorded-auction replay

| Distinct executable rule IDs | Count |
|---|---:|
| Qualified a recorded call | **494** |
| Qualified recorded call or a different alternative | **511** |
| Considered in evaluator diagnostics | **601** |
| Cited in generated core feedback | **511** |
| Cited when not qualifying the entered call | **112** |
| Not represented by a qualifying call or alternative | **111** |

Unrepresented executable IDs are distinct from the separate scope boundaries.
A rule considered in diagnostics may have failed an eligibility requirement;
a rule cited in feedback may only appear in an automatically generated list.
Neither statistic alone establishes the instructional quality of a rule.

### By rule collection

| Collection | Executable declarations | Scope boundaries | Matched recorded call | Matched recorded or alternative | Considered in diagnostics |
|---|---:|---:|---:|---:|---:|
| Opening | 13 | 0 | 12 | 12 | 13 |
| Responding | 117 | 2 | 103 | 105 | 117 |
| Overcalling / overcaller rebids | 114 | 24 | 79 | 79 | 112 |
| Advancing | 105 | 2 | 95 | 95 | 105 |
| Opener rebids | 202 | 31 | 145 | 159 | 185 |
| Responder rebids | 95 | 26 | 77 | 78 | 93 |

**Considered in diagnostics** means that during replay of a recorded decision,
the evaluator included the rule among those it examined. The rule could have
failed its strength, suit, shape, auction, or other requirements. The number
is **not** a count of qualified bids or explanations actually displayed.
**Column caution:** An ID may be declared in multiple collections (especially
responding and advancing). The reach columns therefore overlap; their totals
cannot be added to obtain the distinct-ID counts above.

### Executable IDs not reached by a qualifying recorded call or alternative

The following are measured omissions from this practice replay, not necessarily
missing bidding functionality. IDs shared by multiple rule collections are
shown in each relevant row; the distinct total is 111.

| Collection | Unreached declarations | Rule IDs |
|---|---:|---|
| Opening | 1 | `open-pass-no-qualifying-action` |
| Responding | 12 | `partner-of-1nt-after-interference-natural-suit-two-level`, `partner-of-1nt-after-interference-natural-suit-three-level`, `partner-of-1nt-after-interference-3nt`, `partner-of-1nt-after-interference-negative-double`, `respond-to-minor-w/-4nt-blackwood`, `respond-to-major-w/o-support-1nt-passed-hand`, `respond-to-major-w/-4nt-blackwood`, `respond-to-1nt-w/-5nt-20-21-balanced`, `respond-to-1nt-w/-7nt-22plus-balanced`, `respond-to-1nt-w/-4c-gerber`, `respond-to-2nt-w/-5nt-16-balanced`, `respond-to-2nt-w/-7nt-17plus-balanced` |
| Overcalling / overcaller rebids | 35 | `overcaller-rebid-1nt-decline-quantitative-4nt`, `overcaller-rebid-1nt-accept-quantitative-4nt`, `overcaller-rebid-suit-raise-invite`, `overcaller-rebid-cuebid-invite`, `overcaller-rebid-cuebid-game`, `overcaller-rebid-jump-new-suit-support`, `overcaller-rebid-jump-new-suit-repeat`, `overcaller-rebid-new-suit-nt`, `overcaller-rebid-new-suit-second`, `overcaller-rebid-nt-invite`, `overcaller-rebid-contested-suit-raise-invite`, `overcaller-rebid-contested-suit-raise-game`, `overcaller-rebid-contested-suit-cue-game`, `overcaller-rebid-contested-suit-new-nt`, `overcaller-rebid-contested-suit-new-second-suit`, `overcaller-rebid-contested-suit-responsive-repeat`, `overcaller-rebid-contested-suit-nt-invite`, `overcaller-rebid-contested-suit-nt-game`, `overcaller-rebid-interfered-1nt-invite-decline`, `overcaller-rebid-interfered-1nt-invite-accept`, `overcaller-rebid-weak-two-double-jump-pass`, `overcaller-rebid-weak-two-double-minimum-raise`, `overcaller-rebid-weak-two-double-cue-nt`, `overcaller-rebid-weak-two-double-strong-nt`, `overcaller-rebid-weak-two-suit-nt-pass`, `overcaller-rebid-weak-two-suit-nt-game`, `overcaller-rebid-weak-two-suit-game-pass`, `overcaller-rebid-weak-two-suit-cue-game`, `overcaller-rebid-weak-two-suit-new-repeat`, `overcaller-rebid-weak-two-suit-new-nt`, `overcaller-rebid-takeout-cue-nt`, `overcaller-rebid-takeout-nt-invite`, `overcaller-rebid-takeout-nt-game`, `overcaller-rebid-takeout-strong-fit`, `overcaller-rebid-takeout-escape-pass` |
| Advancing | 10 | `respond-to-1nt-w/-5nt-20-21-balanced`, `respond-to-1nt-w/-7nt-22plus-balanced`, `respond-to-1nt-w/-4c-gerber`, `partner-of-1nt-after-interference-natural-suit-two-level`, `partner-of-1nt-after-interference-natural-suit-three-level`, `partner-of-1nt-after-interference-3nt`, `partner-of-1nt-after-interference-negative-double`, `advance-weak-two-2nt-pass-0-7`, `advance-weak-two-2nt-transfer-to-spades`, `advance-weak-two-2nt-texas-to-hearts` |
| Opener rebids | 43 | `opener-rebid-fit-after-1nt-interference-double`, `opener-rebid-2nt-after-1nt-interference-double`, `opener-rebid-3nt-after-1nt-interference-double`, `opener-rebid-raise-major-after-1nt-interference-natural-suit`, `opener-rebid-pass-after-preempt-raise`, `opener-rebid-game-implied-major-after-negative-double-medium`, `opener-rebid-jump-implied-minor-after-negative-double-maximum`, `opener-rebid-natural-nt-after-negative-double`, `opener-rebid-pass-after-takeout-redouble`, `opener-rebid-raise-after-overcall-two-level-new-suit-minimum`, `opener-rebid-repeat-after-overcall-two-level-new-suit-minimum`, `opener-rebid-second-suit-after-overcall-two-level-new-suit`, `opener-rebid-reverse-after-overcall-two-level-new-suit`, `opener-rebid-jump-raise-after-overcall-two-level-new-suit`, `opener-rebid-game-major-raise-after-overcall-two-level-new-suit-medium`, `opener-rebid-3nt-after-overcall-two-level-new-suit`, `opener-rebid-game-raise-after-overcall-two-level-new-suit`, `opener-rebid-repeat-after-forcing-response-advancer-competition`, `opener-rebid-second-suit-after-forcing-response-advancer-competition`, `opener-rebid-reverse-after-forcing-response-advancer-competition`, `opener-rebid-game-raise-after-forcing-response-advancer-competition`, `opener-rebid-three-of-suit-after-support-cuebid-minimum`, `opener-rebid-game-major-after-support-cuebid`, `opener-rebid-three-of-suit-after-jordan-2nt-minimum`, `opener-rebid-game-major-after-jordan-2nt`, `opener-rebid-repeat-suit-after-overcall-natural-1nt`, `opener-rebid-2nt-after-overcall-natural-1nt`, `opener-rebid-3nt-after-overcall-natural-1nt`, `opener-rebid-pass-after-overcall-natural-2nt`, `opener-rebid-3nt-after-overcall-natural-2nt`, `opener-rebid-pass-after-overcall-natural-3nt`, `opener-rebid-game-after-advancer-support-cuebid`, `opener-rebid-game-major-after-overcall-three-level-forcing-response`, `opener-rebid-own-major-game-after-overcall-three-level-forcing-competition`, `opener-rebid-pass-after-overcall-preemptive-three-level-raise`, `opener-rebid-pass-after-opponent-1nt-preemptive-raise`, `opener-rebid-pass-after-double-weak-two-level-new-suit`, `opener-rebid-pass-after-double-weak-three-level-new-suit`, `opener-rebid-pass-after-double-weak-jump-raise`, `opener-rebid-five-card-minor-fallback-after-minor-one-level-new-suit`, `opener-rebid-pass-after-major-1nt-passed-hand`, `opener-rebid-jump-raise-after-major-standard-two-level-new-suit`, `opener-rebid-competitive-three-after-major-simple-raise` |
| Responder rebids | 17 | `responder-rebid-strong-2c-waiting-pass-3nt`, `responder-rebid-strong-2c-positive-pass-3nt`, `responder-rebid-strong-2c-positive-major-game`, `responder-rebid-splinter-pass-major-game`, `responder-rebid-1nt-stayman-invite-2nt`, `responder-rebid-2nt-stayman-game-3nt`, `responder-rebid-2nt-stayman-game-major`, `responder-rebid-nt-transfer-game-major-no-texas`, `responder-rebid-two-over-one-pass-reached-game`, `responder-rebid-pass-after-minor-jump-repeat`, `responder-rebid-3nt-after-minor-jump-repeat`, `responder-rebid-pass-after-major-1nt-2nt-invite`, `responder-rebid-3nt-after-major-1nt-2nt-invite`, `responder-rebid-major-game-after-major-1nt-2nt-invite`, `responder-rebid-pass-after-major-1nt-jump-repeat`, `responder-rebid-major-game-after-major-1nt-jump-repeat`, `responder-rebid-economical-repeat-response` |

These IDs include both unusual continuations and ordinary choices not reached
by the present fixed practice auctions. The list alone cannot determine which
unrepresented cases warrant more testing; it should not be treated as a target
for generating more student practice deals.
