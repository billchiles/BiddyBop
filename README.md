# Bridge Bidding Trainer App

This is a practice app for learning and reinforcing contract bridge bidding.
It focuses on common bidding decisions that the app can reliably teach through bidding guidelines
and partnership agreements.  For example, the app supports several agreements and conventions options, such as Stayman, Jacoby, splinters, 2/1, jump shifts meaning, etc., but it doesn't use inverted minors or stopper-showing side-suit continuations since those treatments require various partnership agreements and more judgment-dependent follow-up bidding.  The app is broad enough for solid bidding practice while remaining clear about where the rules stop and bridge judgment begins. 

![Bridge Bidding Trainer screenshot](docs/bridge-bidding-trainer.png)

## Try it

Run the web version directly in your browser:

[Open Bridge Bidding Trainer](YOUR_GITHUB_PAGES_URL)

No installation is required for the web version.

Desktop builds for Windows and macOS may also be available from:

[Downloads and releases](YOUR_GITHUB_RELEASES_URL)

## Using the app

Start a new deal and enter bids as the auction progresses.  You see all the hands and bid all the hands, so be careful to use only what you know from the bidding and don't enhance bids based on seeing other hands.  This gives you more practice with feedback than making one or two bids per deal.

The explanation area shows why bids qualify under the supported bidding rules and, where appropriate, which alternatives have higher priority.  Bridge does not always have one mechanically correct bid, so the app shows all that apply.

Use the rule-practice deal selector to focus on a particular bidding situation instead of
receiving a random deal.  These deals illustrate specific rules, nearby strength boundaries (or a ladder of bids based on partner's bid and points or structure of your hand), and differences between partnership agreements.

In a selected practice deal, if you enter a different bid, the explanation still evaluates your
choice, but the recorded bid is used to keep the remaining lesson on track.  The recorded bid
is not necessarily the only reasonable choice. Each exercise stops at its intended final call,
which need not be the end of the bridge auction.

The app is most useful as a practice companion: make your own bidding decision first, then compare it with the candidates and explanations produced by the app.  For now, it cannot arbitrarily tell you the next best bid.

## Bidding-system settings

Partnership agreements can be changed in the app's settings.  Changing an agreement can change
both the bids recommended for a hand and which rule-practice deals are available. For example,
turning off 2/1 agreements may leave some practice groups with zero pre-formed deals.

The settings let you choose between common treatments without assuming that every partnership uses
the same system.  You can turn on common conventions, for example, Stayman and Jacoby Transfers, as you learn about them. 

## What the trainer is and isn't

Bridge bidding combines rules, partnership agreements, inference, and judgment.  Suit quality,
borderline strength, distribution, vulnerability, and partnership style can all affect the best
call.  The app concentrates on common situations that can be taught consistently as rules,
but it does not attempt to be a complete expert bridge bidding app for teaching.

Where judgment matters more than a mechanical rule, the app may provide guidance, show
multiple reasonable calls, or completely punt on the next bid.  For example, it recognizes
some slam-related bids without teaching a complete slam-investigation system, after some very strong openings and a single responding bid, the app cannot model all the subtle considerations to decide how to continue bidding toward game or slam and only provide a general guideline on how to continue.

## Current bidding coverage

The tables below are a development snapshot of the app's current scope.  `Done` means the intended
treatment for that area is implemented, with no current plan to expand it.  `Partial (done)` means the
app intentionally implements only a useful subset and has no pending work for the omitted portion.
`Incomplete` means useful coverage exists but known work remains.  `Planned` means we intend to analyze
and probably implement the area, although that analysis may lead us to narrow or omit it.  `Omitted`
means we considered the area and deliberately chose not to model it as part of the app's intended scope.

### When our partnership opens

| Our opening | Ordinary response | Response after interference | Uncontested opener rebid | Opener rebid after interference |
| --- | --- | --- | --- | --- |
| 1C / 1D | Done | Done: selected common interference | Done | Partial (done): selected competitive continuations |
| 1H / 1S | Done | Done: selected common interference | Done | Partial (done): selected competitive continuations |
| 1NT | Done | Partial (done): natural two-level suit interference | Done | Partial (done): selected Double, natural suit, and NT continuations |
| 2NT | Done | Omitted | Partial (done): selected continuations | Omitted |
| Strong 2C | Done | Omitted | Partial (done): selected continuations | Omitted |
| Weak 2D / 2H / 2S | Done | Omitted | Partial (done): selected continuations | Omitted |
| Three-level preempt | Partial (done): selected responses | Omitted | Partial (done): selected continuations | Omitted |
| Natural four-/five-level preempt | Partial (done): Pass only | Omitted | Omitted | Omitted |

The omitted responses after interference are intentional limits of the app. Once opponents
interfere, further bidding can require different partnership agreements, more judgment, and
complicated decisions with less bidding room. The app provides general guidance in some of
these situations, even when it cannot recommend a specific bid. The reasons for these
omissions are explained below.

**After a 2NT opening**, some partnerships may keep familiar conventions available after a Double,
but Pass and Redouble acquire different meanings and suit interference quickly becomes
space-sensitive and agreement-dependent.  That creates a relatively large competitive branch for
an uncommon auction, so the app stops rather than teaching only a fragment of a 2NT
interference system.

**After a strong 2C opening**, some normal calls can remain sensible after a Double, including a
waiting response under common methods.  But the opening is already rare and artificial, competitive
meanings vary by partnership, and a separate interference system adds little practice value for the
amount of branching it introduces.  The app therefore keeps this family uncontested.

**After a weak-two opening**, several ordinary continuations can still make bridge sense after
interference, and this is the most plausible of these omitted families to reconsider later.  Still,
Pass into a doubled contract is no longer the same decision, suit overcalls create different
constraints from a Double, and a useful treatment would need more than simply reusing every
uncontested rule.  For now the app stops rather than presenting an incomplete competitive
system.

**After a three-level preempt**, the auction is already high enough that available space, fit,
playing strength, vulnerability, and judgment become important quickly.  The frequency and training
value do not justify another high-level competitive continuation tree, so responder interference is
intentionally omitted.

Many responder rebids are covered, but the app stops trying to cover all bids due to judgment or partnership agreements becoming more important than clear-cut rules.

### When the opponents open

| Opponent's opening | Our direct defense | Advancer after responder passes | Advancer after responder acts | Overcaller continuation |
| --- | --- | --- | --- | --- |
| 1C / 1D / 1H / 1S | Done | Done | Partial (done): selected common actions | Partial (done): selected natural suit, 1NT, and takeout-Doubler rebids |
| Strong 1NT | Done: DONT (Disturb Opponents' NoTrump) | Done: basic responses to DONT | Omitted | Done: partner's basic DONT follow-up bids |
| Weak 2D / 2H / 2S | Done | Partial (done): selected common continuations | Omitted | Partial (done): selected natural suit, 2NT, and takeout-Double continuations |
| Three-level preempt | Omitted | Omitted | Omitted | Omitted |
| Strong 2C / 2NT | Omitted | Omitted | Omitted | Omitted |

Natural 1NT overcalls show 15–18 HCP, while advancer uses the same conventions and strength
requirements as responses to a 1NT opening, according to the configured 15–17 or 16–18 setting.
This avoids creating a separate set of overcaller–advancer bidding rules for a small strength
difference that adds little practice value.

Against a strong 1NT opening, the app teaches the basic compact DONT interference but stops before
later competitive continuations.  Strong hands without a qualifying DONT action receive general
continuation guidance rather than an automatic Pass or penalty Double.  Weak-two defenses include
selected advances, natural Pass decisions, and immediate responses to forcing or conventional calls.
They do not include full competition after responder bids, continuations after natural three-level
overcalls, or a general system for repeated high-level bidding.  Defenses against opposing
three-level preempts, strong 2C/2NT, and higher openings remain omitted.  The app explains where it
stops reviewing bids and giving feedback due nuances and judgment and tries to provide general
continuation guidance rather than automatically recommending Pass.

### Advancer when responder acts after a one-level suit opening

| Partner's intervention | Responder passes | Responder raises opener | Responder bids a new suit / NT | Responder Doubles / Redoubles |
| --- | --- | --- | --- | --- |
| One-level natural suit overcall | Done | Partial (done): actions after simple raises; Pass or guidance after weak jump raises | Partial (done): natural suits and selected NT | Done |
| Two-level natural suit overcall | Done | Partial (done): actions after simple raises; Pass or guidance after weak jump raises | Partial (done): natural new suit and selected NT | Partial (done): where the negative Double treatment applies |
| Takeout Double | Done | Partial (done): actions after simple raises; Pass or guidance after weak jump raises | Partial (done): natural suits/NT; Pass after weak jump shifts | Done |
| Natural 1NT overcall | Done: normal 1NT systems | Partial (done): natural two-level suit interference | Partial (done): natural two-level suit interference | Omitted |
| Preemptive jump overcall | Done | Omitted | Omitted | Omitted |

This table shows the app's selected advances (after advancer's partner overcalled opener).  The app
cannot teach every possible competitive auction.  Specialized Doubles and cuebids, broader
continuations after preemptive jump overcalls, and high-level competition depend too heavily on
partnership agreements, fit, vulnerability, and playing strength for reliable rule-based advice.
Where useful, the app provides auction-specific general guidance on how bidding might procede,
rather than presenting an authoritative treatment.

## Stoppers and notrump judgment

Outside-suit weakness can be important when deciding whether notrump is attractive.

A useful conservative definition of a stopper is:

- An ace
- A king with at least one additional card
- A queen with at least two additional cards

Holdings such as `Qx` or `Jxx`, or holdings whose effectiveness depends on which hand becomes declarer and who leads the suit, may be adequate to count as a stopper, but it is an experienced judgment call.

The app does not automatically require a stopper in every outside suit for every uncontested natural notrump bid.  Stopper requirements are used only where the particular bidding treatment calls for them.

## Treatments intentionally omitted or deferred

The app intentionally does not try to implement every named convention or every possible continuation.
This list records some of the choices we have discussed so that an unfamiliar name does not look like an
accidental omission.

| Treatment or feature | Current decision | What it means |
| --- | --- | --- |
| Inverted minors | Omitted | A partnership agreement that reverses the usual strength meanings of minor-suit raises and creates additional follow-up auctions. |
| Stopper-showing continuations after a minor raise | Omitted with inverted minors | Side-suit bids can be used to show stoppers while exploring 3NT; this creates more partnership-specific continuation rules. |
| Michaels cuebid | Omitted | A conventional cuebid of opener's suit that shows a two-suited hand rather than a natural suit. |
| Unusual 2NT | Omitted | A conventional jump to 2NT that normally shows the two lowest unbid suits. |
| Lebensohl after a weak-two takeout Double | Omitted | Uses an artificial 2NT relay to separate weak escape hands from stronger constructive hands after partner Doubles a weak two. |
| Cappelletti over 1NT | Omitted | A common defense to 1NT with a penalty-oriented Double and conventional two-suited calls; this app uses compact DONT instead. |
| DONT defense to strong 1NT | Partial (done) | DONT (Disturb Opponents' NoTrump) uses Double for a one-suited hand and two-level suit bids to show one- or two-suited hands.  The app models the core meanings and basic pass/correct auction, but omits game-inquiry 2NT, the stronger Double-then-2S distinction, and continuations after responder competes. |
| Snapdragon / fourth-suit competitive Double | Omitted | A specialized Double after opener, overcaller, and responder have shown three different suits, usually suggesting the fourth suit plus tolerance for partner. |
| Responsive Doubles in every competitive auction | Partial (done) | Responsive Double is modeled in the common responder-raise situations we chose, but it is not given a universal meaning in every later competitive auction. |
| General penalty Double / Redouble system | Omitted | The app models specific functional Doubles and Redoubles such as takeout, negative, responsive, and strength-showing actions, but does not decide when to defend a contract for penalties. |
| Defense to opposing three-level preempts | Omitted | The underlying defensive ideas can be practiced against weak-two openings without adding another high-level, judgment-heavy continuation tree. |
| Defense to opposing strong 2C or 2NT | Omitted | These uncommon defensive auctions are outside the current app scope. |
| Competitive continuations after our preemptive jump overcall | Omitted | Selected uncontested replies to advancer’s forcing new suit are modeled; once the opening side also competes, vulnerability, fit, and playing-strength judgment remain outside the selected treatment. |
| Natural four- and five-level preemptive openings | Partial (done) | The opening bids are modeled as examples; responder has an explicit Pass, but further high-level bidding and continuations are omitted. |
| Direct 4NT opening as Blackwood | Omitted | The rare artificial forcing opening is not executable; other meanings of 4NT in ordinary auctions are unchanged. |
| Detailed slam mechanisms | Partial (done) | Gerber replies, forcing 5NT, direct 7NT, many suit-auction Blackwood replies, and similar rare continuations are not full practice families. |
| Responder's later rebid | Partial (done) | Selected routine continuations are practiced; judgment-heavy later auctions stop with guidance. |
| Balancing-seat defensive bidding | Partial (done) | After a one-level suit opening followed by two Passes, practice a lighter natural suit balance, takeout Double, 12–15 HCP natural 1NT, or defensive Pass. Constructive jumps and further partnership continuations are explained but not practiced; balancing after notrump or weak-two openings is omitted. |
| Full opponent autobidder | Planned | All four seats can be bid manually.  We plan to analyze whether a trustworthy autobidder is feasible; a simplistic one that becomes unreliable in judgment-heavy or intentionally unsupported auctions would be worse than having none. |
| Scoring and card play | Omitted | The project is a bidding trainer rather than a duplicate-scoring or card-play engine. |

These statuses describe the app's intended scope as it stands now.  Manual practice and user feedback
may still justify revisiting an Omitted treatment if it proves common, deterministic, and valuable enough to add.

## Rule-practice deals

The app includes specifically constructed deals for practicing bidding rules and important boundary cases.

The practice corpus is selective rather than exhaustive.  Its purpose is to exercise meaningful bidding decisions and partnership-agreement differences, not to generate every possible permutation of every rule.

## Feedback

If you encounter a hand where the suggested bids seem wrong, incomplete, or poorly explained, you can send feedback.  The Dump button puts the deal, the auction, and explanations on the clipboard for sending with your feedback.

