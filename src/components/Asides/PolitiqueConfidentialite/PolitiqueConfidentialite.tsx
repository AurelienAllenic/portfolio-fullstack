import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import styles from "./politiqueConfidentialite.module.scss";
import { FaArrowRight } from "react-icons/fa6";
import RadialTransitionOverlay from "../../General/Nav/RadialTransitionOverlay";
import ProtectedEmail from "../../General/ProtectedEmail/ProtectedEmail";
import { useLanguage } from "../../General/Language/LanguageContext";
import LanguageToggle from "../../General/Language/LanguageToggle";

const PolitiqueConfidentialite = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isTransitioningBack, setIsTransitioningBack] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [isTransitioningToPage, setIsTransitioningToPage] = useState(false);
  const mentionsLinkRef = useRef<HTMLAnchorElement>(null);
  const creditsLinkRef = useRef<HTMLAnchorElement>(null);
  const targetPath = useRef<string>("");

  // Animation du radial gradient à l'entrée (comme NotFound)
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    // Initialiser le gradient à 0% (tout noir)
    gsap.set(overlay, { "--gradient-size": "0%" });
    
    // Animer le gradient pour révéler l'image (0% → 100%)
    gsap.to(overlay, {
      "--gradient-size": "100%",
      duration: 1.2,
      ease: "power2.inOut",
      onComplete: () => {
        setShowContent(true);
      },
    });
  }, []);

  // Gérer le retour au site avec animation de fermeture
  const handleBackToSite = () => {
    setIsTransitioningBack(true);
  };

  const handleTransitionBackComplete = () => {
    // Marquer qu'on vient de PolitiqueConfidentialite et qu'on veut aller à Contact
    sessionStorage.setItem('returningFromPolitiqueConfidentialiteToContact', 'true');
    navigate("/");
  };

  // Gérer les clics sur les liens internes
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    
    // Calculer la position du lien pour centrer le gradient
    const linkRef = path === '/mentions-legales' ? mentionsLinkRef : creditsLinkRef;
    const linkRect = linkRef.current?.getBoundingClientRect();
    if (linkRect) {
      const centerX = linkRect.left + linkRect.width / 2;
      const centerY = linkRect.top + linkRect.height / 2;
      
      // Stocker la position pour RadialTransitionOverlay
      sessionStorage.setItem('gradientCenterX', centerX.toString());
      sessionStorage.setItem('gradientCenterY', centerY.toString());
    }
    
    targetPath.current = path;
    setIsTransitioningToPage(true);
  };

  const handlePageTransitionComplete = () => {
    navigate(targetPath.current);
  };

  // Email encodé en base64: aurelienallenic.dev@gmail.com
  const encodedEmail = "YXVyZWxpZW5hbGxlbmljLmRldkBnbWFpbC5jb20=";

  return (
    <>
      <div className={styles.containerPolitiqueConfidentialite}>
        <div ref={overlayRef} className={styles.overlay}></div>
        <div className={styles.politiqueConfidentialiteContainer} style={{ opacity: showContent ? 1 : 0 }}>
          <h1>{t("privacy.title")}</h1>
          <div className={styles.privacyContent}>

            {/* Introduction */}
            <section className={styles.section}>
              <h2>{t("privacy.section.introduction")}</h2>
              <div className={styles.sectionContent}>
                <p>
                  {t("privacy.section.introduction.text")}
                </p>
              </div>
            </section>

            {/* Collecte de données */}
            <section className={styles.section}>
              <h2>{t("privacy.section.collection")}</h2>
              <div className={styles.sectionContent}>
                <p>
                  <strong>{t("privacy.section.collection.title")}</strong>
                </p>
                <ul className={styles.conditionsList}>
                  <li>{t("privacy.section.collection.item1")}</li>
                  <li>{t("privacy.section.collection.item2")}</li>
                  <li>{t("privacy.section.collection.item3")}</li>
                  <li>{t("privacy.section.collection.item4")}</li>
                </ul>
                <p>
                  {t("privacy.section.collection.text")}
                </p>
              </div>
            </section>

            {/* Utilisation des données */}
            <section className={styles.section}>
              <h2>{t("privacy.section.usage")}</h2>
              <div className={styles.sectionContent}>
                <p>
                  {t("privacy.section.usage.text1")}
                </p>
                <ul className={styles.conditionsList}>
                  <li>{t("privacy.section.usage.item1")}</li>
                  <li>{t("privacy.section.usage.item2")}</li>
                  <li>{t("privacy.section.usage.item3")}</li>
                </ul>
                <p>
                  {t("privacy.section.usage.text2")}
                </p>
              </div>
            </section>

            {/* Protection des données */}
            <section className={styles.section}>
              <h2>{t("privacy.section.protection")}</h2>
              <div className={styles.sectionContent}>
                <p>
                  {t("privacy.section.protection.text1")}
                </p>
                <p>
                  {t("privacy.section.protection.text2")}
                </p>
              </div>
            </section>

            {/* Cookies */}
            <section className={styles.section}>
              <h2>{t("privacy.section.cookies")}</h2>
              <div className={styles.sectionContent}>
                <p>
                  {t("privacy.section.cookies.text")}
                </p>
              </div>
            </section>

            {/* Droits RGPD */}
            <section className={styles.section}>
              <h2>{t("privacy.section.gdpr")}</h2>
              <div className={styles.sectionContent}>
                <p>
                  {t("privacy.section.gdpr.text1")}
                </p>
                <ul className={styles.conditionsList}>
                  <li><strong>{t("privacy.section.gdpr.right1")}</strong> {t("privacy.section.gdpr.right1.desc")}</li>
                  <li><strong>{t("privacy.section.gdpr.right2")}</strong> {t("privacy.section.gdpr.right2.desc")}</li>
                  <li><strong>{t("privacy.section.gdpr.right3")}</strong> {t("privacy.section.gdpr.right3.desc")}</li>
                  <li><strong>{t("privacy.section.gdpr.right4")}</strong> {t("privacy.section.gdpr.right4.desc")}</li>
                  <li><strong>{t("privacy.section.gdpr.right5")}</strong> {t("privacy.section.gdpr.right5.desc")}</li>
                </ul>
                <p>
                  {t("privacy.section.gdpr.text2")}{" "}
                  <ProtectedEmail 
                    encodedEmail={encodedEmail}
                    className={styles.emailLink}
                  />
                </p>
              </div>
            </section>

            {/* Durée de conservation */}
            <section className={styles.section}>
              <h2>{t("privacy.section.retention")}</h2>
              <div className={styles.sectionContent}>
                <p>
                  {t("privacy.section.retention.text")}
                </p>
              </div>
            </section>

            {/* Tiers */}
            <section className={styles.section}>
              <h2>{t("privacy.section.sharing")}</h2>
              <div className={styles.sectionContent}>
                <p>
                  {t("privacy.section.sharing.text")}
                </p>
                <ul className={styles.conditionsList}>
                  <li>{t("privacy.section.sharing.item1")}</li>
                  <li>{t("privacy.section.sharing.item2")}</li>
                  <li>{t("privacy.section.sharing.item3")}</li>
                </ul>
              </div>
            </section>

            {/* Modifications */}
            <section className={styles.section}>
              <h2>{t("privacy.section.modifications")}</h2>
              <div className={styles.sectionContent}>
                <p>
                  {t("privacy.section.modifications.text")}
                </p>
              </div>
            </section>

            {/* Contact et liens */}
            <section className={styles.section}>
              <h2>{t("privacy.section.contact")}</h2>
              <div className={styles.sectionContent}>
                <p>
                  {t("privacy.section.contact.text")}{" "}
                  <ProtectedEmail 
                    encodedEmail={encodedEmail}
                    className={styles.emailLink}
                  />
                </p>
              </div>
            </section>

            {/* Navigation */}
            <section className={styles.section}>
              <h2>{t("privacy.section.otherPages")}</h2>
              <div className={styles.sectionContent}>
                <p>
                  {t("privacy.section.otherPages.text")}{" "}
                  <a 
                    ref={mentionsLinkRef}
                    href="/mentions-legales" 
                    className={styles.link}
                    onClick={(e) => handleLinkClick(e, '/mentions-legales')}
                  >
                    {t("privacy.section.otherPages.mentions")}
                  </a> {t("privacy.section.otherPages.and")}{" "}
                  <a 
                    ref={creditsLinkRef}
                    href="/credits" 
                    className={styles.link}
                    onClick={(e) => handleLinkClick(e, '/credits')}
                  >
                    {t("privacy.section.otherPages.credits")}
                  </a>.
                </p>
              </div>
            </section>

          </div>

          <button onClick={handleBackToSite} className={styles.backButtonSmall}>
            <FaArrowRight />{t("common.backToSite")}
          </button>
        </div>
      </div>
      <RadialTransitionOverlay
        isActive={isTransitioningBack}
        direction="in"
        onComplete={handleTransitionBackComplete}
      />
      <RadialTransitionOverlay
        isActive={isTransitioningToPage}
        direction="in"
        onComplete={handlePageTransitionComplete}
      />
      <LanguageToggle />
    </>
  );
};

export default PolitiqueConfidentialite;
