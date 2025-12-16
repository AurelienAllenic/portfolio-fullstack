import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import styles from "./projects.module.scss";
import ProjectCategory from "./ProjectCategory";
import type { ProjectCover } from "./ProjectCategory";
import {
  openclassrooms1_cover,
  openclassrooms2_cover,
  openclassrooms3_cover,
  projects_cover,
} from "./Data";

const SliderProjects = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrollLocked, setScrollLocked] = useState(true);
  const touchStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutId = useRef<number | null>(null);
  const isInitialMount = useRef(true);
  // ✅ Ajouter une ref pour avoir toujours la valeur à jour de currentIndex
  const currentIndexRef = useRef(0);
  const scrollLockedRef = useRef(true); // ✅ Ajouter aussi une ref pour scrollLocked

  const covers: ProjectCover[] = [
    openclassrooms1_cover,
    openclassrooms2_cover,
    openclassrooms3_cover,
    projects_cover,
  ];

  // ✅ Synchroniser la ref avec le state
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Synchroniser les refs avec les states
  useEffect(() => {
    scrollLockedRef.current = scrollLocked;
  }, [scrollLocked]);

  // Mettre tous les éléments à opacity 0 dès le montage
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Mettre tous les éléments à opacity 0 immédiatement
    const allElements = container.querySelectorAll('[data-category-index]');
    gsap.set(allElements, { opacity: 0, y: 100 });
    
    // Mettre le container visible
    gsap.set(container, { opacity: 1 });
  }, []);

  // Animation initiale : apparaître exactement quand le gradient a tout recouvert
  useEffect(() => {
    if (!isInitialMount.current) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    // Attendre que les éléments soient montés
    const timer = setTimeout(() => {
      const firstElement = container.querySelector(
        `[data-category-index="0"]`
      );
      
      if (firstElement) {
        // Animation d'apparition depuis le bas
        gsap.to(firstElement, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          onComplete: () => {
            setScrollLocked(false);
            isInitialMount.current = false;
          },
        });
      } else {
        // Fallback
        setScrollLocked(false);
        isInitialMount.current = false;
      }
    }, 500); // Synchronisé avec la fin de l'animation du gradient

    return () => clearTimeout(timer);
  }, []);

  // ✅ Utiliser useCallback pour mémoriser changeCategory
  const changeCategory = useCallback((nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= covers.length) {
      console.log("Index invalide:", nextIndex);
      return;
    }

    const currentIdx = currentIndexRef.current;
    console.log("Changement de catégorie:", currentIdx, "->", nextIndex);
    console.log("scrollLocked avant:", scrollLockedRef.current);

    // Vérifier si on est déjà en train d'animer
    if (scrollLockedRef.current) {
      console.log("Scroll déjà verrouillé, annulation");
      return;
    }

    setScrollLocked(true);
    scrollLockedRef.current = true;
    document.body.style.overflow = "hidden";

    const safetyTimeout = setTimeout(() => {
      console.warn("Timeout de sécurité - déblocage du scroll");
      setCurrentIndex(nextIndex);
      setScrollLocked(false);
      scrollLockedRef.current = false;
      document.body.style.overflow = "";
    }, 2000);

    const currentElement = containerRef.current?.querySelector(
      `[data-category-index="${currentIdx}"]`
    );
    const nextElement = containerRef.current?.querySelector(
      `[data-category-index="${nextIndex}"]`
    );

    if (!currentElement || !nextElement) {
      console.error("Éléments non trouvés:", { currentIdx, nextIndex });
      clearTimeout(safetyTimeout);
      setCurrentIndex(nextIndex);
      setScrollLocked(false);
      scrollLockedRef.current = false;
      document.body.style.overflow = "";
      return;
    }

    // S'assurer que l'élément suivant est bien positionné
    gsap.set(nextElement, { y: 100, opacity: 0 });

    const tl = gsap.timeline({
      onComplete: () => {
        console.log("Animation terminée, nouvel index:", nextIndex);
        clearTimeout(safetyTimeout);
        setCurrentIndex(nextIndex);
        setScrollLocked(false);
        scrollLockedRef.current = false;
        document.body.style.overflow = "";
      },
    });

    // Disparition de l'élément actuel
    tl.to(currentElement, {
      y: -100,
      opacity: 0,
      duration: 0.6,
      ease: "power2.in",
    });

    // Apparition du nouvel élément
    tl.fromTo(
      nextElement,
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power2.out",
      },
      "-=0.3"
    );
  }, [covers.length]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (scrollLockedRef.current || timeoutId.current) {
        e.preventDefault();
        e.stopPropagation(); // ✅ Empêcher la propagation
        return;
      }

      const isAtTop = window.scrollY === 0;
      if (!isAtTop) return;

      const goingDown = e.deltaY > 0;
      const goingUp = e.deltaY < 0;
      const currentIdx = currentIndexRef.current;

      console.log("Scroll détecté:", {
        goingDown,
        goingUp,
        currentIdx,
        maxIndex: covers.length - 1,
        scrollLocked: scrollLockedRef.current,
      });

      // ✅ Gérer le scroll vers le bas
      if (goingDown && currentIdx < covers.length - 1) {
        e.preventDefault();
        e.stopPropagation(); // ✅ Empêcher la propagation vers Projects
        changeCategory(currentIdx + 1);
      } 
      // ✅ Gérer le scroll vers le haut SEULEMENT si on n'est pas au premier index
      else if (goingUp && currentIdx > 0) {
        e.preventDefault();
        e.stopPropagation(); // ✅ Empêcher la propagation vers Projects
        changeCategory(currentIdx - 1);
      }
      // ✅ Si on est à l'index 0 et qu'on scroll vers le haut, laisser passer l'événement
      // pour que Projects puisse gérer le retour vers Hero
      else if (goingUp && currentIdx === 0) {
        // Ne rien faire, laisser Projects gérer
        return;
      }

      timeoutId.current = setTimeout(() => {
        timeoutId.current = null;
      }, 100);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      if (timeoutId.current) clearTimeout(timeoutId.current);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [changeCategory, covers.length]); // ✅ Ajouter changeCategory dans les dépendances

  const handleTouchStart = (e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (scrollLockedRef.current || touchStartY.current === null) return;

    const isAtTop = window.scrollY === 0;
    if (!isAtTop) return;

    const deltaY = touchStartY.current - e.touches[0].clientY;
    const currentIdx = currentIndexRef.current;

    // ✅ Gérer le swipe vers le bas
    if (deltaY > 30 && currentIdx < covers.length - 1) {
      e.preventDefault();
      e.stopPropagation(); // ✅ Empêcher la propagation
      changeCategory(currentIdx + 1);
    } 
    // ✅ Gérer le swipe vers le haut SEULEMENT si on n'est pas au premier index
    else if (deltaY < -30 && currentIdx > 0) {
      e.preventDefault();
      e.stopPropagation(); // ✅ Empêcher la propagation
      changeCategory(currentIdx - 1);
    }
    // ✅ Si on est à l'index 0 et qu'on swipe vers le haut, laisser passer l'événement
    else if (deltaY < -30 && currentIdx === 0) {
      // Ne rien faire, laisser Projects gérer
      return;
    }
  };

  useEffect(() => {
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", () => (touchStartY.current = null));

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", () => (touchStartY.current = null));
    };
  }, [changeCategory]); // ✅ Ajouter changeCategory dans les dépendances

  // ✅ Exposer l'état via un attribut data sur le container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Mettre à jour les attributs data pour que Projects puisse les lire
    container.setAttribute('data-slider-index', currentIndex.toString());
    container.setAttribute('data-slider-locked', scrollLocked.toString());
  }, [currentIndex, scrollLocked]);

  return (
    <div 
      ref={containerRef} 
      className={styles.containerSlider}
      data-slider-index={currentIndex}
      data-slider-locked={scrollLocked}
    >
      {covers.map((cover, index) => (
        <div
          key={index}
          data-category-index={index}
          style={{
            position: index === currentIndex ? "relative" : "absolute",
            top: 0,
            left: 0,
            width: "100%",
            opacity: 0, // TOUS les éléments commencent à 0
            pointerEvents: index === currentIndex ? "auto" : "none",
            zIndex: index === currentIndex ? 10 : 1,
          }}
        >
          <ProjectCategory cover={cover} />
        </div>
      ))}
    </div>
  );
};

export default SliderProjects;