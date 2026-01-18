/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { gsap } from "gsap";

/**
 * ARCHITECTURE CENTRALISÉE - Single Source of Truth
 * 
 * Cette state machine gère TOUT l'état de l'application de manière centralisée.
 * Plus de duplication d'état entre composants.
 */

// Types d'état pour chaque section
export type AppSection = 
  | { type: "heroBeforeScroll" }
  | { type: "heroAfterScroll"; textIndex: number }
  | { type: "projects"; categoryIndex: number }
  | { type: "contact" };

export type TransitionState = "idle" | "transitioning";

interface AppState {
  section: AppSection;
  transitionState: TransitionState;
  isNavigating: boolean; // Navigation par clic (vs scroll naturel)
}

interface AppStateContextType {
  state: AppState;
  
  // Transitions de section
  goToHeroBeforeScroll: () => void;
  goToHeroAfterScroll: (textIndex?: number) => void;
  goToProjects: (categoryIndex?: number) => void;
  goToContact: () => void;
  
  // Gestion des sous-états
  setHeroTextIndex: (index: number) => void;
  setProjectsCategoryIndex: (index: number) => void;
  
  // Navigation
  startNavigation: () => void;
  endNavigation: () => void;
  
  // Utilitaires
  canScrollUp: () => boolean;
  canScrollDown: () => boolean;
  handleScrollUp: () => void;
  handleScrollDown: () => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>({
    section: { type: "heroBeforeScroll" },
    transitionState: "idle",
    isNavigating: false,
  });

  const transitionTimeoutRef = useRef<number | null>(null);
  const scrollLockRef = useRef(false);

  // Nettoyer les timeouts au démontage
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // Fonction utilitaire pour démarrer une transition
  const startTransition = useCallback(() => {
    setState(prev => ({ ...prev, transitionState: "transitioning" }));
    scrollLockRef.current = true;
    document.body.style.overflow = "hidden";
    
    // Auto-débloquer après 2s (safety)
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    transitionTimeoutRef.current = window.setTimeout(() => {
      endTransition();
    }, 2000);
  }, []);

  const endTransition = useCallback(() => {
    setState(prev => ({ ...prev, transitionState: "idle" }));
    scrollLockRef.current = false;
    document.body.style.overflow = "";
    
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
  }, []);

  // ========== TRANSITIONS DE SECTION ==========

  const goToHeroBeforeScroll = useCallback(() => {
    if (scrollLockRef.current) return;
    
    startTransition();
    setState(prev => ({
      ...prev,
      section: { type: "heroBeforeScroll" },
    }));
    
    // Débloquer après l'animation
    setTimeout(() => {
      endTransition();
    }, 1200);
  }, [startTransition, endTransition]);

  const goToHeroAfterScroll = useCallback((textIndex: number = 0) => {
    if (scrollLockRef.current) return;
    
    startTransition();
    setState(prev => ({
      ...prev,
      section: { type: "heroAfterScroll", textIndex },
    }));
    
    setTimeout(() => {
      endTransition();
    }, 1200);
  }, [startTransition, endTransition]);

  const goToProjects = useCallback((categoryIndex: number = 0) => {
    if (scrollLockRef.current) return;
    
    startTransition();
    setState(prev => ({
      ...prev,
      section: { type: "projects", categoryIndex },
    }));
    
    setTimeout(() => {
      endTransition();
    }, 1200);
  }, [startTransition, endTransition]);

  const goToContact = useCallback(() => {
    if (scrollLockRef.current) return;
    
    startTransition();
    setState(prev => ({
      ...prev,
      section: { type: "contact" },
    }));
    
    setTimeout(() => {
      endTransition();
    }, 1200);
  }, [startTransition, endTransition]);

  // ========== GESTION DES SOUS-ÉTATS ==========

  const setHeroTextIndex = useCallback((index: number) => {
    setState(prev => {
      if (prev.section.type !== "heroAfterScroll") return prev;
      return {
        ...prev,
        section: { ...prev.section, textIndex: index },
      };
    });
  }, []);

  const setProjectsCategoryIndex = useCallback((index: number) => {
    setState(prev => {
      if (prev.section.type !== "projects") return prev;
      return {
        ...prev,
        section: { ...prev.section, categoryIndex: index },
      };
    });
  }, []);

  // ========== NAVIGATION ==========

  const startNavigation = useCallback(() => {
    setState(prev => ({ ...prev, isNavigating: true }));
  }, []);

  const endNavigation = useCallback(() => {
    setState(prev => ({ ...prev, isNavigating: false }));
  }, []);

  // ========== LOGIQUE DE SCROLL ==========

  const canScrollUp = useCallback((): boolean => {
    if (scrollLockRef.current) return false;
    if (window.scrollY > 50) return false; // Permettre scroll naturel

    const { section } = state;

    switch (section.type) {
      case "heroBeforeScroll":
        return false; // Déjà au début
      
      case "heroAfterScroll":
        return true; // Peut retourner à heroBeforeScroll ou changer de texte
      
      case "projects":
        return true; // Peut retourner à hero ou changer de catégorie
      
      case "contact":
        return true; // Peut retourner à projects
      
      default:
        return false;
    }
  }, [state]);

  const canScrollDown = useCallback((): boolean => {
    if (scrollLockRef.current) return false;
    if (window.scrollY > 50) return false; // Permettre scroll naturel

    const { section } = state;

    switch (section.type) {
      case "heroBeforeScroll":
        return true; // Peut aller à heroAfterScroll
      
      case "heroAfterScroll":
        return true; // Peut changer de texte ou aller à projects
      
      case "projects":
        return true; // Peut changer de catégorie ou aller à contact
      
      case "contact":
        return false; // Déjà à la fin
      
      default:
        return false;
    }
  }, [state]);

  const handleScrollUp = useCallback(() => {
    if (!canScrollUp()) return;

    const { section } = state;
    startTransition();

    switch (section.type) {
      case "heroAfterScroll":
        if (section.textIndex > 0) {
          // Texte précédent
          setHeroTextIndex(section.textIndex - 1);
          setTimeout(endTransition, 600);
        } else {
          // Retour à heroBeforeScroll
          goToHeroBeforeScroll();
        }
        break;

      case "projects":
        if (section.categoryIndex > 0) {
          // Catégorie précédente
          setProjectsCategoryIndex(section.categoryIndex - 1);
          setTimeout(endTransition, 800);
        } else {
          // Retour à heroAfterScroll (dernier texte)
          goToHeroAfterScroll(3); // 4 textes, donc index 3
        }
        break;

      case "contact":
        // Retour à projects (dernière catégorie)
        goToProjects(3); // 4 catégories, donc index 3
        break;

      default:
        endTransition();
    }
  }, [state, canScrollUp, startTransition, endTransition, setHeroTextIndex, setProjectsCategoryIndex, goToHeroBeforeScroll, goToHeroAfterScroll, goToProjects]);

  const handleScrollDown = useCallback(() => {
    if (!canScrollDown()) return;

    const { section } = state;
    startTransition();

    switch (section.type) {
      case "heroBeforeScroll":
        // Aller à heroAfterScroll
        goToHeroAfterScroll(0);
        break;

      case "heroAfterScroll":
        if (section.textIndex < 3) { // 4 textes (0-3)
          // Texte suivant
          setHeroTextIndex(section.textIndex + 1);
          setTimeout(endTransition, 600);
        } else {
          // Aller à projects
          goToProjects(0);
        }
        break;

      case "projects":
        if (section.categoryIndex < 3) { // 4 catégories (0-3)
          // Catégorie suivante
          setProjectsCategoryIndex(section.categoryIndex + 1);
          setTimeout(endTransition, 800);
        } else {
          // Aller à contact
          goToContact();
        }
        break;

      default:
        endTransition();
    }
  }, [state, canScrollDown, startTransition, endTransition, setHeroTextIndex, setProjectsCategoryIndex, goToHeroBeforeScroll, goToHeroAfterScroll, goToProjects, goToContact]);

  const value: AppStateContextType = {
    state,
    goToHeroBeforeScroll,
    goToHeroAfterScroll,
    goToProjects,
    goToContact,
    setHeroTextIndex,
    setProjectsCategoryIndex,
    startNavigation,
    endNavigation,
    canScrollUp,
    canScrollDown,
    handleScrollUp,
    handleScrollDown,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
};
