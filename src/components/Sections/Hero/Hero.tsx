import { useEffect, useRef, useState } from "react";
import styles from "./hero.module.scss";
import { gsap } from "gsap";
import HeroBeforeScroll from "./HeroBeforeScroll";
import HeroAfterScroll from "./HeroAfterScroll";

const Hero: React.FC = () => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const iconsRef = useRef<NodeListOf<HTMLImageElement> | null>(null);
  const hero2Ref = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const hasFadedOut = useRef(false);
  const lastTouchY = useRef<number | null>(null); // Suivi de la position Y pour touch

  const [gradientState, setGradientState] = useState<
    "hero1" | "hero2" | "transition"
  >("hero1");

  const handleReturnToHeroBefore = () => {
    tlRef.current?.reverse();
    hasFadedOut.current = false;
  };

  // Throttle pour limiter la fréquence des événements touch
  const throttle = (func: Function, limit: number) => {
    let inThrottle: boolean;
    return function (...args: any[]) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  };

  useEffect(() => {
    const overlay = overlayRef.current;
    const container = containerRef.current;
    if (!overlay || !container) return;

    let scrollBlocked = true;

    tlRef.current = gsap.timeline({
      paused: true,
      defaults: { duration: 1, ease: "power2.out" },
    });

    tlRef.current.to(overlay, {
      "--gradient-size": "100%",
      onUpdate: () => {
        const tl = tlRef.current;
        if (!tl) return;

        const val =
          parseFloat(
            getComputedStyle(overlay).getPropertyValue("--gradient-size")
          ) || 0;
        overlay.style.setProperty("--gradient-size", `${val}%`);

        const progress = tl.progress();

        if (val > 0 && val < 50) {
          setGradientState("transition");
        } else if (val >= 50) {
          setGradientState("hero2");
        } else if (val === 0) {
          setGradientState("hero1");
        }

        if (hero2Ref.current) {
          if (progress >= 0.3 && !tl.reversed()) {
            gsap.to(hero2Ref.current, {
              opacity: 1,
              duration: 0.2,
              ease: "power2.out",
            });
            hasFadedOut.current = false;
          } else if (progress <= 0.3 && tl.reversed() && !hasFadedOut.current) {
            gsap.to(hero2Ref.current, {
              opacity: 0,
              duration: 0.2,
              ease: "power2.out",
            });
            hasFadedOut.current = true;
          }
        }
      },
      onComplete: () => {
        scrollBlocked = false;
        document.body.style.overflow = "auto";

        const icons =
          container.querySelectorAll<HTMLImageElement>(".contentRight img");
        iconsRef.current = icons;
        gsap.set(icons, { opacity: 0, y: -50 });
        gsap.to(icons, {
          opacity: 1,
          y: 0,
          stagger: 0.2,
          delay: 1,
          ease: "power2.out",
        });
      },
      onReverseComplete: () => {
        scrollBlocked = true;
        document.body.style.overflow = "hidden";
        setGradientState("hero1");
      },
    });

    const handleInteraction = (direction: "up" | "down") => {
      const rect = container.getBoundingClientRect();
      const isAtTop = window.scrollY === 0;

      if (!isAtTop) return;

      if (rect.top <= 0 && rect.bottom > 0) {
        if (scrollBlocked) {
          // Empêche le scroll par défaut
          window.scrollTo(0, 0);
        }

        if (direction === "down" && (tlRef.current?.progress() ?? 0) < 1) {
          tlRef.current?.play();
        } else if (direction === "up" && (tlRef.current?.progress() ?? 0) > 0) {
          tlRef.current?.reverse();
        }
      }
    };

    // Gestion des événements wheel (desktop)
    const handleWheel = (e: WheelEvent) => {
      const direction = e.deltaY > 0 ? "down" : "up";
      if (scrollBlocked) e.preventDefault();
      handleInteraction(direction);
    };

    // Gestion des événements tactiles (mobile)
    const handleTouchStart = (e: TouchEvent) => {
      lastTouchY.current = e.touches[0].clientY;
    };

    const handleTouchMove = throttle((e: TouchEvent) => {
      if (lastTouchY.current === null) return;
      const currentY = e.touches[0].clientY;
      const deltaY = lastTouchY.current - currentY;
      const direction = deltaY > 0 ? "down" : "up";
      if (scrollBlocked) e.preventDefault();
      handleInteraction(direction);
      lastTouchY.current = currentY;
    }, 16); // 16ms ≈ 60fps

    document.body.style.overflow = "hidden";
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      document.body.style.overflow = "auto";
      tlRef.current?.kill();
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.containerHero}>
      <div
        ref={overlayRef}
        className={styles.overlay}
        style={{ "--gradient-size": "0%" } as React.CSSProperties}
      ></div>

      {gradientState === "hero1" && <HeroBeforeScroll />}
      {gradientState === "hero2" && (
        <HeroAfterScroll
          ref={hero2Ref}
          onReturnToHeroBefore={handleReturnToHeroBefore}
        />
      )}
    </div>
  );
};

export default Hero;
