# Bridge Trainer Punch-Through Source Drop

This zip is structured as source files to copy into a Vite React TypeScript project.

## File layout

```text
src/
  App.css
  App.tsx
  main.tsx
  components/
    BidPanel.tsx
    DealCompass.tsx
    HandView.tsx
    TelemetryPanel.tsx
  data/
    bidding-rules.ts
  models/
    bidding-convention-types.ts
    biddingEvaluation.ts
    cards.ts
```

## Notes

- `src/data/bidding-rules.ts` is copied from the uploaded `bidding-rules(2).ts` and has one intentional punch-through edit: `open-convenient-minor` now includes `suitLengths: [{ suit: 'major', max: 4 }]` in addition to `shape: { noFiveCardMajor: true }`.
- `src/models/bidding-convention-types.ts` is copied from the uploaded type file with `call?: Call` removed, matching the project decision that rules use `calls: Call[]` only.
- The UI uses Unicode suit glyphs only in presentation. Rules, calls, telemetry, and user input still use suit letters such as `1H`, `1S`, and `1NT`.
- The evaluator is descriptive. It shows rules satisfied by the user's entered call and all candidate rules that currently apply. It does not rank, choose best calls, or provide final bidding judgment yet.
- Deal generation deals random hands, finds the first hand in `N, E, S, W` order with at least 12 HCP, rotates that hand to North, and redeals only when no hand has 12+ HCP.

## Integration

If your existing app already has `src/main.tsx`, compare before replacing it. The important files for the punch-through are `App.tsx`, `App.css`, `components`, `models`, and `data`.
