# Stores Page Debug Summary

## Issue
The stores page at `/general/stores` may be showing "No Data Available" or not displaying restaurants correctly.

## Investigation

### Backend Query Test
The `restaurantsPaginated` query works correctly:
```bash
curl -X POST https://ftifto-backend.onrender.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { restaurantsPaginated(filters: { page: 1, limit: 10 }) { data { _id name } total page limit totalPages } }"}'
```

**Result:** ✅ Returns 6 restaurants successfully
- Total restaurants: 6
- Restaurants in page: 6
- Page: 1
- Total pages: 1

### Frontend Code Analysis

The component `RestaurantsMain` uses:
- Query: `GET_RESTAURANTS_PAGINATED` or `GET_CLONED_RESTAURANTS_PAGINATED` (based on currentTab)
- Hook: `useQueryGQL` - **Called correctly with 3 parameters** ✅
- Variables: `{ filters: { page, limit, search } }`

### Fixes Applied

1. **Added Error Handling** (`lib/ui/screen-components/protected/super-admin/restaurants/view/main/index.tsx`):
   - Added `errorPolicy: 'all'` for graceful error handling
   - Added `onError` callback to show toast notifications
   - Added error logging in useEffect for debugging

2. **Improved Debugging**:
   - Enhanced useEffect to log query state
   - Added error information to console logs

## Code Structure

The component correctly:
- ✅ Uses `useQueryGQL` with proper parameters (query, variables, options)
- ✅ Handles pagination with `currentPage` and `rowsPerPage` state
- ✅ Uses debounced search to avoid excessive API calls
- ✅ Extracts data from response: `data?.restaurantsPaginated?.data`
- ✅ Handles loading state with dummy data

## Potential Issues

1. **Tab Switching**: The component switches between 'Actual' and 'Cloned' restaurants based on `currentTab`. If `currentTab` is not set correctly, it might query the wrong endpoint.

2. **Data Structure**: The component expects:
   ```typescript
   data?.restaurantsPaginated?.data  // for Actual tab
   data?.getClonedRestaurantsPaginated?.data  // for Cloned tab
   ```

3. **Initial State**: If `currentTab` is undefined or not 'Actual', it will query `GET_CLONED_RESTAURANTS_PAGINATED` which might return empty results.

## Verification Steps

1. Check browser console for:
   - Query errors
   - Data structure logs
   - Loading state

2. Verify `currentTab` value in RestaurantsContext:
   - Should be 'Actual' by default
   - Check RestaurantsContext initialization

3. Test both queries:
   - `restaurantsPaginated` (Actual tab)
   - `getClonedRestaurantsPaginated` (Cloned tab)

## Files Modified

1. **`lib/ui/screen-components/protected/super-admin/restaurants/view/main/index.tsx`**
   - Added error handling
   - Added error logging
   - Improved debugging

## Next Steps

1. **Check RestaurantsContext**: Verify `currentTab` is initialized correctly
2. **Test in Browser**: Check console for errors and data structure
3. **Verify Tab State**: Ensure the correct tab is selected when page loads

## Test Results

- ✅ Backend query works (returns 6 restaurants)
- ✅ GraphQL query structure is correct
- ✅ Frontend hook usage is correct
- ⚠️ Need to verify RestaurantsContext initialization
