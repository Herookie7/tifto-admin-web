# Tifto Admin - GraphQL API Documentation for Postman

## Base URL
- **GraphQL Endpoint**: `https://tifto-backend.onrender.com/graphql`
- **WebSocket Endpoint**: `wss://tifto-backend.onrender.com/graphql`

## Authentication
All requests (except login) require an Authorization header:
```
Authorization: Bearer <your_token>
```

Get token from `ownerLogin` mutation.

---

## 🚀 QUICK START - POSTMAN SETUP

### Method 1: Using Postman's GraphQL Body Type (Recommended)

1. **Create a new POST request**
2. **URL**: `https://tifto-backend.onrender.com/graphql`
3. **Body Tab** → Select **"GraphQL"** (not JSON or raw)
4. **Query Section**: Paste your GraphQL query/mutation
5. **Variables Section**: Paste your variables as JSON

**Example for Owner Login:**

**Query Section:**
```graphql
mutation ownerLogin($email: String!, $password: String!) {
  ownerLogin(email: $email, password: $password) {
    userId
    token
    email
    userType
    restaurants {
      _id
      orderId
      name
      image
      address
    }
    permissions
    userTypeId
    image
    name
  }
}
```

**Variables Section:**
```json
{
  "email": "herookie@tensi.org",
  "password": "9827453137"
}
```

### Method 2: Using Raw JSON Body (Alternative)

If Postman doesn't have GraphQL body type, use **Body → raw → JSON**:

**Request Body:**
```json
{
  "query": "mutation ownerLogin($email: String!, $password: String!) { ownerLogin(email: $email, password: $password) { userId token email userType restaurants { _id orderId name image address } permissions userTypeId image name } }",
  "variables": {
    "email": "herookie@tensi.org",
    "password": "9827453137"
  }
}
```

**Important**: 
- Remove all line breaks from the query string when using JSON format
- The query must be a single string (no newlines)
- Use `\n` for line breaks if needed, but single line is safer

### Method 3: Using Formatted JSON (Easier to Read)

**Request Body:**
```json
{
  "query": "mutation ownerLogin($email: String!, $password: String!) { ownerLogin(email: $email, password: $password) { userId token email userType restaurants { _id orderId name image address } permissions userTypeId image name } }",
  "variables": {
    "email": "herookie@tensi.org",
    "password": "9827453137"
  }
}
```

**Headers Required:**
```
Content-Type: application/json
```

---

## 📋 TABLE OF CONTENTS

1. [Authentication](#authentication)
2. [Dashboard Queries](#dashboard-queries)
3. [User Management](#user-management)
4. [Vendor Management](#vendor-management)
5. [Restaurant Management](#restaurant-management)
6. [Order Management](#order-management)
7. [Food & Category Management](#food--category-management)
8. [Rider Management](#rider-management)
9. [Configuration](#configuration)
10. [Notifications](#notifications)
11. [Support Tickets](#support-tickets)
12. [Financial](#financial)
13. [Subscriptions](#subscriptions)

---

## 🔐 AUTHENTICATION

### 1. Owner Login
**Type**: Mutation  
**Operation**: `ownerLogin`  
**Note**: This is the correct mutation for admin/owner login. It accepts `email` and `password` as direct arguments and returns `OwnerLoginResponse` with full user details.

**Postman Setup:**
- **Method**: POST
- **URL**: `https://tifto-backend.onrender.com/graphql`
- **Body Type**: GraphQL (or Raw JSON)
- **Headers**: `Content-Type: application/json` (if using raw JSON)

**Option A: Using Postman's GraphQL Body Type**

**Query:**
```graphql
mutation ownerLogin($email: String!, $password: String!) {
  ownerLogin(email: $email, password: $password) {
    userId
    token
    email
    userType
    restaurants {
      _id
      orderId
      name
      image
      address
    }
    permissions
    userTypeId
    image
    name
  }
}
```

**Variables:**
```json
{
  "email": "herookie@tensi.org",
  "password": "9827453137"
}
```

**Option B: Using Raw JSON Body**

**Body (Raw JSON):**
```json
{
  "query": "mutation ownerLogin($email: String!, $password: String!) { ownerLogin(email: $email, password: $password) { userId token email userType restaurants { _id orderId name image address } permissions userTypeId image name } }",
  "variables": {
    "email": "herookie@tensi.org",
    "password": "9827453137"
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "ownerLogin": {
      "userId": "...",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "email": "herookie@tensi.org",
      "userType": "ADMIN",
      "restaurants": [...],
      "permissions": [...],
      "userTypeId": "...",
      "image": "...",
      "name": "Admin Name"
    }
  }
}
```

**Note**: If you get "response.status is not a function" error, this is a backend issue. The mutation format is correct. Try again or check backend logs.

**⚠️ Common Error Fix:**
If you get "GraphQL operations must contain a non-empty `query`":
- Make sure you're using **Body → GraphQL** type, OR
- If using Raw JSON, ensure the `query` field is a single-line string (no actual line breaks)
- Check that `Content-Type: application/json` header is set

---

## 📊 DASHBOARD QUERIES

### 2. Get Dashboard Users
**Type**: Query  
**Operation**: `getDashboardUsers`

**Variables**: None

**GraphQL Query**:
```graphql
query GetDashboardUsers {
  getDashboardUsers {
    usersCount
    vendorsCount
    restaurantsCount
    ridersCount
  }
}
```

### 3. Get Dashboard Users By Year
**Type**: Query  
**Operation**: `getDashboardUsersByYear`

**Variables**:
```json
{
  "year": 2024
}
```

### 4. Get Dashboard Orders By Type
**Type**: Query  
**Operation**: `getDashboardOrdersByType`

**Variables**: None

### 5. Get Dashboard Sales By Type
**Type**: Query  
**Operation**: `getDashboardSalesByType`

**Variables**: None

### 6. Get Restaurant Dashboard Orders
**Type**: Query  
**Operation**: `getRestaurantDashboardOrdersSalesStats`

**Variables**:
```json
{
  "restaurant": "restaurant_id",
  "starting_date": "2024-01-01",
  "ending_date": "2024-12-31",
  "dateKeyword": "year"
}
```

### 7. Get Vendor Dashboard Stats
**Type**: Query  
**Operation**: `getVendorDashboardStatsCardDetails`

**Variables**:
```json
{
  "vendorId": "vendor_id",
  "dateKeyword": "year",
  "starting_date": "2024-01-01",
  "ending_date": "2024-12-31"
}
```

### 8. Get Vendor Live Monitor
**Type**: Query  
**Operation**: `getLiveMonitorData`

**Variables**:
```json
{
  "id": "vendor_id",
  "dateKeyword": "today",
  "starting_date": "2024-01-01",
  "ending_date": "2024-12-31"
}
```

---

## 👥 USER MANAGEMENT

### 9. Get All Users
**Type**: Query  
**Operation**: `users`

**Variables**: None

**GraphQL Query**:
```graphql
query users {
  users {
    _id
    name
    email
    phone
    createdAt
    userType
    status
    lastLogin
    notes
    addresses {
      location {
        coordinates
      }
      deliveryAddress
    }
  }
}
```

### 10. Get User By ID
**Type**: Query  
**Operation**: `user`

**Variables**:
```json
{
  "userId": "user_id"
}
```

### 11. Update User Status
**Type**: Mutation  
**Operation**: `updateUserStatus`

**Variables**:
```json
{
  "id": "user_id",
  "status": "active"
}
```

### 12. Update User Notes
**Type**: Mutation  
**Operation**: `updateUserNotes`

**Variables**:
```json
{
  "id": "user_id",
  "notes": "User notes here"
}
```

### 13. Delete User
**Type**: Mutation  
**Operation**: `deleteUser`

**Variables**:
```json
{
  "id": "user_id"
}
```

---

## 🏢 VENDOR MANAGEMENT

### 14. Get All Vendors
**Type**: Query  
**Operation**: `vendors`

**Variables**: None

### 15. Get Vendor By ID
**Type**: Query  
**Operation**: `vendor`

**Variables**:
```json
{
  "id": "vendor_id"
}
```

### 16. Get Vendor With Restaurants
**Type**: Query  
**Operation**: `vendorWithRestaurants`

**Variables**:
```json
{
  "id": "vendor_id"
}
```

### 17. Create Vendor
**Type**: Mutation  
**Operation**: `createVendor`

**Variables**:
```json
{
  "vendor": {
    "name": "Vendor Name",
    "email": "vendor@example.com",
    "phone": "1234567890",
    "address": "Vendor Address"
  }
}
```

### 18. Delete Vendor
**Type**: Mutation  
**Operation**: `deleteVendor`

**Variables**:
```json
{
  "id": "vendor_id"
}
```

---

## 🍽️ RESTAURANT MANAGEMENT

### 19. Get All Restaurants
**Type**: Query  
**Operation**: `restaurants`

**Variables**: None

### 20. Get Restaurants Paginated
**Type**: Query  
**Operation**: `restaurantsPaginated`

**Variables**:
```json
{
  "page": 1,
  "limit": 10,
  "search": ""
}
```

### 21. Get Restaurants By Owner
**Type**: Query  
**Operation**: `restaurantsByOwner`

**Variables**:
```json
{
  "owner": "owner_id"
}
```

### 22. Get Restaurant Profile
**Type**: Query  
**Operation**: `restaurantProfile`

**Variables**:
```json
{
  "id": "restaurant_id"
}
```

### 23. Get Cloned Restaurants
**Type**: Query  
**Operation**: `clonedRestaurants`

**Variables**: None

### 24. Create Restaurant
**Type**: Mutation  
**Operation**: `createRestaurant`

**Variables**:
```json
{
  "restaurant": {
    "name": "Restaurant Name",
    "address": "Restaurant Address",
    "phone": "1234567890",
    "deliveryTime": 30,
    "minimumOrder": 10.00
  },
  "owner": "owner_id"
}
```

### 25. Delete Restaurant
**Type**: Mutation  
**Operation**: `deleteRestaurant`

**Variables**:
```json
{
  "id": "restaurant_id"
}
```

### 26. Update Restaurant Delivery Bounds
**Type**: Mutation  
**Operation**: `updateDeliveryBoundsAndLocation`

**Variables**:
```json
{
  "id": "restaurant_id",
  "location": {
    "coordinates": [longitude, latitude]
  },
  "bounds": {
    "type": "Polygon",
    "coordinates": [[[lng1, lat1], [lng2, lat2], ...]]
  }
}
```

### 27. Update Restaurant Delivery Info
**Type**: Mutation  
**Operation**: `updateRestaurantDelivery`

**Variables**:
```json
{
  "id": "restaurant_id",
  "deliveryDistance": 5,
  "deliveryFeePerKm": 2.5,
  "minDeliveryFee": 5.00
}
```

### 28. Update Restaurant Business Details
**Type**: Mutation  
**Operation**: `updateRestaurantBussinessDetails`

**Variables**:
```json
{
  "id": "restaurant_id",
  "businessDetails": {
    "businessName": "Business Name",
    "registrationNumber": "REG123"
  }
}
```

### 29. Update Food Out of Stock
**Type**: Mutation  
**Operation**: `updateFoodOutOfStock`

**Variables**:
```json
{
  "id": "food_id",
  "outOfStock": true
}
```

---

## 📦 ORDER MANAGEMENT

### 30. Get All Orders
**Type**: Query  
**Operation**: `allOrders`

**Variables**:
```json
{
  "page": 1
}
```

### 31. Get Active Orders
**Type**: Query  
**Operation**: `getActiveOrders`

**Variables**:
```json
{
  "restaurantId": "restaurant_id",
  "page": 1,
  "rowsPerPage": 10,
  "actions": ["PENDING", "ACCEPTED"],
  "search": ""
}
```

### 32. Get Orders By Restaurant
**Type**: Query  
**Operation**: `ordersByRestId`

**Variables**:
```json
{
  "restaurant": "restaurant_id",
  "page": 1,
  "rows": 10,
  "search": ""
}
```

### 33. Get Orders By User
**Type**: Query  
**Operation**: `ordersByUser`

**Variables**:
```json
{
  "userId": "user_id",
  "page": 1,
  "limit": 10
}
```

### 34. Update Order Status
**Type**: Mutation  
**Operation**: `updateStatus`

**Variables**:
```json
{
  "id": "order_id",
  "orderStatus": "ACCEPTED"
}
```

### 35. Assign Rider to Order
**Type**: Mutation  
**Operation**: `assignRider`

**Variables**:
```json
{
  "id": "order_id",
  "riderId": "rider_id"
}
```

---

## 🍕 FOOD & CATEGORY MANAGEMENT

### 36. Get Foods By Restaurant
**Type**: Query  
**Operation**: `foodsByRestaurantId`

**Variables**:
```json
{
  "restaurantId": "restaurant_id"
}
```

### 37. Create Food
**Type**: Mutation  
**Operation**: `createFood`

**Variables**:
```json
{
  "food": {
    "title": "Food Name",
    "description": "Food Description",
    "category": "category_id",
    "restaurant": "restaurant_id",
    "price": 15.99
  }
}
```

### 38. Delete Food
**Type**: Mutation  
**Operation**: `deleteFood`

**Variables**:
```json
{
  "id": "food_id"
}
```

### 39. Get Categories By Restaurant
**Type**: Query  
**Operation**: `categoriesByRestaurantId`

**Variables**:
```json
{
  "restaurantId": "restaurant_id"
}
```

### 40. Create Category
**Type**: Mutation  
**Operation**: `createCategory`

**Variables**:
```json
{
  "category": {
    "title": "Category Name",
    "restaurant": "restaurant_id",
    "image": "image_url"
  }
}
```

### 41. Delete Category
**Type**: Mutation  
**Operation**: `deleteCategory`

**Variables**:
```json
{
  "id": "category_id"
}
```

### 42. Get Subcategories
**Type**: Query  
**Operation**: `subcategories`

**Variables**: None

### 43. Get Subcategory By ID
**Type**: Query  
**Operation**: `subcategory`

**Variables**:
```json
{
  "id": "subcategory_id"
}
```

### 44. Get Subcategories By Parent
**Type**: Query  
**Operation**: `subcategoriesByParentId`

**Variables**:
```json
{
  "parentId": "category_id"
}
```

### 45. Create Subcategories
**Type**: Mutation  
**Operation**: `createSubCategories`

**Variables**:
```json
{
  "subCategories": [
    {
      "title": "Subcategory 1",
      "parent": "category_id"
    }
  ]
}
```

### 46. Delete Subcategory
**Type**: Mutation  
**Operation**: `deleteSubCategory`

**Variables**:
```json
{
  "id": "subcategory_id"
}
```

### 47. Get Addons By Restaurant
**Type**: Query  
**Operation**: `addonsByRestaurantId`

**Variables**:
```json
{
  "restaurantId": "restaurant_id"
}
```

### 48. Create Addons
**Type**: Mutation  
**Operation**: `createAddons`

**Variables**:
```json
{
  "addons": [
    {
      "title": "Addon Name",
      "restaurant": "restaurant_id",
      "options": [
        {
          "title": "Option 1",
          "price": 2.00
        }
      ]
    }
  ]
}
```

### 49. Delete Addon
**Type**: Mutation  
**Operation**: `deleteAddon`

**Variables**:
```json
{
  "id": "addon_id"
}
```

### 50. Get Options By Restaurant
**Type**: Query  
**Operation**: `optionsByRestaurantId`

**Variables**:
```json
{
  "restaurantId": "restaurant_id"
}
```

### 51. Create Options
**Type**: Mutation  
**Operation**: `createOptions`

**Variables**:
```json
{
  "options": [
    {
      "title": "Option Name",
      "restaurant": "restaurant_id"
    }
  ]
}
```

### 52. Delete Option
**Type**: Mutation  
**Operation**: `deleteOption`

**Variables**:
```json
{
  "id": "option_id"
}
```

---

## 🏍️ RIDER MANAGEMENT

### 53. Get All Riders
**Type**: Query  
**Operation**: `riders`

**Variables**: None

### 54. Get Rider By ID
**Type**: Query  
**Operation**: `rider`

**Variables**:
```json
{
  "id": "rider_id"
}
```

### 55. Get Available Riders
**Type**: Query  
**Operation**: `availableRiders`

**Variables**: None

### 56. Get Riders By Zone
**Type**: Query  
**Operation**: `ridersByZone`

**Variables**:
```json
{
  "zone": "zone_id"
}
```

### 57. Create Rider
**Type**: Mutation  
**Operation**: `createRider`

**Variables**:
```json
{
  "rider": {
    "name": "Rider Name",
    "username": "rider_username",
    "phone": "1234567890",
    "email": "rider@example.com",
    "zone": "zone_id"
  }
}
```

### 58. Delete Rider
**Type**: Mutation  
**Operation**: `deleteRider`

**Variables**:
```json
{
  "id": "rider_id"
}
```

---

## ⚙️ CONFIGURATION

### 59. Get Configuration
**Type**: Query  
**Operation**: `configuration`

**Variables**: None

**GraphQL Query**:
```graphql
query getConfiguration {
  configuration {
    _id
    email
    emailName
    currency
    currencySymbol
    deliveryRate
    googleApiKey
    firebaseKey
    authDomain
    projectId
    storageBucket
    msgSenderId
    appId
    measurementId
    vapidKey
  }
}
```

### 60. Save Email Configuration
**Type**: Mutation  
**Operation**: `saveEmailConfiguration`

**Variables**:
```json
{
  "configurationInput": {
    "email": "noreply@example.com",
    "emailName": "Tifto Admin",
    "password": "email_password",
    "enableEmail": true
  }
}
```

### 61. Save Stripe Configuration
**Type**: Mutation  
**Operation**: `saveStripeConfiguration`

**Variables**:
```json
{
  "configurationInput": {
    "publishableKey": "pk_test_...",
    "secretKey": "sk_test_..."
  }
}
```

### 62. Save PayPal Configuration
**Type**: Mutation  
**Operation**: `savePayPalConfiguration`

**Variables**:
```json
{
  "configurationInput": {
    "clientId": "paypal_client_id",
    "clientSecret": "paypal_secret",
    "sandbox": true
  }
}
```

### 63. Save Firebase Configuration
**Type**: Mutation  
**Operation**: `saveFirebaseConfiguration`

**Variables**:
```json
{
  "configurationInput": {
    "firebaseKey": "AIza...",
    "authDomain": "project.firebaseapp.com",
    "projectId": "project_id",
    "storageBucket": "project.appspot.com",
    "msgSenderId": "123456789",
    "appId": "1:123456789:web:abc123",
    "measurementId": "G-XXXXXXXXXX",
    "vapidKey": "vapid_key"
  }
}
```

### 64. Save Google API Key
**Type**: Mutation  
**Operation**: `saveGoogleApiKey`

**Variables**:
```json
{
  "configurationInput": {
    "googleApiKey": "AIza..."
  }
}
```

### 65. Save Currency Configuration
**Type**: Mutation  
**Operation**: `saveCurrencyConfiguration`

**Variables**:
```json
{
  "configurationInput": {
    "currency": "USD",
    "currencySymbol": "$"
  }
}
```

### 66. Save Delivery Rate Configuration
**Type**: Mutation  
**Operation**: `saveDeliveryRateConfiguration`

**Variables**:
```json
{
  "configurationInput": {
    "deliveryRate": 2.5,
    "costType": "perKM"
  }
}
```

---

## 🔔 NOTIFICATIONS

### 67. Get Notifications
**Type**: Query  
**Operation**: `notifications`

**Variables**: None

### 68. Get Web Notifications
**Type**: Query  
**Operation**: `webNotifications`

**Variables**: None

### 69. Send Notification
**Type**: Mutation  
**Operation**: `sendNotification`

**Variables**:
```json
{
  "notification": {
    "title": "Notification Title",
    "body": "Notification Body",
    "screen": "orders"
  }
}
```

---

## 🎫 SUPPORT TICKETS

### 70. Get Ticket Users
**Type**: Query  
**Operation**: `ticketUsers`

**Variables**: None

### 71. Get Ticket Users With Latest
**Type**: Query  
**Operation**: `ticketUsersWithLatest`

**Variables**: None

### 72. Get User Support Tickets
**Type**: Query  
**Operation**: `userSupportTickets`

**Variables**:
```json
{
  "userId": "user_id"
}
```

### 73. Get Single Support Ticket
**Type**: Query  
**Operation**: `singleSupportTicket`

**Variables**:
```json
{
  "ticketId": "ticket_id"
}
```

### 74. Get Ticket Messages
**Type**: Query  
**Operation**: `ticketMessages`

**Variables**:
```json
{
  "input": {
    "ticket": "ticket_id",
    "page": 1,
    "limit": 50
  }
}
```

### 75. Create Support Ticket
**Type**: Mutation  
**Operation**: `createSupportTicket`

**Variables**:
```json
{
  "input": {
    "user": "user_id",
    "subject": "Ticket Subject",
    "message": "Ticket Message"
  }
}
```

### 76. Create Ticket Message
**Type**: Mutation  
**Operation**: `createTicketMessage`

**Variables**:
```json
{
  "input": {
    "ticket": "ticket_id",
    "message": "Message content",
    "isAdmin": true
  }
}
```

### 77. Update Ticket Status
**Type**: Mutation  
**Operation**: `updateTicketStatus`

**Variables**:
```json
{
  "input": {
    "ticketId": "ticket_id",
    "status": "RESOLVED"
  }
}
```

---

## 💰 FINANCIAL

### 78. Get All Withdraw Requests
**Type**: Query  
**Operation**: `allWithdrawRequests`

**Variables**: None

### 79. Update Withdraw Request
**Type**: Mutation  
**Operation**: `updateWithdrawRequest`

**Variables**:
```json
{
  "id": "request_id",
  "status": "TRANSFERRED"
}
```

### 80. Create Withdraw Request
**Type**: Mutation  
**Operation**: `createWithdrawRequest`

**Variables**:
```json
{
  "input": {
    "vendor": "vendor_id",
    "amount": 1000.00
  }
}
```

### 81. Get Earnings
**Type**: Query  
**Operation**: `earning`

**Variables**:
```json
{
  "vendorId": "vendor_id",
  "starting_date": "2024-01-01",
  "ending_date": "2024-12-31"
}
```

### 82. Get Earnings For Store
**Type**: Query  
**Operation**: `earningForStore`

**Variables**:
```json
{
  "restaurantId": "restaurant_id",
  "starting_date": "2024-01-01",
  "ending_date": "2024-12-31"
}
```

### 83. Get Transaction History
**Type**: Query  
**Operation**: `transactionHistory`

**Variables**:
```json
{
  "vendorId": "vendor_id",
  "page": 1,
  "limit": 10
}
```

### 84. Get Tipping
**Type**: Query  
**Operation**: `tipping`

**Variables**: None

### 85. Create Tipping
**Type**: Mutation  
**Operation**: `createTipping`

**Variables**:
```json
{
  "tipping": {
    "tip1": 10,
    "tip2": 20,
    "tip3": 30
  }
}
```

### 86. Update Commission Rate
**Type**: Mutation  
**Operation**: `updateCommissionRate`

**Variables**:
```json
{
  "id": "restaurant_id",
  "commissionRate": 15.5
}
```

---

## 🎨 OTHER FEATURES

### 87. Get Zones
**Type**: Query  
**Operation**: `zones`

**Variables**: None

### 88. Create Zone
**Type**: Mutation  
**Operation**: `createZone`

**Variables**:
```json
{
  "zone": {
    "name": "Zone Name",
    "bounds": {
      "type": "Polygon",
      "coordinates": [[[lng1, lat1], [lng2, lat2], ...]]
    }
  }
}
```

### 89. Delete Zone
**Type**: Mutation  
**Operation**: `deleteZone`

**Variables**:
```json
{
  "id": "zone_id"
}
```

### 90. Get Banners
**Type**: Query  
**Operation**: `banners`

**Variables**: None

### 91. Create Banner
**Type**: Mutation  
**Operation**: `createBanner`

**Variables**:
```json
{
  "banner": {
    "title": "Banner Title",
    "image": "image_url",
    "screen": "home"
  }
}
```

### 92. Delete Banner
**Type**: Mutation  
**Operation**: `deleteBanner`

**Variables**:
```json
{
  "id": "banner_id"
}
```

### 93. Get Cuisines
**Type**: Query  
**Operation**: `cuisines`

**Variables**: None

### 94. Create Cuisine
**Type**: Mutation  
**Operation**: `createCuisine`

**Variables**:
```json
{
  "cuisine": {
    "name": "Italian",
    "image": "image_url"
  }
}
```

### 95. Delete Cuisine
**Type**: Mutation  
**Operation**: `deleteCuisine`

**Variables**:
```json
{
  "id": "cuisine_id"
}
```

### 96. Get Shop Types
**Type**: Query  
**Operation**: `shopTypes`

**Variables**: None

### 97. Create Shop Type
**Type**: Mutation  
**Operation**: `createShopType`

**Variables**:
```json
{
  "shopType": {
    "name": "Restaurant"
  }
}
```

### 98. Update Shop Type
**Type**: Mutation  
**Operation**: `updateShopType`

**Variables**:
```json
{
  "id": "shop_type_id",
  "shopType": {
    "name": "Updated Name"
  }
}
```

### 99. Delete Shop Type
**Type**: Mutation  
**Operation**: `deleteShopType`

**Variables**:
```json
{
  "id": "shop_type_id"
}
```

### 100. Get Coupons
**Type**: Query  
**Operation**: `coupons`

**Variables**: None

### 101. Create Coupon
**Type**: Mutation  
**Operation**: `createCoupon`

**Variables**:
```json
{
  "coupon": {
    "code": "SAVE20",
    "discount": 20,
    "discountType": "percentage",
    "maxDiscount": 50.00
  }
}
```

### 102. Delete Coupon
**Type**: Mutation  
**Operation**: `deleteCoupon`

**Variables**:
```json
{
  "id": "coupon_id"
}
```

### 103. Get Restaurant Coupons
**Type**: Query  
**Operation**: `restaurantCoupons`

**Variables**:
```json
{
  "restaurantId": "restaurant_id"
}
```

### 104. Create Restaurant Coupon
**Type**: Mutation  
**Operation**: `createRestaurantCoupon`

**Variables**:
```json
{
  "input": {
    "restaurant": "restaurant_id",
    "coupon": "coupon_id"
  }
}
```

### 105. Delete Restaurant Coupon
**Type**: Mutation  
**Operation**: `deleteRestaurantCoupon`

**Variables**:
```json
{
  "id": "restaurant_coupon_id"
}
```

### 106. Get Reviews/Ratings
**Type**: Query  
**Operation**: `reviewsByRestaurant`

**Variables**:
```json
{
  "restaurantId": "restaurant_id"
}
```

### 107. Get Staff
**Type**: Query  
**Operation**: `staffs`

**Variables**: None

### 108. Create Staff
**Type**: Mutation  
**Operation**: `createStaff`

**Variables**:
```json
{
  "staff": {
    "name": "Staff Name",
    "email": "staff@example.com",
    "restaurant": "restaurant_id",
    "permissions": ["orders", "food"]
  }
}
```

### 109. Delete Staff
**Type**: Mutation  
**Operation**: `deleteStaff`

**Variables**:
```json
{
  "id": "staff_id"
}
```

### 110. Update Timings
**Type**: Mutation  
**Operation**: `updateTimings`

**Variables**:
```json
{
  "id": "restaurant_id",
  "timings": [
    {
      "day": "Monday",
      "openTime": "09:00",
      "closeTime": "22:00",
      "isOpen": true
    }
  ]
}
```

### 111. Update Delivery Options
**Type**: Mutation  
**Operation**: `updateDeliveryOptions`

**Variables**:
```json
{
  "id": "restaurant_id",
  "deliveryOptions": {
    "allowDelivery": true,
    "allowPickup": true,
    "scheduleOrder": false
  }
}
```

### 112. Upload Token
**Type**: Mutation  
**Operation**: `uploadToken`

**Variables**:
```json
{
  "id": "user_id",
  "pushToken": "firebase_push_token"
}
```

### 113. Get App Versions
**Type**: Query  
**Operation**: `versions`

**Variables**: None

### 114. Create/Update App Version
**Type**: Mutation  
**Operation**: `createAppVersion`

**Variables**:
```json
{
  "version": {
    "platform": "android",
    "version": "1.0.0",
    "forceUpdate": false
  }
}
```

### 115. Get Audit Logs
**Type**: Query  
**Operation**: `auditLogs`

**Variables**:
```json
{
  "page": 1,
  "limit": 10,
  "search": ""
}
```

---

## 📡 SUBSCRIPTIONS

### 116. Subscribe Place Order
**Type**: Subscription  
**Operation**: `subscribePlaceOrder`

**Variables**:
```json
{
  "restaurant": "restaurant_id"
}
```

**GraphQL Query**:
```graphql
subscription SubscribePlaceOrder($restaurant: String!) {
  subscribePlaceOrder(restaurant: $restaurant) {
    userId
    origin
    order {
      _id
      orderId
      orderStatus
      restaurant {
        _id
        name
      }
    }
  }
}
```

**Note**: Subscriptions require WebSocket connection. Use `wss://tifto-backend.onrender.com/graphql`

### 117. Subscription Order
**Type**: Subscription  
**Operation**: `subscriptionOrder`

**Variables**:
```json
{
  "id": "order_id"
}
```

### 118. Rider Updated Subscription
**Type**: Subscription  
**Operation**: `riderUpdated`

**Variables**: None

---

## 📝 POSTMAN SETUP INSTRUCTIONS

### Step 1: Create a New Collection
1. Open Postman
2. Click "New" → "Collection"
3. Name it "Tifto Admin API"

### Step 2: Set Collection Variables
Go to Collection → Variables and add:
- `base_url`: `https://tifto-backend.onrender.com`
- `graphql_endpoint`: `{{base_url}}/graphql`
- `token`: (leave empty, will be set after login)

### Step 3: Set Authorization
1. Go to Collection → Authorization
2. Type: Bearer Token
3. Token: `{{token}}`

### Step 4: Create Requests
For each API:
1. Create new request
2. Method: POST
3. URL: `{{graphql_endpoint}}`
4. Headers:
   - `Content-Type`: `application/json` (only if using Raw JSON body)
   - `Authorization`: `Bearer {{token}}` (for authenticated requests)
5. **Body → GraphQL** (Recommended):
   - Select "GraphQL" as body type
   - Paste the GraphQL query/mutation in the Query section
   - Add variables in the Variables section (as JSON)
   
   **OR**
   
   **Body → raw → JSON** (Alternative):
   - Use this format:
   ```json
   {
     "query": "mutation ownerLogin($email: String!, $password: String!) { ownerLogin(email: $email, password: $password) { userId token email userType restaurants { _id orderId name image address } permissions userTypeId image name } }",
     "variables": {
       "email": "herookie@tensi.org",
       "password": "9827453137"
     }
   }
   ```
   - **Important**: The query must be a single-line string (remove all line breaks)

### Step 5: Test Login First
1. Create request: "1. Owner Login"
2. Use the `ownerLogin` mutation (this is the correct mutation for admin/owner authentication)
3. After successful login, copy the token
4. Set it in Collection Variables → `token`

### Step 6: For Subscriptions
Subscriptions require WebSocket. In Postman:
1. Use the WebSocket request type
2. URL: `wss://tifto-backend.onrender.com/graphql`
3. Send connection_init message:
```json
{
  "type": "connection_init",
  "payload": {
    "Authorization": "Bearer {{token}}"
  }
}
```
4. Then send the subscription:
```json
{
  "id": "1",
  "type": "start",
  "payload": {
    "query": "subscription SubscribePlaceOrder($restaurant: String!) { subscribePlaceOrder(restaurant: $restaurant) { order { _id orderId } } }",
    "variables": {
      "restaurant": "restaurant_id"
    }
  }
}
```

---

## 🔍 TIPS FOR TESTING

1. **Always authenticate first** - Use `ownerLogin` to get a token
2. **Check response format** - GraphQL returns `{ "data": {...}, "errors": [...] }`
3. **Handle errors** - Check the `errors` array in responses
4. **Use variables** - Store IDs in environment variables for reuse
5. **Test edge cases** - Try invalid IDs, missing required fields, etc.
6. **Subscriptions** - Use a WebSocket client or GraphQL Playground for real-time testing

---

## 📚 ADDITIONAL RESOURCES

- GraphQL Endpoint: `https://tifto-backend.onrender.com/graphql`
- WebSocket Endpoint: `wss://tifto-backend.onrender.com/graphql`
- GraphQL Playground: Visit the endpoint in a browser for interactive testing

---

**Last Updated**: December 2024  
**Total APIs Documented**: 118 operations

