import React, { useState, useEffect } from 'react';
import { Crown, Sparkles, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [aiChatStats, setAiChatStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastTransactionCount, setLastTransactionCount] = useState(0);
  const [newSaleAlert, setNewSaleAlert] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchAIChatStats();
    // Check for new sales every 5 seconds
    const interval = setInterval(() => {
      checkForNewSales();
      fetchAIChatStats();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/dashboard`);
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      const data = await response.json();
      setStats(data);
      setLastTransactionCount(data.payments.successful_payments);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchAIChatStats = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/ai-chat/admin/stats`);
      if (!response.ok) return;
      const data = await response.json();
      setAiChatStats(data);
    } catch (err) {
      console.error('Failed to fetch AI chat stats:', err);
    }
  };

  const checkForNewSales = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/dashboard`);
      if (!response.ok) return;
      const data = await response.json();
      
      const currentCount = data.payments.successful_payments;
      
      // Detect new sale
      if (currentCount > lastTransactionCount) {
        const newSales = currentCount - lastTransactionCount;
        const revenuePerSale = 4.99;
        const newRevenue = newSales * revenuePerSale;
        
        // Play "cha-ching" sound
        playChaChing();
        
        // Show bouncing alert
        setNewSaleAlert({
          amount: newRevenue,
          count: newSales
        });
        
        // Clear alert after 5 seconds
        setTimeout(() => setNewSaleAlert(null), 5000);
        
        setLastTransactionCount(currentCount);
      }
      
      setStats(data);
    } catch (err) {
      console.error('Error checking for new sales:', err);
    }
  };

  const playChaChing = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Cash register "cha-ching" sound effect
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (err) {
      console.error('Audio playback error:', err);
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
    <div className="min-h-screen bg-gray-100 relative">
      {/* NEW SALE ALERT - Bouncing notification */}
      {newSaleAlert && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-6 rounded-xl shadow-2xl border-4 border-yellow-400">
            <div className="text-center">
              <div className="text-6xl mb-2">💰</div>
              <p className="text-2xl font-bold mb-1">NEW SALE!</p>
              <p className="text-4xl font-extrabold mb-2">+${newSaleAlert.amount.toFixed(2)}</p>
              <p className="text-sm opacity-90">
                🎉 {newSaleAlert.count} {newSaleAlert.count === 1 ? 'unlock' : 'unlocks'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📊 Admin Dashboard</h1>
          <p className="text-gray-600">
            Monitor your website activity and revenue • 
            <span className="ml-2 inline-flex items-center">
              <span className="animate-pulse inline-block w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              <strong>LIVE</strong> (checks every 5 seconds)
            </span>
          </p>
        </div>

        {/* Revenue Stats */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500 transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold mb-1">Total Revenue</p>
                <p className="text-4xl font-bold text-green-600">
                  ${((stats?.payments?.total_revenue || 0) + (aiChatStats?.monthly_recurring_revenue || 0)).toFixed(2)}
                </p>
              </div>
              <div className="text-5xl">💰</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500 transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold mb-1">Content Sales</p>
                <p className="text-4xl font-bold text-blue-600">
                  ${stats?.payments?.content_revenue?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-gray-500 mt-1">{stats?.payments?.successful_payments || 0} unlocks</p>
              </div>
              <div className="text-5xl">📖</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500 transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold mb-1">Donations</p>
                <p className="text-4xl font-bold text-yellow-600">
                  ${stats?.payments?.donation_revenue?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-gray-500 mt-1">{stats?.payments?.total_donations || 0} donors</p>
              </div>
              <div className="text-5xl">❤️</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg shadow-lg p-6 border-l-4 border-purple-700 transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-semibold mb-1 flex items-center gap-1">
                  <Crown className="w-4 h-4" />
                  AI Chat Revenue
                </p>
                <p className="text-4xl font-bold text-white">
                  ${aiChatStats?.monthly_recurring_revenue?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-purple-100 mt-1">{aiChatStats?.active_subscribers || 0} subscribers</p>
              </div>
              <div className="text-5xl">🤖</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500 transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold mb-1">Total Page Views</p>
                <p className="text-4xl font-bold text-purple-600">
                  {stats?.page_views?.total_views || 0}
                </p>
              </div>
              <div className="text-5xl">👁️</div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-gradient-to-r from-teal-600 to-purple-600 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">⚡ Quick Admin Links</h2>
          <div className="flex flex-wrap gap-3">
            <a
              href="/admin/orders"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg inline-flex items-center gap-2"
            >
              💼 Website Orders Dashboard
            </a>
            <a
              href="/admin/radio"
              className="bg-white text-teal-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all shadow-lg inline-flex items-center gap-2"
            >
              🎙️ Manage Radio Station
            </a>
            <a
              href="/ai-chat"
              className="bg-white text-purple-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all shadow-lg inline-flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Try AI Chat
            </a>
            <a
              href="/admin/ai-chat"
              className="bg-white text-pink-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all shadow-lg inline-flex items-center gap-2"
            >
              👑 Manage AI Chat
            </a>
            <a
              href="/admin/pricing"
              className="bg-white text-green-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all shadow-lg inline-flex items-center gap-2"
            >
              💰 Change Pricing
            </a>
          </div>
        </div>

        {/* AI Chat Stats Section */}
        {aiChatStats && (
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg p-6 mb-8 text-white">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              🤖 AI Chat Revenue System
            </h2>
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <p className="text-purple-100 text-sm mb-1">Active Subscribers</p>
                <p className="text-3xl font-bold flex items-center gap-2">
                  <Crown className="w-6 h-6 text-yellow-400" />
                  {aiChatStats.active_subscribers}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <p className="text-purple-100 text-sm mb-1">Monthly Revenue</p>
                <p className="text-3xl font-bold text-yellow-300">
                  ${aiChatStats.monthly_recurring_revenue.toFixed(2)}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <p className="text-purple-100 text-sm mb-1">Total Questions</p>
                <p className="text-3xl font-bold">
                  {aiChatStats.total_messages}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <p className="text-purple-100 text-sm mb-1">Questions Today</p>
                <p className="text-3xl font-bold text-green-300">
                  {aiChatStats.messages_today}
                </p>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Usage Breakdown:</span>
                <span className="text-sm">
                  Free: {aiChatStats.free_tier_messages} | Paid: {aiChatStats.paid_tier_messages}
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all"
                  style={{ 
                    width: `${(aiChatStats.paid_tier_messages / (aiChatStats.total_messages || 1)) * 100}%` 
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            💳 Recent Transactions
            {stats?.payments?.successful_payments > 0 && (
              <span className="ml-3 text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                {stats.payments.successful_payments} sales
              </span>
            )}
          </h2>
          {stats?.payments?.recent_transactions?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Content</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.payments.recent_transactions.map((transaction, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(transaction.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-lg font-bold text-green-600">
                        ${transaction.amount}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          transaction.payment_status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : transaction.payment_status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {transaction.metadata?.content || transaction.package_id || (transaction.type === 'donation' ? '❤️ Donation' : 'Unknown')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-gray-500 text-lg">No transactions yet</p>
              <p className="text-gray-400 text-sm mt-2">Your first sale is coming soon!</p>
            </div>
          )}
        </div>

        {/* Page Views by Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📄 Page Views by Section</h2>
          {stats?.page_views?.by_page && Object.keys(stats.page_views.by_page).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.page_views.by_page)
                .sort(([, a], [, b]) => b - a)
                .map(([page, count]) => (
                  <div key={page} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                    <span className="text-gray-700 font-medium text-lg">{page}</span>
                    <span className="bg-teal-100 text-teal-800 px-4 py-2 rounded-full font-bold text-lg">
                      {count} views
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📢</div>
              <p className="text-gray-500 text-lg">No page views tracked yet</p>
              <p className="text-gray-400 text-sm mt-2">Share your site to start tracking visitor activity!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
