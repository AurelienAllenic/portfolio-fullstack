import { useEffect, useRef } from "react";
import { useAppState } from "../state/AppStateContext";

/**
 * GESTIONNAIRE DE SCROLL CENTRALISÉ
 * 
 * Un seul event listener pour toute l'application.
 * Évite les race conditions et les conflits entre composants.
 */

export const useScrollManager = () => {
  const { handleScrollUp, handleScrollDown, canScrollUp, canScrollDown, state } = useAppState();
  const lastScrollTimeRef = useRef(0);
  const touchStartYRef = useRef<number | null>(null);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Vérifier si la modale CV est ouverte
      if (document.body.getAttribute("data-modal-open") === "true") {
        return;
      }

      // Vérifier si on est au top de la page (pour gérer les sections à scroll personnalisé)
      const isAtTop = window.scrollY === 0 || window.scrollY < 50;
      
      if (!isAtTop) {
        // Laisser le scroll naturel fonctionner
        return;
      }

      // Debounce : éviter les scrolls trop rapides
      const now = Date.now();
      if (now - lastScrollTimeRef.current < 100) {
        e.preventDefault();
        return;
      }
      lastScrollTimeRef.current = now;

      const goingDown = e.deltaY > 0;
      const goingUp = e.deltaY < 0;

      if (goingDown && canScrollDown()) {
        e.preventDefault();
        e.stopPropagation();
        handleScrollDown();
      } else if (goingUp && canScrollUp()) {
        e.preventDefault();
        e.stopPropagation();
        handleScrollUp();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Vérifier si la modale CV est ouverte
      if (document.body.getAttribute("data-modal-open") === "true") {
        return;
      }

      if (touchStartYRef.current === null) return;

      const isAtTop = window.scrollY === 0 || window.scrollY < 50;
      if (!isAtTop) {
        // Laisser le scroll naturel fonctionner
        return;
      }

      const deltaY = touchStartYRef.current - e.touches[0].clientY;
      
      // Threshold de 30px pour éviter les faux positifs
      if (Math.abs(deltaY) < 30) return;

      const goingDown = deltaY > 0;
      const goingUp = deltaY < 0;

      if (goingDown && canScrollDown()) {
        e.preventDefault();
        e.stopPropagation();
        handleScrollDown();
        touchStartYRef.current = null; // Reset pour éviter les multiples triggers
      } else if (goingUp && canScrollUp()) {
        e.preventDefault();
        e.stopPropagation();
        handleScrollUp();
        touchStartYRef.current = null;
      }
    };

    const handleTouchEnd = () => {
      touchStartYRef.current = null;
    };

    // Installer les listeners
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleScrollUp, handleScrollDown, canScrollUp, canScrollDown, state]);
};
