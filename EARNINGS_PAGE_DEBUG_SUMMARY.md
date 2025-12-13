# Earnings Page Debug Summary

## Issue
The earnings page at `/wallet/earnings` may be showing "No Data Available" or not displaying earnings correctly.

## Investigation

### Backend Query Test
The `earnings` query requires:
- Pagination: `pagination: { pageSize: Int!, pageNo: Int! }`
- Authentication (returns "Authentication required" error without auth)
- Optional filters: `userType`, `userId`, `orderType`, `paymentMethod`, `search`, `dateFilter`

**Note:** The backend requires authentication, so direct curl testing without auth tokens will fail.

### Frontend Code Analysis

The component `EarningsMain` uses:
- Query: `GET_EARNING`
- Hook: `useQuery` from Apollo Client
- Variables: Required - `pageSize`, `pageNo`, optional: `userType`, `userId`, `orderType`, `paymentMethod`, `search`, `startingDate`, `endingDate`

### Issues Found

1. **Missing Error Handling**: No error handling for failed queries
   - No `errorPolicy` set
   - No `onError` callback
   - Error state not being used

2. **Incomplete Refetch Variables**: The `useEffect` refetch wasn't including all necessary variables (only included `search`)

3. **Missing Error Display**: No error message shown to users when query fails

4. **Search Variable Handling**: Search variable could be empty string instead of undefined

### Fixes Applied

**File:** `lib/ui/screen-components/protected/super-admin/earnings/view/main/index.tsx`

1. **Added Error Handling**:
   - Extracted `error` from `useQuery` hook
   - Added `errorPolicy: 'all'` for graceful error handling
   - Added `onError` callback for error logging
   - Kept `fetchPolicy: 'cache-and-network'`

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
- ✅ Handles multiple filters (userType, userId, orderType, paymentMethod)
- ✅ Handles date filtering (startingDate, endingDate)
- ✅ Handles search with debounced input
- ✅ Extracts data from response: `data?.earnings?.data?.earnings`
- ✅ Extracts grand total earnings: `data?.earnings?.data?.grandTotalEarnings`
- ✅ Handles pagination metadata: `data?.earnings?.pagination?.total`
- ✅ Now includes error handling

## Test Results

- ✅ Backend query structure is correct (requires pagination and authentication)
- ✅ GraphQL query structure is correct
- ✅ Frontend hook usage is correct (uses `useQuery` with variables)
- ✅ Query requires variables (correctly provided)

## Files Modified

1. **`lib/ui/screen-components/protected/super-admin/earnings/view/main/index.tsx`**
   - Added error handling and error state extraction
   - Added `errorPolicy` to query options
   - Added `onError` callback for error logging
   - Fixed search variable to use undefined instead of empty string
   - Improved refetch logic with all necessary variables
   - Added error message display in UI
   - Fixed useEffect dependencies

## Next Steps

1. **Deploy the fix** - The earnings component fix needs to be deployed
2. **Verify in browser** - After deployment, check:
   - Navigate to https://tifto-admin-web.onrender.com/wallet/earnings
   - Should see list of earnings (if any exist)
   - Check that pagination works correctly
   - Check that user type filtering works correctly
   - Check that order type filtering works correctly
   - Check that payment method filtering works correctly
   - Check that date filtering works correctly
   - Check that search works correctly
   - Check browser console for any errors
3. **Monitor** - Watch for any query errors

## Additional Notes

- The earnings query requires pagination variables: `pageSize` (Int!), `pageNo` (Int!)
- Optional variables: `userType` (UserTypeEnum), `userId` (String), `orderType` (OrderTypeEnum), `paymentMethod` (PaymentMethodEnum), `search` (String), `startingDate` (String), `endingDate` (String)
- The query returns paginated data with `data` object containing `earnings` array and `grandTotalEarnings` object
- The query requires authentication (handled by Apollo Client with auth headers)
- Error handling ensures users see feedback if the query fails
- The component shows skeleton data while loading
- The component supports pagination, multiple filters (userType, userId, orderType, paymentMethod), date filtering, and search
- Grand total earnings are extracted and passed to the header component for display
