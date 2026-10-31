# Instructional Explanation Coverage Review

Baseline: master at 268c2f9 (October 28, 2026). This is a **source-based first-pass inventory and review queue**, not a certification that every rule has been pedagogically approved. It does not change the selected bidding system or demand a custom explanation for every rule.

## Purpose and acceptance standard

Assess every **decision family** in the selected model, including its executable rules and nearby scope boundaries. Decide whether the existing rule meaning/guidance and shared display path are sufficient, or whether students would benefit from a specific hand-aware explanation of:
- What partner's bid promises and whether it is forcing.
- Which evaluated values matter: strength, lengths, fit, shape, stoppers, suit quality, or actual bidding level.
- Why this call was chosen over a genuinely plausible alternative.
- Why a plausible rejected bid failed its actual tested requirement, without manufacturing diagnostics or calling an unmodeled judgment "wrong."
- Why an auction ends at a judgment boundary, especially if a one-round or game force remains unresolved.

**Do not target 100% custom-explanation coverage.** A straightforward Pass, compulsory transfer completion, or explicit scope boundary may already be taught sufficiently by its meaning/guidance. Count an alternative legitimately presented in an exercise as represented; do not add practice deals merely to raise a percentage.

### Decision labels for completing each subsequent family review

- **Adequate:** actual qualifying and relevant near-miss examples make the meaning/guidance and existing shared feedback sufficient. Record that judgment rather than adding code.
- **Improve:** hand-specific evidence, comparison, force status, or an important rejection reason is missing or misleading. Identify the evaluated fact and minimal explanation change.
- **Judgment boundary:** deterministic advice is not reliable or is outside our agreements; ensure honest, auction-specific guidance without pretending Pass is recommended.
- **Integration issue:** useful evidence/explanation exists but does not appear consistently in normal feedback, unsupported-call feedback, recorded-call substitution, or clipboard Report.

The provisional statuses below mean **previously developed**, **targeted validation**, or **deep review**. They are **not** the four final decisions above; apply the final labels only after reading representative actual explanations. Avoid using presence/absence of a rule ID in explanations.ts as proof of adequacy.

## Source census and review limitations

| Rule declaration module | Executable rule declarations | Scope boundaries | First-pass conclusion |
| --- | ---: | ---: | --- |
| opening-rules.ts | 13 | 0 | Earlier explanation batches; validate representative families |
| responding-rules.ts | 89 | 1 | Earlier batches for primary families; selected gaps below |
| advancing-rules.ts | 81 | 2 | Earlier B14–B20 batches; selected gaps below |
| opener-rebidding-rules.ts | 202 | 31 | Substantial recently completed family work; final integration validation pending |
| overcalling-rules.ts | 114 (25 overcall/balancing + 89 overcaller rebid) | 24 | Direct defenses largely developed; later rebids highest priority |
| responder-rebidding-rules.ts | 95 | 26 | Many executable families use primarily generic meaning/guidance; high priority |
| **Total** | **594** | **84** | **678 declarations, not 678 required explanations** |

There are 69 practice buckets in test-deals-registry.ts: 1 opening, 10 responding, 13 overcalling, 11 advancing, 20 opener rebid, and 14 responder rebid. Existing rule-test and CI success establishes executable expectations, **not** the instructional sufficiency of the displayed text or completeness of coverage.

Inspection sources: the six stage rule modules above; explanations.ts and BidPanel.tsx for specialized helpers/wiring; biddingEvaluation.ts and bidding-types.ts for evidence; test-deals-registry.ts and the stage deal modules for practice cases. The review is a **structural census and provisional teaching-gap triage**; it is not a per-hand playback or an exhaustive branch audit.

## Family-by-family review inventory

The family groupings collectively cover each stage's executable declarations and scope boundaries. A provisional "previously developed" means a focused explanation batch exists; it **does not** mean every rule in that row passed final review.

| Auction stage and decision families | Present teaching / provisional assessment | Further review or disposition |
| --- | --- | --- |
| Opening: Pass, one-level convenient minor/five-card major, 1NT/2NT, strong 2C, weak two/three/four/five | Previously developed B1–B3: selection, valuation, preempts, rejected requirements | Spot-check light openings, alternative selection, preempt quality, and intentionally ordinary Pass; simple meaning may suffice |
| Direct overcall: ordinary/strong takeout Double, including defense to a weak two | Takeout-Double evidence-driven explanations cover both normal and weak-two Double IDs | Targeted check: weak-two opponent context, ordinary vs strong exception, rejected shape and point requirements |
| Direct overcall: natural one-/two-level suit, natural 1NT and its stopper | Previously developed explicit natural-suit and 1NT helpers | Check alternative choice vs Double and boundary hands; verify stopper failures and correct strain/level |
| Direct overcall: preemptive jump at levels two, three, four | Previously developed suit-length/quality and HCP explanations | Verify real jump vs cheapest natural overcall and negative examples; otherwise likely adequate |
| Direct defense: DONT after opposing strong 1NT | Agreed artificial meanings; previous first-action teaching and associated advancing | Targeted check: Double vs artificial 2C/2D/2H vs natural 2S; why competing calls fail and no automatic penalty Double |
| Direct defense: natural suit/2NT over weak two; defense to strong 2C/2NT, three-level preempts and high openings | Concrete weak-two overcall rules and boundary meanings exist; specialized natural-suit helper focuses on ordinary one-level-opening overcalls | Targeted: whether weak-two natural suit/NT and stopper-quality near misses get sufficient feedback; boundaries are candidates for meaning-only adequacy |
| Balancing: suit, 1NT, ordinary/strong Double, defensive Pass, judgment boundary | Earlier B4–B8 work includes balancing-specific evidence and rejection functions | Validate across the full fourth-seat family; do not add text solely because a Pass or boundary lacks custom prose |
| Responses to minor/major: suits, raises, limit/strong support, 1NT/2NT/3NT, weak/strong jump shifts | Previously developed B9–B13 and shared rule guidance | Check agreement-sensitive jumps, support-value borderline and relevant alternatives; otherwise avoid rework |
| Responses to 1NT/2NT and strong 2C; to weak and high preempts | Conventions and descriptive rules with existing meaning/guidance; NT partner-response explanation helpers share treatment with advancing | Targeted check of transfers, Stayman, nonforcing vs forcing calls, strong-2C responses and preempt boundaries |
| Responses after suit overcall, takeout Double, natural 1NT overcall, jump overcall | Explicit competing meanings and selected boundaries; less uniformly specialized student feedback than ordinary responses | Targeted deep review: negative Double, Jordan 2NT/Redouble, weak new suits/jump raises, 1NT overcall penalties boundary and blocked cheapest bids |
| Advancing: one-/two-level natural suit overcalls, takeout Double, natural 1NT | Previously developed B14–B16, including natural and takeout helpers plus shared NT explanation | Spot-check actual auction-level constraints, forcing cuebids, suit quality and denied alternatives |
| Advancing: DONT, preemptive jumps, weak-two 2NT systems-on | Previously developed B17 and shared conventions; some rules rely on their own meaning/guidance | Targeted: artificial vs natural calls, weak-two 2NT conventions, unmodeled competition, signoff vs forcing distinctions |
| Advancing after responder raise, natural suit, negative Double or Redouble; responsive Doubles, artificial support and escape | Previously developed B18–B20 with dedicated helpers for competitive families | Targeted validation of auction-specific meaning and boundaries; honor artificial cuebid/Redouble rather than treating suit text literally |
| Opener rebid: natural/uncontested minor/major, 1NT/2NT, strong 2C, conventional raises, splinters, jump shifts, game responses | Major family-focused explanation work completed; both meaningful positive and rejected-call helpers exist | **Verification pass**, not automatic closure: sample each subfamily; simple mechanical continuations can be adequate with shared meaning |
| Opener rebid after suit/NT interference or Double: negative Doubles, forcing suits, artificial support, weak/NT/game-forcing responses, competitive advancer action, jump-overcall continuations | Recent explanation batches include numerous specialized helpers and four new weak-after-Double scope boundaries | **Verification pass** of unreviewed corners, especially jump-overcall continuations, NT-opening interference, forcing obligations and genuine rejected-call evidence |
| Overcaller rebid after natural 1NT overcall: Stayman, Jacoby/Texas, natural signoffs, 2NT/3m/4NT invitations and slam boundary | Explicit executable rules; no dedicated broad overcaller-NT rebid explanation family is visible in explanations.ts | **Deep review** of agreement, thresholds, honor support, invitation decisions, and rejected calls; retain adequate compulsory completions |
| Overcaller rebid after natural suit overcall, advancer Pass/raise, cuebid/new suit, NT; both unopposed and contested | An evidence-driven natural-suit-overcaller helper exists for core unopposed continuations; many contested families are distinct | **Deep review** contested and artificial continuations against actual advancer action/level; audit reused helper and boundaries |
| Doubler rebid after ordinary takeout Double: minimum/strong cases, jumps, cue, NT, natural advances and competitive runouts | Executable family is extensive; no matching dedicated takeout-Doubler rebid explanation helper found | **Deep review** of what the Double initially promised versus subsequent fit, strength and forcing status; nonforcing and penalty boundaries |
| Overcaller/Doubler continuation after weak-two defenses, natural 2NT, suit overcalls and extra competition | Separate weak-two 2NT systems, weak-two Double/suit rebid rules and explicit boundaries exist | **Deep review**; especially reuse of NT conventions, honors/stoppers, advancing forcing suits and interference stops |
| Responder rebid after Stayman/transfers, natural 1NT/2NT rebids, strong 2C, Jacoby 2NT/splinters | Executable rules and practice buckets exist; most rely on generic meaning/guidance | **Deep review**: choose informative examples, avoid custom prose for compulsory signoffs/transfers already clear |
| Responder rebid after 2/1 versus Standard new suit, major/minor 1NT, simple/limit raises, game tries, repeated suits, economical second suit, reverse/strong jump shift | Many executable rules and scope boundaries; specialized responder-simple-raise explanation helper exists for only a narrow subset | **Deep review** forcing vs invitational decisions, delayed support, wrong-strain alternatives, rebid order and near-miss explanations |
| Bidding notes and deliberately unmodeled later auctions | BiddingNotes, scope-boundary rule meanings and shared guidance already present | Meaning/guidance can be sufficient. Check honest boundaries; do not promote notes to executable bidding rules |

## First family review: direct overcalls, Doubles, DONT and balancing

Reviewed October 28, 2026 against `overcalling-rules.ts`, `overcalling-functions.ts`,
`explanations.ts`, `BidPanel.tsx`, `biddingEvaluation.ts`, and the corresponding
`overcalling-test-deals.ts` families. This first pass checks **all 31 direct
overcall/balancing rule and boundary declarations by family** against the
instructional standard; it is a source inspection, not a claim to have rendered
each possible feedback case in the browser. The overcalling deal module includes
103 deal definitions across 13 arrays, many for subsequent rebids; relevant
direct-action examples include DONT, weak-two defense, takeout Doubles, ordinary
natural overcalls, preemptive jumps and balancing.

| Decision family | Review result | Evidence and follow-up |
| --- | --- | --- |
| Direct ordinary and strong takeout Double of a one-level suit or weak two | **Provisionally adequate** | Both ordinary and 18+ HCP branches have hand-based positive and negative explanation helpers. The ordinary variant uses shortage-adjusted values and three-card unbid-suit support; strong shape exception is distinguished. Spot-check genuinely displayed rejections and comparisons with available suit/NT actions before closing. |
| Ordinary one-/two-level natural suit overcalls | **Provisionally adequate** | Existing explanations distinguish economical bid from jump, level-specific length/strength and honor quality, plus actual rejection evidence. Test a few 7-HCP exceptional suits and longer two-level suits, rather than rewriting the whole family. |
| Natural 1NT overcall of a one-level suit | **Provisionally adequate** | Existing accepted/rejected explanations use HCP, balanced shape and stopper evidence and say which suit must be stopped. Verify precedence against plausible natural suit or Double alternatives in a small play-through. |
| Preemptive jump overcalls at levels two, three and four | **Provisionally adequate** | Dedicated explanation uses actual jump selection, required suit length, top-honor quality and limited HCP, including rejected candidates. Sample non-jumps and weak suit-quality near misses. |
| Initial DONT Double, 2C, 2D, 2H and natural 2S over 1NT | **Implemented, browser review pending** | Added hand-specific positive and negative feedback using candidate evidence for suit lengths, 7+ HCP, two-suit shape and suit quality. Explains incorrect conventional meaning and only names an alternative when it actually qualifies. All five initial treatments and representative failures now have focused rule tests; existing agreements, relays and saved deals are unchanged. |
| Natural suit overcall against a weak-two opening | **Implemented, browser review pending (Oct 29)** | Preserved cheapest-call/level, suit length, honor quality, and declarative 13/15 length-inclusive points with 17-HCP ceiling. Added hand-specific support and rejection teaching, including explaining a jump without treating it as an incorrect natural non-jump overcall. Focused tests cover qualifying bids, failed shape/honors/strength and an independently qualifying cheaper call; no bidding agreement changed. |
| Natural 2NT overcall against a weak-two opening | **Implemented, browser review pending (Oct 29)** | The shared 1NT/2NT evaluator now preserves actual 15–18 HCP, balanced-shape and stopper-in-opener-suit evidence for 2NT too. Accepted and rejected feedback identifies the specific failed condition; when takeout Double also qualifies, the explanation compares the two legitimate choices. No bidding requirement changed. |
| Fourth-seat balancing: one-/two-level suit, natural 1NT, ordinary/strong Double, Pass | **Provisionally adequate** | Dedicated accepted/rejected helper families explain lighter strength, ordinary vs strong Double shape, 1NT stopper, suit quality and defensive Pass. Passing is not treated as universally wrong if a light balance is also possible. Sample hands with competing Pass and suit choices and strong borderline Double. |
| Scope boundaries: strong 2C/2NT openings, high preempts, 18+ versus opposing 1NT and fourth-seat balancing gaps | **Judgment boundary, meaning likely sufficient** | Boundaries already state non-modeled convention, defense or penalty judgment and avoid automatic Pass. Verify they surface when no valid modeled action qualifies; do not add algorithmic calls or custom explanation text purely for rule-count coverage. |
| Generic Pass when no direct competitive action qualifies | **Meaning/guidance likely adequate** | `overcall-pass-no-qualifying-action` documents why the app may prefer defending; detailed failure diagnostics for *every* alternative would be excessive. Confirm fallback suppression and avoid portraying Pass as a universal recommendation on marginal hands. |

**Disposition (updated October 29):** Source review and the three identified
initial-defense instructional improvements (DONT, weak-two natural suit, weak-two
natural 2NT) are implemented. Actual browser feedback, recorded substitutions and
Report output still need representative play-throughs before final approval.
Previously developed direct-defense families remain provisionally adequate;
judgment-boundary decisions remain deliberate.

Do not equate this source review with signing off the entirety of subsequent
`overcallerRebid` rules; those belong to a later, separate decision family.

**Batch verification (October 29, 2026):** Initial DONT, weak-two natural suit, and weak-two natural 2NT now retain hand-specific evidence and provide accepted/rejected instructional explanations with regression tests. The three families have been implemented without adding any bidding rule or practice deal. Keep their **browser review pending** status until representative actual feedback and Report checks are complete.

## Prioritized review plan

1. **Validate direct defense and balancing comprehensively but efficiently.** Start with the actual earlier B4–B8 helper families. Inspect representative accepted, rejected, alternate, and boundary decisions for natural suit/1NT, ordinary/strong and weak-two takeout Double, preemptive jumps, DONT, balancing. Capture any concrete gap; explicitly mark families adequate when they are.
2. **Target unreviewed response/advancing corners.** Check weak preempts, strong 2C, competitive Jordan/Redouble and natural 1NT, negative/responsive Doubles, weak-two systems-on, and artificial cues. Do not broadly rewrite B9–B20.
3. **Complete the overcaller/Doubler rebid decision families.** Natural 1NT overcall conventions/invitations; natural suit advances and further competition; takeout-Doubler ordinary/strong paths; weak-two defense continuations. Analyze rules and practice auctions first, then implement only warranted teaching improvements.
4. **Complete responder-rebid decision families.** NT conventions; strong/forcing sequences; natural Standard vs 2/1; ordinary descriptive/invitational/game choices; selected competitive and end-of-modeled-depth boundaries.
5. **Revalidate opener-rebid exceptions.** Our prior deep work is not a blanket sign-off. Inspect natural notrump opening after interference, jump-overcall treatments, unmodeled Passes, and game-forcing end states.
6. **Final integration and play-through quality gate.** For every altered or approved family, verify normal accepted call, plausible rejected call, recorded-call substitution, clipboard Report, rule IDs, chosen system agreement, and next-turn boundary. Inspect actual rendered wording; automated tests alone do not prove tutoring quality.

Sequence is a priority guide, not a mandate to change every family. When reviewing a family, record the four final decision labels above and whether source/test/actual explanation evidence supports it. Avoid rule-count-based progress targets. Keep a concise per-family record here as work proceeds; do not claim a blanket phase is complete merely because a named batch was implemented.

## Student-facing language acceptance gate

After the remaining explanation families are implemented, review all student-facing
text and Reports—not just newly added explanations—for developer terminology such
as "model", "modeled", "scope boundary", "fixture", "rule", "the trainer", and
other internal implementation phrasing. Replace it with natural bridge teaching
language wherever possible, without obscuring deliberate judgment limits or
removing bracketed diagnostic rule IDs. Track the outstanding work in the roadmap.

## Deferred or intentionally limited

- No generalized penalty doubles/redoubles, Lebensohl, unconstrained later auctions, speculative game/slam judgment, or new convention families solely to close a coverage gap.
- No extra practice deals solely for coverage percentages; use existing credible cases and add a focused regression case only when a meaningful distinction is fixed.
- Keep user-facing text concise, use "app" rather than "trainer" in newly written instruction, and preserve [rule IDs]. Cosmetic terminology cleanup belongs to the final integration pass.
- Clickable auction-call explanations and wider interface redesign remain separate future features.

## Competitive responder qualification review (October 29, 2026)

- **Improved:** first negative Doubles over ordinary and jump overcalls, artificial support cuebids, Jordan 2NT, and strength-showing Redouble. Feedback uses evaluated HCP, shortage-adjusted support points, suit lengths, and legitimate alternative calls.
- **No bidding changes:** eligibility, priorities, agreements, and recorded practice deals remain untouched.
- **Provisionally adequate:** strong-2C waiting/positive responses, opposing natural 1NT-overcall responses, and the previously detailed responsive-Double and negative-Double advancing explanations.
- **Next:** focus on weak-two responses (define the Guideline of 17 parenthetically as HCP plus cards in opener's suit) and selected jump-overcall response corners.
- **Pending:** actual browser play-throughs, recorded-call substitution, and clipboard Report verification for this batch.

## Weak-two and jump-overcall response explanations (October 29, 2026)

- **Corrected:** after responder's strength-showing Redouble, opener can Pass when the next opponent Passes, leaving the original doubler another turn. Jordan 2NT is an artificial forcing raise and requires opener to bid. Later penalty decisions remain outside the selected treatment.
- **Improved:** weak-two Pass, preemptive three- and four-level raises, artificial 2NT game inquiry, and natural forcing new suit. Feedback uses the evaluator's Guideline of 17 (responder HCP plus cards in opener's suit), trump counts, and tested suit length and honor quality. New-suit rejection can explain a failed refiner qualification without inventing a candidate.
- **Improved:** cheapest nonforcing raises, natural forcing/game-forcing new suits, and natural 2NT/3NT after opposing jump overcalls. Actual HCP, fit, balanced shape, and stopper results are reported when evaluated.
- **Unchanged:** bidding eligibility, candidate ordering, agreements, practice deals, and conventional scope boundaries. No wording-specific tests; existing build and full rule suite remain the automated quality gate.
- **Browser review pending:** inspect accepted and rejected cases, recorded substitutions, and copied Report feedback. Continue with deeper overcaller and takeout-Doubler rebid review after this group.

## Earlier response and advancing closeout (October 30, 2026)

- **Improved:** direct responses to a 2NT opening now reuse the hand-aware 1NT/2NT response teaching where applicable: Stayman, Jacoby/Texas transfers, natural major bids, natural notrump game/slam choices, and relevant rejected declarative requirements. Artificial versus natural meanings follow the selected system.
- **Improved:** strong-2C immediate positive suit responses now preserve actual suit length and honor quality even when a proposed suit is removed by the call refiner; accepted positive suit and balanced 2NT responses explain their strength and game-forcing meaning. Artificial 2D remains the legitimate waiting choice.
- **Adequate, pending browser sampling:** primary natural overcall and takeout-Double advancing, DONT pass-or-correct, weak-two natural 2NT systems-on, jump-overcall advancing, and competitive negative/responsive-Double and cuebid families already have specialized evidence-driven feedback. No additional general rewrite planned.
- **Corrected:** three saved 1NT natural-minor invitation deal descriptions inaccurately said suit honor quality was illustrative; the existing rule actually tests for two of A/K/Q. No deals or eligibility changed.
- **Testing cleanup:** existing DONT and weak-two overcall explanation tests now verify supported/rejected calls, available natural alternatives, preserved facts, and relevant feedback presence without freezing English wording. No new wording tests were added.
- **Next source-based deep review:** overcaller and takeout-Doubler rebids. Earlier-stage actual browser play-throughs, recorded-call substitution, Report output, and the final end-user terminology audit remain part of the eventual integration quality gate.

## Takeout-Doubler rebids — first deep-review batch (October 30, 2026)

- Revised the minimum-advance ladder: 13–15 shortage-adjusted support points may Pass; 16–18 and four-card support raise economically; 19+ with four-card major support invite with a jump to three rather than automatically bidding four.
- Strong takeout Doubles of 18–21 HCP with a four-card major fit can also invite after a minimum advance; direct game over a minimum suit reply now requires exceptional 22+ HCP and four-card support. This change does not alter the separate rules for accepting an invitational *jump by advancer*.
- Two full four-hand practice deals exercise the corrected invitation: one ordinary 17-HCP Double with a singleton in opener's suit (19 support points) and a previously direct-game 20-HCP strong Double changed to 3S. Existing other deals remain intact.
- Evidence-driven explanation coverage now includes minimum Pass/raise, invitations and exceptional direct game, strong natural suit/NT rebids, cuebids, responsive Doubles, and selected competitive choices. Rejected actions name only requirements actually tested.
- Added a narrow behavioral check: both invitation deals qualify for 3S, not premature 4S; no exact English-text assertions. Advancer's later decision after the three-level invitation remains outside the selected continuation depth.
- Next deep-review group: competitive natural suit-overcaller rebids, then selected natural 1NT and weak-two defensive continuations.
