import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import styles from "./globalLoader.module.scss";

interface GlobalLoaderProps {
  /** Appelé quand le loader a fini (radial refermé, écran noir) */
  onComplete?: () => void;
  /** Durée simulée du chargement en ms (pour le % 0→100) */
  loadDurationMs?: number;
}

const GlobalLoader = ({
  onComplete,
  loadDurationMs = 2000,
}: GlobalLoaderProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [percent, setPercent] = useState(0);
  const [showPercent, setShowPercent] = useState(false);
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

    // 1) Partir avec le radial "ouvert" (on voit le fond blanc partout, comme HeroBeforeScroll)
    gsap.set(overlay, { display: "block", "--gradient-size": "100%" });
    setShowPercent(false);
    setPercent(0);

    // 2) Le radial se REFERME pour former un rond au centre (100% → 10%), comme HeroBeforeScroll
    tl.to(overlay, {
      "--gradient-size": "10%",
      duration: 1,
      ease: "power2.inOut",
    });

    // 3) Une fois le rond formé : afficher le % au centre
    tl.add(() => setShowPercent(true));
    tl.add(() => {
      const start = Date.now();
      const tick = () => {
        const elapsed = Date.now() - start;
        const p = Math.min(100, Math.floor((elapsed / durationMs) * 100));
        setPercent(p);
        if (p < 100) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    tl.to({}, { duration: durationMs / 1000 }); // attendre la durée du chargement

    // 4) À 100%, attendre 0,5 s
    tl.to({}, { duration: 0.5 });

    // 5) Masquer le pourcentage d'abord avec un callback clair
    tl.call(() => {
      console.log("Masquage du pourcentage");
      setShowPercent(false);
    });
    
    // Petite pause pour que le fade out du % soit visible
    tl.to({}, { duration: 0.4 });

    // 6) Refermer radial progressivement vers 0% - SÉPARÉ en deux étapes
    tl.call(() => console.log("Début fermeture radial, gradient-size:", overlay.style.getPropertyValue("--gradient-size")));
    
    // D'abord réduire gradient-size progressivement
    tl.to(overlay, {
      "--gradient-size": "0%",
      duration: 1,
      ease: "power2.inOut",
      onUpdate: function() {
        if (Math.random() < 0.1) { // Log seulement 10% du temps pour ne pas spammer
          console.log("gradient-size pendant anim:", this.progress());
        }
      }
    });
    
    // PUIS animer black-edge (pas en parallèle) pour éviter les sauts
    tl.to(overlay, {
      "--black-edge": "0px",
      duration: 0.6,
      ease: "power2.inOut",
    }, "-=0.4"); // Commence 0.4s avant la fin de l'animation précédente pour un overlap doux

    animationRef.current = tl;

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
        animationRef.current = null;
      }
    };
    // Une seule exécution au montage : pas de re-run quand onComplete change (évite la réouverture du radial)
  }, []);

  return (
    <>
      <div className={styles.background} aria-hidden />
      <div ref={overlayRef} className={styles.overlay} />
      <div
        className={`${styles.percentContainer} ${showPercent ? styles.visible : ""} ${percent < 100 ? styles.counting : ""}`}
        aria-live="polite"
        aria-atomic="true"
      >
        <div className={styles.percentWrap}>
          {/* Traînée de vitesse : fantômes floutés derrière le chiffre (motion blur) */}
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