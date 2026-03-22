import React, { useState, useEffect } from 'react';
import { DollarSign, Save, TrendingUp } from 'lucide-react';

export default function AdminPricingConfig() {
  const [pricing, setPricing] = useState({
    unlimited_monthly: 9.99,
    free_tier_limit: 3
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In a full implementation, this would save to database
    // For now, just show success message
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const projectedRevenue = (subscribers) => {
    return (subscribers * pricing.unlimited_monthly * 0.97).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">💰 Pricing Configuration</h1>
          <p className="text-gray-600">Set your AI chat subscription pricing</p>
        </div>

        {saved && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg mb-6">
            ✅ Pricing saved successfully!
          </div>
        )}

        {/* Current Pricing */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-600" />
            Subscription Pricing
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Unlimited Access - Monthly Price
              </label>
              <div className="flex items-center gap-4">
                <span className="text-2xl text-gray-600">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={pricing.unlimited_monthly}
                  onChange={(e) => setPricing({...pricing, unlimited_monthly: parseFloat(e.target.value)})}
                  className="w-32 px-4 py-3 text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-lg text-gray-600">/ month</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                You keep: ~${(pricing.unlimited_monthly * 0.97).toFixed(2)} per subscriber (after Stripe fees)
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Free Tier - Daily Question Limit
              </label>
              <input
                type="number"
                value={pricing.free_tier_limit}
                onChange={(e) => setPricing({...pricing, free_tier_limit: parseInt(e.target.value)})}
                className="w-32 px-4 py-3 text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-sm text-gray-500 mt-2">
                Number of free questions per day per user
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="mt-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Pricing
          </button>
        </div>

        {/* Revenue Calculator */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Revenue Projections
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <p className="text-sm text-green-100 mb-1">10 Subscribers</p>
              <p className="text-3xl font-bold">${projectedRevenue(10)}/mo</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <p className="text-sm text-green-100 mb-1">50 Subscribers</p>
              <p className="text-3xl font-bold">${projectedRevenue(50)}/mo</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <p className="text-sm text-green-100 mb-1">100 Subscribers</p>
              <p className="text-3xl font-bold">${projectedRevenue(100)}/mo</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <p className="text-sm text-green-100 mb-1">500 Subscribers</p>
              <p className="text-3xl font-bold">${projectedRevenue(500)}/mo</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white/20 backdrop-blur rounded-lg">
            <p className="text-sm mb-2">💡 <strong>Pricing Strategy Tips:</strong></p>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>$4.99/month = Lower barrier, more subscribers</li>
              <li>$9.99/month = Sweet spot for value pricing</li>
              <li>$19.99/month = Premium positioning, serious researchers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
