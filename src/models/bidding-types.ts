/// Core types for the first bridge-trainer convention-data spike.
///


/// A Strain is a suit or NT.
export type Strain = 'C' | 'D' | 'H' | 'S' | 'NT';
/// A suit bid is a level plus denomination, such as 1C, 1H, or 3NT.
export type SuitBid = `${1 | 2 | 3 | 4 | 5 | 6 | 7}${Strain}`;
/// A call is anything a player can say on their turn in the auction.
export type Call =
  | SuitBid
  | "Pass"
  | "Double"
  | "Redouble";
export type Role = 'opener' | 'responder';

export type OneNtOpeningAgreement = '15-17' | '16-18';
export type MinorJumpShiftAgreement = 'weak' | 'strong';
export type MajorOneNtResponseAgreement = 'forcing' | 'nonForcing';
export type MajorGameForceWithSupportAgreement = 'newSuitThenRaise' | 'jacoby2NT';

export interface BiddingSystem {
  oneNtOpening: OneNtOpeningAgreement;
  minorJumpShift: MinorJumpShiftAgreement;
  majorOneNtResponse: MajorOneNtResponseAgreement;
  majorGameForceWithSupport: MajorGameForceWithSupportAgreement;
  stayman: boolean;
  jacobyTransfers: boolean;
}

export const defaultBiddingSystem: BiddingSystem = {
  oneNtOpening: '15-17',
  minorJumpShift: 'strong',
  majorOneNtResponse: 'nonForcing',
  majorGameForceWithSupport: 'newSuitThenRaise',
  stayman: true,
  jacobyTransfers: true,
};

export type BiddingAgreement =
  | { setting: 'oneNtOpening'; value: OneNtOpeningAgreement }
  | { setting: 'minorJumpShift'; value: MinorJumpShiftAgreement }
  | { setting: 'majorOneNtResponse'; value: MajorOneNtResponseAgreement }
  | { setting: 'majorGameForceWithSupport'; value: MajorGameForceWithSupportAgreement }
  | { setting: 'stayman'; value: boolean }
  | { setting: 'jacobyTransfers'; value: boolean };

export const biddingBaseline = {
  description: 'Standard American / SAYC-like system with selected modern adaptations',
  //
  // Opening fundamentals
  fiveCardMajors: true,
  openingMinPoints: 12,
  //openingMaxPointsBeforeStrong2C: 21,
  convenientMinors: true,
  convenientMinorsDetails:
    'Open longer minor; four cards in both minors, open 1D; three cards in both minors open 1C',
  strong2COpening: true,
  strong2CMinHcp: 22,
  //strong2CArtificial: true,
  weakTwos: true,
  // weakTwoSuits: ['D', 'H', 'S'],
  weakTwoMinSuitLength: 6,
  weakTwoPointRange: { min: 5, max: 10 },
  weakThrees: true,
  weakThreeMinSuitLength: 7,
  weakThreePointRange: { min: 6, max: 9 },
  //
  // Basic responding principles
  oneSuitMinResponsePoints: 6,
  oneSuitMinResponseNewSuitLength: 4,
  oneSuitNewSuitResponseForcing: true,
  oneSuitMinResponseTwoLevelPoints: 11,
  respondConvenientMinorMinCount : 4,
  respondConvenientMinorDetails : "if equal lengths of 4, bid up the line, if 5+, down the line ",
  responseToMinorFourCardMajorsUpTheLine: true,
  // Basic suit lengths implications
  RebidOpeningSuitTypicalMinLength: 6,
  // Hand valuation assumptions
  ordinaryTotalPointsUseLengthPoints: true,
  supportTotalPointsUseShortagePoints: true,
} as const; // biddingBaseline as const makes all properties readonly


export type CallCategory =
  | 'forcing'
  | 'gameForcing'
  | 'invitational'
  | 'signoff'
  | 'conventional'
  | 'natural'
  | 'partnershipAgreement';

export type RuleKind =
  | 'valuation'
  | 'openingBid'
  | 'responseBid'
  | 'priority'
  | 'rebidGuidance'
  | 'styleVariant'
  | 'footnote'
  | 'concept';

export interface PointRange {
  min?: number;
  max?: number;
}

export interface SuitLengthConstraint {
  suit?: Strain | 'major' | 'minor';
  min?: number;
  max?: number;
  exact?: number;
}

export interface HandShapeConstraint {
  balanced?: boolean;
  semiBalanced?: boolean;
  noVoid?: boolean;
  noSingleton?: boolean;
  maxDoubletons?: number;
  noFourCardMajor?: boolean;
  noFourCardOtherMajor?: boolean;
  noFiveCardMajor?: boolean;
  text?: string;
}

export interface HandConstraint {
  hcp?: PointRange;
  totalPoints?: PointRange;
  suitLengths?: SuitLengthConstraint[];
  anySuitLength?: SuitLengthConstraint[];
  shape?: HandShapeConstraint;
  supportFor?: Strain | 'partnersOpenedSuit';
  supportLength?: PointRange;
  stoppers?: string[];
}

export interface AuctionContext {
  role: Role;
  // Rule auction contexts are incomplete for the first punch-through.
  // Responder contexts record opener's call only and omit opponent passes or interference.
  auction: Call[];
  description?: string;
  assumesUncontested?: boolean;
  openerStrain?: Strain | 'minor' | 'major';
  responderHasPassedInitially?: boolean;
}

export interface BidRule {
  id: string;
  kind: RuleKind;
  title: string;
  auctionContext?: AuctionContext;
  agreement?: BiddingAgreement;
  calls?: Call[];
  callCategory?: CallCategory[];
  priority?: {
    rank?: number;
    note?: string;
  };
  appliesWhen?: HandConstraint;
  meaning?: string;
  guidance?: string[];
  alternatives?: string[];
  style?: 'modern' | 'classic' | 'twoOverOne' | 'standard' | 'partnershipAgreement';
  certainty: 'high' | 'medium' | 'low';
  reviewNotes?: string[];
}

