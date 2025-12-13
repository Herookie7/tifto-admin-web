# Staff Page Debug Summary

## Issue
The staff page at `/general/staff` may be showing "No Data Available" or not displaying staff correctly.

## Investigation

### Backend Query Test
The `staffs` query works correctly:
```bash
curl -X POST https://ftifto-backend.onrender.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { staffs { _id name email phone isActive } }"}'
```

**Result:** ✅ Returns 2 staff members successfully

### Frontend Code Analysis

The component `StaffMain` uses:
- Query: `GET_STAFFS`
- Hook: `useQueryGQL` - **Was called with only 2 parameters** ❌
- Variables: None (no variables needed)

### Issue Found

The `useQueryGQL` hook was being called incorrectly:
```typescript
// BEFORE (WRONG):
const { data, loading } = useQueryGQL(GET_STAFFS, {
  fetchPolicy: 'cache-and-network',
}) as IQueryResult<...>;

// AFTER (CORRECT):
const { data, loading, error } = useQueryGQL(
  GET_STAFFS,
  {}, // variables (required parameter)
  {   // options
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
    onError: (error) => { ... }
  }
) as IQueryResult<...>;
```

The hook signature requires 3 parameters:
1. `query` - The GraphQL query
2. `variables` - Query variables (can be empty object)
3. `options` - Query options (fetchPolicy, errorPolicy, onError, etc.)

### Fix Applied

**File:** `lib/ui/screen-components/protected/super-admin/staff/view/main/index.tsx`

1. **Fixed hook call**:
   - Added empty variables object `{}` as second parameter
   - Moved options to third parameter
   - Added `errorPolicy: 'all'` for graceful error handling
   - Added `onError` callback to show toast notifications

2. **Improved error handling**:
   - Added error logging
   - Added user-friendly error messages via toast

## Code Structure

The component correctly:
- ✅ Uses `useQueryGQL` with proper parameters (after fix)
- ✅ Handles loading state with dummy data
- ✅ Extracts data from response: `data?.staffs`
- ✅ Handles empty data gracefully

## Test Results

- ✅ Backend query works (returns 2 staff members)
- ✅ GraphQL query structure is correct
- ✅ Frontend hook usage fixed (now uses 3 parameters)

## Files Modified

1. **`lib/ui/screen-components/protected/super-admin/staff/view/main/index.tsx`**
   - Fixed `useQueryGQL` hook call
   - Added error handling
   - Added error logging

## Next Steps

1. **Deploy the fix** - The staff component fix needs to be deployed
2. **Verify in browser** - After deployment, check:
   - Navigate to https://tifto-admin-web.onrender.com/general/staff
   - Should see list of staff members
   - Check browser console for any errors
3. **Monitor** - Watch for any query errors

## Additional Notes

- The staffs query filters users by `role: { $in: ['admin', 'staff'] }` in the backend
- The query doesn't require authentication but will use it if available
- Apollo client automatically includes authentication token in headers when user is logged in
- The fix ensures proper error handling and data validation
