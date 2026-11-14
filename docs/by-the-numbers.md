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
| Scope-boundary declarations | **87** |
| Distinct scope-boundary IDs | **86** |
| Combined executable plus scope declarations | **733** |
| Distinct IDs including scope boundaries | **708** |
| Distinct IDs with a nonempty meaning | **701** |
| Distinct IDs with nonempty guidance | **434** |

A rule ID can occur in more than one collection, principally responding and
advancing. The difference between declarations and distinct IDs applies to
both executable rules and scope boundaries; reused IDs do not necessarily
represent independent bidding treatments.

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
| Qualified recorded call or a different alternative | **512** |
| Considered in evaluator diagnostics | **601** |
| Cited in generated core feedback | **512** |
| Cited when not qualifying the entered call | **114** |
| Not represented by a qualifying call or alternative | **110** |

Unrepresented executable IDs are distinct from the separate scope boundaries.
A rule considered in diagnostics may have failed an eligibility requirement;
a rule cited in feedback may only appear in an automatically generated list.
Neither statistic alone establishes the instructional quality of a rule.

### By rule collection

| Collection | Executable declarations | Scope boundaries | Matched recorded call | Matched recorded or alternative | Unreached | Considered in diagnostics |
|---|---:|---:|---:|---:|---:|---:|
| Opening | 13 | 0 | 12 | 12 | 1 | 13 |
| Responding | 117 | 3 | 103 | 105 | 12 | 117 |
| Overcalling / overcaller rebids | 114 | 24 | 79 | 79 | 35 | 112 |
| Advancing | 105 | 3 | 95 | 96 | 9 | 105 |
| Opener rebids | 202 | 31 | 145 | 159 | 43 | 185 |
| Responder rebids | 95 | 26 | 77 | 78 | 17 | 93 |

**Considered in diagnostics** means that during replay of a recorded decision,
the evaluator included the rule among those it examined. The rule could have
failed its strength, suit, shape, auction, or other requirements. The number
is **not** a count of qualified bids or explanations actually displayed.
**Column caution:** An ID may be declared in multiple collections (especially
responding and advancing). The reach columns therefore overlap; their totals
cannot be added to obtain the distinct-ID counts above.

### Interpretation of unreached executable IDs

The 110 distinct executable IDs not reached by a qualifying
call are **not** scope-boundary declarations. They include specialized slam
choices outside the practice priorities, unexercised alternatives in bidding
families that have qualifying sibling treatments, and other uncovered
continuations. These are qualitative review categories, not an automatically
verified partition; no separate numerical category breakdown is maintained.

A qualifying sibling does not test an unreached rule's own eligibility or
explanation. The count is useful context, not a coverage target, and does not
justify adding practice deals solely to increase the percentage.

**Overcalling / overcaller rebids:** Of the collection's unreached
executable rules, 35 concern overcaller rebids and
0 concern initial direct overcalls. Many are
specialized continuations rather than missing basic overcall teaching, but
each unreached ID remains individually untested by a qualifying call.
