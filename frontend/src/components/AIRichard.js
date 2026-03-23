import React, { useState, useEffect, useRef } from 'react';

const AIRichard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initial greeting when opened for first time
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "Hello! I'm Richard Johnson, biblical Hebrew researcher and web developer. I can help you with:\n\n📖 My Hebrew research and Book of Amos translation\n💬 AI Chat subscriptions\n🎵 The radio station\n💻 Professional website development\n\nWhat brings you here today?"
      }]);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/ai-richard/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversation_id: conversationId,
          page_context: window.location.pathname
        })
      });

      const data = await response.json();
      
      setConversationId(data.conversation_id);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response 
      }]);
    } catch (error) {
      console.error('AI Richard error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment or email me directly at the contact information on the site." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating button - Always visible - MOVED TO BOTTOM-LEFT */}
      {!isOpen && (
        <div 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-50 cursor-pointer group"
        >
          {/* Avatar circle */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 p-1 shadow-2xl group-hover:scale-110 transition-transform duration-300">
              <div className="w-full h-full rounded-full bg-white overflow-hidden">
                {/* Photo from business card - using placeholder for now, will add actual photo */}
                <img 
                  src="https://customer-assets.emergentagent.com/job_talk-web-combo/artifacts/ekj6e45z_IMG_1807.png"
                  alt="Richard Johnson"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: '50% 20%' }}
                />
              </div>
            </div>
            
            {/* Online status indicator */}
            <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            
            {/* Pulse animation */}
            <div className="absolute inset-0 rounded-full bg-purple-400 opacity-0 group-hover:opacity-30 animate-ping"></div>
          </div>
          
          {/* Label */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl whitespace-nowrap text-sm">
              💬 Need help? Chat with Richard
              <div className="absolute top-full right-4 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-gray-900"></div>
            </div>
          </div>
        </div>
      )}

      {/* Chat window - MOVED TO BOTTOM-LEFT */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white overflow-hidden border-2 border-white">
                <img 
                  src="https://customer-assets.emergentagent.com/job_talk-web-combo/artifacts/ekj6e45z_IMG_1807.png"
                  alt="Richard Johnson"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: '50% 20%' }}
                />
              </div>
              <div className="text-white">
                <div className="font-bold">Richard Johnson</div>
                <div className="text-xs opacity-90">Biblical Researcher & Web Developer</div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user' 
                    ? 'bg-purple-600 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 shadow-md rounded-bl-none border border-gray-200'
                }`}>
                  <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 rounded-2xl rounded-bl-none px-4 py-3 shadow-md border border-gray-200">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIRichard;
