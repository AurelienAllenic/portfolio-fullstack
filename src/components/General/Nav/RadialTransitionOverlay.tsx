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
