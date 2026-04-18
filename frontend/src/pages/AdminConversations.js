import React, { useState, useEffect } from 'react';
import { MessageSquare, User, Bot, Clock, Search, RefreshCw } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function AdminConversations() {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch(`${API_URL}/api/ai-richard/admin/conversations`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm) return true;
    const messages = conv.messages || [];
    return messages.some(msg => 
      msg.text?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-gray-800">💬 AI Richard Conversations</h1>
              </div>
              <p className="text-gray-600">Monitor all visitor conversations with AI Richard</p>
            </div>
            <button
              onClick={fetchConversations}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-3xl font-bold text-gray-800">{conversations.length}</p>
                <p className="text-sm text-gray-600">Total Conversations</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <User className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-3xl font-bold text-gray-800">
                  {conversations.reduce((sum, conv) => sum + (conv.messages?.length || 0), 0)}
                </p>
                <p className="text-sm text-gray-600">Total Messages</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-3xl font-bold text-gray-800">
                  {conversations.filter(c => {
                    const lastMsg = c.updated_at || c.created_at;
                    return lastMsg && (new Date() - new Date(lastMsg)) < 86400000; // 24 hours
                  }).length}
                </p>
                <p className="text-sm text-gray-600">Last 24 Hours</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Conversation List */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200 p-4">
              <h2 className="text-lg font-bold text-gray-800">Conversations ({filteredConversations.length})</h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {filteredConversations.map((conv) => {
                const firstMessage = conv.messages?.[0]?.text || 'No messages';
                const messageCount = conv.messages?.length || 0;
                const lastUpdate = conv.updated_at || conv.created_at;

                return (
                  <div
                    key={conv.conversation_id}
                    onClick={() => setSelectedConv(conv)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedConv?.conversation_id === conv.conversation_id
                        ? 'bg-purple-50 border-l-4 border-purple-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-600" />
                        <span className="font-mono text-xs text-gray-500">
                          {conv.conversation_id?.slice(0, 8)}...
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{messageCount} msgs</span>
                    </div>
                    <p className="text-sm text-gray-800 truncate mb-1">{firstMessage}</p>
                    <p className="text-xs text-gray-500">{formatDate(lastUpdate)}</p>
                  </div>
                );
              })}

              {filteredConversations.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No conversations found</p>
                </div>
              )}
            </div>
          </div>

          {/* Selected Conversation Details */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200 p-4">
              <h2 className="text-lg font-bold text-gray-800">
                {selectedConv ? 'Conversation Details' : 'Select a conversation'}
              </h2>
            </div>
            
            {selectedConv ? (
              <div className="p-4 max-h-[600px] overflow-y-auto space-y-4">
                {/* Conversation Info */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span className="font-semibold">Started:</span>
                    <span className="text-gray-700">{formatDate(selectedConv.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MessageSquare className="w-4 h-4 text-gray-600" />
                    <span className="font-semibold">Messages:</span>
                    <span className="text-gray-700">{selectedConv.messages?.length || 0}</span>
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-3">
                  {(selectedConv.messages || []).map((msg, idx) => (
                    <div
                      key={idx}
                      className={`rounded-lg p-4 ${
                        msg.role === 'user'
                          ? 'bg-blue-50 border-l-4 border-blue-600'
                          : 'bg-purple-50 border-l-4 border-purple-600'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {msg.role === 'user' ? (
                          <User className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Bot className="w-5 h-5 text-purple-600" />
                        )}
                        <span className="font-bold text-sm">
                          {msg.role === 'user' ? 'Visitor' : 'AI Richard'}
                        </span>
                        <span className="text-xs text-gray-500 ml-auto">
                          {formatDate(msg.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-800 whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p>Click on a conversation to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
