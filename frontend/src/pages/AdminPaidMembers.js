import React, { useState, useEffect } from 'react';
import { DollarSign, Users, TrendingUp, Plus, Trash2, Edit2 } from 'lucide-react';

const AdminPaidMembers = () => {
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    tier: 'Grandfathered - Lifetime Access',
    payment_amount: 0.00,
    payment_method: 'Grandfathered',
    payment_date: new Date().toISOString().split('T')[0]
  });

  const TIERS = [
    { name: 'Grandfathered - Lifetime Access', amount: 0.00 },
    { name: '$2 Basic', amount: 2.00 },
    { name: '$5 Premium', amount: 5.00 },
    { name: '$9.99 AI Chat', amount: 9.99 },
    { name: '$14 Amos Discount', amount: 14.00 },
    { name: '$20 Amos Complete', amount: 20.00 }
  ];

  useEffect(() => {
    fetchMembers();
    fetchStats();
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchMembers();
      fetchStats();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/paid-members/list`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setMembers(data.members || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching members:', err);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/paid-members/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/paid-members/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to add member');
      }

      const data = await response.json();
      alert(`✅ ${data.message}`);
      
      // Reset form
      setFormData({
        email: '',
        name: '',
        tier: 'Grandfathered - Lifetime Access',
        payment_amount: 0.00,
        payment_method: 'Grandfathered',
        payment_date: new Date().toISOString().split('T')[0]
      });
      setShowAddForm(false);
      
      // Refresh data
      fetchMembers();
      fetchStats();
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  const handleTierChange = (tier) => {
    const selectedTier = TIERS.find(t => t.name === tier);
    setFormData({
      ...formData,
      tier: tier,
      payment_amount: selectedTier ? selectedTier.amount : 0
    });
  };

  const handleRemoveMember = async (email) => {
    if (!window.confirm(`Remove ${email} from paid members?`)) return;
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/paid-members/remove/${encodeURIComponent(email)}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to remove member');
      
      alert(`✅ Removed ${email}`);
      fetchMembers();
      fetchStats();
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">💰 Paid Members Management</h1>
          <p className="text-gray-600">Track PayPal and Gumroad subscribers</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Paid Members</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total_members}</p>
                </div>
                <Users className="text-blue-500" size={40} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-600">${stats.total_revenue}</p>
                </div>
                <DollarSign className="text-green-500" size={40} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Monthly Recurring</p>
                  <p className="text-3xl font-bold text-purple-600">${stats.monthly_recurring_revenue}</p>
                  <p className="text-xs text-gray-400">Subscriptions only</p>
                </div>
                <TrendingUp className="text-purple-500" size={40} />
              </div>
            </div>
          </div>
        )}

        {/* Add Member Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            {showAddForm ? 'Cancel' : 'Add Paid Member'}
          </button>
        </div>

        {/* Add Member Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">➕ Add New Paid Member</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">👑 Grandfathered Members:</span> Select "Grandfathered - Lifetime Access" for members who 
                joined before the paid system. They get lifetime access with special status at $0.
              </p>
            </div>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="customer@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tier *
                  </label>
                  <select
                    value={formData.tier}
                    onChange={(e) => handleTierChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {TIERS.map(tier => (
                      <option key={tier.name} value={tier.name}>{tier.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.payment_amount}
                    onChange={(e) => setFormData({ ...formData, payment_amount: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Method *
                  </label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Grandfathered">Grandfathered (Lifetime)</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Gumroad">Gumroad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
              >
                ✅ Add Member
              </button>
            </form>
          </div>
        )}

        {/* Members List */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold">📋 All Paid Members ({members.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tier</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Payment Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      No paid members yet. Add your first member above!
                    </td>
                  </tr>
                ) : (
                  members.map((member, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{member.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{member.name || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          member.tier === 'Grandfathered - Lifetime Access'
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {member.tier === 'Grandfathered - Lifetime Access' ? '👑 ' : ''}
                          {member.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">
                        ${member.payment_amount}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{member.payment_method}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(member.payment_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          member.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleRemoveMember(member.email)}
                          className="text-red-600 hover:text-red-800 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tier Breakdown */}
        {stats && stats.tier_breakdown && Object.keys(stats.tier_breakdown).length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
            <h3 className="text-xl font-bold mb-4">📊 Members by Tier</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(stats.tier_breakdown).map(([tier, count]) => (
                <div key={tier} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{count}</p>
                  <p className="text-sm text-gray-600">{tier}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPaidMembers;
