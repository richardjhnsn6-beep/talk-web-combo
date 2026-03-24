import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OrdersDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if logged in (using same key as AdminLogin component)
    const isLoggedIn = sessionStorage.getItem('admin_authenticated');
    if (!isLoggedIn) {
      navigate('/admin');
      return;
    }

    fetchOrders();
    fetchStats();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      const url = filter === 'all' 
        ? `${process.env.REACT_APP_BACKEND_URL}/api/website-orders/orders`
        : `${process.env.REACT_APP_BACKEND_URL}/api/website-orders/orders?status=${filter}`;
      
      const response = await fetch(url);
      const data = await response.json();
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/website-orders/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/website-orders/orders/${orderId}/update-status?new_status=${newStatus}`,
        { method: 'POST' }
      );
      
      if (response.ok) {
        fetchOrders();
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  const buildThisWebsite = (order) => {
    // Create pre-filled Emergent prompt
    const prompt = `Build a ${order.package_name} for ${order.customer_name}

**Customer Contact:**
- Name: ${order.customer_name}
- Email: ${order.customer_email}
- Phone: ${order.customer_phone || 'Not provided'}

**Project Description:**
${order.project_description}

**Requirements:**
${Object.entries(order.requirements || {}).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

**Delivery:**
- Paid: $${order.price}
- Status: Ready to build
- Expected delivery: 2-4 weeks

Please build this website now.`;

    // Copy to clipboard
    navigator.clipboard.writeText(prompt);
    
    // Update order status to in_progress
    updateOrderStatus(order.order_id, 'in_progress');
    
    alert('✅ Requirements copied to clipboard!\n\nNow:\n1. Open a new Emergent chat\n2. Paste the requirements\n3. Let Emergent build it\n\nOrder status updated to "In Progress"');
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending_payment': 'bg-yellow-100 text-yellow-800',
      'paid': 'bg-green-100 text-green-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Website Orders Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your web development orders</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Total Orders</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">{stats.total_orders}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Paid Orders</div>
              <div className="mt-2 text-3xl font-bold text-green-600">{stats.paid_orders}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">In Progress</div>
              <div className="mt-2 text-3xl font-bold text-blue-600">{stats.in_progress}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Completed</div>
              <div className="mt-2 text-3xl font-bold text-purple-600">{stats.completed}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Total Revenue</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">${stats.total_revenue.toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-wrap gap-2">
            {['all', 'paid', 'in_progress', 'completed', 'delivered'].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === filterOption
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterOption.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-gray-400 text-lg">No orders found</div>
              <p className="text-gray-500 mt-2">Orders will appear here when customers place them</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.order_id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{order.package_name}</h3>
                      <p className="text-gray-600 mt-1">Order ID: {order.order_id.substring(0, 8)}...</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">${order.price}</div>
                      <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Customer Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Name:</span>
                        <div className="font-medium">{order.customer_name}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <div className="font-medium">{order.customer_email}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Phone:</span>
                        <div className="font-medium">{order.customer_phone || 'Not provided'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Project Description */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Project Description</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{order.project_description}</p>
                  </div>

                  {/* Requirements */}
                  {order.requirements && Object.keys(order.requirements).length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {Object.entries(order.requirements).map(([key, value]) => (
                          <li key={key}><span className="font-medium">{key}:</span> {value}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 mt-6">
                    {order.status === 'paid' && (
                      <button
                        onClick={() => buildThisWebsite(order)}
                        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Build This Website
                      </button>
                    )}
                    
                    {order.status === 'in_progress' && (
                      <button
                        onClick={() => updateOrderStatus(order.order_id, 'completed')}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        Mark as Completed
                      </button>
                    )}
                    
                    {order.status === 'completed' && (
                      <button
                        onClick={() => updateOrderStatus(order.order_id, 'delivered')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Mark as Delivered
                      </button>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className="mt-4 text-sm text-gray-500">
                    Created: {new Date(order.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersDashboard;
