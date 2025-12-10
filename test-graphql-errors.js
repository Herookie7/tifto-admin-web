#!/usr/bin/env node

/**
 * GraphQL Error Testing Script
 * Tests GraphQL queries that are likely used on each page
 * Works with Node 18+ (uses built-in fetch)
 */

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://tifto-admin-web.onrender.com';
const BACKEND_URL = process.env.BACKEND_URL || 'https://ftifto-backend.onrender.com';
const GRAPHQL_URL = `${BACKEND_URL.replace(/\/$/, '')}/graphql`;
const OUTPUT_FILE = 'graphql-test-results.json';

// Common GraphQL queries that might be used on different pages
const TEST_QUERIES = {
  'vendors': {
    query: `
      query {
        vendors(filters: {}) {
          _id
          name
          email
          restaurants {
            _id
            name
          }
        }
      }
    `
  },
  'riders': {
    query: `
      query {
        riders(filters: {}) {
          _id
          name
          username
          phone
          zone {
            _id
            title
          }
        }
      }
    `
  },
  'users': {
    query: `
      query {
        users {
          _id
          name
          email
        }
      }
    `
  },
  'restaurants': {
    query: `
      query {
        restaurants(filters: {}) {
          _id
          name
          address
          owner {
            _id
            name
          }
        }
      }
    `
  },
  'staffs': {
    query: `
      query {
        staffs(filters: {}) {
          _id
          name
          email
        }
      }
    `
  },
  'zones': {
    query: `
      query {
        zones {
          _id
          title
        }
      }
    `
  },
  'configuration': {
    query: `
      query {
        configuration {
          _id
          currency
          currencySymbol
        }
      }
    `
  },
  'coupons': {
    query: `
      query {
        coupons {
          _id
          title
        }
      }
    `
  },
  'banners': {
    query: `
      query {
        banners {
          _id
          title
        }
      }
    `
  },
  'orders': {
    query: `
      query {
        orders(offset: 0) {
          _id
          orderId
          orderStatus
        }
      }
    `
  }
};

const results = {
  timestamp: new Date().toISOString(),
  graphqlUrl: GRAPHQL_URL,
  frontendUrl: FRONTEND_URL,
  backendUrl: BACKEND_URL,
  totalQueries: Object.keys(TEST_QUERIES).length,
  tested: 0,
  successful: 0,
  failed: 0,
  errors: []
};

async function testGraphQLQuery(name, queryObj) {
  const testResult = {
    queryName: name,
    status: 'unknown',
    errors: [],
    data: null,
    responseTime: 0
  };

  const startTime = Date.now();

  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(queryObj)
    });

    testResult.responseTime = Date.now() - startTime;
    const responseData = await response.json();

    if (responseData.errors && responseData.errors.length > 0) {
      testResult.status = 'error';
      testResult.errors = responseData.errors.map(err => ({
        message: err.message,
        path: err.path,
        extensions: err.extensions,
        locations: err.locations
      }));
      results.failed++;
      results.errors.push({
        query: name,
        errors: testResult.errors
      });
    } else if (responseData.data) {
      testResult.status = 'success';
      testResult.data = responseData.data;
      results.successful++;
    } else {
      testResult.status = 'unknown';
      testResult.errors = [{ message: 'No data or errors in response' }];
      results.failed++;
    }

  } catch (error) {
    testResult.status = 'error';
    testResult.errors = [{
      message: error.message,
      type: 'network'
    }];
    results.failed++;
    results.errors.push({
      query: name,
      errors: testResult.errors
    });
  } finally {
    results.tested++;
  }

  return testResult;
}

async function runTests() {
  console.log(`🚀 Testing GraphQL queries on ${GRAPHQL_URL}\n`);
  console.log(`📋 Testing ${results.totalQueries} queries...\n`);

  const allResults = {};

  for (const [name, queryObj] of Object.entries(TEST_QUERIES)) {
    process.stdout.write(`Testing ${name}... `);
    
    const result = await testGraphQLQuery(name, queryObj);
    allResults[name] = result;

    if (result.status === 'success') {
      console.log('✅');
    } else {
      console.log(`❌ (${result.errors.length} error(s))`);
      result.errors.forEach(err => {
        console.log(`   - ${err.message}`);
      });
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Generate summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Queries: ${results.totalQueries}`);
  console.log(`Tested: ${results.tested}`);
  console.log(`Successful: ${results.successful}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Total Errors: ${results.errors.length}`);
  console.log('='.repeat(60));

  // Save results
  const fs = require('fs');
  const path = require('path');
  
  const output = {
    ...results,
    queryResults: allResults
  };

  fs.writeFileSync(
    path.join(__dirname, OUTPUT_FILE),
    JSON.stringify(output, null, 2)
  );

  console.log(`\n💾 Results saved to ${OUTPUT_FILE}`);

  // Generate markdown report
  generateReport(output);

  return output;
}

function generateReport(results) {
  const fs = require('fs');
  const path = require('path');
  const reportPath = path.join(__dirname, 'graphql-test-report.md');
  
  let report = `# GraphQL Query Testing Report\n\n`;
  report += `**Generated:** ${results.timestamp}\n`;
  report += `**GraphQL URL:** ${results.graphqlUrl}\n`;
  report += `**Total Queries:** ${results.totalQueries}\n`;
  report += `**Successful:** ${results.successful}\n`;
  report += `**Failed:** ${results.failed}\n\n`;

  if (results.errors.length === 0) {
    report += `## ✅ All Queries Passed!\n\nNo GraphQL errors found.\n`;
  } else {
    report += `## ⚠️ Queries with Errors\n\n`;

    Object.entries(results.queryResults).forEach(([name, result]) => {
      if (result.status === 'error') {
        report += `### ${name}\n\n`;
        report += `- **Status:** ${result.status}\n`;
        report += `- **Response Time:** ${result.responseTime}ms\n`;
        report += `- **Errors:**\n`;
        result.errors.forEach(err => {
          report += `  - ${err.message}\n`;
          if (err.path) {
            report += `    - Path: ${JSON.stringify(err.path)}\n`;
          }
          if (err.extensions) {
            report += `    - Extensions: ${JSON.stringify(err.extensions)}\n`;
          }
        });
        report += `\n`;
      }
    });
  }

  fs.writeFileSync(reportPath, report);
  console.log(`📄 Report saved to graphql-test-report.md`);
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

module.exports = { runTests, TEST_QUERIES };

