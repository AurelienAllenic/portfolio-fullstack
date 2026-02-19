import { useState, useRef, useEffect } from "react";
import { useLanguage } from "./LanguageContext";
import RadialTransitionOverlay from "../Nav/RadialTransitionOverlay";
import styles from "./languageToggle.module.scss";
import { useAnalytics } from "../../../hooks/useAnalytics";

type TransitionState = "idle" | "closing" | "opening";

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();
  const [transitionState, setTransitionState] = useState<TransitionState>("idle");
  const [direction, setDirection] = useState<"in" | "out">("in");
  const [isNearFooter, setIsNearFooter] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { trackClick } = useAnalytics();

  // Détecter quand on est près du footer
  useEffect(() => {
    // S'assurer que le bouton est visible par défaut
    setIsNearFooter(false);
    
    const checkFooterPosition = () => {
      const footer = document.getElementById("footer");
      const button = buttonRef.current;
      
      // Si le footer ou le bouton n'existent pas, le bouton reste visible
      if (!footer || !button) {
        setIsNearFooter(false);
        return;
      }
      
      const footerRect = footer.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      
      // Vérifier si le footer est visible dans le viewport
      const isFooterVisible = footerRect.top < window.innerHeight && footerRect.bottom > 0;
      
      // Si le footer n'est pas visible, ne pas cacher le bouton
      if (!isFooterVisible) {
        setIsNearFooter(false);
        return;
      }
      
      // Vérifier si le bouton chevauche le footer ou est très proche (moins de 30px)
      const distanceToFooter = footerRect.top - buttonRect.bottom;
      const isOverlapping = buttonRect.bottom > footerRect.top && buttonRect.top < footerRect.bottom;
      
      // Ne cacher que si le bouton chevauche vraiment le footer ou est très proche
      // ET que le footer est dans la partie inférieure du viewport (derniers 150px)
      // Zone réduite pour que le bouton réapparaisse plus rapidement quand on remonte
      const footerInBottomArea = footerRect.top < window.innerHeight && footerRect.top > window.innerHeight - 150;
      setIsNearFooter((distanceToFooter < 30 || isOverlapping) && footerInBottomArea);
    };

    // Vérifier au chargement avec un délai pour laisser le footer se charger
    const timeoutId = setTimeout(checkFooterPosition, 1000);
    
    // Écouter le scroll et le resize
    window.addEventListener("scroll", checkFooterPosition, { passive: true });
    window.addEventListener("resize", checkFooterPosition);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", checkFooterPosition);
      window.removeEventListener("resize", checkFooterPosition);
    };
  }, []);

  const handleToggle = () => {
    const targetLang = language === "fr" ? "en" : "fr";
    trackClick(`language_toggle_${targetLang}`);
    if (transitionState !== "idle") return;

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      sessionStorage.setItem('gradientCenterX', centerX.toString());
      sessionStorage.setItem('gradientCenterY', centerY.toString());
    }

    setDirection("in");
    setTransitionState("closing");
  };

  const handleCloseComplete = () => {
    const newLanguage = language === "fr" ? "en" : "fr";
    setLanguage(newLanguage);

    setDirection("out");
    setTransitionState("opening");
  };

  const handleOpenComplete = () => {
    setTransitionState("idle");
  };

  return (
    <>
      <RadialTransitionOverlay
        isActive={transitionState !== "idle"}
        direction={direction}
        onComplete={transitionState === "closing" ? handleCloseComplete : handleOpenComplete}
      />
      <button
        ref={buttonRef}
        className={`${styles.languageToggle} ${isNearFooter ? styles.hidden : ""}`}
        onClick={handleToggle}
        disabled={transitionState !== "idle"}
        aria-label={`Switch to ${language === "fr" ? "English" : "Français"}`}
      >
        {language === "fr" ? "EN / FR" : "FR / EN"}
      </button>
    </>
  );
};

export default LanguageToggle;
