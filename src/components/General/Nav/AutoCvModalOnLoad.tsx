import { useEffect } from "react";
import { useModalCV } from "./ModalCVContext";

export const CV_MODAL_AUTO_SHOWN_KEY = "cvModalAutoShown";

/** Dernière animation hero1 : delay 1.5s + duration 1s (scroll indicator) */
const HERO_INITIAL_APPEAR_MS = 2500;
const CV_MODAL_POST_ANIMATION_DELAY_MS = 500;

interface AutoCvModalOnLoadProps {
  enabled: boolean;
}

const AutoCvModalOnLoad = ({ enabled }: AutoCvModalOnLoadProps) => {
  const { openModal } = useModalCV();

  useEffect(() => {
    if (!enabled) return;
    if (localStorage.getItem(CV_MODAL_AUTO_SHOWN_KEY) === "true") return;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const timer = window.setTimeout(() => {
      localStorage.setItem(CV_MODAL_AUTO_SHOWN_KEY, "true");
      openModal();
    }, HERO_INITIAL_APPEAR_MS + CV_MODAL_POST_ANIMATION_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [enabled, openModal]);

  return null;
};

export default AutoCvModalOnLoad;
