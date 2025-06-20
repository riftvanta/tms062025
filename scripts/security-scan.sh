#!/bin/bash
set -euo pipefail

# Container Security Scanning Script for TMS Financial System
echo "🔒 Starting Comprehensive Security Scan..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Helper functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Initialize scan results
SCAN_RESULTS=()
CRITICAL_ISSUES=0
HIGH_ISSUES=0
MEDIUM_ISSUES=0
LOW_ISSUES=0

# Function to add scan result
add_result() {
    local severity=$1
    local message=$2
    
    case $severity in
        "CRITICAL") CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1)) ;;
        "HIGH") HIGH_ISSUES=$((HIGH_ISSUES + 1)) ;;
        "MEDIUM") MEDIUM_ISSUES=$((MEDIUM_ISSUES + 1)) ;;
        "LOW") LOW_ISSUES=$((LOW_ISSUES + 1)) ;;
    esac
    
    SCAN_RESULTS+=("[$severity] $message")
}

# 1. Container Base Image Security Scan
scan_base_image() {
    log_info "Scanning container base image..."
    
    PACKAGE_COUNT=$(apk info 2>/dev/null | wc -l || echo "0")
    if [ "$PACKAGE_COUNT" -gt 50 ]; then
        add_result "MEDIUM" "High number of packages ($PACKAGE_COUNT)"
    else
        add_result "LOW" "Reasonable package count ($PACKAGE_COUNT)"
    fi
    
    log_success "Base image scan completed"
}

# 2. Node.js Dependencies Security Scan
scan_nodejs_dependencies() {
    log_info "Scanning Node.js dependencies..."
    
    if [ -f "package.json" ]; then
        if command -v npm >/dev/null 2>&1; then
            if npm audit --json > /tmp/npm-audit.json 2>/dev/null; then
                CRITICAL_VULNS=$(jq -r '.metadata.vulnerabilities.critical // 0' /tmp/npm-audit.json 2>/dev/null || echo "0")
                HIGH_VULNS=$(jq -r '.metadata.vulnerabilities.high // 0' /tmp/npm-audit.json 2>/dev/null || echo "0")
                
                if [ "$CRITICAL_VULNS" -gt 0 ]; then
                    add_result "CRITICAL" "$CRITICAL_VULNS critical vulnerabilities"
                elif [ "$HIGH_VULNS" -gt 0 ]; then
                    add_result "HIGH" "$HIGH_VULNS high vulnerabilities"
                else
                    add_result "LOW" "No critical vulnerabilities found"
                fi
            fi
        fi
    else
        add_result "HIGH" "No package.json found"
    fi
    
    log_success "Dependencies scan completed"
}

# 3. Secret Detection Scan
scan_secrets() {
    log_info "Scanning for secrets..."
    
    SECRET_PATTERNS=(
        "AIza[0-9A-Za-z\\-_]{35}"
        "sk_[a-zA-Z0-9]{24,}"
        "-----BEGIN.*PRIVATE KEY-----"
    )
    
    SECRET_FOUND=false
    for pattern in "${SECRET_PATTERNS[@]}"; do
        if find . -name "*.js" -o -name "*.ts" -o -name "*.json" | \
           xargs grep -l -E "$pattern" 2>/dev/null | grep -v node_modules >/dev/null; then
            SECRET_FOUND=true
            break
        fi
    done
    
    if [ "$SECRET_FOUND" = true ]; then
        add_result "CRITICAL" "Potential secrets detected"
    else
        add_result "LOW" "No obvious secrets found"
    fi
    
    log_success "Secret scan completed"
}

# 4. Runtime Security Scan
scan_runtime_security() {
    log_info "Scanning runtime security..."
    
    if [ "$(id -u)" -eq 0 ]; then
        add_result "CRITICAL" "Running as root user"
    else
        add_result "LOW" "Running as non-root user"
    fi
    
    log_success "Runtime scan completed"
}

# Generate report
generate_report() {
    echo ""
    echo "🔒 SECURITY SCAN REPORT"
    echo "======================="
    echo "Critical: $CRITICAL_ISSUES | High: $HIGH_ISSUES | Medium: $MEDIUM_ISSUES | Low: $LOW_ISSUES"
    echo ""
    
    for result in "${SCAN_RESULTS[@]}"; do
        echo "  $result"
    done
    
    if [ "$CRITICAL_ISSUES" -gt 0 ]; then
        echo "❌ CRITICAL issues found - immediate action required"
        return 2
    elif [ "$HIGH_ISSUES" -gt 0 ]; then
        echo "⚠️  HIGH issues found - prompt action recommended"
        return 1
    else
        echo "✅ No critical or high issues found"
        return 0
    fi
}

# Main execution
main() {
    scan_base_image
    scan_nodejs_dependencies
    scan_secrets
    scan_runtime_security
    generate_report
}

main "$@" 