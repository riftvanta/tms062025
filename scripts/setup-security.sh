#!/bin/bash
set -euo pipefail

# Security Setup Script for TMS Financial System
# This script configures comprehensive security measures including:
# - Pre-commit hooks for secret detection
# - Commit signing setup
# - Security tools installation
# - Git security configuration

echo "🔒 Setting up Enhanced Security Configuration for TMS..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running in git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Not in a git repository. Please run this script from the project root."
        exit 1
    fi
    log_success "Git repository detected"
}

# Install pre-commit if not installed
install_precommit() {
    log_info "Checking pre-commit installation..."
    
    if command -v pre-commit &> /dev/null; then
        log_success "pre-commit is already installed"
        pre-commit --version
    else
        log_info "Installing pre-commit..."
        
        # Try different installation methods
        if command -v pip3 &> /dev/null; then
            pip3 install pre-commit
        elif command -v pip &> /dev/null; then
            pip install pre-commit
        elif command -v brew &> /dev/null; then
            brew install pre-commit
        elif command -v apt-get &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y pre-commit
        else
            log_error "Could not install pre-commit. Please install it manually."
            exit 1
        fi
        
        log_success "pre-commit installed successfully"
    fi
}

# Install security tools
install_security_tools() {
    log_info "Installing security scanning tools..."
    
    # Install TruffleHog
    if ! command -v trufflehog &> /dev/null; then
        log_info "Installing TruffleHog..."
        if command -v go &> /dev/null; then
            go install github.com/trufflesecurity/trufflehog/v3@latest
        else
            log_warning "Go not found. Please install TruffleHog manually."
        fi
    else
        log_success "TruffleHog already installed"
    fi
    
    # Install GitLeaks
    if ! command -v gitleaks &> /dev/null; then
        log_info "Installing GitLeaks..."
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            wget -O gitleaks.tar.gz https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks_*_linux_x64.tar.gz
            tar -xzf gitleaks.tar.gz gitleaks
            sudo mv gitleaks /usr/local/bin/
            rm gitleaks.tar.gz
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            if command -v brew &> /dev/null; then
                brew install gitleaks
            else
                log_warning "Homebrew not found. Please install GitLeaks manually."
            fi
        else
            log_warning "OS not supported for automatic GitLeaks installation."
        fi
    else
        log_success "GitLeaks already installed"
    fi
    
    # Install Semgrep
    if ! command -v semgrep &> /dev/null; then
        log_info "Installing Semgrep..."
        if command -v pip3 &> /dev/null; then
            pip3 install semgrep
        elif command -v pip &> /dev/null; then
            pip install semgrep
        else
            log_warning "Python pip not found. Please install Semgrep manually."
        fi
    else
        log_success "Semgrep already installed"
    fi
    
    # Install Talisman
    if ! command -v talisman &> /dev/null; then
        log_info "Installing Talisman..."
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            curl -L https://github.com/thoughtworks/talisman/releases/latest/download/talisman_linux_amd64 > talisman
            chmod +x talisman
            sudo mv talisman /usr/local/bin/
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            curl -L https://github.com/thoughtworks/talisman/releases/latest/download/talisman_darwin_amd64 > talisman
            chmod +x talisman
            sudo mv talisman /usr/local/bin/
        else
            log_warning "OS not supported for automatic Talisman installation."
        fi
    else
        log_success "Talisman already installed"
    fi
}

# Set up pre-commit hooks
setup_precommit_hooks() {
    log_info "Setting up pre-commit hooks..."
    
    # Install pre-commit hooks
    pre-commit install
    pre-commit install --hook-type commit-msg
    pre-commit install --hook-type pre-push
    
    # Run pre-commit on all files to ensure everything works
    log_info "Running initial pre-commit check..."
    if pre-commit run --all-files; then
        log_success "Pre-commit hooks installed and tested successfully"
    else
        log_warning "Some pre-commit checks failed. Please review and fix issues."
    fi
}

# Configure Git for security
configure_git_security() {
    log_info "Configuring Git security settings..."
    
    # Enable commit signing (if GPG key is available)
    if gpg --list-secret-keys --keyid-format LONG | grep -q "sec"; then
        log_info "GPG key found. Configuring commit signing..."
        
        # Get the GPG key ID
        GPG_KEY_ID=$(gpg --list-secret-keys --keyid-format LONG | grep sec | head -1 | sed 's/.*\/\([A-F0-9]*\) .*/\1/')
        
        # Configure Git to use GPG signing
        git config user.signingkey "$GPG_KEY_ID"
        git config commit.gpgsign true
        git config tag.gpgsign true
        
        log_success "Commit signing configured with GPG key: $GPG_KEY_ID"
    else
        log_warning "No GPG key found. Skipping commit signing setup."
        log_info "To enable commit signing, generate a GPG key and re-run this script."
    fi
    
    # Configure other security settings
    git config core.autocrlf input
    git config core.safecrlf true
    git config core.filemode true
    git config push.default simple
    git config pull.rebase true
    
    # Configure commit message template
    if [[ ! -f .gitmessage ]]; then
        cat > .gitmessage << 'EOF'
# <type>(<scope>): <subject>
#
# <body>
#
# <footer>
#
# Type: feat, fix, docs, style, refactor, test, chore, security
# Scope: auth, api, ui, db, config, etc.
# Subject: imperative mood, no period, max 50 chars
# Body: explain what and why, max 72 chars per line
# Footer: breaking changes, issues closed
EOF
        git config commit.template .gitmessage
        log_success "Commit message template configured"
    fi
}

# Set up security compliance checks
setup_security_compliance() {
    log_info "Setting up security compliance checks..."
    
    # Create security hooks directory
    mkdir -p .git/hooks/security
    
    # Create security check script
    cat > .git/hooks/security/check-compliance.sh << 'EOF'
#!/bin/bash
# Security compliance check script

echo "🔒 Running security compliance checks..."

# Check for hardcoded secrets
if git diff --cached --name-only | xargs grep -l "password\|secret\|key\|token" 2>/dev/null; then
    echo "❌ Potential secrets detected in staged files!"
    git diff --cached --name-only | xargs grep -n "password\|secret\|key\|token" 2>/dev/null || true
    echo "Please review and remove any hardcoded secrets."
    exit 1
fi

# Check file permissions
if find . -type f \( -perm -002 -o -perm -020 \) -not -path "./.git/*" -not -path "./node_modules/*" | grep -q .; then
    echo "❌ World-writable files detected!"
    find . -type f \( -perm -002 -o -perm -020 \) -not -path "./.git/*" -not -path "./node_modules/*"
    echo "Please fix file permissions."
    exit 1
fi

echo "✅ Security compliance checks passed"
EOF
    
    chmod +x .git/hooks/security/check-compliance.sh
    log_success "Security compliance checks configured"
}

# Create security documentation
create_security_docs() {
    log_info "Creating security documentation..."
    
    # Create security directory
    mkdir -p docs/security
    
    # Create security checklist
    cat > docs/security/checklist.md << 'EOF'
# Security Checklist

## Pre-Commit Security Checks

- [ ] No hardcoded secrets or credentials
- [ ] No sensitive data in commit messages
- [ ] All dependencies are up to date
- [ ] No world-writable files
- [ ] Code follows secure coding practices
- [ ] All tests pass including security tests

## Code Review Security Checks

- [ ] Authentication and authorization logic reviewed
- [ ] Input validation implemented
- [ ] SQL injection prevention measures in place
- [ ] XSS protection implemented
- [ ] CSRF protection enabled
- [ ] Error handling doesn't leak sensitive information

## Production Deployment Security Checks

- [ ] Environment variables properly configured
- [ ] Security headers configured
- [ ] Firebase security rules updated
- [ ] SSL/TLS certificates valid
- [ ] Monitoring and alerting configured
- [ ] Backup and recovery procedures tested
EOF
    
    log_success "Security documentation created"
}

# Main execution
main() {
    echo "🚀 Starting Enhanced Security Configuration Setup..."
    echo "=================================================="
    
    check_git_repo
    install_precommit
    install_security_tools
    setup_precommit_hooks
    configure_git_security
    setup_security_compliance
    create_security_docs
    
    echo "=================================================="
    log_success "Enhanced Security Configuration completed successfully!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Review and customize .pre-commit-config.yaml if needed"
    echo "2. Set up branch protection rules on GitHub"
    echo "3. Configure Dependabot for automated security updates"
    echo "4. Generate GPG key for commit signing (if not done)"
    echo "5. Configure CI/CD secrets in GitHub repository settings"
    echo ""
    echo "🔒 Security tools configured:"
    echo "   - Pre-commit hooks with secret detection"
    echo "   - GitLeaks for credential scanning"
    echo "   - TruffleHog for secret detection"
    echo "   - Semgrep for SAST analysis"
    echo "   - Talisman for security scanning"
    echo ""
    echo "📖 Documentation available in docs/security/"
    echo ""
    log_success "Your repository is now secured with enhanced security measures!"
}

# Execute main function
main "$@" 