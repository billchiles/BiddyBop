# Bridge Bidding Trainer

This is a practice app for learning and reinforcing contract bridge bidding.  This trainer focuses on common, mostly rule-based bidding decisions.  For example, it doesn't use inverted minors or stopper-showing side-suit continuations after responder raises opener's minor since those treatments require various partnership agreements and more judgment-dependent follow-up bidding.  There are settings for many agreements that are more deterministic for computing.

The goal is a trainer broad enough for solid bidding practice while remaining clear about which rules it models, which partnership agreements it assumes, and where bridge judgment begins.

The trainer deals hands, lets you bid through an auction, and explains which bids match the bidding rules modeled by the app.  The goal is to turn bidding guidelines and partnership agreements into repeated practice rather than simply presenting tables to memorize.

![Bridge Bidding Trainer screenshot](docs/bridge-bidding-trainer.png)

## Try it

Run the web version directly in your browser:

[Open Bridge Bidding Trainer](YOUR_GITHUB_PAGES_URL)

No installation is required for the web version.

Desktop builds for Windows and macOS may also be available from:

[Downloads and releases](YOUR_GITHUB_RELEASES_URL)

## Using the trainer

Start a new deal and enter bids as the auction progresses.

The explanation area shows why bids qualify under the modeled rules and, where appropriate, which alternatives have higher priority.  Bridge does not always have one mechanically correct bid, so the trainer can retain multiple reasonable candidates rather than forcing every hand into a single answer.

Use the rule-practice deal selector when you want to work on a particular bidding situation instead of receiving a random deal.  This allows you to practice different bids to nearly identical hands, but the hand's points are off by one or have an adjacent point range, with suit length restrictions, and so on.

The trainer is most useful as a practice companion: make your own bidding decision first, then compare it with the candidates and explanations produced by the app.

## Bidding-system settings

Partnership agreements can be changed in the app's settings.  Changing an agreement can change both the bids recommended for a hand and which rule-practice deals available.  For example, turning off 2/1 agreements leaves some groups of rule-practice deals with zero pre-formed deals.

The trainer supports multiple treatments where it is useful to practice the effect of different partnership agreements rather than assuming that all bridge players use exactly the same system.  In particular, you can practice the most basic bidding, then turn on common comventions, as you learn more about them.

## What the trainer is — and isn't

Bridge bidding combines rules, partnership agreements, inference, and judgment.

This trainer concentrates on common bidding situations that can be represented usefully and consistently as rules. It is intended to cover more than only introductory bidding, but it does not attempt to be a complete expert bridge bidding engine.

Some decisions cannot usefully be reduced to a simple formula.  Suit quality, borderline strength, distribution, vulnerability, partnership style, and the likely location of missing honors can all influence the best bid at the table.

When a situation sufficiently fits clear bidding rules, the app can model it and provide solid bidding practice. Where judgment becomes more important, the app may instead provide guidance, retain multiple reasonable candidates, or leave the treatment unmodeled.  For example, judging if you need to ask for aces or kings to bid slam is subtle enough, guidance and rules admit these bids exist, but the app doesn't provide real training in this situation.


## Current bidding coverage

The tables below are a development snapshot of the trainer's current scope.  `Done` means the intended
treatment for that area is implemented, with no current plan to expand it.  `Partial (done)` means the
trainer intentionally implements only a useful subset and has no pending work for the omitted portion.
`Incomplete` means useful coverage exists but known work remains.  `Planned` means we intend to analyze
and probably implement the area, although that analysis may lead us to narrow or omit it.  `Omitted`
means we considered the area and deliberately chose not to model it as part of the trainer's intended scope.

### When our partnership opens

| Our opening | Ordinary response | Response after interference | Uncontested opener rebid | Opener rebid after interference |
| --- | --- | --- | --- | --- |
| 1C / 1D | Done | Done: selected common interference | Done | Incomplete: selected competitive continuations |
| 1H / 1S | Done | Done: selected common interference | Done | Incomplete: selected competitive continuations |
| 1NT | Done | Partial (done): natural two-level suit interference | Done | Partial (done): selected Double, natural suit, and NT continuations |
| 2NT | Done | Omitted | Partial (done): selected continuations | Omitted |
| Strong 2C | Done | Omitted | Partial (done): selected continuations | Omitted |
| Weak 2D / 2H / 2S | Done | Omitted | Partial (done): selected continuations | Omitted |
| Three-level preempt | Partial (done): selected responses | Omitted | Partial (done): selected continuations | Omitted |
| Natural four-/five-level preempt | Partial (done): Pass only | Omitted | Omitted | Omitted |

After a positive suit or balanced 2NT response to the artificial strong 2C opening, opener
now has selected game-forcing natural descriptions: economical major support, conditional
minor support with unbalanced shape, a five-card own suit through the three level, and a
minimum-range balanced notrump rebid. A positive response already shows 8+ HCP, so game
is not automatically a signoff and slam may be in view. Very strong balanced hands and
awkward descriptive decisions reach explicit scope guidance; the responder's subsequent
rebid remains planned rather than being invented by these opener rules.

After natural two-level suit interference over a 1NT opening, responder's takeout-oriented
Double now receives an opener reply: the available four-card unbid suit or, without a fit,
a stopped natural 2NT/3NT description based on opener's range. Opener does not pass the
takeout Double. Responder's nonforcing natural two-level suit may be passed or raised with
suitable major support; a constructive three-level suit may lead to major game or 3NT
with a stopper. With no defensible fit or stopped NT action, explicit scope guidance
avoids inventing a game or penalty decision. These selected methods do not implement
Lebensohl, penalty-oriented Doubles, or later competitive auctions.

After a preemptive jump overcall of a one-level suit opening, selected opener rebids now
answer responder's forcing negative Double, new suit, and support cuebid with a
natural fit, economical descriptive suit, or stopped notrump. A minimum opener may
Pass a nonforcing raise or 2NT invitation; higher values can bid a supported major
game or accept the invitation. Natural game signoffs are normally passed. When a
forcing response cannot be answered reliably, the trainer provides auction-specific
scope guidance rather than invent a Pass. These cases assume the opposing advancer
Passes; later competition remains on the A9 review list.

Selected opener rebids after interference deliberately start where responder's meaning remains
clear.  After responder's simple raise, opener can continue through selected advancer raises,
preemptive raises, natural new suits, and responsive Doubles.  Natural forcing responder suits also
continue through selected natural advancer competition: a raise or preemptive raise of a suit
overcall, or an unbid natural advancer suit.  Minimum hands may have a real Pass; clear maximum
hands can still bid game.  When an uncontested natural rule is reused in competition, every suit
naturally introduced by the opponents is excluded from opener's natural second/help-suit
candidates, and a notrump rebid requires a stopper in each such suit.  Advancer bidding responder's
naturally shown suit is treated as an artificial/cuebid action rather than another natural new suit.

A natural two-level new-suit response after a suit overcall is handled as its own forcing-one-round
family rather than inheriting the partnership's uncontested 2/1 setting.  Responder has promised a
five-card-or-longer suit, so three-card opener support is sufficient.  If advancer competes
naturally, opener can still support below game, repeat a six-card opening suit below game, retain an
economical second suit or reverse whose original call remains available, or use the ordinary
balanced notrump range when that level remains available and the opponents' natural suits are
stopped.  A maximum with support can still bid game.  The analogous one-level forcing responses
keep their normal four-card support threshold.

Artificial support actions keep their competitive meanings.  After a support cuebid, a minimum
opener rebids the agreed suit at the three level, while a major opener with enough combined values
bids game.  Jordan 2NT after a takeout Double uses the same descriptive idea with its own point
floor rather than being mistaken for Jacoby 2NT.  Responder's natural 1NT, weak two-/three-level
new suits, and weak jump raise after a takeout Double are nonforcing; a clear minimum opener may
therefore Pass rather than manufacture a continuation.

After responder's negative Double, opener now treats the implied suit or suits as one coordinated
family rather than only looking for an unbid major.  With advancer Pass, minimum values show a
four-card implied fit economically, medium values jump one level, and maximum values place an
implied major in game; when both majors have already been named, the Double can instead imply the
minors, with a strong descriptive minor jump stopping short of assuming minor game.  Without an
implied-suit fit, opener can still repeat a six-card opening suit through the three level or use the
ordinary 12-14 1NT / 18-19 2NT description when that exact level remains and every naturally bid
opponent suit is stopped.

The same family continues through advancer actions that already have explicit advancing meanings:
ordinary/preemptive raises, a natural side suit or NT call, a strong support cuebid, or a strength-
showing Redouble.  A still-cheap implied-suit fit remains descriptive.  A minimum opener with no
selected descriptive route may Pass and leave responder another turn; an extra-value hand with no
deterministic continuation reaches specific scope-boundary guidance instead of having competition
promote a vanished three-level call into an automatic game.  After a strength-showing Redouble of
a takeout Double, opener may Pass when advancer Passes rather than manufacture a new descriptive
bid.  After natural two-level suit interference over our 1NT opening, the ordinary 2NT invitation
accept/decline and natural 3NT signoff continuations retain their meanings.

Natural responder notrump after a suit overcall now has selected opener continuations rather
than inheriting forcing-1NT or Jacoby meanings: minimum natural 1NT can be passed, a six-card
opening suit can still be described, balanced 18-19 can rebid 2NT, and the natural 2NT invitation
can be accepted or declined.  Natural 3NT is a signoff for ordinary values; stronger hands reach
slam-judgment guidance rather than an automatic quantitative action.  A selected game-forcing
three-level new suit can be raised to major-suit game or followed by 3NT with suitable shape and
stoppers; other continuations use specific scope guidance rather than silently ending.

Weak competitive jump raises also end explicitly: a minimum opener can Pass a three-level
preemptive raise, the shared weak 4M game raise remains a signoff, and extra-value three-level hands
reach judgment guidance rather than being mistaken for an uncontested limit raise.  Extra values
after a minor support cuebid likewise produce guidance because choosing among 3NT, further minor
bidding, and another descriptive action depends on stoppers and playing strength.

Responder Pass is not treated as an ordinary opener rebid.  After a suit overcall followed by
Pass-Pass, opener reaches explicit reopening/balancing guidance.  After a takeout Double followed by
Pass-Pass, the boundary instead explains the separate doubled-contract runout/stand judgment.  If
responder shows strength with Redouble and advancer makes the selected weak escape, opener reaches
penalty/runout guidance rather than inheriting the Pass that applies only when advancer also Passes.
After an opposing natural 1NT overcall, selected weak natural suit and preemptive-raise responses can
be passed by a minimum opener; extra-value hands and the Pass-Pass reopening case end with explicit
competitive guidance rather than an unrelated uncontested continuation.

These remain `Incomplete`, not broad scope omissions.  Within a modeled competitive family the
trainer may reach a hand-specific scope boundary when the auction is understood but the next choice
depends too heavily on judgment for one deterministic recommendation.  After a natural forcing
responder suit, the boundary guidance states the actual promise responder made -- for example,
5+ cards and 10+ HCP for the competitive two-level response -- before explaining why Pass versus
bidding on now depends on playing strength, fit, honor location, vulnerability, and how high the
opponents have pushed the auction.  The app explains that judgment boundary rather than inventing a
candidate call.  The largest selected opener-rebid families still to close are responder actions
after preemptive jump overcalls and the remaining natural-suit/negative-Double responses after
interference over our 1NT opening.

The omitted responder-interference areas above are deliberate scope boundaries, not claims that
every ordinary response becomes wrong whenever an opponent acts.

**After a 2NT opening**, some partnerships may keep familiar conventions available after a Double,
but Pass and Redouble acquire different meanings and suit interference quickly becomes
space-sensitive and agreement-dependent.  That creates a relatively large competitive branch for
an uncommon auction, so the trainer stops rather than teaching only a fragment of a 2NT
interference system.

**After a strong 2C opening**, some normal calls can remain sensible after a Double, including a
waiting response under common methods.  But the opening is already rare and artificial, competitive
meanings vary by partnership, and a separate interference system adds little practice value for the
amount of branching it introduces.  The trainer therefore keeps this family uncontested.

**After a weak-two opening**, several ordinary continuations can still make bridge sense after
interference, and this is the most plausible of these omitted families to reconsider later.  Still,
Pass into a doubled contract is no longer the same decision, suit overcalls create different
constraints from a Double, and a useful treatment would need more than simply reusing every
uncontested rule.  For now the trainer stops rather than presenting an incomplete competitive
system.

**After a three-level preempt**, the auction is already high enough that available space, fit,
playing strength, vulnerability, and judgment become important quickly.  The frequency and training
value do not justify another high-level competitive continuation tree, so responder interference is
intentionally omitted.

Responder's later rebid after opener has rebid is Planned.  The trainer deliberately goes
deeper in some deterministic auctions than in judgment-heavy or highly partnership-dependent ones.

### When the opponents open

| Opponent's opening | Our direct defense | Advancer after responder passes | Advancer after responder acts | Overcaller continuation |
| --- | --- | --- | --- | --- |
| 1C / 1D / 1H / 1S | Done | Done | Partial (done): selected common actions | Planned |
| Strong 1NT | Done: compact DONT | Done: basic DONT pass/correct | Omitted | Done: required compact DONT corrections |
| Weak 2D / 2H / 2S | Done | Partial (done): selected common continuations | Omitted | Incomplete: 2NT convention replies done; selected competitive rebids planned |
| Three-level preempt | Omitted | Omitted | Omitted | Omitted |
| Strong 2C / 2NT | Omitted | Omitted | Omitted | Omitted |

The direct weak-two defense uses natural suit overcalls, takeout Double, and natural 2NT.  Advancer
continuations after natural two-level overcalls and takeout Doubles reuse the ordinary advancing
treatments when responder passes.  After a natural 2NT overcall, the trainer uses its selected
Stayman/Jacoby/Texas methods and models the immediate conventional reply.  Continuations after
natural three-level overcalls and the full competitive fanout after responder also competes are
intentionally omitted.

### Advancer when responder acts after a one-level suit opening

| Partner's intervention | Responder passes | Responder raises opener | Responder bids a new suit / NT | Responder Doubles / Redoubles |
| --- | --- | --- | --- | --- |
| One-level natural suit overcall | Done | Partial (done): simple raises; weak jump-raise Pass/boundary | Partial (done): natural suits and selected NT | Done |
| Two-level natural suit overcall | Done | Partial (done): simple raises; weak jump-raise Pass/boundary | Partial (done): natural new suit and selected NT | Partial (done): where the negative Double treatment applies |
| Takeout Double | Done | Partial (done): simple raises; weak jump-raise Pass/boundary | Partial (done): natural suits/NT and weak jump-shift Pass | Done |
| Natural 1NT overcall | Done: normal 1NT systems | Partial (done): natural two-level suit interference | Partial (done): natural two-level suit interference | Omitted |
| Preemptive jump overcall | Done | Omitted | Omitted | Omitted |

The selected continuation set now includes direct natural 3NT after a one- or two-level suit
overcall, and natural NT advances after responder makes an ordinary raise, economical
new-suit bid, or natural 1NT, with stoppers in the opponents’ naturally named suits.
Advancer may Pass after a modeled responder weak jump raise or weak jump shift;
stronger hands after those jumps receive auction-specific competitive-judgment guidance.
More specialized Doubles and cuebid agreements remain outside scope.

This table intentionally stops short of treating matrix completeness as a goal.  Once the auction becomes
high-level, heavily judgment-dependent, or convention-dependent, the trainer may stop rather than invent a
mechanical recommendation.

## Stoppers and notrump judgment

Outside-suit weakness can be important when deciding whether notrump is attractive.

A useful conservative definition of a stopper is:

- An ace
- A king with at least one additional card
- A queen with at least two additional cards

Holdings such as `Qx` or `Jxx`, or holdings whose effectiveness depends on which hand becomes declarer and who leads the suit, may be adequate to count as a stopper, but it is an experienced judgment call.

The trainer does not automatically require a stopper in every outside suit for every uncontested natural notrump bid.  Stopper requirements are used only where the particular bidding treatment calls for them.

## Treatments intentionally omitted or deferred

The trainer intentionally does not try to implement every named convention or every possible continuation.
This list records some of the choices we have discussed so that an unfamiliar name does not look like an
accidental omission.

| Treatment or feature | Current decision | What it means |
| --- | --- | --- |
| Inverted minors | Omitted | A partnership agreement that reverses the usual strength meanings of minor-suit raises and creates additional follow-up auctions. |
| Stopper-showing continuations after a minor raise | Omitted with inverted minors | Side-suit bids can be used to show stoppers while exploring 3NT; this creates more partnership-specific continuation rules. |
| Michaels cuebid | Omitted | A conventional cuebid of opener's suit that shows a two-suited hand rather than a natural suit. |
| Unusual 2NT | Omitted | A conventional jump to 2NT that normally shows the two lowest unbid suits. |
| Lebensohl after a weak-two takeout Double | Omitted | Uses an artificial 2NT relay to separate weak escape hands from stronger constructive hands after partner Doubles a weak two. |
| Cappelletti over 1NT | Omitted | A common defense to 1NT with a penalty-oriented Double and conventional two-suited calls; this trainer uses compact DONT instead. |
| DONT defense to strong 1NT | Partial (done) | DONT (Disturb Opponents' NoTrump) uses Double for a one-suited hand and two-level suit bids to show one- or two-suited hands.  The trainer models the core meanings and basic pass/correct auction, but omits game-inquiry 2NT, the stronger Double-then-2S distinction, and continuations after responder competes. |
| Snapdragon / fourth-suit competitive Double | Omitted | A specialized Double after opener, overcaller, and responder have shown three different suits, usually suggesting the fourth suit plus tolerance for partner. |
| Responsive Doubles in every competitive auction | Partial (done) | Responsive Double is modeled in the common responder-raise situations we chose, but it is not given a universal meaning in every later competitive auction. |
| General penalty Double / Redouble system | Omitted | The app models specific functional Doubles and Redoubles such as takeout, negative, responsive, and strength-showing actions, but does not decide when to defend a contract for penalties. |
| Defense to opposing three-level preempts | Omitted | Beginners can practice the same underlying ideas through weak-two defenses without creating another high-level, judgment-heavy continuation tree. |
| Defense to opposing strong 2C or 2NT | Omitted | These uncommon defensive auctions are outside the current training scope. |
| Competitive continuations after our preemptive jump overcall | Omitted | Once responder also competes, vulnerability, fit, and playing-strength judgment become more important than the deterministic rules this trainer emphasizes. |
| Natural four- and five-level preemptive openings | Partial (done) | The opening bids are modeled as examples; responder has an explicit Pass, but further high-level bidding and continuations are omitted. |
| Direct 4NT opening as Blackwood | Omitted | The rare artificial forcing opening is not executable; other meanings of 4NT in ordinary auctions are unchanged. |
| Detailed slam mechanisms | Partial (done) | Gerber replies, forcing 5NT, direct 7NT, many suit-auction Blackwood replies, and similar rare continuations are not full practice families. |
| Responder's later rebid | Planned | After opener rebids, many of responder's next decisions are still outside the modeled auction depth. |
| Balancing-seat defensive bidding | Planned | This is the fourth-seat situation where opener is followed by two Passes and the next player may compete more lightly because another Pass would end the auction. |
| Full opponent autobidder | Planned | All four seats can be bid manually.  We plan to analyze whether a trustworthy autobidder is feasible; a simplistic one that becomes unreliable in judgment-heavy or intentionally unsupported auctions would be worse than having none. |
| Scoring and card play | Omitted | The project is a bidding trainer rather than a duplicate-scoring or card-play engine. |

These statuses describe the trainer's intended scope as it stands now.  Manual practice and user feedback
may still justify revisiting an Omitted treatment if it proves common, deterministic, and valuable enough to add.

## Rule-practice deals

The app includes specifically constructed deals for practicing bidding rules and important boundary cases.

The practice corpus is selective rather than exhaustive.  Its purpose is to exercise meaningful bidding decisions and partnership-agreement differences, not to generate every possible permutation of every rule.

## Feedback

If you encounter a hand where the suggested bids seem wrong, incomplete, or poorly explained, you can send feedback.  The Dump button puts the deal, the auction, and explanations on the clipboard for sending with your feedback.

