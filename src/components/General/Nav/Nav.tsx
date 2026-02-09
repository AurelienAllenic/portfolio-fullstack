import styles from "./nav.module.scss";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { useModalCV } from "./ModalCVContext";
import { useNavigation } from "./NavigationContext";
import ProjectsDropdown from "./ProjectsDropdown";
import { useLanguage } from "../Language/LanguageContext";
import { useCv } from "./CvContext";
import { useAnalytics } from "../../../hooks/useAnalytics";

const Nav = () => {
  const { trackClick } = useAnalytics();
  const navRef = useRef<HTMLDivElement>(null);
  const { openModal } = useModalCV();
  const { navigateToHero, navigateToContact, navigateToProjects } = useNavigation();
  const { t } = useLanguage();
  const { error: cvError } = useCv();

  const categories = [
    { title: t("projects.category.personnel"), index: 0 },
    { title: t("projects.category.solead"), index: 1 },
    { title: t("projects.category.iim"), index: 2 },
    { title: t("projects.category.python"), index: 3 },
    { title: t("projects.category.react"), index: 4 },
    { title: t("projects.category.web"), index: 5 },
  ];

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

  const handleTrackerClick = (
    trackingEvent: string,
    navigateToFunction: "navigateToHero" | "navigateToContact" | "navigateToProjects",
    navigateToDestination?: string | number
  ) => {
    trackClick(trackingEvent);
    if (navigateToFunction === "navigateToHero" && navigateToDestination) {
      navigateToHero(navigateToDestination as "hero1" | "hero2");
    } else if (navigateToFunction === "navigateToContact") {
      navigateToContact();
    } else if (navigateToFunction === "navigateToProjects" && navigateToDestination !== undefined) {
      navigateToProjects(Number(navigateToDestination));
    }
  };

  const handleCVClick = () => {
    trackClick('nav_cv_open');
    openModal();
  };

  return (
    <div className={styles.containerNav}>
      <nav className={styles.nav} ref={navRef}>
        <div 
          className={styles.logo}
          onClick={() => handleTrackerClick('nav_logo', 'navigateToHero', 'hero1')}
          style={{ cursor: "pointer" }}
        >
          AURELIEN ALLENIC
        </div>
        <ul className={styles.navLinks}>
          <li>
            <div
              onClick={() => handleTrackerClick('nav_about', 'navigateToHero', 'hero2')}
              style={{ cursor: "pointer" }}
            >
              {t("nav.about")}
            </div>
          </li>
          <li>
            <ProjectsDropdown categories={categories} />
          </li>
          <li>
            <div
              onClick={() => handleTrackerClick('nav_contact', 'navigateToContact')}
              style={{ cursor: "pointer" }}
            >
              {t("nav.contact")}
            </div>
          </li>
        </ul>
        <div className={styles.socialIcons}>
          {!cvError && (
            <div onClick={handleCVClick} style={{ cursor: "pointer" }}>
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
      </nav>
    </div>
  );
};

export default Nav;