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
  const currentDirectionRef = useRef<"in" | "out" | null>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (!isActive || !overlayRef.current) {
      // Si inactif, s'assurer que l'overlay est caché
      if (overlayRef.current) {
        gsap.set(overlayRef.current, { display: "none" });
      }
      currentDirectionRef.current = null;
      if (animationRef.current) {
        animationRef.current.kill();
        animationRef.current = null;
      }
      return;
    }

    const overlay = overlayRef.current;

    // Vérifier si une position personnalisée est stockée (pour le clic sur un bouton)
    const customCenterX = sessionStorage.getItem('gradientCenterX');
    const customCenterY = sessionStorage.getItem('gradientCenterY');
    
    // Sur mobile, calculer le centre par rapport au scroll + viewport visible
    const isMobile = window.innerWidth < 900;
    
    let centerX: number;
    let centerY: number;
    
    if (customCenterX && customCenterY) {
      // Utiliser la position personnalisée du bouton cliqué
      centerX = parseFloat(customCenterX);
      centerY = parseFloat(customCenterY);
      
      // Ne pas nettoyer sessionStorage ici si on change de direction (pour garder la position)
      // On nettoiera seulement après l'ouverture complète
    } else if (isMobile) {
      // Le centre du gradient = position de scroll + milieu du viewport visible
      centerX = window.innerWidth / 2;
      centerY = window.scrollY + (window.innerHeight / 2);
    } else {
      // Desktop : comportement normal (centre de l'écran)
      centerX = window.innerWidth / 2;
      centerY = window.innerHeight / 2;
    }
    
    if (isMobile) {
      // L'overlay doit couvrir toute la page
      const pageHeight = document.documentElement.scrollHeight;
      overlay.style.height = `${pageHeight}px`;
    } else {
      overlay.style.height = `${window.innerHeight}px`;
    }
    
    overlay.style.setProperty('--center-x', `${centerX}px`);
    overlay.style.setProperty('--center-y', `${centerY}px`);

    // Si on change de direction pendant une animation, tuer l'animation en cours
    if (animationRef.current && currentDirectionRef.current !== direction) {
      animationRef.current.kill();
      animationRef.current = null;
    }

    if (direction === "in") {
      // Fermeture : le transparent rétrécit, le noir grandit depuis les bords (100% → 0%)
      // Commencer avec le gradient à 100% (transparent au centre, visible sur les bords)
      if (currentDirectionRef.current !== "in") {
        gsap.set(overlay, {
          display: "block",
          "--gradient-size": "100%",
        });
      }

      // Attendre un frame pour s'assurer que l'overlay est visible avant d'animer
      requestAnimationFrame(() => {
        animationRef.current = gsap.to(overlay, {
          "--gradient-size": "0%",
          duration: 1.2,
          ease: "power2.inOut",
          onComplete: () => {
            animationRef.current = null;
            if (onComplete) onComplete();
          },
        });
        currentDirectionRef.current = "in";
      });
    } else {
      // Ouverture : le transparent grandit, le noir rétrécit vers les bords (0% → 100%)
      // Si on vient de "in", l'overlay est déjà à 0% (noir), pas besoin de réinitialiser
      if (currentDirectionRef.current !== "out") {
        gsap.set(overlay, {
          display: "block",
          "--gradient-size": "0%",
        });
      }

      // Nettoyer sessionStorage maintenant qu'on ouvre
      if (customCenterX && customCenterY) {
        sessionStorage.removeItem('gradientCenterX');
        sessionStorage.removeItem('gradientCenterY');
      }

      // Commencer l'animation immédiatement
      animationRef.current = gsap.to(overlay, {
        "--gradient-size": "100%",
        duration: 1.2,
        ease: "power2.inOut",
        onComplete: () => {
          gsap.set(overlay, { display: "none" });
          animationRef.current = null;
          currentDirectionRef.current = null;
          if (onComplete) onComplete();
        },
      });
      currentDirectionRef.current = "out";
    }
  }, [isActive, direction, onComplete]);

  return <div ref={overlayRef} className={styles.overlay} />;
};

export default RadialTransitionOverlay;
