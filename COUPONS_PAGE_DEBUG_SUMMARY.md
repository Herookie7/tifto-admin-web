# Coupons Page Debug Summary

## Issue
The coupons page at `/management/coupons` may be showing "No Data Available" or not displaying coupons correctly.

## Investigation

### Backend Query Test
The `coupons` query works correctly:
```bash
curl -X POST https://ftifto-backend.onrender.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { coupons { _id title code discount enabled } }"}'
```

**Result:** ✅ Returns 1 coupon successfully

### Frontend Code Analysis

The component `CouponsMain` uses:
- Query: `GET_COUPONS`
- Hook: `useLazyQueryQL` - **Called correctly with 2 parameters** ✅
- Variables: None (query doesn't require variables)

### Issues Found

1. **Excessive Debounce Delay**: The `debounceMs` was set to 5000ms (5 seconds), which causes a significant delay before the query executes:
   ```typescript
   // BEFORE:
   debounceMs: 5000, // 5 seconds delay
   
   // AFTER:
   debounceMs: 300, // 300ms delay (standard)
   ```

2. **Missing Error Handling**: No error handling for failed queries - errors were silently ignored

3. **Loading State Order**: Loading state was set after fetch call, which could cause race conditions

4. **Missing Error State**: Error state from hook wasn't being used

### Fixes Applied

**File:** `lib/ui/screen-components/protected/super-admin/coupons/view/main/index.tsx`

1. **Reduced Debounce Delay**:
   - Changed `debounceMs` from 5000ms to 300ms for better responsiveness
   - This significantly improves the user experience

2. **Added Error Handling**:
   - Extracted `error` from `useLazyQueryQL` hook
   - Added `useEffect` to handle errors and show toast notifications
   - Added error logging for debugging

3. **Improved Loading State**:
   - Set loading state before calling fetch to ensure proper UI feedback
   - Added logging on successful data load

4. **Fixed useEffect Dependencies**:
   - Fixed dependency array for `isEditing.bool` effect
   - Added eslint-disable comment for mount-only effect

## Code Structure

The component correctly:
- ✅ Uses `useLazyQueryQL` with proper parameters (query, options)
- ✅ Calls `fetch()` on component mount
- ✅ Handles loading state with skeleton/dummy data
- ✅ Extracts data from response: `data?.coupons`
- ✅ Handles delete mutations with refetch

## Test Results

- ✅ Backend query works (returns 1 coupon)
- ✅ GraphQL query structure is correct
- ✅ Frontend hook usage is correct
- ✅ Query doesn't require variables (correctly omitted)

## Files Modified

1. **`lib/ui/screen-components/protected/super-admin/coupons/view/main/index.tsx`**
   - Reduced debounce delay from 5000ms to 300ms
   - Added error handling and error state extraction
   - Improved loading state management
   - Added error logging and user feedback
   - Fixed useEffect dependencies

## Next Steps

1. **Deploy the fix** - The coupons component fix needs to be deployed
2. **Verify in browser** - After deployment, check:
   - Navigate to https://tifto-admin-web.onrender.com/management/coupons
   - Should see list of coupons (currently 1 coupon in database)
   - Check that loading state works correctly
   - Check browser console for any errors
3. **Monitor** - Watch for any query errors

## Additional Notes

- The coupons query doesn't require any variables
- The query returns: `_id`, `title`, `code`, `discount`, `enabled`
- The component uses lazy query (manual fetch) instead of automatic query
- The debounce delay fix will make the page load much faster (from 5 seconds to 300ms)
- Error handling ensures users see feedback if the query fails
- The component shows dummy/skeleton data while loading
