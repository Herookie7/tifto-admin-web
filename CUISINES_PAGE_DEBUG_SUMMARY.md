# Cuisines Page Debug Summary

## Issue
The cuisines page at `/management/cuisines` may be showing "No Data Available" or not displaying cuisines correctly.

## Investigation

### Backend Query Test
The `cuisines` query works correctly:
```bash
curl -X POST https://ftifto-backend.onrender.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { cuisines { _id name image } }"}'
```

**Result:** ✅ Returns 3 cuisines successfully

### Frontend Code Analysis

The component `CuisinesMain` uses:
- Query: `GET_CUISINES`
- Hook: `useLazyQueryQL` - **Called correctly with 2 parameters** ✅
- Variables: None (query doesn't require variables)

### Issues Found

1. **Missing Error Handling**: No error handling for failed queries - errors were silently ignored

2. **Missing Fetch Policy**: No explicit `fetchPolicy` set, which could cause caching issues

3. **Missing Debounce**: No debounce delay specified, which could cause rapid successive calls

4. **State Order Issue**: `isLoading` state was defined after the hook call, but `onCompleted` callback references it - this works but is not ideal

5. **Missing Error State**: Error state from hook wasn't being used

6. **useEffect Dependencies**: The `useEffect` for `isEditing.bool` included `data` in dependencies unnecessarily

7. **Missing Mutation Error Handling**: Delete mutation didn't have `onError` callback

### Fixes Applied

**File:** `lib/ui/screen-components/protected/super-admin/cuisines/view/main/index.tsx`

1. **Reordered State and Hook Declarations**:
   - Moved state declarations before hook call for better code organization
   - This ensures `isLoading` is available when `onCompleted` is called

2. **Added Error Handling**:
   - Extracted `error` from `useLazyQueryQL` hook
   - Added `useEffect` to handle errors and show toast notifications
   - Added error logging for debugging

3. **Improved Query Options**:
   - Added `fetchPolicy: 'network-only'` for fresh data
   - Added `debounceMs: 300` for better responsiveness
   - Added logging on successful data load

4. **Fixed useEffect Dependencies**:
   - Removed `data` from `isEditing.bool` effect dependencies
   - Added `setVisible` to dependencies
   - Added eslint-disable comment for mount-only effect

5. **Added Mutation Error Handling**:
   - Added `onError` callback to delete mutation
   - Provides better user feedback on deletion failures

## Code Structure

The component correctly:
- ✅ Uses `useLazyQueryQL` with proper parameters (query, options)
- ✅ Calls `fetch()` on component mount via `onFetchCuisines()`
- ✅ Handles loading state with skeleton/dummy data
- ✅ Extracts data from response: `data?.cuisines`
- ✅ Handles delete mutations with refetch

## Test Results

- ✅ Backend query works (returns 3 cuisines)
- ✅ GraphQL query structure is correct
- ✅ Frontend hook usage is correct
- ✅ Query doesn't require variables (correctly omitted)

## Files Modified

1. **`lib/ui/screen-components/protected/super-admin/cuisines/view/main/index.tsx`**
   - Reordered state and hook declarations
   - Added error handling and error state extraction
   - Added `fetchPolicy` and `debounceMs` to query options
   - Improved loading state management
   - Added error logging and user feedback
   - Fixed useEffect dependencies
   - Added mutation error handling

## Next Steps

1. **Deploy the fix** - The cuisines component fix needs to be deployed
2. **Verify in browser** - After deployment, check:
   - Navigate to https://tifto-admin-web.onrender.com/management/cuisines
   - Should see list of cuisines (currently 3 cuisines in database)
   - Check that loading state works correctly
   - Check browser console for any errors
3. **Monitor** - Watch for any query errors

## Additional Notes

- The cuisines query doesn't require any variables
- The query returns: `_id`, `name`, `description`, `image`, `shopType`
- The component uses lazy query (manual fetch) instead of automatic query
- Error handling ensures users see feedback if the query fails
- The component shows dummy/skeleton data while loading
- Delete mutation now has proper error handling
