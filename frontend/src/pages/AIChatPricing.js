import React, { useState } from 'react';
import { Check, Crown, Sparkles, TrendingUp, DollarSign } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function AIChatPricing() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || loading) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/ai-chat/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, plan: 'unlimited' })
      });

      const data = await res.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (err) {
      alert('Failed to start subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI-Powered Biblical Research
          </h1>
          <p className="text-lg text-purple-200 max-w-2xl mx-auto">
            Get instant answers about Hebrew alphabet, Torah wisdom, and ancient biblical truth
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Free Tier */}
          <div className="bg-slate-900/50 border border-purple-700/30 rounded-2xl p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-purple-900/50 px-4 py-2 rounded-full mb-4">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="font-bold text-purple-300">Free Tier</span>
              </div>
              <div className="text-5xl font-bold mb-2">$0</div>
              <div className="text-purple-300">Forever free</div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span>3 questions per day</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span>Biblical research AI</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span>Hebrew alphabet insights</span>
              </li>
              <li className="flex items-center gap-3 opacity-50">
                <Check className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span>Standard response time</span>
              </li>
            </ul>

            <a
              href="/ai-chat"
              className="w-full block text-center bg-purple-800/50 border border-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700/50 transition"
            >
              Try Free
            </a>
          </div>

          {/* Unlimited Tier */}
          <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500/50 rounded-2xl p-8 relative overflow-hidden">
            {/* "Most Popular" badge */}
            <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold">
              MOST POPULAR
            </div>

            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-yellow-600/30 px-4 py-2 rounded-full mb-4">
                <Crown className="w-5 h-5 text-yellow-400" />
                <span className="font-bold text-yellow-300">Unlimited Access</span>
              </div>
              <div className="text-5xl font-bold mb-2">
                $9.99<span className="text-2xl text-purple-300">/month</span>
              </div>
              <div className="text-yellow-300">Cancel anytime</div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <span className="font-semibold">UNLIMITED questions</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <span className="font-semibold">Priority AI responses</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <span className="font-semibold">Deep biblical research</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <span className="font-semibold">Faster response times</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <span className="font-semibold">Support biblical scholarship</span>
              </li>
            </ul>

            <form onSubmit={handleSubscribe}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full bg-slate-900/50 border border-yellow-600/50 rounded-lg px-4 py-3 text-white placeholder-purple-400/60 focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-4"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-4 rounded-xl font-bold text-lg hover:from-yellow-600 hover:to-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Crown className="w-5 h-5" />
                Subscribe Now
              </button>
            </form>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-6">Why Subscribe?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-900/30 border border-purple-700/30 rounded-xl p-6">
              <TrendingUp className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h4 className="font-bold mb-2">Unlimited Learning</h4>
              <p className="text-sm text-purple-300">
                Ask as many questions as you need to deepen your biblical knowledge
              </p>
            </div>
            <div className="bg-slate-900/30 border border-purple-700/30 rounded-xl p-6">
              <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h4 className="font-bold mb-2">AI-Powered Research</h4>
              <p className="text-sm text-purple-300">
                Decades of biblical scholarship combined with cutting-edge AI
              </p>
            </div>
            <div className="bg-slate-900/30 border border-purple-700/30 rounded-xl p-6">
              <DollarSign className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h4 className="font-bold mb-2">Support The Ministry</h4>
              <p className="text-sm text-purple-300">
                Your subscription helps fund biblical research and translation work
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
