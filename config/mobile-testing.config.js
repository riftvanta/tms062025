/**
 * Mobile Testing Configuration
 * Comprehensive configuration for mobile device testing, performance monitoring,
 * and PWA validation with focus on Jordan market requirements
 */

const DEVICE_CONFIGURATIONS = {
  // Primary devices for testing (common in Jordan)
  'iPhone_12': {
    width: 390,
    height: 844,
    pixelRatio: 3,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    category: 'premium',
    network: '4G',
    memoryGB: 4,
    processorTier: 'high'
  },
  'iPhone_13_Mini': {
    width: 375,
    height: 812,
    pixelRatio: 3,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    category: 'premium',
    network: '4G',
    memoryGB: 4,
    processorTier: 'high'
  },
  'Galaxy_S20': {
    width: 360,
    height: 800,
    pixelRatio: 3,
    userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G980F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Mobile Safari/537.36',
    category: 'premium',
    network: '4G',
    memoryGB: 8,
    processorTier: 'high'
  },
  'Galaxy_A54': {
    width: 360,
    height: 780,
    pixelRatio: 2.5,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-A546B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Mobile Safari/537.36',
    category: 'mid-range',
    network: '3G',
    memoryGB: 4,
    processorTier: 'medium'
  },
  'iPhone_8': {
    width: 375,
    height: 667,
    pixelRatio: 2,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    category: 'budget',
    network: '3G',
    memoryGB: 2,
    processorTier: 'low'
  },
  'Redmi_Note_10': {
    width: 360,
    height: 780,
    pixelRatio: 2.5,
    userAgent: 'Mozilla/5.0 (Linux; Android 11; Redmi Note 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Mobile Safari/537.36',
    category: 'budget',
    network: '3G',
    memoryGB: 3,
    processorTier: 'low'
  },
  'iPad_Air': {
    width: 820,
    height: 1180,
    pixelRatio: 2,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    category: 'tablet',
    network: '4G',
    memoryGB: 4,
    processorTier: 'high'
  }
};

const NETWORK_CONDITIONS = {
  '4G': {
    downloadThroughput: 10000, // 10 Mbps
    uploadThroughput: 5000,    // 5 Mbps
    latency: 70,               // 70ms
    packetLoss: 0,
    description: 'Fast 4G connection (typical in Amman city center)'
  },
  '3G_Fast': {
    downloadThroughput: 1600,  // 1.6 Mbps
    uploadThroughput: 800,     // 800 Kbps
    latency: 150,              // 150ms
    packetLoss: 0,
    description: 'Good 3G connection (typical in Jordan cities)'
  },
  '3G_Slow': {
    downloadThroughput: 400,   // 400 Kbps
    uploadThroughput: 200,     // 200 Kbps
    latency: 300,              // 300ms
    packetLoss: 0.5,           // 0.5% packet loss
    description: 'Slow 3G connection (rural areas in Jordan)'
  },
  'EDGE': {
    downloadThroughput: 240,   // 240 Kbps
    uploadThroughput: 120,     // 120 Kbps
    latency: 840,              // 840ms
    packetLoss: 1,             // 1% packet loss
    description: 'Edge connection (worst case scenario)'
  },
  'WiFi': {
    downloadThroughput: 50000, // 50 Mbps
    uploadThroughput: 10000,   // 10 Mbps
    latency: 20,               // 20ms
    packetLoss: 0,
    description: 'High-speed WiFi connection'
  }
};

const PERFORMANCE_BASELINES = {
  // Core Web Vitals targets for mobile
  coreWebVitals: {
    LCP: {
      good: 2500,    // 2.5 seconds
      needsImprovement: 4000,
      poor: 4001
    },
    FID: {
      good: 100,     // 100ms
      needsImprovement: 300,
      poor: 301
    },
    CLS: {
      good: 0.1,     // 0.1
      needsImprovement: 0.25,
      poor: 0.26
    },
    TTI: {
      good: 3000,    // 3 seconds
      needsImprovement: 5000,
      poor: 5001
    },
    TBT: {
      good: 200,     // 200ms
      needsImprovement: 600,
      poor: 601
    }
  },
  
  // Bundle size targets
  bundleSize: {
    total: 100,      // 100KB total
    firstLoad: 50,   // 50KB first load
    chunk: 20        // 20KB per chunk
  },
  
  // Network-specific targets
  networkTargets: {
    '4G': {
      LCP: 2000,     // 2 seconds on 4G
      TTI: 2500,     // 2.5 seconds on 4G
      FCP: 1500      // 1.5 seconds on 4G
    },
    '3G_Fast': {
      LCP: 2500,     // 2.5 seconds on 3G Fast
      TTI: 3000,     // 3 seconds on 3G Fast
      FCP: 2000      // 2 seconds on 3G Fast
    },
    '3G_Slow': {
      LCP: 4000,     // 4 seconds on 3G Slow
      TTI: 5000,     // 5 seconds on 3G Slow
      FCP: 3000      // 3 seconds on 3G Slow
    }
  }
};

const PWA_REQUIREMENTS = {
  manifest: {
    required: [
      'name',
      'short_name',
      'icons',
      'start_url',
      'display',
      'theme_color',
      'background_color'
    ],
    recommended: [
      'description',
      'orientation',
      'categories',
      'screenshots'
    ]
  },
  serviceWorker: {
    required: true,
    cacheStrategies: ['cacheFirst', 'networkFirst', 'staleWhileRevalidate'],
    offlinePages: ['/offline', '/'],
    cachePaths: ['/login', '/admin', '/exchange']
  },
  icons: {
    sizes: [192, 256, 384, 512],
    maskable: true,
    purposes: ['any', 'maskable']
  },
  installability: {
    beforeInstallPrompt: true,
    standalone: true,
    fullscreen: false
  }
};

const ACCESSIBILITY_REQUIREMENTS = {
  wcag: {
    level: 'AA',
    version: '2.1'
  },
  axeCore: {
    rules: {
      'color-contrast': { enabled: true, tags: ['wcag2aa', 'wcag143'] },
      'keyboard-navigation': { enabled: true },
      'focus-management': { enabled: true },
      'aria-labels': { enabled: true },
      'semantic-markup': { enabled: true }
    }
  },
  mobile: {
    touchTargetSize: 44, // 44px minimum touch target
    textSize: 16,        // 16px minimum text size
    contrast: 4.5        // 4.5:1 minimum contrast ratio
  }
};

const RESPONSIVE_BREAKPOINTS = {
  mobile: {
    small: 320,   // Small phones (iPhone 5/SE)
    medium: 375,  // Medium phones (iPhone 6/7/8)
    large: 414    // Large phones (iPhone 6+/7+/8+)
  },
  tablet: {
    portrait: 768,   // iPad portrait
    landscape: 1024  // iPad landscape
  },
  desktop: {
    small: 1280,   // Small desktop
    medium: 1440,  // Medium desktop
    large: 1920    // Large desktop
  }
};

const TEST_SCENARIOS = {
  // Critical user journeys for TMS
  userJourneys: [
    {
      name: 'login_flow',
      description: 'User login and authentication',
      steps: [
        { action: 'navigate', target: '/login' },
        { action: 'fill', target: '#username', value: 'testuser' },
        { action: 'fill', target: '#password', value: 'password123' },
        { action: 'click', target: '#login-button' },
        { action: 'waitForNavigation', target: '/dashboard' }
      ],
      performance: {
        maxDuration: 5000,
        maxLCP: 2500
      }
    },
    {
      name: 'create_order',
      description: 'Create new transfer order',
      steps: [
        { action: 'navigate', target: '/exchange/orders/new' },
        { action: 'fill', target: '#amount', value: '100' },
        { action: 'select', target: '#type', value: 'outgoing' },
        { action: 'fill', target: '#cliq-details', value: '0791234567' },
        { action: 'click', target: '#submit-order' }
      ],
      performance: {
        maxDuration: 3000,
        maxLCP: 2000
      }
    },
    {
      name: 'file_upload',
      description: 'Upload payment screenshot',
      steps: [
        { action: 'navigate', target: '/exchange/orders/1/upload' },
        { action: 'upload', target: '#file-input', file: 'test-screenshot.jpg' },
        { action: 'click', target: '#upload-button' },
        { action: 'waitFor', target: '.upload-success' }
      ],
      performance: {
        maxDuration: 10000,
        maxLCP: 2500
      }
    }
  ],
  
  // Performance test scenarios
  performanceTests: [
    {
      name: 'cold_start',
      description: 'First visit performance',
      clearCache: true,
      disableJavaScript: false,
      throttling: '3G_Fast'
    },
    {
      name: 'warm_start',
      description: 'Return visit performance',
      clearCache: false,
      disableJavaScript: false,
      throttling: '4G'
    },
    {
      name: 'js_disabled',
      description: 'Progressive enhancement test',
      clearCache: true,
      disableJavaScript: true,
      throttling: '3G_Fast'
    }
  ]
};

const JORDAN_MARKET_CONFIG = {
  // Common devices in Jordan (based on market research)
  popularDevices: [
    'Galaxy_A54',    // Most popular mid-range Android
    'iPhone_12',     // Popular iPhone model
    'Galaxy_S20',    // Premium Android
    'iPhone_8',      // Budget iPhone option
    'Redmi_Note_10'  // Budget Android option
  ],
  
  // Network distribution in Jordan
  networkDistribution: {
    '4G': 0.65,      // 65% of users on 4G
    '3G_Fast': 0.25, // 25% of users on good 3G
    '3G_Slow': 0.08, // 8% of users on slow 3G/rural
    'EDGE': 0.02     // 2% of users on edge/very slow
  },
  
  // Testing priorities based on market
  testingPriorities: {
    devices: ['Galaxy_A54', 'iPhone_12', 'Galaxy_S20'],
    networks: ['3G_Fast', '4G'],
    scenarios: ['login_flow', 'create_order', 'file_upload']
  },
  
  // Language and localization
  locale: {
    language: 'en',
    country: 'JO',
    timezone: 'Asia/Amman',
    currency: 'JOD',
    rtl: false // Future consideration for Arabic
  }
};

module.exports = {
  DEVICE_CONFIGURATIONS,
  NETWORK_CONDITIONS,
  PERFORMANCE_BASELINES,
  PWA_REQUIREMENTS,
  ACCESSIBILITY_REQUIREMENTS,
  RESPONSIVE_BREAKPOINTS,
  TEST_SCENARIOS,
  JORDAN_MARKET_CONFIG,
  
  // Helper functions
  getDeviceConfig: (deviceName) => {
    return DEVICE_CONFIGURATIONS[deviceName];
  },
  
  getNetworkConfig: (networkName) => {
    return NETWORK_CONDITIONS[networkName];
  },
  
  getPerformanceTarget: (metric, network = '4G') => {
    return PERFORMANCE_BASELINES.networkTargets[network]?.[metric] || 
           PERFORMANCE_BASELINES.coreWebVitals[metric]?.good;
  },
  
  // Get recommended test matrix for Jordan market
  getJordanTestMatrix: () => {
    const { popularDevices, networkDistribution, testingPriorities } = JORDAN_MARKET_CONFIG;
    const matrix = [];
    
    testingPriorities.devices.forEach(device => {
      testingPriorities.networks.forEach(network => {
        matrix.push({
          device,
          network,
          priority: popularDevices.includes(device) ? 'high' : 'medium',
          weight: networkDistribution[network] || 0.1
        });
      });
    });
    
    return matrix.sort((a, b) => b.weight - a.weight);
  }
}; 