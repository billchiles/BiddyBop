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

/// MAYBE DELETE
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
  dummyPoints?: PointRange;
  distributionPoints?: PointRange;
  suitLengths?: SuitLengthConstraint[];
  anySuitLength?: SuitLengthConstraint[];
  shape?: HandShapeConstraint;
  supportFor?: Strain | 'partnersOpenedSuit';
  supportLength?: PointRange;
  stoppers?: string[];
}

export interface AuctionContext {
  role: Role;
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
  context?: AuctionContext;
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

