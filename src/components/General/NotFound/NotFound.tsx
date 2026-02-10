import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import styles from "./notFound.module.scss";
import { FaArrowRight } from "react-icons/fa6";
import RadialTransitionOverlay from "../Nav/RadialTransitionOverlay";

const NotFound = () => {
  const navigate = useNavigate();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isTransitioningBack, setIsTransitioningBack] = useState(false);
  const [showContent, setShowContent] = useState(false);

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
