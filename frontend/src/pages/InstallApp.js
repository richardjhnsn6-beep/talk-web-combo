import React, { useState, useEffect } from 'react';
import { Smartphone, Download, Radio, Sparkles, Crown, CheckCircle } from 'lucide-react';

export default function InstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches 
      || window.navigator.standalone;
    
    setIsStandalone(isInStandaloneMode);
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setInstallSuccess(true);
    }
    
    setDeferredPrompt(null);
  };

  if (isStandalone) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 text-white flex items-center justify-center px-4">
        <div className="text-center max-w-2xl">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">✅ App Already Installed!</h1>
          <p className="text-lg text-purple-200 mb-8">
            You're using the RJHNSN12 app. Enjoy 24/7 AI chat and radio!
          </p>
          <a
            href="/"
            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 mx-auto mb-6">
            <img src="/logo192.png" alt="RJHNSN12" className="w-full h-full rounded-3xl shadow-2xl" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Install RJHNSN12 App
          </h1>
          <p className="text-lg text-purple-200 max-w-2xl mx-auto">
            Get the full experience on your phone - AI chat, 24/7 radio, and biblical research at your fingertips
          </p>
        </div>

        {installSuccess && (
          <div className="max-w-2xl mx-auto mb-8 bg-green-900/30 border border-green-500 rounded-xl p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-2">🎉 App Installed Successfully!</h3>
            <p className="text-green-200">Check your home screen for the RJHNSN12 icon</p>
          </div>
        )}

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          <div className="bg-slate-900/50 border border-purple-700/30 rounded-xl p-6 text-center">
            <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">AI Chat</h3>
            <p className="text-sm text-purple-300">
              Ask biblical questions and get instant AI-powered answers
            </p>
          </div>
          <div className="bg-slate-900/50 border border-purple-700/30 rounded-xl p-6 text-center">
            <Radio className="w-12 h-12 text-pink-400 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">24/7 Radio</h3>
            <p className="text-sm text-purple-300">
              AI-powered radio station with music and biblical wisdom
            </p>
          </div>
          <div className="bg-slate-900/50 border border-purple-700/30 rounded-xl p-6 text-center">
            <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Offline Access</h3>
            <p className="text-sm text-purple-300">
              Browse content even without internet connection
            </p>
          </div>
        </div>

        {/* Install Instructions */}
        <div className="max-w-3xl mx-auto">
          {/* Android/Chrome */}
          {deferredPrompt && !isIOS && (
            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">📱 Install on Android/Chrome</h2>
              <p className="text-purple-200 mb-6">
                One click to add RJHNSN12 to your home screen!
              </p>
              <button
                onClick={handleInstall}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-4 rounded-xl font-bold text-xl hover:from-purple-700 hover:to-pink-700 transition inline-flex items-center gap-3"
              >
                <Download className="w-6 h-6" />
                Install App Now
              </button>
            </div>
          )}

          {/* iOS */}
          {isIOS && (
            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6 text-center">📱 Install on iPhone</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Tap the Share button</p>
                    <p className="text-sm text-purple-300">
                      Located at the bottom of Safari (square with arrow pointing up)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Scroll and tap "Add to Home Screen"</p>
                    <p className="text-sm text-purple-300">
                      Look for the plus icon (+) in the menu
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Tap "Add"</p>
                    <p className="text-sm text-purple-300">
                      The RJHNSN12 app will appear on your home screen!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Desktop/Unsupported */}
          {!deferredPrompt && !isIOS && (
            <div className="bg-slate-900/50 border border-purple-700/30 rounded-2xl p-8 text-center">
              <Smartphone className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Install on Mobile</h2>
              <p className="text-purple-200 mb-6">
                To install the RJHNSN12 app, please visit this page on your mobile device (iPhone or Android).
              </p>
              <div className="bg-slate-800/50 rounded-lg p-4 inline-block">
                <p className="text-sm text-purple-300 mb-2">Or scan this QR code:</p>
                <p className="text-xs text-purple-400">QR code generation coming soon...</p>
              </div>
            </div>
          )}
        </div>

        {/* Benefits */}
        <div className="max-w-3xl mx-auto mt-12">
          <h3 className="text-2xl font-bold text-center mb-8">Why Install the App?</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-900/30 border border-purple-700/30 rounded-xl p-6">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Faster Access
              </h4>
              <p className="text-sm text-purple-300">
                Launch instantly from your home screen - no typing URLs
              </p>
            </div>
            <div className="bg-slate-900/30 border border-purple-700/30 rounded-xl p-6">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Full Screen
              </h4>
              <p className="text-sm text-purple-300">
                No browser bars - pure app experience
              </p>
            </div>
            <div className="bg-slate-900/30 border border-purple-700/30 rounded-xl p-6">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Works Offline
              </h4>
              <p className="text-sm text-purple-300">
                Browse content even without internet
              </p>
            </div>
            <div className="bg-slate-900/30 border border-purple-700/30 rounded-xl p-6">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Push Notifications
              </h4>
              <p className="text-sm text-purple-300">
                Get notified about new content and features
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
