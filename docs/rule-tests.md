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

The runner also performs a separate **agreement-compatibility meta-check**. It tests the recorded
practice call at each declared stage under four representative settings: Stayman/Jacoby/Texas all
on; Stayman/Jacoby on with Texas off; Stayman only; and all three off. A deal is checked under
one of these settings only if its `requiredSystem` allows it. Other agreement settings come from
the deal's requirements or the defaults. This catches omitted convention requirements that could
otherwise put an unsupported auction into the test-deal dropdown. It does not rerun the positive,
elimination, or ordering assertions under every setting: those can legitimately vary by agreement,
and four representative settings do not cover all eight possible combinations. The report keeps
compatibility counts separate from primary assertion counts.

This document records **variations that have executable tests**, not unimplemented work or a
second copy of the deal definitions. Add an entry when a new test establishes a meaningful
bidding distinction, especially a point-range boundary, a refiner outcome, or an agreement
contrast. Keep each deal's `description` useful to the person practicing it.

## Recorded coverage

The current corpus contains 180 deals, with 525 positive call/rule assertions, 131 elimination
assertions, thirteen call-order assertions, and 471 recorded-practice-call checks. Positive assertions
cover all 83 implemented suit-opening opener-rebid rule IDs, all eight immediate 1NT/2NT
opener-continuation rule IDs, and all four notrump-invitation rule IDs. All 12 ordinary
minor-opening response rules and all 20 ordinary major-opening response rules remain covered.
The remaining response ID in each suit family is the specialized Blackwood option, for which
dedicated practice deals were omitted.

Twenty-five existing notrump response deals were extended through opener's next call and **moved**,
not copied, into the `nt-1nt` and `nt-2nt` opener-rebid dropdown buckets. Two existing minor-raise
response deals are likewise moved into the new `minor-raise` opener-rebid bucket, and five new
minor-raise comparison deals exercise the remaining strength and distribution cases. Earlier-stage
opening and response assertions continue to run after a deal moves to a later bucket.

These are selected meaningful variations represented in the corpus, not an inventory of every
condition inside each rule or refiner.

| Tested distinction | Where to find the deals | Recorded expectations |
| --- | --- | --- |
| Opener after a simple minor raise | `minor-raise`, four `1m-2m` deals | With 12-16 total points opener can Pass; 17-18 raises the agreed minor to three; with 19+ total points 3NT is the usual game target. An extreme seven-card-minor hand keeps five of the minor as a lower-ranked judgment alternative. |
| Opener after a minor limit raise | `minor-raise`, three `1m-3m` deals | A bad 12-13-total-point minimum can Pass; 14+ total points qualify for the usual 3NT acceptance. With 17+ total points, a seven-card minor, and extreme shape, five of the minor remains available behind 3NT. |
| Minor-raise stopper guidance without a hard stopper gate | `minor-raise`, both 3NT families | The executable rules use strength and the known minor fit, not `HandConstraint.stoppers`. Guidance gives A, Kx+, or Qxx+ as a conservative full stopper and leaves Qx, Jxx, and lead/declaring-position-dependent holdings to judgment. |
| Natural game invitations after 1NT | `nt-1nt`, paired minimum, middle, and maximum hands under both 15-17 and 16-18, including natural bidding without conventions | Over either 1NT range, opener declines `2NT` with minimum HCP, accepts with maximum HCP, and keeps both Pass and `3NT` at the middle HCP; selected boundary deals eliminate the unavailable alternative. The 15-17 no-conventions invitation retains its unbalanced response rule and now tests acceptance by a 17-HCP opener. |
| Quantitative 4NT after 1NT | `nt-1nt`, minimum/middle/maximum hands under both 1NT ranges | Minimum opener passes; maximum bids `6NT`; at the middle HCP both remain valid judgment alternatives. Recorded calls use quantitative, not Blackwood, response rules. |
| Quantitative 4NT after 2NT | `nt-2nt`, paired 20- and 21-HCP openers | With 20 HCP, opener declines with Pass. With 21 HCP, both Pass and `6NT` remain qualified, with Pass presented first because responder can have only 11 HCP and slam depends on working honors and likely tricks. |
| Stayman replies after 1NT | `nt-1nt`, three extended Stayman deals and one additional four-heart opener | A 15-17 opener denies a four-card major with 2D, shows hearts with 2H, or shows spades with 2S. With both majors opener shows hearts first. Unselected replies are eliminated. |
| Stayman replies after 2NT | `nt-2nt`, one extended Stayman deal and two additional opener shapes | The same three outcomes appear one level higher as 3D/3H/3S, including both four-card majors and spades without hearts. |
| Ordinary Jacoby and Texas completion | `nt-1nt` and `nt-2nt`, two Jacoby and two Texas deals each | Transfer completion occurs at the appropriate level for both openings; Pass is eliminated when a transfer is forcing. Texas on/off remains an explicit agreement distinction. Superaccepts are not modeled. |
| Natural notrump and major signoffs | `nt-1nt` and `nt-2nt`, 3NT, natural 4M with Texas off, 6NT, and weak 2H with Jacoby off | Opener passes responder's selected natural signoff. In contrast, when Texas is enabled after 1NT-4H, opener must bid 4S, not Pass. |
| Natural 2NT opening shapes and strengths | `response-2nt-opening` and `nt-2nt`, all 2NT-response deals | Every new response deal asserts the ordinary balanced 20-21 HCP opening; the selected openers include 20-HCP 4-3-3-3 and 5-3-3-2 hands and a 21-HCP 4-4-3-2 hand. Selected deals eliminate fallback convenient-minor openings. |
| Pass versus 3NT after 2NT | `response-2nt-opening` and `nt-2nt`, balanced 3- and 4-HCP hands plus unbalanced six-club hand | Pass qualifies with 0-3 HCP regardless of shape; balanced 4 HCP responds 3NT even opposite a minimum 20-HCP opener. This specific source treatment is not forced into the 25-combined-HCP guideline. |
| Weak major transfers versus Pass | `response-2nt-opening` and `nt-2nt`, paired zero-HCP six-heart hands and the two-HCP five-spade hand | With Jacoby on, weak major transfers displace Pass; with Jacoby and Texas off, the identical zero-HCP six-heart hand may Pass. |
| Stayman preference after 2NT | `response-2nt-opening` and `nt-2nt`, 4-HCP four-heart and 7-HCP six-heart/four-spade hands | 3C Stayman qualifies with a four-card major; six hearts with four spades use Stayman rather than the heart transfer. |
| Two five-card majors after 2NT | `response-2nt-opening`, 3- and 4-HCP 5-5 major hands | At 3 HCP, both 3D and 3H transfers remain available; at 4 HCP, 3D remains and 3H is eliminated. |
| Texas on and off after 2NT | `response-2nt-opening` and `nt-2nt`, paired six-heart and six-spade five-HCP hands | The same hands use Texas 4D/4H when enabled, or natural 4H/4S when disabled; the slower Jacoby route is eliminated in game-placement cases. |
| Texas game placement versus Jacoby slam exploration | `response-2nt-opening`, six-heart 10- and 11-HCP hands | At 10 HCP, Texas 4D is the game route; at 11 HCP, ordinary 3D Jacoby keeps bidding room and Texas 4D is excluded. |
| Natural three-level major and notrump slam decisions | `response-2nt-opening` and `nt-2nt`, natural 3H without Jacoby, balanced 11-HCP 4NT, and balanced 13-HCP 6NT | A natural 3H can be game forcing without transfers; quantitative 4NT invites slam, whereas 13 balanced HCP place the contract in 6NT. Rare Gerber, forcing 5NT, and direct 7NT have no dedicated deals. |
| Balanced 1NT-response point boundaries under both opening agreements | `response-1nt-opening`, paired 7-HCP and 9-HCP boards plus the 6-HCP 16–18 Pass | The same 7 HCP passes over 15–17 but invites over 16–18; the same 9 HCP invites over 15–17 but bids 3NT over 16–18. Six HCP still passes with the stronger opening. |
| Stayman threshold under 16–18 | `response-1nt-opening`, paired 7-HCP four-heart boards | An otherwise identical balanced hand qualifies for Stayman over 16–18, but passes over 15–17; the weaker 15–17 Stayman is explicitly excluded. |
| Two five-card majors under 16–18 | `response-1nt-opening`, 8- and 9-HCP equal-major boards | The adjusted invitational case selects the heart transfer `2D`, while 9 HCP selects the spade transfer `2H`; the other transfer is eliminated in each case. |
| Game-only major route under both ranges and Texas settings | `response-1nt-opening`, one 9-HCP six-heart hand played three ways | At 16–18 with Texas on, `4D` qualifies; Texas off selects natural `4H`. At 15–17 the identical hand instead starts with Jacoby `2D`. |
| Six-card-minor invitation with stronger 1NT opening | `response-1nt-opening`, 7-HCP six-club hand | Natural `3C` qualifies with 7 HCP over 16–18. The KQ suit honors illustrate suitability, but suit quality remains guidance-only. An unbalanced `2NT` invitation can also qualify when both Stayman and Jacoby are disabled, so the deal does not eliminate `2NT` across all agreements. |
| Quantitative and direct small-slam threshold changes | `response-1nt-opening`, paired balanced 15-HCP boards and direct 6NT 17-HCP board | Fifteen HCP bids `3NT` over 15–17 but invites with quantitative `4NT` over 16–18; 17 HCP bids direct `6NT` over 16–18. |
| Major slam-interest versus Texas at the adjusted boundary | `response-1nt-opening`, paired 15-HCP six-heart boards | A direct `3H` with 15 HCP expresses slam interest over 16–18, while the same hand takes the Texas `4D` game route over 15–17; lower-level Jacoby is eliminated. |
| Natural responses to a 15–17 1NT opening | `response-1nt-opening` and `nt-1nt`, weak balanced, invitational, and game-going hands | All three natural response ranges qualify under their recorded rules, with selected neighboring levels eliminated. Each deal also asserts the ordinary 15–17 opening. |
| Ordinary Stayman and 5–4 major Stayman preference | `nt-1nt`, four-heart and five-heart/four-spade hands | Stayman qualifies with at least four cards in a major; with five hearts and four spades, both Jacoby transfers are eliminated. |
| Weak Jacoby transfers and 5–5 major strength ladder | `response-1nt-opening` and `nt-1nt`, weak single-major and three equal-five-major cases | Weak five-card hearts and spades displace Pass; weak 5–5 retains both transfers, 8–9 HCP retains only the heart transfer, and 10+ HCP retains only the spade transfer. |
| No-convention natural responses after 1NT | `response-1nt-opening` and `nt-1nt`, natural 2H, 2S, 2NT, and 3S hands | With Stayman and Jacoby both off, natural weak two-level major signoffs, an unbalanced 8-HCP 2NT invitation, and natural forcing 3S qualify. The strong five-spade hand excludes natural 3NT. |
| Texas off, with Stayman and Jacoby on | `response-1nt-opening` and `nt-1nt`, natural 4H and 4S paired with existing Texas-on hands | The identical six-card-major hands use natural 4M when Texas is off, and artificial Texas 4D/4H when Texas is on. In either case, the game-only route suppresses ordinary Jacoby. |
| Six-four majors and direct major slam interest | `response-1nt-opening` and `nt-1nt`, six-heart/four-spade Stayman and strong six-heart 3H hands | Stayman wins over the heart transfer on a six-four major hand; with 16 HCP, six hearts, and no other four-card major, direct 3H expresses slam interest and removes ordinary Jacoby. |
| Texas transfers versus ordinary Jacoby | `nt-1nt`, six-heart and six-spade game hands | Four-level Texas transfers qualify under the active agreement and eliminate the lower-level Jacoby alternative. |
| Natural invitations with a six-card minor | `response-1nt-opening`, club and diamond invitation hands | Both 3C and 3D qualify with 8–9 HCP and six cards. The hands have KQ or AK in their minors to illustrate suit quality; the evaluator currently checks only length and HCP, **not** suit quality. |
| Quantitative 4NT after 1NT | `response-1nt-opening`, balanced 16-HCP hand | Quantitative 4NT qualifies as a small-slam invitation rather than a game-going 3NT response or ace-asking Blackwood. |
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
