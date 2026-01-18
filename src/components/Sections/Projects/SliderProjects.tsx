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

interface SliderProjectsProps {
  onTransitionToContact?: () => void;
  onTransitionFromContact?: () => void;
  forceIndex?: number;
  onForceIndexComplete?: () => void;
}

const SliderProjects = ({ onTransitionToContact, onTransitionFromContact, forceIndex, onForceIndexComplete }: SliderProjectsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrollLocked, setScrollLocked] = useState(true);
  const touchStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutId = useRef<number | null>(null);
  const isInitialMount = useRef(true);
  const currentIndexRef = useRef(0);
  const scrollLockedRef = useRef(true);
  const isAtBottomRef = useRef(false);
  const isAtTopRef = useRef(false);

  const covers: ProjectCover[] = [
    openclassrooms1_cover,
    openclassrooms2_cover,
    openclassrooms3_cover,
    projects_cover,
  ];

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Forcer l'index si forceIndex est défini
  useEffect(() => {
    if (forceIndex !== undefined && forceIndex !== currentIndex) {
      setCurrentIndex(forceIndex);
      currentIndexRef.current = forceIndex;
      
      // ⚠️ CRITIQUE : Réinitialiser toutes les refs de scroll
      isAtBottomRef.current = false;
      isAtTopRef.current = true; // On arrive en haut de la catégorie forcée
      
      // ⚠️ IMPORTANT : Marquer que ce n'est plus le montage initial
      // Cela évite que le premier scroll rejoue l'animation d'entrée
      isInitialMount.current = false;
      
      // Annuler tout timeout en cours
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
        timeoutId.current = null;
      }
      
      // Déverrouiller le scroll IMMÉDIATEMENT et de manière forcée
      setTimeout(() => {
        setScrollLocked(false);
        scrollLockedRef.current = false;
        document.body.style.overflow = "";
        touchStartY.current = null;
      }, 100);
      
      // Notifier IMMÉDIATEMENT que l'index a été forcé pour le réinitialiser
      // MAIS NE PAS LE FAIRE ICI car ça redéclenche le useEffect parent
      // if (onForceIndexComplete) {
      //   onForceIndexComplete();
      // }
    }
  }, [forceIndex, currentIndex, onForceIndexComplete]);

  useEffect(() => {
    scrollLockedRef.current = scrollLocked;
  }, [scrollLocked]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const allElements = container.querySelectorAll('[data-category-index]');
    gsap.set(allElements, { opacity: 0, y: 100 });
    
    gsap.set(container, { opacity: 1 });
  }, []);

  useEffect(() => {
    if (!isInitialMount.current) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    const timer = setTimeout(() => {
      const firstElement = container.querySelector(
        `[data-category-index="0"]`
      );
      
      if (firstElement) {
        const firstCategoryContainer = firstElement.querySelector('section');
        if (firstCategoryContainer) {
          const mosaicItems = firstCategoryContainer.querySelectorAll(`[class*="mosaicItem"]`);
          const ctaButton = firstCategoryContainer.querySelector(`[class*="cta"]`);
          const titleMain = firstCategoryContainer.querySelector(`[class*="titleMain"]`);
          const titleAccent = firstCategoryContainer.querySelector(`[class*="titleAccent"]`);
          const contentBox = firstCategoryContainer.querySelector(`[class*="contentBox"]`);
          const icons = firstCategoryContainer.querySelectorAll(`[class*="iconContainer"]`);
          const rightImage = firstCategoryContainer.querySelector(`[class*="right"] img`);
          
          const mobileTitleMain = firstCategoryContainer.querySelector(`[class*="mobileTitleMain"]`);
          const mobileTitleAccent = firstCategoryContainer.querySelector(`[class*="mobileTitleAccent"]`);
          const mobileDescription = firstCategoryContainer.querySelector(`[class*="mobileDescription"]`);
          const mobileImage = firstCategoryContainer.querySelector(`[class*="mobileImage"]`);
          const mobileIcons = firstCategoryContainer.querySelectorAll(`[class*="mobileIcons"] [class*="iconContainer"]`);
          const mobileImageLeft = firstCategoryContainer.querySelector(`[class*="mobileImageLeft"]`);
          const mobileImageRight = firstCategoryContainer.querySelector(`[class*="mobileImageRight"]`);
          const mobileCta = firstCategoryContainer.querySelector(`[class*="mobileCta"]`);

          if (mosaicItems.length > 0) {
            const mosaicArray = Array.from(mosaicItems);
            mosaicArray.forEach((item) => {
              if (item && item.isConnected) {
                gsap.set(item, { opacity: 0 });
              }
            });
          }
          if (ctaButton) gsap.set(ctaButton, { opacity: 0, y: 30 });
          if (titleMain && titleAccent) gsap.set([titleMain, titleAccent], { opacity: 0, y: -30 });
          if (contentBox) gsap.set(contentBox, { opacity: 0 });
          if (icons.length > 0) gsap.set(icons, { opacity: 0 });
          if (rightImage) gsap.set(rightImage, { opacity: 0, x: 50 });
          
          if (mobileTitleMain && mobileTitleAccent) gsap.set([mobileTitleMain, mobileTitleAccent], { opacity: 0, y: -30 });
          if (mobileDescription) gsap.set(mobileDescription, { opacity: 0 });
          if (mobileImage) gsap.set(mobileImage, { opacity: 0, scale: 0.8 });
          if (mobileIcons.length > 0) gsap.set(mobileIcons, { opacity: 0 });
          if (mobileImageLeft) gsap.set(mobileImageLeft, { opacity: 0, x: -30 });
          if (mobileImageRight) gsap.set(mobileImageRight, { opacity: 0, x: 30 });
          if (mobileCta) gsap.set(mobileCta, { opacity: 0, y: 30 });
        }
        
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
        setScrollLocked(false);
        isInitialMount.current = false;
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const changeCategory = useCallback((nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= covers.length) {
      return;
    }

    const currentIdx = currentIndexRef.current;

    if (scrollLockedRef.current) {
      return;
    }

    setScrollLocked(true);
    scrollLockedRef.current = true;
    document.body.style.overflow = "hidden";
    
    const safetyTimeout = setTimeout(() => {
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
      clearTimeout(safetyTimeout);
      setCurrentIndex(nextIndex);
      setScrollLocked(false);
      scrollLockedRef.current = false;
      document.body.style.overflow = "";
      return;
    }

    gsap.set(nextElement, { y: 100, opacity: 0 });

    const nextCategoryContainer = nextElement.querySelector('section');
    if (nextCategoryContainer) {
      const mosaicItems = nextCategoryContainer.querySelectorAll(`[class*="mosaicItem"]`);
      const ctaButton = nextCategoryContainer.querySelector(`[class*="cta"]`);
      const titleMain = nextCategoryContainer.querySelector(`[class*="titleMain"]`);
      const titleAccent = nextCategoryContainer.querySelector(`[class*="titleAccent"]`);
      const contentBox = nextCategoryContainer.querySelector(`[class*="contentBox"]`);
      const icons = nextCategoryContainer.querySelectorAll(`[class*="iconContainer"]`);
      const rightImage = nextCategoryContainer.querySelector(`[class*="right"] img`);

      if (mosaicItems.length > 0) gsap.set(mosaicItems, { opacity: 0 });
      if (ctaButton) gsap.set(ctaButton, { opacity: 0, y: 30 });
      if (titleMain && titleAccent) gsap.set([titleMain, titleAccent], { opacity: 0, y: -30 });
      if (contentBox) gsap.set(contentBox, { opacity: 0 });
      if (icons.length > 0) gsap.set(icons, { opacity: 0 });
      if (rightImage) gsap.set(rightImage, { opacity: 0, x: 50 });

      const mobileTitleMain = nextCategoryContainer.querySelector(`[class*="mobileTitleMain"]`);
      const mobileTitleAccent = nextCategoryContainer.querySelector(`[class*="mobileTitleAccent"]`);
      const mobileDescription = nextCategoryContainer.querySelector(`[class*="mobileDescription"]`);
      const mobileImage = nextCategoryContainer.querySelector(`[class*="mobileImage"]`);
      const mobileIcons = nextCategoryContainer.querySelectorAll(`[class*="mobileIcons"] [class*="iconContainer"]`);
      const mobileImageLeft = nextCategoryContainer.querySelector(`[class*="mobileImageLeft"]`);
      const mobileImageRight = nextCategoryContainer.querySelector(`[class*="mobileImageRight"]`);
      const mobileCta = nextCategoryContainer.querySelector(`[class*="mobileCta"]`);

      if (mobileTitleMain && mobileTitleAccent) gsap.set([mobileTitleMain, mobileTitleAccent], { opacity: 0, y: -30 });
      if (mobileDescription) gsap.set(mobileDescription, { opacity: 0 });
      if (mobileImage) gsap.set(mobileImage, { opacity: 0, scale: 0.8 });
      if (mobileIcons.length > 0) gsap.set(mobileIcons, { opacity: 0 });
      if (mobileImageLeft) gsap.set(mobileImageLeft, { opacity: 0, x: -30 });
      if (mobileImageRight) gsap.set(mobileImageRight, { opacity: 0, x: 30 });
      if (mobileCta) gsap.set(mobileCta, { opacity: 0, y: 30 });
    }

    const tl = gsap.timeline({
      onComplete: () => {
        clearTimeout(safetyTimeout);
        window.scrollTo({ top: 0, behavior: 'instant' });
        requestAnimationFrame(() => {
          setCurrentIndex(nextIndex);
          setScrollLocked(false);
          scrollLockedRef.current = false;
          document.body.style.overflow = "";
        });
      },
    });

    tl.to(currentElement, {
      y: -100,
      opacity: 0,
      duration: 0.6,
      ease: "power2.in",
    });

    tl.to(nextElement, {
      y: 0,
      duration: 0.6,
      ease: "power2.out",
    }, "-=0.3");
    
    tl.call(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
    
    tl.to(nextElement, {
      opacity: 1,
      duration: 0.4,
      ease: "power2.out",
    });
  }, [covers.length]);

  const transitionToContact = useCallback(() => {
    
    if (scrollLockedRef.current) {
      return;
    }

    const currentIdx = currentIndexRef.current;

    if (currentIdx !== covers.length - 1) {
      return;
    }

    setScrollLocked(true);
    scrollLockedRef.current = true;
    document.body.style.overflow = "hidden";

    const currentElement = containerRef.current?.querySelector(
      `[data-category-index="${currentIdx}"]`
    );

    if (!currentElement) {
      setScrollLocked(false);
      scrollLockedRef.current = false;
      document.body.style.overflow = "";
      onTransitionToContact?.();
      return;
    }

    onTransitionToContact?.();

    const checkAndAnimate = (attempts = 0) => {
      const contactElement = document.querySelector('#contact') as HTMLElement;
      
      if (!contactElement && attempts < 20) {
        setTimeout(() => checkAndAnimate(attempts + 1), 50);
        return;
      }
      
      if (!contactElement) {
        setScrollLocked(false);
        scrollLockedRef.current = false;
        document.body.style.overflow = "";
        return;
      }

      const computedStyle = window.getComputedStyle(contactElement);

      if (computedStyle.display === 'none') {
        gsap.set(contactElement, { display: 'flex' });
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            checkAndAnimate(attempts + 1);
          });
        });
        return;
      }

      const isHidden = computedStyle.visibility === 'hidden' || contactElement.offsetHeight === 0;
      
      if (isHidden) {
        if (attempts < 30) {
          setTimeout(() => checkAndAnimate(attempts + 1), 50);
        } else {
          gsap.set(contactElement, { display: "flex", visibility: "visible" });
          setScrollLocked(false);
          scrollLockedRef.current = false;
          document.body.style.overflow = "";
        }
        return;
      }

        gsap.set(contactElement, {
          position: "fixed",
          top: "0px",
          left: "0px",
          width: "100%",
          zIndex: 20,
        });

        gsap.set(contactElement, { opacity: 0, y: 100 });

        const tl = gsap.timeline({
          onComplete: () => {
            // NE PAS cacher le container #projects - il doit rester visible
            // pour que la détection de scroll up fonctionne
            // Le z-index de Contact (20) le place déjà au-dessus

            gsap.set(contactElement, {
              position: "relative",
              top: "auto",
              left: "auto",
              width: "100%",
            });
            
            window.scrollTo({ top: 0, behavior: 'instant' });
            
            requestAnimationFrame(() => {
              setScrollLocked(false);
              scrollLockedRef.current = false;
              document.body.style.overflow = "";
            });
          },
        });

        tl.to(currentElement, {
          y: -100,
          opacity: 0,
          duration: 0.6,
          ease: "power2.in",
          onComplete: () => {
            gsap.set(currentElement, { 
              display: "none",
              y: 0,
              pointerEvents: "none"
            });
          }
        });

        tl.to(contactElement, {
          y: 0,
          duration: 0.6,
          ease: "power2.out",
        }, "-=0.3");
        
        tl.to(contactElement, {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
          onStart: () => {
            window.scrollTo({ top: 0, behavior: 'instant' });
          }
        });
    };


    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        checkAndAnimate();
      });
    });
  }, [covers.length, onTransitionToContact]);

  const transitionFromContact = useCallback(() => {
    if (scrollLockedRef.current) {
      return;
    }

    const contactElement = document.querySelector('#contact') as HTMLElement;
    if (!contactElement) return;

    const lastCategoryIndex = covers.length - 1;
    const lastCategoryElement = containerRef.current?.querySelector(
      `[data-category-index="${lastCategoryIndex}"]`
    );

    if (!lastCategoryElement) return;

    setScrollLocked(true);
    scrollLockedRef.current = true;
    document.body.style.overflow = "hidden";

    // Le container Projects est déjà visible, pas besoin de le réafficher

    // Réafficher la dernière catégorie
    gsap.set(lastCategoryElement, { 
      display: "block",
      y: 100,
      opacity: 0,
      pointerEvents: "auto"
    });

    // Scroller immédiatement vers le haut
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Positionner Contact en fixed en haut
    gsap.set(contactElement, {
      position: "fixed",
      top: "0px",
      left: "0px",
      width: "100%",
      zIndex: 20,
    });

    // Animation inverse : Contact disparaît, dernière catégorie apparaît
    const tl = gsap.timeline({
      onComplete: () => {
        // Remettre le currentIndex à la dernière catégorie AVANT de réinitialiser les styles
        setCurrentIndex(lastCategoryIndex);
        currentIndexRef.current = lastCategoryIndex;

        // Réinitialiser les styles GSAP pour que le style inline React prenne le dessus
        gsap.set(lastCategoryElement, {
          display: "",
          y: 0,
          opacity: "",
          pointerEvents: ""
        });

        // Réinitialiser les refs pour permettre la détection du scroll
        isAtBottomRef.current = false;
        isAtTopRef.current = true; // On est en haut après le retour

        // Mettre Contact en display: none
        gsap.set(contactElement, {
          display: "none",
          position: "relative",
          top: "auto",
          left: "auto",
          width: "100%",
        });

        // IMPORTANT : Fermer Contact dans React
        if (onTransitionFromContact) {
          onTransitionFromContact();
        }

        // S'assurer qu'on est bien en haut
        window.scrollTo({ top: 0, behavior: 'instant' });

        requestAnimationFrame(() => {
          setScrollLocked(false);
          scrollLockedRef.current = false;
          document.body.style.overflow = "";
        });
      },
    });

    // Disparition de Contact
    tl.to(contactElement, {
      y: -100,
      opacity: 0,
      duration: 0.6,
      ease: "power2.in",
    });

    // Apparition de la dernière catégorie
    tl.to(lastCategoryElement, {
      y: 0,
      duration: 0.6,
      ease: "power2.out",
    }, "-=0.3");

    tl.to(lastCategoryElement, {
      opacity: 1,
      duration: 0.4,
      ease: "power2.out",
    });
  }, [covers.length]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Vérifier si la modale CV est ouverte
      if (document.body.getAttribute("data-modal-open") === "true") {
        return;
      }
      
      // ✅ Vérifier si Contact est déjà affiché et visible
      const contactElement = document.querySelector('#contact') as HTMLElement;
      const isContactVisible = contactElement && 
        contactElement.offsetParent !== null && 
        window.getComputedStyle(contactElement).display !== 'none';
      
      if (isContactVisible) {
        // Contact est visible, vérifier si on scroll vers le haut en haut de Contact
        const isAtTop = window.scrollY === 0 || window.scrollY < 50;
        const goingUp = e.deltaY < 0;

        if (isAtTop && goingUp && !scrollLockedRef.current) {
          e.preventDefault();
          e.stopPropagation();
          transitionFromContact();
          return;
        }
        return;
      }

      
      if (scrollLockedRef.current || timeoutId.current) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      const container = containerRef.current;
      if (!container) {
        return;
      }
      
      const containerRect = container.getBoundingClientRect();
      if (containerRect.bottom < 0 || containerRect.top > window.innerHeight) {
        return;
      }

      const goingDown = e.deltaY > 0;
      const goingUp = e.deltaY < 0;
      const currentIdx = currentIndexRef.current;

      const currentElement = containerRef.current?.querySelector(
        `[data-category-index="${currentIdx}"]`
      );
      
      if (!currentElement) {
        return;
      }

      const categorySection = currentElement.querySelector('section');
      if (!categorySection) {
        return;
      }

      const sectionRect = categorySection.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const sectionTop = sectionRect.top;
      const sectionBottom = sectionRect.bottom;
      const sectionHeight = sectionRect.height;
      
      const contentOverflows = sectionHeight > viewportHeight;
      
      const isMobile = window.innerWidth <= 900;
      
      let isSectionAtBottom = false;
      if (isMobile) {
        const mobileCta = categorySection.querySelector('[class*="mobileCta"]');
        const mobileBottomSection = categorySection.querySelector('[class*="mobileBottomSection"]');
        const bottomElement = mobileCta || mobileBottomSection;
        
        if (bottomElement) {
          const bottomRect = bottomElement.getBoundingClientRect();
          isSectionAtBottom = bottomRect.bottom <= viewportHeight + 50;
        } else {
          const distanceFromBottom = sectionBottom - viewportHeight;
          isSectionAtBottom = contentOverflows 
            ? distanceFromBottom <= 50
            : true;
        }
      } else {
        const distanceFromBottom = sectionBottom - viewportHeight;
        isSectionAtBottom = contentOverflows 
          ? distanceFromBottom <= 50
          : true;
      }
      
      const isSectionAtTop = sectionTop >= -20;
      
      const canScrollDown = contentOverflows && !isSectionAtBottom;
      const canScrollUp = contentOverflows && !isSectionAtTop;

      if (goingDown) {
        if (canScrollDown) {
          isAtBottomRef.current = false;
          return;
        }

        if (currentIdx === covers.length - 1) {
          if (!isAtBottomRef.current) {
            isAtBottomRef.current = true;
          }
          e.preventDefault();
          e.stopPropagation();
          transitionToContact();
          return;
        }

        if (isAtBottomRef.current && currentIdx < covers.length - 1) {
          e.preventDefault();
          e.stopPropagation();
          changeCategory(currentIdx + 1);
          isAtBottomRef.current = false;
        } else {
          isAtBottomRef.current = true;
        }
      }
      else if (goingUp) {
        if (canScrollUp) {
          isAtTopRef.current = false;
          return;
        }
        
        if (isAtTopRef.current && currentIdx > 0) {
          e.preventDefault();
          e.stopPropagation();
          changeCategory(currentIdx - 1);
          isAtTopRef.current = false;
        } else {
          isAtTopRef.current = true;
        }
        if (currentIdx === 0) {
          return;
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
  }, [changeCategory, covers.length, transitionToContact, transitionFromContact]);

  const handleTouchStart = (e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: TouchEvent) => {
    // Vérifier si la modale CV est ouverte
    if (document.body.getAttribute("data-modal-open") === "true") {
      return;
    }
    
    const contactElement = document.querySelector('#contact') as HTMLElement;
    const isContactVisible = contactElement && 
      contactElement.offsetParent !== null && 
      window.getComputedStyle(contactElement).display !== 'none';
    
    if (isContactVisible) {
      const isAtTop = window.scrollY === 0 || window.scrollY < 50;
      const deltaY = touchStartY.current ? touchStartY.current - e.touches[0].clientY : 0;
      const goingUp = deltaY < -30;

      if (isAtTop && goingUp && !scrollLockedRef.current && touchStartY.current !== null) {
        e.preventDefault();
        e.stopPropagation();
        transitionFromContact();
        return;
      }
      return;
    }

    if (scrollLockedRef.current || touchStartY.current === null) return;

    const container = containerRef.current;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    if (containerRect.bottom < 0 || containerRect.top > window.innerHeight) return;

    const deltaY = touchStartY.current - e.touches[0].clientY;
    const currentIdx = currentIndexRef.current;

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
    
    const contentOverflows = sectionHeight > viewportHeight;
    
    const isMobile = window.innerWidth <= 900;
    
    let isSectionAtBottom = false;
    if (isMobile) {
      const mobileCta = categorySection.querySelector('[class*="mobileCta"]');
      const mobileBottomSection = categorySection.querySelector('[class*="mobileBottomSection"]');
      const bottomElement = mobileCta || mobileBottomSection;
      
      if (bottomElement) {
        const bottomRect = bottomElement.getBoundingClientRect();
        isSectionAtBottom = bottomRect.bottom <= viewportHeight + 50;
      } else {
        const distanceFromBottom = sectionBottom - viewportHeight;
        isSectionAtBottom = contentOverflows 
          ? distanceFromBottom <= 50
          : true;
      }
    } else {
      const distanceFromBottom = sectionBottom - viewportHeight;
      isSectionAtBottom = contentOverflows 
        ? distanceFromBottom <= 50
        : true;
    }
    
    const isSectionAtTop = sectionTop >= -20;
    
    const canScrollDown = contentOverflows && !isSectionAtBottom;
    const canScrollUp = contentOverflows && !isSectionAtTop;

    if (deltaY > 30) {
      if (canScrollDown) {
        isAtBottomRef.current = false;
        return;
      }

      if (currentIdx === covers.length - 1) {
        if (!isAtBottomRef.current) {
          isAtBottomRef.current = true;
        }
        e.preventDefault();
        e.stopPropagation();
        transitionToContact();
        return;
      }

      if (isAtBottomRef.current && currentIdx < covers.length - 1) {
        e.preventDefault();
        e.stopPropagation();
        changeCategory(currentIdx + 1);
        isAtBottomRef.current = false;
      } else {
        isAtBottomRef.current = true;
      }
    } 
    else if (deltaY < -30) {
      if (canScrollUp) {
        isAtTopRef.current = false;
        return;
      }
      
      if (isAtTopRef.current && currentIdx > 0) {
        e.preventDefault();
        e.stopPropagation();
        changeCategory(currentIdx - 1);
        isAtTopRef.current = false;
      } else {
        isAtTopRef.current = true;
      }
      if (currentIdx === 0) {
        return;
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
  }, [changeCategory, transitionFromContact]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
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
            opacity: index === currentIndex ? 1 : 0,
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