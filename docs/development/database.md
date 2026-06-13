# Local Database

PostgreSQL is the authoritative database for V1.

Required environment variables:

```text
DATABASE_URL=postgres://user:password@localhost:5432/ai_reading_trainer
```

Apply schema:

```powershell
psql $env:DATABASE_URL -f apps/api/src/db/schema.sql
```

The local fixture MVP does not require PostgreSQL to run. The schema exists so backend work can preserve the V1 authority model before deployment.
