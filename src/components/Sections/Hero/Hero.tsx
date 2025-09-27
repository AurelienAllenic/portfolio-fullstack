import { useEffect, useRef, useState } from "react";
import styles from "./hero.module.scss";
import { gsap } from "gsap";

const Hero: React.FC = () => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gradientState, setGradientState] = useState<"hero1" | "hero2">(
    "hero1"
  );

  useEffect(() => {
    const overlay = overlayRef.current;
    const container = containerRef.current;
    if (!overlay || !container) return;

    let scrollBlocked = true;

    const tl = gsap.timeline({
      paused: true,
      defaults: { duration: 1, ease: "power2.out" },
    });

    tl.to(overlay, {
      "--gradient-size": "100%",
      onUpdate: () => {
        const val = parseFloat(
          getComputedStyle(overlay).getPropertyValue("--gradient-size")
        );
        overlay.style.setProperty("--gradient-size", `${val}%`);

        // Met à jour le state pour afficher la div correspondante
        if (val <= 0) setGradientState("hero1");
        else if (val >= 100) setGradientState("hero2");
      },
      onComplete: () => {
        scrollBlocked = false;
        document.body.style.overflow = "auto";
        setGradientState("hero2"); // Assure que hero2 est visible
      },
      onReverseComplete: () => {
        scrollBlocked = true;
        document.body.style.overflow = "hidden";
        setGradientState("hero1"); // Revenir à hero1
      },
    });

    const handleWheel = (e: WheelEvent) => {
      const rect = container.getBoundingClientRect();
      const delta = e.deltaY;

      // Déclenche l'effet si le haut de la section touche le haut de l'écran
      if (rect.top <= 0 && rect.bottom > 0) {
        if (scrollBlocked) e.preventDefault();

        if (delta > 0 && tl.progress() < 1) tl.play(); // Scroll vers le bas
        else if (delta < 0 && tl.progress() > 0) tl.reverse(); // Scroll vers le haut
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      document.body.style.overflow = "auto";
      tl.kill();
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.containerHero}>
      <div
        ref={overlayRef}
        className={styles.overlay}
        style={{ "--gradient-size": "0%" } as React.CSSProperties}
      ></div>

      {gradientState === "hero1" && (
        <div className={styles.hero1}>Contenu Hero1</div>
      )}
      {gradientState === "hero2" && (
        <div className={styles.hero2}>Contenu Hero2</div>
      )}
    </div>
  );
};

export default Hero;
