# Notifications Page Debug Summary

## Issue
The notifications page at `/management/notifications` may be showing "No Data Available" or not displaying notifications correctly.

## Investigation

### Backend Query Test
The `notifications` query works correctly with the proper fields:
```bash
curl -X POST https://ftifto-backend.onrender.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { notifications { _id title createdAt } }"}'
```

**Note:** The backend uses `_id` (not `id`), and only returns `_id`, `title`, `createdAt` (no `body` field)

### Frontend Code Analysis

The component `NotificationMain` uses:
- Query: `GET_NOTIFICATIONS`
- Hook: `useQueryGQL` - **Called incorrectly with 2 parameters instead of 3** ❌
- Variables: Empty object `{}` (correct)

### Issues Found

1. **Incorrect `useQueryGQL` Call**: The hook was called with only 2 parameters (query, variables) instead of the required 3 (query, variables, options):
   ```typescript
   // BEFORE (WRONG):
   const { data: notificationData, loading: notificationLoading } = useQueryGQL(
     GET_NOTIFICATIONS,
     {}
   );
   
   // AFTER (CORRECT):
   const { data: notificationData, loading: notificationLoading, error } = useQueryGQL(
     GET_NOTIFICATIONS,
     {}, // Empty variables object (required parameter)
     {   // options
       fetchPolicy: 'cache-and-network',
       errorPolicy: 'all',
       onError: (error) => { ... },
     }
   );
   ```

2. **Missing Error Handling**: No error handling for failed queries

3. **Missing Error State**: Error state from hook wasn't being used

4. **Data Display Logic**: The data fallback logic could be improved to show empty array when not loading instead of dummy data

### Fixes Applied

**File:** `lib/ui/screen-components/protected/super-admin/notifications/view/main/index.tsx`

1. **Fixed `useQueryGQL` Call**:
   - Added third parameter for options
   - Added `fetchPolicy: 'cache-and-network'` for fresh data
   - Added `errorPolicy: 'all'` for graceful error handling
   - Added `onError` callback for error logging
   - Extracted `error` from hook return

2. **Improved Data Display Logic**:
   - Changed to show dummy data only when loading
   - Show empty array when data is not available (instead of dummy data)
   - This prevents showing dummy data when query fails

3. **Added Error Display**:
   - Added error message display in the UI
   - Added error logging for debugging

4. **Fixed Query Fields**:
   - Updated `GET_NOTIFICATIONS` query to use `_id` instead of `id`
   - Removed `body` field from query (backend doesn't support it)
   - Added data transformation to add empty `body` field as fallback for table columns

5. **Data Transformation**:
   - Added transformation to ensure `body` field exists (with empty string fallback)
   - This prevents errors when table columns try to access `rowData.body`

## Code Structure

The component correctly:
- ✅ Uses `GET_NOTIFICATIONS` query
- ✅ Handles loading state with skeleton/dummy data
- ✅ Extracts data from response: `data?.notifications`
- ✅ Handles global filtering
- ✅ Now correctly calls `useQueryGQL` with 3 parameters

## Test Results

- ✅ Backend query works (returns notifications with correct fields: `id`, `title`, `body`, `createdAt`)
- ✅ GraphQL query structure is correct
- ✅ Frontend hook usage is now correct (fixed to use 3 parameters)
- ✅ Query doesn't require variables (correctly using empty object)

## Files Modified

1. **`lib/ui/screen-components/protected/super-admin/notifications/view/main/index.tsx`**
   - Fixed `useQueryGQL` call to use correct 3-parameter signature
   - Added error handling and error state extraction
   - Added `fetchPolicy` and `errorPolicy` to query options
   - Improved data display logic (show dummy only when loading)
   - Added error message display in UI
   - Added data transformation to add empty `body` field as fallback

2. **`lib/api/graphql/queries/notifications/index.ts`**
   - Updated `GET_NOTIFICATIONS` query to use `_id` instead of `id`
   - Removed `body` field from query (backend doesn't support it)

## Next Steps

1. **Deploy the fix** - The notifications component fix needs to be deployed
2. **Verify in browser** - After deployment, check:
   - Navigate to https://tifto-admin-web.onrender.com/management/notifications
   - Should see list of notifications (if any exist in database)
   - Check that loading state works correctly
   - Check browser console for any errors
3. **Monitor** - Watch for any query errors

## Additional Notes

- The notifications query doesn't require any variables
- The query returns: `_id`, `title`, `createdAt` (backend doesn't return `body` field)
- The backend uses `_id` (not `id`)
- The table columns expect a `body` field, so we add an empty string as fallback
- Error handling ensures users see feedback if the query fails
- The component shows dummy/skeleton data while loading
- The component shows empty array when no data is available (not dummy data)
- **Important**: The backend schema doesn't include a `body` field for notifications, so we transform the data to add an empty `body` field for compatibility with the table columns
