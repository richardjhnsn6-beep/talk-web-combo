import React, { useState } from 'react';

const WakeServer = () => {
  const [lastPing, setLastPing] = useState(null);
  const [pinging, setPinging] = useState(false);

  const handleWakeServer = async () => {
    setPinging(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/health`);
      if (response.ok) {
        setLastPing(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error('Wake ping failed:', error);
    } finally {
      setPinging(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #0f766e 0%, #0e7490 50%, #7e22ce 100%)'
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
          RJHNSN12
        </h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Server Wake-Up
        </h2>

        <button
          onClick={handleWakeServer}
          disabled={pinging}
          className={`w-full py-8 px-6 rounded-2xl text-2xl font-bold text-white shadow-lg transform transition-all duration-200 ${
            pinging
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-105 active:scale-95'
          }`}
        >
          {pinging ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-8 w-8 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Waking...
            </span>
          ) : (
            <>
              ⚡ WAKE UP SERVER
            </>
          )}
        </button>

        {lastPing && (
          <div className="mt-6 p-4 bg-green-50 rounded-xl border-2 border-green-200">
            <p className="text-green-800 font-semibold">
              ✅ Server Awake!
            </p>
            <p className="text-green-600 text-sm mt-1">
              Last ping: {lastPing}
            </p>
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-50 rounded-xl">
          <p className="text-gray-700 text-sm font-medium mb-2">
            📱 Bookmark this page on your phone!
          </p>
          <p className="text-gray-600 text-xs">
            Tap the button anytime to keep your server awake - even while driving!
          </p>
        </div>

        <div className="mt-6">
          <a
            href="/"
            className="text-purple-600 hover:text-purple-800 font-semibold text-sm"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default WakeServer;
