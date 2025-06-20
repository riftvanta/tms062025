#!/usr/bin/env node
/**
 * Responsive Design Testing Script
 * Tests the application's responsive behavior across multiple breakpoints
 * Validates layout, navigation, and content adaptation for mobile-first design
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Mobile-first responsive breakpoints
const RESPONSIVE_BREAKPOINTS = {
  'xs': { width: 320, height: 568, description: 'Extra Small (iPhone 5/SE)' },
  'sm': { width: 375, height: 667, description: 'Small (iPhone 6/7/8)' },
  'md': { width: 414, height: 896, description: 'Medium (iPhone 6+/7+/8+)' },
  'lg': { width: 768, height: 1024, description: 'Large (iPad Portrait)' },
  'xl': { width: 1024, height: 768, description: 'Extra Large (iPad Landscape)' },
  'xxl': { width: 1440, height: 900, description: 'Desktop' }
};

// Test scenarios for responsive design
const RESPONSIVE_TEST_SCENARIOS = [
  {
    name: 'layout_adaptation',
    description: 'Test layout adaptation across breakpoints',
    test: async (page, breakpoint, url) => {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      
      const layoutInfo = await page.evaluate(() => {
        const header = document.querySelector('header, [role="banner"], .header');
        const nav = document.querySelector('nav, [role="navigation"], .nav, .navigation');
        const main = document.querySelector('main, [role="main"], .main');
        const footer = document.querySelector('footer, [role="contentinfo"], .footer');
        
        return {
          header: header ? {
            height: header.offsetHeight,
            visible: window.getComputedStyle(header).display !== 'none'
          } : null,
          nav: nav ? {
            height: nav.offsetHeight,
            width: nav.offsetWidth,
            visible: window.getComputedStyle(nav).display !== 'none',
            position: window.getComputedStyle(nav).position,
            overflow: window.getComputedStyle(nav).overflow
          } : null,
          main: main ? {
            width: main.offsetWidth,
            height: main.offsetHeight,
            padding: window.getComputedStyle(main).padding,
            margin: window.getComputedStyle(main).margin
          } : null,
          footer: footer ? {
            height: footer.offsetHeight,
            visible: window.getComputedStyle(footer).display !== 'none'
          } : null,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        };
      });
      
      return layoutInfo;
    }
  },
  
  {
    name: 'navigation_adaptation',
    description: 'Test navigation adaptation for mobile devices',
    test: async (page, breakpoint, url) => {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      
      const navigationInfo = await page.evaluate(() => {
        const hamburger = document.querySelector('.hamburger, .menu-toggle, [data-testid="menu-toggle"]');
        const sideNav = document.querySelector('.sidebar, .side-nav, [data-testid="side-nav"]');
        const mainNav = document.querySelector('.main-nav, .primary-nav, nav ul');
        const bottomNav = document.querySelector('.bottom-nav, .tab-bar, [data-testid="bottom-nav"]');
        
        return {
          hamburger: hamburger ? {
            visible: window.getComputedStyle(hamburger).display !== 'none',
            position: window.getComputedStyle(hamburger).position,
            zIndex: window.getComputedStyle(hamburger).zIndex
          } : null,
          sideNav: sideNav ? {
            visible: window.getComputedStyle(sideNav).display !== 'none',
            width: sideNav.offsetWidth,
            transform: window.getComputedStyle(sideNav).transform,
            position: window.getComputedStyle(sideNav).position
          } : null,
          mainNav: mainNav ? {
            visible: window.getComputedStyle(mainNav).display !== 'none',
            flexDirection: window.getComputedStyle(mainNav).flexDirection,
            justifyContent: window.getComputedStyle(mainNav).justifyContent
          } : null,
          bottomNav: bottomNav ? {
            visible: window.getComputedStyle(bottomNav).display !== 'none',
            position: window.getComputedStyle(bottomNav).position,
            bottom: window.getComputedStyle(bottomNav).bottom
          } : null
        };
      });
      
      // Test hamburger menu interaction if present
      if (navigationInfo.hamburger?.visible) {
        try {
          await page.click('.hamburger, .menu-toggle, [data-testid="menu-toggle"]');
          await page.waitForTimeout(300); // Animation time
          
          const menuOpened = await page.evaluate(() => {
            const sideNav = document.querySelector('.sidebar, .side-nav, [data-testid="side-nav"]');
            return sideNav && window.getComputedStyle(sideNav).display !== 'none';
          });
          
          navigationInfo.hamburgerFunctional = menuOpened;
        } catch (error) {
          navigationInfo.hamburgerFunctional = false;
        }
      }
      
      return navigationInfo;
    }
  },
  
  {
    name: 'content_readability',
    description: 'Test content readability and text sizing',
    test: async (page, breakpoint, url) => {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      
      const contentInfo = await page.evaluate(() => {
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        const paragraphs = Array.from(document.querySelectorAll('p'));
        const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"]'));
        const links = Array.from(document.querySelectorAll('a'));
        
        const getFontSize = (element) => {
          return parseFloat(window.getComputedStyle(element).fontSize);
        };
        
        const getLineHeight = (element) => {
          return window.getComputedStyle(element).lineHeight;
        };
        
        return {
          headings: headings.map(h => ({
            tag: h.tagName,
            fontSize: getFontSize(h),
            lineHeight: getLineHeight(h),
            text: h.textContent.trim().substring(0, 50)
          })),
          paragraphs: paragraphs.slice(0, 5).map(p => ({
            fontSize: getFontSize(p),
            lineHeight: getLineHeight(p),
            wordCount: p.textContent.trim().split(/\s+/).length
          })),
          buttons: buttons.slice(0, 10).map(b => ({
            width: b.offsetWidth,
            height: b.offsetHeight,
            fontSize: getFontSize(b),
            text: b.textContent.trim()
          })),
          links: links.slice(0, 10).map(l => ({
            fontSize: getFontSize(l),
            underline: window.getComputedStyle(l).textDecoration.includes('underline'),
            color: window.getComputedStyle(l).color
          }))
        };
      });
      
      // Validate minimum touch target sizes and text readability
      const validation = {
        minTextSize: 16, // 16px minimum for mobile
        minTouchTarget: 44, // 44px minimum touch target
        issues: []
      };
      
      // Check button touch targets
      contentInfo.buttons.forEach((button, index) => {
        if (button.width < validation.minTouchTarget || button.height < validation.minTouchTarget) {
          validation.issues.push({
            type: 'touch-target',
            element: `button-${index}`,
            issue: `Button too small: ${button.width}x${button.height}px`,
            recommendation: `Minimum ${validation.minTouchTarget}x${validation.minTouchTarget}px`
          });
        }
      });
      
      // Check text readability
      contentInfo.paragraphs.forEach((paragraph, index) => {
        if (paragraph.fontSize < validation.minTextSize) {
          validation.issues.push({
            type: 'text-size',
            element: `paragraph-${index}`,
            issue: `Text too small: ${paragraph.fontSize}px`,
            recommendation: `Minimum ${validation.minTextSize}px for mobile`
          });
        }
      });
      
      return { ...contentInfo, validation };
    }
  },
  
  {
    name: 'form_usability',
    description: 'Test form usability across breakpoints',
    test: async (page, breakpoint, url) => {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      
      const formInfo = await page.evaluate(() => {
        const forms = Array.from(document.querySelectorAll('form'));
        const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
        
        return {
          forms: forms.map(form => ({
            width: form.offsetWidth,
            padding: window.getComputedStyle(form).padding,
            margin: window.getComputedStyle(form).margin
          })),
          inputs: inputs.map(input => ({
            type: input.type || input.tagName,
            width: input.offsetWidth,
            height: input.offsetHeight,
            fontSize: parseFloat(window.getComputedStyle(input).fontSize),
            padding: window.getComputedStyle(input).padding,
            hasLabel: !!input.labels?.length || !!document.querySelector(`label[for="${input.id}"]`),
            required: input.required,
            placeholder: input.placeholder
          }))
        };
      });
      
      // Validate form usability
      const validation = {
        minInputHeight: 44, // 44px minimum for mobile
        minFontSize: 16,    // 16px to prevent zoom on iOS
        issues: []
      };
      
      formInfo.inputs.forEach((input, index) => {
        if (input.height < validation.minInputHeight) {
          validation.issues.push({
            type: 'input-height',
            element: `input-${index}`,
            issue: `Input too short: ${input.height}px`,
            recommendation: `Minimum ${validation.minInputHeight}px height`
          });
        }
        
        if (input.fontSize < validation.minFontSize) {
          validation.issues.push({
            type: 'input-font-size',
            element: `input-${index}`,
            issue: `Input font too small: ${input.fontSize}px`,
            recommendation: `Minimum ${validation.minFontSize}px to prevent zoom`
          });
        }
        
        if (!input.hasLabel) {
          validation.issues.push({
            type: 'accessibility',
            element: `input-${index}`,
            issue: 'Input missing label',
            recommendation: 'Add proper label or aria-label'
          });
        }
      });
      
      return { ...formInfo, validation };
    }
  },
  
  {
    name: 'image_optimization',
    description: 'Test image responsiveness and optimization',
    test: async (page, breakpoint, url) => {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      
      const imageInfo = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        
        return images.map(img => ({
          src: img.src,
          alt: img.alt,
          width: img.offsetWidth,
          height: img.offsetHeight,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          loading: img.loading,
          srcset: img.srcset,
          sizes: img.sizes,
          aspectRatio: img.naturalWidth / img.naturalHeight,
          isResponsive: window.getComputedStyle(img).maxWidth === '100%'
        }));
      });
      
      // Validate image optimization
      const validation = {
        issues: []
      };
      
      imageInfo.forEach((img, index) => {
        // Check if image is too large for viewport
        if (img.naturalWidth > breakpoint.width * 2) {
          validation.issues.push({
            type: 'image-size',
            element: `img-${index}`,
            issue: `Image too large: ${img.naturalWidth}px for ${breakpoint.width}px viewport`,
            recommendation: 'Use responsive images with srcset'
          });
        }
        
        // Check for missing alt text
        if (!img.alt) {
          validation.issues.push({
            type: 'accessibility',
            element: `img-${index}`,
            issue: 'Image missing alt text',
            recommendation: 'Add descriptive alt text'
          });
        }
        
        // Check for responsive implementation
        if (!img.isResponsive && !img.srcset) {
          validation.issues.push({
            type: 'responsive',
            element: `img-${index}`,
            issue: 'Image not responsive',
            recommendation: 'Add max-width: 100% or use srcset'
          });
        }
      });
      
      return { images: imageInfo, validation };
    }
  }
];

// Parse command line arguments
function parseArguments() {
  const args = process.argv.slice(2);
  const config = {
    url: 'http://localhost:3000',
    breakpoints: '320,375,414,768,1024,1440',
    pages: '/',
    outputDir: './responsive-screenshots',
    reportFile: './responsive-report.html'
  };

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    config[key] = value;
  }

  return config;
}

// Main responsive testing function
async function runResponsiveTests(config) {
  console.log('🚀 Starting responsive design testing...');
  
  // Parse configuration
  const breakpoints = config.breakpoints.split(',').map(bp => parseInt(bp.trim()));
  const pages = config.pages.split(',').map(page => page.trim());
  
  // Ensure output directory exists
  await fs.mkdir(config.outputDir, { recursive: true });
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  
  const testResults = {
    timestamp: new Date().toISOString(),
    configuration: config,
    results: {},
    summary: {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      issues: []
    }
  };
  
  try {
    for (const page of pages) {
      console.log(`\n📄 Testing page: ${page}`);
      testResults.results[page] = {};
      
      for (const width of breakpoints) {
        // Find matching breakpoint configuration
        const breakpoint = Object.values(RESPONSIVE_BREAKPOINTS).find(bp => bp.width === width) || 
                          { width, height: Math.round(width * 0.75), description: `Custom ${width}px` };
        
        console.log(`  📱 Testing breakpoint: ${breakpoint.description} (${breakpoint.width}x${breakpoint.height})`);
        
        const context = await browser.newContext({
          viewport: { width: breakpoint.width, height: breakpoint.height },
          deviceScaleFactor: 1,
          isMobile: breakpoint.width < 768
        });
        
        const browserPage = await context.newPage();
        const pageResults = {
          breakpoint,
          tests: {},
          screenshot: path.join(config.outputDir, `${page.replace(/\//g, '_')}_${breakpoint.width}px.png`)
        };
        
        try {
          // Take screenshot
          await browserPage.goto(config.url + page);
          await browserPage.waitForLoadState('networkidle');
          await browserPage.screenshot({ path: pageResults.screenshot, fullPage: true });
          
          // Run all responsive test scenarios
          for (const scenario of RESPONSIVE_TEST_SCENARIOS) {
            try {
              const result = await scenario.test(browserPage, breakpoint, config.url + page);
              pageResults.tests[scenario.name] = {
                description: scenario.description,
                result,
                status: 'passed'
              };
              
              testResults.summary.totalTests++;
              testResults.summary.passedTests++;
              
              // Collect issues from validation
              if (result.validation?.issues) {
                testResults.summary.issues.push(...result.validation.issues.map(issue => ({
                  ...issue,
                  page,
                  breakpoint: breakpoint.description,
                  width: breakpoint.width
                })));
              }
              
            } catch (error) {
              pageResults.tests[scenario.name] = {
                description: scenario.description,
                status: 'failed',
                error: error.message
              };
              
              testResults.summary.totalTests++;
              testResults.summary.failedTests++;
            }
          }
          
        } catch (error) {
          pageResults.error = error.message;
          console.error(`  ❌ Error testing ${breakpoint.description}:`, error.message);
        }
        
        testResults.results[page][breakpoint.width] = pageResults;
        await context.close();
      }
    }
    
    // Generate summary
    const successRate = testResults.summary.totalTests > 0 ? 
      (testResults.summary.passedTests / testResults.summary.totalTests) * 100 : 0;
    
    testResults.summary.successRate = Math.round(successRate);
    
    console.log('\n📊 Responsive Design Test Results:');
    console.log(`  Total Tests: ${testResults.summary.totalTests}`);
    console.log(`  Passed: ${testResults.summary.passedTests}`);
    console.log(`  Failed: ${testResults.summary.failedTests}`);
    console.log(`  Success Rate: ${testResults.summary.successRate}%`);
    console.log(`  Issues Found: ${testResults.summary.issues.length}`);
    
    // Generate HTML report
    const htmlReport = generateHTMLReport(testResults);
    await fs.writeFile(config.reportFile, htmlReport);
    console.log(`📄 HTML report saved to: ${config.reportFile}`);
    
    // Save JSON results
    const jsonReport = config.reportFile.replace('.html', '.json');
    await fs.writeFile(jsonReport, JSON.stringify(testResults, null, 2));
    console.log(`💾 JSON results saved to: ${jsonReport}`);
    
  } finally {
    await browser.close();
  }
  
  // Exit with appropriate code
  const hasFailures = testResults.summary.failedTests > 0 || testResults.summary.issues.length > 10;
  process.exit(hasFailures ? 1 : 0);
}

// Generate HTML report
function generateHTMLReport(results) {
  const { summary, results: testResults } = results;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Responsive Design Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; text-align: center; }
        .screenshots { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .screenshot { border: 1px solid #ddd; padding: 10px; border-radius: 8px; }
        .screenshot img { max-width: 100%; height: auto; }
        .issues { margin-top: 30px; }
        .issue { background: #fee; border: 1px solid #fcc; padding: 15px; margin: 10px 0; border-radius: 8px; }
        .pass { color: #22c55e; }
        .fail { color: #ef4444; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Responsive Design Test Report</h1>
        <p>Generated: ${results.timestamp}</p>
    </div>
    
    <div class="summary">
        <div class="summary-card">
            <h3>Total Tests</h3>
            <div style="font-size: 24px; font-weight: bold;">${summary.totalTests}</div>
        </div>
        <div class="summary-card">
            <h3>Success Rate</h3>
            <div style="font-size: 24px; font-weight: bold;" class="${summary.successRate >= 80 ? 'pass' : 'fail'}">
                ${summary.successRate}%
            </div>
        </div>
        <div class="summary-card">
            <h3>Issues Found</h3>
            <div style="font-size: 24px; font-weight: bold;" class="${summary.issues.length > 10 ? 'fail' : 'pass'}">
                ${summary.issues.length}
            </div>
        </div>
        <div class="summary-card">
            <h3>Pages Tested</h3>
            <div style="font-size: 24px; font-weight: bold;">${Object.keys(testResults).length}</div>
        </div>
    </div>
    
    <div class="screenshots">
        ${Object.entries(testResults).map(([page, pageResults]) => 
          Object.entries(pageResults).map(([width, result]) => `
            <div class="screenshot">
                <h3>${page} - ${width}px</h3>
                <img src="${result.screenshot}" alt="${page} at ${width}px" />
                <p><strong>Breakpoint:</strong> ${result.breakpoint.description}</p>
                <p><strong>Tests:</strong> ${Object.keys(result.tests).length}</p>
            </div>
          `).join('')
        ).join('')}
    </div>
    
    ${summary.issues.length > 0 ? `
        <div class="issues">
            <h2>Issues Found</h2>
            ${summary.issues.map(issue => `
                <div class="issue">
                    <h3>${issue.type}: ${issue.element}</h3>
                    <p><strong>Page:</strong> ${issue.page}</p>
                    <p><strong>Breakpoint:</strong> ${issue.breakpoint}</p>
                    <p><strong>Issue:</strong> ${issue.issue}</p>
                    <p><strong>Recommendation:</strong> ${issue.recommendation}</p>
                </div>
            `).join('')}
        </div>
    ` : ''}
</body>
</html>`;
}

// Run tests if called directly
if (require.main === module) {
  const config = parseArguments();
  runResponsiveTests(config).catch(error => {
    console.error('❌ Responsive design testing failed:', error);
    process.exit(1);
  });
}

module.exports = { runResponsiveTests, RESPONSIVE_BREAKPOINTS, RESPONSIVE_TEST_SCENARIOS }; 