#!/usr/bin/env node

/**
 * Comprehensive Page Testing Script for Tifto Admin
 * Tests all pages and collects GraphQL errors, console errors, and network issues
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'https://tifto-admin-web.onrender.com';
const OUTPUT_FILE = 'page-test-results.json';
const DELAY_BETWEEN_PAGES = 3000; // 3 seconds delay between pages

// All routes extracted from the app structure
const ROUTES = [
  // Unprotected routes
  '/authentication',
  '/authentication/login',
  '/authentication/sign-up',
  '/authentication/otp',
  '/authentication/verify-email',
  '/authentication/verify-phone',
  '/forbidden',
  
  // Super Admin routes
  '/home',
  '/general',
  '/general/vendors',
  '/general/stores',
  '/general/riders',
  '/general/riders/test-id', // Dynamic route - using test ID
  '/general/users',
  '/general/users/user-detail/test-id', // Dynamic route
  '/general/staff',
  '/management',
  '/management/configurations',
  '/management/coupons',
  '/management/cuisines',
  '/management/banners',
  '/management/tippings',
  '/management/commission-rates',
  '/management/notifications',
  '/management/orders',
  '/management/shop-types',
  '/wallet/earnings',
  '/wallet/transaction-history',
  '/wallet/withdraw-requests',
  '/audit-logs',
  '/customerSupport',
  '/dispatch',
  '/language',
  '/settings',
  '/zone',
  
  // Admin/Restaurant routes
  '/admin',
  '/admin/store',
  '/admin/store/dashboard',
  '/admin/store/profile',
  '/admin/store/orders',
  '/admin/store/general',
  '/admin/store/general/payment',
  '/admin/store/general/location',
  '/admin/store/general/timing',
  '/admin/store/product-management',
  '/admin/store/product-management/category',
  '/admin/store/product-management/food',
  '/admin/store/product-management/add-ons',
  '/admin/store/product-management/options',
  '/admin/store/coupons',
  '/admin/store/ratings',
  '/admin/store/wallets/earnings',
  '/admin/store/wallets/transaction-history',
  '/admin/store/wallets/withdrawal-request',
  
  // Vendor routes
  '/admin/vendor',
  '/admin/vendor/dashboard',
  '/admin/vendor/profile',
  '/admin/vendor/stores',
];

const results = {
  timestamp: new Date().toISOString(),
  baseUrl: BASE_URL,
  totalPages: ROUTES.length,
  tested: 0,
  successful: 0,
  failed: 0,
  errors: [],
  pages: []
};

async function testPage(browser, route) {
  const page = await browser.newPage();
  const pageResult = {
    route,
    url: `${BASE_URL}${route}`,
    status: 'unknown',
    loadTime: 0,
    httpStatus: null,
    errors: [],
    graphqlErrors: [],
    consoleErrors: [],
    networkErrors: [],
    warnings: [],
    redirects: []
  };

  const startTime = Date.now();

  try {
    // Capture console errors
    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      
      if (type === 'error') {
        pageResult.consoleErrors.push({
          message: text,
          type: 'console'
        });
      } else if (type === 'warning') {
        pageResult.warnings.push({
          message: text,
          type: 'warning'
        });
      }
    });

    // Capture network errors
    page.on('requestfailed', (request) => {
      pageResult.networkErrors.push({
        url: request.url(),
        failure: request.failure()?.errorText || 'Unknown error',
        method: request.method()
      });
    });

    // Capture GraphQL errors from network responses
    page.on('response', async (response) => {
      const url = response.url();
      
      // Check if it's a GraphQL endpoint
      if (url.includes('/graphql')) {
        try {
          const responseData = await response.json();
          if (responseData.errors && responseData.errors.length > 0) {
            pageResult.graphqlErrors.push(...responseData.errors.map(err => ({
              message: err.message,
              extensions: err.extensions,
              path: err.path,
              locations: err.locations
            })));
          }
        } catch (e) {
          // Response might not be JSON or might be empty
        }
      }
    });

    // Navigate to page
    const response = await page.goto(pageResult.url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    pageResult.httpStatus = response?.status() || null;
    pageResult.loadTime = Date.now() - startTime;

    // Wait a bit for any async operations
    await page.waitForTimeout(2000);

    // Check for common error patterns in the page content
    const pageContent = await page.content();
    const bodyText = await page.evaluate(() => document.body?.innerText || '');

    // Check for error messages in the page
    if (bodyText.includes('Error') || bodyText.includes('error')) {
      const errorMatches = bodyText.match(/Error[^.]*(\.|$)/gi);
      if (errorMatches) {
        pageResult.errors.push(...errorMatches.map(msg => ({
          message: msg.trim(),
          source: 'page-content'
        })));
      }
    }

    // Check for GraphQL error patterns in console
    const consoleMessages = await page.evaluate(() => {
      return window.console._logs || [];
    });

    // Determine status
    if (response?.status() >= 200 && response?.status() < 300) {
      if (pageResult.graphqlErrors.length === 0 && pageResult.consoleErrors.length === 0) {
        pageResult.status = 'success';
        results.successful++;
      } else {
        pageResult.status = 'partial-success';
        results.failed++;
      }
    } else if (response?.status() >= 300 && response?.status() < 400) {
      pageResult.status = 'redirect';
      pageResult.redirects.push(response.headers()?.location || 'Unknown');
    } else {
      pageResult.status = 'failed';
      results.failed++;
    }

  } catch (error) {
    pageResult.status = 'error';
    pageResult.errors.push({
      message: error.message,
      stack: error.stack,
      type: 'navigation'
    });
    results.failed++;
  } finally {
    await page.close();
    results.tested++;
  }

  // Add to results if there are any issues
  if (pageResult.status !== 'success' || 
      pageResult.graphqlErrors.length > 0 || 
      pageResult.consoleErrors.length > 0 ||
      pageResult.networkErrors.length > 0) {
    results.pages.push(pageResult);
    
    // Add to global errors list
    if (pageResult.graphqlErrors.length > 0) {
      results.errors.push({
        route,
        type: 'graphql',
        count: pageResult.graphqlErrors.length,
        errors: pageResult.graphqlErrors
      });
    }
    
    if (pageResult.consoleErrors.length > 0) {
      results.errors.push({
        route,
        type: 'console',
        count: pageResult.consoleErrors.length,
        errors: pageResult.consoleErrors
      });
    }
  }

  return pageResult;
}

async function runTests() {
  console.log(`🚀 Starting comprehensive page testing for ${BASE_URL}`);
  console.log(`📋 Testing ${ROUTES.length} pages...\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ]
  });

  try {
    for (let i = 0; i < ROUTES.length; i++) {
      const route = ROUTES[i];
      const progress = `[${i + 1}/${ROUTES.length}]`;
      process.stdout.write(`${progress} Testing ${route}... `);
      
      const result = await testPage(browser, route);
      
      if (result.status === 'success') {
        console.log('✅');
      } else if (result.status === 'partial-success') {
        console.log(`⚠️  (${result.graphqlErrors.length} GraphQL, ${result.consoleErrors.length} console errors)`);
      } else {
        console.log(`❌ (${result.status})`);
      }

      // Delay between pages to avoid overwhelming the server
      if (i < ROUTES.length - 1) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_PAGES));
      }
    }
  } finally {
    await browser.close();
  }

  // Generate summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Pages: ${results.totalPages}`);
  console.log(`Tested: ${results.tested}`);
  console.log(`Successful: ${results.successful}`);
  console.log(`Failed/Issues: ${results.failed}`);
  console.log(`Total Errors Found: ${results.errors.length}`);
  console.log('='.repeat(60));

  // Save results to file
  fs.writeFileSync(
    path.join(__dirname, OUTPUT_FILE),
    JSON.stringify(results, null, 2)
  );

  console.log(`\n💾 Results saved to ${OUTPUT_FILE}`);

  // Generate human-readable report
  generateReport(results);

  return results;
}

function generateReport(results) {
  const reportPath = path.join(__dirname, 'page-test-report.md');
  let report = `# Page Testing Report\n\n`;
  report += `**Generated:** ${results.timestamp}\n`;
  report += `**Base URL:** ${results.baseUrl}\n`;
  report += `**Total Pages:** ${results.totalPages}\n`;
  report += `**Tested:** ${results.tested}\n`;
  report += `**Successful:** ${results.successful}\n`;
  report += `**Failed/Issues:** ${results.failed}\n\n`;

  if (results.pages.length === 0) {
    report += `## ✅ All Pages Passed!\n\nNo errors found.\n`;
  } else {
    report += `## ⚠️ Pages with Issues\n\n`;

    // Group by error type
    const graphqlErrors = results.pages.filter(p => p.graphqlErrors.length > 0);
    const consoleErrors = results.pages.filter(p => p.consoleErrors.length > 0);
    const networkErrors = results.pages.filter(p => p.networkErrors.length > 0);

    if (graphqlErrors.length > 0) {
      report += `### 🔴 GraphQL Errors (${graphqlErrors.length} pages)\n\n`;
      graphqlErrors.forEach(page => {
        report += `#### ${page.route}\n`;
        report += `- **URL:** ${page.url}\n`;
        report += `- **Status:** ${page.httpStatus}\n`;
        report += `- **Errors:**\n`;
        page.graphqlErrors.forEach(err => {
          report += `  - ${err.message}\n`;
          if (err.path) {
            report += `    - Path: ${JSON.stringify(err.path)}\n`;
          }
        });
        report += `\n`;
      });
    }

    if (consoleErrors.length > 0) {
      report += `### 🟡 Console Errors (${consoleErrors.length} pages)\n\n`;
      consoleErrors.forEach(page => {
        report += `#### ${page.route}\n`;
        report += `- **URL:** ${page.url}\n`;
        report += `- **Errors:**\n`;
        page.consoleErrors.forEach(err => {
          report += `  - ${err.message}\n`;
        });
        report += `\n`;
      });
    }

    if (networkErrors.length > 0) {
      report += `### 🔵 Network Errors (${networkErrors.length} pages)\n\n`;
      networkErrors.forEach(page => {
        report += `#### ${page.route}\n`;
        report += `- **URL:** ${page.url}\n`;
        report += `- **Errors:**\n`;
        page.networkErrors.forEach(err => {
          report += `  - ${err.url}: ${err.failure}\n`;
        });
        report += `\n`;
      });
    }
  }

  fs.writeFileSync(reportPath, report);
  console.log(`📄 Human-readable report saved to page-test-report.md`);
}

// Run if executed directly
if (require.main === module) {
  runTests()
    .then(() => {
      console.log('\n✅ Testing complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Testing failed:', error);
      process.exit(1);
    });
}

module.exports = { runTests, ROUTES };

