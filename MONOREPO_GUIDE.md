# WizCuts Monorepo Guide

## Project Structure

```
wizcuts/
├── frontend/          # Next.js application
├── backend/           # NestJS API
├── scripts/           # Shared development scripts
├── .husky/           # Git hooks
├── docs/             # Documentation
└── package.json      # Monorepo configuration
```

## Monorepo Management

This project uses npm workspaces for efficient monorepo management.

### Installation

```bash
# Install all dependencies for all workspaces
npm install

# Install dependencies for specific workspace
npm install --workspace=frontend
npm install --workspace=backend
```

### Development

```bash
# Start both frontend and backend with health checks
npm run dev

# Quick start (skip health checks)
npm run dev:quick

# Run commands for all workspaces
npm run build:all
npm run test:all
npm run lint:all

# Run commands for specific workspace
npm run --workspace=frontend dev
npm run --workspace=backend start:dev
```

### Code Quality

#### Linting & Formatting

- **ESLint**: Each workspace has its own configuration optimized for its framework
- **Prettier**: Shared configuration at root level
- **Commitlint**: Enforces conventional commit messages

#### Pre-commit Hooks

- Automated formatting and linting via lint-staged
- Secret detection scanner
- TypeScript type checking

### Security

#### Secret Detection

```bash
# Run security scanner
npm run security:scan

# Run comprehensive security audit
npm run security:audit
```

#### Protected Files

- `.env.local` files are automatically ignored
- Secret scanner blocks commits with detected secrets
- Comprehensive .gitignore patterns prevent sensitive file tracking

### Workspace Configuration

#### Frontend (Next.js)

- Path: `./frontend/`
- Framework: Next.js 14
- Authentication: Clerk
- Testing: Jest + Playwright
- ESLint: Next.js optimized configuration

#### Backend (NestJS)

- Path: `./backend/`
- Framework: NestJS
- Database: PostgreSQL with Drizzle ORM
- Testing: Jest
- ESLint: Node.js optimized configuration

### Best Practices

1. **Dependency Management**
   - Install shared dev dependencies at root level
   - Install workspace-specific dependencies in respective directories
   - Use `npm install --workspace=<name>` for workspace-specific packages

2. **Scripting**
   - Use workspace scripts for workspace-specific tasks
   - Use root scripts for cross-workspace operations
   - Shared scripts go in `./scripts/` directory

3. **Configuration**
   - ESLint: Workspace-specific configs for framework optimization
   - Prettier: Shared config at root for consistency
   - TypeScript: Workspace-specific tsconfig files

4. **Security**
   - Never commit `.env` files
   - Use environment variables for secrets
   - Run security scans before pushing

### Troubleshooting

#### Common Issues

1. **node_modules not found**

   ```bash
   npm install  # Install from root
   ```

2. **ESLint errors**

   ```bash
   npm run lint:fix  # Fix auto-fixable issues
   ```

3. **Type errors**
   ```bash
   npm run --workspace=frontend typecheck
   npm run --workspace=backend build
   ```

#### Clean Installation

```bash
# Remove all node_modules and reinstall
rm -rf node_modules frontend/node_modules backend/node_modules
npm install
```

### Git Workflow

1. Create feature branch from `main`
2. Make changes in appropriate workspace
3. Pre-commit hooks automatically run:
   - Linting and formatting
   - Secret detection
   - Type checking
4. Commit with conventional commit messages
5. Push and create pull request

### Deployment

Each workspace can be deployed independently:

#### Frontend

```bash
npm run --workspace=frontend build
npm run --workspace=frontend start
```

#### Backend

```bash
npm run --workspace=backend build
npm run --workspace=backend start:prod
```
