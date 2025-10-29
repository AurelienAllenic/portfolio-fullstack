import styles from "./hero.module.scss";
import { useState, useEffect } from "react";

const HeroBeforeScroll = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 767px)").matches);
    };

    checkIsMobile();

    const mediaQuery = window.matchMedia("(max-width: 767px)");
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", checkIsMobile);
      return () => mediaQuery.removeEventListener("change", checkIsMobile);
    } else {
      const handler = () => checkIsMobile();
      window.addEventListener("resize", handler);
      return () => window.removeEventListener("resize", handler);
    }
  }, []);

  return (
    <div className={styles.hero1}>
      <div className={styles.titleContainer}>
        <h2 className={styles.titleLeft}>
          Développeur<span>WEB</span>
        </h2>
        <h2 className={styles.titleRight}>FULLSTACK</h2>
      </div>
      <div className={styles.textContainer}>
        <p className={styles.subtitle}>
          De la conception à la programmation d’applications performantes et
          design
        </p>
      </div>
      <div className={styles.scrollIndicatorContainer}>
      <p className={styles.scrollIndicator}>{isMobile ? "Scroll Up" : "Scroll Down"}</p>
        <img
          src="https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/scroll-indicator_kvzoqd.webp"
          alt="Scroll indicator"
          className={styles.scrollIndicatorImg}
        />
      </div>
    </div>
  );
};

export default HeroBeforeScroll;
