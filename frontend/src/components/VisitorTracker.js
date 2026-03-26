import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * VisitorTracker - Sends heartbeat to backend every 30 seconds
 * Tracks which page user is currently viewing
 */
const VisitorTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Generate or retrieve visitor ID from localStorage
    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('visitor_id', visitorId);
    }

    const sendHeartbeat = async () => {
      try {
        await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/visitors/heartbeat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visitor_id: visitorId,
            current_page: location.pathname,
            user_agent: navigator.userAgent
          })
        });
      } catch (error) {
        console.error('Heartbeat failed:', error);
      }
    };

    // Send initial heartbeat
    sendHeartbeat();

    // Send heartbeat every 30 seconds
    const interval = setInterval(sendHeartbeat, 30000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [location.pathname]);

  return null; // This component doesn't render anything
};

export default VisitorTracker;
