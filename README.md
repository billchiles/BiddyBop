# Bridge Bidding Practice App

BiddyBop is a contract bridge bidding practice app.  You can practice with random deals or prepared
practice deals/auctions, choose calls for all four seats, and learn why particular bids do or
do not fit the hand, auction, and partnership agreements.  The app teaches common decisions it can
explain reliably, and it explains when the bidding context requires too much judgment and experience to choose a next bid.  See the Feedback section at the end for how to send mail with a report from the app and what seems insufficient or wrong to you.

BiddyBop blends SAYC-based treatments with selected modern treatments (such
as splinters and invitational 2NT responses to minor openings) and a few teaching
simplifications.  It is neither strict SAYC nor a complete 2/1 system.  The approach draws
on the ACBL SAYC booklet and teaching materials by Larry Cohen, Audrey Grant, and Karen
Walker, without reproducing any one complete system.

![BiddyBop application screenshot](src/assets/biddybop-screenshot-beta.png)

## Try It

Run the web version directly in your browser:

[Open Bridge Bidding Trainer](YOUR_GITHUB_PAGES_URL)

No installation is required for the web version.

## Using BiddyBop

Choose **New Deal** for a generated deal or select a practice topic and click **Test Deal**
for a prepared exercise.  Enter each call, including Pass, for all four seats; this gives you more practice with feedback than making one or two bids per deal.  Decide each bid using
only the current bidder's hand, the auction, and the selected agreements—even when you
can see other hands.  Read the explanations to see which calls fit, why they qualify, and
which alternatives the app recognizes or prefers.  Multiple bids may be reasonable.

North deals first in **New Deal**.  The **North Opens** checkbox is on by default, randomly dealing until 
North qualifies for an opening; turn it off for first random deal.
The **Show hands** selector defaults to **Bidding hand only**; select **All hands always**
when you want to inspect the entire deal.

A **Test Deal** follows a recorded teaching auction.  If you choose a call that is not preset for the practice auction, the app
explains your choice but uses the preset call to continue the lesson.  The preset call
is not necessarily the only reasonable choice.  A lesson ends at its intended last call,
which may be well before the end of a complete bridge auction.

BiddyBop is a practice companion: make a bidding decision first, then compare your bid with the supported candidates and explanations.  The app does not claim to know the best bid in every hand/auction situation.

## Bidding System Agreements (Conventions and Treatments)

The default system uses five-card majors, convenient minors, 15–17 HCP for a 1NT
opening, and Standard new-suit responses.  Against an opposing strong 1NT, the default
defense is natural two-level suit overcalls; **DONT (Disturb Opponents’ No Trump)** is
optional.  Some agreements are fixed teaching choices, while others can be changed in
**Bidding System**.  The same selected agreements apply to all four seats.

### Built-in Bidding Agreements and Teaching Assumptions

- **One-level openings:** Five-card majors and convenient minors.  With both minors, open
  the longer; with equal four-card minors open 1D, and with equal three-card minors
  open 1C.  Ordinary openings generally require at least 12 total points with length,
  subject to additional HCP, shape, and Guideline of 20 qualifications.
- **Strong openings:** Artificial strong 2C requires 22+ HCP without a playing-trick
  exception.  Natural 2NT shows 20–21 HCP with appropriate shape.
- **Preempts:** Weak 2D/2H/2S require exactly six cards and 5–11 HCP; three-level
  preempts require seven cards and at most 11 total points with length.  These are
  teaching cutoffs rather than universal bridge requirements.
- **Responses to one-level openings:** Ordinary responses generally start at six
  points using the appropriate valuation.  Natural new suits generally need at least
  four cards and force one round.  Standard two-level new-suit responses usually
  require 11+ points.  Minor-opening responses favor four-card majors and allow
  natural invitational 2NT and game-going 3NT responses rather than inverted minors.
- **Hand valuation:** HCP may be supplemented by length points for ordinary bidding
  or shortage points when supporting partner's suit.
- **Competitive treatments:** Jordan 2NT after a takeout Double of partner's
  one-level opening and a strength-showing Redouble are built-in treatments.
- **Slam-related calls:** Selected Gerber, Blackwood, and quantitative 4NT meanings
  are taught, but not a complete slam system or all ace-asking responses.

These are summaries.  The tables below outline where BiddyBop provides guidance.

### Configurable partnership agreements

| Setting | Available choices | Default |
| --- | --- | --- |
| 1NT opening range | 15–17 or 16–18 HCP | 15–17 |
| Five-card-major 1NT upgrade | On or off (upgrade a qualifying balanced hand one HCP below the normal range) | Off |
| Jump shifts after a one-level suit opening | Strong or weak | Strong |
| Two-level new-suit responses | Standard or 2/1 game forcing | Standard |
| 1NT response to partner's major | Forcing or non-forcing | Non-forcing |
| Major game force with support | New suit then raise or Jacoby 2NT | New suit then raise |
| Stayman | On or off | On |
| Jacoby transfers | On or off | On |
| Splinters | On or off | On |
| Texas transfers | On or off | On |
| DONT overcall defense over strong 1NT opening | On (compact DONT) or off (natural 2-level suit overcalls) | Off |

Changing an agreement affects both bid guidance and available practice exercises.
Some practice topics have no compatible deals with particular settings configurations.  

## What the app is and isn't

Bidding depends on agreements and judgment as well as rules.  BiddyBop covers a
selected range of openings, responses, rebids, overcalls, advances, and competitive
actions.  It explains qualifying bids and some plausible alternatives, but does not
model vulnerability or scoring, cover every competitive continuation, or teach a
complete slam system.

When a decision goes beyond its selected rules, the app may provide guidance about
what to consider instead of recommending a specific call.  **If no bid qualifies,
that does not mean you should Pass.** An unmodeled bid is not necessarily wrong.

## Bidding coverage

The following tables provide a more detailed view.  **Supported** means BiddyBop supports the selected
treatment, **selected ...** means BiddyBop supports a reliable, deliberate subset,
and **Omitted** means it is outside BiddyBop's supported scope due to too much nuance, judgment, or inability to provide reliable feedback.  A done treatment does not claim to cover every possible bridge judgment.

### When our partnership opens

| Our opening | Ordinary response | Response after interference | Uncontested opener rebid | Opener rebid after interference |
| --- | --- | --- | --- | --- |
| 1C / 1D | Supported | selected common interference | Supported | selected competitive continuations |
| 1H / 1S | Supported | selected common interference | Supported | selected competitive continuations |
| 1NT | Supported | selected natural two-level suit interference | Supported | selected Double, natural suit, and NT continuations |
| 2NT | Supported | Omitted | selected continuations | Omitted |
| Strong 2C | Supported | Omitted | selected continuations | Omitted |
| Weak 2D / 2H / 2S | Supported | Omitted | selected continuations | Omitted |
| Three-level preempt | selected responses | Omitted | selected continuations | Omitted |
| Natural four-/five-level preempt | Pass only | Omitted | Omitted | Omitted |

Competition after our 2NT, strong 2C, weak-two, and three-level preempt openings is
intentionally limited.  Many such continuations require specialized partnership
agreements or higher-level judgment; the app avoids recommending a bid it cannot
reliably justify.  Selected responder rebids and slam-related actions have similar
boundaries.

- **After a 2NT opening**, some partnerships may keep familiar conventions available after a Double,
but Pass and Redouble acquire different meanings and suit interference quickly becomes
space-sensitive and agreement-dependent.  That creates a relatively large competitive branch for
an uncommon auction, so the app stops rather than teaching only a fragment of a 2NT
interference system.

- **After a strong 2C opening**, some normal calls can remain sensible after a Double, including a
waiting response under common methods.  But the opening is already rare and artificial, competitive
meanings vary by partnership, and a separate interference system adds little practice value for the
amount of branching it introduces.  The app therefore keeps this family uncontested.

- **After a weak-two opening**, several ordinary continuations can still make bridge sense after
interference, and this is the most plausible of these omitted families to reconsider later.  Still,
Pass into a doubled contract is no longer the same decision, suit overcalls create different
constraints from a Double, and a useful treatment would need more than simply reusing every
uncontested rule.  For now the app stops rather than presenting an incomplete competitive
system.

- **After a three-level preempt**, the auction is already high enough that available space, fit,
playing strength, vulnerability, and judgment become important quickly.  The frequency and training
value do not justify another high-level competitive continuation tree, so responder interference is
intentionally omitted.


### When the opponents open

| Opponent's opening | Our direct defense | Advancer after responder passes | Advancer after responder acts | Overcaller continuation |
| --- | --- | --- | --- | --- |
| 1C / 1D / 1H / 1S | Supported | Supported | selected common actions | selected natural suit, 1NT, and takeout-Doubler rebids |
| Strong 1NT | Natural 2-level suits (default) or compact DONT | Selected natural advances or DONT pass-or-correct | Selected advances after negative Double/natural response (DONT off) | Selected nonforcing rebids; further competition bounded |
| Weak 2D / 2H / 2S | Supported | selected common continuations | Omitted | selected natural suit, 2NT, and takeout-Double continuations |
| Three-level preempt | Omitted | Omitted | Omitted | Omitted |
| Strong 2C / 2NT | Omitted | Omitted | Omitted | Omitted |

Against an opposing strong 1NT, **natural defense is the default**: 2C, 2D, 2H,
and 2S show sound six-card-or-longer suits with at least 7 HCP.  Selected Passes,
competitive raises, independent new-suit advances, and later continuations are
supported.  The opening 1NT partnership also has selected natural responses, negative
Doubles, and opener rebids.

With **DONT enabled**, Double shows a long club, diamond, or heart suit; 2C
shows clubs and a higher suit, 2D diamonds and a major, 2H both majors, and 2S
a long spade suit.  Basic relays and pass-or-correct actions are supported.  The
compact treatment omits a 2NT game inquiry, a delayed strong-spade distinction,
and general DONT pass-or-correct continuations after the 1NT responder competes.

Other modeled defenses include selected actions against one-level suit openings
and weak-two openings.  High-level competition, specialized Doubles, and further
forcing continuations may reach judgment boundaries instead of automatic bids.

### Advancer when responder acts after a one-level suit opening

| Partner's intervention | Responder passes | Responder raises opener | Responder bids a new suit / NT | Responder Doubles / Redoubles |
| --- | --- | --- | --- | --- |
| One-level natural suit overcall | Supported | selected actions after simple raises; Pass or guidance after weak jump raises | selected natural suits and selected NT | Supported |
| Two-level natural suit overcall | Supported | selected actions after simple raises; Pass or guidance after weak jump raises | selected natural new suit and selected NT | selected where the negative Double treatment applies |
| Takeout Double | Supported | selected actions after simple raises; Pass or guidance after weak jump raises | selected natural suits/NT; Pass after weak jump shifts | Supported |
| Natural 1NT overcall | selected normal 1NT systems | selected natural two-level suit interference | selected natural two-level suit interference | Omitted |
| Preemptive jump overcall | Supported | Omitted | Omitted | Omitted |

This table shows BiddyBop's selected advances (after advancer's partner overcalled opener).  The app
cannot teach every possible competitive auction.  Specialized Doubles and cuebids, broader
continuations after preemptive jump overcalls, and high-level competition depend too heavily on
partnership agreements, fit, vulnerability, and playing strength for reliable rule-based advice.
Where useful, the app provides auction-specific general guidance on how bidding might procede,
rather than presenting an authoritative treatment.

## Rule-practice deals

Prepared deals focus on particular rules, nearby strength boundaries, and contrasting
partnership agreements.  They use complete four-hand deals, with North as dealer.
The collection is selective rather than an exhaustive list of bidding permutations.

## Feedback

The explanation pane keeps the current deal's recent bidding feedback and scrolls to
the latest reviewed call.  Click **Report** to copy the deal, four hands, selected
agreements, auction, and explanation transcript (including rule IDs) to the clipboard.  You can email bill_chiles@hotmail.com, tell me what seems insufficient or wrong about the bidding feedback, and paste the report you copied to the clipboard.
**Command-click Report** to include recent diagnostic telemetry as well.
