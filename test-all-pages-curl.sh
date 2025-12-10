#!/bin/bash

# Comprehensive curl-based page testing script for Tifto Admin
# Tests all pages and checks for HTTP errors, redirects, and response times

BASE_URL="${BASE_URL:-https://tifto-admin-web.onrender.com}"
OUTPUT_FILE="curl-test-results.txt"
ERROR_FILE="curl-errors.txt"
SUMMARY_FILE="curl-test-summary.txt"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# All routes extracted from the app structure
ROUTES=(
  # Unprotected routes
  "/authentication"
  "/authentication/login"
  "/authentication/sign-up"
  "/authentication/otp"
  "/authentication/verify-email"
  "/authentication/verify-phone"
  "/forbidden"
  
  # Super Admin routes
  "/home"
  "/general"
  "/general/vendors"
  "/general/stores"
  "/general/riders"
  "/general/riders/test-id"
  "/general/users"
  "/general/users/user-detail/test-id"
  "/general/staff"
  "/management"
  "/management/configurations"
  "/management/coupons"
  "/management/cuisines"
  "/management/banners"
  "/management/tippings"
  "/management/commission-rates"
  "/management/notifications"
  "/management/orders"
  "/management/shop-types"
  "/wallet/earnings"
  "/wallet/transaction-history"
  "/wallet/withdraw-requests"
  "/audit-logs"
  "/customerSupport"
  "/dispatch"
  "/language"
  "/settings"
  "/zone"
  
  # Admin/Restaurant routes
  "/admin"
  "/admin/store"
  "/admin/store/dashboard"
  "/admin/store/profile"
  "/admin/store/orders"
  "/admin/store/general"
  "/admin/store/general/payment"
  "/admin/store/general/location"
  "/admin/store/general/timing"
  "/admin/store/product-management"
  "/admin/store/product-management/category"
  "/admin/store/product-management/food"
  "/admin/store/product-management/add-ons"
  "/admin/store/product-management/options"
  "/admin/store/coupons"
  "/admin/store/ratings"
  "/admin/store/wallets/earnings"
  "/admin/store/wallets/transaction-history"
  "/admin/store/wallets/withdrawal-request"
  
  # Vendor routes
  "/admin/vendor"
  "/admin/vendor/dashboard"
  "/admin/vendor/profile"
  "/admin/vendor/stores"
)

echo "🚀 Starting comprehensive page testing for ${BASE_URL}"
echo "=================================================="
echo ""

total=${#ROUTES[@]}
success=0
failed=0
redirects=0
errors=0

> "$OUTPUT_FILE"
> "$ERROR_FILE"
> "$SUMMARY_FILE"

echo "Testing ${total} pages..." >> "$SUMMARY_FILE"
echo "Base URL: ${BASE_URL}" >> "$SUMMARY_FILE"
echo "Started: $(date)" >> "$SUMMARY_FILE"
echo "" >> "$SUMMARY_FILE"

for i in "${!ROUTES[@]}"; do
  route="${ROUTES[$i]}"
  url="${BASE_URL}${route}"
  progress="[$(($i + 1))/$total]"
  
  echo -n "${progress} Testing ${route}... "
  
  # Make request and capture status code, time, and redirect
  response=$(curl -s -o /dev/null -w "%{http_code}|%{time_total}|%{redirect_url}|%{url_effective}" -L --max-time 15 --connect-timeout 10 "$url" 2>&1)
  curl_exit_code=$?
  
  if [ $curl_exit_code -eq 0 ]; then
    http_code=$(echo "$response" | cut -d'|' -f1)
    time_total=$(echo "$response" | cut -d'|' -f2)
    redirect_url=$(echo "$response" | cut -d'|' -f3)
    effective_url=$(echo "$response" | cut -d'|' -f4)
    
    # Check if redirect happened
    if [ -n "$redirect_url" ] && [ "$redirect_url" != "$url" ]; then
      redirect_info=" → ${redirect_url}"
    else
      redirect_info=""
    fi
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
      echo -e "${GREEN}✅${NC} (${http_code}, ${time_total}s)"
      echo "✅ ${route} - HTTP ${http_code} - ${time_total}s${redirect_info}" >> "$OUTPUT_FILE"
      ((success++))
    elif [ "$http_code" -ge 300 ] && [ "$http_code" -lt 400 ]; then
      echo -e "${YELLOW}↪️${NC}  (${http_code} redirect)"
      echo "↪️  ${route} - HTTP ${http_code} - Redirect to: ${redirect_url} - ${time_total}s" >> "$OUTPUT_FILE"
      ((redirects++))
    elif [ "$http_code" -eq 404 ]; then
      echo -e "${BLUE}⚠️${NC}  (${http_code} Not Found)"
      echo "⚠️  ${route} - HTTP ${http_code} - Not Found - ${time_total}s" >> "$OUTPUT_FILE"
      ((redirects++))
    else
      echo -e "${RED}❌${NC} (${http_code})"
      echo "❌ ${route} - HTTP ${http_code} - ${time_total}s${redirect_info}" >> "$ERROR_FILE"
      ((failed++))
      ((errors++))
    fi
  else
    echo -e "${RED}❌${NC} (Connection failed: ${curl_exit_code})"
    echo "❌ ${route} - Connection failed (exit code: ${curl_exit_code})" >> "$ERROR_FILE"
    ((failed++))
    ((errors++))
  fi
  
  # Small delay to avoid overwhelming server
  sleep 0.5
done

echo ""
echo "=================================================="
echo "📊 TEST SUMMARY"
echo "=================================================="
echo "Total Pages: $total"
echo -e "${GREEN}Successful (2xx): $success${NC}"
echo -e "${YELLOW}Redirects/Not Found (3xx/404): $redirects${NC}"
echo -e "${RED}Failed (4xx/5xx/Errors): $failed${NC}"
echo ""

# Write summary to file
echo "==================================================" >> "$SUMMARY_FILE"
echo "TEST SUMMARY" >> "$SUMMARY_FILE"
echo "==================================================" >> "$SUMMARY_FILE"
echo "Total Pages: $total" >> "$SUMMARY_FILE"
echo "Successful (2xx): $success" >> "$SUMMARY_FILE"
echo "Redirects/Not Found (3xx/404): $redirects" >> "$SUMMARY_FILE"
echo "Failed (4xx/5xx/Errors): $failed" >> "$SUMMARY_FILE"
echo "Completed: $(date)" >> "$SUMMARY_FILE"
echo "" >> "$SUMMARY_FILE"

if [ $failed -gt 0 ]; then
  echo "Errors saved to: $ERROR_FILE"
  echo "" >> "$SUMMARY_FILE"
  echo "ERRORS FOUND:" >> "$SUMMARY_FILE"
  cat "$ERROR_FILE" >> "$SUMMARY_FILE"
fi

echo "Results saved to: $OUTPUT_FILE"
echo "Summary saved to: $SUMMARY_FILE"
if [ $failed -gt 0 ]; then
  echo "Errors saved to: $ERROR_FILE"
fi

# Exit with error code if there were failures
if [ $errors -gt 0 ]; then
  exit 1
else
  exit 0
fi

