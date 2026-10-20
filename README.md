# Bridge Bidding Trainer

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

Start a new deal or select a prepared practice exercise.  Enter every call for every seat,
including Passes.  Although the
app displays the hands, make each decision using only the current player's cards, the
auction, and the selected partnership agreements.  Be careful to use only what you know from the 
bidding and don't enhance bids based on seeing other hands.  This gives you more practice with 
feedback than making one or two bids per deal.

The explanation area shows why bids qualify under the supported bidding rules and, where appropriate, which alternatives have higher priority.  Bridge does not always have one absolutely correct bid, so the app shows all that apply.

Use the rule-practice deal selector to focus on a particular bidding situation instead of
receiving a random deal.  These deals illustrate specific rules, nearby strength boundaries (or a ladder of bids based on partner's bid and points or structure of your hand), and differences between partnership agreements.

In a selected practice deal, if you enter a different bid, the explanation still evaluates your
choice, but the recorded bid is used to keep the remaining lesson on track.  The recorded bid
is not necessarily the only reasonable choice. Each exercise stops at its intended final call,
which need not be the end of the bridge auction.

The app is a practice companion: make a bidding decision first, then compare it with the
supported candidates and explanations.  It does not claim to know the best bid in every auction.

## Bidding-system settings

Partnership agreements can be changed in the app's settings.  You can turn on common conventions, for example, Stayman and Jacoby Transfers, as you learn about them.  Changing an agreement can change
both the bids recommended for a hand and which rule-practice deals are available.  For example,
turning off 2/1 agreements may leave some practice groups with zero pre-formed deals.

## What the app is and isn't

Bridge bidding combines rules, partnership agreements, inference, and judgment.  Suit quality,
borderline strength, distribution, vulnerability, and partnership style can all affect the best
call.  The app concentrates on common situations that can be taught consistently as rules,
but it does not attempt to be a complete expert bridge bidding app for teaching.

Where judgment matters more than an absolute rule, the app may provide guidance or show
multiple reasonable calls, without declaring one uniquely correct.  For example, it includes
some slam-related decisions without teaching a complete slam-investigation system.  After some 
very strong openings, competitive auctions, or artificial bids, the app explains the limits
of its bidding feedback and suggests aspects of judgment to consider rather than enable practice for
which the app can't reliably give feedback.

## Bidding coverage

The tables describe the bidding treatments the app teaches. `Done` means the selected
treatment is supported; `Partial (done)` means a deliberately limited but useful subset is
supported; and `Omitted` means that auction family is outside the chosen support this app provides.

For awkward natural rebids, the app sometimes teaches a constrained fallback (a two-card
`2C` after forcing `1NT` to a major, or a five-card minor repeat after a forcing one-level
new-suit response). Very strong long-minor hands without a reliable normal rebid instead receive
judgment guidance; point limits on invitational bids are not automatically relaxed. A balanced
11-HCP hand does not qualify for an opening of a convenient minor on length points alone.

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
| Strong 1NT | Partial (done): core DONT defense | Done: basic responses to DONT | Omitted | Done: basic DONT pass-or-correct follow-ups |
| Weak 2D / 2H / 2S | Done | Partial (done): selected common continuations | Omitted | Partial (done): selected natural suit, 2NT, and takeout-Double continuations |
| Three-level preempt | Omitted | Omitted | Omitted | Omitted |
| Strong 2C / 2NT | Omitted | Omitted | Omitted | Omitted |

Natural 1NT overcalls show 15–18 HCP, while advancer uses the same conventions and strength
requirements as responses to a 1NT opening, according to the configured 15–17 or 16–18 setting.
This avoids creating a separate set of overcaller–advancer bidding rules for a small strength
difference that adds little practice value.

Against a strong 1NT opening, the app teaches the basic compact DONT interference but stops before
later competitive continuations.  Double shows a good six-card-or-longer club, diamond, or heart suit;
2C shows clubs and a higher suit, 2D shows diamonds and a major, 2H shows both majors,
and 2S naturally shows a long spade suit.  Advancer's basic relay and pass-or-correct
responses are supported.

**The app omits these three optional DONT extensions:**

- **A 2NT game inquiry:** going beyond finding a playable suit to investigate game adds
  extra partnership-specific responses and judgments.
- **A stronger spade hand shown by Double followed by 2S:** some full DONT methods use
  this delayed route to distinguish strong spades from a direct 2S.  Our compact version
  uses direct 2S for the one-suited spade hand without that extra strength distinction.
- **Continuations after the 1NT responder competes:** once responder bids or
  Doubles, simple pass-or-correct sequences may no longer apply, and further calls
  require additional competitive agreements.

We deliberately omitted these more elaborate and judgment-heavy continuations
so the chosen DONT treatment remains compact and teachable.  These omissions do
not change the meanings of the supported DONT calls.  In an unmodeled continuation,
the app gives guidance rather than inventing a conventional call or
treating an unsupported Pass as necessarily wrong.

Weak-two defenses include
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

**Advancer's Responsive Double:** Consider `1D – (1S) – 2D – Double`.  Partner overcalled
spades, and the opponents bid and raise diamonds.  Advancer's Double says: "I have useful points and
both unbid suits; partner, please choose an unbid suit."  In the app's selected treatment, this Double requires at least four hearts
and four clubs, at least 7 points with any length points, fewer than three spades of support, and no
five-card suit that would be clearer to bid naturally.  This meaning applies to the
specific responder-raise situations the app models; **not every competitive
Double is responsive**. 

## Stoppers and notrump judgment

Outside-suit weakness can be important when deciding whether notrump is attractive.

A useful conservative definition of a stopper is:

- An ace
- A king with at least one additional card
- A queen with at least two additional cards

Holdings such as `Qx` or `Jxx`, or holdings whose effectiveness depends on which hand becomes declarer and who leads the suit, may be adequate to count as a stopper, but it is an experienced judgment call.

The app does not automatically require a stopper in every outside suit for every uncontested natural notrump bid.  Stopper requirements are used only where the particular bidding treatment calls for them.

## Rule-practice deals

The app includes specifically constructed deals for practicing bidding rules and important boundary cases.

The practice corpus is selective rather than exhaustive.  Its purpose is to exercise meaningful bidding decisions and partnership-agreement differences, not to generate every possible permutation of every rule.

## Feedback

For New Deal, North always deals first.  The **Give North an opening hand** checkbox
is enabled by default; turn it off for a completely random deal with North still the dealer.
The **Show hands** selector normally reveals only the hand currently bidding; choose
**All hands always** to examine the complete deal.

The explanation pane keeps the latest feedback in view and indicates when earlier text
is above the visible area. **Show telemetry** reveals a limited recent diagnostic log
only when requested. If a suggested bid seems wrong, incomplete, or poorly explained,
click **Report** to copy the current deal, bidding agreements, auction, explanations
(including rule IDs), and available telemetry to the clipboard for feedback.

