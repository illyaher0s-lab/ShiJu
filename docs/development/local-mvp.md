# Local MVP

Run the fixture-driven mobile MVP:

```powershell
corepack pnpm install
corepack pnpm dev:web
```

Open:

```text
http://localhost:5173
```

Verify:

- Current local MVP opens the reading page first.
- After Task 18, the home page opens first and shows today's learning status and daily card targets.
- The passage has 2-4 main highlights.
- Tapping a highlight shows expression, type, and short local meaning first.
- Full explanation appears only after expanding.
- More expressions are collapsed by default.
- Reading feedback does not advance SRS.
- Review feedback advances SRS.
- Cards are available from the card library tab.
- A learner can generate a draft card from selected reading text.
- A learner can generate a draft card from a manually entered expression plus context.
- Pending offline actions create client operations with `client_operation_id`.
- Pending sync status should live on Home or settings after Task 18, not as a persistent reading/review overlay.
- Review feedback buttons should be `不知道`, `迷惑`, and `知道` after Task 19.
- Long-press `知道` should reveal `熟知` after Task 19.
- SRS should use SM-2-compatible scheduling after Task 20.

Run verification:

```powershell
corepack pnpm test
corepack pnpm build
```

Local MVP limitations:

- Fixture/mock data is intentional for this phase.
- The local MVP does not call a real AI provider by default.
- PostgreSQL is documented and modeled, but not required to view the fixture-driven web experience.
- Full FSRS optimization is deferred until enough real review history exists.
