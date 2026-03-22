import React, { useState, useEffect } from 'react';
import { Crown, Users, DollarSign, MessageSquare, TrendingUp, Settings } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function AdminAIChat() {
  const [stats, setStats] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, subsRes] = await Promise.all([
        fetch(`${API_URL}/api/ai-chat/admin/stats`),
        fetch(`${API_URL}/api/ai-chat/admin/subscribers`)
      ]);
      
      if (statsRes.ok) setStats(await statsRes.json());
      if (subsRes.ok) setSubscribers(await subsRes.json());
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch AI chat data:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI Chat admin...</p>
        </div>
      </div>
    );
  }

  const conversionRate = stats ? 
    ((stats.active_subscribers / (stats.total_messages || 1)) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">🤖 AI Chat Management</h1>
          </div>
          <p className="text-gray-600 flex items-center gap-2">
            Monitor your AI revenue system • 
            <span className="inline-flex items-center ml-2">
              <span className="animate-pulse inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              <strong>LIVE</strong>
            </span>
          </p>
        </div>

        {/* Revenue Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8" />
              <span className="text-sm bg-white/20 px-2 py-1 rounded">MRR</span>
            </div>
            <p className="text-4xl font-bold mb-1">
              ${stats?.monthly_recurring_revenue?.toFixed(2) || '0.00'}
            </p>
            <p className="text-sm text-green-100">Monthly Recurring Revenue</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <Crown className="w-8 h-8" />
              <span className="text-sm bg-white/20 px-2 py-1 rounded">Active</span>
            </div>
            <p className="text-4xl font-bold mb-1">{stats?.active_subscribers || 0}</p>
            <p className="text-sm text-purple-100">Paying Subscribers</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className="w-8 h-8" />
              <span className="text-sm bg-white/20 px-2 py-1 rounded">Total</span>
            </div>
            <p className="text-4xl font-bold mb-1">{stats?.total_messages || 0}</p>
            <p className="text-sm text-blue-100">Questions Asked</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8" />
              <span className="text-sm bg-white/20 px-2 py-1 rounded">Rate</span>
            </div>
            <p className="text-4xl font-bold mb-1">{conversionRate}%</p>
            <p className="text-sm text-orange-100">Conversion Rate</p>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              Usage Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-gray-600">💎 Free Tier Messages</span>
                <span className="font-bold text-gray-800">{stats?.free_tier_messages || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                <span className="text-purple-600">👑 Paid Tier Messages</span>
                <span className="font-bold text-purple-800">{stats?.paid_tier_messages || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                <span className="text-green-600">📅 Today's Messages</span>
                <span className="font-bold text-green-800">{stats?.messages_today || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-600" />
              Current Pricing
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-purple-800">Unlimited Access</span>
                  <Crown className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-3xl font-bold text-purple-600 mb-1">$9.99/month</p>
                <p className="text-sm text-gray-600">You keep: ~$9.70 per subscriber</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-bold text-gray-800 mb-2">Free Tier</div>
                <p className="text-xl font-bold text-gray-600 mb-1">3 questions/day</p>
                <p className="text-sm text-gray-500">Converts to paid at {conversionRate}% rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Questions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📝 Recent Questions</h3>
          {stats?.recent_questions && stats.recent_questions.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_questions.map((q, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-800 mb-2">{q.user_message}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(q.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No questions yet. Share the AI chat link!</p>
          )}
        </div>

        {/* Active Subscribers */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Active Subscribers ({subscribers.length})
          </h3>
          {subscribers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Started</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Expires</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((sub, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">{sub.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(sub.expires_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-green-600">
                        ${(sub.amount / 100).toFixed(2)}/mo
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No subscribers yet</p>
              <p className="text-sm text-gray-400">Share your AI chat link to start building revenue!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
