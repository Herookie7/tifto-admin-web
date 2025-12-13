#!/bin/bash

# Comprehensive test script for tifto-admin issues
# Tests all GraphQL queries used in the home page

BACKEND_URL="https://ftifto-backend.onrender.com/graphql"
ADMIN_URL="https://tifto-admin-web.onrender.com/home"

echo "=========================================="
echo "Tifto Admin Diagnostic Test Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if admin page is accessible
echo "Test 1: Checking if admin page is accessible..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$ADMIN_URL")
if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✓${NC} Admin page is accessible (HTTP $HTTP_CODE)"
else
    echo -e "${RED}✗${NC} Admin page returned HTTP $HTTP_CODE"
fi
echo ""

# Test 2: Check if backend GraphQL endpoint is accessible
echo "Test 2: Checking if backend GraphQL endpoint is accessible..."
RESPONSE=$(curl -s -X POST "$BACKEND_URL" \
    -H "Content-Type: application/json" \
    -d '{"query":"{ __typename }"}')
if echo "$RESPONSE" | grep -q "__typename"; then
    echo -e "${GREEN}✓${NC} Backend GraphQL endpoint is accessible"
else
    echo -e "${RED}✗${NC} Backend GraphQL endpoint is not accessible"
    echo "Response: $RESPONSE"
fi
echo ""

# Test 3: Test getDashboardUsers query
echo "Test 3: Testing getDashboardUsers query..."
RESPONSE=$(curl -s -X POST "$BACKEND_URL" \
    -H "Content-Type: application/json" \
    -d '{"query":"query { getDashboardUsers { usersCount vendorsCount restaurantsCount ridersCount } }"}')
if echo "$RESPONSE" | grep -q "errors"; then
    echo -e "${RED}✗${NC} getDashboardUsers query has errors:"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
else
    echo -e "${GREEN}✓${NC} getDashboardUsers query works correctly"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null | head -10 || echo "$RESPONSE" | head -5
fi
echo ""

# Test 4: Test getDashboardUsersByYear query
echo "Test 4: Testing getDashboardUsersByYear query..."
CURRENT_YEAR=$(date +%Y)
RESPONSE=$(curl -s -X POST "$BACKEND_URL" \
    -H "Content-Type: application/json" \
    -d "{\"query\":\"query { getDashboardUsersByYear(year: $CURRENT_YEAR) { usersCount vendorsCount restaurantsCount ridersCount } }\"}")
if echo "$RESPONSE" | grep -q "errors"; then
    echo -e "${YELLOW}⚠${NC} getDashboardUsersByYear query has errors (known issue - schema mismatch):"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null | grep -A 5 "errors" || echo "$RESPONSE" | grep -A 5 "errors"
else
    echo -e "${GREEN}✓${NC} getDashboardUsersByYear query works correctly"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null | head -10 || echo "$RESPONSE" | head -5
fi
echo ""

# Test 5: Test getDashboardOrdersByType query
echo "Test 5: Testing getDashboardOrdersByType query..."
RESPONSE=$(curl -s -X POST "$BACKEND_URL" \
    -H "Content-Type: application/json" \
    -d '{"query":"query { getDashboardOrdersByType { value label } }"}')
if echo "$RESPONSE" | grep -q "errors"; then
    echo -e "${RED}✗${NC} getDashboardOrdersByType query has errors:"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
else
    echo -e "${GREEN}✓${NC} getDashboardOrdersByType query works correctly"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null | head -10 || echo "$RESPONSE" | head -5
fi
echo ""

# Test 6: Test getDashboardSalesByType query
echo "Test 6: Testing getDashboardSalesByType query..."
RESPONSE=$(curl -s -X POST "$BACKEND_URL" \
    -H "Content-Type: application/json" \
    -d '{"query":"query { getDashboardSalesByType { value label } }"}')
if echo "$RESPONSE" | grep -q "errors"; then
    echo -e "${RED}✗${NC} getDashboardSalesByType query has errors:"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
else
    echo -e "${GREEN}✓${NC} getDashboardSalesByType query works correctly"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null | head -10 || echo "$RESPONSE" | head -5
fi
echo ""

# Test 7: Check CORS headers
echo "Test 7: Checking CORS configuration..."
CORS_HEADERS=$(curl -s -I -X OPTIONS "$BACKEND_URL" -H "Origin: https://tifto-admin-web.onrender.com" | grep -i "access-control")
if [ -z "$CORS_HEADERS" ]; then
    echo -e "${YELLOW}⚠${NC} No CORS headers found (may cause issues in browser)"
else
    echo -e "${GREEN}✓${NC} CORS headers found:"
    echo "$CORS_HEADERS"
fi
echo ""

# Test 8: Test vendors query (used in /general/vendors page)
echo "Test 8: Testing vendors query..."
RESPONSE=$(curl -s -X POST "$BACKEND_URL" \
    -H "Content-Type: application/json" \
    -d '{"query":"query { vendors { unique_id _id email userType isActive name image restaurants { _id } } }"}')
if echo "$RESPONSE" | grep -q "errors"; then
    echo -e "${RED}✗${NC} vendors query has errors:"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null | grep -A 5 "errors" || echo "$RESPONSE" | grep -A 5 "errors"
else
    VENDOR_COUNT=$(echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data.get('data', {}).get('vendors', [])))" 2>/dev/null || echo "0")
    if [ "$VENDOR_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✓${NC} vendors query works correctly (found $VENDOR_COUNT vendors)"
    else
        echo -e "${YELLOW}⚠${NC} vendors query works but returned 0 vendors"
    fi
fi
echo ""

# Summary
echo "=========================================="
echo "Summary"
echo "=========================================="
echo "Issues found:"
echo "1. getDashboardUsersByYear: Backend returns arrays but GraphQL schema expects Int"
echo "   - This is a backend schema issue"
echo "   - Frontend code already handles arrays correctly"
echo "   - Backend schema needs to be updated to [Int] instead of Int"
echo ""
echo "Recommendations:"
echo "1. Update backend GraphQL schema for getDashboardUsersByYear to use [Int]"
echo "2. Verify all environment variables are set correctly in production"
echo "3. Check browser console for runtime errors"
echo ""
