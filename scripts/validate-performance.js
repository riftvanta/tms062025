#!/usr/bin/env node
/**
 * Performance Validation Script
 * Validates Lighthouse performance reports against defined baselines
 * Specifically tuned for mobile performance targets in Jordan market
 */

const fs = require('fs').promises;
const path = require('path');

// Performance thresholds for different network conditions
const PERFORMANCE_THRESHOLDS = {
  '4G': {
    LCP: 2000,      // Largest Contentful Paint (ms)
    FCP: 1500,      // First Contentful Paint (ms)
    TTI: 2500,      // Time to Interactive (ms)
    CLS: 0.1,       // Cumulative Layout Shift
    TBT: 200,       // Total Blocking Time (ms)
    SI: 2500,       // Speed Index (ms)
    FMP: 2000       // First Meaningful Paint (ms)
  },
  '3G Fast': {
    LCP: 2500,
    FCP: 2000,
    TTI: 3000,
    CLS: 0.1,
    TBT: 300,
    SI: 3000,
    FMP: 2500
  },
  '3G Slow': {
    LCP: 4000,
    FCP: 3000,
    TTI: 5000,
    CLS: 0.15,
    TBT: 600,
    SI: 4500,
    FMP: 3500
  },
  'Edge': {
    LCP: 6000,
    FCP: 4500,
    TTI: 8000,
    CLS: 0.2,
    TBT: 1000,
    SI: 6000,
    FMP: 5000
  }
};

// Bundle size thresholds
const BUNDLE_THRESHOLDS = {
  totalSize: 100 * 1024,        // 100KB total
  firstLoadJS: 50 * 1024,       // 50KB first load JS
  unusedCSS: 20 * 1024,         // 20KB unused CSS threshold
  unusedJS: 30 * 1024,          // 30KB unused JS threshold
  imageOptimization: 0.8        // 80% image optimization score
};

// Parse command line arguments
function parseArguments() {
  const args = process.argv.slice(2);
  const config = {
    report: null,
    network: '3G Fast',
    maxLCP: 2500,
    maxTTI: 3000,
    output: './performance-validation-report.json'
  };

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    
    if (key === 'maxLCP' || key === 'maxTTI') {
      config[key] = parseInt(value);
    } else {
      config[key] = value;
    }
  }

  return config;
}

// Validate performance metrics
function validatePerformanceMetrics(metrics, thresholds, customThresholds = {}) {
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    details: {}
  };

  // Override thresholds with custom values if provided
  const finalThresholds = { ...thresholds, ...customThresholds };

  const metricsToCheck = [
    { key: 'largest-contentful-paint', name: 'LCP', threshold: finalThresholds.maxLCP || finalThresholds.LCP },
    { key: 'first-contentful-paint', name: 'FCP', threshold: finalThresholds.FCP },
    { key: 'interactive', name: 'TTI', threshold: finalThresholds.maxTTI || finalThresholds.TTI },
    { key: 'cumulative-layout-shift', name: 'CLS', threshold: finalThresholds.CLS },
    { key: 'total-blocking-time', name: 'TBT', threshold: finalThresholds.TBT },
    { key: 'speed-index', name: 'SI', threshold: finalThresholds.SI },
    { key: 'first-meaningful-paint', name: 'FMP', threshold: finalThresholds.FMP }
  ];

  metricsToCheck.forEach(metric => {
    const audit = metrics.audits[metric.key];
    if (audit && audit.numericValue !== undefined) {
      const value = audit.numericValue;
      const threshold = metric.threshold;
      
      if (threshold !== undefined) {
        const passed = value <= threshold;
        const status = passed ? 'PASS' : 'FAIL';
        const deviation = value - threshold;
        
        results.details[metric.name] = {
          value: Math.round(value),
          threshold,
          status,
          deviation: Math.round(deviation),
          score: audit.score,
          displayValue: audit.displayValue
        };
        
        if (passed) {
          results.passed++;
        } else {
          results.failed++;
        }
      }
    }
  });

  return results;
}

// Validate bundle size and resource optimization
function validateResourceOptimization(audits) {
  const results = {
    bundleSize: {},
    optimization: {},
    recommendations: []
  };

  // Check bundle size metrics
  const bundleAudits = [
    'total-byte-weight',
    'unused-css-rules',
    'unused-javascript',
    'modern-image-formats',
    'uses-optimized-images',
    'uses-text-compression',
    'uses-responsive-images'
  ];

  bundleAudits.forEach(auditKey => {
    const audit = audits[auditKey];
    if (audit) {
      results.bundleSize[auditKey] = {
        score: audit.score,
        displayValue: audit.displayValue,
        numericValue: audit.numericValue,
        passed: audit.score >= 0.8
      };

      if (audit.score < 0.8) {
        results.recommendations.push({
          type: 'bundle-optimization',
          audit: auditKey,
          title: audit.title,
          description: audit.description,
          score: audit.score
        });
      }
    }
  });

  // Check resource optimization
  const optimizationAudits = [
    'render-blocking-resources',
    'unused-css-rules',
    'unused-javascript',
    'uses-webp-images',
    'efficient-animated-content',
    'offscreen-images'
  ];

  optimizationAudits.forEach(auditKey => {
    const audit = audits[auditKey];
    if (audit) {
      results.optimization[auditKey] = {
        score: audit.score,
        displayValue: audit.displayValue,
        numericValue: audit.numericValue,
        passed: audit.score >= 0.9
      };
    }
  });

  return results;
}

// Validate mobile-specific performance
function validateMobilePerformance(audits) {
  const results = {
    mobileOptimization: {},
    recommendations: []
  };

  const mobileAudits = [
    'viewport',
    'uses-text-compression',
    'uses-responsive-images',
    'tap-targets',
    'content-width'
  ];

  mobileAudits.forEach(auditKey => {
    const audit = audits[auditKey];
    if (audit) {
      const passed = audit.score >= 0.9;
      results.mobileOptimization[auditKey] = {
        score: audit.score,
        displayValue: audit.displayValue,
        passed
      };

      if (!passed) {
        results.recommendations.push({
          type: 'mobile-optimization',
          audit: auditKey,
          title: audit.title,
          description: audit.description,
          score: audit.score
        });
      }
    }
  });

  return results;
}

// Generate performance grade
function generatePerformanceGrade(results) {
  const totalMetrics = results.performance.passed + results.performance.failed;
  const performanceScore = totalMetrics > 0 ? (results.performance.passed / totalMetrics) * 100 : 0;
  
  const bundleOptimizationScore = Object.values(results.bundleOptimization.bundleSize)
    .reduce((sum, audit) => sum + (audit.passed ? 1 : 0), 0) / 
    Object.keys(results.bundleOptimization.bundleSize).length * 100;
  
  const mobileOptimizationScore = Object.values(results.mobileOptimization.mobileOptimization)
    .reduce((sum, audit) => sum + (audit.passed ? 1 : 0), 0) / 
    Object.keys(results.mobileOptimization.mobileOptimization).length * 100;
  
  const overallScore = (performanceScore + bundleOptimizationScore + mobileOptimizationScore) / 3;
  
  let grade;
  if (overallScore >= 90) grade = 'A';
  else if (overallScore >= 80) grade = 'B';
  else if (overallScore >= 70) grade = 'C';
  else if (overallScore >= 60) grade = 'D';
  else grade = 'F';
  
  return {
    overall: Math.round(overallScore),
    performance: Math.round(performanceScore),
    bundleOptimization: Math.round(bundleOptimizationScore),
    mobileOptimization: Math.round(mobileOptimizationScore),
    grade
  };
}

// Main validation function
async function validatePerformance(config) {
  console.log('🚀 Starting performance validation...');
  console.log(`📊 Report: ${config.report}`);
  console.log(`🌐 Network: ${config.network}`);
  console.log(`🎯 LCP Target: ${config.maxLCP}ms`);
  console.log(`🎯 TTI Target: ${config.maxTTI}ms`);

  try {
    // Read Lighthouse report
    const reportData = await fs.readFile(config.report, 'utf8');
    const report = JSON.parse(reportData);

    if (!report.lhr) {
      throw new Error('Invalid Lighthouse report format');
    }

    const { audits, categories } = report.lhr;
    
    // Get performance thresholds for network
    const networkThresholds = PERFORMANCE_THRESHOLDS[config.network] || PERFORMANCE_THRESHOLDS['3G Fast'];
    const customThresholds = {
      maxLCP: config.maxLCP,
      maxTTI: config.maxTTI
    };

    // Validate different aspects of performance
    const results = {
      timestamp: new Date().toISOString(),
      network: config.network,
      url: report.lhr.finalUrl,
      performance: validatePerformanceMetrics(report.lhr, networkThresholds, customThresholds),
      bundleOptimization: validateResourceOptimization(audits),
      mobileOptimization: validateMobilePerformance(audits),
      categories: {
        performance: categories.performance?.score || 0,
        accessibility: categories.accessibility?.score || 0,
        'best-practices': categories['best-practices']?.score || 0,
        seo: categories.seo?.score || 0,
        pwa: categories.pwa?.score || 0
      }
    };

    // Generate overall grade
    results.grade = generatePerformanceGrade(results);

    // Collect all recommendations
    results.recommendations = [
      ...results.bundleOptimization.recommendations,
      ...results.mobileOptimization.recommendations
    ];

    // Generate summary
    const summary = {
      status: results.performance.failed === 0 ? 'PASS' : 'FAIL',
      grade: results.grade.grade,
      overallScore: results.grade.overall,
      metricsCount: {
        passed: results.performance.passed,
        failed: results.performance.failed,
        total: results.performance.passed + results.performance.failed
      },
      recommendations: results.recommendations.length
    };

    console.log('\n📋 Performance Validation Results:');
    console.log(`   Status: ${summary.status}`);
    console.log(`   Grade: ${summary.grade} (${summary.overallScore}%)`);
    console.log(`   Metrics: ${summary.metricsCount.passed}/${summary.metricsCount.total} passed`);
    console.log(`   Recommendations: ${summary.recommendations}`);

    // Log detailed metric results
    console.log('\n📊 Detailed Metrics:');
    Object.entries(results.performance.details).forEach(([metric, data]) => {
      const status = data.status === 'PASS' ? '✅' : '❌';
      const deviation = data.deviation > 0 ? `(+${data.deviation}ms over threshold)` : '';
      console.log(`   ${status} ${metric}: ${data.value}ms (threshold: ${data.threshold}ms) ${deviation}`);
    });

    // Log recommendations
    if (results.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      results.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec.title} (Score: ${rec.score})`);
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
    process.exit(summary.status === 'PASS' ? 0 : 1);

  } catch (error) {
    console.error('❌ Performance validation failed:', error.message);
    process.exit(1);
  }
}

// Generate HTML report
function generateHTMLReport(results) {
  const { grade, performance, bundleOptimization, mobileOptimization } = results;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Validation Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .grade { font-size: 48px; margin: 20px 0; }
        .grade.A { color: #22c55e; }
        .grade.B { color: #84cc16; }
        .grade.C { color: #eab308; }
        .grade.D { color: #f97316; }
        .grade.F { color: #ef4444; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .metric-card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
        .metric-value { font-size: 24px; font-weight: bold; }
        .pass { color: #22c55e; }
        .fail { color: #ef4444; }
        .recommendations { margin-top: 30px; }
        .recommendation { background: #f3f4f6; padding: 15px; margin: 10px 0; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Performance Validation Report</h1>
        <div class="grade ${grade.grade}">${grade.grade}</div>
        <p>Overall Score: ${grade.overall}%</p>
        <p>Network: ${results.network} | Timestamp: ${results.timestamp}</p>
    </div>
    
    <div class="metrics">
        ${Object.entries(performance.details).map(([metric, data]) => `
            <div class="metric-card">
                <h3>${metric}</h3>
                <div class="metric-value ${data.status === 'PASS' ? 'pass' : 'fail'}">
                    ${data.value}ms
                </div>
                <p>Threshold: ${data.threshold}ms</p>
                <p>Status: ${data.status}</p>
                ${data.deviation > 0 ? `<p>Over by: ${data.deviation}ms</p>` : ''}
            </div>
        `).join('')}
    </div>
    
    ${results.recommendations.length > 0 ? `
        <div class="recommendations">
            <h2>Recommendations</h2>
            ${results.recommendations.map(rec => `
                <div class="recommendation">
                    <h3>${rec.title}</h3>
                    <p>${rec.description}</p>
                    <p>Current Score: ${rec.score}</p>
                </div>
            `).join('')}
        </div>
    ` : ''}
</body>
</html>`;
}

// Run validation if called directly
if (require.main === module) {
  const config = parseArguments();
  
  if (!config.report) {
    console.error('❌ Error: --report parameter is required');
    console.log('Usage: node validate-performance.js --report=lighthouse-report.json [--network="3G Fast"] [--maxLCP=2500] [--maxTTI=3000]');
    process.exit(1);
  }
  
  validatePerformance(config);
}

module.exports = { validatePerformance, PERFORMANCE_THRESHOLDS }; 