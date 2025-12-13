# Store Timing Page Debug Summary

## Issue
The store timing page at `/admin/store/general/timing` may not be displaying timing data correctly or showing errors.

## Investigation

### Backend Query Test
The `restaurant` query requires:
- `id` parameter (String) - restaurant ID
- Authentication (returns error without auth)
- Returns restaurant with `openingTimes` array containing day and time slots

**Note:** The backend requires authentication and a valid restaurant ID, so direct curl testing without auth tokens will fail.

### Frontend Code Analysis

The timing page uses:
- **Component**: `TimingAddForm` in `timing/add-form/index.tsx`
- **Query**: `GET_RESTAURANT_PROFILE`
- **Hook**: `useQuery` from Apollo Client (not `useQueryGQL`)
- **Variables**: Required - `id` (restaurantId from context)
- **Query structure**: `restaurant(id: $id) { openingTimes { day, times { startTime, endTime } } }`

### Issues Found

1. **Missing Error Policy**: No `errorPolicy` set in query
   - Query might fail silently without proper error handling
   - Added `errorPolicy: 'all'` for graceful error handling

2. **Missing Error State Extraction**: Error state not being extracted from query result
   - No `error` extracted from `useQuery`
   - Error handling callback exists but error state not used

3. **Missing Error Display**: No error message shown to users when query fails
   - Users might see empty form but don't know why

4. **Missing Skip Condition**: Query might run even when `restaurantId` is empty
   - Added `skip: !restaurantId` to prevent unnecessary queries

5. **Incomplete Error Logging**: Error logging was minimal
   - Enhanced error logging for better debugging

### Fixes Applied

**File:** `lib/ui/screen-components/protected/restaurant/timing/add-form/index.tsx`

1. **Added Error Handling**:
   - Extracted `error` from `useQuery` hook
   - Added `errorPolicy: 'all'` for graceful error handling
   - Added `skip: !restaurantId` to prevent queries when restaurantId is missing
   - Added `onError` callback for error logging

2. **Added Error Display**:
   - Added error check before rendering form
   - Added error display UI with user-friendly message

## Code Structure

The timing component correctly:
- ✅ Uses `useQuery` with proper variables
- ✅ Handles restaurant ID from context
- ✅ Transforms time format from `["HH","MM"]` to `'HH:MM'` string
- ✅ Handles form submission with mutation
- ✅ Shows loading state while fetching
- ✅ Now includes error handling and error display

## Data Flow

1. Component gets `restaurantId` from `RestaurantLayoutContext`
2. Query fetches restaurant data with `GET_RESTAURANT_PROFILE`
3. `openingTimes` array is transformed:
   - Backend format: `{ day: string, times: [{ startTime: ["HH","MM"], endTime: ["HH","MM"] }] }`
   - Frontend format: `{ day: TWeekDays, times: [{ startTime: "HH:MM", endTime: "HH:MM" }] }`
4. Form displays timing data with toggles and time inputs
5. On submit, data is formatted back and sent via `UPDATE_TIMINGS` mutation

## Test Results

- ✅ Backend query structure is correct (requires restaurant ID and authentication)
- ✅ GraphQL query structure is correct
- ✅ Frontend hook usage is correct (uses `useQuery` with variables)
- ✅ Query requires variables (correctly provided from context)
- ✅ Error handling is now implemented

## Files Modified

1. **`lib/ui/screen-components/protected/restaurant/timing/add-form/index.tsx`**
   - Added error handling and error state extraction
   - Added `errorPolicy` to query options
   - Added `skip` condition for restaurantId
   - Added `onError` callback for error logging
   - Added error display in UI

## Next Steps

1. **Deploy the fix** - The timing component fix needs to be deployed
2. **Verify in browser** - After deployment, check:
   - Navigate to https://tifto-admin-web.onrender.com/admin/store/general/timing
   - Should see timing form with days of the week and time slots
   - Should be able to toggle days on/off
   - Should be able to add/remove time slots
   - Should be able to save timing changes
   - If error occurs, should see error message instead of empty form
   - Check browser console for any errors
   - Verify that restaurant ID is available in context
3. **Monitor** - Watch for any query errors

## Additional Notes

- The timing query requires `restaurantId` from context
- The query requires authentication (handled by Apollo Client with auth headers)
- Error handling ensures users see feedback if the query fails
- The component shows form while loading (with disabled state)
- The component supports:
  - Toggling days on/off (closed all day vs open)
  - Adding multiple time slots per day
  - Removing time slots (except the first one)
  - Saving timing changes via mutation
- Time format conversion:
  - Backend expects: `["HH","MM"]` array format
  - Frontend displays: `"HH:MM"` string format
  - Conversion happens in both directions (fetch and submit)

## Potential Issues to Check

1. **Restaurant ID Availability**: Ensure `restaurantId` is available in `RestaurantLayoutContext`
   - If `restaurantId` is empty, the query will be skipped (`skip: !restaurantId`)
   - Check that the user is logged in as a restaurant admin
   - Check that the restaurant profile is set up

2. **Authentication**: Ensure user is authenticated
   - Check that auth token is present
   - Check that user has restaurant admin role

3. **Data Structure**: Verify backend returns expected structure
   - Check that `restaurant.openingTimes` exists
   - Check that `openingTimes[].day` and `openingTimes[].times` exist
   - Check that `times[].startTime` and `times[].endTime` are in `["HH","MM"]` format

4. **Time Format**: Verify time format conversion
   - Backend returns time as `["HH","MM"]` array
   - Frontend converts to `"HH:MM"` string for display
   - Frontend converts back to array format on submit
