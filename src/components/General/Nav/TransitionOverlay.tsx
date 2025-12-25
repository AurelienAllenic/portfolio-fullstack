import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import styles from "./transitionOverlay.module.scss";

interface TransitionOverlayProps {
  isActive: boolean;
  onComplete: () => void;
  direction: "close" | "open";
}

const TransitionOverlay = ({ isActive, onComplete, direction }: TransitionOverlayProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const currentDirectionRef = useRef<"close" | "open" | null>(null);

  useEffect(() => {
    if (!isActive || !overlayRef.current) {
      // Réinitialiser quand inactif
      if (overlayRef.current) {
        gsap.set(overlayRef.current, { "--gradient-size": "100%" });
      }
      currentDirectionRef.current = null;
      return;
    }

    const overlay = overlayRef.current;

    // Ne pas rejouer la même animation
    if (currentDirectionRef.current === direction) return;
    currentDirectionRef.current = direction;

    if (direction === "close") {
      // Fermer le gradient radial jusqu'à 0 (écran noir)
      gsap.fromTo(
        overlay,
        { "--gradient-size": "100%" },
        {
          "--gradient-size": "0%",
          duration: 0.8,
          ease: "power2.in",
          onComplete: () => {
            onComplete();
          },
        }
      );
    } else if (direction === "open") {
      // Ouvrir le gradient radial pour révéler (de 0% à 100%)
      gsap.fromTo(
        overlay,
        { "--gradient-size": "0%" },
        {
          "--gradient-size": "100%",
          duration: 0.8,
          ease: "power2.out",
        }
      );
    }
  }, [isActive, direction, onComplete]);

  if (!isActive) return null;

  return <div ref={overlayRef} className={styles.transitionOverlay}></div>;
};

export default TransitionOverlay;

