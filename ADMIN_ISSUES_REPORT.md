# Tifto Admin Issues Report

## Summary
This document outlines the issues found in the tifto-admin application and their fixes.

## Issues Found

### 1. GraphQL Schema Mismatch - `getDashboardUsersByYear` Query

**Status**: ⚠️ Partially Fixed (Frontend error handling improved, backend schema fix required)

**Problem**:
- The backend GraphQL schema defines `DashboardUsersResponse` with `Int` fields:
  ```graphql
  type DashboardUsersResponse {
    usersCount: Int
    vendorsCount: Int
    restaurantsCount: Int
    ridersCount: Int
  }
  ```
- However, the resolver `getDashboardUsersByYear` returns arrays `[Int]` for these fields
- This causes GraphQL validation errors: `"Int cannot represent non-integer value: [0, 0, 0, ...]"`

**Impact**:
- The Growth Overview chart on the home page fails to load data
- GraphQL query returns errors instead of data
- User experience is degraded

**Frontend Fix Applied**:
- ✅ Added error handling in `growth-overview/index.tsx` to gracefully handle GraphQL errors
- ✅ Updated `useQueryGQL` hook to support `errorPolicy` option
- ✅ Component now shows empty chart data instead of crashing when query fails

**Backend Fix Required**:
The backend schema needs to be updated in `ftifto-backend/src/graphql/schema.js`:

```graphql
# Current (WRONG):
type DashboardUsersResponse {
  usersCount: Int
  vendorsCount: Int
  restaurantsCount: Int
  ridersCount: Int
}

# Should be (CORRECT):
type DashboardUsersResponse {
  usersCount: [Int]  # Array of 12 integers (one per month)
  vendorsCount: [Int]
  restaurantsCount: [Int]
  ridersCount: [Int]
}
```

**Location**: `ftifto-backend/src/graphql/schema.js` line 707-719

---

## Working Queries

The following queries are working correctly:
- ✅ `getDashboardUsers` - Returns user counts
- ✅ `getDashboardOrdersByType` - Returns orders grouped by type
- ✅ `getDashboardSalesByType` - Returns sales grouped by type

---

## Testing

A diagnostic script has been created to test all GraphQL queries:
- **File**: `test-admin-issues.sh`
- **Usage**: `bash test-admin-issues.sh`

The script tests:
1. Admin page accessibility
2. Backend GraphQL endpoint connectivity
3. All dashboard queries
4. CORS configuration

---

## Recommendations

1. **Immediate**: Update backend GraphQL schema for `DashboardUsersResponse` to use `[Int]` instead of `Int`
2. **Short-term**: Add comprehensive error boundaries for GraphQL queries
3. **Long-term**: Implement GraphQL schema validation in CI/CD pipeline

---

## Files Modified

### Frontend (tifto-admin):
1. `lib/ui/screen-components/protected/super-admin/home/growth-overview/index.tsx`
   - Added error handling for GraphQL query failures
   - Improved data normalization logic

2. `lib/hooks/useQueryQL.tsx`
   - Added `errorPolicy` option support

3. `test-admin-issues.sh` (new)
   - Comprehensive diagnostic script for testing

### Backend (ftifto-backend) - REQUIRED:
1. `src/graphql/schema.js` line 707-719
   - Update `DashboardUsersResponse` type definition

---

## Next Steps

1. Update backend schema (priority: HIGH)
2. Test the fix in staging environment
3. Deploy to production
4. Monitor for any other GraphQL errors
