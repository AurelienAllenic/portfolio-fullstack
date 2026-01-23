import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import styles from "./credits.module.scss";
import { FaArrowRight } from "react-icons/fa6";
import RadialTransitionOverlay from "../../General/Nav/RadialTransitionOverlay";

const Credits = () => {
  const navigate = useNavigate();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isTransitioningBack, setIsTransitioningBack] = useState(false);
  const [showContent, setShowContent] = useState(false);

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
    // Marquer qu'on vient de Credits et qu'on veut aller à Contact
    sessionStorage.setItem('returningFromCreditsToContact', 'true');
    navigate("/");
  };

  return (
    <>
      <div className={styles.containerCredits}>
        <div ref={overlayRef} className={styles.overlay}></div>
        <div className={styles.creditsContainer} style={{ opacity: showContent ? 1 : 0 }}>
          <h1>Crédits images</h1>
          <p>Page en construction</p>
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

export default Credits;
