const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/';
const TRACK_ENDPOINT = `${BASE_URL}track`;

/** Même breakpoint que useTrackSectionArrival pour cohérence mobile/desktop */
const MOBILE_MEDIA_QUERY = '(max-width: 768px)';

interface TrackMetadata {
  duration_seconds?: number;
  project?: string;
  category?: string;
  [key: string]: any;
}

export interface TrackClickOptions {
  /** Suffixe ajouté au label sur desktop (défaut: '') */
  desktopSuffix?: string;
  /** Suffixe ajouté au label sur mobile (défaut: '_mobile') */
  mobileSuffix?: string;
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

  /**
   * Envoie un événement CLICK avec le label suffixé selon mobile/desktop
   * (même logique que useTrackSectionArrival : desktop = label + desktopSuffix, mobile = label + mobileSuffix).
   */
  const trackClick = (
    label: string,
    extraData: TrackMetadata = {},
    options: TrackClickOptions = {}
  ) => {
    const { desktopSuffix = '', mobileSuffix = '_mobile' } = options;
    const isMobile = typeof window !== 'undefined' && window.matchMedia(MOBILE_MEDIA_QUERY).matches;
    const finalLabel = isMobile ? `${label}${mobileSuffix}` : `${label}${desktopSuffix}`;
    console.log('🖱️ trackClick called:', finalLabel);
    trackEvent('CLICK', finalLabel, extraData);
  };

  return { trackClick, trackEvent };
};