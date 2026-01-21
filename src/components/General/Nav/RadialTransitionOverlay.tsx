import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import styles from "./radialTransitionOverlay.module.scss";

interface RadialTransitionOverlayProps {
  isActive: boolean;
  direction: "in" | "out"; // "in" = fermeture (noir), "out" = ouverture (révélation)
  onComplete?: () => void;
}

const RadialTransitionOverlay = ({
  isActive,
  direction,
  onComplete,
}: RadialTransitionOverlayProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !overlayRef.current) return;

    const overlay = overlayRef.current;

    // Sur mobile, calculer le centre par rapport au scroll + viewport visible
    const isMobile = window.innerWidth < 900;
    
    if (isMobile) {
      // L'overlay doit couvrir toute la page
      const pageHeight = document.documentElement.scrollHeight;
      overlay.style.height = `${pageHeight}px`;
      
      // Le centre du gradient = position de scroll + milieu du viewport visible
      const centerX = window.innerWidth / 2;
      const centerY = window.scrollY + (window.innerHeight / 2);
      
      overlay.style.setProperty('--center-x', `${centerX}px`);
      overlay.style.setProperty('--center-y', `${centerY}px`);
    } else {
      // Desktop : comportement normal
      overlay.style.height = `${window.innerHeight}px`;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      overlay.style.setProperty('--center-x', `${centerX}px`);
      overlay.style.setProperty('--center-y', `${centerY}px`);
    }

    if (direction === "in") {
      // Fermeture : le transparent rétrécit, le noir grandit depuis les bords (100% → 0%)
      gsap.set(overlay, {
        display: "block",
      });

      gsap.fromTo(
        overlay,
        { "--gradient-size": "100%" },
        {
          "--gradient-size": "0%",
          duration: 1.2,
          ease: "power2.inOut",
          onComplete: () => {
            if (onComplete) onComplete();
          },
        }
      );
    } else {
      // Ouverture : le transparent grandit, le noir rétrécit vers les bords (0% → 100%)
      gsap.set(overlay, {
        display: "block",
      });

      gsap.fromTo(
        overlay,
        { "--gradient-size": "0%" },
        {
          "--gradient-size": "100%",
          duration: 1.2,
          ease: "power2.inOut",
          onComplete: () => {
            gsap.set(overlay, { display: "none" });
            if (onComplete) onComplete();
          },
        }
      );
    }
  }, [isActive, direction, onComplete]);

  return <div ref={overlayRef} className={styles.overlay} />;
};

export default RadialTransitionOverlay;
