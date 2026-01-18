import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import styles from "./mobileNav.module.scss";
import { useModalCV } from "./ModalCVContext";
import { useNavigation } from "./NavigationContext";

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { openModal } = useModalCV();
  const { navigateToHero, navigateToProjects, navigateToContact } = useNavigation();
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const menuLinksRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigate = (destination: "hero" | "projects" | "contact") => {
    // Fermer le menu d'abord
    setIsOpen(false);
    
    // Attendre que l'animation de fermeture soit terminée avant de naviguer
    setTimeout(() => {
      switch (destination) {
        case "hero":
          navigateToHero("hero2"); // About = HeroAfterScroll (premier texte)
          break;
        case "projects":
          navigateToProjects();
          break;
        case "contact":
          navigateToContact();
          break;
      }
    }, 300); // Délai pour l'animation de fermeture
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
    
    if (!overlay || !links) return;

    if (isOpen) {
      // Ouvrir le menu
      gsap.set(overlay, { display: "flex" });
      
      const tl = gsap.timeline();
      
      // Animation de l'overlay
      tl.to(overlay, {
        opacity: 1,
        duration: 0.4,
        ease: "power2.out"
      });
      
      // Animation des liens avec stagger
      const menuItems = links.querySelectorAll(`.${styles.menuItem}`);
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
        "-=0.2"
      );
    } else {
      // Fermer le menu
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(overlay, { display: "none" });
        }
      });
      
      tl.to(overlay, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in"
      });
    }
  }, [isOpen]);

  return (
    <>
      <div className={styles.containerMobileNav} ref={mobileNavRef}>
        <div 
          className={styles.left}
          onClick={() => {
            setIsOpen(false);
            setTimeout(() => navigateToHero("hero1"), 300);
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
        <div ref={menuLinksRef} className={styles.menuContent}>
          <div 
            className={styles.menuItem}
            onClick={() => handleNavigate("hero")}
          >
            About
          </div>
          -
          <div 
            className={styles.menuItem}
            onClick={() => handleNavigate("projects")}
          >
            Projects
          </div>
          -
          <div 
            className={styles.menuItem}
            onClick={() => handleNavigate("contact")}
          >
            Contact
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileNav;
