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
  // ✅ Ref pour suivre si on est au bout (bas ou haut)
  const isAtBottomRef = useRef(false);
  const isAtTopRef = useRef(false);

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
  const changeCategory = useCallback((nextIndex: number, direction: 'up' | 'down' = 'down') => {
    if (nextIndex < 0 || nextIndex >= covers.length) {
      console.log("Index invalide:", nextIndex);
      return;
    }

    const currentIdx = currentIndexRef.current;
    console.log("Changement de catégorie:", currentIdx, "->", nextIndex, "direction:", direction);
    console.log("scrollLocked avant:", scrollLockedRef.current);

    // Vérifier si on est déjà en train d'animer
    if (scrollLockedRef.current) {
      console.log("Scroll déjà verrouillé, annulation");
      return;
    }

    setScrollLocked(true);
    scrollLockedRef.current = true;
    document.body.style.overflow = "hidden";
    
    // ✅ Ne pas réinitialiser le scroll immédiatement
    // On le fera seulement quand la nouvelle catégorie est prête à apparaître

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

    // S'assurer que l'élément suivant est bien positionné et invisible
    // On le garde invisible jusqu'à ce que le scroll soit en haut
    gsap.set(nextElement, { y: 100, opacity: 0 });

    // ✅ INITIALISER les éléments internes AVANT de rendre le parent visible
    const nextCategoryContainer = nextElement.querySelector('section');
    if (nextCategoryContainer) {
      const mosaicItems = nextCategoryContainer.querySelectorAll(`[class*="mosaicItem"]`);
      const ctaButton = nextCategoryContainer.querySelector(`[class*="cta"]`);
      const titleMain = nextCategoryContainer.querySelector(`[class*="titleMain"]`);
      const titleAccent = nextCategoryContainer.querySelector(`[class*="titleAccent"]`);
      const contentBox = nextCategoryContainer.querySelector(`[class*="contentBox"]`);
      const icons = nextCategoryContainer.querySelectorAll(`[class*="iconContainer"]`);
      const rightImage = nextCategoryContainer.querySelector(`[class*="right"] img`);

      // ✅ Initialiser immédiatement tous les éléments internes
      if (mosaicItems.length > 0) gsap.set(mosaicItems, { opacity: 0 });
      if (ctaButton) gsap.set(ctaButton, { opacity: 0, y: 30 });
      if (titleMain && titleAccent) gsap.set([titleMain, titleAccent], { opacity: 0, y: -30 });
      if (contentBox) gsap.set(contentBox, { opacity: 0 });
      if (icons.length > 0) gsap.set(icons, { opacity: 0 });
      if (rightImage) gsap.set(rightImage, { opacity: 0, x: 50 });
    }

    const tl = gsap.timeline({
      onComplete: () => {
        console.log("Animation terminée, nouvel index:", nextIndex);
        clearTimeout(safetyTimeout);
        // ✅ S'assurer que le scroll est bien en haut avant de rendre visible
        window.scrollTo({ top: 0, behavior: 'instant' });
        // ✅ Attendre un frame pour être sûr que le scroll est bien en haut
        requestAnimationFrame(() => {
          setCurrentIndex(nextIndex);
          setScrollLocked(false);
          scrollLockedRef.current = false;
          document.body.style.overflow = "";
        });
      },
    });

    // Disparition de l'élément actuel
    tl.to(currentElement, {
      y: -100,
      opacity: 0,
      duration: 0.6,
      ease: "power2.in",
    });

    // Apparition du nouvel élément avec animation fluide
    // On anime d'abord le translate
    tl.to(nextElement, {
      y: 0,
      duration: 0.6,
      ease: "power2.out",
    }, "-=0.3");
    
    // ✅ Réinitialiser le scroll en haut pendant l'animation de transition
    // On le fait juste avant l'animation d'opacity pour que ce soit fluide
    tl.call(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
    
    // ✅ Animation d'opacity fluide après que le scroll soit en haut
    tl.to(nextElement, {
      opacity: 1,
      duration: 0.4,
      ease: "power2.out",
    });
  }, [covers.length]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (scrollLockedRef.current || timeoutId.current) {
        e.preventDefault();
        e.stopPropagation(); // ✅ Empêcher la propagation
        return;
      }

      // ✅ Vérifier si on est dans la zone du slider (même si on a scrollé)
      // On vérifie si le container du slider est visible dans le viewport
      const container = containerRef.current;
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      // Si le container n'est pas visible dans le viewport, ne pas gérer le scroll
      if (containerRect.bottom < 0 || containerRect.top > window.innerHeight) return;

      const goingDown = e.deltaY > 0;
      const goingUp = e.deltaY < 0;
      const currentIdx = currentIndexRef.current;

      // ✅ Vérifier si on est au bout du scroll du composant actuel
      const currentElement = containerRef.current?.querySelector(
        `[data-category-index="${currentIdx}"]`
      );
      
      if (!currentElement) return;

      // ✅ Obtenir les informations de scroll du composant
      const categorySection = currentElement.querySelector('section');
      if (!categorySection) return;

      const sectionRect = categorySection.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const sectionTop = sectionRect.top;
      const sectionBottom = sectionRect.bottom;
      const sectionHeight = sectionRect.height;
      
      // ✅ Vérifier si le contenu dépasse la hauteur du viewport
      const contentOverflows = sectionHeight > viewportHeight;
      
      // ✅ Vérifier si on est sur mobile (viewport < 900px)
      const isMobile = window.innerWidth <= 900;
      
      // ✅ Vérifier si on est au bout en bas
      // Sur mobile, on vérifie si mobileCta ou mobileBottomSection est visible
      let isSectionAtBottom = false;
      if (isMobile) {
        // Sur mobile, chercher mobileCta ou mobileBottomSection
        const mobileCta = categorySection.querySelector('[class*="mobileCta"]');
        const mobileBottomSection = categorySection.querySelector('[class*="mobileBottomSection"]');
        const bottomElement = mobileCta || mobileBottomSection;
        
        if (bottomElement) {
          const bottomRect = bottomElement.getBoundingClientRect();
          // Si le bas de l'élément est visible dans le viewport (avec une marge)
          isSectionAtBottom = bottomRect.bottom <= viewportHeight + 50;
        } else {
          // Fallback : utiliser la position du composant
          const distanceFromBottom = sectionBottom - viewportHeight;
          isSectionAtBottom = contentOverflows 
            ? distanceFromBottom <= 50
            : true;
        }
      } else {
        // Sur desktop, utiliser la logique précédente
        const distanceFromBottom = sectionBottom - viewportHeight;
        isSectionAtBottom = contentOverflows 
          ? distanceFromBottom <= 50
          : true;
      }
      
      // On est au bout en haut si le haut du composant est visible dans le viewport
      // Le composant est positionné à top: 0, donc on est au bout si sectionTop est proche de 0
      const isSectionAtTop = sectionTop >= -20;
      
      // ✅ On peut scroller vers le bas seulement si le contenu dépasse ET qu'on n'est pas au bout
      const canScrollDown = contentOverflows && !isSectionAtBottom;
      // ✅ On peut scroller vers le haut seulement si le contenu dépasse ET qu'on n'est pas au bout
      const canScrollUp = contentOverflows && !isSectionAtTop;

      // ✅ Logs pour débogage (récupérer les éléments pour les logs)
      const mobileCta = categorySection.querySelector('[class*="mobileCta"]');
      const mobileBottomSection = categorySection.querySelector('[class*="mobileBottomSection"]');
      const bottomElement = mobileCta || mobileBottomSection;
      const bottomElementRect = bottomElement?.getBoundingClientRect();
      
      console.log("Scroll détecté:", {
        goingDown,
        goingUp,
        currentIdx,
        canScrollDown,
        canScrollUp,
        contentOverflows,
        isSectionAtBottom,
        isSectionAtTop,
        isMobile,
        bottomElementFound: !!bottomElement,
        bottomElementBottom: bottomElementRect?.bottom,
        distanceFromBottom: sectionBottom - viewportHeight,
        sectionBottom: sectionRect.bottom,
        sectionTop: sectionRect.top,
        sectionHeight,
        viewportHeight,
      });

      // ✅ Si on scroll vers le bas
      if (goingDown) {
        // Si on peut encore scroller dans le composant, laisser faire
        if (canScrollDown) {
          isAtBottomRef.current = false; // On n'est plus au bout si on peut scroller
          return; // Laisser le scroll normal se faire
        }
        
        // On est au bout maintenant
        // Ne changer de catégorie que si on était déjà au bout avant (scroll supplémentaire au bout)
        if (isAtBottomRef.current && currentIdx < covers.length - 1) {
          e.preventDefault();
          e.stopPropagation();
          changeCategory(currentIdx + 1, 'down');
          // Réinitialiser après le changement
          isAtBottomRef.current = false;
        } else {
          // On vient d'arriver au bout, mémoriser pour le prochain scroll
          isAtBottomRef.current = true;
        }
      } 
      // ✅ Si on scroll vers le haut
      else if (goingUp) {
        // Si on peut encore scroller dans le composant, laisser faire
        if (canScrollUp) {
          isAtTopRef.current = false; // On n'est plus au bout si on peut scroller
          return; // Laisser le scroll normal se faire
        }
        
        // On est au bout maintenant
        // Ne changer de catégorie que si on était déjà au bout avant (scroll supplémentaire au bout)
        if (isAtTopRef.current && currentIdx > 0) {
          e.preventDefault();
          e.stopPropagation();
          changeCategory(currentIdx - 1, 'up');
          // Réinitialiser après le changement
          isAtTopRef.current = false;
        } else {
          // On vient d'arriver au bout, mémoriser pour le prochain scroll
          isAtTopRef.current = true;
        }
        // Si on est à l'index 0 et au bout, laisser passer pour Projects
        if (currentIdx === 0) {
          return; // Laisser Projects gérer le retour vers Hero
        }
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

    // ✅ Vérifier si on est dans la zone du slider (même si on a scrollé)
    const container = containerRef.current;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    // Si le container n'est pas visible dans le viewport, ne pas gérer le scroll
    if (containerRect.bottom < 0 || containerRect.top > window.innerHeight) return;

    const deltaY = touchStartY.current - e.touches[0].clientY;
    const currentIdx = currentIndexRef.current;

    // ✅ Vérifier si on est au bout du scroll du composant actuel
    const currentElement = containerRef.current?.querySelector(
      `[data-category-index="${currentIdx}"]`
    );
    
    if (!currentElement) return;

    const categorySection = currentElement.querySelector('section');
    if (!categorySection) return;

    const sectionRect = categorySection.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const sectionTop = sectionRect.top;
    const sectionBottom = sectionRect.bottom;
    const sectionHeight = sectionRect.height;
    
    // ✅ Vérifier si le contenu dépasse la hauteur du viewport
    const contentOverflows = sectionHeight > viewportHeight;
    
    // ✅ Vérifier si on est sur mobile (viewport < 900px)
    const isMobile = window.innerWidth <= 900;
    
    // ✅ Vérifier si on est au bout en bas
    // Sur mobile, on vérifie si mobileCta ou mobileBottomSection est visible
    let isSectionAtBottom = false;
    if (isMobile) {
      // Sur mobile, chercher mobileCta ou mobileBottomSection
      const mobileCta = categorySection.querySelector('[class*="mobileCta"]');
      const mobileBottomSection = categorySection.querySelector('[class*="mobileBottomSection"]');
      const bottomElement = mobileCta || mobileBottomSection;
      
      if (bottomElement) {
        const bottomRect = bottomElement.getBoundingClientRect();
        // Si le bas de l'élément est visible dans le viewport (avec une marge)
        isSectionAtBottom = bottomRect.bottom <= viewportHeight + 50;
      } else {
        // Fallback : utiliser la position du composant
        const distanceFromBottom = sectionBottom - viewportHeight;
        isSectionAtBottom = contentOverflows 
          ? distanceFromBottom <= 50
          : true;
      }
    } else {
      // Sur desktop, utiliser la logique précédente
      const distanceFromBottom = sectionBottom - viewportHeight;
      isSectionAtBottom = contentOverflows 
        ? distanceFromBottom <= 50
        : true;
    }
    
    // Le composant est positionné à top: 0, donc on est au bout si sectionTop est proche de 0
    const isSectionAtTop = sectionTop >= -20;
    
    // ✅ On peut scroller vers le bas seulement si le contenu dépasse ET qu'on n'est pas au bout
    const canScrollDown = contentOverflows && !isSectionAtBottom;
    // ✅ On peut scroller vers le haut seulement si le contenu dépasse ET qu'on n'est pas au bout
    const canScrollUp = contentOverflows && !isSectionAtTop;

    // ✅ Gérer le swipe vers le bas
    if (deltaY > 30) {
      // Si on peut encore scroller dans le composant, laisser faire
      if (canScrollDown) {
        isAtBottomRef.current = false; // On n'est plus au bout si on peut scroller
        return; // Laisser le scroll normal se faire
      }
      
      // On est au bout maintenant
      // Ne changer de catégorie que si on était déjà au bout avant (swipe supplémentaire au bout)
      if (isAtBottomRef.current && currentIdx < covers.length - 1) {
        e.preventDefault();
        e.stopPropagation();
        changeCategory(currentIdx + 1, 'down');
        // Réinitialiser après le changement
        isAtBottomRef.current = false;
      } else {
        // On vient d'arriver au bout, mémoriser pour le prochain swipe
        isAtBottomRef.current = true;
      }
    } 
    // ✅ Gérer le swipe vers le haut
    else if (deltaY < -30) {
      // Si on peut encore scroller dans le composant, laisser faire
      if (canScrollUp) {
        isAtTopRef.current = false; // On n'est plus au bout si on peut scroller
        return; // Laisser le scroll normal se faire
      }
      
      // On est au bout maintenant
      // Ne changer de catégorie que si on était déjà au bout avant (swipe supplémentaire au bout)
      if (isAtTopRef.current && currentIdx > 0) {
        e.preventDefault();
        e.stopPropagation();
        changeCategory(currentIdx - 1, 'up');
        // Réinitialiser après le changement
        isAtTopRef.current = false;
      } else {
        // On vient d'arriver au bout, mémoriser pour le prochain swipe
        isAtTopRef.current = true;
      }
      // Si on est à l'index 0 et au bout, laisser passer pour Projects
      if (currentIdx === 0) {
        return; // Laisser Projects gérer le retour vers Hero
      }
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
            opacity: index === currentIndex ? 1 : 0, // ✅ Changer pour permettre l'animation
            pointerEvents: index === currentIndex ? "auto" : "none",
            zIndex: index === currentIndex ? 10 : 1,
          }}
        >
          <ProjectCategory 
            cover={cover} 
            categoryIndex={index === currentIndex ? currentIndex : undefined}
          />
        </div>
      ))}
    </div>
  );
};

export default SliderProjects;