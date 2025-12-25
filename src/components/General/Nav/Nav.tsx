import { Link } from "react-scroll";
import styles from "./nav.module.scss";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { useModalCV } from "./ModalCVContext";
import { useNavigation } from "./NavigationContext";

const Nav = () => {
  const navRef = useRef<HTMLDivElement>(null);
  const { openModal } = useModalCV();
  const { navigateToHero, navigateToProjects, navigateToContact } = useNavigation();

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
      tl.to(logo, { opacity: 1, y: 0, duration: 0.6, delay: baseDelay }, 0);
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

  return (
    <div className={styles.containerNav}>
      <nav className={styles.nav} ref={navRef}>
        <div 
          className={styles.logo}
          onClick={() => navigateToHero("hero1")}
          style={{ cursor: "pointer" }}
        >
          AURELIEN ALLENIC
        </div>
        <ul className={styles.navLinks}>
          <li>
            <div
              onClick={() => navigateToHero("hero2")}
              style={{ cursor: "pointer" }}
            >
              About
            </div>
          </li>
          <li>
            <div
              onClick={() => navigateToProjects()}
              style={{ cursor: "pointer" }}
            >
              Projects
            </div>
          </li>
          <li>
            <div
              onClick={() => navigateToContact()}
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
