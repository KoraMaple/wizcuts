#!/usr/bin/env bash
# WizCuts Security Audit Script
# Run this script to check for potential security issues in the repository

echo "🔍 WizCuts Security Audit Report"
echo "================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "frontend" ] && [ ! -d "backend" ]; then
    echo "❌ Please run this script from the WizCuts project root directory"
    exit 1
fi

# Function to check for tracked environment files
check_tracked_env_files() {
    echo "📁 Checking for tracked environment files..."
    
    # Check if any .env files are tracked (except .example files)
    TRACKED_ENV=$(git ls-files | grep -E "\.env" | grep -v "\.example$" || true)
    
    if [ -n "$TRACKED_ENV" ]; then
        echo "❌ WARNING: The following environment files are being tracked by git:"
        echo "$TRACKED_ENV"
        echo "   🔧 To fix: git rm --cached <filename> && git commit"
        echo ""
        return 1
    else
        echo "✅ No environment files are being tracked"
        echo ""
        return 0
    fi
}

# Function to check for secrets in git history
check_git_history() {
    echo "🕰️  Checking git history for potential secrets..."
    
    # Check for Clerk keys in git history
    CLERK_SECRETS=$(git log --all --grep="sk_test_" --grep="sk_live_" --grep="pk_test_" --grep="pk_live_" --oneline || true)
    if [ -n "$CLERK_SECRETS" ]; then
        echo "⚠️  Potential Clerk keys found in commit messages:"
        echo "$CLERK_SECRETS"
        echo ""
    fi
    
    # Check for database URLs in history
    DB_SECRETS=$(git log --all -S "postgresql://" --oneline | head -5 || true)
    if [ -n "$DB_SECRETS" ]; then
        echo "⚠️  Database URLs found in recent commits:"
        echo "$DB_SECRETS"
        echo ""
    fi
    
    echo "✅ Git history check completed"
    echo ""
}

# Function to check current working directory for secrets
check_working_directory() {
    echo "📂 Checking working directory for exposed secrets..."
    
    # Check for actual .env files (not examples)
    ENV_FILES=$(find . -name ".env*" -not -name "*.example" -not -path "./.git/*" 2>/dev/null || true)
    if [ -n "$ENV_FILES" ]; then
        echo "🔍 Found local environment files (should not be committed):"
        echo "$ENV_FILES"
        
        # Check if they contain real secrets
        for file in $ENV_FILES; do
            if [ -f "$file" ]; then
                # Check for real Clerk keys
                REAL_KEYS=$(grep -E "(sk_|pk_)(test_|live_)[a-zA-Z0-9]{64}" "$file" 2>/dev/null | head -2 || true)
                if [ -n "$REAL_KEYS" ]; then
                    echo "⚠️  Real API keys detected in $file (protected by .gitignore)"
                fi
            fi
        done
        echo ""
    fi
    
    echo "✅ Working directory check completed"
    echo ""
}

# Function to verify gitignore protection
check_gitignore_protection() {
    echo "🛡️  Verifying .gitignore protection..."
    
    if [ -f ".gitignore" ]; then
        # Check if .env patterns are properly ignored
        ENV_PROTECTION=$(grep -E "^\.env" .gitignore | grep -v "!.*\.example" || true)
        if [ -n "$ENV_PROTECTION" ]; then
            echo "✅ Environment files are protected by .gitignore"
        else
            echo "❌ WARNING: .env files may not be properly protected"
            echo "   🔧 Add these patterns to .gitignore:"
            echo "   .env"
            echo "   .env.*"
            echo "   !.env.example"
        fi
        
        # Check for other security patterns
        SECRET_PATTERNS=("*.key" "*.pem" "*.p12" "secrets/" "*.bk")
        for pattern in "${SECRET_PATTERNS[@]}"; do
            if grep -q "$pattern" .gitignore; then
                echo "✅ $pattern files are protected"
            else
                echo "⚠️  Consider adding $pattern to .gitignore"
            fi
        done
    else
        echo "❌ WARNING: No .gitignore file found!"
    fi
    echo ""
}

# Function to check pre-commit hooks
check_security_hooks() {
    echo "🪝 Checking security hooks..."
    
    if [ -f ".git/hooks/pre-commit" ]; then
        echo "✅ Pre-commit hook is installed"
        # Check if it's our security hook
        if grep -q "WizCuts Security" .git/hooks/pre-commit; then
            echo "✅ WizCuts security pre-commit hook is active"
        else
            echo "⚠️  Custom pre-commit hook detected (not WizCuts security hook)"
        fi
    else
        echo "❌ No pre-commit hook found"
        echo "   🔧 Consider installing the WizCuts security pre-commit hook"
    fi
    echo ""
}

# Function to show security summary
show_security_summary() {
    echo "📋 Security Summary"
    echo "==================="
    echo "• Environment files should only exist locally (never committed)"
    echo "• Only .env.example files should be in version control"
    echo "• Use placeholder values in .env.example files"
    echo "• Real API keys should only be in local .env files"
    echo "• Pre-commit hooks help prevent accidental commits"
    echo ""
    echo "🔗 For questions, refer to the project's security guidelines"
    echo ""
}

# Run all checks
check_tracked_env_files
check_git_history
check_working_directory
check_gitignore_protection
check_security_hooks
show_security_summary

echo "🎯 Security audit completed!"
echo "Run this script regularly to ensure ongoing security compliance"
