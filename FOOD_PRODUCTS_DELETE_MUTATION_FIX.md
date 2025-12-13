# Food Products Delete Mutation Fix

## Issue
The food products page was showing a GraphQL error:
```
GraphQL Error: Cannot query field "deleteFood" on type "Mutation". 
Did you mean "deleteCoupon", "deleteProduct", or "deleteRider"?
```

## Root Cause
The frontend mutation was using the wrong mutation name and parameters:
- **Frontend was using**: `deleteFood(id: $id, restaurant: $restaurant, categoryId: $categoryId)`
- **Backend expects**: `deleteProduct(id: ID!)` - returns `Boolean`

The backend mutation:
- Only accepts `id` parameter (ID!)
- Returns a Boolean (not an object)
- Does not accept `restaurant` or `categoryId` parameters

## Fix Applied

**File:** `lib/api/graphql/mutations/food/index.ts`

1. **Updated Mutation Name**:
   - Changed from `deleteFood` to `deleteProduct`

2. **Updated Mutation Parameters**:
   - Removed `$restaurant: String!` parameter
   - Removed `$categoryId: String!` parameter
   - Kept only `$id: ID!` parameter

3. **Updated Return Type**:
   - Removed `{ _id }` selection (mutation returns Boolean, not an object)

**File:** `lib/ui/screen-components/protected/restaurant/food/view/main/index.tsx`

1. **Updated Mutation Call**:
   - Changed from `variables: { ...deleteId, restaurant: restaurantId }`
   - To `variables: { id: deleteId.id }`
   - Removed `restaurant` and `categoryId` from mutation variables

2. **Added Error Handling**:
   - Added `onError` callback to mutation
   - Added error toast notification
   - Added error logging with `console.error`

**File:** `lib/ui/screen-components/protected/restaurant/food/view/main/index.tsx`

1. **Updated Mutation Call**:
   - Changed from `variables: { ...deleteId, restaurant: restaurantId }`
   - To `variables: { id: deleteId.id }`
   - Removed `restaurant` and `categoryId` from mutation variables

## Backend Schema Reference

From `ftifto-backend/src/graphql/schema.js`:
```graphql
deleteProduct(id: ID!): Boolean
```

From `ftifto-backend/src/graphql/resolvers.js`:
```javascript
async deleteProduct(_, { id }, context) {
  // Only uses id parameter
  // Returns true on success
}
```

## Test Results

- ✅ Mutation name corrected: `deleteFood` → `deleteProduct`
- ✅ Parameters corrected: Only `id` is now passed
- ✅ Return type corrected: No selection needed (returns Boolean)
- ✅ Mutation call updated: Only passes `id` variable

## Files Modified

1. **`lib/api/graphql/mutations/food/index.ts`**
   - Updated `DELETE_FOOD` mutation to use `deleteProduct` with correct signature

2. **`lib/ui/screen-components/protected/restaurant/food/view/main/index.tsx`**
   - Updated mutation call to only pass `id` variable
   - Added `onError` callback for error handling
   - Added error toast notification

## Next Steps

1. **Deploy the fix** - The mutation fix needs to be deployed
2. **Verify in browser** - After deployment, check:
   - Navigate to https://tifto-admin-web.onrender.com/admin/store/product-management/food
   - Try deleting a food product
   - Should not see GraphQL error about "deleteFood"
   - Should see success toast when deletion succeeds
   - Check browser console for any errors
3. **Monitor** - Watch for any mutation errors

## Additional Notes

- The `deleteId` state still contains both `id` and `categoryId` for compatibility
- Only `id` is now passed to the mutation
- The backend automatically handles category cleanup (removes product from all categories)
- The mutation requires authentication (handled by Apollo Client with auth headers)
- The mutation returns a Boolean, so no data selection is needed in the GraphQL query
