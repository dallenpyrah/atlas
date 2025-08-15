# migrations/meta/ Overview

## Purpose
This folder contains Drizzle Kit's internal metadata files that track the state and history of database migrations. These files enable Drizzle to understand the current schema state, detect changes, and generate appropriate migration files.

## Contents
- **Snapshot Files** (`*_snapshot.json`): Complete schema snapshots at each migration point
- **Journal File** (`_journal.json`): Migration execution history and sequencing

## Patterns & Conventions
- **JSON Format**: All metadata stored as structured JSON
- **Automated Management**: Files are exclusively managed by Drizzle Kit
- **Version Tracking**: Each snapshot corresponds to a specific migration version
- **Immutable History**: Past snapshots are never modified

## Dependencies
- **Internal dependencies**: 
  - Parent migration SQL files in `/migrations/`
  - Schema definitions in `/src/lib/db/schema.ts`
- **External dependencies**: 
  - `drizzle-kit` - Manages all metadata files

## Key Files
- `0000_snapshot.json`: Initial schema state snapshot
- `0001_snapshot.json`: Schema state after first migration
- `0002_snapshot.json`: Schema state after second migration
- `0003_snapshot.json`: Schema state after third migration
- `0004_snapshot.json`: Schema state after fourth migration
- `0005_snapshot.json`: Schema state after fifth migration
- `0006_snapshot.json`: Current schema state snapshot
- `_journal.json`: Complete migration history and metadata

## Related Documentation
- [📚 Migration System: /docs/architecture/migration-system.md]
- [🔗 Drizzle Kit Documentation: /docs/references/drizzle-kit.md]
- [🏗️ Schema Evolution: /docs/guides/schema-evolution.md]

## Quick Start
These files are automatically managed. No manual interaction required.

```bash
# Files are updated when running:
bun run db:generate  # Creates new snapshot
bun run db:migrate   # Updates journal
```

## Notes
- **DO NOT** manually edit any files in this directory
- **DO NOT** delete files even if migrations are rolled back
- These files are critical for migration integrity
- Corruption of these files may require database reconstruction
- Always commit these files alongside their corresponding migrations
- The journal tracks which migrations have been applied to prevent double execution