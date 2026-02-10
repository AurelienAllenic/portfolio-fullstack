import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import styles from "./globalLoader.module.scss";

interface GlobalLoaderProps {
  onComplete?: () => void;
  loadDurationMs?: number;
}

const GlobalLoader = ({
  onComplete,
  loadDurationMs = 1500,
}: GlobalLoaderProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [percent, setPercent] = useState(0);
  const animationRef = useRef<gsap.core.Timeline | null>(null);
  const onCompleteRef = useRef(onComplete);
  const loadDurationMsRef = useRef(loadDurationMs);
  onCompleteRef.current = onComplete;
  loadDurationMsRef.current = loadDurationMs;

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    overlay.style.setProperty("--center-x", `${centerX}px`);
    overlay.style.setProperty("--center-y", `${centerY}px`);

    const getBlackEdge = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (h <= 595 && w >= 768) return "150px";
      if (h <= 755 && w >= 768) return "200px";
      if (w <= 375) return "150px";
      if (w <= 435) return "180px";
      if (w <= 575) return "200px";
      if (w <= 900) return "225px";
      if (w <= 1650) return "275px";
      if (h <= 920) return "35%";
      return "315px";
    };
    overlay.style.setProperty("--black-edge", getBlackEdge());

    const durationMs = loadDurationMsRef.current;

    const tl = gsap.timeline({
      onComplete: () => {
        animationRef.current = null;
        onCompleteRef.current?.();
      },
    });

    gsap.set(overlay, { display: "block", "--gradient-size": "100%" });
    setPercent(0);

    tl.add(() => {
      const start = Date.now();
      const tick = () => {
        const elapsed = Date.now() - start;
        const p = Math.min(100, Math.floor((elapsed / durationMs) * 100));
        setPercent(p);
        if (p < 100) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, 0);

    tl.to(overlay, {
      "--gradient-size": "0%",
      duration: durationMs / 1000,
      ease: "power1.inOut",
    }, 0);

    tl.set(overlay, { "--gradient-size": "0%" });

    animationRef.current = tl;

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
        animationRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <div className={styles.background} aria-hidden />
      <div ref={overlayRef} className={styles.overlay} />
      <div className={styles.percentContainer} aria-live="polite" aria-atomic="true">
        <div className={styles.percentWrap}>
          <span className={styles.percentTrail} aria-hidden>{percent}%</span>
          <span className={styles.percentTrail2} aria-hidden>{percent}%</span>
          <span className={styles.percentTrail3} aria-hidden>{percent}%</span>
          <span className={styles.percent}>{percent}%</span>
        </div>
      </div>
    </>
  );
};

export default GlobalLoader;
