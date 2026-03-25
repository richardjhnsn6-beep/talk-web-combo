import React, { useState, useEffect } from 'react';
import { Smartphone, Download, Radio, Sparkles, Crown, CheckCircle, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function InstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const appUrl = window.location.origin;

  useEffect(() => {
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches 
      || window.navigator.standalone;
    
    setIsStandalone(isInStandaloneMode);
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      
      // CRITICAL: Only allow installation on MOBILE devices
      // Prevents desktop users from accidentally installing as app
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        setDeferredPrompt(e);
      } else {
        // Desktop users - do NOT store prompt, just show QR code
        console.log('Desktop detected - installation blocked, showing QR code only');
      }
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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isStandalone) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 text-white flex items-center justify-center px-4">
        <div className="text-center max-w-2xl">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">✅ App Already Installed!</h1>
          <p className="text-lg text-purple-200 mb-4">
            You're using the RJHNSN12 app. Enjoy 24/7 AI chat and radio!
          </p>
          
          {/* Help for users who want to get back to browser */}
          <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-6 mb-6">
            <p className="text-blue-200 text-sm mb-4">
              <strong>Want to use the website version instead?</strong>
            </p>
            <div className="space-y-2 text-left text-sm text-blue-300">
              <p>1. Close this app window</p>
              <p>2. Open your regular browser (Chrome, Safari, etc.)</p>
              <p>3. Go to: <span className="font-mono bg-blue-950/50 px-2 py-1 rounded">{appUrl}</span></p>
            </div>
            <button
              onClick={() => {
                window.open(appUrl, '_blank');
              }}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
            >
              🌐 Open Website in New Tab
            </button>
          </div>
          
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
            <div className="bg-slate-900/50 border border-purple-700/30 rounded-2xl p-8">
              <Smartphone className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4 text-center">📱 Install on Your Phone</h2>
              
              {/* Important Notice */}
              <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-xl p-4 mb-6">
                <p className="text-yellow-200 text-sm text-center">
                  <strong>⚠️ For Mobile Only</strong><br/>
                  This app is designed for phones. Please use the QR code below to install on your iPhone or Android device.
                </p>
              </div>
              
              <p className="text-purple-200 mb-6 text-center">
                Scan this QR code with your phone camera to get started:
              </p>
              
              {/* QR Code */}
              <div className="bg-white rounded-2xl p-6 inline-block mx-auto mb-6 shadow-2xl" style={{ display: 'block', width: 'fit-content', margin: '0 auto 1.5rem' }}>
                <QRCodeSVG 
                  value={appUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                  className="mx-auto"
                />
                <p className="text-center text-gray-800 text-sm font-bold mt-3">📸 Scan with your phone camera</p>
              </div>
              
              {/* Shareable Link */}
              <div className="bg-slate-800/50 rounded-xl p-4">
                <p className="text-sm text-purple-300 mb-3 text-center font-semibold">Or copy and send to your phone:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={appUrl}
                    readOnly
                    className="flex-1 bg-slate-700 text-white px-4 py-2 rounded-lg text-sm border border-purple-700/50"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-purple-400 mt-3 text-center">
                  💬 Text or email this link to your phone, then open it to install
                </p>
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
