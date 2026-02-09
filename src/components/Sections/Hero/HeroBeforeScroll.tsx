import styles from "./hero.module.scss";
import { useState, useEffect } from "react";
import { useLanguage } from "../../General/Language/LanguageContext";
import { useTrackSectionArrival } from "../../../hooks/useTrackSectionArrival";

const HeroBeforeScroll = () => {
  const [isMobile, setIsMobile] = useState(false);
  const { t, language } = useLanguage();

  useTrackSectionArrival('section_hero');

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
        {language === "en" ? (
          <>
            <h2 className={styles.titleLeft}>
              {t("hero.beforeScroll.fullstack")}
              <span>{t("hero.beforeScroll.web")}</span>
            </h2>
            <h2 className={styles.titleRight}>{t("hero.beforeScroll.developer")}</h2>
          </>
        ) : (
          <>
            <h2 className={styles.titleLeft}>
              {t("hero.beforeScroll.developer")}<span>{t("hero.beforeScroll.web")}</span>
            </h2>
            <h2 className={styles.titleRight}>{t("hero.beforeScroll.fullstack")}</h2>
          </>
        )}
      </div>
      <div className={styles.textContainer}>
        <p className={styles.subtitle}>
          {t("hero.beforeScroll.subtitle")}
        </p>
      </div>
      <div className={styles.scrollIndicatorContainer}>
        <p className={styles.scrollIndicator}>
          {isMobile ? t("hero.beforeScroll.scrollUp") : t("hero.beforeScroll.scrollDown")}
        </p>
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
