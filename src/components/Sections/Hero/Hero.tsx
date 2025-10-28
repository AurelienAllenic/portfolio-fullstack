// Hero.tsx
import { useEffect, useRef, useState } from "react";
import styles from "./hero.module.scss";
import { gsap } from "gsap";
import HeroBeforeScroll from "./HeroBeforeScroll";
import HeroAfterScroll from "./HeroAfterScroll";

interface HeroProps {
  onTransitionToProjects?: () => void;
  returnFromProjects?: boolean;
  onResetReturnFromProjects?: () => void; // <--- ici
}

const Hero: React.FC<HeroProps> = ({
  onTransitionToProjects,
  returnFromProjects,
  onResetReturnFromProjects,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hero2Ref = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const hasFadedOut = useRef(false);
  const touchStartY = useRef<number | null>(null);

  const [gradientState, setGradientState] = useState<
    "hero1" | "hero2" | "transition"
  >(returnFromProjects ? "hero2" : "hero1");

  const handleReturnToHeroBefore = () => {
    const overlay = overlayRef.current;
    const hero2 = hero2Ref.current;

    // Fade out smooth du contenu de HeroAfterScroll
    if (hero2) {
      gsap.to(hero2, {
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
      });
    }

    // Gradient passe à 0%
    if (overlay) {
      gsap.to(overlay, {
        "--gradient-size": "0%",
        duration: 1,
        ease: "power2.out",
      });
    }

    setTimeout(() => {
      // Repasser en HeroBeforeScroll
      setGradientState("hero1");
      onResetReturnFromProjects?.();

      // Reset timeline pour que le scroll vers le bas fonctionne
      if (tlRef.current) {
        tlRef.current.progress(0); // reset la timeline
        tlRef.current.pause();
      }

      // Reset l'opacité pour la prochaine animation
      if (hero2) gsap.set(hero2, { opacity: 1 });

      // Débloquer le scroll
      document.body.style.overflow = "auto";
    }, 1000);
  };

  useEffect(() => {
    const overlay = overlayRef.current;
    const container = containerRef.current;
    if (!overlay || !container) return;

    let scrollBlocked = true;
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;

    overlay.style.animation = "none";

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
        //overlay.style.setProperty("--gradient-size", `${val}%`);

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

        const icons = container.querySelectorAll<HTMLImageElement>(
          ".scrollIndicatorContainer img"
        );
        gsap.set(icons, { opacity: 0, x: -45 });
        gsap.to(icons, {
          opacity: 1,
          x: 0,
          stagger: 0.2,
          delay: 1.5,
          duration: 1,
          ease: "power2.out",
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
      },
      onReverseComplete: () => {
        document.body.style.overflow = "hidden";
        setGradientState("hero1");

        const defaultValue = getComputedStyle(overlay)
          .getPropertyValue("--gradient-size")
          .trim();
        const targetValue = defaultValue || "30%";

        gsap.to(overlay, {
          "--gradient-size": targetValue,
          duration: 0.8,
          ease: "power2.out",
          onComplete: () => {
            scrollBlocked = false;
          },
        });

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
          onComplete: () => {
            scrollBlocked = false;
          },
        });
      },
    });

    if (returnFromProjects) {
      gsap.set(overlay, { "--gradient-size": "0%" });
      tlRef.current?.progress(1, false);

      if (hero2Ref.current) {
        gsap.set(hero2Ref.current, { opacity: 1 });
      }
      hasFadedOut.current = false;
      scrollBlocked = false;

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

      const icons = container.querySelectorAll<HTMLImageElement>(
        ".scrollIndicatorContainer img"
      );
      gsap.set(icons, { opacity: 0, x: -45 });
      gsap.to(icons, {
        opacity: 1,
        x: 0,
        stagger: 0.2,
        delay: 1.5,
        duration: 1,
        ease: "power2.out",
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
    } else {
      scrollBlocked = false;
    }

    const handleWheel = (e: WheelEvent) => {
      const rect = container.getBoundingClientRect();
      const isAtTop = window.scrollY === 0;
      if (!isAtTop) return;

      if (rect.top <= 0 && rect.bottom > 0) {
        if (scrollBlocked) e.preventDefault();
        if (e.deltaY > 0 && (tlRef.current?.progress() ?? 0) < 1) {
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
        const deltaY = touchStartY.current - e.touches[0].clientY;
        if (deltaY > 30 && (tlRef.current?.progress() ?? 0) < 1) {
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
  }, [returnFromProjects, onResetReturnFromProjects]);

  return (
    <div ref={containerRef} className={styles.containerHero} id="about">
      <div ref={overlayRef} className={styles.overlay}></div>

      {gradientState === "hero1" && <HeroBeforeScroll />}
      {gradientState === "hero2" && (
        <HeroAfterScroll
          ref={hero2Ref}
          onReturnToHeroBefore={handleReturnToHeroBefore}
          onTransitionToProjects={onTransitionToProjects}
          returnFromProjects={returnFromProjects}
        />
      )}
    </div>
  );
};

export default Hero;
