#!/bin/bash

# Simple curl-based page testing script
# Tests all pages and checks for HTTP errors

BASE_URL="${BASE_URL:-https://tifto-admin-web.onrender.com}"
OUTPUT_FILE="curl-test-results.txt"
ERROR_FILE="curl-errors.txt"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Routes to test
ROUTES=(
  "/authentication"
  "/authentication/login"
  "/authentication/sign-up"
  "/general/vendors"
  "/general/stores"
  "/general/riders"
  "/general/users"
  "/general/staff"
  "/management/configurations"
  "/management/coupons"
  "/management/cuisines"
  "/management/banners"
  "/management/tippings"
  "/management/commission-rates"
  "/management/notifications"
  "/management/orders"
  "/home"
  "/admin/store/dashboard"
  "/admin/vendor/dashboard"
)

echo "🚀 Testing pages on ${BASE_URL}"
echo "=================================="
echo ""

total=${#ROUTES[@]}
success=0
failed=0
redirects=0

> "$OUTPUT_FILE"
> "$ERROR_FILE"

for i in "${!ROUTES[@]}"; do
  route="${ROUTES[$i]}"
  url="${BASE_URL}${route}"
  progress="[$(($i + 1))/$total]"
  
  echo -n "${progress} Testing ${route}... "
  
  # Make request and capture status code
  response=$(curl -s -o /dev/null -w "%{http_code}|%{time_total}|%{redirect_url}" -L --max-time 10 "$url" 2>&1)
  
  if [ $? -eq 0 ]; then
    http_code=$(echo "$response" | cut -d'|' -f1)
    time_total=$(echo "$response" | cut -d'|' -f2)
    redirect_url=$(echo "$response" | cut -d'|' -f3)
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
      echo -e "${GREEN}✅${NC} (${http_code}, ${time_total}s)"
      echo "✅ ${route} - HTTP ${http_code} - ${time_total}s" >> "$OUTPUT_FILE"
      ((success++))
    elif [ "$http_code" -ge 300 ] && [ "$http_code" -lt 400 ]; then
      echo -e "${YELLOW}↪️${NC}  (${http_code} redirect)"
      echo "↪️  ${route} - HTTP ${http_code} - Redirect to: ${redirect_url}" >> "$OUTPUT_FILE"
      ((redirects++))
    else
      echo -e "${RED}❌${NC} (${http_code})"
      echo "❌ ${route} - HTTP ${http_code}" >> "$ERROR_FILE"
      ((failed++))
    fi
  else
    echo -e "${RED}❌${NC} (Connection failed)"
    echo "❌ ${route} - Connection failed" >> "$ERROR_FILE"
    ((failed++))
  fi
  
  # Small delay to avoid overwhelming server
  sleep 1
done

echo ""
echo "=================================="
echo "📊 SUMMARY"
echo "=================================="
echo "Total: $total"
echo -e "${GREEN}Success: $success${NC}"
echo -e "${YELLOW}Redirects: $redirects${NC}"
echo -e "${RED}Failed: $failed${NC}"
echo ""
echo "Results saved to: $OUTPUT_FILE"
if [ $failed -gt 0 ]; then
  echo "Errors saved to: $ERROR_FILE"
fi

