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
| Responses to minor/major: suits, raises, limit/strong support, 1NT/2NT/3NT, weak/strong jump shifts | First pass B9–B13; Q2 now compares a supported ordinary new suit with an actually qualifying higher-priority jump shift | Additional comparisons only when both alternatives qualify; preserve supported ordinary responses |
| Responses to 1NT/2NT and strong 2C; to weak and high preempts | First-pass conventional explanations; Q2 now compares strong-2C waiting with actually qualifying positive suit/NT responses | Other NT and preempt comparisons remain for selective review; waiting stays valid |
| Responses after suit overcall, takeout Double, natural 1NT overcall, jump overcall | Explicit competing meanings and selected boundaries; less uniformly specialized student feedback than ordinary responses | Targeted deep review: negative Double, Jordan 2NT/Redouble, weak new suits/jump raises, 1NT overcall penalties boundary and blocked cheapest bids |
| Advancing: one-/two-level natural suit overcalls, takeout Double, natural 1NT | B14–B16 teaching; Q2 now contrasts a supported simple raise with an actually qualifying preemptive jump raise | Additional alternative comparisons only where both treatments qualify; preserve competitive judgment |
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



## Second-pass instructional-quality findings and Q1–Q4 implementation plan (November 1, 2026)

**Status:** Source-based review and planning only, not a browser play-through and
not a claim that all cases have been reproduced as actual displayed failures.
First-pass work has been implemented across opening, direct overcalling, Double,
balancing, responding, advancing, opener rebid, responder rebid, and
overcaller/takeout-Doubler rebid. There is no separate modeled advancer-rebid stage.
Continue to discuss exact changes and commit subject before each coding batch.

### Architecture and terminology agreed for this pass

1. **Bidding evaluator** (`biddingEvaluation.ts` and rule/functions modules):
   selects agreement/auction rules, refines candidate calls, qualifies them from
   the actual hand, applies cross-rule suppressions and retains candidate/rule
   evidence. A nonqualifying tested candidate can explain an actual failed check;
   a refiner-eliminated call may leave no candidate-level failure evidence.
2. **Instructional explanation functions** (`explanations.ts`): turn supported
   candidate facts and selected failed constraints into bridge teaching text. They
   must not independently infer bidding qualifications from a fresh decision tree.
3. **Feedback assembly** (now inside `BidPanel.tsx`): decides whether to use
   supported-call explanation, call-specific rejected feedback, scope guidance or
   generic unjudged feedback, and collects the corresponding text. Some of this
   selection should move to a small pure TypeScript function, leaving React to
   handle input, transcript state and rendering. **No new bidding logic in React.**
4. **Report button**: private developer/debug clipboard dump for user/developer
   investigation, not a student-facing lesson report. Preserve hands, auction,
   agreements, internal identifiers, [rule IDs], explanations and optional
   telemetry. Its correctness criterion is fidelity to the displayed explanation
   transcript and explicit recorded-call substitutions, **not** student readability.

### Q1 — Feedback routing and factual correctness (first priority)

**Confirmed source-level integration inconsistency.** In `BidPanel.tsx`,
`finishBidEntry()` computes `hasCallSpecificFailure` from a hand-written subset
of negative explanation helpers before deciding whether to invoke
`buildExplanationLines()`. That full builder collects a larger set, including
`getConventionalResponderRebidFailureLines`,
`getOpenerOneNtInterferenceFailureLines`,
`getOpenerJumpOvercallRebidFailureLines`,
`getOneNtOvercallerRebidFailureLines`,
`getWeakTwoDefenseRebidFailureLines`, and other helpers. An unsupported turn
without any qualified bid can thus select generic feedback without executing
the later full builder, even when a specific negative explanation exists.
This mismatch is not necessarily visible on every turn: a supported-status
turn already takes the full-builder path. **Reproduce selected affected contexts
before fixing; don't claim every listed helper currently loses feedback.**

**Second source-level inconsistency.** In the initial scope-boundary/no-candidate
test inside `buildExplanationLines()`, collected
`responderConventionReasons` and `doublerRebidReasons` are not included in
the check for existing call-specific reasons, although subsequent branches can
use them. Broad judgment guidance may therefore override more precise
rejection feedback in a suitable context.

**Recommended narrow repair:** Collect all appropriate call-specific reasons
once; reuse that same result to select specific-versus-unjudged feedback, the
rejection heading, and whether to append a distinct judgment note. Prefer a
small pure TypeScript explanation-assembly function or similarly minimal
extraction from the component, without broad architecture changes. Ensure
the output labels depend on evaluated stage/call semantics, not which helper
happened to run first. Preserve actual evidence and do not falsely grade
out-of-coverage choices as wrong.

**Source-identified wording corrections to verify:** avoid duplicated
"Double negative Double"; change "4M" to natural bridge language; do not assert
a four-four Stayman fit when responder has five cards and opener four; use
"hearts/spades/diamonds" in prose rather than bare H/S/D; and identify the
actual agreed major in Jacoby game-force feedback instead of "spade or heart."
Keep bracketed rule IDs. Review these in their actual context before patching.

**Tests without browser automation:** From a known complete four-hand deal
and saved auction, call `evaluateUserCall`, then the *same pure explanation
assembly function used by BidPanel*. Do **not** assert exact English sentences,
sentence fragments, or snapshots. Instead test that (1) the real evaluation
records the expected rule/decision and relevant structured fact (for example,
a missing stopper in suit S); (2) the corresponding helper emits a nonempty,
specific reason; and (3) the assembled feedback actually includes the
**dynamically generated** reason, such as by comparing against the helper's
current returned lines. To check that an actual suit/value was conveyed, prefer
a domain-derived suit/value token over hardcoded prose, or lightweight
structured reason metadata only if needed. Cover a supported bid, an actually
tested failed requirement that was previously bypassed, a forcing Pass, a
no-candidate judgment boundary, and a genuinely unjudged call. Keep focused
tests and existing `npm run build` / `npm run test:rules`; no browser or
snapshot framework. The developer-only Report must copy the already assembled
transcript without re-evaluating or rewriting instructional text.

### Q2 — Meaningful positive teaching and qualified alternatives

Review the real assembled positive feedback stage by stage, beginning with
responding/advancing, then opener/responder rebids, overcaller/Doubler rebids
and direct overcalls/balancing. Teach the student's choice in relation to
*other bids that genuinely qualify*; use evaluated priorities only as
preferences, not proof that another supported call is wrong. Examples:
3NT versus five of a minor; economical suit versus jump; one-level suit
selection; minor-fit versus major-fit priorities; invitations versus immediate
game. Emphasize partner's promise, actual HCP/support/stoppers/fit, level,
forcing status and why the comparison is useful. Straightforward Pass,
signoff and mandatory transfer completion may need no extra text. No
gratuitous new practice deals, tests or bidding rules just for coverage.

### Q3 — Plausible negative feedback

Classify each selected candidate context before writing a rejection message:
(a) a generated and evaluated call failed a *specific* requirement;
(b) a call was filtered by convention/refiner/cross-rule bidding preference
and needs that *actual decision* explained when educationally important;
(c) the partnership has a proved one-round/game-forcing obligation; or
(d) a legal call requires bridge judgment/out-of-coverage agreement and must
not be called wrong. Prioritize wrong convention/strain, missing major fit,
missing suit stopper, natural versus artificial interpretation, and Pass
during a force. Refiner-filtered calls have no automatic failed-hand evidence;
persist selective decision facts where truly useful instead of guessing.
Negative feedback should avoid exhaustive diagnostics from unrelated rules
and should compare a supported alternative where relevant.

### Q4 — Concision, end-user language and final integration

Check entire assembled explanation for **instructional economy**: hand-specific
reason, rule meaning/guidance, substituted recorded-call reason, practice note,
and final takeaway may repeat the same point. Keep substantive teaching
without stacks of redundant wording. Remove programmer-facing prose such
as "modeled", "refiner", "scope boundary", "fixture" and "trainer" from
student-facing guidance where normal bridge language is better. Do not
strip these from debugging Report fields or source comments. Sample across
each modeled stage and relevant agreement settings: accepted, rejected,
supported-but-less-preferred, recorded substitutions, genuine judgment
limits, and practice ending before real auction/game force completion.

**Testing boundary:** We want normal TypeScript-level evaluation-to-assembled-
text assertions, not browser automation. A short *manual* on-screen
check remains useful for scroll behavior and wording appearance, but
do not create an automated browser-test project. Reports are debug artifacts.

### Priorities and scope

- **P1:** Q1 routing defects and demonstrably inaccurate teaching statements.
- **P2:** Q2 supported alternatives and Q3 instructive rejections in manageable
  stage/family batches, with analyses and agreement before coding.
- **P3:** Q4 clarity, duplication, consistency, captured Report fidelity and
  final roadmap/documentation reconciliation.
- **Deferred:** Optional DONT-on/off natural defense is an independent,
  potentially large cross-stage agreement project after Q1–Q4; fixed DONT
  stays on for now. Clickable historical calls remain a separate UI enhancement.
  Avoid re-auditing all bidding qualifications or inventing extra conventions
  solely for explanation completeness.

## Q1 implementation disposition (November 2, 2026)

- **Completed:** Extracted the main explanation assembly from `BidPanel.tsx` into
  the top-level `Call feedback assembly` section of `explanations.ts`, preserving
  the original helper functions underneath. No additional source module was
  created; the existing long file remains a single organized TypeScript module.
- All 48 relevant negative-feedback helpers now feed one ordered collection,
  used for detailed-vs-unjudged selection, the rejection heading based on the
  actual bidding stage, and distinct judgment-boundary guidance. React handles
  input/transcript/display rather than deciding which evidence to teach.
- The same shared explanation functions are used for substituted practice
  calls and next-turn rule guidance; the Report remains the existing developer
  debugging clipboard capture and is not a student-facing lesson artifact.
- Corrected selected clear wording mistakes (duplicated negative Double,
  placeholder 4M, Stayman fit described too narrowly, and exposed suit symbols
  in selected conventional rebids). Broader teaching and terminology polish
  remain in Q2–Q4.
- New tests follow an evaluator result into the **same assembly function used
  by the UI**, check structured missing-spade-stopper evidence, and assert that
  dynamically generated helper lines arrive in the output. They do not copy
  English sentences or use snapshots. Build and full rule-test CI passed on
  the code branch before this documentation update.
