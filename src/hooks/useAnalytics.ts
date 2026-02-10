import { useLanguage } from '../components/General/Language/LanguageContext';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/';
const TRACK_ENDPOINT = `${BASE_URL}/track`;
const MOBILE_MEDIA_QUERY = '(max-width: 768px)';

interface TrackMetadata {
  duration_seconds?: number;
  project?: string;
  category?: string;
  [key: string]: any;
}

export interface TrackClickOptions {
  desktopSuffix?: string;
  mobileSuffix?: string;
}

export const useAnalytics = () => {
  const { language } = useLanguage();

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
      console.error("Tracking error:", err);
    }
  };

  /**
   * Send a CLICK event with the label suffixed according to mobile/desktop and current language.
   * Final format : label + (desktopSuffix | mobileSuffix) + _LANG_FR | _LANG_EN.
   */
  const trackClick = (
    label: string,
    extraData: TrackMetadata = {},
    options: TrackClickOptions = {}
  ) => {
    const { desktopSuffix = '', mobileSuffix = '_mobile' } = options;
    const isMobile = typeof window !== 'undefined' && window.matchMedia(MOBILE_MEDIA_QUERY).matches;
    const langSuffix = language === 'fr' ? '_LANG_FR' : '_LANG_EN';
    const finalLabel = `${isMobile ? `${label}${mobileSuffix}` : `${label}${desktopSuffix}`}${langSuffix}`;
    trackEvent('CLICK', finalLabel, extraData);
  };

  return { trackClick, trackEvent };
};
