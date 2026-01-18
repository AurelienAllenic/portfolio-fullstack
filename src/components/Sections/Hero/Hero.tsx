// Hero.tsx
import { useEffect, useRef, useState } from "react";
import styles from "./hero.module.scss";
import { gsap } from "gsap";
import HeroBeforeScroll from "./HeroBeforeScroll";
import HeroAfterScroll from "./HeroAfterScroll";

interface HeroProps {
  onTransitionToProjects?: () => void;
  returnFromProjects?: boolean;
  onResetReturnFromProjects?: () => void;
  forceHeroState?: "hero1" | "hero2";
  forceTextIndex?: number; // Pour forcer un textIndex dans HeroAfterScroll
  onNavigationReset?: boolean; // Signal de réinitialisation après navigation
}

const Hero: React.FC<HeroProps> = ({
  onTransitionToProjects,
  returnFromProjects,
  onResetReturnFromProjects,
  forceHeroState,
  forceTextIndex,
  onNavigationReset,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hero2Ref = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const hasFadedOut = useRef(false);
  const touchStartY = useRef<number | null>(null);

  const [gradientState, setGradientState] = useState<
    "hero1" | "hero2" | "transition"
  >(forceHeroState || (returnFromProjects ? "hero2" : "hero1"));
  
  console.log('🎬 [HERO] Component render - gradientState:', gradientState, 'forceHeroState:', forceHeroState, 'returnFromProjects:', returnFromProjects);
  
  const isForcedNavigationRef = useRef(false);
  const lastForceHeroStateRef = useRef<"hero1" | "hero2" | undefined>(undefined);
  const currentGradientStateRef = useRef<"hero1" | "hero2" | "transition">(gradientState);

  // Mettre à jour le ref quand gradientState change
  useEffect(() => {
    currentGradientStateRef.current = gradientState;
  }, [gradientState]);

  // Mettre à jour l'état si forceHeroState change
  useEffect(() => {
    console.log('🔄 [HERO] forceHeroState changed to:', forceHeroState, 'current gradientState:', currentGradientStateRef.current);
    
    if (forceHeroState === undefined) {
      console.log('🔄 [HERO] forceHeroState is undefined, clearing forced navigation flag');
      isForcedNavigationRef.current = false;
      // Réinitialiser lastForceHeroStateRef quand forceHeroState devient undefined
      lastForceHeroStateRef.current = undefined;
      return;
    }
    
    const overlay = overlayRef.current;
    const container = containerRef.current;
    
    if (!overlay || !container) return;
    
    // Toujours forcer le changement si forceHeroState est défini et différent de la dernière valeur
    // OU si gradientState ne correspond pas à forceHeroState (arrivé via scroll)
    // Cela garantit que même si on est arrivé via scroll, le clic sur la nav force le changement
    const currentGradient = currentGradientStateRef.current;
    const forceChanged = lastForceHeroStateRef.current !== forceHeroState;
    
    // Vérifier si l'état actuel ne correspond pas à forceHeroState
    // Si on est dans hero2 (via scroll) et qu'on clique sur "Aurélien Allenic" (hero1), on doit forcer
    const stateMismatch = (forceHeroState === "hero1" && (currentGradient === "hero2" || currentGradient === "transition")) ||
                          (forceHeroState === "hero2" && currentGradient !== "hero2");
    
    console.log('🔄 [HERO] forceChanged:', forceChanged, 'stateMismatch:', stateMismatch, 'currentGradient:', currentGradient);
    
    // Toujours forcer le changement si forceHeroState a changé OU si l'état actuel ne correspond pas
    // IMPORTANT: On force toujours si stateMismatch est true, même si forceChanged est false
    if (forceChanged || stateMismatch) {
      console.log('🟢 [HERO] Forcing state change to:', forceHeroState);
      isForcedNavigationRef.current = true;
      lastForceHeroStateRef.current = forceHeroState;
      
      if (forceHeroState === "hero1") {
        console.log('🟢 [HERO] Forcing to hero1 (HeroBeforeScroll)');
        // Forcer le changement immédiatement
        setGradientState("hero1");
        gsap.set(overlay, { "--gradient-size": "0%" });
        
        if (tlRef.current) {
          tlRef.current.progress(0);
          tlRef.current.pause();
        }
        
        if (hero2Ref.current) {
          gsap.set(hero2Ref.current, { opacity: 0 });
        }
        
        document.body.style.overflow = "hidden";
        
        setTimeout(() => {
          isForcedNavigationRef.current = false;
        }, 100);
      } else if (forceHeroState === "hero2") {
        // Forcer le changement immédiatement
        setGradientState("hero2");
        gsap.set(overlay, { "--gradient-size": "100%" });
        
        if (tlRef.current) {
          // Jouer la timeline jusqu'à la fin pour déclencher toutes les animations
          tlRef.current.progress(1, false);
          // Déclencher manuellement le onComplete pour simuler le scroll
          if (tlRef.current.progress() === 1) {
            const isDesktop = window.matchMedia("(min-width: 768px)").matches;
            
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
          }
        }
        
        if (hero2Ref.current) {
          // Rendre hero2 visible IMMÉDIATEMENT
          gsap.set(hero2Ref.current, { opacity: 1 });
          
          // S'assurer que le contentContainer est visible
          const contentContainer = hero2Ref.current.querySelector('[class*="contentContainer"]') as HTMLElement;
          if (contentContainer) {
            gsap.set(contentContainer, { opacity: 1 });
          }
        }
        
        setTimeout(() => {
          isForcedNavigationRef.current = false;
        }, 100);
      }
    }
    
    // Toujours mettre à jour lastForceHeroStateRef après avoir traité le changement
    // pour éviter les problèmes de synchronisation
    lastForceHeroStateRef.current = forceHeroState;
  }, [forceHeroState]);

  const handleReturnToHeroBefore = () => {
    const overlay = overlayRef.current;
    const hero2 = hero2Ref.current;

    // Bloquer temporairement le onReverseComplete
    isForcedNavigationRef.current = true;

    if (hero2) {
      gsap.to(hero2, {
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
      });
    }

    if (overlay) {
      gsap.to(overlay, {
        "--gradient-size": "0%",
        duration: 1,
        ease: "power2.out",
      });
    }

    setTimeout(() => {
      setGradientState("hero1");
      onResetReturnFromProjects?.();

      if (tlRef.current) {
        tlRef.current.progress(0);
        tlRef.current.pause();
      }

      if (hero2) gsap.set(hero2, { opacity: 1 });

      // Forcer le gradient à rester à 0% (pas d'animation vers 30%)
      if (overlay) {
        gsap.set(overlay, { "--gradient-size": "0%" });
      }

      document.body.style.overflow = "auto";
      
      // Débloquer après un délai
      setTimeout(() => {
        isForcedNavigationRef.current = false;
      }, 100);
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

        const progress = tl.progress();

        // Ne pas mettre à jour gradientState si c'est une navigation forcée
        if (!isForcedNavigationRef.current) {
          if (val > 0 && val < 50) {
            setGradientState("transition");
          } else if (val >= 50) {
            setGradientState("hero2");
          } else if (val === 0) {
            setGradientState("hero1");
          }
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
        // Ne pas exécuter si c'est une navigation forcée
        if (isForcedNavigationRef.current) {
          return;
        }
        
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
      // Vérifier si la modale CV est ouverte
      if (document.body.getAttribute("data-modal-open") === "true") {
        return;
      }
      
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
      // Vérifier si la modale CV est ouverte
      if (document.body.getAttribute("data-modal-open") === "true") {
        return;
      }
      
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

      {gradientState === "hero1" && <HeroBeforeScroll key="hero1" />}
      {gradientState === "hero2" && (
        <HeroAfterScroll
          key="hero2"
          ref={hero2Ref}
          onReturnToHeroBefore={handleReturnToHeroBefore}
          onTransitionToProjects={onTransitionToProjects}
          returnFromProjects={returnFromProjects}
          isForced={forceHeroState === "hero2"}
          forceTextIndex={forceTextIndex}
          onNavigationReset={onNavigationReset}
        />
      )}
    </div>
  );
};

export default Hero;
