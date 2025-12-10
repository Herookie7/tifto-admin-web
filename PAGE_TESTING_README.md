# Page Testing Script

This script automatically tests all pages of the Tifto Admin application and generates a comprehensive report of errors, GraphQL issues, and console problems.

## Features

- ✅ Tests all routes automatically
- 🔍 Captures GraphQL errors from API responses
- 📝 Records console errors and warnings
- 🌐 Monitors network failures
- 📊 Generates detailed JSON and Markdown reports
- ⏱️ Measures page load times
- 🔄 Tracks redirects and HTTP status codes

## Installation

First, install the required dependency:

```bash
npm install
```

This will install `puppeteer` as a dev dependency.

## Usage

### Test Production Site (Default)

```bash
npm run test:pages
```

This will test `https://tifto-admin-web.onrender.com` by default.

### Test Custom URL

You can test a different URL by setting the `BASE_URL` environment variable:

```bash
BASE_URL=http://localhost:3000 npm run test:pages
```

### Test Local Development Server

```bash
BASE_URL=http://localhost:3000 npm run test:pages
```

## Output Files

After running the script, you'll get two output files:

1. **`page-test-results.json`** - Detailed JSON report with all data
2. **`page-test-report.md`** - Human-readable Markdown report

## Report Structure

The reports include:

- **Summary Statistics**: Total pages, successful, failed, etc.
- **GraphQL Errors**: All GraphQL query/mutation errors found
- **Console Errors**: JavaScript console errors
- **Network Errors**: Failed network requests
- **Page Details**: HTTP status, load times, redirects

## Example Output

```
🚀 Starting comprehensive page testing for https://tifto-admin-web.onrender.com
📋 Testing 50 pages...

[1/50] Testing /authentication... ✅
[2/50] Testing /authentication/login... ✅
[3/50] Testing /general/riders... ⚠️  (2 GraphQL, 1 console errors)
...

============================================================
📊 TEST SUMMARY
============================================================
Total Pages: 50
Tested: 50
Successful: 45
Failed/Issues: 5
Total Errors Found: 12
============================================================

💾 Results saved to page-test-results.json
📄 Human-readable report saved to page-test-report.md
```

## Pages Tested

The script tests all major routes including:

- Authentication pages (login, signup, OTP, etc.)
- Super Admin pages (dashboard, vendors, stores, riders, users, etc.)
- Management pages (configurations, coupons, banners, etc.)
- Admin/Restaurant pages (dashboard, orders, products, etc.)
- Vendor pages (dashboard, profile, stores)

## Notes

- The script adds a 3-second delay between pages to avoid overwhelming the server
- Each page has a 30-second timeout
- Protected routes may redirect to login (this is expected)
- Some dynamic routes use test IDs (e.g., `/general/riders/test-id`)

## Troubleshooting

If you encounter issues:

1. **Puppeteer installation fails**: Make sure you have all system dependencies
   ```bash
   # On Ubuntu/Debian
   sudo apt-get install -y \
     ca-certificates \
     fonts-liberation \
     libappindicator3-1 \
     libasound2 \
     libatk-bridge2.0-0 \
     libatk1.0-0 \
     libc6 \
     libcairo2 \
     libcups2 \
     libdbus-1-3 \
     libexpat1 \
     libfontconfig1 \
     libgbm1 \
     libgcc1 \
     libglib2.0-0 \
     libgtk-3-0 \
     libnspr4 \
     libnss3 \
     libpango-1.0-0 \
     libpangocairo-1.0-0 \
     libstdc++6 \
     libx11-6 \
     libx11-xcb1 \
     libxcb1 \
     libxcomposite1 \
     libxcursor1 \
     libxdamage1 \
     libxext6 \
     libxfixes3 \
     libxi6 \
     libxrandr2 \
     libxrender1 \
     libxss1 \
     libxtst6 \
     lsb-release \
     wget \
     xdg-utils
   ```

2. **Timeout errors**: Increase timeout in the script or check server response time

3. **Memory issues**: The script processes pages sequentially to minimize memory usage

## Customization

You can modify `test-all-pages.js` to:
- Add more routes
- Change delay between pages
- Adjust timeouts
- Add custom error detection
- Filter specific error types

