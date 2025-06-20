/**
 * BrowserStack Configuration for Mobile Device Testing
 * Comprehensive real device testing across iOS, Android, and various browsers
 */

const COMMON_CAPABILITIES = {
  'browserstack.user': process.env.BROWSERSTACK_USERNAME,
  'browserstack.key': process.env.BROWSERSTACK_ACCESS_KEY,
  'browserstack.local': true,
  'browserstack.localIdentifier': process.env.BROWSERSTACK_LOCAL_IDENTIFIER || 'tms-mobile-testing',
  'browserstack.debug': true,
  'browserstack.console': 'verbose',
  'browserstack.networkLogs': true,
  'browserstack.video': true,
  'browserstack.selenium_version': '4.0.0',
  'browserstack.timezone': 'Asia/Amman',
  'browserstack.idleTimeout': 300,
  project: 'TMS Mobile Testing',
  build: `TMS-${process.env.GITHUB_RUN_NUMBER || Date.now()}`,
  name: 'Mobile PWA Testing'
};

const MOBILE_DEVICES = {
  // Latest iOS Devices
  'iPhone_15_Pro': {
    ...COMMON_CAPABILITIES,
    browserName: 'safari',
    device: 'iPhone 15 Pro',
    os_version: '17',
    real_mobile: true,
    'browserstack.appium_version': '2.0.0'
  },
  'iPhone_14': {
    ...COMMON_CAPABILITIES,
    browserName: 'safari',
    device: 'iPhone 14',
    os_version: '16',
    real_mobile: true,
    'browserstack.appium_version': '2.0.0'
  },
  'iPhone_13_Mini': {
    ...COMMON_CAPABILITIES,
    browserName: 'safari',
    device: 'iPhone 13 Mini',
    os_version: '15',
    real_mobile: true,
    'browserstack.appium_version': '2.0.0'
  },
  'iPhone_12': {
    ...COMMON_CAPABILITIES,
    browserName: 'safari',
    device: 'iPhone 12',
    os_version: '14',
    real_mobile: true,
    'browserstack.appium_version': '2.0.0'
  },

  // Android Devices - Latest
  'Galaxy_S24': {
    ...COMMON_CAPABILITIES,
    browserName: 'chrome',
    device: 'Samsung Galaxy S24',
    os_version: '14.0',
    real_mobile: true,
    'browserstack.appium_version': '2.0.0'
  },
  'Galaxy_S23': {
    ...COMMON_CAPABILITIES,
    browserName: 'chrome',
    device: 'Samsung Galaxy S23',
    os_version: '13.0',
    real_mobile: true,
    'browserstack.appium_version': '2.0.0'
  },
  'Pixel_8': {
    ...COMMON_CAPABILITIES,
    browserName: 'chrome',
    device: 'Google Pixel 8',
    os_version: '14.0',
    real_mobile: true,
    'browserstack.appium_version': '2.0.0'
  },
  'Pixel_7': {
    ...COMMON_CAPABILITIES,
    browserName: 'chrome',
    device: 'Google Pixel 7',
    os_version: '13.0',
    real_mobile: true,
    'browserstack.appium_version': '2.0.0'
  },

  // Mid-range Devices for performance testing
  'Galaxy_A54': {
    ...COMMON_CAPABILITIES,
    browserName: 'chrome',
    device: 'Samsung Galaxy A54',
    os_version: '13.0',
    real_mobile: true,
    'browserstack.appium_version': '2.0.0'
  },
  'Redmi_Note_12': {
    ...COMMON_CAPABILITIES,
    browserName: 'chrome',
    device: 'Xiaomi Redmi Note 12',
    os_version: '13.0',
    real_mobile: true,
    'browserstack.appium_version': '2.0.0'
  },

  // Tablets
  'iPad_Pro_12_9': {
    ...COMMON_CAPABILITIES,
    browserName: 'safari',
    device: 'iPad Pro 12.9 2022',
    os_version: '16',
    real_mobile: true,
    'browserstack.appium_version': '2.0.0'
  },
  'iPad_Air': {
    ...COMMON_CAPABILITIES,
    browserName: 'safari',
    device: 'iPad Air 4',
    os_version: '15',
    real_mobile: true,
    'browserstack.appium_version': '2.0.0'
  },
  'Galaxy_Tab_S9': {
    ...COMMON_CAPABILITIES,
    browserName: 'chrome',
    device: 'Samsung Galaxy Tab S9',
    os_version: '13.0',
    real_mobile: true,
    'browserstack.appium_version': '2.0.0'
  }
};

const DESKTOP_BROWSERS = {
  'Chrome_Latest': {
    ...COMMON_CAPABILITIES,
    browserName: 'Chrome',
    browser_version: 'latest',
    os: 'Windows',
    os_version: '11',
    resolution: '1920x1080'
  },
  'Firefox_Latest': {
    ...COMMON_CAPABILITIES,
    browserName: 'Firefox',
    browser_version: 'latest',
    os: 'Windows',
    os_version: '11',
    resolution: '1920x1080'
  },
  'Safari_Latest': {
    ...COMMON_CAPABILITIES,
    browserName: 'Safari',
    browser_version: 'latest',
    os: 'OS X',
    os_version: 'Sonoma',
    resolution: '1920x1080'
  },
  'Edge_Latest': {
    ...COMMON_CAPABILITIES,
    browserName: 'Edge',
    browser_version: 'latest',
    os: 'Windows',
    os_version: '11',
    resolution: '1920x1080'
  }
};

const TEST_SUITES = {
  // Critical mobile devices for Jordan market
  'jordan_mobile_priority': [
    'iPhone_14',
    'iPhone_13_Mini',
    'Galaxy_S23',
    'Galaxy_A54',
    'Pixel_7'
  ],
  
  // Full mobile device coverage
  'full_mobile_coverage': [
    'iPhone_15_Pro',
    'iPhone_14',
    'iPhone_13_Mini',
    'iPhone_12',
    'Galaxy_S24',
    'Galaxy_S23',
    'Galaxy_A54',
    'Pixel_8',
    'Pixel_7',
    'Redmi_Note_12'
  ],
  
  // Tablet testing
  'tablet_testing': [
    'iPad_Pro_12_9',
    'iPad_Air',
    'Galaxy_Tab_S9'
  ],
  
  // Cross-browser desktop
  'desktop_browsers': [
    'Chrome_Latest',
    'Firefox_Latest',
    'Safari_Latest',
    'Edge_Latest'
  ]
};

const NETWORK_PROFILES = {
  'WIFI': {
    networkProfile: 'WIFI',
    description: 'High-speed WiFi connection'
  },
  '4G': {
    networkProfile: '4G',
    description: '4G mobile network'
  },
  '3G': {
    networkProfile: '3G',
    description: '3G mobile network (slower speeds)'
  },
  'EDGE': {
    networkProfile: 'EDGE',
    description: 'Edge network (very slow speeds)'
  }
};

const TEST_CONFIGURATIONS = {
  // Performance testing with network throttling
  performance: {
    devices: TEST_SUITES.jordan_mobile_priority,
    networks: ['3G', '4G'],
    timeout: 300000, // 5 minutes
    retries: 2
  },
  
  // Functional testing across all devices
  functional: {
    devices: TEST_SUITES.full_mobile_coverage,
    networks: ['WIFI'],
    timeout: 180000, // 3 minutes
    retries: 1
  },
  
  // Accessibility testing
  accessibility: {
    devices: ['iPhone_14', 'Galaxy_S23', 'iPad_Air'],
    networks: ['WIFI'],
    timeout: 240000, // 4 minutes
    retries: 1
  },
  
  // PWA installation testing
  pwa: {
    devices: ['iPhone_14', 'Galaxy_S23', 'Pixel_7'],
    networks: ['WIFI', '4G'],
    timeout: 300000, // 5 minutes
    retries: 2
  }
};

const JORDAN_SPECIFIC_CONFIG = {
  // Common device models in Jordan market
  popularDevices: [
    'Galaxy_S23',
    'Galaxy_A54',
    'iPhone_14',
    'iPhone_13_Mini',
    'Redmi_Note_12'
  ],
  
  // Network conditions typical in Jordan
  networkConditions: ['3G', '4G', 'WIFI'],
  
  // Language and locale settings
  locale: 'en-JO',
  timezone: 'Asia/Amman',
  
  // Testing priorities for Jordan market
  testPriorities: {
    performance: 'high', // Critical for mobile users
    accessibility: 'medium',
    crossBrowser: 'low',
    networkResilience: 'high' // Important for varying network quality
  }
};

module.exports = {
  COMMON_CAPABILITIES,
  MOBILE_DEVICES,
  DESKTOP_BROWSERS,
  TEST_SUITES,
  NETWORK_PROFILES,
  TEST_CONFIGURATIONS,
  JORDAN_SPECIFIC_CONFIG,
  
  // Helper functions
  getDeviceCapabilities: (deviceName) => {
    return MOBILE_DEVICES[deviceName] || DESKTOP_BROWSERS[deviceName];
  },
  
  getTestSuite: (suiteName) => {
    return TEST_SUITES[suiteName] || [];
  },
  
  getTestConfiguration: (configName) => {
    return TEST_CONFIGURATIONS[configName];
  },
  
  // Build capabilities for a specific test
  buildCapabilities: (deviceName, networkProfile = 'WIFI', customOptions = {}) => {
    const baseCapabilities = module.exports.getDeviceCapabilities(deviceName);
    if (!baseCapabilities) {
      throw new Error(`Device ${deviceName} not found in configuration`);
    }
    
    const networkConfig = NETWORK_PROFILES[networkProfile];
    if (!networkConfig) {
      throw new Error(`Network profile ${networkProfile} not found`);
    }
    
    return {
      ...baseCapabilities,
      ...networkConfig,
      ...customOptions,
      name: `${baseCapabilities.name} - ${networkProfile} - ${customOptions.testName || 'Default Test'}`
    };
  }
}; 