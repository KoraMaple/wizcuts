#!/usr/bin/env bash
# WizCuts Advanced Secret Scanner
# Comprehensive secret detection for pre-commit hooks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Emoji for better UX
LOCK="🔒"
WARNING="⚠️"
CHECK="✅"
CROSS="❌"
SEARCH="🔍"

echo -e "${BLUE}${SEARCH} WizCuts Secret Scanner${NC}"
echo "================================"

# Get staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM 2>/dev/null || echo "")

if [ -z "$STAGED_FILES" ]; then
    echo -e "${GREEN}${CHECK} No staged files to scan${NC}"
    exit 0
fi

# Secret patterns to detect
declare -A PATTERNS=(
    ["ClerkSecretKeys"]="(sk_test_|sk_live_)[a-zA-Z0-9]{32,}"
    ["ClerkPublishableKeys"]="(pk_test_|pk_live_)[a-zA-Z0-9]{32,}"
    ["AWSAccessKeys"]="AKIA[0-9A-Z]{16}"
    ["AWSSecretKeys"]="[0-9a-zA-Z/+]{40}"
    ["DatabaseURLs"]="postgresql://[^:]+:[^@]+@[^/]+/[^\s]+"
    ["MongoDBURLs"]="mongodb(\+srv)?://[^:]+:[^@]+@[^/]+/[^\s]+"
    ["APIKeys"]="['\"]?[a-zA-Z0-9_-]*[aA][pP][iI][_-]?[kK][eE][yY]['\"]?\s*[:=]\s*['\"][a-zA-Z0-9_-]{20,}['\"]"
    ["JWTTokens"]="eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*"
    ["PrivateKeys"]="-----BEGIN [A-Z ]+ PRIVATE KEY-----"
    ["SupabaseURLs"]="https://[a-z0-9]{20}\.supabase\.co"
    ["SupabaseKeys"]="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*"
)

# Files to exclude from scanning
EXCLUDED_PATTERNS=(
    "\.example$"
    "\.md$"
    "\.txt$"
    "test/"
    "spec/"
    "__tests__/"
    "\.test\."
    "\.spec\."
    "security-scanner\.sh$"
    "pre-commit$"
)

# Function to convert camelCase to readable format
readable_name() {
    local name="$1"
    # Convert camelCase to space-separated words
    echo "$name" | sed 's/\([A-Z]\)/ \1/g' | sed 's/^ //'
}

# Function to check if file should be excluded
should_exclude_file() {
    local file="$1"
    
    for pattern in "${EXCLUDED_PATTERNS[@]}"; do
        if [[ $file =~ $pattern ]]; then
            return 0
        fi
    done
    return 1
}

# Function to scan file content
scan_file() {
    local file="$1"
    local violations=0
    
    # Skip if file doesn't exist or is binary
    if [ ! -f "$file" ] || file "$file" | grep -q "binary"; then
        return 0
    fi
    
    # Skip excluded files
    if should_exclude_file "$file"; then
        return 0
    fi
    
    echo -e "${BLUE}Scanning: $file${NC}"
    
    # Get staged content
    local content=$(git show ":$file" 2>/dev/null || cat "$file")
    
    # Scan for each pattern
    for pattern_name in "${!PATTERNS[@]}"; do
        local pattern="${PATTERNS[$pattern_name]}"
        
        # Search for pattern in content
        local matches=$(echo "$content" | grep -E "$pattern" | head -3 || true)
        
        if [ -n "$matches" ]; then
            local display_name=$(readable_name "$pattern_name")
            echo -e "${RED}${CROSS} Found $display_name in $file:${NC}"
            echo "$matches" | while read -r line; do
                echo -e "  ${YELLOW}$line${NC}"
            done
            echo ""
            violations=$((violations + 1))
        fi
    done
    
    return $violations
}

# Main scanning logic
total_violations=0
scanned_files=0

for file in $STAGED_FILES; do
    if scan_file "$file"; then
        violations=$?
        total_violations=$((total_violations + violations))
        scanned_files=$((scanned_files + 1))
    fi
done

echo "================================"
echo -e "${BLUE}Scan Summary:${NC}"
echo -e "Files scanned: $scanned_files"
echo -e "Total violations: $total_violations"

if [ $total_violations -gt 0 ]; then
    echo ""
    echo -e "${RED}${CROSS} SECRET SCAN FAILED!${NC}"
    echo ""
    echo -e "${YELLOW}${WARNING} Security Guidelines:${NC}"
    echo "  • Remove actual secrets from code"
    echo "  • Use environment variables instead"
    echo "  • Add sensitive files to .gitignore"
    echo "  • Use placeholder values in examples"
    echo ""
    echo -e "${BLUE}Common fixes:${NC}"
    echo "  • Replace 'sk_test_abc123...' with 'sk_test_your_secret_key_here'"
    echo "  • Replace 'pk_test_xyz789...' with 'pk_test_your_publishable_key_here'"
    echo "  • Move real credentials to .env.local files"
    echo ""
    exit 1
else
    echo -e "${GREEN}${CHECK} No secrets detected in staged files${NC}"
    echo -e "${GREEN}${LOCK} Safe to commit!${NC}"
    exit 0
fi
