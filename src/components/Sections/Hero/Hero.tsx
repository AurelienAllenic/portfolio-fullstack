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
  const touchStartY = useRef<number | null>(null);

  const [gradientState, setGradientState] = useState<
    "hero1" | "hero2" | "transition"
  >("hero1");

  const handleReturnToHeroBefore = () => {
    tlRef.current?.reverse();
    hasFadedOut.current = false;
  };

  useEffect(() => {
    const overlay = overlayRef.current;
    const container = containerRef.current;
    if (!overlay || !container) return;

    let scrollBlocked = true;
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;

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

        // Disable CSS animations to avoid conflicts
        const titles = container.querySelectorAll<HTMLElement>(
          ".titleLeft, .titleLeft span, .titleRight, .subtitle"
        );
        const scrollIndicators = container.querySelectorAll<HTMLElement>(
          ".scrollIndicatorContainer"
        );

        titles.forEach((el) => {
          el.style.animation = "none";
        });
        scrollIndicators.forEach((el) => {
          el.style.animation = "none";
        });

        // Animate scroll indicators (from side)
        const icons = container.querySelectorAll<HTMLImageElement>(
          ".scrollIndicatorContainer img"
        );
        iconsRef.current = icons;
        gsap.set(icons, { opacity: 0, x: -45 });
        gsap.to(icons, {
          opacity: 1,
          x: 0,
          stagger: 0.2,
          delay: 1.5,
          duration: 1,
          ease: "power2.out",
        });

        // Animate titles based on screen size
        if (isDesktop) {
          gsap.set(titles, { opacity: 0, y: -45 });
          gsap.to(titles, {
            opacity: 1,
            y: 0,
            stagger: 0.2,
            delay: 0.5,
            duration: 1,
            ease: "power2.out",
          });
        } else {
          gsap.set(titles, { opacity: 0, x: -45 });
          gsap.to(titles, {
            opacity: 1,
            x: 0,
            stagger: 0.2,
            delay: 0.5,
            duration: 1,
            ease: "power2.out",
          });
        }
      },
      onReverseComplete: () => {
        scrollBlocked = true;
        document.body.style.overflow = "hidden";
        setGradientState("hero1");

        // Reset animations
        const titles = container.querySelectorAll<HTMLElement>(
          ".titleLeft, .titleLeft span, .titleRight, .subtitle"
        );
        const scrollIndicators = container.querySelectorAll<HTMLElement>(
          ".scrollIndicatorContainer img"
        );

        titles.forEach((el) => {
          el.style.animation = "none";
        });
        scrollIndicators.forEach((el) => {
          el.style.animation = "none";
        });

        if (isDesktop) {
          gsap.set(titles, { opacity: 0, y: -45 });
          gsap.to(titles, {
            opacity: 1,
            y: 0,
            stagger: 0.2,
            delay: 0.5,
            duration: 1,
            ease: "power2.out",
          });
        } else {
          gsap.set(titles, { opacity: 0, x: -45 });
          gsap.to(titles, {
            opacity: 1,
            x: 0,
            stagger: 0.2,
            delay: 0.5,
            duration: 1,
            ease: "power2.out",
          });
        }

        gsap.set(scrollIndicators, { opacity: 0, x: -45 });
        gsap.to(scrollIndicators, {
          opacity: 1,
          x: 0,
          stagger: 0.2,
          delay: 1.5,
          duration: 1,
          ease: "power2.out",
        });
      },
    });

    const handleWheel = (e: WheelEvent) => {
      const rect = container.getBoundingClientRect();
      const delta = e.deltaY;
      const isAtTop = window.scrollY === 0;

      if (!isAtTop) return;

      if (rect.top <= 0 && rect.bottom > 0) {
        if (scrollBlocked) e.preventDefault();

        if (delta > 0 && (tlRef.current?.progress() ?? 0) < 1) {
          tlRef.current?.play();
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY.current === null) return;

      const rect = container.getBoundingClientRect();
      const isAtTop = window.scrollY === 0;

      if (!isAtTop) return;

      if (rect.top <= 0 && rect.bottom > 0) {
        if (scrollBlocked) e.preventDefault();

        const touchY = e.touches[0].clientY;
        const deltaY = touchStartY.current - touchY; // Positive for swipe down

        if (deltaY > 30 && (tlRef.current?.progress() ?? 0) < 1) {
          // Swipe down threshold (30px)
          tlRef.current?.play();
        }
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      tlRef.current?.kill();
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.containerHero} id="about">
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
