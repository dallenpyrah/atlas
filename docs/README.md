# Atlas v2 Documentation

Welcome to the Atlas v2 project documentation. This comprehensive guide covers all aspects of the application, from setup to deployment.

## 📚 Documentation Structure

### 🚀 Getting Started
- [Setup Guide](./guides/setup.md) - Complete setup instructions for local development
- [Environment Configuration](./guides/environment.md) - Managing environment variables
- [Development Workflow](./guides/development.md) - Best practices for development

### 🏗️ Architecture
- [System Overview](./architecture/overview.md) - High-level architecture design
- [Database Design](./architecture/database.md) - Schema and data model documentation
- [Frontend Architecture](./architecture/frontend.md) - React/Next.js application structure
- [Backend Architecture](./architecture/backend.md) - API and server-side architecture
- [Authentication System](./architecture/authentication.md) - Better Auth implementation
- [Migration System](./architecture/migration-system.md) - Database migration strategy

### 📖 References
- [Configuration Files](./references/configuration.md) - All configuration file documentation
- [Dependencies](./references/dependencies.md) - Complete dependency reference
- [Database Schema](./references/database-schema.md) - Detailed schema documentation
- [API Reference](./references/api.md) - Complete API endpoint documentation
- [Component Library](./references/components.md) - UI component documentation

### 📋 Guides
- [Database Migrations](./guides/database-migrations.md) - Managing database changes
- [Testing Strategy](./guides/testing.md) - Unit, integration, and E2E testing
- [Deployment](./guides/deployment.md) - Production deployment guide
- [Asset Management](./guides/asset-management.md) - Managing static and dynamic assets
- [Schema Evolution](./guides/schema-evolution.md) - Evolving the database schema
- [Performance Optimization](./guides/performance.md) - Optimization techniques

### 🔧 Development Tools
- [Drizzle Kit](./references/drizzle-kit.md) - Database toolkit documentation
- [Next.js Static Files](./references/nextjs-static.md) - Static file handling
- [Trigger.dev](./references/trigger.md) - Background job processing
- [Better Auth](./references/better-auth.md) - Authentication system

## 🎯 Quick Links

### Essential Commands
```bash
# Development
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server

# Database
bun run db:generate  # Generate migrations
bun run db:migrate   # Apply migrations
bun run db:studio    # Open database GUI

# Code Quality
bun run lint         # Run linting
bun run format       # Format code
bun run typecheck    # Type checking
bun test            # Run tests
```

### Key Technologies
- **Framework**: Next.js 15.4.6 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with Polar.sh
- **Background Jobs**: Trigger.dev v3
- **Package Manager**: Bun

### Project Structure
```
atlas-v2/
├── docs/           # This documentation
├── migrations/     # Database migrations
├── public/         # Static assets
├── src/
│   ├── app/       # Next.js pages & API
│   ├── components/# React components
│   ├── lib/       # Core libraries
│   ├── hooks/     # Custom React hooks
│   ├── trigger/   # Background jobs
│   └── types/     # TypeScript types
└── [config files] # Configuration
```

## 🤝 Contributing

1. **Code Style**: Follow the existing patterns and conventions
2. **Documentation**: Update relevant docs with your changes
3. **Testing**: Write tests for new functionality
4. **Reviews**: All changes require code review

## 📞 Support

For questions or issues:
1. Check this documentation first
2. Review existing GitHub issues
3. Create a new issue with detailed information

## 🔄 Version History

- **v0.1.0** - Initial release with core functionality
- Multi-tenant architecture with organizations
- AI-powered chat and notes
- File management system
- Background job processing

---

*Last updated: 2025-08-15*