/// Core types and current bidding-system settings for the bridge trainer.
///

import type { Hand, HandFacts, Seat } from './cards';

///
//// Basic card, suit, bid types
///

/// A Strain is a suit or NT.
export type Strain = 'C' | 'D' | 'H' | 'S' | 'NT';
/// strainOrder helps with determining next lowest possible bid
export const STRAIN_ORDER: Strain[] = ['C', 'D', 'H', 'S', 'NT'];
/// A suit bid is a level plus denomination, such as 1C, 1H, or 3NT.
export type SuitBid = `${1 | 2 | 3 | 4 | 5 | 6 | 7}${Strain}`;
/// A call is anything a player can say on their turn in the auction.
export type Call =
  | SuitBid
  | 'Pass'
  | 'Double'
  | 'Redouble';
export type BidStage =
  | 'opening'
  | 'responding'
  | 'openerRebid'
  | 'responderRebid'
  | 'overcalling'
  | 'advancing'
  | 'overcallerRebid';

///
//// Bidding System conventions and agreements types
///

export type OneNtOpeningAgreement = '15-17' | '16-18';
export type JumpShiftAgreement = 'weak' | 'strong';
export type MajorOneNtResponseAgreement = 'forcing' | 'nonForcing';
export type TwoLevelNewSuitResponseAgreement = 'standard' | 'twoOverOne';
export type MajorGameForceWithSupportAgreement = 'newSuitThenRaise' | 'jacoby2NT';

/// BiddingSystem is the set of partnership agreements used for the current practice session.
/// It is intentionally a palette of independent choices, not a named-system preset.
///
export interface BiddingSystem {
  // Normal balanced 1NT opening range.
  oneNtOpening: OneNtOpeningAgreement;
  // If true, a balanced hand one HCP below the normal 1NT range can upgrade with a five-card major.
  oneNtFiveCardLengthUpgrade: boolean;
  // Weak versus classic strong jump shifts after a one-level suit opening.
  jumpShift: JumpShiftAgreement;
  // Standard two-level new-suit response versus the 2/1 game-force treatment.
  twoLevelNewSuitResponse: TwoLevelNewSuitResponseAgreement;
  // Whether 1NT over partner's major is completely forcing or may be passed.  With 2/1, the
  // nonForcing choice is the common semi-forcing combination.
  majorOneNtResponse: MajorOneNtResponseAgreement;
  // Game-forcing major support via a new suit then raise, or artificial Jacoby 2NT with 4+ support.
  majorGameForceWithSupport: MajorGameForceWithSupportAgreement;
  // Stayman asks the 1NT or 2NT bidder for a four-card major.
  stayman: boolean;
  // Jacoby transfers use 2D/2H over 1NT, or 3D/3H over 2NT, to show a major.
  jacobyTransfers: boolean;
  // Splinters are double-jump new-suit calls showing support and a singleton or void.
  splinters: boolean;
  // Texas transfers use 4D/4H to transfer to 4H/4S.
  texasTransfers: boolean;
}

export const defaultBiddingSystem: BiddingSystem = {
  oneNtOpening: '15-17',
  oneNtFiveCardLengthUpgrade: false,
  jumpShift: 'strong',
  twoLevelNewSuitResponse: 'standard',
  majorOneNtResponse: 'nonForcing',
  majorGameForceWithSupport: 'newSuitThenRaise',
  stayman: true,
  jacobyTransfers: true,
  splinters: true,
  texasTransfers: true,
};

/// BiddingAgreement is a convention agreement and a value for it, sometimes just a boolean yes/no.
/// Bidding rules declarations can tag a bid rule with an agreement value, and when selecting rules
/// the global defaultBiddingSystem needs to match the agreement setting.  note is a short
/// source-code reminder of the treatment, not evaluator input.
///
export type BiddingAgreement =
  | { setting: 'oneNtOpening'; value: OneNtOpeningAgreement; note?: string }
  | { setting: 'oneNtFiveCardLengthUpgrade'; value: boolean; note?: string }
  | { setting: 'jumpShift'; value: JumpShiftAgreement; note?: string }
  | { setting: 'twoLevelNewSuitResponse'; value: TwoLevelNewSuitResponseAgreement; note?: string }
  | { setting: 'majorOneNtResponse'; value: MajorOneNtResponseAgreement; note?: string }
  | { setting: 'majorGameForceWithSupport'; value: MajorGameForceWithSupportAgreement; note?: string }
  | { setting: 'stayman'; value: boolean; note?: string }
  | { setting: 'jacobyTransfers'; value: boolean; note?: string }
  | { setting: 'splinters'; value: boolean; note?: string }
  | { setting: 'texasTransfers'; value: boolean; note?: string };

/// Our selected 16-18 opening range lowers the 1NT bidder's partner's ordinary response
/// thresholds by one. The same range setting applies after a natural 1NT overcall; do not also
/// adjust for the optional opening upgrade.
export function oneNtResponseHcpShift (system: BiddingSystem): number {
  return system.oneNtOpening === '16-18' ? 1 : 0;
}

/// biddingBaseline records fixed assumptions of the current practice system.  These are mostly
/// machine-readable comments; configurable choices belong in BiddingSystem instead.  If a fixed
/// assumption later becomes useful as a user-configurable agreement, move it to BiddingSystem.
///
export const biddingBaseline = {
  description: 'Standard American / SAYC-like system with selected modern adaptations',
  // Opening fundamentals
  fiveCardMajors: true,
  openingMinPoints: 12,
  convenientMinors: true,
  convenientMinorsDetails:
    'Open longer minor; four cards in both minors, open 1D; three cards in both minors open 1C',
  strong2COpening: true,
  strong2CMinHcp: 22,
  weakTwos: true,
  weakTwoSuitLength: 6,
  weakTwoHcpRange: { min: 5, max: 10 },
  weakThrees: true,
  weakThreeSuitLength: 7,
  // Three-level preempts stay below ordinary one-level opening values in this treatment.
  weakThreeMaxTotalPoints: 11,
  // Gerber is 4C after a notrump opening, asking for aces.
  gerberAfterNotrump: true,
  // 4NT after a notrump opening is quantitative, not Blackwood.
  fourNtAfterNotrumpIsQuantitative: true,
  // Blackwood 4NT asks for aces after a suit auction.
  blackwoodAfterSuitBid: true,
  // Basic responding principles
  oneSuitMinResponsePoints: 6,
  oneSuitMinResponseNewSuitLength: 4,
  oneSuitNewSuitResponseForcing: true,
  oneSuitMinResponseTwoLevelPoints: 11,
  respondConvenientMinorMinCount : 4,
  respondConvenientMinorDetails : "if equal lengths of 4, bid up the line, if 5+, down the line ",
  responseToMinorFourCardMajorsUpTheLine: true,
  // Basic suit lengths implications
  rebidOpeningSuitTypicalMinLength: 6,
  // Hand valuation assumptions
  ordinaryTotalPointsUseLengthPoints: true,
  supportTotalPointsUseShortagePoints: true,
};

///
//// Types for declaring bidding rules
///

export interface BidRule {
  id: string;
  kind: RuleKind;
  title: string;
  auctionContext?: AuctionContext;
  agreement?: BiddingAgreement;
  calls?: Call[];
  callRefinement?: CallRefinementFunction;
  callCategory?: CallCategory[];
  priority?: {
    // Higher rank means greater preference when multiple rules qualify.  Rank affects ordering
    // only; it does not suppress lower-ranked qualifying rules.
    rank?: number;
    note?: string;
  };
  appliesWhen?: HandConstraint | AppliesWhenFunction;
  meaning?: string; // what bidder is conveying to partner
  guidance?: string[]; // bid explanation info as well as how to refine and choose a bid
  // Human-readable alternate treatments or choices worth showing/reviewing.  Not evaluator input.
  alternatives?: string[];
  // Authoring confidence in this rule's modeling, not the probability that a bid is correct.
  certainty: 'high' | 'medium' | 'low';
  // Developer/author notes about source ambiguity, modeling questions, or future cleanup.  Not user
  // advice and not evaluator input.
  reviewNotes?: string[];
}

export type CallCategory =
  | 'forcing' // partner needs to bid if there was no intervening bid
  | 'gameForcing' // must keep bidding until game
  | 'invitational' // partner can bid or pass
  | 'signoff' // asks partner to pass/stop bidding absent interference
  | 'conventional' // stayman, jacoby, etc., often forcing, but if so, 'forcing' will be explicit
  | 'natural'; // face value bid rather than an artificial convention meaning

export type RuleKind =
  | 'valuation'
  | 'openingBid'
  | 'responseBid'
  | 'overcall'
  | 'overcallerRebid'
  | 'advance'
  | 'openerRebid'
  | 'priority'
  | 'rebidGuidance'
  | 'footnote'
  | 'concept';

export interface HandConstraint {
  hcp?: PointRange;
  // For shared calls after partner bids 1NT, shift HCP bounds down one with 16-18 selected.
  hcpRelativeToOneNtOpening?: boolean;
  // computed with length bonuses or shortage bonuses depending on auction stage
  totalPoints?: TotalPointsRange;  
  suitLengths?: SuitLengthConstraint[]; // if no suit specified, it means the candidate call suit
  shape?: HandShapeConstraint;
  // Length in partner's relevant naturally bid suit for this stage.  While responding this is
  // opener's suit; on opener's rebid it is responder's suit; on advancing it is the overcaller's suit.
  supportLength?: PointRange;
}

export interface PointRange {
  min?: number;
  max?: number;
}

/// Ordinary total points use length points.  Support for partner's suit means using shortage
/// points for total points.
export interface TotalPointsRange extends PointRange {
  valuation?: 'length' | 'shortage';
}

export interface SuitLengthConstraint {
  suit?: Strain | 'major' | 'minor';
  min?: number; // inclusive
  max?: number; // inclusive
  exact?: number;
}

export interface HandShapeConstraint {
  balanced?: boolean; // true if distribution is 4-3-3-3, 4-4-3-2, or 5-3-3-2
  // Balanced has three hand shapes, and semibalanced is no fewer than two cards in every suit and
  // no more than two suits with doubletons.
  balancedOrSemiBalanced?: boolean; 
  noVoid?: boolean;
  noSingleton?: boolean;
  maxDoubletons?: number;
  noFourCardMajor?: boolean;
  noFourCardOtherMajor?: boolean;
  noFiveCardMajor?: boolean;
}

export type RuleBidLevel = 1 | 2 | 3 | 4;

export interface ResponderCallContext {
  // kind classifies responder's actual call relative to opener's opening bid.
  // newSuit means a different suit, raise means opener's suit, and notrump means NT.
  // Double and Redouble are explicit artificial competitive calls rather than contract bids.
  kind?: 'newSuit' | 'raise' | 'notrump' | 'double' | 'redouble';
  // level is the absolute bid level, not the size of a jump.
  level?: RuleBidLevel;
  // jump is the number of levels above the cheapest legal bid in responder's strain.  0 requires
  // a non-jump, 1 a single jump, 2 a double jump, and omitted means the rule does not care.
  jump?: 0 | 1 | 2;
}

/// First-opponent-call classification for responder rules.  An unmodeled intervention remains
/// distinct from no intervention, so uncontested treatments cannot silently leak into it.
export type DirectInterference = 'none' | 'suitOvercall' | 'jumpSuitOvercall' |
  'takeoutDouble' | 'notrumpOvercall' | 'other';

/// AuctionContext decides whether a rule belongs to the current auction, not whether the hand qualifies or which call wins.
export interface AuctionContext {
  // stage selects the bidding phase in which the rule can apply.
  stage?: BidStage;
  // Shared natural 1NT calls apply when partner opened 1NT or overcalled 1NT and responder passed.
  // When this is set, stage is deliberately omitted; matching uses the physical auction.
  partnerNaturalOneNt?: boolean;
  // Shared natural calls after two-level natural suit interference over partner's 1NT.
  // Matching uses the physical auction for either the responding or advancing role.
  partnerNaturalOneNtAfterSuitInterference?: boolean;
  // Advancer's systems-on calls after partner naturally overcalls a weak two with 2NT.
  // Matching requires the opening side's responder to pass.
  partnerNaturalTwoNtOverWeakTwo?: boolean;
  // auction is an exact compact partnership call sequence; every listed call must match literally.
  auction?: Call[];
  // description is optional author-facing context and is not evaluator input.
  description?: string;
  // openerCalls restricts opener to one of these exact opening calls.
  openerCalls?: Call[];
  // openerLevel constrains the opening contract level without fixing its strain.
  openerLevel?: RuleBidLevel;
  // openerStrain constrains the opening strain; suit means non-NT, while minor/major match either suit in that family.
  openerStrain?: Strain | 'suit' | 'minor' | 'major';
  // interference restricts a rule to the direct opponent action after opener.  Omitted means any.
  interference?: DirectInterference;
  // Ordinary opener-rebid rules must opt in before they can be reused after opponent interference.
  // Explicit competitive opener-rebid rules instead declare their interference context directly.
  openerRebidAfterInterference?: boolean;
  // responderCall constrains responder's actual call by semantic properties derived from the auction.
  responderCall?: ResponderCallContext;
}

/// appliesWhen decides whether the current hand qualifies for a rule or candidate after auction-context matching.
export type AppliesWhenFunction = (
  call: Call,
  context: RuleEvalContext,
  system: BiddingSystem,
) => AppliesWhenResult;

export interface AppliesWhenResult {
  success: boolean;
  telemetryLines: string[];
}

/// callRefinement narrows or orders a rule's declared calls for the actual auction; it does not decide rule context.
export type CallRefinementFunction = (
  calls: Call[],
  context: RuleEvalContext,
  system: BiddingSystem,
) => CallRefinementResult;

export interface CallRefinementResult {
  // Candidate calls after auction and hand facts constraints applied.  Preserve meaningful
  // preference order when a rule defines one; the evaluator does not assume the first call is
  // uniquely correct.
  calls: Call[];
  telemetryLines: string[];
}

/// RuleEvalContext contains model-derived auction/hand state available to rule functions.
/// React supplies the board and full auction; the bidding model derives seat, stage, and hand.
export interface RuleEvalContext {
  dealer: Seat;
  seat: Seat;
  stage: BidStage | null;
  auction: Call[];
  hand: Hand;
  handFacts: HandFacts;
}

