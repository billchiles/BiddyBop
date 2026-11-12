# Instructional Explanation Coverage Review

Initial inventory established October 28, 2026; status updated during the second-pass review. This is a source-based family inventory, not certification that every rule or rendered explanation has been pedagogically approved. It does not change the selected bidding system or require a custom explanation for every rule.

Quantitative rule, practice, test and explanation-reach counts are maintained
in [`by-the-numbers.md`](by-the-numbers.md); this file records instructional
review findings rather than duplicate numerical snapshots.

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

## Post-refactor evidence review (November 2026)

The earlier Q4 review assessed all modeled bidding stages for instructional quality.
A subsequent hand-constraint-evidence refactor calls for a distinct, systematic
check that explanations consume the intended evaluated facts and that only
deliberately approved messages change. Q4 family coverage alone does **not**
certify a family in this follow-up audit.

| Focused family examined since the refactor | Follow-up decision |
| --- | --- |
| Strong 2C opener rebids after positive responses | Improved (hand-specific rebid evidence) |
| Natural notrump responses after suit overcalls | Improved (positive and rejected checks) |
| Weak-two opener rebids after forcing 2NT | Improved (strength, feature, solid suit) |
| Natural new-suit responses after suit overcalls | Improved (levels one, two and three) |
| Natural responses after takeout Double | Improved (natural 1NT, one- and two-level new suits) |

### Stage-order evidence audit decisions

The focused fixes above were selected as substantive gaps, not as evidence that
the intervening families were skipped. The systematic audit now follows the
family inventory in stage order, recording decisions after representative
positive and rejected-call review.

| Stage 1 — opening decision family | Disposition | Basis |
| --- | --- | --- |
| Pass with no qualifying opening | Adequate | Four-seat fallback and boundaries already tested; no extra Pass prose needed |
| Five-card major and convenient minor | Adequate | Selected suit, length valuation, and meaningful competing openings already explained |
| Guideline of 20 | Adequate | First-/second-seat alternative hand valuation identified when relevant |
| Natural 1NT, both ranges, optional five-card-major upgrade | Adequate | HCP, balanced shape, upgrade, and nearby failures have evaluated explanations |
| Natural 2NT (20–21 HCP) | Adequate | Actual HCP and balanced shape already reported |
| Strong artificial 2C | Adequate | Actual strength and forcing meaning already explained |
| Weak-two, three-, four-, and five-level preempts | Improved | Actual qualifying A/K/Q/J/10 holdings now identify the relevant suit-quality standard; strength and length remain evaluated |

For the opening-stage preempt improvement, a temporary 2,582-context
recorded-call replay changed only the 43 intended preempt examples. A wider
13,167-attempt opening-call replay changed 46 explanations, all belonging to
the same four preempt families, with no rule-match changes. The preserved
15,888-case earlier refactor archive is unavailable and is not claimed here.

**Next systematic stage:** Initial responses to one-level minor and major
openings, including natural suit/NT responses, raises, jump shifts, and
qualifying alternatives. Mark each family reviewed, including those that
require no code change.

**Remaining:** Continue the family inventory below from initial responses onward,
and record an Adequate, Improve, Judgment boundary, or Integration issue decision
after checking each family's actual positive/rejected output. Previously
developed or Q4-reviewed families are **not** implicitly skipped. Preserve
student-facing lines verbatim unless a change is deliberate; inspect every
changed line in temporary recorded-call replays. Keep the 15,888-case
refactor comparison separate from the narrower 2,582-context recorded-call
replay, and do not treat either replay as proof of instructional correctness.
The roadmap holds only pending work; statistical reach stays in
`docs/by-the-numbers.md`.

## Initial source census and review limitations

| Rule declaration module | Executable rule declarations | Scope boundaries | First-pass conclusion |
| --- | ---: | ---: | --- |
| opening-rules.ts | 13 | 0 | Earlier explanation batches; validate representative families |
| responding-rules.ts | 89 | 1 | Earlier batches for primary families; selected gaps below |
| advancing-rules.ts | 81 | 2 | Earlier B14–B20 batches; selected gaps below |
| opener-rebidding-rules.ts | 202 | 31 | Substantial recently completed family work; final integration validation pending |
| overcalling-rules.ts | 114 (25 overcall/balancing + 89 overcaller rebid) | 24 | Direct defenses largely developed; later rebids highest priority |
| responder-rebidding-rules.ts | 95 | 26 | Many executable families use primarily generic meaning/guidance; high priority |
| **Total** | **594** | **84** | **678 declarations, not 678 required explanations** |

There are 70 practice buckets in test-deals-registry.ts: 1 opening, 10 responding, 13 overcalling, 11 advancing, 20 opener rebid, and 15 responder rebid. They expose 627 practice selections from 626 distinct deal definitions. A baseline replay of 2,979 recorded calls found 2,479 at supported stages; comparing these with equivalent New Deal auctions yielded identical core explanation lines. Passing rule tests and this parity check establish execution consistency, **not** instructional sufficiency.

Inspection sources: the six stage rule modules above; explanations.ts and BidPanel.tsx for specialized helpers/wiring; biddingEvaluation.ts and bidding-types.ts for evidence; test-deals-registry.ts and the stage deal modules for practice cases. The review is a **structural census and provisional teaching-gap triage**; it is not a per-hand playback or an exhaustive branch audit.

## Family-by-family review inventory

The family groupings collectively cover each stage's executable declarations and scope boundaries. A provisional "previously developed" means a focused explanation batch exists; it **does not** mean every rule in that row passed final review.

| Auction stage and decision families | Present teaching / provisional assessment | Further review or disposition |
| --- | --- | --- |
| Opening: Pass, one-level convenient minor/five-card major, 1NT/2NT, strong 2C, weak two/three/four/five | Deep review: light-opening length valuation, truthful 2NT HCP meaning, three-level preempt strength near misses, and alternatives now distinguished using checked requirements | Adequate after targeted opening feedback corrections; revisit only new cross-stage defects |
| Direct overcall: ordinary/strong takeout Double, including defense to a weak two | Hand-aware strength, shape and weak-two context validated with near-miss examples | Adequate; cross-stage checks only |
| Direct overcall: natural one-/two-level suit, natural 1NT and its stopper | Evaluated suit quality, strength, stopper and competing Double feedback checked against near misses | Adequate; cross-stage checks only |
| Direct overcall: preemptive jump at levels two, three, four | Existing length, quality, and strength checks distinguish qualifying jumps from natural alternatives | Adequate; cross-stage checks only |
| Direct defense: DONT after opposing strong 1NT | Agreed artificial meanings; previous first-action teaching and associated advancing | Targeted check: Double vs artificial 2C/2D/2H vs natural 2S; why competing calls fail and no automatic penalty Double |
| Direct defense: natural suit/2NT over weak two; defense to strong 2C/2NT, three-level preempts and high openings | Concrete weak-two overcall rules and boundary meanings exist; specialized natural-suit helper focuses on ordinary one-level-opening overcalls | Targeted: whether weak-two natural suit/NT and stopper-quality near misses get sufficient feedback; boundaries are candidates for meaning-only adequacy |
| Balancing: suit, 1NT, ordinary/strong Double, defensive Pass, judgment boundary | Replay of defensive Pass and nearby Double/1NT failures confirms actual hand facts and separate judgment boundaries | Adequate; do not invent calls at judgment boundaries |
| Responses to minor/major: suits, raises, limit/strong support, 1NT/2NT/3NT, weak/strong jump shifts | Initial responses checked against competing support and suit routes; a failed weak-Pass test now leaves honest competitive judgment when no constructive call qualifies | Adequate; preserve supported alternatives and scope limits |
| Responses to 1NT/2NT and strong 2C; to weak and high preempts | Agreement-shifted HCP bounds remain nonnegative; preferred Stayman/transfer choices now give their evaluated reason; 2C waiting explains why stronger unbalanced hands have no qualifying positive response | Adequate after targeted explanation and evidence fixes; cross-stage checks only |
| Responses after suit overcall, takeout Double, natural 1NT overcall, jump overcall | Reviewed competitive responses and negative-Double suit promises, supported new-suit versus Double, and weak natural versus preemptive alternatives | No family-specific review pending; include in final cross-stage check |
| Advancing: one-/two-level natural suit overcalls, takeout Double, natural 1NT | Evidence-based teaching for raises, suit advances, notrump, and one-round forces, with explicitly qualified point totals | No family-specific review pending; include in final cross-stage check |
| Advancing: DONT, preemptive jumps, weak-two 2NT systems-on | Shared conventional meanings, checked compulsory replies and weak/preemptive advances; DONT remains fixed on | Final cross-stage audit of agreement-specific language and honest stopping boundaries |
| Advancing after responder raise, natural suit, negative Double or Redouble; responsive Doubles, artificial support and escape | Reviewed supported continuations, artificial meanings, forcing obligations, Redouble escapes, and point valuations | No family-specific review pending; include in final cross-stage check |
| Natural opener rebids after suit openings, 1NT/2NT responses, and one-/two-level new suits | 88 natural opener-rebid examples reviewed with numeric hand evidence, forcing distinctions, and alternative calls | No family-specific review pending; include in final cross-stage check |
| Conventional opener rebids: Jacoby 2NT, splinters, jump shifts, strong 2C and game responses | Replayed representative hands and nearby rejected calls; forcing Pass, Jacoby quality/shortness, and splinter control selection now retain evaluated evidence | No family-specific review pending; include in final cross-stage check |
| Opener rebid after suit/NT interference or Double: negative Doubles, forcing suits, artificial support, weak/NT/game-forcing responses, competitive advancer action, jump-overcall continuations | First-pass competitive explanation closeout and two-major DONT stopper boundary complete | Q3/Q4 verify forcing, exceptions, and boundary feedback |
| Overcaller rebid after natural 1NT overcall: Stayman, Jacoby/Texas, natural signoffs, 2NT/3m/4NT invitations and slam boundary | Convention replies now include evaluated major-length facts; compulsory transfers and invitations retain shared guidance | No family-specific review pending; include in final cross-stage check |
| Overcaller rebid after natural suit overcall, advancer Pass/raise, cuebid/new suit, NT; both unopposed and contested | Hand-aware natural and contested explanations distinguish forcing continuations and supported alternatives | No family-specific review pending; include in final cross-stage check |
| Doubler rebid after ordinary takeout Double: minimum/strong cases, jumps, cue, NT, natural advances and competitive runouts | Minimum versus strong rebid feedback uses evaluated strength and qualifying alternatives; multiple supported strains remain judgment calls | No family-specific review pending; include in final cross-stage check |
| Overcaller/Doubler continuation after weak-two defenses, natural 2NT, suit overcalls and extra competition | Checked ordinary and strong Doubles, compulsory replies, systems-on 2NT continuations, and selected competitive boundaries | No family-specific review pending; include in final cross-stage check |
| Responder rebid after Stayman/transfers, natural 1NT/2NT rebids, strong 2C, Jacoby 2NT/splinters | Extensive first-pass conventional and natural rebid explanation families exist; 88 recorded responder-rebid endings checked | No pending responder-rebid-specific review; revisit only if the cross-stage quality gate identifies a new issue |
| Responder rebid after 2/1 versus Standard new suit, major/minor 1NT, simple/limit raises, game tries, repeated suits, economical second suit, reverse/strong jump shift | Hand-aware teaching compares invitations, known fits, and alternative strains; 76 matched rule IDs in the responder-rebid corpus | No pending responder-rebid-specific review; continue cross-stage audit for forcing and agreement consistency |
| Deliberately unmodeled later auctions | Scope-boundary rule meanings and shared guidance already present | Meaning/guidance can be sufficient. Check honest boundaries; do not turn notes into executable bidding rules |


## Deferred or intentionally limited

- No generalized penalty doubles/redoubles, Lebensohl, unconstrained later auctions, speculative game/slam judgment, or new convention families solely to close a coverage gap.
- No extra practice deals solely for coverage percentages; use existing credible cases and add a focused regression case only when a meaningful distinction is fixed.
- Keep user-facing text concise, use "app" rather than "trainer" in newly written instruction, and preserve [rule IDs]. Avoid development terminology in future student-facing guidance.
- Clickable auction-call explanations and wider interface redesign remain separate future features.

## Stable implementation decisions

- The bidding evaluator and rule functions determine qualified calls and retain hand/auction evidence. High-level feedback assembly and individual explanation helpers live in `explanations.ts`; React receives and renders those lines without making independent bridge decisions.
- Non-browser regression tests check qualified calls, structured hand facts, and the delivery of dynamically generated explanation lines. Do not assert exact English sentences or snapshots.
- The Report button is solely a debugging clipboard tool. Preserve the auction, hands, agreements, rule IDs, explanations, and optional telemetry for diagnosis.
- Keep fixed DONT treatment until the separate, later natural-defense option is intentionally developed across all affected bidding stages.
