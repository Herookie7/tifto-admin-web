import json

def create_graphql_request(name, description, query, variables=None, auth_required=True, is_login=False):
    """Create a GraphQL request item"""
    request = {
        'name': name,
        'request': {
            'method': 'POST',
            'header': [
                {
                    'key': 'Content-Type',
                    'value': 'application/json',
                    'type': 'text'
                }
            ],
            'body': {
                'mode': 'graphql',
                'graphql': {
                    'query': query,
                    'variables': json.dumps(variables) if variables else ''
                }
            },
            'url': {
                'raw': '{{graphql_endpoint}}',
                'host': ['{{graphql_endpoint}}']
            },
            'description': description
        }
    }
    
    # Don't add auth for login request
    if auth_required and not is_login:
        request['request']['auth'] = {
            'type': 'bearer',
            'bearer': [
                {
                    'key': 'token',
                    'value': '{{token}}',
                    'type': 'string'
                }
            ]
        }
    
    # Add test script for login to extract token
    if is_login:
        request['request']['event'] = [
            {
                'listen': 'test',
                'script': {
                    'exec': [
                        'if (pm.response.code === 200) {',
                        '    var jsonData = pm.response.json();',
                        '    if (jsonData && jsonData.data && jsonData.data.ownerLogin && jsonData.data.ownerLogin.token) {',
                        '        pm.collectionVariables.set("token", jsonData.data.ownerLogin.token);',
                        '        console.log("Token saved to collection variable");',
                        '    }',
                        '}'
                    ],
                    'type': 'text/javascript'
                }
            }
        ]
    
    return request

def create_folder(name, description, items):
    """Create a folder with items"""
    return {
        'name': name,
        'description': description,
        'item': items
    }

# Initialize collection
collection = {
    'info': {
        'name': 'Tifto Admin API - GraphQL',
        'description': 'Complete GraphQL API collection for Tifto Admin backend. Contains all 118 operations including queries, mutations, and subscriptions.\n\nBase URL: https://tifto-backend.onrender.com/graphql\nWebSocket: wss://tifto-backend.onrender.com/graphql',
        'schema': 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
        '_exporter_id': 'tifto-admin-api'
    },
    'item': [],
    'variable': [
        {
            'key': 'base_url',
            'value': 'https://tifto-backend.onrender.com',
            'type': 'string'
        },
        {
            'key': 'graphql_endpoint',
            'value': '{{base_url}}/graphql',
            'type': 'string'
        },
        {
            'key': 'ws_endpoint',
            'value': 'wss://tifto-backend.onrender.com/graphql',
            'type': 'string'
        },
        {
            'key': 'token',
            'value': '',
            'type': 'string'
        }
    ],
    'auth': {
        'type': 'bearer',
        'bearer': [
            {
                'key': 'token',
                'value': '{{token}}',
                'type': 'string'
            }
        ]
    }
}

# 1. Authentication Folder
auth_items = [
    create_graphql_request(
        'Owner Login',
        'Authenticate as admin/owner. Returns token that will be automatically saved to collection variable.',
        '''mutation ownerLogin($email: String!, $password: String!) {
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
}''',
        {
            'email': 'herookie@tensi.org',
            'password': '9827453137'
        },
        auth_required=False,
        is_login=True
    )
]

collection['item'].append(create_folder('Authentication', 'Authentication operations for admin/owner login', auth_items))

# 2. Dashboard Queries Folder
dashboard_items = [
    create_graphql_request(
        'Get Dashboard Users',
        'Get dashboard user counts (users, vendors, restaurants, riders)',
        '''query GetDashboardUsers {
  getDashboardUsers {
    usersCount
    vendorsCount
    restaurantsCount
    ridersCount
  }
}''',
        None
    ),
    create_graphql_request(
        'Get Dashboard Users By Year',
        'Get dashboard user counts filtered by year',
        '''query GetDashboardUsersByYear($year: Int!) {
  getDashboardUsersByYear(year: $year) {
    usersCount
    vendorsCount
    restaurantsCount
    ridersCount
  }
}''',
        {'year': 2024}
    ),
    create_graphql_request(
        'Get Dashboard Orders By Type',
        'Get dashboard orders grouped by type',
        '''query GetDashboardOrdersByType {
  getDashboardOrdersByType {
    value
    label
  }
}''',
        None
    ),
    create_graphql_request(
        'Get Dashboard Sales By Type',
        'Get dashboard sales grouped by type',
        '''query GetDashboardSalesByType {
  getDashboardSalesByType {
    value
    label
  }
}''',
        None
    ),
    create_graphql_request(
        'Get Restaurant Dashboard Orders',
        'Get restaurant dashboard orders and sales statistics',
        '''query GetRestaurantDashboardOrdersSalesStats($restaurant: String!, $starting_date: String!, $ending_date: String!, $dateKeyword: String) {
  getRestaurantDashboardOrdersSalesStats(restaurant: $restaurant, starting_date: $starting_date, ending_date: $ending_date, dateKeyword: $dateKeyword) {
    totalOrders
    totalSales
    totalCODOrders
    totalCardOrders
  }
}''',
        {
            'restaurant': 'restaurant_id',
            'starting_date': '2024-01-01',
            'ending_date': '2024-12-31',
            'dateKeyword': 'year'
        }
    ),
    create_graphql_request(
        'Get Vendor Dashboard Stats',
        'Get vendor dashboard statistics card details',
        '''query GetVendorDashboardStatsCardDetails($vendorId: String!, $dateKeyword: String, $starting_date: String!, $ending_date: String!) {
  getVendorDashboardStatsCardDetails(vendorId: $vendorId, dateKeyword: $dateKeyword, starting_date: $starting_date, ending_date: $ending_date) {
    totalRestaurants
    totalOrders
    totalSales
    totalDeliveries
  }
}''',
        {
            'vendorId': 'vendor_id',
            'dateKeyword': 'year',
            'starting_date': '2024-01-01',
            'ending_date': '2024-12-31'
        }
    ),
    create_graphql_request(
        'Get Vendor Live Monitor',
        'Get vendor live monitor data',
        '''query GetLiveMonitorData($id: String!, $dateKeyword: String, $starting_date: String, $ending_date: String) {
  getLiveMonitorData(id: $id, dateKeyword: $dateKeyword, starting_date: $starting_date, ending_date: $ending_date) {
    online_stores
    cancelled_orders
    delayed_orders
    ratings
  }
}''',
        {
            'id': 'vendor_id',
            'dateKeyword': 'today',
            'starting_date': '2024-01-01',
            'ending_date': '2024-12-31'
        }
    )
]

collection['item'].append(create_folder('Dashboard Queries', 'Dashboard and analytics queries', dashboard_items))

print("Created Authentication and Dashboard folders")
print(f"Total items so far: {len(collection['item'])}")

# Continue with remaining folders...
# (I'll continue building the rest in the next part)

# Write to file
with open('Tifto_Admin_API_Collection.postman_collection.json', 'w') as f:
    json.dump(collection, f, indent=2)

print("Partial collection written. Continuing...")
