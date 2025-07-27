# WizCuts Developer Guide

## 🚀 Quick Start

### Initial Setup

```bash
# Install all dependencies
npm run install:all

# Start development servers
npm run dev
```

## 🛠️ Development Tools

### 1. **Husky + Lint-Staged**

Automated code quality enforcement on every commit.

**Features:**

- ✅ **Auto-formatting** with Prettier
- ✅ **ESLint** fixes for code quality
- ✅ **Secret scanning** to prevent credential leaks
- ✅ **Commit message linting** for consistent history

### 2. **Available Scripts**

```bash
# Development
npm run dev              # Start both backend and frontend
npm run dev:quick        # Quick start without health checks
npm run dev:status       # Check running services
npm run dev:stop         # Stop all services

# Code Quality
npm run format           # Format all code with Prettier
npm run format:check     # Check formatting without fixing
npm run lint:all         # Lint all projects
npm run lint:fix         # Auto-fix linting issues

# Security
npm run security:audit   # Comprehensive security audit
npm run security:scan    # Scan staged files for secrets

# Testing & Building
npm run test:all         # Run all tests
npm run build:all        # Build all projects
npm run install:all      # Install dependencies for all projects

# Commits
npm run commit           # Interactive commit with commitizen
```

### 3. **Secret Protection** 🔒

Our multi-layered security approach:

1. **Pre-commit Secret Scanner**: Detects 10+ types of secrets
2. **Git Hooks**: Prevent commits with sensitive data
3. **Comprehensive .gitignore**: Protects environment files
4. **Security Audit**: Regular security health checks

**Protected Secret Types:**

- Clerk API keys (sk*test*_, pk*test*_)
- Database connection strings
- AWS credentials
- JWT tokens
- Private keys
- API keys
- Supabase credentials

### 4. **Code Formatting** ✨

**Prettier Configuration:**

- 2-space indentation
- Single quotes
- Trailing commas (ES5)
- 80-character line width
- Auto line-ending normalization

**Auto-formatting triggers:**

- On file save (if configured in your editor)
- Before every commit (via lint-staged)
- Manual via `npm run format`

### 5. **ESLint Rules** 🔍

**Key Rules:**

- TypeScript best practices
- Prettier integration
- Unused variable detection
- Console.log warnings (allow warn/error)
- Const preference over let/var

### 6. **Commit Message Format** 📝

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
type(scope): description

# Examples:
feat(auth): add Clerk authentication
fix(booking): resolve timezone issue
docs(readme): update setup instructions
style(header): improve responsive design
security(env): remove exposed API keys
```

**Commit Types:**

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation
- `style`: Formatting/UI changes
- `refactor`: Code restructuring
- `test`: Adding tests
- `security`: Security improvements
- `chore`: Maintenance tasks

**Interactive Commits:**

```bash
npm run commit  # Guided commit message creation
```

## 📂 Project Structure

```
wizcuts/
├── frontend/           # Next.js application
├── backend/            # NestJS API
├── .husky/            # Git hooks
├── .eslintrc.json     # ESLint configuration
├── .prettierrc        # Prettier configuration
├── commitlint.config.js # Commit linting rules
├── secret-scanner.sh  # Advanced secret detection
├── security-audit.sh  # Security health checker
└── dev-start.sh       # Development orchestration
```

## 🔧 Editor Setup

### VS Code (Recommended)

**Extensions:**

- ESLint
- Prettier
- Husky
- Git Lens
- Thunder Client (API testing)

**Settings (`.vscode/settings.json`):**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## 🚨 Troubleshooting

### Pre-commit Hook Issues

```bash
# Skip hooks for emergency commits (not recommended)
git commit --no-verify -m "emergency fix"

# Fix formatting issues
npm run format
npm run lint:fix

# Check what's being detected
npm run security:scan
```

### Secret Detection False Positives

Edit `secret-scanner.sh` and add patterns to `EXCLUDED_PATTERNS` array.

### Lint-staged Issues

```bash
# Clear lint-staged cache
npx lint-staged --clear-cache

# Debug lint-staged
npx lint-staged --debug
```

## 📚 Best Practices

### 1. **Before Every Commit**

- Run `npm run format` to ensure consistent formatting
- Use `npm run commit` for proper commit messages
- Review security scan results

### 2. **Environment Variables**

- Use `.env.local` for frontend secrets
- Use `.env` for backend secrets
- Never commit actual API keys
- Use `.env.example` files for templates

### 3. **Code Quality**

- Fix ESLint warnings before committing
- Use TypeScript strict mode
- Write descriptive commit messages
- Keep commits atomic and focused

### 4. **Security**

- Regular `npm run security:audit`
- Never disable security hooks
- Use environment variables for all secrets
- Review .gitignore regularly

## 🎯 Workflow Example

```bash
# 1. Start development
npm run dev

# 2. Make changes to code
# ... edit files ...

# 3. Check formatting/linting
npm run format
npm run lint:fix

# 4. Stage changes
git add .

# 5. Commit with proper message
npm run commit
# OR
git commit -m "feat(auth): add user profile page"

# 6. Push changes
git push
```

The pre-commit hooks will automatically:

- ✅ Format your code
- ✅ Fix ESLint issues
- ✅ Scan for secrets
- ✅ Validate commit message format

## 🆘 Need Help?

1. **Run security audit**: `npm run security:audit`
2. **Check our documentation**: Review this guide
3. **Examine git hooks**: Check `.husky/` directory
4. **Test secret scanner**: `npm run security:scan`

---

**Happy coding! 🎉**
