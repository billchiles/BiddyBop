/// Core types and current bidding-system settings for the bridge trainer.
///

import type { Hand, HandFacts, Seat, Suit } from './cards';

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
/// A modeled bidding-rule family for the next physical turn, not a seat number or bid count.
/// Each value selects a rule bucket; whether an individual rule qualifies is evaluated later.
export type BidStage =
  | 'opening'
  | 'responding'
  | 'openerRebid'
  | 'responderRebid'
  | 'overcalling'
  | 'balancing'
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
  // scopeBoundaryWhen qualifies a no-candidate stopping point without inventing a bid.
  // Omitted means the boundary applies whenever its auction context matches.
  scopeBoundaryWhen?: ScopeBoundaryWhenFunction;
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
  | 'responderRebid'
  | 'scopeBoundary'
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
  // newSuit means a different suit, raise means opener's suit, and notrump means NT.  Pass is
  // useful when a reviewed competitive family deliberately stops at opener's next decision.
  // Double and Redouble are explicit artificial competitive calls rather than contract bids.
  kind?: 'pass' | 'newSuit' | 'raise' | 'notrump' | 'double' | 'redouble';
  // level is the absolute bid level, not the size of a jump.
  level?: RuleBidLevel;
  // jump is the number of levels above the cheapest legal bid in responder's strain.  0 requires
  // a non-jump, 1 a single jump, 2 a double jump, and omitted means the rule does not care.
  jump?: 0 | 1 | 2;
  // Optional strain family of responder's actual bid, distinct from openerStrain.
  strain?: Strain | 'major' | 'minor';
  // opponentSuit distinguishes an artificial cuebid of a direct suit overcall from a natural
  // responder new-suit bid.  Omitted means the rule does not care about that relationship.
  opponentSuit?: boolean;
}

export type AdvancerCallKind = 'pass' | 'raise' | 'preemptiveRaise' | 'newSuit' | 'notrump' |
  'responsiveDouble' | 'cuebid' | 'redouble' | 'other';

export interface AdvancerCallContext {
  // Advancer's physical call is classified by its competitive meaning, not just its text.
  // An array means any listed meaning is accepted by the rule.
  kind?: AdvancerCallKind | AdvancerCallKind[];
  // level is useful for natural contract actions; omitted means the rule does not care.
  level?: RuleBidLevel;
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
  // At responder's rebid, require opener's actual third partnership call (not merely a 1NT opening).
  openerRebidCall?: Call;
  // At responder's rebid, require a simple two-level repetition of the original one-level
  // opening suit after responder's natural one-level new-suit response.
  openerRepeatedOpeningSuitAtTwo?: boolean;
  // At responder's rebid, require opener to have naturally raised the original one-level major
  // response to this level.  The original response and raise must name the same major.
  openerRaiseResponderMajorTo?: 2 | 3 | 4;
  // responderCall constrains responder's actual call by semantic properties derived from the auction.
  responderCall?: ResponderCallContext;
  // advancerCall constrains the fourth physical call by its competitive meaning.  This is separate
  // from responderCall because the same text can be a raise, cuebid, or natural new suit.
  advancerCall?: AdvancerCallContext;
}

export type ScopeBoundaryWhenFunction = (
  context: RuleEvalContext,
  system: BiddingSystem,
) => AppliesWhenResult;

/// appliesWhen decides whether the current hand qualifies for a rule or candidate after auction-context matching.
export type AppliesWhenFunction = (
  call: Call,
  context: RuleEvalContext,
  system: BiddingSystem,
) => AppliesWhenResult;

export interface AppliesWhenResult {
  success: boolean;
  telemetryLines: string[];
  callEvidence?: CallEvidence;
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
  callEvidence?: CallEvidence;
}

/// RuleEvalContext contains model-derived auction/hand state available to rule functions.
/// React supplies the board and full auction; the bidding model derives seat, stage, and hand.
export interface RuleEvalContext {
  dealer: Seat;
  seat: Seat;
  // Null when this physical turn has no modeled bidding-rule stage.  This alone does not
  // indicate that the bridge auction or recorded practice sequence has ended.
  stage: BidStage | null;
  auction: Call[];
  hand: Hand;
  handFacts: HandFacts;
}

///
//// Call Explanation Types
///

/// Chosen natural suit-overcaller replies after advancer's first uncontested action.
export type NaturalSuitRebidTreatment = 'raise-pass' | 'raise-invite' | 'raise-game' |
  'cue-return' | 'cue-invite' | 'cue-game' | 'new-pass' | 'new-support' | 'new-repeat' |
  'new-nt' | 'new-second-suit' | 'nt-pass' | 'nt-invite' | 'nt-game';

/// Optional evaluation evidence used to explain a particular call. Add fields as rule
/// families need them; not every rule is required to produce evidence.
export interface CallEvidence {
  requirements?: (
    | { kind: 'hcp'; actual: number; min?: number; max?: number; passed: boolean }
    | { kind: 'balanced'; actual: boolean; passed: boolean }
    | { kind: 'rebidShape'; shape: 'balanced' | 'balancedOrSemiBalanced' | 'semiBalancedOnly';
        passed: boolean }
    | { kind: 'fiveCardMajor'; actual: boolean; passed: boolean }
    | { kind: 'totalPoints'; actual: number; hcp?: number; min?: number; max?: number; passed: boolean }
    | { kind: 'partnerSupport'; suit?: Suit; actual: number; min?: number; max?: number; passed: boolean }
    | { kind: 'suitLength'; suit?: Suit; actual: number; exact?: number; min?: number; max?: number; passed: boolean }
    | { kind: 'fourCardMajor'; passed: boolean }
    | { kind: 'topThreeHonors'; suit: Suit; passed: boolean }
    | { kind: 'unbidSuitSupport'; min: number; shortSuits: Suit[]; passed: boolean }
    | { kind: 'openerSuitLength'; actual: number; max: number; passed: boolean }
    | { kind: 'stopper'; suit?: Suit; passed: boolean }
    | { kind: 'minorSupport'; suit: 'C' | 'D'; actual: number; min: number; passed: boolean }
    | { kind: 'noFourCardMajor'; actual: boolean; passed: boolean }
    | { kind: 'responderPreviouslyPassed'; actual: boolean; required: boolean; passed: boolean }
  )[];
  openingSelection?: {
    call: Call;
    reason: 'only-major' | 'longer-major' | 'equal-majors' | 'longer-minor' |
      'equal-four-minors' | 'equal-three-minors' | 'equal-long-minors';
  };
  convenientMinor?: {
    hcp: number;
    totalPoints: number;
    balanced: boolean;
    hasFiveCardMajor: boolean;
  };
  suppressedBy?: Call;
  preemptSuitQuality?: { call: Call; passed: boolean }[];
  balancingSuit?: { call: Call; level: 1 | 2; length: number; good: boolean; passed: boolean }[];
  balancingPass?: { hcp: number; openerSuitLength: number; reason: 'weak' | 'defend' | null };
  naturalOvercallSuit?: { call: Call; level: 1 | 2; length: number; good: boolean; passed: boolean }[];
  naturalOvercallStrength?: { hcp: number; passed: boolean; exceptionalSeven: boolean; min: number };
  weakTwoSuit?: {
    call: Call;
    length: number;
    requiredLength: number;
    good: boolean;
    cheapestCall: Call | null;
    isCheapest: boolean;
    passed: boolean;
  }[];
  jumpOvercallSuit?: { call: Call; length: number; requiredLength: number; good: boolean; passed: boolean }[];
  // Actual tested facts for responder's competitive Double or artificial support action.
  // Facts checked when responding to partner's weak-two opening. A rejected
  // new suit can be absent from candidates, so keep the refiner's checks separately.
  strongTwoCPositiveSuit?: {
    considered: { call: Call; length: number; quality: boolean }[];
  };
  weakTwoResponse?: {
    openingSuit: Suit;
    hcp: number;
    support: number;
    guideline: number;
  };
  weakTwoNewSuit?: {
    considered: { call: Call; length: number; quality: boolean; economical: boolean }[];
    selected: Call | null;
  };
  // Natural notrump response over an opponent's preemptive jump overcall.
  jumpResponseNotrump?: {
    hcp: number;
    balanced: boolean;
    stopper: boolean;
    opponentSuit: Suit;
    minHcp: number;
    maxHcp: number;
  };
  competitiveResponse?: {
    hcp: number;
    minHcp?: number;
    supportPoints?: number;
    minSupportPoints?: number;
    partnerSuit?: Suit;
    partnerSupport?: number;
    minPartnerSupport?: number;
    unbidSuits?: { suit: Suit; length: number; min: number; exact?: number }[];
  };
  dontInitial?: {
    hcp: number;
    lengths: Record<Suit, number>;
    // Quality has already been evaluated with the shared honor test, for suits of 5+ cards.
    qualitySuits: Suit[];
    singleSuit: Suit | null;
    twoSuits: [Suit, Suit] | null;
  };
  majorSupportRoute?: { reason: 'spades-first' | 'one-nt-fallback'; spadeLength: number };
  majorGameForceNewSuit?: {
    reason: 'normal' | 'three-card-minor-fallback' | 'unavailable';
    considered: { call: Call; length: number; requiredLength: number }[];
    retainedCalls: Call[];
  };
  longMajorLimitFallback?: {
    reason: 'shortness' | 'new-suit-available' | 'qualified';
    alternativeCalls: Call[];
    alternativeIsRareThreeCardMinor?: boolean;
  };
  majorNoSupportNewSuit?: {
    orderedCalls: Call[];
    considered: { call: Call; length: number }[];
  };
  takeoutSuitSelection?: {
    jump: 0 | 1;
    openingLevel: number;
    hasFourCardUnbidSuit: boolean;
    considered: { call: Call; length: number; cheapest: Call | null; eligible: boolean }[];
    retainedCalls: Call[];
  };
  takeoutMajorGame?: {
    considered: { call: Call; length: number; eligible: boolean }[];
  };
  // First rebid after a one-level suit opening and a 1NT response. The evaluator
  // records auction and hand facts; rule-specific tested thresholds remain in requirements.
  openerOneNtRebid?: {
    openingSuit: Suit;
    openingLength: number;
    rebidSuit: Suit | null;
    rebidLength: number;
    hcp: number;
    totalPoints: number;
    lengthPoints: number;
    balanced: boolean;
    balancedOrSemiBalanced: boolean;
    previouslyPassed: boolean;
    forcingOneNt: boolean;
  };
  // Observations for opener's first rebid after Jacoby 2NT, a splinter, or a jump shift.
  // Eligibility remains exclusively with the corresponding bidding rule and refiner.
  openerConventionalRebid?: {
    openingSuit: Suit;
    responseSuit: Suit | null;
    bidSuit: Suit | null;
    bidSuitLength: number;
    responseSupport: number;
    topFourHonors: number;
    splinterWastedHcp: number;
    splinterWorkingHcp: number;
    sideControl: 'ace' | 'king' | 'singleton' | 'void' | null;
  };
  // Opener's facts after responder's natural game-forcing three-level new suit.
  // The evaluated rules still decide fit, shape, stopper tests and call legality.
  openerThreeLevelGameForceRebid?: {
    openingSuit: Suit;
    openingLength: number;
    responderSuit: Suit;
    responseSupport: number;
    advancerCall: Call;
    opponentSuits: Suit[];
    unstoppedSuits: Suit[];
  };
  // Auction facts for the selected minimum Passes after weak competitive responses.
  openerWeakCompetitiveRebid?: {
    openingSuit: Suit;
    responseCall: Call;
    responseSuit: Suit | null;
  };
  // Auction facts for opener's natural notrump-response continuations after a suit overcall.
  // The rule declarations, not these facts, decide which call qualifies.
  openerCompetitiveNaturalNtRebid?: {
    openingSuit: Suit;
    openingLength: number;
    opponentSuit: Suit;
    responseCall: Call;
    currentContract: Call;
  };
  // Auction observations used to explain opener's response to artificial support bids.
  // Call eligibility and point ranges remain defined by the bidding rules.
  openerArtificialSupportRebid?: {
    openingSuit: Suit;
    openingLength: number;
    responderCall: Call;
    advancerCall: Call | null;
  };
  // Observations for opener's rebid after a competitive forcing new-suit response.
  // Rule declarations and refiners remain the authority for qualification.
  openerCompetitiveForcingRebid?: {
    openingSuit: Suit;
    responseSuit: Suit;
    responseLevel: number;
    responseMinLength: number;
    openingLength: number;
    responseSupport: number;
    requiredSupport: number;
    rebidSuit: Suit | null;
    rebidLength: number;
    afterAdvancerAction: boolean;
  };
  openerTwoLevelNewSuitRebid?: {
    agreement: 'standard' | 'twoOverOne';
    openingSuit: Suit;
    responseSuit: Suit;
    rebidSuit: Suit | null;
    openingLength: number;
    responseSupport: number;
    rebidLength: number;
    hcp: number;
    lengthPoints: number;
    shortagePoints: number;
    totalLengthPoints: number;
    totalShortagePoints: number;
    balanced: boolean;
    balancedOrSemiBalanced: boolean;
  };
  openerFiveCardMajorFallback?: 'eligible' | 'support-or-notrump' | 'economical-second-suit';
  openerOneNtFallback?: 'three-card-minor' | 'two-card-club';
  // First rebid after an uncontested, forcing one-level new-suit response.
  // The tested point and shape thresholds remain in requirements.
  openerOneLevelNewSuitRebid?: {
    openingSuit: Suit;
    responseSuit: Suit;
    rebidSuit: Suit | null;
    openingLength: number;
    responseSupport: number;
    rebidLength: number;
    hcp: number;
    lengthPoints: number;
    shortagePoints: number;
    totalLengthPoints: number;
    totalShortagePoints: number;
    balanced: boolean;
  };
  openerFiveCardMinorFallback?: 'eligible' | 'support-or-notrump' | 'economical-second-suit';
  openerMinorOneNtSecondSuitAvailable?: boolean;
  ntOvercallerRebid?: {
    kind: 'interfered' | 'invitation' | 'minor' | 'major';
    treatment: string;
    advance: Call | null | undefined;
    hcp: number;
    cutoff?: number;
    invitation?: '2NT' | '4NT';
    minor?: Suit;
    topHonor?: boolean;
    major?: Suit;
    support?: number;
    originalSuit?: Suit;
    responderSuit?: Suit;
  };
  weakTwoDefenseRebid?: {
    defense: 'Double' | 'suit';
    action: string;
    advanceKind: string;
    openingSuit: Suit;
    advanceSuit: Suit | null;
    overcallSuit?: Suit;
    hcp: number;
    supportPoints: number;
    support: number;
    ownLength: number;
    ordinary: boolean;
    strong: boolean;
    balanced: boolean;
    stopped: boolean;
    rejection?: 'strength' | 'length' | 'support' | 'shape' | 'stopper';
  };
  takeoutDoublerRebid?: {
    treatment: string;
    advanceKind: string;
    openingSuit: Suit;
    partnerSuit: Suit | null;
    hcp: number;
    supportPoints: number;
    support: number;
    ordinary: boolean;
    strong: boolean;
    balanced: boolean;
    stopped: boolean;
    chosenFit: Suit | null;
    chosenFitLength: number;
    bidSuitLength: number;
    rejection?: 'strength' | 'support' | 'shape' | 'stopper' | 'forcing';
  };
  contestedSuitOvercallerRebid?: {
    treatment: string;
    responderKind: 'raise' | 'natural' | 'negativeDouble';
    advanceKind: string;
    overcallSuit: Suit;
    overcallLevel: 1 | 2;
    openingSuit: Suit;
    responderSuit: Suit | null;
    advanceSuit: Suit | null;
    hcp: number;
    overcallLength: number;
    support: number;
    balanced: boolean;
    stopped: boolean;
    stoppedSuits: { suit: Suit; stopped: boolean }[];
    secondSuit: Suit | null;
    secondSuitLength: number;
    preferredResponsiveCall: Call | null;
    selectedSuitLength: number;
    minHcp?: number;
    maxHcp?: number;
    minOvercallLength?: number;
    minSupport?: number;
    minSecondSuitLength?: number;
    rejection?: 'strength' | 'support' | 'length' | 'balanced' | 'stopper' |
      'preferFit' | 'preferRepeat' | 'upLine';
  };
  naturalResponderRebid?: {
    family: 'economical' | 'majorOneNt' | 'minorOneNt' | 'twoOverOne' |
      'standardTwoLevel' | 'strongSecondSuit' | 'strongJumpShift';
    decision: string;
    hcp: number;
    lengthPoints: number;
    supportPoints: number;
    balanced: boolean;
    openingSuit: Suit;
    responseSuit: Suit | null;
    rebidSuit: Suit | null;
    openingLength: number;
    responseLength: number;
    rebidLength: number;
    missingStoppers?: Suit[];
    // A previously shown five-card major may have a known fit even if the selected
    // notrump continuation does not treat that fit as overriding.
    knownMajorFit?: boolean;
    forceKind?: 'reverse' | 'jumpShift';
    openerRebid?: string;
    success: boolean;
  };
  conventionalResponderRebid?: {
    family: 'ntConvention' | 'majorGameTry' | 'strongTwoC' | 'majorSupport' | 'openerSplinter';
    decision: string;
    hcp: number;
    supportPoints: number;
    balanced: boolean;
    opening: Call | null;
    openerRebid: Call | null;
    major: Suit | null;
    majorLength: number;
    shortSuit: Suit | null;
    helpSuit: Suit | null;
    usefulHelp: boolean;
    fitFound: boolean;
    success: boolean;
  };
  naturalSuitOvercallerRebid?: {
    treatment: NaturalSuitRebidTreatment;
    advanceKind: 'simpleRaise' | 'weakJumpRaise' | 'supportCuebid' |
      'nonforcingNewSuit' | 'forcingNewSuit' | 'oneNt' | 'twoNt' | 'threeNt';
    overcallSuit: Suit;
    overcallLevel: 1 | 2;
    openingSuit: Suit;
    advanceSuit: Suit | null;
    hcp: number;
    overcallLength: number;
    support: number;
    balanced: boolean;
    openerStopper: boolean;
    secondSuit: Suit | null;
    secondSuitLength: number;
    minHcp?: number;
    maxHcp?: number;
    minOvercallLength?: number;
    minSupport?: number;
    minSecondSuitLength?: number;
    rejection?: 'strength' | 'overcallLength' | 'support' | 'preferSupport' |
      'preferRepeat' | 'balanced' | 'stopper' | 'secondSuitLength' | 'forcingPass';
  };
  advancePass?: {
    level: 1 | 2;
    hcp: number;
    hasRaise: boolean;
    hasNotrump: boolean;
    hasNewSuit: boolean;
  };
  advanceNewSuitQuality?: {
    considered: { call: Call; length: number; economical: boolean; qualityPassed: boolean }[];
  };
  dontAdvance?: {
    partnerCall: Call;
    selectedCall: Call;
    reason: 'single-suit-relay' | 'club-fit' | 'ask-higher-suit' |
      'diamond-fit' | 'ask-major' | 'heart-preference' | 'spade-preference' |
      'natural-spades';
    clubLength: number;
    diamondLength: number;
    heartLength: number;
    spadeLength: number;
  };
  jumpAdvance?: {
    overcallLevel: 2 | 3 | 4;
    trumpSuit: Suit;
    support: number;
    hcp: number;
    supportPoints: number;
    passReason?: 'four-level' | 'limited-no-fit' | null;
    considered?: {
      call: Call;
      length: number;
      requiredLength?: number;
      economical?: boolean;
      qualityPassed?: boolean;
      eligible: boolean;
    }[];
  };
  competitiveRaisePass?: {
    partnerAction: 'overcall' | 'takeoutDouble';
    hcp: number;
    hasRaise: boolean;
    hasResponsiveDouble: boolean;
    hasNewSuit: boolean;
  };
  competitiveRaiseNewSuit?: {
    considered: { call: Call; length: number; economical: boolean; qualityPassed: boolean }[];
  };
  responsiveDouble?: {
    partnerAction: 'overcall' | 'takeoutDouble';
    points: number;
    min: number;
    max?: number;
    partnerSupport?: number;
    unbidSuits: { suit: Suit; length: number }[];
    passed: boolean;
  };
  competitiveNaturalPass?: {
    partnerAction: 'overcall' | 'takeoutDouble';
    hcp: number;
    lengthPoints: number;
    hasRaise: boolean;
    hasNewSuit: boolean;
    hasNotrump: boolean;
  };
  competitiveNaturalNewSuit?: {
    considered: { call: Call; length: number; economical: boolean; qualityPassed: boolean }[];
  };
  competitiveNotrump?: {
    levelAllowed: boolean;
  };
  negativeDoublePass?: {
    hcp: number;
    hasSupportAction: boolean;
    hasNaturalNotrump: boolean;
    hasNewSuit: boolean;
  };
  negativeDoubleNewSuit?: {
    impliedSuits: Suit[];
    considered: { call: Call; suit: Suit; length: number; economical: boolean;
                  impliedByDouble: boolean }[];
  };
  negativeDoubleRedouble?: {
    hcp: number;
    hasSupportCuebid: boolean;
    hasNaturalNotrump: boolean;
    hasNewSuit: boolean;
  };
  redoubledTakeoutEscape?: {
    openingSuit: Suit;
    hasFourCardUnbidSuit: boolean;
    considered: { call: Call; length: number; cheapest: Call | null; eligible: boolean }[];
    retainedCalls: Call[];
  };
  jumpShift?: {
    treatment: JumpShiftAgreement;
    hcp: number;
    considered: { call: Call; length: number; suitHcp: number }[];
    selectedCall: Call | null;
    ordinaryCall?: Call;
    reason: 'qualified' | 'no-long-suit' | 'two-long-suits' | 'insufficient-suit-hcp';
    longNewSuits: Suit[];
  };
  minorResponseSelection?: {
    preferredCall: Call | null;
    retainedCalls: Call[];
    considered: { call: Call; length: number }[];
    reason: 'no-four-card-suit' | 'major-first' | 'equal-four-majors' |
      'equal-long-majors' | 'longer-major' | 'longest-suit';
    longerDiamondAlternative: boolean;
  };
}

