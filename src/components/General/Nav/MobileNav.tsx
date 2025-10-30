import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import styles from "./mobileNav.module.scss";

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const mobileNavRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const root = mobileNavRef.current;
    if (!root) return;

    const left = root.querySelector<HTMLElement>(`.${styles.left}`);
    const socials = root.querySelectorAll<HTMLElement>(`.${styles.socialIcons} a`);
    const burger = root.querySelector<HTMLElement>(`.${styles.burger}`);

    // Etat initial (slide from top)
    if (left) gsap.set(left, { opacity: 0, y: -30 });
    gsap.set(socials, { opacity: 0, y: -30 });
    if (burger) gsap.set(burger, { opacity: 0, y: -30 });

    const baseDelay = 2.5; // aligne avec Nav et HeroBeforeScroll

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

  return (
    <div className={styles.containerMobileNav} ref={mobileNavRef}>
      <div className={styles.left}>AURELIEN ALLENIC</div>
      <div className={styles.right}>
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
  );
};

export default MobileNav;
