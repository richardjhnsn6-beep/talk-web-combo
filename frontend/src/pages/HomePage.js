import React, { useState } from 'react';
import { Download, Smartphone } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white" data-testid="homepage">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-600 py-8 px-8 shadow-lg">
        <h1 className="text-4xl md:text-5xl font-bold text-yellow-300 text-center" data-testid="page-title">
          Rjhnsn12 Expounding The Name of Lord God
        </h1>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        {/* PWA Install Banner - Mobile Only */}
        <div className="md:hidden mb-6">
          <a 
            href="/install"
            className="block bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg p-4 hover:from-purple-700 hover:to-pink-700 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold">📱 Install Our App</p>
                <p className="text-sm text-purple-100">Quick access to AI chat & radio!</p>
              </div>
              <Download className="w-5 h-5" />
            </div>
          </a>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          
          {/* 🔊 TEST AI RICHARD VOICE - Big Visible Button */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl p-6 mb-8 text-center shadow-lg">
            <h3 className="text-2xl font-bold text-white mb-2">🎤 Hear AI Richard's Voice</h3>
            <p className="text-white/90 mb-4">Preview the female AI voice before subscribing</p>
            <button
              onClick={async () => {
                try {
                  const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/tts/tts`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      text: "Hello, I'm AI Richard. Welcome to RJHNSN12 Radio, where we reveal the original Hebrew truth that's been hidden for centuries. Ask me anything about the Bible, Hebrew language, or ancient scripture.",
                      voice: 'nova'
                    })
                  });
                  const audioBlob = await response.blob();
                  const audioUrl = URL.createObjectURL(audioBlob);
                  const audio = new Audio(audioUrl);
                  audio.play();
                  audio.onended = () => URL.revokeObjectURL(audioUrl);
                } catch (error) {
                  console.error('Voice test failed:', error);
                  alert('Voice test failed. Check your internet connection.');
                }
              }}
              className="bg-white text-purple-700 px-8 py-4 rounded-lg font-bold text-lg hover:bg-purple-50 transition-all shadow-lg hover:scale-105"
            >
              ▶️ Play Sample Voice
            </button>
          </div>

          <div className="mb-8">
            <a href="/book-of-amos" className="block">
              <img 
                src="https://static.prod-images.emergentagent.com/jobs/dae91dca-f806-499e-ba09-9fd13250539c/images/485ee5484e46ee0129440753c53f3fa24ae14f946532c2df14c0474155b1308d.png" 
                alt="Unlock the Book of Amos - Ancient Biblical Wisdom"
                className="w-full h-64 object-cover rounded-lg shadow-md mb-6 hover:shadow-xl transition-shadow cursor-pointer"
                data-testid="hero-image"
              />
            </a>
          </div>

          {/* Radio Notice for Video */}
          <div className="bg-purple-100 border-l-4 border-purple-600 rounded-lg p-4 mb-6">
            <p className="text-purple-900 font-semibold flex items-center gap-2 justify-center">
              <span className="text-2xl">🎵</span>
              <span>Listening to our radio? Pause the player at the bottom before watching this video!</span>
              <span className="text-2xl">⏸️</span>
            </p>
          </div>

          {/* Main Theme Video - 3D Egyptian Temple */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-teal-700 mb-4">Journey Through Ancient Egypt</h3>
            <p className="text-gray-700 mb-4 italic">
              <strong>Rjhnsn12 Original:</strong> 3D Egyptian temple journey - Experience the ancient stones and sacred spaces with music
            </p>
            <div className="max-w-md mx-auto">
              <div className="relative" style={{ paddingBottom: '56.25%' }} data-testid="video-player-theme">
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                  src="https://drive.google.com/file/d/0B73CQ06mcqAYOEhrdVp2Tm51YXc/preview"
                  title="Egyptian Temple Journey"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-teal-800 mb-4" data-testid="section-title">
            Hebrew writings of the Torah Reveal's Truth
          </h2>
          
          <div className="prose max-w-none text-gray-700 leading-relaxed mb-8" data-testid="intro-text">
            <p className="text-lg mb-4">
              Hebrew translater, I write the bible in the original, weaving out the traditions, 
              giving You the first image of understanding. 
              Website <a href={window.location.origin} className="text-teal-700 font-semibold hover:text-teal-900">{window.location.origin}</a>
              <br/>
              Beaumont, Texas 77703 
              Email richardjhnsn6@gmail.com from what I will give you, 
              it will help battle against people that only want to profit. when the True Fire 
              comes he is Eternal'
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
