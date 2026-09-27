# Rule Tests

The deterministic practice deals in `src/models/rule-test-deals.ts` are the executable record of
selected bidding situations. Run `npm run test:rules` to evaluate every bucket, including deals
requiring non-default partnership agreements. No application build or browser is needed. To
capture failures and the summary, use `npm run test:rules > rule-test-results.txt 2>&1`.

The runner verifies recorded call/rule pairs, selected eliminated calls, selected relative call
orders, and the actual call recorded for each tested stage. It does not choose a bid for the
player, validate the bidding treatment against outside sources, or measure exhaustive code-branch
coverage. Stages not declared on a deal are skipped; explicitly empty expectation arrays and
expected calls with no rule IDs are malformed test data.

This document records **variations that have executable tests**, not unimplemented work or a
second copy of the deal definitions. Add an entry when a new test establishes a meaningful
bidding distinction, especially a point-range boundary, a refiner outcome, or an agreement
contrast. Keep each deal's `description` useful to the person practicing it.

## Recorded coverage

The suit-auction and opening-selection checkpoint includes 104 deals, with 321 positive call/rule
assertions, 15 elimination assertions, ten call-order assertions, and 276 checks that the
recorded practice call qualifies. The positive assertions cover all 76 implemented opener-rebid
rule IDs, all 12 ordinary minor-opening response rules, and all 20 ordinary major-opening response
rules. The remaining response ID in each suit family is the specialized Blackwood option, for
which dedicated practice deals were deliberately omitted.

These are selected meaningful variations represented in the corpus, not an inventory of every
condition inside each rule or refiner.

| Tested distinction | Where to find the deals | Recorded expectations |
| --- | --- | --- |
| Five-card-major 1NT upgrade under 15–17 and 16–18 | `opening-bids`, paired upgrade-enabled and disabled deals for each range | Balanced 14-HCP hearts and 15-HCP spades show both `1NT` and the major with the upgrade on, `1NT` first; with it off, only the major survives. |
| Equal five-card majors at the Guideline of 20 boundary | `opening-bids`, 10-HCP 5-5 major deal | Both `open-five-card-major` and `open-guideline-of-20` support `1S`, and `1H` is eliminated. |
| Strict balanced-hand requirement for natural 1NT | `response-major-opening`, flat weak responder after `1H` | The 15-HCP opener's 5-4-2-2 shape permits `1H`, but excludes `1NT` even though it meets the normal HCP range. |
| Three-card versus four-card minor opening ties | `minor-one-level-new-suit`, first deal; `minor-two-over-one-new-suit`, third deal | With 3-3 minors, `1C` qualifies and `1D` does not; with 4-4 minors, `1D` qualifies and `1C` does not. |
| Equal four-card versus equal five-card majors after `1C` | `response-minor-opening`, equal-major deals | Both majors survive; `1H` precedes `1S` with 4-4, while `1S` precedes `1H` with 5-5. |
| Four- and five-card unequal majors after `1C` | `response-minor-opening`, five-heart/four-spade deal | The longer `1H` survives; the shorter `1S` is eliminated, not merely ranked second. |
| Longer diamonds alongside four spades after `1C` | `response-minor-opening`, eight- and twelve-HCP five-diamond/four-spade deals | With 8 HCP, prefer `1S` while retaining the longer `1D`; with 12 HCP, retain `1S` but eliminate `1D`. |
| Bypassing a minor raise for a major after `1D` | `response-minor-opening`, four-diamond/four-spade deal | `1S` qualifies with 8 HCP and the otherwise available `2D` minimum raise does not. |
| Three-card-minor fallback with game-forcing major support | `response-major-opening`, three-card-spade-support fallback deal | With 13 HCP, three spades, four hearts and 3-3 minors, both `2C` and `2D` qualify; `2H` does not. |
| Forcing `1NT` equal-minor fallback | `major-1nt`, five-spade/equal-three-card-minor deal | The minimum opener manufactures `2C` instead of `2D` under forcing `1NT`. Existing deals independently test passing a flat minimum under non-forcing `1NT`. |
| Standard two-level response: minimum versus strong diamond opener with a second heart suit | `minor-standard-two-level-new-suit`, first two deals | At 14 HCP / 15 total, repeat `2D` and exclude the `2H` reverse; at 18 HCP / 19 total, `2H` qualifies. |
| Available one-level new suit versus fallback notrump | `major-one-level-new-suit`, first deal; `minor-one-level-new-suit`, first deal | Responder's `1S` leaves no qualifying fallback `1NT` after `1H`; opener's `1S` excludes fallback `1NT` after `1C–1H`. |
| Three-card major limit raise when a one-level new suit is available | `response-major-opening`, `1H–1S` limit-raise deal | Respond `1S` and exclude the `1NT` fallback. |
| Weak versus strong jump shifts after `1C` | `response-minor-opening`, weak and strong jump-shift deals | Each system's `2H` rule and the natural `1H` rule both qualify; `2H` precedes `1H`. |
| Weak jump shift after `1H` | `response-major-opening`, weak-jump-shift deal | `2S` and `1S` both qualify, with `2S` first. |
| Shortage points and splinter presentation | `response-major-opening`, `1H–4C` splinter deal | 11 HCP plus three shortage points qualify for the splinter and two natural routes; `4C` precedes `1S` and `2D`. |
| Game-forcing major support with a flat hand | `response-major-opening`, flat 14-HCP `1S` deal | Natural `2D` followed by a raise and direct `3NT` both qualify. |
| Five-card major opener after a forcing or non-forcing `1NT` response | `major-1nt` | Distinct deals exercise the forcing rebid requirement and the non-forcing `Pass` treatment. |
| Standard and 2/1 opener rebids after two-level new-suit responses | The four `*-two-level-new-suit` opener-rebid buckets | Distinct deals exercise different reverse-strength requirements and economical second-suit rebids. |

An *elimination assertion* means a call is absent from the final candidate list for that hand
and auction; it does not claim that the evaluator first generated and then rejected the call.
A *call-order assertion* checks relative presentation preference when both calls legitimately
survive; it does not eliminate the lower-ranked alternative. An expected call/rule pair is a
*positive assertion*: the recorded call must qualify under that specific executable rule.
