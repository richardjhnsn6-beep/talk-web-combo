import React from 'react';

const TestVoice = () => {
  return (
    <div className="min-h-screen bg-purple-900 flex items-center justify-center p-8">
      <div className="bg-white rounded-3xl p-12 text-center shadow-2xl max-w-2xl">
        <h1 className="text-5xl font-bold text-purple-700 mb-6">🎤 AI Richard Voice Test</h1>
        <p className="text-2xl text-gray-700 mb-8">Click the button below to hear Nova's voice</p>
        
        <button
          onClick={async (e) => {
            try {
              e.target.disabled = true;
              e.target.style.opacity = '0.5';
              e.target.textContent = '⏳ Loading voice...';
              
              const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/tts/tts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  text: "Hello, I'm AI Richard. Welcome to RJHNSN12 Radio, where we reveal the original Hebrew truth. Ask me anything about the Bible or ancient scripture.",
                  voice: 'nova'
                })
              });
              
              const audioBlob = await response.blob();
              const audioUrl = URL.createObjectURL(audioBlob);
              const audio = new Audio(audioUrl);
              
              e.target.textContent = '🔊 Playing...';
              await audio.play();
              
              audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                e.target.disabled = false;
                e.target.style.opacity = '1';
                e.target.textContent = '▶️ PLAY AGAIN';
              };
              
            } catch (error) {
              console.error('Voice failed:', error);
              alert('Voice test failed. Error: ' + error.message);
              e.target.disabled = false;
              e.target.style.opacity = '1';
              e.target.textContent = '▶️ PLAY VOICE';
            }
          }}
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-20 py-8 rounded-2xl font-bold text-3xl hover:from-pink-600 hover:to-purple-700 transition-all shadow-2xl cursor-pointer"
        >
          ▶️ PLAY VOICE
        </button>
        
        <p className="text-gray-500 mt-8 text-sm">Premium female AI voice (Nova) - Listen to how she sounds!</p>
      </div>
    </div>
  );
};

export default TestVoice;
