import { useState, useRef } from "react";
import { useLanguage } from "./LanguageContext";
import RadialTransitionOverlay from "../Nav/RadialTransitionOverlay";
import styles from "./languageToggle.module.scss";
import { useAnalytics } from "../../../hooks/useAnalytics";

type TransitionState = "idle" | "closing" | "opening";

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();
  const [transitionState, setTransitionState] = useState<TransitionState>("idle");
  const [direction, setDirection] = useState<"in" | "out">("in");
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { trackClick } = useAnalytics();

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
        className={styles.languageToggle}
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
