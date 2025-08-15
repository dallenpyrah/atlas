# Contributing Guide

Welcome to Atlas v2! We appreciate your interest in contributing to our project. This guide will help you get started with contributing code, documentation, and ideas.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing Requirements](#testing-requirements)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)
- [Documentation](#documentation)

## Code of Conduct

Please note that this project adheres to a Code of Conduct. By participating, you are expected to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- **Bun** (latest version) - JavaScript runtime and package manager
- **Node.js** 20+ (for compatibility with some tools)
- **PostgreSQL** 15+ - Database
- **Git** - Version control

### Required Accounts

- GitHub account for code contributions
- Vercel account (optional, for deployment testing)
- Access to required API keys (see Environment Setup)

## Development Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/atlas-v2.git
cd atlas-v2
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Environment Setup

```bash
# Copy example environment file
cp .env.example .env.local

# Or pull from Vercel (if you have access)
vercel link
vercel env pull .env.local
```

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Authentication secret
- `RESEND_API_KEY` - Email service
- AI provider keys (at least one required)
- See `.env.example` for complete list

### 4. Database Setup

```bash
# Generate database schema
bun run db:generate

# Apply migrations
bun run db:migrate

# Open database studio (optional)
bun run db:studio
```

### 5. Start Development Server

```bash
bun run dev
```

Visit http://localhost:3000 to see the application.

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or fixes
- `chore/` - Maintenance tasks

### 2. Make Your Changes

Follow the code style guidelines and ensure your changes:
- Are focused and atomic
- Include tests when applicable
- Update documentation if needed
- Don't break existing functionality

### 3. Run Quality Checks

```bash
# Format code
bun run format

# Run linter
bun run lint:fix

# Type checking
bun run typecheck

# Run tests
bun test
```

### 4. Commit Your Changes

Follow conventional commit format:
```bash
git add .
git commit -m "feat: add new chat feature"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Code Style Guidelines

### TypeScript/JavaScript

```typescript
// Use explicit types
interface UserData {
  id: string
  email: string
  name?: string
}

// Prefer const over let
const userData: UserData = { id: '1', email: 'test@example.com' }

// Use arrow functions for callbacks
users.map((user) => user.name)

// Early returns
function processUser(user: User) {
  if (!user) return null
  if (!user.isActive) return null
  
  return transformUser(user)
}

// Descriptive variable names
const isUserAuthenticated = checkAuth()
const activeUsersCount = users.filter(u => u.active).length
```

### React Components

```typescript
// Use function components with TypeScript
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
}

export function Button({ 
  children, 
  onClick, 
  variant = 'primary' 
}: ButtonProps) {
  return (
    <button 
      className={cn('button', `button--${variant}`)}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

// Prefer server components where possible
// Use 'use client' only when necessary
```

### File Organization

```typescript
// 1. Imports (sorted)
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

// 2. Types/Interfaces
interface Props {}

// 3. Component
export function Component() {}

// 4. Helper functions
function helperFunction() {}
```

### CSS/Tailwind

```tsx
// Use Tailwind classes
<div className="flex items-center gap-4 p-4">

// Use cn() for conditional classes
<button className={cn(
  'px-4 py-2 rounded',
  isActive && 'bg-blue-500',
  isDisabled && 'opacity-50 cursor-not-allowed'
)}>

// Avoid inline styles
// ❌ Bad
<div style={{ padding: '10px' }}>

// ✅ Good
<div className="p-2.5">
```

## Testing Requirements

### Test Coverage

All new features and bug fixes should include tests:

- **Unit tests** for utility functions and hooks
- **Component tests** for UI components
- **Integration tests** for API routes
- **E2E tests** for critical user flows

### Writing Tests

```typescript
// Good test example
describe('formatCurrency', () => {
  test('formats positive numbers correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56')
  })
  
  test('handles negative numbers', () => {
    expect(formatCurrency(-100)).toBe('-$100.00')
  })
  
  test('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })
})
```

### Running Tests

```bash
# Run all tests
bun test

# Run with coverage
bun test:unit

# Run specific test
bun test auth.test.ts

# Run E2E tests
bun test:e2e
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Examples

```bash
# Feature
git commit -m "feat(chat): add message editing capability"

# Bug fix
git commit -m "fix(auth): resolve session timeout issue"

# Documentation
git commit -m "docs: update API documentation"

# Refactoring
git commit -m "refactor(api): simplify chat service logic"
```

### Commit Message Rules

1. Use present tense ("add" not "added")
2. Use imperative mood ("move" not "moves")
3. Keep subject line under 50 characters
4. Separate subject from body with blank line
5. Use body to explain what and why vs. how

## Pull Request Process

### Before Creating a PR

1. **Update your branch**:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Run all checks**:
   ```bash
   bun run lint
   bun run typecheck
   bun test
   ```

3. **Update documentation** if needed

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No console.logs left
- [ ] Changes generate no warnings
```

### PR Review Process

1. **Automated checks** must pass
2. **Code review** by at least one maintainer
3. **Testing** verification
4. **Documentation** review if applicable
5. **Approval and merge**

## Project Structure

```
atlas-v2/
├── src/
│   ├── app/              # Next.js app router
│   │   ├── api/         # API routes
│   │   └── (auth)/      # Auth pages
│   ├── components/       # React components
│   │   └── ui/          # Shadcn/ui components
│   ├── lib/             # Utilities and libraries
│   │   ├── db/          # Database schema
│   │   └── auth.ts      # Auth configuration
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript types
│   └── trigger/         # Background jobs
├── docs/                # Documentation
├── public/             # Static assets
└── migrations/         # Database migrations
```

## Documentation

### Code Documentation

```typescript
/**
 * Calculates the total price including tax
 * @param price - Base price in cents
 * @param taxRate - Tax rate as decimal (0.1 = 10%)
 * @returns Total price in cents
 */
export function calculateTotal(price: number, taxRate: number): number {
  return Math.round(price * (1 + taxRate))
}
```

### API Documentation

Document new API endpoints in relevant files:

```typescript
/**
 * GET /api/chats
 * 
 * Retrieves all chats for the authenticated user
 * 
 * @auth Required
 * @query {number} limit - Max number of chats (default: 50)
 * @query {string} cursor - Pagination cursor
 * 
 * @returns {Chat[]} Array of chat objects
 * @throws {401} Unauthorized
 * @throws {500} Internal server error
 */
```

### Component Documentation

```typescript
/**
 * Button component with multiple variants
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="lg" onClick={handleClick}>
 *   Click me
 * </Button>
 * ```
 */
```

## Getting Help

### Resources

- [Project Documentation](./README.md)
- [Bun Documentation](https://bun.sh/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)

### Communication

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Pull Requests**: Code contributions

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## Thank You!

Thank you for contributing to Atlas v2! Your efforts help make this project better for everyone. 🎉