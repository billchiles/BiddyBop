# Bidding Coverage Roadmap

This roadmap records the selected scope and remaining work for the Bridge Bidding Trainer.
Use the current executable rules, practice deals, and README as the authority on what is
already implemented. Do not infer completion merely from a planned item in this document.

## Selection and priority

Include bidding material when it is common enough to be useful practice, rule-based enough
to teach reliably, and worth the resulting rules and continuation complexity. Do not aim to
fill a matrix of all possible auctions. An analysis item may be completed by deliberately
omitting a treatment and documenting the reason.

- **P1:** Must analyze and resolve before finishing; resolution need not mean implementing.
- **P2:** Should do; evaluate the impact of shipping without it.
- **P3:** Optional; acceptable to ship without it.

All items below are P1 unless marked P3. Phase letters describe work sequence, not priority.

**Selected depth:** Generally model opening -> response -> opener rebid -> responder rebid,
or overcall/Double -> advance -> overcaller/Doubler rebid. Model additional convention
replies only when needed to finish a treatment already taught. Deliberately stop rather
than extending into indefinitely many partnership turns. Distinguish the end of the
chosen training depth from an unmodeled mandatory call within that depth; the latter
needs an executable choice or specific scope guidance.

**Explicit omissions and limits:**

- Do not implement special lighter third-seat openings or fourth-seat Rule-of-15/pass-out
  requirements. Ordinary openings remain eligible after preceding Passes. Explain the
  position-specific treatments as outside the trainer's scope.
- Retain natural four-/five-level preemptive openings as examples; generally respond
  with an explicit Pass rather than building a high-level continuation system.
- Remove the rare direct artificial 4NT Blackwood *opening* from executable rules unless
  it can be represented as guidance only. Do not confuse it with quantitative or other
  4NT calls in ordinary auctions.
- Keep more speculative penalty-oriented, high-level, and judgment-heavy continuations
  deliberately limited; the omitted topics should be explained in README.
- Ordinary opening practice deals should normally put opener in North. Competitive
  teaching situations may have a justified different dealer/seat arrangement.

## A. Close existing advancing, responding, and opener-rebidding gaps

- [ ] **A1.** Ordinary advancer Pass after partner's natural non-jump one-/two-level
  suit overcall when responder passes; make it a limited-strength fallback without a
  qualifying raise, natural side suit, or notrump action. Add focused practice cases.
- [ ] **A2.** Audit nearby advancing actions: alternative Doubles after responder's
  natural suit/NT, cuebids when responder introduces a second suit, suitable NT
  continuations (including direct natural 3NT after a one-level suit overcall), and
  selected natural new suits. Add only useful, clearly agreed meanings.
- [ ] **A3.** Systematically compare instructional meanings with executable advancer
  calls after responder raises, bids a new suit or NT, makes a negative Double, or
  Redoubles. Decide which gaps should become rules and which should be boundaries.
- [ ] **A4.** Give responder an explicit Pass after an uncontested natural four-/five-
  level preempt; do not apply this to artificial 4NT.
- [ ] **A5.** Remove the executable direct 4NT Blackwood opening; consider a guidance-
  only mention if useful. Keep other, context-dependent meanings of 4NT intact.
- [ ] **A6.** Complete useful strong 2C opener descriptions after a positive suit or
  positive balanced 2NT response, adding explicit boundaries where needed.
- [ ] **A7.** After opponents interfere over our 1NT opening, address opener's reply
  to responder's takeout-oriented Double and selected natural responses that require
  continuation; avoid pretending nonforcing signoffs are forcing.
- [ ] **A8.** Selected opener continuations after responder acts over a preemptive jump
  overcall; decide on descriptive rebids, actual Passes, and auction-specific boundaries.
- [ ] **A9.** Audit remaining competitive opener rebids after natural forcing responder
  suits and negative Doubles, including cases where advancer competes. Finish specific
  missing obligations without rebuilding already satisfactory families.
- [ ] **A10.** After an opponent's natural 1NT overcall of our suit opening, verify
  responder's selected meanings and opener's subsequent Passes, stronger continuations,
  and judgment boundaries.

## B. Complete selected overcaller and takeout-Doubler rebids

- [ ] **B1.** Natural 1NT overcall -> answer advancer's Stayman inquiry.
- [ ] **B2.** Natural 1NT overcall -> complete Jacoby and Texas transfers when enabled.
- [ ] **B3.** Natural 1NT overcall -> decide invitations, signoffs, and natural NT rebids.
- [ ] **B4.** Natural suit overcall -> respond to advancer's ordinary raise with an
  appropriate Pass, competitive raise, or selected game.
- [ ] **B5.** Natural suit overcall -> respond to advancer's forcing support cuebid.
- [ ] **B6.** Natural suit overcall -> selected descriptions after advancer's
  constructive new suit, respecting forcing versus nonforcing meanings.
- [ ] **B7.** Natural suit overcall -> evaluate responses to advancer's natural NT.
- [ ] **B8.** Selected overcaller continuation when the opponents' responder also
  acts, without opening an unrestricted competitive bidding tree.
- [ ] **B9.** Ordinary takeout Double -> selected continuations after forced advances.
- [ ] **B10.** Strong takeout Double -> modeled Double-then-suit or Double-then-NT
  descriptions, with relevant strength distinctions and deliberate boundaries.
- [ ] **B11.** Review remaining useful weak-two defense continuations. Preserve
  existing compact DONT corrections and natural 2NT-over-weak-two convention replies.

## C. Complete responder's rebid

- [ ] **C1.** After opener's natural suit/NT rebid, select common signoffs,
  invitations, preferences, raises, repetitions, and other worthwhile continuations.
- [ ] **C2.** Complete the next response in artificial or forcing auctions already
  taught; handle chosen competitive responder rebids as appropriate.
- [ ] **C3.** Where the next decision at this depth cannot reliably be modeled,
  provide an auction-specific scope boundary instead of a silent no-rule ending.

## D. Opening position and balancing

- [ ] **D1.** Document special third-seat lighter opening treatments as omitted;
  do not add an executable 11-HCP third-seat system.
- [ ] **D2.** Document fourth-seat Rule-of-15/pass-out considerations as omitted;
  do not add special fourth-seat eligibility rules.
- [ ] **D3.** Analyze balancing/reopening overcalls, reopening Doubles, and NT, plus
  necessary partner replies. Implement only the useful, deterministic subset.
- [ ] **D4.** Reconcile that decision with already-present Pass-Pass reopening
  guidance in the competitive opener-rebid stage.

## E. Complete system-wide checks, practice, and documentation

- [ ] **E1.** Audit ordinary Passes across every modeled role. Do not insert Pass
  automatically merely because other rules returned no candidates.
- [ ] **E2.** Audit `scopeBoundary` coverage and the auction-specific guidance it gives.
- [ ] **E3.** Check stage recognition, auction shapes, interference classification,
  and preventing rules from surviving where their meanings no longer apply.
- [ ] **E4.** Check asymmetric promises: every modeled forcing/artificial call either
  receives its required partner answer or a deliberate boundary.
- [ ] **E5.** Preserve rejection provenance in the existing evaluator/refiner path
  to explain why an otherwise plausible candidate was excluded.
- [ ] **E6.** Add selective high-value practice deals for Pass, strong openings,
  overcaller/Doubler descriptions, and responder rebids. Prefer useful instructional
  contrasts and continuations over exhaustive regression matrices.
- [ ] **E7.** Audit dealer/seat orientation; keep ordinary opener-deal North
  orientation and retain exceptions only when they teach a specific competitive role.
- [ ] **E8.** Reconcile README's Done / Partial (done) / Incomplete / Planned /
  Omitted statuses with executable code; describe scope, four-/five-level examples,
  position-specific omissions, and other deliberate limits accurately.
- [ ] **E9.** Final comprehensive code, naming, comments, source organization,
  unnecessary-wrapper, human-readability, and practice/test-structure review.

## F. Optional (P3)

- [ ] **F1.** Evaluate an autobidder only after executable coverage and stopping
  boundaries are stable. It is acceptable to ship without one.
- [ ] **F2.** Explore user-facing explanations for completely unsupported manual
  calls. Do not require an unreliable explanation engine to ship. This is distinct
  from E5's explanation of why modeled candidate rules were rejected.
