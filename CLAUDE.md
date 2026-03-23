# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

An e-commerce data utilities project providing query functions over a SQLite database. Uses TypeScript with ESM modules (`"type": "module"`). The database file is `ecommerce.db` (created at runtime).

## Development Commands

```bash
# Install dependencies and generate .claude/settings.local.json from template
npm run setup   # requires .claude/settings.example.json to exist first

# Run the Claude Agent SDK entry point
npm run sdk

# Type-check without emitting
npx tsc --noEmit
```

No build step is needed — `tsx` executes TypeScript directly.

**Note:** `npm run setup` will fail if `.claude/settings.example.json` doesn't exist. That file must be created before running setup; it's the template that `scripts/init-claude.js` uses to generate `.claude/settings.local.json` (substituting `$PWD` with the actual project path to wire up hooks).

## Architecture

### Entry Points

- `src/main.ts` — Daily cron entry point. Opens the SQLite DB and runs `createSchema`. Any recurring logic (alerts, integrations) should be triggered from here.
- `sdk.ts` — Standalone script using `@anthropic-ai/claude-agent-sdk`. Run via `npm run sdk`.

### Database Layer

- `src/schema.ts` — Single source of truth for the schema. Check here before writing queries — primary keys are named `id` (not `customer_id`, `order_id`, etc.), timestamps use `created_at` (not `order_date`).
- `src/queries/` — All query modules. **All new queries must go here.**

### Query Pattern

The project uses the `sqlite` async wrapper, not raw `sqlite3` callbacks. The correct pattern is:

```typescript
export async function getOrdersByStatus(db: Database, status: string): Promise<any[]> {
  return db.all(`SELECT * FROM orders WHERE status = ?`, [status]);
}
```

Use `db.get()` for single rows, `db.all()` for multiple rows.

### Hooks (configured via `.claude/settings.local.json`)

- `hooks/tsc.js` — Runs TypeScript type-checking after every file write/edit. Blocks with exit code 2 if type errors exist.
- `hooks/query_hook.js` — On writes to `src/queries/`, uses the Claude Agent SDK to detect query duplication against existing queries. Currently short-circuits at the top (`process.exit(0)`) but the logic is in place.
- `hooks/read_hook.js` — Pre-read hook stub; intended to guard `.env` reads (incomplete).

## Critical Guidance

- All database queries must be written in `src/queries/`
- Schema primary keys are `id`, not `<table>_id` — foreign key columns reference `customers(id)`, `orders(id)`, etc.
