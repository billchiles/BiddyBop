/// Shared responses to partner's natural 1NT opening or direct 1NT overcall.
/// The selected 1NT opening-range agreement also governs these advances; the overcaller's
/// possible 18 HCP does not create a separate set of thresholds.
/// Historical rule IDs and responseBid kinds are retained for both bidding roles.
///
/// These declarations intentionally form a stacked response family.  Individual rules describe
/// locally valid meanings, so one hand can initially satisfy more than one rule.  The natural-NT
/// suppressors in biddingEvaluation.ts then remove fallback calls when a preferred suit route
/// applies.  With the standard 15-17 range, the main routing is:
///   weak + 5+ major                -> Jacoby transfer, or natural 2M with transfers off
///   8-9 + four-card major          -> Stayman when enabled
///   8-9 otherwise                  -> 2NT invitation; a good six-card minor may be descriptive
///   5-4 / 6-4 majors               -> Stayman first when strength permits
///   invitational+ 5-5 majors       -> strength-dependent transfer ordering
///   weak 5-5 majors                -> both transfer choices remain visible
///   6+ major + game-only values    -> Texas, or natural 4M with Texas off
///   6+ major + slam interest       -> direct strong 3M treatment, not the game-only route
///
/// Reduce the replying hand's HCP thresholds by one with the 16-18 agreement.  This is a routing
/// map, not a second set of rule conditions; declarations and local helpers remain authoritative.

import { oneNtResponseHcpShift, type AppliesWhenResult, type BidRule, type BiddingSystem,
         type Call, type RuleEvalContext } from './bidding-types';
import { hasTwoOfTopThreeHonors, type Suit } from './cards';
import { parseSuitBid } from './auction';


export const NaturalOneNtPartnerCallRules: BidRule[] = [
  //
  {
    id: 'respond-to-1nt-w/-pass-0-7-balanced',
    // Pass after partner bids 1NT with a weak balanced hand.
    kind: 'responseBid',
    title: 'Pass 1NT with 0-7 balanced',
    auctionContext: { partnerNaturalOneNt: true },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 0, max: 7 }, hcpRelativeToOneNtOpening: true,
                   shape: { balanced: true } },
    guidance: ['15-17: 0-7 HCP; 16-18: 0-6 HCP.'],
    meaning: 'Sign off in 1NT; partner is expected to leave the contract there ' +
             'if there is no interference.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-2nt-8-9-invitational',
    // Raise 1NT to 2NT with 8-9 HCP to invite game.  Normally this is a balanced-hand bid;
    // without Stayman or Jacoby transfers, it is the basic natural invitation regardless of shape.
    // See the family comment above for how this invitation fits among the major-suit routes.
    kind: 'responseBid',
    title: 'Invite game over 1NT with 8-9 HCP',
    auctionContext: { partnerNaturalOneNt: true },
    calls: ['2NT'],
    callCategory: ['invitational'],
    appliesWhen: oneNtTwoNtInvitationApplies, // owns only local 2NT eligibility
    guidance: ['15-17: 8-9 HCP; 16-18: 7-8 HCP.'],
    meaning: 'Invitational raise to 2NT.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-3nt-10-15-balanced',
    // Raise 1NT directly to 3NT with 10-15 balanced HCP to place the contract in game.
    kind: 'responseBid',
    title: 'Bid game over 1NT with 10-15 balanced',
    auctionContext: { partnerNaturalOneNt: true },
    calls: ['3NT'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 10, max: 15 }, hcpRelativeToOneNtOpening: true,
                   shape: { balanced: true } },
    guidance: ['15-17: 10-15 HCP; 16-18: 9-14 HCP.'],
    meaning: 'Place the contract in game.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-4nt-16-17-balanced',
    // Use quantitative 4NT with 16-17 balanced HCP to invite a small slam; this is not Blackwood.
    kind: 'responseBid',
    title: 'Invite small slam over 1NT with 16-17 balanced',
    auctionContext: { partnerNaturalOneNt: true },
    calls: ['4NT'],
    callCategory: ['invitational'],
    appliesWhen: { hcp: { min: 16, max: 17 }, hcpRelativeToOneNtOpening: true,
                   shape: { balanced: true } },
    guidance: ['15-17: 16-17 HCP; 16-18: 15-16 HCP.'],
    meaning: 'Quantitative invitation to small slam.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-6nt-18-19-balanced',
    // Bid 6NT directly with 18-19 balanced HCP.
    kind: 'responseBid',
    title: 'Bid small slam over 1NT with 18-19 balanced',
    auctionContext: { partnerNaturalOneNt: true },
    calls: ['6NT'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 18, max: 19 }, hcpRelativeToOneNtOpening: true,
                   shape: { balanced: true } },
    guidance: ['15-17: 18-19 HCP; 16-18: 17-18 HCP.'],
    meaning: 'Place the contract in small slam.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-5nt-20-21-balanced',
    // Use forcing 5NT with 20-21 balanced HCP to invite a grand slam.
    kind: 'responseBid',
    title: 'Invite grand slam over 1NT with 20-21 balanced',
    auctionContext: { partnerNaturalOneNt: true },
    calls: ['5NT'],
    callCategory: ['forcing'],
    appliesWhen: { hcp: { min: 20, max: 21 }, hcpRelativeToOneNtOpening: true,
                   shape: { balanced: true } },
    guidance: ['15-17: 20-21 HCP; 16-18: 19-20 HCP.'],
    meaning: 'Forces at least a small slam while inviting the 1NT bidder to bid grand slam ' +
             'with extra values.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-7nt-22plus-balanced',
    // Bid 7NT directly with 22+ balanced HCP.
    kind: 'responseBid',
    title: 'Bid grand slam over 1NT with 22+ balanced',
    auctionContext: { partnerNaturalOneNt: true },
    calls: ['7NT'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 22 }, hcpRelativeToOneNtOpening: true,
                   shape: { balanced: true } },
    guidance: ['15-17: 22+ HCP; 16-18: 21+ HCP.'],
    meaning: 'Place the contract in grand slam.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-stayman',
    // Stayman 2C with four-card major to ask the 1NT bidder for a major.
    kind: 'responseBid',
    title: 'Stayman over 1NT',
    auctionContext: { partnerNaturalOneNt: true },
    calls: ['2C'],
    agreement: { setting: 'stayman', value: true,
                 note: 'Stayman asks a 1NT bidder for a four-card major.' },
    callCategory: ['forcing', 'conventional'],
    appliesWhen: { hcp: { min: 8 }, hcpRelativeToOneNtOpening: true,
                   suitLengths: [{ suit: 'major', exact: 4 } ] },
    guidance: ['15-17: 8+ HCP; 16-18: 7+ HCP for ordinary Stayman.',
               'Stayman is artificial and forcing without interference; the 1NT bidder ' +
               'must respond.',
               'Stayman asks the 1NT bidder for a four-card major.',
               'Can be used even if short in clubs.'],
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-transfer-to-hearts',
    // Use the 2D Jacoby transfer with a 5+ card heart suit, asking the 1NT bidder to bid 2H.
    kind: 'responseBid',
    title: 'Transfer to hearts over 1NT',
    auctionContext: { partnerNaturalOneNt: true },
    calls: ['2D'],
    agreement: { setting: 'jacobyTransfers', value: true,
                 note: 'Jacoby transfer to the five-card major.' },
    callCategory: ['forcing', 'conventional'],
    appliesWhen: { hcp: { min: 0 }, suitLengths: [{ suit: 'H', min: 5 }] },
    guidance: ['The transfer is artificial and forcing without interference; ' +
               'the 1NT bidder normally ' +
               'completes the transfer.',
               'Use transfers to have the partner with the concealed points bid the contract.',
               'With 0-7 HCP over 15-17, or 0-6 over 16-18, transfer with a five-card or ' +
               'longer major and then pass rather ' +
               'than automatically passing 1NT; the major-suit contract may play better.'],
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-transfer-to-spades',
    // Use the 2H Jacoby transfer with a 5+ card spade suit, asking the 1NT bidder to bid 2S.
    kind: 'responseBid',
    title: 'Transfer to spades over 1NT',
    auctionContext: { partnerNaturalOneNt: true },
    calls: ['2H'],
    agreement: { setting: 'jacobyTransfers', value: true,
                 note: 'Jacoby transfer to the five-card major.' },
    callCategory: ['forcing', 'conventional'],
    appliesWhen: { hcp: { min: 0 }, suitLengths: [{ suit: 'S', min: 5 }] },
    guidance: ['The transfer is artificial and forcing without interference; ' +
               'the 1NT bidder normally ' +
               'completes the transfer.',
               'Use transfers to have the partner with the concealed points bid the contract.',
               'With 0-7 HCP over 15-17, or 0-6 over 16-18, transfer with a five-card or ' +
               'longer major and then pass rather ' +
               'than automatically passing 1NT; the major-suit contract may play better.'],
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-2h-2s-natural-signoff',
    // Without Jacoby transfers, bid a five-card or longer major naturally at the two level to play.
    kind: 'responseBid',
    title: 'Bid two of a major naturally over 1NT with a weak hand',
    auctionContext: { partnerNaturalOneNt: true },
    calls: ['2H', '2S'],
    agreement: { setting: 'jacobyTransfers', value: false,
                 note: 'Without Jacoby transfers, 2H and 2S are natural weak signoffs.' },
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 0, max: 7 }, hcpRelativeToOneNtOpening: true,
                   suitLengths: [{ min: 5 }] },
    meaning: 'Natural weak signoff in a five-card or longer major.',
    guidance: ['15-17: 0-7 HCP; 16-18: 0-6 HCP.',
               'With a weak hand and a five-card or longer major, prefer the major-suit ' +
               'signoff to automatically passing 1NT.'],
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-3c-3d-natural-invitational',
    // Bid 3C or 3D naturally with invitational values and a good six-card minor.
    kind: 'responseBid',
    title: '3C or 3D over 1NT with a good six-card minor and invitational values',
    auctionContext: { partnerNaturalOneNt: true },
    calls: ['3C', '3D'],
    callCategory: ['invitational', 'natural'],
    priority: { rank: 20, note: 'Prefer the descriptive good minor to the generic 2NT invitation.' },
    appliesWhen: oneNtNaturalMinorInvitationApplies,
    guidance: ['15-17: 8-9 HCP; 16-18: 7-8 HCP.',
               'Good means six or more cards with at least two of A/K/Q.'],
    meaning: 'Invitational natural minor-suit bid asking whether the 1NT bidder has a ' +
             'fitting top honor.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-4h-4s-natural-game',
    // Without Texas transfers, bid 4H or 4S directly with game values, a 6+ card major, and
    // no four-card other major.  With 6-4 majors, use Stayman first to look for the 4-4 fit.
    kind: 'responseBid',
    title: 'Bid four of a major naturally over 1NT with game values',
    auctionContext: { partnerNaturalOneNt: true },
    calls: ['4H', '4S'],
    agreement: { setting: 'texasTransfers', value: false,
                 note: 'Without Texas transfers, bid the long major naturally at game.' },
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 10, max: 15 }, hcpRelativeToOneNtOpening: true,
                   suitLengths: [{ min: 6 }],
                   shape: { noFourCardOtherMajor: true } },
    guidance: ['15-17: 10-15 HCP; 16-18: 9-14 HCP.'],
    meaning: 'Natural game signoff with a six-card or longer major.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-texas-transfer-to-hearts',
    // Texas is the fast game-only route with 6+ hearts when no other major needs exploration.
    // With 6-4 majors start with Stayman; with two 5+ majors use the lower-level transfer route.
    kind: 'responseBid',
    title: 'Texas transfer to hearts over 1NT',
    auctionContext: { partnerNaturalOneNt: true },
    calls: ['4D'],
    callCategory: ['gameForcing', 'conventional'],
    agreement: { setting: 'texasTransfers', value: true,
                 note: '4D asks the 1NT bidder to bid 4H.' },
    appliesWhen: { hcp: { min: 10, max: 15 }, hcpRelativeToOneNtOpening: true,
                   // can't use noFourCardOtherMajor because 4D is not 4H which maps to four spades
                   suitLengths: [{ suit: 'H', min: 6 }, { suit: 'S', max: 3 }] },
    guidance: ['15-17: 10-15 HCP; 16-18: 9-14 HCP.'],
    meaning: 'Texas transfer asks the 1NT bidder to bid 4H.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-texas-transfer-to-spades',
    // Texas is the fast game-only route with 6+ spades when no other major needs exploration.
    // With 6-4 majors start with Stayman; with two 5+ majors use the lower-level transfer route.
    kind: 'responseBid',
    title: 'Texas transfer to spades over 1NT',
    auctionContext: { partnerNaturalOneNt: true },
    calls: ['4H'],
    callCategory: ['gameForcing', 'conventional'],
    agreement: { setting: 'texasTransfers', value: true,
                 note: '4H asks the 1NT bidder to bid 4S.' },
    appliesWhen: { hcp: { min: 10, max: 15 }, hcpRelativeToOneNtOpening: true,
                   // can't use noFourCardOtherMajor because artificial 4H would check spades
                   suitLengths: [{ suit: 'S', min: 6 }, { suit: 'H', max: 3 }] },
    guidance: ['15-17: 10-15 HCP; 16-18: 9-14 HCP.'],
    meaning: 'Texas transfer asks the 1NT bidder to bid 4S.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-3h-3s-natural-forcing',
    // Without Jacoby transfers, bid a five-card or longer major naturally at the three level
    // with game-forcing values.
    kind: 'responseBid',
    title: 'Bid three of a major naturally over 1NT with game-forcing values',
    auctionContext: { partnerNaturalOneNt: true },
    calls: ['3H', '3S'],
    agreement: { setting: 'jacobyTransfers', value: false,
                 note: 'Without Jacoby transfers, a direct 3H or 3S is natural and game forcing.' },
    callCategory: ['gameForcing'],
    appliesWhen: { hcp: { min: 10 }, hcpRelativeToOneNtOpening: true,
                   suitLengths: [{ min: 5 }] },
    guidance: ['15-17: 10+ HCP; 16-18: 9+ HCP.'],
    meaning: 'Natural game-forcing major-suit response.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-3h-3s-slam-interest',
    // With Jacoby transfers available, reserve a direct 3H or 3S for slam interest with a
    // 6+ card major and no four-card other major.  With 6-4 majors, use Stayman first to
    // look for the possible 4-4 fit.
    kind: 'responseBid',
    title: '3H or 3S over 1NT with slam interest',
    auctionContext: { partnerNaturalOneNt: true },
    calls: ['3H', '3S'],
    agreement: { setting: 'jacobyTransfers', value: true,
                 note: 'With transfers available, direct 3H and 3S retain the strong treatment.' },
    callCategory: ['gameForcing'],
    appliesWhen: { hcp: { min: 16 }, hcpRelativeToOneNtOpening: true,
                   suitLengths: [{ min: 6 }],
                   // important to leave open 4 card major, might be better than 6 card major
                   shape: { noFourCardOtherMajor: true } },
    guidance: ['15-17: 16+ HCP; 16-18: 15+ HCP.'],
    meaning: 'Natural game-forcing major-suit bid with slam interest.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-4c-gerber',
    // Use 4C as Gerber after 1NT to ask the 1NT bidder for aces with slam-going values.
    kind: 'responseBid',
    title: 'Gerber over 1NT',
    auctionContext: { partnerNaturalOneNt: true },
    calls: ['4C'],
    callCategory: ['forcing', 'conventional'],
    priority: { rank: -100, note: 'Specialized ace asking; deliberately present last.' },
    appliesWhen: { hcp: { min: 18 } },
    guidance: ['18+ HCP remains a specialized indicative threshold under either 1NT range.',
               'Rare and specialized: Gerber is not a general slam try.',
               'Use it only when the partnership already has enough playing strength to consider ' +
               'slam and ace count is the specific remaining information needed to choose the ' +
               'final contract.'],
    meaning: 'Gerber is artificial and forcing, asking the 1NT bidder to show aces.',
    certainty: 'high',
  },
];

/// oneNtNaturalMinorInvitationApplies requires the candidate minor to be six cards or longer
/// with at least two of A/K/Q.  The response HCP range follows the selected 1NT opening range.
export function oneNtNaturalMinorInvitationApplies (call: Call, context: RuleEvalContext,
                                                     system: BiddingSystem): AppliesWhenResult {
  const candidate = parseSuitBid(call);
  if (candidate === null || candidate.level !== 3 ||
      (candidate.strain !== 'C' && candidate.strain !== 'D')) {
    return { success: false, telemetryLines: ['FAIL: natural 1NT minor invitation needs 3C or 3D.'] };
  }
  const shift = oneNtResponseHcpShift(system);
  const minHcp = 8 - shift;
  const maxHcp = 9 - shift;
  const suit = candidate.strain as Suit;
  const hcpApplies = context.handFacts.hcp >= minHcp && context.handFacts.hcp <= maxHcp;
  const lengthApplies = context.handFacts.lengths[suit] >= 6;
  const qualityApplies = hasTwoOfTopThreeHonors(context.hand, suit);
  const success = hcpApplies && lengthApplies && qualityApplies;
  return {
    success,
    callEvidence: { requirements: [
      { kind: 'hcp', actual: context.handFacts.hcp, min: minHcp, max: maxHcp, passed: hcpApplies },
      { kind: 'suitLength', suit, actual: context.handFacts.lengths[suit],
        min: 6, passed: lengthApplies },
      { kind: 'topThreeHonors', suit, passed: qualityApplies },
    ] },
    telemetryLines: [
      `${hcpApplies ? 'PASS' : 'FAIL'}: natural 3${suit} invitation needs ${minHcp}-${maxHcp} HCP.`,
      `${lengthApplies ? 'PASS' : 'FAIL'}: natural 3${suit} invitation needs 6+ ${suit}.`,
      `${qualityApplies ? 'PASS' : 'FAIL'}: natural 3${suit} invitation needs at least two of A/K/Q.`,
    ],
  };
}

/// oneNtTwoNtInvitationApplies owns only local eligibility for the natural 2NT invitation.
/// It requires the adjusted invitational HCP range and normally balanced shape.  When both Stayman
/// and Jacoby transfers are off, 2NT becomes the basic 8-9 HCP natural invitation regardless of
/// shape.  See the response-family comment above for how suit routes interact with this candidate.
///
export function oneNtTwoNtInvitationApplies (_call: Call, context: RuleEvalContext,
                                      system: BiddingSystem): AppliesWhenResult {
  const shift = oneNtResponseHcpShift(system);
  const hcpApplies = context.handFacts.hcp >= 8 - shift &&
                     context.handFacts.hcp <= 9 - shift;
  const shapeApplies = context.handFacts.balanced || (! system.stayman && ! system.jacobyTransfers);

  return {
    success: hcpApplies && shapeApplies,
    callEvidence: { requirements: [
      { kind: 'hcp', actual: context.handFacts.hcp, min: 8 - shift,
        max: 9 - shift, passed: hcpApplies },
      { kind: 'balanced', actual: context.handFacts.balanced, passed: shapeApplies },
    ] },
    telemetryLines: [
      `${hcpApplies ? 'PASS' : 'FAIL'}: 2NT invitation needs ${8 - shift}-${9 - shift} HCP.`,
      `${shapeApplies ? 'PASS' : 'FAIL'}: 2NT needs balanced shape unless Stayman and ` +
        'Jacoby transfers are both off.',
    ],
  };
}
