# Instructional Explanation Coverage Review

Initial inventory established October 28, 2026; status updated during the second-pass review. This is a source-based family inventory, not certification that every rule or rendered explanation has been pedagogically approved. It does not change the selected bidding system or require a custom explanation for every rule.

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
| Opening: Pass, one-level convenient minor/five-card major, 1NT/2NT, strong 2C, weak two/three/four/five | Previously developed B1–B3: selection, valuation, preempts, rejected requirements | Spot-check light openings, alternative selection, preempt quality, and intentionally ordinary Pass; simple meaning may suffice |
| Direct overcall: ordinary/strong takeout Double, including defense to a weak two | Takeout-Double evidence-driven explanations cover both normal and weak-two Double IDs; Q2 compares qualifying natural suit/NT alternatives | Q3 verify weak-two context, ordinary vs strong exception, rejected shape and point requirements |
| Direct overcall: natural one-/two-level suit, natural 1NT and its stopper | Natural-suit and 1NT helpers; Q2 now contrasts suit or NT with a qualifying takeout Double | Q3 inspect boundary hands, stopper failures, and correct strain/level |
| Direct overcall: preemptive jump at levels two, three, four | Suit-length/quality and HCP explanations; Q2 now contrasts qualifying jumps with cheaper natural suits | Q3 verify failed jump checks and unsupported alternatives |
| Direct defense: DONT after opposing strong 1NT | Agreed artificial meanings; previous first-action teaching and associated advancing | Targeted check: Double vs artificial 2C/2D/2H vs natural 2S; why competing calls fail and no automatic penalty Double |
| Direct defense: natural suit/2NT over weak two; defense to strong 2C/2NT, three-level preempts and high openings | Concrete weak-two overcall rules and boundary meanings exist; specialized natural-suit helper focuses on ordinary one-level-opening overcalls | Targeted: whether weak-two natural suit/NT and stopper-quality near misses get sufficient feedback; boundaries are candidates for meaning-only adequacy |
| Balancing: suit, 1NT, ordinary/strong Double, defensive Pass, judgment boundary | Balancing-specific evidence and rejection functions; Q2 now compares qualifying defensive Pass and natural 1NT | Q3 validate rejections and judgment boundaries; do not add text solely because a Pass lacks custom prose |
| Responses to minor/major: suits, raises, limit/strong support, 1NT/2NT/3NT, weak/strong jump shifts | First pass B9–B13; Q2 now compares a supported ordinary new suit with an actually qualifying higher-priority jump shift | Additional comparisons only when both alternatives qualify; preserve supported ordinary responses |
| Responses to 1NT/2NT and strong 2C; to weak and high preempts | First-pass conventional explanations; Q2 now compares strong-2C waiting with actually qualifying positive suit/NT responses | Other NT and preempt comparisons remain for selective review; waiting stays valid |
| Responses after suit overcall, takeout Double, natural 1NT overcall, jump overcall | First-pass competitive feedback; Q2 now compares negative Double versus natural suit, Redouble versus natural suit, and three qualifying choices after a jump overcall | Q2 positive alternatives addressed; Q3 now explains rejected two-level natural suits with insufficient length when negative Double qualifies |
| Advancing: one-/two-level natural suit overcalls, takeout Double, natural 1NT | B14–B16 teaching; Q2 now contrasts a supported simple raise with an actually qualifying preemptive jump raise | Additional alternative comparisons only where both treatments qualify; preserve competitive judgment |
| Advancing: DONT, preemptive jumps, weak-two 2NT systems-on | Previously developed B17 and shared conventions; some rules rely on their own meaning/guidance | Targeted: artificial vs natural calls, weak-two 2NT conventions, unmodeled competition, signoff vs forcing distinctions |
| Advancing after responder raise, natural suit, negative Double or Redouble; responsive Doubles, artificial support and escape | Dedicated first-pass explanations; remaining overlapping raise cases do not yet justify new teaching without a confirming deal | Reserve further Q2 comparisons for genuine overlaps; Q3/Q4 verify rejections and artificial meanings |
| Natural opener rebids after suit openings, 1NT/2NT responses, and one-/two-level new suits | 88 natural opener-rebid examples reviewed with numeric hand evidence, forcing distinctions, and alternative calls | No family-specific review pending; include in final cross-stage check |
| Conventional opener rebids: Jacoby 2NT, splinters, jump shifts, strong 2C and game responses | Existing specialized explanations and rejection feedback | Review agreement-sensitive meaning, controls, forcing, and exercise endings |
| Opener rebid after suit/NT interference or Double: negative Doubles, forcing suits, artificial support, weak/NT/game-forcing responses, competitive advancer action, jump-overcall continuations | First-pass competitive explanation closeout and two-major DONT stopper boundary complete | Q3/Q4 verify forcing, exceptions, and boundary feedback |
| Overcaller rebid after natural 1NT overcall: Stayman, Jacoby/Texas, natural signoffs, 2NT/3m/4NT invitations and slam boundary | Dedicated positive and negative overcaller-1NT rebid explanations were implemented in the first pass | Q2 check genuinely qualifying alternatives; Q3 explains incorrect compulsory Stayman and Jacoby/Texas replies after natural 1NT overcalls; Q4 verify agreement-sensitive presentation |
| Overcaller rebid after natural suit overcall, advancer Pass/raise, cuebid/new suit, NT; both unopposed and contested | Hand-aware natural and contested overcaller-rebid helpers exist; Q2 found no further established overlap needing comparison | Q3/Q4 verify contested artificial and forcing continuations |
| Doubler rebid after ordinary takeout Double: minimum/strong cases, jumps, cue, NT, natural advances and competitive runouts | Dedicated takeout-Doubler teaching helpers exist; Q2 found no further established overlap needing comparison | Q3/Q4 spot-check forcing, fit, and judgment boundaries |
| Overcaller/Doubler continuation after weak-two defenses, natural 2NT, suit overcalls and extra competition | First-pass weak-two defense rebid feedback and associated boundaries implemented | Q3 explains compulsory Stayman and transfer replies after weak-two 2NT overcalls; further stoppers, forcing, and scope limits need review |
| Responder rebid after Stayman/transfers, natural 1NT/2NT rebids, strong 2C, Jacoby 2NT/splinters | Extensive first-pass conventional and natural rebid explanation families exist; 88 recorded responder-rebid endings checked | No pending responder-rebid-specific review; revisit only if the cross-stage quality gate identifies a new issue |
| Responder rebid after 2/1 versus Standard new suit, major/minor 1NT, simple/limit raises, game tries, repeated suits, economical second suit, reverse/strong jump shift | Hand-aware teaching compares invitations, known fits, and alternative strains; 76 matched rule IDs in the responder-rebid corpus | No pending responder-rebid-specific review; continue cross-stage audit for forcing and agreement consistency |
| Bidding notes and deliberately unmodeled later auctions | BiddingNotes, scope-boundary rule meanings and shared guidance already present | Meaning/guidance can be sufficient. Check honest boundaries; do not promote notes to executable bidding rules |


## Pending instructional review

**Q4 — Final instructional quality gate.** Continue stage-by-stage scrutiny of conventional opener rebids, overcaller continuations, advancing/competitive responding, then openings and initial responses. Inspect actual assembled feedback for bridge accuracy, evaluated hand evidence, alternative calls, forces, agreement-sensitive meaning, and concise student-facing language. Preserve reusable guidance in both New Deal and practice mode, and distinguish exercise completion from auction completion. Finish with a cross-stage integration check, including the debugging Report. Keep tests evidence-based, without hardcoded English sentences or browser automation.

The optional DONT checkbox remains a separate deferred enhancement. Keep this inventory focused on pending instructional review, not a running log of resolved findings.

## Student-facing language acceptance gate

After the remaining explanation families are implemented, review student-visible
instruction and feedback—not debugging Report metadata—for developer terminology such
as "model", "modeled", "scope boundary", "fixture", "rule", "the trainer", and
other internal implementation phrasing. Replace it with natural bridge teaching
language wherever possible, without obscuring deliberate judgment limits or
removing bracketed diagnostic rule IDs. Track the outstanding work in the roadmap.

## Deferred or intentionally limited

- No generalized penalty doubles/redoubles, Lebensohl, unconstrained later auctions, speculative game/slam judgment, or new convention families solely to close a coverage gap.
- No extra practice deals solely for coverage percentages; use existing credible cases and add a focused regression case only when a meaningful distinction is fixed.
- Keep user-facing text concise, use "app" rather than "trainer" in newly written instruction, and preserve [rule IDs]. Cosmetic terminology cleanup belongs to the final integration pass.
- Clickable auction-call explanations and wider interface redesign remain separate future features.

## Stable implementation decisions

- The bidding evaluator and rule functions determine qualified calls and retain hand/auction evidence. High-level feedback assembly and individual explanation helpers live in `explanations.ts`; React receives and renders those lines without making independent bridge decisions.
- Non-browser regression tests check qualified calls, structured hand facts, and the delivery of dynamically generated explanation lines. Do not assert exact English sentences or snapshots.
- The Report button is solely a debugging clipboard tool. Preserve the auction, hands, agreements, rule IDs, explanations, and optional telemetry for diagnosis.
- Keep fixed DONT treatment until the separate, later natural-defense option is intentionally developed across all affected bidding stages.
