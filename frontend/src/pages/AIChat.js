import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Lock, Crown, TrendingUp } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState(null);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36)}`);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load usage stats on mount
  useEffect(() => {
    fetchUsageStats();
  }, []);

  const fetchUsageStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/ai-chat/usage`);
      const data = await res.json();
      setUsage(data);
    } catch (err) {
      console.error('Failed to fetch usage:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to UI
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/ai-chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          session_id: sessionId
        })
      });

      if (res.status === 429) {
        // Free tier limit reached
        const error = await res.json();
        setShowUpgradePrompt(true);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '⚠️ You\'ve reached your 3 free questions today. Upgrade to unlimited access for just $9.99/month!',
          isError: true
        }]);
      } else if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        
        // Update usage stats
        if (data.usage_remaining !== null) {
          setUsage(prev => ({
            ...prev,
            free_tier_remaining: data.usage_remaining,
            messages_today: (prev?.messages_today || 0) + 1
          }));
        }
      } else {
        throw new Error('Failed to get response');
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    const email = prompt('Enter your email for unlimited access:');
    if (!email) return;

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
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-purple-800/30 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">RJHNSN12 AI Assistant</h1>
                <p className="text-xs text-purple-300">Biblical Research & Hebrew Wisdom</p>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="text-right">
              {usage && !usage.subscription_active && (
                <div className="text-sm">
                  <span className="text-purple-300">Free tier:</span>
                  <span className="ml-2 font-bold text-yellow-400">
                    {usage.free_tier_remaining}/3 left today
                  </span>
                </div>
              )}
              {usage && usage.subscription_active && (
                <div className="flex items-center gap-2 text-sm">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-bold">UNLIMITED</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Banner */}
      {showUpgradePrompt && usage && !usage.subscription_active && (
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-3 px-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5" />
              <span className="font-semibold">Upgrade to unlimited biblical research for $9.99/month</span>
            </div>
            <button
              onClick={handleSubscribe}
              className="bg-white text-orange-600 px-4 py-2 rounded-lg font-bold hover:bg-orange-50 transition"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      {/* Welcome Message */}
      {messages.length === 0 && (
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="inline-block w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Ask Me Anything About Biblical Truth
            </h2>
            <p className="text-lg text-purple-200 mb-6">
              Specialized in Hebrew alphabet (20 letters), Torah research, and ancient biblical wisdom
            </p>
          </div>

          {/* Example Questions */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => setInput("What is the 20-letter Hebrew alphabet system?")}
              className="p-4 bg-purple-900/30 border border-purple-700/50 rounded-xl hover:bg-purple-800/40 transition text-left"
            >
              <div className="text-purple-300 text-sm mb-1">Example Question:</div>
              <div className="text-white">What is the 20-letter Hebrew alphabet system?</div>
            </button>
            <button
              onClick={() => setInput("Tell me about the Book of Amos translation")}
              className="p-4 bg-purple-900/30 border border-purple-700/50 rounded-xl hover:bg-purple-800/40 transition text-left"
            >
              <div className="text-purple-300 text-sm mb-1">Example Question:</div>
              <div className="text-white">Tell me about the Book of Amos translation</div>
            </button>
          </div>

          {/* Pricing Info */}
          <div className="bg-slate-900/50 border border-purple-700/30 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold mb-2">💎 Free Tier</h3>
                <p className="text-purple-200">3 questions per day</p>
              </div>
              <div className="text-right">
                <h3 className="text-lg font-bold mb-2 text-yellow-400">👑 Unlimited Access</h3>
                <p className="text-purple-200 mb-2">$9.99/month</p>
                <button
                  onClick={handleSubscribe}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2 rounded-lg font-bold hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg"
                >
                  Subscribe Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      {messages.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="space-y-4 mb-24">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : msg.isError
                      ? 'bg-red-900/30 border border-red-700/50 text-red-200'
                      : 'bg-slate-800/80 border border-purple-700/30 text-purple-50'
                  }`}
                >
                  {msg.role === 'assistant' && !msg.isError && (
                    <div className="flex items-center gap-2 mb-2 text-purple-300 text-sm">
                      <Sparkles className="w-4 h-4" />
                      <span>RJHNSN12 AI</span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-800/80 border border-purple-700/30 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 text-purple-300">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Input Form - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-sm border-t border-purple-800/30 py-4">
        <div className="max-w-4xl mx-auto px-4">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Hebrew alphabet, Torah, biblical research..."
              className="flex-1 bg-slate-800 border border-purple-700/50 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>

          {/* Usage indicator */}
          {usage && !usage.subscription_active && (
            <div className="mt-3 text-center text-sm text-purple-300">
              {usage.free_tier_remaining > 0 ? (
                <span>💎 {usage.free_tier_remaining} free questions remaining today</span>
              ) : (
                <button
                  onClick={handleSubscribe}
                  className="text-yellow-400 hover:text-yellow-300 underline font-semibold"
                >
                  ⚠️ Free tier used up. Upgrade to unlimited for $9.99/month →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
