import styles from "./nav.module.scss";
import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import { useModalCV } from "./ModalCVContext";
import { useNavigation } from "./NavigationContext";
import ProjectsDropdown from "./ProjectsDropdown";
import { useLanguage } from "../Language/LanguageContext";
import { useCv } from "./CvContext";
import { useAnalytics } from "../../../hooks/useAnalytics";
import { HiOutlineUser, HiOutlineFolderOpen, HiOutlineMail, HiOutlineHome } from "react-icons/hi";

const Nav = () => {
  const { trackClick } = useAnalytics();
  const navRef = useRef<HTMLDivElement>(null);
  const { openModal } = useModalCV();
  const { navigateToHero, navigateToContact, navigateToProjects } = useNavigation();
  const { t } = useLanguage();
  const { error: cvError } = useCv();

  const [isScrolled, setIsScrolled] = useState(false);
  const [pillProjectsOpen, setPillProjectsOpen] = useState(false);
  const pillProjectsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY > 80) setIsScrolled(true);
      else if (currentY <= 10) setIsScrolled(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!pillProjectsOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (pillProjectsRef.current && !pillProjectsRef.current.contains(e.target as Node)) {
        setPillProjectsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [pillProjectsOpen]);

  const categories = [
    { title: t("projects.category.ascent"), index: 0 },
    { title: t("projects.category.paro"), index: 1 },
    { title: t("projects.category.claquettes"), index: 2 },
    { title: t("projects.category.allprojects"), index: 3 },
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
    <>
    {isScrolled && (
      <div className={styles.pillNav}>
        <div
          className={styles.pillItem}
          title="Home"
          onClick={() => handleTrackerClick("nav_logo", "navigateToHero", "hero1")}
        >
          <HiOutlineHome />
        </div>
        <div className={styles.pillDivider} />
        <div
          className={styles.pillItem}
          title="About"
          onClick={() => handleTrackerClick("nav_about", "navigateToHero", "hero2")}
        >
          <HiOutlineUser />
        </div>
        <div className={styles.pillDivider} />
        <div
          className={styles.pillItem}
          title="Projects"
          ref={pillProjectsRef}
          style={{ position: "relative" }}
          onClick={() => setPillProjectsOpen((o) => !o)}
        >
          <HiOutlineFolderOpen />
          {pillProjectsOpen && (
            <div className={styles.pillDropdown}>
              {categories.map((cat) => (
                <div
                  key={cat.index}
                  className={styles.pillDropdownItem}
                  onClick={(e) => {
                    e.stopPropagation();
                    trackClick(`nav_${cat.title}`);
                    navigateToProjects(cat.index);
                    setPillProjectsOpen(false);
                  }}
                >
                  {cat.title}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={styles.pillDivider} />
        <div
          className={styles.pillItem}
          title="Contact"
          onClick={() => handleTrackerClick("nav_contact", "navigateToContact")}
        >
          <HiOutlineMail />
        </div>
      </div>
    )}
    <div className={styles.containerNav} style={isScrolled ? { opacity: 0, pointerEvents: "none" } : undefined}>
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
    </>
  );
};

export default Nav;