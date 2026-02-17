import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import styles from "./projects.module.scss";
import { useEditMode } from "../../../contexts/EditModeContext";

interface ProjectsProps {
  onTransitionToHero?: () => void;
}

const Projects = ({ onTransitionToHero }: ProjectsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const { isEditMode } = useEditMode();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollBlocked = true;
    let timeoutId: number | null = null;

    gsap.fromTo(
      container,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          scrollBlocked = false;
          document.body.style.overflow = "";
        },
      }
    );

    const canReturnToHero = (): boolean => {
      const sliderContainer = document.querySelector('[data-slider-index]') as HTMLElement;
      if (!sliderContainer) return true;
      
      const sliderIndex = parseInt(sliderContainer.getAttribute('data-slider-index') || '0');
      const sliderLocked = sliderContainer.getAttribute('data-slider-locked') === 'true';
      
      return sliderIndex === 0 && !sliderLocked;
    };

    const handleWheel = (e: WheelEvent) => {
      if (document.body.getAttribute("data-modal-open") === "true") {
        return;
      }
      
      // Bloquer le scroll si le mode édition est activé
      if (isEditMode) {
        e.preventDefault();
        return;
      }
      
      if (scrollBlocked || timeoutId) {
        e.preventDefault();
        return;
      }

      const isAtTop = window.scrollY === 0;
      if (!isAtTop) return;

      // Seuil minimum pour éviter les micro-scrolls du trackpad (réduit à 1 pour plus de sensibilité)
      const SCROLL_THRESHOLD = 1;
      const goingUp = e.deltaY < -SCROLL_THRESHOLD;

      if (goingUp && canReturnToHero()) {
        e.preventDefault();
        scrollBlocked = true;
        gsap.to(container, {
          opacity: 0,
          duration: 0.5,
          ease: "power2.out",
          onComplete: () => {
            onTransitionToHero?.();
          },
        });
      }

      timeoutId = setTimeout(() => {
        timeoutId = null;
      }, 100);
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (document.body.getAttribute("data-modal-open") === "true") {
        return;
      }
      
      // Bloquer le scroll si le mode édition est activé
      if (isEditMode) {
        e.preventDefault();
        return;
      }
      
      if (scrollBlocked || touchStartY.current === null) return;

      const isAtTop = window.scrollY === 0;
      if (!isAtTop) return;

      const deltaY = e.touches[0].clientY - touchStartY.current;

      if (deltaY > 30 && canReturnToHero()) {
        e.preventDefault();
        scrollBlocked = true;
        gsap.to(container, {
          opacity: 0,
          duration: 0.5,
          ease: "power2.out",
          onComplete: () => {
            onTransitionToHero?.();
          },
        });
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", () => (touchStartY.current = null));

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener(
        "touchend",
        () => (touchStartY.current = null)
      );
    };
  }, [onTransitionToHero, isEditMode]);

  return (
    <div
      ref={containerRef}
      className={styles.containerProjects}
      id="projects"
    ></div>
  );
};

export default Projects;
