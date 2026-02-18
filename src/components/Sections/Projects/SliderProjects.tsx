import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import styles from "./projects.module.scss";
import ProjectCategory from "./ProjectCategory";
import type { ProjectCover, Project } from "./ProjectCategory";
import ProjectLinksModal from "./ProjectLinksModal";
import AllProjectsSection from "./AllProjectsSection";
import {
  ascent_standalone_cover,
  paro_standalone_cover,
  claquettes_standalone_cover,
  projects,
} from "./Data";

const optimizeCloudinaryUrl = (url: string, width?: number, quality: string = "auto"): string => {
  if (!url.includes("cloudinary.com")) return url;
  const parts = url.split("/image/upload/");
  if (parts.length !== 2) return url;
  const base = parts[0];
  const rest = parts[1];
  const lastSlash = rest.lastIndexOf("/");
  const publicId = lastSlash >= 0 ? rest.slice(lastSlash + 1) : rest;
  let params = `f_webp,q_${quality}`;
  if (width) params += `,w_${width}`;
  return `${base}/image/upload/${params}/${publicId}`;
};

const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
};

interface SliderProjectsProps {
  onTransitionToContact?: () => void;
  onTransitionFromContact?: () => void;
  forceIndex?: number;
  onForceIndexComplete?: () => void;
}

// Slides standalone : Ascent (index 1), Paro (index 0), Claquettes (index 2) dans projects[]
const standaloneCovers: ProjectCover[] = [
  ascent_standalone_cover,
  paro_standalone_cover,
  claquettes_standalone_cover,
];

// Projets correspondants aux slides standalone (dans le même ordre que standaloneCovers)
const standaloneProjects: Project[] = [
  projects[1], // Ascent
  projects[0], // Paro
  projects[2], // Claquettes
];

const TOTAL_SLIDES = standaloneCovers.length + 1; // 3 standalone + 1 all projects

const SliderProjects = ({ onTransitionToContact, onTransitionFromContact, forceIndex, onForceIndexComplete }: SliderProjectsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [scrollLocked, setScrollLocked] = useState(true);
  const [modalProject, setModalProject] = useState<Project | null>(null);
  const touchStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutId = useRef<number | null>(null);
  const isInitialMount = useRef(true);
  const currentIndexRef = useRef(0);
  const scrollLockedRef = useRef(true);
  const isAtBottomRef = useRef(false);
  const isAtTopRef = useRef(false);
  const isTransitioningFromContactRef = useRef(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleStandaloneCtaClick = useCallback((project: Project) => {
    const links: string[] = [
      project.github,
      project.demo,
      project.figma,
    ].filter(Boolean) as string[];

    if (links.length === 1) {
      window.open(links[0], '_blank', 'noopener,noreferrer');
    } else if (links.length > 1) {
      setModalProject(project);
      document.body.setAttribute('data-modal-open', 'true');
    }
  }, []);

  const handleModalClose = useCallback(() => {
    setModalProject(null);
    document.body.removeAttribute('data-modal-open');
  }, []);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    const preloadNextCategory = async () => {
      const nextIndex = (currentIndex + 1) % TOTAL_SLIDES;
      // Only preload if next slide is a standalone cover (not all projects)
      if (nextIndex < standaloneCovers.length) {
        const nextCover = standaloneCovers[nextIndex];
        setTimeout(() => {
          const mainImageWidth = isMobile ? 600 : 800;
          preloadImage(optimizeCloudinaryUrl(nextCover.mainImage, mainImageWidth, "85"));
          setTimeout(() => {
            const mosaicWidth = isMobile ? 400 : 600;
            nextCover.sideImages.slice(0, 2).forEach(src => {
              preloadImage(optimizeCloudinaryUrl(src, mosaicWidth, "80"));
            });
          }, 500);
        }, 1000);
      }
    };
    
    preloadNextCategory();
  }, [currentIndex, isMobile]);

  useEffect(() => {
    if (forceIndex !== undefined && forceIndex !== currentIndex && !isTransitioningFromContactRef.current) {
      setCurrentIndex(forceIndex);
      currentIndexRef.current = forceIndex;
      isAtBottomRef.current = false;
      isAtTopRef.current = true;
      isInitialMount.current = false;

      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
        timeoutId.current = null;
      }

      const container = containerRef.current;
      if (container) {
        const allElements = container.querySelectorAll('[data-category-index]');
        const forcedElement = container.querySelector(`[data-category-index="${forceIndex}"]`) as HTMLElement;
        
        allElements.forEach((element) => {
          const htmlElement = element as HTMLElement;
          gsap.killTweensOf(htmlElement);
          
          if (element === forcedElement) {
            gsap.set(htmlElement, { y: 0, opacity: 1 });
            htmlElement.style.transform = 'none';
          } else {
            gsap.set(htmlElement, { y: 0, opacity: 0 });
            htmlElement.style.transform = 'none';
          }
        });
      }

      window.scrollTo({ top: 0, behavior: 'instant' });
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      
      setTimeout(() => {
        setScrollLocked(false);
        scrollLockedRef.current = false;
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
        touchStartY.current = null;
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 100);
    }
  }, [forceIndex, currentIndex, onForceIndexComplete]);

  useEffect(() => {
    scrollLockedRef.current = scrollLocked;
  }, [scrollLocked]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const allElements = container.querySelectorAll('[data-category-index]');
    gsap.set(allElements, { opacity: 0, y: 0 });
    
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
    if (nextIndex < 0 || nextIndex >= TOTAL_SLIDES) {
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
  }, []);

  const transitionToContact = useCallback(() => {
    
    if (scrollLockedRef.current) {
      return;
    }

    const currentIdx = currentIndexRef.current;

    if (currentIdx !== TOTAL_SLIDES - 1) {
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
        const footerElement = document.querySelector('#footer') as HTMLElement;
        if (footerElement) {
          gsap.set(footerElement, { 
            opacity: 0,
            visibility: "visible"
          });
        }

        const tl = gsap.timeline({
          onComplete: () => {
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

            const footerToAnimate = footerElement || document.querySelector('#footer') as HTMLElement;
            if (footerToAnimate) {
              gsap.set(footerToAnimate, { 
                display: "block",
                visibility: "visible"
              });
              gsap.to(footerToAnimate, {
                opacity: 1,
                duration: 0.4,
                ease: "power2.out",
              });
            }
          }
        });
    };


    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        checkAndAnimate();
      });
    });
  }, [onTransitionToContact]);

  const transitionFromContact = useCallback(() => {
    isTransitioningFromContactRef.current = true;
    
    if (scrollLockedRef.current) {
      isTransitioningFromContactRef.current = false;
      return;
    }

    const contactElement = document.querySelector('#contact') as HTMLElement;
    if (!contactElement) {
      return;
    }
    const footerElement = document.querySelector('#footer') as HTMLElement;
    if (footerElement) {
      gsap.set(footerElement, { 
        opacity: 0,
        visibility: "hidden",
        display: "none",
        pointerEvents: "none"
      });
    }
    const lastCategoryIndex = TOTAL_SLIDES - 1;
    const lastCategoryElement = containerRef.current?.querySelector(
      `[data-category-index="${lastCategoryIndex}"]`
    );

    if (!lastCategoryElement) {
      return;
    }

    setScrollLocked(true);
    scrollLockedRef.current = true;
    document.body.style.overflow = "hidden";
    setCurrentIndex(lastCategoryIndex);
    currentIndexRef.current = lastCategoryIndex;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {

        const updatedLastCategoryElement = containerRef.current?.querySelector(
          `[data-category-index="${lastCategoryIndex}"]`
        );

        if (!updatedLastCategoryElement) {
          return;
        }

        const htmlElement = updatedLastCategoryElement as HTMLElement;
        htmlElement.style.display = "block";
        htmlElement.style.pointerEvents = "auto";
        htmlElement.style.position = "relative";
        htmlElement.style.zIndex = "10";
        htmlElement.style.visibility = "visible";

        gsap.set(updatedLastCategoryElement, { 
          y: 100,
          opacity: 0
        });

        window.scrollTo({ top: 0, behavior: 'instant' });

        gsap.set(contactElement, {
          position: "fixed",
          top: "0px",
          left: "0px",
          width: "100%",
          zIndex: 20,
        });

        const tl = gsap.timeline({
          onComplete: () => {
            const footerAfterTransition = document.querySelector('#footer') as HTMLElement;
            if (footerAfterTransition) {
              gsap.set(footerAfterTransition, {
                opacity: 0,
                visibility: "hidden",
                display: "none",
                pointerEvents: "none"
              });
            }
            gsap.set(updatedLastCategoryElement, {
              y: 0,
              opacity: "",
              display: "",
              pointerEvents: "",
              position: "",
              zIndex: ""
            });
            isAtBottomRef.current = false;
            isAtTopRef.current = true;

            gsap.set(contactElement, {
              display: "none",
              position: "relative",
              top: "auto",
              left: "auto",
              width: "100%",
            });

            if (onTransitionFromContact) {
              onTransitionFromContact();
            }

            window.scrollTo({ top: 0, behavior: 'instant' });

            requestAnimationFrame(() => {
              setScrollLocked(false);
              scrollLockedRef.current = false;
              document.body.style.overflow = "";

              const checkAndResetFlag = () => {
                if (forceIndex === undefined || forceIndex === lastCategoryIndex) {
                  isTransitioningFromContactRef.current = false;
                } else {
                  setTimeout(checkAndResetFlag, 100);
                }
              };
              setTimeout(checkAndResetFlag, 200);
            });
          },
        });

        const footerForDisappear = document.querySelector('#footer') as HTMLElement;
        if (footerForDisappear) {
          tl.to(footerForDisappear, {
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
          });
        }

        tl.to(contactElement, {
          y: -100,
          opacity: 0,
          duration: 0.6,
          ease: "power2.in",
        }, footerForDisappear ? "-=0.2" : undefined);

        tl.to(updatedLastCategoryElement, {
          y: 0,
          duration: 0.6,
          ease: "power2.out",
        }, "-=0.3");

        tl.to(updatedLastCategoryElement, {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
        });
      });
    });
  }, [onTransitionFromContact]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (document.body.getAttribute("data-modal-open") === "true") {
        return;
      }

      const contactElement = document.querySelector('#contact') as HTMLElement;
      const isContactVisible = contactElement && 
        contactElement.offsetParent !== null && 
        window.getComputedStyle(contactElement).display !== 'none';
      
      if (isContactVisible) {
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
      
      const SCROLL_THRESHOLD = 1;
      if (Math.abs(e.deltaY) < SCROLL_THRESHOLD) {
        return;
      }
      
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

        if (currentIdx === TOTAL_SLIDES - 1) {
          if (!isAtBottomRef.current) {
            isAtBottomRef.current = true;
          }
          e.preventDefault();
          e.stopPropagation();
          transitionToContact();
          return;
        }

        if (isAtBottomRef.current && currentIdx < TOTAL_SLIDES - 1) {
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
  }, [changeCategory, transitionToContact, transitionFromContact]);

  const handleTouchStart = (e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: TouchEvent) => {
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

      if (currentIdx === TOTAL_SLIDES - 1) {
        if (!isAtBottomRef.current) {
          isAtBottomRef.current = true;
        }
        e.preventDefault();
        e.stopPropagation();
        transitionToContact();
        return;
      }
      if (isAtBottomRef.current && currentIdx < TOTAL_SLIDES - 1) {
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
      {/* 3 slides standalone : Ascent, Paro, Claquettes */}
      {standaloneCovers.map((cover, index) => {
        const isCurrent = index === currentIndex;
        return (
          <div
            key={index}
            data-category-index={index}
            style={{
              position: isCurrent ? "relative" : "absolute",
              top: 0,
              left: 0,
              width: "100%",
              minHeight: "100vh",
              opacity: isCurrent ? 1 : 0,
              pointerEvents: isCurrent ? "auto" : "none",
              zIndex: isCurrent ? 10 : 1,
            }}
          >
            <ProjectCategory
              cover={cover}
              categoryIndex={index === currentIndex ? currentIndex : undefined}
              onCtaClick={() => handleStandaloneCtaClick(standaloneProjects[index])}
            />
          </div>
        );
      })}

      {/* Slide "Tous mes projets" (index 3) */}
      {(() => {
        const allProjectsIndex = standaloneCovers.length;
        const isCurrent = currentIndex === allProjectsIndex;
        return (
          <div
            key="allprojects"
            data-category-index={allProjectsIndex}
            style={{
              position: isCurrent ? "relative" : "absolute",
              top: 0,
              left: 0,
              width: "100%",
              minHeight: "100vh",
              opacity: isCurrent ? 1 : 0,
              pointerEvents: isCurrent ? "auto" : "none",
              zIndex: isCurrent ? 10 : 1,
            }}
          >
            <AllProjectsSection
              categoryIndex={isCurrent ? allProjectsIndex : undefined}
            />
          </div>
        );
      })()}

      {/* Modal liens projet standalone */}
      {modalProject && (
        <ProjectLinksModal
          isOpen={true}
          project={modalProject}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default SliderProjects;
