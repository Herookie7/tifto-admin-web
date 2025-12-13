# Riders Page Debug Summary

## Issue
The riders page at `/general/riders` may be showing "No Data Available" or not displaying riders correctly.

## Investigation

### Backend Query Test
The `riders` query works correctly:
```bash
curl -X POST https://ftifto-backend.onrender.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { riders { _id name username password phone available vehicleType assigned zone { _id title } } }"}'
```

**Result:** ✅ Returns 1 rider successfully

### Frontend Code Analysis

The component `RidersMain` uses:
- Query: `GET_RIDERS`
- Hook: `useQueryGQL` - **Was called with only 2 parameters** ❌
- Variables: `{}` (empty object)

### Issue Found

The `useQueryGQL` hook was being called incorrectly:
```typescript
// BEFORE (WRONG):
const { data, loading } = useQueryGQL(GET_RIDERS, {}) as IQueryResult<...>;

// AFTER (CORRECT):
const { data, loading, error } = useQueryGQL(
  GET_RIDERS,
  {}, // variables
  {   // options
    errorPolicy: 'all',
    onError: (error) => { ... }
  }
) as IQueryResult<...>;
```

The hook signature requires 3 parameters:
1. `query` - The GraphQL query
2. `variables` - Query variables (can be empty object)
3. `options` - Query options (errorPolicy, onError, etc.)

### Fix Applied

**File:** `lib/ui/screen-components/protected/super-admin/riders/view/main/index.tsx`

1. **Fixed hook call**:
   - Added third parameter (options) to `useQueryGQL`
   - Added `errorPolicy: 'all'` for graceful error handling
   - Added `onError` callback to show toast notifications

2. **Improved error handling**:
   - Added error logging
   - Added user-friendly error messages via toast

## Code Structure

The component correctly:
- ✅ Uses `useQueryGQL` with proper parameters (after fix)
- ✅ Handles loading state with dummy data
- ✅ Extracts data from response: `data?.riders`
- ✅ Handles empty data gracefully

## Test Results

- ✅ Backend query works (returns 1 rider)
- ✅ GraphQL query structure is correct
- ✅ Frontend hook usage fixed (now uses 3 parameters)

## Files Modified

1. **`lib/ui/screen-components/protected/super-admin/riders/view/main/index.tsx`**
   - Fixed `useQueryGQL` hook call
   - Added error handling
   - Added error logging

## Next Steps

1. **Deploy the fix** - The riders component fix needs to be deployed
2. **Verify in browser** - After deployment, check:
   - Navigate to https://tifto-admin-web.onrender.com/general/riders
   - Should see list of riders
   - Check browser console for any errors
3. **Monitor** - Watch for any query errors

## Additional Notes

- The riders query filters users by `role: 'rider'` in the backend
- The query doesn't require authentication but will use it if available
- Apollo client automatically includes authentication token in headers when user is logged in
- The fix ensures proper error handling and data validation
