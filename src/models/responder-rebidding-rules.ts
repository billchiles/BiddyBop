/// Responder's selected natural second decisions.
import type { BidRule } from './bidding-types';
import { refineResponderOriginalOneLevelSuit, responderMinimumRepeatedSuitPassApplies,
         responderRepeatedSuitThreeNtApplies, responderSevenSpadeGameApplies,
         getResponderEconomicalSecondSuit, refineResponderEconomicalSuit,
         responderEconomicalDecisionApplies, getResponderStrongSecondSuit,
         responderStrongSecondSuitGameApplies } from './responder-rebidding-functions';

export const ResponderRebidRules: BidRule[] = [
  //// After opener rebids a natural minimum 1NT
  // These cases follow an ordinary one-level major response to a one-level suit opening.
  // Opener has shown 12-14 balanced HCP and no normal four-card raise of the major.
  // The ordinary strength ladder is 6-10 to stop, 11-12 to invite, and 13-16 for game.
  {
    id: 'responder-rebid-pass-after-minimum-1nt',
    kind: 'responderRebid',
    title: 'Pass a minimum balanced 1NT rebid without invitation values',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0, strain: 'major' },
                      openerRebidCall: '1NT' },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 6, max: 10 }, suitLengths: [{ suit: 'H', max: 5 },
                   { suit: 'S', max: 5 }, { suit: 'C', max: 5 }, { suit: 'D', max: 5 }] },
    meaning: 'Content to play 1NT opposite a balanced 12-14 HCP opener.',
    guidance: ['With six cards in the major you responded, consider playing in that suit instead.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-two-major-after-minimum-1nt',
    kind: 'responderRebid',
    title: 'Repeat a six-card major cheaply with weak values',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0, strain: 'major' },
                      openerRebidCall: '1NT' },
    calls: ['2H', '2S'],
    callRefinement: refineResponderOriginalOneLevelSuit,
    callCategory: ['natural', 'signoff'],
    appliesWhen: { hcp: { min: 6, max: 10 }, suitLengths: [{ min: 6 }] },
    meaning: 'A nonforcing preference for the six-card major already shown.',
    guidance: ['Opener usually passes this signoff; it is not a new-suit force.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-2nt-after-minimum-1nt',
    kind: 'responderRebid',
    title: 'Invite 3NT with a balanced 11-12 HCP response',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0, strain: 'major' },
                      openerRebidCall: '1NT' },
    calls: ['2NT'],
    callCategory: ['natural', 'invitational'],
    appliesWhen: { hcp: { min: 11, max: 12 }, shape: { balanced: true } },
    meaning: "Invite game opposite opener's 12-14 balanced rebid.",
    guidance: ['Opener judges whether the upper end of the shown range warrants 3NT.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-three-major-after-minimum-1nt',
    kind: 'responderRebid',
    title: 'Invite major-suit game with six cards and constructive values',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0, strain: 'major' },
                      openerRebidCall: '1NT' },
    calls: ['3H', '3S'],
    callRefinement: refineResponderOriginalOneLevelSuit,
    callCategory: ['natural', 'invitational'],
    appliesWhen: { hcp: { min: 11, max: 12 }, suitLengths: [{ min: 6 }] },
    meaning: "Invite game in responder's six-card major without forcing game.",
    guidance: ['Opener can pass or accept the invitation with sufficient strength and fit.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-3nt-after-minimum-1nt',
    kind: 'responderRebid',
    title: 'Bid 3NT with balanced game values opposite a 12-14 rebid',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0, strain: 'major' },
                      openerRebidCall: '1NT' },
    calls: ['3NT'],
    callCategory: ['natural', 'signoff'],
    appliesWhen: { hcp: { min: 13, max: 16 }, shape: { balanced: true } },
    meaning: 'Choose notrump game after opener has limited the hand to 12-14 HCP.',
    guidance: ['The partnership generally leaves the contract in 3NT; strong slam-oriented ' +
               'hands need further judgment and are not forced into this rule.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-four-major-after-minimum-1nt',
    kind: 'responderRebid',
    title: 'Choose game in a six-card major with game-going values',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0, strain: 'major' },
                      openerRebidCall: '1NT' },
    calls: ['4H', '4S'],
    callRefinement: refineResponderOriginalOneLevelSuit,
    callCategory: ['natural', 'signoff'],
    appliesWhen: { hcp: { min: 13, max: 16 }, suitLengths: [{ min: 6 }] },
    meaning: "Place the contract in responder's six-card major with enough values for game.",
    guidance: ['The balanced opener has at least two cards in the major. Further slam exploration ' +
               'with exceptional strength requires additional judgment.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-boundary-after-minimum-1nt',
    kind: 'scopeBoundary',
    title: 'Other second decisions after a minimum 1NT rebid need further judgment',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0, strain: 'major' },
                      openerRebidCall: '1NT' },
    meaning: 'A different hand may call for a checkback agreement, a different strain, ' +
             'or careful slam investigation.',
    guidance: ['Those decisions depend on too many variables and judgment for this app to ' +
               'reliably recommend one bid, including Pass.'],
    certainty: 'high',
  },
  //
  //// After opener naturally raises responder's one-level major
  // Opener shows four-card support.  Responder already showed four or more cards in the major,
  // so total points with shortage are appropriate after the fit is known.
  // Beyond ordinary game decisions, strong responder hands receive slam guidance.
  {
    id: 'responder-rebid-pass-after-simple-major-raise',
    kind: 'responderRebid',
    title: 'Stop in two of the agreed major with minimum values',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0, strain: 'major' },
                      openerRaiseResponderMajorTo: 2 },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { totalPoints: { min: 6, max: 10, valuation: 'shortage' } },
    meaning: 'Opener has raised with 12-16 support points. Responder has no invitation to offer.',
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-invite-after-simple-major-raise',
    kind: 'responderRebid',
    title: 'Invite major-suit game after a simple raise',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0, strain: 'major' },
                      openerRaiseResponderMajorTo: 2 },
    calls: ['3H', '3S'],
    callRefinement: refineResponderOriginalOneLevelSuit,
    callCategory: ['natural', 'invitational'],
    appliesWhen: { totalPoints: { min: 11, max: 12, valuation: 'shortage' } },
    meaning: 'Invite game with 11-12 support points opposite opener\'s minimum raise.',
    guidance: ['Opener may pass or bid game depending on strength and playing quality.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-game-after-simple-major-raise',
    kind: 'responderRebid',
    title: 'Bid major-suit game after a simple raise',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0, strain: 'major' },
                      openerRaiseResponderMajorTo: 2 },
    calls: ['4H', '4S'],
    callRefinement: refineResponderOriginalOneLevelSuit,
    callCategory: ['natural', 'signoff'],
    appliesWhen: { totalPoints: { min: 13, max: 16, valuation: 'shortage' } },
    meaning: 'Choose game in the agreed major with ordinary game-going responder values.',
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-pass-after-jump-major-raise',
    kind: 'responderRebid',
    title: 'Decline opener\'s major-suit game invitation with minimum values',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0, strain: 'major' },
                      openerRaiseResponderMajorTo: 3 },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { totalPoints: { min: 6, max: 7, valuation: 'shortage' } },
    meaning: 'Opener has shown 17-18 support points and invited game; responder declines.',
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-game-after-jump-major-raise',
    kind: 'responderRebid',
    title: 'Accept opener\'s major-suit game invitation',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0, strain: 'major' },
                      openerRaiseResponderMajorTo: 3 },
    calls: ['4H', '4S'],
    callRefinement: refineResponderOriginalOneLevelSuit,
    callCategory: ['natural', 'signoff'],
    appliesWhen: { totalPoints: { min: 8, max: 14, valuation: 'shortage' } },
    meaning: 'Accept game with enough support points opposite opener\'s stronger jump raise.',
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-pass-after-game-major-raise',
    kind: 'responderRebid',
    title: 'Accept opener\'s major-suit game signoff',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0, strain: 'major' },
                      openerRaiseResponderMajorTo: 4 },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { totalPoints: { min: 6, max: 12, valuation: 'shortage' } },
    meaning: 'Opener has shown maximum values and placed the partnership in major-suit game.',
    guidance: ['With these values, opener\'s game bid ordinarily settles the contract.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-boundary-after-simple-major-raise',
    kind: 'scopeBoundary',
    title: 'Other decisions after a simple major raise require more judgment',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0, strain: 'major' },
                      openerRaiseResponderMajorTo: 2 },
    meaning: 'The agreed major and opener\'s minimum strength are known, but very strong hands ' +
             'or side-suit game tries need further information about controls and distribution.',
    guidance: ['Those continuations rely on too many variables and judgment for this app to ' +
               'reliably provide practice. Pass is not automatically recommended.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-boundary-after-jump-major-raise',
    kind: 'scopeBoundary',
    title: 'Further decisions after a major jump raise require more judgment',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0, strain: 'major' },
                      openerRaiseResponderMajorTo: 3 },
    meaning: 'Opener\'s invitational jump raise has found a major fit. With 15 or more ' +
             'support points, responder may want to investigate slam rather than sign off in game.',
    guidance: ['Those continuations rely on too many variables and judgment for this app to ' +
               'reliably provide practice.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-boundary-after-game-major-raise',
    kind: 'scopeBoundary',
    title: 'Slam exploration after a major game raise needs judgment',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0, strain: 'major' },
                      openerRaiseResponderMajorTo: 4 },
    meaning: 'Opener has shown maximum values and already bid major-suit game. Responder ' +
             'with 13 or more support points should consider slam rather than automatically Pass.',
    guidance: ['Slam decisions rely on too many variables and judgment for this app to ' +
               'reliably provide practice.'],
    certainty: 'high',
  },
  //
  //// After a minimum repetition of opener's six-card opening suit
  // Share natural partscore, invitation, and notrump decisions after a one-level new-suit
  // response.  The repeated suit must be the original opening suit, bid at the two level.
  // Do not reuse these decisions after 1NT responses or two-level game-forcing responses.
  // Major-fit game placement and an independently strong seven-card spade suit remain
  // specific to the natural 1H - 1S - 2H auction.
  {
    id: 'responder-rebid-pass-after-minimum-suit-repeat',
    kind: 'responderRebid',
    title: "Accept opener's repeated six-card suit with minimum values",
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0 },
                      openerRepeatedOpeningSuitAtTwo: true },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: responderMinimumRepeatedSuitPassApplies,
    meaning: 'Prefer opener\'s known six-card opening suit to a new contract strain.',
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-two-original-suit-after-minimum-repeat',
    kind: 'responderRebid',
    title: "Sign off in responder's original six-card suit with minimum values",
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0 },
                      openerRepeatedOpeningSuitAtTwo: true },
    calls: ['2D', '2H', '2S'],
    callRefinement: refineResponderOriginalOneLevelSuit,
    callCategory: ['natural', 'signoff'],
    appliesWhen: { totalPoints: { min: 6, max: 10, valuation: 'length' },
                   suitLengths: [{ min: 6 }] },
    meaning: 'Prefer responder\'s six-card original suit without inviting game.',
    guidance: ['Opener ordinarily passes this nonforcing rebid.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-2nt-after-minimum-suit-repeat',
    kind: 'responderRebid',
    title: 'Invite notrump game after opener repeats a six-card suit',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0 },
                      openerRepeatedOpeningSuitAtTwo: true },
    calls: ['2NT'],
    callCategory: ['natural', 'invitational'],
    appliesWhen: { hcp: { min: 11, max: 12 }, shape: { balanced: true } },
    meaning: 'Invite 3NT after opener has shown a minimum hand and six cards in the opening suit.',
    guidance: ['A suit invitation may be more attractive if an eight-card major fit is known.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-three-hearts-after-repeated-hearts',
    kind: 'responderRebid',
    title: 'Invite game with an eight-card heart fit',
    auctionContext: { stage: 'responderRebid', auction: ['1H', '1S', '2H'] },
    calls: ['3H'],
    callCategory: ['natural', 'invitational'],
    priority: { rank: 4, note: 'A known major fit usually favors inviting in hearts.' },
    appliesWhen: { totalPoints: { min: 11, max: 12, valuation: 'shortage' },
                   suitLengths: [{ suit: 'H', min: 2 }] },
    meaning: 'Invite 4H with at least two hearts opposite opener\'s six or more.',
    guidance: ['Opener can accept the invitation or settle for 3H.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-three-original-suit-after-minimum-repeat',
    kind: 'responderRebid',
    title: "Invite game by repeating responder's six-card suit",
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0 },
                      openerRepeatedOpeningSuitAtTwo: true },
    calls: ['3D', '3H', '3S'],
    callRefinement: refineResponderOriginalOneLevelSuit,
    callCategory: ['natural', 'invitational'],
    priority: { rank: 5, note: 'An independent long responder suit can take priority over supporting opener.' },
    appliesWhen: { totalPoints: { min: 11, max: 12, valuation: 'length' },
                   suitLengths: [{ min: 6 }] },
    meaning: 'Invite in responder\'s original six-card suit with extra strength.',
    guidance: ['A known major fit may offer another invitation in opener\'s suit.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-3nt-after-minimum-suit-repeat',
    kind: 'responderRebid',
    title: 'Choose notrump game with a suitable balanced hand',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0 },
                      openerRepeatedOpeningSuitAtTwo: true },
    calls: ['3NT'],
    callCategory: ['natural', 'signoff'],
    appliesWhen: responderRepeatedSuitThreeNtApplies,
    meaning: 'Place the contract in notrump with game values and balanced shape.',
    guidance: ['With a major fit, four of the major remains a reasonable alternative with ' +
               'sufficient support when the fit is attractive.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-four-hearts-after-repeated-hearts',
    kind: 'responderRebid',
    title: 'Bid game with at least two hearts opposite a six-card suit',
    auctionContext: { stage: 'responderRebid', auction: ['1H', '1S', '2H'] },
    calls: ['4H'],
    callCategory: ['natural', 'signoff'],
    priority: { rank: 10, note: 'Prefer a known eight-card major fit over marginal notrump.' },
    appliesWhen: { totalPoints: { min: 13, max: 16, valuation: 'shortage' },
                   suitLengths: [{ suit: 'H', min: 2 }] },
    meaning: 'Choose the known eight-card heart fit and bid major-suit game.',
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-four-spades-after-repeated-hearts',
    kind: 'responderRebid',
    title: 'Choose game in an exceptionally long, strong spade suit',
    auctionContext: { stage: 'responderRebid', auction: ['1H', '1S', '2H'] },
    calls: ['4S'],
    callCategory: ['natural', 'signoff'],
    priority: { rank: 20, note: 'Seven strong spades can be preferable despite opener\'s long hearts.' },
    appliesWhen: responderSevenSpadeGameApplies,
    meaning: 'Place game in seven-card spades with sufficient strength and suit quality.',
    guidance: ['Opener has not shown spade support; an independently strong suit matters here.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-boundary-after-minimum-suit-repeat',
    kind: 'scopeBoundary',
    title: 'Other choices after a minimum suit repetition need further judgment',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0 },
                      openerRepeatedOpeningSuitAtTwo: true },
    meaning: 'Opener has shown at least six cards in the opening suit and minimum strength. Responder ' +
             'may still need to investigate another suit, forcing action, or slam.',
    guidance: ['Those continuations depend on too many variables and judgment for this app ' +
               'to reliably provide practice; Pass is not automatically recommended.'],
    certainty: 'high',
  },
  //
  //// After opener shows an economical second natural suit
  // The first response is a one-level natural new suit.  Opener's cheapest non-reverse second
  // suit can show 12-18 total points, and does not automatically promise five opening-minor cards.
  {
    id: 'responder-rebid-economical-pass-second',
    kind: 'responderRebid',
    title: 'Accept opener\'s economical second suit with minimum values',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0 } },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: (call, context) => responderEconomicalDecisionApplies(call, context, 'passSecond'),
    meaning: 'Accept opener\'s natural second suit with at least four-card support and minimum values.',
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-economical-prefer-opening',
    kind: 'responderRebid',
    title: 'Return to opener\'s opening suit with minimum values',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0 } },
    calls: ['2C', '2D', '2H', '2S'],
    callRefinement: (calls, context) => refineResponderEconomicalSuit(calls, context, 'opening', 2),
    callCategory: ['natural', 'signoff'],
    appliesWhen: (call, context) => responderEconomicalDecisionApplies(call, context, 'preferOpening'),
    meaning: 'Prefer opener\'s original suit with sufficient length to justify the fit.',
    guidance: ['A minor opening may be only three cards, so this preference requires more support.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-economical-repeat-response',
    kind: 'responderRebid',
    title: 'Sign off by repeating responder\'s six-card suit',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0 } },
    calls: ['2D', '2H', '2S'],
    callRefinement: (calls, context) => refineResponderEconomicalSuit(calls, context, 'response', 2),
    callCategory: ['natural', 'signoff'],
    appliesWhen: (call, context) => responderEconomicalDecisionApplies(call, context, 'repeatResponse'),
    meaning: 'Prefer the independently long suit responder originally showed.',
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-economical-invite-notrump',
    kind: 'responderRebid',
    title: 'Invite notrump game after opener\'s economical second suit',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0 } },
    calls: ['2NT'],
    callCategory: ['natural', 'invitational'],
    appliesWhen: (call, context) => responderEconomicalDecisionApplies(call, context, 'inviteNt'),
    meaning: 'Invite 3NT with balanced values, knowing opener can still have up to 18 points.',
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-economical-invite-opening',
    kind: 'responderRebid',
    title: 'Invite game with support for opener\'s first suit',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0 } },
    calls: ['3C', '3D', '3H', '3S'],
    callRefinement: (calls, context) => refineResponderEconomicalSuit(calls, context, 'opening', 3),
    callCategory: ['natural', 'invitational'],
    priority: { rank: 4, note: 'A supported long opening suit can be preferable to notrump.' },
    appliesWhen: (call, context) => responderEconomicalDecisionApplies(call, context, 'inviteOpening'),
    meaning: 'Show constructive support for opener\'s first suit after a two-level second-suit rebid.',
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-economical-invite-second',
    kind: 'responderRebid',
    title: 'Invite game by raising opener\'s second minor',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0 } },
    calls: ['3C', '3D'],
    callRefinement: (calls, context) => refineResponderEconomicalSuit(calls, context, 'second', 3),
    callCategory: ['natural', 'invitational'],
    priority: { rank: 4, note: 'Fit-oriented invitations can be preferable to notrump.' },
    appliesWhen: (call, context) => responderEconomicalDecisionApplies(call, context, 'inviteSecond'),
    meaning: 'Raise opener\'s natural second minor with invitational fit and strength.',
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-economical-delayed-major-partscore',
    kind: 'responderRebid',
    title: 'Choose a newly discovered spade fit at the two level',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0 } },
    calls: ['2S'],
    callRefinement: (calls, context) => refineResponderEconomicalSuit(calls, context, 'second', 2),
    callCategory: ['natural', 'signoff'],
    priority: { rank: 8, note: 'An established major fit is preferred to an uncertain minor preference.' },
    appliesWhen: (call, context) => responderEconomicalDecisionApplies(call, context, 'majorSecondPartscore'),
    meaning: 'Settle in spades after opener shows four and responder has four.',
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-economical-delayed-major-invite',
    kind: 'responderRebid',
    title: 'Invite spade game after finding a delayed fit',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0 } },
    calls: ['3S'],
    callRefinement: (calls, context) => refineResponderEconomicalSuit(calls, context, 'second', 3),
    callCategory: ['natural', 'invitational'],
    priority: { rank: 8, note: 'An established major fit is preferred to an uncertain minor preference.' },
    appliesWhen: (call, context) => responderEconomicalDecisionApplies(call, context, 'majorSecondInvite'),
    meaning: 'Invite game in spades after the partnership discovers its eight-card fit.',
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-economical-delayed-major-game',
    kind: 'responderRebid',
    title: 'Bid spade game after finding a delayed fit',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0 } },
    calls: ['4S'],
    callRefinement: (calls, context) => refineResponderEconomicalSuit(calls, context, 'second', 4),
    callCategory: ['natural', 'signoff'],
    priority: { rank: 8, note: 'An established major fit is preferred to an uncertain minor preference.' },
    appliesWhen: (call, context) => responderEconomicalDecisionApplies(call, context, 'majorSecondGame'),
    meaning: 'Place the contract in spades with game values and four-card support.',
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-economical-game-notrump',
    kind: 'responderRebid',
    title: 'Choose notrump game with the remaining suit stopped',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0 } },
    calls: ['3NT'],
    callCategory: ['natural', 'signoff'],
    appliesWhen: (call, context) => responderEconomicalDecisionApplies(call, context, 'gameNt'),
    meaning: 'Choose 3NT with balanced game strength and a basic stopper in the unbid suit.',
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-boundary-after-economical-second-suit',
    kind: 'scopeBoundary',
    title: 'Further choices after opener shows two suits require hand judgment',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0 } },
    scopeBoundaryWhen: (context) => ({
      success: getResponderEconomicalSecondSuit(context) !== null,
      telemetryLines: ['Check the natural economical second-suit auction before showing guidance.'],
    }),
    meaning: 'Opener has described two natural suits and may have as many as 18 points. ' +
             'Further forcing inquiries, difficult strain choices, and slam interest depend ' +
             'on partnership agreements and details of both hands.',
    guidance: ['Those decisions rely on too many variables and judgment for this app to ' +
               'reliably provide practice; Pass is not automatically the right action.'],
    certainty: 'high',
  },
  //
  //// After opener reverses or makes a natural strong jump shift
  // Reverse: one-round forcing, but not necessarily to game. Jump shift: game forcing.
  // Model only contract choices justified by clear strain and strength; an unclear continuation
  // must not acquire an automatic Pass or a conventional waiting-bid meaning.
  {
    id: 'responder-rebid-strong-second-suit-major-game',
    kind: 'responderRebid',
    title: 'Choose a supported major game after opener shows a strong second suit',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0 } },
    calls: ['4H', '4S'],
    callCategory: ['natural', 'signoff'],
    priority: { rank: 5, note: 'An established major fit generally favors the major-suit game.' },
    appliesWhen: responderStrongSecondSuitGameApplies,
    meaning: 'Place game in a major shown by opener when responder provides enough support. ' +
             'After a reverse, use sufficient game values; after a jump shift game is already forced.',
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-strong-second-suit-3nt',
    kind: 'responderRebid',
    title: "Choose 3NT after opener's strong natural second suit",
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0 } },
    calls: ['3NT'],
    callCategory: ['natural', 'signoff'],
    appliesWhen: responderStrongSecondSuitGameApplies,
    meaning: 'Balanced values and a stopper in the unbid suit make notrump game a reasonable choice.',
    guidance: ['An eight-card major fit may be preferable when responder can support it.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-boundary-after-reverse',
    kind: 'scopeBoundary',
    title: 'A reverse requires responder to continue even with minimum strength',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0 } },
    scopeBoundaryWhen: (context) => ({
      success: getResponderStrongSecondSuit(context)?.kind === 'reverse',
      telemetryLines: ['Check for a natural one-round-forcing reverse.'],
    }),
    meaning: 'Opener has shown extra strength with a reverse and responder must bid again. ' +
             'This is not necessarily a game force, so a minimum responder may need to ' +
             'make a discouraging but forcing continuation rather than jump to game.',
    guidance: ['The best lower-level response depends on the agreed treatment of weak ' +
               'continuations, suit fits and stoppers. Pass immediately after the reverse is not appropriate.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-boundary-after-strong-opener-jump-shift',
    kind: 'scopeBoundary',
    title: 'A strong opener jump shift commits the partnership to game',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0 } },
    scopeBoundaryWhen: (context) => ({
      success: getResponderStrongSecondSuit(context)?.kind === 'jumpShift',
      telemetryLines: ['Check for a natural game-forcing jump shift.'],
    }),
    meaning: "Opener's strong jump shift commits the partnership to game. When the " +
             'best strain is still uncertain, responder should continue describing the hand.',
    guidance: ['Choosing the next descriptive call or investigating slam depends on ' +
               'partnership agreements and hand judgment; Pass below game is not appropriate.'],
    certainty: 'high',
  },
];
