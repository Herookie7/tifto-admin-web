# Withdraw Requests Page Debug Summary

## Issue
The withdraw requests page at `/wallet/withdraw-requests` may be showing "No Data Available" or not displaying withdraw requests correctly.

## Investigation

### Backend Query Test
The `withdrawRequests` query requires pagination:
```bash
curl -X POST https://ftifto-backend.onrender.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { withdrawRequests(pagination: { pageSize: 10, pageNo: 1 }) { data { _id amount } pagination { total } } }"}'
```

**Note:** The backend uses `withdrawRequests` (not `withdrawalRequests`), and requires pagination parameters.

### Frontend Code Analysis

The component `WithdrawRequestsSuperAdminMain` uses:
- Query: `GET_ALL_WITHDRAW_REQUESTS`
- Hook: `useQuery` from Apollo Client (not `useQueryGQL`)
- Variables: Required - `pageSize`, `pageNo`, optional: `userType`, `search`

### Issues Found

1. **Missing Error Handling**: No error handling for failed queries
   - No `errorPolicy` set
   - No `onError` callback
   - Error state not being used

2. **Incomplete Refetch Variables**: The `useEffect` refetch wasn't including all necessary variables (only included `search`)

3. **Missing Error Display**: No error message shown to users when query fails

4. **Search Variable Handling**: Search variable could be empty string instead of undefined

### Fixes Applied

**File:** `lib/ui/screen-components/protected/super-admin/withdraw-requests/view/main/index.tsx`

1. **Added Error Handling**:
   - Extracted `error` from `useQuery` hook
   - Added `errorPolicy: 'all'` for graceful error handling
   - Added `onError` callback for error logging
   - Added `fetchPolicy: 'network-only'` (already present, kept it)

2. **Fixed Search Variable**:
   - Changed `search: debouncedSearch` to `search: debouncedSearch || undefined`
   - Prevents sending empty string when search is empty

3. **Improved Refetch Logic**:
   - Updated `useEffect` to include all necessary variables in refetch
   - Added proper dependencies to useEffect
   - Added eslint-disable comment for exhaustive deps

4. **Added Error Display**:
   - Added error message display in the UI
   - Added error logging useEffect

## Code Structure

The component correctly:
- ✅ Uses `useQuery` with proper variables
- ✅ Handles pagination with `pageSize` and `pageNo`
- ✅ Handles user type filtering (RIDER, STORE/SELLER)
- ✅ Handles status filtering (client-side)
- ✅ Handles search with debounced input
- ✅ Extracts data from response: `data?.withdrawRequests?.data`
- ✅ Handles pagination metadata: `data?.withdrawRequests?.pagination?.total`
- ✅ Now includes error handling

## Test Results

- ✅ Backend query structure is correct (requires pagination)
- ✅ GraphQL query structure is correct
- ✅ Frontend hook usage is correct (uses `useQuery` with variables)
- ✅ Query requires variables (correctly provided)

## Files Modified

1. **`lib/ui/screen-components/protected/super-admin/withdraw-requests/view/main/index.tsx`**
   - Added error handling and error state extraction
   - Added `errorPolicy` to query options
   - Added `onError` callback for error logging
   - Fixed search variable to use undefined instead of empty string
   - Improved refetch logic with all necessary variables
   - Added error message display in UI
   - Fixed useEffect dependencies

## Next Steps

1. **Deploy the fix** - The withdraw requests component fix needs to be deployed
2. **Verify in browser** - After deployment, check:
   - Navigate to https://tifto-admin-web.onrender.com/wallet/withdraw-requests
   - Should see list of withdraw requests (if any exist)
   - Check that pagination works correctly
   - Check that user type filtering works correctly
   - Check that status filtering works correctly
   - Check that search works correctly
   - Check browser console for any errors
3. **Monitor** - Watch for any query errors

## Additional Notes

- The withdraw requests query requires pagination variables: `pageSize` (Int!), `pageNo` (Int!)
- Optional variables: `userType` (RIDER, SELLER), `search` (String)
- The query returns paginated data with `data` array and `pagination` object
- Status filtering is done client-side (REQUESTED, TRANSFERRED, CANCELLED)
- User type filtering maps STORE to SELLER for backend compatibility
- Error handling ensures users see feedback if the query fails
- The component shows skeleton data while loading
- The component supports pagination, user type filtering, status filtering, and search
