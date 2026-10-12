/// Responder's selected natural second decisions.
import type { BidRule } from './bidding-types';
import { refineResponderOriginalMajor } from './responder-rebidding-functions';

export const ResponderRebidRules: BidRule[] = [
  //// After opener rebids a natural minimum 1NT
  // These cases follow an ordinary one-level major response to a one-level suit opening.
  // Opener has shown 12-14 balanced HCP and no normal four-card raise of the major.
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
    callRefinement: refineResponderOriginalMajor,
    callCategory: ['natural', 'signoff'],
    appliesWhen: { hcp: { min: 6, max: 9 }, suitLengths: [{ min: 6 }] },
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
    callRefinement: refineResponderOriginalMajor,
    callCategory: ['natural', 'invitational'],
    appliesWhen: { hcp: { min: 10, max: 12 }, suitLengths: [{ min: 6 }] },
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
    appliesWhen: { hcp: { min: 13, max: 15 }, shape: { balanced: true } },
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
    callRefinement: refineResponderOriginalMajor,
    callCategory: ['natural', 'signoff'],
    appliesWhen: { hcp: { min: 13, max: 15 }, suitLengths: [{ min: 6 }] },
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
  {
    id: 'responder-rebid-pass-after-simple-major-raise',
    kind: 'responderRebid',
    title: 'Stop in two of the agreed major with minimum values',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0, strain: 'major' },
                      openerRaiseResponderMajorTo: 2 },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { totalPoints: { min: 6, max: 9, valuation: 'shortage' } },
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
    callRefinement: refineResponderOriginalMajor,
    callCategory: ['natural', 'invitational'],
    appliesWhen: { totalPoints: { min: 10, max: 12, valuation: 'shortage' } },
    meaning: 'Invite game with 10-12 support points opposite opener\'s minimum raise.',
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
    callRefinement: refineResponderOriginalMajor,
    callCategory: ['natural', 'signoff'],
    appliesWhen: { totalPoints: { min: 13, max: 15, valuation: 'shortage' } },
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
    callRefinement: refineResponderOriginalMajor,
    callCategory: ['natural', 'signoff'],
    appliesWhen: { totalPoints: { min: 8, max: 15, valuation: 'shortage' } },
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
    appliesWhen: { totalPoints: { min: 6, max: 15, valuation: 'shortage' } },
    meaning: 'Opener has shown maximum values and placed the partnership in major-suit game.',
    guidance: ['Opener\'s game bid is ordinarily the final contract without unusual slam values.'],
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
    meaning: 'Opener\'s invitational jump raise has found a major fit. Responder with exceptional ' +
             'strength may consider further exploration rather than an ordinary game choice.',
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
    meaning: 'Opener has already placed the contract in a major game. Exceptional responder ' +
             'strength may justify investigating slam rather than an ordinary Pass.',
    guidance: ['Slam decisions rely on too many variables and judgment for this app to ' +
               'reliably provide practice.'],
    certainty: 'high',
  },
];
