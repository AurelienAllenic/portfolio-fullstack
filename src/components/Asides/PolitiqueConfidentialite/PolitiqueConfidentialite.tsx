import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import styles from "./politiqueConfidentialite.module.scss";
import { FaArrowRight } from "react-icons/fa6";
import RadialTransitionOverlay from "../../General/Nav/RadialTransitionOverlay";
import ProtectedEmail from "../../General/ProtectedEmail/ProtectedEmail";

const PolitiqueConfidentialite = () => {
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
          <h1>Politique de confidentialité</h1>
          <div className={styles.privacyContent}>

            {/* Introduction */}
            <section className={styles.section}>
              <h2>Introduction</h2>
              <div className={styles.sectionContent}>
                <p>
                  Chez Aurélien Allenic, nous accordons une grande importance à votre vie privée. 
                  Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos données personnelles.
                </p>
              </div>
            </section>

            {/* Collecte de données */}
            <section className={styles.section}>
              <h2>Collecte de données</h2>
              <div className={styles.sectionContent}>
                <p>
                  <strong>Données collectées via le formulaire de contact :</strong>
                </p>
                <ul className={styles.conditionsList}>
                  <li>Nom</li>
                  <li>Email</li>
                  <li>Message</li>
                  <li>Case à cocher pour consentement</li>
                </ul>
                <p>
                  Ces données sont collectées uniquement lorsque vous remplissez volontairement le formulaire de contact.
                </p>
              </div>
            </section>

            {/* Utilisation des données */}
            <section className={styles.section}>
              <h2>Utilisation des données</h2>
              <div className={styles.sectionContent}>
                <p>
                  Vos données personnelles sont utilisées exclusivement pour :
                </p>
                <ul className={styles.conditionsList}>
                  <li>Répondre à vos demandes de contact</li>
                  <li>Améliorer notre site et nos services</li>
                  <li>Respecter nos obligations légales</li>
                </ul>
                <p>
                  Nous ne vendons, ne partageons et n'échangeons jamais vos données avec des tiers sans votre consentement explicite.
                </p>
              </div>
            </section>

            {/* Protection des données */}
            <section className={styles.section}>
              <h2>Protection des données</h2>
              <div className={styles.sectionContent}>
                <p>
                  Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données contre 
                  l'accès non autorisé, la modification ou la destruction accidentelle ou volontaire.
                </p>
                <p>
                  Cependant, aucune transmission sur Internet n'est garantie à 100% sécurisée.
                </p>
              </div>
            </section>

            {/* Cookies */}
            <section className={styles.section}>
              <h2>Cookies et technologies de suivi</h2>
              <div className={styles.sectionContent}>
                <p>
                  Ce site n'utilise pas de cookies de suivi, d'analytique ou de publicités pour le moment. 
                  Aucune donnée de navigation n'est collectée sans votre consentement.
                </p>
              </div>
            </section>

            {/* Droits RGPD */}
            <section className={styles.section}>
              <h2>Vos droits selon le RGPD</h2>
              <div className={styles.sectionContent}>
                <p>
                  En tant que résident de l'Union Européenne, vous disposez des droits suivants :
                </p>
                <ul className={styles.conditionsList}>
                  <li><strong>Droit d'accès :</strong> Accéder à vos données personnelles</li>
                  <li><strong>Droit de rectification :</strong> Corriger vos données inexactes</li>
                  <li><strong>Droit à l'oubli :</strong> Demander la suppression de vos données</li>
                  <li><strong>Droit à la portabilité :</strong> Recevoir vos données dans un format structuré</li>
                  <li><strong>Droit d'opposition :</strong> Vous opposer à l'utilisation de vos données</li>
                </ul>
                <p>
                  Pour exercer ces droits, veuillez nous contacter à :{" "}
                  <ProtectedEmail 
                    encodedEmail={encodedEmail}
                    className={styles.emailLink}
                  />
                </p>
              </div>
            </section>

            {/* Durée de conservation */}
            <section className={styles.section}>
              <h2>Durée de conservation des données</h2>
              <div className={styles.sectionContent}>
                <p>
                  Les données personnelles collectées via le formulaire de contact sont conservées 
                  aussi longtemps que nécessaire pour traiter votre demande, puis supprimées.
                </p>
              </div>
            </section>

            {/* Tiers */}
            <section className={styles.section}>
              <h2>Partage avec des tiers</h2>
              <div className={styles.sectionContent}>
                <p>
                  Nous ne partageons pas vos données personnelles avec des tiers à moins que :
                </p>
                <ul className={styles.conditionsList}>
                  <li>Vous ayez donné votre consentement explicite</li>
                  <li>Cela soit requis par la loi</li>
                  <li>Cela soit nécessaire pour protéger nos droits légaux</li>
                </ul>
              </div>
            </section>

            {/* Modifications */}
            <section className={styles.section}>
              <h2>Modifications de cette politique</h2>
              <div className={styles.sectionContent}>
                <p>
                  Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. 
                  Les modifications prendront effet dès leur publication sur ce site.
                </p>
              </div>
            </section>

            {/* Contact et liens */}
            <section className={styles.section}>
              <h2>Contact</h2>
              <div className={styles.sectionContent}>
                <p>
                  Pour toute question concernant cette politique de confidentialité ou vos données personnelles, 
                  contactez-nous à :{" "}
                  <ProtectedEmail 
                    encodedEmail={encodedEmail}
                    className={styles.emailLink}
                  />
                </p>
              </div>
            </section>

            {/* Navigation */}
            <section className={styles.section}>
              <h2>Autres pages</h2>
              <div className={styles.sectionContent}>
                <p>
                  Consultez également nos {" "}
                  <a 
                    ref={mentionsLinkRef}
                    href="/mentions-legales" 
                    className={styles.link}
                    onClick={(e) => handleLinkClick(e, '/mentions-legales')}
                  >
                    Mentions légales
                  </a> et notre page de{" "}
                  <a 
                    ref={creditsLinkRef}
                    href="/credits" 
                    className={styles.link}
                    onClick={(e) => handleLinkClick(e, '/credits')}
                  >
                    Crédits images
                  </a>.
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

export default PolitiqueConfidentialite;
