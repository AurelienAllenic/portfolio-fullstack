import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Remplace par ton URL réelle
const BASE_URL = 'https://ton-api.vercel.app/api'; 
const TRACK_ENDPOINT = `${BASE_URL}/track`;

interface TrackMetadata {
  duration_seconds?: number;
  project?: string;
  category?: string;
  [key: string]: any;
}

export const useAnalytics = () => {
  const location = useLocation();
  const pageStartTime = useRef<number>(Date.now());
  const sessionStartTime = useRef<number>(Date.now());

  // 1. Fonction de base avec FETCH
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
    } catch (err) {
      console.error("Tracking error with Fetch:", err);
    }
  };

  // 2. Fonction de clic
  const trackClick = (label: string, extraData: TrackMetadata = {}) => {
    trackEvent('CLICK', label, extraData);
  };

  // 3. Suivi du temps (On garde sendBeacon pour la fiabilité à la fermeture)
  const sendDuration = (label: string, startTime: number) => {
    const duration = Math.round((Date.now() - startTime) / 1000);
    
    if (duration < 1) return;

    const payload = JSON.stringify({
      type: 'DURATION',
      path: window.location.pathname,
      label: label,
      metadata: { duration_seconds: duration },
      timestamp: new Date()
    });

    // Indispensable pour capter la fin de session
    navigator.sendBeacon(TRACK_ENDPOINT, payload);
  };

  // Tracking auto au changement de page
  useEffect(() => {
    trackEvent('PAGE_VIEW');
    pageStartTime.current = Date.now();

    return () => {
      sendDuration('page_view_duration', pageStartTime.current);
    };
  }, [location.pathname]);

  // Tracking de la fin de session (Fermeture onglet/navigateur)
  useEffect(() => {
    const handleTabClose = () => {
      sendDuration('total_session_duration', sessionStartTime.current);
    };

    window.addEventListener('beforeunload', handleTabClose);
    return () => {
      window.removeEventListener('beforeunload', handleTabClose);
      handleTabClose();
    };
  }, []);

  return { trackClick, trackEvent };
};