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

## Stoppers and notrump judgment

Outside-suit weakness can be important when deciding whether notrump is attractive.

A useful conservative definition of a stopper is:

- An ace
- A king with at least one additional card
- A queen with at least two additional cards

Holdings such as `Qx` or `Jxx`, or holdings whose effectiveness depends on which hand becomes declarer and who leads the suit, may be adequate to count as a stopper, but it is an experienced judgment call.

The trainer does not automatically require a stopper in every outside suit for every uncontested natural notrump bid.  Stopper requirements are used only where the particular bidding treatment calls for them.

## Treatments intentionally not modeled

Not every commonly played convention or follow-up treatment is included.

For example, the trainer's natural minor-suit response structure does not currently use inverted minors. Inverted minors are a common partnership agreement among more experienced players, but they change both the meanings of the minor raises and the subsequent auction. Stopper-showing side-suit continuations associated with that treatment are therefore not part of the modeled rules.

Other advanced, highly partnership-dependent, or judgment-heavy sequences may also be represented only partially or not at all.

This is intended to make the boundaries of the trainer clear rather than imply that every bridge decision can be reduced to a deterministic rule.  Situations the app does not model can also be useful prompts for further study with bidding books, teachers, partners, or other bridge references.

## Rule-practice deals

The app includes specifically constructed deals for practicing bidding rules and important boundary cases.

The practice corpus is selective rather than exhaustive.  Its purpose is to exercise meaningful bidding decisions and partnership-agreement differences, not to generate every possible permutation of every rule.

## Feedback

If you encounter a hand where the suggested bids seem wrong, incomplete, or poorly explained, you can send feedback.  The Dump button puts the deal, the auction, and explanations on the clipboard for sending with your feedback.

