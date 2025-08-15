# Setup Guide

Complete setup instructions for the Atlas v2 development environment.

## Prerequisites

### Required Software
- **Node.js**: v20+ (for compatibility, though Bun is primary runtime)
- **Bun**: Latest version (primary package manager and runtime)
- **Docker**: For local PostgreSQL database
- **Git**: Version control

### Recommended Tools
- **VS Code**: With TypeScript and Tailwind CSS extensions
- **Drizzle Studio**: Database GUI (installed via Drizzle Kit)
- **Vercel CLI**: For environment variable management

## Initial Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd atlas-v2
```

### 2. Install Dependencies
```bash
bun install
```

This installs all dependencies defined in `package.json` using Bun's fast package manager.

### 3. Environment Configuration

#### Create Local Environment File
```bash
cp .env.example .env.local
```

#### For Vercel Projects
If this project is deployed on Vercel, pull environment variables:
```bash
vercel link
vercel env pull .env.local
```

#### Required Environment Variables
```bash
# Database
DATABASE_URL="postgresql://oyster:oyster@localhost:5432/oyster"

# Authentication
BETTER_AUTH_SECRET="generate-a-secure-random-string"
BETTER_AUTH_URL="http://localhost:3000"

# GitHub OAuth (optional)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Polar.sh (for payments)
POLAR_API_KEY="your-polar-api-key"
POLAR_WEBHOOK_SECRET="your-polar-webhook-secret"
POLAR_ORGANIZATION_ID="your-org-id"

# Resend (for emails)
RESEND_API_KEY="your-resend-api-key"
FROM_EMAIL="noreply@yourdomain.com"

# AI Services (at least one required)
ANTHROPIC_API_KEY="your-anthropic-key"
OPENAI_API_KEY="your-openai-key"

# Trigger.dev (background jobs)
TRIGGER_SECRET_KEY="your-trigger-secret"
TRIGGER_PROJECT_REF="your-project-ref"

# Upstash (rate limiting)
UPSTASH_REDIS_REST_URL="your-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# Vercel Blob (file storage)
BLOB_READ_WRITE_TOKEN="your-blob-token"
```

### 4. Database Setup

#### Start PostgreSQL with Docker
```bash
docker-compose up -d
```

This starts a PostgreSQL 16 instance with:
- User: `oyster`
- Password: `oyster`
- Database: `oyster`
- Port: `5432`

#### Run Database Migrations
```bash
bun run db:migrate
```

This applies all migrations from the `migrations/` folder to set up the database schema.

#### Verify Database Setup
```bash
bun run db:studio
```

Opens Drizzle Studio at `https://local.drizzle.studio` to inspect your database.

### 5. Start Development Server
```bash
bun run dev
```

The application will be available at:
- Application: `http://localhost:3000`
- Uses Turbopack for fast refresh

## Development Workflow

### Code Quality Commands
```bash
# Type checking
bun run typecheck

# Linting
bun run lint

# Auto-fix linting issues
bun run lint:fix

# Format code
bun run format
```

### Testing
```bash
# Run unit tests
bun test

# Run tests with coverage
bun run test:unit

# Run tests in watch mode
bun run test:watch

# Run E2E tests
bun run test:e2e

# Full CI suite
bun run test:ci
```

### Database Management
```bash
# Generate migration from schema changes
bun run db:generate

# Apply migrations
bun run db:migrate

# Push schema directly (dev only)
bun run db:push

# Open database GUI
bun run db:studio
```

### Background Jobs (Trigger.dev)
```bash
# Start Trigger.dev development server
bun run dev:trigger

# Deploy Trigger.dev tasks
bun run trigger:deploy
```

## Project Structure

```
atlas-v2/
├── src/
│   ├── app/           # Next.js App Router
│   │   ├── api/      # API routes
│   │   └── (pages)   # Application pages
│   ├── components/    # React components
│   │   ├── ui/       # Shadcn/ui components
│   │   └── blocks/   # Complex components
│   ├── lib/          # Core libraries
│   │   ├── auth.ts   # Authentication
│   │   ├── db/       # Database
│   │   └── utils.ts  # Utilities
│   ├── hooks/        # Custom React hooks
│   ├── trigger/      # Background jobs
│   └── types/        # TypeScript types
├── migrations/        # Database migrations
├── public/           # Static assets
└── docs/            # Documentation
```

## IDE Setup

### VS Code Extensions

Recommended extensions (`.vscode/extensions.json`):
```json
{
  "recommendations": [
    "biomejs.biome",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### VS Code Settings

Recommended settings (`.vscode/settings.json`):
```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

#### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

#### Migration Issues
```bash
# Reset database (WARNING: destroys all data)
docker-compose down -v
docker-compose up -d
bun run db:migrate
```

#### Dependency Issues
```bash
# Clear cache and reinstall
rm -rf node_modules bun.lock
bun install
```

### Environment Variable Issues
- Ensure `.env.local` exists and has all required variables
- Check for typos in variable names
- Verify API keys are valid and have correct permissions

## Next Steps

1. **Explore the Codebase**: Start with `src/app/page.tsx`
2. **Review Documentation**: Check `/docs` for architecture details
3. **Run Tests**: Ensure everything works with `bun test`
4. **Try Features**: 
   - Create an account
   - Create a space
   - Start a chat
   - Upload files
   - Create notes

## Getting Help

- Check documentation in `/docs`
- Review existing issues on GitHub
- Consult team members for project-specific questions

---

*For production deployment, see [Deployment Guide](./deployment.md)*