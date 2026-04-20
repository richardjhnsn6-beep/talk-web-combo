import React, { useEffect, useState } from 'react';

/**
 * SupportMinistryBanner - Zero-API marketing popup.
 * Shows after the user has been on the Radio page for 5+ minutes
 * AND hasn't dismissed/supported it in the last 24 hours.
 */
const SupportMinistryBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Do not show if dismissed/supported within last 24h
    const lastDismissed = localStorage.getItem('ministry_banner_dismissed_at');
    if (lastDismissed) {
      const hoursSince = (Date.now() - Number(lastDismissed)) / (1000 * 60 * 60);
      if (hoursSince < 24) return;
    }

    // Show after 5 minutes of being on the Radio page
    const timer = setTimeout(() => {
      setVisible(true);
    }, 5 * 60 * 1000);

    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    localStorage.setItem('ministry_banner_dismissed_at', String(Date.now()));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-24 right-4 md:right-8 z-[60] max-w-sm bg-gradient-to-br from-teal-700 to-teal-900 text-white shadow-2xl rounded-xl border-2 border-amber-400 p-5 animate-slide-in"
      data-testid="support-ministry-banner"
      style={{ animation: 'slide-in 0.4s ease-out' }}
    >
      <button
        onClick={dismiss}
        className="absolute top-2 right-2 text-white/70 hover:text-white text-xl leading-none"
        aria-label="Dismiss"
        data-testid="support-ministry-dismiss"
      >
        ×
      </button>

      <div className="flex items-start gap-3 mb-3">
        <div className="text-3xl">🙏</div>
        <div>
          <h3 className="font-bold text-lg text-amber-300">
            Enjoying the Broadcast?
          </h3>
          <p className="text-sm text-amber-100 italic">
            rjhnsn12 · Biblical Truth &amp; History
          </p>
        </div>
      </div>

      <p className="text-sm text-white/90 mb-4 leading-relaxed">
        This ministry runs 24/7 on faith and listener support. If it's blessed
        you, please consider a one-time gift — every dollar keeps the music and
        the word going out.
      </p>

      <div className="flex flex-col gap-2">
        <a
          href="https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-0SD94356S2107193PNHH2AHI"
          target="_blank"
          rel="noopener noreferrer"
          onClick={dismiss}
          className="block text-center bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold py-2.5 px-4 rounded-lg transition-colors"
          data-testid="support-ministry-donate-btn"
        >
          💚 Support $2/month
        </a>
        <button
          onClick={dismiss}
          className="text-xs text-white/60 hover:text-white/90 underline mt-1"
          data-testid="support-ministry-maybe-later"
        >
          Maybe later
        </button>
      </div>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(110%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default SupportMinistryBanner;
