import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import styles from "./mentions.module.scss";
import { FaArrowRight } from "react-icons/fa6";
import RadialTransitionOverlay from "../../General/Nav/RadialTransitionOverlay";
import ProtectedEmail from "../../General/ProtectedEmail/ProtectedEmail";

const Mentions = () => {
  const navigate = useNavigate();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isTransitioningBack, setIsTransitioningBack] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [isTransitioningToPage, setIsTransitioningToPage] = useState(false);
  const creditsLinkRef = useRef<HTMLAnchorElement>(null);
  const politiqueLinkRef = useRef<HTMLAnchorElement>(null);
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
    // Marquer qu'on vient de Mentions et qu'on veut aller à Contact
    sessionStorage.setItem('returningFromMentionsToContact', 'true');
    navigate("/");
  };

  // Gérer les clics sur les liens internes
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    
    // Calculer la position du lien pour centrer le gradient
    const linkRef = path === '/credits' ? creditsLinkRef : politiqueLinkRef;
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
      <div className={styles.containerMentions}>
        <div ref={overlayRef} className={styles.overlay}></div>
        <div className={styles.mentionsContainer} style={{ opacity: showContent ? 1 : 0 }}>
          <h1>Mentions légales</h1>
          <div className={styles.legalContent}>
            
            {/* Identification du site */}
            <section className={styles.section}>
              <h2>Identification du site</h2>
              <div className={styles.sectionContent}>
                <p><strong>Propriétaire/Auteur :</strong> Aurélien Allenic</p>
                <p><strong>Profession :</strong> Développeur Web et Mobile Fullstack</p>
                <p>
                  <strong>Email :</strong> {" "}
                  <ProtectedEmail 
                    encodedEmail={encodedEmail}
                    className={styles.emailLink}
                  />
                </p>
              </div>
            </section>

            {/* Informations techniques */}
            <section className={styles.section}>
              <h2>Informations techniques</h2>
              <div className={styles.sectionContent}>
                <p><strong>Hébergement Frontend :</strong> OVH</p>
                <p><strong>Hébergement Backend :</strong> Vercel</p>
                <p><strong>Responsable de publication :</strong> Aurélien Allenic</p>
              </div>
            </section>

            {/* Propriété intellectuelle */}
            <section className={styles.section}>
              <h2>Propriété intellectuelle</h2>
              <div className={styles.sectionContent}>
                <p>© {new Date().getFullYear()} Aurélien Allenic. Tous droits réservés.</p>
                <p>
                  Le contenu de ce site (textes, images, code source) est protégé par le droit d'auteur. 
                  Vous ne pouvez pas reproduire, distribuer ou transmettre le contenu sans autorisation préalable.
                </p>
                <p>
                  <strong>Liens vers les crédits images :</strong> Consultez notre page{" "}
                  <a 
                    ref={creditsLinkRef}
                    href="/credits" 
                    className={styles.link}
                    onClick={(e) => handleLinkClick(e, '/credits')}
                  >
                    Crédits images
                  </a> pour
                  connaître les sources de toutes les images utilisées sur ce site.
                </p>
              </div>
            </section>

            {/* Politique de confidentialité */}
            <section className={styles.section}>
              <h2>Politique de confidentialité</h2>
              <div className={styles.sectionContent}>
                <p>
                  Consultez notre{" "}
                  <a 
                    ref={politiqueLinkRef}
                    href="/politique-confidentialite" 
                    className={styles.link}
                    onClick={(e) => handleLinkClick(e, '/politique-confidentialite')}
                  >
                    Politique de confidentialité
                  </a> pour connaître nos pratiques en matière de protection des données.
                </p>
              </div>
            </section>

            {/* Limitation de responsabilité */}
            <section className={styles.section}>
              <h2>Limitation de responsabilité</h2>
              <div className={styles.sectionContent}>
                <p>
                  Ce site est fourni "tel quel" sans aucune garantie, expresse ou implicite. 
                  L'auteur de ce site ne peut pas être tenu responsable des dommages directs, 
                  indirects, accidentels, spéciaux ou consécutifs découlant de l'accès ou 
                  de l'utilisation du site.
                </p>
                <p>
                  L'auteur ne peut pas être tenu responsable des contenus externes auxquels 
                  le site rend accès par des liens hypertextes.
                </p>
              </div>
            </section>

            {/* Conditions d'accès */}
            <section className={styles.section}>
              <h2>Conditions d'accès</h2>
              <div className={styles.sectionContent}>
                <p>
                  L'accès à ce site est gratuit. Vous vous engagez à :
                </p>
                <ul className={styles.conditionsList}>
                  <li>Respecter les lois et réglementations applicables</li>
                  <li>Ne pas utiliser de robots ou outils de scraping</li>
                  <li>Ne pas tenter d'accéder à des sections non autorisées</li>
                  <li>Ne pas perturber le fonctionnement du site</li>
                  <li>Respecter les droits d'auteur et la propriété intellectuelle</li>
                </ul>
              </div>
            </section>

            {/* Cookies et données */}
            <section className={styles.section}>
              <h2>Cookies</h2>
              <div className={styles.sectionContent}>
                <p>
                  Ce site n'utilise pas de cookies de suivi ou d'analytique pour le moment. 
                  Aucune donnée personnelle n'est collectée sans votre consentement.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section className={styles.section}>
              <h2>Contact</h2>
              <div className={styles.sectionContent}>
                <p>
                  Pour toute question concernant ces mentions légales ou le site, 
                  n'hésitez pas à nous contacter à l'adresse :{" "}
                  <ProtectedEmail 
                    encodedEmail={encodedEmail}
                    className={styles.emailLink}
                  />
                </p>
              </div>
            </section>

          </div>

          <button onClick={handleBackToSite} className={styles.backButtonSmall}>
            <FaArrowRight />Retour au site
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
    </>
  );
};

export default Mentions;
