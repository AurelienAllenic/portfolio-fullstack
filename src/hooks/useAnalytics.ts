const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TRACK_ENDPOINT = `${BASE_URL}/track`;

interface TrackMetadata {
  duration_seconds?: number;
  project?: string;
  category?: string;
  [key: string]: any;
}

export const useAnalytics = () => {
  const trackEvent = async (
    type: 'PAGE_VIEW' | 'CLICK' | 'SECTION_VIEW' | 'DURATION', 
    label?: string, 
    metadata: TrackMetadata = {}
  ) => {
    const data = {
      type,
      path: window.location.pathname,
      label,
      metadata,
      timestamp: new Date()
    };

    try {
      await fetch(TRACK_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      console.log('✅ Event tracked:', type, label);
    } catch (err) {
      console.error("Tracking error:", err);
    }
  };

  const trackClick = (label: string, extraData: TrackMetadata = {}) => {
    console.log('🖱️ trackClick called:', label);
    trackEvent('CLICK', label, extraData);
  };

  return { trackClick, trackEvent };
};