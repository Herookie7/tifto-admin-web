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

const GET_TRANSACTION_SUMMARY = gql`
  query GetTransactionSummary {
    getTransactionSummary {
      totalReferralPayouts
      totalCoinConversions
      totalWalletTopUps
      referralCount
      coinConversionCount
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

interface TransactionSummary {
    getTransactionSummary?: {
        totalReferralPayouts: number;
        totalCoinConversions: number;
        totalWalletTopUps: number;
        referralCount: number;
        coinConversionCount: number;
    };
}

export default function ReportsScreen() {
    const { loading, data } = useQuery<DashboardStats>(GET_DASHBOARD_STATS);
    const { loading: loadingTransactions, data: transactionData } = useQuery<TransactionSummary>(GET_TRANSACTION_SUMMARY);

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

            {/* Wallet Transaction Summary */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Wallet & Rewards Revenue
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                        <div className="text-sm opacity-90 mb-1">Referral Payouts</div>
                        <div className="text-2xl font-bold">
                            {loadingTransactions ? '...' : `₹${(transactionData?.getTransactionSummary?.totalReferralPayouts || 0).toLocaleString()}`}
                        </div>
                        <div className="text-xs opacity-75 mt-1">
                            {transactionData?.getTransactionSummary?.referralCount || 0} referrals
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                        <div className="text-sm opacity-90 mb-1">Coin Conversions</div>
                        <div className="text-2xl font-bold">
                            {loadingTransactions ? '...' : `₹${(transactionData?.getTransactionSummary?.totalCoinConversions || 0).toLocaleString()}`}
                        </div>
                        <div className="text-xs opacity-75 mt-1">
                            {transactionData?.getTransactionSummary?.coinConversionCount || 0} conversions
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                        <div className="text-sm opacity-90 mb-1">Wallet Top-Ups</div>
                        <div className="text-2xl font-bold">
                            {loadingTransactions ? '...' : `₹${(transactionData?.getTransactionSummary?.totalWalletTopUps || 0).toLocaleString()}`}
                        </div>
                        <div className="text-xs opacity-75 mt-1">Customer deposits</div>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="flex justify-between items-center">
                        <span className="text-sm opacity-90">Total Platform Revenue</span>
                        <span className="text-xl font-bold">
                            ₹{loadingTransactions ? '...' : (
                                (transactionData?.getTransactionSummary?.totalReferralPayouts || 0) +
                                (transactionData?.getTransactionSummary?.totalCoinConversions || 0) +
                                (transactionData?.getTransactionSummary?.totalWalletTopUps || 0)
                            ).toLocaleString()}
                        </span>
                    </div>
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
