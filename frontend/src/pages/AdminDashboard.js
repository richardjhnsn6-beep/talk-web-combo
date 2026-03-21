import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/dashboard`);
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      const data = await response.json();
      setStats(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📊 Admin Dashboard</h1>
          <p className="text-gray-600">Monitor your website activity and revenue</p>
        </div>

        {/* Revenue Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">
                  ${stats?.payments?.total_revenue || 0}
                </p>
              </div>
              <div className="text-5xl">💰</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold mb-1">Successful Payments</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats?.payments?.successful_payments || 0}
                </p>
              </div>
              <div className="text-5xl">✅</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold mb-1">Total Page Views</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats?.page_views?.total_views || 0}
                </p>
              </div>
              <div className="text-5xl">👁️</div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">💳 Recent Transactions</h2>
          {stats?.payments?.recent_transactions?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Package</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Session ID</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.payments.recent_transactions.map((transaction, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(transaction.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">
                        ${transaction.amount}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          transaction.payment_status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {transaction.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {transaction.package_id}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                        {transaction.session_id?.substring(0, 20)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No transactions yet</p>
          )}
        </div>

        {/* Page Views by Page */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📄 Page Views by Section</h2>
          {stats?.page_views?.by_page && Object.keys(stats.page_views.by_page).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.page_views.by_page)
                .sort(([, a], [, b]) => b - a)
                .map(([page, count]) => (
                  <div key={page} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-700 font-medium">{page}</span>
                    <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full font-semibold">
                      {count} views
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No page views tracked yet</p>
          )}
        </div>

        {/* Auto-refresh indicator */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            📡 Dashboard auto-refreshes every 30 seconds
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
