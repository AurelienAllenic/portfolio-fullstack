import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import styles from "./radialTransitionOverlay.module.scss";

interface RadialTransitionOverlayProps {
  isActive: boolean;
  direction: "in" | "out";
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

    const customCenterX = sessionStorage.getItem('gradientCenterX');
    const customCenterY = sessionStorage.getItem('gradientCenterY');

    const isMobile = window.innerWidth < 900;
    
    let centerX: number;
    let centerY: number;
    
    if (customCenterX && customCenterY) {
      centerX = parseFloat(customCenterX);
      centerY = parseFloat(customCenterY);

    } else if (isMobile) {
      centerX = window.innerWidth / 2;
      centerY = window.scrollY + (window.innerHeight / 2);
    } else {
      centerX = window.innerWidth / 2;
      centerY = window.innerHeight / 2;
    }
    
    if (isMobile) {
      const pageHeight = document.documentElement.scrollHeight;
      overlay.style.height = `${pageHeight}px`;
    } else {
      overlay.style.height = `${window.innerHeight}px`;
    }
    
    overlay.style.setProperty('--center-x', `${centerX}px`);
    overlay.style.setProperty('--center-y', `${centerY}px`);

    if (animationRef.current && currentDirectionRef.current !== direction) {
      animationRef.current.kill();
      animationRef.current = null;
    }

    if (direction === "in") {
      if (currentDirectionRef.current !== "in") {
        gsap.set(overlay, {
          display: "block",
          "--gradient-size": "100%",
        });
      }
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
      if (currentDirectionRef.current !== "out") {
        gsap.set(overlay, {
          display: "block",
          "--gradient-size": "0%",
        });
      }

      if (customCenterX && customCenterY) {
        sessionStorage.removeItem('gradientCenterX');
        sessionStorage.removeItem('gradientCenterY');
      }

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
