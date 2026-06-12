# Local MVP

Run the fixture-driven mobile MVP:

```powershell
corepack prepare pnpm@9.15.4 --activate
pnpm install
pnpm dev:web
```

Open:

```text
http://localhost:5173
```

Verify:

- The reading page opens first.
- The passage has 2-4 main highlights.
- Tapping a highlight shows expression, type, and short local meaning first.
- Full explanation appears only after expanding.
- More expressions are collapsed by default.
- Reading feedback does not advance SRS.
- Review feedback advances SRS.

If the local PowerShell session cannot find `pnpm`, use the Corepack form:

```powershell
corepack pnpm install
corepack pnpm dev:web
```
