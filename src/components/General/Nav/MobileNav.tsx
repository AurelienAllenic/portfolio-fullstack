import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { gsap } from "gsap";
import styles from "./mobileNav.module.scss";
import { useModalCV } from "./ModalCVContext";
import { useNavigation } from "./NavigationContext";
import { useLanguage } from "../Language/LanguageContext";
import { useCv } from "./CvContext";
import {
  openclassrooms1_cover,
  openclassrooms2_cover,
  openclassrooms3_cover,
  projects_cover,
  solead_cover,
  iim_cover,
  openclassrooms1,
  openclassrooms2,
  openclassrooms3,
  projects,
  solead,
  iim,
} from "../../Sections/Projects/Data";
import { useAnalytics } from "../../../hooks/useAnalytics";

// Images pour chaque section (en dehors du composant pour éviter les re-créations)
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
  
  // Catégories traduites — ordre identique à SliderProjects covers
  const PROJECT_CATEGORIES = useMemo(() => [
    { title: t("projects.category.personnel"), index: 0, image: projects_cover.mainImage },
    { title: t("projects.category.solead"), index: 1, image: solead_cover.mainImage },
    { title: t("projects.category.iim"), index: 2, image: iim_cover.mainImage },
    { title: t("projects.category.python"), index: 3, image: openclassrooms3_cover.mainImage },
    { title: t("projects.category.react"), index: 4, image: openclassrooms2_cover.mainImage },
    { title: t("projects.category.web"), index: 5, image: openclassrooms1_cover.mainImage },
  ], [t]);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const menuLinksRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const lockedImageRef = useRef<string | null>(null); // Pour verrouiller l'image pendant l'animation

  // Déterminer l'image de base en fonction de la section actuelle
  const getDefaultImage = useCallback(() => {
    // Vérifier d'abord si des éléments sont visibles dans le DOM
    const contactElement = document.querySelector('#contact');
    const projectsElement = document.querySelector('#projects');
    
    // Vérifier si Contact est visible (et réellement affiché, pas juste display: block mais caché)
    if (contactElement) {
      const contactStyle = window.getComputedStyle(contactElement);
      const contactRect = contactElement.getBoundingClientRect();
      if (contactStyle.display !== 'none' && contactStyle.opacity !== '0' && contactRect.height > 0) {
        return IMAGES.contact;
      }
    }
    
    // Vérifier si Projects est visible
    if (projectsElement) {
      const projectsStyle = window.getComputedStyle(projectsElement);
      const projectsRect = projectsElement.getBoundingClientRect();
      if (projectsStyle.display !== 'none' && projectsRect.height > 0) {
        return IMAGES.projects;
      }
    }
    
    // Sinon, on est sur Hero - vérifier le state
    if (heroState === "hero2") {
      return IMAGES.hero2;
    }
    
    return IMAGES.hero1; // Par défaut (HeroBeforeScroll)
  }, [heroState]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigate = (
    trackingEvent: string,
    destination: "hero" | "projects" | "contact",
    imageUrl: string
  ) => {
    if (isAnimating) return; // Empêcher les clics multiples pendant l'animation
    trackClick(trackingEvent);
    // VERROUILLER l'image actuelle immédiatement pour empêcher les onMouseEnter de la changer
    lockedImageRef.current = hoveredImage;
    const currentImage = lockedImageRef.current;
    
    setIsAnimating(true);
    
    // Animer le changement d'image SEULEMENT si l'image est différente
    const overlay = menuOverlayRef.current;
    
    if (overlay && currentImage !== imageUrl) {
      // NE PAS toucher à setHoveredImage - l'image React reste visible pendant l'animation
      
      // Créer une nouvelle image par dessus l'ancienne
      const newImageElement = document.createElement('div');
      newImageElement.className = `${styles.centerImage} ${styles.active}`;
      newImageElement.style.backgroundImage = `url(${imageUrl})`;
      newImageElement.style.zIndex = '2'; // Entre l'image de fond (z-index: 1) et les liens (z-index: 3)
      overlay.appendChild(newImageElement);
      
      // Animer la nouvelle image de 0 à 100%
      gsap.fromTo(
        newImageElement,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
          onComplete: () => {
            // Une fois l'animation terminée, mettre à jour l'image React
            setHoveredImage(imageUrl);
            
            // MAINTENANT nettoyer les anciens éléments temporaires du clic précédent
            const oldElements = overlay.querySelectorAll(`.${styles.centerImage}.${styles.active}`);
            oldElements.forEach((el) => {
              if (el !== newImageElement && overlay.contains(el)) {
                overlay.removeChild(el);
              }
            });
            
            // Ne pas supprimer le nouvel élément - le laisser visible
            // Il disparaîtra quand le menu fermera
          }
        }
      );
      
      // Attendre la fin de l'animation avant de fermer et de naviguer
      setTimeout(() => {
        // Naviguer APRÈS toutes les animations
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
        
        // Fermer la nav pendant le temps noir du radial
        // Le radial se ferme en 1.2s, puis black screen 250ms
        // Donc on ferme la nav à 1.2s + 250ms = 1.45s
        setTimeout(() => {
          setIsOpen(false);
        }, 1250);
        
        // Réinitialiser après la navigation
        setTimeout(() => {
          setIsAnimating(false);
          lockedImageRef.current = null;
        }, 100);
      }, 600); // Durée de l'animation
    } else {
      // Si c'est la même image, fermer directement et naviguer
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

  // Fonction pour passer du menu principal aux catégories de projets
  const showProjectsMenu = () => {
    if (isAnimating) return;
    trackClick('nav_projects');
    lockedImageRef.current = hoveredImage;
    const currentImage = lockedImageRef.current;
    
    // Combiner tous les projets de toutes les catégories
    const allProjects = [...projects, ...solead, ...iim, ...openclassrooms3, ...openclassrooms2, ...openclassrooms1];
    
    // Prendre une image aléatoire parmi TOUS les projets (sauf si c'est la même que currentImage)
    let randomImage = currentImage;
    let attempts = 0;
    while (randomImage === currentImage && attempts < 10) {
      const randomIndex = Math.floor(Math.random() * allProjects.length);
      randomImage = allProjects[randomIndex].image;
      attempts++;
    }
    
    setIsAnimating(true);
    
    const overlay = menuOverlayRef.current;
    
    if (overlay && currentImage !== randomImage) {
      // Créer un élément temporaire avec une image aléatoire
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
            // Garder l'élément visible et ne le supprimer que quand on clique sur une catégorie
            // On le supprimera dans handleCategoryClick
          }
        }
      );
      
      // Attendre la fin de l'animation avant de remplacer les liens
      setTimeout(() => {
        // Animer la disparition des liens actuels
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
              // Réinitialiser après
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

  // Fonction pour revenir au menu principal depuis les catégories
  const hideProjectsMenu = () => {
    const links = menuLinksRef.current;
    if (!links) return;

    setShowProjectCategories(false);
    
    // Les nouveaux éléments vont apparaître avec animation dans le useEffect
  };

  // Fonction pour gérer le clic sur une catégorie de projet
  const handleCategoryClick = (category: typeof PROJECT_CATEGORIES[0]) => {
    if (isAnimating) return;
    trackClick(`nav_projects_category_${category.index}`);
    lockedImageRef.current = hoveredImage;
    const currentImage = lockedImageRef.current;
    
    setIsAnimating(true);
    
    const overlay = menuOverlayRef.current;
    
    if (overlay && currentImage !== category.image) {
      // Créer le nouvel élément qui va s'animer par-dessus l'ancien
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
            // Ne pas supprimer l'élément temporaire - le laisser visible
            // Il disparaîtra quand le menu fermera
          }
        }
      );
      
      setTimeout(() => {
        // Naviguer d'abord
        navigateToProjects(category.index);
        
        // Fermer la nav pendant le temps noir du radial (1.2s + 250ms = 1.45s)
        setTimeout(() => {
          setIsOpen(false);
        }, 1250);
        
        setTimeout(() => {
          setIsAnimating(false);
          lockedImageRef.current = null;
        }, 100);
      }, 750); // 600ms animation + 150ms de pause avant radial
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

  // Animation d'ouverture/fermeture du menu
  useEffect(() => {
    const overlay = menuOverlayRef.current;
    const links = menuLinksRef.current;
    const image = imageRef.current;
    
    if (!overlay || !links) return;

    if (isOpen) {
      // Ouvrir le menu
      gsap.set(overlay, { display: "flex" });
      
      // Afficher l'image par défaut
      const defaultImage = getDefaultImage();
      if (defaultImage) {
        setHoveredImage(defaultImage);
      }
      
      const tl = gsap.timeline();
      
      // Animation de l'overlay
      tl.to(overlay, {
        opacity: 1,
        duration: 0.4,
        ease: "power2.out"
      });
      
      // Animation de l'image par défaut si elle existe
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
      
      // Animation des liens ET des tirets avec stagger - SEULEMENT si ce n'est pas les catégories
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
      // Fermer le menu
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(overlay, { display: "none" });
          setHoveredImage(null);
          setShowProjectCategories(false); // Réinitialiser à false
        }
      });
      
      tl.to(overlay, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in"
      });
    }
  }, [isOpen, showProjectCategories, getDefaultImage]);

  // Animation de transition vers les catégories de projets
  useEffect(() => {
    const links = menuLinksRef.current;
    if (!links) return;

    // Sélectionner SEULEMENT les items de projet ET les séparateurs, PAS la croix
    const menuItems = links.querySelectorAll(`.${styles.menuItem}:not(.${styles.closeButton}), .${styles.separator}`);
    
    if (showProjectCategories && menuItems.length > 0) {
      // Les catégories viennent d'apparaître, animer leur apparition
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
              // Si le menu est ouvert, gérer comme les autres items
              if (isAnimating) return;
              // VERROUILLER l'image actuelle
              lockedImageRef.current = hoveredImage;
              const currentImage = lockedImageRef.current;
              
              
              setIsAnimating(true);
              
              // Animer le changement d'image SEULEMENT si l'image est différente
              const overlay = menuOverlayRef.current;
              
              if (overlay && currentImage !== IMAGES.hero1) {
                // NE PAS toucher à setHoveredImage - l'image React reste visible
                
                // Créer une nouvelle image par dessus l'ancienne
                const newImageElement = document.createElement('div');
                newImageElement.className = `${styles.centerImage} ${styles.active}`;
                newImageElement.style.backgroundImage = `url(${IMAGES.hero1})`;
                newImageElement.style.zIndex = '2';
                overlay.appendChild(newImageElement);
                
                // Animer la nouvelle image de 0 à 100%
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
                
                // Attendre la fin de l'animation avant de fermer et de naviguer
                setTimeout(() => {
                  setIsOpen(false);
                  
                  navigateToHero("hero1");
                  
                  setTimeout(() => {
                    setIsAnimating(false);
                    lockedImageRef.current = null;
                  }, 100);
                }, 600);
              } else {
                // Si c'est la même image, fermer directement et naviguer
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
              // Si le menu est fermé, navigation normale (trackClick déjà appelé en tête)
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

      {/* Menu overlay mobile */}
      <div 
        ref={menuOverlayRef} 
        className={styles.menuOverlay}
        style={{ opacity: 0, display: "none" }}
        onClick={(e) => {
          // Clic en dehors des liens revient au menu si on est dans les catégories
          if (showProjectCategories && e.target === menuOverlayRef.current) {
            hideProjectsMenu();
          }
        }}
      >
        {/* Image ronde au centre */}
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
