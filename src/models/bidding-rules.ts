/// Bidding rules characterizations and bidding notes.  Not sure yet what is needed or how it will
/// be used, so iterating toward a design with some punch through code on bidding.

import type { BidRule } from './bidding-types';

///
//// Bidding Rules
///

export const OpeningBidRules: BidRule[] = [ 
  // Basic one bids
  //
  {
    id: 'open-1nt-balanced-15-17',
    kind: 'openingBid',
    title: 'Open 1NT with balanced 15-17',
    auctionContext: { role: 'opener', auction: [], assumesUncontested: true },
    calls: ['1NT'],
    callCategory: ['natural'],
    agreement: { setting: 'oneNtOpening', value: '15-17' },
    priority: { rank: 100 },
    appliesWhen: { hcp: { min: 15, max: 17 }, shape: { balanced: true }, 
                   }, //suitLengths: [{ suit: 'H', max: 4 }, { suit: 'S', max: 4 }] },
    meaning: 'Balanced hand in the 1NT range.',
    guidance: ['You can bid 1NT with a 5-card major.'],
    certainty: 'high',
  },
  //
  {
    id: 'open-1nt-balanced-16-18',
    kind: 'openingBid',
    title: 'Open 1NT with balanced 16-18',
    auctionContext: { role: 'opener', auction: [], assumesUncontested: true },
    calls: ['1NT'],
    callCategory: ['natural'],
    agreement: { setting: 'oneNtOpening', value: '16-18' },
    priority: { rank: 100 },
    appliesWhen: { hcp: { min: 16, max: 18 }, shape: { balanced: true } },
    meaning: 'Balanced hand in the 1NT range.',
    guidance: ['You can bid 1NT with a 5-card major.'],
    certainty: 'high',
  },
  //
  {
    id: 'open-five-card-major',
    kind: 'openingBid',
    title: 'Open a five-card major',
    auctionContext: { role: 'opener', auction: [], assumesUncontested: true },
    calls: ['1H', '1S'],
    callCategory: ['natural'],
    priority: { rank: 90 },
    appliesWhen: { totalPoints: { min: 12, max: 21 }, suitLengths: [ { suit: 'major', min: 5 } ] },
    meaning: 'Open 1H or 1S with a five-card or longer major suit and opening values.',
    guidance: ['With two five-card or longer suits, open the higher-ranking suit.'],
    certainty: 'high',
  },
  //
  {
    id: 'open-convenient-minor',
    kind: 'openingBid',
    title: 'Open a convenient minor when no other one-level opening fits',
    auctionContext: { role: 'opener', auction: [], assumesUncontested: true },
    calls: ['1C', '1D'],
    callCategory: ['natural'],
    priority: { rank: 70 },
    appliesWhen: { totalPoints: { min: 12, max: 21 }, shape: { noFiveCardMajor: true }, 
                   suitLengths: [{ suit: 'major', max: 4 }]},
    meaning: 'Open 1C or 1D with nothing else to do. Open 1D with four cards in both minor suits; ' +
             'open 1C with three cards in both minor suits.',
    guidance: ['No balanced 15-17 1NT opening.', 'No five-card major.', 
               '1C may be three-card or longer.', 'Bid longer suit.', 
               'Bid 1D if both minors are four-card.'],
    certainty: 'high',
  },
  // Strong bids
  //
  {
    id: 'open-2nt-balanced-20-21',
    kind: 'openingBid',
    title: 'Open 2NT with balanced 20-21',
    auctionContext: { role: 'opener', auction: [], assumesUncontested: true },
    calls: ['2NT'],
    callCategory: ['natural'],
    appliesWhen: { hcp: { min: 20, max: 21 }, shape: { balanced: true } },
    meaning: 'Strong balanced opening showing 20-21 points.',
    certainty: 'high',
  },
  //
  {
    id: 'open-2c-strong-artificial',
    kind: 'openingBid',
    title: 'Open 2C with strong artificial opening values',
    auctionContext: { role: 'opener', auction: [], assumesUncontested: true },
    calls: ['2C'],
    style: 'partnershipAgreement',
    callCategory: ['forcing', 'conventional'],
    appliesWhen: { hcp: { min: 22 } },
    guidance: ['Seeing nine or more tricks but fewer than 22 points is ok with any shape.'],
    meaning: 'Strong artificial opening, any shape.',
    certainty: 'high',
  },
  // Weak bids
  //
  {
    id: 'open-weak-two',
    kind: 'openingBid',
    title: 'Open weak two bid',
    auctionContext: { role: 'opener', auction: [], assumesUncontested: true },
    calls: ['2D', '2H', '2S'],
    callCategory: ['invitational'],
    appliesWhen: { hcp: { min: 5, max: 10 }, suitLengths: [{ min: 6 }] },
    guidance: ['Good suit with 5 playing tricks and 2 of top 3 honors or 3 of top 5 honors, ' +
               'such as, A-Q-xxxx or Q-J-10-xxx'],
    meaning: 'Descriptive and obstructive weak two-bid.',
    certainty: 'high',
  },
  //
  {
    id: 'open-weak-three',
    kind: 'openingBid',
    title: 'Open at the three level with a preemptive hand',
    auctionContext: { role: 'opener', auction: [], assumesUncontested: true },
    calls: ['3C', '3D', '3H', '3S'],
    callCategory: ['invitational'],
    appliesWhen: { hcp: { min: 5, max: 12 }, suitLengths: [{ min: 7 }] },
    guidance: ['Good suit with 6 playing tricks and 2 of top 3 honors or 3 of top 5 honors, ' +
               'such as, A-Q-xxxx or Q-J-10-xxx'],
    meaning: 'Preemptive opening with a good seven-card suit.',
    certainty: 'high',
  },
  //
  {
    id: 'open-four-level-preempt',
    kind: 'openingBid',
    title: 'Open at the four level with a preemptive hand',
    auctionContext: { role: 'opener', auction: [], assumesUncontested: true },
    calls: ['4C', '4D', '4H', '4S'],
    callCategory: ['invitational'],
    appliesWhen: { hcp: { min: 5, max: 12 }, suitLengths: [{ min: 8 }] },
    guidance: ['Good suit with 7 playing tricks and 2 of top 3 honors or 3 of top 5 honors, ' +
               'such as, A-Q-xxxx or Q-J-10-xxx'],
    meaning: 'Preemptive opening with a good eight-card suit.',
    certainty: 'high',
  },
  //
  {
    id: 'open-4nt-blackwood-rare',
    kind: 'openingBid',
    title: 'Rare 4NT opening as Blackwood',
    auctionContext: { role: 'opener', auction: [], assumesUncontested: true },
    calls: ['4NT'],
    style: 'partnershipAgreement',
    callCategory: ['conventional'],
    appliesWhen: { hcp: { min: 25 } },
    meaning: 'Blackwood ace-asking opening; marked rare.',
    certainty: 'high',
  },
 ]; // OpeningBidRules

export const ResponseBidRules: BidRule[] = [ 
  // Responding to one of a minor
  //
  {
    id: 'respond-to-minor-w/-new-suit-one-level-priority',
    kind: 'responseBid',
    title: 'After 1C or 1D, bid a new suit at the one level first',
    auctionContext: { role: 'responder', auction: ['1C'], openerStrain: 'minor', assumesUncontested: true },
    calls: ['1D', '1H', '1S'],
    callCategory: ['forcing'],
    priority: { rank: 100, note: 'Responder priority with 6+ points.' },
    appliesWhen: { hcp: { min: 6 }, suitLengths: [{ min: 4 }]},
    meaning: 'New suit at the one level; forcing.',
    guidance: ['Bid the longest suit.', 
               'With a choice of five-card or six-card suits, bid the higher-ranking suit.', 
               'With a choice of four-card suits, bid the lowest-ranking suit, bidding up the line.',
               'After 1C with about 6-10 points some prefer to bypass a 4+ diamond suit to bid ' +
                  'a four-card major.'],
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-minor-w/-1nt',
    kind: 'responseBid',
    title: 'After 1C or 1D, respond 1NT with minimum balanced values and no four-card major',
    auctionContext: { role: 'responder', auction: ['1C'], openerStrain: 'minor', assumesUncontested: true },
    calls: ['1NT'],
    callCategory: ['signoff'],
    priority: { rank: 60 },
    appliesWhen: { hcp: { min: 6, max: 10 }, shape: { balanced: true, noFourCardMajor: true } },
    meaning: 'Balanced minimum response with no four-card major.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-minor-w/-2nt',
    kind: 'responseBid',
    title: 'After 1C or 1D, respond 2NT with invitational balanced values and no four-card major',
    auctionContext: { role: 'responder', auction: ['1C'], openerStrain: 'minor', assumesUncontested: true },
    calls: ['2NT'],
    callCategory: ['invitational'],
    priority: { rank: 65 },
    appliesWhen: { hcp: { min: 11, max: 12 }, shape: { balanced: true, noFourCardMajor: true } },
    meaning: 'Balanced invitational response with no four-card major.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-minor-w/-3nt',
    kind: 'responseBid',
    title: 'After 1C or 1D, respond 3NT with game-going balanced values and no four-card major',
    auctionContext: { role: 'responder', auction: ['1C'], openerStrain: 'minor', assumesUncontested: true },
    calls: ['3NT'],
    callCategory: ['signoff'],
    priority: { rank: 70 },
    appliesWhen: { hcp: { min: 13, max: 15 }, shape: { balanced: true, noFourCardMajor: true } },
    meaning: 'Balanced game response with no four-card major.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-minor-w/-raise-to-two',
    kind: 'responseBid',
    title: 'Raise opener minor to two with 6-10 and support',
    auctionContext: { role: 'responder', auction: ['1C'], openerStrain: 'minor', assumesUncontested: true },
    calls: ['2C', '2D'],
    callCategory: ['invitational'],
    priority: { rank: 40 },
    appliesWhen: { hcp: { min: 6, max: 10 }, supportFor: 'partnersOpenedSuit', 
                   supportLength: { min: 5 }, shape: { noFourCardMajor: true } },
    guidance: ['Usually this means five-card support if convenient minor has three cards.'],
    meaning: 'Minimum raise of opener minor, usually with five-card or longer support and no ' +
             'four-card major.',
    certainty: 'medium',
  },
  //
  {
    id: 'respond-to-minor-w/-limit-raise',
    kind: 'responseBid',
    title: 'Raise opener minor to three with 11-12 and support',
    auctionContext: { role: 'responder', auction: ['1C'], openerStrain: 'minor', assumesUncontested: true },
    calls: ['3C', '3D'],
    callCategory: ['invitational'],
    priority: { rank: 45 },
    appliesWhen: { hcp: { min: 11, max: 12 }, supportFor: 'partnersOpenedSuit', 
                   supportLength: { min: 5 }, shape: { noFourCardMajor: true } },
    meaning: 'Limit raise of opener minor.',
    guidance: ['Some play inverted minors, where single raise is strong, and jump is weak.'],
    certainty: 'medium',
  },
  //
  {
    id: 'respond-to-minor-w/-13plus-start-new-suit',
    kind: 'responseBid',
    title: 'With 13+ and minor support, start with a new suit',
    auctionContext: { role: 'responder', auction: ['1C'], openerStrain: 'minor', assumesUncontested: true },
    calls: ['1D', '1H', '1S', '2C', '2D', '2H', '2S'],
    callCategory: ['forcing'],
    priority: { rank: 95 },
    appliesWhen: { hcp: { min: 13 }, supportFor: 'partnersOpenedSuit' },
    guidance: ['Plan to raise later.'],
    meaning: 'Start with a new suit and plan to show the minor support later.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-minor-w/-weak-jump-shift-modern',
    kind: 'responseBid',
    title: 'Modern weak jump shift after one of a minor',
    auctionContext: { role: 'responder', auction: ['1C'], openerStrain: 'minor', assumesUncontested: true },
    calls: ['2D', '2H', '2S', '3C', '3D'],
    callCategory: ['invitational'],
    agreement: { setting: 'minorJumpShift', value: 'weak' },
    appliesWhen: { hcp: { max: 6 }, suitLengths: [{ min: 6 }] },
    meaning: 'Weak hand with a six-card suit, preemptive.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-minor-w/-strong-jump-shift-classic',
    kind: 'responseBid',
    title: 'Classic strong jump shift after one of a minor',
    auctionContext: { role: 'responder', auction: ['1C'], openerStrain: 'minor', assumesUncontested: true },
    calls: ['2D', '2H', '2S', '3C', '3D'],
    callCategory: ['gameForcing'],
    agreement: { setting: 'minorJumpShift', value: 'strong' },
    appliesWhen: { hcp: { min: 17 }, suitLengths: [{ min: 5 }] },
    guidance: ['With a good five-card or longer suit and 18-19 points, jump-shift to new suit.'],
    meaning: 'Classic Standard treats jump shifts as strong.',
    certainty: 'high',
  },
  // Responding to one of a major with/without support.
  //
  {
    id: 'respond-to-major-w/-support-pass-0-5',
    kind: 'responseBid',
    title: 'Pass with support and 0-5',
    auctionContext: { role: 'responder', auction: ['1H'], openerStrain: 'major', assumesUncontested: true },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { totalPoints: { min: 0, max: 5 }, supportFor: 'partnersOpenedSuit', 
                   supportLength: { min: 3 } },
    meaning: 'Game is unlikely.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/-pass-0-5',
    kind: 'responseBid',
    title: 'Pass one of a major with 0-5',
    auctionContext: { role: 'responder', auction: ['1H'], openerStrain: 'major', assumesUncontested: true },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 0, max: 5 } },
    meaning: 'Responder has too few points to bid.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-minor-w/-pass-0-5',
    kind: 'responseBid',
    title: 'Pass one of a minor with 0-5',
    auctionContext: { role: 'responder', auction: ['1D'], openerStrain: 'minor', assumesUncontested: true },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 0, max: 5 } },
    meaning: 'Responder has too few points to bid.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-nt-w/-pass-0-7',
    kind: 'responseBid',
    title: 'Pass one no-trump with 0-7',
    auctionContext: { role: 'responder', auction: ['1NT'], openerStrain: 'NT', assumesUncontested: true },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 0, max: 7 } },
    meaning: 'Responder has too few points to bid.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/-support-simple-raise',
    kind: 'responseBid',
    title: 'Simple raise with 6-10 and major support',
    auctionContext: { role: 'responder', auction: ['1H'], openerStrain: 'major', assumesUncontested: true },
    calls: ['2H', '2S'],
    appliesWhen: { totalPoints: { min: 6, max: 10 }, supportFor: 'partnersOpenedSuit', 
                   supportLength: { min: 3 } },
    meaning: 'Raise partner major to the two level.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/-support-limit-raise-four-card',
    kind: 'responseBid',
    title: 'Limit raise with four-card support and 11-12',
    auctionContext: { role: 'responder', auction: ['1H'], openerStrain: 'major', assumesUncontested: true },
    calls: ['3H', '3S'],
    callCategory: ['invitational'],
    appliesWhen: { totalPoints: { min: 11, max: 12 }, supportFor: 'partnersOpenedSuit', 
                   supportLength: { min: 4 } },
    meaning: 'Jump to the three level as a limit raise with four-card or longer support.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/-support-limit-raise-three-card',
    kind: 'responseBid',
    title: 'Three-card support, 11-12: bid 1NT then raise',
    auctionContext: { role: 'responder', auction: ['1H'], openerStrain: 'major', assumesUncontested: true },
    calls: ['1NT'],
    callCategory: ['forcing'],
    style: 'twoOverOne',
    appliesWhen: { totalPoints: { min: 11, max: 12 }, supportFor: 'partnersOpenedSuit', 
                   supportLength: { min: 3, max: 3 } },
    meaning: 'With exactly three-card support and limit-raise values, bid 1NT first and then ' +
             'raise to the three level.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/-three-card-support-13plus-bid-new-suit-then-raise',
    kind: 'responseBid',
    title: 'With 13+ and three-card major support, bid a new suit then raise to game',
    auctionContext: { role: 'responder', auction: ['1H'], openerStrain: 'major', assumesUncontested: true },
    calls: ['1S', '2C', '2D', '2H'],
    callCategory: ['forcing'],
    appliesWhen: { totalPoints: { min: 13 }, supportFor: 'partnersOpenedSuit',
                   supportLength: { min: 3, max: 3 } },
    guidance: ['Bid a new suit and then raise to at least game.'],
    meaning: 'Game-forcing support path with three-card support.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/-four-card-support-13plus-bid-new-suit-then-raise',
    kind: 'responseBid',
    title: 'With 13+ and four-card major support, bid a new suit then raise to game',
    auctionContext: { role: 'responder', auction: ['1H'], openerStrain: 'major', assumesUncontested: true },
    calls: ['1S', '2C', '2D', '2H'],
    callCategory: ['forcing'],
    agreement: { setting: 'majorGameForceWithSupport', value: 'newSuitThenRaise' },
    appliesWhen: { totalPoints: { min: 13 }, supportFor: 'partnersOpenedSuit',
                   supportLength: { min: 4 } },
    guidance: ['Bid a new suit and then raise to at least game.'],
    meaning: 'Game-forcing support path when not using Jacoby 2NT.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/-support-jacoby-2nt-agreement',
    kind: 'responseBid',
    title: 'Jacoby 2NT partnership agreement',
    auctionContext: { role: 'responder', auction: ['1H'], openerStrain: 'major', assumesUncontested: true },
    calls: ['2NT'],
    callCategory: ['conventional', 'partnershipAgreement'],
    agreement: { setting: 'majorGameForceWithSupport', value: 'jacoby2NT' },
    appliesWhen: { hcp: { min: 13 }, supportFor: 'partnersOpenedSuit', supportLength: { min: 4 } },
    meaning: 'Some partnerships use 2NT as artificial Jacoby 2NT, showing four-card or longer ' +
             'support and 13+ points.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/o-support-new-suit-one-level',
    kind: 'responseBid',
    title: 'Without support, bid a new suit at the one level with 6+',
    auctionContext: { role: 'responder', auction: ['1H'], openerStrain: 'major', assumesUncontested: true },
    calls: ['1S'],
    callCategory: ['forcing'],
    priority: { rank: 100 },
    appliesWhen: { hcp: { min: 6 }, supportLength: { max: 2 }, suitLengths: [{ min: 4 }] },
    guidance: ["Use a new suit at the one level to show no support for partner's major."],
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/o-support-new-suit-two-level',
    kind: 'responseBid',
    title: 'Without support, bid a new suit at the two level with 13+',
    auctionContext: { role: 'responder', auction: ['1H'], openerStrain: 'major', assumesUncontested: true },
    calls: ['2C', '2D', '2H'],
    callCategory: ['forcing'],
    style: 'twoOverOne',
    priority: {rank: 90 },
    appliesWhen: { hcp: { min: 13 }, supportLength: { max: 2 }, suitLengths: [{ min: 4 }] },
    guidance: ['Bid new suit at the two level without jumping to show opening points in two-over-one.'],
    meaning: 'Two-over-one game force in first or second position after partner opens 1H or 1S' +
             ' and next hand passes.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/o-support-1nt-twooverone',
    kind: 'responseBid',
    title: 'Without support, respond 1NT with 6-12',
    auctionContext: { role: 'responder', auction: ['1H'], openerStrain: 'major', assumesUncontested: true },
    calls: ['1NT'],
    callCategory: ['forcing'],
    agreement: { setting: 'majorOneNtResponse', value: 'forcing' },
    appliesWhen: { hcp: { min: 6, max: 12 }, supportLength: { max: 2 } },
    guidance: ['No available preferred suit response.', 
               'Forcing if responder has not passed and opponents have not interfered.'],
    meaning: '1NT response to a major in 2/1 style.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/o-support-1nt-standard',
    kind: 'responseBid',
    title: 'Standard style 1NT response to a major',
    auctionContext: { role: 'responder', auction: ['1H'], openerStrain: 'major', assumesUncontested: true },
    calls: ['1NT'],
    callCategory: ['signoff'],
    agreement: { setting: 'majorOneNtResponse', value: 'nonForcing' },
    appliesWhen: { hcp: { min: 6, max: 10 }, supportLength: { max: 2 } },
    meaning: 'Playing Standard, 1NT over a major shows 6-10 and is non-forcing.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/o-support-3nt',
    kind: 'responseBid',
    title: 'Without support, respond 3NT with 13-15 balanced',
    auctionContext: { role: 'responder', auction: ['1H'], openerStrain: 'major', assumesUncontested: true },
    calls: ['3NT'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 13, max: 15 }, supportLength: { max: 2 }, shape: { balanced: true, noFourCardOtherMajor: true } },
    meaning: 'Balanced game response without support.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w-weak-jump-shift-modern',
    kind: 'responseBid',
    title: 'Modern weak jump shift after one of a major',
    auctionContext: { role: 'responder', auction: ['1H'], openerStrain: 'major', assumesUncontested: true },
    calls: ['2S', '3C', '3D', '3H'],
    callCategory: ['invitational'],
    style: 'modern',
    appliesWhen: { hcp: { max: 6 }, suitLengths: [{ min: 6 }] },
    meaning: 'Weak hand with a six-card suit, preemptive.',
    certainty: 'high',
  },
  // Responding to notrump
  //
  {
    id: 'respond-to-1nt-w/-pass-0-7-balanced',
    kind: 'responseBid',
    title: 'Pass 1NT with 0-7 balanced',
    auctionContext: { role: 'responder', auction: ['1NT'], assumesUncontested: true },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 0, max: 7 }, shape: { balanced: true } },
    meaning: 'Partscore decision.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-2nt-8-9-balanced',
    kind: 'responseBid',
    title: 'Invite game over 1NT with 8-9 balanced',
    auctionContext: { role: 'responder', auction: ['1NT'], assumesUncontested: true },
    calls: ['2NT'],
    callCategory: ['invitational'],
    appliesWhen: { hcp: { min: 8, max: 9 }, shape: { balanced: true } },
    meaning: 'Invitational raise to 2NT.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-3nt-10-15-balanced',
    kind: 'responseBid',
    title: 'Bid game over 1NT with 10-15 balanced',
    auctionContext: { role: 'responder', auction: ['1NT'], assumesUncontested: true },
    calls: ['3NT'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 10, max: 15 }, shape: { balanced: true } },
    meaning: 'Place the contract in game.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-4nt-16-17-balanced',
    kind: 'responseBid',
    title: 'Invite small slam over 1NT with 16-17 balanced',
    auctionContext: { role: 'responder', auction: ['1NT'], assumesUncontested: true },
    calls: ['4NT'],
    callCategory: ['invitational', "conventional"],
    appliesWhen: { hcp: { min: 16, max: 17 }, shape: { balanced: true } },
    meaning: 'Quantitative invitation to small slam.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-6nt-18-19-balanced',
    kind: 'responseBid',
    title: 'Bid small slam over 1NT with 18-19 balanced',
    auctionContext: { role: 'responder', auction: ['1NT'], assumesUncontested: true },
    calls: ['6NT'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 18, max: 19 }, shape: { balanced: true } },
    meaning: 'Place the contract in small slam.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-5nt-20-21-balanced',
    kind: 'responseBid',
    title: 'Invite grand slam over 1NT with 20-21 balanced',
    auctionContext: { role: 'responder', auction: ['1NT'], assumesUncontested: true },
    calls: ['5NT'],
    callCategory: ['forcing'],
    appliesWhen: { hcp: { min: 20, max: 21 }, shape: { balanced: true } },
    meaning: 'Grand slam invitation.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-7nt-22plus-balanced',
    kind: 'responseBid',
    title: 'Bid grand slam over 1NT with 22+ balanced',
    auctionContext: { role: 'responder', auction: ['1NT'], assumesUncontested: true },
    calls: ['7NT'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 22 }, shape: { balanced: true } },
    meaning: 'Place the contract in grand slam.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-stayman',
    kind: 'responseBid',
    title: 'Stayman over 1NT',
    auctionContext: { role: 'responder', auction: ['1NT'], assumesUncontested: true },
    calls: ['2C'],
    agreement: { setting: 'stayman', value: true },
    callCategory: ['forcing', 'conventional'],
    appliesWhen: { hcp: { min: 8 }, suitLengths: [{ suit: 'major', min: 4 } ] },
    guidance: ['Stayman asks opener for a four-card major.', 'Can be used even if short in clubs.'],
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-transfer-to-hearts',
    kind: 'responseBid',
    title: 'Transfer to hearts over 1NT',
    auctionContext: { role: 'responder', auction: ['1NT'], assumesUncontested: true },
    calls: ['2D'],
    agreement: { setting: 'jacobyTransfers', value: true },
    callCategory: ['conventional'],
    appliesWhen: { hcp: { min: 0 }, suitLengths: [{ suit: 'H', min: 5 }] },
    guidance: ['Use transfers to have the partner with the consealed points bid the contract.'],
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-transfer-to-spades',
    kind: 'responseBid',
    title: 'Transfer to spades over 1NT',
    auctionContext: { role: 'responder', auction: ['1NT'], assumesUncontested: true },
    calls: ['2H'],
    agreement: { setting: 'jacobyTransfers', value: true },
    callCategory: ['conventional'],
    appliesWhen: { hcp: { min: 0 }, suitLengths: [{ suit: 'S', min: 5 }] },
    guidance: ['Use transfers to have the partner with the consealed points bid the contract.'],
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-minor-suit-transfer',
    kind: 'responseBid',
    title: 'Transfer to 3C over 1NT for long minor',
    auctionContext: { role: 'responder', auction: ['1NT'], assumesUncontested: true },
    calls: ['2S'],
    style: 'partnershipAgreement',
    callCategory: ['conventional', 'partnershipAgreement'],
    appliesWhen: { hcp: { min: 0 }, suitLengths: [{ suit: 'minor', min: 6 }] },
    guidance: ['Use transfers to have the partner with the consealed points bid the contract.'],
    certainty: 'medium',
  },
  //
  {
    id: 'respond-to-1nt-w/-3c-natural-invitational',
    kind: 'responseBid',
    title: '3C over 1NT with good six-card clubs and 8-9',
    auctionContext: { role: 'responder', auction: ['1NT'], assumesUncontested: true },
    calls: ['3C'],
    callCategory: ['invitational', 'partnershipAgreement'],
    appliesWhen: { hcp: { min: 8, max: 9 }, suitLengths: [{ suit: 'C', min: 6 }]},
    guidance: ['good six-card club suit'],
    meaning: 'Invitational natural club bid.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-3h-3s-slam-interest',
    kind: 'responseBid',
    title: '3H or 3S over 1NT with slam interest',
    auctionContext: { role: 'responder', auction: ['1NT'], assumesUncontested: true },
    calls: ['3H', '3S'],
    callCategory: ['forcing'],
    appliesWhen: { hcp: { min: 16 }, suitLengths: [{ min: 6 }]},
    meaning: 'Natural major-suit bid with slam interest.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-4c-gerber',
    kind: 'responseBid',
    title: 'Gerber over 1NT',
    auctionContext: { role: 'responder', auction: ['1NT'], assumesUncontested: true },
    calls: ['4C'],
    callCategory: ['conventional', 'partnershipAgreement'],
    appliesWhen: { hcp: { min: 18 } },
    meaning: 'Gerber ace-asking convention.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-2nt-w/-pass-0-3-balanced',
    kind: 'responseBid',
    title: 'Pass 2NT with 0-3 balanced',
    auctionContext: { role: 'responder', auction: ['2NT'], assumesUncontested: true },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 0, max: 3 }, shape: { balanced: true } },
    meaning: 'Partscore decision over 20-21 balanced opener.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-2nt-w/-3nt-4-10-balanced',
    kind: 'responseBid',
    title: 'Bid 3NT over 2NT with 4-10 balanced',
    auctionContext: { role: 'responder', auction: ['2NT'], assumesUncontested: true },
    calls: ['3NT'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 4, max: 10 }, shape: { balanced: true } },
    meaning: 'Game in notrump.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-2nt-w/-4nt-11-12-balanced',
    kind: 'responseBid',
    title: 'Invite slam over 2NT with 11-12 balanced',
    auctionContext: { role: 'responder', auction: ['2NT'], assumesUncontested: true },
    calls: ['4NT'],
    callCategory: ['invitational'],
    appliesWhen: { hcp: { min: 11, max: 12 }, shape: { balanced: true } },
    meaning: 'Invite opener to bid slam.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-2nt-w/-6nt-13-15-balanced',
    kind: 'responseBid',
    title: 'Bid 6NT over 2NT with 13-15 balanced',
    auctionContext: { role: 'responder', auction: ['2NT'], assumesUncontested: true },
    calls: ['6NT'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 13, max: 15 }, shape: { balanced: true } },
    meaning: 'Small slam in notrump.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-2nt-w/-5nt-16-balanced',
    kind: 'responseBid',
    title: 'Invite grand slam over 2NT with 16 balanced',
    auctionContext: { role: 'responder', auction: ['2NT'], assumesUncontested: true },
    calls: ['5NT'],
    callCategory: ['forcing'],
    appliesWhen: { hcp: { min: 16, max: 16 }, shape: { balanced: true } },
    meaning: 'Grand slam invitation.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-2nt-w/-stayman',
    kind: 'responseBid',
    title: 'Stayman over 2NT',
    auctionContext: { role: 'responder', auction: ['2NT'], assumesUncontested: true },
    calls: ['3C'],
    agreement: { setting: 'stayman', value: true },
    callCategory: ['forcing', 'conventional', 'partnershipAgreement'],
    appliesWhen: { hcp: { min: 4 }, suitLengths: [{ suit: 'major', min: 4 }] },
    meaning: 'Stayman asking for a major suit.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-2nt-w/-transfer-to-hearts',
    kind: 'responseBid',
    title: 'Transfer to hearts over 2NT',
    auctionContext: { role: 'responder', auction: ['2NT'], assumesUncontested: true },
    calls: ['3D'],
    agreement: { setting: 'jacobyTransfers', value: true },
    callCategory: ['conventional', 'partnershipAgreement'],
    appliesWhen: { hcp: { min: 0 }, suitLengths: [{ suit: 'H', min: 5 }] },
    guidance: ['Use transfers to have the partner with the consealed points bid the contract.'],
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-2nt-w/-transfer-to-spades',
    kind: 'responseBid',
    title: 'Transfer to spades over 2NT',
    auctionContext: { role: 'responder', auction: ['2NT'], assumesUncontested: true },
    calls: ['3H'],
    agreement: { setting: 'jacobyTransfers', value: true },
    callCategory: ['conventional', 'partnershipAgreement'],
    appliesWhen: { hcp: { min: 0 }, suitLengths: [{ suit: 'S', min: 5 }] },
    guidance: ['Use transfers to have the partner with the consealed points bid the contract.'],
    certainty: 'high',
  },
 ];

export const OvercallRules: BidRule[] = [  ];
export const AdvanceRules: BidRule[] = [  ];
export const OpenerRebidRules: BidRule[] = [  ];

export const BiddingRules: BidRule[] = [
];

///
//// Bidding Notes
///

export const BiddingNotes: BidRule[] = [
  // {
  //   id: 'valuation-high-card-points',
  //   kind: 'valuation',
  //   title: 'High card point scale',
  //   meaning: 'Ace=4, King=3, Queen=2, Jack=1.',
  //   certainty: 'high',
  // },
  //
  // {
  //   id: 'valuation-distribution-points',
  //   kind: 'valuation',
  //   title: 'Length-based distribution points',
  //   meaning: 'Add distribution points for long suits: five-card suit=1, six-card suit=2, seven-card suit=3, eight-card suit=4.',
  //   certainty: 'high',
  // },
  //
  // {
  //   id: 'opening-one-level-point-range',
  //   kind: 'openingBid',
  //   title: 'Open at the one level with opening values',
  //   context: { role: 'opener', auction: [], assumesUncontested: true },
  //   calls: ['1C', '1D', '1H', '1S', '1NT'],
  //   appliesWhen: { totalPoints: { min: 12, max: 21 } },
  //   meaning: 'Open at the one level with about 12-21 total points after adding high-card and distribution points.',
  //   guidance: ['In first or second position, the Guideline of 20 may be an alternative hand-valuation method.', 'Third-position openings may be lighter.', 'Fourth-position openings may use the Guideline of 15.'],
  //   certainty: 'high',
  // },
  //
  // {
  //   id: 'balanced-hand-definition',
  //   kind: 'concept',
  //   title: 'Balanced hand definition',
  //   meaning: 'A balanced hand has no void, no singleton, and at most one doubleton. The listed balanced patterns are 4-3-3-3, 4-4-3-2, and 5-3-3-2.',
  //   certainty: 'high',
  // },
  //
  {
    id: 'minor-response-objective',
    kind: 'priority',
    title: 'Responder objective after 1C or 1D',
    auctionContext: { role: 'responder', auction: ['1C'], openerStrain: 'minor', assumesUncontested: true },
    meaning: 'Responder first looks for an eight-card or longer major-suit fit. Major-suit ' +
             'contracts are preferred over minor-suit contracts. Without a major fit, responder ' +
             'next considers notrump. Notrump is generally preferred to minor-suit contracts ' +
             'because 3NT needs fewer tricks than 5C or 5D.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-nt-two-decisions',
    kind: 'concept',
    title: 'Responder decisions over 1NT or 2NT',
    auctionContext: { role: 'responder', auction: ['1NT'], openerStrain: 'NT', assumesUncontested: true },
    meaning: 'Responder decides how high to bid and where to play: clubs, diamonds, hearts, spades, or notrump.',
    guidance: ['Opener has shown a narrow strength range and a balanced or semi-balanced hand with at least two cards in every suit.'],
    certainty: 'high',
  },
  //
  {
    id: 'nt-opener-rebid-guidance',
    kind: 'rebidGuidance',
    title: 'Opener rebid after responder bid over notrump',
    auctionContext: { role: 'opener', auction: ['1NT'], assumesUncontested: true },
    meaning: 'If responder makes a signoff bid, opener passes. If responder makes an invitational bid, opener passes with a minimum and accepts with a maximum. If responder makes a forcing bid, opener makes a descriptive rebid.',
    guidance: ['Example: after 1NT-2NT, opener passes with 15-16 and bids 3NT with 17 or a good 16.'],
    certainty: 'high',
  },
];
