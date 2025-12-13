# Vendors Page Fix

## Issue
The vendors page at `/general/vendors` was showing "No Data Available" even though the backend was returning vendor data.

## Root Cause
The `useQueryGQL` hook was being called incorrectly in the vendor context. The hook signature is:
```typescript
useQueryGQL(query, variables, options)
```

But it was being called as:
```typescript
useQueryGQL(query, options) // Missing variables parameter
```

## Fix Applied

### 1. Updated Vendor Context (`lib/context/super-admin/vendor.context.tsx`)
- Fixed the `useQueryGQL` call to include empty variables object `{}` as second parameter
- Added `errorPolicy: 'all'` to handle errors gracefully
- Added proper error handling with `onError` callback
- Improved data validation in `onCompleted` callback

### 2. Testing
The GraphQL query works correctly and returns 6 vendors:
```json
{
  "vendors": [
    {
      "unique_id": "6926ff88411dec930d6dc1e7",
      "_id": "6926ff88411dec930d6dc1e7",
      "email": "spicegardenrestaurant@mandsaur.test",
      "userType": null,
      "isActive": true,
      "name": "Spice Garden Restaurant Owner",
      "image": null,
      "restaurants": [...]
    },
    ...
  ]
}
```

## Verification
To verify the fix:
1. Navigate to https://tifto-admin-web.onrender.com/general/vendors
2. The page should now display the list of vendors
3. Check browser console for any errors

## Additional Notes
- The backend query doesn't require authentication (it's a public admin query)
- The query filters users by `role: 'seller'`
- The frontend properly handles empty results and shows "No Data Available" only when there are actually no vendors
