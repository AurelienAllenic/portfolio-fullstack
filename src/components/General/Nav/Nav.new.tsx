import styles from "./nav.module.scss";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { useModalCV } from "./ModalCVContext";
import { useAppState } from "../../../state/AppStateContext";

/**
 * Navigation adaptée au nouveau système d'état centralisé
 */

const Nav = () => {
  const navRef = useRef<HTMLDivElement>(null);
  const { openModal } = useModalCV();
  const { goToHeroBeforeScroll, goToHeroAfterScroll, goToProjects, goToContact, startNavigation, endNavigation } = useAppState();

  useEffect(() => {
    const navEl = navRef.current;
    if (!navEl) return;

    const logo = navEl.querySelector<HTMLElement>(`.${styles.logo}`);
    const links = navEl.querySelectorAll<HTMLElement>(`.${styles.navLinks} li`);
    const socials = navEl.querySelectorAll<HTMLElement>(`.${styles.socialIcons} > *`);

    if (logo) gsap.set(logo, { opacity: 0, x: -30 });
    gsap.set(links, { opacity: 0, y: -30 });
    gsap.set(socials, { opacity: 0, y: -30 });

    const baseDelay = 2.5;

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    if (logo) {
      tl.to(logo, { opacity: 1, x: 0, duration: 0.6, delay: baseDelay }, 0);
    }

    tl.to(
      links,
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.12 },
      logo ? 0.1 + baseDelay : baseDelay
    );

    tl.to(
      socials,
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 },
      links ? 0.2 + baseDelay : baseDelay
    );

    return () => {
      tl.kill();
    };
  }, []);

  const handleLogoClick = () => {
    startNavigation();
    goToHeroBeforeScroll();
    setTimeout(endNavigation, 1600);
  };

  const handleAboutClick = () => {
    startNavigation();
    goToHeroAfterScroll(0);
    setTimeout(endNavigation, 1600);
  };

  const handleProjectsClick = () => {
    startNavigation();
    goToProjects(1);
    setTimeout(endNavigation, 1600);
  };

  const handleContactClick = () => {
    startNavigation();
    goToContact();
    setTimeout(endNavigation, 1600);
  };

  return (
    <div className={styles.containerNav}>
      <nav className={styles.nav} ref={navRef}>
        <div 
          className={styles.logo}
          onClick={handleLogoClick}
          style={{ cursor: "pointer" }}
        >
          AURELIEN ALLENIC
        </div>
        <ul className={styles.navLinks}>
          <li>
            <div
              onClick={handleAboutClick}
              style={{ cursor: "pointer" }}
            >
              About
            </div>
          </li>
          <li>
            <div
              onClick={handleProjectsClick}
              style={{ cursor: "pointer" }}
            >
              Projects
            </div>
          </li>
          <li>
            <div
              onClick={handleContactClick}
              style={{ cursor: "pointer" }}
            >
              Contact
            </div>
          </li>
        </ul>
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
      </nav>
    </div>
  );
};

export default Nav;
