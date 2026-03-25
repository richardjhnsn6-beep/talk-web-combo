import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Crown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState(null);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36)}`);
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on AI chat pages (they have full interface)
  const hideOnPaths = ['/ai-chat', '/ai-chat/pricing'];
  const shouldHide = hideOnPaths.some(path => location.pathname.startsWith(path));

  // Fetch usage when opening chat - must be called before any conditional returns
  useEffect(() => {
    if (isOpen && !usage && !shouldHide) {
      fetchUsage();
    }
  }, [isOpen, shouldHide]);

  // Early return AFTER all hooks are called
  if (shouldHide) {
    return null;
  }

  const fetchUsage = async () => {
    try {
      const res = await fetch(`${API_URL}/api/ai-chat/usage`);
      const data = await res.json();
      setUsage(data);
    } catch (err) {
      console.error('Failed to fetch usage:', err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/ai-chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, session_id: sessionId })
      });

      if (res.status === 429) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '⚠️ Free tier limit reached. Click "Upgrade" for unlimited access!',
          isError: true
        }]);
      } else if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        if (data.usage_remaining !== null) {
          setUsage(prev => ({ ...prev, free_tier_remaining: data.usage_remaining }));
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full shadow-2xl hover:scale-110 transition-transform z-50 flex items-center justify-center"
          aria-label="Open AI Chat"
        >
          <MessageCircle className="w-6 h-6" />
          {usage && !usage.subscription_active && usage.free_tier_remaining > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 text-black text-xs font-bold rounded-full flex items-center justify-center">
              {usage.free_tier_remaining}
            </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-widget-container fixed bottom-6 right-6 w-96 h-[600px] bg-slate-900 border border-purple-700/50 rounded-2xl shadow-2xl z-50 flex flex-col landscape:h-[85vh] landscape:bottom-2 landscape:right-2 landscape:w-[28rem]">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-bold">RJHNSN12 AI</span>
            </div>
            <div className="flex items-center gap-3">
              {usage && !usage.subscription_active && (
                <span className="text-xs bg-white/20 px-2 py-1 rounded">
                  {usage.free_tier_remaining}/3 free
                </span>
              )}
              {usage && usage.subscription_active && (
                <Crown className="w-4 h-4 text-yellow-400" />
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-purple-300 text-sm py-8">
                <p className="mb-2">Ask me about:</p>
                <p>• Hebrew alphabet (20 letters)</p>
                <p>• Torah wisdom</p>
                <p>• Biblical research</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : msg.isError
                      ? 'bg-red-900/30 text-red-200'
                      : 'bg-slate-800 text-purple-50'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 p-3 rounded-xl text-sm text-purple-300">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-purple-700/30">
            <form onSubmit={handleSend} className="flex gap-2 mb-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 bg-slate-800 border border-purple-700/50 rounded-lg px-3 py-2 text-white text-sm placeholder-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            
            {usage && !usage.subscription_active && (
              <button
                onClick={() => navigate('/ai-chat/pricing')}
                className="w-full text-xs text-yellow-400 hover:text-yellow-300 underline"
              >
                Upgrade to unlimited for $9.99/month
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
