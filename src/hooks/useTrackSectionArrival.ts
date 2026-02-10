import { useEffect, useRef } from 'react';
import { useAnalytics } from './useAnalytics';

/**
 * Hook to track the arrival in a section once,
 * with a different label according to mobile/desktop.
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
  }, [sectionName, desktopSuffix, mobileSuffix, trackClick]);
}
