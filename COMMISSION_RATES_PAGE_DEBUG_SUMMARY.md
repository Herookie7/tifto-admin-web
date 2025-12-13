# Commission Rates Page Debug Summary

## Issue
The commission rates page at `/management/commission-rates` may be showing "No Data Available" or not displaying restaurants correctly.

## Investigation

### Backend Query Test
The page uses `GET_RESTAURANTS` query (not a separate commission rates query):
```bash
curl -X POST https://ftifto-backend.onrender.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { restaurants { _id name commissionRate commissionType } }"}'
```

**Note:** The page displays restaurants with their commission rates, not a separate commission rates entity.

### Frontend Code Analysis

The component `CommissionRateMain` uses:
- Query: `GET_RESTAURANTS`
- Hook: `useQueryGQL` - **Called incorrectly with 2 parameters instead of 3** ❌
- Variables: None (query doesn't require variables)

### Issues Found

1. **Incorrect `useQueryGQL` Call**: The hook was called with only 2 parameters (query, options) instead of the required 3 (query, variables, options):
   ```typescript
   // BEFORE (WRONG):
   const { data, error, refetch, loading } = useQueryGQL(GET_RESTAURANTS, {
     fetchPolicy: 'network-only',
   });
   
   // AFTER (CORRECT):
   const { data, error, refetch, loading } = useQueryGQL(
     GET_RESTAURANTS,
     {}, // Empty variables object (required parameter)
     {   // options
       fetchPolicy: 'network-only',
       errorPolicy: 'all',
       onError: (error) => { ... },
     }
   );
   ```

2. **Missing Error Handling**: No `errorPolicy` or `onError` callback in query options

3. **Missing useEffect Dependencies**: The `useEffect` hook was missing `showToast` and `t` in dependencies

4. **Missing Mutation Error Handling**: Mutation didn't have error logging

### Fixes Applied

**File:** `lib/ui/screen-components/protected/super-admin/commission-rate/view/main/index.tsx`

1. **Fixed `useQueryGQL` Call**:
   - Added empty `{}` as the `variables` parameter (required)
   - Moved options to the third parameter
   - Added `errorPolicy: 'all'` for graceful error handling
   - Added `onError` callback for error logging

2. **Improved Error Handling in useEffect**:
   - Added error message extraction from error object
   - Added missing dependencies (`showToast`, `t`) to useEffect
   - Improved error logging

3. **Added Mutation Error Handling**:
   - Added `onError` callback to mutation options
   - Added error logging for debugging

## Code Structure

The component correctly:
- ✅ Uses `GET_RESTAURANTS` query to fetch restaurants with commission rates
- ✅ Handles loading state with skeleton/dummy data
- ✅ Extracts data from response: `data?.restaurants`
- ✅ Allows editing commission rates inline in the table
- ✅ Handles commission rate updates with mutations
- ✅ Filters restaurants by name and commission rate ranges
- ✅ Now correctly calls `useQueryGQL` with 3 parameters

## Test Results

- ✅ Backend query works (returns restaurants with commission rates)
- ✅ GraphQL query structure is correct
- ✅ Frontend hook usage is now correct (fixed to use 3 parameters)
- ✅ Query doesn't require variables (correctly using empty object)

## Files Modified

1. **`lib/ui/screen-components/protected/super-admin/commission-rate/view/main/index.tsx`**
   - Fixed `useQueryGQL` call to use correct 3-parameter signature
   - Added error handling and error state extraction
   - Added `errorPolicy` to query options
   - Fixed useEffect dependencies
   - Added mutation error handling
   - Improved error logging

## Next Steps

1. **Deploy the fix** - The commission rates component fix needs to be deployed
2. **Verify in browser** - After deployment, check:
   - Navigate to https://tifto-admin-web.onrender.com/management/commission-rates
   - Should see list of restaurants with their commission rates
   - Check that commission rates can be edited inline
   - Check browser console for any errors
3. **Monitor** - Watch for any query errors

## Additional Notes

- The commission rates page displays restaurants (not a separate commission rates entity)
- Each restaurant has `commissionRate` and `commissionType` (percentage or fixed)
- The page allows inline editing of commission rates
- Commission rates can be filtered by ranges (>5%, >10%, >20%)
- The query doesn't require any variables
- Error handling ensures users see feedback if the query fails
- The component shows dummy/skeleton data while loading
