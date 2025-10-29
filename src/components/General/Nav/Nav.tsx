import { Link } from "react-scroll";
import styles from "./nav.module.scss";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";

const Nav = () => {
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const navEl = navRef.current;
    if (!navEl) return;

    const logo = navEl.querySelector<HTMLElement>(`.${styles.logo}`);
    const links = navEl.querySelectorAll<HTMLElement>(`.${styles.navLinks} li`);
    const socials = navEl.querySelectorAll<HTMLElement>(`.${styles.socialIcons} a`);

    // Etat initial
    if (logo) gsap.set(logo, { opacity: 0, x: -30 });
    gsap.set(links, { opacity: 0, x: -30 });
    gsap.set(socials, { opacity: 0, x: -30 });

    const baseDelay = 2.5;

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    // Logo
    if (logo) {
      tl.to(logo, { opacity: 1, x: 0, duration: 0.6, delay: baseDelay }, 0);
    }

    // Liens (stagger)
    tl.to(
      links,
      { opacity: 1, x: 0, duration: 0.6, stagger: 0.12 },
      logo ? 0.1 + baseDelay : baseDelay
    );

    // Icônes sociales (stagger)
    tl.to(
      socials,
      { opacity: 1, x: 0, duration: 0.6, stagger: 0.08 },
      '>-0.6'
    );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div className={styles.containerNav}>
      <nav className={styles.nav} ref={navRef}>
        <div className={styles.logo}>AURELIEN ALLENIC</div>
        <ul className={styles.navLinks}>
          <li>
            <Link
              to="about"
              smooth={true}
              duration={500}
              offset={-70}
              activeClass="active"
            >
              About
            </Link>
          </li>
          <li>
            <Link
              to="projects"
              smooth={true}
              duration={500}
              offset={0}
              activeClass="active"
            >
              Projects
            </Link>
          </li>
          <li>
            <Link
              to="contact"
              smooth={true}
              duration={500}
              offset={-70}
              activeClass="active"
            >
              Contact
            </Link>
          </li>
        </ul>
        <div className={styles.socialIcons}>
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
              src="https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/github_logo_kxkhvp.webp"
              alt="GitHub"
            />
          </a>
        </div>
      </nav>
    </div>
  );
};

export default Nav;
