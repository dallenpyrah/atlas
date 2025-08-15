# trigger/ Overview

## Purpose
Background job definitions and task implementations using Trigger.dev v3. This directory contains all asynchronous task definitions that run outside the main request-response cycle, handling long-running operations, scheduled jobs, and event-driven processing.

## Contents
- Task definitions for background processing
- Scheduled job configurations
- Event-driven task handlers
- Webhook processing tasks

## Patterns & Conventions
- **Task Naming**: Descriptive names with action verbs (e.g., `processUpload`, `sendEmail`)
- **Error Handling**: Built-in retry logic with exponential backoff
- **Idempotency**: Tasks designed to be safely retryable
- **Logging**: Structured logging for task execution
- **Type Safety**: Fully typed task inputs and outputs

## Dependencies
- **Internal**: 
  - Database access via `@/lib/db`
  - Service layer from `@/services`
  - Client configurations from `@/clients`
- **External**: 
  - Trigger.dev v3 SDK
  - External API clients as needed

## Key Files
- Task files follow pattern: `[feature]-tasks.ts`
- Configuration managed via environment variables

## Related Documentation
- [📚 Detailed documentation: /docs/background-jobs/trigger-dev.md]
- [🔗 Related patterns: /docs/patterns/async-processing.md]
- [🏗️ Architecture details: /docs/architecture/job-processing.md]

## Quick Start
Define tasks using Trigger.dev conventions:
```typescript
export const myTask = task({
  id: "my-task",
  run: async (payload) => {
    // Task implementation
  }
})
```

Deploy tasks:
```bash
bun run trigger:deploy
```

## Notes
- Tasks run in isolated environments
- Use TRIGGER_SECRET_KEY for authentication
- Development server: `bun run dev:trigger`
- Tasks support automatic retries and error handling
- Webhook endpoints automatically created for tasks