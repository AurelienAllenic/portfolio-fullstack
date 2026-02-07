import { useEffect, useRef } from 'react';
import { useAnalytics } from './useAnalytics';

/**
 * Hook pour tracker l'arrivée dans une section une seule fois,
 * avec label différent selon mobile/desktop.
 * 
 * @param sectionName
 * @param desktopSuffix
 * @param mobileSuffix
 */
export function useTrackSectionArrival(
  sectionName: string,
  desktopSuffix: string = '',
  mobileSuffix: string = '_mobile'
) {
  const { trackClick } = useAnalytics();
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    const label = isMobile 
      ? `${sectionName}${mobileSuffix}`
      : `${sectionName}${desktopSuffix}`;

    trackClick(label);

    hasTracked.current = true;

    // Optionnel : réinitialiser au démontage (rarement utile)
    // return () => { hasTracked.current = false; };
  }, [sectionName, desktopSuffix, mobileSuffix, trackClick]);
}
