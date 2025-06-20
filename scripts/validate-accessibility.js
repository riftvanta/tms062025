#!/usr/bin/env node
/**
 * Accessibility Validation Script
 * Validates axe-core accessibility reports against WCAG 2.1 AA standards
 * Includes mobile-specific accessibility requirements
 */

const fs = require('fs').promises;
const path = require('path');

// WCAG 2.1 AA requirements
const WCAG_REQUIREMENTS = {
  'color-contrast': {
    level: 'AA',
    ratio: 4.5, // 4.5:1 for normal text
    largeTextRatio: 3.0, // 3:1 for large text
    severity: 'critical'
  },
  'keyboard-navigation': {
    level: 'AA',
    severity: 'critical'
  },
  'focus-management': {
    level: 'AA',
    severity: 'high'
  },
  'aria-labels': {
    level: 'AA',
    severity: 'high'
  },
  'semantic-markup': {
    level: 'AA',
    severity: 'medium'
  }
};

// Mobile-specific accessibility requirements
const MOBILE_A11Y_REQUIREMENTS = {
  touchTargetSize: {
    minimum: 44, // 44px minimum touch target
    preferred: 48, // 48px preferred
    severity: 'high'
  },
  textSize: {
    minimum: 16, // 16px minimum for mobile
    preferred: 18, // 18px preferred
    severity: 'medium'
  },
  gestureSupport: {
    alternatives: true, // Alternative to gesture-based navigation
    severity: 'high'
  },
  screenReader: {
    compatibility: ['VoiceOver', 'TalkBack'],
    severity: 'critical'
  }
};

// Accessibility scoring weights
const SCORING_WEIGHTS = {
  critical: 10,
  high: 5,
  medium: 2,
  low: 1
};

// Parse command line arguments
function parseArguments() {
  const args = process.argv.slice(2);
  const config = {
    report: null,
    minScore: 95,
    output: './accessibility-validation-report.json',
    standard: 'WCAG21AA'
  };

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    
    if (key === 'minScore') {
      config[key] = parseInt(value);
    } else {
      config[key] = value;
    }
  }

  return config;
}

// Calculate accessibility score
function calculateAccessibilityScore(violations, passes, incomplete) {
  let totalDeductions = 0;
  let maxPossibleScore = 100;
  
  // Deduct points for violations based on severity
  violations.forEach(violation => {
    const impact = violation.impact || 'medium';
    const weight = SCORING_WEIGHTS[impact] || SCORING_WEIGHTS.medium;
    const nodeCount = violation.nodes ? violation.nodes.length : 1;
    
    // Deduct points: base weight * number of instances
    totalDeductions += weight * nodeCount;
  });
  
  // Deduct smaller amounts for incomplete tests (potential issues)
  incomplete.forEach(item => {
    const impact = item.impact || 'low';
    const weight = (SCORING_WEIGHTS[impact] || SCORING_WEIGHTS.low) * 0.5;
    const nodeCount = item.nodes ? item.nodes.length : 1;
    
    totalDeductions += weight * nodeCount;
  });
  
  // Calculate final score
  const score = Math.max(0, maxPossibleScore - totalDeductions);
  
  return {
    score: Math.round(score),
    deductions: Math.round(totalDeductions),
    maxPossible: maxPossibleScore,
    breakdown: {
      violations: violations.length,
      passes: passes.length,
      incomplete: incomplete.length
    }
  };
}

// Categorize violations by WCAG principles
function categorizeViolations(violations) {
  const categories = {
    perceivable: [],
    operable: [],
    understandable: [],
    robust: []
  };
  
  const wcagMapping = {
    // Perceivable
    'color-contrast': 'perceivable',
    'image-alt': 'perceivable',
    'audio-caption': 'perceivable',
    'video-caption': 'perceivable',
    
    // Operable
    'keyboard': 'operable',
    'focus-order': 'operable',
    'link-purpose': 'operable',
    'bypass': 'operable',
    'timing': 'operable',
    
    // Understandable
    'language': 'understandable',
    'labels': 'understandable',
    'instructions': 'understandable',
    'error-identification': 'understandable',
    
    // Robust
    'valid-markup': 'robust',
    'aria': 'robust',
    'compatibility': 'robust'
  };
  
  violations.forEach(violation => {
    const ruleId = violation.id;
    let category = 'robust'; // default category
    
    // Find matching category
    Object.entries(wcagMapping).forEach(([pattern, cat]) => {
      if (ruleId.includes(pattern)) {
        category = cat;
      }
    });
    
    categories[category].push(violation);
  });
  
  return categories;
}

// Validate mobile-specific accessibility
function validateMobileAccessibility(violations, passes) {
  const mobileIssues = [];
  const mobileRecommendations = [];
  
  // Check for touch target size violations
  const touchTargetViolations = violations.filter(v => 
    v.id.includes('target-size') || v.id.includes('tap-targets') || v.id.includes('touch-target')
  );
  
  if (touchTargetViolations.length > 0) {
    mobileIssues.push({
      type: 'touch-target-size',
      severity: 'high',
      count: touchTargetViolations.length,
      description: 'Touch targets are smaller than recommended minimum size',
      recommendation: 'Ensure interactive elements are at least 44x44px'
    });
  }
  
  // Check for zoom/scaling violations
  const zoomViolations = violations.filter(v => 
    v.id.includes('meta-viewport') || v.id.includes('zoom')
  );
  
  if (zoomViolations.length > 0) {
    mobileIssues.push({
      type: 'zoom-scaling',
      severity: 'critical',
      count: zoomViolations.length,
      description: 'Page prevents zooming or has viewport scaling disabled',
      recommendation: 'Allow users to zoom up to 200% without loss of functionality'
    });
  }
  
  // Check for orientation violations
  const orientationViolations = violations.filter(v => 
    v.id.includes('orientation') || v.id.includes('rotate')
  );
  
  if (orientationViolations.length > 0) {
    mobileIssues.push({
      type: 'orientation-lock',
      severity: 'medium',
      count: orientationViolations.length,
      description: 'Content is restricted to a specific orientation',
      recommendation: 'Support both portrait and landscape orientations'
    });
  }
  
  // Generate mobile-specific recommendations
  if (mobileIssues.length === 0) {
    mobileRecommendations.push({
      type: 'enhancement',
      description: 'Consider adding mobile-specific accessibility features',
      suggestions: [
        'Implement haptic feedback for important actions',
        'Provide alternative input methods for gestures',
        'Optimize for screen readers (VoiceOver/TalkBack)',
        'Test with mobile assistive technologies'
      ]
    });
  }
  
  return {
    issues: mobileIssues,
    recommendations: mobileRecommendations,
    mobileCompliant: mobileIssues.length === 0
  };
}

// Generate detailed recommendations
function generateRecommendations(violations, categories, mobileValidation) {
  const recommendations = [];
  
  // High-priority fixes
  const criticalViolations = violations.filter(v => v.impact === 'critical');
  if (criticalViolations.length > 0) {
    recommendations.push({
      priority: 'high',
      title: 'Fix Critical Accessibility Issues',
      description: `${criticalViolations.length} critical accessibility violations found`,
      items: criticalViolations.slice(0, 5).map(v => ({
        rule: v.id,
        description: v.description,
        impact: v.impact,
        help: v.help,
        helpUrl: v.helpUrl
      }))
    });
  }
  
  // Color contrast improvements
  const contrastViolations = violations.filter(v => v.id.includes('color-contrast'));
  if (contrastViolations.length > 0) {
    recommendations.push({
      priority: 'high',
      title: 'Improve Color Contrast',
      description: `${contrastViolations.length} elements have insufficient color contrast`,
      items: contrastViolations.slice(0, 3).map(v => ({
        rule: v.id,
        description: 'Text does not meet WCAG AA contrast requirements',
        solution: 'Increase contrast ratio to at least 4.5:1 for normal text, 3:1 for large text'
      }))
    });
  }
  
  // Keyboard navigation improvements
  const keyboardViolations = violations.filter(v => 
    v.id.includes('keyboard') || v.id.includes('focus') || v.id.includes('tabindex')
  );
  if (keyboardViolations.length > 0) {
    recommendations.push({
      priority: 'high',
      title: 'Improve Keyboard Navigation',
      description: `${keyboardViolations.length} keyboard accessibility issues found`,
      items: keyboardViolations.slice(0, 3).map(v => ({
        rule: v.id,
        description: v.description,
        solution: 'Ensure all interactive elements are keyboard accessible'
      }))
    });
  }
  
  // ARIA and semantic markup improvements
  const ariaViolations = violations.filter(v => v.id.includes('aria') || v.id.includes('label'));
  if (ariaViolations.length > 0) {
    recommendations.push({
      priority: 'medium',
      title: 'Improve ARIA and Labels',
      description: `${ariaViolations.length} ARIA and labeling issues found`,
      items: ariaViolations.slice(0, 3).map(v => ({
        rule: v.id,
        description: v.description,
        solution: 'Add proper ARIA labels and semantic markup'
      }))
    });
  }
  
  // Mobile-specific recommendations
  if (mobileValidation.issues.length > 0) {
    recommendations.push({
      priority: 'high',
      title: 'Fix Mobile Accessibility Issues',
      description: 'Mobile-specific accessibility issues found',
      items: mobileValidation.issues.map(issue => ({
        type: issue.type,
        description: issue.description,
        solution: issue.recommendation,
        severity: issue.severity
      }))
    });
  }
  
  return recommendations;
}

// Main validation function
async function validateAccessibility(config) {
  console.log('🚀 Starting accessibility validation...');
  console.log(`📊 Report: ${config.report}`);
  console.log(`🎯 Minimum Score: ${config.minScore}%`);
  console.log(`📋 Standard: ${config.standard}`);

  try {
    // Read accessibility report
    const reportData = await fs.readFile(config.report, 'utf8');
    const report = JSON.parse(reportData);

    if (!report.violations && !report.passes) {
      throw new Error('Invalid accessibility report format');
    }

    const { violations = [], passes = [], incomplete = [] } = report;
    
    // Calculate accessibility score
    const scoreData = calculateAccessibilityScore(violations, passes, incomplete);
    
    // Categorize violations by WCAG principles
    const categories = categorizeViolations(violations);
    
    // Validate mobile-specific accessibility
    const mobileValidation = validateMobileAccessibility(violations, passes);
    
    // Generate recommendations
    const recommendations = generateRecommendations(violations, categories, mobileValidation);
    
    // Compile results
    const results = {
      timestamp: new Date().toISOString(),
      url: report.url || 'Unknown',
      standard: config.standard,
      score: scoreData,
      summary: {
        status: scoreData.score >= config.minScore ? 'PASS' : 'FAIL',
        meetsMinimum: scoreData.score >= config.minScore,
        wcagCompliant: violations.filter(v => v.impact === 'critical').length === 0,
        mobileCompliant: mobileValidation.mobileCompliant
      },
      violations: {
        total: violations.length,
        bySeverity: {
          critical: violations.filter(v => v.impact === 'critical').length,
          serious: violations.filter(v => v.impact === 'serious').length,
          moderate: violations.filter(v => v.impact === 'moderate').length,
          minor: violations.filter(v => v.impact === 'minor').length
        },
        byCategory: {
          perceivable: categories.perceivable.length,
          operable: categories.operable.length,
          understandable: categories.understandable.length,
          robust: categories.robust.length
        }
      },
      passes: {
        total: passes.length
      },
      incomplete: {
        total: incomplete.length
      },
      mobileAccessibility: mobileValidation,
      recommendations,
      detailedViolations: violations.slice(0, 10) // Top 10 violations for details
    };

    console.log('\n📋 Accessibility Validation Results:');
    console.log(`   Status: ${results.summary.status}`);
    console.log(`   Score: ${results.score.score}% (min: ${config.minScore}%)`);
    console.log(`   WCAG Compliant: ${results.summary.wcagCompliant ? 'Yes' : 'No'}`);
    console.log(`   Mobile Compliant: ${results.summary.mobileCompliant ? 'Yes' : 'No'}`);
    console.log(`   Total Violations: ${results.violations.total}`);
    console.log(`   Critical Issues: ${results.violations.bySeverity.critical}`);
    console.log(`   Recommendations: ${results.recommendations.length}`);

    // Log severity breakdown
    console.log('\n📊 Violations by Severity:');
    Object.entries(results.violations.bySeverity).forEach(([severity, count]) => {
      if (count > 0) {
        const icon = severity === 'critical' ? '🔴' : severity === 'serious' ? '🟠' : 
                     severity === 'moderate' ? '🟡' : '🔵';
        console.log(`   ${icon} ${severity}: ${count}`);
      }
    });

    // Log WCAG category breakdown
    console.log('\n📊 Violations by WCAG Category:');
    Object.entries(results.violations.byCategory).forEach(([category, count]) => {
      if (count > 0) {
        console.log(`   ${category}: ${count}`);
      }
    });

    // Log mobile accessibility issues
    if (results.mobileAccessibility.issues.length > 0) {
      console.log('\n📱 Mobile Accessibility Issues:');
      results.mobileAccessibility.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. [${issue.severity.toUpperCase()}] ${issue.description}`);
        console.log(`      Recommendation: ${issue.recommendation}`);
      });
    }

    // Log top recommendations
    if (results.recommendations.length > 0) {
      console.log('\n💡 Top Recommendations:');
      results.recommendations.slice(0, 3).forEach((rec, index) => {
        console.log(`   ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`);
        console.log(`      ${rec.description}`);
      });
    }

    // Save results
    await fs.writeFile(config.output, JSON.stringify(results, null, 2));
    console.log(`\n💾 Validation results saved to: ${config.output}`);

    // Generate HTML report
    const htmlReport = generateHTMLReport(results);
    const htmlPath = config.output.replace('.json', '.html');
    await fs.writeFile(htmlPath, htmlReport);
    console.log(`📄 HTML report saved to: ${htmlPath}`);

    // Exit with appropriate code
    process.exit(results.summary.status === 'PASS' ? 0 : 1);

  } catch (error) {
    console.error('❌ Accessibility validation failed:', error.message);
    process.exit(1);
  }
}

// Generate HTML report
function generateHTMLReport(results) {
  const { score, violations, summary, recommendations, mobileAccessibility } = results;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accessibility Validation Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; }
        .score { font-size: 48px; margin: 20px 0; font-weight: bold; }
        .pass { color: #22c55e; }
        .fail { color: #ef4444; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
        .violations { margin: 30px 0; }
        .violation { background: #fee; border: 1px solid #fcc; padding: 15px; margin: 10px 0; border-radius: 8px; }
        .violation.critical { border-color: #dc2626; background: #fef2f2; }
        .violation.serious { border-color: #ea580c; background: #fff7ed; }
        .violation.moderate { border-color: #d97706; background: #fffbeb; }
        .violation.minor { border-color: #0891b2; background: #f0f9ff; }
        .recommendations { margin: 30px 0; }
        .recommendation { background: #f0f9ff; border: 1px solid #bae6fd; padding: 15px; margin: 10px 0; border-radius: 8px; }
        .mobile-issues { margin: 30px 0; }
        .mobile-issue { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; margin: 10px 0; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Accessibility Validation Report</h1>
        <div class="score ${summary.status === 'PASS' ? 'pass' : 'fail'}">${score.score}%</div>
        <p>WCAG 2.1 AA Compliance: ${summary.wcagCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}</p>
        <p>Mobile Accessibility: ${summary.mobileCompliant ? 'COMPLIANT' : 'NEEDS IMPROVEMENT'}</p>
        <p>Generated: ${results.timestamp}</p>
    </div>
    
    <div class="summary">
        <div class="summary-card">
            <h3>Overall Status</h3>
            <div style="font-size: 24px; font-weight: bold;" class="${summary.status === 'PASS' ? 'pass' : 'fail'}">
                ${summary.status}
            </div>
        </div>
        <div class="summary-card">
            <h3>Total Violations</h3>
            <div style="font-size: 24px; font-weight: bold;" class="${violations.total > 0 ? 'fail' : 'pass'}">
                ${violations.total}
            </div>
        </div>
        <div class="summary-card">
            <h3>Critical Issues</h3>
            <div style="font-size: 24px; font-weight: bold;" class="${violations.bySeverity.critical > 0 ? 'fail' : 'pass'}">
                ${violations.bySeverity.critical}
            </div>
        </div>
        <div class="summary-card">
            <h3>Tests Passed</h3>
            <div style="font-size: 24px; font-weight: bold;" class="pass">
                ${results.passes.total}
            </div>
        </div>
    </div>
    
    <h2>Violations by Severity</h2>
    <div class="violations">
        ${Object.entries(violations.bySeverity).map(([severity, count]) => 
          count > 0 ? `
            <div class="violation ${severity}">
                <h3>${severity.charAt(0).toUpperCase() + severity.slice(1)} (${count})</h3>
                <p>Impact: ${severity} - Requires ${severity === 'critical' || severity === 'serious' ? 'immediate' : 'timely'} attention</p>
            </div>
          ` : ''
        ).join('')}
    </div>
    
    ${mobileAccessibility.issues.length > 0 ? `
        <h2>Mobile Accessibility Issues</h2>
        <div class="mobile-issues">
            ${mobileAccessibility.issues.map(issue => `
                <div class="mobile-issue">
                    <h3>[${issue.severity.toUpperCase()}] ${issue.type}</h3>
                    <p><strong>Issue:</strong> ${issue.description}</p>
                    <p><strong>Recommendation:</strong> ${issue.recommendation}</p>
                    <p><strong>Instances:</strong> ${issue.count}</p>
                </div>
            `).join('')}
        </div>
    ` : ''}
    
    <h2>Recommendations</h2>
    <div class="recommendations">
        ${recommendations.map(rec => `
            <div class="recommendation">
                <h3>[${rec.priority.toUpperCase()}] ${rec.title}</h3>
                <p>${rec.description}</p>
                ${rec.items ? `
                    <ul>
                        ${rec.items.slice(0, 3).map(item => `
                            <li><strong>${item.rule || item.type}:</strong> ${item.description || item.solution}</li>
                        `).join('')}
                    </ul>
                ` : ''}
            </div>
        `).join('')}
    </div>
    
    <div style="margin-top: 50px; padding: 20px; background: #f9fafb; border-radius: 8px;">
        <h3>About This Report</h3>
        <p>This accessibility validation report is based on automated testing using axe-core and WCAG 2.1 AA standards. Manual testing by users with disabilities is also recommended for comprehensive accessibility validation.</p>
        <p>For more information about web accessibility, visit <a href="https://www.w3.org/WAI/">Web Accessibility Initiative (WAI)</a>.</p>
    </div>
</body>
</html>`;
}

// Run validation if called directly
if (require.main === module) {
  const config = parseArguments();
  
  if (!config.report) {
    console.error('❌ Error: --report parameter is required');
    console.log('Usage: node validate-accessibility.js --report=accessibility-report.json [--minScore=95]');
    process.exit(1);
  }
  
  validateAccessibility(config);
}

module.exports = { validateAccessibility, WCAG_REQUIREMENTS, MOBILE_A11Y_REQUIREMENTS }; 