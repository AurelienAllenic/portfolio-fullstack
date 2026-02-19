import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { gsap } from "gsap";
import styles from "./mobileNav.module.scss";
import { useModalCV } from "./ModalCVContext";
import { useNavigation } from "./NavigationContext";
import { useLanguage } from "../Language/LanguageContext";
import { useCv } from "./CvContext";
import {
  ascent_standalone_cover,
  paro_standalone_cover,
  claquettes_standalone_cover,
  allprojects_cover,
  OPENCLASSROOMS_FORMATIONS,
  projects,
  solead,
  iim,
} from "../../Sections/Projects/Data";
import { useAnalytics } from "../../../hooks/useAnalytics";

const IMAGES = {
  hero1: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_auto,q_auto/background_ll7suh.webp",
  hero2: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/learnhome_oqap2c.webp",
  projects: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/claquettes_tcwcpf.webp",
  contact: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/gameon_uieupe.webp",
};

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProjectCategories, setShowProjectCategories] = useState(false);
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const { openModal } = useModalCV();
  const { navigateToHero, navigateToProjects, navigateToContact, heroState } = useNavigation();
  const { t } = useLanguage();
  const { error: cvError } = useCv();

  const { trackClick } = useAnalytics();
  
  const PROJECT_CATEGORIES = useMemo(() => [
    { title: t("projects.category.ascent"), index: 0, image: ascent_standalone_cover.mainImage },
    { title: t("projects.category.paro"), index: 1, image: paro_standalone_cover.mainImage },
    { title: t("projects.category.claquettes"), index: 2, image: claquettes_standalone_cover.mainImage },
    { title: t("projects.category.allprojects"), index: 3, image: allprojects_cover.mainImage },
  ], [t]);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const menuLinksRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const lockedImageRef = useRef<string | null>(null);

  const getDefaultImage = useCallback(() => {
    const contactElement = document.querySelector('#contact');
    const projectsElement = document.querySelector('#projects');

    if (contactElement) {
      const contactStyle = window.getComputedStyle(contactElement);
      const contactRect = contactElement.getBoundingClientRect();
      if (contactStyle.display !== 'none' && contactStyle.opacity !== '0' && contactRect.height > 0) {
        return IMAGES.contact;
      }
    }

    if (projectsElement) {
      const projectsStyle = window.getComputedStyle(projectsElement);
      const projectsRect = projectsElement.getBoundingClientRect();
      if (projectsStyle.display !== 'none' && projectsRect.height > 0) {
        return IMAGES.projects;
      }
    }

    if (heroState === "hero2") {
      return IMAGES.hero2;
    }
    
    return IMAGES.hero1;
  }, [heroState]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigate = (
    trackingEvent: string,
    destination: "hero" | "projects" | "contact",
    imageUrl: string
  ) => {
    if (isAnimating) return;
    trackClick(trackingEvent);
    lockedImageRef.current = hoveredImage;
    const currentImage = lockedImageRef.current;
    
    setIsAnimating(true);

    const overlay = menuOverlayRef.current;
    
    if (overlay && currentImage !== imageUrl) {
      const newImageElement = document.createElement('div');
      newImageElement.className = `${styles.centerImage} ${styles.active}`;
      newImageElement.style.backgroundImage = `url(${imageUrl})`;
      newImageElement.style.zIndex = '2';
      overlay.appendChild(newImageElement);

      gsap.fromTo(
        newImageElement,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
          onComplete: () => {
            setHoveredImage(imageUrl);
            const oldElements = overlay.querySelectorAll(`.${styles.centerImage}.${styles.active}`);
            oldElements.forEach((el) => {
              if (el !== newImageElement && overlay.contains(el)) {
                overlay.removeChild(el);
              }
            });
          }
        }
      );

      setTimeout(() => {
        switch (destination) {
          case "hero":
            navigateToHero("hero2");
            break;
          case "projects":
            navigateToProjects();
            break;
          case "contact":
            navigateToContact();
            break;
        }
  
        setTimeout(() => {
          setIsOpen(false);
        }, 1250);

        setTimeout(() => {
          setIsAnimating(false);
          lockedImageRef.current = null;
        }, 100);
      }, 600);
    } else {
      setTimeout(() => {
        setIsOpen(false);
        
        switch (destination) {
          case "hero":
            navigateToHero("hero2");
            break;
          case "projects":
            navigateToProjects();
            break;
          case "contact":
            navigateToContact();
            break;
        }
        
        setTimeout(() => {
          setIsAnimating(false);
          lockedImageRef.current = null;
        }, 100);
      }, 300);
    }
  };

  const showProjectsMenu = () => {
    if (isAnimating) return;
    trackClick('nav_projects');
    lockedImageRef.current = hoveredImage;
    const currentImage = lockedImageRef.current;
    
    const allProjects = [
      ...projects,
      ...solead,
      ...iim,
      ...OPENCLASSROOMS_FORMATIONS.flatMap((f) => f.projects as { image?: string }[]),
    ];

    let randomImage: string | null = currentImage;
    let attempts = 0;
    while (randomImage === currentImage && attempts < 10 && allProjects.length > 0) {
      const randomIndex = Math.floor(Math.random() * allProjects.length);
      randomImage = allProjects[randomIndex]?.image ?? null;
      attempts++;
    }
    
    setIsAnimating(true);
    
    const overlay = menuOverlayRef.current;
    
    if (overlay && currentImage !== randomImage) {
      const newImageElement = document.createElement('div');
      newImageElement.className = `${styles.centerImage} ${styles.active}`;
      newImageElement.style.backgroundImage = `url(${randomImage})`;
      newImageElement.style.zIndex = '2';
      overlay.appendChild(newImageElement);
      
      gsap.fromTo(
        newImageElement,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
          onComplete: () => {
            setHoveredImage(randomImage);
          }
        }
      );

      setTimeout(() => {
        const links = menuLinksRef.current;
        if (links) {
          const menuItems = links.querySelectorAll(`.${styles.menuItem}, .${styles.separator}`);
          gsap.to(menuItems, {
            opacity: 0,
            y: -30,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
              setShowProjectCategories(true);
              setTimeout(() => {
                setIsAnimating(false);
                lockedImageRef.current = null;
              }, 100);
            }
          });
        }
      }, 600);
    } else {
      const links = menuLinksRef.current;
      if (links) {
        const menuItems = links.querySelectorAll(`.${styles.menuItem}, .${styles.separator}`);
        gsap.to(menuItems, {
          opacity: 0,
          y: -30,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => {
            setShowProjectCategories(true);
            setTimeout(() => {
              setIsAnimating(false);
              lockedImageRef.current = null;
            }, 100);
          }
        });
      }
    }
  };

  const hideProjectsMenu = () => {
    const links = menuLinksRef.current;
    if (!links) return;

    setShowProjectCategories(false);
  };

  const handleCategoryClick = (category: typeof PROJECT_CATEGORIES[0]) => {
    if (isAnimating) return;
    trackClick(`nav_projects_category_${category.index}`);
    lockedImageRef.current = hoveredImage;
    const currentImage = lockedImageRef.current;
    
    setIsAnimating(true);
    
    const overlay = menuOverlayRef.current;
    
    if (overlay && currentImage !== category.image) {
      const newImageElement = document.createElement('div');
      newImageElement.className = `${styles.centerImage} ${styles.active}`;
      newImageElement.style.backgroundImage = `url(${category.image})`;
      newImageElement.style.zIndex = '2';
      overlay.appendChild(newImageElement);
      
      gsap.fromTo(
        newImageElement,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
          onComplete: () => {
            setHoveredImage(category.image);
          }
        }
      );
      
      setTimeout(() => {
        navigateToProjects(category.index);
        setTimeout(() => {
          setIsOpen(false);
        }, 1250);
        
        setTimeout(() => {
          setIsAnimating(false);
          lockedImageRef.current = null;
        }, 100);
      }, 750);
    } else {
      setTimeout(() => {
        setIsOpen(false);
        navigateToProjects(category.index);
        
        setTimeout(() => {
          setIsAnimating(false);
          lockedImageRef.current = null;
        }, 100);
      }, 300);
    }
  };
  useEffect(() => {
    const root = mobileNavRef.current;
    if (!root) return;

    const left = root.querySelector<HTMLElement>(`.${styles.left}`);
    const socials = root.querySelectorAll<HTMLElement>(`.${styles.socialIcons} > *`);
    const burger = root.querySelector<HTMLElement>(`.${styles.burger}`);

    if (left) gsap.set(left, { opacity: 0, y: -30 });
    gsap.set(socials, { opacity: 0, y: -30 });
    if (burger) gsap.set(burger, { opacity: 0, y: -30 });

    const baseDelay = 2.5;

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    if (left) tl.to(left, { opacity: 1, y: 0, duration: 0.6, delay: baseDelay }, 0);

    tl.to(
      socials,
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 },
      left ? 0.1 + baseDelay : baseDelay
    );

    if (burger) tl.to(burger, { opacity: 1, y: 0, duration: 0.6 }, ">-0.2");

    return () => {
      tl.kill();
    };
  }, []);

  useEffect(() => {
    const overlay = menuOverlayRef.current;
    const links = menuLinksRef.current;
    const image = imageRef.current;
    
    if (!overlay || !links) return;

    if (isOpen) {
      gsap.set(overlay, { display: "flex" });
      
      const defaultImage = getDefaultImage();
      if (defaultImage) {
        setHoveredImage(defaultImage);
      }
      
      const tl = gsap.timeline();
      
      tl.to(overlay, {
        opacity: 1,
        duration: 0.4,
        ease: "power2.out"
      });

      if (defaultImage && image) {
        tl.fromTo(
          image,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.6,
            ease: "power2.out"
          },
          "-=0.2"
        );
      }

      if (!showProjectCategories) {
        const menuItems = links.querySelectorAll(`.${styles.menuItem}, .${styles.separator}`);
        tl.fromTo(
          menuItems,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "power2.out"
          },
          "-=0.4"
        );
      }
    } else {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(overlay, { display: "none" });
          setHoveredImage(null);
          setShowProjectCategories(false);
        }
      });
      
      tl.to(overlay, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in"
      });
    }
  }, [isOpen, showProjectCategories, getDefaultImage]);

  useEffect(() => {
    const links = menuLinksRef.current;
    if (!links) return;

    const menuItems = links.querySelectorAll(`.${styles.menuItem}:not(.${styles.closeButton}), .${styles.separator}`);
    
    if (showProjectCategories && menuItems.length > 0) {
      gsap.fromTo(
        menuItems,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out"
        }
      );
    }
  }, [showProjectCategories]);

  return (
    <>
      <div className={styles.containerMobileNav} ref={mobileNavRef}>
        <div 
          className={styles.left}
          onClick={() => {
            trackClick('nav_logo');
            if (isOpen) {
              if (isAnimating) return;
              lockedImageRef.current = hoveredImage;
              const currentImage = lockedImageRef.current;
              
              
              setIsAnimating(true);

              const overlay = menuOverlayRef.current;
              
              if (overlay && currentImage !== IMAGES.hero1) {
                const newImageElement = document.createElement('div');
                newImageElement.className = `${styles.centerImage} ${styles.active}`;
                newImageElement.style.backgroundImage = `url(${IMAGES.hero1})`;
                newImageElement.style.zIndex = '2';
                overlay.appendChild(newImageElement);

                gsap.fromTo(
                  newImageElement,
                  { scale: 0, opacity: 0 },
                  {
                    scale: 1,
                    opacity: 1,
                    duration: 0.6,
                    ease: "power2.out",
                    onComplete: () => {
                      setHoveredImage(IMAGES.hero1);
                      requestAnimationFrame(() => {
                        if (overlay.contains(newImageElement)) {
                          overlay.removeChild(newImageElement);
                        }
                      });
                    }
                  }
                );

                setTimeout(() => {
                  setIsOpen(false);
                  
                  navigateToHero("hero1");
                  
                  setTimeout(() => {
                    setIsAnimating(false);
                    lockedImageRef.current = null;
                  }, 100);
                }, 600);
              } else {
                setTimeout(() => {
                  setIsOpen(false);
                  
                  navigateToHero("hero1");
                  
                  setTimeout(() => {
                    setIsAnimating(false);
                    lockedImageRef.current = null;
                  }, 100);
                }, 300);
              }
            } else {
              navigateToHero("hero1");
            }
          }}
          style={{ cursor: "pointer" }}
        >
          AURELIEN ALLENIC
        </div>
        <div className={styles.right}>
          <div className={styles.socialIcons}>
            {!cvError && (
              <div
                onClick={() => {
                  trackClick('nav_cv_open');
                  openModal();
                }}
                style={{ cursor: "pointer" }}
              >
                <img
                  src="https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/cv_sjsdbv.webp"
                  alt="CV"
                />
              </div>
            )}
            <a
              href="https://fr.linkedin.com/in/aur%C3%A9lien-allenic-5725b8219"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick('nav_linkedin')}
            >
              <img
                src="https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/linkedin-logo_tin7ki.webp"
                alt="LinkedIn"
              />
            </a>
            <a
              href="https://github.com/aurelienallenic"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick('nav_github')}
            >
              <img
                src="https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/Github_logo_kmfq2g.webp"
                alt="GitHub"
              />
            </a>
          </div>
          <div
            className={`${styles.burger} ${isOpen ? styles.open : ""}`}
            onClick={() => {
              trackClick('nav_burger');
              toggleMenu();
            }}
          >
            <div className={styles.bar}></div>
            <div className={styles.bar}></div>
            <div className={styles.bar}></div>
          </div>
        </div>
      </div>
      <div 
        ref={menuOverlayRef} 
        className={styles.menuOverlay}
        style={{ opacity: 0, display: "none" }}
        onClick={(e) => {
          if (showProjectCategories && e.target === menuOverlayRef.current) {
            hideProjectsMenu();
          }
        }}
      >
        <div 
          ref={imageRef}
          className={`${styles.centerImage} ${hoveredImage ? styles.active : ''}`}
          style={{
            backgroundImage: hoveredImage ? `url(${hoveredImage})` : 'none',
          }}
        />
        
        <div ref={menuLinksRef} className={styles.menuContent}>
          {!showProjectCategories ? (
            <>
              <div 
                className={styles.menuItem}
                onClick={() => handleNavigate('nav_about', "hero", IMAGES.hero2)}
              >
                {t("nav.about")}
              </div>
              <div className={styles.separator}>-</div>
              <div 
                className={styles.menuItem}
                onClick={() => showProjectsMenu()}
              >
                {t("nav.projects")}
              </div>
              <div className={styles.separator}>-</div>
              <div 
                className={styles.menuItem}
                onClick={() => handleNavigate('nav_contact', "contact", IMAGES.contact)}
              >
                {t("nav.contact")}
              </div>
            </>
          ) : (
            <>
              {PROJECT_CATEGORIES.map((category) => (
                <div key={category.index}>
                  <div 
                    className={styles.menuItem}
                    onClick={() => handleCategoryClick(category)}
                  >
                    {category.title}
                  </div>
                  {category.index < PROJECT_CATEGORIES.length - 1 && (
                    <div className={styles.separator}>-</div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileNav;
