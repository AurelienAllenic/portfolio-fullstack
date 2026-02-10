import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import styles from "./mentions.module.scss";
import { FaArrowRight } from "react-icons/fa6";
import RadialTransitionOverlay from "../../General/Nav/RadialTransitionOverlay";
import ProtectedEmail from "../../General/ProtectedEmail/ProtectedEmail";
import { useLanguage } from "../../General/Language/LanguageContext";
import LanguageToggle from "../../General/Language/LanguageToggle";

const Mentions = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isTransitioningBack, setIsTransitioningBack] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [isTransitioningToPage, setIsTransitioningToPage] = useState(false);
  const creditsLinkRef = useRef<HTMLAnchorElement>(null);
  const politiqueLinkRef = useRef<HTMLAnchorElement>(null);
  const targetPath = useRef<string>("");

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    gsap.set(overlay, { "--gradient-size": "0%" });

    gsap.to(overlay, {
      "--gradient-size": "100%",
      duration: 1.2,
      ease: "power2.inOut",
      onComplete: () => {
        setShowContent(true);
      },
    });
  }, []);

  const handleBackToSite = () => {
    setIsTransitioningBack(true);
  };

  const handleTransitionBackComplete = () => {
    sessionStorage.setItem('returningFromMentionsToContact', 'true');
    navigate("/");
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    
    const linkRef = path === '/credits' ? creditsLinkRef : politiqueLinkRef;
    const linkRect = linkRef.current?.getBoundingClientRect();
    if (linkRect) {
      const centerX = linkRect.left + linkRect.width / 2;
      const centerY = linkRect.top + linkRect.height / 2;
      
      sessionStorage.setItem('gradientCenterX', centerX.toString());
      sessionStorage.setItem('gradientCenterY', centerY.toString());
    }
    
    targetPath.current = path;
    setIsTransitioningToPage(true);
  };

  const handlePageTransitionComplete = () => {
    navigate(targetPath.current);
  };

  const encodedEmail = "YXVyZWxpZW5hbGxlbmljLmRldkBnbWFpbC5jb20=";

  return (
    <>
      <div className={styles.containerMentions}>
        <div ref={overlayRef} className={styles.overlay}></div>
        <div className={styles.mentionsContainer} style={{ opacity: showContent ? 1 : 0 }}>
          <h1>{t("mentions.title")}</h1>
          <div className={styles.legalContent}>
            {/* Identification du site */}
            <section className={styles.section}>
              <h2>{t("mentions.section.identification")}</h2>
              <div className={styles.sectionContent}>
                <p><strong>{t("mentions.section.identification.owner")}</strong> Aurélien Allenic</p>
                <p><strong>{t("mentions.section.identification.profession")}</strong> {t("mentions.section.identification.profession.value")}</p>
                <p>
                  <strong>{t("mentions.section.identification.email")}</strong> {" "}
                  <ProtectedEmail 
                    encodedEmail={encodedEmail}
                    className={styles.emailLink}
                  />
                </p>
              </div>
            </section>
            {/* Informations techniques */}
            <section className={styles.section}>
              <h2>{t("mentions.section.technical")}</h2>
              <div className={styles.sectionContent}>
                <p><strong>{t("mentions.section.technical.frontend")}</strong> OVH</p>
                <p><strong>{t("mentions.section.technical.backend")}</strong> Vercel</p>
                <p><strong>{t("mentions.section.technical.publisher")}</strong> Aurélien Allenic</p>
              </div>
            </section>
            {/* Propriété intellectuelle */}
            <section className={styles.section}>
              <h2>{t("mentions.section.intellectual")}</h2>
              <div className={styles.sectionContent}>
                <p>© {new Date().getFullYear()} Aurélien Allenic. {t("mentions.section.intellectual.copyright")}</p>
                <p>
                  {t("mentions.section.intellectual.content")}
                </p>
                <p>
                  <strong>{t("mentions.section.intellectual.creditsLink")}</strong> {t("mentions.section.intellectual.creditsLink.text")}{" "}
                  <a 
                    ref={creditsLinkRef}
                    href="/credits" 
                    className={styles.link}
                    onClick={(e) => handleLinkClick(e, '/credits')}
                  >
                    {t("mentions.section.intellectual.creditsLink.credits")}
                  </a> {t("mentions.section.intellectual.creditsLink.for")}
                </p>
              </div>
            </section>
            {/* Politique de confidentialité */}
            <section className={styles.section}>
              <h2>{t("mentions.section.privacy")}</h2>
              <div className={styles.sectionContent}>
                <p>
                  {t("mentions.section.privacy.text")}{" "}
                  <a 
                    ref={politiqueLinkRef}
                    href="/politique-confidentialite" 
                    className={styles.link}
                    onClick={(e) => handleLinkClick(e, '/politique-confidentialite')}
                  >
                    {t("mentions.section.privacy.link")}
                  </a> {t("mentions.section.privacy.for")}
                </p>
              </div>
            </section>
            {/* Limitation de responsabilité */}
            <section className={styles.section}>
              <h2>{t("mentions.section.liability")}</h2>
              <div className={styles.sectionContent}>
                <p>
                  {t("mentions.section.liability.text1")}
                </p>
                <p>
                  {t("mentions.section.liability.text2")}
                </p>
              </div>
            </section>
            {/* Conditions d'accès */}
            <section className={styles.section}>
              <h2>{t("mentions.section.access")}</h2>
              <div className={styles.sectionContent}>
                <p>
                  {t("mentions.section.access.text")}
                </p>
                <ul className={styles.conditionsList}>
                  <li>{t("mentions.section.access.condition1")}</li>
                  <li>{t("mentions.section.access.condition2")}</li>
                  <li>{t("mentions.section.access.condition3")}</li>
                  <li>{t("mentions.section.access.condition4")}</li>
                  <li>{t("mentions.section.access.condition5")}</li>
                </ul>
              </div>
            </section>
            {/* Cookies et données */}
            <section className={styles.section}>
              <h2>{t("mentions.section.cookies")}</h2>
              <div className={styles.sectionContent}>
                <p>
                  {t("mentions.section.cookies.text")}
                </p>
              </div>
            </section>
            {/* Contact */}
            <section className={styles.section}>
              <h2>{t("mentions.section.contact")}</h2>
              <div className={styles.sectionContent}>
                <p>
                  {t("mentions.section.contact.text")}{" "}
                  <ProtectedEmail 
                    encodedEmail={encodedEmail}
                    className={styles.emailLink}
                  />
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

export default Mentions;
