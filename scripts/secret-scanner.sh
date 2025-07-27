#!/bin/bash

# WizCuts Secret Scanner
echo "🔍 WizCuts Secret Scanner"
echo "================================"

# Get list of files to scan
if [ "$1" = "--staged" ]; then
    files=$(git diff --cached --name-only --diff-filter=ACM 2>/dev/null || echo "")
    echo "📝 Scanning staged files for commit..."
    scan_mode="staged"
else
    # For manual scan, check git-tracked files only (excluding node_modules completely)
    files=$(git ls-files | grep -E '\.(ts|js|tsx|jsx|json|yml|yaml)$' | grep -v -E "(node_modules|\.next|dist|build|coverage)" || echo "")
    echo "📝 Scanning git-tracked files..."
    scan_mode="manual"
fi

# Exit if no files to scan
if [ -z "$files" ]; then
    echo "✅ No files to scan"
    exit 0
fi

echo "🔍 Checking for secrets..."

# Count files
file_count=$(echo "$files" | wc -l | tr -d ' ')
echo "Found $file_count files to scan"

# Pattern checks
secrets_found=false
violations=0

for file in $files; do
    if [ ! -f "$file" ]; then
        continue
    fi
    
    # Skip test files for certain patterns
    is_test_file=false
    if [[ "$file" =~ (test|spec) ]]; then
        is_test_file=true
    fi
    
    # Check for actual secret values (not just variable names)
    if grep -qE "(sk_test_|sk_live_|pk_test_|pk_live_)[a-zA-Z0-9]{32,}" "$file" 2>/dev/null; then
        echo "❌ Found Clerk API keys in: $file"
        secrets_found=true
        violations=$((violations + 1))
    fi
    
    if grep -qE "AKIA[0-9A-Z]{16}" "$file" 2>/dev/null; then
        echo "❌ Found AWS access keys in: $file"
        secrets_found=true
        violations=$((violations + 1))
    fi
    
    if grep -qE "-----BEGIN [A-Z ]+ PRIVATE KEY-----" "$file" 2>/dev/null; then
        echo "❌ Found private keys in: $file"
        secrets_found=true
        violations=$((violations + 1))
    fi
    
    # Check for actual secret assignments (skip test files with localhost URLs)
    if [ "$is_test_file" = false ] && grep -qE "(JWT_SECRET|DATABASE_URL|DB_URL)\s*=\s*['\"][^'\"]{10,}['\"]" "$file" 2>/dev/null; then
        echo "❌ Found hardcoded secrets in: $file"
        secrets_found=true
        violations=$((violations + 1))
    elif [ "$is_test_file" = true ] && grep -qE "(JWT_SECRET|DATABASE_URL|DB_URL)\s*=\s*['\"][^'\"]{10,}['\"]" "$file" 2>/dev/null; then
        # Only flag test files if they contain non-localhost URLs
        if ! grep -qE "localhost|127\.0\.0\.1|test_db" "$file" 2>/dev/null; then
            echo "⚠️  Found hardcoded secrets in test file: $file"
            echo "   💡 Consider using test fixtures or environment variables"
        fi
    fi
done

# Final result
echo ""
echo "Scan completed: $violations violations found"

if [ "$secrets_found" = true ]; then
    echo "❌ SECRETS DETECTED! Commit blocked for security."
    echo "💡 Move secrets to .env.local or environment variables"
    exit 1
else
    echo "✅ No secrets detected. Safe to commit!"
    exit 0
fi
