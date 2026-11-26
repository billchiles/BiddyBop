# BiddyBop by the Numbers

Regenerate this statistical snapshot with `npm run project:stats`. The command
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
| Executable rule declarations | **661** |
| Distinct executable rule IDs | **637** |
| Extra executable declarations from reused IDs | **24** |
| Scope-boundary declarations | **95** |
| Distinct scope-boundary IDs | **94** |
| Combined executable plus scope declarations | **756** |
| Distinct IDs including scope boundaries | **731** |
| Distinct IDs with a nonempty meaning | **724** |
| Distinct IDs with nonempty guidance | **455** |

A rule ID can occur in more than one collection, principally responding and
advancing. The difference between declarations and distinct IDs applies to
both executable rules and scope boundaries; reused IDs do not necessarily
represent independent bidding treatments.

## Practice corpus and primary test assertions

| Measurement | Count |
|---|---:|
| Practice buckets | **70** |
| Distinct practice-deal definitions | **645** |
| Practice selections | **645** |
| Recorded auction calls across practice selections | **3,048** |
| Calls at supported evaluator stages | **2,611** |
| Calls without a supported-stage classification | **437** |
| Practice-guidance notes across selections | **32** |
| Primary positive call/rule assertions | **1,545** |
| Primary elimination assertions | **800** |
| Primary call-order assertions | **31** |
| Primary recorded-call checks | **1,459** |

Primary assertion counts use the declared expected calls and rule IDs,
rejected calls, ordering pairs, and tested auction positions from the practice
corpus. These are not the same as replaying every auction call, which includes
opponent actions and deliberately unjudged turns. The full rule-test suite
also runs separate regression and agreement-compatibility checks.

## Rule reach during recorded-auction replay

| Distinct executable rule IDs | Count |
|---|---:|
| Qualified a recorded call | **510** |
| Qualified recorded call or a different alternative | **528** |
| Considered in evaluator diagnostics | **616** |
| Cited in generated core feedback | **528** |
| Cited when not qualifying the entered call | **118** |
| Not represented by a qualifying call or alternative | **109** |

**Executable rule coverage:** 82.9%.
**Applicable scope-boundary IDs:** 5 of 94
(5.3%). Scope boundaries are not qualifying calls.

Unrepresented executable IDs are distinct from the separate scope boundaries.
A rule considered in diagnostics may have failed an eligibility requirement;
a rule cited in feedback may only appear in an automatically generated list.
Neither statistic alone establishes the instructional quality of a rule.

### By rule collection

| Collection | Executable declarations | Scope boundaries | Matched recorded call | Matched recorded or alternative | Unreached | Considered in diagnostics |
|---|---:|---:|---:|---:|---:|---:|
| Opening | 13 | 0 | 12 | 12 | 1 | 13 |
| Responding | 117 | 3 | 105 | 107 | 10 | 117 |
| Overcalling / overcaller rebids | 123 | 27 | 88 | 88 | 35 | 121 |
| Advancing | 108 | 6 | 100 | 101 | 7 | 108 |
| Opener rebids | 205 | 33 | 147 | 161 | 44 | 188 |
| Responder rebids | 95 | 26 | 77 | 78 | 17 | 93 |

**Considered in diagnostics** means that during replay of a recorded decision,
the evaluator included the rule among those it examined. The rule could have
failed its strength, suit, shape, auction, or other requirements. The number
is **not** a count of qualified bids or explanations actually displayed.
**Column caution:** An ID may be declared in multiple collections (especially
responding and advancing). The reach columns therefore overlap; their totals
cannot be added to obtain the distinct-ID counts above.

### By actual bidding stage

| Stage | Executable IDs | Qualified | Coverage | Unreached | Applicable scope boundaries / total |
|---|---:|---:|---:|---:|---:|
| opening | 13 | 12 | 92.3% | 1 | 0 / 0 |
| responding | 117 | 107 | 91.5% | 10 | 1 / 3 |
| openerRebid | 205 | 161 | 78.5% | 44 | 0 / 33 |
| responderRebid | 95 | 78 | 82.1% | 17 | 0 / 26 |
| overcalling | 21 | 21 | 100.0% | 0 | 4 / 6 |
| balancing | 6 | 6 | 100.0% | 0 | 0 / 1 |
| advancing | 108 | 94 | 87.0% | 14 | 0 / 6 |
| overcallerRebid | 91 | 56 | 61.5% | 35 | 0 / 19 |
| sandwichOvercalling | 5 | 5 | 100.0% | 0 | 0 / 1 |
| sandwichAdvancing | 0 | 0 | — | 0 | 0 / 0 |
| sandwichOvercallerRebid | 0 | 0 | — | 0 | 0 / 0 |

Shared rule IDs count separately in each stage; a response does not establish
reach as an advance. A scope boundary counts when it remains applicable after
candidate suppression, not necessarily when selected for display.
To list the exact unreached executable IDs by stage, run
`npm run project:stats -- --unreached`.

### Interpretation of unreached executable IDs

The 109 distinct executable IDs not reached by a qualifying
call are **not** scope-boundary declarations. They include specialized slam
choices outside the practice priorities, unexercised alternatives in bidding
families that have qualifying sibling treatments, and other uncovered
continuations. These are qualitative review categories, not an automatically
verified partition; no separate numerical category breakdown is maintained.

A qualifying sibling does not test an unreached rule's own eligibility or
explanation. The count is useful context, not a coverage target, and does not
justify adding practice deals solely to increase the percentage.

