import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import styles from "./notFound.module.scss";
import { FaArrowRight } from "react-icons/fa6";
import RadialTransitionOverlay from "../Nav/RadialTransitionOverlay";

const NotFound = () => {
  const navigate = useNavigate();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [isTransitioningBack, setIsTransitioningBack] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // Animation du radial gradient à l'entrée (comme HeroBeforeScroll)
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
    // Marquer qu'on vient de NotFound pour l'animation d'ouverture sur la page principale
    sessionStorage.setItem('returningFromNotFound', 'true');
    navigate("/");
  };

  return (
    <>
      <div className={styles.containerNotFound}>
        <div ref={overlayRef} className={styles.overlay}></div>
        <div className={styles.notFoundContainer} style={{ opacity: showContent ? 1 : 0 }}>
          <h1>404</h1>
          <p>Not Found</p>
          <button onClick={handleBackToSite} className={styles.backButton}>
            <FaArrowRight />Retour au site
          </button>
        </div>
      </div>
      <RadialTransitionOverlay
        isActive={isTransitioningBack}
        direction="in"
        onComplete={handleTransitionBackComplete}
      />
    </>
  );
};

export default NotFound;
