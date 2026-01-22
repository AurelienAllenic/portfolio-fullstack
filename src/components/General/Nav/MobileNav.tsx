import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import styles from "./mobileNav.module.scss";
import { useModalCV } from "./ModalCVContext";
import { useNavigation } from "./NavigationContext";

// Images pour chaque section (en dehors du composant pour éviter les re-créations)
const IMAGES = {
  hero1: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_auto,q_auto/background_ll7suh.webp",
  hero2: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/learnhome_oqap2c.webp",
  projects: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/claquettes_tcwcpf.webp",
  contact: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/gameon_uieupe.webp",
};

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const { openModal } = useModalCV();
  const { navigateToHero, navigateToProjects, navigateToContact, heroState } = useNavigation();
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

  const handleNavigate = (destination: "hero" | "projects" | "contact", imageUrl: string) => {
    if (isAnimating) return; // Empêcher les clics multiples pendant l'animation
    
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
            // Une fois l'animation terminée, mettre à jour l'image React et supprimer la temporaire
            setHoveredImage(imageUrl);
            
            // Attendre un frame puis supprimer l'élément temporaire
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


  // Animation d'entrée initiale de la nav
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
      
      // Animation des liens ET des tirets avec stagger
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
    } else {
      // Fermer le menu
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(overlay, { display: "none" });
          setHoveredImage(null);
        }
      });
      
      tl.to(overlay, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in"
      });
    }
  }, [isOpen, getDefaultImage]);

  return (
    <>
      <div className={styles.containerMobileNav} ref={mobileNavRef}>
        <div 
          className={styles.left}
          onClick={() => {
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
              // Si le menu est fermé, navigation normale
              navigateToHero("hero1");
            }
          }}
          style={{ cursor: "pointer" }}
        >
          AURELIEN ALLENIC
        </div>
        <div className={styles.right}>
          <div className={styles.socialIcons}>
            <div onClick={openModal} style={{ cursor: "pointer" }}>
              <img
                src="https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/cv_sjsdbv.webp"
                alt="CV"
              />
            </div>
            <a
              href="https://fr.linkedin.com/in/aur%C3%A9lien-allenic-5725b8219"
              target="_blank"
              rel="noopener noreferrer"
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
            >
              <img
                src="https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/Github_logo_kmfq2g.webp"
                alt="GitHub"
              />
            </a>
          </div>
          <div
            className={`${styles.burger} ${isOpen ? styles.open : ""}`}
            onClick={toggleMenu}
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
          <div 
            className={styles.menuItem}
            onClick={() => handleNavigate("hero", IMAGES.hero2)}
          >
            About
          </div>
          <div className={styles.separator}>-</div>
          <div 
            className={styles.menuItem}
            onClick={() => handleNavigate("projects", IMAGES.projects)}
          >
            Projects
          </div>
          <div className={styles.separator}>-</div>
          <div 
            className={styles.menuItem}
            onClick={() => handleNavigate("contact", IMAGES.contact)}
          >
            Contact
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileNav;
