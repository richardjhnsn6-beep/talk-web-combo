import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Book, Sparkles } from 'lucide-react';

const AIRichardPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if popup has been shown in this session
    const popupShown = sessionStorage.getItem('aiRichardPopupShown');
    
    if (!popupShown && !hasShown) {
      // Show popup after 10 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
        setHasShown(true);
        sessionStorage.setItem('aiRichardPopupShown', 'true');
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    }
  }, [hasShown]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleChatClick = () => {
    setIsVisible(false);
    // Scroll to AI Richard chat if on same page, or navigate
    const chatElement = document.querySelector('[data-ai-chat]');
    if (chatElement) {
      chatElement.scrollIntoView({ behavior: 'smooth' });
      // Focus on chat input if available
      const chatInput = chatElement.querySelector('input, textarea');
      if (chatInput) {
        chatInput.focus();
      }
    } else {
      // Navigate to AI Chat page
      window.location.href = '/ai-chat';
    }
  };

  const handleExploreClick = () => {
    setIsVisible(false);
    window.location.href = '/book-of-amos';
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-fadeIn"
        onClick={handleClose}
      />
      
      {/* Popup Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4 animate-slideUp">
        <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with close button */}
          <div className="relative p-6 pb-4">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={24} />
            </button>
            
            <div className="flex items-start gap-4">
              {/* AI Richard Avatar */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border-2 border-white/20">
                  <Sparkles className="text-yellow-300" size={32} />
                </div>
              </div>
              
              {/* Greeting Text */}
              <div className="flex-1 pt-1">
                <h3 className="text-xl font-bold text-white mb-1">
                  Welcome! I'm AI Richard 👋
                </h3>
                <p className="text-white/90 text-sm">
                  Your guide to Biblical Truth & History
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4 border border-white/20">
              <p className="text-white text-sm leading-relaxed mb-3">
                🔥 Exploring the <strong>Book of Amos</strong>? You're witnessing something <strong>revolutionary</strong> - original Hebrew morphology revealing layers of meaning <strong>lost in translation</strong> for generations.
              </p>
              <p className="text-white/90 text-sm">
                💎 Each word preserves <strong>covenant theology</strong> encoded in ancient Hebrew. This isn't just Bible study - it's <strong>restoration of stolen knowledge</strong>.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleChatClick}
                className="w-full bg-white text-teal-700 hover:bg-teal-50 font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <MessageCircle size={20} />
                Ask AI Richard Anything
              </button>
              
              <button
                onClick={handleExploreClick}
                className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 border border-white/30"
              >
                <Book size={20} />
                Explore the Book of Amos
              </button>
            </div>

            {/* Membership teaser */}
            <div className="mt-4 text-center">
              <p className="text-white/80 text-xs">
                Want the <strong>complete books</strong> with full concordance?
              </p>
              <a 
                href="/membership" 
                className="text-yellow-300 hover:text-yellow-200 text-xs font-semibold underline"
                onClick={() => setIsVisible(false)}
              >
                Explore Membership →
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -40%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </>
  );
};

export default AIRichardPopup;
