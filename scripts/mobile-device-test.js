#!/usr/bin/env node
/**
 * Mobile Device Testing Script
 * Tests the TMS application across different mobile devices using Playwright
 * Validates performance, functionality, and mobile-specific features
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
const { performance } = require('perf_hooks');

// Parse command line arguments
function parseArguments() {
  const args = process.argv.slice(2);
  const config = {
    device: 'iPhone 12',
    width: 390,
    height: 844,
    pixelRatio: 3,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
    url: 'http://localhost:3000',
    outputDir: './mobile-test-results',
    screenshotDir: './screenshots'
  };

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    
    if (key === 'width' || key === 'height' || key === 'pixelRatio') {
      config[key] = parseInt(value);
    } else {
      config[key] = value;
    }
  }

  return config;
}

// Mobile-specific test scenarios
const MOBILE_TEST_SCENARIOS = [
  {
    name: 'viewport_adaptation',
    description: 'Test viewport and responsive design adaptation',
    test: async (page, config) => {
      const results = [];
      
      // Test different orientations
      const orientations = [
        { width: config.width, height: config.height, orientation: 'portrait' },
        { width: config.height, height: config.width, orientation: 'landscape' }
      ];
      
      for (const orientation of orientations) {
        await page.setViewportSize({ width: orientation.width, height: orientation.height });
        await page.waitForTimeout(500); // Allow for layout changes
        
        // Check if content is visible and properly sized
        const viewportInfo = await page.evaluate(() => ({
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          devicePixelRatio: window.devicePixelRatio,
          orientation: screen.orientation?.angle || 0
        }));
        
        // Take screenshot for visual verification
        await page.screenshot({
          path: path.join(config.screenshotDir, `${config.device}-${orientation.orientation}.png`),
          fullPage: true
        });
        
        results.push({
          orientation: orientation.orientation,
          viewport: viewportInfo,
          timestamp: new Date().toISOString()
        });
      }
      
      return results;
    }
  },
  
  {
    name: 'touch_interactions',
    description: 'Test touch-specific interactions and gestures',
    test: async (page, config) => {
      const results = [];
      
      // Test touch targets
      const touchTargets = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a, input[type="submit"]'));
        return buttons.map(button => {
          const rect = button.getBoundingClientRect();
          return {
            element: button.tagName,
            width: rect.width,
            height: rect.height,
            area: rect.width * rect.height,
            text: button.textContent?.trim() || button.value || 'N/A'
          };
        });
      });
      
      // Check minimum touch target size (44px recommended)
      const minTouchTargetSize = 44;
      const smallTargets = touchTargets.filter(target => 
        target.width < minTouchTargetSize || target.height < minTouchTargetSize
      );
      
      results.push({
        totalTouchTargets: touchTargets.length,
        smallTargets: smallTargets.length,
        smallTargetDetails: smallTargets,
        compliance: smallTargets.length === 0
      });
      
      return results;
    }
  },
  
  {
    name: 'mobile_performance',
    description: 'Measure mobile-specific performance metrics',
    test: async (page, config) => {
      const startTime = performance.now();
      
      // Navigate and measure performance
      await page.goto(config.url, { waitUntil: 'networkidle' });
      
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
          navigationStart: navigation.navigationStart,
          domInteractive: navigation.domInteractive - navigation.navigationStart,
          domComplete: navigation.domComplete - navigation.navigationStart
        };
      });
      
      const endTime = performance.now();
      const totalTestTime = endTime - startTime;
      
      return {
        ...performanceMetrics,
        totalTestTime,
        timestamp: new Date().toISOString()
      };
    }
  },
  
  {
    name: 'offline_functionality',
    description: 'Test PWA offline functionality',
    test: async (page, config) => {
      const results = [];
      
      // Test service worker registration
      const serviceWorkerInfo = await page.evaluate(() => {
        return {
          serviceWorkerSupported: 'serviceWorker' in navigator,
          registration: navigator.serviceWorker?.controller ? 'active' : 'none'
        };
      });
      
      results.push({ type: 'serviceWorker', ...serviceWorkerInfo });
      
      // Simulate offline condition
      await page.context().setOffline(true);
      
      try {
        await page.reload({ waitUntil: 'networkidle', timeout: 10000 });
        const offlineContent = await page.textContent('body');
        
        results.push({
          type: 'offline',
          contentAvailable: offlineContent.length > 0,
          hasOfflinePage: offlineContent.includes('offline') || offlineContent.includes('cached')
        });
      } catch (error) {
        results.push({
          type: 'offline',
          error: error.message,
          contentAvailable: false
        });
      }
      
      // Restore online
      await page.context().setOffline(false);
      
      return results;
    }
  },
  
  {
    name: 'mobile_navigation',
    description: 'Test mobile navigation patterns',
    test: async (page, config) => {
      const results = [];
      
      // Check for mobile navigation patterns
      const navigationInfo = await page.evaluate(() => {
        const hamburgerMenu = document.querySelector('[data-testid="hamburger-menu"], .hamburger, .mobile-menu-toggle');
        const sideNav = document.querySelector('[data-testid="side-nav"], .sidebar, .mobile-nav');
        const bottomNav = document.querySelector('[data-testid="bottom-nav"], .bottom-navigation, .tab-bar');
        
        return {
          hasHamburgerMenu: !!hamburgerMenu,
          hasSideNav: !!sideNav,
          hasBottomNav: !!bottomNav,
          hamburgerVisible: hamburgerMenu ? window.getComputedStyle(hamburgerMenu).display !== 'none' : false,
          sideNavVisible: sideNav ? window.getComputedStyle(sideNav).display !== 'none' : false,
          bottomNavVisible: bottomNav ? window.getComputedStyle(bottomNav).display !== 'none' : false
        };
      });
      
      results.push({ type: 'navigation', ...navigationInfo });
      
      // Test hamburger menu interaction if present
      if (navigationInfo.hasHamburgerMenu && navigationInfo.hamburgerVisible) {
        try {
          await page.click('[data-testid="hamburger-menu"], .hamburger, .mobile-menu-toggle');
          await page.waitForTimeout(300); // Animation time
          
          const menuOpened = await page.evaluate(() => {
            const sideNav = document.querySelector('[data-testid="side-nav"], .sidebar, .mobile-nav');
            return sideNav ? window.getComputedStyle(sideNav).display !== 'none' : false;
          });
          
          results.push({
            type: 'hamburger_interaction',
            menuOpened,
            success: menuOpened
          });
        } catch (error) {
          results.push({
            type: 'hamburger_interaction',
            error: error.message,
            success: false
          });
        }
      }
      
      return results;
    }
  }
];

// Main testing function
async function runMobileDeviceTests(config) {
  console.log(`🚀 Starting mobile device tests for ${config.device}`);
  console.log(`📱 Device config: ${config.width}x${config.height} @ ${config.pixelRatio}x`);
  
  // Ensure output directories exist
  await fs.mkdir(config.outputDir, { recursive: true });
  await fs.mkdir(config.screenshotDir, { recursive: true });
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  
  const context = await browser.newContext({
    viewport: { width: config.width, height: config.height },
    deviceScaleFactor: config.pixelRatio,
    userAgent: config.userAgent,
    hasTouch: true,
    isMobile: true
  });
  
  const page = await context.newPage();
  const testResults = {
    device: config.device,
    configuration: {
      width: config.width,
      height: config.height,
      pixelRatio: config.pixelRatio,
      userAgent: config.userAgent
    },
    timestamp: new Date().toISOString(),
    tests: {}
  };
  
  try {
    // Run all mobile test scenarios
    for (const scenario of MOBILE_TEST_SCENARIOS) {
      console.log(`🧪 Running test: ${scenario.name}`);
      
      try {
        const startTime = performance.now();
        const result = await scenario.test(page, config);
        const endTime = performance.now();
        
        testResults.tests[scenario.name] = {
          description: scenario.description,
          duration: endTime - startTime,
          result,
          status: 'passed',
          timestamp: new Date().toISOString()
        };
        
        console.log(`✅ Test ${scenario.name} completed successfully`);
      } catch (error) {
        testResults.tests[scenario.name] = {
          description: scenario.description,
          status: 'failed',
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        };
        
        console.error(`❌ Test ${scenario.name} failed:`, error.message);
      }
    }
    
    // Calculate overall results
    const totalTests = Object.keys(testResults.tests).length;
    const passedTests = Object.values(testResults.tests).filter(test => test.status === 'passed').length;
    const failedTests = totalTests - passedTests;
    
    testResults.summary = {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      successRate: (passedTests / totalTests) * 100
    };
    
    console.log(`\n📊 Test Summary for ${config.device}:`);
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Passed: ${passedTests}`);
    console.log(`  Failed: ${failedTests}`);
    console.log(`  Success Rate: ${testResults.summary.successRate.toFixed(1)}%`);
    
  } finally {
    await browser.close();
  }
  
  // Save results
  const resultFile = path.join(config.outputDir, `mobile-test-${config.device.replace(/\s+/g, '-')}.json`);
  await fs.writeFile(resultFile, JSON.stringify(testResults, null, 2));
  
  console.log(`💾 Results saved to: ${resultFile}`);
  
  // Exit with appropriate code
  const hasFailures = testResults.summary.failed > 0;
  process.exit(hasFailures ? 1 : 0);
}

// Run tests if called directly
if (require.main === module) {
  const config = parseArguments();
  runMobileDeviceTests(config).catch(error => {
    console.error('❌ Mobile device testing failed:', error);
    process.exit(1);
  });
}

module.exports = { runMobileDeviceTests, MOBILE_TEST_SCENARIOS }; 