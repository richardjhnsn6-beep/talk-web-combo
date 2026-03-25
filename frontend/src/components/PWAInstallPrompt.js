import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches 
      || window.navigator.standalone 
      || document.referrer.includes('android-app://');
    
    setIsStandalone(isInStandaloneMode);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Auto-show prompt after 10 seconds, then auto-dismiss after 8 more seconds
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (!dismissed && !isInStandaloneMode) {
          setShowPrompt(true);
          
          // Auto-dismiss after 8 seconds to not block UI
          setTimeout(() => {
            setShowPrompt(false);
          }, 8000);
        }
      }, 10000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show iOS prompt if applicable - with auto-dismiss
    if (iOS && !isInStandaloneMode) {
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (!dismissed) {
          setShowPrompt(true);
          
          // Auto-dismiss after 8 seconds
          setTimeout(() => {
            setShowPrompt(false);
          }, 8000);
        }
      }, 10000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installed');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed
  if (isStandalone) return null;
  
  // Don't show if dismissed
  if (!showPrompt) return null;

  return (
    <>
      {/* Android/Chrome Install Prompt */}
      {deferredPrompt && !isIOS && (
        <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-24 md:w-80 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-2xl p-3 z-40 animate-slide-up">
          <button
            onClick={handleDismiss}
            className="absolute top-1 right-1 text-white/80 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-start gap-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0 pr-6">
              <h3 className="font-bold text-sm mb-1">Install App</h3>
              <p className="text-xs text-purple-100 mb-2">
                Quick access on your home screen!
              </p>
              <button
                onClick={handleInstallClick}
                className="w-full bg-white text-purple-600 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-purple-50 transition flex items-center justify-center gap-1"
              >
                <Download className="w-3 h-3" />
                Install
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Install Instructions */}
      {isIOS && (
        <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-24 md:w-80 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-2xl p-3 z-40 animate-slide-up">
          <button
            onClick={handleDismiss}
            className="absolute top-1 right-1 text-white/80 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-start gap-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1 pr-6">
              <h3 className="font-bold text-sm mb-1">Install App</h3>
              <p className="text-xs text-purple-100 mb-1">Tap Share 
                <svg className="inline w-3 h-3 mx-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                </svg>
                then "Add to Home Screen"
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
