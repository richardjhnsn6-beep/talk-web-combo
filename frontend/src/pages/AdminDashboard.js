import React, { useState, useEffect, useRef } from 'react';
import { Crown, Sparkles, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [aiChatStats, setAiChatStats] = useState(null);
  const [aiRichardStats, setAiRichardStats] = useState(null);
  const [liveVisitors, setLiveVisitors] = useState(null);
  const [bookScrollStats, setBookScrollStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastTransactionCount, setLastTransactionCount] = useState(0);
  const [newSaleAlert, setNewSaleAlert] = useState(null);
  const pageViewsRef = useRef(null);
  const aiChatStatsRef = useRef(null);
  const aiRichardStatsRef = useRef(null);
  const transactionsRef = useRef(null);
  const liveVisitorsRef = useRef(null);
  const bookScrollRef = useRef(null);

  useEffect(() => {
    fetchDashboardData();
    fetchAIChatStats();
    fetchAIRichardStats();
    fetchLiveVisitors();
    fetchBookScrollStats();
    // Check for new sales and live visitors every 5 seconds
    const interval = setInterval(() => {
      checkForNewSales();
      fetchAIChatStats();
      fetchAIRichardStats();
      fetchLiveVisitors();
      fetchBookScrollStats();
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

  const fetchLiveVisitors = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/visitors/active`);
      if (!response.ok) return;
      const data = await response.json();
      setLiveVisitors(data);
    } catch (err) {
      console.error('Failed to fetch live visitors:', err);
    }
  };

  const fetchBookScrollStats = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/book-scroll-stats`);
      if (!response.ok) return;
      const data = await response.json();
      setBookScrollStats(data);
    } catch (err) {
      console.error('Failed to fetch book scroll stats:', err);
    }
  };

  const fetchAIRichardStats = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/ai-richard`);
      if (!response.ok) return;
      const data = await response.json();
      setAiRichardStats(data);
    } catch (err) {
      console.error('Failed to fetch AI Richard stats:', err);
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

  const scrollToPageViews = () => {
    pageViewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToAIChatStats = () => {
    aiChatStatsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToTransactions = () => {
    transactionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToLiveVisitors = () => {
    liveVisitorsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToBookScroll = () => {
    bookScrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

        {/* LIVE VISITORS - Real-time tracking */}
        <div 
          ref={liveVisitorsRef}
          className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg shadow-2xl p-6 mb-8 border-4 border-red-600"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="animate-pulse inline-block w-3 h-3 bg-white rounded-full"></span>
              👥 Live Visitors Now
            </h2>
            <div className="text-5xl font-bold text-white">
              {liveVisitors?.total_active || 0}
            </div>
          </div>
          
          {liveVisitors && liveVisitors.total_active > 0 ? (
            <div className="bg-white/20 rounded-lg p-4">
              <p className="text-white font-semibold mb-3">Currently Viewing:</p>
              <div className="space-y-2">
                {Object.entries(liveVisitors.by_page || {}).map(([page, count]) => (
                  <div key={page} className="flex justify-between items-center bg-white/30 rounded px-3 py-2">
                    <span className="text-white font-medium">📍 {page}</span>
                    <span className="bg-white text-red-600 font-bold px-3 py-1 rounded-full text-sm">
                      {count} {count === 1 ? 'visitor' : 'visitors'}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-white/80 text-xs mt-3">
                ⏱️ Updates every 5 seconds • Last update: {liveVisitors.timestamp ? new Date(liveVisitors.timestamp).toLocaleTimeString() : 'N/A'}
              </p>
            </div>
          ) : (
            <div className="bg-white/20 rounded-lg p-4 text-center">
              <p className="text-white text-lg">No visitors online right now</p>
              <p className="text-white/80 text-sm mt-1">Visitors are tracked when they view any page</p>
            </div>
          )}
        </div>

        {/* Revenue Stats */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <div 
            onClick={scrollToTransactions}
            className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500 transform hover:scale-105 transition-all cursor-pointer hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold mb-1 flex items-center gap-1">
                  Total Revenue
                  <span className="text-xs text-green-500">↓ Click</span>
                </p>
                <p className="text-4xl font-bold text-green-600">
                  ${((stats?.payments?.total_revenue || 0) + (aiChatStats?.monthly_recurring_revenue || 0)).toFixed(2)}
                </p>
              </div>
              <div className="text-5xl">💰</div>
            </div>
          </div>

          <div 
            onClick={scrollToTransactions}
            className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500 transform hover:scale-105 transition-all cursor-pointer hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold mb-1 flex items-center gap-1">
                  Content Sales
                  <span className="text-xs text-blue-500">↓ Click</span>
                </p>
                <p className="text-4xl font-bold text-blue-600">
                  ${stats?.payments?.content_revenue?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-gray-500 mt-1">{stats?.payments?.successful_payments || 0} unlocks</p>
              </div>
              <div className="text-5xl">📖</div>
            </div>
          </div>

          <div 
            onClick={scrollToTransactions}
            className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500 transform hover:scale-105 transition-all cursor-pointer hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold mb-1 flex items-center gap-1">
                  Donations
                  <span className="text-xs text-yellow-500">↓ Click</span>
                </p>
                <p className="text-4xl font-bold text-yellow-600">
                  ${stats?.payments?.donation_revenue?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-gray-500 mt-1">{stats?.payments?.total_donations || 0} donors</p>
              </div>
              <div className="text-5xl">❤️</div>
            </div>
          </div>

          <div 
            onClick={scrollToAIChatStats}
            className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg shadow-lg p-6 border-l-4 border-purple-700 transform hover:scale-105 transition-all cursor-pointer hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-semibold mb-1 flex items-center gap-1">
                  <Crown className="w-4 h-4" />
                  AI Chat Revenue
                  <span className="text-xs text-purple-200">↓ Click</span>
                </p>
                <p className="text-4xl font-bold text-white">
                  ${aiChatStats?.monthly_recurring_revenue?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-purple-100 mt-1">{aiChatStats?.active_subscribers || 0} subscribers</p>
              </div>
              <div className="text-5xl">🤖</div>
            </div>
          </div>

          <div 
            onClick={scrollToPageViews}
            className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500 transform hover:scale-105 transition-all cursor-pointer hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold mb-1 flex items-center gap-1">
                  Total Page Views
                  <span className="text-xs text-purple-500">↓ Click for details</span>
                </p>
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

        {/* Book of Amos Scroll Analytics */}
        {bookScrollStats && (
          <div ref={bookScrollRef} className="bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg shadow-2xl p-6 mb-8 text-white">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              📖 Book of Amos - Reading Engagement
            </h2>
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <p className="text-teal-100 text-sm mb-1">Total Readers</p>
                <p className="text-4xl font-bold">{bookScrollStats.total_readers}</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <p className="text-teal-100 text-sm mb-1">Average Scroll Depth</p>
                <p className="text-4xl font-bold text-yellow-300">
                  {bookScrollStats.average_depth}%
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <p className="text-teal-100 text-sm mb-1">Reached 75%+</p>
                <p className="text-4xl font-bold text-green-300">
                  {bookScrollStats.depth_distribution["75%"]}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <p className="text-teal-100 text-sm mb-1">Read to End (100%)</p>
                <p className="text-4xl font-bold text-pink-300">
                  {bookScrollStats.depth_distribution["100%"]}
                </p>
              </div>
            </div>
            
            {/* Scroll Depth Distribution */}
            <div className="bg-white/10 backdrop-blur rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">📊 Scroll Depth Distribution</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <span className="text-white font-semibold w-24">Reached 25%:</span>
                  <div className="flex-1 bg-white/20 rounded-full h-6 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full flex items-center justify-center text-xs font-bold text-gray-900"
                      style={{ 
                        width: `${bookScrollStats.total_readers > 0 ? (bookScrollStats.depth_distribution["25%"] / bookScrollStats.total_readers * 100) : 0}%`,
                        minWidth: '30px'
                      }}
                    >
                      {bookScrollStats.depth_distribution["25%"]}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-white font-semibold w-24">Reached 50%:</span>
                  <div className="flex-1 bg-white/20 rounded-full h-6 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-orange-400 to-orange-500 h-full flex items-center justify-center text-xs font-bold text-gray-900"
                      style={{ 
                        width: `${bookScrollStats.total_readers > 0 ? (bookScrollStats.depth_distribution["50%"] / bookScrollStats.total_readers * 100) : 0}%`,
                        minWidth: '30px'
                      }}
                    >
                      {bookScrollStats.depth_distribution["50%"]}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-white font-semibold w-24">Reached 75%:</span>
                  <div className="flex-1 bg-white/20 rounded-full h-6 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-500 h-full flex items-center justify-center text-xs font-bold text-gray-900"
                      style={{ 
                        width: `${bookScrollStats.total_readers > 0 ? (bookScrollStats.depth_distribution["75%"] / bookScrollStats.total_readers * 100) : 0}%`,
                        minWidth: '30px'
                      }}
                    >
                      {bookScrollStats.depth_distribution["75%"]}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-white font-semibold w-24">Read to End:</span>
                  <div className="flex-1 bg-white/20 rounded-full h-6 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-pink-400 to-pink-500 h-full flex items-center justify-center text-xs font-bold text-gray-900"
                      style={{ 
                        width: `${bookScrollStats.total_readers > 0 ? (bookScrollStats.depth_distribution["100%"] / bookScrollStats.total_readers * 100) : 0}%`,
                        minWidth: '30px'
                      }}
                    >
                      {bookScrollStats.depth_distribution["100%"]}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-white/20 rounded-lg">
                <p className="text-sm text-white/90 mb-2">
                  💡 <strong>Insight:</strong> {' '}
                  {bookScrollStats.total_readers === 0 ? (
                    "No reading data yet. Share the Book of Amos page to track engagement!"
                  ) : bookScrollStats.average_depth >= 75 ? (
                    `Great engagement! ${bookScrollStats.average_depth}% average scroll depth means readers are highly interested. Consider adding Chapter 2!`
                  ) : bookScrollStats.average_depth >= 50 ? (
                    `Moderate engagement. ${bookScrollStats.average_depth}% average scroll shows interest. Monitor for a few more days before adding Chapter 2.`
                  ) : (
                    `Lower engagement (${bookScrollStats.average_depth}% average). Consider improving the content or waiting for more data.`
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* AI Chat Stats Section */}
        {aiChatStats && (
          <div ref={aiChatStatsRef} className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg p-6 mb-8 text-white">
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
        <div ref={transactionsRef} className="bg-white rounded-lg shadow-lg p-6 mb-8">
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
        <div ref={pageViewsRef} className="bg-white rounded-lg shadow-lg p-6">
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

        {/* AI Richard Analytics */}
        <div ref={aiRichardStatsRef} className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🤖 AI Richard Analytics</h2>
          
          {aiRichardStats ? (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                  <div className="text-3xl font-bold">{aiRichardStats.overview.total_conversations}</div>
                  <div className="text-purple-100 text-sm">Total Conversations</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                  <div className="text-3xl font-bold">{aiRichardStats.overview.conversations_today}</div>
                  <div className="text-blue-100 text-sm">Today</div>
                </div>
                <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg p-4 text-white">
                  <div className="text-3xl font-bold">{aiRichardStats.overview.conversations_this_week}</div>
                  <div className="text-teal-100 text-sm">This Week</div>
                </div>
              </div>

              {/* Engagement Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-gray-600 text-sm mb-1">Total Messages</div>
                  <div className="text-2xl font-bold text-gray-800">{aiRichardStats.overview.total_messages}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-gray-600 text-sm mb-1">Avg Messages/Chat</div>
                  <div className="text-2xl font-bold text-gray-800">{aiRichardStats.overview.avg_messages_per_conversation}</div>
                </div>
              </div>

              {/* Hot Leads */}
              {aiRichardStats.hot_leads && aiRichardStats.hot_leads.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    🔥 Hot Leads 
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                      {aiRichardStats.hot_lead_count}
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {aiRichardStats.hot_leads.slice(0, 5).map((lead, idx) => (
                      <div key={idx} className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">
                            {new Date(lead.created_at).toLocaleString()}
                          </span>
                          <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">
                            {lead.message_count} messages
                          </span>
                        </div>
                        <div className="text-sm text-gray-700 italic">
                          "{lead.preview}..."
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Conversations */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">💬 Recent Conversations</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {aiRichardStats.recent_conversations.map((conv, idx) => (
                    <div 
                      key={idx} 
                      className={`border rounded-lg p-3 ${
                        conv.is_hot_lead ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">
                          {new Date(conv.created_at).toLocaleString()}
                        </span>
                        <div className="flex items-center gap-2">
                          {conv.is_hot_lead && (
                            <span className="text-xs bg-yellow-300 text-yellow-900 px-2 py-1 rounded font-semibold">
                              🔥 Hot Lead
                            </span>
                          )}
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                            {conv.message_count} msgs
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700">
                        {conv.preview}...
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤖</div>
              <p className="text-gray-500 text-lg">No conversations yet</p>
              <p className="text-gray-400 text-sm mt-2">AI Richard is ready to help visitors!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
