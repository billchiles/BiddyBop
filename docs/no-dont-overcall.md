# BiddyBop — Sandwich bidding implementation plan

This is the active specification for adding sandwich bidding and its continuations. GitHub master is authoritative. Read [spec.md](spec.md) and [code-style.md](code-style.md) with this plan. The bidding treatments and architecture below are agreed; the remaining work is implementation sequencing, then executable changes in explicitly authorized small batches in a **new chat with a fresh ZIP**. Do not generate executable code in the planning chat. Existing DONT and natural defense of opposing 1NT are independent of this work.

## Scope and conventions

Cover one-level suit opening – actual Pass – responder action, and selected physical +3 through +7 continuations by both partnerships. North opens, East initially Passes, South responds, West is sandwich overcaller; seats are illustrative, offsets relative to actual opening (including pre-opening Passes). Teach natural, commonly understood decisions and selected conventions already in the app. Favor a consistent treatment taught by multiple credible instructional authorities over personal conservatism. Numerical criteria below are BiddyBop teaching constraints where instruction relies on judgment; do not assert a universal bidding law. No vulnerability/scoring, speculative playing-trick engine, exhaustive defensive/penalty/sacrifice system or general +8 onward tree.

Use actual HCP unless explicitly stated as total points with length or shortage. Good suit = existing hasPreemptSuitQuality (two of AKQ or three of AKQJT); exceptional five = three of AKQJ including two of AKQ. Natural overcalls are cheapest legal nonjump bids in naturally unbid suits, relative to latest actual contract, nonforcing; no automatic elevation to higher levels, ordinary jump overcalls, unusual NT or cuebids. Do not apply a universal upper HCP cap to qualifying constructive overcalls/shape-promising Doubles. Retain independently qualifying natural and Double candidates, explaining actual hand-dependent preference without ranking machinery or rule/candidate order.

Ordinary optional competition uses explicit fallback Pass only when no constructive action qualifies; never infer Pass from zero matches. No independent conservative-Pass predicates in any family. A/C initial fallback through 17 HCP; 18+ nonconforming hand boundary. B/E no fixed 17-HCP cap; strong unusual hands can need boundary. D ordinary fallback with strong/exceptional boundary, not automatic Pass. Distinguish ordinary signoff, compulsory takeout, free bid, established force and judgment boundary. Preserve intentionally valid alternatives (e.g. borderline NT invitation Pass/accept). In relevant rejected guidance acknowledge experienced players may Pass despite a qualifying competitive bid; no categorical judgment that such Pass is bad bridge.

## Entry classification and West +3 initial calls

| Family | Response |
| --- | --- |
| A | Natural nonjump one-level new suit |
| B | Natural nonjump two-level new suit |
| C | Natural 1NT |
| D | Natural simple raise to two |
| E | Limit raises, natural 2NT/3NT, weak/strong jump shifts, artificial Jacoby/splinter, preemptive game raises and other higher responses |

Determine actual public meaning and active agreement before applying natural-suit, fit, stopper or force predicates. A printed strain is not necessarily natural; never infer hidden responder support or intended game force from private rule eligibility. Family classifications apply across all openings, not specialized rules for example auctions.

### A — natural one-level new suit

Entries 1C–P–1D/1H/1S, 1D–P–1H/1S, 1H–P–1S. Normally 4+ responder suit and 6+ HCP, no universal maximum.

| West call | Requirements |
| --- | --- |
| Economical one-level suit | 10+ HCP, good 5+ |
| Economical two-level suit | 11+ HCP good 6+, or 14+ HCP exceptional five |
| Takeout Double | 12+ HCP, 4+ each of both naturally unbid suits (5–4 qualifies, 4–3 does not) |
| Natural 1NT | 16–18 HCP, balanced, basic stoppers in both named opposing suits |

No direct seven-HCP exception or strong shape-breaking Double. No special weaker passed-hand 1NT. For 1C–P–1H, West KJ76/84/AQJ98/A5 qualifies for 2D and Double; Double preferred to locate spades. AKJ85/74/QJ63/A4 qualifies for 1S and Double; natural major preferred. Preserve both, explain preference.

### B — natural nonjump two-level new suit

| Entry | Cheapest unbid natural suits |
| --- | --- |
| 1D–P–2C | 2H, 2S |
| 1H–P–2C | 2D, 2S |
| 1H–P–2D | 3C, 2S |
| 1S–P–2C | 2D, 2H |
| 1S–P–2D | 3C, 2H |
| 1S–P–2H | 3C, 3D |

Standard: normally 11+ HCP, one-round force, not GF. 1D–2C and 1S–2H normally show five cards, other natural two-level responses four, but newSuitThenRaise can use a three-card minor fallback; do not infer stronger public promise or private intended GF. 2/1 with unpassed responder: normally 13+ HCP and established GF, including 1D–2C under app agreement. Later West interference does not cancel historical GF. Standard immediate force may be interrupted.

Standard natural intervention: economical two-level good 6+ with 13+ HCP or exceptional five with 16+ HCP; economical three-level good 6+ with 15+ HCP. Objective honor test; no additional subjective playing-strength evaluator. No positive Double, NT or established-GF natural intervention; exceptional lead-direction/defense boundary. Explain why greater strength is appropriate against two opponents showing values.

### C — natural 1NT response

All four openings. 1m–1NT natural balanced nonforcing 6–10 HCP, no four-card major. 1M–1NT Standard 6–10, 2/1 semi-forcing 6–12, forcing unpassed responder or passed-hand nonforcing as configured; may conceal three-card major limit-raise route. Do not infer universal balance or deny support. Immediate forcing-1NT obligation interrupted by substantive West action.

Natural economical two-level unbid suit, 0–2 opener suit:

| Length | HCP | Quality |
| --- | ---: | --- |
| 5 | 14+ | Exceptional five |
| 6 | 12+ | Good |
| 7 | 11+ | Good |
| 8+ | 10+ | Good |

Instruction normally favors good six or exceptionally strong five, with hand/auction judgment (Karen Walker https://kwbridge.com/sandwich.htm; Robert Todd two-level simple overcalls; Oren Lidor https://news.bridgebase.com/2022/12/28/overcalls/). Explain 14 actual HCP is an additional reliably evaluated BiddyBop constraint, not an instructional consensus minimum. Natural suit publicly promises at least five, not six.

Takeout Double of opener suit over responder's 1NT: 13+ actual HCP, 0–2 opener suit, 3+ each of three unbid suits, 4+ at least one unbid major (other major after major opening). Not penalty of 1NT or DONT. No three-card opener-suit or strong shape-breaking exception; acknowledge experienced judgment occasionally permits three. Both natural and Double may qualify; strong six-card major favors natural, strong minor with four-card unbid major makes Double attractive. Reference ACBL Unit 390 https://www.acblunit390.org/Simon/dbl.htm for selected takeout meaning.

### D — natural simple raise

Public minimum opposing fit: 1C–2C 8 (3+5); 1D–2D 7 (3+4), normally eight or more; 1M–2M 8 (5+3). Minor raises 6–10 HCP, majors 6–10 shortage points.

| Entry | Good 6+ at two | Good five at two | Good 6+ at three |
| --- | --- | --- | --- |
| 1C–P–2C | 2D/H/S: 10+ | 11+ | None |
| 1D–P–2D | 2H/S: 11+ | 12+ | 3C: 13+ with 0–1 D, 14+ with 2 D |
| 1H–P–2H | 2S: 10+ | 11+ | 3C/D: 12+ with 0–1 H, 13+ with 2 H |
| 1S–P–2S | None | None | 3C/D/H: 13+ with 0–1 S, 14+ with 2 S |

Five-card two-level bids additionally contain A or K and normally 0–2 opener suit. Six-card bids require good suit; offensive suitability, concentrated honors and shortness matter in guidance, not speculative playing-trick evaluator. Three-level bids require 0–2 opener suit. No five-card three-level positive treatment. Explain slightly more conservative than some OBAR instructors, who compete lighter based on playing strength and judgment; no universal HCP claim (Larry Cohen https://news.bridgebase.com/2024/05/17/balancing-comfort-zone-by-larry-cohen/; Todd https://www.advinbridge.com/this-week-in-bridge/381).

Takeout Double: 0–2 opener suit, 3+ each of three unbid suits, 4+ unbid major; actual HCP:

| Entry | 0–1 opener suit | 2 opener suit |
| --- | ---: | ---: |
| 1C–P–2C | 12+ | 12+ |
| 1D–P–2D | 13+ | 14+ |
| 1H–P–2H | 12+ | 13+ |
| 1S–P–2S | 13+ | 14+ |

Explain actual legal takeout cost: after clubs all at two, hearts may force minors to three, spades all at three. Seven-card diamond minimum is not a maximum. No shape-breaking strong Double. D overlap example 12 HCP KQ975/4/AJ86/Q94 after 1H–P–2H qualifies 2S and Double; retain both. Eight HCP AKJ95/64/862/973 does not qualify and Pass supported.

### Convenient minor explanation correction (existing opening/response rules unchanged)

Without five-card major or suitable NT opening, choose longer minor; 1D on equal four-card minors, 1C on equal three. 1D normally shows four or more but may be three in 4–4–3–2 (S/H/D/C); explain actual exceptional hand, no five-card major, only two clubs and ineligible NT. Do not clutter ordinary explanations. 2D natural single raise requires 4+ diamonds, 6–10 HCP, no four-card major; 2C requires 5+ clubs. Explain 2D usually yields at least eight combined diamonds but seven possible. Maintain same public promise in relevant limit/strong-minor support guidance. No changes to existing bidding predicates.

### E — higher, artificial and invitational responses

| Response | Public meaning | Selected West positive intervention |
| --- | --- | --- |
| 1m–3m | 11–12 HCP, 5+ C or 4+ D limit raise | Good 6+, 15+ HCP at economical three |
| 1M–3M | 11–12 shortage points, 4+ support; existing exceptional 13-point/6+ fit path | Same |
| 1m–2NT | Natural balanced 11–12 HCP, no four-card major, invitation | Same |
| Weak single jump shift | Natural 4–7 HCP, 6+ suit, nonforcing | Good 6+, 12+ HCP at two or 15+ at three |
| Strong single jump shift | Natural 17+ HCP good 5+, GF | Pass/boundary |
| 1M–2NT Jacoby | Artificial 13+ shortage points, 4+ support, GF | Pass/boundary |
| Enabled double-jump splinter | Artificial 13–15 shortage points, 4+ support, bid suit short, GF | Pass/boundary |
| 1m–3NT | Natural balanced 13–15 HCP game placement | Pass/boundary |
| 1M–3NT | Natural 13–15 HCP very flat, exactly three major support | Pass/boundary |
| 1M–4M | Weak preemptive game raise, 5+ support, under 10 shortage points, not GF | Pass/boundary |

Use objective good-suit test, no separate playing-strength evaluator. No generalized E Double or four-/five-level competitive rules. 1C–3C leaves 3D/H/S; 1D–3D leaves 3H/S but clubs at four; 1H–3H leaves 3S only at three; 1S–3S no three-level intervention. Determine true jump distance rather than nominal response level (1D–2H leaves 2S; 1S–3D leaves 3H). Natural minor 2NT and artificial Jacoby 2NT differ; splinter denomination is short, not long. Historical GF after Jacoby/splinter/strong shift persists after intervention; natural game placement and artificial later Jacoby 3NT differ. Other rare artificial responses scope.

## Continuations and rule inventory

Use explicit declarations only for the selected treatments below, in the existing topical rule arrays; put distinct sandwich treatments in appropriate //// sections, not separate rule arrays. Reuse existing declarations only when actual public meaning, hand requirements, forcing category and legal level agree; otherwise share calculations in distinct declarations. Do not add symmetrical higher-level branches merely because another family has them. Ordinary Pass or boundary for remaining judgment-heavy situations. No specialized opener support Double/Redouble, responsive Double, reopening/cooperative Double (+6/+8), penalty conversion, strong-doubler tree, strong-support cuebid, competitive NT convention or sacrifice system. Use existing kind: 'scopeBoundary' / scopeBoundaryWhen for meaningful unsupported treatment categories, not a separate rule kind or one boundary per legal call.

### North +4 — OpenerRebidRules

- A after West substantive intervention: original one-round force interrupted. Ordinary hand-qualified minimum Pass (12–16 appropriate points) if no sound description; unusual strong hand boundary. Natural four-card responder support: economical two with 12–16 shortage points; voluntary jump to three if two legal 17–18; selected clear major game 19–21. No mechanically promoted raise. Six-card natural opening suit repeat or genuine economical second suit with existing hand requirements. Natural 1NT if legal balanced 12–14 HCP and actual overcalled-suit stopper; natural 2NT 18–19 where genuinely appropriate. After West A Double check both implied unbid suit stoppers for any selected NT. After West natural 1NT mainly Pass and compelling economical natural support/suit; no automatic 2NT. Pass over Double leaves responder's contract doubled.
- A economical minor repeat: 6+, 12–16 length points, no extra honor test, natural nonforcing. Voluntary jump repeat with cheaper repeat available: 6+, 17–18 length points invitation. Displaced cheapest three: good 6+, 16–18 length points, competitive nonforcing; stronger boundary/independently qualified game. Five-card competitive repeat outside positive coverage; explain experienced players sometimes repeat good five when alternatives unattractive. Preserve uncontested forcing five-card fallback. Public six-card promise allows partner's two cards to establish eight, not alone justify a raise.
- A genuine reverse: normal reverse bid still legal, 17–21 length points, 5+ first suit, 4+ second, first longer, second not opposing naturally named suit. Natural one-round force, not GF. New force after original interrupted one; East Pass preserves it, intervention use existing current-force handling. Displaced economical second suit is not automatically reverse; boundary. No new reverse-response system.
- C: forcing-1NT fallback not mandatory after substantive intervention. Economical six-card repeat and genuine second suit/reverse with existing requirements; blocked three-level repeat only independently qualifying strong treatment or boundary. Natural NT with actual natural overcall stopper; no invented single stopper after Double. Unusual NT escapes/Redouble boundary.
- D: existing competitive major three-level raise treatment (6+ opening major, 12–16 shortage points), not quiet 17–18 invitation; selected clear game, minimum Pass. Minor re-raise requires real combined fit, especially diamonds; natural 3NT with actual opposing stopper. Double leaves 2x doubled. No automatic game tries.
- B Standard: original force interrupted, qualified Pass/repeat/support/second suit/reverse/NT with actual stopper where legal and public meaning fits. B established 2/1 GF persists; ordinary below-game signoff Pass not taught. Shape-first 2/1 rebids differ from Standard reverse. E natural invitation: selected qualified game acceptance (e.g. 3NT after 1m–2NT–3S with spade stopper), Pass leaves opponent contract, no mechanically promoted decline. Weak jump shift nonforcing; historical Jacoby/splinter/strong shift GF persists. No blind artificial control-reply tree after displacement.

### East +5 — AdvanceRules and shared NaturalOneNtPartnerCallRules

Natural suit overcall:
- A ordinary raise to two 3+ support, 6–10 shortage points; ordinary raise to three 3+ support, 7–10. C ordinary raise to three same 7–10. If North competes and economical raise to two remains legal, same 6–10. Selected competitive raise to three after further interference in A/C: 4+ support and 6–10 shortage points or exactly three and 8–10. No automatic promotion to four. Natural, nonforcing.
- A independent economical new suit: generally 10+ HCP and good 6+ suit, not naturally shown opposing suits, nonforcing (unlike some direct advances). Selected natural 1NT after one-level overcall: balanced 8–11 HCP, both opposing suits stopped, preferably no suitable three-card fit. C economical independent new suit or clear natural game only where independently qualified existing criteria fit. B/E usually Pass, selected sound economical fit raise only; D conservative fit raise with particular emphasis on 4+ support/useful values; no automatic further promotion, routine NT or independent side-suit system.
- Ordinary fallback Pass with no arbitrary direct 10-HCP cap in A. Higher competitive/game choices only independently established criteria or boundary.

Takeout Double:
- A promises four in both unbid suits; C/D three in all three unbid suits, four in at least one unbid major (specifically other major after major opening). After North actual Pass, responder's contract remains doubled: choose cheapest legal promised unbid suit even with zero HCP. Prefer four-card suit, allow three-card fallback; four cards may be better than cheaper three. D cheapest may be at three (e.g. 1S–P–2S–X–P–3H), not invitation. No ordinary Pass for penalty conversion. Extraordinary no-three-card suit boundary.
- A/C invitation: natural nonforcing single jump over actual cheapest bid in suit, 9–11 length points, 8+ actual HCP, guaranteed eight trumps. A needs four cards; C needs four in other major after major opening, five otherwise. No honor test; prefer major when comparable, preserve justified alternatives. Familiar invitation is established instruction; HCP floor, valuation and guaranteed fit are teaching constraints.
- A/C minimum: 0–8 length points, or 9–11 if no invitation qualifies. Explicit evaluated-candidate suppression of minimum fallback if jump qualifies; no repeated predicate or ordering dependence. 12+ strong advances boundary. D compulsory economical choice without added invitational tree.
- After North natural bid, Double displaced; free Pass or A/C economical one-/two-level natural bid with 6–10 length points and guaranteed eight-card fit using above public promises (C all at two). No compulsory zero-HCP action, free jump/three-level action or responsive Double. D free choice, Pass or independently qualified economical action only.
- Natural sandwich 1NT: see shared NT section.

### South +6 — ResponderRebidRules

- A North ordinary natural four-card major raise to two, East Pass: 6–10 shortage points Pass, 11–12 voluntary 3M invitation, 13–16 natural 4M game; genuine 17–18 opener jump raise uses existing minimum Pass/accept game treatment. If East competes and displaces two, cheapest 3M requires South 5+ major, guaranteed 9+ trumps and 8–12 shortage points. Natural competitive nonforcing, no extra HCP/honor requirement. Explain experienced players sometimes compete with only eight trumps based on hand/auction judgment; selected nine-card requirement is not universal prohibition.
- A North genuine four-card diamond support with East Pass: selected minimum 6–10 Pass, 11–12 support invitation 3D, balanced 11–12 HCP 2NT and 13–16 HCP 3NT with stopper in actual opposing suit; reuse only independently compatible predicates; no ranking system or new numeric policy. If displaced or minor game judgment, boundary rather than auto-promote. After North repeat/second suit/natural NT reuse existing natural decision calculations only where public promises, strength and levels fit; competitive NT needs opposing natural stopper; competitive six-card minor promise permits eight-card fit with two support, not automatic raise.
- A North actual Pass: original force interrupted; genuine Pass, independently justified economical long-suit action only (reuse an existing compatible natural treatment; otherwise scope boundary). If East raises West, North has not promised South support. After West Double and East takeout, East may have zero HCP; don't label strength showing. If East passes outstanding Double for penalties, special boundary. After West NT, East convention printed suit may be artificial.
- C delayed support: actual three-card major limit-raise route, 3+ major support and 11–12 shortage points, cheapest natural competitive support at 2M/3M. Do not infer hidden support from public 1NT or label quiet invitation. No weak incidental two-card support. Strong game only independently applicable existing criteria or boundary.
- D minimum Pass after North competitive 3M and East Pass is acceptance of competitive contract, not declining invitation. If North/East Pass, South may Pass or independently qualified natural competition using real support. B/E respect actual historical GF vs nonforcing/invitation and actual latest contract. No automatic below-game signoff on established GF.
- All reopening Double cases outside positive coverage. Family A cooperative takeout meaning can be acknowledged (Bridge World Standard), not conflated with D/C possible penalty-oriented meanings. No +8 follow-up system.

### West +7 — OvercallRules

- Ordinary nonforcing Pass after natural support/new suit, compulsory minimum takeout, free advance or invitational jump where appropriate. No automatic Pass for unmodeled strong or forcing hand. A/C/D strong-doubler/game acceptance after takeout is scope, no special threshold. B/E narrow Pass or scope.
- A after East natural support and South competition: cheapest 3M, West 6+ major, East promises 3+, guaranteed 9+ fit, 12+ shortage points; natural competitive nonforcing, no added HCP/honor test. Explain eight-card judgment caveat as for South. Four-level outbidding/sacrifice boundary.
- A after East natural raise and South Pass: existing independently compatible natural invitation/game criteria may be reused; no new strong-game ladder. After East independent new suit, Pass allowed because nonforcing; selected economical support with 3+ in normally 6+ suit and extras, or compelling own good 6+ repeat only if independently qualified existing treatment, otherwise boundary. No routine third suits, forcing cuebid or NT. Selected natural NT advance follow-up only where existing strength/stopper promises fit.
- Quiet sandwich NT continuations below; compulsory convention completion is not judgment-heavy optional competition.

### Fixed 16–18 natural sandwich 1NT

- Reuse NaturalOneNtPartnerCallRules and quiet Stayman/Jacoby/Texas machinery. Sandwich partner response strength always uses fixed 16–18 HCP, while existing opening and direct natural 1NT overcall response range behavior stays unchanged. Narrowly adapt oneNtResponseHcpShift and all dependent evaluations (evaluateHandConstraint, maybeSuppressOneFiveOrMoreMajorTransfer, oneNtTwoNtInvitationApplies, oneNtNaturalMinorInvitationApplies, oneNtGameGoingLongMinorBoundaryApplies, naturalOneNtOvercallerInvitationApplies). Consider naming clarity of hcpRelativeToOneNtOpening only during actual implementation; no unrelated cleanup. No parallel NT system or settings object.
- East +5 after North physical Pass: ordinary 16–18 response inventory: Pass 0–6 HCP absent preferable suit route (not necessarily balanced); Stayman 7+ with qualifying major; Jacoby transfers with 5+ target; natural weak 2M with Jacoby off; natural 2NT 7–8 balanced subject to existing disabled-convention exception; good 6+ minor invitation at 7–8; balanced 3NT 9–14; natural game-forcing 3M at 9+ with Jacoby off; Texas or natural 4M under corresponding agreement at 9–14 with 6+ target and no four-card other major. Preserve existing other applicable meanings, no expanded slam system. Both 5+ majors: weak both transfers, 7–8 heart transfer preference, 9+ spade transfer preference. Adapt suppressor to sandwich actual partner context; if direct behavior changes, identify and separately review before accepting change.
- Extend matchesPartnerNaturalOneNt and getNaturalOneNtOvercallAdvance with narrow physical +3/+5/+7 context and intervening Pass checks. Reuse refineNaturalOneNtOvercallStayman/Jacoby/Texas, existing fitting A/K/Q minor invitation acceptance, natural 3M game placement with Jacoby disabled (doubleton 3NT, 3+ 4M). Stayman replies retain hearts-first with both majors. No superaccepts. West's natural 2NT invitation response: 16 Pass, 17 both Pass and 3NT, 18 accept. Borderline invitation alternatives are established meaning, not subjective competitive Pass predicates.
- North/South substantive interference disables quiet convention paths; no automatic competitive NT convention tree. Distinguish artificial printed strain from natural suit. Preserve historical force semantics: Stayman/Jacoby one round, Texas game force and completion game placement, natural 2NT nonforcing. Audit isGamePlacement and getUnmodeledContinuationForce; no separate force ledger or general +8 tree.
- **Learner explanations:** State the actual promised 16–18 HCP range in ordinary bridge language; do NOT mention configured opening range, settings implementation or programmer terminology in learner guidance. Example: “Partner's sandwich 1NT overcall promises 16–18 HCP. Your eight HCP meet the 7–8-HCP range for a natural 2NT invitation.” Decline example: “Your sandwich 1NT overcall promises 16–18 HCP, and you have 16 HCP. Being at the bottom of the range, you can pass partner's invitational 2NT.” Reuse ntOvercallerRebid evidence and existing explanation dispatch; no duplicate explanations.
- Integration tests: sandwich 7-HCP invitation and 9-HCP game under either opening range; qualifying Stayman and transfer options/preferences; 16/17/18 invitation decisions; North/South interference guards; completed Texas satisfies force; DONT isolation; direct/uncontested unchanged unless separately approved. Validate real full deals, do not manufacture unreachable slam branches or demand every theoretical HCP edge have a practice deal.

## Source architecture and matcher invariants

- Physical auction Call[] remains authoritative; derive public facts on demand using agreement and actual call order, not hidden partner hand. AuctionContext is a rule declaration filter, not persistent state. No new public-meaning ledger, getResponderPublicMeaning, second evaluator or persisted force model. Existing getUnmodeledContinuationForce re-evaluates prefixes; immediate force interrupted by substantive competition, historical GF retained via includeOpposingCompetition for auction-end guidance. Audit private newSuitThenRaise GF versus public promise only if concrete test demonstrates bug. True reverse creates new one-round force; Texas completion game placement.
- Stage routing relative to opening.index: +3 direct advancing if East intervened, balancing if East and South Pass, sandwichOvercalling if East actual Pass and South qualifying response to one-level suit opening. West Pass leaves ordinary openerRebid. Actual intervention permits +4 openerRebid, +5 sandwichAdvancing, +6 responderRebid (including North/East physical Pass), +7 sandwichOvercallerRebid. No new sandwich stage after NT or two-level opening; respect completion and pre-opening Passes. Physical routing as agreement-independent as possible; classify public meaning in rule matching.
- OvercallRules shared by overcalling, balancing, overcallerRebid, sandwichOvercalling, sandwichOvercallerRebid. AdvanceRules shared by advancing/sandwichAdvancing. OpenerRebidRules and ResponderRebidRules retain existing stages. No new rule arrays. Add comments beside shared arrays. Neutral seats seatAfterOpener/seatAfterResponder (or shorter afterOpener/afterResponder) where seat not actual role; keep direct role names elsewhere.
- Rename getInterferenceAfterOpening to getDirectInterference; add getSandwichInterference. Keep AuctionContext.interference for direct +1, sandwichInterference for +3. Single SandwichInterference union: none/present/either/suitOvercall/ntOvercall/takeoutDouble. Physical classifier must distinguish any actual intervention (including unsupported natural jumps, Double/Redouble or artificial/unclassified actions) from none; do not assume every Double has approved takeout meaning. Rule constraint present matches every actual intervention; use a concrete classification only when its public meaning fits. Determine the representation of unclassified intervention in the batch plan; never report it as none or a misleading takeout meaning. No separate condition type. Omitted direct constraint unconstrained subject to existing guards; omitted sandwich constraint on openerRebid/responderRebid means none. Explicit either allows both, present any substantive intervention; concrete kind restricts. New sandwich role stages identify their context without repetitive constraint. Comment immediately beside both properties and matcher.
- auctionContextMatches protects opener and responder from quiet-rule leakage before compact auction matching. Preserve direct openerRebidAfterInterference and special early returns partnerNaturalOneNt (extend quiet sandwich only), partnerNaturalOneNtAfterSuitInterference and partnerNaturalTwoNtOverWeakTwo (unchanged). Keep getRuleAuction/getOpeningPartnershipCalls compact non-Pass representation unchanged; use actual physical +4/+5/+6 for obligation/displacement, comment why locally. Audit direct-only isSupportedCompetitiveOpenerRebid/getAdvancerCallKindForOpenerRebid. getRulesForStage and getSupportSuitForStage use correct arrays and partner +3, not +1; no support suit for NT/Double. BidPanel stage/report/practice handling and system argument consistency; explanations stage dispatch. Reuse selective fallback suppression, not global suppression.
- Code style: callers before callees, types before dependents, retain meaningful comments and //// sections, explicit conditions. No broad renames or duplicate large functions. Comment physical Pass, stage offsets, interference defaults, helper parameters and shared-purpose invariants locally. Keep explanations.ts organized as one file; no size-only splitting.

## Shared evaluations and evidence

- Preserve existing auction matching, callRefinement, appliesWhen, callEvidenceBuilder, CallEvidence and explicit candidate-selection pipeline. Builders observe facts, not eligibility; applicability owns evaluated requirements. Avoid overwriting requirements through shallow evidence merge; preserve evidence for candidates rejected in refinement as well as applicability. No new evaluation framework, public-promise database or force ledger.
- overcalling-functions.ts: share natural suit candidate/economy/exclusion and honor calculations with refineSimpleSuitOvercall; keep direct policy intact. Family-specific HCP/length/level/shortness requirements belong in declarations or narrow parameters, not five copied evaluators. Reuse hasPreemptSuitQuality and share exceptional five-card quality (3 of AKQJ incl 2 of AKQ); adapt getOvercallHonorEvidence without misleading direct-only fields. Adapt naturalNotrumpOvercallApplies for fixed 16–18 and two opposing natural-suit stoppers, using hasBasicSuitStopper and existing requirements. Focused sandwich takeout Double applicability is justified because A/C/D actual-HCP/shape policy differs from direct shortage-point/strong-Double split; share underlying support/shortness evidence, do not duplicate direct policy or encode rule-ID switches.
- advancing-functions.ts: narrowly adapt getNaturalSuitOvercallForAdvancer and relevant raise/new-suit/NT refiners, preserve direct quiet-auction guards and forcing meanings; sandwich independent new suit is nonforcing. evaluateNaturalNotrumpAdvance can share balance/HCP/stoppers (both named suits for A). Do not duplicate constructive requirements inside sandwich fallback Pass as naturalSuitOvercallPassApplies currently does for its direct treatment; use selective evaluated-candidate suppression. Keep direct behavior unless separately approved.
- Takeout advance context: adapt getTakeoutDoubleForAdvancer/refineTakeoutDoubleSuitAdvance/takeoutDoubleMinimumSuitAdvanceApplies using a small structured result near callers (opening, actual doubled contract, promised unbid suits and their public minimum lengths, outstanding vs displaced Double). Actual latest contract governs legal economy, including free advance after North bids. Preserve direct/weak-two behavior. Evaluate minimum and invitational candidates independently, explicitly suppress minimum fallback when qualifying invitation exists; retain minimum when no jump qualifies for 9–11 length points. No ordinary Pass over outstanding Double. Do not use rule/candidate order.
- Shared guaranteed fit calculation = player's actual suit length + partner's publicly promised minimum in that suit, never hidden partner hand. Context-specific helpers supply promise; no comprehensive rule-promise database. Reuse in A/C invitations, free advances, competitive raises, minor-repeat fit. Add narrow requirements evidence for suit, own length, partner minimum, guaranteed combined length, required length, outcome. Consider relative first/second suit length evidence for genuine reverse only as needed.
- opener-rebidding-functions.ts: reuse natural repeat/raise/NT/new-suit refiners and hand constraints at correct legal levels. Adapt refineOpenerReverseRebid/openerSecondSuitApplies for genuine normal-level reverse and first suit longer than second, preserving direct/uncontested diagnostics. Do not indiscriminately generalize getOpenerForcingResponseCompetitionInfo beyond its direct assumptions.
- responder-rebidding-functions.ts: preserve getUncontestedThreeCallContinuation invariant. Share actual hand calculations for natural repeats/second suits/NT when promises and levels agree; add opposing natural-suit stopper for competitive NT; six-card competitive minor public promise can establish eight with two support without globally changing quiet three-card requirement. Focused South competitive 3M declaration/evaluation uses shared fit evidence.
- West +7: share context/support calculations from naturalSuitOvercallerRebidApplies, contestedSuitOvercallerRebidApplies, getSuitOvercallerAdvance/getContestedSuitAdvance only where meanings agree; do not expand wholesale direct strong-doubler or artificial continuation systems. Selected Pass, A competitive 3M, independently applicable natural actions, quiet fixed-range NT, otherwise scope.
- CallEvidence: reuse requirements, naturalOvercallSuit, naturalOvercallStrength where semantically valid, unbidSuitSupport, openerSuitLength, takeoutSuitSelection, ntOvercallerRebid, suppressedBy. Extend narrowly for exceptional suit quality, actual contract, guaranteed fit. Do not invent direct-only evidence for sandwich. explanations.ts stays one organized file; adapt existing natural overcall/Double/takeout advance/contested rebid/NT/responder positive and failure sections using evidence, no duplicated evaluations. Honor all approved learner judgment caveats; ordinary bridge language, not settings/programming language.
- Source integration: auction.ts, bidding-types.ts, common-rule-helpers.ts, biddingEvaluation.ts, existing four topical function/rule families, natural-1nt-partner-calls.ts, explanations.ts, BidPanel.tsx. Follow docs/code-style.md (callers before callees, types before dependents, //// sections, explicit conditions and meaningful comments, no speculative wrappers). Verify actual executable sources against master and fresh ZIP before implementation; preserve before/after direct and uncontested diagnostics/explanations, focused permanent tests only.

## Practice and verification

Use existing topical practice buckets and modules (natural suit/NT/Double overcalling, opener/responder rebids, advances and overcaller rebids); no separate sandwich or DONT menu groups or family taxonomy. End each practice auction at last interesting call. All four explicit 13-card hands, North dealer, 52 unique cards, 40 HCP, legal auction and suitable preceding calls under actual required agreements. Validate authored deals with existing validator and evaluator; no unvalidated illustrative deals, impossible point allocations or artificial coverage quotas. Original motivating 1C–P–1H–1S–2H should be represented by a valid deal. Reuse RuleTestDeal role-based expectedOvercallCalls/expectedAdvanceCalls/expectedOvercallerRebidCalls where unambiguous; adapt fixed-offset test runner to actual stage (direct 1/3/5 vs sandwich 3/5/7), inspect stats.ts equivalent assumptions. Resolve any real ambiguity in test expectation roles with smallest explicit adaptation; do not build parallel corpus.

Focused regression coverage:
- All six A/B entries, four C/D openings, E natural/artificial classification, agreement switches, legal cheapest vs jump, exact threshold/one below and five/six-card distinctions. A/C/D overlap natural and Double, public two/three unbid suits, shape and shortness, fallback Pass suppression, strong boundaries. D 7 vs 8 opposing fit; convenient minor explanation correction.
- Actual stages: direct 1C–1H–1S; balancing 1C–P–P; sandwich 1C–P–1H; West Pass quiet rebid; West suit/Double/NT interference; North Pass vs bid; East advance; South Pass/bid; pre-opening Pass; no new stage after 1NT/2C; completed null. Omitted/none/present/either/concrete interference constraints and existing direct guards.
- Zero-HCP compulsory takeout vs displaced free choice; D obligatory three-level; A/C real jump vs economical, guaranteed fit and 8-HCP floor, minimum fallback when jump fails; C four-card other major vs four after minor opening; no ordinary penalty Pass. Natural raise ordinary vs competitive, guaranteed nine vs eight for South/West; quiet invite vs displaced competitive. Minor repeat 5 vs 6 and 2 vs 3 support; real reverse vs displaced and new force. C delayed major support. B Standard vs established 2/1 GF, E natural 2NT vs Jacoby, weak vs strong shift, splinter shortness, preemptive game placement, private support route vs public promise.
- NT fixed 16–18 under both opening ranges; 7 invitation, 9 game, weak transfer/signoff, Stayman, two-long-major preference, 16/17/18 acceptance, interrupted convention, Texas completion, DONT on/off isolation. Verify real feasible deals; not every theoretical strength edge requires full practice deal.
- Before each implementation batch capture current-master full matched/rejected candidate diagnostics, alternative calls, ranks, stage/boundary and learner-facing explanation text. Compare after, inspect every changed outcome; preserve existing direct/balancing/uncontested/DONT, convention and force behavior unless explicit approval of a demonstrated correction. Focus permanent assertions on behavior, not wording snapshots. Run build and test:rules (zero failures); verify CI and squash merge approved small feature branches, concise past-tense commit subject. Verify each merge on master. Update spec.md and by-the-numbers.md as implemented, not historical design logs.

## Remaining work

1. Final implementation batch plan: source-file scope, dependency order, independently buildable/testable increments, specific acceptance cases and temporary diagnostic strategy. Resolve only concrete implementation gaps (representation of unclassified intervention without conflating it with no interference, test-role ambiguity, compatibility of existing natural continuations, precise objective application of D suit/shortness requirements where the approved ordinary treatment uses judgment language). Where no compatible rule exists, retain the selected scope boundary rather than invent a new numeric policy. Do not reopen agreed bidding design or expand scope to fill rare branches.
2. Start a new chat with current master and fresh ZIP; read this plan, spec.md, code-style.md and relevant sources. Obtain explicit authorization before executable changes. Implement approved batches with verification; remove completed work items from this active plan and move durable implemented agreements/scope into spec.md. Keep this plan current rather than retaining superseded alternatives or completed review logs.
