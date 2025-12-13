# Admin Product Access Fix

## Issue
Admin users were unable to add products to restaurants from the admin panel (`/admin/store/product-management/food`). The error was "Restaurant not found or access denied".

## Root Cause Analysis

### How Products Are Fetched
The page uses the `GET_FOODS_BY_RESTAURANT_ID` query which calls:
```graphql
query Restaurant($id: String) {
  restaurant(id: $id) {
    categories {
      foods {
        _id
        title
        ...
      }
    }
  }
}
```

**Key Finding**: Products are returned through categories. Only products that are in a category's `foods` array will appear on this page and in the customer app.

### Why Products Appear in Customer App
The customer app uses `fetchCategoryDetailsByStoreIdForMobile` which:
1. Finds categories with `isActive: true`
2. Populates `foods` from the category's `foods` array
3. Only returns products that are in the category's `foods` array

**This is why only "Paneer Butter Masala" appears** - it's the only product in the "Main Course" category's `foods` array.

### Why Admin Can't Add Products
The backend mutations (`createProduct`, `updateProduct`, `deleteProduct`) were checking:
```javascript
const restaurant = await Restaurant.findOne({ 
  _id: restaurantId,
  owner: context.user._id  // ❌ This fails for admin users
});
```

Admin users have `role: 'admin'` but are not the owners of restaurants, so this check always failed.

## Solution

Updated all product and category mutations to allow admin access, following the same pattern used in `updateCommission`:

```javascript
// Check if user is admin or restaurant owner
const isAdmin = context.user.role === 'admin';

const restaurant = await Restaurant.findById(restaurantId);
if (!restaurant) {
  throw new Error('Restaurant not found');
}

// If not admin, check if user is the owner
if (!isAdmin) {
  if (restaurant.owner.toString() !== context.user._id.toString()) {
    throw new Error('Access denied');
  }
}
```

## Changes Made

### Backend (`ftifto-backend/src/graphql/resolvers.js`)

1. **`createProduct` mutation**:
   - Added admin role check
   - Allows admin users to create products for any restaurant

2. **`updateProduct` mutation**:
   - Added admin role check
   - Allows admin users to update products for any restaurant

3. **`deleteProduct` mutation**:
   - Added admin role check
   - Allows admin users to delete products from any restaurant

4. **`createCategory` mutation**:
   - Added admin role check
   - Allows admin users to create categories for any restaurant

5. **`updateCategory` mutation**:
   - Added admin role check
   - Allows admin users to update categories for any restaurant

6. **`deleteCategory` mutation**:
   - Added admin role check
   - Allows admin users to delete categories from any restaurant

## Testing with curl

### Test Query (No Auth Required)
```bash
curl -X POST https://ftifto-backend.onrender.com/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { restaurant(id: \"6926ff88411dec930d6dc1ea\") { _id categories { _id title foods { _id title } } } }"
  }'
```

**Result**: Returns only products in category's `foods` array (Paneer Butter Masala)

### Test Mutation (Requires Admin Auth)
```bash
curl -X POST https://ftifto-backend.onrender.com/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "query": "mutation { createProduct(restaurantId: \"6926ff88411dec930d6dc1ea\", categoryId: \"6926ff88411dec930d6dc1ed\", productInput: { title: \"Test Product\", price: 100, isActive: true, available: true }) { _id title } }"
  }'
```

**Expected**: Should now work for admin users (previously would fail with "Restaurant not found or access denied")

## Why Products Don't Show in Customer App

Products need to be in a category's `foods` array to appear. When creating a product:
1. If `categoryId` is provided, the product is automatically added to that category's `foods` array
2. If `categoryId` is not provided, the product is created but not linked to any category
3. Products without category links won't appear in the customer app menu

## Fixing Existing Products

For existing products that aren't showing:
1. **Option 1**: Edit each product and select a category, then save (the `updateProduct` mutation now handles category updates)
2. **Option 2**: Manually add products to categories in the database:
   ```javascript
   // MongoDB example
   await Category.updateOne(
     { _id: categoryId },
     { $push: { foods: productId } }
   );
   ```

## Summary

- ✅ Admin users can now create/update/delete products for any restaurant
- ✅ Admin users can now create/update/delete categories for any restaurant
- ✅ Products must be in a category's `foods` array to appear in customer app
- ✅ The form now properly links products to categories when created/updated
- ✅ All mutations follow the same admin access pattern as `updateCommission`
