/// Responder's selected natural second decisions.
import type { BidRule } from './bidding-types';
import { refineResponderOriginalOneLevelSuit, responderMinimumRepeatedSuitPassApplies,
         responderRepeatedSuitThreeNtApplies, responderSevenSpadeGameApplies,
         getResponderEconomicalSecondSuit, refineResponderEconomicalSuit,
         responderEconomicalDecisionApplies, getResponderStrongSecondSuit,
         responderStrongSecondSuitGameApplies, responderStrongTwoNtThreeNtApplies,
         getResponderAfterMajorOneNt, refineResponderAfterMajorOneNt,
         responderAfterMajorOneNtApplies, getResponderAfterMajorOneNtStrong,
         responderAfterMajorOneNtStrongApplies, refineResponderAfterMajorOneNtStrongGame,
         responderAfterMinorOneNtApplies, getResponderStandardTwoLevel,
         refineResponderStandardTwoLevel, responderStandardTwoLevelApplies, getResponderTwoOverOne,
         refineResponderTwoOverOneSuit, responderTwoOverOneApplies,
         responderTwoOverOneReachedGame, getResponderNtConvention,
         refineResponderNtConventionalMajor, responderNtConventionApplies, getResponderStrongTwoC,
         responderStrongTwoCDecisionApplies, refineResponderStrongTwoCMajorGame,
         getResponderMajorSupportConvention, responderMajorSupportConventionApplies,
         refineResponderSupportMajorGame, getResponderAfterMajorGameTry,
         refineResponderMajorGameTry, responderMajorGameTryApplies } from './responder-rebidding-functions';

export const ResponderRebidRules: BidRule[] = [
  //// Selected strong 2C responder continuations (no slam bidding system)
  {
    id: 'responder-rebid-strong-2c-waiting-pass-2nt', kind: 'responderRebid',
    title: 'Pass a minimum balanced 2NT rebid after strong 2C waiting',
    auctionContext: { stage: 'responderRebid', openerCalls: ['2C'] },
    calls: ['Pass'], callCategory: ['natural', 'signoff'],
    appliesWhen: (call, context) => responderStrongTwoCDecisionApplies(call, context, 'passMinimumNt'),
    meaning: 'After 2C–2D–2NT, opener has shown 22–24 balanced HCP; with 0–2 HCP, 2NT may be the practical contract.',
    guidance: ['Unlike an unbalanced suit rebid by the strong opener, this 2NT rebid is nonforcing.'],
    certainty: 'high',
  },
  {
    id: 'responder-rebid-strong-2c-waiting-game-3nt', kind: 'responderRebid',
    title: 'Raise a balanced 22–24 HCP rebid to 3NT',
    auctionContext: { stage: 'responderRebid', openerCalls: ['2C'] },
    calls: ['3NT'], callCategory: ['natural', 'signoff'],
    appliesWhen: (call, context) => responderStrongTwoCDecisionApplies(call, context, 'gameMinimumNt'),
    meaning: 'After 2C–2D–2NT, balanced 4–9 HCP ordinarily supplies enough for notrump game.',
    guidance: ['With exactly three HCP, a long suit or exceptional distribution, the game choice is borderline; ' +
               'do not treat the point threshold as a guarantee of nine tricks.'],
    certainty: 'medium',
  },
  {
    id: 'responder-rebid-strong-2c-waiting-pass-3nt', kind: 'responderRebid',
    title: 'Pass a 25–27 HCP balanced 3NT game rebid after waiting',
    auctionContext: { stage: 'responderRebid', openerCalls: ['2C'] },
    calls: ['Pass'], callCategory: ['signoff'],
    appliesWhen: (call, context) => responderStrongTwoCDecisionApplies(call, context, 'passGameNt'),
    meaning: 'Opener has placed the partnership in 3NT with 25–27 balanced HCP.',
    guidance: ['With substantial additional responder strength, do not assume game is the final contract.'],
    certainty: 'high',
  },
  {
    id: 'responder-rebid-strong-2c-positive-pass-3nt', kind: 'responderRebid',
    title: 'Accept a natural 3NT game after a positive strong 2C response',
    auctionContext: { stage: 'responderRebid', openerCalls: ['2C'] },
    calls: ['Pass'], callCategory: ['natural', 'signoff'],
    appliesWhen: (call, context) => responderStrongTwoCDecisionApplies(call, context, 'positiveGameNt'),
    meaning: 'A natural 3NT rebid has reached game after an 8+ HCP positive response.',
    guidance: ['This rule is limited to balanced minimum-positive hands; evaluate stronger ' +
               'hands and special suit fits individually for slam interest.'],
    certainty: 'medium',
  },
  {
    id: 'responder-rebid-strong-2c-positive-major-game', kind: 'responderRebid',
    title: 'Raise opener’s fit for a positive major to game',
    auctionContext: { stage: 'responderRebid', openerCalls: ['2C'] },
    calls: ['4H', '4S'], callRefinement: refineResponderStrongTwoCMajorGame,
    callCategory: ['natural', 'signoff'],
    appliesWhen: (call, context) => responderStrongTwoCDecisionApplies(call, context, 'positiveMajorGame'),
    meaning: 'Opener raised responder’s positive five-card major with three-card support; game is forced.',
    guidance: ['The major fit is established. Larger positive holdings may justify further slam judgment.'],
    certainty: 'high',
  },
  {
    id: 'responder-rebid-boundary-after-strong-2c', kind: 'scopeBoundary',
    title: 'Strong 2C: forcing suit continuations and unmodeled slam judgment',
    auctionContext: { stage: 'responderRebid', openerCalls: ['2C'] },
    scopeBoundaryWhen: (context) => ({
      success: getResponderStrongTwoC(context) !== null,
      telemetryLines: ['Recognize the strong 2C response and opener’s first rebid.'],
    }),
    meaning: 'After 2C–2D, opener’s natural suit rebid remains forcing even with a weak responder. ' +
             'An immediate positive response makes the partnership game forcing.',
    guidance: ['Do not Pass a forcing suit rebid below game. Continue describing support, ' +
               'your longest suit or stoppers, without assuming an artificial waiting bid.',
               'The 28–30 HCP 4NT rebid after a waiting 2D is natural and quantitative, not Blackwood. ' +
               'Special distribution, a borderline 2NT game decision or slam interest requires judgment.'],
    certainty: 'high',
  },
  //// Jacoby 2NT and responder splinter: terminate in agreed major when appropriate.
  // Opener 3NT following Jacoby 2NT is an artificial medium-strength rebid, NOT a
  // proposed 3NT contract. The agreed major must remain trump.
  {
    id: 'responder-rebid-jacoby-2nt-major-game', kind: 'responderRebid',
    title: 'Return to major game after a descriptive Jacoby 2NT rebid',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'major' },
    agreement: { setting: 'majorGameForceWithSupport', value: 'jacoby2NT' },
    calls: ['4H', '4S'], callRefinement: refineResponderSupportMajorGame,
    callCategory: ['natural', 'signoff'],
    appliesWhen: (call, context, system) =>
      responderMajorSupportConventionApplies(call, context, system, 'returnToGame', 'jacoby2NT'),
    meaning: 'Choose game in the agreed major with an ordinary minimum game-force raise.',
    guidance: ['Opener’s 3NT shows medium strength by convention: it is not a natural 3NT signoff.',
               'After a strong 3M, descriptive shortness, or a side suit, slam prospects depend on ' +
               'working honors; a 4M game choice remains available if the level permits.'],
    certainty: 'medium',
  },
  {
    id: 'responder-rebid-jacoby-2nt-pass-major-game', kind: 'responderRebid',
    title: 'Pass opener’s major game after Jacoby 2NT',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'major' },
    agreement: { setting: 'majorGameForceWithSupport', value: 'jacoby2NT' },
    calls: ['Pass'], callCategory: ['signoff'],
    appliesWhen: (call, context, system) =>
      responderMajorSupportConventionApplies(call, context, system, 'passGame', 'jacoby2NT'),
    meaning: 'Opener’s 4M has already fulfilled the Jacoby 2NT game force.',
    guidance: ['Higher values or working controls may make slam worth investigating.'],
    certainty: 'high',
  },
  {
    id: 'responder-rebid-boundary-after-jacoby-2nt', kind: 'scopeBoundary',
    title: 'Further game-force or slam judgment after Jacoby 2NT',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'major' },
    agreement: { setting: 'majorGameForceWithSupport', value: 'jacoby2NT' },
    scopeBoundaryWhen: (context, system) => ({
      success: getResponderMajorSupportConvention(context, system)?.kind === 'jacoby2NT',
      telemetryLines: ['Check the artificial Jacoby 2NT game-force sequence.'],
    }),
    meaning: 'The four-card major fit is agreed and the auction is game forcing.',
    guidance: ['Opener’s 3NT is a medium-strength conventional message, not a notrump signoff.',
               'If opener has bid a side suit above four of the agreed major, returning to ' +
               'the major may require the five level. Do not invent an illegal 4M call.',
               'Further control bidding and slam decisions are outside executable coverage.'],
    certainty: 'high',
  },
  {
    id: 'responder-rebid-splinter-major-game', kind: 'responderRebid',
    title: 'Settle in agreed major game after a splinter continuation',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'major' },
    agreement: { setting: 'splinters', value: true },
    calls: ['4H', '4S'], callRefinement: refineResponderSupportMajorGame,
    callCategory: ['natural', 'signoff'],
    appliesWhen: (call, context, system) =>
      responderMajorSupportConventionApplies(call, context, system, 'returnToGame', 'splinter'),
    meaning: 'Responder’s splinter established the fit and game force; returning to 4M declines further slam exploration.',
    guidance: ['Consider how opener’s side-suit control works opposite responder’s shortness.'],
    certainty: 'medium',
  },
  {
    id: 'responder-rebid-splinter-pass-major-game', kind: 'responderRebid',
    title: 'Pass agreed major game after opener declines a splinter slam try',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'major' },
    agreement: { setting: 'splinters', value: true },
    calls: ['Pass'], callCategory: ['signoff'],
    appliesWhen: (call, context, system) =>
      responderMajorSupportConventionApplies(call, context, system, 'passGame', 'splinter'),
    meaning: 'Opener bid the agreed major game after the splinter. The partnership has reached game.',
    certainty: 'high',
  },
  {
    id: 'responder-rebid-boundary-after-splinter', kind: 'scopeBoundary',
    title: 'Further slam judgment after responder’s splinter',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'major' },
    agreement: { setting: 'splinters', value: true },
    scopeBoundaryWhen: (context, system) => ({
      success: getResponderMajorSupportConvention(context, system)?.kind === 'splinter',
      telemetryLines: ['Check the natural major opening and responder double-jump splinter.'],
    }),
    meaning: 'The splinter established a game force, major support and shortness in the bid side suit.',
    guidance: ['Partner’s below-game control bid shows slam interest; do not Pass it.',
               'High-card values opposite responder’s short suit may be wasted. Where slam remains ' +
               'plausible, further control decisions are outside the chosen teaching scope.'],
    certainty: 'high',
  },
  //// Responder after Stayman over a natural 1NT or 2NT opening
  // Keep these at the responder-rebid stage; they do not initiate a further auction stage.
  // The initial Stayman response already promises at least one four-card major and the
  // initial strength floor. Here the shown major must *actually* fit responder's hand.
  {
    id: 'responder-rebid-1nt-stayman-invite-2nt',
    kind: 'responderRebid', title: 'Invite 3NT when Stayman finds no major fit',
    auctionContext: { stage: 'responderRebid', openerCalls: ['1NT'] },
    agreement: { setting: 'stayman', value: true },
    calls: ['2NT'], callCategory: ['natural', 'invitational'],
    appliesWhen: (call, context, system) => responderNtConventionApplies(call, context, system, 'staymanInviteNt'),
    meaning: 'No four-four major fit; invite game with 8–9 HCP opposite 15–17 (7–8 opposite 16–18).',
    guidance: ['Opener may accept with suitable maximum values.'], certainty: 'high',
  },
  {
    id: 'responder-rebid-1nt-stayman-game-3nt',
    kind: 'responderRebid', title: 'Choose 3NT after Stayman without a major fit',
    auctionContext: { stage: 'responderRebid', openerCalls: ['1NT'] },
    agreement: { setting: 'stayman', value: true },
    calls: ['3NT'], callCategory: ['natural', 'signoff'],
    appliesWhen: (call, context, system) => responderNtConventionApplies(call, context, system, 'staymanGameNt'),
    meaning: 'No discovered four-four major fit; choose notrump game with ordinary game-going values.',
    certainty: 'high',
  },
  {
    id: 'responder-rebid-1nt-stayman-invite-major',
    kind: 'responderRebid', title: 'Invite game in the Stayman major fit',
    auctionContext: { stage: 'responderRebid', openerCalls: ['1NT'] },
    agreement: { setting: 'stayman', value: true },
    calls: ['3H', '3S'],
    callRefinement: (calls, context) => refineResponderNtConventionalMajor(calls, context, 3),
    callCategory: ['natural', 'invitational'],
    appliesWhen: (call, context, system) => responderNtConventionApplies(call, context, system, 'staymanInviteMajor'),
    meaning: 'Four-card support for the major opener showed; invite game with invitational strength.',
    guidance: ['Opener can Pass at three with a minimum or bid major game with suitable ' +
               'maximum values and a useful fit.'],
    certainty: 'high',
  },
  {
    id: 'responder-rebid-1nt-stayman-game-major',
    kind: 'responderRebid', title: 'Bid game in the Stayman major fit',
    auctionContext: { stage: 'responderRebid', openerCalls: ['1NT'] },
    agreement: { setting: 'stayman', value: true },
    calls: ['4H', '4S'],
    callRefinement: (calls, context) => refineResponderNtConventionalMajor(calls, context, 4),
    callCategory: ['natural', 'signoff'],
    appliesWhen: (call, context, system) => responderNtConventionApplies(call, context, system, 'staymanGameMajor'),
    meaning: 'Opener showed four of this major; responder has four or more, so choose major game.',
    certainty: 'high',
  },
  {
    id: 'responder-rebid-2nt-stayman-game-3nt',
    kind: 'responderRebid', title: 'Choose 3NT when 2NT Stayman finds no major fit',
    auctionContext: { stage: 'responderRebid', openerCalls: ['2NT'] },
    agreement: { setting: 'stayman', value: true },
    calls: ['3NT'], callCategory: ['natural', 'signoff'],
    appliesWhen: (call, context, system) => responderNtConventionApplies(call, context, system, 'stayman2NtGameNt'),
    meaning: 'No four-four major fit; choose 3NT with the ordinary 4–10 HCP game-response range.',
    certainty: 'high',
  },
  {
    id: 'responder-rebid-2nt-stayman-game-major',
    kind: 'responderRebid', title: 'Choose major game after 2NT Stayman finds a fit',
    auctionContext: { stage: 'responderRebid', openerCalls: ['2NT'] },
    agreement: { setting: 'stayman', value: true },
    calls: ['4H', '4S'],
    callRefinement: (calls, context) => refineResponderNtConventionalMajor(calls, context, 4),
    callCategory: ['natural', 'signoff'],
    appliesWhen: (call, context, system) => responderNtConventionApplies(call, context, system, 'stayman2NtGameMajor'),
    meaning: 'Bid four of the matched major opposite a 20–21 HCP 2NT opening.',
    certainty: 'high',
  },
  {
    id: 'responder-rebid-boundary-after-nt-stayman',
    kind: 'scopeBoundary', title: 'Further Stayman judgment or slam investigation',
    auctionContext: { stage: 'responderRebid', openerStrain: 'NT' },
    agreement: { setting: 'stayman', value: true },
    scopeBoundaryWhen: (context) => ({
      success: getResponderNtConvention(context)?.convention === 'stayman',
      telemetryLines: ['Stayman response completed; check the selected natural continuations.'],
    }),
    meaning: 'Continue after Stayman according to the major fit and game strength.',
    guidance: ['With no matching major, consider a natural notrump invitation or game. With a ' +
               'matching four-card major, consider three of the major as an invitation after 1NT ' +
               'or four of the major to play with game values.',
               'Unusual distribution, alternative major-suit continuations, and slam ' +
               'investigation are outside these selected executable decisions.'],
    certainty: 'high',
  },
  //// Responder after opener completes a Jacoby major transfer
  {
    id: 'responder-rebid-nt-transfer-pass-weak',
    kind: 'responderRebid', title: 'Pass the completed major transfer with a weak hand',
    auctionContext: { stage: 'responderRebid', openerStrain: 'NT' },
    agreement: { setting: 'jacobyTransfers', value: true },
    calls: ['Pass'], callCategory: ['signoff'],
    appliesWhen: (call, context, system) => responderNtConventionApplies(call, context, system, 'transferPass'),
    meaning: 'Opener has completed the artificial transfer. With weak values, play the major partscore.',
    certainty: 'high',
  },
  {
    id: 'responder-rebid-1nt-transfer-invite-2nt',
    kind: 'responderRebid', title: 'Invite game in notrump after a five-card transfer',
    auctionContext: { stage: 'responderRebid', openerCalls: ['1NT'] },
    agreement: { setting: 'jacobyTransfers', value: true },
    calls: ['2NT'], callCategory: ['natural', 'invitational'],
    appliesWhen: (call, context, system) => responderNtConventionApplies(call, context, system, 'transferInviteNt'),
    meaning: 'With a balanced five-card major and invitational values, offer opener a choice of games.',
    guidance: ['With three-card support opener may prefer the major; otherwise consider 2NT or 3NT.'],
    certainty: 'high',
  },
  {
    id: 'responder-rebid-1nt-transfer-invite-major',
    kind: 'responderRebid', title: 'Invite major game after transferring with six or more cards',
    auctionContext: { stage: 'responderRebid', openerCalls: ['1NT'] },
    agreement: { setting: 'jacobyTransfers', value: true },
    calls: ['3H', '3S'],
    callRefinement: (calls, context) => refineResponderNtConventionalMajor(calls, context, 3),
    callCategory: ['natural', 'invitational'],
    appliesWhen: (call, context, system) => responderNtConventionApplies(call, context, system, 'transferInviteMajor'),
    meaning: 'A six-card major supports a natural invitation at the three level.',
    guidance: ['With the long major already known, opener decides whether to Pass or accept ' +
               'game according to the notrump range and the quality of the fit.'],
    certainty: 'high',
  },
  {
    id: 'responder-rebid-nt-transfer-game-3nt',
    kind: 'responderRebid', title: 'Offer 3NT after a five-card major transfer',
    auctionContext: { stage: 'responderRebid', openerStrain: 'NT' },
    agreement: { setting: 'jacobyTransfers', value: true },
    calls: ['3NT'], callCategory: ['natural', 'signoff'],
    appliesWhen: (call, context, system) => responderNtConventionApplies(call, context, system, 'transferGameNt'),
    meaning: 'With balanced game values and only five in the transferred major, offer 3NT.',
    guidance: ['Opener can choose four of the major with three-card support.'],
    certainty: 'high',
  },
  {
    id: 'responder-rebid-nt-transfer-game-major-no-texas',
    kind: 'responderRebid', title: 'Bid major game after a completed transfer without Texas',
    auctionContext: { stage: 'responderRebid', openerStrain: 'NT' },
    agreement: { setting: 'jacobyTransfers', value: true },
    calls: ['4H', '4S'],
    callRefinement: (calls, context) => refineResponderNtConventionalMajor(calls, context, 4),
    callCategory: ['natural', 'signoff'],
    appliesWhen: (call, context, system) => responderNtConventionApplies(call, context, system, 'transferGameMajor'),
    meaning: 'With six or more cards and game strength, place the contract in the major.',
    guidance: ['With Texas enabled a direct Texas transfer is the fast game route; a Jacoby ' +
               'transfer followed by four of the major may convey additional slam interest.'],
    certainty: 'high',
  },
  {
    id: 'responder-rebid-boundary-after-nt-transfer',
    kind: 'scopeBoundary', title: 'Further Jacoby-transfer continuations',
    auctionContext: { stage: 'responderRebid', openerStrain: 'NT' },
    agreement: { setting: 'jacobyTransfers', value: true },
    scopeBoundaryWhen: (context) => ({
      success: getResponderNtConvention(context)?.convention === 'jacoby',
      telemetryLines: ['Completed Jacoby transfer; check selected continuations.'],
    }),
    meaning: 'A completed transfer establishes a natural major-suit option for responder.',
    guidance: ['Weak responder hands usually pass the completion; invitational hands with ' +
               'five majors may bid 2NT after 1NT, while six-card majors can invite at three.',
               'With Texas transfers enabled, the direct Texas route describes a routine ' +
               'six-card-major game signoff. A Jacoby transfer followed by four of that major ' +
               'can have a different, slam-interest meaning; this is not automatically recommended.',
               'Further slam-oriented, two-suited, and judgment-dependent continuations are ' +
               'not modeled.'],
    certainty: 'high',
  },
  //// Responder after a natural 2/1 game-forcing new-suit response
  // Opener's economical rebid has not released the game force. These continuations
  // distinguish a selected game placement from a forcing, descriptive second bid.
  {
    id: 'responder-rebid-two-over-one-opening-major-game',
    kind: 'responderRebid',
    title: "Choose game in opener's six-card major",
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'major',
                      responderCall: { kind: 'newSuit', level: 2, jump: 0 } },
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'twoOverOne' },
    calls: ['4H', '4S'],
    callRefinement: (calls, context) => refineResponderTwoOverOneSuit(calls, context, 'openingGame'),
    callCategory: ['natural', 'signoff'],
    appliesWhen: (call, context) => responderTwoOverOneApplies(call, context, 'openingGame'),
    meaning: "With a known eight-card fit, choose game in opener's six-card major; the two-card preference is enough.",
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-two-over-one-slow-major-raise',
    kind: 'responderRebid',
    title: "Show extra values and opener-major support without jumping to game",
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'major',
                      responderCall: { kind: 'newSuit', level: 2, jump: 0 } },
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'twoOverOne' },
    calls: ['3H', '3S'],
    callRefinement: (calls, context) => refineResponderTwoOverOneSuit(calls, context, 'openingSlowRaise'),
    callCategory: ['natural', 'gameForcing'],
    appliesWhen: (call, context) => responderTwoOverOneApplies(call, context, 'openingSlowRaise'),
    meaning: "With three or more of opener's major and extras, a slow 3M raise remains forcing and leaves room to investigate slam.",
    guidance: ['Opener must continue toward game. With the fit established, assess working controls ' +
               'and playing strength before choosing game or exploring higher.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-two-over-one-discovered-major-game',
    kind: 'responderRebid',
    title: 'Choose major game after opener reveals a four-card major',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 2, jump: 0 } },
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'twoOverOne' },
    calls: ['4H', '4S'],
    callRefinement: (calls, context) => refineResponderTwoOverOneSuit(calls, context, 'secondMajorGame'),
    callCategory: ['natural', 'signoff'],
    appliesWhen: (call, context) => responderTwoOverOneApplies(call, context, 'secondMajorGame'),
    meaning: 'After opener naturally shows four cards in a new major, four-card responder support establishes game.',
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-two-over-one-repeat-long-suit',
    kind: 'responderRebid',
    title: 'Describe a six-card responder suit while preserving the game force',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 2, jump: 0 } },
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'twoOverOne' },
    calls: ['3C', '3D', '3H'],
    callRefinement: (calls, context) => refineResponderTwoOverOneSuit(calls, context, 'repeatResponse'),
    callCategory: ['natural', 'gameForcing'],
    appliesWhen: (call, context) => responderTwoOverOneApplies(call, context, 'repeatResponse'),
    meaning: 'Natural six-card suit; unlike Standard, a 3-level repetition is forcing to game.',
    guidance: ['Opener must not Pass below game. Support the long suit when suitable or ' +
               'continue describing shape and notrump suitability; the final strain is unresolved.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-two-over-one-game-3nt',
    kind: 'responderRebid',
    title: 'Place the game in notrump with balance and unbid-suit stoppers',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 2, jump: 0 } },
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'twoOverOne' },
    calls: ['3NT'], callCategory: ['natural', 'signoff'],
    appliesWhen: (call, context) => responderTwoOverOneApplies(call, context, 'gameNt'),
    meaning: 'With suitable balanced game values, stoppers, and no known major fit, choose 3NT.',
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-two-over-one-forcing-2nt',
    kind: 'responderRebid',
    title: 'Describe a balanced hand economically without releasing the game force',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 2, jump: 0 } },
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'twoOverOne' },
    calls: ['2NT'], callCategory: ['natural', 'gameForcing'],
    appliesWhen: (call, context) => responderTwoOverOneApplies(call, context, 'forcingNt'),
    meaning: 'A natural 2NT rebid describes shape and remains forcing; opener must continue.',
    guidance: ['Opener should further describe suit length, a fit, or notrump suitability. ' +
               'Neither partner may stop below game under this 2/1 agreement.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-two-over-one-pass-reached-game',
    kind: 'responderRebid',
    title: "Accept opener's natural game after a 2/1 game force",
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 2, jump: 0 } },
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'twoOverOne' },
    calls: ['Pass'], callCategory: ['signoff'],
    appliesWhen: (call, context) => responderTwoOverOneApplies(call, context, 'passReachedGame'),
    meaning: 'Opener has placed the partnership in a natural game. The 2/1 game force has ' +
             'been fulfilled, so responder may Pass without breaking the forcing agreement.',
    guidance: ['With ordinary game-going values and a suitable contract, accept opener\'s ' +
               'choice. Unusual extra playing strength or a poor fit may justify continuing; ' +
               'this rule does not attempt slam exploration.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-boundary-after-two-over-one',
    kind: 'scopeBoundary',
    title: 'Other 2/1 continuations retain the game force',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 2, jump: 0 } },
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'twoOverOne' },
    scopeBoundaryWhen: (context, system) => ({
      success: system.twoLevelNewSuitResponse === 'twoOverOne' &&
        getResponderTwoOverOne(context) !== null,
      telemetryLines: [responderTwoOverOneReachedGame(context) ?
        'Opener has bid game; any further action is a judgment about strain or slam.' :
        '2/1 established a game force; opener has not yet reached game.'],
    }),
    meaning: 'A natural 2/1 commits the partnership to game, but not to bidding again ' +
             'after opener has already reached game.',
    guidance: ['Before a natural game is placed, responder must continue. A slower major raise, natural repeated ' +
               'suit, or economical notrump description preserves room to find the right game. ' +
               'After opener bids game, Pass is possible; further bidding with extra strength, ' +
               'an unsuitable strain, or slam interest requires judgment beyond these rules.'],
    certainty: 'high',
  },
  //
  //// Responder after a Standard two-level new-suit response
  // Standard forces opener to bid once, but does not commit the partnership to game.
  // These natural continuations must not appear with the configured 2/1 game force.
  {
    id: 'responder-rebid-standard-two-level-repeat-response',
    kind: 'responderRebid',
    title: 'Rebid a six-card responder suit naturally and nonforcing',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 2, jump: 0 } },
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'standard' },
    calls: ['3C', '3D', '3H'],
    callRefinement: (calls, context) => refineResponderStandardTwoLevel(calls, context, 'repeatResponse'),
    callCategory: ['natural', 'signoff'],
    appliesWhen: (call, context) => responderStandardTwoLevelApplies(call, context, 'repeatResponse'),
    meaning: 'With minimum values and six or more cards in the response suit, rebid it nonforcing ' +
             'after opener has satisfied the one-round force.',
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-standard-two-level-pass-raise',
    kind: 'responderRebid',
    title: "Accept opener's minimum raise of responder's suit",
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 2, jump: 0 } },
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'standard' },
    calls: ['Pass'], callCategory: ['signoff'],
    appliesWhen: (call, context) => responderStandardTwoLevelApplies(call, context, 'passRaise'),
    meaning: "Opener has raised responder's natural suit, and minimum responder values can stop in partscore.",
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-standard-two-level-prefer-diamonds',
    kind: 'responderRebid',
    title: "Prefer opener's diamonds after a minimum repetition",
    auctionContext: { stage: 'responderRebid', auction: ['1D', '2C', '2D'] },
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'standard' },
    calls: ['3D'], callCategory: ['natural', 'signoff'],
    appliesWhen: (call, context) => responderStandardTwoLevelApplies(call, context, 'preferDiamonds'),
    meaning: "With minimum values and three or more diamonds, prefer opener's five-card-or-longer suit.",
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-standard-two-level-pass-2nt',
    kind: 'responderRebid',
    title: "Stop in opener's minimum balanced 2NT",
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 2, jump: 0 }, openerRebidCall: '2NT' },
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'standard' },
    calls: ['Pass'], callCategory: ['signoff'],
    appliesWhen: (call, context) => responderStandardTwoLevelApplies(call, context, 'passNt'),
    meaning: "A balanced 11-12 HCP responder may stop in 2NT opposite opener's minimum " +
             '12-14 HCP rebid; the Standard two-level response forced only one round.',
    guidance: ['At 12 HCP, game can be close: the partnership may have 24-26 HCP. ' +
               'Passing is a reasonable minimum treatment; stoppers, honors and the quality ' +
               'of the long suit may instead favor 3NT. This is not an automatic game bid.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-standard-two-level-game-3nt',
    kind: 'responderRebid',
    title: "Choose 3NT opposite opener's minimum balanced rebid",
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 2, jump: 0 }, openerRebidCall: '2NT' },
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'standard' },
    calls: ['3NT'], callCategory: ['natural', 'signoff'],
    appliesWhen: (call, context) => responderStandardTwoLevelApplies(call, context, 'gameNt'),
    meaning: 'Balanced game-going responder values justify 3NT opposite a minimum 2NT rebid.',
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-standard-two-level-game-major-raise',
    kind: 'responderRebid',
    title: "Choose major game after opener supports the five-card response suit",
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'major',
                      responderCall: { kind: 'newSuit', level: 2, jump: 0 } },
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'standard' },
    calls: ['4H'],
    callRefinement: (calls, context) => refineResponderStandardTwoLevel(calls, context, 'majorGame'),
    callCategory: ['natural', 'signoff'],
    appliesWhen: (call, context) => responderStandardTwoLevelApplies(call, context, 'majorGame'),
    meaning: 'With game values and a known heart fit after opener raises, choose 4H.',
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-standard-two-level-pass-game',
    kind: 'responderRebid',
    title: "Accept opener's natural 3NT game placement",
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 2, jump: 0 }, openerRebidCall: '3NT' },
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'standard' },
    calls: ['Pass'], callCategory: ['signoff'],
    appliesWhen: (call, context) => responderStandardTwoLevelApplies(call, context, 'passGame'),
    meaning: "Opener has placed the contract in notrump game after a Standard natural response.",
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-boundary-after-standard-two-level',
    kind: 'scopeBoundary',
    title: 'Other Standard two-level continuations require further judgment',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 2, jump: 0 } },
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'standard' },
    scopeBoundaryWhen: (context, system) => ({
      success: system.twoLevelNewSuitResponse === 'standard' &&
        getResponderStandardTwoLevel(context) !== null,
      telemetryLines: ['Check the natural Standard one-round-forcing response and opener rebid.'],
    }),
    meaning: 'The Standard two-level response forced opener to bid once, but did not ' +
             'necessarily force the partnership to game.',
    guidance: ['A reverse or stronger opener rebid may create a new forcing obligation. ' +
               'When the best suit or further invitation is unclear, those continuations ' +
               'rely on too many variables and judgment for this app to reliably provide practice.'],
    certainty: 'high',
  },
  //
  //// Responder after a natural 1NT response to a minor opening
  // Responder showed 6-10 balanced HCP without a four-card major. An ordinary suit
  // continuation is nonforcing, while opener's reverse or jump shift remains forcing.
  {
    id: 'responder-rebid-pass-after-minor-1nt-repeat',
    kind: 'responderRebid',
    title: 'Accept opener\'s six-card opening minor',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'minor',
                      responderCall: { kind: 'notrump', level: 1 } },
    calls: ['Pass'], callCategory: ['signoff'],
    appliesWhen: (call, context) => responderAfterMinorOneNtApplies(call, context, 'passRepeat'),
    meaning: 'With minimum values and two or more cards in opener\'s six-card minor, Pass.',
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-pass-second-minor-after-1nt',
    kind: 'responderRebid',
    title: 'Accept opener\'s natural four-card club suit',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'minor',
                      responderCall: { kind: 'notrump', level: 1 } },
    calls: ['Pass'], callCategory: ['signoff'],
    appliesWhen: (call, context) => responderAfterMinorOneNtApplies(call, context, 'passSecond'),
    meaning: 'After 1D-1NT-2C, four clubs establish a suitable fit for partscore.',
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-prefer-diamonds-after-minor-1nt',
    kind: 'responderRebid',
    title: 'Prefer opener\'s original diamonds after a club rebid',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'minor',
                      responderCall: { kind: 'notrump', level: 1 } },
    calls: ['2D'], callCategory: ['natural', 'signoff'],
    appliesWhen: (call, context) => responderAfterMinorOneNtApplies(call, context, 'preferOpening'),
    meaning: 'With three diamonds but insufficient club fit, prefer opener\'s known five-card diamonds.',
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-pass-after-minor-1nt-2nt',
    kind: 'responderRebid',
    title: 'Decline opener\'s natural 2NT invitation with six HCP',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'minor',
                      responderCall: { kind: 'notrump', level: 1 }, openerRebidCall: '2NT' },
    calls: ['Pass'], callCategory: ['signoff'],
    appliesWhen: (call, context) => responderAfterMinorOneNtApplies(call, context, 'decline2Nt'),
    meaning: 'Six HCP opposite 18-19 HCP make game uncertain; Pass is a normal choice.',
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-3nt-after-minor-1nt-2nt',
    kind: 'responderRebid',
    title: 'Accept opener\'s natural notrump invitation',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'minor',
                      responderCall: { kind: 'notrump', level: 1 }, openerRebidCall: '2NT' },
    calls: ['3NT'], callCategory: ['natural', 'signoff'],
    appliesWhen: (call, context) => responderAfterMinorOneNtApplies(call, context, 'accept2Nt'),
    meaning: 'Seven or more HCP opposite 18-19 balanced HCP normally justify 3NT.',
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-pass-after-minor-1nt-jump-repeat',
    kind: 'responderRebid',
    title: 'Decline the jump-minor invitation with minimum values',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'minor',
                      responderCall: { kind: 'notrump', level: 1 } },
    calls: ['Pass'], callCategory: ['signoff'],
    appliesWhen: (call, context) => responderAfterMinorOneNtApplies(call, context, 'declineJump'),
    meaning: 'With 6-7 HCP and a minor fit, accept opener\'s invitational partscore.',
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-pass-after-minor-1nt-game',
    kind: 'responderRebid',
    title: 'Accept opener\'s natural game placement',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'minor',
                      responderCall: { kind: 'notrump', level: 1 } },
    calls: ['Pass'], callCategory: ['signoff'],
    appliesWhen: (call, context) => responderAfterMinorOneNtApplies(call, context, 'passGame'),
    meaning: 'Opener has placed the contract in 3NT or a long-minor game.',
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-boundary-after-minor-1nt',
    kind: 'scopeBoundary',
    title: 'Further natural minor-1NT continuations need judgment',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'minor',
                      responderCall: { kind: 'notrump', level: 1 } },
    meaning: 'Responder has shown a balanced 6-10 HCP hand without a four-card major.',
    guidance: ['A reverse is forcing for one round, and a strong jump shift is forcing to game: ' +
               'responder must not Pass below the level required by the partnership.',
               'For other hands, choosing between minor-suit game, 3NT, and further ' +
               'description relies on too many variables and judgment for this app ' +
               'to provide reliable practice.'],
    certainty: 'high',
  },
  //
  //// Responder after an initial 1NT response to a major opening
  // The first 1NT may be forcing or nonforcing, and either agreement can carry a
  // three-card limit raise. An ordinary two-level rebid satisfies a one-round force.
  // When forcing 1NT produces a manufactured minor, that minor may have only three cards.
  {
    id: 'responder-rebid-pass-after-major-1nt-repeat',
    kind: 'responderRebid',
    title: 'Accept opener\'s six-card major at the two level',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'major',
                      responderCall: { kind: 'notrump', level: 1 } },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: (call, context, system) => responderAfterMajorOneNtApplies(call, context, system, 'passMajor'),
    meaning: 'With minimum values, prefer opener\'s known six-card major to further bidding.',
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-invite-after-major-1nt-repeat',
    kind: 'responderRebid',
    title: 'Invite game after opener repeats the major',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'major',
                      responderCall: { kind: 'notrump', level: 1 } },
    calls: ['3H', '3S'],
    callRefinement: (calls, context) => refineResponderAfterMajorOneNt(calls, context, 'threeMajor'),
    callCategory: ['natural', 'invitational'],
    priority: { rank: 10 },
    appliesWhen: (call, context, system) => responderAfterMajorOneNtApplies(call, context, system, 'inviteMajor'),
    meaning: 'Invite major-suit game with constructive values and a known eight-card fit.',
    guidance: ['Opener may Pass or accept game according to the strength of the six-card major.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-prefer-major-after-major-1nt',
    kind: 'responderRebid',
    title: 'Return to opener\'s major after an economical second suit',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'major',
                      responderCall: { kind: 'notrump', level: 1 } },
    calls: ['2H', '2S'],
    callRefinement: (calls, context) => refineResponderAfterMajorOneNt(calls, context, 'twoMajor'),
    callCategory: ['natural', 'signoff'],
    priority: { rank: 10 },
    appliesWhen: (call, context, system) => responderAfterMajorOneNtApplies(call, context, system, 'preferMajor'),
    meaning: 'With minimum values, prefer opener\'s five-card major with even two cards in support.',
    guidance: ['A two-card preference can be better than a three-card minor fallback after forcing 1NT.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-pass-second-suit-after-major-1nt',
    kind: 'responderRebid',
    title: 'Accept opener\'s economical second suit with a suitable fit',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'major',
                      responderCall: { kind: 'notrump', level: 1 } },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: (call, context, system) => responderAfterMajorOneNtApplies(call, context, system, 'passSecond'),
    meaning: 'Stop in opener\'s second suit when the known partnership fit makes partscore sensible.',
    guidance: ['With forcing 1NT, a minor rebid might have only three cards; five-card responder ' +
               'support ensures an eight-card fit even then.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-long-minor-after-major-1nt',
    kind: 'responderRebid',
    title: 'Show a six-card minor that could not be bid initially',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'major',
                      responderCall: { kind: 'notrump', level: 1 } },
    calls: ['2C', '2D', '3C', '3D'],
    callRefinement: (calls, context) => refineResponderAfterMajorOneNt(calls, context, 'ownMinor'),
    callCategory: ['natural', 'signoff'],
    appliesWhen: (call, context, system) => responderAfterMajorOneNtApplies(call, context, system, 'longMinor'),
    meaning: 'After showing a hand through 1NT, identify a long minor naturally and nonforcing.',
    guidance: ['The initial forcing 1NT obligation has been satisfied by opener\'s rebid.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-delayed-limit-after-major-1nt',
    kind: 'responderRebid',
    title: 'Complete a three-card limit raise through 1NT',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'major',
                      responderCall: { kind: 'notrump', level: 1 } },
    calls: ['3H', '3S'],
    callRefinement: (calls, context) => refineResponderAfterMajorOneNt(calls, context, 'threeMajor'),
    callCategory: ['natural', 'invitational'],
    priority: { rank: 25 },
    appliesWhen: (call, context, system) => responderAfterMajorOneNtApplies(call, context, system, 'delayedLimitRaise'),
    meaning: 'Show exactly three-card major support and 11-12 support points, inviting game.',
    guidance: ['This finishes the planned limit raise concealed by the initial 1NT response.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-2nt-after-major-1nt-second-suit',
    kind: 'responderRebid',
    title: 'Invite notrump game after opener shows a lower second suit',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'major',
                      responderCall: { kind: 'notrump', level: 1 } },
    calls: ['2NT'],
    callCategory: ['natural', 'invitational'],
    appliesWhen: (call, context, system) => responderAfterMajorOneNtApplies(call, context, system, 'inviteNt'),
    meaning: 'Invite 3NT with a balanced constructive hand, without an established major fit.',
    guidance: ['Opener may accept with extra values and suitable notrump holdings.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-boundary-after-major-1nt-natural',
    kind: 'scopeBoundary',
    title: 'Further natural choices after a major-opening 1NT response',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'major',
                      responderCall: { kind: 'notrump', level: 1 } },
    scopeBoundaryWhen: (context) => ({ success: getResponderAfterMajorOneNt(context) !== null,
      telemetryLines: ['Ordinary major-1NT continuation, with no sufficiently reliable bid.'] }),
    meaning: 'Opener has described either a six-card major or an economical second suit. ' +
             'Responder can choose a suitable partscore or invite game where the hand is clear.',
    guidance: ['Other suit choices, unusual strength, and borderline fits need more information ' +
               'and judgment than this app can reliably evaluate.'],
    certainty: 'high',
  },
  //
  //// After a major-opening 1NT response: opener shows an invitational maximum
  // A natural 2NT shows 18-19 HCP; a 3M jump shows 17-18 total points and a
  // six-card major. Neither rebid releases responder from evaluating game.
  {
    id: 'responder-rebid-pass-after-major-1nt-2nt-invite',
    kind: 'responderRebid',
    title: "Decline opener's natural 2NT invitation with a balanced minimum",
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'major',
                      responderCall: { kind: 'notrump', level: 1 } },
    calls: ['Pass'], callCategory: ['signoff'],
    appliesWhen: (call, context) => responderAfterMajorOneNtStrongApplies(call, context, 'declineNt'),
    meaning: 'With 6-7 balanced HCP and no major fit, accept 2NT as the final contract.',
    guidance: ['Opener has 18-19 HCP. The partnership may fall short of the values normally ' +
               'needed for 3NT; with a borderline seven-count, good intermediates can matter.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-3nt-after-major-1nt-2nt-invite',
    kind: 'responderRebid',
    title: "Accept opener's 2NT invitation with game values",
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'major',
                      responderCall: { kind: 'notrump', level: 1 } },
    calls: ['3NT'], callCategory: ['natural', 'signoff'],
    appliesWhen: (call, context) => responderAfterMajorOneNtStrongApplies(call, context, 'acceptNt'),
    meaning: 'With 8-12 balanced HCP and no known major fit, bid 3NT opposite 18-19 HCP.',
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-major-game-after-major-1nt-2nt-invite',
    kind: 'responderRebid',
    title: 'Complete the concealed three-card major limit raise after 2NT',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'major',
                      responderCall: { kind: 'notrump', level: 1 } },
    calls: ['4H', '4S'],
    callRefinement: (calls, context) => refineResponderAfterMajorOneNtStrongGame(calls, context, 'ntInvite'),
    callCategory: ['natural', 'signoff'],
    appliesWhen: (call, context) => responderAfterMajorOneNtStrongApplies(call, context, 'gameMajorAfterNt'),
    meaning: 'Three-card support and 11-12 support points make major game attractive opposite 18-19 HCP.',
    guidance: ['A three-card limit raise may have started with a 1NT response; opener has now ' +
               'shown enough strength to accept game.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-pass-after-major-1nt-jump-repeat',
    kind: 'responderRebid',
    title: "Decline opener's six-card major game invitation",
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'major',
                      responderCall: { kind: 'notrump', level: 1 } },
    calls: ['Pass'], callCategory: ['signoff'],
    appliesWhen: (call, context) => responderAfterMajorOneNtStrongApplies(call, context, 'declineJumpMajor'),
    meaning: 'With minimum responder values and at least two-card support, Pass the invitational 3M rebid.',
    guidance: ['Opener showed extra strength and a six-card major, but has not forced game.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-major-game-after-major-1nt-jump-repeat',
    kind: 'responderRebid',
    title: "Accept opener's six-card major invitation",
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'major',
                      responderCall: { kind: 'notrump', level: 1 } },
    calls: ['4H', '4S'],
    callRefinement: (calls, context) => refineResponderAfterMajorOneNtStrongGame(calls, context, 'jumpRepeat'),
    callCategory: ['natural', 'signoff'],
    appliesWhen: (call, context) => responderAfterMajorOneNtStrongApplies(call, context, 'acceptJumpMajor'),
    meaning: 'With constructive responder values and at least two cards in opener\'s six-card major, bid game.',
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-boundary-after-major-1nt-strong-forcing',
    kind: 'scopeBoundary',
    title: "Opener's reverse or jump shift requires responder to continue",
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'major',
                      responderCall: { kind: 'notrump', level: 1 } },
    scopeBoundaryWhen: (context) => {
      const info = getResponderAfterMajorOneNtStrong(context);
      return { success: info?.kind === 'reverse' || info?.kind === 'jumpShift',
        telemetryLines: ['Strong natural second suit after a major-opening 1NT response.'] };
    },
    meaning: 'A strong reverse or jump shift shows extra opener strength and is forcing; ' +
             'responder must not Pass simply because the initial response was 1NT.',
    guidance: ['After 1H-1NT-2S, opener\'s reverse requires another bid even from a minimum. ' +
               'After a strong jump shift, look for an eight-card fit or suitable notrump ' +
               'contract. Selecting a further natural description requires judgment beyond ' +
               'these modeled continuations.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-boundary-after-major-1nt-invitation',
    kind: 'scopeBoundary',
    title: 'Other choices after a strong major-opening 1NT invitation',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'major',
                      responderCall: { kind: 'notrump', level: 1 } },
    scopeBoundaryWhen: (context) => {
      const kind = getResponderAfterMajorOneNtStrong(context)?.kind;
      return { success: kind === 'ntInvite' || kind === 'jumpRepeat',
        telemetryLines: ['Natural opener invitation after the major-opening 1NT response.'] };
    },
    meaning: 'Opener has invited game, not demanded it. Responder weighs fit and strength ' +
             'before accepting or declining.',
    guidance: ['A balanced minimum may Pass 2NT; constructive values normally accept 3NT ' +
               'without a major fit. After a jump to 3M, two-card support gives an eight-card ' +
               'fit. Borderline points, poor fit, or unusual distribution call for judgment.'],
    certainty: 'high',
  },
  //
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
    guidance: ['Opener normally Passes with a minimum and bids 3NT with a suitable maximum; ' +
               'the middle of the 12–14 range requires judgment.'],
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
  //// After opener's strong natural 2NT rebid
  // The initial response is a natural one-level new suit, not 1NT or a two-level force.
  // Opener's 18-19 balanced HCP is invitational, not itself a game force. A five-card
  // responder major asks about support; six cards provide an eight-card fit opposite a
  // balanced opener. Later opener decisions are described without another bidding stage.
  {
    id: 'responder-rebid-pass-after-strong-2nt',
    kind: 'responderRebid',
    title: 'Pass a strong balanced 2NT rebid with minimum values',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0 },
                      openerRebidCall: '2NT' },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 6, max: 6 }, shape: { balanced: true } },
    meaning: "With only six HCP, accept 2NT opposite opener's 18-19 HCP balanced hand.",
    guidance: ['This is a real, nonforcing Pass; opener has invited rather than forced game.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-3nt-after-strong-2nt',
    kind: 'responderRebid',
    title: 'Choose 3NT with game values after a strong 2NT rebid',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0 },
                      openerRebidCall: '2NT' },
    calls: ['3NT'],
    callCategory: ['natural', 'signoff'],
    appliesWhen: responderStrongTwoNtThreeNtApplies,
    meaning: "Choose 3NT with a balanced 7-12 HCP hand opposite opener's 18-19 HCP.",
    guidance: ['With five cards in a major already shown, describing that suit first can ' +
               'help opener choose between 3NT and major-suit game.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-three-major-after-strong-2nt',
    kind: 'responderRebid',
    title: 'Show a five-card major forcing to game after opener rebids 2NT',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0, strain: 'major' },
                      openerRebidCall: '2NT' },
    calls: ['3H', '3S'],
    callRefinement: refineResponderOriginalOneLevelSuit,
    callCategory: ['natural', 'gameForcing'],
    appliesWhen: { hcp: { min: 7, max: 12 }, suitLengths: [{ min: 5, max: 5 }] },
    meaning: "Show exactly five cards in responder's major, asking opener to choose a game.",
    guidance: ['With three cards in the major, opener ordinarily bids 4M; with only two, ' +
               '3NT is usually preferred. The partnership is committed to game.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-four-major-after-strong-2nt',
    kind: 'responderRebid',
    title: 'Place game in a six-card major after a strong balanced 2NT rebid',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0, strain: 'major' },
                      openerRebidCall: '2NT' },
    calls: ['4H', '4S'],
    callRefinement: refineResponderOriginalOneLevelSuit,
    callCategory: ['natural', 'signoff'],
    appliesWhen: { hcp: { min: 7, max: 12 }, suitLengths: [{ min: 6 }] },
    meaning: "Six cards in responder's major ensure an eight-card fit opposite balanced opener.",
    guidance: ['The strength and known major fit favor bidding game directly.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-boundary-after-strong-2nt',
    kind: 'scopeBoundary',
    title: 'Other continuations after a strong 2NT rebid require further judgment',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'suit',
                      responderCall: { kind: 'newSuit', level: 1, jump: 0 },
                      openerRebidCall: '2NT' },
    meaning: 'Opener has shown 18-19 balanced HCP. The partnership may need to investigate ' +
             'an unshown major, select another strain, or consider slam with exceptional strength.',
    guidance: ['These choices depend on additional partnership agreements, hand details, ' +
               'and judgment, so this app cannot reliably recommend a specific next bid.'],
    certainty: 'high',
  },
  //
  //// After responder's simple raise of opener's major, opener invites game
  // Do not confuse opener's help-suit or balanced 2NT game try with a direct
  // three-level competitive raise. Responder may decline at 3M or accept at 4M.
  // Judgment decisions at eight support points are intentionally not given false precision.
  {
    id: 'responder-rebid-decline-game-try-after-major-simple-raise',
    kind: 'responderRebid',
    title: "Decline opener's major-suit game try and stop at three",
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'major',
                      responderCall: { kind: 'raise', level: 2, jump: 0 } },
    calls: ['3H', '3S'], callRefinement: refineResponderMajorGameTry,
    callCategory: ['natural', 'signoff'],
    appliesWhen: responderMajorGameTryApplies,
    meaning: 'Return to three of the agreed major when opener\'s game invitation is not accepted.',
    guidance: ['With 6–7 support points, ordinarily decline.  With eight points after a help-suit ' +
               'try, weak honors and no useful shortness in that suit favor stopping below game.',
               'After a balanced 2NT game try, eight support points are judgmental; ' +
               'both accepting and declining remain available.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-accept-game-try-after-major-simple-raise',
    kind: 'responderRebid',
    title: "Accept opener's major-suit game try",
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'major',
                      responderCall: { kind: 'raise', level: 2, jump: 0 } },
    calls: ['4H', '4S'], callRefinement: refineResponderMajorGameTry,
    callCategory: ['natural', 'signoff'],
    appliesWhen: responderMajorGameTryApplies,
    meaning: 'Accept opener\'s game try in the known major fit, rather than bidding the help suit.',
    guidance: ['With 9–10 support points, ordinarily accept.  With eight support points, ' +
               'an ace, king, queen-jack combination, or shortness in opener\'s help suit ' +
               'can make game attractive.',
               'After a balanced 2NT game try, eight support points are judgmental; ' +
               'both accepting and declining remain available.'],
    certainty: 'high',
  },
  //
  {
    id: 'responder-rebid-boundary-after-major-simple-raise-game-try',
    kind: 'scopeBoundary',
    title: 'Unusual continuation after a major-suit game try',
    auctionContext: { stage: 'responderRebid', openerLevel: 1, openerStrain: 'major',
                      responderCall: { kind: 'raise', level: 2, jump: 0 } },
    scopeBoundaryWhen: (context) => ({
      success: getResponderAfterMajorGameTry(context) !== null,
      telemetryLines: ['Check the uncontested major simple raise and opener game try.'],
    }),
    meaning: 'Opener has made an invitational help-suit or balanced game try after the agreed major raise.',
    guidance: ['Three or four of the major is the normal decision.  Very unusual responder ' +
               'strength, a different final strain, or slam exploration requires additional judgment.',
               'A game try is forcing for one round; do not Pass merely because opener bid a side suit.'],
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
    guidance: ['Opener may Pass with a minimum, or bid four of the major with a ' +
               'maximum and useful working honors in the agreed fit.'],
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
