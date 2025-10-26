import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import styles from "./projects.module.scss";

interface ProjectsProps {
  onTransitionToHero?: () => void;
}

const Projects = ({ onTransitionToHero }: ProjectsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollBlocked = true;
    let timeoutId: number | null = null;

    // Fade in animation
    gsap.fromTo(
      container,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          scrollBlocked = false;
        },
      }
    );

    const handleWheel = (e: WheelEvent) => {
      if (scrollBlocked || timeoutId) {
        e.preventDefault();
        return;
      }

      const isAtTop = window.scrollY === 0;
      if (!isAtTop) return;

      const goingUp = e.deltaY < 0;

      if (goingUp) {
        e.preventDefault();
        onTransitionToHero?.();
      }

      timeoutId = setTimeout(() => {
        timeoutId = null;
      }, 100);
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (scrollBlocked || touchStartY.current === null) return;

      const isAtTop = window.scrollY === 0;
      if (!isAtTop) return;

      const deltaY = e.touches[0].clientY - touchStartY.current;

      if (deltaY > 30) {
        // Swipe up
        e.preventDefault();
        onTransitionToHero?.();
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
  }, [onTransitionToHero]);

  return (
    <div
      ref={containerRef}
      className={styles.containerProjects}
      id="projects"
    ></div>
  );
};

export default Projects;
