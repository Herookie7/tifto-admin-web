'use client';
import { gql, useQuery } from '@apollo/client';

// Dashboard Stats Query
const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    getDashboardUsers {
      usersCount
      vendorsCount
      restaurantsCount
      ridersCount
    }
    getDashboardOrdersByType {
      delivery
      pickup
      total
    }
    getDashboardSalesByType {
      delivery
      pickup
      total
    }
  }
`;

interface DashboardStats {
    getDashboardUsers?: {
        usersCount: number[];
        vendorsCount: number[];
        restaurantsCount: number[];
        ridersCount: number[];
    };
    getDashboardOrdersByType?: {
        delivery: number;
        pickup: number;
        total: number;
    };
    getDashboardSalesByType?: {
        delivery: number;
        pickup: number;
        total: number;
    };
}

export default function ReportsScreen() {
    const { loading, data } = useQuery<DashboardStats>(GET_DASHBOARD_STATS);

    const stats = data || {};
    const ordersData = stats.getDashboardOrdersByType || { delivery: 0, pickup: 0, total: 0 };
    const salesData = stats.getDashboardSalesByType || { delivery: 0, pickup: 0, total: 0 };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Reports & Analytics</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
                    <p className="text-3xl font-bold text-gray-900">
                        {loading ? '...' : ordersData.total.toLocaleString()}
                    </p>
                    <div className="mt-2 text-sm text-gray-500">
                        Delivery: {ordersData.delivery} | Pickup: {ordersData.pickup}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-500">Total Sales</h3>
                    <p className="text-3xl font-bold text-green-600">
                        ₹{loading ? '...' : salesData.total.toLocaleString()}
                    </p>
                    <div className="mt-2 text-sm text-gray-500">
                        Delivery: ₹{salesData.delivery} | Pickup: ₹{salesData.pickup}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
                    <p className="text-3xl font-bold text-blue-600">
                        {loading ? '...' : (stats.getDashboardUsers?.usersCount?.[0] || 0).toLocaleString()}
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-500">Active Stores</h3>
                    <p className="text-3xl font-bold text-purple-600">
                        {loading ? '...' : (stats.getDashboardUsers?.restaurantsCount?.[0] || 0).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Report Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Orders Report */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Orders Breakdown</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Delivery Orders</span>
                            <span className="font-medium">{ordersData.delivery}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${ordersData.total ? (ordersData.delivery / ordersData.total) * 100 : 0}%` }}
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Pickup Orders</span>
                            <span className="font-medium">{ordersData.pickup}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${ordersData.total ? (ordersData.pickup / ordersData.total) * 100 : 0}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Revenue Report */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Revenue Breakdown</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Delivery Revenue</span>
                            <span className="font-medium">₹{salesData.delivery.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-indigo-500 h-2 rounded-full"
                                style={{ width: `${salesData.total ? (salesData.delivery / salesData.total) * 100 : 0}%` }}
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Pickup Revenue</span>
                            <span className="font-medium">₹{salesData.pickup.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-emerald-500 h-2 rounded-full"
                                style={{ width: `${salesData.total ? (salesData.pickup / salesData.total) * 100 : 0}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                    <a href="/management/orders" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                        View All Orders
                    </a>
                    <a href="/general/stores" className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
                        Manage Stores
                    </a>
                    <a href="/general/riders" className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                        Manage Riders
                    </a>
                    <a href="/general/franchise" className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                        Manage Franchise
                    </a>
                </div>
            </div>
        </div>
    );
}
